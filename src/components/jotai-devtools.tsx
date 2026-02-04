'use client'

import { DevTools } from 'jotai-devtools'

export function JotaiDevtools() {
  return process.env.NODE_ENV === 'development' && <DevTools />
}
