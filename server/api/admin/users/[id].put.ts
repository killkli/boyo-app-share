import { requireAdmin, isAdmin } from '~/server/utils/admin'
import { query } from '~/server/utils/db'
import { z } from 'zod'

const bodySchema = z.object({
  isActive: z.boolean()
})

const paramsSchema = z.object({
  id: z.string().uuid()
})

/**
 * PUT /api/admin/users/:id
 * 更新用戶狀態（管理員專用）
 */
export default defineEventHandler(async (event) => {
  // 驗證管理員權限
  await requireAdmin(event)

  // 解析參數
  const params = paramsSchema.parse(getRouterParams(event))
  const body = bodySchema.parse(await readBody(event))

  const { id } = params
  const { isActive } = body

  // 檢查用戶是否存在
  const userResult = await query(
    'SELECT id, email FROM users WHERE id = $1',
    [id]
  )

  if (userResult.rows.length === 0) {
    throw createError({
      statusCode: 404,
      message: '找不到該用戶'
    })
  }

  const user = userResult.rows[0]

  // 不能禁用管理員自己
  if (isAdmin(user.email) && !isActive) {
    throw createError({
      statusCode: 400,
      message: '無法禁用管理員帳號'
    })
  }

  // 更新用戶狀態
  await query(
    'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2',
    [isActive, id]
  )

  return {
    success: true,
    message: isActive ? '已啟用用戶帳號' : '已禁用用戶帳號'
  }
})
