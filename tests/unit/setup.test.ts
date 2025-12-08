import { describe, it, expect } from 'vitest'

describe('測試環境設置', () => {
  it('應該能夠運行基礎測試', () => {
    expect(1 + 1).toBe(2)
  })

  it('應該支援 TypeScript', () => {
    const message: string = 'Hello, TDD!'
    expect(typeof message).toBe('string')
  })

  it('應該支援 async/await', async () => {
    const result = await Promise.resolve(42)
    expect(result).toBe(42)
  })
})
