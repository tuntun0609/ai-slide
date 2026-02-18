'use client'

import { GripVerticalIcon, TrashIcon } from 'lucide-react'
import type { DragControls } from 'motion/react'
import type { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { InfographicItem } from '@/lib/infographic-parser'

interface ChildItemEditorProps {
  item: InfographicItem
  index: number
  onChange: (item: InfographicItem) => void
  onRemove: () => void
  showValue: boolean
  dragControls?: DragControls
  t: ReturnType<typeof useTranslations<'slideEditor'>>
}

export function ChildItemEditor({
  item,
  index,
  onChange,
  onRemove,
  dragControls,
  t,
}: ChildItemEditorProps) {
  return (
    <div className="rounded-lg border bg-background p-2">
      <div className="flex items-center gap-1.5">
        {dragControls && (
          <button
            className="shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
            onPointerDown={(e) => dragControls.start(e)}
            type="button"
          >
            <GripVerticalIcon className="size-3" />
          </button>
        )}
        <span className="w-4 shrink-0 text-[12px] text-muted-foreground">
          {index + 1}
        </span>
        <Input
          className="h-6 flex-1 text-xs"
          onChange={(e) =>
            onChange({ ...item, label: e.target.value || undefined })
          }
          placeholder={t('label')}
          value={item.label ?? ''}
        />
        <Button
          className="shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          size="icon-xs"
          variant="ghost"
        >
          <TrashIcon className="size-2.5" />
        </Button>
      </div>
      <div className="mt-1 pl-5">
        <Input
          className="h-6 text-xs"
          onChange={(e) =>
            onChange({ ...item, desc: e.target.value || undefined })
          }
          placeholder={t('desc')}
          value={item.desc ?? ''}
        />
      </div>
    </div>
  )
}
