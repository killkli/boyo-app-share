import { describe, it, expect, beforeEach, vi } from 'vitest'
import { query } from '~/server/utils/db'

// 跳過測試如果沒有資料庫連接
const skipIfNoDb = process.env.DATABASE_URL ? false : true

describe.skipIf(skipIfNoDb)('POST /api/auth/register', () => {
  beforeEach(async () => {
    // 清理測試資料
    try {
      await query('DELETE FROM users WHERE email LIKE $1', ['test%@example.com'])
    } catch (error) {
      console.error('清理測試資料失敗:', error)
    }
  })

  it('應該成功註冊新使用者', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123'
    }

    // 動態 import $fetch 從 nuxt test utils
    const { $fetch } = await import('@nuxt/test-utils/e2e')

    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: userData
    })

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

    const { $fetch } = await import('@nuxt/test-utils/e2e')

    // 第一次註冊應該成功
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: userData
    })

    // 第二次使用相同 email 應該失敗
    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: { ...userData, username: 'user2' }
      })
      // 如果沒有拋出錯誤，測試應該失敗
      expect(true).toBe(false)
    } catch (error: any) {
      expect(error.statusCode).toBe(400)
      expect(error.data?.message).toContain('Email')
    }
  })

  it('應該拒絕重複的 username', async () => {
    const userData = {
      email: 'user1@example.com',
      username: 'duplicateuser',
      password: 'password123'
    }

    const { $fetch } = await import('@nuxt/test-utils/e2e')

    // 第一次註冊應該成功
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: userData
    })

    // 第二次使用相同 username 應該失敗
    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: { ...userData, email: 'user2@example.com' }
      })
      expect(true).toBe(false)
    } catch (error: any) {
      expect(error.statusCode).toBe(400)
      expect(error.data?.message).toContain('username')
    }
  })

  it('應該拒絕無效的 email', async () => {
    const { $fetch } = await import('@nuxt/test-utils/e2e')

    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'invalid-email',
          username: 'testuser',
          password: 'password123'
        }
      })
      expect(true).toBe(false)
    } catch (error: any) {
      expect(error.statusCode).toBe(400)
    }
  })

  it('應該拒絕過短的密碼', async () => {
    const { $fetch } = await import('@nuxt/test-utils/e2e')

    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'test@example.com',
          username: 'testuser',
          password: '123'
        }
      })
      expect(true).toBe(false)
    } catch (error: any) {
      expect(error.statusCode).toBe(400)
    }
  })

  it('應該拒絕無效的 username 格式', async () => {
    const { $fetch } = await import('@nuxt/test-utils/e2e')

    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'test@example.com',
          username: 'test@user',
          password: 'password123'
        }
      })
      expect(true).toBe(false)
    } catch (error: any) {
      expect(error.statusCode).toBe(400)
    }
  })

  it('應該加密密碼（不應明文儲存）', async () => {
    const userData = {
      email: 'test-secure@example.com',
      username: 'secureuser',
      password: 'mySecretPassword123'
    }

    const { $fetch } = await import('@nuxt/test-utils/e2e')

    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: userData
    })

    // 從資料庫查詢使用者
    const dbResult = await query('SELECT password_hash FROM users WHERE id = $1', [response.user.id])
    const storedPasswordHash = dbResult.rows[0].password_hash

    // 密碼應該被加密，不應該等於明文密碼
    expect(storedPasswordHash).not.toBe(userData.password)
    // bcrypt hash 應該以 $2b$ 或 $2a$ 開頭
    expect(storedPasswordHash).toMatch(/^\$2[ab]\$/)
  })
})
