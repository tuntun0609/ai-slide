import { Infographic as InfographicRenderer } from '@antv/infographic'
import PptxGenJS from 'pptxgenjs'
import type { Infographic } from '@/lib/slide-schema'

// PPT slide dimensions in inches (LAYOUT_WIDE = 16:9)
const SLIDE_W = 13.333
const SLIDE_H = 7.5
const RENDER_DPR = 3
// Max pixel dimension for the longer side when exporting PNG
const MAX_RENDER_PX = 2560
// Regex for splitting viewBox values (whitespace and commas)
const VIEW_BOX_SPLIT_REGEX = /[\s,]+/

/**
 * 将信息图数组导出为 PPTX 文件
 */
export async function exportToPptx(
  infographics: Infographic[],
  title: string
): Promise<void> {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'
  pptx.title = title

  for (const infographic of infographics) {
    if (!infographic.content || infographic.content.trim() === '') {
      continue
    }

    const result = await renderInfographicToPng(infographic.content)
    if (!result) {
      continue
    }

    const { dataUrl, width: imgW, height: imgH } = result

    // 计算图片在 slide 上的位置和大小，保持原始宽高比并居中
    const imgAspect = imgW / imgH
    const slideAspect = SLIDE_W / SLIDE_H

    let w: number
    let h: number
    if (imgAspect > slideAspect) {
      // 图片更宽，以 slide 宽度为限
      w = SLIDE_W
      h = SLIDE_W / imgAspect
    } else {
      // 图片更高，以 slide 高度为限
      h = SLIDE_H
      w = SLIDE_H * imgAspect
    }

    const x = (SLIDE_W - w) / 2
    const y = (SLIDE_H - h) / 2

    const slide = pptx.addSlide()
    slide.addImage({ data: dataUrl, x, y, w, h })
  }

  await pptx.writeFile({ fileName: `${title}.pptx` })
}

interface RenderResult {
  dataUrl: string
  width: number
  height: number
}

/**
 * 渲染单个 infographic 为 PNG data URL，保持原始宽高比
 */
async function renderInfographicToPng(
  content: string
): Promise<RenderResult | null> {
  // 第一步：用临时容器渲染，获取 SVG 的 viewBox 以得到自然宽高比
  const probeContainer = document.createElement('div')
  probeContainer.style.cssText =
    'position:fixed;left:-9999px;top:-9999px;width:800px;height:800px;'
  document.body.appendChild(probeContainer)

  let naturalW = 0
  let naturalH = 0

  try {
    const probeInstance = new InfographicRenderer({
      container: probeContainer,
      width: 800,
      height: 800,
      theme: 'light',
    })
    probeInstance.render(content)
    await new Promise((resolve) => setTimeout(resolve, 200))

    const svg = probeContainer.querySelector('svg')
    if (svg) {
      const vb = svg.getAttribute('viewBox')
      if (vb) {
        const parts = vb.split(VIEW_BOX_SPLIT_REGEX).map(Number)
        if (parts.length === 4) {
          naturalW = parts[2]!
          naturalH = parts[3]!
        }
      }
      // 如果没有 viewBox，尝试从 width/height 属性获取
      if (!(naturalW && naturalH)) {
        naturalW = svg.width.baseVal.value || 800
        naturalH = svg.height.baseVal.value || 800
      }
    }

    probeInstance.destroy()
  } finally {
    document.body.removeChild(probeContainer)
  }

  if (!(naturalW && naturalH)) {
    naturalW = 800
    naturalH = 600
  }

  // 第二步：按自然宽高比计算渲染尺寸
  const aspect = naturalW / naturalH
  let renderW: number
  let renderH: number
  if (aspect >= 1) {
    renderW = MAX_RENDER_PX
    renderH = Math.round(MAX_RENDER_PX / aspect)
  } else {
    renderH = MAX_RENDER_PX
    renderW = Math.round(MAX_RENDER_PX * aspect)
  }

  // 第三步：用正确尺寸渲染并导出 PNG
  const container = document.createElement('div')
  container.style.cssText = `position:fixed;left:-9999px;top:-9999px;width:${renderW}px;height:${renderH}px;`
  document.body.appendChild(container)

  let instance: InfographicRenderer | null = null

  try {
    instance = new InfographicRenderer({
      container,
      width: renderW,
      height: renderH,
      theme: 'light',
    })
    instance.render(content)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const dataUrl = await instance.toDataURL({ type: 'png', dpr: RENDER_DPR })
    return { dataUrl, width: renderW, height: renderH }
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
