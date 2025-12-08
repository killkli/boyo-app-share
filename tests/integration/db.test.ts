import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getDb, query, closeDb } from '~/server/utils/db'

// 只在有 DATABASE_URL 時執行整合測試
describe.skipIf(!process.env.DATABASE_URL)('資料庫連接測試', () => {
  beforeAll(async () => {
    console.log('執行資料庫整合測試 (需要 DATABASE_URL)')
  })

  afterAll(async () => {
    // 關閉資料庫連接
    await closeDb()
  })

  it('應該能夠建立資料庫連接池', () => {
    const db = getDb()
    expect(db).toBeDefined()
    expect(db).toHaveProperty('query')
  })

  it('應該能夠執行基礎查詢', async () => {
    const result = await query('SELECT 1 as num')
    expect(result.rows).toBeDefined()
    expect(result.rows.length).toBeGreaterThan(0)
    expect(result.rows[0].num).toBe(1)
  })

  it('應該能夠執行帶參數的查詢', async () => {
    const testValue = 42
    const result = await query('SELECT $1::integer as value', [testValue])
    expect(result.rows[0].value).toBe(testValue)
  })

  it('應該處理查詢錯誤', async () => {
    await expect(
      query('SELECT * FROM non_existent_table')
    ).rejects.toThrow()
  })
})

// 單元測試：不需要實際資料庫連接
describe('資料庫工具函數單元測試', () => {
  it('應該在沒有 DATABASE_URL 時拋出錯誤', () => {
    // 保存原始環境變數
    const originalUrl = process.env.DATABASE_URL
    delete process.env.DATABASE_URL

    // 重置 pool
    closeDb()

    expect(() => getDb()).toThrow('DATABASE_URL 環境變數未設定')

    // 恢復環境變數
    if (originalUrl) {
      process.env.DATABASE_URL = originalUrl
    }
  })
})
