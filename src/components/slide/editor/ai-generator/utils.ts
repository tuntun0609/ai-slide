import type { ChatMessage } from './types'

// 提取消息的文本内容
export function extractMessageText(message: ChatMessage): string {
  return message.parts
    .filter((part) => part.type === 'text' && 'text' in part && part.text)
    .map((part) => ('text' in part ? part.text : ''))
    .join('\n\n')
}
