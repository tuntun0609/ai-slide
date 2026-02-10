'use client'

import { Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { createSlide } from '@/actions/slide'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NewSlideButtonProps {
  className?: string
  variant?:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'destructive'
    | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function NewSlideButton({
  className,
  variant = 'outline',
  size = 'default',
}: NewSlideButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleCreateSlide = () => {
    startTransition(async () => {
      const id = await createSlide()
      router.push(`/slide/${id}`)
    })
  }

  return (
    <Button
      className={cn(
        'h-10 w-full justify-center gap-2 rounded-xl border bg-background font-medium text-foreground shadow-sm hover:bg-muted',
        className
      )}
      disabled={isPending}
      onClick={handleCreateSlide}
      size={size}
      variant={variant}
    >
      {isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>创建中...</span>
        </>
      ) : (
        <>
          <Plus className="size-4" />
          <span>New Slide</span>
        </>
      )}
    </Button>
  )
}
