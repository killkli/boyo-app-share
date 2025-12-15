import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest'
import { query } from '~/server/utils/db'
import { setupH3Mocks, createMockEvent } from '~/tests/helpers/h3Mocks'
import bcrypt from 'bcryptjs'

// 設置 H3 mocks
setupH3Mocks()

// 動態導入處理器
let forgotPasswordHandler: any
let resetPasswordHandler: any

beforeAll(async () => {
  forgotPasswordHandler = (await import('~/server/api/auth/forgot-password.post')).default
  resetPasswordHandler = (await import('~/server/api/auth/reset-password.post')).default
})

// 跳過測試如果沒有資料庫連接
const skipIfNoDb = process.env.DATABASE_URL ? false : true

describe.skipIf(skipIfNoDb)('密碼重設流程', () => {
  const testEmail = 'reset@example.com'
  let testUserId: string
  let resetToken: string

  beforeEach(async () => {
    // 建立測試使用者（有密碼）
    const passwordHash = await bcrypt.hash('oldpassword123', 10)
    const result = await query(
      `INSERT INTO users (email, username, password_hash, email_verified)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [testEmail, 'resetuser', passwordHash, true]
    )
    testUserId = result.rows[0].id
  })

  afterEach(async () => {
    // 清理測試資料
    await query('DELETE FROM verification_tokens WHERE identifier = $1', [testEmail])
    await query('DELETE FROM users WHERE id = $1', [testUserId])
  })

  describe('POST /api/auth/forgot-password', () => {
    it('應該為有效的 email 建立重設 token', async () => {
      const event = createMockEvent({ body: { email: testEmail } })
      const response = await forgotPasswordHandler(event)

      expect(response).toHaveProperty('message')
      expect(response.message).toContain('重設密碼')

      // 檢查資料庫中是否建立了 token
      const tokenResult = await query(
        'SELECT * FROM verification_tokens WHERE identifier = $1',
        [testEmail]
      )

      expect(tokenResult.rows.length).toBe(1)
      expect(tokenResult.rows[0].expires).toBeDefined()
      resetToken = tokenResult.rows[0].token
    })

    it('應該覆蓋舊的重設 token', async () => {
      // 建立舊的 token
      await query(
        `INSERT INTO verification_tokens (identifier, token, expires)
         VALUES ($1, $2, $3)`,
        [testEmail, 'old-reset-token', new Date(Date.now() + 24 * 60 * 60 * 1000)]
      )

      // 發送新的重設請求
      const event = createMockEvent({ body: { email: testEmail } })
      await forgotPasswordHandler(event)

      // 檢查只有一個最新的 token
      const tokenResult = await query(
        'SELECT * FROM verification_tokens WHERE identifier = $1',
        [testEmail]
      )

      expect(tokenResult.rows.length).toBe(1)
      expect(tokenResult.rows[0].token).not.toBe('old-reset-token')
    })

    it('應該為不存在的 email 返回通用訊息（防止 email 枚舉）', async () => {
      const event = createMockEvent({ body: { email: 'nonexistent@example.com' } })
      const response = await forgotPasswordHandler(event)

      // 應該返回相同的訊息，不洩漏使用者是否存在
      expect(response.message).toContain('重設密碼')

      // 但不應該建立 token
      const tokenResult = await query(
        'SELECT * FROM verification_tokens WHERE identifier = $1',
        ['nonexistent@example.com']
      )

      expect(tokenResult.rows.length).toBe(0)
    })

    it('應該拒絕 OAuth 使用者（無密碼）', async () => {
      // 建立 OAuth 使用者（無密碼）
      const oauthEmail = 'oauth@example.com'
      await query(
        `INSERT INTO users (email, username, email_verified)
         VALUES ($1, $2, $3)`,
        [oauthEmail, 'oauthuser', true]
      )

      const event = createMockEvent({ body: { email: oauthEmail } })
      await expect(forgotPasswordHandler(event)).rejects.toThrow('社群登入')

      // 清理
      await query('DELETE FROM users WHERE email = $1', [oauthEmail])
    })
  })

  describe('POST /api/auth/reset-password', () => {
    beforeEach(async () => {
      // 建立重設 token
      resetToken = crypto.randomUUID()
      await query(
        `INSERT INTO verification_tokens (identifier, token, expires)
         VALUES ($1, $2, $3)`,
        [testEmail, resetToken, new Date(Date.now() + 24 * 60 * 60 * 1000)]
      )
    })

    it('應該成功重設密碼', async () => {
      const newPassword = 'newpassword123'
      const event = createMockEvent({
        body: {
          token: resetToken,
          password: newPassword
        }
      })

      const response = await resetPasswordHandler(event)

      expect(response).toHaveProperty('success', true)
      expect(response).toHaveProperty('message')

      // 檢查密碼是否已更新
      const userResult = await query(
        'SELECT password_hash FROM users WHERE id = $1',
        [testUserId]
      )

      const isNewPassword = await bcrypt.compare(
        newPassword,
        userResult.rows[0].password_hash
      )

      expect(isNewPassword).toBe(true)

      // 檢查 token 是否被刪除
      const tokenResult = await query(
        'SELECT * FROM verification_tokens WHERE token = $1',
        [resetToken]
      )

      expect(tokenResult.rows.length).toBe(0)
    })

    it('應該拒絕無效的 token', async () => {
      const event = createMockEvent({
        body: {
          token: 'invalid-token',
          password: 'newpassword123'
        }
      })

      await expect(resetPasswordHandler(event)).rejects.toThrow()
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
        body: {
          token: expiredToken,
          password: 'newpassword123'
        }
      })

      await expect(resetPasswordHandler(event)).rejects.toThrow()
    })

    it('應該拒絕弱密碼', async () => {
      const event = createMockEvent({
        body: {
          token: resetToken,
          password: '123' // 太短
        }
      })

      await expect(resetPasswordHandler(event)).rejects.toThrow()
    })

    it('應該拒絕重複使用的 token', async () => {
      const newPassword = 'newpassword123'

      // 第一次重設
      const event1 = createMockEvent({
        body: { token: resetToken, password: newPassword }
      })
      await resetPasswordHandler(event1)

      // 第二次使用同一個 token
      const event2 = createMockEvent({
        body: { token: resetToken, password: 'anotherpassword123' }
      })

      await expect(resetPasswordHandler(event2)).rejects.toThrow()
    })
  })
})
