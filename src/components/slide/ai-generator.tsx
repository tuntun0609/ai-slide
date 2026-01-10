'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useAtom, useAtomValue } from 'jotai'
import { ArrowUp, Loader2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  selectedInfographicIdAtom,
  updateInfographicContentAtom,
} from '@/store/slide-store'

interface AIGeneratorProps {
  slideId: string
}

// 从 AI 响应中提取 infographic 语法
function extractInfographicSyntax(text: string): string | null {
  // 查找 ```plain 代码块中的内容
  const plainBlockRegex = /```plain\s*([\s\S]*?)```/
  const match = text.match(plainBlockRegex)
  if (match && match[1]) {
    return match[1].trim()
  }

  // 如果没有找到 plain 代码块，尝试查找其他代码块
  const codeBlockRegex = /```[\w]*\s*([\s\S]*?)```/
  const codeMatch = text.match(codeBlockRegex)
  if (codeMatch && codeMatch[1]) {
    return codeMatch[1].trim()
  }

  // 如果都没有，检查是否直接是 infographic 语法（以 infographic 开头）
  if (text.trim().startsWith('infographic')) {
    return text.trim()
  }

  return null
}

export function AIGenerator({ slideId }: AIGeneratorProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const selectedId = useAtomValue(selectedInfographicIdAtom)
  const [, updateInfographicContent] = useAtom(updateInfographicContentAtom)
  const hasProcessedRef = useRef(false)

  // 创建一个临时的 chatId 用于 AI 生成，只在组件挂载时创建一次
  const tempChatId = useMemo(() => `temp-${slideId}-${Date.now()}`, [slideId])

  const { messages, append, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        chatId: tempChatId,
      },
    }),
    id: tempChatId,
    onFinish: (message) => {
      // 当 AI 回复完成时，提取 infographic 语法并应用
      if (message.role === 'assistant' && selectedId) {
        const textContent = message.content
        const syntax = extractInfographicSyntax(textContent)

        if (syntax) {
          updateInfographicContent({
            infographicId: selectedId,
            content: syntax,
          })
          setInput('')
          setError(null)
        } else {
          setError('未能从 AI 响应中提取到有效的信息图语法')
        }
      }
      hasProcessedRef.current = false
    },
    onError: (error) => {
      setError(error.message || '生成失败，请稍后重试')
      hasProcessedRef.current = false
    },
  })

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmedInput = input.trim()
    if (!trimmedInput || status === 'streaming' || !selectedId) {
      if (!selectedId) {
        setError('请先选择一个信息图')
      }
      return
    }

    setError(null)
    hasProcessedRef.current = true

    try {
      await append({
        role: 'user',
        content: trimmedInput,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请稍后重试')
      hasProcessedRef.current = false
    }
  }

  const isLoading = status === 'streaming' || hasProcessedRef.current

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold text-sm">AI 生成信息图</h3>
            <p className="text-muted-foreground text-sm">
              描述你想要生成的信息图内容，AI 会自动生成对应的 AntV Infographic
              语法
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-destructive text-sm">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI 正在生成中...</span>
            </div>
          )}

          {messages.length > 0 && (
            <div className="space-y-2">
              {messages.map((message) => {
                if (message.role === 'assistant') {
                  const syntax = extractInfographicSyntax(message.content)
                  return (
                    <div
                      className="rounded-lg border bg-muted/50 p-3 text-sm"
                      key={message.id}
                    >
                      <div className="mb-2 font-medium text-muted-foreground text-xs">
                        AI 生成的内容：
                      </div>
                      {syntax ? (
                        <pre className="overflow-x-auto whitespace-pre-wrap text-xs">
                          {syntax}
                        </pre>
                      ) : (
                        <div className="text-muted-foreground text-xs">
                          {message.content}
                        </div>
                      )}
                    </div>
                  )
                }
                return null
              })}
            </div>
          )}
        </div>
      </div>

      <div className="border-t p-4">
        <form
          className="relative flex w-full flex-col rounded-lg border bg-background transition-all focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20"
          onSubmit={handleSubmit}
        >
          <Textarea
            className="min-h-[100px] w-full resize-none border-0 bg-transparent p-3 pb-12 text-sm shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0 disabled:opacity-50"
            disabled={isLoading || !selectedId}
            onChange={(e) => {
              setInput(e.target.value)
              setError(null)
            }}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                !isLoading &&
                selectedId
              ) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder={
              selectedId
                ? '描述你想要生成的信息图内容...'
                : '请先选择一个信息图'
            }
            value={input}
          />

          <div className="absolute right-3 bottom-3">
            <Button
              className="h-8 w-8 rounded-lg bg-foreground text-background shadow-sm hover:bg-foreground/90"
              disabled={!input.trim() || isLoading || !selectedId}
              size="icon"
              type="submit"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
