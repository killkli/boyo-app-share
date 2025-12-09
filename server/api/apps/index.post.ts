import { randomUUID } from 'crypto'
import { uploadPasteSchema, uploadFileSchema, uploadZipSchema } from '~/server/utils/validation'
import { uploadToS3 } from '~/server/utils/s3'
import { query } from '~/server/utils/db'
import { extractZip, findMainHtml } from '~/server/utils/zip'

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

  // 根據 uploadType 選擇對應的 schema
  let validated: any
  let uploadType: 'paste' | 'file' | 'zip'

  if (body.uploadType === 'paste') {
    validated = uploadPasteSchema.parse(body)
    uploadType = 'paste'
  } else if (body.uploadType === 'file') {
    // 檔案上傳也需要 htmlContent
    const fileSchema = uploadFileSchema.extend({
      htmlContent: uploadPasteSchema.shape.htmlContent
    })
    validated = fileSchema.parse(body)
    uploadType = 'file'
  } else if (body.uploadType === 'zip') {
    validated = uploadZipSchema.parse(body)
    uploadType = 'zip'
  } else {
    throw createError({
      statusCode: 400,
      message: 'Invalid uploadType. Must be "paste", "file", or "zip"'
    })
  }

  // 生成 App ID
  const appId = randomUUID()

  let htmlS3Key: string
  let thumbnailS3Key: string | null = null
  let fileManifest: Record<string, string> | null = null
  let urls: Record<string, string> = {}

  // 處理縮圖上傳
  if (validated.thumbnailBase64) {
    try {
      const thumbnailBuffer = Buffer.from(validated.thumbnailBase64, 'base64')
      thumbnailS3Key = `thumbnails/${appId}.png`
      await uploadToS3(
        thumbnailS3Key,
        thumbnailBuffer,
        'image/png',
        { cacheControl: 'public, max-age=31536000' }
      )
    } catch (error) {
      console.warn('縮圖上傳失敗:', error)
      // 縮圖上傳失敗不應該阻止整個上傳過程
      thumbnailS3Key = null
    }
  }

  if (uploadType === 'zip') {
    // ZIP 上傳處理

    // 解碼 base64 內容
    let zipBuffer: Buffer
    try {
      zipBuffer = Buffer.from(validated.zipContent, 'base64')
    } catch (error) {
      throw createError({
        statusCode: 400,
        message: '無效的 base64 內容'
      })
    }

    // 解壓縮 ZIP
    let files
    try {
      files = await extractZip(zipBuffer)
    } catch (error) {
      throw createError({
        statusCode: 400,
        message: '無效的 ZIP 檔案格式'
      })
    }

    if (files.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'ZIP 檔案是空的'
      })
    }

    // 尋找主 HTML 檔案
    const mainHtmlPath = findMainHtml(files)
    if (!mainHtmlPath) {
      throw createError({
        statusCode: 400,
        message: 'ZIP 檔案中找不到 HTML 檔案'
      })
    }

    // 上傳所有檔案到 S3
    fileManifest = {}
    const uploadPromises = files.map(async (file) => {
      const s3Key = `apps/${appId}/${file.path}`
      const url = await uploadToS3(
        s3Key,
        file.content,
        file.type,
        { cacheControl: 'public, max-age=31536000' }
      )
      fileManifest![file.path] = s3Key
      urls[file.path] = url
      return url
    })

    await Promise.all(uploadPromises)

    htmlS3Key = `apps/${appId}/${mainHtmlPath}`
  } else {
    // paste 或 file 上傳處理
    htmlS3Key = `apps/${appId}/index.html`

    const s3Url = await uploadToS3(
      htmlS3Key,
      validated.htmlContent,
      'text/html',
      { cacheControl: 'public, max-age=31536000' }
    )

    urls['index.html'] = s3Url
  }

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
      html_s3_key,
      file_manifest,
      thumbnail_s3_key
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      appId,
      userId,
      validated.title,
      validated.description || null,
      validated.category || null,
      validated.tags || null,
      uploadType,
      htmlS3Key,
      fileManifest ? JSON.stringify(fileManifest) : null,
      thumbnailS3Key
    ]
  )

  const app = result.rows[0]

  return {
    app,
    ...(uploadType === 'zip' ? { urls } : { url: urls['index.html'] })
  }
})
