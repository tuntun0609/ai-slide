'use client'

import { useSetAtom } from 'jotai'
import { DevTools as JotaiDevTools } from 'jotai-devtools'
import Cookies from 'js-cookie'
import { PanelRightClose } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'
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

import 'jotai-devtools/styles.css'

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
  const pathname = usePathname()
  const setSlide = useSetAtom(slideAtom)
  const setSelectedInfographicId = useSetAtom(selectedInfographicIdAtom)
  const setEditingContent = useSetAtom(editingInfographicContentAtom)
  const lastSlideIdRef = useRef<string | null>(null)
  const searchParams = useSearchParams()
  const [currentTab, setCurrentTab] = useState<'editor' | 'ai'>(() => {
    const tab = searchParams.get('tab')
    return tab === 'ai' ? 'ai' : 'editor'
  })

  // 初始化 slide 数据 - 只在 slideId 或 initialSlideData 变化时运行
  useEffect(() => {
    if (!initialSlideData) {
      return
    }

    const isSlideChanged = lastSlideIdRef.current !== slideId

    // 只在首次加载或 slide 切换时设置数据
    if (lastSlideIdRef.current === null || isSlideChanged) {
      setSlide(initialSlideData)

      if (initialSlideData.infographics.length > 0) {
        const firstInfographic = initialSlideData.infographics[0]
        setSelectedInfographicId(firstInfographic.id)
        setEditingContent(firstInfographic.content)
      }
    }

    lastSlideIdRef.current = slideId
  }, [
    initialSlideData,
    setSlide,
    setSelectedInfographicId,
    setEditingContent,
    slideId,
  ])

  useEffect(() => {
    const tab = searchParams.get('tab')
    setCurrentTab(tab === 'ai' ? 'ai' : 'editor')
  }, [searchParams])

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
    const nextTab = value === 'ai' ? 'ai' : 'editor'
    setCurrentTab(nextTab)

    // 使用 window.history.replaceState 更新 URL，避免触发 Next.js 路由导航和服务器重新渲染
    const params = new URLSearchParams(searchParams.toString())
    if (nextTab === 'editor') {
      params.delete('tab')
    } else {
      params.set('tab', nextTab)
    }
    const query = params.toString()
    const newUrl = query ? `${pathname}?${query}` : pathname
    // 直接使用浏览器 API 更新 URL，不触发 Next.js 路由导航
    window.history.replaceState(null, '', newUrl)
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
      <JotaiDevTools />
      <Group
        className="h-full w-full"
        defaultLayout={defaultLayout}
        onLayoutChange={onLayoutChange}
        orientation="horizontal"
      >
        <Panel
          className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs"
          defaultSize={70}
          minSize="400px"
        >
          <div className="relative min-h-0 flex-1">
            <InfographicViewer
              isRightPanelCollapsed={isCollapsed}
              onToggleRightPanel={toggleCollapse}
              slideId={slideId}
            />
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
                <TabsContent
                  className="min-h-0 flex-1"
                  keepMounted
                  value="editor"
                >
                  <InfographicEditor slideId={slideId} />
                </TabsContent>
                <TabsContent className="min-h-0 flex-1" keepMounted value="ai">
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
