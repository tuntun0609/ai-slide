'use client'

interface EmptyStateProps {
  slideId: string
  isEmptyContent: boolean
}

export function EmptyState({ slideId, isEmptyContent }: EmptyStateProps) {
  if (isEmptyContent) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="text-muted-foreground">
          <svg
            aria-label="空的信息图"
            className="mx-auto h-12 w-12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>空的信息图</title>
            <path
              d="M3.75 3v18h16.5V3H3.75zM3.75 3h16.5M3.75 3v18M20.25 3v18M9 9h6M9 15h6M9 12h6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-sm">空的信息图</h3>
          <p className="text-muted-foreground text-sm">
            请在右侧编辑器中输入内容，或使用 AI 生成功能创建信息图
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      <p className="font-medium text-muted-foreground">信息图展示区域</p>
      <p className="mt-1 text-muted-foreground text-xs">Slide ID: {slideId}</p>
      <p className="mt-2 text-muted-foreground text-xs">
        请选择一个信息图进行编辑
      </p>
    </div>
  )
}
