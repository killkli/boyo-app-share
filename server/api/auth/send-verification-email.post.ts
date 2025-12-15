/**
 * 發送 Email 驗證信
 *
 * POST /api/auth/send-verification-email
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

  // 檢查使用者是否存在
  const userResult = await query(
    'SELECT id, email_verified FROM users WHERE email = $1',
    [email]
  )

  if (userResult.rows.length === 0) {
    throw createError({
      statusCode: 404,
      message: '找不到該 email 的使用者'
    })
  }

  const user = userResult.rows[0]

  // 檢查是否已驗證
  if (user.email_verified) {
    throw createError({
      statusCode: 400,
      message: '該 email 已經驗證過了'
    })
  }

  // 生成驗證 token (UUID)
  const token = crypto.randomUUID()

  // 設定 token 過期時間（24 小時）
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  // 刪除該 email 的舊 token（如果有）
  await query(
    'DELETE FROM verification_tokens WHERE identifier = $1',
    [email]
  )

  // 建立新的驗證 token
  await query(
    `INSERT INTO verification_tokens (identifier, token, expires)
     VALUES ($1, $2, $3)`,
    [email, token, expires]
  )

  // TODO: 發送驗證 email
  // 目前先暫時跳過實際發送 email 的功能
  // 在開發階段可以直接返回 token（生產環境應該移除）
  const isDev = process.env.NODE_ENV === 'development'
  const verificationUrl = `${process.env.AUTH_ORIGIN || 'http://localhost:3000'}/verify-email?token=${token}`

  console.log(`[DEV] Email verification URL: ${verificationUrl}`)

  return {
    message: '驗證信已發送，請檢查您的 email',
    ...(isDev ? { devToken: token, devUrl: verificationUrl } : {})
  }
})
