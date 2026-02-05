'use client'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { PanelRightOpen } from 'lucide-react'
import { motion } from 'motion/react'
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
import { Input } from '@/components/ui/input'
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
  isRightPanelCollapsed?: boolean
  onToggleRightPanel?: () => void
}

export function InfographicViewer({
  slideId,
  isRightPanelCollapsed = false,
  onToggleRightPanel,
}: InfographicViewerProps) {
  const selectedInfographic = useAtomValue(selectedInfographicAtom)
  const [slide, setSlide] = useAtom(slideAtom)
  const selectedInfographicId = useAtomValue(selectedInfographicIdAtom)
  const setSelectedInfographicId = useSetAtom(selectedInfographicIdAtom)
  const addInfographic = useSetAtom(addInfographicAtom)
  const deleteInfographic = useSetAtom(deleteInfographicAtom)
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const infographicRendererRef = useRef<InfographicRendererRef>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(slide?.title || '')

  useEffect(() => {
    if (slide?.title) {
      setTitleValue(slide.title)
    }
  }, [slide?.title])

  const handleTitleSubmit = useCallback(() => {
    setIsEditingTitle(false)
    if (slide && titleValue.trim() !== '' && titleValue !== slide.title) {
      setSlide({ ...slide, title: titleValue.trim() })
    }
  }, [slide, titleValue, setSlide])

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
          title: slide.title,
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
      {!isFullscreen && (
        <div className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 py-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {isEditingTitle ? (
              <Input
                autoFocus
                className="h-8 max-w-[300px] border-transparent px-2.5 py-1 font-semibold text-sm shadow-none"
                onBlur={handleTitleSubmit}
                onChange={(e) => setTitleValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleSubmit()
                  }
                  if (e.key === 'Escape') {
                    setIsEditingTitle(false)
                    setTitleValue(slide?.title || '')
                  }
                }}
                value={titleValue}
              />
            ) : (
              <button
                className="h-8 cursor-pointer truncate px-2.5 py-1 text-left font-semibold text-sm hover:text-primary"
                onClick={() => setIsEditingTitle(true)}
                type="button"
              >
                {slide?.title || 'Untitled Slide'}
              </button>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <motion.div
              animate={
                isPending
                  ? {
                      scale: [1, 1.02, 1],
                    }
                  : {}
              }
              transition={
                isPending
                  ? {
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'easeInOut',
                    }
                  : {
                      type: 'spring',
                      stiffness: 400,
                      damping: 17,
                    }
              }
              whileHover={isPending ? {} : { scale: 1.05 }}
              whileTap={isPending ? {} : { scale: 0.95 }}
            >
              <Button
                disabled={isPending || !slide}
                onClick={handleSave}
                size="sm"
                variant="default"
              >
                {isPending ? '保存中...' : 'Save'}
              </Button>
            </motion.div>
            {isRightPanelCollapsed && onToggleRightPanel && (
              <Button
                className="h-8 w-8"
                onClick={onToggleRightPanel}
                size="icon"
                variant="ghost"
              >
                <PanelRightOpen className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
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
        onFullscreen={handleFullscreen}
        onJumpTo={handleJumpTo}
        onNext={handleNext}
        onPrevious={handlePrevious}
        totalCount={totalCount}
      />
    </div>
  )
}
