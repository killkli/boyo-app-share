import { requireAdmin } from '~/server/utils/admin'
import { query } from '~/server/utils/db'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  visibility: z.enum(['all', 'public', 'private']).default('all'),
  featured: z.enum(['all', 'featured', 'normal']).default('all'),
  sort: z.enum(['created_at', 'title', 'view_count']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc')
})

/**
 * GET /api/admin/apps
 * 取得所有 App 列表（管理員專用，包含私人 App）
 */
export default defineEventHandler(async (event) => {
  // 驗證管理員權限
  await requireAdmin(event)

  // 解析查詢參數
  const rawQuery = getQuery(event)
  const params = querySchema.parse(rawQuery)

  const { page, limit, search, category, visibility, featured, sort, order } = params
  const offset = (page - 1) * limit

  // 建構查詢條件
  const conditions: string[] = []
  const values: any[] = []
  let paramIndex = 1

  // 搜尋條件
  if (search) {
    conditions.push(`(a.title ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex})`)
    values.push(`%${search}%`)
    paramIndex++
  }

  // 分類過濾
  if (category) {
    conditions.push(`a.category = $${paramIndex}`)
    values.push(category)
    paramIndex++
  }

  // 公開/私人過濾
  if (visibility === 'public') {
    conditions.push(`a.is_public = true`)
  } else if (visibility === 'private') {
    conditions.push(`a.is_public = false`)
  }

  // 精選過濾
  if (featured === 'featured') {
    conditions.push(`a.is_featured = true`)
  } else if (featured === 'normal') {
    conditions.push(`(a.is_featured = false OR a.is_featured IS NULL)`)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // 查詢總數
  const countResult = await query(
    `SELECT COUNT(*) as count FROM apps a ${whereClause}`,
    values
  )
  const total = parseInt(countResult.rows[0].count, 10)

  // 查詢 App 列表
  const appsResult = await query(
    `SELECT
      a.id, a.title, a.description, a.category, a.tags,
      a.upload_type, a.is_public, a.is_featured,
      a.view_count, a.like_count,
      a.created_at, a.updated_at,
      u.id as user_id, u.username, u.email as user_email,
      (SELECT COUNT(*) FROM comments WHERE app_id = a.id) as comment_count,
      (SELECT COALESCE(AVG(rating), 0) FROM ratings WHERE app_id = a.id) as avg_rating
    FROM apps a
    LEFT JOIN users u ON a.user_id = u.id
    ${whereClause}
    ORDER BY a.${sort} ${order.toUpperCase()}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...values, limit, offset]
  )

  return {
    apps: appsResult.rows.map(app => ({
      id: app.id,
      title: app.title,
      description: app.description,
      category: app.category,
      tags: app.tags,
      uploadType: app.upload_type,
      isPublic: app.is_public,
      isFeatured: app.is_featured || false,
      viewCount: app.view_count,
      likeCount: app.like_count,
      commentCount: parseInt(app.comment_count, 10),
      avgRating: parseFloat(app.avg_rating) || 0,
      createdAt: app.created_at,
      updatedAt: app.updated_at,
      author: {
        id: app.user_id,
        username: app.username,
        email: app.user_email
      }
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})
