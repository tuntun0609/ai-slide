'use client'

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DeleteDialog } from './delete-dialog'

interface ToolbarProps {
  currentIndex: number
  totalCount: number
  isEmptyContent: boolean
  isFullscreen: boolean
  onPrevious: () => void
  onNext: () => void
  onAddSlide: () => void
  onDeleteSlide: () => void
  onDownload: () => void
  onFullscreen: () => void
}

export function Toolbar({
  currentIndex,
  totalCount,
  isEmptyContent,
  isFullscreen,
  onPrevious,
  onNext,
  onAddSlide,
  onDeleteSlide,
  onDownload,
  onFullscreen,
}: ToolbarProps) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-2 border-t bg-background p-2 shadow-sm">
      <div className="flex items-center gap-2 rounded-lg bg-background p-2">
        {/* 切换器 */}
        {totalCount > 1 && (
          <>
            <Button
              onClick={onPrevious}
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
              onClick={onNext}
              size="icon-sm"
              title="下一个"
              variant="ghost"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        {/* 分割线 */}
        {totalCount > 1 && <div className="h-6 w-px bg-border" />}
        {/* 新增 slide 按钮 */}
        <Button
          onClick={onAddSlide}
          size="icon-sm"
          title="新增 slide"
          variant="ghost"
        >
          <Plus className="h-4 w-4" />
        </Button>
        {/* 删除 slide 按钮 */}
        <DeleteDialog onDelete={onDeleteSlide} />
        {/* 分割线 */}
        <div className="h-6 w-px bg-border" />
        {/* 工具按钮 */}
        <Button
          disabled={isEmptyContent}
          onClick={onDownload}
          size="icon-sm"
          title="下载"
          variant="ghost"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          onClick={onFullscreen}
          size="icon-sm"
          title={isFullscreen ? '退出全屏' : '全屏'}
          variant="ghost"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
