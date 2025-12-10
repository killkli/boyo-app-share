import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest'
import { query } from '~/server/utils/db'
import { generateToken } from '~/server/utils/jwt'
import { setupH3Mocks, createMockEvent } from '~/tests/helpers/h3Mocks'

// 設置 H3 mocks
setupH3Mocks()

// 動態導入處理器（在 mocks 設置之後）
let toggleFavoriteHandler: any

beforeAll(async () => {
  toggleFavoriteHandler = (await import('~/server/api/apps/[id]/favorite.post')).default
})

// 跳過測試如果沒有資料庫連接
const skipIfNoDb = process.env.DATABASE_URL ? false : true

describe.skipIf(skipIfNoDb)('POST /api/apps/[id]/favorite - 收藏功能', () => {
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
      [`favorite-test-${Date.now()}@example.com`, `favoritetest${Date.now()}`, 'hash']
    )
    testUserId = userResult.rows[0].id
    testToken = generateToken(testUserId, testSecret)

    // 建立測試 App
    const appResult = await query(
      `INSERT INTO apps (user_id, title, description, category, upload_type, html_s3_key)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [testUserId, 'Test App for Favorites', 'Description', 'tool', 'paste', 'apps/test/index.html']
    )
    testAppId = appResult.rows[0].id

    // 清理所有 Mock
    vi.clearAllMocks()
  })

  afterEach(async () => {
    // 清理測試資料（CASCADE 會自動刪除相關的 favorites）
    if (testUserId) {
      await query('DELETE FROM users WHERE id = $1', [testUserId])
    }
  })

  it('應該成功收藏 App', async () => {
    const event = createMockEvent({
      method: 'POST',
      path: `/api/apps/${testAppId}/favorite`,
      headers: {
        authorization: `Bearer ${testToken}`
      },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      }
    })

    const response = await toggleFavoriteHandler(event)

    expect(response).toHaveProperty('isFavorited')
    expect(response.isFavorited).toBe(true)

    // 驗證資料庫中有收藏記錄
    const favoriteResult = await query(
      'SELECT * FROM favorites WHERE app_id = $1 AND user_id = $2',
      [testAppId, testUserId]
    )
    expect(favoriteResult.rows).toHaveLength(1)
  })

  it('應該成功取消收藏 App', async () => {
    // 先收藏
    await query(
      'INSERT INTO favorites (app_id, user_id) VALUES ($1, $2)',
      [testAppId, testUserId]
    )

    // 取消收藏
    const event = createMockEvent({
      method: 'POST',
      path: `/api/apps/${testAppId}/favorite`,
      headers: {
        authorization: `Bearer ${testToken}`
      },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      }
    })

    const response = await toggleFavoriteHandler(event)

    expect(response.isFavorited).toBe(false)

    // 驗證資料庫中已刪除收藏記錄
    const favoriteResult = await query(
      'SELECT * FROM favorites WHERE app_id = $1 AND user_id = $2',
      [testAppId, testUserId]
    )
    expect(favoriteResult.rows).toHaveLength(0)
  })

  it('應該正確處理多次 toggle', async () => {
    const event = createMockEvent({
      method: 'POST',
      path: `/api/apps/${testAppId}/favorite`,
      headers: {
        authorization: `Bearer ${testToken}`
      },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      }
    })

    // 第一次：收藏
    const response1 = await toggleFavoriteHandler(event)
    expect(response1.isFavorited).toBe(true)

    // 第二次：取消收藏
    const response2 = await toggleFavoriteHandler(event)
    expect(response2.isFavorited).toBe(false)

    // 第三次：再次收藏
    const response3 = await toggleFavoriteHandler(event)
    expect(response3.isFavorited).toBe(true)
  })

  it('應該拒絕未認證的請求', async () => {
    const event = createMockEvent({
      method: 'POST',
      path: `/api/apps/${testAppId}/favorite`,
      context: {
        params: { id: testAppId }
      }
    })

    await expect(toggleFavoriteHandler(event)).rejects.toThrow()
  })

  it('應該拒絕不存在的 App', async () => {
    const fakeAppId = '00000000-0000-0000-0000-000000000000'
    const event = createMockEvent({
      method: 'POST',
      path: `/api/apps/${fakeAppId}/favorite`,
      headers: {
        authorization: `Bearer ${testToken}`
      },
      context: {
        userId: testUserId,
        params: { id: fakeAppId }
      }
    })

    await expect(toggleFavoriteHandler(event)).rejects.toThrow()
  })

  it('應該返回收藏總數', async () => {
    // 建立另一個使用者並收藏同一個 App
    const user2Result = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`favorite-test-2-${Date.now()}@example.com`, `favoritetest2${Date.now()}`, 'hash']
    )
    const user2Id = user2Result.rows[0].id

    await query(
      'INSERT INTO favorites (app_id, user_id) VALUES ($1, $2)',
      [testAppId, user2Id]
    )

    // 當前使用者收藏
    const event = createMockEvent({
      method: 'POST',
      path: `/api/apps/${testAppId}/favorite`,
      headers: {
        authorization: `Bearer ${testToken}`
      },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      }
    })

    const response = await toggleFavoriteHandler(event)

    expect(response).toHaveProperty('favoriteCount')
    expect(response.favoriteCount).toBeGreaterThanOrEqual(2)

    // 清理
    await query('DELETE FROM users WHERE id = $1', [user2Id])
  })
})
