import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getDb, query, closeDb } from '~/server/utils/db'

describe('資料庫連接測試', () => {
  beforeAll(async () => {
    // 確保測試環境有 DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.warn('警告：未設定 DATABASE_URL 環境變數')
    }
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
