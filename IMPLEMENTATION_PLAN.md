# SEO 最佳化實作計畫

## 問題分析

### 現有問題

1. **SEO Meta 無法被爬蟲抓取**
   - 目前頁面使用 `onMounted` + `$fetch` 取得資料
   - SEO meta 在資料取得後才設定 (`setupSeoMeta()`)
   - 爬蟲取得的 HTML 不包含正確的 meta tags

2. **Sitemap 實作不標準**
   - 手動建立 `/api/sitemap.xml.get.ts`
   - 未使用標準 Nuxt SEO 模組
   - 未自動連結 robots.txt

3. **缺少 robots.txt**
   - 沒有設定爬蟲存取規則
   - 沒有指向 sitemap 的連結

### 技術根因

```typescript
// 目前實作 (CSR - 客戶端渲染)
onMounted(async () => {
  const response = await $fetch(`/api/apps/${appId}`)
  app.value = response.app
  setupSeoMeta() // <- 太遲了，爬蟲拿不到
})
```

應改為：

```typescript
// 正確實作 (SSR - 伺服器端渲染)
const { data: app } = await useAsyncData(
  `app-${route.params.id}`,
  () => $fetch(`/api/apps/${route.params.id}`)
)

// useSeoMeta 會在 SSR 時執行
useSeoMeta({
  title: () => app.value?.title,
  description: () => app.value?.description
})
```

---

## 實作計畫

### Stage 1: 安裝與設定 @nuxtjs/seo
**Goal**: 建立 SEO 基礎設施
**Success Criteria**:
- @nuxtjs/seo 模組安裝成功
- Site Config 正確設定
- robots.txt 可存取
- 基本 sitemap 可存取

**Tasks**:
1. 安裝 `@nuxtjs/seo` 模組
2. 設定 `nuxt.config.ts` 的 site config
3. 驗證 `/robots.txt` 和 `/sitemap.xml` 可存取

**Status**: Not Started

---

### Stage 2: 動態 Sitemap 設定
**Goal**: 從資料庫生成動態 sitemap
**Success Criteria**:
- 所有公開 APP 出現在 sitemap
- sitemap 每小時更新
- 移除舊的手動 sitemap 實作

**Tasks**:
1. 建立 `server/api/__sitemap__/urls.ts` endpoint
2. 設定 sitemap sources
3. 移除 `server/api/sitemap.xml.get.ts`

**Status**: Not Started

---

### Stage 3: 修改動態頁面實作 SSR
**Goal**: 讓動態頁面的 SEO meta 在 SSR 時輸出
**Success Criteria**:
- `/app/[id]` 頁面 HTML 包含正確的 meta tags
- 使用 `curl` 可以看到完整的 SEO meta
- Open Graph 和 Twitter Card 正確輸出

**Tasks**:
1. 修改 `pages/app/[id].vue` 使用 `useAsyncData`
2. 將 SEO meta 移到 composable 層級
3. 確保 Structured Data (JSON-LD) 在 SSR 輸出

**Status**: Not Started

---

### Stage 4: 驗證與測試
**Goal**: 確認 SEO 實作正確
**Success Criteria**:
- 使用 curl 可看到 meta tags
- Google Rich Results Test 通過
- Sitemap 包含所有公開 APP

**Tests**:
```bash
# 測試 SSR meta 輸出
curl -s https://domain/app/{id} | grep -E '<meta|<title'

# 測試 sitemap
curl -s https://domain/sitemap.xml

# 測試 robots.txt
curl -s https://domain/robots.txt
```

**Status**: Not Started

---

## 參考資源

- [Nuxt SEO 官方文檔](https://nuxtseo.com/)
- [@nuxtjs/seo 模組](https://nuxt.com/modules/seo)
- [@nuxtjs/sitemap 模組](https://nuxtseo.com/docs/sitemap/getting-started/installation)
- [Nuxt SEO Meta Tags Guide](https://nuxtseo.com/learn-seo/nuxt/mastering-meta)

---

## 預期結果

### Before (現在)
```html
<!-- 爬蟲看到的 HTML -->
<title>博幼APP分享平臺</title>
<meta name="description" content="博幼基金會教學應用分享平台...">
<!-- 動態內容完全缺失 -->
```

### After (修改後)
```html
<!-- 爬蟲看到的 HTML -->
<title>我的應用名稱 - 博幼APP分享平臺</title>
<meta name="description" content="這是我的應用描述...">
<meta property="og:title" content="我的應用名稱">
<meta property="og:description" content="這是我的應用描述...">
<meta property="og:image" content="https://...thumbnail.png">
<script type="application/ld+json">{"@context":"https://schema.org",...}</script>
```
