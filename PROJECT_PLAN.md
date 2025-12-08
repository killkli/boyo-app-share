# AI App Share - 單頁 HTML App 快速分享平台

## 專案概述

一個讓使用者可以快速上傳、分享、瀏覽單頁 HTML 應用的平台。使用者可以透過**剪貼簿貼上**、**上傳 HTML 檔案**或**上傳壓縮檔（含 assets）**的方式分享他們的 HTML App，並透過簡單的 metadata（標籤、分類）進行快速搜尋和管理。

### 核心概念
- **快速分享**：三種上傳方式，讓分享變得超級簡單
- **靈活管理**：簡單的 metadata 管理，快速分類和搜尋
- **即時預覽**：安全的沙盒環境預覽 HTML App
- **社群互動**：評分、評論、收藏功能

---

## 技術架構

### 前端技術棧
- **框架**: Next.js 14+ (App Router)
  - 優點：SEO 友善、SSR/SSG、API Routes
  - 免費部署：Vercel
- **UI 框架**: React 18+
- **樣式**: TailwindCSS + shadcn/ui
  - 快速開發、一致的設計系統
- **狀態管理**: React Context + Hooks (簡單場景) / Zustand (複雜狀態)
- **表單處理**: React Hook Form + Zod
- **程式碼編輯器**: Monaco Editor (用於編輯 HTML)
- **Markdown 渲染**: react-markdown (教學說明)

### 後端技術棧
- **BaaS**: Supabase (免費額度)
  - PostgreSQL 數據庫
  - 認證系統 (Auth)
  - 檔案存儲 (Storage)
  - 即時訂閱 (Realtime)
  - Row Level Security (RLS)
- **API**: Next.js API Routes
- **檔案存儲**: Supabase Storage (免費 1GB)

### DevOps & 工具
- **版本控制**: Git + GitHub
- **CI/CD**: Vercel 自動部署
- **監控**: Vercel Analytics (免費)
- **錯誤追蹤**: Sentry (免費額度)
- **開發工具**:
  - TypeScript
  - ESLint + Prettier
  - Husky (git hooks)

### 免費服務額度
| 服務 | 免費額度 |
|------|---------|
| Vercel | 100GB 頻寬/月 |
| Supabase | 500MB 數據庫、1GB 存儲、50GB 頻寬 |
| GitHub | 無限公開/私有倉庫 |

---

## 核心功能設計

### 1. 使用者系統
- ✅ 註冊/登入 (Email + 社交登入)
- ✅ 個人資料管理
- ✅ 我的作品集
- ✅ 收藏/書籤功能

### 2. APP 上傳與管理
**三種上傳方式**：
- ✅ **剪貼簿貼上**：直接貼上 HTML 程式碼，快速建立 App
- ✅ **上傳 HTML 檔案**：上傳單個 .html 檔案
- ✅ **上傳壓縮檔**：上傳 .zip 檔案（包含 HTML 和相關 assets：CSS、JS、圖片等）

**管理功能**：
- ✅ 線上編輯器 (Monaco Editor)：編輯已上傳的 HTML
- ✅ 即時預覽：安全沙盒環境預覽
- ✅ Metadata 設定：標題、描述、分類、標籤
- ✅ 公開/私有設定
- ✅ 刪除/編輯權限
- ✅ 縮圖自動生成或手動上傳

### 3. 快速搜尋與分類
**強大的搜尋功能**：
- ✅ **全文搜尋**：搜尋標題、描述、標籤
- ✅ **分類瀏覽**：預設分類（工具、遊戲、教學、動畫、測試等）+ 自訂分類
- ✅ **標籤系統**：多標籤支援，快速篩選
- ✅ **組合篩選**：分類 + 標籤 + 關鍵字同時篩選
- ✅ **排序選項**：最新、最熱門、評分最高、瀏覽最多
- ✅ **我的收藏**：快速找到收藏的 App

### 4. 互動功能
- ✅ 評分系統 (1-5 星)
- ✅ 評論/留言
- ✅ 點讚/收藏數
- ✅ 分享連結
- ✅ 嵌入代碼 (iframe)

### 5. APP 預覽
- ✅ Sandbox 執行環境 (iframe with sandbox)
- ✅ 全螢幕模式
- ✅ 響應式預覽 (桌面/平板/手機)

---

## 數據庫設計

### Tables

#### users (Supabase Auth 擴展)
```sql
- id: uuid (primary key)
- email: string
- username: string (unique)
- avatar_url: string
- bio: text
- created_at: timestamp
- updated_at: timestamp
```

#### apps
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key -> users)
- title: string
- description: text
- category: string
- tags: string[]

-- 上傳方式與檔案儲存
- upload_type: enum ('paste', 'file', 'zip')  # 上傳方式
- html_s3_key: text                            # 主 HTML 檔案的 S3 key
- assets_s3_prefix: text                       # 壓縮檔案解壓後的 S3 路徑前綴
- file_manifest: jsonb                         # 檔案清單 {files: [{path, size, type}]}

-- Metadata
- thumbnail_url: string
- is_public: boolean
- view_count: integer
- like_count: integer

- created_at: timestamp
- updated_at: timestamp
```

#### ratings
```sql
- id: uuid (primary key)
- app_id: uuid (foreign key -> apps)
- user_id: uuid (foreign key -> users)
- rating: integer (1-5)
- created_at: timestamp
- unique(app_id, user_id)
```

#### comments
```sql
- id: uuid (primary key)
- app_id: uuid (foreign key -> apps)
- user_id: uuid (foreign key -> users)
- content: text
- created_at: timestamp
- updated_at: timestamp
```

#### favorites
```sql
- id: uuid (primary key)
- app_id: uuid (foreign key -> apps)
- user_id: uuid (foreign key -> users)
- created_at: timestamp
- unique(app_id, user_id)
```

---

## 專案結構

```
ai-app-share/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 認證相關頁面
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (main)/            # 主要頁面
│   │   │   ├── page.tsx       # 首頁
│   │   │   ├── explore/       # 探索頁面
│   │   │   ├── app/[id]/      # APP 詳情
│   │   │   ├── create/        # 創建 APP
│   │   │   ├── edit/[id]/     # 編輯 APP
│   │   │   └── profile/[username]/  # 使用者頁面
│   │   ├── api/               # API Routes
│   │   │   ├── apps/
│   │   │   ├── ratings/
│   │   │   └── comments/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                # shadcn/ui 組件
│   │   ├── layout/            # Layout 組件
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── app/               # APP 相關組件
│   │   │   ├── AppCard.tsx
│   │   │   ├── AppPreview.tsx
│   │   │   ├── AppEditor.tsx
│   │   │   └── AppGrid.tsx
│   │   ├── editor/            # 編輯器組件
│   │   │   ├── CodeEditor.tsx
│   │   │   └── PreviewPane.tsx
│   │   └── common/            # 通用組件
│   │       ├── Rating.tsx
│   │       └── Comments.tsx
│   ├── lib/
│   │   ├── supabase/          # Supabase 客戶端
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── utils.ts           # 工具函數
│   │   └── constants.ts       # 常量
│   ├── hooks/                 # 自定義 Hooks
│   │   ├── useAuth.ts
│   │   ├── useApps.ts
│   │   └── useComments.ts
│   ├── types/                 # TypeScript 類型
│   │   ├── database.ts
│   │   └── app.ts
│   └── styles/
│       └── globals.css
├── public/
│   ├── images/
│   └── icons/
├── supabase/
│   ├── migrations/            # 數據庫遷移
│   └── seed.sql              # 初始數據
├── .env.local                # 環境變數
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 實施階段

### 階段 1: 專案初始化 (1-2 天)
**目標**: 建立開發環境和基礎架構

**任務**:
- [x] 初始化 Next.js 專案
- [ ] 設定 TypeScript + ESLint + Prettier
- [ ] 安裝 TailwindCSS + shadcn/ui
- [ ] 設定 Supabase 專案
- [ ] 配置環境變數
- [ ] 建立 Git 倉庫

**成功標準**:
- 開發伺服器正常運行
- Supabase 連接成功
- 基本頁面架構完成

---

### 階段 2: 認證系統 (2-3 天)
**目標**: 實現使用者註冊、登入、登出功能

**任務**:
- [ ] Supabase Auth 設定
- [ ] 登入/註冊頁面 UI
- [ ] useAuth Hook
- [ ] 受保護路由
- [ ] 個人資料頁面

**成功標準**:
- 使用者可以註冊和登入
- Session 持久化
- 受保護頁面正常工作

---

### 階段 3: APP 創建與上傳 (3-4 天)
**目標**: 實現三種上傳方式和 metadata 管理

**任務**:
- [ ] 數據庫 schema (apps table with upload_type)
- [ ] **方式 1：剪貼簿貼上**
  - [ ] Monaco Editor 整合
  - [ ] 即時預覽功能
  - [ ] 直接保存 HTML 到 S3
- [ ] **方式 2：上傳 HTML 檔案**
  - [ ] 檔案上傳組件
  - [ ] 檔案驗證（大小、類型）
  - [ ] 上傳到 S3
- [ ] **方式 3：上傳壓縮檔**
  - [ ] ZIP 檔案上傳
  - [ ] 伺服器端解壓縮
  - [ ] 多檔案上傳到 S3（保持目錄結構）
  - [ ] 自動偵測主 HTML 檔案
- [ ] Metadata 表單（標題、描述、分類、標籤）
- [ ] 縮圖生成/上傳

**成功標準**:
- 三種上傳方式都能正常工作
- 壓縮檔能正確解壓並保持檔案結構
- Metadata 正確儲存
- 即時預覽功能正常

---

### 階段 4: APP 展示與快速搜尋 (2-3 天)
**目標**: 實現強大的搜尋、分類和瀏覽功能

**任務**:
- [ ] 首頁（精選 APP、最新 APP、熱門 APP）
- [ ] 探索頁面（所有 APP with 篩選器）
- [ ] APP 詳情頁面
- [ ] Sandbox 預覽（iframe with assets 支援）
- [ ] **搜尋與分類系統**
  - [ ] 全文搜尋（標題、描述、標籤）
  - [ ] 分類篩選（下拉選單 + 快速按鈕）
  - [ ] 標籤雲 + 多選標籤
  - [ ] 組合篩選（分類 + 標籤 + 關鍵字）
  - [ ] 排序功能（最新、熱門、評分、瀏覽）
- [ ] 搜尋結果高亮顯示

**成功標準**:
- 可以快速找到想要的 APP
- 搜尋響應速度 < 500ms
- 篩選器組合正常工作
- Sandbox 能正確載入 ZIP 上傳的多檔案 App

---

### 階段 5: 互動功能 (2-3 天)
**目標**: 評分、評論、收藏功能

**任務**:
- [ ] 評分系統 (ratings table)
- [ ] 評論系統 (comments table)
- [ ] 收藏功能 (favorites table)
- [ ] 點讚計數
- [ ] 瀏覽次數統計

**成功標準**:
- 可以評分和評論
- 收藏功能正常
- 統計數據正確顯示

---

### 階段 6: 優化與部署 (1-2 天)
**目標**: 性能優化和正式上線

**任務**:
- [ ] SEO 優化 (metadata)
- [ ] 圖片優化
- [ ] 程式碼分割
- [ ] 錯誤處理
- [ ] Vercel 部署
- [ ] 域名設定 (可選)

**成功標準**:
- Lighthouse 分數 > 90
- 成功部署到 Vercel
- 無明顯 bug

---

## 安全考量

### Sandbox 安全
```html
<iframe
  sandbox="allow-scripts allow-same-origin"
  src="/preview/[app-id]"
  style="width: 100%; height: 100%;"
></iframe>
```

### Content Security Policy
- 限制外部資源載入
- 防止 XSS 攻擊

### Row Level Security (Supabase)
- 使用者只能編輯自己的 APP
- 公開/私有權限控制

### Input Validation
- Zod schema 驗證
- 檔案大小限制 (< 5MB)
- HTML sanitization (DOMPurify)

---

## 未來擴展功能

### V2.0
- [ ] APP 分叉 (Fork)：複製他人的 App 並修改
- [ ] 版本歷史：追蹤 App 的修改記錄
- [ ] APP 模板市場：提供常用模板快速開始
- [ ] 批量匯出：將多個 App 打包下載
- [ ] 進階搜尋：支援正則表達式、程式碼內容搜尋
- [ ] 集合功能：建立 App 集合/播放清單

### V3.0
- [ ] AI 輔助：自動生成 App 描述、標籤建議
- [ ] 協作編輯：多人即時編輯同一個 App
- [ ] 社群論壇：討論區、教學分享
- [ ] App 內嵌編輯器：在預覽頁面直接編輯並 Fork
- [ ] CDN 加速：自動優化 assets 載入速度
- [ ] 付費訂閱：進階功能（更大儲存空間、私有 App 數量等）

---

## 預估成本 (前期免費)

### 免費階段 (0-1000 使用者)
- Vercel: $0
- Supabase: $0
- 域名: ~$10/年 (可選)

### 成長階段 (1000-10000 使用者)
- Supabase Pro: $25/月
- Vercel Pro: $20/月
- CDN: 可能需要

---

## 開發時間估算

- **MVP (階段 1-4)**: 2-3 週
- **完整版 (階段 1-6)**: 3-4 週
- **持續優化**: 持續進行

---

## 下一步行動

1. **立即開始**: 初始化 Next.js 專案
2. **設定環境**: Supabase 帳號和專案
3. **建立 UI 設計**: 簡單的線框圖或 Figma
4. **開始編碼**: 從階段 1 開始

