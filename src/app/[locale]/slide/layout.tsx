import { Github } from 'lucide-react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LanguageSwitcher } from '@/components/language-switcher'
import { SlideSidebar } from '@/components/slide/sidebar/app-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { UserButton } from '@/components/user-button'
import { getSession } from '@/lib/auth'

export default async function SlideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session?.user) {
    redirect('/login')
  }

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SlideSidebar />
      <SidebarInset className="flex h-screen flex-col">
        <header className="sticky top-0 z-5 flex h-12 shrink-0 items-center justify-between bg-background/80 px-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex items-center gap-2">
            {/* <Button
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
            </Button> */}

            <LanguageSwitcher />
            <ThemeToggle />
            <Button
              nativeButton={false}
              render={
                <a
                  aria-label="GitHub"
                  href="https://github.com/tuntun0609/infographic-ai"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Github className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">GitHub</span>
                </a>
              }
              size="icon"
              variant="ghost"
            />
            {/* <div className="flex items-center gap-2 rounded-full border bg-background px-2.5 py-1 shadow-sm">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                <Coins className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-semibold text-sm">5.00</span>
            </div> */}
            <UserButton className="ml-1" showName={false} />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
