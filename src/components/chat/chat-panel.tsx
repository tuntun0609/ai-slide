'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState } from 'react'
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

export function ChatPanel({ chatId }: ChatPanelProps) {
  const [selectedModel, setSelectedModel] = useState('GPT-5.2')
  const { messages, sendMessage, status } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    id: chatId,
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
          {messages.length === 0 ? (
            <ConversationEmptyState
              description="输入消息开始与 AI 对话"
              title="开始对话"
            />
          ) : (
            messages.map((message) => (
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
