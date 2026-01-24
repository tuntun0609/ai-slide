'use client'

import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  LayoutTemplate,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Type,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createSlide, deleteSlide, updateSlide } from '@/actions/slide'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import type { slide } from '@/db/schema'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

type Slide = typeof slide.$inferSelect

interface SlideListProps {
  slides: Slide[]
  currentPage: number
  totalPages: number
  totalCount: number
}

export function SlideList({
  slides,
  currentPage,
  totalPages,
  totalCount,
}: SlideListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  )

  const handleCreateSlide = () => {
    startTransition(async () => {
      try {
        await createSlide()
      } catch {
        toast.error('创建失败')
      }
    })
  }

  // Sync URL params to local state
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '')
  }, [searchParams])

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value)
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) {
        params.set('search', value.trim())
        params.delete('page')
      } else {
        params.delete('search')
      }
      const newUrl = params.toString()
        ? `/slide?${params.toString()}`
        : '/slide'
      router.push(newUrl)
    },
    [router, searchParams]
  )

  return (
    <div className="flex h-full flex-col bg-background/50">
      {/* Minimalist Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background/80 px-8 py-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <h1 className="font-medium text-xl tracking-tight">我的演示</h1>
          <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium text-muted-foreground text-xs">
            {totalCount}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="group relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-foreground" />
            <Input
              className="h-9 w-64 rounded-full bg-muted/50 pl-9 transition-all hover:bg-muted focus:w-80 focus:bg-background"
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="搜索..."
              value={searchQuery}
            />
          </div>
          <Button
            className="h-9 rounded-full px-4 font-medium transition-all hover:scale-105 active:scale-95"
            disabled={isPending}
            onClick={handleCreateSlide}
          >
            <Plus className="mr-2 size-4" />
            新建
          </Button>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        {slides.length === 0 ? (
          <EmptyState isPending={isPending} onCreate={handleCreateSlide} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {slides.map((slide) => (
              <SlideCard key={slide.id} slide={slide} />
            ))}
          </div>
        )}
      </main>

      {/* Minimalist Pagination */}
      {totalPages > 1 && (
        <footer className="flex justify-center border-t bg-background/50 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                className={cn(
                  'h-8 w-8 rounded-full p-0 font-normal',
                  currentPage === page &&
                    'bg-foreground text-background hover:bg-foreground/90'
                )}
                key={page}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('page', String(page))
                  router.push(`/slide?${params.toString()}`)
                }}
                size="sm"
                variant={currentPage === page ? 'secondary' : 'ghost'}
              >
                {page}
              </Button>
            ))}
          </div>
        </footer>
      )}
    </div>
  )
}

function SlideCard({ slide }: { slide: Slide }) {
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [newName, setNewName] = useState(slide.title)
  const [isPending, startTransition] = useTransition()

  const handleRename = () => {
    if (!newName.trim() || newName === slide.title) {
      setIsRenameOpen(false)
      return
    }

    startTransition(async () => {
      try {
        await updateSlide(slide.id, { title: newName })
        setIsRenameOpen(false)
        toast.success('重命名成功')
      } catch {
        toast.error('重命名失败')
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteSlide(slide.id)
        setIsDeleteOpen(false)
        toast.success('删除成功')
      } catch {
        toast.error('删除失败')
      }
    })
  }

  return (
    <>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="group relative flex aspect-4/3 flex-col overflow-hidden rounded-xl border bg-card transition-all hover:border-foreground/20 hover:shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        layout
      >
        <Link className="flex-1 cursor-pointer" href={`/slide/${slide.id}`}>
          <div className="flex h-full w-full flex-col items-center justify-center bg-muted/30 p-6 transition-colors group-hover:bg-muted/50">
            <LayoutTemplate className="size-12 text-muted-foreground/20 transition-transform duration-500 group-hover:scale-110 group-hover:text-muted-foreground/40" />
          </div>
        </Link>

        <div className="absolute top-3 right-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background">
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setIsRenameOpen(true)}>
                <Type className="mr-2 size-4" />
                重命名
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="mr-2 size-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col gap-1 border-t bg-background p-4">
          <div className="flex items-center justify-between">
            <h3 className="truncate font-medium text-sm" title={slide.title}>
              {slide.title}
            </h3>
          </div>
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>{slide.infographics?.length || 0} 页</span>
            <span>
              {formatDistanceToNow(slide.updatedAt || slide.createdAt, {
                addSuffix: true,
                locale: zhCN,
              })}
            </span>
          </div>
        </div>
      </motion.div>

      <Dialog onOpenChange={setIsRenameOpen} open={isRenameOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>重命名演示文稿</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              autoFocus
              className="col-span-3"
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename()
                }
              }}
              placeholder="输入新的名称"
              value={newName}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setIsRenameOpen(false)} variant="outline">
              取消
            </Button>
            <Button disabled={isPending} onClick={handleRename}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog onOpenChange={setIsDeleteOpen} open={isDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。这将永久删除 "{slide.title}" 及其所有内容。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
              onClick={handleDelete}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function EmptyState({
  onCreate,
  isPending,
}: {
  onCreate: () => void
  isPending: boolean
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <motion.div
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-4"
        initial={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex size-20 items-center justify-center rounded-3xl bg-muted/30">
          <LayoutTemplate className="size-10 text-muted-foreground/50" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-lg">开始你的创作</h3>
          <p className="max-w-xs text-muted-foreground text-sm">
            创建一个新的演示文稿，开始你的精彩演讲。
          </p>
        </div>
        <Button
          className="mt-4 rounded-full px-8"
          disabled={isPending}
          onClick={onCreate}
        >
          <Plus className="mr-2 size-4" />
          新建演示
        </Button>
      </motion.div>
    </div>
  )
}
