'use client'

import {
  ChevronDownIcon,
  ChevronRightIcon,
  GripVerticalIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react'
import type { DragControls } from 'motion/react'
import { Reorder, useDragControls } from 'motion/react'
import { nanoid } from 'nanoid'
import { useTranslations } from 'next-intl'
import { useCallback, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { InfographicData, InfographicItem } from '@/lib/infographic-parser'
import {
  getDataFieldForTemplate,
  TEMPLATE_GROUPS,
} from '@/lib/infographic-parser'

interface InfographicFormProps {
  data: InfographicData
  onChange: (data: InfographicData) => void
}

export function InfographicForm({ data, onChange }: InfographicFormProps) {
  const t = useTranslations('slideEditor')
  const updateField = useCallback(
    <K extends keyof InfographicData>(key: K, value: InfographicData[K]) => {
      onChange({ ...data, [key]: value })
    },
    [data, onChange]
  )

  const handleTemplateChange = useCallback(
    (template: string | null) => {
      if (!template) {
        return
      }
      const newDataField = getDataFieldForTemplate(template)
      onChange({ ...data, template, dataField: newDataField })
    },
    [data, onChange]
  )

  const handleItemsChange = useCallback(
    (items: InfographicItem[]) => {
      updateField('items', items)
    },
    [updateField]
  )

  const addItem = useCallback(() => {
    const newItem: InfographicItem = { label: '', desc: '' }
    handleItemsChange([...data.items, newItem])
  }, [data.items, handleItemsChange])

  const removeItem = useCallback(
    (index: number) => {
      handleItemsChange(data.items.filter((_, i) => i !== index))
    },
    [data.items, handleItemsChange]
  )

  const updateItem = useCallback(
    (index: number, item: InfographicItem) => {
      const newItems = [...data.items]
      newItems[index] = item
      handleItemsChange(newItems)
    },
    [data.items, handleItemsChange]
  )

  const handlePaletteChange = useCallback(
    (value: string) => {
      const palette = value
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
      updateField('theme', {
        ...data.theme,
        palette: palette.length > 0 ? palette : undefined,
      })
    },
    [data.theme, updateField]
  )

  const handleThemeModeChange = useCallback(
    (mode: string | null) => {
      updateField('theme', {
        ...data.theme,
        mode: mode || undefined,
      })
    },
    [data.theme, updateField]
  )

  const handleStylizeChange = useCallback(
    (value: string | null) => {
      updateField('theme', {
        ...data.theme,
        stylize: value || undefined,
      })
    },
    [data.theme, updateField]
  )

  const isRelation = data.template.startsWith('relation-')
  const isRoot = data.dataField === 'root'
  const showValue =
    data.template.startsWith('chart-') || data.dataField === 'values'
  const showChildren =
    data.template.startsWith('compare-') ||
    data.template.startsWith('hierarchy-') ||
    isRoot

  let itemsLabel = t('dataItems')
  if (isRelation) {
    itemsLabel = t('nodes')
  } else if (isRoot) {
    itemsLabel = t('rootNode')
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        {/* Template Selection */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground text-xs">
            {t('template')}
          </Label>
          <Select onValueChange={handleTemplateChange} value={data.template}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_GROUPS.map((group) => (
                <SelectGroup key={group.labelKey}>
                  <SelectLabel>{t(group.labelKey)}</SelectLabel>
                  {group.templates.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title & Description */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground text-xs">{t('title')}</Label>
          <Input
            onChange={(e) => updateField('title', e.target.value || undefined)}
            placeholder={t('infographicTitle')}
            value={data.title ?? ''}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground text-xs">
            {t('description')}
          </Label>
          <Input
            onChange={(e) => updateField('desc', e.target.value || undefined)}
            placeholder={t('infographicDescription')}
            value={data.desc ?? ''}
          />
        </div>

        {/* Data Items */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground text-xs">
              {itemsLabel}
            </Label>
            {!isRoot && (
              <Button onClick={addItem} size="icon-xs" variant="ghost">
                <PlusIcon className="size-3.5" />
              </Button>
            )}
          </div>

          {isRoot && data.items[0] ? (
            <RootItemEditor
              item={data.items[0]}
              onChange={(item) => updateItem(0, item)}
              showValue={showValue}
              t={t}
            />
          ) : (
            <SortableList
              items={data.items}
              onItemsChange={handleItemsChange}
              renderItem={(item, index, dragControls) => (
                <ItemEditor
                  dragControls={dragControls}
                  index={index}
                  item={item}
                  onChange={(updated) => updateItem(index, updated)}
                  onRemove={() => removeItem(index)}
                  showChildren={showChildren}
                  showValue={showValue}
                  t={t}
                />
              )}
            />
          )}
        </div>

        {/* Relations (for relation-* templates) */}
        {isRelation && data.relations && (
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground text-xs">
              {t('relations')}
            </Label>
            <div className="flex flex-col gap-1">
              {data.relations.map((rel, index) => (
                <Input
                  className="font-mono text-xs"
                  key={index}
                  onChange={(e) => {
                    const newRelations = [...(data.relations || [])]
                    newRelations[index] = { raw: e.target.value }
                    updateField('relations', newRelations)
                  }}
                  value={rel.raw}
                />
              ))}
              <Button
                className="self-start"
                onClick={() => {
                  updateField('relations', [
                    ...(data.relations || []),
                    { raw: '' },
                  ])
                }}
                size="xs"
                variant="ghost"
              >
                <PlusIcon className="size-3" />
                {t('addRelation')}
              </Button>
            </div>
          </div>
        )}

        {/* Theme */}
        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground text-xs">{t('theme')}</Label>
          <div className="flex gap-2">
            <Select
              onValueChange={handleThemeModeChange}
              value={data.theme?.mode ?? ''}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder={t('auto')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('auto')}</SelectItem>
                <SelectItem value="light">{t('light')}</SelectItem>
                <SelectItem value="dark">{t('dark')}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              className="flex-1"
              onChange={(e) => handlePaletteChange(e.target.value)}
              placeholder={t('colorPalette')}
              value={data.theme?.palette?.join(',') ?? ''}
            />
          </div>
          {/* Palette color preview */}
          {data.theme?.palette &&
            data.theme.palette.length > 0 &&
            data.theme.palette[0].startsWith('#') && (
              <div className="flex gap-1">
                {data.theme.palette.map((color, i) => (
                  <div
                    className="size-5 rounded-full border border-border"
                    key={i}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            )}
          {/* Stylize */}
          <div className="flex items-center gap-2">
            <Label className="shrink-0 text-muted-foreground text-xs">
              {t('stylize')}
            </Label>
            <Select
              onValueChange={handleStylizeChange}
              value={data.theme?.stylize ?? ''}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={t('stylizeNone')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('stylizeNone')}</SelectItem>
                <SelectItem value="rough">{t('stylizeRough')}</SelectItem>
                <SelectItem value="pattern">{t('stylizePattern')}</SelectItem>
                <SelectItem value="linear-gradient">
                  {t('stylizeLinearGradient')}
                </SelectItem>
                <SelectItem value="radial-gradient">
                  {t('stylizeRadialGradient')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

// --- Reusable Sortable List ---

function SortableList({
  items,
  onItemsChange,
  renderItem,
  className,
}: {
  items: InfographicItem[]
  onItemsChange: (items: InfographicItem[]) => void
  renderItem: (
    item: InfographicItem,
    index: number,
    dragControls: DragControls
  ) => React.ReactNode
  className?: string
}) {
  const idsRef = useRef<string[]>(items.map(() => nanoid()))
  if (idsRef.current.length !== items.length) {
    idsRef.current = items.map(() => nanoid())
  }

  const [dragIdOrder, setDragIdOrder] = useState<string[] | null>(null)
  const displayIds = dragIdOrder ?? idsRef.current
  const displayItems = displayIds.map((id) => {
    const idx = idsRef.current.indexOf(id)
    return items[idx]
  })

  const handleReorder = useCallback((newOrder: string[]) => {
    setDragIdOrder(newOrder)
  }, [])

  const commitReorder = useCallback(() => {
    if (dragIdOrder) {
      const reordered = dragIdOrder.map((id) => {
        const idx = idsRef.current.indexOf(id)
        return items[idx]
      })
      idsRef.current = [...dragIdOrder]
      onItemsChange(reordered)
      setDragIdOrder(null)
    }
  }, [dragIdOrder, items, onItemsChange])

  return (
    <Reorder.Group
      as="div"
      axis="y"
      className={className ?? 'flex flex-col gap-1.5'}
      onReorder={handleReorder}
      values={displayIds}
    >
      {displayIds.map((id, index) => (
        <SortableWrapper id={id} key={id} onDragEnd={commitReorder}>
          {(dragControls) =>
            renderItem(displayItems[index], index, dragControls)
          }
        </SortableWrapper>
      ))}
    </Reorder.Group>
  )
}

function SortableWrapper({
  id,
  onDragEnd,
  children,
}: {
  id: string
  onDragEnd: () => void
  children: (dragControls: DragControls) => React.ReactNode
}) {
  const controls = useDragControls()
  return (
    <Reorder.Item
      as="div"
      dragControls={controls}
      dragListener={false}
      onDragEnd={onDragEnd}
      style={{ position: 'relative' }}
      value={id}
    >
      {children(controls)}
    </Reorder.Item>
  )
}

// --- Item Editor ---

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

function ItemEditor({
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

// --- Child Item Editor (simpler, no nested children) ---

interface ChildItemEditorProps {
  item: InfographicItem
  index: number
  onChange: (item: InfographicItem) => void
  onRemove: () => void
  showValue: boolean
  dragControls?: DragControls
  t: ReturnType<typeof useTranslations<'slideEditor'>>
}

function ChildItemEditor({
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

// --- Root Item Editor (for hierarchy-tree-*) ---

interface RootItemEditorProps {
  item: InfographicItem
  onChange: (item: InfographicItem) => void
  showValue: boolean
  t: ReturnType<typeof useTranslations<'slideEditor'>>
}

function RootItemEditor({ item, onChange, showValue, t }: RootItemEditorProps) {
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
