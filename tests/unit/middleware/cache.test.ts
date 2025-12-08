import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'

// 測試用的 cache middleware
async function testCacheMiddleware(event: H3Event) {
  const { setCacheHeaders } = await import('~/server/utils/cache')

  const path = event.path || event.node?.req?.url || ''
  const method = event.method || event.node?.req?.method || 'GET'

  // 只對 GET 請求設置 cache
  if (method !== 'GET') {
    return
  }

  setCacheHeaders(event, path)
}

describe('Cache Control Middleware', () => {
  let mockEvent: Partial<H3Event>

  beforeEach(() => {
    mockEvent = {
      path: '/',
      method: 'GET',
      node: {
        res: {
          setHeader: vi.fn(),
          getHeader: vi.fn(),
          removeHeader: vi.fn(),
          headersSent: false,
          statusCode: 200
        } as any,
        req: {
          url: '/',
          method: 'GET'
        } as any
      }
    } as Partial<H3Event>
  })

  it('應該為靜態圖片設置長時間快取', async () => {
    mockEvent.path = '/images/logo.png'
    if (mockEvent.node?.req) {
      mockEvent.node.req.url = '/images/logo.png'
    }

    await testCacheMiddleware(mockEvent as H3Event)

    expect(mockEvent.node?.res?.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      expect.stringContaining('max-age=31536000')
    )
  })

  it('應該為 CSS 檔案設置長時間快取', async () => {
    mockEvent.path = '/styles/main.css'
    if (mockEvent.node?.req) {
      mockEvent.node.req.url = '/styles/main.css'
    }

    await testCacheMiddleware(mockEvent as H3Event)

    expect(mockEvent.node?.res?.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      expect.stringContaining('max-age=31536000')
    )
  })

  it('應該為 JavaScript 檔案設置長時間快取', async () => {
    mockEvent.path = '/js/app.js'
    if (mockEvent.node?.req) {
      mockEvent.node.req.url = '/js/app.js'
    }

    await testCacheMiddleware(mockEvent as H3Event)

    expect(mockEvent.node?.res?.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      expect.stringContaining('max-age=31536000')
    )
  })

  it('應該為 API 回應設置 no-cache', async () => {
    mockEvent.path = '/api/apps'
    if (mockEvent.node?.req) {
      mockEvent.node.req.url = '/api/apps'
    }

    await testCacheMiddleware(mockEvent as H3Event)

    expect(mockEvent.node?.res?.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      expect.stringContaining('no-cache')
    )
  })

  it('應該為 HTML 頁面設置短時間快取', async () => {
    mockEvent.path = '/'
    if (mockEvent.node?.req) {
      mockEvent.node.req.url = '/'
    }

    await testCacheMiddleware(mockEvent as H3Event)

    expect(mockEvent.node?.res?.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      expect.stringContaining('max-age=')
    )
  })

  it('應該跳過非 GET 請求', async () => {
    mockEvent.method = 'POST'
    if (mockEvent.node?.req) {
      mockEvent.node.req.method = 'POST'
    }

    await testCacheMiddleware(mockEvent as H3Event)

    expect(mockEvent.node?.res?.setHeader).not.toHaveBeenCalled()
  })

  it('應該為字體檔案設置長時間快取', async () => {
    mockEvent.path = '/fonts/roboto.woff2'
    if (mockEvent.node?.req) {
      mockEvent.node.req.url = '/fonts/roboto.woff2'
    }

    await testCacheMiddleware(mockEvent as H3Event)

    expect(mockEvent.node?.res?.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      expect.stringContaining('max-age=31536000')
    )
  })
})
