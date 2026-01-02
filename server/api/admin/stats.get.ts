import { requireAdmin } from '~/server/utils/admin'
import { query } from '~/server/utils/db'

/**
 * GET /api/admin/stats
 * 取得平台統計數據（管理員專用）
 */
export default defineEventHandler(async (event) => {
  // 驗證管理員權限
  await requireAdmin(event)

  // 並行查詢所有統計數據
  const [
    usersResult,
    appsResult,
    commentsResult,
    ratingsResult,
    todayUsersResult,
    todayAppsResult
  ] = await Promise.all([
    // 總用戶數
    query('SELECT COUNT(*) as count FROM users'),

    // 總 App 數
    query('SELECT COUNT(*) as count FROM apps'),

    // 總留言數
    query('SELECT COUNT(*) as count FROM comments'),

    // 總評分數
    query('SELECT COUNT(*) as count FROM ratings'),

    // 今日新增用戶
    query(`
      SELECT COUNT(*) as count FROM users
      WHERE created_at >= CURRENT_DATE
    `),

    // 今日新增 App
    query(`
      SELECT COUNT(*) as count FROM apps
      WHERE created_at >= CURRENT_DATE
    `)
  ])

  return {
    totalUsers: parseInt(usersResult.rows[0].count, 10),
    totalApps: parseInt(appsResult.rows[0].count, 10),
    totalComments: parseInt(commentsResult.rows[0].count, 10),
    totalRatings: parseInt(ratingsResult.rows[0].count, 10),
    todayUsers: parseInt(todayUsersResult.rows[0].count, 10),
    todayApps: parseInt(todayAppsResult.rows[0].count, 10)
  }
})
