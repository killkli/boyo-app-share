import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { query, closeDb } from '~/server/utils/db'
import { saveAppCreators, getAppCreators, updateAppCreators } from './creators'
import type { CreatorInput } from '~/server/types/creator'

// 測試用的 APP ID
const TEST_APP_ID = '00000000-0000-0000-0000-000000000001'
const TEST_APP_ID_2 = '00000000-0000-0000-0000-000000000002'
const TEST_USER_ID = '00000000-0000-0000-0000-000000000099'

describe('creators 工具函數 - 支援創作者連結', () => {
  beforeEach(async () => {
    // 創建測試用戶
    await query(
      `INSERT INTO users (id, email, username, password_hash)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [TEST_USER_ID, 'test@test.com', 'testuser', 'hash']
    )

    // 創建測試 APP
    await query(
      `INSERT INTO apps (id, title, description, html_s3_key, user_id, upload_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [TEST_APP_ID, 'Test App 1', 'Test Description', 'test-key-1', TEST_USER_ID, 'paste']
    )

    await query(
      `INSERT INTO apps (id, title, description, html_s3_key, user_id, upload_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [TEST_APP_ID_2, 'Test App 2', 'Test Description', 'test-key-2', TEST_USER_ID, 'paste']
    )

    // 清理測試創作者資料
    await query('DELETE FROM app_creators WHERE app_id = ANY($1)', [
      [TEST_APP_ID, TEST_APP_ID_2]
    ])
  })

  afterEach(async () => {
    // 清理測試資料
    await query('DELETE FROM app_creators WHERE app_id = ANY($1)', [
      [TEST_APP_ID, TEST_APP_ID_2]
    ])
    await query('DELETE FROM apps WHERE id = ANY($1)', [
      [TEST_APP_ID, TEST_APP_ID_2]
    ])
    await query('DELETE FROM users WHERE id = $1', [TEST_USER_ID])
  })

  describe('saveAppCreators', () => {
    it('應該保存純字串陣列的創作者（向後相容）', async () => {
      const creators: CreatorInput[] = ['Alice', 'Bob', 'Charlie']
      await saveAppCreators(TEST_APP_ID, creators)

      const result = await getAppCreators(TEST_APP_ID)
      expect(result).toHaveLength(3)
      expect(result[0].name).toBe('Alice')
      expect(result[0].link).toBeUndefined()
      expect(result[1].name).toBe('Bob')
      expect(result[2].name).toBe('Charlie')
    })

    it('應該保存帶有連結的創作者', async () => {
      const creators: CreatorInput[] = [
        { name: 'Alice', link: 'https://alice.com' },
        { name: 'Bob', link: 'https://bob.com' }
      ]
      await saveAppCreators(TEST_APP_ID, creators)

      const result = await getAppCreators(TEST_APP_ID)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ name: 'Alice', link: 'https://alice.com' })
      expect(result[1]).toEqual({ name: 'Bob', link: 'https://bob.com' })
    })

    it('應該保存混合格式的創作者（字串+物件）', async () => {
      const creators: CreatorInput[] = [
        'Alice',
        { name: 'Bob', link: 'https://bob.com' },
        { name: 'Charlie' }
      ]
      await saveAppCreators(TEST_APP_ID, creators)

      const result = await getAppCreators(TEST_APP_ID)
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ name: 'Alice' })
      expect(result[1]).toEqual({ name: 'Bob', link: 'https://bob.com' })
      expect(result[2]).toEqual({ name: 'Charlie' })
    })

    it('應該正確處理空連結', async () => {
      const creators: CreatorInput[] = [
        { name: 'Alice', link: '' },
        { name: 'Bob', link: undefined }
      ]
      await saveAppCreators(TEST_APP_ID, creators)

      const result = await getAppCreators(TEST_APP_ID)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Alice')
      expect(result[0].link).toBeUndefined()
      expect(result[1].name).toBe('Bob')
      expect(result[1].link).toBeUndefined()
    })

    it('應該去重相同名稱的創作者', async () => {
      const creators: CreatorInput[] = [
        'Alice',
        { name: 'Alice', link: 'https://alice.com' }
      ]
      await saveAppCreators(TEST_APP_ID, creators)

      const result = await getAppCreators(TEST_APP_ID)
      // 第二個會更新第一個（因為名稱相同）
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ name: 'Alice', link: 'https://alice.com' })
    })

    it('應該保持創作者順序', async () => {
      const creators: CreatorInput[] = [
        { name: 'Charlie', link: 'https://charlie.com' },
        'Alice',
        { name: 'Bob', link: 'https://bob.com' }
      ]
      await saveAppCreators(TEST_APP_ID, creators)

      const result = await getAppCreators(TEST_APP_ID)
      expect(result[0].name).toBe('Charlie')
      expect(result[1].name).toBe('Alice')
      expect(result[2].name).toBe('Bob')
    })
  })

  describe('getAppCreators', () => {
    it('應該返回單個APP的創作者（含連結）', async () => {
      await saveAppCreators(TEST_APP_ID, [
        { name: 'Alice', link: 'https://alice.com' },
        'Bob'
      ])

      const result = await getAppCreators(TEST_APP_ID)
      expect(result).toEqual([
        { name: 'Alice', link: 'https://alice.com' },
        { name: 'Bob' }
      ])
    })

    it('應該返回多個APP的創作者映射', async () => {
      await saveAppCreators(TEST_APP_ID, [
        { name: 'Alice', link: 'https://alice.com' }
      ])
      await saveAppCreators(TEST_APP_ID_2, ['Bob', 'Charlie'])

      const result = await getAppCreators([TEST_APP_ID, TEST_APP_ID_2])
      expect(result[TEST_APP_ID]).toEqual([
        { name: 'Alice', link: 'https://alice.com' }
      ])
      expect(result[TEST_APP_ID_2]).toEqual([
        { name: 'Bob' },
        { name: 'Charlie' }
      ])
    })

    it('應該返回空陣列當APP沒有創作者', async () => {
      const result = await getAppCreators(TEST_APP_ID)
      expect(result).toEqual([])
    })
  })

  describe('updateAppCreators', () => {
    it('應該更新創作者列表', async () => {
      // 先保存初始創作者
      await saveAppCreators(TEST_APP_ID, ['Alice', 'Bob'])

      // 更新創作者
      await updateAppCreators(TEST_APP_ID, [
        { name: 'Charlie', link: 'https://charlie.com' },
        'David'
      ])

      const result = await getAppCreators(TEST_APP_ID)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ name: 'Charlie', link: 'https://charlie.com' })
      expect(result[1]).toEqual({ name: 'David' })
    })

    it('應該刪除舊的創作者', async () => {
      await saveAppCreators(TEST_APP_ID, ['Alice', 'Bob', 'Charlie'])
      await updateAppCreators(TEST_APP_ID, ['David'])

      const result = await getAppCreators(TEST_APP_ID)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('David')
    })
  })
})
