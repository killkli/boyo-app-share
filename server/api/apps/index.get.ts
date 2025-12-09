import { query } from '~/server/utils/db'
import { getAppCreators } from '~/server/utils/creators'

export default defineEventHandler(async (event) => {
  // 獲取查詢參數
  const queryParams = getQuery(event)

  const page = parseInt(queryParams.page as string) || 1
  const limit = parseInt(queryParams.limit as string) || 12
  const category = queryParams.category as string
  const tags = queryParams.tags as string // 可以是逗號分隔的標籤
  const sort = queryParams.sort as string || 'latest' // latest, popular, rating
  const search = queryParams.search as string
  const minRating = parseFloat(queryParams.minRating as string) || 0 // 最低評分過濾

  // 建立 SQL 查詢
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
    WHERE a.is_public = true
  `

  const params: any[] = []
  let paramIndex = 1

  // 分類篩選
  if (category) {
    sql += ` AND a.category = $${paramIndex}`
    params.push(category)
    paramIndex++
  }

  // 標籤篩選（支援多個標籤，用逗號分隔）
  if (tags) {
    const tagList = tags.split(',').map(t => t.trim())
    sql += ` AND a.tags && $${paramIndex}` // && 是 PostgreSQL 陣列重疊運算子
    params.push(tagList)
    paramIndex++
  }

  // 搜尋（標題或描述）
  if (search) {
    sql += ` AND (
      LOWER(a.title) LIKE LOWER($${paramIndex}) OR
      LOWER(a.description) LIKE LOWER($${paramIndex})
    )`
    params.push(`%${search}%`)
    paramIndex++
  }

  // 必須 GROUP BY，因為使用了聚合函數
  sql += ` GROUP BY a.id, u.username, u.email`

  // 評分過濾（使用 HAVING 子句）
  if (minRating > 0) {
    sql += ` HAVING COALESCE(AVG(r.rating), 0) >= $${paramIndex}`
    params.push(minRating)
    paramIndex++
  }

  // 排序
  if (sort === 'popular') {
    sql += ` ORDER BY a.view_count DESC, a.created_at DESC`
  } else if (sort === 'rating') {
    sql += ` ORDER BY avg_rating DESC, rating_count DESC, a.created_at DESC`
  } else {
    // 默認按最新排序
    sql += ` ORDER BY a.created_at DESC`
  }

  // 計算總數（需要使用子查詢來支持 HAVING 子句）
  let countSql = `
    SELECT COUNT(*) as total
    FROM (
      SELECT a.id
      FROM apps a
      LEFT JOIN ratings r ON a.id = r.app_id
      WHERE a.is_public = true
  `

  const countParams: any[] = []
  let countParamIndex = 1

  if (category) {
    countSql += ` AND a.category = $${countParamIndex}`
    countParams.push(category)
    countParamIndex++
  }

  if (tags) {
    const tagList = tags.split(',').map(t => t.trim())
    countSql += ` AND a.tags && $${countParamIndex}`
    countParams.push(tagList)
    countParamIndex++
  }

  if (search) {
    countSql += ` AND (
      LOWER(a.title) LIKE LOWER($${countParamIndex}) OR
      LOWER(a.description) LIKE LOWER($${countParamIndex})
    )`
    countParams.push(`%${search}%`)
    countParamIndex++
  }

  countSql += ` GROUP BY a.id`

  if (minRating > 0) {
    countSql += ` HAVING COALESCE(AVG(r.rating), 0) >= $${countParamIndex}`
    countParams.push(minRating)
    countParamIndex++
  }

  countSql += `) as filtered_apps`

  const countResult = await query(countSql, countParams)
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
