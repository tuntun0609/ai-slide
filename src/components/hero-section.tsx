import {
  ArrowRight,
  BarChart3,
  Check,
  Eye,
  Palette,
  Play,
  Sparkles,
  Star,
  Wand2,
  Zap,
} from 'lucide-react'
import type { Variants } from 'motion'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { Button } from '@/components/ui/button'
import { AIPrinciplesShowcase } from './ai-principles-showcase'
import { Footer } from './footer'
import { HeroHeader } from './header'
import { HeroInfographicPreview } from './hero-infographic-preview'
import Pricing from './pricing'

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring',
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
}

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Generate professional infographics in seconds. From data to visual, instantly.',
  },
  {
    icon: Eye,
    title: 'Real-time Editing',
    description:
      'See changes instantly. Drag, resize, edit—zero delay, seamless workflow.',
  },
  {
    icon: Palette,
    title: 'Beautiful Design',
    description:
      'Auto-optimized colors, typography, and layouts. Publication-ready quality.',
  },
  {
    icon: Wand2,
    title: 'AI-Powered',
    description:
      'Smart suggestions for charts, layouts, and styles. Describe your vision in plain English.',
  },
]

const testimonials = [
  {
    quote:
      'This tool saved me hours on my last quarterly presentation. The AI understands context surrounding each.',
    name: 'Sarah Jenkins',
    title: 'Product Designer at Stripe',
    avatar: 'SJ',
  },
  {
    quote:
      'Finally, a design tool that actually helps me visualize complex data without needing a PhD in statistics.',
    name: 'Mike T.',
    title: 'Data Analyst at Google',
    avatar: 'MT',
  },
  {
    quote:
      'The drag and drop interface combined with AI suggestions makes this the fastest tool at my arsenal.',
    name: 'Elena Rodriguez',
    title: 'Marketing Dir.',
    avatar: 'ER',
  },
]

export default function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        {/* ===== Hero Section ===== */}
        <section className="relative pt-28 pb-20 md:pt-36 md:pb-28">
          {/* Background decoration */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute -top-40 -right-40 size-[600px] rounded-full bg-purple-100/50 blur-3xl dark:bg-purple-900/20" />
            <div className="absolute -bottom-40 -left-40 size-[400px] rounded-full bg-violet-100/30 blur-3xl dark:bg-violet-900/15" />
          </div>

          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left Content */}
              <div>
                <AnimatedGroup variants={transitionVariants as Variants}>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 font-medium text-primary text-sm">
                    <Sparkles className="size-4" />
                    <span>Start Creating Free</span>
                  </div>
                </AnimatedGroup>

                <AnimatedGroup
                  variants={
                    {
                      container: {
                        visible: {
                          transition: {
                            staggerChildren: 0.1,
                            delayChildren: 0.2,
                          },
                        },
                      },
                      ...transitionVariants,
                    } as Variants
                  }
                >
                  <h1 className="mt-8 font-bold text-5xl text-foreground tracking-tight md:text-6xl lg:text-7xl">
                    Design
                    <br />
                    Infographics
                    <br />
                    with{' '}
                    <span className="bg-linear-to-r from-purple-600 to-violet-400 bg-clip-text text-transparent dark:from-purple-400 dark:to-violet-300">
                      Intelligent AI
                    </span>
                  </h1>
                </AnimatedGroup>

                <AnimatedGroup
                  variants={
                    {
                      container: {
                        visible: {
                          transition: { delayChildren: 0.4 },
                        },
                      },
                      ...transitionVariants,
                    } as Variants
                  }
                >
                  <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
                    Transform raw data into stunning visual art instantly.
                    AI-powered infographic engine that gives you precise control
                    over every pixel.
                  </p>
                </AnimatedGroup>

                <AnimatedGroup
                  className="mt-10 flex flex-wrap items-center gap-4"
                  variants={
                    {
                      container: {
                        visible: {
                          transition: {
                            staggerChildren: 0.1,
                            delayChildren: 0.6,
                          },
                        },
                      },
                      ...transitionVariants,
                    } as Variants
                  }
                >
                  <Button
                    className="rounded-xl px-6 text-base"
                    key="cta-primary"
                    nativeButton={false}
                    render={<Link href="/slide" />}
                    size="lg"
                  >
                    <Sparkles className="mr-2 size-4" />
                    <span>Start Creating Free</span>
                  </Button>
                  <Button
                    className="rounded-xl px-6 text-base"
                    key="cta-demo"
                    nativeButton={false}
                    render={<Link href="/slide/explore" />}
                    size="lg"
                    variant="outline"
                  >
                    <Play className="mr-2 size-4" />
                    <span>View Demo</span>
                  </Button>
                </AnimatedGroup>

                {/* <AnimatedGroup
                  variants={
                    {
                      container: {
                        visible: {
                          transition: { delayChildren: 0.8 },
                        },
                      },
                      ...transitionVariants,
                    } as Variants
                  }
                >
                  <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm">
                    <span>Trusted by design teams at:</span>
                    <span className="font-semibold text-foreground">ACME</span>
                    <span className="font-semibold text-foreground">
                      GlobalTech
                    </span>
                    <span className="font-semibold text-foreground">
                      NexGen
                    </span>
                  </div>
                </AnimatedGroup> */}
              </div>

              {/* Right - Hero Visual */}
              <AnimatedGroup
                className="relative hidden lg:block"
                variants={{
                  container: {
                    visible: {
                      transition: { delayChildren: 0.5 },
                    },
                  },
                  item: {
                    hidden: { opacity: 0, scale: 0.95, y: 20 },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      transition: {
                        type: 'spring',
                        bounce: 0.3,
                        duration: 2,
                      },
                    },
                  },
                }}
              >
                <div className="relative h-[520px]">
                  {/* Dot pattern */}
                  <div
                    aria-hidden
                    className="absolute top-0 right-0 size-48 opacity-20"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle, rgb(139 92 246) 1.5px, transparent 1.5px)',
                      backgroundSize: '16px 16px',
                    }}
                  />

                  {/* Main infographic card */}
                  <div className="absolute top-12 right-4 bottom-12 left-8 flex flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
                    <div className="flex shrink-0 items-center gap-3 px-4 pt-4">
                      <div className="size-3 rounded-full bg-red-400" />
                      <div className="size-3 rounded-full bg-yellow-400" />
                      <div className="size-3 rounded-full bg-green-400" />
                      <div className="ml-auto h-3 w-24 rounded-full bg-muted" />
                    </div>
                    <div className="min-h-0 flex-1">
                      <HeroInfographicPreview />
                    </div>
                  </div>

                  {/* Stats floating card */}
                  <div className="absolute -top-2 right-0 z-10 rounded-xl border bg-background p-4 shadow-lg">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="size-4 text-primary" />
                      <span className="text-muted-foreground text-xs">
                        Total Views
                      </span>
                    </div>
                    <div className="mt-1 font-bold text-xl">1.2M Points</div>
                    <div className="mt-2 flex h-6 items-end gap-1">
                      {[40, 65, 45, 80, 60, 90, 70].map((h, i) => (
                        <div
                          className="w-2.5 rounded-t bg-primary/40"
                          key={i}
                          style={{ height: `${h * 0.24}px` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Generation Complete card */}
                  <div className="absolute -bottom-2 left-0 z-10 flex items-center gap-3 rounded-xl border bg-background p-3 pr-5 shadow-lg">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <Check className="size-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        Generation Complete
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Your infographic is ready
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedGroup>
            </div>
          </div>
        </section>

        {/* ===== Features Section ===== */}
        <section className="py-20 md:py-32" id="features">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <h2 className="font-bold text-3xl tracking-tight md:text-4xl">
                Powerful Features
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Fast, real-time, beautiful, and intelligent—everything you need
                to create stunning infographics.
              </p>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  className="group relative rounded-2xl border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  key={feature.title}
                >
                  <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                    <feature.icon className="size-7 text-primary" />
                  </div>
                  <h3 className="mt-6 font-semibold text-lg">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  {/* Decorative gradient on hover */}
                  <div className="absolute inset-0 -z-10 rounded-2xl bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Interactive Workspace Section ===== */}
        <section className="bg-muted/30 py-20 md:py-32" id="editor">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left Content */}
              <div>
                <h2 className="font-bold text-3xl tracking-tight md:text-4xl">
                  Powerful Slide Editor
                </h2>
                <p className="mt-2 text-lg text-muted-foreground italic">
                  Create stunning presentations with ease.
                </p>
                <p className="mt-6 text-muted-foreground leading-relaxed">
                  A feature-rich editor designed for creating professional
                  presentations. Combine AI-powered content generation with
                  intuitive editing tools to bring your ideas to life.
                </p>
                <div className="mt-8 space-y-5">
                  <div className="flex gap-4">
                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <Check className="size-3.5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-semibold">AI-Powered Content</div>
                      <div className="mt-0.5 text-muted-foreground text-sm">
                        Generate slide content, outlines, and layouts
                        automatically with AI assistance.
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <Check className="size-3.5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-semibold">Rich Editing Tools</div>
                      <div className="mt-0.5 text-muted-foreground text-sm">
                        Customize text, images, and layouts with an intuitive
                        drag-and-drop interface.
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <Check className="size-3.5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-semibold">Export Anywhere</div>
                      <div className="mt-0.5 text-muted-foreground text-sm">
                        Export your presentations to PPT, PDF, or share them
                        directly with a link.
                      </div>
                    </div>
                  </div>
                </div>
                <Link
                  className="mt-8 inline-flex items-center gap-1 font-medium text-primary text-sm hover:underline"
                  href="/slide"
                >
                  Try the Editor
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              {/* Right - Screenshot */}
              <div className="relative">
                <div className="overflow-hidden rounded-2xl border bg-background shadow-2xl">
                  <Image
                    alt="Slide Editor"
                    className="w-full"
                    height={900}
                    src="/editor-snapshot.png"
                    width={1600}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== AI Principles Showcase Section ===== */}
        <section className="py-14 md:py-18" id="ai-principles">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <h2 className="font-bold text-3xl tracking-tight md:text-4xl">
                Showcase
              </h2>
            </div>
            <div className="mt-12">
              <AIPrinciplesShowcase />
            </div>
          </div>
        </section>

        {/* ===== Testimonials Section ===== */}
        <section className="py-14 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-bold text-3xl tracking-tight md:text-4xl">
                  Loved by Creators
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Join thousands of designers streamlining their workflow.
                </p>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <button
                  className="flex size-10 items-center justify-center rounded-full border transition-colors hover:bg-muted"
                  type="button"
                >
                  <ArrowRight className="size-4 rotate-180" />
                </button>
                <button
                  className="flex size-10 items-center justify-center rounded-full border transition-colors hover:bg-muted"
                  type="button"
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div
                  className="rounded-2xl border bg-card p-6"
                  key={testimonial.name}
                >
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        className="size-4 fill-amber-400 text-amber-400"
                        key={i}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t pt-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        {testimonial.name}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {testimonial.title}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Pricing />

        {/* ===== CTA Section ===== */}
        <section className="px-6 pb-20 md:pb-32">
          <div className="mx-auto max-w-4xl rounded-3xl bg-linear-to-br from-primary/5 via-purple-50 to-violet-50 px-8 py-16 text-center md:px-16 dark:from-primary/10 dark:via-purple-950/20 dark:to-violet-950/20">
            <h2 className="font-bold text-3xl tracking-tight md:text-4xl">
              Ready to visualize your data?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join over 1000+ users creating professional infographics in
              minutes, not hours.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                className="rounded-xl px-6"
                nativeButton={false}
                render={<Link href="/slide" />}
                size="lg"
              >
                Get Started for Free
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}
