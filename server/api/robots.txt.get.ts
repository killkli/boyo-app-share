export default defineEventHandler((event) => {
  const baseUrl = 'https://boyo-app-share.zeabur.app'

  const robotsTxt = `User-agent: *
Allow: /

# 禁止索引編輯頁面（需要認證）
Disallow: /edit/
Disallow: /my-apps

# 禁止索引 API endpoints
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml`

  setHeader(event, 'Content-Type', 'text/plain')
  return robotsTxt
})
