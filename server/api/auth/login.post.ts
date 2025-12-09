import bcrypt from 'bcryptjs'
import { ZodError } from 'zod'
import { loginSchema } from '~/server/utils/validation'
import { generateToken } from '~/server/utils/jwt'
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    // 讀取請求 body
    const body = await readBody(event)

    // 驗證輸入資料
    const validated = loginSchema.parse(body)

    // 查詢使用者
    const result = await query(
      'SELECT id, email, username, password_hash, avatar_url, bio, created_at, updated_at FROM users WHERE email = $1',
      [validated.email]
    )

    // 檢查使用者是否存在
    if (result.rows.length === 0) {
      throw createError({
        statusCode: 401,
        message: '使用者不存在或密碼錯誤'
      })
    }

    const user = result.rows[0]

    // 驗證密碼
    const passwordMatch = await bcrypt.compare(validated.password, user.password_hash)

    if (!passwordMatch) {
      throw createError({
        statusCode: 401,
        message: '密碼錯誤'
      })
    }

    // 移除密碼雜湊
    const { password_hash, ...userWithoutPassword } = user

    // 生成 JWT token
    const token = generateToken(user.id)

    return {
      user: userWithoutPassword,
      token
    }
  } catch (error) {
    // Zod 驗證錯誤
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        message: '輸入資料驗證失敗',
        data: error.errors
      })
    }

    // 重新拋出已處理的錯誤
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // 未預期的錯誤
    console.error('登入錯誤:', error)
    throw createError({
      statusCode: 500,
      message: '登入失敗，請稍後再試'
    })
  }
})
