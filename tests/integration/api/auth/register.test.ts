import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { query } from '~/server/utils/db'
import { setupH3Mocks, createMockEvent } from '~/tests/helpers/h3Mocks'

// 設置 H3 mocks
setupH3Mocks()

// 動態導入處理器（在 mocks 設置之後）
let registerHandler: any

beforeAll(async () => {
  registerHandler = (await import('~/server/api/auth/register.post')).default
})

// 跳過測試如果沒有資料庫連接
const skipIfNoDb = process.env.DATABASE_URL ? false : true

describe.skipIf(skipIfNoDb)('POST /api/auth/register', () => {
  beforeEach(async () => {
    // 清理測試資料
    await query('DELETE FROM users WHERE email LIKE $1 OR email LIKE $2 OR email LIKE $3',
      ['test%@example.com', 'duplicate@example.com', 'user%@example.com'])
  })

  it('應該成功註冊新使用者', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123'
    }

    const event = createMockEvent({ body: userData })
    const response = await registerHandler(event)

    expect(response).toHaveProperty('user')
    expect(response).toHaveProperty('token')
    expect(response.user.email).toBe(userData.email)
    expect(response.user.username).toBe(userData.username)
    expect(response.user).not.toHaveProperty('password_hash')
    expect(response.token).toBeTruthy()
  })

  it('應該拒絕重複的 email', async () => {
    const userData = {
      email: 'duplicate@example.com',
      username: 'user1',
      password: 'password123'
    }

    // 第一次註冊應該成功
    const event1 = createMockEvent({ body: userData })
    await registerHandler(event1)

    // 第二次使用相同 email 應該失敗
    const event2 = createMockEvent({
      body: { ...userData, username: 'user2' }
    })

    await expect(registerHandler(event2)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('Email')
    })
  })

  it('應該拒絕重複的 username', async () => {
    const userData = {
      email: 'user1@example.com',
      username: 'duplicateuser',
      password: 'password123'
    }

    // 第一次註冊應該成功
    const event1 = createMockEvent({ body: userData })
    await registerHandler(event1)

    // 第二次使用相同 username 應該失敗
    const event2 = createMockEvent({
      body: { ...userData, email: 'user2@example.com' }
    })

    await expect(registerHandler(event2)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('username')
    })
  })

  it('應該拒絕無效的 email', async () => {
    const event = createMockEvent({
      body: {
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123'
      }
    })

    await expect(registerHandler(event)).rejects.toMatchObject({
      statusCode: 400
    })
  })

  it('應該拒絕過短的密碼', async () => {
    const event = createMockEvent({
      body: {
        email: 'test@example.com',
        username: 'testuser',
        password: '123'
      }
    })

    await expect(registerHandler(event)).rejects.toMatchObject({
      statusCode: 400
    })
  })

  it('應該拒絕無效的 username 格式', async () => {
    const event = createMockEvent({
      body: {
        email: 'test@example.com',
        username: 'test@user',
        password: 'password123'
      }
    })

    await expect(registerHandler(event)).rejects.toMatchObject({
      statusCode: 400
    })
  })

  it('應該加密密碼（不應明文儲存）', async () => {
    const userData = {
      email: 'test-secure@example.com',
      username: 'secureuser',
      password: 'mySecretPassword123'
    }

    const event = createMockEvent({ body: userData })
    const response = await registerHandler(event)

    // 從資料庫查詢使用者
    const dbResult = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [response.user.id]
    )
    const storedPasswordHash = dbResult.rows[0].password_hash

    // 密碼應該被加密，不應該等於明文密碼
    expect(storedPasswordHash).not.toBe(userData.password)
    // bcrypt hash 應該以 $2b$ 或 $2a$ 開頭
    expect(storedPasswordHash).toMatch(/^\$2[ab]\$/)
  })
})
