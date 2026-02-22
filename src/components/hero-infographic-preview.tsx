'use client'

import { Infographic } from '@antv/infographic'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'

const SAMPLE_CONTENTS = [
  `infographic chart-column-simple
data
  title Annual Revenue Growth
  desc Revenue comparison over recent years (in millions)
  items
    - label 2021
      value 120
      desc Steady foundation building
      icon lucide/sprout
    - label 2022
      value 150
      desc Platform optimization
      icon lucide/zap
    - label 2023
      value 190
      desc Smart integration & growth
      icon lucide/brain-circuit
    - label 2024
      value 240
      desc Ecosystem expansion
      icon lucide/trophy
theme light
  palette antv`,

  `infographic sequence-filter-mesh-underline-text
data
  title Product Design Workflow
  items
    - label User Research
      desc Understand target users needs and pain points
    - label Prototype
      desc Validate core features and interactions
    - label Visual Design
      desc Create brand-consistent visual experience
    - label Development
      desc Ensure product quality and UX
    - label Launch
      desc Continuously optimize and iterate
theme light
  palette #667eea,#764ba2,#f093fb,#4facfe,#00f2fe`,

  `infographic sequence-ascending-stairs-3d-underline-text
data
  title Skill Growth Path
  desc From beginner to expert, progressively improve professional ability
  items
    - label Beginner
      desc Master basic concepts and core principles
    - label Practitioner
      desc Build real-world project experience
    - label Deep Learning
      desc Understand underlying mechanisms and best practices
    - label Architect
      desc System-level design and optimization ability
    - label Tech Leader
      desc Become a domain expert and tech evangelist
theme light
  palette #ef476f,#ffd166,#06d6a0,#118ab2,#073b4c`,

  `infographic sequence-mountain-underline-text
data
  title Sustainability Journey
  items
    - label Awareness
      desc Recognize environmental issues
    - label Action
      desc Reduce disposables and sort waste
    - label Habit
      desc Integrate eco practices into daily life
    - label Influence
      desc Inspire others and organize events
    - label Systemic Change
      desc Drive policy and sustainable development
theme light
  palette #76c893,#52b69a,#34a0a4,#168aad,#1a759f`,

  `infographic sequence-cylinders-3d-simple
data
  title User Loyalty Building
  items
    - label Brand Awareness
      desc Build brand recognition and first impressions
    - label Product Experience
      desc Win user trust through quality experience
    - label Emotional Connection
      desc Build deep emotional bonds with users
    - label Word of Mouth
      desc Users actively recommend and share
    - label Loyalty
      desc Become long-term brand supporters
theme light
  palette #ef476f,#ffd166,#06d6a0,#118ab2,#073b4c`,
]

/** How long each infographic is displayed before switching (ms) */
const ROTATE_INTERVAL = 6000
/** Duration of the fade transition (ms) */
const FADE_DURATION = 600

export function HeroInfographicPreview() {
  const containerRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<Infographic | null>(null)
  const { resolvedTheme } = useTheme()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fading, setFading] = useState(false)

  const cleanup = useCallback(() => {
    if (instanceRef.current) {
      instanceRef.current.destroy()
      instanceRef.current = null
    }
  }, [])

  // Render the infographic when index or theme changes
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
          theme: resolvedTheme === 'dark' ? 'dark' : 'light',
        })

        infographic.render(SAMPLE_CONTENTS[currentIndex])
        instanceRef.current = infographic
      } catch (error) {
        console.error('Failed to render hero infographic:', error)
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      cleanup()
    }
  }, [resolvedTheme, cleanup, currentIndex])

  // Auto-rotate through infographics
  useEffect(() => {
    const interval = setInterval(() => {
      // Start fade-out
      setFading(true)

      // After fade-out completes, switch content and fade back in
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % SAMPLE_CONTENTS.length)
        setFading(false)
      }, FADE_DURATION)
    }, ROTATE_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="h-full w-full overflow-hidden"
      ref={containerRef}
      style={{
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_DURATION}ms ease-in-out`,
      }}
    />
  )
}
