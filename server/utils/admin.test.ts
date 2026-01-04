import { describe, it, expect, vi } from 'vitest'
import { isAdmin } from './admin'

// Mock useRuntimeConfig global
const mockRuntimeConfig = {
  public: {
    adminEmails: 'admin@example.com,TEST@EXAMPLE.COM'
  }
}

vi.stubGlobal('useRuntimeConfig', () => mockRuntimeConfig)

describe('admin 工具函數', () => {
  describe('isAdmin', () => {
    it('應該識別管理員 email', () => {
      expect(isAdmin('admin@example.com')).toBe(true)
    })

    it('應該忽略大小寫', () => {
      expect(isAdmin('ADMIN@EXAMPLE.COM')).toBe(true)
      expect(isAdmin('test@example.com')).toBe(true)
    })

    it('應該拒絕非管理員 email', () => {
      expect(isAdmin('user@example.com')).toBe(false)
      expect(isAdmin('other@gmail.com')).toBe(false)
    })

    it('應該處理 null/undefined/空字串', () => {
      expect(isAdmin(null)).toBe(false)
      expect(isAdmin(undefined)).toBe(false)
      expect(isAdmin('')).toBe(false)
    })
  })
})