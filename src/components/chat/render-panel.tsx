'use client'

interface RenderPanelProps {
  chatId: string
}

export function RenderPanel({ chatId }: RenderPanelProps) {
  return (
    <div className="flex h-full flex-col">
      {/* 渲染区域 */}
      <div className="flex-1 overflow-auto p-4">
        {/* TODO: 实现渲染功能 */}
        <div className="text-muted-foreground">
          渲染区域 (Chat ID: {chatId})
        </div>
      </div>
    </div>
  )
}
