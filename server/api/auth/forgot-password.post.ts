/**
 * 請求重設密碼
 *
 * POST /api/auth/forgot-password
 *
 * Body: { email: string }
 */
import { z } from 'zod'
import { query } from '~/server/utils/db'

const requestSchema = z.object({
  email: z.string().email('請輸入有效的 email 地址')
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 驗證請求
  const { email } = requestSchema.parse(body)

  // 查詢使用者
  const userResult = await query(
    'SELECT id, password_hash FROM users WHERE email = $1',
    [email]
  )

  // 為了安全性，不洩漏使用者是否存在
  // 無論使用者是否存在都返回相同的訊息
  if (userResult.rows.length === 0) {
    return {
      message: '如果該 email 存在，您將會收到重設密碼的郵件'
    }
  }

  const user = userResult.rows[0]

  // 檢查是否為 OAuth 使用者（無密碼）
  if (!user.password_hash) {
    throw createError({
      statusCode: 400,
      message: '此帳號使用社群登入，無法重設密碼'
    })
  }

  // 生成重設 token (UUID)
  const token = crypto.randomUUID()

  // 設定 token 過期時間（24 小時）
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  // 刪除該 email 的舊 token（如果有）
  await query(
    'DELETE FROM verification_tokens WHERE identifier = $1',
    [email]
  )

  // 建立新的重設 token
  await query(
    `INSERT INTO verification_tokens (identifier, token, expires)
     VALUES ($1, $2, $3)`,
    [email, token, expires]
  )

  // TODO: 發送重設密碼 email
  // 目前先暫時跳過實際發送 email 的功能
  // 在開發階段可以直接返回 token（生產環境應該移除）
  const isDev = process.env.NODE_ENV === 'development'
  const resetUrl = `${process.env.AUTH_ORIGIN || 'http://localhost:3000'}/reset-password?token=${token}`

  console.log(`[DEV] Password reset URL: ${resetUrl}`)

  return {
    message: '如果該 email 存在，您將會收到重設密碼的郵件',
    ...(isDev ? { devToken: token, devUrl: resetUrl } : {})
  }
})
