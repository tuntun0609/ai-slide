import { Agentation } from 'agentation'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { Toaster } from '@/components/ui/sonner'
import { routing } from '@/i18n/routing'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'InfographicAI',
    template: '%s | InfographicAI',
  },
  description:
    'InfographicAI is an AI-powered slide creation tool that helps you quickly create beautiful infographics and presentations.',
  keywords: [
    'InfographicAI',
    'AI infographic',
    'presentation',
    'infographic',
    'slides',
    'AI tool',
  ],
  openGraph: {
    title: 'InfographicAI - AI-Powered Slide Creation Tool',
    description:
      'InfographicAI is an AI-powered slide creation tool that helps you quickly create beautiful infographics and presentations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InfographicAI - AI-Powered Slide Creation Tool',
    description:
      'InfographicAI is an AI-powered slide creation tool that helps you quickly create beautiful infographics and presentations.',
  },
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
          {process.env.NODE_ENV === 'development' && <Agentation />}
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
