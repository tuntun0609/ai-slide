import { desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { chat } from '@/db/schema'
import { getSession } from '@/lib/auth'
import { RecentChatsClient } from './recent-chats-client'

export async function RecentChats() {
  const session = await getSession()

  if (!session?.user) {
    return null
  }

  const chats = await db
    .select()
    .from(chat)
    .where(eq(chat.userId, session.user.id))
    .orderBy(desc(chat.updatedAt))
    .limit(10)

  return <RecentChatsClient chats={chats} />
}
