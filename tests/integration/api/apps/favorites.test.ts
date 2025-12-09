import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest'
import { query } from '~/server/utils/db'
import { setupH3Mocks, createMockEvent } from '~/tests/helpers/h3Mocks'

// 設置 H3 mocks
setupH3Mocks()

// 動態導入處理器
let favoritesHandler: any

beforeAll(async () => {
  favoritesHandler = (await import('~/server/api/apps/favorites.get')).default
})

// 跳過測試如果沒有資料庫連接
const skipIfNoDb = process.env.DATABASE_URL ? false : true

describe.skipIf(skipIfNoDb)('GET /api/apps/favorites', () => {
  let testUserId: string
  let testAppIds: string[] = []

  beforeEach(async () => {
    // 建立測試使用者
    const userResult = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`fav-test-${Date.now()}@example.com`, `favuser-${Date.now()}`, 'hash']
    )
    testUserId = userResult.rows[0].id

    // 建立另一個使用者（app作者）
    const authorResult = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`author-${Date.now()}@example.com`, `author-${Date.now()}`, 'hash']
    )
    const authorId = authorResult.rows[0].id

    // 建立測試 Apps
    const apps = [
      { title: 'Favorite App 1', views: 100, created: '3 hours' },
      { title: 'Favorite App 2', views: 50, created: '2 hours' },
      { title: 'Favorite App 3', views: 200, created: '1 hour' }
    ]

    for (let i = 0; i < apps.length; i++) {
      const app = apps[i]
      const appResult = await query(
        `INSERT INTO apps (
          user_id, title, description, category, tags,
          upload_type, html_s3_key, is_public, view_count,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW() - INTERVAL '${app.created}')
        RETURNING id`,
        [
          authorId,
          app.title,
          `Description for ${app.title}`,
          'tool',
          ['favorite'],
          'paste',
          `apps/${app.title}/index.html`,
          true,
          app.views
        ]
      )
      const appId = appResult.rows[0].id
      testAppIds.push(appId)

      // 將app加入使用者的收藏 (最早收藏的App 1, 最晚收藏的App 3)
      await query(
        `INSERT INTO favorites (app_id, user_id, created_at) VALUES ($1, $2, NOW() - INTERVAL '${app.created}')`,
        [appId, testUserId]
      )
    }
  })

  afterEach(async () => {
    // 清理測試資料（CASCADE會自動刪除favorites）
    if (testUserId) {
      await query('DELETE FROM users WHERE id = $1 OR username LIKE \'author-%\'', [testUserId])
    }
    testUserId = ''
    testAppIds = []
  })

  it('應該返回 401 如果使用者未登入', async () => {
    const event = createMockEvent({
      method: 'GET',
      context: {} // 沒有 userId
    })

    await expect(favoritesHandler(event)).rejects.toMatchObject({
      statusCode: 401,
      message: 'Unauthorized'
    })
  })

  it('應該返回使用者收藏的apps列表', async () => {
    const event = createMockEvent({
      method: 'GET',
      context: { userId: testUserId },
      query: {}
    })

    const response = await favoritesHandler(event)

    expect(response).toHaveProperty('apps')
    expect(response).toHaveProperty('total')
    expect(response).toHaveProperty('page')
    expect(response).toHaveProperty('limit')
    expect(Array.isArray(response.apps)).toBe(true)
    expect(response.apps.length).toBe(3)
    expect(response.total).toBe(3)
  })

  it('應該支援分頁參數', async () => {
    const event = createMockEvent({
      method: 'GET',
      context: { userId: testUserId },
      query: { page: '1', limit: '2' }
    })

    const response = await favoritesHandler(event)

    expect(response.apps).toHaveLength(2)
    expect(response.page).toBe(1)
    expect(response.limit).toBe(2)
    expect(response.total).toBe(3)
    expect(response.totalPages).toBe(2)
  })

  it('應該支援排序參數 (latest) - 按收藏時間', async () => {
    const event = createMockEvent({
      method: 'GET',
      context: { userId: testUserId },
      query: { sort: 'latest' }
    })

    const response = await favoritesHandler(event)

    expect(response.apps.length).toBe(3)

    // 驗證按收藏時間排序（最新收藏的在前）
    const titles = response.apps.map((app: any) => app.title)
    // Favorite App 3 是最後收藏的（1 hour ago）
    expect(titles[0]).toBe('Favorite App 3')
  })

  it('應該支援排序參數 (popular)', async () => {
    const event = createMockEvent({
      method: 'GET',
      context: { userId: testUserId },
      query: { sort: 'popular' }
    })

    const response = await favoritesHandler(event)

    expect(response.apps.length).toBe(3)

    // 驗證按瀏覽次數排序
    for (let i = 0; i < response.apps.length - 1; i++) {
      expect(response.apps[i].view_count).toBeGreaterThanOrEqual(
        response.apps[i + 1].view_count
      )
    }
  })

  it('應該返回空列表如果沒有收藏', async () => {
    // 建立一個新使用者（沒有收藏）
    const newUserResult = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`nofav-${Date.now()}@example.com`, `nofav-${Date.now()}`, 'hash']
    )
    const newUserId = newUserResult.rows[0].id

    const event = createMockEvent({
      method: 'GET',
      context: { userId: newUserId },
      query: {}
    })

    const response = await favoritesHandler(event)

    expect(response.apps).toEqual([])
    expect(response.total).toBe(0)
    expect(response.totalPages).toBe(0)

    // 清理
    await query('DELETE FROM users WHERE id = $1', [newUserId])
  })

  it('應該包含完整的app統計資訊', async () => {
    const event = createMockEvent({
      method: 'GET',
      context: { userId: testUserId },
      query: {}
    })

    const response = await favoritesHandler(event)
    const app = response.apps[0]

    // 驗證包含所有必要欄位
    expect(app).toHaveProperty('id')
    expect(app).toHaveProperty('title')
    expect(app).toHaveProperty('description')
    expect(app).toHaveProperty('category')
    expect(app).toHaveProperty('author_username')
    expect(app).toHaveProperty('avg_rating')
    expect(app).toHaveProperty('rating_count')
    expect(app).toHaveProperty('comment_count')
    expect(app).toHaveProperty('view_count')
    expect(app).toHaveProperty('favorited_at')
  })
})
