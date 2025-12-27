'use client'

import { Infographic } from '@antv/infographic'
import { useEffect, useRef } from 'react'

export function InfographicRenderer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const infographicRef = useRef<Infographic | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    // Clean up previous instance
    if (infographicRef.current) {
      infographicRef.current.destroy()
    }

    const updateInfographic = () => {
      if (!containerRef.current) {
        return
      }

      const container = containerRef.current
      const width = container.clientWidth
      const height = container.clientHeight

      try {
        const infographic = new Infographic({
          container,
          width,
          height,
          template: 'list-row-simple-horizontal-arrow',
          data: {
            items: [
              { label: 'Step 1', desc: 'Start' },
              { label: 'Step 2', desc: 'In Progress' },
              { label: 'Step 3', desc: 'Complete' },
            ],
          },
          theme: 'default',
        })

        infographic.render()
        infographicRef.current = infographic
      } catch (e) {
        console.error('Failed to render infographic', e)
      }
    }

    // Initial render
    updateInfographic()

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (infographicRef.current) {
        infographicRef.current.destroy()
        infographicRef.current = null
      }
      updateInfographic()
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      if (infographicRef.current) {
        infographicRef.current.destroy()
      }
    }
  }, [])

  return (
    <div className="flex h-full w-full items-center justify-center bg-muted/10 p-4">
      <div
        className="h-full w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm"
        ref={containerRef}
      />
    </div>
  )
}
