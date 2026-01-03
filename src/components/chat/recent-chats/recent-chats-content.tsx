'use client'

import {
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import type { chat } from '@/db/schema'
import { Link, usePathname } from '@/i18n/navigation'

type Chat = typeof chat.$inferSelect

interface RecentChatsContentProps {
  chats: Chat[]
}

// 从路径中提取 chat ID 的正则表达式，路径格式为 /chat/[id]
const CHAT_ID_REGEX = /^\/chat\/([^/]+)$/

export function RecentChatsContent({ chats }: RecentChatsContentProps) {
  const pathname = usePathname()

  // 从路径中提取 chat ID
  const currentChatId = pathname?.match(CHAT_ID_REGEX)?.[1]

  if (chats.length === 0) {
    return null
  }

  return (
    <SidebarGroupContent>
      <SidebarMenu>
        {chats.map((chatItem) => {
          const isActive = currentChatId === chatItem.id
          return (
            <SidebarMenuItem key={chatItem.id}>
              <SidebarMenuButton
                className="h-auto overflow-hidden py-2.5"
                isActive={isActive}
                render={<Link href={`/chat/${chatItem.id}`} />}
              >
                <span className="truncate font-medium text-[13px] text-muted-foreground/80 transition-colors hover:text-foreground">
                  {chatItem.title || 'Untitled Chat'}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroupContent>
  )
}
