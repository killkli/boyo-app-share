/**
 * 創作者資訊（包含可選連結）
 */
export interface CreatorWithLink {
  name: string
  link?: string
}

/**
 * 創作者輸入類型（支援字串或物件格式）
 */
export type CreatorInput = string | CreatorWithLink

/**
 * 標準化創作者輸入（支援字串或物件）
 * @param input 創作者輸入（字串或物件）
 * @returns 標準化的創作者物件
 */
export function normalizeCreatorInput(input: CreatorInput): CreatorWithLink {
  if (typeof input === 'string') {
    return { name: input.trim() }
  }
  return {
    name: input.name.trim(),
    link: input.link?.trim() || undefined
  }
}
