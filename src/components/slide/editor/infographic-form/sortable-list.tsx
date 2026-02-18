'use client'

import type { DragControls } from 'motion/react'
import { Reorder, useDragControls } from 'motion/react'
import { nanoid } from 'nanoid'
import { useCallback, useRef, useState } from 'react'
import type { InfographicItem } from '@/lib/infographic-parser'

interface SortableListProps {
  items: InfographicItem[]
  onItemsChange: (items: InfographicItem[]) => void
  renderItem: (
    item: InfographicItem,
    index: number,
    dragControls: DragControls
  ) => React.ReactNode
  className?: string
}

export function SortableList({
  items,
  onItemsChange,
  renderItem,
  className,
}: SortableListProps) {
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

interface SortableWrapperProps {
  id: string
  onDragEnd: () => void
  children: (dragControls: DragControls) => React.ReactNode
}

function SortableWrapper({ id, onDragEnd, children }: SortableWrapperProps) {
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
