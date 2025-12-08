import { verifyToken } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const path = event.node.req.url
  const method = event.node.req.method

  // 公開路由跳過認證
  const publicPaths = ['/api/auth/login', '/api/auth/register']
  if (publicPaths.some(p => path?.startsWith(p))) {
    return
  }

  // GET /api/apps 公開
  if (path?.startsWith('/api/apps') && method === 'GET') {
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
