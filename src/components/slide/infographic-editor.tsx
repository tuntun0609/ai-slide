'use client'

import { yaml } from '@codemirror/lang-yaml'
import { githubDark, githubLight } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import { useAtom, useAtomValue } from 'jotai'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useState } from 'react'
import {
  editingInfographicContentAtom,
  selectedInfographicAtom,
  selectedInfographicIdAtom,
  updateInfographicContentAtom,
} from '@/store/slide-store'

interface InfographicEditorProps {
  slideId: string
}

export function InfographicEditor({
  slideId: _slideId,
}: InfographicEditorProps) {
  const [content, setContent] = useAtom(editingInfographicContentAtom)
  const [selectedId] = useAtom(selectedInfographicIdAtom)
  const selectedInfographic = useAtomValue(selectedInfographicAtom)
  const [, updateInfographicContent] = useAtom(updateInfographicContentAtom)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 当选中信息图改变时，同步编辑器内容
  useEffect(() => {
    if (selectedInfographic) {
      setContent(selectedInfographic.content)
    } else {
      setContent('')
    }
  }, [selectedInfographic, setContent])

  const handleContentChange = useCallback(
    (value: string) => {
      setContent(value)
      if (selectedId) {
        updateInfographicContent({ infographicId: selectedId, content: value })
      }
    },
    [selectedId, setContent, updateInfographicContent]
  )

  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full w-full overflow-hidden rounded-md border bg-background">
          <CodeMirror
            basicSetup={{
              crosshairCursor: false,
              tabSize: 2,
            }}
            className="h-full text-sm"
            extensions={[yaml()]}
            height="100%"
            onChange={handleContentChange}
            placeholder="在这里输入信息图语法..."
            theme={resolvedTheme === 'dark' ? githubDark : githubLight}
            value={content}
          />
        </div>
      </div>
    </div>
  )
}
