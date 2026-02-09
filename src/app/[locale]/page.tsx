import type { Metadata } from 'next'
import HeroSection from '@/components/hero-section'

export const metadata: Metadata = {
  title: 'InfographicAI - AI-Powered Slide Creation Tool',
  description:
    'InfographicAI - AI-powered slide creation tool that helps you quickly create beautiful infographics and presentations.',
}

export default function Home() {
  return (
    <div className="">
      <HeroSection />
    </div>
  )
}
