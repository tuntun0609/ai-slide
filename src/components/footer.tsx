'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LogoIcon } from './logo'

export function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-start gap-8 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Link className="flex items-center gap-2" href="/">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <LogoIcon className="size-4 text-white" uniColor />
              </div>
              <span className="font-bold text-lg">InfographicAI</span>
            </Link>
            <p className="max-w-xs text-center text-muted-foreground text-sm leading-relaxed md:text-left">
              {t('description')}
            </p>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap gap-12 text-sm md:gap-16">
            <div>
              <h4 className="font-semibold text-sm">{t('product.title')}</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    href="/"
                  >
                    {t('product.home')}
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    href="/slide"
                  >
                    {t('product.workspace')}
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    href="/slide/explore"
                  >
                    {t('product.explore')}
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    href="#features"
                  >
                    {t('product.features')}
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    href="#pricing"
                  >
                    {t('product.pricing')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm">{t('resources.title')}</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <a
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    href="https://infographic.antv.vision/learn/infographic-syntax"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t('resources.documentation')}
                  </a>
                </li>
                <li>
                  <a
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    href="https://infographic.antv.vision/gallery"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t('resources.examples')}
                  </a>
                </li>
                <li>
                  <a
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    href="https://infographic.antv.vision/icon"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t('resources.icons')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} InfographicAI. {t('copyright')}
        </div>
      </div>
    </footer>
  )
}
