'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useAtomValue, useSetAtom } from 'jotai'
import { nanoid } from 'nanoid'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import {
  addInfographicAtom,
  deleteInfographicAtom,
  selectedInfographicIdAtom,
  slideAtom,
  updateInfographicContentAtom,
} from '@/store/slide-store'
import { InputArea, MessageList } from './components'
import { useStreamingHandlers } from './hooks'
import type { AIGeneratorProps, ChatMessage } from './types'

export function AIGenerator({ slideId }: AIGeneratorProps) {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const selectedId = useAtomValue(selectedInfographicIdAtom)
  const setSelectedId = useSetAtom(selectedInfographicIdAtom)
  const slide = useAtomValue(slideAtom)
  const updateInfographicContent = useSetAtom(updateInfographicContentAtom)
  const addInfographic = useSetAtom(addInfographicAtom)
  const deleteInfographic = useSetAtom(deleteInfographicAtom)

  // 用于跟踪当前批次中最后创建的信息图ID，确保多个创建操作按顺序插入
  const lastCreatedInfographicIdRef = useRef<string | null>(null)
  // 用于跟踪流式创建的信息图：toolCallId -> infographicId 的映射
  const streamingCreatedInfographicsRef = useRef<Map<string, string>>(new Map())

  // 创建一个临时的 chatId 用于 AI 生成，只在组件挂载时创建一次
  const tempChatId = useMemo(() => `temp-${slideId}-${Date.now()}`, [slideId])

  // 创建稳定的 transport 实例，在 infographics 变化时更新
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: {
          chatId: tempChatId,
          infographics: slide?.infographics ?? [], // 传递当前 slide 的所有信息图数据
          selectedInfographicId: selectedId ?? undefined, // 传递当前选中的信息图 ID
        },
      }),
    [tempChatId, slide?.infographics, selectedId]
  )

  useEffect(() => {
    console.log(slide)
  }, [slide])

  const {
    messages,
    sendMessage,
    addToolOutput,
    status,
    error: chatError,
  } = useChat<ChatMessage>({
    transport,
    id: tempChatId,
    onToolCall: ({ toolCall }) => {
      console.log('[onToolCall] triggered:', toolCall)

      // 检查是否是动态工具
      if (toolCall.dynamic) {
        console.log('[onToolCall] skipping dynamic tool')
        return
      }

      const { toolName, toolCallId, input } = toolCall
      console.log('[onToolCall] processing:', { toolName, toolCallId, input })

      try {
        switch (toolName) {
          case 'createInfographic': {
            console.log('[createInfographic] input:', input)
            const typedInput = input as {
              title?: string
              syntax?: string
            }
            const title = typedInput.title ?? '未命名信息图'
            const syntax = typedInput.syntax
            if (!syntax) {
              console.error('[createInfographic] missing syntax in input')
              addToolOutput({
                tool: 'createInfographic',
                toolCallId,
                state: 'output-error',
                errorText: '缺少 syntax 参数',
              })
              break
            }

            // 检查是否已经在流式过程中创建过这个信息图
            const existingId =
              streamingCreatedInfographicsRef.current.get(toolCallId)

            if (existingId) {
              // 已经流式创建过，只需要更新最终内容
              console.log('[createInfographic] updating existing:', {
                existingId,
                syntax: `${syntax.substring(0, 100)}...`,
              })
              updateInfographicContent({
                infographicId: existingId,
                content: syntax,
              })
              addToolOutput({
                tool: 'createInfographic',
                toolCallId,
                output: { success: true, id: existingId, title },
              })
            } else {
              // 没有流式创建过（可能是非流式调用），正常创建
              const newId = nanoid()
              const afterId =
                lastCreatedInfographicIdRef.current ?? selectedId ?? null
              console.log('[createInfographic] creating:', {
                newId,
                afterId,
                syntax: `${syntax.substring(0, 100)}...`,
              })
              addInfographic({
                infographic: {
                  id: newId,
                  content: syntax,
                },
                afterId,
              })
              lastCreatedInfographicIdRef.current = newId
              addToolOutput({
                tool: 'createInfographic',
                toolCallId,
                output: { success: true, id: newId, title },
              })
            }
            console.log('[createInfographic] done')
            break
          }
          case 'editInfographic': {
            const { infographicId, syntax } = input as {
              infographicId: string
              title?: string
              syntax: string
            }
            // 跳转到正在编辑的信息图，以便实时查看修改效果
            setSelectedId(infographicId)
            updateInfographicContent({
              infographicId,
              content: syntax,
            })
            addToolOutput({
              tool: 'editInfographic',
              toolCallId,
              output: { success: true, infographicId },
            })
            break
          }
          case 'deleteInfographic': {
            const { infographicId } = input as {
              infographicId: string
            }
            deleteInfographic(infographicId)
            addToolOutput({
              tool: 'deleteInfographic',
              toolCallId,
              output: { success: true, infographicId },
            })
            break
          }
          default:
            // 未知工具，不处理
            break
        }
      } catch (err) {
        addToolOutput({
          tool: toolName as
            | 'createInfographic'
            | 'editInfographic'
            | 'deleteInfographic',
          toolCallId,
          state: 'output-error',
          errorText: err instanceof Error ? err.message : '工具执行失败',
        })
      }
    },
  })

  // 使用流式处理 hooks
  useStreamingHandlers({
    selectedId,
    setSelectedId,
    updateInfographicContent,
    addInfographic,
    messages,
    status,
    lastCreatedInfographicIdRef,
    streamingCreatedInfographicsRef,
  })

  // 监听错误状态
  useEffect(() => {
    if (status === 'error') {
      const errorMessage = chatError?.message || '请求失败，请稍后重试'
      setError(errorMessage)
      setIsSubmitting(false)
    }
  }, [status, chatError])

  // 当 status 变为 streaming 时，重置 isSubmitting（因为此时 status 已经更新）
  useEffect(() => {
    if (status === 'streaming') {
      setIsSubmitting(false)
    }
  }, [status])

  // 当 status 变为 ready 时，重置提交状态
  useEffect(() => {
    if (status === 'ready') {
      setIsSubmitting(false)
    }
  }, [status])

  const handleSubmit = (message: PromptInputMessage) => {
    const trimmedInput = message.text.trim()
    if (!trimmedInput) {
      return
    }

    // 如果当前状态是错误，允许重新发送（会重置状态）
    if (status === 'error') {
      setError(null)
    }

    // 只有在 ready 状态时才发送，但允许从 error 状态恢复
    if (status !== 'ready' && status !== 'error') {
      return
    }

    setError(null)
    // 立即设置提交状态，确保 loading 立即显示
    setIsSubmitting(true)

    try {
      sendMessage({ text: trimmedInput })
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请稍后重试')
      setIsSubmitting(false)
    }
  }

  const isLoading =
    isSubmitting || status === 'streaming' || status === 'submitted'

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <MessageList
        error={error}
        isLoading={isLoading}
        messages={messages}
        status={status}
      />
      <InputArea
        isLoading={isLoading}
        onSubmit={handleSubmit}
        status={status}
      />
    </div>
  )
}

export type { AIGeneratorProps } from './types'
