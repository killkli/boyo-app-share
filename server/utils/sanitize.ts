/**
 * 清理用戶輸入，防止 XSS 攻擊
 */

/**
 * 清理 HTML 標籤，只保留純文字
 */
export function sanitizeText(input: string): string {
  if (!input) return ''

  return input
    // 移除 HTML 標籤
    .replace(/<[^>]*>/g, '')
    // 移除 script 標籤內容
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // 移除事件處理器
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // 移除 javascript: 協議
    .replace(/javascript:/gi, '')
    // 轉換特殊字元
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    // 限制長度
    .slice(0, 10000)
    .trim()
}

/**
 * 清理 URL，確保安全
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''

  // 只允許 http/https 協議
  const urlPattern = /^https?:\/\//i
  if (!urlPattern.test(url)) {
    return ''
  }

  // 移除危險的協議
  const sanitized = url
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')

  return sanitized.slice(0, 2000).trim()
}

/**
 * 清理 markdown 內容
 * 允許基本的 markdown 語法，但移除危險的 HTML
 */
export function sanitizeMarkdown(input: string): string {
  if (!input) return ''

  return input
    // 移除 script 標籤
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // 移除 iframe
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // 移除事件處理器
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // 移除 javascript: 協議
    .replace(/javascript:/gi, '')
    // 移除 data: 協議（除了圖片）
    .replace(/(?<!src=["'])data:/gi, '')
    // 限制長度
    .slice(0, 50000)
    .trim()
}

/**
 * 清理檔案名稱
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return ''

  return filename
    // 移除路徑遍歷
    .replace(/\.\./g, '')
    .replace(/\//g, '')
    .replace(/\\/g, '')
    // 只保留安全字元
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    // 限制長度
    .slice(0, 255)
    .trim()
}

/**
 * 批量清理物件中的字串欄位
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const sanitized = { ...obj }

  for (const field of fields) {
    if (typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeText(sanitized[field] as string) as T[keyof T]
    }
  }

  return sanitized
}
