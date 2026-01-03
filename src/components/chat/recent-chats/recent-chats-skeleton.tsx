import {
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

export function RecentChatsSkeleton() {
  return (
    <SidebarGroupContent>
      <SidebarMenu>
        {Array.from({ length: 5 }).map((_, index) => (
          <SidebarMenuItem key={index}>
            <div className="h-auto overflow-hidden px-2 py-2.5">
              <Skeleton className="h-4 w-full max-w-[80%]" />
            </div>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  )
}
