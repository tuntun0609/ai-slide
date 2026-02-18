'use client'

import {
  ChevronDownIcon,
  ChevronRightIcon,
  GripVerticalIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react'
import type { DragControls } from 'motion/react'
import type { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { InfographicItem } from '@/lib/infographic-parser'
import { ChildItemEditor } from './child-item-editor'
import { SortableList } from './sortable-list'

interface ItemEditorProps {
  item: InfographicItem
  index: number
  onChange: (item: InfographicItem) => void
  onRemove: () => void
  showValue: boolean
  showChildren: boolean
  dragControls?: DragControls
  t: ReturnType<typeof useTranslations<'slideEditor'>>
}

export function ItemEditor({
  item,
  index,
  onChange,
  onRemove,
  showValue,
  showChildren,
  dragControls,
  t,
}: ItemEditorProps) {
  const [expanded, setExpanded] = useState(false)

  const updateField = (key: keyof InfographicItem, value: string) => {
    onChange({ ...item, [key]: value || undefined })
  }

  return (
    <div className="rounded-lg border bg-background p-2">
      {/* 拖动手柄、序号、删除按钮 - 最上方 */}
      <div className="flex items-center gap-1.5">
        {dragControls && (
          <button
            className="shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
            onPointerDown={(e) => dragControls.start(e)}
            type="button"
          >
            <GripVerticalIcon className="size-3.5" />
          </button>
        )}
        <span className="w-4 shrink-0 text-[14px] text-muted-foreground">
          {index + 1}
        </span>
        <div className="flex-1" />
        <Button
          className="shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          size="icon-xs"
          variant="ghost"
        >
          <TrashIcon className="size-3" />
        </Button>
      </div>

      {/* 数据字段 */}
      <div className="mt-1.5 flex flex-col gap-1">
        {showChildren && (
          <div className="flex items-center gap-1.5">
            <button
              className="shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded(!expanded)}
              type="button"
            >
              {expanded ? (
                <ChevronDownIcon className="size-3.5" />
              ) : (
                <ChevronRightIcon className="size-3.5" />
              )}
            </button>
            <Input
              className="h-7 flex-1 text-xs"
              onChange={(e) => updateField('label', e.target.value)}
              placeholder={t('label')}
              value={item.label ?? ''}
            />
          </div>
        )}
        {!showChildren && (
          <Input
            className="h-7 text-xs"
            onChange={(e) => updateField('label', e.target.value)}
            placeholder={t('label')}
            value={item.label ?? ''}
          />
        )}
        <Input
          className="h-7 text-xs"
          onChange={(e) => updateField('desc', e.target.value)}
          placeholder={t('desc')}
          value={item.desc ?? ''}
        />
        <div className="flex gap-1.5">
          {showValue && (
            <Input
              className="h-7 w-20 text-xs"
              onChange={(e) => updateField('value', e.target.value)}
              placeholder={t('value')}
              value={item.value ?? ''}
            />
          )}
          <Input
            className="h-7 flex-1 text-xs"
            onChange={(e) => updateField('icon', e.target.value)}
            placeholder={t('icon')}
            value={item.icon ?? ''}
          />
          {item.id !== undefined && (
            <Input
              className="h-7 w-16 text-xs"
              onChange={(e) => updateField('id', e.target.value)}
              placeholder={t('id')}
              value={item.id ?? ''}
            />
          )}
        </div>
      </div>

      {/* Children (nested items) */}
      {showChildren && expanded && (
        <div className="mt-2 ml-4 border-l pl-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {t('children')}
            </span>
            <Button
              onClick={() => {
                onChange({
                  ...item,
                  children: [...(item.children || []), { label: '', desc: '' }],
                })
              }}
              size="icon-xs"
              variant="ghost"
            >
              <PlusIcon className="size-3" />
            </Button>
          </div>
          {item.children && item.children.length > 0 && (
            <SortableList
              items={item.children}
              onItemsChange={(newChildren) =>
                onChange({ ...item, children: newChildren })
              }
              renderItem={(child, childIndex, childDragControls) => (
                <ChildItemEditor
                  dragControls={childDragControls}
                  index={childIndex}
                  item={child}
                  onChange={(updated) => {
                    const newChildren = [...(item.children || [])]
                    newChildren[childIndex] = updated
                    onChange({ ...item, children: newChildren })
                  }}
                  onRemove={() => {
                    onChange({
                      ...item,
                      children: item.children?.filter(
                        (_, i) => i !== childIndex
                      ),
                    })
                  }}
                  showValue={showValue}
                  t={t}
                />
              )}
            />
          )}
        </div>
      )}
    </div>
  )
}
