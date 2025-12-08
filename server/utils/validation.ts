import { z } from 'zod'

/**
 * 註冊表單驗證 Schema
 */
export const registerSchema = z.object({
  email: z.string().email('無效的 email 格式'),
  username: z
    .string()
    .min(3, '使用者名稱至少 3 個字元')
    .max(50, '使用者名稱最多 50 個字元')
    .regex(/^[a-zA-Z0-9_-]+$/, '使用者名稱只能包含英文、數字、底線和連字號'),
  password: z
    .string()
    .min(8, '密碼至少 8 個字元')
    .max(100, '密碼最多 100 個字元')
})

/**
 * 登入表單驗證 Schema
 */
export const loginSchema = z.object({
  email: z.string().email('無效的 email 格式'),
  password: z.string().min(1, '密碼不能為空')
})

/**
 * 註冊請求的類型
 */
export type RegisterInput = z.infer<typeof registerSchema>

/**
 * 登入請求的類型
 */
export type LoginInput = z.infer<typeof loginSchema>
