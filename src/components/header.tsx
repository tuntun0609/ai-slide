'use client'
import { Github, Loader2, Menu, User, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Logo } from '@/components/logo'
import { Button, buttonVariants } from '@/components/ui/button'
import { UserButton } from '@/components/user-button'
import { Link } from '@/i18n/navigation'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'

// Menu items will be generated using translations

const UserButtonContent = ({
  session,
  isIconOnly,
}: {
  session: any
  isIconOnly: boolean
}) => {
  const avatarIcon = session?.user?.image ? (
    <img
      alt={session.user.name || 'User'}
      className="size-6 rounded-full"
      height={24}
      src={session.user.image}
      width={24}
    />
  ) : (
    <User className="size-5" />
  )

  if (isIconOnly) {
    return avatarIcon
  }

  return (
    <>
      {avatarIcon}
      <span className="max-w-[100px] truncate">
        {session?.user?.name || session?.user?.email}
      </span>
    </>
  )
}

export const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const t = useTranslations('header')
  const { data: session, isPending } = authClient.useSession()

  // Generate menu items using translations
  const menuItems = [
    { name: t('home'), href: '/' },
    { name: t('workspace'), href: '/slide' },
    { name: t('showcase'), href: '#showcase' },
    { name: t('price'), href: '#pricing' },
  ]

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const renderUserButton = () => {
    return (
      <UserButton
        trigger={
          <button
            className={cn(
              buttonVariants({ variant: 'outline', size: 'default' }),
              isScrolled ? 'lg:hidden' : 'lg:inline-flex',
              'gap-2'
            )}
            type="button"
          >
            <UserButtonContent isIconOnly={false} session={session} />
          </button>
        }
      />
    )
  }

  const renderScrolledUserButton = () => {
    if (!isScrolled) {
      return null
    }
    return (
      <UserButton
        className="hidden lg:inline-flex"
        trigger={
          <button
            className={cn(
              buttonVariants({ variant: 'outline', size: 'default' }),
              'hidden lg:inline-flex'
            )}
            type="button"
          >
            <UserButtonContent isIconOnly={true} session={session} />
          </button>
        }
      />
    )
  }

  const renderAuthButtons = () => {
    if (isPending) {
      return (
        <Button
          className={cn(isScrolled && 'lg:hidden')}
          disabled
          size="sm"
          variant="outline"
        >
          <Loader2 className="mr-2 size-4 animate-spin" />
          <span>{t('loading')}</span>
        </Button>
      )
    }

    if (session?.user) {
      return (
        <>
          {renderUserButton()}
          {renderScrolledUserButton()}
        </>
      )
    }

    return (
      <>
        <Button
          className={cn(isScrolled && 'lg:hidden')}
          nativeButton={false}
          render={<Link href="/login" />}
          size="sm"
          variant="outline"
        >
          <span>{t('login')}</span>
        </Button>
        <Button
          className={cn(isScrolled && 'lg:hidden')}
          nativeButton={false}
          render={<Link href="/login" />}
          size="sm"
        >
          <span>{t('signUp')}</span>
        </Button>
        <Button
          className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}
          nativeButton={false}
          render={<Link href="/login" />}
          size="sm"
        >
          <span>{t('getStarted')}</span>
        </Button>
      </>
    )
  }

  return (
    <header>
      <nav
        className="fixed z-20 w-full px-2"
        data-state={menuState && 'active'}
      >
        <div
          className={cn(
            'mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12',
            isScrolled &&
              'max-w-4xl rounded-2xl border bg-background/80 shadow-lg backdrop-blur-xl lg:px-5'
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                aria-label="home"
                className="flex items-center space-x-2 transition-opacity duration-200 hover:opacity-80"
                href="/"
              >
                <Logo />
              </Link>

              <button
                aria-label={menuState === true ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
                onClick={() => setMenuState(!menuState)}
                type="button"
              >
                <Menu className="m-auto size-6 in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 duration-200" />
                <X className="absolute inset-0 m-auto size-6 -rotate-180 in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 scale-0 in-data-[state=active]:opacity-100 opacity-0 duration-200" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      className="block text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      href={item.href}
                      onClick={() => {
                        // Close mobile menu if open
                        if (menuState) {
                          setMenuState(false)
                        }
                      }}
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6 in-data-[state=active]:block hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border bg-background p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:in-data-[state=active]:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        className="block text-muted-foreground transition-colors duration-200 hover:text-foreground"
                        href={item.href}
                        onClick={() => setMenuState(false)}
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <div className="flex items-center gap-1">
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
                </div>
                {renderAuthButtons()}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
