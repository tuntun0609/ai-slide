import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

const middleware = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname

  // 跳过 API 路由的国际化处理
  if (pathname.startsWith('/api')) {
    return
  }

  // 跳过 sitemap 和 robots.txt 等 SEO 文件
  if (
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname.startsWith('/sitemap')
  ) {
    return
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Skip API routes from intl middleware but still run middleware for other processing
    '/(api|trpc)(.*)',
  ],
}

export default middleware
