import { convertToModelMessages, streamText, tool, type UIMessage } from 'ai'
import { asc, desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { chat, message as messageTable, slide } from '@/db/schema'
import { defaultModel } from '@/lib/ai'
import { getSession } from '@/lib/auth'
import {
  CreateSlideSchema,
  DeleteSlideSchema,
  UpdateSlideSchema,
} from '@/lib/slide-schema'

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

  // Fetch existing slides for context
  const existingSlides = await db.query.slide.findMany({
    where: eq(slide.chatId, chatId),
    orderBy: [asc(slide.order)],
    columns: { id: true, title: true, order: true },
  })

  const slidesContext = existingSlides.length
    ? `Current slides:\n${existingSlides
        .map((s) => `- [${s.id}] ${s.title} (Order: ${s.order})`)
        .join('\n')}`
    : 'No slides created yet.'

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
    system: `你是一个专业的信息图设计专家。你的任务是根据用户需求，管理一组幻灯片 (Slides)，并使用 AntV Infographic 语法为每个 slide 生成高质量的信息图。

    核心理念：信息图 = 信息结构 (data) + 图形表意 (design)。
    
    语法规范 (AntV Infographic)：
    1. 入口：必须以 'infographic <template-name>' 开头。
    2. 块结构：
       - data: 核心数据。包含 title, desc 和 items 列表。
       - design: 视觉配置。可指定 structure (布局结构) 和 item (组件类型)。
       - theme: 视觉风格。支持切换主题名或配置颜色、调色盘、风格化 (如 stylize rough 手绘风)。

    幻灯片管理：
    - 你可以创建、更新和删除幻灯片。
    - 每个幻灯片对应一个独立的信息图。
    - 使用 'order' 字段控制播放顺序。

    ${slidesContext}

    工具说明：
    - createSlide: 创建新幻灯片。需提供 title, content (AntV 语法), 可选 order。
    - updateSlide: 更新现有幻灯片。需提供 id, 可选 title, content, order。
    - deleteSlide: 删除幻灯片。需提供 id。

    请始终确保生成的语法逻辑清晰，视觉表现力强，且符合 AntV Infographic 官方规范。`,
    messages: modelMessages,
    tools: {
      createSlide: tool({
        description: 'Create a new slide with an infographic.',
        inputSchema: CreateSlideSchema,
        execute: async (input) => {
          let order = input.order
          if (order === undefined) {
            const lastSlide = await db.query.slide.findFirst({
              where: eq(slide.chatId, chatId),
              orderBy: [desc(slide.order)],
            })
            order = (lastSlide?.order ?? -1) + 1
          }

          const slideId = crypto.randomUUID()
          await db.insert(slide).values({
            id: slideId,
            chatId,
            title: input.title,
            content: input.content,
            order,
          })
          return { success: true, slideId, ...input, order }
        },
      }),
      updateSlide: tool({
        description: 'Update an existing slide.',
        inputSchema: UpdateSlideSchema,
        execute: async (input) => {
          await db
            .update(slide)
            .set({
              ...(input.title ? { title: input.title } : {}),
              ...(input.content ? { content: input.content } : {}),
              ...(input.order !== undefined ? { order: input.order } : {}),
              updatedAt: new Date(),
            })
            .where(eq(slide.id, input.id))
          return { success: true, ...input }
        },
      }),
      deleteSlide: tool({
        description: 'Delete a slide.',
        inputSchema: DeleteSlideSchema,
        execute: async (input) => {
          await db.delete(slide).where(eq(slide.id, input.id))
          return { success: true, id: input.id }
        },
      }),
    },
    onFinish: async ({ text, toolCalls }) => {
      // Save the assistant's response
      await db.insert(messageTable).values({
        id: crypto.randomUUID(),
        chatId,
        role: 'assistant',
        content: text || (toolCalls?.length ? 'Updating slides...' : ''),
      })
    },
  })

  return result.toTextStreamResponse()
}
