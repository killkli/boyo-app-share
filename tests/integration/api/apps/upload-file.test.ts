import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest'
import { query } from '~/server/utils/db'
import { generateToken } from '~/server/utils/jwt'
import { setupH3Mocks, createMockEvent } from '~/tests/helpers/h3Mocks'

// 設置 H3 mocks
setupH3Mocks()

// Mock S3 上傳函數
vi.mock('~/server/utils/s3', () => ({
  uploadToS3: vi.fn().mockResolvedValue('https://s3.tebi.io/test-bucket/apps/test-uuid/index.html')
}))

// 動態導入處理器（在 mocks 設置之後）
let createAppHandler: any

beforeAll(async () => {
  createAppHandler = (await import('~/server/api/apps/index.post')).default
})

// 跳過測試如果沒有資料庫連接
const skipIfNoDb = process.env.DATABASE_URL ? false : true

describe.skipIf(skipIfNoDb)('POST /api/apps - 單檔上傳', () => {
  let testUserId: string
  let testToken: string
  const testSecret = 'test-secret-key'

  beforeEach(async () => {
    // 建立測試使用者
    const userResult = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`file-test-${Date.now()}@example.com`, `filetest${Date.now()}`, 'hash']
    )
    testUserId = userResult.rows[0].id
    testToken = generateToken(testUserId, testSecret)

    // 清理所有 Mock
    vi.clearAllMocks()
  })

  afterEach(async () => {
    // 清理測試資料（CASCADE 會自動刪除相關的 apps）
    if (testUserId) {
      await query('DELETE FROM users WHERE id = $1', [testUserId])
    }
  })

  it('應該成功上傳單個 HTML 檔案', async () => {
    const htmlContent = '<!DOCTYPE html><html><body>Test App from File</body></html>'

    const event = createMockEvent({
      body: {
        uploadType: 'file',
        title: 'File Upload Test',
        description: 'Testing file upload',
        category: 'tool',
        tags: ['test', 'file'],
        htmlContent
      },
      context: { userId: testUserId }
    })

    const result = await createAppHandler(event)

    expect(result).toHaveProperty('app')
    expect(result).toHaveProperty('url')
    expect(result.app.title).toBe('File Upload Test')
    expect(result.app.upload_type).toBe('file')
    expect(result.url).toContain('s3.tebi.io')

    // 驗證資料庫中的記錄
    const dbResult = await query(
      'SELECT * FROM apps WHERE id = $1',
      [result.app.id]
    )
    expect(dbResult.rows).toHaveLength(1)
    expect(dbResult.rows[0].upload_type).toBe('file')
  })

  it('應該拒絕未認證的請求', async () => {
    const event = createMockEvent({
      body: {
        uploadType: 'file',
        title: 'Test',
        htmlContent: '<html></html>'
      },
      context: {} // 沒有 userId
    })

    await expect(createAppHandler(event)).rejects.toMatchObject({
      statusCode: 401
    })
  })

  it('應該拒絕沒有 htmlContent 的請求', async () => {
    const event = createMockEvent({
      body: {
        uploadType: 'file',
        title: 'Test App'
        // 缺少 htmlContent 欄位
      },
      context: { userId: testUserId }
    })

    await expect(createAppHandler(event)).rejects.toThrow()
  })

  it('應該正確處理沒有 description 的情況', async () => {
    const event = createMockEvent({
      body: {
        uploadType: 'file',
        title: 'Minimal File Test',
        htmlContent: '<!DOCTYPE html><html><body>Minimal</body></html>'
        // 沒有 description
      },
      context: { userId: testUserId }
    })

    const result = await createAppHandler(event)

    expect(result).toHaveProperty('app')
    expect(result.app.description).toBeNull()
  })

  it('應該正確處理標籤和分類', async () => {
    const event = createMockEvent({
      body: {
        uploadType: 'file',
        title: 'Tagged File Test',
        htmlContent: '<html><body>Test</body></html>',
        category: 'game',
        tags: ['interactive', 'fun']
      },
      context: { userId: testUserId }
    })

    const result = await createAppHandler(event)

    expect(result.app.category).toBe('game')
    expect(result.app.tags).toEqual(['interactive', 'fun'])
  })
})
