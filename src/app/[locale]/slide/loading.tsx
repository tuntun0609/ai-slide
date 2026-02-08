import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex h-full flex-col bg-background/50">
      {/* Header 骨架 */}
      <header className="sticky top-0 z-5 flex items-center justify-between bg-background/80 px-8 py-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-64 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </header>

      {/* 主要内容区域骨架 */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              className="group relative flex aspect-4/3 flex-col overflow-hidden rounded-xl border bg-card"
              key={i}
            >
              {/* 预览区域骨架 */}
              <div className="relative flex h-full w-full items-center justify-center bg-muted/30">
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>

              {/* 底部信息骨架 */}
              <div className="flex flex-col gap-1 border-t bg-background p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
