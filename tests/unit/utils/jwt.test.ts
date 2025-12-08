import { describe, it, expect } from 'vitest'
import { generateToken, verifyToken } from '../../../server/utils/jwt'
import jwt from 'jsonwebtoken'

const TEST_SECRET = 'test-secret-key-for-testing-only'

describe('JWT 工具函數', () => {
  describe('generateToken', () => {
    it('應該生成有效的 JWT token', () => {
      const token = generateToken('user-id-123', TEST_SECRET)

      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT 格式: header.payload.signature
    })

    it('應該包含使用者 ID', () => {
      const userId = 'user-id-456'
      const token = generateToken(userId, TEST_SECRET)
      const decoded = verifyToken(token, TEST_SECRET)

      expect(decoded.userId).toBe(userId)
    })
  })

  describe('verifyToken', () => {
    it('應該驗證有效的 token', () => {
      const userId = 'user-id-789'
      const token = generateToken(userId, TEST_SECRET)

      const decoded = verifyToken(token, TEST_SECRET)

      expect(decoded).toBeTruthy()
      expect(decoded.userId).toBe(userId)
    })

    it('應該拒絕無效的 token', () => {
      expect(() => verifyToken('invalid-token', TEST_SECRET)).toThrow()
    })

    it('應該拒絕空 token', () => {
      expect(() => verifyToken('', TEST_SECRET)).toThrow()
    })

    it('應該拒絕使用錯誤密鑰簽署的 token', () => {
      // 使用不同的密鑰生成 token
      const maliciousToken = jwt.sign(
        { userId: 'hacker' },
        'wrong-secret-key',
        { expiresIn: '7d' }
      )

      expect(() => verifyToken(maliciousToken, TEST_SECRET)).toThrow()
    })
  })

  describe('token 過期', () => {
    it('應該包含過期時間', () => {
      const token = generateToken('user-id-999', TEST_SECRET)
      const decoded = jwt.decode(token) as any

      expect(decoded.exp).toBeDefined()
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000))
    })
  })
})
