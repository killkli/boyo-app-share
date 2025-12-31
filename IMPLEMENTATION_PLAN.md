# 實施計劃：ZIP 上傳前端功能

## 概述

後端已完整支援 ZIP 上傳功能，但前端缺少對應的 UI。本計劃將新增 ZIP 上傳 Tab，讓使用者可以上傳打包好的網站檔案（含 index.html 及其他資源）。

---

## 現狀分析

| 層級 | 狀態 |
|------|------|
| **後端 API** | ✅ 已完整實現 ZIP 上傳 |
| **驗證 Schema** | ✅ `uploadZipSchema` 已存在 |
| **ZIP 解壓縮** | ✅ `extractZip`, `findMainHtml` 已實現 |
| **整合測試** | ✅ `upload-zip.test.ts` 已存在 |
| **前端 UI** | ✅ **ZIP 上傳 Tab 已實現** |

---

## Stage 1: 新增 ZIP 上傳 Tab UI
**Goal**: 在 `pages/create.vue` 新增第三個 Tab「上傳壓縮檔」
**Success Criteria**:
- ✅ TabsList 顯示三個選項：剪貼簿、上傳檔案、壓縮檔
- ✅ 選擇 ZIP Tab 時顯示 ZIP 上傳區域
- ✅ 支援拖放上傳 ZIP 檔案
- ✅ 顯示檔案大小限制提示
**Tests**:
- E2E 測試驗證 Tab 切換
- 驗證 ZIP 檔案選擇功能
**Status**: ✅ Completed

---

## Stage 2: 實作 ZIP 檔案處理邏輯
**Goal**: 處理 ZIP 檔案選擇、讀取並轉換為 base64
**Success Criteria**:
- ✅ 選擇 ZIP 檔案後顯示檔案資訊
- ✅ 檔案大小限制檢查（50MB）
- ✅ ZIP 內容轉換為 base64
- ✅ 顯示轉換進度
**Tests**:
- 單元測試驗證 base64 轉換
- 驗證檔案大小限制
**Status**: ✅ Completed

---

## Stage 3: 整合 API 呼叫與成功處理
**Goal**: 將 ZIP 內容提交到後端 API
**Success Criteria**:
- ✅ 提交時使用 `uploadType: 'zip'` 和 `zipContent`
- ✅ 顯示上傳進度（使用 isUploading 狀態）
- ✅ 處理成功/失敗回應
- ✅ 成功後跳轉到 App 詳情頁
**Tests**:
- E2E 測試完整上傳流程
- 驗證錯誤處理（無 HTML 檔案、ZIP 格式錯誤等）
**Status**: ✅ Completed

---

## Stage 4: ZIP 內容預覽（可選增強功能）
**Goal**: 在上傳前預覽 ZIP 內的檔案結構和主要 HTML
**Success Criteria**:
- 前端使用 jszip 解壓縮預覽
- 顯示 ZIP 內的檔案列表
- 預覽 index.html 內容
- 標示主入口檔案
**Tests**:
- 驗證預覽功能
**Status**: Not Started (Optional)

---

## 技術細節

### 現有後端支援

```typescript
// server/utils/validation.ts - 已存在
uploadZipSchema = z.object({
  uploadType: z.literal('zip'),
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string()).max(10).optional(),
  zipContent: z.string().min(1, 'ZIP 內容不能為空'),
  creators: creatorsArraySchema
})
```

### 前端需要新增

```typescript
// 1. 擴展上傳類型
const uploadType = ref<'paste' | 'file' | 'zip'>('paste')

// 2. ZIP 檔案狀態
const selectedZipFile = ref<File | null>(null)
const zipContent = ref<string>('')
const zipProcessing = ref(false)

// 3. ZIP 檔案處理函數
const handleZipChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 檔案大小檢查 (50MB)
  if (file.size > 50 * 1024 * 1024) {
    errors.value.zip = 'ZIP 檔案不能超過 50MB'
    return
  }

  selectedZipFile.value = file
  zipProcessing.value = true

  try {
    // 轉換為 base64
    const buffer = await file.arrayBuffer()
    zipContent.value = btoa(
      new Uint8Array(buffer).reduce(
        (data, byte) => data + String.fromCharCode(byte), ''
      )
    )
  } finally {
    zipProcessing.value = false
  }
}

// 4. 提交邏輯分支
if (uploadType.value === 'zip') {
  body = {
    uploadType: 'zip',
    title: form.value.title,
    description: form.value.description,
    category: form.value.category,
    tags: form.value.tags,
    creators: form.value.creators,
    zipContent: zipContent.value
  }
}
```

---

## 相依性

- **無額外相依性**：Stage 1-3 可使用原生 API
- **Stage 4 可選**：需要引入 `jszip` 套件進行前端解壓縮預覽

---

## UI 設計

### ZIP 上傳 Tab 內容

```
┌─────────────────────────────────────────────┐
│  [剪貼簿]  [上傳檔案]  [上傳壓縮檔]          │
├─────────────────────────────────────────────┤
│                                             │
│   ┌───────────────────────────────────┐    │
│   │                                   │    │
│   │       📦 拖放 ZIP 檔案至此        │    │
│   │          或點擊選擇檔案           │    │
│   │                                   │    │
│   │   支援 .zip 格式，最大 50MB       │    │
│   │   ZIP 須包含 index.html 入口檔    │    │
│   │                                   │    │
│   └───────────────────────────────────┘    │
│                                             │
│   已選擇: my-app.zip (2.3 MB)              │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 開發順序

1. [ ] Stage 1: 新增 ZIP 上傳 Tab UI
2. [ ] Stage 2: 實作 ZIP 檔案處理邏輯
3. [ ] Stage 3: 整合 API 呼叫
4. [ ] Stage 4: ZIP 內容預覽（可選）

---

## 測試策略

### 整合測試（已存在）
- `tests/integration/api/apps/upload-zip.test.ts`

### E2E 測試（需新增）
- 選擇 ZIP Tab
- 上傳 ZIP 檔案
- 驗證成功流程
- 驗證錯誤處理

---

## 注意事項

1. **檔案大小限制**：50MB 上限，需在前端和後端都驗證
2. **Base64 編碼**：大檔案轉換需要處理效能問題
3. **錯誤訊息**：清楚告知使用者 ZIP 需要包含 HTML 檔案
4. **進度指示**：大檔案上傳時需要顯示進度
5. **記憶體管理**：避免大檔案造成瀏覽器記憶體問題
