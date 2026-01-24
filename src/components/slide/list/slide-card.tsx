'use client'

import { Infographic } from '@antv/infographic'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import type { slide } from '@/db/schema'
import { Link } from '@/i18n/navigation'
import { SlideCardMenu } from './slide-card-menu'

type Slide = typeof slide.$inferSelect

interface SlideCardProps {
  slide: Slide
}

function InfographicPreview({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const infographicInstanceRef = useRef<Infographic | null>(null)

  useEffect(() => {
    if (!(containerRef.current && content)) {
      return
    }

    const cleanup = () => {
      if (infographicInstanceRef.current) {
        infographicInstanceRef.current.destroy()
        infographicInstanceRef.current = null
      }
    }

    cleanup()
    containerRef.current.innerHTML = ''

    try {
      const infographic = new Infographic({
        container: containerRef.current,
        width: '100%',
        height: '100%',
      })
      infographic.render(content)
      infographicInstanceRef.current = infographic
    } catch (error) {
      console.error('Failed to render infographic preview:', error)
    }

    return cleanup
  }, [content])

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      ref={containerRef}
    />
  )
}

export function SlideCard({ slide }: SlideCardProps) {
  const firstInfographic = slide.infographics?.[0]
  const hasInfographic = firstInfographic?.content?.trim()

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="group relative flex aspect-4/3 flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-foreground/20"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        className="flex-1 cursor-pointer overflow-hidden"
        href={`/slide/${slide.id}`}
      >
        <div className="relative flex h-full w-full items-center justify-center bg-muted/30 transition-colors group-hover:bg-muted/50">
          {hasInfographic && firstInfographic ? (
            <InfographicPreview content={firstInfographic.content} />
          ) : (
            <div className="flex items-center justify-center p-6">
              <Image
                alt="信息图图标"
                className="size-12 opacity-20"
                height={48}
                src="/infographic.svg"
                width={48}
              />
            </div>
          )}
        </div>
      </Link>

      <SlideCardMenu slide={slide} />

      <div className="flex flex-col gap-1 border-t bg-background p-4">
        <div className="flex items-center justify-between">
          <h3 className="truncate font-medium text-sm" title={slide.title}>
            {slide.title}
          </h3>
        </div>
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>{slide.infographics?.length || 0} 页</span>
          <span>
            {formatDistanceToNow(slide.updatedAt || slide.createdAt, {
              addSuffix: true,
              locale: zhCN,
            })}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
