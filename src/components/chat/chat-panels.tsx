'use client'

import Cookies from 'js-cookie'
import {
  Group,
  type LayoutStorage,
  Panel,
  Separator,
  useDefaultLayout,
} from 'react-resizable-panels'

interface ChatPanelsProps {
  chatId: string
}
export function ChatPanels({ chatId: _chatId }: ChatPanelsProps) {
  const cookieStorage: LayoutStorage = {
    getItem(key: string) {
      return Cookies.get(key) ?? null
    },
    setItem(key: string, value: string) {
      Cookies.set(key, value)
    },
  }

  const { defaultLayout, onLayoutChange } = useDefaultLayout({
    id: 'chat-layout',
    storage: cookieStorage,
  })

  return (
    <main className="flex h-full p-4 pt-0">
      <Group
        className="h-full w-full"
        // defaultLayout={defaultLayout}
        onLayoutChange={onLayoutChange}
        orientation="horizontal"
        suppressHydrationWarning
      >
        <Panel
          className="rounded-xl border bg-card shadow-xs"
          defaultSize={defaultLayout?.['chat-side-panel'] ?? 30}
          id="chat-side-panel"
          minSize="300px"
        >
          <div className="h-full p-4">1{/* 左侧内容区域 */}</div>
        </Panel>

        <Separator className="relative w-2 rounded-full bg-transparent transition-all hover:bg-primary/5 focus-visible:outline-none data-[dragging=true]:bg-primary/10">
          <div className="mx-auto h-full w-px" />
        </Separator>

        <Panel
          className="rounded-xl border bg-card shadow-xs"
          defaultSize={defaultLayout?.['slide-render-panel'] ?? 70}
          id="slide-render-panel"
          minSize="30"
        >
          <div className="h-full p-4">2{/* 右侧内容区域 */}</div>
        </Panel>
      </Group>
    </main>
  )
}
