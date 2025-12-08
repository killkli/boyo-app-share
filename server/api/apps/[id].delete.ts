import { query } from '~/server/utils/db'
import { deleteFromS3 } from '~/server/utils/s3'

export default defineEventHandler(async (event) => {
  // 檢查認證
  const userId = event.context.userId
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  // 獲取 App ID
  const appId = event.context.params?.id
  if (!appId) {
    throw createError({
      statusCode: 400,
      message: '缺少 App ID'
    })
  }

  // 檢查 App 是否存在且使用者是否為擁有者
  const checkResult = await query(
    'SELECT id, user_id, html_s3_key, file_manifest FROM apps WHERE id = $1',
    [appId]
  )

  if (checkResult.rows.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'App 不存在'
    })
  }

  const app = checkResult.rows[0]
  if (app.user_id !== userId) {
    throw createError({
      statusCode: 403,
      message: '無權限刪除此 App'
    })
  }

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
    // 繼續刪除資料庫記錄，即使 S3 刪除失敗
    // 在生產環境中，可能需要更完善的錯誤處理策略
  }

  // 從資料庫刪除 App
  await query('DELETE FROM apps WHERE id = $1', [appId])

  return {
    success: true,
    message: 'App 已成功刪除'
  }
})
