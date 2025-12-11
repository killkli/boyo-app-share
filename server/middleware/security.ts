/**
 * Security Headers Middleware
 * 設置安全相關的 HTTP headers
 */
export default defineEventHandler((event) => {
  const res = event.node.res

  // 1. Content Security Policy (CSP)
  // 限制資源載入來源，防止 XSS 攻擊
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.tailwindcss.com https://unpkg.com", // Nuxt 需要 unsafe-inline
      "style-src 'self' 'unsafe-inline' blob:",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://s3.tebi.io https://generativelanguage.googleapis.com blob:",
      "frame-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ].join('; ')
  )

  // 2. X-Frame-Options
  // 防止 Clickjacking 攻擊
  res.setHeader('X-Frame-Options', 'DENY')

  // 3. X-Content-Type-Options
  // 防止 MIME 類型嗅探
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // 4. X-XSS-Protection
  // 啟用瀏覽器的 XSS 過濾器（舊版瀏覽器）
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // 5. Referrer-Policy
  // 控制 Referer header 的發送
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // 6. Permissions-Policy
  // 控制瀏覽器功能的存取權限
  res.setHeader(
    'Permissions-Policy',
    [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()'
    ].join(', ')
  )

  // 7. Strict-Transport-Security (HSTS)
  // 強制使用 HTTPS（僅在 HTTPS 環境下設置）
  if (event.node.req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
})
