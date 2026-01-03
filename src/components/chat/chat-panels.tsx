'use client'

import Cookies from 'js-cookie'
import { Group, type Layout, Panel, Separator } from 'react-resizable-panels'
import type { ChatMessage } from '@/app/api/chat/route'
import { RESIZABLE_PANELS_COOKIE_NAME } from '@/type'
import { ChatPanel } from './chat-panel'
import { RenderPanel } from './render-panel'

interface ChatPanelsProps {
  chatId: string
  defaultLayout?: Layout
  initialMessages?: ChatMessage[]
}
export function ChatPanels({
  chatId,
  defaultLayout,
  initialMessages = [],
}: ChatPanelsProps) {
  const onLayoutChange = (layout: Layout) => {
    Cookies.set(RESIZABLE_PANELS_COOKIE_NAME, JSON.stringify(layout))
  }

  return (
    <main className="flex h-full overflow-hidden p-4 pt-0">
      <Group
        className="h-full w-full"
        defaultLayout={defaultLayout}
        onLayoutChange={onLayoutChange}
        orientation="horizontal"
      >
        <Panel
          className="overflow-hidden rounded-xl border bg-card shadow-xs"
          defaultSize="30"
          id="chat-side-panel"
          minSize="300px"
        >
          <ChatPanel chatId={chatId} initialMessages={initialMessages} />
        </Panel>

        <Separator className="relative w-2 rounded-full bg-transparent transition-all hover:bg-primary/5 focus-visible:outline-none data-[dragging=true]:bg-primary/10">
          <div className="mx-auto h-full w-px" />
        </Separator>

        <Panel
          className="overflow-hidden rounded-xl border bg-card shadow-xs"
          defaultSize="70"
          id="slide-render-panel"
          minSize="30"
        >
          <RenderPanel chatId={chatId} />
        </Panel>
      </Group>
    </main>
  )
}
