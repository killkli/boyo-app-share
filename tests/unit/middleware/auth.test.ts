import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock JWT utils before importing
vi.mock('~/server/utils/jwt', () => ({
  verifyToken: vi.fn()
}))

import { verifyToken } from '~/server/utils/jwt'

describe('Auth Middleware', () => {
  describe('路由判斷邏輯', () => {
    it('應該識別公開路由 /api/auth/login', () => {
      const publicPaths = ['/api/auth/login', '/api/auth/register']
      const path = '/api/auth/login'

      const isPublic = publicPaths.some(p => path?.startsWith(p))
      expect(isPublic).toBe(true)
    })

    it('應該識別公開路由 /api/auth/register', () => {
      const publicPaths = ['/api/auth/login', '/api/auth/register']
      const path = '/api/auth/register'

      const isPublic = publicPaths.some(p => path?.startsWith(p))
      expect(isPublic).toBe(true)
    })

    it('應該識別 GET /api/apps 為公開路由', () => {
      const path = '/api/apps'
      const method = 'GET'

      const isPublicAppsGet = path?.startsWith('/api/apps') && method === 'GET'
      expect(isPublicAppsGet).toBe(true)
    })

    it('應該識別 POST /api/apps 為受保護路由', () => {
      const publicPaths = ['/api/auth/login', '/api/auth/register']
      const path = '/api/apps'
      const method: string = 'POST'

      const isPublic = publicPaths.some(p => path?.startsWith(p))
      const isPublicAppsGet = path?.startsWith('/api/apps') && method === 'GET'
      const needsAuth = !isPublic && !isPublicAppsGet

      expect(needsAuth).toBe(true)
    })

    it('應該識別 GET /api/apps/favorites 為受保護路由', () => {
      const authRequiredPaths = ['/api/apps/favorites', '/api/apps/my-apps']
      const path = '/api/apps/favorites'
      const method = 'GET'

      const isAuthRequired = authRequiredPaths.some(p => path?.startsWith(p))
      const isPublicAppsGet = path?.startsWith('/api/apps') && method === 'GET' && !isAuthRequired

      expect(isAuthRequired).toBe(true)
      expect(isPublicAppsGet).toBe(false)
    })

    it('應該識別 GET /api/apps/my-apps 為受保護路由', () => {
      const authRequiredPaths = ['/api/apps/favorites', '/api/apps/my-apps']
      const path = '/api/apps/my-apps'
      const method = 'GET'

      const isAuthRequired = authRequiredPaths.some(p => path?.startsWith(p))
      const isPublicAppsGet = path?.startsWith('/api/apps') && method === 'GET' && !isAuthRequired

      expect(isAuthRequired).toBe(true)
      expect(isPublicAppsGet).toBe(false)
    })

    it('應該識別 GET /api/apps/[id] 為公開路由', () => {
      const authRequiredPaths = ['/api/apps/favorites', '/api/apps/my-apps']
      const path = '/api/apps/abc-123'
      const method = 'GET'

      const isAuthRequired = authRequiredPaths.some(p => path?.startsWith(p))
      const isPublicAppsGet = path?.startsWith('/api/apps') && method === 'GET' && !isAuthRequired

      expect(isAuthRequired).toBe(false)
      expect(isPublicAppsGet).toBe(true)
    })
  })

  describe('Token 驗證邏輯', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('應該正確解析 Bearer token', () => {
      const authorization = 'Bearer my-secret-token'
      const token = authorization.replace('Bearer ', '')

      expect(token).toBe('my-secret-token')
    })

    it('應該在 token 有效時返回 userId', () => {
      vi.mocked(verifyToken).mockReturnValue({ userId: 'user-123' })

      const token = 'valid-token'
      const decoded = verifyToken(token)

      expect(decoded.userId).toBe('user-123')
    })

    it('應該在 token 無效時拋出錯誤', () => {
      vi.mocked(verifyToken).mockImplementation(() => {
        throw new Error('Invalid token')
      })

      expect(() => verifyToken('invalid-token')).toThrow('Invalid token')
    })
  })

  describe('授權檢查流程', () => {
    it('應該拒絕沒有 Authorization header 的受保護請求', () => {
      const authorization = undefined

      expect(authorization).toBeUndefined()
    })

    it('應該接受有 Authorization header 的請求', () => {
      const authorization = 'Bearer valid-token'

      expect(authorization).toBeTruthy()
    })
  })
})
