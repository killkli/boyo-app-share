import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { deleteFromS3 } from './s3'

/**
 * 清理 APP 的所有 S3 檔案
 * @param htmlS3Key 主 HTML 檔案的 S3 key
 * @param assetsS3Prefix 資源檔案的 S3 前綴（用於 ZIP 上傳）
 */
export async function cleanupAppS3Files(
  htmlS3Key: string,
  assetsS3Prefix?: string | null
): Promise<void> {
  try {
    // 如果是 ZIP 上傳（有 assetsS3Prefix），需要刪除整個目錄
    if (assetsS3Prefix) {
      await deleteS3Directory(assetsS3Prefix)
    } else {
      // 只是單個 HTML 檔案
      await deleteFromS3(htmlS3Key)
    }
  } catch (error) {
    // 記錄錯誤但不拋出，避免影響主要流程
    console.error('S3 清理失敗:', error)
  }
}

/**
 * 刪除 S3 目錄下的所有檔案
 * @param prefix S3 目錄前綴
 */
export async function deleteS3Directory(prefix: string): Promise<void> {
  const runtimeConfig = useRuntimeConfig()

  const client = new S3Client({
    region: 'auto',
    endpoint: runtimeConfig.tebiEndpoint,
    credentials: {
      accessKeyId: runtimeConfig.tebiAccessKey,
      secretAccessKey: runtimeConfig.tebiSecretKey,
    },
  })

  const bucket = runtimeConfig.tebiBucket

  // 列出所有檔案
  const listCommand = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
  })

  const listResponse = await client.send(listCommand)

  if (!listResponse.Contents || listResponse.Contents.length === 0) {
    return
  }

  // 批量刪除檔案
  const objectsToDelete = listResponse.Contents.map(obj => ({ Key: obj.Key }))

  const deleteCommand = new DeleteObjectsCommand({
    Bucket: bucket,
    Delete: {
      Objects: objectsToDelete as { Key: string }[],
    },
  })

  await client.send(deleteCommand)
}

/**
 * 清理 APP 的縮圖檔案
 * @param thumbnailS3Key 縮圖的 S3 key
 */
export async function cleanupThumbnail(thumbnailS3Key: string | null): Promise<void> {
  if (!thumbnailS3Key) {
    return
  }

  try {
    await deleteFromS3(thumbnailS3Key)
  } catch (error) {
    console.error('縮圖清理失敗:', error)
  }
}
