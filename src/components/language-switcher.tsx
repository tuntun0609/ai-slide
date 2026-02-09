'use client'

import { Languages } from 'lucide-react'
import { type Locale, useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePathname, useRouter } from '@/i18n/navigation'

const languages = [
  { code: 'en', labelKey: 'english' },
  { code: 'zh', labelKey: 'chinese' },
] as const

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('languageSwitcher')

  const handleLanguageChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="icon" variant="ghost" />}>
        <Languages className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">{t('toggleLanguage')}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            className={locale === lang.code ? 'bg-accent' : ''}
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
          >
            {t(lang.labelKey)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
