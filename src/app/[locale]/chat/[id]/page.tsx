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
  const session = await getSession()
  if (session?.user) {
    // 验证 chat 属于当前用户
    const chatRecord = await db
      .select()
      .from(chat)
      .where(and(eq(chat.id, id), eq(chat.userId, session.user.id)))
      .limit(1)

    if (chatRecord.length > 0) {
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
    />
  )
}
