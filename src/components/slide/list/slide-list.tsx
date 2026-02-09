'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { createSlide } from '@/actions/slide'
import type { slide } from '@/db/schema'
import { EmptyState } from './empty-state'
import { SlideCard } from './slide-card'
import { SlideHeader } from './slide-header'
import { SlidePagination } from './slide-pagination'

type Slide = typeof slide.$inferSelect

interface SlideListProps {
  slides: Slide[]
  currentPage: number
  totalPages: number
  totalCount: number
}

export function SlideList({
  slides,
  currentPage,
  totalPages,
  totalCount,
}: SlideListProps) {
  const [isPending, startTransition] = useTransition()

  const handleCreateSlide = () => {
    startTransition(async () => {
      try {
        await createSlide()
      } catch {
        toast.error('创建失败')
      }
    })
  }

  return (
    <div className="flex h-full flex-col bg-background/50">
      <SlideHeader
        isPending={isPending}
        onCreateSlide={handleCreateSlide}
        totalCount={totalCount}
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {slides.length === 0 ? (
          <EmptyState isPending={isPending} onCreate={handleCreateSlide} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {slides.map((slide) => (
              <SlideCard key={slide.id} slide={slide} />
            ))}
          </div>
        )}
      </main>

      <SlidePagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}
