import { convertToModelMessages, streamText, tool, type UIMessage } from 'ai'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { chat, message as messageTable, slide } from '@/db/schema'
import { defaultModel } from '@/lib/ai'
import { getSession } from '@/lib/auth'
import { SlideContentSchema } from '@/lib/slide-schema'

export async function POST(req: Request) {
  const { messages, id: chatId }: { messages: UIMessage[]; id: string } =
    await req.json()
  const session = await getSession()

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Ensure chat exists
  const existingChat = await db.query.chat.findFirst({
    where: eq(chat.id, chatId),
  })

  if (!existingChat) {
    const firstMessageText =
      messages[0]?.parts?.find((p) => p.type === 'text')?.text || 'New Chat'
    await db.insert(chat).values({
      id: chatId,
      userId: session.user.id,
      title: firstMessageText.substring(0, 100),
    })
  }

  // Save the latest user message
  const lastUserMessage = messages.at(-1)
  if (lastUserMessage?.role === 'user') {
    const textContent =
      lastUserMessage.parts?.find((p) => p.type === 'text')?.text || ''
    await db.insert(messageTable).values({
      id: lastUserMessage.id || crypto.randomUUID(),
      chatId,
      role: 'user',
      content: textContent,
    })
  }

  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: defaultModel,
    system: `你是一个专业的信息图设计专家。你的任务是根据用户需求，使用 AntV Infographic 语法生成高质量的信息图。

    核心理念：信息图 = 信息结构 (data) + 图形表意 (design)。
    
    语法规范：
    1. 入口：必须以 'infographic <template-name>' 开头。
    2. 块结构：
       - data: 核心数据。包含 title, desc 和 items 列表。
       - design: 视觉配置。可指定 structure (布局结构) 和 item (组件类型)。
       - theme: 视觉风格。支持切换主题名或配置颜色、调色盘、风格化 (如 stylize rough 手绘风)。

    多图支持：
    一个 slide 可以包含多个信息图组件。请根据用户需求，在 infographics 数组中生成一个或多个信息图。

    示例语法（单个）：
    infographic list-row-horizontal-icon-arrow
    design
      structure list-column
        gap 20
      item badge-card
      title default
        align center
    data
      title 增长引擎
      desc 多渠道触达
      items
        - label 线索获取
          value 18.6
          desc 渠道投放与内容获客
          icon company-021_v1_lineal
          children
            - label 社交媒体
            - label 搜索引擎
        - label 转化提效
          value 12.4
          icon antenna-bars-5_v1_lineal
    theme
      colorBg #f0f2f5
      stylize rough
        roughness 0.5

    工具说明：
    - generateSlide: 生成或更新 slide 页面。必须返回 infographics 数组，每个元素包含 syntax 字符串。

    请始终确保生成的语法逻辑清晰，视觉表现力强，且符合 AntV Infographic 官方规范。`,
    messages: modelMessages,
    tools: {
      generateSlide: tool({
        description:
          'Generate or update a slide with one or more infographics.',
        inputSchema: SlideContentSchema,
        execute: async (content) => {
          const slideId = crypto.randomUUID()
          await db.insert(slide).values({
            id: slideId,
            chatId,
            title: content.title,
            content: { infographics: content.infographics },
          })
          return { success: true, slideId, ...content }
        },
      }),
    },
    onFinish: async ({ text, toolCalls }) => {
      // Save the assistant's response
      await db.insert(messageTable).values({
        id: crypto.randomUUID(),
        chatId,
        role: 'assistant',
        content: text || (toolCalls?.length ? 'Updating slide...' : ''),
      })
    },
  })

  return result.toTextStreamResponse()
}
