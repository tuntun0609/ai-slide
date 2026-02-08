'use client'

import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FileImage,
  FileType,
  Maximize2,
  Plus,
  Presentation,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { DeleteDialog } from './delete-dialog'

interface ToolbarProps {
  currentIndex: number
  totalCount: number
  isEmptyContent: boolean
  isFullscreen: boolean
  isCopying?: boolean
  onPrevious: () => void
  onNext: () => void
  onAddSlide: () => void
  onDeleteSlide: () => void
  onDownload: (format: 'svg' | 'png') => void
  onCopyAsPng: () => void
  onExportPptx: () => void
  onFullscreen: () => void
  onJumpTo: (index: number) => void
}

export function Toolbar({
  currentIndex,
  totalCount,
  isEmptyContent,
  isFullscreen,
  isCopying = false,
  onPrevious,
  onNext,
  onAddSlide,
  onDeleteSlide,
  onDownload,
  onCopyAsPng,
  onExportPptx,
  onFullscreen,
  onJumpTo,
}: ToolbarProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    setIsEditing(true)
    setInputValue(String(currentIndex))
    // 使用 setTimeout 确保 DOM 更新后再聚焦
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }

  const handleBlur = () => {
    setIsEditing(false)
    const pageNum = Number.parseInt(inputValue, 10)
    if (!Number.isNaN(pageNum) && pageNum >= 1 && pageNum <= totalCount) {
      onJumpTo(pageNum)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setInputValue(String(currentIndex))
    }
  }

  return (
    <div className="flex shrink-0 items-center justify-center border-t bg-background/80 p-1.5 backdrop-blur-sm">
      <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-muted/50 px-2 py-1">
        {/* 切换器 */}
        {totalCount > 0 && (
          <>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                disabled={totalCount <= 1}
                onClick={onPrevious}
                size="icon-sm"
                title="上一个"
                variant="ghost"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <Input
                    className="h-7 w-12 px-2 text-center text-sm"
                    max={totalCount}
                    min={1}
                    onBlur={handleBlur}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    ref={inputRef}
                    type="number"
                    value={inputValue}
                  />
                  <span className="shrink-0 text-muted-foreground text-sm">
                    / {totalCount}
                  </span>
                </div>
              ) : (
                <button
                  className="cursor-pointer px-3 py-1 text-muted-foreground text-sm transition-colors hover:text-foreground"
                  onClick={handleClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleClick()
                    }
                  }}
                  title="点击跳转到指定页面"
                  type="button"
                >
                  {currentIndex} / {totalCount}
                </button>
              )}
              <Button
                disabled={totalCount <= 1}
                onClick={onNext}
                size="icon-sm"
                title="下一个"
                variant="ghost"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {/* 分割线 */}
            <div className="h-6 w-px shrink-0 bg-border" />
          </>
        )}
        {/* 新增 slide 按钮 */}
        <div className="flex shrink-0 items-center gap-1">
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
        </div>
        {/* 分割线 */}
        <div className="h-6 w-px shrink-0 bg-border" />
        {/* 工具按钮 */}
        <div className="flex shrink-0 items-center gap-1">
          <Button
            disabled={isEmptyContent || isCopying}
            onClick={onCopyAsPng}
            size="icon-sm"
            title="复制为 PNG"
            variant="ghost"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  disabled={isEmptyContent}
                  size="icon-sm"
                  title="下载"
                  variant="ghost"
                >
                  <Download className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => onDownload('svg')}>
                <FileType className="mr-2 h-4 w-4" />
                <span>下载为 SVG</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload('png')}>
                <FileImage className="mr-2 h-4 w-4" />
                <span>下载为 PNG</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={totalCount === 0}
                onClick={onExportPptx}
              >
                <Presentation className="mr-2 h-4 w-4" />
                <span>导出为 PPT</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
    </div>
  )
}
