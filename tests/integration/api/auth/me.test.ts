import { describe, it, expect, beforeAll } from 'vitest'
import { query } from '~/server/utils/db'
import { setupH3Mocks, createMockEvent } from '~/tests/helpers/h3Mocks'
import bcrypt from 'bcryptjs'

// 設置 H3 mocks
setupH3Mocks()

// 動態導入處理器（在 mocks 設置之後）
let meHandler: any
let authMiddleware: any
let generateToken: any

beforeAll(async () => {
  meHandler = (await import('~/server/api/auth/me.get')).default
  authMiddleware = (await import('~/server/middleware/auth')).default
  const jwtModule = await import('~/server/utils/jwt')
  generateToken = jwtModule.generateToken
})

// 跳過測試如果沒有資料庫連接
const skipIfNoDb = process.env.DATABASE_URL ? false : true

describe.skipIf(skipIfNoDb)('GET /api/auth/me', () => {
  let testUserId: string
  let testToken: string

  beforeAll(async () => {
    // 清理測試資料
    await query('DELETE FROM users WHERE email = $1', ['me-test@example.com'])

    // 建立測試使用者
    const passwordHash = await bcrypt.hash('password123', 10)
    const result = await query(
      'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id',
      ['me-test@example.com', 'metest', passwordHash]
    )
    testUserId = result.rows[0].id

    // 生成測試 token
    testToken = generateToken(testUserId)
  })

  it('應該返回當前使用者資訊', async () => {
    const event = createMockEvent({
      method: 'GET',
      path: '/api/auth/me',
      headers: {
        authorization: `Bearer ${testToken}`
      }
    })

    // 運行 auth middleware 來設置 userId
    await authMiddleware(event)

    const response = await meHandler(event)

    expect(response).toHaveProperty('user')
    expect(response.user.id).toBe(testUserId)
    expect(response.user.email).toBe('me-test@example.com')
    expect(response.user.username).toBe('metest')
    expect(response.user).not.toHaveProperty('password_hash')
  })

  it('應該拒絕沒有 token 的請求', async () => {
    const event = createMockEvent({
      method: 'GET',
      path: '/api/auth/me'
    })

    await expect(authMiddleware(event)).rejects.toMatchObject({
      statusCode: 401
    })
  })

  it('應該拒絕無效的 token', async () => {
    const event = createMockEvent({
      method: 'GET',
      path: '/api/auth/me',
      headers: {
        authorization: 'Bearer invalid-token'
      }
    })

    await expect(authMiddleware(event)).rejects.toMatchObject({
      statusCode: 401
    })
  })

  it('應該拒絕不存在使用者的 token', async () => {
    const fakeToken = generateToken('00000000-0000-0000-0000-000000000000')

    const event = createMockEvent({
      method: 'GET',
      path: '/api/auth/me',
      headers: {
        authorization: `Bearer ${fakeToken}`
      }
    })

    // 運行 auth middleware 來驗證 token
    await authMiddleware(event)

    // me handler 應該拒絕不存在的使用者
    await expect(meHandler(event)).rejects.toMatchObject({
      statusCode: 404
    })
  })
})
