'use server'

import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { slide } from '@/db/schema'
import { getSession } from '@/lib/auth'

export async function createSlide() {
  const session = await getSession()
  if (!session?.user) {
    redirect('/login')
  }

  const newSlide = {
    id: nanoid(),
    userId: session.user.id,
    title: '未命名 Slide',
    infographics: [],
  }

  await db.insert(slide).values(newSlide)
  redirect(`/slide/${newSlide.id}`)
}

export async function deleteSlide(id: string) {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  await db.delete(slide).where(eq(slide.id, id))
  revalidatePath('/slide')
}

export async function updateSlide(
  id: string,
  data: Partial<typeof slide.$inferInsert>
) {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  await db.update(slide).set(data).where(eq(slide.id, id))
  revalidatePath('/slide')
}
