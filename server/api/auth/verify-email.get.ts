/**
 * 驗證 Email Token
 *
 * GET /api/auth/verify-email?token=xxx
 */
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event)

  if (!token || typeof token !== 'string') {
    throw createError({
      statusCode: 400,
      message: '缺少驗證 token'
    })
  }

  // 查詢 token
  const tokenResult = await query(
    `SELECT identifier, expires FROM verification_tokens
     WHERE token = $1`,
    [token]
  )

  if (tokenResult.rows.length === 0) {
    throw createError({
      statusCode: 400,
      message: '無效的驗證 token'
    })
  }

  const verificationToken = tokenResult.rows[0]
  const email = verificationToken.identifier

  // 檢查 token 是否過期
  const now = new Date()
  const expires = new Date(verificationToken.expires)

  if (now > expires) {
    // 刪除過期的 token
    await query('DELETE FROM verification_tokens WHERE token = $1', [token])

    throw createError({
      statusCode: 400,
      message: '驗證 token 已過期，請重新發送驗證信'
    })
  }

  // 更新使用者為已驗證
  const updateResult = await query(
    `UPDATE users
     SET email_verified = true, updated_at = NOW()
     WHERE email = $1
     RETURNING id, email, username`,
    [email]
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
    message: 'Email 驗證成功！',
    user: updateResult.rows[0]
  }
})
