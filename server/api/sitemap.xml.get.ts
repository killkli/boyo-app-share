import { query } from '~/server/utils/db'

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig()
    const baseUrl = 'https://boyo-app-share.zeabur.app'

    // 獲取所有公開的 APP
    const appsResult = await query<{ id: string; updated_at: string }>(
      `SELECT id, updated_at
       FROM apps
       WHERE is_public = true
       ORDER BY updated_at DESC`
    )

    // 靜態頁面
    const staticPages = [
      {
        loc: '/',
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString()
      },
      {
        loc: '/explore',
        changefreq: 'daily',
        priority: 0.9,
        lastmod: new Date().toISOString()
      },
      {
        loc: '/create',
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date().toISOString()
      },
      {
        loc: '/login',
        changefreq: 'monthly',
        priority: 0.5,
        lastmod: new Date().toISOString()
      },
      {
        loc: '/register',
        changefreq: 'monthly',
        priority: 0.5,
        lastmod: new Date().toISOString()
      }
    ]

    // APP 詳情頁
    const appPages = appsResult.rows.map(app => ({
      loc: `/app/${app.id}`,
      lastmod: new Date(app.updated_at).toISOString(),
      changefreq: 'weekly',
      priority: 0.8
    }))

    const allPages = [...staticPages, ...appPages]

    // 生成 XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    // 設置正確的 Content-Type
    setHeader(event, 'Content-Type', 'application/xml')

    return sitemap
  },
  {
    maxAge: 60 * 60, // 快取 1 小時
    getKey: () => 'sitemap'
  }
)
