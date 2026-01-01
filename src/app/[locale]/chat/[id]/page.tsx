import { ChatPanels } from '@/components/chat/chat-panels'

export default async function ChatIdPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <ChatPanels chatId={id} />
}
