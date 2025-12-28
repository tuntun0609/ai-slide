'use client'

import type { UIMessage, UseChatHelpers } from '@ai-sdk/react'
import { Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function ChatInterface({
  chatState,
}: {
  chatId: string
  chatState: UseChatHelpers<UIMessage>
}) {
  const { messages, sendMessage, status } = chatState
  const [input, setInput] = useState('')
  const isLoading = status === 'streaming'

  const scrollRef = useRef<HTMLDivElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) {
      return
    }
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="self-start rounded-lg bg-muted px-4 py-2 text-sm">
              Hello! Describe the infographic you want to create.
            </div>
          )}
          {messages.map((m: UIMessage) => {
            const textContent =
              m.parts?.find((p) => p.type === 'text')?.text || ''
            const toolInvocations = m.parts?.filter((p) =>
              p.type.startsWith('tool-')
            )

            if (
              !textContent &&
              (!toolInvocations || toolInvocations.length === 0)
            ) {
              return null
            }

            return (
              <div
                className={`flex max-w-[80%] flex-col gap-2 rounded-lg px-4 py-2 text-sm ${
                  m.role === 'user'
                    ? 'self-end bg-primary text-primary-foreground'
                    : 'self-start bg-muted'
                }`}
                key={m.id}
              >
                {textContent && <div>{textContent}</div>}
                {toolInvocations?.map((ti: any) => {
                  if (ti.type === 'tool-call') {
                    return (
                      <div
                        className="rounded border border-border bg-background/50 p-2 text-muted-foreground text-xs"
                        key={ti.toolCallId}
                      >
                        Generating infographic...
                      </div>
                    )
                  }
                  if (ti.type === 'tool-result') {
                    if (ti.result?.error) {
                      return (
                        <div
                          className="rounded border border-destructive/50 bg-destructive/10 p-2 text-destructive text-xs"
                          key={ti.toolCallId}
                        >
                          Error: {ti.result.error}
                        </div>
                      )
                    }
                    return null // Don't show success tool results in chat to keep it clean
                  }
                  return null
                })}
              </div>
            )
          })}
        </div>
      </div>
      <div className="border-t p-4">
        <form className="flex items-end gap-2" onSubmit={handleSubmit}>
          <Textarea
            className="min-h-[40px] w-full resize-none bg-muted/50 p-3 shadow-none focus-visible:ring-0"
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder="Describe the infographic..."
            value={input}
          />
          <Button
            className="mb-0.5 shrink-0"
            disabled={isLoading || !input.trim()}
            size="icon"
            type="submit"
          >
            <Send className="size-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
