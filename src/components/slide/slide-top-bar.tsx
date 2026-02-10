'use client'

import { Globe, GlobeLock, Link2, PanelRightOpen } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { publishSlide } from '@/actions/slide'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { SlideData } from '@/store/slide-store'

interface SlideTopBarProps {
  slide: SlideData | null
  titleValue: string
  isEditingTitle: boolean
  isPending: boolean
  isMobile?: boolean
  isCollapsed?: boolean
  onTitleChange: (value: string) => void
  onTitleEdit: (editing: boolean) => void
  onTitleSubmit: () => void
  onSave: () => void
  onToggleCollapse?: () => void
  onPublishChange?: (published: boolean) => void
}

export function SlideTopBar({
  slide,
  titleValue,
  isEditingTitle,
  isPending,
  isMobile = false,
  isCollapsed = false,
  onTitleChange,
  onTitleEdit,
  onTitleSubmit,
  onSave,
  onToggleCollapse,
  onPublishChange,
}: SlideTopBarProps) {
  const t = useTranslations('slide')
  const hoverAnimation = isMobile || isPending ? {} : { scale: 1.03 }
  const [isPublishing, startPublishTransition] = useTransition()

  const isPublished = slide?.published ?? false

  const handleTogglePublish = () => {
    if (!slide) {
      return
    }
    startPublishTransition(async () => {
      try {
        const newPublished = !isPublished
        await publishSlide(slide.id, newPublished)
        onPublishChange?.(newPublished)
        toast.success(
          newPublished ? t('publishSuccess') : t('unpublishSuccess')
        )
      } catch {
        toast.error(t('saveFailed'))
      }
    })
  }

  const handleCopyLink = () => {
    if (!slide) {
      return
    }
    const url = `${window.location.origin}/preview/${slide.id}`
    navigator.clipboard.writeText(url)
    toast.success(t('linkCopied'))
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-between border-t border-b px-3',
        isMobile ? 'h-11' : 'h-12 px-4'
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {isEditingTitle ? (
          <Input
            autoFocus
            className={cn(
              'h-7 border-transparent px-2 py-1 font-medium text-sm shadow-none',
              isMobile ? 'max-w-[200px]' : 'max-w-[300px]'
            )}
            onBlur={onTitleSubmit}
            onChange={(e) => onTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onTitleSubmit()
              }
              if (e.key === 'Escape') {
                onTitleEdit(false)
                onTitleChange(slide?.title || '')
              }
            }}
            value={titleValue}
          />
        ) : (
          <button
            className="h-7 cursor-pointer truncate rounded-md px-2 py-1 text-left font-medium text-sm transition-colors hover:bg-muted"
            onClick={() => onTitleEdit(true)}
            type="button"
          >
            {slide?.title || t('untitledSlide')}
          </button>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {/* Publish toggle */}
        {slide && (
          <>
            <Button
              className="h-7 gap-1.5 px-2.5 text-xs"
              disabled={isPublishing}
              onClick={handleTogglePublish}
              size="sm"
              variant={isPublished ? 'outline' : 'ghost'}
            >
              {isPublished ? (
                <>
                  <Globe className="h-3.5 w-3.5 text-green-600" />
                  {!isMobile && t('unpublish')}
                </>
              ) : (
                <>
                  <GlobeLock className="h-3.5 w-3.5" />
                  {!isMobile && t('publish')}
                </>
              )}
            </Button>
            {isPublished && (
              <Button
                className="h-7 w-7"
                onClick={handleCopyLink}
                size="icon"
                title={t('copyLink')}
                variant="ghost"
              >
                <Link2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </>
        )}

        {!isMobile && isCollapsed && onToggleCollapse && (
          <Button
            className="h-7 w-7"
            onClick={onToggleCollapse}
            size="icon"
            variant="ghost"
          >
            <PanelRightOpen className="h-3.5 w-3.5" />
          </Button>
        )}
        <motion.div
          animate={isPending ? { scale: [1, 1.02, 1] } : {}}
          transition={
            isPending
              ? {
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }
              : { type: 'spring', stiffness: 400, damping: 17 }
          }
          whileHover={hoverAnimation}
          whileTap={isPending ? {} : { scale: 0.97 }}
        >
          <Button
            className="h-7 px-3 text-xs"
            disabled={isPending || !slide}
            onClick={onSave}
            size="sm"
            variant="default"
          >
            {isPending ? t('saving') : t('save')}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
