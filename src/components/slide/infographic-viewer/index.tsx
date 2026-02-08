'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { exportToPptx } from '@/lib/export-pptx'
import {
  addInfographicAtom,
  deleteInfographicAtom,
  selectedInfographicAtom,
  selectedInfographicIdAtom,
  slideAtom,
} from '@/store/slide-store'
import { EmptyState } from './empty-state'
import {
  InfographicRenderer,
  type InfographicRendererRef,
} from './infographic-renderer'
import { Toolbar } from './toolbar'

interface InfographicViewerProps {
  slideId: string
}

export function InfographicViewer({ slideId }: InfographicViewerProps) {
  const selectedInfographic = useAtomValue(selectedInfographicAtom)
  const slide = useAtomValue(slideAtom)
  const selectedInfographicId = useAtomValue(selectedInfographicIdAtom)
  const setSelectedInfographicId = useSetAtom(selectedInfographicIdAtom)
  const addInfographic = useSetAtom(addInfographicAtom)
  const deleteInfographic = useSetAtom(deleteInfographicAtom)
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const infographicRendererRef = useRef<InfographicRendererRef>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isCopying, setIsCopying] = useState(false)

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

  // 跳转到指定页码
  const handleJumpTo = useCallback(
    (pageNum: number) => {
      if (!slide || slide.infographics.length === 0) {
        return
      }
      // pageNum 是从 1 开始的，需要转换为索引
      const targetIndex = pageNum - 1
      if (targetIndex >= 0 && targetIndex < slide.infographics.length) {
        const targetInfographic = slide.infographics[targetIndex]
        if (targetInfographic) {
          setSelectedInfographicId(targetInfographic.id)
        }
      }
    },
    [slide, setSelectedInfographicId]
  )

  // 新增 slide
  const handleAddSlide = useCallback(() => {
    const newInfographic = {
      id: nanoid(),
      content: '',
    }
    // 在当前页之后添加
    addInfographic({
      infographic: newInfographic,
      afterId: selectedInfographicId,
    })
  }, [addInfographic, selectedInfographicId])

  // 删除 slide
  const handleDeleteSlide = useCallback(() => {
    if (!selectedInfographicId) {
      return
    }
    deleteInfographic(selectedInfographicId)
  }, [selectedInfographicId, deleteInfographic])

  // 检查内容是否为空
  const isEmptyContent = useMemo(() => {
    return (
      !selectedInfographic?.content || selectedInfographic.content.trim() === ''
    )
  }, [selectedInfographic?.content])

  // 复制为 PNG
  const handleCopyAsPng = useCallback(async () => {
    const infographicInstance = infographicRendererRef.current?.getInstance()
    if (!infographicInstance) {
      toast.error('无法获取信息图实例')
      return
    }

    setIsCopying(true)
    try {
      // 使用 @antv/infographic 的 toDataURL 方法导出 PNG
      const dataUrl = await infographicInstance.toDataURL({
        type: 'png',
        dpr: 2, // 使用 2x 分辨率以获得更清晰的图像
      })

      // 将 Data URL 转换为 Blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()

      // 使用 Clipboard API 复制图片
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])

      toast.success('已复制为 PNG')
    } catch (error) {
      console.error('Failed to copy as PNG:', error)
      toast.error('复制失败')
    } finally {
      setIsCopying(false)
    }
  }, [])

  // 工具栏操作函数 - 下载信息图
  const handleDownload = useCallback(
    async (format: 'svg' | 'png') => {
      const infographicInstance = infographicRendererRef.current?.getInstance()
      if (!infographicInstance) {
        toast.error('无法获取信息图实例')
        return
      }

      try {
        const timestamp = Date.now()
        let dataUrl: string
        let filename: string

        if (format === 'svg') {
          // 导出 SVG
          dataUrl = await infographicInstance.toDataURL({
            type: 'svg',
            embedResources: true,
            removeIds: false,
          })
          filename = `infographic-${slideId}-${timestamp}.svg`
        } else {
          // 导出 PNG
          dataUrl = await infographicInstance.toDataURL({
            type: 'png',
            dpr: 2, // 使用 2x 分辨率以获得更清晰的图像
          })
          filename = `infographic-${slideId}-${timestamp}.png`
        }

        // 将 Data URL 转换为 Blob
        const response = await fetch(dataUrl)
        const blob = await response.blob()

        // 创建下载链接
        const downloadUrl = URL.createObjectURL(blob)
        const downloadLink = document.createElement('a')
        downloadLink.href = downloadUrl
        downloadLink.download = filename
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        URL.revokeObjectURL(downloadUrl)

        toast.success(`已下载为 ${format.toUpperCase()}`)
      } catch (error) {
        console.error(`Failed to download as ${format}:`, error)
        toast.error('下载失败')
      }
    },
    [slideId]
  )

  // 导出为 PPT
  const handleExportPptx = useCallback(() => {
    if (!slide || slide.infographics.length === 0) {
      return
    }

    toast.promise(exportToPptx(slide.infographics, slide.title || 'slide'), {
      loading: '正在导出 PPT...',
      success: '已导出为 PPT',
      error: '导出 PPT 失败',
    })
  }, [slide])

  const handleFullscreen = useCallback(() => {
    if (!wrapperRef.current) {
      return
    }

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      wrapperRef.current.requestFullscreen()
    }
  }, [])

  // 监听全屏状态变化
  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement)
  }, [])

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [handleFullscreenChange])

  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden ${
        isFullscreen ? 'bg-background' : ''
      }`}
      ref={wrapperRef}
    >
      <div
        className={`flex min-h-0 flex-1 items-center justify-center overflow-hidden ${
          isFullscreen ? 'p-4' : 'p-6'
        }`}
      >
        <div
          className={
            'flex h-full w-full max-w-full items-center justify-center overflow-hidden'
          }
        >
          {!selectedInfographic && (
            <EmptyState isEmptyContent={false} slideId={slideId} />
          )}
          {selectedInfographic && isEmptyContent && (
            <EmptyState isEmptyContent={true} slideId={slideId} />
          )}
          {selectedInfographic && !isEmptyContent && (
            <InfographicRenderer
              containerRef={containerRef}
              content={selectedInfographic.content}
              isEmptyContent={isEmptyContent}
              ref={infographicRendererRef}
            />
          )}
        </div>
      </div>
      <Toolbar
        currentIndex={currentIndex}
        isCopying={isCopying}
        isEmptyContent={isEmptyContent}
        isFullscreen={isFullscreen}
        onAddSlide={handleAddSlide}
        onCopyAsPng={handleCopyAsPng}
        onDeleteSlide={handleDeleteSlide}
        onDownload={handleDownload}
        onExportPptx={handleExportPptx}
        onFullscreen={handleFullscreen}
        onJumpTo={handleJumpTo}
        onNext={handleNext}
        onPrevious={handlePrevious}
        totalCount={totalCount}
      />
    </div>
  )
}
