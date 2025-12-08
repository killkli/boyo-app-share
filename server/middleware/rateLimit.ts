import { checkRateLimit } from '~/server/utils/rateLimit'

/**
 * Rate Limit Middleware
 * 限制 API 請求頻率，防止濫用
 */
export default defineEventHandler(async (event) => {
  // 獲取 IP 地址
  const ip = event.node.req.socket?.remoteAddress ||
             event.node.req.headers['x-forwarded-for'] as string ||
             'unknown'

  // 獲取當前用戶 ID（如果已認證）
  const userId = event.context.userId

  // 檢查 rate limit
  await checkRateLimit(event, ip, userId)
})
