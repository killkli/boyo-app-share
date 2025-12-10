import { query } from '~/server/utils/db'
import { getAppCreators } from '~/server/utils/creators'

export default defineEventHandler(async (event) => {
  // 獲取 App ID
  const id = event.context.params?.id

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'App ID is required'
    })
  }

  // 獲取當前用戶 ID（如果已登入）
  const currentUserId = event.context.userId

  // 查詢 App 詳情（包含作者資訊和統計數據）
  const result = await query(
    `SELECT
      a.id,
      a.title,
      a.description,
      a.user_id,
      a.category,
      a.tags,
      a.upload_type,
      a.html_s3_key,
      a.file_manifest,
      a.view_count,
      a.created_at,
      a.updated_at,
      u.username as author_username,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(DISTINCT r.id)::integer as rating_count,
      COUNT(DISTINCT c.id)::integer as comment_count,
      COUNT(DISTINCT f.id)::integer as favorite_count
    FROM apps a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN ratings r ON a.id = r.app_id
    LEFT JOIN comments c ON a.id = c.app_id
    LEFT JOIN favorites f ON a.id = f.app_id
    WHERE a.id = $1
    GROUP BY a.id, u.username`,
    [id]
  )

  if (result.rows.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'App not found'
    })
  }

  const app = result.rows[0]

  // 如果用戶已登入，獲取該用戶對此 App 的評分和收藏狀態
  let userRating = null
  let isFavorited = false
  if (currentUserId) {
    const userRatingResult = await query(
      'SELECT rating FROM ratings WHERE app_id = $1 AND user_id = $2',
      [id, currentUserId]
    )
    if (userRatingResult.rows.length > 0) {
      userRating = userRatingResult.rows[0].rating
    }

    // 檢查是否已收藏
    const favoriteResult = await query(
      'SELECT id FROM favorites WHERE app_id = $1 AND user_id = $2',
      [id, currentUserId]
    )
    isFavorited = favoriteResult.rows.length > 0
  }

  // 增加瀏覽次數
  await query(
    'UPDATE apps SET view_count = view_count + 1 WHERE id = $1',
    [id]
  )

  // 獲取創作者列表
  const creators = await getAppCreators(id)

  return {
    app: {
      ...app,
      avg_rating: Number(app.avg_rating),
      user_rating: userRating,
      is_favorited: isFavorited,
      creators
    }
  }
})
