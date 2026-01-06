import type { Infographic } from '@/lib/slide-schema'

export const slideData: Infographic[] = [
  {
    id: '1',
    content: `infographic list-row-simple-horizontal-arrow
data
  items
    - label 步骤 1
      desc 开始
      icon mdi/lightbulb-on
    - label 步骤 2
      desc 规划
      icon mdi/clipboard-text-outline
    - label 步骤 3
      desc 执行
      icon mdi/rocket-launch-outline
    - label 步骤 4
      desc 检查
      icon mdi/checklist
    - label 步骤 5
      desc 完成
      icon mdi/check-circle`,
  },
  {
    id: '2',
    content: `infographic chart-column-simple
data
  title 年度营收增长
  desc 展示近三年及本年目标营收对比（单位：亿元）
  items
    - label 2021年
      value 120
      desc 转型初期，稳步试水
      icon lucide/sprout
    - label 2022年
      value 150
      desc 平台优化，效率显著提升
      icon lucide/zap
    - label 2023年
      value 190
      desc 深化数智融合，全面增长
      icon lucide/brain-circuit
    - label 2024年
      value 240
      desc 拓展生态协同，冲击新高
      icon lucide/trophy
theme light
  palette antv`,
  },
  {
    id: '3',
    content: `infographic compare-hierarchy-row-letter-card-rounded-rect-node
data
  title 竞品分析
  desc 通过对比分析，找出差距，明确改进方向
  items
    - label 产品分析
      children
        - label 架构升级
          desc 品牌营销策略就是以品牌输出为核心的营销策略
        - label 架构升级
          desc 品牌营销策略就是以品牌输出为核心的营销策略
        - label 架构升级
          desc 品牌营销策略就是以品牌输出为核心的营销策略
    - label 竞品分析
      children
        - label 架构升级
          desc 品牌营销策略就是以品牌输出为核心的营销策略
        - label 架构升级
          desc 品牌营销策略就是以品牌输出为核心的营销策略
        - label 架构升级
          desc 品牌营销策略就是以品牌输出为核心的营销策略
theme light
  palette antv`,
  },
]
