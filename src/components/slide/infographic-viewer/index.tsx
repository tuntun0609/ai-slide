'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { nanoid } from 'nanoid'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react'
import { toast } from 'sonner'
import { updateSlide } from '@/actions/slide'
import { Button } from '@/components/ui/button'
import {
  addInfographicAtom,
  deleteInfographicAtom,
  selectedInfographicAtom,
  selectedInfographicIdAtom,
  slideAtom,
} from '@/store/slide-store'
import { EmptyState } from './empty-state'
import { InfographicRenderer } from './infographic-renderer'
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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPending, startTransition] = useTransition()

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

  // 工具栏操作函数
  const handleDownload = useCallback(() => {
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
  }, [slideId])

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

  // 保存当前 slide 数据到数据库
  const handleSave = useCallback(() => {
    if (!slide) {
      return
    }

    startTransition(async () => {
      try {
        await updateSlide(slideId, {
          infographics: slide.infographics,
        })
        toast.success('保存成功')
      } catch (error) {
        toast.error('保存失败')
        console.error('Failed to save slide:', error)
      }
    })
  }, [slide, slideId])

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
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center border-b bg-background px-4 py-2">
        <Button
          disabled={isPending || !slide}
          onClick={handleSave}
          size="sm"
          variant="default"
        >
          {isPending ? '保存中...' : 'Save'}
        </Button>
      </div>
      <div
        className={`flex min-h-0 flex-1 items-center justify-center overflow-hidden ${
          isFullscreen ? 'p-4' : 'p-8'
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
            />
          )}
        </div>
      </div>
      {/* 工具栏 - 固定在底部，全屏时也显示，不会被压缩 */}
      <Toolbar
        currentIndex={currentIndex}
        isEmptyContent={isEmptyContent}
        isFullscreen={isFullscreen}
        onAddSlide={handleAddSlide}
        onDeleteSlide={handleDeleteSlide}
        onDownload={handleDownload}
        onFullscreen={handleFullscreen}
        onJumpTo={handleJumpTo}
        onNext={handleNext}
        onPrevious={handlePrevious}
        totalCount={totalCount}
      />
    </div>
  )
}
