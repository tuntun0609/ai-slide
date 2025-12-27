'use client'

import { Loader2, LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

interface UserButtonProps {
  className?: string
  showName?: boolean
  trigger?: React.ReactElement
}

export const UserButton = ({
  className,
  showName = true,
  trigger,
}: UserButtonProps) => {
  const router = useRouter()
  const t = useTranslations('header')
  const { data: session, isPending } = authClient.useSession()

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.refresh()
        },
      },
    })
  }

  if (isPending) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const avatarIcon = session.user.image ? (
    <img
      alt={session.user.name || 'User'}
      className="size-full object-cover"
      height={32}
      src={session.user.image}
      width={32}
    />
  ) : (
    <User className="size-5" />
  )

  const defaultTrigger = (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border bg-muted transition-opacity hover:opacity-80">
        {avatarIcon}
      </div>
      {showName && (
        <span className="max-w-[100px] truncate font-medium text-sm">
          {session.user.name || session.user.email}
        </span>
      )}
    </div>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn('outline-none', className)}
        render={trigger}
      >
        {trigger ? undefined : defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="font-medium text-sm">
                {session.user.name || 'User'}
              </p>
              <p className="text-muted-foreground text-xs">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 size-4" />
            <span>{t('signOut')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
