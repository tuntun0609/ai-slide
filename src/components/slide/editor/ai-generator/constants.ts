// 工具名称到翻译键的映射
// 注意：这个文件不再直接包含翻译文本，而是使用翻译键
// 实际的翻译文本在 locale 文件中
type AiGeneratorTranslationKey =
  | 'createInfographic'
  | 'editInfographic'
  | 'deleteInfographic'

export const toolTitleKeys: Record<string, AiGeneratorTranslationKey> = {
  createInfographic: 'createInfographic',
  editInfographic: 'editInfographic',
  deleteInfographic: 'deleteInfographic',
}

// 节流间隔时间（毫秒）
export const THROTTLE_INTERVAL = 300
