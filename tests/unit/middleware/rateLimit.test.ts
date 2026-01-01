import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'
import { checkRateLimit, clearAllRateLimits } from '~/server/utils/rateLimit'

// 測試用的 rate limit middleware
async function testRateLimitMiddleware(event: H3Event) {
  const ip = event.node.req.socket?.remoteAddress || 'unknown'
  const userId = event.context.userId

  await checkRateLimit(event, ip, userId)
}

describe('Rate Limit Middleware', () => {
  let mockEvent: Partial<H3Event>

  beforeEach(() => {
    // 清除 rate limit 狀態
    clearAllRateLimits()

    mockEvent = {
      path: '/api/apps',
      method: 'GET',
      context: {},
      node: {
        res: {
          setHeader: vi.fn(),
          getHeader: vi.fn(),
          removeHeader: vi.fn(),
          headersSent: false,
          statusCode: 200
        } as any,
        req: {
          url: '/api/apps',
          method: 'GET',
          socket: {
            remoteAddress: '127.0.0.1'
          }
        } as any
      }
    } as Partial<H3Event>
  })

  it('應該允許正常請求通過', async () => {
    await expect(
      testRateLimitMiddleware(mockEvent as H3Event)
    ).resolves.not.toThrow()
  })

  it('應該在超過限制時拋出 429 錯誤', async () => {
    // 模擬大量請求
    for (let i = 0; i < 60; i++) {
      await checkRateLimit(mockEvent as H3Event, '127.0.0.1')
    }

    // 第 61 個請求應該被拒絕
    await expect(
      checkRateLimit(mockEvent as H3Event, '127.0.0.1')
    ).rejects.toMatchObject({
      statusCode: 429
    })
  })

  it('應該為認證用戶提供更高的限制', async () => {
    mockEvent.context = { userId: 'user-123' } as unknown as typeof mockEvent.context

    // 模擬 60 個請求（未認證用戶的限制）
    for (let i = 0; i < 60; i++) {
      await checkRateLimit(mockEvent as H3Event, '127.0.0.1', 'user-123')
    }

    // 認證用戶應該還能繼續請求
    await expect(
      checkRateLimit(mockEvent as H3Event, '127.0.0.1', 'user-123')
    ).resolves.not.toThrow()
  })

  it('應該為不同 IP 分別計數', async () => {

    const event1 = { ...mockEvent } as H3Event
    const event2 = {
      ...mockEvent,
      node: {
        ...mockEvent.node,
        req: {
          ...mockEvent.node?.req,
          socket: { remoteAddress: '192.168.1.1' }
        }
      }
    } as H3Event

    // IP1 發送 60 個請求
    for (let i = 0; i < 60; i++) {
      await checkRateLimit(event1, '127.0.0.1')
    }

    // IP2 應該還能正常請求
    await expect(
      checkRateLimit(event2, '192.168.1.1')
    ).resolves.not.toThrow()
  })

  it('應該設置 rate limit headers', async () => {
    await checkRateLimit(mockEvent as H3Event, '127.0.0.1')

    // 應該設置 X-RateLimit-* headers
    expect(mockEvent.node?.res?.setHeader).toHaveBeenCalledWith(
      'X-RateLimit-Limit',
      expect.any(Number)
    )
    expect(mockEvent.node?.res?.setHeader).toHaveBeenCalledWith(
      'X-RateLimit-Remaining',
      expect.any(Number)
    )
  })

  it('應該在一段時間後重置計數', async () => {
    vi.useFakeTimers()

    // 發送 60 個請求
    for (let i = 0; i < 60; i++) {
      await checkRateLimit(mockEvent as H3Event, '127.0.0.1')
    }

    // 下一個請求應該被拒絕
    await expect(
      checkRateLimit(mockEvent as H3Event, '127.0.0.1')
    ).rejects.toMatchObject({
      statusCode: 429
    })

    // 等待 61 秒（超過 1 分鐘窗口）
    vi.advanceTimersByTime(61000)

    // 應該能再次請求
    await expect(
      checkRateLimit(mockEvent as H3Event, '127.0.0.1')
    ).resolves.not.toThrow()

    vi.useRealTimers()
  })

  it('應該跳過白名單路徑', async () => {
    (mockEvent as any).path = '/api/health'

    // 即使超過限制，健康檢查端點也應該通過
    for (let i = 0; i < 100; i++) {
      await expect(
        checkRateLimit(mockEvent as H3Event, '127.0.0.1')
      ).resolves.not.toThrow()
    }
  })
})
