import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { admin } from 'better-auth/plugins'
import { headers } from 'next/headers'
import { cache } from 'react'
import { db } from '@/db'
import * as schema from '@/db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ...schema,
      user: schema.user,
    },
  }),
  trustedOrigins: [process.env.VERCEL_URL!].filter(Boolean),
  plugins: [
    nextCookies(),
    admin(),
    // oAuthProxy({
    //   productionURL: 'https://aislide.tuntun.site',
    //   currentURL: process.env.VERCEL_URL,
    // }),
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // redirectUri: 'https://aislide.tuntun.site/api/auth/callback/google',
    },
  },
})

/**
 * Get the current session
 *
 * NOTICE: do not call it from middleware
 */
export const getSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return session
})
