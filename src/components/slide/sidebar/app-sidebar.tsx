import { Compass, FolderRoot, Search } from 'lucide-react'
import type * as React from 'react'
import { LogoIcon } from '@/components/logo'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Link } from '@/i18n/navigation'
import { NewSlideButton } from './new-slide-button'

export function SlideSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="px-2 pt-4">
        <Link href="/slide">
          <div className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent">
            <LogoIcon className="size-8" />
            <span className="font-bold text-lg tracking-tight">
              InfographicAI
            </span>
          </div>
        </Link>

        <div className="mt-4 px-2">
          <NewSlideButton />
        </div>
      </SidebarHeader>

      <SidebarContent className="mt-2 px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* <SidebarMenuItem>
                <SidebarMenuButton className="py-2.5">
                  <Search className="size-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Search</span>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
              <SidebarMenuItem>
                <Link href="/slide">
                  <SidebarMenuButton className="py-2.5">
                    <FolderRoot className="size-4 text-muted-foreground" />
                    <span className="font-medium text-sm">My Slides</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              {/* <SidebarMenuItem>
                <SidebarMenuButton className="py-2.5">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Recent Slides</span>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
              <SidebarMenuItem>
                <Link href="/slide/explore">
                  <SidebarMenuButton className="py-2.5">
                    <Compass className="size-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Explore More</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/slide/icons">
                  <SidebarMenuButton className="py-2.5">
                    <Search className="size-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Icons</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="group/label mb-1 flex cursor-pointer items-center justify-between px-2 transition-colors hover:text-foreground">
            <span className="font-semibold text-muted-foreground/70 text-xs uppercase tracking-wider">
              Favorites
            </span>
            <ChevronRight className="size-3 text-muted-foreground transition-transform group-hover/label:translate-x-0.5" />
          </SidebarGroupLabel>
        </SidebarGroup> */}

        {/* <Suspense fallback={<RecentChatsSkeleton />}>
          <RecentChats />
        </Suspense> */}
      </SidebarContent>

      {/* <SidebarFooter className="mt-auto p-4">
        <div className="group relative overflow-hidden rounded-2xl border border-muted-foreground/10 bg-muted/40 p-4">
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[13px]">New Feature</span>
              <button
                className="text-muted-foreground transition-colors hover:text-foreground"
                type="button"
              >
                <Plus className="size-3 rotate-45" />
              </button>
            </div>
            <p className="text-[12px] text-muted-foreground leading-snug">
              v0 can now ask clarifying questions before it starts generating
            </p>
          </div>
          <div className="absolute top-0 left-0 h-full w-1 bg-primary/20" />
        </div>
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  )
}
