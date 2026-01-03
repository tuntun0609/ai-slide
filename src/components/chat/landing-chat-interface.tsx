'use client'

import {
  ArrowUp,
  Figma,
  ImageIcon,
  Layout,
  Loader2,
  Plus,
  Settings2,
  Upload,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from '@/i18n/navigation'

export function LandingChatInterface() {
  const [input, setInput] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmedInput = input.trim()
    if (!trimmedInput || isCreating) {
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      // 创建新的 chat，并传递初始消息
      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initialMessage: trimmedInput,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || '创建对话失败，请稍后重试')
      }

      const { chatId } = await response.json()
      // 清空输入框
      setInput('')
      // 跳转到新创建的 chat 页面，AI 会自动回复
      router.push(`/chat/${chatId}`)
    } catch (error) {
      console.error('Failed to create chat:', error)
      setError(
        error instanceof Error ? error.message : '创建对话失败，请稍后重试'
      )
      setIsCreating(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-4 py-20">
      <h1 className="mb-10 font-semibold text-4xl text-foreground tracking-tight">
        What do you want to create?
      </h1>

      <div className="relative w-full">
        <form
          className="relative flex w-full flex-col rounded-2xl border bg-background shadow-sm transition-all focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20"
          onSubmit={handleSubmit}
        >
          <Textarea
            className="min-h-[140px] w-full resize-none border-0 bg-transparent p-4 pb-14 text-lg shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0 disabled:opacity-50"
            disabled={isCreating}
            onChange={(e) => {
              setInput(e.target.value)
              setError(null) // 清除错误提示
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isCreating) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder="Ask AI to build..."
            value={input}
          />

          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <Button
              className="h-8 w-8 rounded-lg hover:bg-muted"
              size="icon"
              type="button"
              variant="ghost"
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button
              className="h-8 w-8 rounded-lg hover:bg-muted"
              size="icon"
              type="button"
              variant="ghost"
            >
              <Settings2 className="h-5 w-5 text-muted-foreground" />
            </Button>
            <div className="ml-1 flex cursor-pointer items-center gap-1.5 rounded-lg bg-muted px-2 py-1 transition-colors hover:bg-muted/80">
              <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-foreground">
                <span className="font-bold text-[10px] text-background leading-none">
                  v
                </span>
              </div>
              <span className="font-medium text-xs">v0 Pro</span>
              <svg
                className="ml-0.5 text-muted-foreground/60"
                fill="none"
                height="6"
                viewBox="0 0 10 6"
                width="10"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Chevron Down</title>
                <path
                  d="M1 1L5 5L9 1"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>

          <div className="absolute right-3 bottom-3">
            <Button
              className="h-9 w-9 rounded-xl bg-foreground text-background shadow-sm hover:bg-foreground/90"
              disabled={!input.trim() || isCreating}
              size="icon"
              type="submit"
            >
              {isCreating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
        {error && (
          <div className="mt-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-destructive text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          className="gap-2 rounded-full border-muted font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          size="sm"
          variant="outline"
        >
          <ImageIcon className="h-4 w-4" />
          Clone a Screenshot
        </Button>
        <Button
          className="gap-2 rounded-full border-muted font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          size="sm"
          variant="outline"
        >
          <Figma className="h-4 w-4" />
          Import from Figma
        </Button>
        <Button
          className="gap-2 rounded-full border-muted font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          size="sm"
          variant="outline"
        >
          <Upload className="h-4 w-4" />
          Upload a Project
        </Button>
        <Button
          className="gap-2 rounded-full border-muted font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          size="sm"
          variant="outline"
        >
          <Layout className="h-4 w-4" />
          Landing Page
        </Button>
      </div>
    </div>
  )
}
