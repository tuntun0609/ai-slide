import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  convertToModelMessages,
  type InferUITools,
  type SystemModelMessage,
  stepCountIs,
  streamText,
  type ToolSet,
  tool,
  type UIDataTypes,
  type UIMessage,
} from 'ai'
import { z } from 'zod'
import { kimiModel } from '@/lib/ai'
import { getSession } from '@/lib/auth'
import type { Infographic } from '@/lib/slide-schema'

// 定义客户端工具集合
// 这些工具不包含 execute 函数，将由客户端处理
const tools = {
  // 新增信息图
  createInfographic: tool({
    description: '创建一个新的信息图。当用户要求生成新的信息图时调用此工具。',
    inputSchema: z.object({
      title: z.string().describe('信息图的标题'),
      syntax: z.string().describe('AntV Infographic Syntax 格式的信息图内容'),
    }),
  }),
  // 编辑信息图
  editInfographic: tool({
    description:
      '编辑现有的信息图。当用户要求修改、更新或调整现有信息图时调用此工具。',
    inputSchema: z.object({
      infographicId: z.string().describe('要编辑的信息图 ID'),
      title: z.string().optional().describe('新的信息图标题（可选）'),
      syntax: z.string().describe('更新后的 AntV Infographic Syntax 格式内容'),
    }),
  }),
  // 删除信息图
  deleteInfographic: tool({
    description: '删除一个信息图。当用户明确要求删除某个信息图时调用此工具。',
    inputSchema: z.object({
      infographicId: z.string().describe('要删除的信息图 ID'),
    }),
  }),
} satisfies ToolSet

// 导出工具类型供前端使用
export type ChatTools = InferUITools<typeof tools>
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>

// 允许流式响应最多 30 秒
export const maxDuration = 60

// 读取 infographic prompt 文件的辅助函数
// 兼容 Node.js、Bun 和 Vercel 部署环境
async function loadInfographicPrompt(): Promise<string> {
  try {
    // 使用 process.cwd() 获取项目根目录
    // 在 Vercel 中，这会指向正确的部署目录
    const promptPath = join(
      process.cwd(),
      'src',
      'app',
      'api',
      'chat',
      'infographic-prompt.md'
    )
    const content = await readFile(promptPath, 'utf-8')
    return content
  } catch (error) {
    console.error('Failed to load infographic prompt file:', error)
    return ''
  }
}

// 将 infographics 数据格式化为可读的上下文字符串
function formatInfographicsContext(
  infographics: Infographic[],
  selectedInfographicId?: string
): string {
  if (!infographics || infographics.length === 0) {
    return '当前没有任何信息图。'
  }

  const formattedInfos = infographics.map((info, index) => {
    const isSelected = selectedInfographicId === info.id
    const selectedMark = isSelected ? ' ⭐ **当前选中**' : ''
    return `### 信息图 ${index + 1} (ID: ${info.id})${selectedMark}
\`\`\`
${info.content}
\`\`\``
  })

  const selectedInfo =
    selectedInfographicId &&
    infographics.some((info) => info.id === selectedInfographicId)
      ? `\n**注意**：用户当前正在查看/编辑信息图 ID: \`${selectedInfographicId}\`。当用户说"修改这个"、"编辑当前"、"更新它"等时，指的是这个信息图。\n`
      : ''

  return `## 当前信息图列表

当前 Slide 中共有 ${infographics.length} 个信息图：${selectedInfo}

${formattedInfos.join('\n\n')}`
}

export async function POST(req: Request) {
  // 检查认证
  const session = await getSession()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const {
      messages,
      infographics = [],
      selectedInfographicId,
    }: {
      messages: ChatMessage[]
      infographics?: Infographic[]
      selectedInfographicId?: string
    } = await req.json()

    // 动态加载 prompt 内容
    const infographicPrompt = await loadInfographicPrompt()

    // 构建包含当前信息图上下文的系统提示
    const infographicsContext = formatInfographicsContext(
      infographics,
      selectedInfographicId
    )
    const baseSystemPrompt = `你是一个专业的信息图编辑助手。你的任务是理解用户的修改需求，并准确修改信息图。

## 工作流程

1. **理解需求**：仔细分析用户的要求，识别需要修改的信息图（通过 ID 或上下文定位）
2. **分析现有内容**：查看当前信息图的语法结构，理解其模板类型、数据结构和主题配置
3. **执行修改**：
   - 如果用户要求创建新信息图，使用 \`createInfographic\` 工具
   - 如果用户要求修改现有信息图，使用 \`editInfographic\` 工具，提供完整的更新后语法
   - 如果用户要求删除信息图，使用 \`deleteInfographic\` 工具
4. **输出总结**：在完成所有操作后，必须输出一个清晰的总结，说明：
   - 执行了哪些操作
   - 修改了哪些信息图（包括 ID 和标题）
   - 主要变更内容是什么
   - 如果创建了新信息图，说明其用途和特点

## 修改原则

- **保持语法完整性**：修改时必须提供完整的 AntV Infographic Syntax，不能只提供部分片段
- **保持模板一致性**：除非用户明确要求更换模板，否则保持原有模板类型
- **数据完整性**：确保修改后的数据符合模板要求，包含必要的字段（title、desc、主数据字段等）
- **合理推断**：如果用户需求不够明确，可以基于上下文合理推断，但不要编造与主题无关的内容
- **渐进式修改**：如果用户提出多个修改点，可以分步骤执行，但最后要统一总结

## 输出格式

完成工具调用后，用自然语言输出总结，确保总结信息完整、准确、清晰。

请确保在完成所有工具调用后，输出清晰的总结信息。`

    const systemPromptMessages: SystemModelMessage[] = [
      {
        role: 'system',
        content: infographicPrompt,
      },
      {
        role: 'system',
        content: infographicsContext,
      },
      {
        role: 'system',
        content: baseSystemPrompt,
      },
    ]

    const result = streamText({
      model: kimiModel,
      system: systemPromptMessages,
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(30),
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process chat request',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
