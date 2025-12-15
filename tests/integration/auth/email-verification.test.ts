import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest'
import { query } from '~/server/utils/db'
import { setupH3Mocks, createMockEvent } from '~/tests/helpers/h3Mocks'

// 設置 H3 mocks
setupH3Mocks()

// 動態導入處理器
let sendVerificationEmailHandler: any
let verifyEmailHandler: any

beforeAll(async () => {
  sendVerificationEmailHandler = (await import('~/server/api/auth/send-verification-email.post')).default
  verifyEmailHandler = (await import('~/server/api/auth/verify-email.get')).default
})

// 跳過測試如果沒有資料庫連接
const skipIfNoDb = process.env.DATABASE_URL ? false : true

describe.skipIf(skipIfNoDb)('Email 驗證流程', () => {
  const testEmail = 'test@example.com'
  let testUserId: string
  let verificationToken: string

  beforeEach(async () => {
    // 建立測試使用者（未驗證）
    const result = await query(
      `INSERT INTO users (email, username, password_hash, email_verified)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [testEmail, 'testuser', 'hashedpassword', false]
    )
    testUserId = result.rows[0].id
  })

  afterEach(async () => {
    // 清理測試資料
    await query('DELETE FROM verification_tokens WHERE identifier = $1', [testEmail])
    await query('DELETE FROM users WHERE id = $1', [testUserId])
  })

  describe('POST /api/auth/send-verification-email', () => {
    it('應該為未驗證的使用者建立驗證 token', async () => {
      const event = createMockEvent({ body: { email: testEmail } })
      const response = await sendVerificationEmailHandler(event)

      expect(response).toHaveProperty('message')
      expect(response.message).toContain('驗證信已發送')

      // 檢查資料庫中是否建立了 token
      const tokenResult = await query(
        'SELECT * FROM verification_tokens WHERE identifier = $1',
        [testEmail]
      )

      expect(tokenResult.rows.length).toBe(1)
      expect(tokenResult.rows[0].expires).toBeDefined()
      verificationToken = tokenResult.rows[0].token
    })

    it('應該覆蓋舊的驗證 token', async () => {
      // 建立舊的 token
      await query(
        `INSERT INTO verification_tokens (identifier, token, expires)
         VALUES ($1, $2, $3)`,
        [testEmail, 'old-token', new Date(Date.now() + 24 * 60 * 60 * 1000)]
      )

      // 發送新的驗證信
      const event = createMockEvent({ body: { email: testEmail } })
      await sendVerificationEmailHandler(event)

      // 檢查只有一個最新的 token
      const tokenResult = await query(
        'SELECT * FROM verification_tokens WHERE identifier = $1',
        [testEmail]
      )

      expect(tokenResult.rows.length).toBe(1)
      expect(tokenResult.rows[0].token).not.toBe('old-token')
    })

    it('應該拒絕已驗證的使用者', async () => {
      // 更新使用者為已驗證
      await query(
        'UPDATE users SET email_verified = true WHERE id = $1',
        [testUserId]
      )

      const event = createMockEvent({ body: { email: testEmail } })
      await expect(sendVerificationEmailHandler(event)).rejects.toThrow()
    })

    it('應該拒絕不存在的 email', async () => {
      const event = createMockEvent({ body: { email: 'nonexistent@example.com' } })
      await expect(sendVerificationEmailHandler(event)).rejects.toThrow()
    })
  })

  describe('GET /api/auth/verify-email', () => {
    beforeEach(async () => {
      // 建立驗證 token
      verificationToken = crypto.randomUUID()
      await query(
        `INSERT INTO verification_tokens (identifier, token, expires)
         VALUES ($1, $2, $3)`,
        [testEmail, verificationToken, new Date(Date.now() + 24 * 60 * 60 * 1000)]
      )
    })

    it('應該成功驗證有效的 token', async () => {
      const event = createMockEvent({
        method: 'GET',
        query: { token: verificationToken }
      })
      const response = await verifyEmailHandler(event)

      expect(response).toHaveProperty('success', true)
      expect(response).toHaveProperty('message')

      // 檢查使用者是否被標記為已驗證
      const userResult = await query(
        'SELECT email_verified FROM users WHERE id = $1',
        [testUserId]
      )

      expect(userResult.rows[0].email_verified).toBe(true)

      // 檢查 token 是否被刪除
      const tokenResult = await query(
        'SELECT * FROM verification_tokens WHERE token = $1',
        [verificationToken]
      )

      expect(tokenResult.rows.length).toBe(0)
    })

    it('應該拒絕無效的 token', async () => {
      const event = createMockEvent({
        method: 'GET',
        query: { token: 'invalid-token' }
      })
      await expect(verifyEmailHandler(event)).rejects.toThrow()
    })

    it('應該拒絕過期的 token', async () => {
      // 建立過期的 token
      const expiredToken = crypto.randomUUID()
      await query(
        `INSERT INTO verification_tokens (identifier, token, expires)
         VALUES ($1, $2, $3)`,
        [testEmail, expiredToken, new Date(Date.now() - 1000)] // 已過期
      )

      const event = createMockEvent({
        method: 'GET',
        query: { token: expiredToken }
      })
      await expect(verifyEmailHandler(event)).rejects.toThrow()
    })

    it('應該拒絕重複使用的 token', async () => {
      // 第一次驗證
      const event1 = createMockEvent({
        method: 'GET',
        query: { token: verificationToken }
      })
      await verifyEmailHandler(event1)

      // 第二次使用同一個 token
      const event2 = createMockEvent({
        method: 'GET',
        query: { token: verificationToken }
      })
      await expect(verifyEmailHandler(event2)).rejects.toThrow()
    })
  })
})
