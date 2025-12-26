import { type ClassValue, clsx } from 'clsx'
import type { NextConfig } from 'next'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 整合多个中间件的函数
 * @param config 原始配置
 * @param middlewares 中间件数组
 * @returns 整合后的配置
 */
export const withMiddlewares = (
  config: NextConfig,
  middlewares: Array<(nextConfig?: NextConfig) => NextConfig>
) => middlewares.reduce((acc, middleware) => middleware(acc), config)
