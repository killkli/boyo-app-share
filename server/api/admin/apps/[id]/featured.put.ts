import { requireAdmin } from '~/server/utils/admin'
import { query } from '~/server/utils/db'
import { z } from 'zod'

const paramsSchema = z.object({
  id: z.string().uuid()
})

const bodySchema = z.object({
  isFeatured: z.boolean()
})

/**
 * PUT /api/admin/apps/:id/featured
 * 設定 App 精選狀態（管理員專用）
 */
export default defineEventHandler(async (event) => {
  // 驗證管理員權限
  await requireAdmin(event)

  // 解析參數
  const params = paramsSchema.parse(getRouterParams(event))
  const body = bodySchema.parse(await readBody(event))

  const { id } = params
  const { isFeatured } = body

  // 檢查 App 是否存在
  const appResult = await query(
    'SELECT id, title FROM apps WHERE id = $1',
    [id]
  )

  if (appResult.rows.length === 0) {
    throw createError({
      statusCode: 404,
      message: '找不到該 App'
    })
  }

  const app = appResult.rows[0]

  // 更新精選狀態
  await query(
    'UPDATE apps SET is_featured = $1, updated_at = NOW() WHERE id = $2',
    [isFeatured, id]
  )

  return {
    success: true,
    message: isFeatured ? `已將「${app.title}」設為精選` : `已取消「${app.title}」的精選`
  }
})
