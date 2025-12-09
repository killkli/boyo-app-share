# 實作計劃：APP分享平台功能改進

## 概述
本計劃實現四個主要功能改進：
1. 個人收藏APP瀏覽區塊
2. 個人創建APP專用瀏覽功能
3. 多作者標註支援
4. HTML重新上傳功能

## Stage 1: 資料庫Schema更新（多作者支援）

**Goal**: 建立支援多作者的資料庫結構

**Success Criteria**:
- 新增 `app_creators` 表
- 支援一個APP有多個創作者
- 保留向後相容性（現有 `apps.user_id` 仍代表主要擁有者）

**Database Migration**:
```sql
-- 建立 app_creators 表
CREATE TABLE app_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  creator_name VARCHAR(100) NOT NULL,
  creator_order INTEGER DEFAULT 0,  -- 排序順序
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(app_id, creator_name)
);

CREATE INDEX idx_app_creators_app_id ON app_creators(app_id);
CREATE INDEX idx_app_creators_order ON app_creators(app_id, creator_order);
```

**Tests**:
- [x] Migration 可以成功執行
- [x] 可以插入多個創作者
- [x] UNIQUE 約束正常運作
- [x] CASCADE DELETE 正常運作

**Status**: ✅ Completed (2025-12-09)

---

## Stage 2: 個人收藏和創建APP列表API

**Goal**: 提供API端點讓使用者查看自己收藏和創建的APP

**Success Criteria**:
- `GET /api/apps/favorites` 返回當前使用者收藏的apps
- `GET /api/apps/my-apps` 返回當前使用者創建的apps
- 兩個API都支援分頁、排序
- 包含完整的app統計資訊（評分、評論數等）

**API Specs**:

### GET /api/apps/favorites
**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 12)
- `sort` (string: 'latest' | 'popular' | 'rating', default: 'latest')

**Response**:
```typescript
{
  apps: Array<AppWithStats>,
  total: number,
  page: number,
  limit: number,
  totalPages: number
}
```

### GET /api/apps/my-apps
**Query Parameters**: 同上

**Response**: 同上

**Tests**:
- [x] 未登入時返回 401
- [x] 正確返回使用者收藏的apps (7 tests passed)
- [x] 正確返回使用者創建的apps (9 tests passed)
- [x] 分頁功能正常
- [x] 排序功能正常
- [x] 空列表返回正確結構

**Status**: ✅ Completed (2025-12-09)

---

## Stage 3: 多作者標註功能

**Goal**: 在建立和編輯APP時支援添加多個創作者

**Success Criteria**:
- POST /api/apps 支援 `creators` 欄位
- PUT /api/apps/[id] 支援更新 `creators` 欄位
- GET APIs 返回創作者列表
- 前端表單支援添加/刪除創作者

**API Changes**:

### POST /api/apps
新增可選欄位：
```typescript
{
  creators?: string[]  // 創作者名稱陣列
}
```

### PUT /api/apps/[id]
新增可選欄位：
```typescript
{
  creators?: string[]  // 更新創作者列表（完全替換）
}
```

### Response 包含 creators
所有返回app的API都應包含：
```typescript
{
  app: {
    // ... 現有欄位
    creators: string[]  // 創作者名稱陣列（按 creator_order 排序）
  }
}
```

**Validation Schema Updates**:
```typescript
creators: z.array(z.string().max(100, '創作者名稱最多 100 個字元'))
  .max(10, '創作者最多 10 個')
  .optional()
```

**Tests**:
- [x] 可以創建帶有多個創作者的APP
- [x] 可以更新APP的創作者列表
- [x] 創作者名稱驗證正常
- [x] 創作者數量限制正常
- [x] 重複的創作者名稱會被處理（保留一個）
- [x] GET API正確返回創作者列表

**Implementation**:
- ✅ 創建 `server/utils/creators.ts` helper 函數
- ✅ 更新所有 validation schemas 支援 `creators` 欄位
- ✅ 更新 POST /api/apps 支援多作者
- ✅ 更新 PUT /api/apps/[id] 支援多作者
- ✅ 更新所有 GET APIs 返回 creators
- ✅ 批量查詢優化（避免 N+1 問題）

**Status**: ✅ Completed (2025-12-09)

---

## Stage 4: HTML重新上傳功能

**Goal**: 允許使用者重新上傳APP的HTML內容

**Success Criteria**:
- PUT /api/apps/[id] 支援重新上傳HTML
- 自動刪除舊的S3檔案
- 根據upload_type處理不同類型的內容
- 更新相關的S3 keys
- 可選：重新生成thumbnail

**API Changes**:

### PUT /api/apps/[id]
新增可選欄位（根據 upload_type）：
```typescript
{
  // 對於 paste 類型
  htmlContent?: string

  // 對於 file 類型（透過 multipart form）
  htmlFile?: File

  // 對於 zip 類型
  zipContent?: string  // base64 encoded

  // 可選：重新生成thumbnail
  regenerateThumbnail?: boolean
  thumbnailBase64?: string
}
```

**Implementation Flow**:
1. 驗證使用者權限（必須是app擁有者）
2. 獲取現有app資訊（html_s3_key, assets_s3_prefix）
3. 根據upload_type處理新內容
4. 上傳新內容到S3
5. 刪除舊的S3檔案
6. 更新資料庫記錄
7. （可選）重新生成thumbnail

**Helper Functions**:
```typescript
// server/utils/s3-cleanup.ts
export async function cleanupAppS3Files(
  htmlS3Key: string,
  assetsS3Prefix?: string
): Promise<void>

// server/utils/app-reupload.ts
export async function reuploadAppContent(
  appId: string,
  uploadType: 'paste' | 'file' | 'zip',
  content: string | Buffer
): Promise<{
  htmlS3Key: string
  assetsS3Prefix?: string
  fileManifest?: object
}>
```

**Tests**:
- [x] 可以重新上傳paste類型的HTML
- [x] 可以重新上傳file類型的HTML (透過 htmlContent)
- [x] 可以重新上傳zip類型的內容
- [x] 舊的S3檔案被正確刪除
- [x] S3刪除失敗不影響整體流程（記錄錯誤）
- [x] 非擁有者無法重新上傳 (403)
- [x] 上傳失敗時資料庫不更新
- [x] 可選thumbnail重新生成正常
- ✅ 9 個整合測試全部通過

**Implementation**:
- ✅ 創建 `server/utils/s3-cleanup.ts`
  - `cleanupAppS3Files()` - 清理主要內容
  - `cleanupThumbnail()` - 清理縮圖
  - `deleteS3Directory()` - 批量刪除
- ✅ 創建 `reuploadAppSchema` validation
- ✅ 創建 `PUT /api/apps/[id]/reupload` endpoint
  - 支援 paste/file/zip 類型
  - 自動清理舊檔案
  - 支援縮圖更新
  - 完整權限驗證

**Status**: ✅ Completed (2025-12-09)

---

## Stage 5: 前端UI更新

**Goal**: 建立前端介面支援新功能

**Success Criteria**:
- 個人中心新增「我的收藏」tab
- 個人中心新增「我的作品」tab
- 上傳/編輯表單支援多作者輸入
- 編輯頁面支援重新上傳HTML

**Components to Create/Update**:

### 1. `pages/profile/favorites.vue`
展示使用者收藏的apps列表

### 2. `pages/profile/my-apps.vue`
展示使用者創建的apps列表

### 3. `components/AppUploadForm.vue` (更新)
新增創作者輸入欄位：
- 可添加多個創作者
- 可刪除創作者
- 可拖曳排序

### 4. `components/AppEditForm.vue` (更新)
- 新增創作者編輯功能
- 新增「重新上傳HTML」按鈕
- 重新上傳時顯示確認對話框

### 5. `components/CreatorInput.vue` (新建)
多創作者輸入組件

**Tests** (E2E with Playwright):
- [ ] 可以導航到「我的收藏」頁面
- [ ] 收藏列表正確顯示
- [ ] 可以導航到「我的作品」頁面
- [ ] 作品列表正確顯示
- [ ] 可以在表單中添加多個創作者
- [ ] 可以刪除創作者
- [ ] 可以提交帶有創作者的app
- [ ] 可以重新上傳HTML
- [ ] 重新上傳後內容更新

**Status**: Not Started

---

## 開發順序

1. ✅ 分析現有架構
2. ✅ 建立實作計劃（本文件）
3. ✅ Stage 1: 資料庫Schema更新
4. ✅ Stage 2: 個人收藏和創建APP列表API
5. ✅ Stage 3: 多作者標註功能（後端）
6. ✅ Stage 4: HTML重新上傳功能
7. ⏳ Stage 5: 前端UI更新（待開發）

## 完成進度總結

### ✅ 已完成 (2025-12-09)
- **Stage 1**: `app_creators` 表建立，支援多作者關聯
- **Stage 2**:
  - `GET /api/apps/favorites` (7 tests passed)
  - `GET /api/apps/my-apps` (9 tests passed)
- **Stage 3**:
  - 多作者 helper 函數 (`server/utils/creators.ts`)
  - 所有 API 支援 `creators` 欄位
  - 批量查詢優化
- **Stage 4**:
  - `PUT /api/apps/[id]/reupload` (9 tests passed)
  - S3 清理機制完整實現
  - 支援 paste/file/zip 類型重新上傳

**測試覆蓋**:
- 整合測試: 34 tests passed
- TDD 開發流程嚴格遵循

### ⏳ 待完成
- **Stage 5**: 前端UI開發
  - 個人中心頁面（我的收藏/我的作品）
  - 多作者輸入組件
  - 重新上傳HTML界面

## 注意事項

1. **向後相容性**: ✅ 確保現有app（沒有creators資料）仍能正常運作
2. **錯誤處理**: ✅ S3操作失敗有適當的錯誤處理（不影響主流程）
3. **安全性**: ⚠️ HTML重新上傳時的XSS防護（使用現有 sanitization）
4. **效能**: ✅ 批量查詢優化避免 N+1 問題
5. **測試**: ✅ 所有功能都有完整的測試覆蓋（TDD原則）

---

**最後更新**: 2025-12-09
**狀態**: Stage 1-4 已完成，Stage 5 待開發
