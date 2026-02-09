'use client'

import { Infographic } from '@antv/infographic'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CarouselApi } from '@/components/ui/carousel'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'

// Single case: name + theme + multiple slides (infographic content)
interface ShowcaseCase {
  name: string
  theme: string // Theme description
  slides: string[]
}

const SHOWCASE_CASES: ShowcaseCase[] = [
  {
    name: 'How AI Works',
    theme: 'From data to intelligent output',
    slides: [
      `infographic sequence-pyramid-simple
data
  title AI Intelligence
  sequences
    - label Data Layer
      desc Raw data: text, images, audio
    - label Feature Layer
      desc Extract key features and patterns
    - label Model Layer
      desc Neural networks learn patterns
    - label Application Layer
      desc Apply to real scenarios
  order asc
theme light
  palette #667eea,#764ba2,#f093fb,#4facfe`,
      `infographic chart-pie-donut-pill-badge
data
  title AI Applications
  values
    - label NLP
      value 28
    - label Vision
      value 25
    - label Speech
      value 15
    - label Recommendations
      value 18
    - label Autonomous
      value 14
theme light
  palette #f093fb,#4facfe,#43e97b,#fa709a,#fee140`,
    ],
  },
  {
    name: 'How to Make a Movie',
    theme: 'From concept to final film',
    slides: [
      `infographic sequence-funnel-simple
data
  title Movie Production
  sequences
    - label Concept
      desc Ideas and script concepts
    - label Development
      desc Scripts, funding, team
    - label Production
      desc Filming and footage
    - label Post-Production
      desc Editing, VFX, sound
    - label Distribution
      desc Marketing and release
  order asc
theme light
  palette #ef476f,#ffd166,#06d6a0,#118ab2,#073b4c`,
      `infographic sequence-color-snake-steps-horizontal-icon-line
data
  title Production Timeline
  sequences
    - label Initiation
      desc Funding, team assembly
      icon lucide/flag
    - label Pre-Production
      desc Casting, storyboarding
      icon lucide/clipboard-list
    - label Photography
      desc On-set filming
      icon lucide/camera
    - label Post-Production
      desc Editing, VFX
      icon lucide/scissors
    - label Distribution
      desc Marketing, release
      icon lucide/megaphone
  order asc
theme light
  palette #667eea,#764ba2,#f093fb,#4facfe,#00f2fe`,
    ],
  },
  {
    name: 'How to Write an Article',
    theme: 'From topic to final article',
    slides: [
      `infographic sequence-circular-simple
data
  title Article Writing Cycle
  sequences
    - label Brainstorm
      desc Determine theme, audience
    - label Gather
      desc Research, collect examples
    - label Outline
      desc Design structure, logic
    - label Draft
      desc Write first draft
    - label Revise
      desc Polish and refine
  order asc
theme light
  palette #4facfe,#00f2fe,#43e97b,#38f9d7,#667eea`,
      `infographic list-zigzag-down-compact-card
data
  title Core Elements
  lists
    - label Compelling Headline
      desc Sparks reading interest
    - label Clear Structure
      desc Logical and organized
    - label Rich Content
      desc Novel viewpoints
    - label Vivid Expression
      desc Beautiful language
    - label Deep Thinking
      desc Unique insights
theme light
  palette #76c893,#52b69a,#34a0a4,#168aad,#1a759f`,
    ],
  },
]

interface InfographicSlideProps {
  content: string
  theme: 'light' | 'dark'
}

function InfographicSlide({ content, theme }: InfographicSlideProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<Infographic | null>(null)

  const cleanup = useCallback(() => {
    if (instanceRef.current) {
      instanceRef.current.destroy()
      instanceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    cleanup()
    containerRef.current.innerHTML = ''

    const timer = setTimeout(() => {
      if (!containerRef.current) {
        return
      }

      try {
        const infographic = new Infographic({
          container: containerRef.current,
          width: '100%',
          height: '100%',
          theme,
        })

        infographic.render(content)
        instanceRef.current = infographic
      } catch (error) {
        console.error('Failed to render AI principles infographic:', error)
      }
    }, 0)

    return () => {
      clearTimeout(timer)
      cleanup()
    }
  }, [theme, cleanup, content])

  return <div className="h-full w-full" ref={containerRef} />
}

interface FloatingToolbarProps {
  selectedIndex: number
  totalSlides: number
  onDotClick?: (index: number) => void
  onPrev: () => void
  onNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
}

function FloatingToolbar({
  selectedIndex,
  totalSlides,
  onDotClick,
  onPrev,
  onNext,
  canScrollPrev,
  canScrollNext,
}: FloatingToolbarProps) {
  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 shadow-lg">
        <button
          aria-label="Previous slide"
          className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          disabled={!canScrollPrev}
          onClick={onPrev}
          type="button"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              aria-current={index === selectedIndex}
              aria-label={`Slide ${index + 1}`}
              className={`size-2 rounded-full transition-colors ${
                index === selectedIndex
                  ? 'bg-primary'
                  : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
              }`}
              key={index}
              onClick={() => onDotClick?.(index)}
              type="button"
            />
          ))}
        </div>
        <button
          aria-label="Next slide"
          className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          disabled={!canScrollNext}
          onClick={onNext}
          type="button"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  )
}

export function AIPrinciplesShowcase() {
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme === 'dark' ? 'dark' : 'light'
  const [activeCaseIndex, setActiveCaseIndex] = useState(0)
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const currentCase = SHOWCASE_CASES[activeCaseIndex]!

  useEffect(() => {
    if (!carouselApi) {
      return
    }
    const onSelect = () => {
      setSelectedSlideIndex(carouselApi.selectedScrollSnap())
      setCanScrollPrev(carouselApi.canScrollPrev())
      setCanScrollNext(carouselApi.canScrollNext())
    }
    onSelect()
    carouselApi.on('select', onSelect)
    carouselApi.on('reInit', onSelect)
    return () => {
      carouselApi.off('select', onSelect)
      carouselApi.off('reInit', onSelect)
    }
  }, [carouselApi])

  const scrollToSlide = useCallback(
    (index: number) => {
      carouselApi?.scrollTo(index)
    },
    [carouselApi]
  )

  const scrollPrev = useCallback(() => {
    carouselApi?.scrollPrev()
  }, [carouselApi])

  const scrollNext = useCallback(() => {
    carouselApi?.scrollNext()
  }, [carouselApi])

  return (
    <div className="w-full px-4 md:px-12">
      {/* Top case tabs */}
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {SHOWCASE_CASES.map((c, index) => (
          <button
            className={`rounded-full px-4 py-2 font-medium text-sm transition-colors ${
              index === activeCaseIndex
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            key={c.name}
            onClick={() => setActiveCaseIndex(index)}
            type="button"
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Theme description */}
      <div className="mb-6 text-center">
        <p className="text-muted-foreground text-sm md:text-base">
          {currentCase.theme}
        </p>
      </div>

      {/* Slide display area + Toolbar */}
      <div className="relative">
        <Carousel
          className="w-full"
          key={activeCaseIndex}
          opts={{
            align: 'start',
            loop: true,
          }}
          setApi={setCarouselApi}
        >
          <div className="relative">
            <CarouselContent className="-ml-2 md:-ml-4">
              {currentCase.slides.map((content, index) => (
                <CarouselItem className="pl-2 md:pl-4" key={index}>
                  <div className="group relative flex h-[450px] flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:border-primary/50 md:h-[600px]">
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative flex h-full w-full flex-1 items-center justify-center overflow-hidden p-4 md:p-6">
                      <InfographicSlide content={content} theme={theme} />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
        </Carousel>
        {/* Toolbar placed outside card to avoid blocking content */}
        <div className="mt-4 flex justify-center">
          <FloatingToolbar
            canScrollNext={canScrollNext}
            canScrollPrev={canScrollPrev}
            onDotClick={scrollToSlide}
            onNext={scrollNext}
            onPrev={scrollPrev}
            selectedIndex={selectedSlideIndex}
            totalSlides={currentCase.slides.length}
          />
        </div>
      </div>
    </div>
  )
}
