'use client'

import { Infographic } from '@antv/infographic'
import { useAtomValue, useSetAtom } from 'jotai'
import { ChevronLeft, ChevronRight, Download, Maximize2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  selectedInfographicAtom,
  selectedInfographicIdAtom,
  slideAtom,
} from '@/store/slide-store'

interface InfographicViewerProps {
  slideId: string
}

export function InfographicViewer({ slideId }: InfographicViewerProps) {
  const selectedInfographic = useAtomValue(selectedInfographicAtom)
  const slide = useAtomValue(slideAtom)
  const selectedInfographicId = useAtomValue(selectedInfographicIdAtom)
  const setSelectedInfographicId = useSetAtom(selectedInfographicIdAtom)
  const containerRef = useRef<HTMLDivElement>(null)
  const infographicInstanceRef = useRef<Infographic | null>(null)

  // 计算当前索引和总数
  const { currentIndex, totalCount } = useMemo(() => {
    if (!(slide && selectedInfographicId)) {
      return { currentIndex: -1, totalCount: 0 }
    }
    const index = slide.infographics.findIndex(
      (info: { id: string }) => info.id === selectedInfographicId
    )
    return {
      currentIndex: index >= 0 ? index + 1 : 0,
      totalCount: slide.infographics.length,
    }
  }, [slide, selectedInfographicId])

  // 切换到上一个信息图
  const handlePrevious = useCallback(() => {
    if (!slide || slide.infographics.length === 0) {
      return
    }
    const currentIdx = slide.infographics.findIndex(
      (info: { id: string }) => info.id === selectedInfographicId
    )
    if (currentIdx > 0) {
      setSelectedInfographicId(slide.infographics[currentIdx - 1]!.id)
    } else {
      // 循环到最后一个
      const lastInfographic = slide.infographics.at(-1)
      if (lastInfographic) {
        setSelectedInfographicId(lastInfographic.id)
      }
    }
  }, [slide, selectedInfographicId, setSelectedInfographicId])

  // 切换到下一个信息图
  const handleNext = useCallback(() => {
    if (!slide || slide.infographics.length === 0) {
      return
    }
    const currentIdx = slide.infographics.findIndex(
      (info: { id: string }) => info.id === selectedInfographicId
    )
    if (currentIdx < slide.infographics.length - 1) {
      setSelectedInfographicId(slide.infographics[currentIdx + 1]!.id)
    } else {
      // 循环到第一个
      const firstInfographic = slide.infographics[0]
      if (firstInfographic) {
        setSelectedInfographicId(firstInfographic.id)
      }
    }
  }, [slide, selectedInfographicId, setSelectedInfographicId])

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

  // 工具栏操作函数
  const handleDownload = () => {
    if (!containerRef.current) {
      return
    }

    const svgElement = containerRef.current.querySelector('svg')
    if (!svgElement) {
      return
    }

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)

    const downloadLink = document.createElement('a')
    downloadLink.href = svgUrl
    downloadLink.download = `infographic-${slideId}-${Date.now()}.svg`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(svgUrl)
  }

  const handleFullscreen = () => {
    if (!containerRef.current) {
      return
    }

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen()
    }
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8">
      <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed">
        {selectedInfographic ? (
          <div className="relative flex h-full w-full items-center justify-center">
            <div className="h-full w-full bg-background" ref={containerRef} />
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
      {/* 工具栏 */}
      {selectedInfographic && (
        <div className="flex items-center gap-2 rounded-lg border bg-background p-2 shadow-sm">
          {/* 切换器 */}
          {totalCount > 1 && (
            <>
              <Button
                onClick={handlePrevious}
                size="icon-sm"
                title="上一个"
                variant="ghost"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-3 py-1 text-muted-foreground text-sm">
                {currentIndex} / {totalCount}
              </div>
              <Button
                onClick={handleNext}
                size="icon-sm"
                title="下一个"
                variant="ghost"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Separator className="h-6" orientation="vertical" />
            </>
          )}
          {/* 工具按钮 */}
          <Button
            onClick={handleDownload}
            size="icon-sm"
            title="下载"
            variant="ghost"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleFullscreen}
            size="icon-sm"
            title="全屏"
            variant="ghost"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
