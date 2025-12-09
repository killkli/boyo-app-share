import bcrypt from 'bcryptjs'
import { ZodError } from 'zod'
import { registerSchema } from '~/server/utils/validation'
import { generateToken } from '~/server/utils/jwt'
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    // 讀取請求 body
    const body = await readBody(event)

    // 驗證輸入資料
    const validated = registerSchema.parse(body)

    // 檢查 email 是否已存在
    const emailCheck = await query(
      'SELECT id FROM users WHERE email = $1',
      [validated.email]
    )

    if (emailCheck.rows.length > 0) {
      throw createError({
        statusCode: 400,
        message: 'Email 已被使用'
      })
    }

    // 檢查 username 是否已存在
    const usernameCheck = await query(
      'SELECT id FROM users WHERE username = $1',
      [validated.username]
    )

    if (usernameCheck.rows.length > 0) {
      throw createError({
        statusCode: 400,
        message: 'username 已被使用'
      })
    }

    // 加密密碼
    const passwordHash = await bcrypt.hash(validated.password, 10)

    // 建立使用者
    const result = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, avatar_url, bio, created_at, updated_at`,
      [validated.email, validated.username, passwordHash]
    )

    const user = result.rows[0]

    // 生成 JWT token
    const token = generateToken(user.id)

    return {
      user,
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
    console.error('註冊錯誤:', error)
    throw createError({
      statusCode: 500,
      message: '註冊失敗，請稍後再試'
    })
  }
})
