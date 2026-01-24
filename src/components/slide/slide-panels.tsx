'use client'

import { useSetAtom } from 'jotai'
import Cookies from 'js-cookie'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { Layout, PanelImperativeHandle } from 'react-resizable-panels'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  editingInfographicContentAtom,
  type SlideData,
  selectedInfographicIdAtom,
  slideAtom,
} from '@/store/slide-store'
import { RESIZABLE_PANELS_COOKIE_NAME } from '@/type'
import { AIGenerator } from './editor/ai-generator'
import { InfographicEditor } from './editor/infographic-editor'
import { InfographicViewer } from './infographic-viewer'

export function SlidePanels({
  slideId,
  defaultLayout,
  initialSlideData,
}: {
  slideId: string
  defaultLayout?: Layout
  initialSlideData?: SlideData
}) {
  const panelRef = useRef<PanelImperativeHandle>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const setSlide = useSetAtom(slideAtom)
  const setSelectedInfographicId = useSetAtom(selectedInfographicIdAtom)
  const setEditingContent = useSetAtom(editingInfographicContentAtom)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'editor'

  // 初始化 slide 数据
  useEffect(() => {
    if (initialSlideData) {
      setSlide(initialSlideData)
      // 如果有 infographics，默认选中第一个
      if (initialSlideData.infographics.length > 0) {
        const firstInfographic = initialSlideData.infographics[0]
        setSelectedInfographicId(firstInfographic.id)
        setEditingContent(firstInfographic.content)
      }
    }
  }, [initialSlideData, setSlide, setSelectedInfographicId, setEditingContent])

  const onLayoutChange = (layout: Layout) => {
    Cookies.set(RESIZABLE_PANELS_COOKIE_NAME, JSON.stringify(layout))
  }

  const toggleCollapse = () => {
    const panel = panelRef.current
    if (panel) {
      if (isCollapsed) {
        panel.expand()
      } else {
        panel.collapse()
      }
    }
  }

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'editor') {
      // 如果切换到默认值，移除 searchParams
      params.delete('tab')
    } else {
      params.set('tab', value)
    }
    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname
    router.push(newUrl)
  }

  const handleSeparatorClick = () => {
    if (isCollapsed) {
      const panel = panelRef.current
      if (panel) {
        panel.expand()
      }
    }
  }

  return (
    <main className="flex h-full overflow-hidden p-4 pt-0">
      <Group
        className="h-full w-full"
        defaultLayout={defaultLayout}
        onLayoutChange={onLayoutChange}
        orientation="horizontal"
      >
        <Panel
          className="overflow-hidden rounded-xl border bg-card shadow-xs"
          defaultSize={70}
          minSize={30}
        >
          <div className="relative h-full">
            <InfographicViewer slideId={slideId} />
            {isCollapsed && (
              <Button
                className="absolute top-2 right-2 z-10 h-10 w-8"
                onClick={toggleCollapse}
                size="icon"
                variant="ghost"
              >
                <PanelRightOpen className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Panel>

        <Separator
          className="relative w-2 cursor-pointer rounded-full bg-transparent transition-all hover:bg-primary/5 focus-visible:outline-none data-[dragging=true]:bg-primary/10"
          onClick={handleSeparatorClick}
        >
          <div className="mx-auto h-full w-px" />
        </Separator>

        <Panel
          className={cn(
            'overflow-hidden rounded-xl border bg-card shadow-xs transition-all duration-300',
            isCollapsed ? 'border-transparent bg-transparent shadow-none' : ''
          )}
          collapsible
          defaultSize={30}
          minSize="300px"
          onResize={(size) => {
            setIsCollapsed(size.asPercentage === 0)
          }}
          panelRef={panelRef}
        >
          {!isCollapsed && (
            <div className="flex h-full flex-col">
              <Tabs
                className="flex h-full flex-col"
                onValueChange={handleTabChange}
                value={currentTab}
              >
                <div className="flex h-14 items-center justify-between border-b p-2 px-4">
                  <TabsList className="h-auto bg-transparent p-0">
                    <TabsTrigger
                      className="data-active:bg-transparent data-active:shadow-none"
                      value="editor"
                    >
                      编辑器
                    </TabsTrigger>
                    <TabsTrigger
                      className="data-active:bg-transparent data-active:shadow-none"
                      value="ai"
                    >
                      AI 生成
                    </TabsTrigger>
                  </TabsList>
                  <Button
                    className="h-8 w-8"
                    onClick={toggleCollapse}
                    size="icon"
                    variant="ghost"
                  >
                    <PanelRightClose className="h-4 w-4" />
                  </Button>
                </div>
                <TabsContent className="min-h-0 flex-1" value="editor">
                  <InfographicEditor slideId={slideId} />
                </TabsContent>
                <TabsContent className="min-h-0 flex-1" value="ai">
                  <AIGenerator slideId={slideId} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </Panel>
      </Group>
    </main>
  )
}
