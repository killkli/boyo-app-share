import { describe, it, expect } from 'vitest'
import { getMimeType } from '~/server/utils/mime'

describe('getMimeType', () => {
  it('應該正確識別 HTML 檔案', () => {
    expect(getMimeType('index.html')).toBe('text/html')
    expect(getMimeType('test.HTML')).toBe('text/html')
  })

  it('應該正確識別 CSS 檔案', () => {
    expect(getMimeType('style.css')).toBe('text/css')
    expect(getMimeType('main.CSS')).toBe('text/css')
  })

  it('應該正確識別 JavaScript 檔案', () => {
    expect(getMimeType('script.js')).toBe('application/javascript')
    expect(getMimeType('app.mjs')).toBe('application/javascript')
  })

  it('應該正確識別圖片檔案', () => {
    expect(getMimeType('logo.png')).toBe('image/png')
    expect(getMimeType('photo.jpg')).toBe('image/jpeg')
    expect(getMimeType('photo.jpeg')).toBe('image/jpeg')
    expect(getMimeType('icon.gif')).toBe('image/gif')
    expect(getMimeType('icon.svg')).toBe('image/svg+xml')
  })

  it('應該處理帶路徑的檔案', () => {
    expect(getMimeType('assets/images/logo.png')).toBe('image/png')
    expect(getMimeType('./css/style.css')).toBe('text/css')
  })

  it('應該對未知檔案類型返回預設值', () => {
    expect(getMimeType('unknown.xyz')).toBe('application/octet-stream')
    expect(getMimeType('noextension')).toBe('application/octet-stream')
  })
})
