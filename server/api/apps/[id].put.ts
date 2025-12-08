import { query } from '~/server/utils/db'
import { updateAppSchema } from '~/server/utils/validation'

export default defineEventHandler(async (event) => {
  // 檢查認證
  const userId = event.context.userId
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  // 獲取 App ID
  const appId = event.context.params?.id
  if (!appId) {
    throw createError({
      statusCode: 400,
      message: '缺少 App ID'
    })
  }

  // 讀取並驗證請求內容
  const body = await readBody(event)

  // 驗證輸入
  let validated
  try {
    validated = updateAppSchema.parse(body)
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      message: error.errors?.[0]?.message || '輸入資料無效'
    })
  }

  // 檢查 App 是否存在且使用者是否為擁有者
  const checkResult = await query(
    'SELECT id, user_id FROM apps WHERE id = $1',
    [appId]
  )

  if (checkResult.rows.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'App 不存在'
    })
  }

  const app = checkResult.rows[0]
  if (app.user_id !== userId) {
    throw createError({
      statusCode: 403,
      message: '無權限更新此 App'
    })
  }

  // 建立更新 SQL 動態語句
  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (validated.title !== undefined) {
    updates.push(`title = $${paramIndex}`)
    values.push(validated.title)
    paramIndex++
  }

  if (validated.description !== undefined) {
    updates.push(`description = $${paramIndex}`)
    values.push(validated.description)
    paramIndex++
  }

  if (validated.category !== undefined) {
    updates.push(`category = $${paramIndex}`)
    values.push(validated.category)
    paramIndex++
  }

  if (validated.tags !== undefined) {
    updates.push(`tags = $${paramIndex}`)
    values.push(validated.tags)
    paramIndex++
  }

  // 總是更新 updated_at
  updates.push(`updated_at = CURRENT_TIMESTAMP`)

  // 如果沒有任何更新，直接返回當前 App
  if (updates.length === 1) { // 只有 updated_at
    const currentResult = await query(
      `SELECT a.*, u.username as author_username
       FROM apps a
       JOIN users u ON a.user_id = u.id
       WHERE a.id = $1`,
      [appId]
    )
    return {
      app: currentResult.rows[0]
    }
  }

  // 執行更新
  values.push(appId)
  const updateQuery = `
    UPDATE apps
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `

  const result = await query(updateQuery, values)

  // 獲取完整的 App 資訊（包含作者資訊）
  const appResult = await query(
    `SELECT a.*, u.username as author_username
     FROM apps a
     JOIN users u ON a.user_id = u.id
     WHERE a.id = $1`,
    [appId]
  )

  return {
    app: appResult.rows[0]
  }
})
