import { Infographic as InfographicRenderer } from '@antv/infographic'
import PptxGenJS from 'pptxgenjs'
import type { Infographic } from '@/lib/slide-schema'

/**
 * 将信息图数组导出为 PPTX 文件
 */
export async function exportToPptx(
  infographics: Infographic[],
  title: string
): Promise<void> {
  const pptx = new PptxGenJS()
  pptx.title = title

  // 为每个 infographic 渲染 PNG 并添加到 PPTX
  for (const infographic of infographics) {
    if (!infographic.content || infographic.content.trim() === '') {
      continue
    }

    const dataUrl = await renderInfographicToPng(infographic.content)
    if (!dataUrl) {
      continue
    }

    const slide = pptx.addSlide()
    slide.addImage({
      data: dataUrl,
      x: 0,
      y: 0,
      w: '100%',
      h: '100%',
      sizing: { type: 'contain', w: '100%', h: '100%' },
    })
  }

  await pptx.writeFile({ fileName: `${title}.pptx` })
}

/**
 * 使用隐藏的 DOM 容器渲染单个 infographic 为 PNG data URL
 */
async function renderInfographicToPng(content: string): Promise<string | null> {
  const container = document.createElement('div')
  container.style.cssText =
    'position:fixed;left:-9999px;top:-9999px;width:1280px;height:720px;'
  document.body.appendChild(container)

  let instance: InfographicRenderer | null = null

  try {
    instance = new InfographicRenderer({
      container,
      width: 1280,
      height: 720,
      theme: 'light',
    })
    instance.render(content)

    // 等待渲染完成
    await new Promise((resolve) => setTimeout(resolve, 500))

    const dataUrl = await instance.toDataURL({ type: 'png', dpr: 2 })
    return dataUrl
  } catch (error) {
    console.error('Failed to render infographic to PNG:', error)
    return null
  } finally {
    if (instance) {
      instance.destroy()
    }
    document.body.removeChild(container)
  }
}
