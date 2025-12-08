import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest'
import { query } from '~/server/utils/db'
import { setupH3Mocks, createMockEvent } from '~/tests/helpers/h3Mocks'

// 設置 H3 mocks
setupH3Mocks()

// 動態導入處理器
let getAppHandler: any

beforeAll(async () => {
  getAppHandler = (await import('~/server/api/apps/[id].get')).default
})

// 跳過測試如果沒有資料庫連接
const skipIfNoDb = process.env.DATABASE_URL ? false : true

describe.skipIf(skipIfNoDb)('GET /api/apps/[id]', () => {
  let testUserId: string
  let testAppId: string

  beforeEach(async () => {
    // 建立測試使用者
    const userResult = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`app-detail-test-${Date.now()}@example.com`, `detailuser-${Date.now()}`, 'hash']
    )
    testUserId = userResult.rows[0].id

    // 建立測試 App
    const appResult = await query(
      `INSERT INTO apps (
        user_id, title, description, category, tags,
        upload_type, html_s3_key, file_manifest, view_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id`,
      [
        testUserId,
        'Test App for Detail',
        'This is a test application',
        'tool',
        ['test', 'demo'],
        'paste',
        'apps/test-detail/index.html',
        { files: ['index.html', 'style.css'] },
        100
      ]
    )
    testAppId = appResult.rows[0].id
  })

  afterEach(async () => {
    // 清理測試資料
    if (testUserId) {
      await query('DELETE FROM users WHERE id = $1', [testUserId])
    }
  })

  it('應該成功獲取 App 詳情', async () => {
    const event = createMockEvent({
      context: { params: { id: testAppId } }
    })

    const result = await getAppHandler(event)

    expect(result).toHaveProperty('app')
    expect(result.app.id).toBe(testAppId)
    expect(result.app.title).toBe('Test App for Detail')
    expect(result.app.description).toBe('This is a test application')
    expect(result.app.category).toBe('tool')
  })

  it('應該增加瀏覽次數', async () => {
    // 獲取初始瀏覽次數
    const beforeResult = await query(
      'SELECT view_count FROM apps WHERE id = $1',
      [testAppId]
    )
    const beforeViewCount = beforeResult.rows[0].view_count

    const event = createMockEvent({
      context: { params: { id: testAppId } }
    })

    await getAppHandler(event)

    // 檢查瀏覽次數是否增加
    const afterResult = await query(
      'SELECT view_count FROM apps WHERE id = $1',
      [testAppId]
    )
    const afterViewCount = afterResult.rows[0].view_count

    expect(afterViewCount).toBe(beforeViewCount + 1)
  })

  it('應該在 App 不存在時返回 404', async () => {
    const event = createMockEvent({
      context: { params: { id: '00000000-0000-0000-0000-000000000000' } }
    })

    await expect(getAppHandler(event)).rejects.toMatchObject({
      statusCode: 404
    })
  })

  it('應該在缺少 ID 參數時返回 400', async () => {
    const event = createMockEvent({
      context: { params: {} }
    })

    await expect(getAppHandler(event)).rejects.toMatchObject({
      statusCode: 400
    })
  })

  it('應該包含作者資訊', async () => {
    const event = createMockEvent({
      context: { params: { id: testAppId } }
    })

    const result = await getAppHandler(event)

    expect(result.app).toHaveProperty('author_username')
    expect(result.app.author_username).toBeTruthy()
    // 不應該包含敏感資訊如 email
    expect(result.app).not.toHaveProperty('author_email')
  })

  it('應該正確處理 JSON 欄位 (tags, file_manifest)', async () => {
    const event = createMockEvent({
      context: { params: { id: testAppId } }
    })

    const result = await getAppHandler(event)

    expect(Array.isArray(result.app.tags)).toBe(true)
    expect(result.app.tags).toEqual(['test', 'demo'])
    expect(result.app.file_manifest).toEqual({ files: ['index.html', 'style.css'] })
  })
})
