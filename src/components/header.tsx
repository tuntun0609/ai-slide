'use client'
import { Loader2, Menu, User, X } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import React from 'react'
import { Logo } from '@/components/logo'
import { Button, buttonVariants } from '@/components/ui/button'
import { UserButton } from '@/components/user-button'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

const menuItems = [
  { name: 'Features', href: '#link' },
  { name: 'Solution', href: '#link' },
  { name: 'Pricing', href: '#link' },
  { name: 'About', href: '#link' },
]

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
              'max-w-4xl rounded-2xl border bg-background/50 backdrop-blur-lg lg:px-5'
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                aria-label="home"
                className="flex items-center space-x-2"
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
                      className="block text-muted-foreground duration-150 hover:text-accent-foreground"
                      href={item.href}
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
                        className="block text-muted-foreground duration-150 hover:text-accent-foreground"
                        href={item.href}
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                {renderAuthButtons()}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
