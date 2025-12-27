'use client'

import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function ChatInterface() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Placeholder for messages */}
        <div className="flex flex-col gap-4">
          <div className="self-start rounded-lg bg-muted px-4 py-2 text-sm">
            Hello! Describe the infographic you want to create.
          </div>
        </div>
      </div>
      <div className="border-t p-4">
        <div className="flex items-end gap-2">
          <Textarea
            className="min-h-[40px] w-full resize-none bg-muted/50 p-3 shadow-none focus-visible:ring-0"
            placeholder="Describe the infographic..."
          />
          <Button className="mb-0.5 shrink-0" size="icon">
            <Send className="size-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
