'use client'

import { PlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'
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
import { ItemEditor } from './item-editor'
import { RootItemEditor } from './root-item-editor'
import { SortableList } from './sortable-list'

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
