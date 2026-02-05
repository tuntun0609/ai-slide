import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Explore More',
  description: 'Explore more features coming soon.',
}

export default async function ExplorePage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 font-bold text-4xl">Coming Soon</h1>
        <p className="text-lg text-muted-foreground">
          We're working on something exciting. Stay tuned!
        </p>
      </div>
    </div>
  )
}
