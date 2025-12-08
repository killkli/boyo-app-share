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

  // 檢查是否已收藏
  const existingFavorite = await query(
    'SELECT id FROM favorites WHERE app_id = $1 AND user_id = $2',
    [appId, userId]
  )

  let favorited: boolean

  if (existingFavorite.rows.length > 0) {
    // 已收藏 -> 取消收藏
    await query(
      'DELETE FROM favorites WHERE app_id = $1 AND user_id = $2',
      [appId, userId]
    )
    favorited = false
  } else {
    // 未收藏 -> 收藏
    await query(
      'INSERT INTO favorites (app_id, user_id) VALUES ($1, $2)',
      [appId, userId]
    )
    favorited = true
  }

  // 獲取收藏總數
  const countResult = await query(
    'SELECT COUNT(*) as count FROM favorites WHERE app_id = $1',
    [appId]
  )

  return {
    favorited,
    favoriteCount: Number(countResult.rows[0].count)
  }
})
