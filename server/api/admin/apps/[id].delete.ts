import { requireAdmin } from '~/server/utils/admin'
import { query } from '~/server/utils/db'
import { deleteFromS3 } from '~/server/utils/s3'
import { z } from 'zod'

const paramsSchema = z.object({
  id: z.string().uuid()
})

/**
 * DELETE /api/admin/apps/:id
 * 刪除任意 App（管理員專用）
 */
export default defineEventHandler(async (event) => {
  // 驗證管理員權限
  await requireAdmin(event)

  // 解析參數
  const params = paramsSchema.parse(getRouterParams(event))
  const { id } = params

  // 檢查 App 是否存在
  const appResult = await query(
    'SELECT id, title, html_s3_key, file_manifest FROM apps WHERE id = $1',
    [id]
  )

  if (appResult.rows.length === 0) {
    throw createError({
      statusCode: 404,
      message: '找不到該 App'
    })
  }

  const app = appResult.rows[0]

  // 收集所有需要刪除的 S3 檔案
  const s3FilesToDelete: string[] = []

  // 從 file_manifest 獲取所有檔案
  if (app.file_manifest && app.file_manifest.files) {
    s3FilesToDelete.push(...app.file_manifest.files)
  } else if (app.html_s3_key) {
    // 如果沒有 file_manifest，只刪除 html_s3_key
    s3FilesToDelete.push(app.html_s3_key)
  }

  // 刪除 S3 檔案
  try {
    await Promise.all(
      s3FilesToDelete.map(file => deleteFromS3(file))
    )
  } catch (error) {
    console.error('刪除 S3 檔案時發生錯誤:', error)
    // 繼續刪除資料庫記錄
  }

  // 從資料庫刪除 App
  await query('DELETE FROM apps WHERE id = $1', [id])

  return {
    success: true,
    message: `已刪除 App: ${app.title}`
  }
})
