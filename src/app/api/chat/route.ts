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
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'
import { chat, message } from '@/db/schema'
import { defaultModel } from '@/lib/ai'
import { getSession } from '@/lib/auth'

// 定义工具集合
const tools = {
  getWeather: tool({
    description: 'Get the weather for a location',
    inputSchema: z.object({
      city: z.string().describe('The city to get the weather for'),
      unit: z
        .enum(['C', 'F'])
        .describe('The unit to display the temperature in'),
    }),
    execute: ({ city, unit }) => {
      // 模拟天气数据
      const weather = {
        value: Math.floor(Math.random() * 30) + 10,
        description: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][
          Math.floor(Math.random() * 4)
        ],
      }

      return `It is currently ${weather.value}°${unit} and ${weather.description} in ${city}!`
    },
  }),
  calculate: tool({
    description: 'Perform mathematical calculations',
    inputSchema: z.object({
      expression: z
        .string()
        .describe('The mathematical expression to evaluate'),
    }),
    execute: ({ expression }) => {
      try {
        // 简单的安全计算（仅支持基本数学运算）
        const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '')
        const result = Function(`"use strict"; return (${sanitized})`)()
        return `计算结果: ${result}`
      } catch (error) {
        return `计算错误: ${error instanceof Error ? error.message : '未知错误'}`
      }
    },
  }),
} satisfies ToolSet

// 导出工具类型供前端使用
export type ChatTools = InferUITools<typeof tools>
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>

// 允许流式响应最多 30 秒
export const maxDuration = 30

export async function POST(req: Request) {
  // 检查认证
  const session = await getSession()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const { messages, chatId }: { messages: ChatMessage[]; chatId?: string } =
      await req.json()

    const currentChatId = chatId

    // 如果 chatId 不存在，返回错误
    if (!currentChatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      )
    }

    // 查询数据库中已存在的消息 ID，用于判断哪些消息是新消息
    const existingMessages = await db
      .select({ id: message.id })
      .from(message)
      .where(eq(message.chatId, currentChatId))

    const existingMessageIds = new Set(existingMessages.map((m) => m.id))

    // 找出需要保存的新用户消息（不在数据库中的消息）
    // 只检查消息 ID，不检查内容，允许用户发送相同内容的消息
    const userMessages = messages.filter((msg) => msg.role === 'user')
    const newUserMessages = userMessages.filter((msg) => {
      // 如果消息 ID 已存在，跳过（说明消息已经保存过）
      return !existingMessageIds.has(msg.id)
    })

    // 如果存在新消息，保存到数据库
    if (newUserMessages.length > 0) {
      await db.insert(message).values(
        newUserMessages.map((msg) => ({
          id: msg.id,
          chatId: currentChatId,
          role: msg.role,
          content: msg.parts,
        }))
      )
    }

    const result = streamText({
      model: defaultModel,
      system: `你是一个专业的信息图生成助手，精通 AntV Infographic 的核心概念，熟悉 AntV Infographic Syntax 语法。

## 任务目标

请根据用户提供的文字内容，结合 AntV Infographic Syntax 规范，输出符合文字信息结构内容的信息图以及对应的 AntV Infographic 的语法。你需要：

1. 提炼关键信息结构（标题、描述、条目等）
2. 结合语义选择合适的模板（template）与主题
3. 将内容用规范的 AntV Infographic Syntax 描述，方便实时流式渲染

## 输出格式

始终使用 AntV Infographic Syntax 纯语法文本，外层包裹 \`\`\`plain 代码块，不得输出解释性文字。语法结构示例：

\`\`\`plain
infographic list-row-horizontal-icon-arrow
data
  title 标题
  desc 描述
  items
    - label 条目
      value 12.5
      desc 说明
      icon mdi/rocket-launch
theme
  palette #3b82f6 #8b5cf6 #f97316
\`\`\`

## AntV Infographic Syntax 语法

AntV Infographic Syntax 是一个用于描述信息图渲染配置的语法，通过缩进层级描述信息，具有很强的鲁棒性，便于 AI 流式输出的时候渲染信息图。主要包含有几部分信息：

1. 模版 template：不同的模版用于表达不同的文本信息结构
2. 数据 data：是信息图的数据，包含有标题 title、描述 desc、数据项 items 等字段，其中 items 字段包含多个条目：标签 label、值 value、描述信息 desc、图标 icon、子元素 children 等字段
3. 主题 theme：主题包含有色板 palette、字体 font 等字段

### 语法要点

- 第一行以 \`infographic <template-name>\` 开头，模板从下方列表中选择
- 使用 block 描述 data / theme，层级通过两个空格缩进
- 键值对使用「键 值」形式，数组通过 \`-\` 分项
- icon 值直接提供关键词或图标名（如 \`mdi/chart-line\`）
- data 应包含 title/desc/items（根据语义可省略不必要字段）
- data.items 可包含 label(string)/value(number)/desc(string)/icon(string)/children(object) 等字段，children 表示层级结构
- 对比类模板（名称以 \`compare-\` 开头）应构建两个根节点，所有对比项作为这两个根节点的 children，确保结构清晰
- 可以添加 theme 来切换色板或深浅色；
- 严禁输出 JSON、Markdown、解释或额外文本

### 模板列表 template

- sequence-zigzag-steps-underline-text
- sequence-horizontal-zigzag-underline-text
- sequence-circular-simple
- sequence-filter-mesh-simple
- sequence-mountain-underline-text
- sequence-cylinders-3d-simple
- compare-binary-horizontal-simple-fold
- compare-hierarchy-left-right-circle-node-pill-badge
- quadrant-quarter-simple-card
- quadrant-quarter-circular
- list-grid-badge-card
- list-grid-candy-card-lite
- list-grid-ribbon-card
- list-row-horizontal-icon-arrow
- relation-circle-icon-badge
- sequence-ascending-steps
- compare-swot
- sequence-color-snake-steps-horizontal-icon-line
- sequence-pyramid-simple
- list-sector-plain-text
- sequence-roadmap-vertical-simple
- sequence-zigzag-pucks-3d-simple
- sequence-ascending-stairs-3d-underline-text
- compare-binary-horizontal-badge-card-arrow
- compare-binary-horizontal-underline-text-vs
- hierarchy-tree-tech-style-capsule-item
- hierarchy-tree-curved-line-rounded-rect-node
- hierarchy-tree-tech-style-badge-card
- chart-column-simple
- chart-bar-plain-text
- chart-line-plain-text
- chart-pie-plain-text
- chart-pie-compact-card
- chart-pie-donut-plain-text
- chart-pie-donut-pill-badge

## 注意事项

- 输出必须符合语法规范与缩进规则，方便模型流式输出，这是语法规范中的一部分。
- 结合用户输入给出结构化 data，勿编造无关内容
- 如用户指定风格/色彩/语气，可在 theme 中体现
- 若信息不足，可合理假设补全，但要保持连贯与可信
- 当用户需要生成信息图时，直接输出 AntV Infographic Syntax 格式；当用户需要其他帮助时，正常回复即可`,
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(5),
    })

    // 确保流式响应完成，即使客户端断开连接
    result.consumeStream()

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      generateMessageId: () => nanoid(),
      onFinish: async ({ responseMessage }) => {
        try {
          // 更新 chat 的 updatedAt
          await db
            .update(chat)
            .set({ updatedAt: new Date() })
            .where(eq(chat.id, currentChatId!))

          // 保存助手回复的消息
          if (responseMessage) {
            await db.insert(message).values({
              id: responseMessage.id,
              chatId: currentChatId!,
              role: responseMessage.role,
              content: responseMessage.parts,
            })
          }
        } catch (error) {
          console.error('Failed to save messages:', error)
        }
      },
    })
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
