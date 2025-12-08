import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest'
import { query } from '~/server/utils/db'
import { generateToken } from '~/server/utils/jwt'
import { setupH3Mocks, createMockEvent } from '~/tests/helpers/h3Mocks'

// 設置 H3 mocks
setupH3Mocks()

// 動態導入處理器（在 mocks 設置之後）
let rateAppHandler: any

beforeAll(async () => {
  rateAppHandler = (await import('~/server/api/apps/[id]/rate.post')).default
})

// 跳過測試如果沒有資料庫連接
const skipIfNoDb = process.env.DATABASE_URL ? false : true

describe.skipIf(skipIfNoDb)('POST /api/apps/[id]/rate - 評分功能', () => {
  let testUserId: string
  let testAppId: string
  let testToken: string
  const testSecret = 'test-secret-key'

  beforeEach(async () => {
    // 建立測試使用者
    const userResult = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`rate-test-${Date.now()}@example.com`, `ratetest${Date.now()}`, 'hash']
    )
    testUserId = userResult.rows[0].id
    testToken = generateToken(testUserId, testSecret)

    // 建立測試 App
    const appResult = await query(
      `INSERT INTO apps (user_id, title, description, category, upload_type, html_s3_key)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [testUserId, 'Test App for Rating', 'Description', 'tool', 'paste', 'apps/test/index.html']
    )
    testAppId = appResult.rows[0].id

    // 清理所有 Mock
    vi.clearAllMocks()
  })

  afterEach(async () => {
    // 清理測試資料（CASCADE 會自動刪除相關的 ratings）
    if (testUserId) {
      await query('DELETE FROM users WHERE id = $1', [testUserId])
    }
  })

  it('應該成功評分', async () => {
    const event = createMockEvent({
      method: 'POST',
      path: `/api/apps/${testAppId}/rate`,
      headers: {
        authorization: `Bearer ${testToken}`
      },
      body: { rating: 5 },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      }
    })

    const response = await rateAppHandler(event)

    expect(response).toHaveProperty('rating')
    expect(response.rating).toBe(5)
    expect(response).toHaveProperty('avgRating')
    expect(response.avgRating).toBeGreaterThan(0)
  })

  it('應該更新已存在的評分', async () => {
    // 第一次評分
    const event1 = createMockEvent({
      method: 'POST',
      path: `/api/apps/${testAppId}/rate`,
      headers: {
        authorization: `Bearer ${testToken}`
      },
      body: { rating: 3 },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      }
    })

    await rateAppHandler(event1)

    // 更新評分
    const event2 = createMockEvent({
      method: 'POST',
      path: `/api/apps/${testAppId}/rate`,
      headers: {
        authorization: `Bearer ${testToken}`
      },
      body: { rating: 5 },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      }
    })

    const response = await rateAppHandler(event2)

    expect(response.rating).toBe(5)

    // 驗證資料庫中只有一筆評分
    const ratingResult = await query(
      'SELECT rating FROM ratings WHERE app_id = $1 AND user_id = $2',
      [testAppId, testUserId]
    )
    expect(ratingResult.rows).toHaveLength(1)
    expect(ratingResult.rows[0].rating).toBe(5)
  })

  it('應該拒絕無效的評分值 (大於 5)', async () => {
    const event = createMockEvent({
      method: 'POST',
      path: `/api/apps/${testAppId}/rate`,
      headers: {
        authorization: `Bearer ${testToken}`
      },
      body: { rating: 6 },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      }
    })

    await expect(rateAppHandler(event)).rejects.toThrow()
  })

  it('應該拒絕無效的評分值 (小於 1)', async () => {
    const event = createMockEvent({
      method: 'POST',
      path: `/api/apps/${testAppId}/rate`,
      headers: {
        authorization: `Bearer ${testToken}`
      },
      body: { rating: 0 },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      }
    })

    await expect(rateAppHandler(event)).rejects.toThrow()
  })

  it('應該拒絕非整數的評分', async () => {
    const event = createMockEvent({
      method: 'POST',
      path: `/api/apps/${testAppId}/rate`,
      headers: {
        authorization: `Bearer ${testToken}`
      },
      body: { rating: 3.5 },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      }
    })

    await expect(rateAppHandler(event)).rejects.toThrow()
  })

  it('應該拒絕未認證的請求', async () => {
    const event = createMockEvent({
      method: 'POST',
      path: `/api/apps/${testAppId}/rate`,
      body: { rating: 5 },
      context: {
        params: { id: testAppId }
      }
    })

    await expect(rateAppHandler(event)).rejects.toThrow()
  })

  it('應該拒絕不存在的 App', async () => {
    const fakeAppId = '00000000-0000-0000-0000-000000000000'
    const event = createMockEvent({
      method: 'POST',
      path: `/api/apps/${fakeAppId}/rate`,
      headers: {
        authorization: `Bearer ${testToken}`
      },
      body: { rating: 5 },
      context: {
        userId: testUserId,
        params: { id: fakeAppId }
      }
    })

    await expect(rateAppHandler(event)).rejects.toThrow()
  })
})
