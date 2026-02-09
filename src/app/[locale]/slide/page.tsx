import { and, desc, eq, ilike } from 'drizzle-orm'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { SlideList } from '@/components/slide/list/slide-list'
import { db } from '@/db'
import { slide } from '@/db/schema'
import { getSession } from '@/lib/auth'

const PAGE_SIZE = 12

export const metadata: Metadata = {
  title: 'My Slides',
  description:
    'View and manage all your slides and infographics created in InfographicAI.',
}

export default async function SlidePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const session = await getSession()

  if (!session?.user) {
    redirect('/login')
  }

  const params = await searchParams
  const page = Number.parseInt(params.page || '1', 10)
  const currentPage = page > 0 ? page : 1
  const offset = (currentPage - 1) * PAGE_SIZE
  const searchQuery = params.search?.trim() || ''

  // 构建查询条件
  const whereClause = searchQuery
    ? and(
        eq(slide.userId, session.user.id),
        ilike(slide.title, `%${searchQuery}%`)
      )
    : eq(slide.userId, session.user.id)

  // 获取当前用户的 slides 总数（带搜索条件）
  const totalCount = await db.$count(slide, whereClause)

  // 获取当前页的 slides（带搜索条件）
  const slides = await db
    .select()
    .from(slide)
    .where(whereClause)
    .orderBy(desc(slide.updatedAt))
    .limit(PAGE_SIZE)
    .offset(offset)

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SlideList
        currentPage={currentPage}
        slides={slides}
        totalCount={totalCount}
        totalPages={totalPages}
      />
    </div>
  )
}
