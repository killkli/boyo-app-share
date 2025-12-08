import { describe, it, expect, beforeEach } from 'vitest'
import { query } from '~/server/utils/db'

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
    try {
      await query('DELETE FROM users WHERE email = $1', [testUser.email])

      // 使用註冊 API 建立測試使用者
      const { $fetch } = await import('@nuxt/test-utils/e2e')
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: testUser
      })
    } catch (error) {
      console.error('準備測試資料失敗:', error)
    }
  })

  it('應該成功登入並返回 token', async () => {
    const { $fetch } = await import('@nuxt/test-utils/e2e')

    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: testUser.email,
        password: testUser.password
      }
    })

    expect(response).toHaveProperty('user')
    expect(response).toHaveProperty('token')
    expect(response.user.email).toBe(testUser.email)
    expect(response.user.username).toBe(testUser.username)
    expect(response.user).not.toHaveProperty('password_hash')
    expect(typeof response.token).toBe('string')
    expect(response.token.length).toBeGreaterThan(0)
  })

  it('應該拒絕錯誤的密碼', async () => {
    const { $fetch } = await import('@nuxt/test-utils/e2e')

    try {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: testUser.email,
          password: 'wrongpassword'
        }
      })
      // 如果沒有拋出錯誤，測試應該失敗
      expect(true).toBe(false)
    } catch (error: any) {
      expect(error.statusCode).toBe(401)
      expect(error.data?.message).toContain('密碼錯誤')
    }
  })

  it('應該拒絕不存在的 email', async () => {
    const { $fetch } = await import('@nuxt/test-utils/e2e')

    try {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      })
      expect(true).toBe(false)
    } catch (error: any) {
      expect(error.statusCode).toBe(401)
      expect(error.data?.message).toContain('使用者不存在')
    }
  })

  it('應該拒絕無效的 email 格式', async () => {
    const { $fetch } = await import('@nuxt/test-utils/e2e')

    try {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'invalid-email',
          password: 'password123'
        }
      })
      expect(true).toBe(false)
    } catch (error: any) {
      expect(error.statusCode).toBe(400)
    }
  })

  it('應該拒絕空密碼', async () => {
    const { $fetch } = await import('@nuxt/test-utils/e2e')

    try {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: testUser.email,
          password: ''
        }
      })
      expect(true).toBe(false)
    } catch (error: any) {
      expect(error.statusCode).toBe(400)
    }
  })

  it('應該返回有效的 JWT token', async () => {
    const { $fetch } = await import('@nuxt/test-utils/e2e')

    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: testUser.email,
        password: testUser.password
      }
    })

    // JWT token 應該是三個部分用點分隔
    const tokenParts = response.token.split('.')
    expect(tokenParts).toHaveLength(3)
  })
})
