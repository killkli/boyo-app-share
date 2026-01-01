import { verifyToken } from '~/server/utils/jwt'
import { getServerSession } from '#auth'

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
    '/api/__sitemap__',  // Nuxt SEO sitemap dynamic URLs
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

  // 檢查是否有 JWT token（向後相容 Legacy 登入）
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

  // 檢查 Auth.js session（OAuth 登入使用）
  // 注意：這裡可以安全調用 getServerSession，因為 /api/auth 路由已被排除
  try {
    const session = await getServerSession(event)
    if (session?.user?.id) {
      // 從 Auth.js session 獲取 userId 並注入到 context
      event.context.userId = session.user.id
      return
    }
  } catch (error) {
    // Session 獲取失敗，繼續
    console.error('Failed to get session:', error)
  }

  // 沒有有效的認證
  throw createError({
    statusCode: 401,
    message: 'Unauthorized'
  })
})
