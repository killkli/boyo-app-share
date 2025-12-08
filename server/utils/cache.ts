import type { H3Event } from 'h3'

/**
 * Cache 策略設定
 */
const CACHE_STRATEGIES = {
  // 靜態資源 - 1 年
  STATIC_ASSETS: 'public, max-age=31536000, immutable',

  // API 回應 - 不快取
  API: 'no-cache, no-store, must-revalidate',

  // HTML 頁面 - 5 分鐘
  HTML: 'public, max-age=300, must-revalidate',

  // 預設 - 不快取
  DEFAULT: 'no-cache'
}

/**
 * 根據路徑判斷資源類型並設置 Cache-Control header
 */
export function setCacheHeaders(event: H3Event, path: string) {
  let cacheControl: string

  // API 路由
  if (path.startsWith('/api/')) {
    cacheControl = CACHE_STRATEGIES.API
  }
  // 靜態資源
  else if (isStaticAsset(path)) {
    cacheControl = CACHE_STRATEGIES.STATIC_ASSETS
  }
  // HTML 頁面
  else {
    cacheControl = CACHE_STRATEGIES.HTML
  }

  event.node.res.setHeader('Cache-Control', cacheControl)
}

/**
 * 判斷是否為靜態資源
 */
function isStaticAsset(path: string): boolean {
  const staticExtensions = [
    // 圖片
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
    // 字體
    '.woff', '.woff2', '.ttf', '.otf', '.eot',
    // 樣式與腳本
    '.css', '.js', '.mjs',
    // 其他
    '.pdf', '.zip'
  ]

  return staticExtensions.some(ext => path.toLowerCase().endsWith(ext))
}
