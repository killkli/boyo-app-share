import { describe, it, expect, beforeAll } from 'vitest'
import { query } from '~/server/utils/db'
import bcrypt from 'bcrypt'

// 跳過測試如果沒有資料庫連接
const skipIfNoDb = process.env.DATABASE_URL ? false : true

describe.skipIf(skipIfNoDb)('GET /api/auth/me', () => {
  let testUserId: string
  let testToken: string

  beforeAll(async () => {
    // 清理測試資料
    await query('DELETE FROM users WHERE email = $1', ['me-test@example.com'])

    // 建立測試使用者
    const passwordHash = await bcrypt.hash('password123', 10)
    const result = await query(
      'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id',
      ['me-test@example.com', 'metest', passwordHash]
    )
    testUserId = result.rows[0].id

    // 生成測試 token
    const { generateToken } = await import('~/server/utils/jwt')
    testToken = generateToken(testUserId)
  })

  it('應該返回當前使用者資訊', async () => {
    const { $fetch } = await import('@nuxt/test-utils/e2e')

    const response = await $fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${testToken}`
      }
    })

    expect(response).toHaveProperty('user')
    expect(response.user.id).toBe(testUserId)
    expect(response.user.email).toBe('me-test@example.com')
    expect(response.user.username).toBe('metest')
    expect(response.user).not.toHaveProperty('password_hash')
  })

  it('應該拒絕沒有 token 的請求', async () => {
    const { $fetch } = await import('@nuxt/test-utils/e2e')

    await expect(
      $fetch('/api/auth/me')
    ).rejects.toThrow()
  })

  it('應該拒絕無效的 token', async () => {
    const { $fetch } = await import('@nuxt/test-utils/e2e')

    await expect(
      $fetch('/api/auth/me', {
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      })
    ).rejects.toThrow()
  })

  it('應該拒絕不存在使用者的 token', async () => {
    const { $fetch } = await import('@nuxt/test-utils/e2e')
    const { generateToken } = await import('~/server/utils/jwt')
    const fakeToken = generateToken('00000000-0000-0000-0000-000000000000')

    await expect(
      $fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${fakeToken}`
        }
      })
    ).rejects.toThrow()
  })
})
