# 貢獻指南 (Contributing Guide)

> 感謝您對 博幼APP分享平臺 專案的興趣！本文件將引導您如何參與專案開發。

## 📋 目錄

- [行為準則](#行為準則)
- [開始貢獻](#開始貢獻)
- [開發環境設定](#開發環境設定)
- [開發流程](#開發流程)
- [測試驅動開發 (TDD)](#測試驅動開發-tdd)
- [提交規範](#提交規範)
- [Pull Request 流程](#pull-request-流程)
- [程式碼風格](#程式碼風格)
- [測試要求](#測試要求)
- [問題回報](#問題回報)

---

## 行為準則

本專案採用貢獻者公約 (Contributor Covenant)。參與專案即表示您同意遵守以下準則：

- **尊重**: 尊重所有貢獻者，無論其經驗水平
- **友善**: 提供建設性的反饋，避免攻擊性語言
- **專業**: 專注於技術討論，避免人身攻擊
- **包容**: 歡迎來自不同背景的貢獻者

違反行為準則可能導致從專案中移除。

---

## 開始貢獻

### 我可以如何貢獻？

您可以透過以下方式貢獻：

1. **回報 Bug**: 發現問題？請建立 Issue
2. **提出功能建議**: 有好點子？我們很樂意聽聽
3. **改進文檔**: 發現文檔不清楚或有錯誤？請提交 PR
4. **修復 Bug**: 解決現有的 Issue
5. **實作新功能**: 根據 Issue 或功能建議實作功能
6. **改善測試**: 增加測試覆蓋率
7. **優化效能**: 提升系統效能

### 尋找可以著手的 Issue

- 🟢 **good first issue**: 適合新手的簡單任務
- 🔵 **help wanted**: 需要協助的任務
- 🟡 **enhancement**: 功能增強
- 🔴 **bug**: Bug 修復

---

## 開發環境設定

### 前置需求

- **Node.js** 18+ ([下載](https://nodejs.org/))
- **pnpm** 8+ ([安裝](https://pnpm.io/installation))
- **Git** ([下載](https://git-scm.com/))
- **PostgreSQL** (本地開發可選，可使用遠端資料庫)

### 設定步驟

1. **Fork 專案**

   點擊 GitHub 頁面右上角的 "Fork" 按鈕

2. **Clone 到本地**

   ```bash
   git clone https://github.com/YOUR-USERNAME/boyo-app-share.git
   cd boyo-app-share
   ```

3. **新增上游遠端**

   ```bash
   git remote add upstream https://github.com/original-owner/boyo-app-share.git
   ```

4. **安裝依賴**

   ```bash
   pnpm install
   ```

5. **準備 Nuxt 環境**

   ```bash
   pnpm nuxt prepare
   ```

6. **設定環境變數**

   ```bash
   cp .env.example .env
   ```

   編輯 `.env` 檔案，填入您的設定：
   - `DATABASE_URL`: PostgreSQL 連接字串
   - `JWT_SECRET`: 隨機字串 (開發用)
   - `TEBI_*`: S3 設定 (可選，測試上傳功能需要)

7. **執行資料庫遷移** (如果使用本地資料庫)

   ```bash
   psql -U postgres -d your_database -f server/database/schema.sql
   ```

8. **啟動開發伺服器**

   ```bash
   pnpm dev
   ```

   訪問 http://localhost:3000

9. **執行測試**

   ```bash
   pnpm test
   ```

---

## 開發流程

### 1. 同步上游更新

在開始工作前，確保您的 fork 是最新的：

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

### 2. 建立功能分支

```bash
git checkout -b feature/your-feature-name
```

分支命名規範：
- `feature/xxx`: 新功能
- `fix/xxx`: Bug 修復
- `docs/xxx`: 文檔更新
- `refactor/xxx`: 重構
- `test/xxx`: 測試改進

### 3. 開發與測試

遵循 **TDD (測試驅動開發)** 流程（見下一節）

### 4. 提交變更

遵循 [提交規範](#提交規範)

### 5. 推送到您的 Fork

```bash
git push origin feature/your-feature-name
```

### 6. 建立 Pull Request

前往您的 GitHub Fork，點擊 "New Pull Request"

---

## 測試驅動開發 (TDD)

本專案**嚴格遵循 TDD 開發方式**。所有功能都必須先寫測試。

### TDD 三步驟

```
🔴 紅燈 (Red) → 🟢 綠燈 (Green) → 🔵 重構 (Refactor)
```

#### 步驟 1: 🔴 紅燈 - 寫失敗的測試

先寫測試，描述您想要的功能行為：

```typescript
// tests/unit/utils/example.test.ts
import { describe, it, expect } from 'vitest'
import { myFunction } from '~/server/utils/example'

describe('myFunction', () => {
  it('應該返回正確的結果', () => {
    expect(myFunction(5)).toBe(25)
  })
})
```

執行測試，確認測試失敗：

```bash
pnpm test tests/unit/utils/example.test.ts
```

#### 步驟 2: 🟢 綠燈 - 實現功能

寫**最少的程式碼**讓測試通過：

```typescript
// server/utils/example.ts
export function myFunction(n: number): number {
  return n * n
}
```

執行測試，確認測試通過：

```bash
pnpm test tests/unit/utils/example.test.ts
```

#### 步驟 3: 🔵 重構 - 優化程式碼

在測試保護下，改善程式碼品質：
- 消除重複
- 提升可讀性
- 改善命名
- 優化演算法

每次重構後都要執行測試，確保功能不變。

### TDD 最佳實踐

1. **測試先行**: 永遠先寫測試
2. **小步前進**: 一次只測試一個行為
3. **快速迭代**: 紅→綠→重構的週期應該很短（幾分鐘）
4. **保持簡單**: 先求能用，再求完美
5. **測試獨立**: 測試之間不應有依賴

### 範例：實作使用者註冊功能

**步驟 1: 寫測試**

```typescript
// tests/integration/api/auth/register.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import registerHandler from '~/server/api/auth/register.post'

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    // 清理測試資料
    await query('DELETE FROM users WHERE email LIKE $1', ['test%@example.com'])
  })

  it('應該成功註冊新使用者', async () => {
    const event = createMockEvent({
      body: {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      }
    })

    const result = await registerHandler(event)

    expect(result).toHaveProperty('user')
    expect(result).toHaveProperty('token')
    expect(result.user.email).toBe('test@example.com')
  })

  it('應該拒絕重複的 email', async () => {
    // 先建立使用者
    const event1 = createMockEvent({
      body: {
        email: 'duplicate@example.com',
        username: 'user1',
        password: 'password123'
      }
    })
    await registerHandler(event1)

    // 嘗試建立相同 email 的使用者
    const event2 = createMockEvent({
      body: {
        email: 'duplicate@example.com',
        username: 'user2',
        password: 'password123'
      }
    })

    await expect(registerHandler(event2)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('Email')
    })
  })
})
```

**步驟 2: 實現功能**

```typescript
// server/api/auth/register.post.ts
import bcrypt from 'bcrypt'
import { registerSchema } from '~/server/utils/validation'
import { generateToken } from '~/server/utils/jwt'
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 驗證輸入
  const validated = registerSchema.parse(body)

  // 檢查 email 是否已存在
  const existing = await query(
    'SELECT id FROM users WHERE email = $1',
    [validated.email]
  )

  if (existing.rows.length > 0) {
    throw createError({
      statusCode: 400,
      message: 'Email 已被使用'
    })
  }

  // 加密密碼
  const passwordHash = await bcrypt.hash(validated.password, 10)

  // 建立使用者
  const result = await query(
    `INSERT INTO users (email, username, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, email, username, created_at`,
    [validated.email, validated.username, passwordHash]
  )

  const user = result.rows[0]
  const token = generateToken(user.id)

  return { user, token }
})
```

**步驟 3: 重構**

- 提取重複的驗證邏輯
- 改善錯誤訊息
- 優化資料庫查詢

---

## 提交規範

本專案使用 **Conventional Commits** 規範。

### 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 類型

- **feat**: 新功能
- **fix**: Bug 修復
- **docs**: 文檔更新
- **style**: 程式碼格式調整（不影響功能）
- **refactor**: 重構（既非新功能也非 Bug 修復）
- **test**: 新增或修改測試
- **chore**: 建構流程或輔助工具變動
- **perf**: 效能優化

### Scope 範圍（可選）

- `auth`: 認證相關
- `api`: API 相關
- `ui`: UI 組件
- `db`: 資料庫
- `test`: 測試
- `docs`: 文檔
- `ci`: CI/CD

### 範例

**簡單提交**:
```bash
git commit -m "feat(auth): 實作使用者註冊功能"
```

**詳細提交**:
```bash
git commit -m "feat(auth): 實作使用者註冊功能

- 新增 POST /api/auth/register endpoint
- 實作 email 驗證與密碼加密
- 新增註冊整合測試 (7 個測試案例)
- 測試覆蓋率達 95%

Closes #123"
```

### 提交訊息撰寫原則

1. **使用祈使句**: "新增功能" 而非 "新增了功能"
2. **簡潔明瞭**: 主題行不超過 50 個字元
3. **詳細說明**: Body 說明「為什麼」而非「做了什麼」
4. **關聯 Issue**: 使用 `Closes #123` 或 `Fixes #456`

---

## Pull Request 流程

### 提交 PR 前的檢查清單

在提交 Pull Request 前，請確保：

- ✅ 遵循 **TDD 開發方式**（測試先行）
- ✅ **所有測試通過**:
  ```bash
  pnpm test
  pnpm test:e2e
  ```
- ✅ **測試覆蓋率 ≥ 80%**:
  ```bash
  pnpm test:coverage
  ```
- ✅ **無 TypeScript 錯誤**:
  ```bash
  pnpm build
  ```
- ✅ **Commit 訊息符合規範** (Conventional Commits)
- ✅ **程式碼已重構且清晰**
- ✅ **更新相關文檔** (README, API.md 等)
- ✅ **分支從最新的 `main` 分支建立**
- ✅ **解決所有衝突**

### PR 描述模板

提交 PR 時，請使用以下模板：

```markdown
## 📝 變更說明

簡要描述這個 PR 的目的。

## 🎯 相關 Issue

Closes #123

## 📋 變更類型

- [ ] Bug 修復 (fix)
- [ ] 新功能 (feat)
- [ ] 文檔更新 (docs)
- [ ] 重構 (refactor)
- [ ] 測試改進 (test)
- [ ] 其他 (請說明):

## 🧪 測試

- [ ] 新增測試案例
- [ ] 所有測試通過
- [ ] 測試覆蓋率 ≥ 80%

測試統計:
- 新增測試: X 個
- 測試覆蓋率: XX%

## 📸 截圖（如果是 UI 變更）

（貼上截圖或 GIF）

## ✅ 檢查清單

- [ ] 遵循 TDD 開發方式
- [ ] 所有測試通過
- [ ] 無 TypeScript 錯誤
- [ ] Commit 訊息符合規範
- [ ] 更新相關文檔
- [ ] 自我審查程式碼

## 💬 額外說明

（任何需要 reviewer 注意的事項）
```

### Code Review 流程

1. **提交 PR** 後，至少需要一位 maintainer 審查
2. **回應反饋**: 及時回應 reviewer 的意見
3. **修改程式碼**: 根據反饋進行修改
4. **標記為 Resolved**: 修改完成後標記討論為已解決
5. **等待合併**: 通過審查後，maintainer 會合併您的 PR

### 常見 Review 意見

- **測試不足**: 需要增加更多測試案例
- **測試覆蓋率低**: 需要提升覆蓋率到 80% 以上
- **沒有遵循 TDD**: 請先寫測試再實作功能
- **程式碼重複**: 需要重構消除重複
- **命名不清楚**: 需要改善變數/函數命名
- **缺少文檔**: 需要更新相關文檔
- **Commit 訊息不規範**: 需要調整 commit 訊息格式

---

## 程式碼風格

### TypeScript

- 使用 **嚴格模式** (`strict: true`)
- 避免使用 `any`，使用具體型別
- 使用 `interface` 定義物件結構
- 使用 `type` 定義聯合型別或交叉型別

範例：
```typescript
// ✅ 好
interface User {
  id: string
  email: string
  username: string
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ 不好
function getUser(id: any): any {
  // ...
}
```

### 命名規範

- **變數/函數**: camelCase (`getUserById`, `isValid`)
- **類別/介面**: PascalCase (`User`, `ApiResponse`)
- **常數**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRY`)
- **檔案名稱**: kebab-case (`user-service.ts`, `auth.test.ts`)

### 函數設計

- **單一職責**: 一個函數只做一件事
- **純函數優先**: 避免副作用
- **小函數**: 一個函數不超過 20 行（除非有充分理由）
- **明確參數**: 避免布林參數，使用具名物件

範例：
```typescript
// ✅ 好
interface CreateUserOptions {
  sendEmail: boolean
  verifyEmail: boolean
}

async function createUser(
  userData: UserData,
  options: CreateUserOptions
): Promise<User> {
  // ...
}

// ❌ 不好
async function createUser(
  userData: UserData,
  sendEmail: boolean,
  verifyEmail: boolean
): Promise<User> {
  // ...
}
```

### 註解規範

- **程式碼應自我說明**: 優先使用清晰的命名，減少註解
- **必要時加註解**: 解釋「為什麼」而非「做什麼」
- **保持更新**: 修改程式碼時同步更新註解

範例：
```typescript
// ✅ 好 - 解釋為什麼
// 使用 bcrypt 加密密碼，成本因子設為 10 平衡安全性與效能
const passwordHash = await bcrypt.hash(password, 10)

// ❌ 不好 - 只是重複程式碼
// 加密密碼
const passwordHash = await bcrypt.hash(password, 10)
```

---

## 測試要求

### 測試覆蓋率標準

- **整體覆蓋率**: ≥ 80%
- **核心業務邏輯**: ≥ 90%
- **工具函數**: 100%
- **API Endpoints**: ≥ 90%

### 測試分類

#### 1. 單元測試 (Unit Tests)

測試單一函數或類別的行為。

**範例**:
```typescript
// tests/unit/utils/mime.test.ts
import { describe, it, expect } from 'vitest'
import { getMimeType } from '~/server/utils/mime'

describe('getMimeType', () => {
  it('應該正確識別 HTML 檔案', () => {
    expect(getMimeType('index.html')).toBe('text/html')
  })

  it('應該正確識別 CSS 檔案', () => {
    expect(getMimeType('style.css')).toBe('text/css')
  })

  it('應該對未知類型返回預設值', () => {
    expect(getMimeType('unknown.xyz')).toBe('application/octet-stream')
  })
})
```

#### 2. 整合測試 (Integration Tests)

測試多個模組協作的行為。

**範例**:
```typescript
// tests/integration/api/auth/login.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import loginHandler from '~/server/api/auth/login.post'

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // 準備測試資料
    await createTestUser({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('應該成功登入並返回 token', async () => {
    const event = createMockEvent({
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    })

    const result = await loginHandler(event)

    expect(result).toHaveProperty('user')
    expect(result).toHaveProperty('token')
  })
})
```

#### 3. E2E 測試 (End-to-End Tests)

測試完整的使用者流程。

**範例**:
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('使用者註冊流程', async ({ page }) => {
  await page.goto('/register')

  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="username"]', 'testuser')
  await page.fill('[name="password"]', 'password123')

  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/')
  await expect(page.locator('text=testuser')).toBeVisible()
})
```

### 測試原則

1. **AAA 模式**: Arrange（準備）→ Act（執行）→ Assert（驗證）
2. **獨立性**: 測試之間不應有依賴
3. **可重複性**: 測試結果應該一致
4. **明確命名**: 測試名稱應清楚描述測試情境
5. **快速執行**: 單元測試應在毫秒級完成

### Mock 使用

適當使用 Mock 隔離外部依賴：

```typescript
import { vi } from 'vitest'

// Mock S3 Client
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({
    send: vi.fn().mockResolvedValue({ /* mock response */ })
  }))
}))
```

---

## 問題回報

### 回報 Bug

使用 GitHub Issues 回報 Bug，請提供：

1. **清楚的標題**: 簡潔描述問題
2. **重現步驟**: 詳細列出如何重現問題
3. **預期行為**: 應該發生什麼
4. **實際行為**: 實際發生了什麼
5. **環境資訊**: Node.js 版本、作業系統等
6. **錯誤訊息**: 完整的錯誤堆疊
7. **截圖**: 如果適用

### 功能建議

提出新功能建議時，請說明：

1. **動機**: 為什麼需要這個功能
2. **使用場景**: 誰會使用、如何使用
3. **替代方案**: 是否考慮過其他方法
4. **額外資訊**: 任何相關的參考資料

---

## 常見問題

### Q: 我不熟悉 TDD，可以參與嗎？

A: 當然可以！我們歡迎所有貢獻者。您可以：
- 從簡單的任務開始（標記為 `good first issue`）
- 參考現有的測試案例學習
- 閱讀 [CLAUDE.md](./CLAUDE.md) 了解 TDD 開發方式
- 在 PR 中詢問，我們會提供協助

### Q: 我應該從哪裡開始？

A: 建議從以下著手：
1. 瀏覽 [Issues](https://github.com/your-repo/issues)
2. 尋找標記為 `good first issue` 或 `help wanted` 的 Issue
3. 回報您發現的 Bug
4. 改進文檔中不清楚的部分

### Q: 我的 PR 被拒絕了，怎麼辦？

A: 不要氣餒！這很正常：
1. 仔細閱讀 reviewer 的反饋
2. 詢問不清楚的地方
3. 根據建議修改程式碼
4. 重新提交審查

### Q: 測試一直失敗怎麼辦？

A: 試試以下步驟：
1. 確認所有依賴都已安裝 (`pnpm install`)
2. 檢查環境變數是否正確設定
3. 執行單一測試檔案進行除錯
4. 查看錯誤訊息，使用 `console.log` 除錯
5. 參考類似的測試案例
6. 在 Issue 或 PR 中尋求協助

---

## 資源連結

- [README.md](./README.md) - 專案說明
- [CLAUDE.md](./CLAUDE.md) - TDD 開發指南
- [API.md](./docs/API.md) - API 文檔
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - 部署指南
- [Issues](https://github.com/your-repo/issues) - 問題追蹤
- [Discussions](https://github.com/your-repo/discussions) - 討論區

---

## 感謝

感謝所有貢獻者對本專案的支持！每一個貢獻，無論大小，都讓專案變得更好。

如果您有任何問題，歡迎在 [Discussions](https://github.com/your-repo/discussions) 發問，或直接在 Issue 中提問。

Happy Coding! 🚀
