import { createOpenRouter } from '@openrouter/ai-sdk-provider'

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

export const chatgptModel = openrouter.chat('openai/gpt-5.2')

export const kimiModel = openrouter.chat('moonshotai/kimi-k2.5')
