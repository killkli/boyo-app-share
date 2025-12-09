import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest'
import { query } from '~/server/utils/db'
import { setupH3Mocks, createMockEvent } from '~/tests/helpers/h3Mocks'
import * as s3 from '~/server/utils/s3'
import * as s3Cleanup from '~/server/utils/s3-cleanup'

// 設置 H3 mocks
setupH3Mocks()

// Mock S3 操作
vi.mock('~/server/utils/s3', () => ({
  uploadToS3: vi.fn().mockResolvedValue('https://s3.example.com/test.html'),
  deleteFromS3: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('~/server/utils/s3-cleanup', () => ({
  cleanupAppS3Files: vi.fn().mockResolvedValue(undefined),
  cleanupThumbnail: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('~/server/utils/zip', () => ({
  extractZip: vi.fn(),
  findMainHtml: vi.fn((files: any[]) => files[0]?.path || 'index.html')
}))

// 動態導入處理器
let reuploadHandler: any

beforeAll(async () => {
  reuploadHandler = (await import('~/server/api/apps/[id]/reupload.put')).default
})

// 跳過測試如果沒有資料庫連接
const skipIfNoDb = process.env.DATABASE_URL ? false : true

describe.skipIf(skipIfNoDb)('PUT /api/apps/[id]/reupload', () => {
  let testUserId: string
  let otherUserId: string
  let testAppId: string

  beforeEach(async () => {
    vi.clearAllMocks()

    // 建立測試使用者
    const userResult = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`reupload-test-${Date.now()}@example.com`, `reuploaduser-${Date.now()}`, 'hash']
    )
    testUserId = userResult.rows[0].id

    // 建立另一個使用者
    const otherResult = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`other-${Date.now()}@example.com`, `other-${Date.now()}`, 'hash']
    )
    otherUserId = otherResult.rows[0].id

    // 建立測試 App (paste 類型)
    const appResult = await query(
      `INSERT INTO apps (
        user_id, title, description, category, tags,
        upload_type, html_s3_key, is_public
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`,
      [
        testUserId,
        'Test App for Reupload',
        'Original description',
        'tool',
        ['test'],
        'paste',
        'apps/original/index.html',
        true
      ]
    )
    testAppId = appResult.rows[0].id
  })

  afterEach(async () => {
    // 清理測試資料
    if (testUserId) {
      await query('DELETE FROM users WHERE id = $1 OR id = $2', [testUserId, otherUserId])
    }
    testUserId = ''
    otherUserId = ''
    testAppId = ''
  })

  it('應該返回 401 如果使用者未登入', async () => {
    const event = createMockEvent({
      method: 'PUT',
      context: { params: { id: testAppId } },
      body: { htmlContent: '<html>New</html>' }
    })

    await expect(reuploadHandler(event)).rejects.toMatchObject({
      statusCode: 401,
      message: 'Unauthorized'
    })
  })

  it('應該返回 403 如果使用者不是APP擁有者', async () => {
    const event = createMockEvent({
      method: 'PUT',
      context: {
        userId: otherUserId,
        params: { id: testAppId }
      },
      body: { htmlContent: '<html>New</html>' }
    })

    await expect(reuploadHandler(event)).rejects.toMatchObject({
      statusCode: 403,
      message: '無權限重新上傳此 App'
    })
  })

  it('應該返回 404 如果APP不存在', async () => {
    // 使用有效的 UUID 格式但不存在的 ID
    const nonExistentId = '00000000-0000-0000-0000-000000000000'

    const event = createMockEvent({
      method: 'PUT',
      context: {
        userId: testUserId,
        params: { id: nonExistentId }
      },
      body: { htmlContent: '<html>New</html>' }
    })

    await expect(reuploadHandler(event)).rejects.toMatchObject({
      statusCode: 404,
      message: 'App 不存在'
    })
  })

  it('應該成功重新上傳 paste 類型的 HTML', async () => {
    const newHtml = '<html><body>New Content</body></html>'

    const event = createMockEvent({
      method: 'PUT',
      context: {
        userId: testUserId,
        params: { id: testAppId }
      },
      body: { htmlContent: newHtml }
    })

    const response = await reuploadHandler(event)

    // 驗證返回結果
    expect(response).toHaveProperty('app')
    expect(response.app.id).toBe(testAppId)
    expect(response.app.html_s3_key).toContain('apps/')
    expect(response.app.html_s3_key).toContain('/index.html')

    // 驗證 S3 操作被調用
    expect(vi.mocked(s3Cleanup.cleanupAppS3Files)).toHaveBeenCalledWith(
      'apps/original/index.html',
      null
    )
    expect(vi.mocked(s3.uploadToS3)).toHaveBeenCalledWith(
      expect.stringContaining('/index.html'),
      newHtml,
      'text/html',
      expect.any(Object)
    )
  })

  it('應該成功重新上傳 ZIP 類型的內容', async () => {
    // 先創建一個 ZIP 類型的 app
    const zipAppResult = await query(
      `INSERT INTO apps (
        user_id, title, upload_type, html_s3_key, file_manifest
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [
        testUserId,
        'ZIP App',
        'zip',
        'apps/zip-app/index.html',
        JSON.stringify({ 'index.html': 'apps/zip-app/index.html' })
      ]
    )
    const zipAppId = zipAppResult.rows[0].id

    // Mock extractZip 來避免實際解壓
    const { extractZip } = await import('~/server/utils/zip')
    const htmlContent = Buffer.from('<html>New ZIP Content</html>')
    vi.mocked(extractZip).mockResolvedValueOnce([
      {
        path: 'index.html',
        content: htmlContent,
        size: htmlContent.length,
        type: 'text/html'
      }
    ])

    // 模擬 ZIP 內容（base64）
    const zipContent = Buffer.from('fake-zip-content').toString('base64')

    const event = createMockEvent({
      method: 'PUT',
      context: {
        userId: testUserId,
        params: { id: zipAppId }
      },
      body: { zipContent }
    })

    const response = await reuploadHandler(event)

    // 驗證返回結果
    expect(response).toHaveProperty('app')
    expect(response.app.id).toBe(zipAppId)

    // 驗證清理舊檔案
    expect(vi.mocked(s3Cleanup.cleanupAppS3Files)).toHaveBeenCalled()

    // 清理
    await query('DELETE FROM apps WHERE id = $1', [zipAppId])
  })

  it('應該更新縮圖如果提供了 thumbnailBase64', async () => {
    const newHtml = '<html>New</html>'
    const thumbnailBase64 = Buffer.from('fake-image').toString('base64')

    const event = createMockEvent({
      method: 'PUT',
      context: {
        userId: testUserId,
        params: { id: testAppId }
      },
      body: {
        htmlContent: newHtml,
        thumbnailBase64
      }
    })

    const response = await reuploadHandler(event)

    // 驗證縮圖被上傳
    expect(vi.mocked(s3.uploadToS3)).toHaveBeenCalledWith(
      expect.stringContaining('thumbnails/'),
      expect.any(Buffer),
      'image/png',
      expect.any(Object)
    )

    expect(response.app.thumbnail_s3_key).toBeTruthy()
  })

  it('應該驗證至少提供 htmlContent 或 zipContent', async () => {
    const event = createMockEvent({
      method: 'PUT',
      context: {
        userId: testUserId,
        params: { id: testAppId }
      },
      body: {} // 沒有提供任何內容
    })

    await expect(reuploadHandler(event)).rejects.toMatchObject({
      statusCode: 400
    })
  })

  it('應該在資料庫中更新 html_s3_key', async () => {
    const newHtml = '<html>Updated</html>'

    const event = createMockEvent({
      method: 'PUT',
      context: {
        userId: testUserId,
        params: { id: testAppId }
      },
      body: { htmlContent: newHtml }
    })

    await reuploadHandler(event)

    // 檢查資料庫
    const result = await query(
      'SELECT html_s3_key FROM apps WHERE id = $1',
      [testAppId]
    )

    expect(result.rows[0].html_s3_key).not.toBe('apps/original/index.html')
    expect(result.rows[0].html_s3_key).toContain('apps/')
  })

  it('應該在S3失敗時不更新資料庫', async () => {
    // Mock S3 上傳失敗
    vi.mocked(s3.uploadToS3).mockRejectedValueOnce(new Error('S3 Error'))

    const event = createMockEvent({
      method: 'PUT',
      context: {
        userId: testUserId,
        params: { id: testAppId }
      },
      body: { htmlContent: '<html>New</html>' }
    })

    await expect(reuploadHandler(event)).rejects.toThrow()

    // 驗證資料庫沒有更新
    const result = await query(
      'SELECT html_s3_key FROM apps WHERE id = $1',
      [testAppId]
    )
    expect(result.rows[0].html_s3_key).toBe('apps/original/index.html')
  })

  it('當新舊S3 key相同時不應該執行清理（避免刪除剛上傳的檔案）', async () => {
    // 創建一個 app，其 S3 key 格式與重新上傳後相同
    const sameKeyAppResult = await query(
      `INSERT INTO apps (
        user_id, title, upload_type, html_s3_key, is_public
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [
        testUserId,
        'Same Key App',
        'paste',
        `apps/${testAppId}/index.html`, // 使用與重新上傳後相同的格式（但這裡使用 testAppId）
        true
      ]
    )
    const sameKeyAppId = sameKeyAppResult.rows[0].id

    // 修正：使用正確的 S3 key 格式
    await query(
      `UPDATE apps SET html_s3_key = $1 WHERE id = $2`,
      [`apps/${sameKeyAppId}/index.html`, sameKeyAppId]
    )

    const newHtml = '<html><body>New Content - Same Key</body></html>'

    const event = createMockEvent({
      method: 'PUT',
      context: {
        userId: testUserId,
        params: { id: sameKeyAppId }
      },
      body: { htmlContent: newHtml }
    })

    // 清除 mock 調用歷史
    vi.clearAllMocks()

    const response = await reuploadHandler(event)

    // 驗證 S3 上傳被調用
    expect(vi.mocked(s3.uploadToS3)).toHaveBeenCalled()

    // 驗證清理函數不應該被調用（因為新舊 key 相同）
    expect(vi.mocked(s3Cleanup.cleanupAppS3Files)).not.toHaveBeenCalled()

    // 驗證返回結果正確
    expect(response).toHaveProperty('app')
    expect(response.app.html_s3_key).toBe(`apps/${sameKeyAppId}/index.html`)
  })
})
