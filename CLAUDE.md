# 博幼APP分享平臺 (Boyo App Share) - 專案開發指南

## 專案概述

博幼APP分享平臺是一個教學應用分享平台，讓使用者可以透過剪貼簿貼上、上傳檔案或上傳壓縮檔的方式快速分享他們的 HTML 應用，並透過簡單的 metadata 進行分類和搜尋。本平台專注於教育性質的互動應用分享。

## 開發方法論：Test-Driven Development (TDD)

本專案採用 **測試驅動開發 (TDD)** 的開發方式，確保程式碼品質和可維護性。

### TDD 開發流程

```
紅燈 → 綠燈 → 重構
(Red) → (Green) → (Refactor)
```

#### 1. 紅燈 (Red) - 寫一個失敗的測試
- 先寫測試，描述你想要的功能行為
- 執行測試，確認測試失敗（因為功能還沒實現）
- 測試應該明確、具體，只測試一個行為

#### 2. 綠燈 (Green) - 寫最少的程式碼讓測試通過
- 實現最簡單的解決方案，讓測試通過
- 不需要考慮優化，先求能用
- 執行測試，確認測試通過

#### 3. 重構 (Refactor) - 優化程式碼
- 在測試通過的保護下，改善程式碼品質
- 消除重複、提升可讀性、改善結構
- 每次重構後都要執行測試，確保功能不變

### TDD 的好處

1. **更好的設計**：寫測試前先思考 API 設計，產生更好的介面
2. **更少的 Bug**：每個功能都有測試覆蓋，減少回歸錯誤
3. **更快的開發**：測試即文檔，減少手動測試時間
4. **重構信心**：有測試保護，可以放心重構
5. **可維護性**：測試即規格，新人更容易理解程式碼

### 實際範例

#### 範例 1：建立使用者註冊功能

**步驟 1: 寫測試 (紅燈)**
```typescript
// server/api/auth/register.test.ts
import { describe, it, expect } from 'vitest'
import { register } from './register'

describe('使用者註冊', () => {
  it('應該成功註冊新使用者', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123'
    }

    const result = await register(userData)

    expect(result).toHaveProperty('id')
    expect(result.email).toBe(userData.email)
    expect(result.username).toBe(userData.username)
  })

  it('應該拒絕重複的 email', async () => {
    const userData = {
      email: 'duplicate@example.com',
      username: 'user1',
      password: 'password123'
    }

    await register(userData)

    await expect(
      register({ ...userData, username: 'user2' })
    ).rejects.toThrow('Email 已被使用')
  })
})
```

**步驟 2: 實現功能 (綠燈)**
```typescript
// server/api/auth/register.ts
import bcrypt from 'bcrypt'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8)
})

export async function register(userData: unknown) {
  // 驗證輸入
  const validated = registerSchema.parse(userData)

  // 檢查 email 是否已存在
  const existing = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [validated.email]
  )

  if (existing.rows.length > 0) {
    throw new Error('Email 已被使用')
  }

  // 加密密碼
  const passwordHash = await bcrypt.hash(validated.password, 10)

  // 建立使用者
  const result = await db.query(
    'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username',
    [validated.email, validated.username, passwordHash]
  )

  return result.rows[0]
}
```

**步驟 3: 重構**
- 將驗證邏輯抽出成獨立函數
- 將資料庫操作抽出成 repository
- 優化錯誤處理

#### 範例 2：上傳 HTML 檔案功能

**步驟 1: 寫測試 (紅燈)**
```typescript
// server/utils/s3.test.ts
import { describe, it, expect, vi } from 'vitest'
import { uploadHtmlToS3 } from './s3'

describe('S3 上傳', () => {
  it('應該成功上傳 HTML 檔案到 S3', async () => {
    const appId = 'test-uuid'
    const htmlContent = '<html><body>Test</body></html>'

    const result = await uploadHtmlToS3(appId, htmlContent)

    expect(result).toHaveProperty('s3Key')
    expect(result).toHaveProperty('url')
    expect(result.s3Key).toBe(`apps/${appId}/index.html`)
  })

  it('應該處理上傳失敗的情況', async () => {
    const appId = 'test-uuid'
    const htmlContent = '<html><body>Test</body></html>'

    // Mock S3 client 失敗
    vi.mocked(s3Client.send).mockRejectedValue(new Error('S3 錯誤'))

    await expect(
      uploadHtmlToS3(appId, htmlContent)
    ).rejects.toThrow('上傳失敗')
  })
})
```

### 測試分類

#### 1. 單元測試 (Unit Tests)
測試單一函數或類別的行為

```typescript
// 範例：測試工具函數
describe('getMimeType', () => {
  it('應該正確識別 HTML 檔案', () => {
    expect(getMimeType('index.html')).toBe('text/html')
  })

  it('應該正確識別 CSS 檔案', () => {
    expect(getMimeType('style.css')).toBe('text/css')
  })
})
```

#### 2. 整合測試 (Integration Tests)
測試多個模組協作的行為

```typescript
// 範例：測試 API endpoint
describe('POST /api/apps', () => {
  it('應該成功建立新 App', async () => {
    const response = await $fetch('/api/apps', {
      method: 'POST',
      body: {
        title: 'Test App',
        htmlContent: '<html>...</html>',
        uploadType: 'paste'
      },
      headers: {
        Authorization: `Bearer ${testToken}`
      }
    })

    expect(response).toHaveProperty('app')
    expect(response.app.title).toBe('Test App')
  })
})
```

#### 3. E2E 測試 (End-to-End Tests)
使用 Playwright 測試完整的使用者流程

```typescript
// 範例：測試使用者註冊流程
test('使用者應該能夠註冊新帳號', async ({ page }) => {
  await page.goto('/register')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="username"]', 'testuser')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
})
```

## 測試工具

### Vitest
用於單元測試和整合測試

```bash
# 執行測試
pnpm test

# 監聽模式（開發時使用）
pnpm test --watch

# 測試覆蓋率
pnpm test:coverage

# UI 介面
pnpm test:ui
```

### 測試結構
```
tests/
├── unit/           # 單元測試
│   ├── utils/
│   └── composables/
├── integration/    # 整合測試
│   ├── api/
│   └── services/
└── e2e/           # E2E 測試
    └── flows/
```

## 開發工作流程

### 開發新功能的步驟

1. **分析需求**
   - 理解功能需求
   - 設計 API 介面
   - 識別邊界條件

2. **寫測試**
   - 從最簡單的情況開始
   - 覆蓋正常流程
   - 覆蓋錯誤情況
   - 覆蓋邊界條件

3. **實現功能**
   - 寫最少的程式碼讓測試通過
   - 一次只關注一個測試

4. **重構**
   - 改善程式碼品質
   - 消除重複
   - 保持測試通過

5. **提交**
   - 確保所有測試通過
   - 檢查測試覆蓋率
   - 寫清楚的 commit message

### 範例工作流程：實現「剪貼簿上傳」功能

```bash
# 1. 建立功能分支
git checkout -b feature/paste-upload

# 2. 建立測試檔案
touch server/api/apps/index.test.ts

# 3. 寫第一個測試
# 編輯 server/api/apps/index.test.ts

# 4. 執行測試（應該失敗）
pnpm test server/api/apps/index.test.ts

# 5. 實現功能
# 編輯 server/api/apps/index.post.ts

# 6. 執行測試（應該通過）
pnpm test server/api/apps/index.test.ts

# 7. 重複步驟 3-6，直到完成所有情況

# 8. 重構
# 改善程式碼品質，確保測試持續通過

# 9. 檢查覆蓋率
pnpm test:coverage

# 10. 提交
git add .
git commit -m "feat: 實現剪貼簿上傳功能

- 新增 POST /api/apps endpoint
- 支援剪貼簿貼上 HTML
- 自動上傳到 S3
- 測試覆蓋率 95%"
```

## 程式碼品質標準

### 測試覆蓋率目標
- **整體覆蓋率**: ≥ 80%
- **核心業務邏輯**: ≥ 90%
- **工具函數**: 100%

### 測試原則

1. **AAA 模式**：Arrange（準備）→ Act（執行）→ Assert（驗證）
2. **單一職責**：每個測試只測試一件事
3. **獨立性**：測試之間不應該有依賴
4. **可重複性**：測試結果應該一致
5. **快速**：單元測試應該在毫秒級完成

### 命名規範

```typescript
// ✅ 好的測試名稱
it('應該拒絕無效的 email 格式')
it('應該在密碼錯誤時返回 401')
it('應該正確解壓縮 ZIP 檔案')

// ❌ 不好的測試名稱
it('測試註冊')
it('test login')
it('檢查錯誤')
```

## Mock 和 Stub

### 何時使用 Mock

- 外部 API 呼叫（S3、資料庫）
- 時間相關的函數
- 隨機數生成
- 檔案系統操作

### 範例

```typescript
import { vi } from 'vitest'
import { S3Client } from '@aws-sdk/client-s3'

// Mock S3 client
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({
    send: vi.fn().mockResolvedValue({ /* mock response */ })
  }))
}))

// Mock 資料庫
vi.mock('~/server/utils/db', () => ({
  query: vi.fn().mockResolvedValue({
    rows: [{ id: '123', email: 'test@example.com' }]
  })
}))
```

## 持續整合 (CI)

所有測試都會在 GitHub Actions 中自動執行：

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:coverage
```

## 常見問題

### Q: 我需要為每個函數都寫測試嗎？

A: 不一定。優先測試：
- 業務邏輯
- 複雜的演算法
- 容易出錯的地方
- 公開的 API

簡單的 getter/setter 或純展示性的程式碼可以跳過。

### Q: 測試寫起來很慢，影響開發速度？

A: 前期可能較慢，但長期來看會加快開發：
- 減少手動測試時間
- 減少 debug 時間
- 增加重構信心
- 減少回歸錯誤

### Q: 如何測試私有函數？

A: 通常不直接測試私有函數，而是透過公開 API 間接測試。如果一個私有函數很複雜，考慮將它提取成獨立模組。

## 資源連結

- [Vitest 官方文檔](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library](https://testing-library.com/)
- [TDD 最佳實踐](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

## 開發規範

### Git Commit 規範

使用 Conventional Commits：

```
<type>(<scope>): <subject>

<body>

<footer>
```

類型：
- `feat`: 新功能
- `fix`: Bug 修復
- `test`: 新增或修改測試
- `refactor`: 重構
- `docs`: 文檔更新
- `style`: 程式碼格式調整
- `chore`: 建構流程或輔助工具變動

範例：
```bash
git commit -m "feat(upload): 實現 ZIP 檔案上傳功能

- 新增 ZIP 檔案解壓縮
- 自動偵測主 HTML 檔案
- 保持目錄結構上傳到 S3
- 測試覆蓋率 92%

Closes #123"
```

---

## 開始開發

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm dev

# 執行測試
pnpm test

# 建構專案
pnpm build
```

讓我們用 TDD 的方式，一步一步建立高品質的應用！🚀
