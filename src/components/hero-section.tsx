import { ArrowRight, ChevronRight } from 'lucide-react'
import type { Variants } from 'motion'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { Button } from '@/components/ui/button'
import { TextEffect } from '@/components/ui/text-effect'
import { HeroHeader } from './header'

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

export default function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
        >
          <div className="absolute top-0 left-0 h-320 w-140 -translate-y-87.5 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="absolute top-0 left-0 h-320 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="absolute top-0 left-0 h-320 w-60 -translate-y-87.5 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div>
        <section>
          <div className="relative pt-24 md:pt-36">
            <AnimatedGroup
              className="mask-b-from-35% mask-b-to-90% absolute inset-0 top-56 -z-20 lg:top-32"
              variants={{
                container: {
                  visible: {
                    transition: {
                      delayChildren: 1,
                    },
                  },
                },
                item: {
                  hidden: {
                    opacity: 0,
                    y: 20,
                  },
                  visible: {
                    opacity: 1,
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
              <Image
                alt="background"
                className="hidden size-full dark:block"
                height="4095"
                src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120"
                width="3276"
              />
            </AnimatedGroup>

            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
            />

            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mt-0 lg:mr-auto">
                <AnimatedGroup variants={transitionVariants as Variants}>
                  <Link
                    className="group mx-auto flex w-fit items-center gap-4 rounded-full border bg-muted p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 hover:bg-background dark:border-t-white/5 dark:shadow-zinc-950 dark:hover:border-t-border"
                    href="/slide"
                  >
                    <span className="text-foreground text-sm">
                      AI 驱动的信息图创建工具
                    </span>
                    <span className="block h-4 w-0.5 border-l bg-white dark:border-background dark:bg-zinc-700" />

                    <div className="size-6 overflow-hidden rounded-full bg-background duration-500 group-hover:bg-muted">
                      <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </AnimatedGroup>

                <TextEffect
                  as="h1"
                  className="mx-auto mt-8 max-w-4xl text-balance text-5xl max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem]"
                  per="line"
                  preset="fade-in-blur"
                  speedSegment={0.3}
                >
                  {'用AI快速创建\n精美的信息图表'}
                </TextEffect>
                <TextEffect
                  as="p"
                  className="mx-auto mt-8 max-w-2xl text-balance text-lg"
                  delay={0.5}
                  per="line"
                  preset="fade-in-blur"
                  speedSegment={0.3}
                >
                  只需简单描述，AI 即可为您生成专业的信息图表和演示文稿。
                  支持列表、对比、SWOT、思维导图等多种模板，让创意表达更简单。
                </TextEffect>

                <AnimatedGroup
                  className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
                  variants={
                    {
                      container: {
                        visible: {
                          transition: {
                            staggerChildren: 0.05,
                            delayChildren: 0.75,
                          },
                        },
                      },
                      ...transitionVariants,
                    } as Variants
                  }
                >
                  <div
                    className="rounded-[calc(var(--radius-xl)+0.125rem)] border bg-foreground/10 p-0.5"
                    key={1}
                  >
                    <Button
                      className="rounded-xl px-5 text-base"
                      nativeButton={false}
                      render={<Link href="/slide" />}
                      size="lg"
                    >
                      <span className="text-nowrap">开始创建</span>
                    </Button>
                  </div>
                  <Button
                    className="h-10.5 rounded-xl px-5"
                    key={2}
                    nativeButton={false}
                    render={<Link href="/slide/explore" />}
                    size="lg"
                    variant="ghost"
                  >
                    <span className="text-nowrap">探索更多</span>
                  </Button>
                </AnimatedGroup>
              </div>
            </div>

            <AnimatedGroup
              variants={
                {
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.75,
                      },
                    },
                  },
                  ...transitionVariants,
                } as Variants
              }
            >
              <div className="mask-b-from-55% relative mt-8 -mr-56 overflow-hidden px-2 sm:mt-12 sm:mr-0 md:mt-20">
                <div className="relative inset-shadow-2xs mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-background p-4 shadow-lg shadow-zinc-950/15 ring-1 ring-background dark:inset-shadow-white/20">
                  <Image
                    alt="app screen"
                    className="relative hidden aspect-15/8 rounded-2xl bg-background dark:block"
                    height="1440"
                    src="/mail2.png"
                    width="2700"
                  />
                  <Image
                    alt="app screen"
                    className="relative z-2 aspect-15/8 rounded-2xl border border-border/25 dark:hidden"
                    height="1440"
                    src="/mail2-light.png"
                    width="2700"
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
        <section className="bg-background pt-16 pb-16 md:pb-32">
          <div className="group relative m-auto max-w-5xl px-6">
            <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
              <Link
                className="block text-sm duration-150 hover:opacity-75"
                href="/slide"
              >
                <span>开始使用 ASlide</span>

                <ChevronRight className="ml-1 inline-block size-3" />
              </Link>
            </div>
            <div className="mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 group-hover:blur-xs sm:gap-x-16 sm:gap-y-14">
              <div className="flex">
                <img
                  alt="Nvidia Logo"
                  className="mx-auto h-5 w-fit dark:invert"
                  height="20"
                  src="https://html.tailus.io/blocks/customers/nvidia.svg"
                  width="auto"
                />
              </div>

              <div className="flex">
                <img
                  alt="Column Logo"
                  className="mx-auto h-4 w-fit dark:invert"
                  height="16"
                  src="https://html.tailus.io/blocks/customers/column.svg"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  alt="GitHub Logo"
                  className="mx-auto h-4 w-fit dark:invert"
                  height="16"
                  src="https://html.tailus.io/blocks/customers/github.svg"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  alt="Nike Logo"
                  className="mx-auto h-5 w-fit dark:invert"
                  height="20"
                  src="https://html.tailus.io/blocks/customers/nike.svg"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  alt="Lemon Squeezy Logo"
                  className="mx-auto h-5 w-fit dark:invert"
                  height="20"
                  src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  alt="Laravel Logo"
                  className="mx-auto h-4 w-fit dark:invert"
                  height="16"
                  src="https://html.tailus.io/blocks/customers/laravel.svg"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  alt="Lilly Logo"
                  className="mx-auto h-7 w-fit dark:invert"
                  height="28"
                  src="https://html.tailus.io/blocks/customers/lilly.svg"
                  width="auto"
                />
              </div>

              <div className="flex">
                <img
                  alt="OpenAI Logo"
                  className="mx-auto h-6 w-fit dark:invert"
                  height="24"
                  src="https://html.tailus.io/blocks/customers/openai.svg"
                  width="auto"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
