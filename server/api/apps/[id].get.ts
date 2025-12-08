import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  // 獲取 App ID
  const id = event.context.params?.id

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'App ID is required'
    })
  }

  // 查詢 App 詳情（包含作者資訊）
  const result = await query(
    `SELECT
      a.id,
      a.title,
      a.description,
      a.user_id,
      a.category,
      a.tags,
      a.upload_type,
      a.html_s3_key,
      a.file_manifest,
      a.view_count,
      a.created_at,
      a.updated_at,
      u.username as author_username
    FROM apps a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.id = $1`,
    [id]
  )

  if (result.rows.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'App not found'
    })
  }

  const app = result.rows[0]

  // 增加瀏覽次數
  await query(
    'UPDATE apps SET view_count = view_count + 1 WHERE id = $1',
    [id]
  )

  return {
    app
  }
})
