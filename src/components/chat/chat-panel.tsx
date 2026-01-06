'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { CheckIcon, CopyIcon, TrashIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector'
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool'
import { Button } from '@/components/ui/button'

interface ChatPanelProps {
  chatId: string
  initialMessages?: ChatMessage[]
  isNewChat?: boolean
}

// 渲染工具组件的辅助函数
function renderToolPart(
  part: ChatMessage['parts'][number],
  messageId: string,
  index: number
) {
  if (
    !(part.type.startsWith('tool-') && 'state' in part && 'toolCallId' in part)
  ) {
    return null
  }

  let toolName = part.type.replace('tool-', '')
  if (part.type === 'tool-getWeather') {
    toolName = '获取天气'
  } else if (part.type === 'tool-calculate') {
    toolName = '计算'
  }

  return (
    <Tool
      defaultOpen={
        part.state === 'output-available' || part.state === 'output-error'
      }
      key={part.toolCallId || `${messageId}-${index}`}
    >
      <ToolHeader
        state={part.state}
        title={toolName}
        type={part.type as `tool-${string}`}
      />
      <ToolContent>
        {part.state !== 'input-streaming' &&
          'input' in part &&
          part.input !== undefined &&
          part.input !== null && (
            <ToolInput input={part.input as Record<string, unknown>} />
          )}
        {('output' in part || 'errorText' in part) &&
          (part.output || part.errorText) && (
            <ToolOutput
              errorText={
                'errorText' in part && part.errorText
                  ? String(part.errorText)
                  : undefined
              }
              output={
                'output' in part && part.output
                  ? String(part.output)
                  : undefined
              }
            />
          )}
      </ToolContent>
    </Tool>
  )
}

// 渲染消息部分的辅助函数
function renderMessagePart(
  part: ChatMessage['parts'][number],
  messageId: string,
  index: number
) {
  switch (part.type) {
    case 'text':
      return (
        <MessageResponse key={`${messageId}-text-${index}`}>
          {part.text}
        </MessageResponse>
      )

    case 'tool-getWeather':
    case 'tool-calculate':
      return renderToolPart(part, messageId, index)

    default:
      return renderToolPart(part, messageId, index)
  }
}

export function ChatPanel({
  chatId,
  initialMessages = [],
  isNewChat = false,
}: ChatPanelProps) {
  const [selectedModel, setSelectedModel] = useState('GPT-5.2')
  const hasAutoSentRef = useRef(false)

  const { messages, sendMessage, status, setMessages, regenerate } =
    useChat<ChatMessage>({
      transport: new DefaultChatTransport({
        api: '/api/chat',
        body: {
          chatId,
        },
      }),
      id: chatId,
      messages: initialMessages,
    })

  // 自动发送初始消息：直接判断 isNewChat，如果是新建 chat 则自动发送第一条用户消息
  useEffect(() => {
    // 如果已经自动发送过、状态未就绪、或不是新建 chat，则不执行
    if (hasAutoSentRef.current || status !== 'ready' || !isNewChat) {
      return
    }

    // 找到第一条用户消息
    const firstUserMessage = initialMessages.find((msg) => msg.role === 'user')
    if (firstUserMessage) {
      const textPart = firstUserMessage.parts.find((p) => p.type === 'text')
      if (textPart && 'text' in textPart && textPart.text) {
        hasAutoSentRef.current = true
        regenerate({
          messageId: firstUserMessage.id,
        })
      }
    }
  }, [status, regenerate, initialMessages, isNewChat])

  // 过滤掉重复的消息：如果消息 ID 在 initialMessages 中存在，则不显示临时消息（避免重复显示）
  const initialMessageIds = new Set(initialMessages.map((m) => m.id))
  const displayMessages = messages.filter((msg) => {
    // 如果消息已经在 initialMessages 中，说明是已保存的消息，应该显示
    if (initialMessageIds.has(msg.id)) {
      return true
    }
    // 对于不在 initialMessages 中的用户消息，检查是否有相同内容的已保存消息
    if (msg.role === 'user') {
      const savedUserMessage = initialMessages.find((m) => m.role === 'user')
      if (savedUserMessage) {
        const savedText = savedUserMessage.parts.find(
          (p) => p.type === 'text'
        )?.text
        const currentText = msg.parts.find((p) => p.type === 'text')?.text
        // 如果内容相同，不显示临时消息（避免重复显示）
        if (savedText === currentText) {
          return false
        }
      }
    }
    return true
  })

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text.trim() || status !== 'ready') {
      return
    }

    sendMessage({ text: message.text })
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

  // 处理删除消息
  const handleDeleteMessage = async (messageId: string) => {
    try {
      // 调用 API 删除消息
      const response = await fetch(`/api/chat/${chatId}/message/${messageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete message')
      }

      // 从本地消息列表中移除该消息
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== messageId)
      )
    } catch (error) {
      console.error('Error deleting message:', error)
      // 可以在这里添加错误提示
    }
  }

  // 提取消息的文本内容
  const extractMessageText = (message: ChatMessage): string => {
    return message.parts
      .filter((part) => part.type === 'text' && 'text' in part && part.text)
      .map((part) => ('text' in part ? part.text : ''))
      .join('\n\n')
  }

  // 处理复制消息内容
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const handleCopyMessage = async (message: ChatMessage) => {
    const text = extractMessageText(message)
    if (!text) {
      return
    }

    try {
      if (typeof window !== 'undefined' && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        setCopiedMessageId(message.id)
        setTimeout(() => setCopiedMessageId(null), 2000)
      }
    } catch (error) {
      console.error('Error copying message:', error)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* 消息列表区域 */}
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto max-w-3xl">
          {displayMessages.length === 0 ? (
            <ConversationEmptyState
              description="输入消息开始与 AI 对话"
              title="开始对话"
            />
          ) : (
            displayMessages.map((message, index) => {
              // 判断是否是正在生成中的消息：最后一条 assistant 消息且 status 为 streaming
              const isLastMessage = index === displayMessages.length - 1
              const isStreaming = status === 'streaming'
              const isGenerating =
                isLastMessage && isStreaming && message.role === 'assistant'

              // 检查消息是否有实际内容
              const hasContent = message.parts.some((part) => {
                if (part.type === 'text' && 'text' in part && part.text) {
                  return part.text.trim().length > 0
                }
                // 对于工具调用，检查是否有输入或输出
                if (part.type.startsWith('tool-')) {
                  return (
                    ('input' in part && part.input !== undefined) ||
                    ('output' in part && part.output !== undefined) ||
                    ('errorText' in part && part.errorText !== undefined)
                  )
                }
                return false
              })

              // 如果正在生成且没有内容，显示 loading
              const showLoading = isGenerating && !hasContent

              return (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {showLoading ? (
                      <Loader className="text-muted-foreground" size={16} />
                    ) : (
                      message.parts.map((part, i) =>
                        renderMessagePart(part, message.id, i)
                      )
                    )}
                  </MessageContent>
                  {!isGenerating && (
                    <MessageActions
                      className={
                        message.role === 'user' ? 'ml-auto justify-end' : ''
                      }
                    >
                      {message.role === 'assistant' &&
                        extractMessageText(message) && (
                          <MessageAction
                            label="复制内容"
                            onClick={() => handleCopyMessage(message)}
                            tooltip={
                              copiedMessageId === message.id
                                ? '已复制'
                                : '复制内容'
                            }
                          >
                            {copiedMessageId === message.id ? (
                              <CheckIcon
                                className="text-muted-foreground"
                                size={14}
                              />
                            ) : (
                              <CopyIcon
                                className="text-muted-foreground"
                                size={14}
                              />
                            )}
                          </MessageAction>
                        )}
                      <MessageAction
                        label="删除消息"
                        onClick={() => handleDeleteMessage(message.id)}
                        tooltip="删除消息"
                      >
                        <TrashIcon
                          className="text-muted-foreground"
                          size={14}
                        />
                      </MessageAction>
                    </MessageActions>
                  )}
                </Message>
              )
            })
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* 输入区域 */}
      <div className="border-t bg-background p-4">
        <div>
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea placeholder="输入消息..." />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <ModelSelector>
                  <ModelSelectorTrigger
                    render={(props) => (
                      <Button size="sm" variant="ghost" {...props}>
                        {selectedModel}
                      </Button>
                    )}
                  />
                  <ModelSelectorContent
                    onValueChange={setSelectedModel}
                    title="选择模型"
                    value={selectedModel}
                  >
                    <ModelSelectorList>
                      <ModelSelectorGroup heading="推荐模型">
                        <ModelSelectorItem value="GPT-5.2">
                          GPT-5.2
                        </ModelSelectorItem>
                        <ModelSelectorItem value="Claude 3.5 Sonnet">
                          Claude 3.5 Sonnet
                        </ModelSelectorItem>
                        <ModelSelectorItem value="GPT-3.5 Turbo">
                          GPT-3.5 Turbo
                        </ModelSelectorItem>
                      </ModelSelectorGroup>
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              </PromptInputTools>
              <PromptInputSubmit status={getSubmitStatus()} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}
