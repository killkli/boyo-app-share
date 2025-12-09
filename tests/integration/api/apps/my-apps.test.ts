import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest'
import { query } from '~/server/utils/db'
import { setupH3Mocks, createMockEvent } from '~/tests/helpers/h3Mocks'

// 設置 H3 mocks
setupH3Mocks()

// 動態導入處理器
let myAppsHandler: any

beforeAll(async () => {
  myAppsHandler = (await import('~/server/api/apps/my-apps.get')).default
})

// 跳過測試如果沒有資料庫連接
const skipIfNoDb = process.env.DATABASE_URL ? false : true

describe.skipIf(skipIfNoDb)('GET /api/apps/my-apps', () => {
  let testUserId: string
  let otherUserId: string
  let testAppIds: string[] = []

  beforeEach(async () => {
    // 建立測試使用者
    const userResult = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`myapps-test-${Date.now()}@example.com`, `myappsuser-${Date.now()}`, 'hash']
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

    // 建立當前使用者的 Apps
    const myApps = [
      { title: 'My App 1', views: 100, created: '3 hours' },
      { title: 'My App 2', views: 50, created: '2 hours' },
      { title: 'My App 3', views: 200, created: '1 hour' }
    ]

    for (const app of myApps) {
      const appResult = await query(
        `INSERT INTO apps (
          user_id, title, description, category, tags,
          upload_type, html_s3_key, is_public, view_count,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW() - INTERVAL '${app.created}')
        RETURNING id`,
        [
          testUserId,
          app.title,
          `Description for ${app.title}`,
          'tool',
          ['myapp'],
          'paste',
          `apps/${app.title}/index.html`,
          true,
          app.views
        ]
      )
      testAppIds.push(appResult.rows[0].id)
    }

    // 建立其他使用者的 App（不應該出現在結果中）
    const otherAppResult = await query(
      `INSERT INTO apps (
        user_id, title, description, category, tags,
        upload_type, html_s3_key, is_public
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`,
      [
        otherUserId,
        'Other User App',
        'Should not appear',
        'game',
        ['other'],
        'paste',
        'apps/other/index.html',
        true
      ]
    )
    testAppIds.push(otherAppResult.rows[0].id)
  })

  afterEach(async () => {
    // 清理測試資料
    if (testUserId) {
      await query('DELETE FROM users WHERE id = $1 OR id = $2', [testUserId, otherUserId])
    }
    testUserId = ''
    otherUserId = ''
    testAppIds = []
  })

  it('應該返回 401 如果使用者未登入', async () => {
    const event = createMockEvent({
      method: 'GET',
      context: {} // 沒有 userId
    })

    await expect(myAppsHandler(event)).rejects.toMatchObject({
      statusCode: 401,
      message: 'Unauthorized'
    })
  })

  it('應該返回使用者創建的apps列表', async () => {
    const event = createMockEvent({
      method: 'GET',
      context: { userId: testUserId },
      query: {}
    })

    const response = await myAppsHandler(event)

    expect(response).toHaveProperty('apps')
    expect(response).toHaveProperty('total')
    expect(response).toHaveProperty('page')
    expect(response).toHaveProperty('limit')
    expect(Array.isArray(response.apps)).toBe(true)
    expect(response.apps.length).toBe(3)
    expect(response.total).toBe(3)

    // 驗證只返回當前使用者的apps
    response.apps.forEach((app: any) => {
      expect(app.user_id).toBe(testUserId)
      expect(app.title).toContain('My App')
    })
  })

  it('不應該返回其他使用者的apps', async () => {
    const event = createMockEvent({
      method: 'GET',
      context: { userId: testUserId },
      query: {}
    })

    const response = await myAppsHandler(event)

    // 確保沒有其他使用者的app
    const otherApp = response.apps.find((app: any) => app.title === 'Other User App')
    expect(otherApp).toBeUndefined()
  })

  it('應該支援分頁參數', async () => {
    const event = createMockEvent({
      method: 'GET',
      context: { userId: testUserId },
      query: { page: '1', limit: '2' }
    })

    const response = await myAppsHandler(event)

    expect(response.apps).toHaveLength(2)
    expect(response.page).toBe(1)
    expect(response.limit).toBe(2)
    expect(response.total).toBe(3)
    expect(response.totalPages).toBe(2)
  })

  it('應該支援排序參數 (latest)', async () => {
    const event = createMockEvent({
      method: 'GET',
      context: { userId: testUserId },
      query: { sort: 'latest' }
    })

    const response = await myAppsHandler(event)

    expect(response.apps.length).toBe(3)

    // 驗證按創建時間排序（最新的在前）
    for (let i = 0; i < response.apps.length - 1; i++) {
      const current = new Date(response.apps[i].created_at).getTime()
      const next = new Date(response.apps[i + 1].created_at).getTime()
      expect(current).toBeGreaterThanOrEqual(next)
    }
  })

  it('應該支援排序參數 (popular)', async () => {
    const event = createMockEvent({
      method: 'GET',
      context: { userId: testUserId },
      query: { sort: 'popular' }
    })

    const response = await myAppsHandler(event)

    expect(response.apps.length).toBe(3)

    // 驗證按瀏覽次數排序
    for (let i = 0; i < response.apps.length - 1; i++) {
      expect(response.apps[i].view_count).toBeGreaterThanOrEqual(
        response.apps[i + 1].view_count
      )
    }
  })

  it('應該包含公開和私有的apps', async () => {
    // 建立一個私有app
    const privateAppResult = await query(
      `INSERT INTO apps (
        user_id, title, description, category, tags,
        upload_type, html_s3_key, is_public
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`,
      [
        testUserId,
        'My Private App',
        'This is private',
        'tool',
        ['private'],
        'paste',
        'apps/private/index.html',
        false
      ]
    )
    testAppIds.push(privateAppResult.rows[0].id)

    const event = createMockEvent({
      method: 'GET',
      context: { userId: testUserId },
      query: {}
    })

    const response = await myAppsHandler(event)

    // 應該包含私有app（因為是使用者自己的）
    expect(response.apps.length).toBe(4)
    const privateApp = response.apps.find((app: any) => app.title === 'My Private App')
    expect(privateApp).toBeDefined()
    expect(privateApp.is_public).toBe(false)
  })

  it('應該返回空列表如果沒有創建任何app', async () => {
    // 建立一個新使用者（沒有apps）
    const newUserResult = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`noapp-${Date.now()}@example.com`, `noapp-${Date.now()}`, 'hash']
    )
    const newUserId = newUserResult.rows[0].id

    const event = createMockEvent({
      method: 'GET',
      context: { userId: newUserId },
      query: {}
    })

    const response = await myAppsHandler(event)

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

    const response = await myAppsHandler(event)
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
    expect(app).toHaveProperty('is_public')
  })
})
