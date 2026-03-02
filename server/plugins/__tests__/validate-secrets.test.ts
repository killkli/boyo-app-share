import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'

const VALID_JWT_SECRET = 'XKj9mP2qR7sT4vW8yZ3nL6hF1aB5cE0d'

let pluginCallback: ((app: unknown) => void) | null = null

// Mock defineNitroPlugin to capture the plugin callback before the module loads
vi.stubGlobal('defineNitroPlugin', (cb: (app: unknown) => void) => {
  pluginCallback = cb
  return cb
})

beforeAll(async () => {
  vi.resetModules()
  await import('../validate-secrets')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('validate-secrets plugin', () => {
  describe('test 模式', () => {
    it('應該完全跳過驗證', () => {
      vi.stubEnv('NODE_ENV', 'test')
      vi.stubGlobal('useRuntimeConfig', () => ({}))
      expect(() => pluginCallback!({})).not.toThrow()
    })
  })

  describe('production 模式', () => {
    it('placeholder JWT secret 應該拋出錯誤', () => {
      vi.stubEnv('NODE_ENV', 'production')
      vi.stubGlobal('useRuntimeConfig', () => ({
        jwtSecret: 'ai-app-share-jwt-secret-key-2024-change-in-production',
        databaseUrl: 'postgresql://real:pass@host:5432/realdb',
        tebiAccessKey: 'real-access-key-value',
        tebiSecretKey: 'real-secret-key-value',
        authSecret: 'real-auth-secret-here',
      }))
      expect(() => pluginCallback!({})).toThrow('[Security] Server startup aborted')
    })

    it('所有有效設定不應拋出錯誤', () => {
      vi.stubEnv('NODE_ENV', 'production')
      vi.stubGlobal('useRuntimeConfig', () => ({
        jwtSecret: VALID_JWT_SECRET,
        databaseUrl: 'postgresql://real:pass@host:5432/realdb',
        tebiAccessKey: 'real-access-key-value',
        tebiSecretKey: 'real-secret-key-value',
        authSecret: 'real-auth-secret-here',
      }))
      expect(() => pluginCallback!({})).not.toThrow()
    })
  })

  describe('development 模式', () => {
    it('placeholder secrets 應該警告但不拋出', () => {
      vi.stubEnv('NODE_ENV', 'development')
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      vi.stubGlobal('useRuntimeConfig', () => ({
        jwtSecret: 'change-in-production-jwt-secret-here',
        databaseUrl: 'postgresql://user:password@host:5432/database',
        tebiAccessKey: 'your-access-key',
        tebiSecretKey: 'your-secret-key',
        authSecret: 'your-auth-secret',
      }))
      expect(() => pluginCallback!({})).not.toThrow()
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[Security Warning]'))
      warnSpy.mockRestore()
    })
  })
})
