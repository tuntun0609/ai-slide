import { Clock, FileText, FolderRoot, Search } from 'lucide-react'
import type * as React from 'react'
import { LogoIcon } from '@/components/logo'
import { buttonVariants } from '@/components/ui/button'
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
import { cn } from '@/lib/utils'

export function SlideSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="px-2 pt-4">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-foreground text-background">
            <LogoIcon className="size-5" uniColor />
          </div>
          <span className="font-bold text-lg tracking-tight">AI Slide</span>
        </div>

        <div className="mt-4 px-2">
          <Link
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-10 w-full justify-center gap-2 rounded-xl border bg-background font-medium text-foreground shadow-sm hover:bg-muted'
            )}
            href="/slide"
          >
            New Slide
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="mt-2 px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="py-2.5">
                  <Search className="size-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Search</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="py-2.5">
                  <FolderRoot className="size-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Slides</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="py-2.5">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Recent Slides</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="py-2.5">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Find More</span>
                </SidebarMenuButton>
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
