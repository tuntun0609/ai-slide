import { eq } from 'drizzle-orm'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import type { Layout } from 'react-resizable-panels'
import { SlidePanels } from '@/components/slide/slide-panels'
import { JotaiProvider } from '@/components/slide/slide-provider'
import { db } from '@/db'
import { slide } from '@/db/schema'
import { getSession } from '@/lib/auth'
import { RESIZABLE_PANELS_COOKIE_NAME } from '@/type'

import 'jotai-devtools/styles.css'

// 使用 cache 避免在 generateMetadata 和页面组件中重复查询
const getSlideData = cache(async (id: string) => {
  return await db.query.slide.findFirst({
    where: eq(slide.id, id),
  })
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const slideData = await getSlideData(id)

  if (!slideData) {
    return {
      title: 'Slide Not Found',
    }
  }

  return {
    title: slideData.title || 'Untitled Slide',
    description: `Edit in ASlide: ${slideData.title || 'Untitled Slide'}`,
    openGraph: {
      title: `${slideData.title || 'Untitled Slide'} | ASlide`,
      description: `Edit in ASlide: ${slideData.title || 'Untitled Slide'}`,
    },
    twitter: {
      title: `${slideData.title || 'Untitled Slide'} | ASlide`,
      description: `Edit in ASlide: ${slideData.title || 'Untitled Slide'}`,
    },
  }
}

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

  // 从数据库加载 slide 数据（使用缓存的函数避免重复查询）
  const slideData = await getSlideData(id)

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
      {/* <JotaiDevTools /> */}
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
