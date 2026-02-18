'use client'

import { PlusIcon } from 'lucide-react'
import type { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { InfographicItem } from '@/lib/infographic-parser'
import { ItemEditor } from './item-editor'
import { SortableList } from './sortable-list'

interface RootItemEditorProps {
  item: InfographicItem
  onChange: (item: InfographicItem) => void
  showValue: boolean
  t: ReturnType<typeof useTranslations<'slideEditor'>>
}

export function RootItemEditor({
  item,
  onChange,
  showValue,
  t,
}: RootItemEditorProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border bg-muted/30 p-2">
        <Input
          className="h-7 text-xs"
          onChange={(e) =>
            onChange({ ...item, label: e.target.value || undefined })
          }
          placeholder={t('rootNodeLabel')}
          value={item.label ?? ''}
        />
        <div className="mt-1.5">
          <Input
            className="h-7 text-xs"
            onChange={(e) =>
              onChange({ ...item, desc: e.target.value || undefined })
            }
            placeholder={t('rootNodeDesc')}
            value={item.desc ?? ''}
          />
        </div>

        {/* Children */}
        <div className="mt-2 border-t pt-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-muted-foreground text-xs">
              {t('childNodes')}
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
              renderItem={(child, index, dragControls) => (
                <ItemEditor
                  dragControls={dragControls}
                  index={index}
                  item={child}
                  onChange={(updated) => {
                    const newChildren = [...(item.children || [])]
                    newChildren[index] = updated
                    onChange({ ...item, children: newChildren })
                  }}
                  onRemove={() => {
                    onChange({
                      ...item,
                      children: item.children?.filter((_, i) => i !== index),
                    })
                  }}
                  showChildren={true}
                  showValue={showValue}
                  t={t}
                />
              )}
            />
          )}
        </div>
      </div>
    </div>
  )
}
