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

/**
 * App 上傳驗證 Schema (剪貼簿)
 */
export const uploadPasteSchema = z.object({
  uploadType: z.literal('paste'),
  title: z.string().min(1, '標題不能為空').max(255, '標題最多 255 個字元'),
  description: z.string().max(2000, '描述最多 2000 個字元').optional(),
  category: z.string().max(50, '分類最多 50 個字元').optional(),
  tags: z.array(z.string()).max(10, '標籤最多 10 個').optional(),
  htmlContent: z.string().min(1, 'HTML 內容不能為空')
})

/**
 * App 上傳驗證 Schema (單檔)
 */
export const uploadFileSchema = z.object({
  uploadType: z.literal('file'),
  title: z.string().min(1, '標題不能為空').max(255, '標題最多 255 個字元'),
  description: z.string().max(2000, '描述最多 2000 個字元').optional(),
  category: z.string().max(50, '分類最多 50 個字元').optional(),
  tags: z.array(z.string()).max(10, '標籤最多 10 個').optional()
})

/**
 * App 上傳類型
 */
export type UploadPasteInput = z.infer<typeof uploadPasteSchema>
export type UploadFileInput = z.infer<typeof uploadFileSchema>
