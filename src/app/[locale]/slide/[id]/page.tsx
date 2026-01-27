import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Layout } from 'react-resizable-panels'
import { SlidePanels } from '@/components/slide/slide-panels'
import { JotaiProvider } from '@/components/slide/slide-provider'
import { db } from '@/db'
import { slide } from '@/db/schema'
import { getSession } from '@/lib/auth'
import { RESIZABLE_PANELS_COOKIE_NAME } from '@/type'

export default async function SlideIdPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session?.user) {
    notFound()
  }

  const { id } = await params

  // 从数据库加载 slide 数据
  const slideData = await db.query.slide.findFirst({
    where: eq(slide.id, id),
  })

  // 如果 slide 不存在或不属于当前用户，返回 404
  if (!slideData || slideData.userId !== session.user.id) {
    notFound()
  }

  const cookieStore = await cookies()

  const defaultLayoutString = cookieStore.get(
    RESIZABLE_PANELS_COOKIE_NAME
  )?.value
  const defaultLayout = defaultLayoutString
    ? (JSON.parse(defaultLayoutString) as Layout)
    : undefined

  return (
    <JotaiProvider>
      <SlidePanels
        defaultLayout={defaultLayout}
        initialSlideData={{
          id: slideData.id,
          title: slideData.title,
          infographics: slideData.infographics,
          createdAt: slideData.createdAt,
          updatedAt: slideData.updatedAt,
        }}
        slideId={id}
      />
    </JotaiProvider>
  )
}
