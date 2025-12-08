import { commentSchema } from '~/server/utils/validation'
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  // 檢查使用者認證
  const userId = event.context.userId
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  // 獲取 App ID
  const appId = event.context.params?.id
  if (!appId) {
    throw createError({
      statusCode: 400,
      message: 'App ID is required'
    })
  }

  // 讀取並驗證請求體
  const body = await readBody(event)
  const validated = commentSchema.parse(body)

  // 檢查 App 是否存在
  const appResult = await query(
    'SELECT id FROM apps WHERE id = $1',
    [appId]
  )

  if (appResult.rows.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'App not found'
    })
  }

  // 插入評論
  const commentResult = await query(
    `INSERT INTO comments (app_id, user_id, content)
     VALUES ($1, $2, $3)
     RETURNING id, app_id, user_id, content, created_at, updated_at`,
    [appId, userId, validated.content]
  )

  return {
    comment: commentResult.rows[0]
  }
})
