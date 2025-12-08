import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest'
import { query } from '~/server/utils/db'
import { setupH3Mocks, createMockEvent } from '~/tests/helpers/h3Mocks'

// 設置 H3 mocks
setupH3Mocks()

// 動態導入處理器
let listAppsHandler: any

beforeAll(async () => {
  listAppsHandler = (await import('~/server/api/apps/index.get')).default
})

// 跳過測試如果沒有資料庫連接
const skipIfNoDb = process.env.DATABASE_URL ? false : true

describe.skipIf(skipIfNoDb)('GET /api/apps', () => {
  let testUserIds: string[] = []
  let testAppIds: string[] = []

  beforeEach(async () => {
    // 建立測試使用者
    const user1Result = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`list-test-1-${Date.now()}@example.com`, `listuser1-${Date.now()}`, 'hash']
    )
    testUserIds.push(user1Result.rows[0].id)

    const user2Result = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`list-test-2-${Date.now()}@example.com`, `listuser2-${Date.now()}`, 'hash']
    )
    testUserIds.push(user2Result.rows[0].id)

    // 插入測試資料 - 15 個 Apps
    const apps = [
      { title: 'Game App 1', category: 'game', tags: ['fun', 'interactive'], views: 100 },
      { title: 'Tool App 1', category: 'tool', tags: ['productivity', 'utility'], views: 50 },
      { title: 'Art App 1', category: 'art', tags: ['creative', 'design'], views: 75 },
      { title: 'Game App 2', category: 'game', tags: ['fun', 'multiplayer'], views: 200 },
      { title: 'Tool App 2', category: 'tool', tags: ['productivity', 'automation'], views: 30 },
      { title: 'Educational App', category: 'education', tags: ['learning', 'interactive'], views: 120 },
      { title: 'Game App 3', category: 'game', tags: ['fun', 'puzzle'], views: 150 },
      { title: 'Utility App', category: 'utility', tags: ['productivity', 'tool'], views: 60 },
      { title: 'Creative App', category: 'art', tags: ['creative', 'fun'], views: 90 },
      { title: 'Test Search App', category: 'tool', tags: ['test'], views: 40 },
      { title: 'Another Game', category: 'game', tags: ['fun'], views: 180 },
      { title: 'Design Tool', category: 'tool', tags: ['design', 'creative'], views: 70 },
      { title: 'Music App', category: 'entertainment', tags: ['audio', 'fun'], views: 110 },
      { title: 'Quiz App', category: 'education', tags: ['learning', 'fun'], views: 85 },
      { title: 'Calculator', category: 'utility', tags: ['productivity', 'math'], views: 95 }
    ]

    for (let i = 0; i < apps.length; i++) {
      const app = apps[i]
      const userId = testUserIds[i % 2] // 交替使用兩個使用者

      const appResult = await query(
        `INSERT INTO apps (
          user_id, title, description, category, tags,
          upload_type, html_s3_key, file_manifest,
          is_public, view_count, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW() - INTERVAL '${i} hours')
        RETURNING id`,
        [
          userId,
          app.title,
          `Description for ${app.title}`,
          app.category,
          app.tags,
          'paste',
          `apps/app-${i}/index.html`,
          null,
          true,
          app.views
        ]
      )
      testAppIds.push(appResult.rows[0].id)
    }
  })

  afterEach(async () => {
    // 清理測試資料
    if (testUserIds.length > 0) {
      await query('DELETE FROM users WHERE id = ANY($1)', [testUserIds])
    }
    testUserIds = []
    testAppIds = []
  })

  it('應該返回 App 列表（基本功能）', async () => {
    const event = createMockEvent({
      method: 'GET',
      query: {}
    })

    const response = await listAppsHandler(event)

    expect(response).toHaveProperty('apps')
    expect(response).toHaveProperty('total')
    expect(response).toHaveProperty('page')
    expect(response).toHaveProperty('limit')
    expect(Array.isArray(response.apps)).toBe(true)
    expect(response.apps.length).toBeGreaterThan(0)
    expect(response.total).toBe(15)
  })

  it('應該支援分頁（第 1 頁）', async () => {
    const event = createMockEvent({
      method: 'GET',
      query: { page: '1', limit: '5' }
    })

    const response = await listAppsHandler(event)

    expect(response.apps).toHaveLength(5)
    expect(response.page).toBe(1)
    expect(response.limit).toBe(5)
    expect(response.total).toBe(15)
  })

  it('應該支援分頁（第 2 頁）', async () => {
    const event = createMockEvent({
      method: 'GET',
      query: { page: '2', limit: '5' }
    })

    const response = await listAppsHandler(event)

    expect(response.apps).toHaveLength(5)
    expect(response.page).toBe(2)
    expect(response.limit).toBe(5)

    // 第 2 頁的內容應該與第 1 頁不同
    const page1Event = createMockEvent({
      method: 'GET',
      query: { page: '1', limit: '5' }
    })
    const page1Response = await listAppsHandler(page1Event)

    expect(response.apps[0].id).not.toBe(page1Response.apps[0].id)
  })

  it('應該支援分類篩選', async () => {
    const event = createMockEvent({
      method: 'GET',
      query: { category: 'game' }
    })

    const response = await listAppsHandler(event)

    expect(response.apps.length).toBeGreaterThan(0)
    response.apps.forEach((app: any) => {
      expect(app.category).toBe('game')
    })
  })

  it('應該支援標籤篩選（單一標籤）', async () => {
    const event = createMockEvent({
      method: 'GET',
      query: { tags: 'fun' }
    })

    const response = await listAppsHandler(event)

    expect(response.apps.length).toBeGreaterThan(0)
    response.apps.forEach((app: any) => {
      expect(app.tags).toContain('fun')
    })
  })

  it('應該支援標籤篩選（多個標籤）', async () => {
    const event = createMockEvent({
      method: 'GET',
      query: { tags: 'interactive,fun' }
    })

    const response = await listAppsHandler(event)

    expect(response.apps.length).toBeGreaterThan(0)
    response.apps.forEach((app: any) => {
      const hasTag = app.tags.includes('interactive') || app.tags.includes('fun')
      expect(hasTag).toBe(true)
    })
  })

  it('應該支援按最新排序（默認）', async () => {
    const event = createMockEvent({
      method: 'GET',
      query: { sort: 'latest' }
    })

    const response = await listAppsHandler(event)

    expect(response.apps.length).toBeGreaterThan(1)

    // 驗證日期遞減排序
    for (let i = 0; i < response.apps.length - 1; i++) {
      const current = new Date(response.apps[i].created_at).getTime()
      const next = new Date(response.apps[i + 1].created_at).getTime()
      expect(current).toBeGreaterThanOrEqual(next)
    }
  })

  it('應該支援按熱門排序', async () => {
    const event = createMockEvent({
      method: 'GET',
      query: { sort: 'popular' }
    })

    const response = await listAppsHandler(event)

    expect(response.apps.length).toBeGreaterThan(1)

    // 驗證瀏覽次數遞減排序
    for (let i = 0; i < response.apps.length - 1; i++) {
      expect(response.apps[i].view_count).toBeGreaterThanOrEqual(response.apps[i + 1].view_count)
    }
  })

  it('應該支援搜尋（標題匹配）', async () => {
    const event = createMockEvent({
      method: 'GET',
      query: { search: 'Game' }
    })

    const response = await listAppsHandler(event)

    expect(response.apps.length).toBeGreaterThan(0)
    response.apps.forEach((app: any) => {
      const matchTitle = app.title.toLowerCase().includes('game')
      const matchDesc = app.description?.toLowerCase().includes('game')
      expect(matchTitle || matchDesc).toBe(true)
    })
  })

  it('應該支援搜尋（描述匹配）', async () => {
    const event = createMockEvent({
      method: 'GET',
      query: { search: 'Search' }
    })

    const response = await listAppsHandler(event)

    expect(response.apps.length).toBeGreaterThan(0)
    response.apps.forEach((app: any) => {
      const matchTitle = app.title.toLowerCase().includes('search')
      const matchDesc = app.description?.toLowerCase().includes('search')
      expect(matchTitle || matchDesc).toBe(true)
    })
  })

  it('應該支援組合篩選（分類 + 標籤 + 排序）', async () => {
    const event = createMockEvent({
      method: 'GET',
      query: {
        category: 'game',
        tags: 'fun',
        sort: 'popular'
      }
    })

    const response = await listAppsHandler(event)

    expect(response.apps.length).toBeGreaterThan(0)

    response.apps.forEach((app: any) => {
      expect(app.category).toBe('game')
      expect(app.tags).toContain('fun')
    })

    // 驗證按熱門排序
    if (response.apps.length > 1) {
      for (let i = 0; i < response.apps.length - 1; i++) {
        expect(response.apps[i].view_count).toBeGreaterThanOrEqual(response.apps[i + 1].view_count)
      }
    }
  })

  it('應該只返回公開的 App', async () => {
    // 插入一個私有 App
    const privateAppResult = await query(
      `INSERT INTO apps (
        user_id, title, description, category, tags,
        upload_type, html_s3_key, is_public
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`,
      [
        testUserIds[0],
        'Private App',
        'This should not appear',
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
      query: {}
    })

    const response = await listAppsHandler(event)

    // 驗證結果中不包含私有 App
    const privateApp = response.apps.find((app: any) => app.title === 'Private App')
    expect(privateApp).toBeUndefined()
  })

  it('應該處理空結果', async () => {
    const event = createMockEvent({
      method: 'GET',
      query: { category: 'nonexistent' }
    })

    const response = await listAppsHandler(event)

    expect(response.apps).toHaveLength(0)
    expect(response.total).toBe(0)
    expect(response.page).toBe(1)
  })

  it('應該使用默認分頁參數', async () => {
    const event = createMockEvent({
      method: 'GET',
      query: {}
    })

    const response = await listAppsHandler(event)

    expect(response.page).toBe(1)
    expect(response.limit).toBe(12) // 默認每頁 12 個
  })
})
