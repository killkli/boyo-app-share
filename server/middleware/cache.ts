import { setCacheHeaders } from '~/server/utils/cache'

/**
 * Cache Control Middleware
 * 為不同類型的資源設置適當的快取策略
 */
export default defineEventHandler((event) => {
  const path = event.path || event.node.req.url || ''
  const method = event.method || event.node.req.method || 'GET'

  // 只對 GET 請求設置快取
  if (method !== 'GET') {
    return
  }

  setCacheHeaders(event, path)
})
