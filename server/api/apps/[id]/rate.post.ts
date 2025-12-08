import { ratingSchema } from '~/server/utils/validation'
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
  const validated = ratingSchema.parse(body)

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

  // 使用 UPSERT 插入或更新評分
  const ratingResult = await query(
    `INSERT INTO ratings (app_id, user_id, rating)
     VALUES ($1, $2, $3)
     ON CONFLICT (app_id, user_id)
     DO UPDATE SET rating = $3
     RETURNING rating`,
    [appId, userId, validated.rating]
  )

  // 計算平均評分
  const avgResult = await query(
    `SELECT
       COALESCE(AVG(rating), 0) as avg_rating,
       COUNT(*) as rating_count
     FROM ratings
     WHERE app_id = $1`,
    [appId]
  )

  return {
    rating: ratingResult.rows[0].rating,
    avgRating: Number(avgResult.rows[0].avg_rating),
    ratingCount: Number(avgResult.rows[0].rating_count)
  }
})
