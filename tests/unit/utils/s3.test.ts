import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadToS3, deleteFromS3, getPresignedUploadUrl, type S3Config } from '~/server/utils/s3'

// Mock S3 Client
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({
    send: vi.fn().mockResolvedValue({})
  })),
  PutObjectCommand: vi.fn((params) => params),
  DeleteObjectCommand: vi.fn((params) => params)
}))

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://s3.tebi.io/test-bucket/test-key?presigned=true')
}))

// 測試用 S3 配置
const testConfig: Partial<S3Config> = {
  endpoint: 'https://s3.tebi.io',
  accessKey: 'test-access-key',
  secretKey: 'test-secret-key',
  bucket: 'test-bucket',
  baseUrl: 'https://s3.tebi.io/test-bucket'
}

describe('S3 工具函數', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('uploadToS3', () => {
    it('應該成功上傳檔案到 S3', async () => {
      const key = 'apps/test-uuid/index.html'
      const body = '<html>Test</html>'
      const contentType = 'text/html'

      const url = await uploadToS3(key, body, contentType, { config: testConfig })

      expect(url).toContain(key)
      expect(url).toContain('s3.tebi.io')
    })

    it('應該使用正確的參數上傳檔案', async () => {
      const { PutObjectCommand } = await import('@aws-sdk/client-s3')
      const key = 'apps/test-uuid/style.css'
      const body = 'body { margin: 0; }'
      const contentType = 'text/css'

      await uploadToS3(key, body, contentType, { config: testConfig })

      expect(PutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: key,
          Body: body,
          ContentType: contentType,
          ACL: 'public-read'
        })
      )
    })

    it('應該支援自訂 Cache Control', async () => {
      const { PutObjectCommand } = await import('@aws-sdk/client-s3')
      const key = 'apps/test-uuid/index.html'
      const body = '<html>Test</html>'
      const contentType = 'text/html'
      const cacheControl = 'no-cache'

      await uploadToS3(key, body, contentType, { cacheControl, config: testConfig })

      expect(PutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          CacheControl: cacheControl
        })
      )
    })
  })

  describe('deleteFromS3', () => {
    it('應該成功刪除 S3 檔案', async () => {
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
      const key = 'apps/test-uuid/index.html'

      await deleteFromS3(key, testConfig)

      expect(DeleteObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: key
        })
      )
    })
  })

  describe('getPresignedUploadUrl', () => {
    it('應該生成預簽名上傳 URL', async () => {
      const key = 'apps/test-uuid/index.html'
      const url = await getPresignedUploadUrl(key, 'text/html', 3600, testConfig)

      expect(url).toBeTruthy()
      expect(typeof url).toBe('string')
      expect(url).toContain('presigned=true')
    })

    it('應該使用正確的參數生成 URL', async () => {
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
      const key = 'apps/test-uuid/app.js'
      const contentType = 'application/javascript'

      await getPresignedUploadUrl(key, contentType, 7200, testConfig)

      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          expiresIn: 7200
        })
      )
    })
  })
})
