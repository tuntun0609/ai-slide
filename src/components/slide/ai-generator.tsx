'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useAtomValue, useSetAtom } from 'jotai'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  addInfographicAtom,
  deleteInfographicAtom,
  selectedInfographicIdAtom,
  slideAtom,
  updateInfographicContentAtom,
} from '@/store/slide-store'

interface AIGeneratorProps {
  slideId: string
}

// 工具名称到中文标题的映射
const toolTitles: Record<string, string> = {
  createInfographic: '创建信息图',
  editInfographic: '编辑信息图',
  deleteInfographic: '删除信息图',
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
  const setSelectedId = useSetAtom(selectedInfographicIdAtom)
  const slide = useAtomValue(slideAtom)
  const updateInfographicContent = useSetAtom(updateInfographicContentAtom)
  const addInfographic = useSetAtom(addInfographicAtom)
  const deleteInfographic = useSetAtom(deleteInfographicAtom)

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
        },
      }),
    [tempChatId, slide?.infographics]
  )

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
      // 检查是否是动态工具
      if ('dynamic' in toolCall && toolCall.dynamic) {
        return
      }

      const { toolName, toolCallId, input } = toolCall as {
        toolName: string
        toolCallId: string
        input: Record<string, unknown>
      }

      try {
        switch (toolName) {
          case 'createInfographic': {
            const { title, syntax } = input as {
              title: string
              syntax: string
            }
            const newId = nanoid()
            addInfographic({
              infographic: {
                id: newId,
                content: syntax,
              },
              afterId: selectedId,
            })
            addToolOutput({
              tool: 'createInfographic',
              toolCallId,
              output: { success: true, id: newId, title },
            })
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

  // 用于跟踪已经跳转过的工具调用，避免重复跳转
  const processedToolCallsRef = useRef<Set<string>>(new Set())
  // 用于节流的上次执行时间
  const lastExecuteTimeRef = useRef<number>(0)
  // 用于确保最后一次更新被执行的 trailing timer
  const trailingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 存储最新的待更新内容
  const pendingUpdateRef = useRef<{
    infographicId: string
    content: string
  } | null>(null)

  // 节流间隔时间（毫秒）
  const THROTTLE_INTERVAL = 300

  // 执行内容更新
  const flushPendingUpdate = useCallback(() => {
    if (pendingUpdateRef.current) {
      updateInfographicContent(pendingUpdateRef.current)
      pendingUpdateRef.current = null
      lastExecuteTimeRef.current = Date.now()
    }
  }, [updateInfographicContent])

  // 处理 editInfographic 工具调用的 streaming 更新（使用节流）
  const handleEditInfographicStreaming = useCallback(
    (
      toolCallId: string,
      input: { infographicId?: string; syntax?: string },
      state: string
    ) => {
      // 检查是否已经处理过这个工具调用的跳转
      const alreadyProcessed = processedToolCallsRef.current.has(toolCallId)

      // 当有 infographicId 时，立即跳转到对应的信息图（不节流）
      if (input.infographicId && !alreadyProcessed) {
        setSelectedId(input.infographicId)
        processedToolCallsRef.current.add(toolCallId)
      }

      // 如果有 syntax，使用节流更新内容（streaming 过程中）
      if (input.infographicId && input.syntax && state === 'input-streaming') {
        // 存储最新的待更新内容
        pendingUpdateRef.current = {
          infographicId: input.infographicId,
          content: input.syntax,
        }

        const now = Date.now()
        const timeSinceLastExecute = now - lastExecuteTimeRef.current

        // 清除之前的 trailing timer
        if (trailingTimerRef.current) {
          clearTimeout(trailingTimerRef.current)
          trailingTimerRef.current = null
        }

        if (timeSinceLastExecute >= THROTTLE_INTERVAL) {
          // 如果距离上次执行超过间隔时间，立即执行
          flushPendingUpdate()
        } else {
          // 否则设置 trailing timer，确保最后一次更新被执行
          const remainingTime = THROTTLE_INTERVAL - timeSinceLastExecute
          trailingTimerRef.current = setTimeout(() => {
            flushPendingUpdate()
            trailingTimerRef.current = null
          }, remainingTime)
        }
      }
    },
    [setSelectedId, flushPendingUpdate]
  )

  // 清理 trailing timer
  useEffect(() => {
    return () => {
      if (trailingTimerRef.current) {
        clearTimeout(trailingTimerRef.current)
      }
    }
  }, [])

  // 监听 messages 变化，在 streaming 过程中实时更新对应信息图
  useEffect(() => {
    if (status !== 'streaming') {
      return
    }

    const lastMessage = messages.at(-1)
    if (!lastMessage || lastMessage.role !== 'assistant') {
      return
    }

    for (const part of lastMessage.parts) {
      if (!part.type.startsWith('tool-editInfographic')) {
        continue
      }

      const toolPart = part as {
        toolCallId: string
        state: string
        input?: { infographicId?: string; syntax?: string }
      }

      if (toolPart.input) {
        handleEditInfographicStreaming(
          toolPart.toolCallId,
          toolPart.input,
          toolPart.state
        )
      }
    }
  }, [messages, status, handleEditInfographicStreaming])

  // 监听错误状态
  useEffect(() => {
    if (status === 'error') {
      const errorMessage = chatError?.message || '请求失败，请稍后重试'
      setError(errorMessage)
    }
  }, [status, chatError])

  // 当 status 变为 ready 时，清空已处理的工具调用记录并刷新待更新内容
  useEffect(() => {
    if (status === 'ready') {
      // 清除 trailing timer 并立即刷新任何待更新的内容
      if (trailingTimerRef.current) {
        clearTimeout(trailingTimerRef.current)
        trailingTimerRef.current = null
      }
      flushPendingUpdate()
      processedToolCallsRef.current.clear()
      // 重置上次执行时间
      lastExecuteTimeRef.current = 0
    }
  }, [status, flushPendingUpdate])

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

    try {
      sendMessage({ text: trimmedInput })
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请稍后重试')
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

  const isLoading = status === 'streaming' || status === 'submitted'

  // 获取输入框的 placeholder 文本
  const getPlaceholder = () => {
    if (status === 'error') {
      return '发生错误，可以重新发送消息...'
    }
    return '描述你想要对信息图进行的操作...'
  }

  // 渲染工具调用 UI
  const renderToolPart = (part: ChatMessage['parts'][number]) => {
    // 检查是否是工具调用相关的 part
    if (!part.type.startsWith('tool-')) {
      return null
    }

    // 提取工具名称（去掉 'tool-' 前缀）
    const toolName = part.type.replace('tool-', '')
    const toolPart = part as {
      type: string
      toolCallId: string
      state: string
      input?: unknown
      output?: unknown
      errorText?: string
    }

    return (
      <Tool key={toolPart.toolCallId}>
        <ToolHeader
          state={
            toolPart.state as
              | 'input-streaming'
              | 'input-available'
              | 'output-available'
              | 'output-error'
              | 'approval-requested'
              | 'approval-responded'
              | 'output-denied'
          }
          title={toolTitles[toolName] || toolName}
          type={
            part.type as
              | 'tool-createInfographic'
              | 'tool-editInfographic'
              | 'tool-deleteInfographic'
          }
        />
        <ToolContent>
          {toolPart.input !== undefined && toolPart.input !== null && (
            <ToolInput input={toolPart.input} />
          )}
          {(toolPart.output !== undefined || toolPart.errorText) && (
            <ToolOutput
              errorText={toolPart.errorText}
              output={toolPart.output}
            />
          )}
        </ToolContent>
      </Tool>
    )
  }

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
                description="描述你想要对信息图进行的操作，AI 可以帮你创建、编辑或删除信息图"
                title="AI 信息图助手"
              />
            ) : (
              messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1
                const isStreaming = status === 'streaming'
                const isGenerating =
                  isLastMessage && isStreaming && message.role === 'assistant'

                const textContent = extractMessageText(message)
                const hasContent = textContent.trim().length > 0
                const hasToolParts = message.parts.some((part) =>
                  part.type.startsWith('tool-')
                )
                const showLoading = isGenerating && !hasContent && !hasToolParts

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

                // 对于助手消息，显示文本和工具调用
                return (
                  <Message from={message.role} key={message.id}>
                    <MessageContent>
                      {showLoading ? (
                        <Loader className="text-muted-foreground" size={16} />
                      ) : (
                        <div className="space-y-3">
                          {/* 渲染文本内容 */}
                          {hasContent && (
                            <MessageResponse>{textContent}</MessageResponse>
                          )}
                          {/* 渲染工具调用 */}
                          {message.parts.map((part) => renderToolPart(part))}
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
              disabled={isLoading}
              placeholder={getPlaceholder()}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <div />
            <PromptInputSubmit status={getSubmitStatus()} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}
