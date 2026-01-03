import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { chat, message } from '@/db/schema'
import { getSession } from '@/lib/auth'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ chatId: string; messageId: string }> }
) {
  // 检查认证
  const session = await getSession()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const { chatId, messageId } = await params
    const userId = session.user.id

    // 验证 chat 属于当前用户
    const chatRecord = await db
      .select()
      .from(chat)
      .where(and(eq(chat.id, chatId), eq(chat.userId, userId)))
      .limit(1)

    if (chatRecord.length === 0) {
      return new Response('Chat not found or unauthorized', { status: 404 })
    }

    // 验证消息属于该 chat
    const messageRecord = await db
      .select()
      .from(message)
      .where(and(eq(message.id, messageId), eq(message.chatId, chatId)))
      .limit(1)

    if (messageRecord.length === 0) {
      return new Response('Message not found', { status: 404 })
    }

    // 删除消息
    await db.delete(message).where(eq(message.id, messageId))

    // 更新 chat 的 updatedAt
    await db
      .update(chat)
      .set({ updatedAt: new Date() })
      .where(eq(chat.id, chatId))

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Delete message API error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to delete message',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
