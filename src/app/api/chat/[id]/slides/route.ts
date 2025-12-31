import { and, asc, eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { chat, slide } from '@/db/schema'
import { getSession } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params

  // Verify chat ownership
  const existingChat = await db.query.chat.findFirst({
    where: and(eq(chat.id, id), eq(chat.userId, session.user.id)),
  })

  if (!existingChat) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const slides = await db.query.slide.findMany({
    where: eq(slide.chatId, id),
    orderBy: [asc(slide.order), asc(slide.createdAt)],
  })

  return NextResponse.json(slides)
}
