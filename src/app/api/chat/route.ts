import {
  convertToModelMessages,
  type InferUITools,
  stepCountIs,
  streamText,
  type ToolSet,
  tool,
  type UIDataTypes,
  type UIMessage,
} from 'ai'
import { z } from 'zod'
import { defaultModel } from '@/lib/ai'
import { getSession } from '@/lib/auth'

// 定义工具集合
const tools = {
  getWeather: tool({
    description: 'Get the weather for a location',
    inputSchema: z.object({
      city: z.string().describe('The city to get the weather for'),
      unit: z
        .enum(['C', 'F'])
        .describe('The unit to display the temperature in'),
    }),
    execute: ({ city, unit }) => {
      // 模拟天气数据
      const weather = {
        value: Math.floor(Math.random() * 30) + 10,
        description: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][
          Math.floor(Math.random() * 4)
        ],
      }

      return `It is currently ${weather.value}°${unit} and ${weather.description} in ${city}!`
    },
  }),
  calculate: tool({
    description: 'Perform mathematical calculations',
    inputSchema: z.object({
      expression: z
        .string()
        .describe('The mathematical expression to evaluate'),
    }),
    execute: ({ expression }) => {
      try {
        // 简单的安全计算（仅支持基本数学运算）
        const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '')
        const result = Function(`"use strict"; return (${sanitized})`)()
        return `计算结果: ${result}`
      } catch (error) {
        return `计算错误: ${error instanceof Error ? error.message : '未知错误'}`
      }
    },
  }),
} satisfies ToolSet

// 导出工具类型供前端使用
export type ChatTools = InferUITools<typeof tools>
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>

// 允许流式响应最多 30 秒
export const maxDuration = 30

export async function POST(req: Request) {
  // 检查认证
  const session = await getSession()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const { messages }: { messages: ChatMessage[] } = await req.json()

    const result = streamText({
      model: defaultModel,
      system:
        'You are a helpful AI assistant. You can help users with various tasks including getting weather information and performing calculations.',
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(5),
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process chat request',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
