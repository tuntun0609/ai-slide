import type { Metadata } from 'next'
import HeroSection from '@/components/hero-section'

export const metadata: Metadata = {
  title: 'InfographAI - AI-Powered Slide Creation Tool',
  description:
    'InfographAI - AI-powered slide creation tool that helps you quickly create beautiful infographics and presentations.',
}

export default function Home() {
  return (
    <div className="">
      <HeroSection />
    </div>
  )
}
