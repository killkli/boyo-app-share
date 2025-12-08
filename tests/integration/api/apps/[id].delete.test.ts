import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest'
import { query } from '~/server/utils/db'
import { setupH3Mocks, createMockEvent } from '~/tests/helpers/h3Mocks'
import { generateToken } from '~/server/utils/jwt'

// Mock S3 工具
vi.mock('~/server/utils/s3', () => ({
  deleteFromS3: vi.fn().mockResolvedValue(undefined)
}))

// 設置 H3 mocks
setupH3Mocks()

// 動態導入處理器
let deleteAppHandler: any

beforeAll(async () => {
  deleteAppHandler = (await import('~/server/api/apps/[id].delete')).default
})

// 跳過測試如果沒有資料庫連接
const skipIfNoDb = process.env.DATABASE_URL ? false : true

describe.skipIf(skipIfNoDb)('DELETE /api/apps/[id]', () => {
  let testUserId: string
  let testToken: string
  let otherUserId: string
  let otherToken: string
  let testAppId: string

  beforeEach(async () => {
    // 清理 mock
    vi.clearAllMocks()

    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)

    // 建立測試使用者 1 (App 擁有者)
    const userResult = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`delete-owner-${timestamp}-${random}@example.com`, `owner-${timestamp}-${random}`, 'hash']
    )
    testUserId = userResult.rows[0].id
    testToken = generateToken(testUserId)

    // 建立測試使用者 2 (非擁有者)
    const otherResult = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`delete-other-${timestamp}-${random}@example.com`, `other-${timestamp}-${random}`, 'hash']
    )
    otherUserId = otherResult.rows[0].id
    otherToken = generateToken(otherUserId)

    // 建立測試 App（paste 模式，無 file_manifest）
    const appResult = await query(
      `INSERT INTO apps (
        user_id, title, description, category, tags,
        upload_type, html_s3_key
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id`,
      [
        testUserId,
        'Test App to Delete',
        'This app will be deleted',
        'tool',
        ['test'],
        'paste',
        'apps/test-delete/index.html'
      ]
    )
    testAppId = appResult.rows[0].id
  })

  afterEach(async () => {
    // 清理測試資料
    if (testUserId) {
      await query('DELETE FROM users WHERE id = $1', [testUserId])
    }
    if (otherUserId) {
      await query('DELETE FROM users WHERE id = $1', [otherUserId])
    }
  })

  it('應該成功刪除 App', async () => {
    const event = createMockEvent({
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${testToken}`
      },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      }
    })

    const result = await deleteAppHandler(event)

    expect(result).toHaveProperty('success', true)
    expect(result).toHaveProperty('message')

    // 驗證 App 已從資料庫刪除
    const checkResult = await query('SELECT id FROM apps WHERE id = $1', [testAppId])
    expect(checkResult.rows.length).toBe(0)
  })

  it('應該只允許作者刪除自己的 App', async () => {
    const event = createMockEvent({
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${otherToken}`
      },
      context: {
        userId: otherUserId,
        params: { id: testAppId }
      }
    })

    await expect(deleteAppHandler(event)).rejects.toMatchObject({
      statusCode: 403
    })

    // 驗證 App 仍然存在
    const checkResult = await query('SELECT id FROM apps WHERE id = $1', [testAppId])
    expect(checkResult.rows.length).toBe(1)
  })

  it('應該在未認證時返回 401', async () => {
    const event = createMockEvent({
      method: 'DELETE',
      context: {
        params: { id: testAppId }
      }
    })

    await expect(deleteAppHandler(event)).rejects.toMatchObject({
      statusCode: 401
    })
  })

  it('應該在 App 不存在時返回 404', async () => {
    const event = createMockEvent({
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${testToken}`
      },
      context: {
        userId: testUserId,
        params: { id: '00000000-0000-0000-0000-000000000000' }
      }
    })

    await expect(deleteAppHandler(event)).rejects.toMatchObject({
      statusCode: 404
    })
  })

  it('應該在缺少 ID 參數時返回 400', async () => {
    const event = createMockEvent({
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${testToken}`
      },
      context: {
        userId: testUserId,
        params: {}
      }
    })

    await expect(deleteAppHandler(event)).rejects.toMatchObject({
      statusCode: 400
    })
  })

  it('應該同步刪除 S3 檔案', async () => {
    // 建立一個有多個檔案的 App
    const multiFileAppResult = await query(
      `INSERT INTO apps (
        user_id, title, upload_type, html_s3_key, file_manifest
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [
        testUserId,
        'Multi-file App',
        'zip',
        'apps/multi-file/index.html',
        {
          files: [
            'apps/multi-file/index.html',
            'apps/multi-file/style.css',
            'apps/multi-file/script.js'
          ]
        }
      ]
    )
    const multiFileAppId = multiFileAppResult.rows[0].id

    const { deleteFromS3 } = await import('~/server/utils/s3')

    const event = createMockEvent({
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${testToken}`
      },
      context: {
        userId: testUserId,
        params: { id: multiFileAppId }
      }
    })

    await deleteAppHandler(event)

    // 驗證所有檔案都被刪除
    expect(deleteFromS3).toHaveBeenCalledTimes(3)
    expect(deleteFromS3).toHaveBeenCalledWith('apps/multi-file/index.html')
    expect(deleteFromS3).toHaveBeenCalledWith('apps/multi-file/style.css')
    expect(deleteFromS3).toHaveBeenCalledWith('apps/multi-file/script.js')
  })

  it('應該處理只有 html_s3_key 的情況', async () => {
    const { deleteFromS3 } = await import('~/server/utils/s3')

    const event = createMockEvent({
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${testToken}`
      },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      }
    })

    await deleteAppHandler(event)

    // 只應該刪除 html_s3_key
    expect(deleteFromS3).toHaveBeenCalledTimes(1)
    expect(deleteFromS3).toHaveBeenCalledWith('apps/test-delete/index.html')
  })
})
