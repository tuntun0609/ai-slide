import { nanoid } from 'nanoid'
import { db } from '@/db'
import { chat, message } from '@/db/schema'
import { getSession } from '@/lib/auth'

export async function POST(req: Request) {
  // 检查认证
  const session = await getSession()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const userId = session.user.id
    const chatId = nanoid()

    // 解析请求体，获取可选的初始消息
    let initialMessage: string | undefined
    try {
      const body = await req.json()
      initialMessage = body.initialMessage?.trim()
    } catch {
      // 如果没有请求体或解析失败，继续使用默认值
    }

    // 确定标题：使用初始消息的前50个字符，如果没有则使用默认标题
    const title = initialMessage
      ? initialMessage.slice(0, 50) || '新对话'
      : '新对话'

    // 使用事务确保数据一致性
    await db.transaction(async (tx) => {
      // 创建新的 chat
      await tx.insert(chat).values({
        id: chatId,
        userId,
        title,
      })

      // 如果有初始消息，创建第一条用户消息
      if (initialMessage) {
        const messageId = nanoid()
        await tx.insert(message).values({
          id: messageId,
          chatId,
          role: 'user',
          content: [
            {
              type: 'text',
              text: initialMessage,
            },
          ],
        })
      }
    })

    return Response.json({
      chatId,
      hasInitialMessage: !!initialMessage,
    })
  } catch (error) {
    console.error('Failed to create chat:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to create chat',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
