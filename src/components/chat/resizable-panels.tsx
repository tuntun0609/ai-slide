'use client'

import { Group, Panel, Separator } from 'react-resizable-panels'
import { ChatInterface } from '@/components/chat/chat-interface'
import { InfographicRenderer } from '@/components/chat/infographic-renderer'

export function ResizablePanels() {
  return (
    <Group className="h-full" orientation="horizontal">
      <Panel defaultSize={30} minSize={20}>
        <div className="h-full overflow-hidden rounded-xl border bg-background">
          <ChatInterface />
        </div>
      </Panel>
      <Separator className="w-2 bg-transparent transition-colors focus-visible:border-0 focus-visible:outline-0" />
      <Panel defaultSize={70} minSize={25}>
        <div className="h-full overflow-hidden rounded-xl border bg-background">
          <InfographicRenderer />
        </div>
      </Panel>
    </Group>
  )
}
