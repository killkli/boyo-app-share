import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  // userId 由 auth middleware 注入
  const userId = event.context.userId

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  // 從資料庫獲取使用者資訊
  const result = await query(
    'SELECT id, email, username, created_at FROM users WHERE id = $1',
    [userId]
  )

  if (result.rows.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }

  return {
    user: result.rows[0]
  }
})
