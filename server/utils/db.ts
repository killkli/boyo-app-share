import { Pool, type QueryResult, type QueryResultRow } from 'pg'

let pool: Pool | null = null

/**
 * 獲取資料庫連接池實例
 * 使用單例模式確保只有一個連接池
 */
export const getDb = (): Pool => {
  if (!pool) {
    // 在測試環境中，直接從 process.env 讀取
    // 在 Nuxt 環境中，使用 useRuntimeConfig
    let databaseUrl: string | undefined

    try {
      const config = useRuntimeConfig()
      databaseUrl = config.databaseUrl
    } catch {
      // 測試環境或非 Nuxt 環境
      databaseUrl = process.env.DATABASE_URL
    }

    if (!databaseUrl) {
      throw new Error('DATABASE_URL 環境變數未設定')
    }

    pool = new Pool({
      connectionString: databaseUrl,
      max: 10, // 最大連接數
      idleTimeoutMillis: 30000, // 閒置連接超時時間
      connectionTimeoutMillis: 2000, // 連接超時時間
    })

    // 處理連接池錯誤
    pool.on('error', (err) => {
      console.error('資料庫連接池錯誤:', err)
    })
  }

  return pool
}

/**
 * 執行 SQL 查詢
 * @param text SQL 查詢語句
 * @param params 查詢參數
 * @returns 查詢結果
 */
export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  const db = getDb()
  try {
    return await db.query<T>(text, params)
  } catch (error) {
    console.error('資料庫查詢錯誤:', error)
    throw error
  }
}

/**
 * 關閉資料庫連接池
 * 主要用於測試環境清理
 */
export const closeDb = async (): Promise<void> => {
  if (pool) {
    await pool.end()
    pool = null
  }
}
