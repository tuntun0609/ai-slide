'use client'

import { CheckIcon, CopyIcon, LoaderIcon, SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

async function searchIcons(text: string, topK = 20): Promise<string[]> {
  const params = new URLSearchParams({ text, topK: String(topK) })
  const res = await fetch(`https://www.weavefox.cn/api/open/v1/icon?${params}`)
  const json = await res.json()
  if (json.status && json.data?.success) {
    return json.data.data
  }
  return []
}

export default function IconsPage() {
  const t = useTranslations('icons')
  const [query, setQuery] = useState('')
  const [icons, setIcons] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setIcons([])
      return
    }

    setLoading(true)
    const timer = setTimeout(() => {
      searchIcons(query.trim())
        .then(setIcons)
        .catch(() => setIcons([]))
        .finally(() => setLoading(false))
    }, 400)

    return () => {
      clearTimeout(timer)
      setLoading(false)
    }
  }, [query])

  const handleCopy = useCallback(
    (url: string) => {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedUrl(url)
        toast.success(t('copied'))
        setTimeout(() => setCopiedUrl(null), 2000)
      })
    },
    [t]
  )

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <div>
        <h1 className="font-bold text-xl sm:text-2xl">{t('title')}</h1>
        <p className="mt-1 text-muted-foreground text-xs sm:text-sm">
          {t('description')}
        </p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9 text-sm sm:text-base"
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          value={query}
        />
      </div>

      <ScrollArea className="flex-1">
        {loading && (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <LoaderIcon className="size-5 animate-spin text-muted-foreground sm:size-6" />
          </div>
        )}

        {!(loading || query.trim()) && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground sm:py-20">
            <SearchIcon className="mb-2 size-8 opacity-30 sm:mb-3 sm:size-10" />
            <p className="text-xs sm:text-sm">{t('emptyHint')}</p>
          </div>
        )}

        {!loading && query.trim() && icons.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-xs sm:py-20 sm:text-sm">
            {t('noResults')}
          </div>
        )}

        {!loading && icons.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
            {icons.map((url) => (
              <button
                className="group relative flex flex-col items-center gap-1.5 rounded-lg border border-border p-2 transition-colors hover:bg-accent active:bg-accent sm:gap-2 sm:p-3"
                key={url}
                onClick={() => handleCopy(url)}
                type="button"
              >
                <img
                  alt=""
                  className="size-8 sm:size-10"
                  height={40}
                  loading="lazy"
                  src={url}
                  width={40}
                />
                <span className="absolute top-1 right-1 rounded-md bg-background/80 p-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100">
                  {copiedUrl === url ? (
                    <CheckIcon className="size-3 text-green-500" />
                  ) : (
                    <CopyIcon className="size-3 text-muted-foreground" />
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
