'use client'

import { Infographic } from '@antv/infographic'
import { useCallback, useEffect, useRef } from 'react'

interface InfographicRendererProps {
  content: string
  isEmptyContent: boolean
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function InfographicRenderer({
  content,
  isEmptyContent,
  containerRef,
}: InfographicRendererProps) {
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
    (contentToRender: string) => {
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
        infographic.render(contentToRender)

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
    [cleanupInfographic, containerRef.current]
  )

  // 只在内容变化时渲染一次
  useEffect(() => {
    if (!(content && containerRef.current && !isEmptyContent)) {
      cleanupInfographic()
      return
    }

    // 延迟渲染以确保容器已挂载
    const timer = setTimeout(() => {
      renderInfographic(content)
    }, 0)

    return () => {
      clearTimeout(timer)
      cleanupInfographic()
    }
  }, [
    content,
    isEmptyContent,
    cleanupInfographic,
    renderInfographic,
    containerRef.current,
  ])

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="h-full w-full bg-background" ref={containerRef} />
    </div>
  )
}
