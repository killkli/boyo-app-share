import type { H3Event } from 'h3'

/**
 * 判斷指定 email 是否為管理員
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  
  const config = useRuntimeConfig()
  const adminEmailsConfig = config.public.adminEmails
  
  // 處理字串 (環境變數) 或陣列 (Runtime Config 直接設定)
  const adminEmails = Array.isArray(adminEmailsConfig)
    ? adminEmailsConfig
    : (String(adminEmailsConfig) || '').split(',').map(e => e.trim())

  return adminEmails.some(adminEmail => adminEmail.toLowerCase() === email.toLowerCase())
}

/**
 * 要求管理員權限（API middleware helper）
 * @throws {H3Error} 401 未登入 / 403 非管理員
 */
export async function requireAdmin(event: H3Event) {
  // 動態引入避免測試時的模組解析問題
  const { getSession } = await import('./session')
  const session = await getSession(event)

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      message: '請先登入'
    })
  }

  if (!isAdmin(session.user.email)) {
    throw createError({
      statusCode: 403,
      message: '需要管理員權限'
    })
  }

  return session.user
}
