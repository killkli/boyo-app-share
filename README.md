# AI App Share

> 單頁 HTML App 快速分享平台

一個讓使用者可以快速上傳、分享、瀏覽單頁 HTML 應用的平台。使用者可以透過**剪貼簿貼上**、**上傳 HTML 檔案**或**上傳壓縮檔（含 assets）**的方式分享他們的 HTML App。

## 核心功能

### 🚀 三種上傳方式
- **剪貼簿貼上**：直接貼上 HTML 程式碼，快速建立 App
- **上傳 HTML 檔案**：上傳單個 .html 檔案
- **上傳壓縮檔**：上傳 .zip 檔案（包含 HTML 和相關 assets：CSS、JS、圖片等）

### 🔍 快速搜尋與分類
- 全文搜尋（標題、描述、標籤）
- 分類瀏覽（工具、遊戲、教學、動畫、測試等）
- 多標籤組合篩選
- 多種排序方式（最新、熱門、評分、瀏覽）

### 👥 社群互動
- 評分系統（1-5 星）
- 評論留言
- 收藏功能
- 分享連結

### 🛡️ 安全預覽
- Sandbox 環境執行 HTML App
- 防止 XSS 攻擊
- 內容安全策略 (CSP)

## 技術架構

### 前端 + 後端
- **框架**: [Nuxt.js 3](https://nuxt.com/) - Vue.js 全端框架
- **UI**: [TailwindCSS](https://tailwindcss.com/) + [shadcn-vue](https://www.shadcn-vue.com/)
- **測試**: [Vitest](https://vitest.dev/)
- **部署**: [Cloudflare Pages](https://pages.cloudflare.com/)

### 資料庫
- **PostgreSQL** on [Zeabur](https://zeabur.com/)

### 檔案儲存
- **Tebi S3** - S3 相容的物件儲存

## 開始使用

### 環境需求

- Node.js 18+
- pnpm 8+

### 安裝

```bash
# 克隆專案
git clone https://github.com/your-username/ai-app-share.git
cd ai-app-share

# 安裝依賴
pnpm install

# 準備 Nuxt 環境
pnpm nuxt prepare

# 複製環境變數檔案
cp .env.example .env
```

### 環境變數設定

編輯 `.env` 檔案：

```bash
# Database (Zeabur PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT Secret
JWT_SECRET=your-super-secret-key-change-in-production

# Tebi S3
TEBI_ENDPOINT=https://s3.tebi.io
TEBI_ACCESS_KEY=your-access-key
TEBI_SECRET_KEY=your-secret-key
TEBI_BUCKET=ai-app-share

# Public
NUXT_PUBLIC_S3_BASE_URL=https://s3.tebi.io/ai-app-share
```

### 開發

```bash
# 啟動開發伺服器
pnpm dev

# 訪問 http://localhost:3000
```

### 測試

```bash
# 執行所有測試
pnpm test

# 監聽模式（開發時使用）
pnpm test --watch

# 測試覆蓋率
pnpm test:coverage

# UI 介面
pnpm test:ui
```

### 建構

```bash
# 建構生產版本
pnpm build

# 本地預覽建構結果
pnpm preview
```

## 開發方法論

本專案採用 **測試驅動開發 (TDD)** 方式開發，詳細說明請參閱 [CLAUDE.md](./CLAUDE.md)。

### TDD 工作流程

```
紅燈 → 綠燈 → 重構
(Red) → (Green) → (Refactor)
```

1. **紅燈**: 先寫測試，描述想要的功能行為
2. **綠燈**: 寫最少的程式碼讓測試通過
3. **重構**: 在測試保護下，改善程式碼品質

### 測試範例

```typescript
// tests/unit/utils/mime.test.ts
import { describe, it, expect } from 'vitest'
import { getMimeType } from '~/server/utils/mime'

describe('getMimeType', () => {
  it('應該正確識別 HTML 檔案', () => {
    expect(getMimeType('index.html')).toBe('text/html')
  })
})
```

## 專案結構

```
ai-app-share/
├── .nuxt/                    # Nuxt 建構輸出
├── assets/                   # 需編譯的資源
│   └── css/
├── components/               # Vue 組件
│   ├── ui/                   # shadcn-vue 組件
│   ├── app/                  # App 相關組件
│   └── layout/               # Layout 組件
├── composables/              # Vue Composables
├── layouts/                  # Nuxt Layouts
├── pages/                    # Nuxt Pages (檔案路由)
├── public/                   # 靜態資源
├── server/                   # Nuxt Server (後端)
│   ├── api/                  # API Routes
│   ├── middleware/           # Server Middleware
│   └── utils/                # Server Utils
├── tests/                    # 測試檔案
│   ├── unit/                 # 單元測試
│   ├── integration/          # 整合測試
│   └── e2e/                  # E2E 測試
├── types/                    # TypeScript 類型定義
├── .env.example              # 環境變數範例
├── CLAUDE.md                 # TDD 開發指南
├── nuxt.config.ts            # Nuxt 配置
├── tailwind.config.ts        # Tailwind 配置
├── vitest.config.ts          # Vitest 配置
└── README.md                 # 本檔案
```

## 部署

### Cloudflare Pages

```bash
# 建構專案
pnpm build

# 部署到 Cloudflare Pages
npx wrangler pages deploy .output/public
```

或使用 GitHub 整合自動部署。

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
- 測試覆蓋率 92%"
```

## 相關文檔

- [專案規劃](./PROJECT_PLAN.md) - 完整的專案規劃和實施階段
- [架構設計](./ARCHITECTURE_DESIGN.md) - 詳細的技術架構設計
- [技術棧](./TECH_STACK.md) - 技術選型說明
- [TDD 開發指南](./CLAUDE.md) - 測試驅動開發方法論

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！

請確保：
1. 遵循 TDD 開發方式
2. 測試覆蓋率 ≥ 80%
3. 程式碼通過 ESLint 檢查
4. Commit message 遵循規範

---

**快速開始開發**

```bash
pnpm install
pnpm dev
pnpm test
```

讓我們用 TDD 的方式，一步一步建立高品質的應用！🚀
