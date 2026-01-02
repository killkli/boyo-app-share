import { requireAdmin } from '~/server/utils/admin'
import { query } from '~/server/utils/db'
import { z } from 'zod'

const paramsSchema = z.object({
  id: z.string().uuid()
})

/**
 * DELETE /api/admin/comments/:id
 * 刪除留言（管理員專用）
 */
export default defineEventHandler(async (event) => {
  // 驗證管理員權限
  await requireAdmin(event)

  // 解析參數
  const params = paramsSchema.parse(getRouterParams(event))
  const { id } = params

  // 檢查留言是否存在
  const commentResult = await query(
    'SELECT id, content FROM comments WHERE id = $1',
    [id]
  )

  if (commentResult.rows.length === 0) {
    throw createError({
      statusCode: 404,
      message: '找不到該留言'
    })
  }

  // 刪除留言
  await query('DELETE FROM comments WHERE id = $1', [id])

  return {
    success: true,
    message: '已刪除留言'
  }
})
