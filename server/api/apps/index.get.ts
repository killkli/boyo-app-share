import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  // 獲取查詢參數
  const queryParams = getQuery(event)

  const page = parseInt(queryParams.page as string) || 1
  const limit = parseInt(queryParams.limit as string) || 12
  const category = queryParams.category as string
  const tags = queryParams.tags as string // 可以是逗號分隔的標籤
  const sort = queryParams.sort as string || 'latest' // latest 或 popular
  const search = queryParams.search as string

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
      u.email as author_email
    FROM apps a
    INNER JOIN users u ON a.user_id = u.id
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

  // 排序
  if (sort === 'popular') {
    sql += ` ORDER BY a.view_count DESC, a.created_at DESC`
  } else {
    // 默認按最新排序
    sql += ` ORDER BY a.created_at DESC`
  }

  // 計算總數
  const countSql = `
    SELECT COUNT(*) as total
    FROM apps a
    WHERE a.is_public = true
    ${category ? `AND a.category = $1` : ''}
    ${tags ? `AND a.tags && $${category ? 2 : 1}` : ''}
    ${search ? `AND (
      LOWER(a.title) LIKE LOWER($${
        (category ? 1 : 0) + (tags ? 1 : 0) + 1
      }) OR
      LOWER(a.description) LIKE LOWER($${
        (category ? 1 : 0) + (tags ? 1 : 0) + 1
      })
    )` : ''}
  `

  const countParams: any[] = []
  if (category) countParams.push(category)
  if (tags) {
    const tagList = tags.split(',').map(t => t.trim())
    countParams.push(tagList)
  }
  if (search) countParams.push(`%${search}%`)

  const countResult = await query(countSql, countParams)
  const total = parseInt(countResult.rows[0].total)

  // 分頁
  const offset = (page - 1) * limit
  sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
  params.push(limit, offset)

  // 執行查詢
  const result = await query(sql, params)

  return {
    apps: result.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
})
