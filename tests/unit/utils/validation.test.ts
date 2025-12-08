import { describe, it, expect } from 'vitest'
import { registerSchema, loginSchema } from '../../../server/utils/validation'

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('應該接受有效的註冊資料', () => {
      const validData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('應該拒絕無效的 email', () => {
      const invalidData = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123'
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('無效的 email 格式')
      }
    })

    it('應該拒絕過短的使用者名稱', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'ab',
        password: 'password123'
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('至少 3 個字元')
      }
    })

    it('應該拒絕過長的使用者名稱', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'a'.repeat(51),
        password: 'password123'
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('最多 50 個字元')
      }
    })

    it('應該拒絕包含特殊字元的使用者名稱', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'test@user',
        password: 'password123'
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('只能包含')
      }
    })

    it('應該接受包含底線和連字號的使用者名稱', () => {
      const validData = {
        email: 'test@example.com',
        username: 'test_user-123',
        password: 'password123'
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('應該拒絕過短的密碼', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'testuser',
        password: '1234567'
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('至少 8 個字元')
      }
    })

    it('應該拒絕過長的密碼', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'a'.repeat(101)
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('最多 100 個字元')
      }
    })
  })

  describe('loginSchema', () => {
    it('應該接受有效的登入資料', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('應該拒絕無效的 email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('應該拒絕空密碼', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('不能為空')
      }
    })

    it('應該接受任何長度的密碼（登入時不限制長度）', () => {
      const validData = {
        email: 'test@example.com',
        password: '123'
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})
