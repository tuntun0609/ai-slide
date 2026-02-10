import type { Metadata } from 'next'
import HeroSection from '@/components/hero-section'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const locale = (await params).locale

  return {
    title:
      locale === 'zh'
        ? 'InfographicAI - AI 驱动的幻灯片创建工具'
        : 'InfographicAI - AI-Powered Slide Creation Tool',
    description:
      locale === 'zh'
        ? 'InfographicAI - AI 驱动的幻灯片创建工具，帮助您快速创建精美的信息图和演示文稿。'
        : 'InfographicAI - AI-powered slide creation tool that helps you quickly create beautiful infographics and presentations.',
    openGraph: {
      title:
        locale === 'zh'
          ? 'InfographicAI - AI 驱动的幻灯片创建工具'
          : 'InfographicAI - AI-Powered Slide Creation Tool',
      description:
        locale === 'zh'
          ? 'InfographicAI - AI 驱动的幻灯片创建工具，帮助您快速创建精美的信息图和演示文稿。'
          : 'InfographicAI - AI-powered slide creation tool that helps you quickly create beautiful infographics and presentations.',
    },
    twitter: {
      title:
        locale === 'zh'
          ? 'InfographicAI - AI 驱动的幻灯片创建工具'
          : 'InfographicAI - AI-Powered Slide Creation Tool',
      description:
        locale === 'zh'
          ? 'InfographicAI - AI 驱动的幻灯片创建工具，帮助您快速创建精美的信息图和演示文稿。'
          : 'InfographicAI - AI-powered slide creation tool that helps you quickly create beautiful infographics and presentations.',
    },
  }
}

export default function Home() {
  return (
    <div className="">
      <HeroSection />
    </div>
  )
}
