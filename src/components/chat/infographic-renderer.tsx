'use client'

import type { UIMessage } from '@ai-sdk/react'
import {
  Infographic,
  loadSVGResource,
  registerResourceLoader,
} from '@antv/infographic'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

// Register icon loader for AntV Infographic
registerResourceLoader(async (config: any) => {
  if (config.type === 'iconify') {
    try {
      const res = await fetch(`https://api.iconify.design/${config.data}.svg`)
      if (!res.ok) {
        throw new Error('Failed to fetch icon')
      }
      const svg = await res.text()
      return loadSVGResource(svg)
    } catch (e) {
      console.error(`Failed to load icon: ${config.data}`, e)
      return null
    }
  }
  return null
})

function InfographicInstance({ syntax }: { syntax: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const infographicRef = useRef<Infographic | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Initialize infographic instance if it doesn't exist
    if (!infographicRef.current) {
      infographicRef.current = new Infographic({
        container,
        width,
        height,
        padding: 24,
      })
    }

    const updateInfographic = () => {
      if (!infographicRef.current) {
        return
      }

      try {
        infographicRef.current.render(syntax)
      } catch (e) {
        console.error('Failed to render infographic', e)
      }
    }

    updateInfographic()

    const resizeObserver = new ResizeObserver(() => {
      if (infographicRef.current && containerRef.current) {
        infographicRef.current.destroy()
        const newWidth = containerRef.current.clientWidth
        const newHeight = containerRef.current.clientHeight
        infographicRef.current = new Infographic({
          container: containerRef.current,
          width: newWidth,
          height: newHeight,
          padding: 24,
        })
        updateInfographic()
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [syntax])

  useEffect(() => {
    return () => {
      if (infographicRef.current) {
        infographicRef.current.destroy()
        infographicRef.current = null
      }
    }
  }, [])

  return (
    <div
      className="h-full w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm"
      ref={containerRef}
    />
  )
}

interface Slide {
  id: string
  title: string
  content: string
  order: number
}

export function InfographicRenderer({
  chatId,
  chatState,
}: {
  chatId: string
  chatState: {
    messages?: UIMessage[]
    isLoading?: boolean
    status?: string
  }
}) {
  const isLoading = chatState.isLoading || chatState.status === 'streaming'
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const fetchSlides = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${chatId}/slides`)
      if (res.ok) {
        const data = await res.json()
        setSlides(data)
      }
    } catch (e) {
      console.error(e)
    }
  }, [chatId])

  useEffect(() => {
    fetchSlides()
  }, [fetchSlides])

  // Re-fetch when loading state changes (e.g. after tool execution finishes)
  useEffect(() => {
    if (!isLoading) {
      fetchSlides()
    }
  }, [isLoading, fetchSlides])

  const infographics = useMemo(() => {
    if (slides.length > 0) {
      return slides.map((s) => ({ title: s.title, syntax: s.content }))
    }
    // Default placeholder
    return [
      {
        syntax: `
infographic list-row-simple-horizontal-arrow
data
  title 开始创建您的信息图
  items
    - label 步骤 1
      desc 在对话框中输入您的需求
    - label 步骤 2
      desc AI 将为您生成幻灯片
    - label 步骤 3
      desc 实时预览并进行调整
`,
      },
    ]
  }, [slides])

  // Reset index if it becomes invalid when infographics list changes
  useEffect(() => {
    if (currentIndex >= infographics.length) {
      setCurrentIndex(Math.max(0, infographics.length - 1))
    }
  }, [infographics.length, currentIndex])

  const nextSlide = () => {
    if (currentIndex < infographics.length - 1) {
      setDirection(1)
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const prevSlide = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const goToSlide = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1)
    setCurrentIndex(idx)
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-muted/10 p-4">
      <div className="relative flex h-full w-full max-w-5xl items-center justify-center">
        <AnimatePresence custom={direction} initial={false} mode="popLayout">
          <motion.div
            animate="center"
            className="h-full w-full"
            custom={direction}
            exit="exit"
            initial="enter"
            key={currentIndex}
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            variants={variants}
          >
            <div className="h-full w-full py-8">
              <InfographicInstance syntax={infographics[currentIndex].syntax} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {infographics.length > 1 && (
          <>
            <div className="absolute top-1/2 left-4 z-10 -translate-y-1/2">
              <Button
                className="h-10 w-10 rounded-full bg-background/80 shadow-md backdrop-blur-sm hover:bg-background"
                disabled={currentIndex === 0}
                onClick={prevSlide}
                size="icon"
                variant="ghost"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>
            <div className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
              <Button
                className="h-10 w-10 rounded-full bg-background/80 shadow-md backdrop-blur-sm hover:bg-background"
                disabled={currentIndex === infographics.length - 1}
                onClick={nextSlide}
                size="icon"
                variant="ghost"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {infographics.length > 1 && (
        <div className="absolute bottom-8 flex gap-2">
          {infographics.map((_, idx) => (
            <button
              aria-label={`Go to slide ${idx + 1}`}
              className={cn(
                'h-2 w-2 rounded-full transition-all duration-300',
                currentIndex === idx
                  ? 'w-6 bg-primary'
                  : 'bg-primary/30 hover:bg-primary/50'
              )}
              key={idx}
              onClick={() => goToSlide(idx)}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  )
}
