import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { ChatInterface } from '@/components/chat/chat-interface'
import { InfographicRenderer } from '@/components/chat/infographic-renderer'

export function ResizablePanels({ chatId }: { chatId: string }) {
  const chatState = useChat({
    id: chatId,
    transport: new DefaultChatTransport({
      body: { id: chatId },
    }),
  })

  return (
    <Group className="h-full" orientation="horizontal">
      <Panel defaultSize={30} minSize={20}>
        <div className="h-full overflow-hidden rounded-xl border bg-background">
          <ChatInterface chatId={chatId} chatState={chatState} />
        </div>
      </Panel>
      <Separator className="w-2 bg-transparent transition-colors focus-visible:border-0 focus-visible:outline-0" />
      <Panel defaultSize={70} minSize={25}>
        <div className="h-full overflow-hidden rounded-xl border bg-background">
          <InfographicRenderer chatId={chatId} chatState={chatState} />
        </div>
      </Panel>
    </Group>
  )
}
