import { cookies } from 'next/headers'
import type { Layout } from 'react-resizable-panels'
import { ChatPanels } from '@/components/chat/chat-panels'
import { RESIZABLE_PANELS_COOKIE_NAME } from '@/type'

export default async function ChatIdPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const api = await cookies()

  const defaultLayoutString = api.get(RESIZABLE_PANELS_COOKIE_NAME)?.value
  const defaultLayout = defaultLayoutString
    ? (JSON.parse(defaultLayoutString) as Layout)
    : undefined

  return <ChatPanels chatId={id} defaultLayout={defaultLayout} />
}
