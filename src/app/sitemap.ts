import { eq } from 'drizzle-orm'
import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { db } from '@/db'
import { slide } from '@/db/schema'
import { routing } from '@/i18n/routing'

// 用于移除 URL 尾部斜杠的正则表达式
const trailingSlashRegex = /\/$/

// 构建多语言 URL 的辅助函数
function buildAlternateUrls(
  baseUrl: string,
  route: string,
  slideId?: string
): Record<string, string> {
  const alternates: Record<string, string> = {}

  for (const locale of routing.locales) {
    const path = slideId ? `/preview/${slideId}` : route

    // 根据 localePrefix 配置决定是否包含语言前缀
    if (
      locale === routing.defaultLocale &&
      routing.localePrefix === 'as-needed'
    ) {
      alternates[locale] = `${baseUrl}${path}`
    } else {
      alternates[locale] = `${baseUrl}/${locale}${path}`
    }
  }

  return alternates
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 优先使用环境变量中的基础 URL，如果没有则从请求头获取
  let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL

  if (!baseUrl) {
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    baseUrl = `${protocol}://${host}`
  }

  // 确保 baseUrl 没有尾部斜杠
  baseUrl = baseUrl.replace(trailingSlashRegex, '')

  // 获取所有已发布的幻灯片
  const publishedSlides = await db
    .select({
      id: slide.id,
      updatedAt: slide.updatedAt,
    })
    .from(slide)
    .where(eq(slide.published, true))

  // 静态页面路由（使用默认语言的路径）
  const staticRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const }, // 首页
  ]

  // 构建 sitemap 条目
  const sitemapEntries: MetadataRoute.Sitemap = []

  // 为静态路由生成条目（每个路由只生成一个条目，使用 alternates 指定多语言版本）
  for (const route of staticRoutes) {
    const defaultPath =
      routing.localePrefix === 'as-needed'
        ? route.path
        : `/${routing.defaultLocale}${route.path}`

    sitemapEntries.push({
      url: `${baseUrl}${defaultPath}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: buildAlternateUrls(baseUrl, route.path),
      },
    })
  }

  // 为每个已发布的幻灯片生成条目
  for (const slideItem of publishedSlides) {
    const defaultPath =
      routing.localePrefix === 'as-needed'
        ? `/preview/${slideItem.id}`
        : `/${routing.defaultLocale}/preview/${slideItem.id}`

    sitemapEntries.push({
      url: `${baseUrl}${defaultPath}`,
      lastModified: slideItem.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
      alternates: {
        languages: buildAlternateUrls(baseUrl, '', slideItem.id),
      },
    })
  }

  return sitemapEntries
}
