import type { H3Event } from 'h3'

/**
 * Rate Limit 配置
 */
const RATE_LIMIT_CONFIG = {
  // 未認證用戶：每分鐘 60 個請求
  ANONYMOUS: {
    limit: 60,
    window: 60 * 1000 // 1 分鐘（毫秒）
  },
  // 認證用戶：每分鐘 100 個請求
  AUTHENTICATED: {
    limit: 100,
    window: 60 * 1000
  },
  // 白名單路徑（不限制）
  WHITELIST_PATHS: ['/api/health', '/api/status']
}

/**
 * 請求記錄結構
 */
interface RequestRecord {
  count: number
  resetTime: number
}

/**
 * 記憶體儲存 (簡單實作，生產環境建議使用 Redis)
 */
const requestStore = new Map<string, RequestRecord>()

/**
 * 清理過期記錄（懶清理，在每次檢查時執行）
 * 避免在全局作用域使用 setInterval，以符合 Cloudflare Workers 要求
 */
function cleanupExpiredRecords() {
  const now = Date.now()
  for (const [key, record] of requestStore.entries()) {
    if (now > record.resetTime) {
      requestStore.delete(key)
    }
  }
}

/**
 * 檢查 rate limit
 */
export async function checkRateLimit(
  event: H3Event,
  ip: string,
  userId?: string
): Promise<void> {
  const path = event.path || event.node?.req?.url || ''

  // 檢查是否在白名單中
  if (RATE_LIMIT_CONFIG.WHITELIST_PATHS.some(p => path.startsWith(p))) {
    return
  }

  // 清理過期記錄（懶清理）
  cleanupExpiredRecords()

  // 決定使用哪個配置
  const config = userId
    ? RATE_LIMIT_CONFIG.AUTHENTICATED
    : RATE_LIMIT_CONFIG.ANONYMOUS

  // 生成唯一鍵（IP 或 userId）
  const key = userId ? `user:${userId}` : `ip:${ip}`

  const now = Date.now()
  let record = requestStore.get(key)

  // 如果沒有記錄或已過期，創建新記錄
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + config.window
    }
    requestStore.set(key, record)
  }

  // 增加請求計數
  record.count++

  // 計算剩餘請求數
  const remaining = Math.max(0, config.limit - record.count)
  const resetTime = Math.ceil((record.resetTime - now) / 1000)

  // 設置 rate limit headers
  event.node.res.setHeader('X-RateLimit-Limit', config.limit)
  event.node.res.setHeader('X-RateLimit-Remaining', remaining)
  event.node.res.setHeader('X-RateLimit-Reset', resetTime)

  // 檢查是否超過限制
  if (record.count > config.limit) {
    const error = new Error(`Rate limit exceeded. Try again in ${resetTime} seconds.`) as any
    error.statusCode = 429
    error.statusMessage = 'Too Many Requests'
    throw error
  }
}

/**
 * 重置特定鍵的 rate limit（用於測試）
 */
export function resetRateLimit(key: string) {
  requestStore.delete(key)
}

/**
 * 清空所有 rate limit 記錄（用於測試）
 */
export function clearAllRateLimits() {
  requestStore.clear()
}
