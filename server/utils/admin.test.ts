import { describe, it, expect } from 'vitest'
import { isAdmin } from './admin'

describe('admin 工具函數', () => {
  describe('isAdmin', () => {
    it('應該識別管理員 email', () => {
      expect(isAdmin('dchensterebay@gmail.com')).toBe(true)
    })

    it('應該忽略大小寫', () => {
      expect(isAdmin('DCHENSTEREBAY@GMAIL.COM')).toBe(true)
      expect(isAdmin('DchensterEbay@Gmail.com')).toBe(true)
    })

    it('應該拒絕非管理員 email', () => {
      expect(isAdmin('user@example.com')).toBe(false)
      expect(isAdmin('admin@example.com')).toBe(false)
      expect(isAdmin('dchensterebay@yahoo.com')).toBe(false)
    })

    it('應該處理 null/undefined/空字串', () => {
      expect(isAdmin(null)).toBe(false)
      expect(isAdmin(undefined)).toBe(false)
      expect(isAdmin('')).toBe(false)
    })
  })
})
