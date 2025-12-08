import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  // 獲取 App ID
  const appId = event.context.params?.id
  if (!appId) {
    throw createError({
      statusCode: 400,
      message: 'App ID is required'
    })
  }

  // 獲取評論列表（包含使用者資訊）
  const result = await query(
    `SELECT
       c.id,
       c.app_id,
       c.user_id,
       c.content,
       c.created_at,
       c.updated_at,
       u.username,
       u.avatar_url
     FROM comments c
     LEFT JOIN users u ON c.user_id = u.id
     WHERE c.app_id = $1
     ORDER BY c.created_at DESC`,
    [appId]
  )

  return {
    comments: result.rows
  }
})
