import { requireAdmin } from '~/server/utils/admin'
import { query } from '~/server/utils/db'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  sort: z.enum(['created_at', 'email', 'username']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc')
})

/**
 * GET /api/admin/users
 * 取得用戶列表（管理員專用）
 */
export default defineEventHandler(async (event) => {
  // 驗證管理員權限
  await requireAdmin(event)

  // 解析查詢參數
  const rawQuery = getQuery(event)
  const params = querySchema.parse(rawQuery)

  const { page, limit, search, status, sort, order } = params
  const offset = (page - 1) * limit

  // 建構查詢條件
  const conditions: string[] = []
  const values: any[] = []
  let paramIndex = 1

  // 搜尋條件
  if (search) {
    conditions.push(`(email ILIKE $${paramIndex} OR username ILIKE $${paramIndex})`)
    values.push(`%${search}%`)
    paramIndex++
  }

  // 狀態過濾
  if (status === 'active') {
    conditions.push(`(is_active = true OR is_active IS NULL)`)
  } else if (status === 'inactive') {
    conditions.push(`is_active = false`)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // 查詢總數
  const countResult = await query(
    `SELECT COUNT(*) as count FROM users ${whereClause}`,
    values
  )
  const total = parseInt(countResult.rows[0].count, 10)

  // 查詢用戶列表
  const usersResult = await query(
    `SELECT
      id, email, username, avatar_url, image,
      email_verified, is_active, created_at, updated_at,
      (SELECT COUNT(*) FROM apps WHERE user_id = users.id) as app_count
    FROM users
    ${whereClause}
    ORDER BY ${sort} ${order.toUpperCase()}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...values, limit, offset]
  )

  return {
    users: usersResult.rows.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatar_url || user.image,
      emailVerified: user.email_verified,
      isActive: user.is_active !== false, // null 或 true 都視為啟用
      appCount: parseInt(user.app_count, 10),
      createdAt: user.created_at,
      updatedAt: user.updated_at
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})
