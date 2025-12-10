import { query } from '~/server/utils/db'
import { normalizeCreatorInput, type CreatorInput, type CreatorWithLink } from '~/server/types/creator'

/**
 * 保存APP的創作者列表（支援創作者連結）
 * @param appId APP ID
 * @param creators 創作者輸入陣列（字串或物件）
 */
export async function saveAppCreators(
  appId: string,
  creators: CreatorInput[]
): Promise<void> {
  if (!creators || creators.length === 0) {
    return
  }

  // 標準化並去重
  const normalizedCreators = creators
    .map(c => normalizeCreatorInput(c))
    .filter(c => c.name.trim() !== '')

  // 使用 Map 去重（後面的覆蓋前面的）
  const uniqueCreatorsMap = new Map<string, CreatorWithLink>()
  normalizedCreators.forEach(creator => {
    uniqueCreatorsMap.set(creator.name, creator)
  })

  const uniqueCreators = Array.from(uniqueCreatorsMap.values())

  // 插入創作者（使用 creator_order 保持順序）
  for (let i = 0; i < uniqueCreators.length; i++) {
    const creator = uniqueCreators[i]
    await query(
      `INSERT INTO app_creators (app_id, creator_name, creator_link, creator_order)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (app_id, creator_name) DO UPDATE
       SET creator_link = EXCLUDED.creator_link,
           creator_order = EXCLUDED.creator_order`,
      [appId, creator.name, creator.link || null, i]
    )
  }
}

/**
 * 獲取APP的創作者列表（返回完整物件）
 * @param appId APP ID或APP IDs陣列
 * @returns 創作者物件陣列，或IDs到creators的映射
 */
export async function getAppCreators(
  appId: string
): Promise<CreatorWithLink[]>
export async function getAppCreators(
  appIds: string[]
): Promise<Record<string, CreatorWithLink[]>>
export async function getAppCreators(
  appIdOrIds: string | string[]
): Promise<CreatorWithLink[] | Record<string, CreatorWithLink[]>> {
  // 單個ID的情況
  if (typeof appIdOrIds === 'string') {
    const result = await query(
      `SELECT creator_name, creator_link
       FROM app_creators
       WHERE app_id = $1
       ORDER BY creator_order ASC`,
      [appIdOrIds]
    )
    return result.rows.map(row => ({
      name: row.creator_name,
      ...(row.creator_link && { link: row.creator_link })
    }))
  }

  // 多個IDs的情況
  if (appIdOrIds.length === 0) {
    return {}
  }

  const result = await query(
    `SELECT app_id, creator_name, creator_link
     FROM app_creators
     WHERE app_id = ANY($1)
     ORDER BY app_id, creator_order ASC`,
    [appIdOrIds]
  )

  // 組織成 { appId: [creators] } 的格式
  const creatorsMap: Record<string, CreatorWithLink[]> = {}
  for (const appId of appIdOrIds) {
    creatorsMap[appId] = []
  }

  for (const row of result.rows) {
    creatorsMap[row.app_id].push({
      name: row.creator_name,
      ...(row.creator_link && { link: row.creator_link })
    })
  }

  return creatorsMap
}

/**
 * 更新APP的創作者列表（先刪除舊的，再插入新的）
 * @param appId APP ID
 * @param creators 創作者輸入陣列（字串或物件）
 */
export async function updateAppCreators(
  appId: string,
  creators: CreatorInput[]
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
