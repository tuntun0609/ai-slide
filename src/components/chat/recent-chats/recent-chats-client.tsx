'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar'
import type { chat } from '@/db/schema'
import { cn } from '@/lib/utils'
import { RecentChatsContent } from './recent-chats-content'

type Chat = typeof chat.$inferSelect

interface RecentChatsClientProps {
  chats: Chat[]
}

export function RecentChatsClient({ chats }: RecentChatsClientProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <SidebarGroup className="mt-2">
      <SidebarGroupLabel
        className="group/label mb-1 flex cursor-pointer items-center justify-between px-2 transition-colors hover:text-foreground"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-semibold text-muted-foreground/70 text-xs uppercase tracking-wider">
          Recent Chats
        </span>
        <ChevronDown
          className={cn(
            'size-3 text-muted-foreground transition-transform duration-200',
            !isExpanded && '-rotate-90'
          )}
        />
      </SidebarGroupLabel>
      {isExpanded && <RecentChatsContent chats={chats} />}
    </SidebarGroup>
  )
}
