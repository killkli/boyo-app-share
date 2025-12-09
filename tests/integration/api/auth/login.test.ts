import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { query } from '~/server/utils/db'
import { setupH3Mocks, createMockEvent } from '~/tests/helpers/h3Mocks'
import bcrypt from 'bcryptjs'

// 設置 H3 mocks
setupH3Mocks()

// 動態導入處理器（在 mocks 設置之後）
let loginHandler: any
let registerHandler: any

beforeAll(async () => {
  loginHandler = (await import('~/server/api/auth/login.post')).default
  registerHandler = (await import('~/server/api/auth/register.post')).default
})

// 跳過測試如果沒有資料庫連接
const skipIfNoDb = process.env.DATABASE_URL ? false : true

describe.skipIf(skipIfNoDb)('POST /api/auth/login', () => {
  const testUser = {
    email: 'testlogin@example.com',
    username: 'loginuser',
    password: 'password123'
  }

  beforeEach(async () => {
    // 清理測試資料
    await query('DELETE FROM users WHERE email = $1', [testUser.email])

    // 直接在資料庫中建立測試使用者
    const passwordHash = await bcrypt.hash(testUser.password, 10)
    await query(
      'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3)',
      [testUser.email, testUser.username, passwordHash]
    )
  })

  it('應該成功登入並返回 token', async () => {
    const event = createMockEvent({
      body: {
        email: testUser.email,
        password: testUser.password
      }
    })

    const response = await loginHandler(event)

    expect(response).toHaveProperty('user')
    expect(response).toHaveProperty('token')
    expect(response.user.email).toBe(testUser.email)
    expect(response.user.username).toBe(testUser.username)
    expect(response.user).not.toHaveProperty('password_hash')
    expect(typeof response.token).toBe('string')
    expect(response.token.length).toBeGreaterThan(0)
  })

  it('應該拒絕錯誤的密碼', async () => {
    const event = createMockEvent({
      body: {
        email: testUser.email,
        password: 'wrongpassword'
      }
    })

    await expect(loginHandler(event)).rejects.toMatchObject({
      statusCode: 401,
      message: expect.stringContaining('密碼錯誤')
    })
  })

  it('應該拒絕不存在的 email', async () => {
    const event = createMockEvent({
      body: {
        email: 'nonexistent@example.com',
        password: 'password123'
      }
    })

    await expect(loginHandler(event)).rejects.toMatchObject({
      statusCode: 401,
      message: expect.stringMatching(/使用者不存在|密碼錯誤/)
    })
  })

  it('應該拒絕無效的 email 格式', async () => {
    const event = createMockEvent({
      body: {
        email: 'invalid-email',
        password: 'password123'
      }
    })

    await expect(loginHandler(event)).rejects.toMatchObject({
      statusCode: 400
    })
  })

  it('應該拒絕空密碼', async () => {
    const event = createMockEvent({
      body: {
        email: testUser.email,
        password: ''
      }
    })

    await expect(loginHandler(event)).rejects.toMatchObject({
      statusCode: 400
    })
  })

  it('應該返回有效的 JWT token', async () => {
    const event = createMockEvent({
      body: {
        email: testUser.email,
        password: testUser.password
      }
    })

    const response = await loginHandler(event)

    // JWT token 應該是三個部分用點分隔
    const tokenParts = response.token.split('.')
    expect(tokenParts).toHaveLength(3)
  })
})
