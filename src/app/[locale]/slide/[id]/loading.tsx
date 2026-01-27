import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <main className="flex h-full overflow-hidden p-4 pt-0">
      <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border bg-card shadow-xs">
        {/* 标题区域骨架 */}
        <div className="flex items-center justify-between border-b p-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        {/* 内容区域骨架 */}
        <div className="flex min-h-0 flex-1 items-center justify-center p-8">
          <div className="flex w-full max-w-4xl flex-col gap-6">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="flex justify-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-2 w-2 rounded-full" />
            </div>
          </div>
        </div>
        {/* 底部工具栏骨架 */}
        <div className="flex shrink-0 items-center justify-center border-t bg-background p-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-7 w-7 rounded-md" />
            <div className="h-6 w-px bg-border" />
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
            <div className="h-6 w-px bg-border" />
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        </div>
      </div>
    </main>
  )
}
