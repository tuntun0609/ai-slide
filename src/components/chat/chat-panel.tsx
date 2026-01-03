'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '@/app/api/chat/route'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
  Message,
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

export function ChatPanel({ chatId, initialMessages = [] }: ChatPanelProps) {
  const [selectedModel, setSelectedModel] = useState('GPT-5.2')
  const hasAutoSentRef = useRef(false)
  const isInitializedRef = useRef(false)

  const { messages, sendMessage, status } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        chatId,
      },
    }),
    id: chatId,
    messages: initialMessages,
  })

  // 自动发送初始消息：如果只有一条用户消息且没有 assistant 回复，则自动触发 AI 回复
  useEffect(() => {
    // 标记为已初始化
    if (!isInitializedRef.current && status === 'ready') {
      isInitializedRef.current = true
    }

    // 只在初始化完成、状态就绪、且未自动发送过时执行
    if (
      !isInitializedRef.current ||
      hasAutoSentRef.current ||
      status !== 'ready'
    ) {
      return
    }

    // 检查是否只有一条用户消息且没有 assistant 回复
    const userMessages = messages.filter((msg) => msg.role === 'user')
    const assistantMessages = messages.filter((msg) => msg.role === 'assistant')

    if (userMessages.length === 1 && assistantMessages.length === 0) {
      // 检查用户消息是否已经保存到数据库（通过检查是否在 initialMessages 中）
      const userMessage = userMessages[0]
      const isSavedMessage = initialMessages.some(
        (m) => m.id === userMessage.id && m.role === 'user'
      )

      if (isSavedMessage) {
        hasAutoSentRef.current = true
        // 使用 sendMessage 触发 API 调用
        // API 端会通过查询数据库判断消息是否已保存，避免重复保存
        const textPart = userMessage.parts.find((p) => p.type === 'text')
        if (textPart && 'text' in textPart && textPart.text) {
          sendMessage({ text: textPart.text })
        }
      }
    }
  }, [messages, status, sendMessage, initialMessages])

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
            displayMessages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) =>
                    renderMessagePart(part, message.id, i)
                  )}
                </MessageContent>
              </Message>
            ))
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
