'use client'

interface ChatPanelProps {
  chatId: string
}

export function ChatPanel({ chatId }: ChatPanelProps) {
  return (
    <div className="flex h-full flex-col">
      {/* AI 对话框区域 - 使用 vercel ai elements */}
      <div className="flex-1 overflow-auto p-4">
        {/* TODO: 实现 AI 对话框功能 */}
        <div className="text-muted-foreground">
          AI 对话框区域 (Chat ID: {chatId})
        </div>
      </div>
    </div>
  )
}
