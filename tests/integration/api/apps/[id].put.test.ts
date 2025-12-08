import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest'
import { query } from '~/server/utils/db'
import { setupH3Mocks, createMockEvent } from '~/tests/helpers/h3Mocks'
import { generateToken } from '~/server/utils/jwt'

// 設置 H3 mocks
setupH3Mocks()

// 動態導入處理器
let updateAppHandler: any

beforeAll(async () => {
  updateAppHandler = (await import('~/server/api/apps/[id].put')).default
})

// 跳過測試如果沒有資料庫連接
const skipIfNoDb = process.env.DATABASE_URL ? false : true

describe.skipIf(skipIfNoDb)('PUT /api/apps/[id]', () => {
  let testUserId: string
  let testToken: string
  let otherUserId: string
  let otherToken: string
  let testAppId: string

  beforeEach(async () => {
    // 建立測試使用者 1 (App 擁有者)
    const userResult = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`update-owner-${Date.now()}@example.com`, `owner-${Date.now()}`, 'hash']
    )
    testUserId = userResult.rows[0].id
    testToken = generateToken(testUserId)

    // 建立測試使用者 2 (非擁有者)
    const otherResult = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`update-other-${Date.now()}@example.com`, `other-${Date.now()}`, 'hash']
    )
    otherUserId = otherResult.rows[0].id
    otherToken = generateToken(otherUserId)

    // 建立測試 App
    const appResult = await query(
      `INSERT INTO apps (
        user_id, title, description, category, tags,
        upload_type, html_s3_key, file_manifest
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`,
      [
        testUserId,
        'Original Title',
        'Original Description',
        'tool',
        ['original', 'tags'],
        'paste',
        'apps/test-update/index.html',
        { files: ['index.html'] }
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

  it('應該成功更新 App', async () => {
    const event = createMockEvent({
      method: 'PUT',
      headers: {
        authorization: `Bearer ${testToken}`
      },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      },
      body: {
        title: 'Updated Title',
        description: 'Updated Description',
        category: 'game',
        tags: ['updated', 'new']
      }
    })

    const result = await updateAppHandler(event)

    expect(result).toHaveProperty('app')
    expect(result.app.id).toBe(testAppId)
    expect(result.app.title).toBe('Updated Title')
    expect(result.app.description).toBe('Updated Description')
    expect(result.app.category).toBe('game')
    expect(result.app.tags).toEqual(['updated', 'new'])
  })

  it('應該只允許作者更新自己的 App', async () => {
    const event = createMockEvent({
      method: 'PUT',
      headers: {
        authorization: `Bearer ${otherToken}`
      },
      context: {
        userId: otherUserId,
        params: { id: testAppId }
      },
      body: {
        title: 'Hacked Title'
      }
    })

    await expect(updateAppHandler(event)).rejects.toMatchObject({
      statusCode: 403
    })
  })

  it('應該在未認證時返回 401', async () => {
    const event = createMockEvent({
      method: 'PUT',
      context: {
        params: { id: testAppId }
      },
      body: {
        title: 'Unauthorized Update'
      }
    })

    await expect(updateAppHandler(event)).rejects.toMatchObject({
      statusCode: 401
    })
  })

  it('應該在 App 不存在時返回 404', async () => {
    const event = createMockEvent({
      method: 'PUT',
      headers: {
        authorization: `Bearer ${testToken}`
      },
      context: {
        userId: testUserId,
        params: { id: '00000000-0000-0000-0000-000000000000' }
      },
      body: {
        title: 'Non-existent App'
      }
    })

    await expect(updateAppHandler(event)).rejects.toMatchObject({
      statusCode: 404
    })
  })

  it('應該驗證必填欄位', async () => {
    const event = createMockEvent({
      method: 'PUT',
      headers: {
        authorization: `Bearer ${testToken}`
      },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      },
      body: {
        title: '' // 空標題應該被拒絕
      }
    })

    await expect(updateAppHandler(event)).rejects.toMatchObject({
      statusCode: 400
    })
  })

  it('應該驗證 category 值', async () => {
    const event = createMockEvent({
      method: 'PUT',
      headers: {
        authorization: `Bearer ${testToken}`
      },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      },
      body: {
        title: 'Valid Title',
        category: 'invalid-category'
      }
    })

    await expect(updateAppHandler(event)).rejects.toMatchObject({
      statusCode: 400
    })
  })

  it('應該支援部分更新（只更新提供的欄位）', async () => {
    const event = createMockEvent({
      method: 'PUT',
      headers: {
        authorization: `Bearer ${testToken}`
      },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      },
      body: {
        title: 'New Title Only'
        // 不更新其他欄位
      }
    })

    const result = await updateAppHandler(event)

    expect(result.app.title).toBe('New Title Only')
    expect(result.app.description).toBe('Original Description') // 應該保持不變
    expect(result.app.category).toBe('tool') // 應該保持不變
  })

  it('應該更新 updated_at 時間戳', async () => {
    // 獲取更新前的時間戳
    const beforeResult = await query(
      'SELECT updated_at FROM apps WHERE id = $1',
      [testAppId]
    )
    const beforeTimestamp = beforeResult.rows[0].updated_at

    // 等待一小段時間確保時間戳不同
    await new Promise(resolve => setTimeout(resolve, 100))

    const event = createMockEvent({
      method: 'PUT',
      headers: {
        authorization: `Bearer ${testToken}`
      },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      },
      body: {
        title: 'Updated Title'
      }
    })

    await updateAppHandler(event)

    // 檢查時間戳是否更新
    const afterResult = await query(
      'SELECT updated_at FROM apps WHERE id = $1',
      [testAppId]
    )
    const afterTimestamp = afterResult.rows[0].updated_at

    expect(new Date(afterTimestamp).getTime()).toBeGreaterThan(
      new Date(beforeTimestamp).getTime()
    )
  })
})
