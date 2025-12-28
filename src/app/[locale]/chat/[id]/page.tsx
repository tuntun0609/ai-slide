'use client'

import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

const ResizablePanels = dynamic(
  () =>
    import('@/components/chat/resizable-panels').then(
      (mod) => mod.ResizablePanels
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
)

import { use } from 'react'

export default function ChatIdPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <main className="flex flex-1 flex-col overflow-hidden p-4 pt-0">
      <ResizablePanels chatId={id} />
    </main>
  )
}
