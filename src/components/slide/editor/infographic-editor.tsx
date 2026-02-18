'use client'

import { yaml } from '@codemirror/lang-yaml'
import { githubDark, githubLight } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import { useAtom, useAtomValue } from 'jotai'
import { CodeIcon, FormInputIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import type { InfographicData } from '@/lib/infographic-parser'
import {
  parseInfographic,
  serializeInfographic,
} from '@/lib/infographic-parser'
import {
  editingInfographicContentAtom,
  selectedInfographicAtom,
  selectedInfographicIdAtom,
  updateInfographicContentAtom,
} from '@/store/slide-store'
import { InfographicForm } from './infographic-form'

type ViewMode = 'form' | 'code'

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
  const [viewMode, setViewMode] = useState<ViewMode>('form')
  const [formData, setFormData] = useState<InfographicData | null>(null)
  const formDataRef = useRef<InfographicData | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 当选中信息图改变时，同步编辑器内容
  useEffect(() => {
    if (selectedInfographic) {
      setContent(selectedInfographic.content)
      // Also update form data when selection changes
      const parsed = parseInfographic(selectedInfographic.content)
      setFormData(parsed)
      formDataRef.current = parsed
    } else {
      setContent('')
      setFormData(null)
      formDataRef.current = null
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

  const handleFormDataChange = useCallback(
    (data: InfographicData) => {
      setFormData(data)
      formDataRef.current = data
      const serialized = serializeInfographic(data)
      handleContentChange(serialized)
    },
    [handleContentChange]
  )

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      if (mode === 'form' && viewMode === 'code') {
        // Switching to form: parse current content
        const parsed = parseInfographic(content)
        if (parsed) {
          setFormData(parsed)
          formDataRef.current = parsed
        }
      }
      // Switching to code: content is already up to date (form changes sync immediately)
      setViewMode(mode)
    },
    [viewMode, content]
  )

  const canShowForm = useMemo(() => {
    if (!content.trim()) {
      return false
    }
    return content.trim().startsWith('infographic ')
  }, [content])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* View mode toggle */}
      <div className="flex items-center gap-1 px-3 pt-3 pb-0 sm:px-4">
        <Button
          disabled={!canShowForm}
          onClick={() => handleViewModeChange('form')}
          size="xs"
          variant={viewMode === 'form' ? 'secondary' : 'ghost'}
        >
          <FormInputIcon className="size-3.5" />
          表单
        </Button>
        <Button
          onClick={() => handleViewModeChange('code')}
          size="xs"
          variant={viewMode === 'code' ? 'secondary' : 'ghost'}
        >
          <CodeIcon className="size-3.5" />
          代码
        </Button>
      </div>

      <div className="flex-1 overflow-hidden p-3 pt-2 sm:p-4">
        {viewMode === 'form' && formData ? (
          <div className="h-full w-full overflow-hidden rounded-md border bg-background">
            <InfographicForm data={formData} onChange={handleFormDataChange} />
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}
