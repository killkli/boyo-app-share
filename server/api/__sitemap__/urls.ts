import { query } from '~/server/utils/db'

interface AppRow {
  id: string
  updated_at: string
  title: string
}

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

export default defineEventHandler(async (): Promise<SitemapUrl[]> => {
  // 獲取所有公開的 APP
  const appsResult = await query<AppRow>(
    `SELECT id, updated_at, title
     FROM apps
     WHERE is_public = true
     ORDER BY updated_at DESC`
  )

  // 動態 APP 頁面
  const appUrls: SitemapUrl[] = appsResult.rows.map(app => ({
    loc: `/app/${app.id}`,
    lastmod: new Date(app.updated_at).toISOString(),
    changefreq: 'weekly' as const,
    priority: 0.8
  }))

  // 靜態頁面
  const staticUrls: SitemapUrl[] = [
    {
      loc: '/',
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: '/explore',
      changefreq: 'daily',
      priority: 0.9
    },
    {
      loc: '/about',
      changefreq: 'monthly',
      priority: 0.6
    },
    {
      loc: '/terms',
      changefreq: 'monthly',
      priority: 0.3
    },
    {
      loc: '/privacy',
      changefreq: 'monthly',
      priority: 0.3
    },
    {
      loc: '/login',
      changefreq: 'monthly',
      priority: 0.5
    },
    {
      loc: '/register',
      changefreq: 'monthly',
      priority: 0.5
    }
  ]

  return [...staticUrls, ...appUrls]
})
