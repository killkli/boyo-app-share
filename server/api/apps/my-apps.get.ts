import { query } from '~/server/utils/db'
import { getAppCreators } from '~/server/utils/creators'

export default defineEventHandler(async (event) => {
  // 檢查使用者認證
  const userId = event.context.userId
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  // 獲取查詢參數
  const queryParams = getQuery(event)
  const page = parseInt(queryParams.page as string) || 1
  const limit = parseInt(queryParams.limit as string) || 12
  const sort = queryParams.sort as string || 'latest' // latest, popular, rating

  // 建立 SQL 查詢 - 獲取使用者創建的apps（包括公開和私有）
  let sql = `
    SELECT
      a.id,
      a.user_id,
      a.title,
      a.description,
      a.category,
      a.tags,
      a.upload_type,
      a.html_s3_key,
      a.file_manifest,
      a.thumbnail_s3_key,
      a.is_public,
      a.view_count,
      a.like_count,
      a.created_at,
      a.updated_at,
      u.username as author_username,
      u.email as author_email,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(DISTINCT r.id)::integer as rating_count,
      COUNT(DISTINCT c.id)::integer as comment_count
    FROM apps a
    INNER JOIN users u ON a.user_id = u.id
    LEFT JOIN ratings r ON a.id = r.app_id
    LEFT JOIN comments c ON a.id = c.app_id
    WHERE a.user_id = $1
  `

  const params: any[] = [userId]
  let paramIndex = 2

  // GROUP BY 子句
  sql += ` GROUP BY a.id, u.username, u.email`

  // 排序
  if (sort === 'popular') {
    sql += ` ORDER BY a.view_count DESC, a.created_at DESC`
  } else if (sort === 'rating') {
    sql += ` ORDER BY avg_rating DESC, rating_count DESC, a.created_at DESC`
  } else {
    // 默認按創建時間排序（最新的在前）
    sql += ` ORDER BY a.created_at DESC`
  }

  // 計算總數
  const countSql = `
    SELECT COUNT(*) as total
    FROM apps
    WHERE user_id = $1
  `

  const countResult = await query(countSql, [userId])
  const total = parseInt(countResult.rows[0].total)

  // 分頁
  const offset = (page - 1) * limit
  sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
  params.push(limit, offset)

  // 執行查詢
  const result = await query(sql, params)

  // 處理評分數據類型
  const apps = result.rows.map(app => ({
    ...app,
    avg_rating: Number(app.avg_rating)
  }))

  // 批量獲取所有apps的創作者
  const appIds = apps.map(app => app.id)
  const creatorsMap = appIds.length > 0 ? await getAppCreators(appIds) : {}

  // 將創作者添加到每個app
  const appsWithCreators = apps.map(app => ({
    ...app,
    creators: creatorsMap[app.id] || []
  }))

  return {
    apps: appsWithCreators,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
})
