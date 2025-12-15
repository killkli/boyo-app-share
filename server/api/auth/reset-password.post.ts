/**
 * 重設密碼
 *
 * POST /api/auth/reset-password
 *
 * Body: { token: string, password: string }
 */
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { query } from '~/server/utils/db'

const requestSchema = z.object({
  token: z.string().min(1, '缺少重設 token'),
  password: z.string().min(8, '密碼至少需要 8 個字元')
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 驗證請求
  const { token, password } = requestSchema.parse(body)

  // 查詢 token
  const tokenResult = await query(
    `SELECT identifier, expires FROM verification_tokens
     WHERE token = $1`,
    [token]
  )

  if (tokenResult.rows.length === 0) {
    throw createError({
      statusCode: 400,
      message: '無效的重設 token'
    })
  }

  const resetToken = tokenResult.rows[0]
  const email = resetToken.identifier

  // 檢查 token 是否過期
  const now = new Date()
  const expires = new Date(resetToken.expires)

  if (now > expires) {
    // 刪除過期的 token
    await query('DELETE FROM verification_tokens WHERE token = $1', [token])

    throw createError({
      statusCode: 400,
      message: '重設 token 已過期，請重新發送重設密碼請求'
    })
  }

  // 加密新密碼
  const passwordHash = await bcrypt.hash(password, 10)

  // 更新使用者密碼
  const updateResult = await query(
    `UPDATE users
     SET password_hash = $1, updated_at = NOW()
     WHERE email = $2
     RETURNING id, email, username`,
    [passwordHash, email]
  )

  if (updateResult.rows.length === 0) {
    throw createError({
      statusCode: 404,
      message: '找不到對應的使用者'
    })
  }

  // 刪除已使用的 token
  await query('DELETE FROM verification_tokens WHERE token = $1', [token])

  return {
    success: true,
    message: '密碼已成功重設！',
    user: updateResult.rows[0]
  }
})
