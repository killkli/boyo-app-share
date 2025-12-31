import { verifyToken } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const path = event.node.req.url
  const method = event.node.req.method

  // 只攔截 API 請求，不攔截前端頁面路由
  if (!path?.startsWith('/api/')) {
    return
  }

  // 公開路由跳過認證（包括所有 Auth.js 路由，避免遞迴）
  const publicPaths = [
    '/api/auth',  // Auth.js endpoints (所有 /api/auth/* 路由)
    '/api/health',
    '/api/sitemap.xml',
    '/api/robots.txt',
    '/api/ai'  // AI 相關 API
  ]

  if (publicPaths.some(p => path?.startsWith(p))) {
    return
  }

  // 需要認證的 /api/apps 路由
  const authRequiredPaths = [
    '/api/apps/favorites',
    '/api/apps/my-apps'
  ]

  // 如果是需要認證的路由，繼續執行認證邏輯
  const isAuthRequired = authRequiredPaths.some(p => path?.startsWith(p))

  // GET /api/apps 公開（除了需要認證的路由）
  if (path?.startsWith('/api/apps') && method === 'GET' && !isAuthRequired) {
    return
  }

  // 注意：不在 middleware 中調用 getServerSession，避免遞迴
  // 改為在需要認證的 API endpoint 中直接調用

  // 檢查是否有 JWT token（向後相容 + 主要認證方式）
  const authorization = getHeader(event, 'authorization')
  if (authorization) {
    try {
      const token = authorization.replace('Bearer ', '')
      const decoded = verifyToken(token)

      // 將 userId 注入到 context
      event.context.userId = decoded.userId
      return
    } catch (error) {
      // JWT 驗證失敗，繼續檢查其他方式
    }
  }

  // 檢查 cookie 中的 session token（Auth.js 使用 cookie）
  // Auth.js session 驗證會在各 endpoint 中透過 getServerSession 處理
  // 這裡只做基本的 cookie 存在檢查
  const sessionToken = getCookie(event, 'next-auth.session-token') ||
                       getCookie(event, '__Secure-next-auth.session-token')

  if (sessionToken) {
    // 有 session cookie，允許請求繼續
    // 實際的 session 驗證會在 endpoint 中進行
    return
  }

  // 沒有有效的認證
  throw createError({
    statusCode: 401,
    message: 'Unauthorized'
  })
})
