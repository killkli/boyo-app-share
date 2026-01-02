import type { H3Event } from 'h3'

/**
 * 管理員 email 白名單
 * 初期採用硬編碼方式，未來可改為環境變數或資料庫
 */
const ADMIN_EMAILS = ['dchensterebay@gmail.com']

/**
 * 判斷指定 email 是否為管理員
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
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
