import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

// 用于移除 URL 尾部斜杠的正则表达式
const trailingSlashRegex = /\/$/

export default async function robots(): Promise<MetadataRoute.Robots> {
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

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/slide/', // 需要登录的页面
          '/login/',
          '/_next/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
