import { requireAdmin } from '~/server/utils/admin'
import { query } from '~/server/utils/db'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sort: z.enum(['created_at', 'updated_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc')
})

/**
 * GET /api/admin/comments
 * 取得所有留言列表（管理員專用）
 */
export default defineEventHandler(async (event) => {
  // 驗證管理員權限
  await requireAdmin(event)

  // 解析查詢參數
  const rawQuery = getQuery(event)
  const params = querySchema.parse(rawQuery)

  const { page, limit, search, sort, order } = params
  const offset = (page - 1) * limit

  // 建構查詢條件
  const conditions: string[] = []
  const values: any[] = []
  let paramIndex = 1

  // 搜尋條件（搜尋留言內容）
  if (search) {
    conditions.push(`c.content ILIKE $${paramIndex}`)
    values.push(`%${search}%`)
    paramIndex++
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // 查詢總數
  const countResult = await query(
    `SELECT COUNT(*) as count FROM comments c ${whereClause}`,
    values
  )
  const total = parseInt(countResult.rows[0].count, 10)

  // 查詢留言列表
  const commentsResult = await query(
    `SELECT
      c.id, c.content, c.created_at, c.updated_at,
      c.app_id,
      a.title as app_title,
      c.user_id,
      u.username, u.email as user_email
    FROM comments c
    LEFT JOIN apps a ON c.app_id = a.id
    LEFT JOIN users u ON c.user_id = u.id
    ${whereClause}
    ORDER BY c.${sort} ${order.toUpperCase()}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...values, limit, offset]
  )

  return {
    comments: commentsResult.rows.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      app: {
        id: comment.app_id,
        title: comment.app_title
      },
      author: {
        id: comment.user_id,
        username: comment.username,
        email: comment.user_email
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
