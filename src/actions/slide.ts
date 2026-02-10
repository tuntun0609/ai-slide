'use server'

import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { slide } from '@/db/schema'
import { getSession } from '@/lib/auth'
import type { Infographic } from '@/lib/slide-schema'

export async function createSlide(): Promise<string> {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // 创建默认的信息图
  const defaultInfographic: Infographic = {
    id: nanoid(),
    content: `infographic list-row-simple-horizontal-arrow
data
  title 新信息图
  desc 开始编辑您的内容
  items
    - label 步骤 1
      desc 开始
      icon mdi/lightbulb-on
    - label 步骤 2
      desc 编辑
      icon mdi/pencil
    - label 步骤 3
      desc 完成
      icon mdi/check-circle`,
  }

  const newSlide = {
    id: nanoid(),
    userId: session.user.id,
    title: '未命名 Slide',
    infographics: [defaultInfographic],
  }

  await db.insert(slide).values(newSlide)
  revalidatePath('/slide')
  return newSlide.id
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
