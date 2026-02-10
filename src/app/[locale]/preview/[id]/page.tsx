import { eq } from 'drizzle-orm'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { cache } from 'react'
import { db } from '@/db'
import { slide } from '@/db/schema'
import { PreviewViewer } from './preview-viewer'

const getPublishedSlide = cache(async (id: string) => {
  const slideData = await db.query.slide.findFirst({
    where: eq(slide.id, id),
  })
  if (!slideData?.published) {
    return null
  }
  return slideData
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const slideData = await getPublishedSlide(id)
  const t = await getTranslations('preview')

  if (!slideData) {
    return { title: t('slideNotFound') }
  }

  const title = slideData.title || 'InfographicAI'
  const description = `${title} - ${t('createdBy')}`

  return {
    title,
    description,
    openGraph: {
      title: `${title} | InfographicAI`,
      description,
    },
    twitter: {
      title: `${title} | InfographicAI`,
      description,
    },
  }
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const slideData = await getPublishedSlide(id)

  if (!slideData) {
    notFound()
  }

  return (
    <PreviewViewer
      infographics={slideData.infographics}
      title={slideData.title}
    />
  )
}
