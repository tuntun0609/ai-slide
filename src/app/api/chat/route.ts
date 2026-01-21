import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  convertToModelMessages,
  type InferUITools,
  stepCountIs,
  streamText,
  type ToolSet,
  tool,
  type UIDataTypes,
  type UIMessage,
} from 'ai'
import { z } from 'zod'
import { defaultModel } from '@/lib/ai'
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
function formatInfographicsContext(infographics: Infographic[]): string {
  if (!infographics || infographics.length === 0) {
    return '当前没有任何信息图。'
  }

  const formattedInfos = infographics.map((info, index) => {
    return `### 信息图 ${index + 1} (ID: ${info.id})
\`\`\`
${info.content}
\`\`\``
  })

  return `当前 Slide 中共有 ${infographics.length} 个信息图：

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
    }: { messages: ChatMessage[]; infographics?: Infographic[] } =
      await req.json()

    // 动态加载 prompt 内容
    const baseSystemPrompt = await loadInfographicPrompt()

    // 构建包含当前信息图上下文的系统提示
    const infographicsContext = formatInfographicsContext(infographics)
    const systemPrompt = `${baseSystemPrompt}

---

## 当前 Slide 信息图上下文

以下是用户当前 Slide 中已有的所有信息图数据。在创建或编辑信息图时，请参考这些现有内容以保持一致性，或根据用户需求进行修改。

${infographicsContext}`

    const result = streamText({
      model: defaultModel,
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(20),
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
