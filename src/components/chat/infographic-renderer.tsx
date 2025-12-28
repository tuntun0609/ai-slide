'use client'

import type { UIMessage, UseChatHelpers } from '@ai-sdk/react'
import {
  Infographic,
  loadSVGResource,
  registerResourceLoader,
} from '@antv/infographic'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
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

function getLatestSlideData(messages: UIMessage[]) {
  // We look for the most recent successful tool result or active tool call from generateSlide
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (!m.parts) {
      continue
    }

    // First check for results (completed tool execution)
    const resultPart = m.parts.find(
      (p) =>
        p.type === 'tool-result' &&
        (p as any).toolName === 'generateSlide' &&
        (p as any).result?.success
    )
    if (resultPart) {
      return (resultPart as any).result as {
        title: string
        infographics: Array<{ title?: string; syntax: string }>
      }
    }

    // Then check for active tool calls (for streaming syntax)
    const callPart = m.parts.find(
      (p) =>
        p.type === 'tool-call' &&
        (p as any).toolName === 'generateSlide' &&
        (p as any).args?.infographics
    )
    if (callPart) {
      return (callPart as any).args as {
        title: string
        infographics: Array<{ title?: string; syntax: string }>
      }
    }
  }
  return null
}

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

export function InfographicRenderer({
  chatState,
}: {
  chatId: string
  chatState: UseChatHelpers<UIMessage>
}) {
  const { messages } = chatState
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  // Get the latest slide data from tool results or pending tool calls
  const slideData = useMemo(() => getLatestSlideData(messages), [messages])

  const infographics = useMemo(() => {
    if (slideData?.infographics && slideData.infographics.length > 0) {
      return slideData.infographics
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
      desc AI 将为您生成一个或多个信息图
    - label 步骤 3
      desc 实时预览并进行调整
`,
      },
      {
        syntax: `
infographic list-row-simple-horizontal-arrow
data
  title 开始创建您的信息图
  items
    - label 步骤12211 1
      desc 在对话框中输入您的需求
    - label 步骤 2
      desc AI 将为您生成一个或多个信息图
    - label 步骤 3
      desc 实时预览并进行调整
`,
      },
    ]
  }, [slideData])

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
