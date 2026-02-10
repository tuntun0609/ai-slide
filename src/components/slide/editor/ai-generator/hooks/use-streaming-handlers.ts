import { nanoid } from 'nanoid'
import { type MutableRefObject, useCallback, useEffect, useRef } from 'react'
import { THROTTLE_INTERVAL } from '../constants'
import type { ChatMessage } from '../types'

interface UseStreamingHandlersParams {
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  updateInfographicContent: (params: {
    infographicId: string
    content: string
  }) => void
  addInfographic: (params: {
    infographic: { id: string; content: string }
    afterId: string | null
  }) => void
  messages: ChatMessage[]
  status: string
  lastCreatedInfographicIdRef: MutableRefObject<string | null>
  streamingCreatedInfographicsRef: MutableRefObject<Map<string, string>>
}

export function useStreamingHandlers({
  selectedId,
  setSelectedId,
  updateInfographicContent,
  addInfographic,
  messages,
  status,
  lastCreatedInfographicIdRef,
  streamingCreatedInfographicsRef,
}: UseStreamingHandlersParams) {
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

  // 处理 createInfographic 工具调用的 streaming 更新（流式渲染新信息图）
  const handleCreateInfographicStreaming = useCallback(
    (
      toolCallId: string,
      input: { title?: string; syntax?: string },
      state: string
    ) => {
      // 只在 streaming 状态时处理
      if (state !== 'input-streaming') {
        return
      }

      const existingId = streamingCreatedInfographicsRef.current.get(toolCallId)

      if (!existingId) {
        // 首次检测到这个工具调用，创建一个新的信息图
        const newId = nanoid()
        // 确定插入位置：使用最后创建的信息图ID或当前选中的ID
        const afterId =
          lastCreatedInfographicIdRef.current ?? selectedId ?? null

        // 创建信息图，初始内容为当前流式接收到的 syntax（可能为空或部分内容）
        addInfographic({
          infographic: {
            id: newId,
            content: input.syntax ?? '',
          },
          afterId,
        })

        // 记录映射关系
        streamingCreatedInfographicsRef.current.set(toolCallId, newId)
        // 更新最后创建的信息图ID
        lastCreatedInfographicIdRef.current = newId
      } else if (input.syntax) {
        // 已经创建过，使用节流更新内容
        pendingUpdateRef.current = {
          infographicId: existingId,
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
          flushPendingUpdate()
        } else {
          const remainingTime = THROTTLE_INTERVAL - timeSinceLastExecute
          trailingTimerRef.current = setTimeout(() => {
            flushPendingUpdate()
            trailingTimerRef.current = null
          }, remainingTime)
        }
      }
    },
    [
      selectedId,
      addInfographic,
      flushPendingUpdate,
      lastCreatedInfographicIdRef,
      streamingCreatedInfographicsRef,
    ]
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
      const toolPart = part as {
        type: string
        toolCallId: string
        state: string
        input?: { infographicId?: string; syntax?: string; title?: string }
      }

      if (!toolPart.input) {
        continue
      }

      if (toolPart.type === 'tool-editInfographic') {
        handleEditInfographicStreaming(
          toolPart.toolCallId,
          toolPart.input,
          toolPart.state
        )
      } else if (toolPart.type === 'tool-createInfographic') {
        handleCreateInfographicStreaming(
          toolPart.toolCallId,
          toolPart.input,
          toolPart.state
        )
      }
    }
  }, [
    messages,
    status,
    handleEditInfographicStreaming,
    handleCreateInfographicStreaming,
  ])

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
      // 重置最后创建的信息图ID，为下一批工具调用做准备
      lastCreatedInfographicIdRef.current = null
      // 清空流式创建的信息图映射
      streamingCreatedInfographicsRef.current.clear()
    }
  }, [
    status,
    flushPendingUpdate,
    lastCreatedInfographicIdRef,
    streamingCreatedInfographicsRef,
  ])
}
