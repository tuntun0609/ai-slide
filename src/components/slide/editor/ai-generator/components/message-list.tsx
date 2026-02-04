import { isReasoningUIPart } from 'ai'
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
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ChatMessage } from '../types'
import { extractMessageText } from '../utils'
import { ToolPart } from './tool-part'

interface MessageListProps {
  messages: ChatMessage[]
  status: string
  isLoading: boolean
  error: string | null
}

export function MessageList({
  messages,
  status,
  isLoading,
  error,
}: MessageListProps) {
  return (
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
                        {/* 渲染 reasoning 内容 */}
                        {message.parts
                          .filter(
                            (
                              part
                            ): part is Extract<
                              typeof part,
                              { type: 'reasoning' }
                            > => isReasoningUIPart(part)
                          )
                          .map((reasoningPart, idx) => (
                            <Reasoning
                              defaultOpen={true}
                              isStreaming={reasoningPart.state === 'streaming'}
                              key={`reasoning-${idx}`}
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>
                                {reasoningPart.text}
                              </ReasoningContent>
                            </Reasoning>
                          ))}
                        {/* 渲染文本内容 */}
                        {hasContent && (
                          <MessageResponse>{textContent}</MessageResponse>
                        )}
                        {/* 渲染工具调用 */}
                        {message.parts.map((part, partIndex) => (
                          <ToolPart key={partIndex} part={part} />
                        ))}
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
  )
}
