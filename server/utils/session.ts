import { getServerSession } from '#auth'
import type { H3Event } from 'h3'

/**
 * 取得當前登入使用者的 session
 */
export async function getSession(event: H3Event) {
  return await getServerSession(event)
}

/**
 * 要求使用者必須登入（middleware helper）
 * @throws {Error} 401 Unauthorized if user is not authenticated
 */
export async function requireAuth(event: H3Event) {
  const session = await getSession(event)

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please sign in'
    })
  }

  return session.user
}

/**
 * 取得當前登入使用者的 ID（可選）
 * @returns userId or null if not authenticated
 */
export async function getUserId(event: H3Event): Promise<string | null> {
  const session = await getSession(event)
  return session?.user?.id || null
}
