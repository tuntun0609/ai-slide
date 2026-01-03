import { and, desc, eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Layout } from 'react-resizable-panels'
import type { ChatMessage } from '@/app/api/chat/route'
import { ChatPanels } from '@/components/chat/chat-panels'
import { db } from '@/db'
import { chat, message } from '@/db/schema'
import { getSession } from '@/lib/auth'
import { RESIZABLE_PANELS_COOKIE_NAME } from '@/type'

export default async function ChatIdPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const api = await cookies()

  const defaultLayoutString = api.get(RESIZABLE_PANELS_COOKIE_NAME)?.value
  const defaultLayout = defaultLayoutString
    ? (JSON.parse(defaultLayoutString) as Layout)
    : undefined

  // 在服务端获取初始消息数据
  let initialMessages: ChatMessage[] = []
  let isNewChat = false
  const session = await getSession()
  if (session?.user) {
    // 验证 chat 属于当前用户
    const chatRecord = await db
      .select()
      .from(chat)
      .where(and(eq(chat.id, id), eq(chat.userId, session.user.id)))
      .limit(1)

    if (chatRecord.length > 0) {
      const chatCreatedAt = chatRecord[0].createdAt

      // 加载该 chat 的所有消息
      const messages = await db
        .select()
        .from(message)
        .where(eq(message.chatId, id))
        .orderBy(desc(message.createdAt))

      // 将数据库消息转换为 ChatMessage 格式
      initialMessages = messages
        .reverse() // 反转顺序，使最早的消息在前
        .map((msg) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant' | 'system',
          parts: msg.content as unknown[],
        })) as ChatMessage[]

      // 检查 chat 是否是新建的：
      // 1. chat 创建时间在最近 10 秒内
      // 2. 只有一条用户消息，没有 assistant 消息
      // 3. 第一条用户消息的创建时间与 chat 创建时间非常接近（在 2 秒内）
      const now = new Date()
      const chatAge = now.getTime() - chatCreatedAt.getTime()
      const userMessages = initialMessages.filter((msg) => msg.role === 'user')
      const assistantMessages = initialMessages.filter(
        (msg) => msg.role === 'assistant'
      )

      if (
        chatAge < 10_000 && // chat 创建时间在最近 10 秒内
        userMessages.length === 1 && // 只有一条用户消息
        assistantMessages.length === 0 // 没有 assistant 消息
      ) {
        // 检查第一条用户消息的创建时间
        // 由于 messages 是按 createdAt 降序排列的，最早的消息在最后
        // 或者直接使用 initialMessages 中的第一条用户消息（已按时间升序排列）
        const firstUserMessage = userMessages[0]
        if (firstUserMessage) {
          // 从 messages 数组中找到对应的数据库记录以获取 createdAt
          const dbMessage = messages.find(
            (msg) => msg.id === firstUserMessage.id
          )
          if (dbMessage) {
            const messageAge =
              dbMessage.createdAt.getTime() - chatCreatedAt.getTime()
            // 如果消息创建时间与 chat 创建时间在 2 秒内，认为是新建的
            isNewChat = messageAge >= 0 && messageAge < 2000
          }
        }
      }
    } else {
      // 不是当前用户的 chat，重定向到首页
      redirect('/chat')
    }
  }

  return (
    <ChatPanels
      chatId={id}
      defaultLayout={defaultLayout}
      initialMessages={initialMessages}
      isNewChat={isNewChat}
    />
  )
}
