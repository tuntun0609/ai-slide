export interface AIGeneratorProps {
  slideId: string
}

export interface ToolPart {
  type: string
  toolCallId: string
  state: ToolState
  input?: unknown
  output?: unknown
  errorText?: string
}

export type ToolState =
  | 'input-streaming'
  | 'input-available'
  | 'output-available'
  | 'output-error'
  | 'approval-requested'
  | 'approval-responded'
  | 'output-denied'

export type ToolType =
  | 'tool-createInfographic'
  | 'tool-editInfographic'
  | 'tool-deleteInfographic'

export type { ChatMessage } from '@/app/api/chat/route'
