import { verifyToken } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const path = event.node.req.url
  const method = event.node.req.method

  // 只攔截 API 請求，不攔截前端頁面路由
  if (!path?.startsWith('/api/')) {
    return
  }

  // 公開路由跳過認證
  const publicPaths = ['/api/auth/login', '/api/auth/register']
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

  // 驗證 JWT
  const authorization = getHeader(event, 'authorization')
  if (!authorization) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const token = authorization.replace('Bearer ', '')
  try {
    const decoded = verifyToken(token)
    event.context.userId = decoded.userId
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Invalid token'
    })
  }
})
