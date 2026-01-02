# 管理員介面實作計畫

## 概述

為博幼APP分享平臺新增管理員介面，初期採用硬編碼方式認定管理員身份。

**管理員帳號**: `dchensterebay@gmail.com`

---

## Stage 1: 基礎建設

**Goal**: 建立管理員權限判斷的核心邏輯

**Success Criteria**:
- [x] `isAdmin()` 函數可正確判斷管理員身份
- [x] `requireAdmin()` 可在 API 層面阻擋非管理員
- [x] `useAdmin` composable 可在前端判斷管理員身份
- [x] admin middleware 可保護管理員頁面

**實作項目**:

### 1.1 後端工具函數
```
server/utils/admin.ts
```
- `isAdmin(email)`: 判斷是否為管理員
- `requireAdmin(event)`: API middleware helper

### 1.2 前端 Composable
```
composables/useAdmin.ts
```
- `isAdmin`: computed 響應式判斷
- 基於現有 `useAuth()` session

### 1.3 路由 Middleware
```
middleware/admin.ts
```
- 保護 `/admin/*` 路由
- 非管理員重導至首頁

**Tests**:
- `server/utils/admin.test.ts`

**Status**: ✅ Completed

---

## Stage 2: Dashboard 統計總覽

**Goal**: 建立管理員 Dashboard 顯示平台統計資料

**Success Criteria**:
- [x] API 回傳正確的統計數據
- [x] Dashboard 頁面顯示統計卡片
- [x] 非管理員無法存取

**實作項目**:

### 2.1 統計 API
```
server/api/admin/stats.get.ts
```
回傳資料：
- 總用戶數
- 總 App 數
- 今日新增用戶
- 今日新增 App
- 總留言數
- 總評分數

### 2.2 Dashboard 頁面
```
pages/admin/index.vue
```
- 統計卡片展示
- 使用 shadcn-vue Card 元件
- 響應式佈局

**Tests**:
- `server/api/admin/stats.test.ts`

**Status**: ✅ Completed

---

## Stage 3: 用戶管理

**Goal**: 讓管理員可以查看和管理平台用戶

**Success Criteria**:
- [x] 可查看所有用戶列表（分頁）
- [x] 可搜尋用戶（email/username）
- [x] 可禁用/啟用用戶帳號

**實作項目**:

### 3.1 用戶列表 API
```
server/api/admin/users/index.get.ts
```
- 分頁查詢
- 搜尋過濾
- 排序選項

### 3.2 更新用戶狀態 API
```
server/api/admin/users/[id].put.ts
```
- 禁用/啟用帳號
- 需新增 `is_active` 欄位

### 3.3 用戶管理頁面
```
pages/admin/users.vue
```
- 用戶列表表格
- 搜尋欄
- 操作按鈕

### 3.4 資料庫遷移
```
server/database/migrations/005_add_user_status.sql
```
- 新增 `is_active` 欄位

**Tests**:
- `server/api/admin/users/index.test.ts`
- `server/api/admin/users/[id].test.ts`

**Status**: ✅ Completed

---

## Stage 4: App 管理

**Goal**: 讓管理員可以管理平台上的所有 App

**Success Criteria**:
- [x] 可查看所有 App（包含私人）
- [x] 可刪除任意 App
- [x] 可設定 App 為精選

**實作項目**:

### 4.1 App 列表 API
```
server/api/admin/apps/index.get.ts
```
- 查看所有 App（含私人）
- 分頁、搜尋、過濾

### 4.2 刪除 App API
```
server/api/admin/apps/[id].delete.ts
```
- 管理員可刪除任意 App
- 同步清理 S3 檔案

### 4.3 設定精選 API
```
server/api/admin/apps/[id]/featured.put.ts
```
- 需新增 `is_featured` 欄位

### 4.4 App 管理頁面
```
pages/admin/apps.vue
```
- App 列表表格
- 篩選器（分類、狀態）
- 批量操作

### 4.5 資料庫遷移
```
server/database/migrations/006_add_featured_flag.sql
```
- 新增 `is_featured` 欄位

**Tests**:
- `server/api/admin/apps/index.test.ts`
- `server/api/admin/apps/[id].test.ts`

**Status**: ✅ Completed

---

## Stage 5: 留言管理

**Goal**: 讓管理員可以管理平台留言

**Success Criteria**:
- [x] 可查看所有留言
- [x] 可刪除不當留言

**實作項目**:

### 5.1 留言列表 API
```
server/api/admin/comments/index.get.ts
```

### 5.2 刪除留言 API
```
server/api/admin/comments/[id].delete.ts
```

### 5.3 留言管理頁面
```
pages/admin/comments.vue
```

**Status**: ✅ Completed

---

## 技術規格

### 管理員判斷邏輯

```typescript
// server/utils/admin.ts
const ADMIN_EMAILS = ['dchensterebay@gmail.com']

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

export async function requireAdmin(event: H3Event) {
  const session = await getSession(event)

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    throw createError({
      statusCode: 403,
      message: '需要管理員權限'
    })
  }

  return session.user
}
```

### API 結構

```
server/api/admin/
├── stats.get.ts
├── users/
│   ├── index.get.ts
│   └── [id].put.ts
├── apps/
│   ├── index.get.ts
│   ├── [id].delete.ts
│   └── [id]/
│       └── featured.put.ts
└── comments/
    ├── index.get.ts
    └── [id].delete.ts
```

### 頁面結構

```
pages/admin/
├── index.vue      # Dashboard
├── users.vue      # 用戶管理
├── apps.vue       # App 管理
└── comments.vue   # 留言管理
```

### 權限控制

- 所有 `/api/admin/*` API 必須通過 `requireAdmin()` 檢查
- 所有 `/admin/*` 頁面必須使用 `admin` middleware

---

## 未來擴展

當需要更彈性的權限管理時，可考慮：

1. 在 users 表新增 `role` 欄位
2. 將管理員 email 移至環境變數或資料庫
3. 實作角色權限系統（RBAC）

目前採用硬編碼是為了快速實作，避免過度設計。
