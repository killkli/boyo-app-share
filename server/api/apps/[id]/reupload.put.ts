import { randomUUID } from 'crypto'
import { query } from '~/server/utils/db'
import { reuploadAppSchema } from '~/server/utils/validation'
import { uploadToS3 } from '~/server/utils/s3'
import { cleanupAppS3Files, cleanupThumbnail } from '~/server/utils/s3-cleanup'
import { extractZip, findMainHtml } from '~/server/utils/zip'
import { getAppCreators } from '~/server/utils/creators'

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

  // 讀取並驗證請求內容
  const body = await readBody(event)

  let validated
  try {
    validated = reuploadAppSchema.parse(body)
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      message: error.errors?.[0]?.message || '輸入資料無效'
    })
  }

  // 獲取現有 App 資訊
  const appResult = await query(
    `SELECT id, user_id, upload_type, html_s3_key, file_manifest, thumbnail_s3_key
     FROM apps
     WHERE id = $1`,
    [appId]
  )

  if (appResult.rows.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'App 不存在'
    })
  }

  const app = appResult.rows[0]

  // 檢查權限
  if (app.user_id !== userId) {
    throw createError({
      statusCode: 403,
      message: '無權限重新上傳此 App'
    })
  }

  const oldHtmlS3Key = app.html_s3_key
  const oldFileManifest = app.file_manifest
  const oldThumbnailS3Key = app.thumbnail_s3_key
  const uploadType = app.upload_type

  let newHtmlS3Key: string
  let newFileManifest: Record<string, string> | null = null
  let newThumbnailS3Key: string | null = oldThumbnailS3Key

  // 處理縮圖
  if (validated.thumbnailBase64) {
    try {
      const thumbnailBuffer = Buffer.from(validated.thumbnailBase64, 'base64')
      newThumbnailS3Key = `thumbnails/${appId}.png`

      // 如果有舊縮圖且不同，先清理
      if (oldThumbnailS3Key && oldThumbnailS3Key !== newThumbnailS3Key) {
        await cleanupThumbnail(oldThumbnailS3Key)
      }

      await uploadToS3(
        newThumbnailS3Key,
        thumbnailBuffer,
        'image/png',
        { cacheControl: 'public, max-age=31536000' }
      )
    } catch (error) {
      console.warn('縮圖上傳失敗:', error)
      newThumbnailS3Key = oldThumbnailS3Key
    }
  }

  // 處理主要內容上傳
  if (uploadType === 'zip' && validated.zipContent) {
    // ZIP 重新上傳
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
    newFileManifest = {}
    const uploadPromises = files.map(async (file) => {
      const s3Key = `apps/${appId}/${file.path}`
      await uploadToS3(
        s3Key,
        file.content,
        file.type,
        { cacheControl: 'public, max-age=31536000' }
      )
      newFileManifest![file.path] = s3Key
    })

    await Promise.all(uploadPromises)

    newHtmlS3Key = `apps/${appId}/${mainHtmlPath}`

    // 清理舊的 S3 檔案
    await cleanupAppS3Files(oldHtmlS3Key, oldFileManifest ? `apps/${appId}/` : null)
  } else if (validated.htmlContent) {
    // paste 或 file 重新上傳
    newHtmlS3Key = `apps/${appId}/index.html`

    await uploadToS3(
      newHtmlS3Key,
      validated.htmlContent,
      'text/html',
      { cacheControl: 'public, max-age=31536000' }
    )

    // 清理舊的 S3 檔案
    await cleanupAppS3Files(oldHtmlS3Key, null)
  } else {
    throw createError({
      statusCode: 400,
      message: '必須提供 htmlContent 或 zipContent'
    })
  }

  // 更新資料庫
  const updateResult = await query(
    `UPDATE apps
     SET html_s3_key = $1,
         file_manifest = $2,
         thumbnail_s3_key = $3,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
     RETURNING *`,
    [
      newHtmlS3Key,
      newFileManifest ? JSON.stringify(newFileManifest) : null,
      newThumbnailS3Key,
      appId
    ]
  )

  // 獲取完整資訊
  const fullAppResult = await query(
    `SELECT a.*, u.username as author_username
     FROM apps a
     JOIN users u ON a.user_id = u.id
     WHERE a.id = $1`,
    [appId]
  )

  // 獲取創作者列表
  const creators = await getAppCreators(appId)

  return {
    app: {
      ...fullAppResult.rows[0],
      creators
    }
  }
})
