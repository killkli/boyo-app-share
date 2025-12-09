import { query } from '~/server/utils/db'

/**
 * 保存APP的創作者列表
 * @param appId APP ID
 * @param creators 創作者名稱陣列
 */
export async function saveAppCreators(
  appId: string,
  creators: string[]
): Promise<void> {
  if (!creators || creators.length === 0) {
    return
  }

  // 去重並過濾空字串
  const uniqueCreators = [...new Set(creators)].filter(name => name.trim() !== '')

  // 插入創作者（使用 creator_order 保持順序）
  for (let i = 0; i < uniqueCreators.length; i++) {
    await query(
      `INSERT INTO app_creators (app_id, creator_name, creator_order)
       VALUES ($1, $2, $3)
       ON CONFLICT (app_id, creator_name) DO UPDATE
       SET creator_order = EXCLUDED.creator_order`,
      [appId, uniqueCreators[i].trim(), i]
    )
  }
}

/**
 * 獲取APP的創作者列表
 * @param appId APP ID或APP IDs陣列
 * @returns 創作者名稱陣列，或IDs到creators的映射
 */
export async function getAppCreators(
  appId: string
): Promise<string[]>
export async function getAppCreators(
  appIds: string[]
): Promise<Record<string, string[]>>
export async function getAppCreators(
  appIdOrIds: string | string[]
): Promise<string[] | Record<string, string[]>> {
  // 單個ID的情況
  if (typeof appIdOrIds === 'string') {
    const result = await query(
      `SELECT creator_name
       FROM app_creators
       WHERE app_id = $1
       ORDER BY creator_order ASC`,
      [appIdOrIds]
    )
    return result.rows.map(row => row.creator_name)
  }

  // 多個IDs的情況
  if (appIdOrIds.length === 0) {
    return {}
  }

  const result = await query(
    `SELECT app_id, creator_name
     FROM app_creators
     WHERE app_id = ANY($1)
     ORDER BY app_id, creator_order ASC`,
    [appIdOrIds]
  )

  // 組織成 { appId: [creators] } 的格式
  const creatorsMap: Record<string, string[]> = {}
  for (const appId of appIdOrIds) {
    creatorsMap[appId] = []
  }

  for (const row of result.rows) {
    creatorsMap[row.app_id].push(row.creator_name)
  }

  return creatorsMap
}

/**
 * 更新APP的創作者列表（先刪除舊的，再插入新的）
 * @param appId APP ID
 * @param creators 創作者名稱陣列
 */
export async function updateAppCreators(
  appId: string,
  creators: string[]
): Promise<void> {
  // 刪除舊的創作者
  await query(
    'DELETE FROM app_creators WHERE app_id = $1',
    [appId]
  )

  // 插入新的創作者
  await saveAppCreators(appId, creators)
}

/**
 * 刪除APP的所有創作者（通常在刪除APP時由CASCADE自動執行）
 * @param appId APP ID
 */
export async function deleteAppCreators(appId: string): Promise<void> {
  await query(
    'DELETE FROM app_creators WHERE app_id = $1',
    [appId]
  )
}
