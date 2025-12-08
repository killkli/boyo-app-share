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

describe.skipIf(skipIfNoDb)('POST /api/apps - 剪貼簿上傳', () => {
  let testUserId: string
  let testToken: string
  const testSecret = 'test-secret-key'

  beforeEach(async () => {
    // 建立測試使用者
    const userResult = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`app-test-${Date.now()}@example.com`, `apptest${Date.now()}`, 'hash']
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

  it('應該成功上傳剪貼簿 HTML', async () => {
    const htmlContent = '<!DOCTYPE html><html><body><h1>Test App</h1></body></html>'
    const requestBody = {
      uploadType: 'paste',
      title: 'Test App',
      description: 'A test application',
      category: 'tool',
      tags: ['test', 'demo'],
      htmlContent
    }

    const event = createMockEvent({
      body: requestBody,
      headers: { authorization: `Bearer ${testToken}` },
      context: { userId: testUserId }
    })

    const response = await createAppHandler(event)

    expect(response).toHaveProperty('app')
    expect(response).toHaveProperty('url')
    expect(response.app.title).toBe('Test App')
    expect(response.app.description).toBe('A test application')
    expect(response.app.category).toBe('tool')
    expect(response.app.tags).toEqual(['test', 'demo'])
    expect(response.app.upload_type).toBe('paste')
    expect(response.url).toContain('s3.tebi.io')

    // 驗證資料庫
    const dbResult = await query(
      'SELECT * FROM apps WHERE id = $1',
      [response.app.id]
    )
    expect(dbResult.rows).toHaveLength(1)
    expect(dbResult.rows[0].title).toBe('Test App')
  })

  it('應該拒絕未認證的請求', async () => {
    const requestBody = {
      uploadType: 'paste',
      title: 'Test',
      htmlContent: '<html></html>'
    }

    const event = createMockEvent({
      body: requestBody,
      headers: {}
    })

    await expect(createAppHandler(event)).rejects.toThrow()
  })

  it('應該拒絕無效的標題（空字串）', async () => {
    const requestBody = {
      uploadType: 'paste',
      title: '',
      htmlContent: '<html></html>'
    }

    const event = createMockEvent({
      body: requestBody,
      headers: { authorization: `Bearer ${testToken}` },
      context: { userId: testUserId }
    })

    await expect(createAppHandler(event)).rejects.toThrow()
  })

  it('應該拒絕空的 HTML 內容', async () => {
    const requestBody = {
      uploadType: 'paste',
      title: 'Test App',
      htmlContent: ''
    }

    const event = createMockEvent({
      body: requestBody,
      headers: { authorization: `Bearer ${testToken}` },
      context: { userId: testUserId }
    })

    await expect(createAppHandler(event)).rejects.toThrow()
  })

  it('應該使用默認值填充可選欄位', async () => {
    const htmlContent = '<html><body>Minimal App</body></html>'
    const requestBody = {
      uploadType: 'paste',
      title: 'Minimal App',
      htmlContent
    }

    const event = createMockEvent({
      body: requestBody,
      headers: { authorization: `Bearer ${testToken}` },
      context: { userId: testUserId }
    })

    const response = await createAppHandler(event)

    expect(response.app.description).toBeNull()
    expect(response.app.category).toBeNull()
    expect(response.app.tags).toBeNull()
    expect(response.app.is_public).toBe(true)
    expect(response.app.view_count).toBe(0)
  })

  it('應該正確設置 S3 key', async () => {
    const { uploadToS3 } = await import('~/server/utils/s3')

    const htmlContent = '<html><body>Test</body></html>'
    const requestBody = {
      uploadType: 'paste',
      title: 'Test',
      htmlContent
    }

    const event = createMockEvent({
      body: requestBody,
      headers: { authorization: `Bearer ${testToken}` },
      context: { userId: testUserId }
    })

    await createAppHandler(event)

    // 驗證 uploadToS3 被正確調用
    expect(uploadToS3).toHaveBeenCalledWith(
      expect.stringContaining('apps/'),
      htmlContent,
      'text/html',
      expect.any(Object)
    )
  })

  it('應該處理標籤數量超過限制', async () => {
    const requestBody = {
      uploadType: 'paste',
      title: 'Test',
      htmlContent: '<html></html>',
      tags: Array(11).fill('tag') // 超過 10 個標籤的限制
    }

    const event = createMockEvent({
      body: requestBody,
      headers: { authorization: `Bearer ${testToken}` },
      context: { userId: testUserId }
    })

    await expect(createAppHandler(event)).rejects.toThrow()
  })
})
