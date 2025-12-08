import { vi } from 'vitest'

/**
 * 創建模擬的 H3 事件對象
 */
export function createMockEvent(options: {
  body?: any
  headers?: Record<string, string>
  method?: string
  path?: string
  context?: Record<string, any>
} = {}) {
  const {
    body = {},
    headers = {},
    method = 'POST',
    path = '/',
    context = {}
  } = options

  return {
    node: {
      req: {
        method,
        url: path,
        headers
      },
      res: {
        statusCode: 200,
        setHeader: vi.fn(),
        end: vi.fn()
      }
    },
    context,
    _method: method,
    _path: path,
    _body: body
  } as any
}

/**
 * 模擬 readBody 函數
 */
export async function mockReadBody(event: any) {
  return event._body || {}
}

/**
 * 模擬 createError 函數
 */
export function mockCreateError(options: {
  statusCode: number
  message: string
  data?: any
}) {
  const error = new Error(options.message) as any
  error.statusCode = options.statusCode
  error.data = options.data
  return error
}

/**
 * 模擬 getHeader 函數
 */
export function mockGetHeader(event: any, name: string) {
  const headers = event.node.req.headers || {}
  return headers[name.toLowerCase()]
}

/**
 * 設置全局 mock
 */
export function setupH3Mocks() {
  // @ts-ignore
  global.readBody = mockReadBody
  // @ts-ignore
  global.createError = mockCreateError
  // @ts-ignore
  global.defineEventHandler = (handler: any) => handler
  // @ts-ignore
  global.getHeader = mockGetHeader
}
