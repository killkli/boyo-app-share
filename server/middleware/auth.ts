import { getServerSession } from '#auth'
import { verifyToken } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const path = event.node.req.url
  const method = event.node.req.method

  // 只攔截 API 請求，不攔截前端頁面路由
  if (!path?.startsWith('/api/')) {
    return
  }

  // 公開路由跳過認證
  const publicPaths = [
    '/api/auth',  // Auth.js endpoints (所有 /api/auth/* 路由)
    '/api/health',
    '/api/sitemap.xml',
    '/api/robots.txt'
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

  // 優先使用 Auth.js session
  const session = await getServerSession(event)

  if (session?.user?.id) {
    // 將 userId 注入到 context
    event.context.userId = session.user.id
    return
  }

  // 向後相容：如果沒有 Auth.js session，檢查是否有舊的 JWT token
  const authorization = getHeader(event, 'authorization')
  if (authorization) {
    try {
      const token = authorization.replace('Bearer ', '')
      const decoded = verifyToken(token)

      // 將 userId 注入到 context
      event.context.userId = decoded.userId
      return
    } catch (error) {
      // JWT 驗證失敗，繼續拋出 401
    }
  }

  // 沒有有效的 session 或 token
  throw createError({
    statusCode: 401,
    message: 'Unauthorized'
  })
})
