'use client'

import { LayoutTemplate, Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onCreate: () => void
  isPending: boolean
}

export function EmptyState({ onCreate, isPending }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <motion.div
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-3 sm:gap-4"
        initial={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex size-16 items-center justify-center rounded-3xl bg-muted/30 sm:size-20">
          <LayoutTemplate className="size-8 text-muted-foreground/50 sm:size-10" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-base sm:text-lg">开始你的创作</h3>
          <p className="max-w-xs text-muted-foreground text-xs sm:text-sm">
            创建一个新的演示文稿，开始你的精彩演讲。
          </p>
        </div>
        <Button
          className="mt-3 w-full rounded-full px-6 sm:mt-4 sm:w-auto sm:px-8"
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
