import { atom } from 'jotai'
import type { Infographic } from '@/lib/slide-schema'
import { slideData } from '@/mock/slide-data'

// Slide 完整数据
export interface SlideData {
  id: string
  title: string
  infographics: Infographic[]
  createdAt?: Date
  updatedAt?: Date
}

// 当前 slide 数据
export const slideAtom = atom<SlideData | null>({
  id: '1',
  title: 'Test Slide',
  infographics: slideData,
  createdAt: new Date(),
  updatedAt: new Date(),
})

// 当前选中的 infographic ID
export const selectedInfographicIdAtom = atom<string | null>('1')

// 当前编辑的 infographic content
export const editingInfographicContentAtom = atom<string>('')

// 根据 selectedInfographicIdAtom 获取当前选中的 infographic
export const selectedInfographicAtom = atom((get) => {
  const slide = get(slideAtom)
  const selectedId = get(selectedInfographicIdAtom)

  if (!(slide && selectedId)) {
    return null
  }

  return slide.infographics.find((info) => info.id === selectedId) || null
})

// 更新 infographic content 的 atom
export const updateInfographicContentAtom = atom(
  null,
  (
    get,
    set,
    { infographicId, content }: { infographicId: string; content: string }
  ) => {
    const slide = get(slideAtom)
    if (!slide) {
      return
    }

    const updatedInfographics = slide.infographics.map((info) =>
      info.id === infographicId ? { ...info, content } : info
    )

    set(slideAtom, {
      ...slide,
      infographics: updatedInfographics,
    })

    // 如果正在编辑这个 infographic，也更新编辑内容
    if (get(selectedInfographicIdAtom) === infographicId) {
      set(editingInfographicContentAtom, content)
    }
  }
)

// 添加新的 infographic
export const addInfographicAtom = atom(
  null,
  (
    get,
    set,
    {
      infographic,
      afterId,
    }: { infographic: Infographic; afterId?: string | null }
  ) => {
    const slide = get(slideAtom)
    if (!slide) {
      return
    }

    let updatedInfographics: Infographic[]

    if (afterId) {
      // 在当前页之后插入
      const currentIndex = slide.infographics.findIndex(
        (info) => info.id === afterId
      )
      if (currentIndex >= 0) {
        // 在找到的位置之后插入
        updatedInfographics = [
          ...slide.infographics.slice(0, currentIndex + 1),
          infographic,
          ...slide.infographics.slice(currentIndex + 1),
        ]
      } else {
        // 如果找不到，添加到末尾
        updatedInfographics = [...slide.infographics, infographic]
      }
    } else {
      // 如果没有指定 afterId，添加到末尾（向后兼容）
      updatedInfographics = [...slide.infographics, infographic]
    }

    set(slideAtom, {
      ...slide,
      infographics: updatedInfographics,
    })

    // 自动选中新添加的 infographic
    set(selectedInfographicIdAtom, infographic.id)
    set(editingInfographicContentAtom, infographic.content)
  }
)

// 删除 infographic
export const deleteInfographicAtom = atom(
  null,
  (get, set, infographicId: string) => {
    const slide = get(slideAtom)
    if (!slide) {
      return
    }

    const updatedInfographics = slide.infographics.filter(
      (info) => info.id !== infographicId
    )

    if (updatedInfographics.length === 0) {
      // 如果没有 infographic 了，清空选中状态
      set(selectedInfographicIdAtom, null)
      set(editingInfographicContentAtom, '')
    } else if (get(selectedInfographicIdAtom) === infographicId) {
      // 如果删除的是当前选中的，选中第一个
      const firstInfographic = updatedInfographics[0]
      set(selectedInfographicIdAtom, firstInfographic.id)
      set(editingInfographicContentAtom, firstInfographic.content)
    }

    set(slideAtom, {
      ...slide,
      infographics: updatedInfographics,
    })
  }
)
