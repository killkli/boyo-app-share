/**
 * 根據檔案名稱獲取 MIME 類型
 * @param filename 檔案名稱或路徑
 * @returns MIME 類型字串
 */
export function getMimeType(filename: string): string {
  // 取得副檔名（轉小寫）
  const ext = filename.toLowerCase().split('.').pop() || ''

  // MIME 類型對照表
  const mimeTypes: Record<string, string> = {
    // HTML
    html: 'text/html',
    htm: 'text/html',

    // CSS
    css: 'text/css',

    // JavaScript
    js: 'application/javascript',
    mjs: 'application/javascript',

    // JSON
    json: 'application/json',

    // 圖片
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    ico: 'image/x-icon',

    // 字型
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    otf: 'font/otf',

    // 文件
    pdf: 'application/pdf',
    txt: 'text/plain',
    md: 'text/markdown',

    // 壓縮檔
    zip: 'application/zip',
    gz: 'application/gzip',

    // 其他
    xml: 'application/xml',
  }

  return mimeTypes[ext] || 'application/octet-stream'
}
