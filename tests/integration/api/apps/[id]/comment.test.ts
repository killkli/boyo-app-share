import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest'
import { query } from '~/server/utils/db'
import { generateToken } from '~/server/utils/jwt'
import { setupH3Mocks, createMockEvent } from '~/tests/helpers/h3Mocks'

// 設置 H3 mocks
setupH3Mocks()

// 動態導入處理器（在 mocks 設置之後）
let createCommentHandler: any
let getCommentsHandler: any

beforeAll(async () => {
  createCommentHandler = (await import('~/server/api/apps/[id]/comments.post')).default
  getCommentsHandler = (await import('~/server/api/apps/[id]/comments.get')).default
})

// 跳過測試如果沒有資料庫連接
const skipIfNoDb = process.env.DATABASE_URL ? false : true

describe.skipIf(skipIfNoDb)('POST /api/apps/[id]/comments - 評論功能', () => {
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
      [`comment-test-${Date.now()}@example.com`, `commenttest${Date.now()}`, 'hash']
    )
    testUserId = userResult.rows[0].id
    testToken = generateToken(testUserId, testSecret)

    // 建立測試 App
    const appResult = await query(
      `INSERT INTO apps (user_id, title, description, category, upload_type, html_s3_key)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [testUserId, 'Test App for Comments', 'Description', 'tool', 'paste', 'apps/test/index.html']
    )
    testAppId = appResult.rows[0].id

    // 清理所有 Mock
    vi.clearAllMocks()
  })

  afterEach(async () => {
    // 清理測試資料（CASCADE 會自動刪除相關的 comments）
    if (testUserId) {
      await query('DELETE FROM users WHERE id = $1', [testUserId])
    }
  })

  it('應該成功發表評論', async () => {
    const event = createMockEvent({
      method: 'POST',
      path: `/api/apps/${testAppId}/comments`,
      headers: {
        authorization: `Bearer ${testToken}`
      },
      body: { content: 'This is a great app!' },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      }
    })

    const response = await createCommentHandler(event)

    expect(response).toHaveProperty('comment')
    expect(response.comment.content).toBe('This is a great app!')
    expect(response.comment.user_id).toBe(testUserId)
    expect(response.comment.app_id).toBe(testAppId)
  })

  it('應該拒絕空評論', async () => {
    const event = createMockEvent({
      method: 'POST',
      path: `/api/apps/${testAppId}/comments`,
      headers: {
        authorization: `Bearer ${testToken}`
      },
      body: { content: '' },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      }
    })

    await expect(createCommentHandler(event)).rejects.toThrow()
  })

  it('應該拒絕過長的評論', async () => {
    const longContent = 'a'.repeat(2001)
    const event = createMockEvent({
      method: 'POST',
      path: `/api/apps/${testAppId}/comments`,
      headers: {
        authorization: `Bearer ${testToken}`
      },
      body: { content: longContent },
      context: {
        userId: testUserId,
        params: { id: testAppId }
      }
    })

    await expect(createCommentHandler(event)).rejects.toThrow()
  })

  it('應該拒絕未認證的請求', async () => {
    const event = createMockEvent({
      method: 'POST',
      path: `/api/apps/${testAppId}/comments`,
      body: { content: 'Test comment' },
      context: {
        params: { id: testAppId }
      }
    })

    await expect(createCommentHandler(event)).rejects.toThrow()
  })

  it('應該拒絕不存在的 App', async () => {
    const fakeAppId = '00000000-0000-0000-0000-000000000000'
    const event = createMockEvent({
      method: 'POST',
      path: `/api/apps/${fakeAppId}/comments`,
      headers: {
        authorization: `Bearer ${testToken}`
      },
      body: { content: 'Test comment' },
      context: {
        userId: testUserId,
        params: { id: fakeAppId }
      }
    })

    await expect(createCommentHandler(event)).rejects.toThrow()
  })
})

describe.skipIf(skipIfNoDb)('GET /api/apps/[id]/comments - 獲取評論列表', () => {
  let testUserId: string
  let testAppId: string
  let commentIds: string[] = []

  beforeEach(async () => {
    // 建立測試使用者
    const userResult = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`comment-list-test-${Date.now()}@example.com`, `commentlisttest${Date.now()}`, 'hash']
    )
    testUserId = userResult.rows[0].id

    // 建立測試 App
    const appResult = await query(
      `INSERT INTO apps (user_id, title, description, category, upload_type, html_s3_key)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [testUserId, 'Test App', 'Description', 'tool', 'paste', 'apps/test/index.html']
    )
    testAppId = appResult.rows[0].id

    // 建立多個測試評論
    for (let i = 0; i < 3; i++) {
      const commentResult = await query(
        `INSERT INTO comments (app_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [testAppId, testUserId, `Test comment ${i + 1}`]
      )
      commentIds.push(commentResult.rows[0].id)
    }

    vi.clearAllMocks()
  })

  afterEach(async () => {
    if (testUserId) {
      await query('DELETE FROM users WHERE id = $1', [testUserId])
    }
  })

  it('應該返回評論列表', async () => {
    const event = createMockEvent({
      method: 'GET',
      path: `/api/apps/${testAppId}/comments`,
      context: {
        params: { id: testAppId }
      }
    })

    const response = await getCommentsHandler(event)

    expect(response).toHaveProperty('comments')
    expect(Array.isArray(response.comments)).toBe(true)
    expect(response.comments.length).toBeGreaterThanOrEqual(3)
  })

  it('應該包含使用者資訊', async () => {
    const event = createMockEvent({
      method: 'GET',
      path: `/api/apps/${testAppId}/comments`,
      context: {
        params: { id: testAppId }
      }
    })

    const response = await getCommentsHandler(event)

    const comment = response.comments[0]
    expect(comment).toHaveProperty('username')
    expect(comment).toHaveProperty('content')
    expect(comment).toHaveProperty('created_at')
  })

  it('應該按時間降序排序（最新在前）', async () => {
    const event = createMockEvent({
      method: 'GET',
      path: `/api/apps/${testAppId}/comments`,
      context: {
        params: { id: testAppId }
      }
    })

    const response = await getCommentsHandler(event)

    const comments = response.comments
    for (let i = 0; i < comments.length - 1; i++) {
      const current = new Date(comments[i].created_at)
      const next = new Date(comments[i + 1].created_at)
      expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime())
    }
  })

  it('應該為不存在的 App 返回空列表', async () => {
    const fakeAppId = '00000000-0000-0000-0000-000000000000'
    const event = createMockEvent({
      method: 'GET',
      path: `/api/apps/${fakeAppId}/comments`,
      context: {
        params: { id: fakeAppId }
      }
    })

    const response = await getCommentsHandler(event)

    expect(response.comments).toEqual([])
  })
})
