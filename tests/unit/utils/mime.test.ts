import { describe, it, expect } from 'vitest'
import { getMimeType } from '~/server/utils/mime'

describe('getMimeType', () => {
  it('應該正確識別 HTML 檔案', () => {
    expect(getMimeType('index.html')).toBe('text/html')
    expect(getMimeType('page.htm')).toBe('text/html')
  })

  it('應該正確識別 CSS 檔案', () => {
    expect(getMimeType('style.css')).toBe('text/css')
  })

  it('應該正確識別 JavaScript 檔案', () => {
    expect(getMimeType('script.js')).toBe('application/javascript')
  })

  it('應該正確識別圖片檔案', () => {
    expect(getMimeType('image.png')).toBe('image/png')
    expect(getMimeType('photo.jpg')).toBe('image/jpeg')
    expect(getMimeType('icon.svg')).toBe('image/svg+xml')
  })

  it('應該正確識別其他常見檔案類型', () => {
    expect(getMimeType('data.json')).toBe('application/json')
    expect(getMimeType('font.woff')).toBe('font/woff')
    expect(getMimeType('font.woff2')).toBe('font/woff2')
  })

  it('應該對未知類型返回預設值', () => {
    expect(getMimeType('unknown.xyz')).toBe('application/octet-stream')
  })

  it('應該處理沒有副檔名的檔案', () => {
    expect(getMimeType('README')).toBe('application/octet-stream')
  })
})
