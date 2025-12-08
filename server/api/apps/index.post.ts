import { randomUUID } from 'crypto'
import { uploadPasteSchema } from '~/server/utils/validation'
import { uploadToS3 } from '~/server/utils/s3'
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  // 從 context 取得 userId (由 auth middleware 設定)
  const userId = event.context.userId
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const body = await readBody(event)

  // 驗證輸入
  const validated = uploadPasteSchema.parse(body)

  // 生成 App ID
  const appId = randomUUID()

  // 設定 S3 key
  const htmlS3Key = `apps/${appId}/index.html`

  // 上傳 HTML 到 S3
  const s3Url = await uploadToS3(
    htmlS3Key,
    validated.htmlContent,
    'text/html',
    { cacheControl: 'public, max-age=31536000' }
  )

  // 儲存到資料庫
  const result = await query(
    `INSERT INTO apps (
      id,
      user_id,
      title,
      description,
      category,
      tags,
      upload_type,
      html_s3_key
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      appId,
      userId,
      validated.title,
      validated.description || null,
      validated.category || null,
      validated.tags || null,
      'paste',
      htmlS3Key
    ]
  )

  const app = result.rows[0]

  return {
    app,
    url: s3Url
  }
})
