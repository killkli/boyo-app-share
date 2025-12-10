# 實作計劃：功能改進

## 概述

本計劃實現兩個主要功能改進：
1. **多作者連結功能**：為創作者添加可選的個人連結（如個人網站、社群媒體等）
2. **SEO 優化與 Sitemap**：提升 APP 詳情頁與探索頁面的搜尋引擎可見度

---

## Stage 1: 資料庫 Schema 更新（創作者連結支援）

**Goal**: 擴展 `app_creators` 表以支援創作者連結

**Success Criteria**:
- `app_creators` 表新增 `creator_link` 欄位
- 支援可選的 URL 連結
- 驗證 URL 格式
- 向後相容（現有創作者無連結也能正常運作）

**Database Migration**:
```sql
-- 003_add_creator_links.sql
-- 添加創作者連結欄位
ALTER TABLE app_creators
ADD COLUMN creator_link VARCHAR(500);

-- 添加註解
COMMENT ON COLUMN app_creators.creator_link IS '創作者個人連結（可選，如個人網站、社群媒體等）';

-- 添加檢查約束（確保是有效的 URL 格式或為空）
ALTER TABLE app_creators
ADD CONSTRAINT check_creator_link_format
CHECK (
  creator_link IS NULL
  OR creator_link = ''
  OR creator_link ~ '^https?://.+'
);
```

**Tests**:
- [ ] Migration 可以成功執行
- [ ] 可以插入帶有連結的創作者
- [ ] 可以插入不帶連結的創作者（向後相容）
- [ ] URL 格式驗證正常運作（拒絕無效 URL）
- [ ] 空字串和 NULL 都能正常處理
- [ ] 現有資料不受影響

**Implementation**:
- [x] 建立 `server/database/migrations/003_add_creator_links.sql`
- [x] 更新資料庫 schema
- [x] 執行 migration 測試

**Status**: ✅ Completed

---

## Stage 2: 創作者連結 API 支援

**Goal**: 更新 API 和工具函數以支援創作者連結

**Success Criteria**:
- `creators.ts` 工具函數支援 `CreatorWithLink` 類型
- POST/PUT API 支援 `creators` 物件陣列（包含 name 和 link）
- GET API 返回完整的創作者資訊（name + link）
- URL 驗證和清理
- 向後相容（支援純字串陣列）

**Type Definitions**:
```typescript
// server/types/creator.ts
export interface CreatorWithLink {
  name: string
  link?: string  // 可選連結
}

export type CreatorInput = string | CreatorWithLink
```

**API Changes**:

### POST /api/apps
```typescript
{
  creators?: Array<string | CreatorWithLink>
  // 範例1: ["Alice", "Bob"]  (向後相容)
  // 範例2: [
  //   { name: "Alice", link: "https://alice.com" },
  //   { name: "Bob" }  // Bob 沒有連結
  // ]
}
```

### PUT /api/apps/[id]
```typescript
{
  creators?: Array<string | CreatorWithLink>
}
```

### Response 格式
```typescript
{
  app: {
    // ... 現有欄位
    creators: Array<CreatorWithLink>  // 統一返回物件格式
  }
}
```

**Validation Schema**:
```typescript
// server/schemas/app.ts
import { z } from 'zod'

const creatorSchema = z.union([
  z.string().max(100, '創作者名稱最多 100 個字元'),
  z.object({
    name: z.string().max(100, '創作者名稱最多 100 個字元'),
    link: z.string().url('請提供有效的 URL').max(500, 'URL 最多 500 個字元').optional()
  })
])

export const creatorsArraySchema = z.array(creatorSchema)
  .max(10, '創作者最多 10 個')
  .optional()
```

**Helper Functions Update**:
```typescript
// server/utils/creators.ts

/**
 * 標準化創作者輸入（支援字串或物件）
 */
function normalizeCreatorInput(input: CreatorInput): CreatorWithLink {
  if (typeof input === 'string') {
    return { name: input.trim() }
  }
  return {
    name: input.name.trim(),
    link: input.link?.trim() || undefined
  }
}

/**
 * 保存 APP 的創作者列表（支援連結）
 */
export async function saveAppCreators(
  appId: string,
  creators: CreatorInput[]
): Promise<void>

/**
 * 獲取 APP 的創作者列表（返回完整物件）
 */
export async function getAppCreators(
  appId: string
): Promise<CreatorWithLink[]>
export async function getAppCreators(
  appIds: string[]
): Promise<Record<string, CreatorWithLink[]>>
```

**Tests**:
- [ ] 可以創建帶有連結的創作者
- [ ] 可以創建不帶連結的創作者
- [ ] 可以混合使用字串和物件格式（向後相容）
- [ ] URL 驗證拒絕無效的連結
- [ ] 空連結被正確處理（儲存為 NULL）
- [ ] GET API 正確返回創作者物件陣列
- [ ] 批量查詢正常運作
- [ ] 更新創作者時連結正確更新

**Implementation**:
- [ ] 建立 `server/types/creator.ts`
- [ ] 更新 `server/utils/creators.ts`
- [ ] 更新所有 validation schemas
- [ ] 更新 POST /api/apps
- [ ] 更新 PUT /api/apps/[id]
- [ ] 更新 PUT /api/apps/[id]/reupload
- [ ] 更新所有 GET APIs
- [ ] 編寫整合測試

**Status**: 🔄 Not Started

---

## Stage 3: 前端 UI 更新（創作者連結輸入）

**Goal**: 更新前端表單和顯示組件以支援創作者連結

**Success Criteria**:
- `CreatorInput.vue` 支援連結輸入
- 創建/編輯頁面支援連結輸入
- APP 詳情頁和探索頁正確顯示連結
- 連結以可點擊方式呈現（新分頁開啟）
- URL 驗證和使用者友好的錯誤提示

**Components to Update**:

### 1. `components/common/CreatorInput.vue` (更新)
新增每個創作者的連結輸入欄位：
```typescript
// Props
interface Creator {
  name: string
  link?: string
}

// v-model 綁定
const modelValue = defineModel<Creator[]>()

// UI 結構
// [創作者名稱] [連結 (可選)] [刪除]
```

功能要求：
- 為每個創作者添加可選的連結輸入框
- URL 即時驗證（輸入時檢查格式）
- 清晰的 placeholder（如："https://example.com"）
- 連結為空時不顯示錯誤
- 連結輸入框可摺疊/展開（UX 優化）

### 2. `pages/create.vue` (更新)
- 使用更新後的 `CreatorInput` 組件
- 提交時轉換為正確的 API 格式
- 表單驗證

### 3. `pages/edit/[id].vue` (更新)
- 載入現有創作者資料（含連結）
- 使用更新後的 `CreatorInput` 組件
- 更新時正確處理連結欄位

### 4. `pages/app/[id].vue` (更新)
顯示創作者及其連結：
```vue
<div class="creators">
  <div v-for="creator in app.creators" :key="creator.name">
    <Avatar :name="creator.name" />
    <span>{{ creator.name }}</span>
    <a
      v-if="creator.link"
      :href="creator.link"
      target="_blank"
      rel="noopener noreferrer"
      class="creator-link"
    >
      <ExternalLink class="w-4 h-4" />
    </a>
  </div>
</div>
```

### 5. `pages/explore.vue` (更新)
- 在 APP 卡片上顯示創作者
- 如有連結，顯示為可點擊圖示

**Implementation**:
- [ ] 更新 `components/common/CreatorInput.vue`
  - [ ] 添加連結輸入欄位
  - [ ] 實作 URL 驗證
  - [ ] 改善 UX（摺疊、提示等）
- [ ] 更新 `pages/create.vue`
- [ ] 更新 `pages/edit/[id].vue`
- [ ] 更新 `pages/app/[id].vue`
- [ ] 更新 `pages/explore.vue`
- [ ] 添加或更新 icon 組件（ExternalLink）
- [ ] 確保符合 Brutalist 設計風格

**Tests** (Manual/E2E):
- [ ] 可以在創建表單中添加帶連結的創作者
- [ ] 可以在創建表單中添加不帶連結的創作者
- [ ] 可以在編輯表單中修改創作者連結
- [ ] APP 詳情頁正確顯示創作者連結
- [ ] 點擊連結在新分頁開啟
- [ ] 探索頁面正確顯示創作者連結
- [ ] URL 驗證錯誤提示清晰

**Status**: 🔄 Not Started

---

## Stage 4: SEO 優化（Meta Tags）

**Goal**: 為 APP 詳情頁和探索頁面添加完整的 SEO meta tags

**Success Criteria**:
- 動態生成頁面 title 和 description
- Open Graph (OG) tags 支援社群媒體分享預覽
- Twitter Card tags
- Structured Data (JSON-LD) for rich snippets
- 正確的 canonical URLs
- 響應式 meta viewport

**Implementation Areas**:

### 1. `pages/app/[id].vue` - APP 詳情頁 SEO

**Meta Tags 結構**:
```typescript
// 使用 Nuxt 3 useHead composable
useHead({
  title: `${app.title} - ${config.public.appName}`,
  meta: [
    // 基本 meta
    { name: 'description', content: app.description || `查看 ${app.title} - 由 ${creators} 創作` },
    { name: 'keywords', content: `${app.tags?.join(', ')}, HTML App, 教育應用` },

    // Open Graph
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: app.title },
    { property: 'og:description', content: app.description },
    { property: 'og:image', content: app.thumbnailUrl },
    { property: 'og:url', content: `https://yoursite.com/app/${app.id}` },

    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: app.title },
    { name: 'twitter:description', content: app.description },
    { name: 'twitter:image', content: app.thumbnailUrl },
  ],
  link: [
    { rel: 'canonical', href: `https://yoursite.com/app/${app.id}` }
  ]
})

// Structured Data (JSON-LD)
useSchemaOrg([
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': app.title,
    'description': app.description,
    'image': app.thumbnailUrl,
    'author': creators.map(c => ({
      '@type': 'Person',
      'name': c.name,
      'url': c.link
    })),
    'datePublished': app.createdAt,
    'applicationCategory': 'EducationalApplication',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'TWD'
    }
  }
])
```

### 2. `pages/explore.vue` - 探索頁面 SEO

**Meta Tags 結構**:
```typescript
useHead({
  title: `探索應用 - ${config.public.appName}`,
  meta: [
    { name: 'description', content: '探索博幼 APP 分享平臺上的所有教育應用，發現適合您的互動學習工具' },
    { name: 'keywords', content: config.public.appKeywords },

    // Open Graph
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: '探索應用' },
    { property: 'og:description', content: '探索博幼 APP 分享平臺上的所有教育應用' },
    { property: 'og:url', content: 'https://yoursite.com/explore' },

    // Twitter Card
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: '探索應用' },
  ],
  link: [
    { rel: 'canonical', href: 'https://yoursite.com/explore' }
  ]
})
```

### 3. 全域 SEO 設定

**更新 `nuxt.config.ts`**:
```typescript
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-TW'
      },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: '博幼APP分享平臺',
      meta: [
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'robots', content: 'index, follow' },
        // 預設的 OG image（當頁面沒有特定圖片時）
        { property: 'og:site_name', content: '博幼APP分享平臺' },
        { property: 'og:locale', content: 'zh_TW' },
      ]
    }
  },

  // SEO 模組（可選）
  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/seo'  // 新增
  ]
})
```

**Tests**:
- [ ] APP 詳情頁有正確的 title
- [ ] APP 詳情頁有正確的 description
- [ ] Open Graph tags 正確生成
- [ ] Twitter Card tags 正確生成
- [ ] JSON-LD structured data 正確生成
- [ ] 創作者連結包含在 structured data 中
- [ ] 探索頁面有正確的 meta tags
- [ ] Canonical URLs 正確
- [ ] 使用 Google Rich Results Test 驗證
- [ ] 使用 Facebook Sharing Debugger 驗證
- [ ] 使用 Twitter Card Validator 驗證

**Implementation**:
- [ ] 安裝 `@nuxtjs/seo` 模組（可選）
- [ ] 更新 `nuxt.config.ts` 全域設定
- [ ] 更新 `pages/app/[id].vue` 添加動態 SEO
- [ ] 更新 `pages/explore.vue` 添加 SEO
- [ ] 建立 SEO composable (`composables/useSEO.ts`)
- [ ] 建立 structured data composable
- [ ] 編寫 SEO 測試工具腳本

**Status**: 🔄 Not Started

---

## Stage 5: Sitemap 生成

**Goal**: 自動生成 XML sitemap 以提升搜尋引擎索引效率

**Success Criteria**:
- 動態生成包含所有公開 APP 的 sitemap
- 包含主要頁面（首頁、探索、關於等）
- 正確的優先級和更新頻率設定
- 支援大量 APP（sitemap index）
- 定期更新機制

**Sitemap 結構**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 主要頁面 -->
  <url>
    <loc>https://yoursite.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yoursite.com/explore</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://yoursite.com/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- APP 詳情頁 -->
  <url>
    <loc>https://yoursite.com/app/[app-id-1]</loc>
    <lastmod>2025-12-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- ... 更多 apps ... -->
</urlset>
```

**Implementation Options**:

### Option 1: 使用 Nuxt SEO 模組（推薦）
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/seo'],

  sitemap: {
    hostname: 'https://yoursite.com',
    gzip: true,
    routes: async () => {
      // 從資料庫獲取所有公開的 APP IDs
      const apps = await getPublicApps()
      return apps.map(app => ({
        url: `/app/${app.id}`,
        lastmod: app.updatedAt,
        changefreq: 'weekly',
        priority: 0.8
      }))
    }
  }
})
```

### Option 2: 手動實作 Sitemap API
```typescript
// server/api/sitemap.xml.get.ts
export default defineEventHandler(async (event) => {
  const apps = await query('SELECT id, updated_at FROM apps WHERE is_public = true')

  const staticPages = [
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/explore', changefreq: 'daily', priority: 0.9 },
    { loc: '/about', changefreq: 'monthly', priority: 0.5 },
  ]

  const appPages = apps.rows.map(app => ({
    loc: `/app/${app.id}`,
    lastmod: app.updated_at,
    changefreq: 'weekly',
    priority: 0.8
  }))

  const allPages = [...staticPages, ...appPages]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>https://yoursite.com${page.loc}</loc>
    ${page.lastmod ? `<lastmod>${new Date(page.lastmod).toISOString()}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml')
  return sitemap
})
```

**Sitemap Index（當 APP 超過 50,000 個時）**:
```typescript
// server/api/sitemap-index.xml.get.ts
export default defineEventHandler(async (event) => {
  // 分割成多個 sitemap
  const sitemaps = [
    { loc: '/sitemap-static.xml', lastmod: new Date() },
    { loc: '/sitemap-apps-1.xml', lastmod: new Date() },
    { loc: '/sitemap-apps-2.xml', lastmod: new Date() },
  ]

  // ... 生成 sitemap index XML
})
```

**robots.txt 配置**:
```typescript
// public/robots.txt
User-agent: *
Allow: /

Sitemap: https://yoursite.com/sitemap.xml
```

**或動態生成**:
```typescript
// server/api/robots.txt.get.ts
export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain')
  return `User-agent: *
Allow: /

Sitemap: https://yoursite.com/sitemap.xml`
})
```

**Tests**:
- [ ] `/sitemap.xml` 可以正確訪問
- [ ] Sitemap 包含所有公開的 APP
- [ ] Sitemap 包含所有靜態頁面
- [ ] XML 格式正確（通過驗證器）
- [ ] lastmod 日期正確
- [ ] 優先級設定合理
- [ ] Gzip 壓縮正常（如啟用）
- [ ] robots.txt 正確指向 sitemap
- [ ] 使用 Google Search Console 驗證
- [ ] 大量 APP 時 sitemap index 正常運作

**Implementation**:
- [ ] 選擇實作方案（推薦 Option 1）
- [ ] 安裝 `@nuxtjs/seo` 模組（如使用 Option 1）
- [ ] 建立 sitemap 生成邏輯
- [ ] 建立或配置 `robots.txt`
- [ ] 建立 `server/utils/sitemap.ts` helper
- [ ] 添加快取機制（避免每次都查詢資料庫）
- [ ] 設定定期更新任務（可選）
- [ ] 編寫測試
- [ ] 提交 sitemap 到 Google Search Console

**快取策略**:
```typescript
// server/api/sitemap.xml.get.ts
import { defineCachedEventHandler } from '#nitro'

export default defineCachedEventHandler(
  async (event) => {
    // ... sitemap 生成邏輯
  },
  {
    maxAge: 60 * 60, // 快取 1 小時
    getKey: () => 'sitemap'
  }
)
```

**Status**: 🔄 Not Started

---

## 開發順序

1. ✅ 分析現有架構（已完成）
2. ✅ 建立新實作計劃（本文件）
3. 🔄 Stage 1: 資料庫 Schema 更新
4. 🔄 Stage 2: 創作者連結 API 支援
5. 🔄 Stage 3: 前端 UI 更新
6. 🔄 Stage 4: SEO 優化
7. 🔄 Stage 5: Sitemap 生成

---

## 完成進度總結

### 🔄 進行中
無

### 📋 待開始
- **Stage 1**: 資料庫 Schema 更新（創作者連結）
- **Stage 2**: API 和工具函數更新
- **Stage 3**: 前端 UI 更新（連結輸入與顯示）
- **Stage 4**: SEO Meta Tags 優化
- **Stage 5**: Sitemap 生成與提交

---

## 注意事項

### 技術考量

1. **向後相容性**: ✅ 確保創作者連結為可選欄位，不影響現有資料
2. **URL 驗證**: ⚠️ 需要嚴格驗證 URL 格式，防止 XSS 攻擊
3. **效能**: ⚠️ Sitemap 生成需要快取機制，避免頻繁查詢資料庫
4. **SEO 最佳實踐**: ⚠️ 確保 meta tags 符合 Google、Facebook、Twitter 的規範
5. **安全性**: ⚠️ 創作者連結使用 `rel="noopener noreferrer"`
6. **測試覆蓋**: ✅ 所有功能都需要完整的測試（TDD 原則）

### SEO 檢查清單

- [ ] 每個頁面有唯一的 title 和 description
- [ ] Title 長度 50-60 字元
- [ ] Description 長度 150-160 字元
- [ ] 所有圖片有 alt 文字
- [ ] 使用語義化 HTML（h1, h2, article, etc.）
- [ ] 確保行動裝置友好（responsive）
- [ ] 頁面載入速度優化（< 3 秒）
- [ ] HTTPS 啟用
- [ ] Canonical URLs 設定正確
- [ ] Structured Data 驗證通過

### Sitemap 最佳實踐

- [ ] 一個 sitemap 不超過 50,000 個 URL
- [ ] Sitemap 檔案大小 < 50MB
- [ ] 使用 Gzip 壓縮
- [ ] 定期更新（建議每天）
- [ ] 提交到 Google Search Console
- [ ] 提交到 Bing Webmaster Tools
- [ ] 在 robots.txt 中聲明
- [ ] 使用 lastmod 標記最後修改時間

---

## 驗證與測試工具

### SEO 驗證工具
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Schema.org Validator](https://validator.schema.org/)
- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Sitemap 驗證工具
- [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)

---

**最後更新**: 2025-12-10
**狀態**: 📋 規劃完成，準備開始實作
**預計完成**: TBD（依開發節奏而定）

---

## 🚀 開始開發

準備開始實作時，建議順序：

```bash
# 1. 建立功能分支
git checkout -b feature/creator-links-and-seo

# 2. Stage 1: 資料庫更新
# 建立並執行 migration

# 3. Stage 2: 後端 API（TDD）
# 先寫測試，再實作功能

# 4. Stage 3: 前端 UI
# 更新組件和頁面

# 5. Stage 4: SEO
# 添加 meta tags 和 structured data

# 6. Stage 5: Sitemap
# 設定 sitemap 生成與提交

# 7. 測試與驗證
# 執行所有測試，使用 SEO 工具驗證

# 8. 提交與部署
git commit -m "feat: add creator links and SEO optimization"
```

遵循 TDD 原則，確保每個階段都有充分的測試覆蓋！
