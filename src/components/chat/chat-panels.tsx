'use client'

import Cookies from 'js-cookie'
import { Group, type Layout, Panel, Separator } from 'react-resizable-panels'
import { RESIZABLE_PANELS_COOKIE_NAME } from '@/type'

interface ChatPanelsProps {
  chatId: string
  defaultLayout?: Layout
}
export function ChatPanels({
  chatId: _chatId,
  defaultLayout,
}: ChatPanelsProps) {
  const onLayoutChange = (layout: Layout) => {
    Cookies.set(RESIZABLE_PANELS_COOKIE_NAME, JSON.stringify(layout))
  }

  return (
    <main className="flex h-full p-4 pt-0">
      <Group
        className="h-full w-full"
        defaultLayout={defaultLayout}
        onLayoutChange={onLayoutChange}
        orientation="horizontal"
      >
        <Panel
          className="rounded-xl border bg-card shadow-xs"
          defaultSize="30"
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
          defaultSize="70"
          id="slide-render-panel"
          minSize="30"
        >
          <div className="h-full p-4">2{/* 右侧内容区域 */}</div>
        </Panel>
      </Group>
    </main>
  )
}
