'use client'

import { Infographic } from '@antv/infographic'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'
import { selectedInfographicAtom } from '@/store/slide-store'

interface InfographicViewerProps {
  slideId: string
}

export function InfographicViewer({ slideId }: InfographicViewerProps) {
  const selectedInfographic = useAtomValue(selectedInfographicAtom)
  const containerRef = useRef<HTMLDivElement>(null)
  const infographicInstanceRef = useRef<Infographic | null>(null)

  // 清理 Infographic 实例
  const cleanupInfographic = useCallback(() => {
    if (infographicInstanceRef.current) {
      infographicInstanceRef.current.destroy()
      infographicInstanceRef.current = null
    }
  }, [])

  // 渲染 Infographic（只在内容变化时渲染一次）
  const renderInfographic = useCallback(
    (content: string) => {
      if (!containerRef.current) {
        return
      }

      cleanupInfographic()
      containerRef.current.innerHTML = ''

      try {
        // 创建 Infographic 实例，使用 100% 宽度和高度，让 SVG 自适应容器
        const infographic = new Infographic({
          container: containerRef.current,
          width: '100%',
          height: '100%',
        })

        // 使用字符串渲染
        infographic.render(content)

        // 保存实例引用
        infographicInstanceRef.current = infographic
      } catch (error) {
        console.error('Failed to render infographic:', error)
        // 显示错误信息
        if (containerRef.current) {
          const errorMessage =
            error instanceof Error ? error.message : '未知错误'
          containerRef.current.innerHTML = `
          <div style="padding: 20px; text-align: center; color: #ef4444;">
            <p style="font-weight: 500; margin-bottom: 8px;">渲染错误</p>
            <p style="font-size: 12px; color: #6b7280;">${errorMessage}</p>
          </div>
        `
        }
      }
    },
    [cleanupInfographic]
  )

  // 只在内容变化时渲染一次
  useEffect(() => {
    if (!(selectedInfographic?.content && containerRef.current)) {
      cleanupInfographic()
      return
    }

    // 延迟渲染以确保容器已挂载
    const timer = setTimeout(() => {
      renderInfographic(selectedInfographic.content)
    }, 0)

    return () => {
      clearTimeout(timer)
      cleanupInfographic()
    }
  }, [selectedInfographic?.content, cleanupInfographic, renderInfographic])

  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed">
        {selectedInfographic ? (
          <div className="relative flex h-full w-full items-center justify-center">
            <div className="h-full w-full" ref={containerRef} />
          </div>
        ) : (
          <div className="text-center">
            <p className="font-medium text-muted-foreground">信息图展示区域</p>
            <p className="mt-1 text-muted-foreground text-xs">
              Slide ID: {slideId}
            </p>
            <p className="mt-2 text-muted-foreground text-xs">
              请选择一个信息图进行编辑
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
