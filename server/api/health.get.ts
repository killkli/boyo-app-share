import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()

  // 檢查資料庫連接
  let databaseConnected = false
  let databaseLatency = 0

  try {
    const dbStart = Date.now()
    await query('SELECT 1 as health_check')
    databaseLatency = Date.now() - dbStart
    databaseConnected = true
  } catch (error) {
    console.error('Database health check failed:', error)
    databaseConnected = false
  }

  // 計算整體狀態
  const status = databaseConnected ? 'healthy' : 'degraded'

  // 獲取版本資訊（從 package.json）
  const version = process.env.npm_package_version || '0.1.0'

  // 獲取環境
  const environment = process.env.NODE_ENV || 'development'

  // 計算 uptime（進程運行時間）
  const uptime = process.uptime()

  const response = {
    status,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    version,
    environment,
    database: {
      connected: databaseConnected,
      latency: databaseLatency
    },
    responseTime: Date.now() - startTime
  }

  // 如果狀態為 degraded，返回 503
  if (status === 'degraded') {
    setResponseStatus(event, 503)
  }

  return response
})
