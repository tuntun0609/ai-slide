import type { I18nConfig } from 'fumadocs-core/i18n'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'zh'], // 支持的语言
  defaultLocale: 'en', // 默认语言
  localePrefix: 'as-needed',
  // 启用 locale cookie 来存储用户语言偏好
  localeCookie: true,
  localeDetection: false,
})

export const i18nDocsConfig: I18nConfig = {
  languages: routing.locales as unknown as string[],
  defaultLanguage: routing.defaultLocale,
  hideLocale: 'default-locale',
}
