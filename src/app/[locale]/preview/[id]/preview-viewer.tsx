'use client'

import { Infographic } from '@antv/infographic'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileImage,
  FileType,
  Maximize2,
  Presentation,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportToPptx } from '@/lib/export-pptx'
import type { Infographic as InfographicType } from '@/lib/slide-schema'

interface PreviewViewerProps {
  title: string
  infographics: InfographicType[]
}

export function PreviewViewer({ title, infographics }: PreviewViewerProps) {
  const t = useTranslations('slideViewer')
  const tPreview = useTranslations('preview')
  const { resolvedTheme } = useTheme()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const infographicInstanceRef = useRef<Infographic | null>(null)
  const previousThemeRef = useRef<'dark' | 'light' | null>(null)

  const currentInfographic = infographics[currentIndex]
  const totalCount = infographics.length

  const isEmptyContent = useMemo(
    () => !currentInfographic?.content?.trim(),
    [currentInfographic]
  )

  const cleanupInfographic = useCallback(() => {
    if (infographicInstanceRef.current) {
      infographicInstanceRef.current.destroy()
      infographicInstanceRef.current = null
    }
    previousThemeRef.current = null
  }, [])

  const renderInfographic = useCallback(
    (content: string, options: { theme: 'dark' | 'light' }) => {
      if (!containerRef.current) {
        return
      }

      try {
        if (infographicInstanceRef.current) {
          if (previousThemeRef.current !== options.theme) {
            infographicInstanceRef.current.update({ theme: options.theme })
          }
          infographicInstanceRef.current.update(content)
          previousThemeRef.current = options.theme
          return
        }

        containerRef.current.innerHTML = ''
        const infographic = new Infographic({
          container: containerRef.current,
          width: '100%',
          height: '100%',
          theme: options.theme,
        })
        infographic.render(content)
        infographicInstanceRef.current = infographic
        previousThemeRef.current = options.theme
      } catch (error) {
        console.error('Failed to render infographic:', error)
      }
    },
    []
  )

  useEffect(() => {
    if (!(currentInfographic?.content?.trim() && containerRef.current)) {
      cleanupInfographic()
      return
    }

    const timer = setTimeout(() => {
      renderInfographic(currentInfographic.content, {
        theme: resolvedTheme === 'dark' ? 'dark' : 'light',
      })
    }, 0)

    return () => clearTimeout(timer)
  }, [currentInfographic, resolvedTheme, renderInfographic, cleanupInfographic])

  useEffect(() => {
    return cleanupInfographic
  }, [cleanupInfographic])

  // Reset instance when changing pages
  useEffect(() => {
    cleanupInfographic()
  }, [currentIndex, cleanupInfographic])

  const handlePrevious = () => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : totalCount - 1))
  }

  const handleNext = () => {
    setCurrentIndex((i) => (i < totalCount - 1 ? i + 1 : 0))
  }

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

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const handleDownload = useCallback(
    async (format: 'svg' | 'png') => {
      const instance = infographicInstanceRef.current
      if (!instance) {
        toast.error(t('cannotGetInstance'))
        return
      }
      try {
        const timestamp = Date.now()
        const dataUrl = await instance.toDataURL(
          format === 'svg'
            ? { type: 'svg', embedResources: true, removeIds: false }
            : { type: 'png', dpr: 2 }
        )
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        const downloadUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `infographic-${timestamp}.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(downloadUrl)
        toast.success(t('downloadSuccess', { format: format.toUpperCase() }))
      } catch {
        toast.error(t('downloadFailed'))
      }
    },
    [t]
  )

  const handleExportPptx = useCallback(() => {
    if (infographics.length === 0) {
      return
    }
    toast.promise(exportToPptx(infographics, title || 'slide'), {
      loading: t('exportPptLoading'),
      success: t('exportPptSuccess'),
      error: t('exportPptFailed'),
    })
  }, [infographics, title, t])

  return (
    <div className="flex h-screen flex-col bg-background" ref={wrapperRef}>
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <h1 className="truncate font-medium text-sm">{title}</h1>
        <span className="text-muted-foreground text-xs">
          {tPreview('createdBy')}
        </span>
      </header>

      {/* Main content */}
      <div
        className={`flex min-h-0 flex-1 items-center justify-center overflow-hidden ${
          isFullscreen ? 'p-4' : 'p-2 sm:p-6'
        }`}
      >
        <div className="flex h-full w-full max-w-full items-center justify-center overflow-hidden">
          {isEmptyContent ? (
            <p className="text-muted-foreground text-sm">
              {t('emptyInfographic')}
            </p>
          ) : (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
              <div className="h-full w-full bg-background" ref={containerRef} />
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-center border-t bg-background/80 p-1 backdrop-blur-sm sm:p-1.5">
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-lg bg-muted/50 px-1.5 py-1 sm:gap-1.5 sm:px-2">
          {totalCount > 0 && (
            <>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  disabled={totalCount <= 1}
                  onClick={handlePrevious}
                  size="icon-sm"
                  title={t('previous')}
                  variant="ghost"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 py-1 text-muted-foreground text-sm">
                  {currentIndex + 1} / {totalCount}
                </span>
                <Button
                  disabled={totalCount <= 1}
                  onClick={handleNext}
                  size="icon-sm"
                  title={t('next')}
                  variant="ghost"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="h-6 w-px shrink-0 bg-border" />
            </>
          )}
          <div className="flex shrink-0 items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    disabled={isEmptyContent}
                    size="icon-sm"
                    title={t('download')}
                    variant="ghost"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="center">
                <DropdownMenuItem onClick={() => handleDownload('svg')}>
                  <FileType className="mr-2 h-4 w-4" />
                  <span>{t('downloadAsSvg')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('png')}>
                  <FileImage className="mr-2 h-4 w-4" />
                  <span>{t('downloadAsPng')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={totalCount === 0}
                  onClick={handleExportPptx}
                >
                  <Presentation className="mr-2 h-4 w-4" />
                  <span>{t('exportAsPpt')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={handleFullscreen}
              size="icon-sm"
              title={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
              variant="ghost"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
