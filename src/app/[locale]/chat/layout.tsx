import { Coins, Gift } from 'lucide-react'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/chat/app-sidebar'
import { Button } from '@/components/ui/button'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { UserButton } from '@/components/user-button'
import { getSession } from '@/lib/auth'

export default async function CreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex items-center gap-1 sm:gap-4">
            <Button
              className="hidden font-medium text-muted-foreground md:flex"
              size="sm"
              variant="ghost"
            >
              Upgrade
            </Button>
            <Button
              className="hidden font-medium text-muted-foreground md:flex"
              size="sm"
              variant="ghost"
            >
              Feedback
            </Button>
            <Button
              className="hidden gap-2 font-medium text-muted-foreground md:flex"
              size="sm"
              variant="ghost"
            >
              <Gift className="h-4 w-4" /> Refer
            </Button>
            <div className="flex items-center gap-2 rounded-full border bg-background px-2.5 py-1 shadow-sm">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                <Coins className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-semibold text-sm">5.00</span>
            </div>
            <UserButton className="ml-1" showName={false} />
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
