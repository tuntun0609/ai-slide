'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChatMessage } from '@/app/api/chat/route'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { Loader } from '@/components/ai-elements/loader'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  selectedInfographicIdAtom,
  updateInfographicContentAtom,
} from '@/store/slide-store'

interface AIGeneratorProps {
  slideId: string
}

// 正则表达式定义在顶层作用域
const plainBlockRegex = /```plain\s*([\s\S]*?)```/
const codeBlockRegex = /```[\w]*\s*([\s\S]*?)```/

// 从 AI 响应中提取 infographic 语法
function extractInfographicSyntax(text: string): string | null {
  // 查找 ```plain 代码块中的内容
  const match = text.match(plainBlockRegex)
  if (match?.[1]) {
    return match[1].trim()
  }

  // 如果没有找到 plain 代码块，尝试查找其他代码块
  const codeMatch = text.match(codeBlockRegex)
  if (codeMatch?.[1]) {
    return codeMatch[1].trim()
  }

  // 如果都没有，检查是否直接是 infographic 语法（以 infographic 开头）
  if (text.trim().startsWith('infographic')) {
    return text.trim()
  }

  return null
}

// 提取消息的文本内容
function extractMessageText(message: ChatMessage): string {
  return message.parts
    .filter((part) => part.type === 'text' && 'text' in part && part.text)
    .map((part) => ('text' in part ? part.text : ''))
    .join('\n\n')
}

export function AIGenerator({ slideId }: AIGeneratorProps) {
  const [error, setError] = useState<string | null>(null)
  const selectedId = useAtomValue(selectedInfographicIdAtom)
  const [, updateInfographicContent] = useAtom(updateInfographicContentAtom)
  const hasProcessedRef = useRef(false)

  // 创建一个临时的 chatId 用于 AI 生成，只在组件挂载时创建一次
  const tempChatId = useMemo(() => `temp-${slideId}-${Date.now()}`, [slideId])

  const { messages, sendMessage, status } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        chatId: tempChatId,
      },
    }),
    id: tempChatId,
  })

  // 监听消息变化，当最后一条 assistant 消息完成时处理
  useEffect(() => {
    if (
      status === 'ready' &&
      hasProcessedRef.current &&
      messages.length > 0 &&
      selectedId
    ) {
      const lastMessage = messages.at(-1)
      if (lastMessage && lastMessage.role === 'assistant') {
        const textContent = extractMessageText(lastMessage)
        const syntax = extractInfographicSyntax(textContent)

        if (syntax) {
          updateInfographicContent({
            infographicId: selectedId,
            content: syntax,
          })
          setError(null)
        } else {
          setError('未能从 AI 响应中提取到有效的信息图语法')
        }
        hasProcessedRef.current = false
      }
    }
  }, [status, messages, selectedId, updateInfographicContent])

  const handleSubmit = (message: PromptInputMessage) => {
    const trimmedInput = message.text.trim()
    if (!trimmedInput || status !== 'ready' || !selectedId) {
      if (!selectedId) {
        setError('请先选择一个信息图')
      }
      return
    }

    setError(null)
    hasProcessedRef.current = true

    try {
      sendMessage({ text: trimmedInput })
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请稍后重试')
      hasProcessedRef.current = false
    }
  }

  // 将 status 转换为 PromptInputSubmit 需要的格式
  const getSubmitStatus = () => {
    if (status === 'streaming') {
      return 'streaming'
    }
    if (status === 'submitted') {
      return 'submitted'
    }
    if (status === 'error') {
      return 'error'
    }
    return undefined
  }

  const isLoading =
    status === 'streaming' || status === 'submitted' || hasProcessedRef.current

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* 消息列表区域 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {error && (
          <div className="border-b p-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <Conversation className="flex-1">
          <ConversationContent className="p-4">
            {messages.length === 0 && !isLoading ? (
              <ConversationEmptyState
                description="描述你想要生成的信息图内容，AI 会自动生成对应的 AntV Infographic
            语法"
                title="AI 生成信息图"
              />
            ) : (
              messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1
                const isStreaming = status === 'streaming'
                const isGenerating =
                  isLastMessage && isStreaming && message.role === 'assistant'

                const textContent = extractMessageText(message)
                const hasContent = textContent.trim().length > 0
                const showLoading = isGenerating && !hasContent

                // 对于用户消息，直接显示文本内容
                if (message.role === 'user') {
                  return (
                    <Message from={message.role} key={message.id}>
                      <MessageContent>
                        <MessageResponse>{textContent}</MessageResponse>
                      </MessageContent>
                    </Message>
                  )
                }

                // 对于助手消息，尝试提取 infographic 语法
                const syntax = extractInfographicSyntax(textContent)

                return (
                  <Message from={message.role} key={message.id}>
                    <MessageContent>
                      {showLoading ? (
                        <Loader className="text-muted-foreground" size={16} />
                      ) : (
                        <div className="space-y-2">
                          {syntax ? (
                            <div className="space-y-1">
                              <div className="font-medium text-muted-foreground text-xs">
                                AI 生成的内容：
                              </div>
                              <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-xs">
                                {syntax}
                              </pre>
                            </div>
                          ) : (
                            <MessageResponse>{textContent}</MessageResponse>
                          )}
                        </div>
                      )}
                    </MessageContent>
                  </Message>
                )
              })
            )}

            {isLoading && messages.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <Loader className="text-muted-foreground" size={16} />
                <span className="ml-2 text-muted-foreground text-sm">
                  AI 正在生成中...
                </span>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      {/* 输入区域 */}
      <div className="border-t bg-background p-4">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              disabled={isLoading || !selectedId}
              placeholder={
                selectedId
                  ? '描述你想要生成的信息图内容...'
                  : '请先选择一个信息图'
              }
            />
          </PromptInputBody>
          <PromptInputFooter>
            <div />
            <PromptInputSubmit
              disabled={!selectedId}
              status={getSubmitStatus()}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}
