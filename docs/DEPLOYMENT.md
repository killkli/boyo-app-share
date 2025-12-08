# AI App Share - 部署指南

本指南將協助您將 AI App Share 部署到生產環境。

## 目錄

1. [環境需求](#環境需求)
2. [環境變數配置](#環境變數配置)
3. [資料庫設置](#資料庫設置)
4. [S3 儲存設置](#s3-儲存設置)
5. [部署到 Cloudflare Pages](#部署到-cloudflare-pages)
6. [部署到 Vercel](#部署到-vercel)
7. [部署驗證](#部署驗證)
8. [常見問題](#常見問題)

---

## 環境需求

- **Node.js**: 18.x 或以上
- **pnpm**: 8.x 或以上
- **PostgreSQL**: 15.x 或以上
- **S3 相容儲存**: Tebi S3 或其他 S3 API 相容服務

---

## 環境變數配置

### 1. 複製環境變數範本

```bash
cp .env.example .env
```

### 2. 設置必要的環境變數

編輯 `.env` 檔案，填入以下資訊：

#### 資料庫 (DATABASE_URL)
```bash
# 格式
DATABASE_URL=postgresql://username:password@host:port/database

# 範例 (Zeabur)
DATABASE_URL=postgresql://postgres:mypassword@db.zeabur.app:5432/ai-app-share
```

#### JWT 密鑰 (JWT_SECRET)
```bash
# 生成強密碼
openssl rand -base64 32

# 將生成的密碼填入 .env
JWT_SECRET=生成的密碼
```

#### S3 儲存 (Tebi)
```bash
TEBI_ENDPOINT=https://s3.tebi.io
TEBI_ACCESS_KEY=你的 Access Key
TEBI_SECRET_KEY=你的 Secret Key
TEBI_BUCKET=ai-app-share
NUXT_PUBLIC_S3_BASE_URL=https://s3.tebi.io/ai-app-share
```

---

## 資料庫設置

### 1. 建立資料庫

#### 使用 Zeabur

1. 前往 [Zeabur Dashboard](https://zeabur.com)
2. 建立新的 PostgreSQL 服務
3. 複製連接字串到 `DATABASE_URL`

#### 使用 Supabase

1. 前往 [Supabase Dashboard](https://supabase.com)
2. 建立新專案
3. 在 Project Settings > Database 找到連接字串
4. 複製 Pooling 模式的連接字串

#### 本地開發

```bash
# 使用 Docker
docker run -d \
  --name postgres-dev \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ai-app-share \
  -p 5432:5432 \
  postgres:15
```

### 2. 執行資料庫遷移

```bash
# 連接到資料庫
psql $DATABASE_URL

# 執行 Schema
\i server/database/schema.sql

# 執行效能優化遷移
\i server/database/migrations/001_performance_optimization.sql

# 離開
\q
```

### 3. 驗證資料庫

```bash
# 測試連接
psql $DATABASE_URL -c "SELECT version();"

# 查看表格
psql $DATABASE_URL -c "\dt"
```

---

## S3 儲存設置

### 使用 Tebi S3

#### 1. 註冊帳號

前往 [Tebi.io](https://tebi.io/) 註冊帳號

#### 2. 建立 Bucket

1. 登入 Tebi Dashboard
2. 點擊 "Create Bucket"
3. 輸入 bucket 名稱（例如：`ai-app-share`）
4. 選擇地區
5. 設置為 **Public Read**（允許公開讀取）

#### 3. 取得 API Keys

1. 前往 Account Settings > API Keys
2. 點擊 "Generate New Key"
3. 複製 Access Key 和 Secret Key
4. 填入 `.env` 檔案

#### 4. 設置 CORS

在 Tebi Dashboard 中設置 CORS 規則：

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

### 使用其他 S3 服務

- **AWS S3**: [設置指南](https://docs.aws.amazon.com/s3/index.html)
- **Cloudflare R2**: [設置指南](https://developers.cloudflare.com/r2/)
- **MinIO**: [設置指南](https://min.io/docs/minio/linux/)

---

## 部署到 Cloudflare Pages

### 1. 建立 GitHub Repository

```bash
git remote add origin https://github.com/你的用戶名/ai-app-share.git
git branch -M main
git push -u origin main
```

### 2. 連接 Cloudflare Pages

1. 前往 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 選擇 "Workers & Pages"
3. 點擊 "Create application" > "Pages" > "Connect to Git"
4. 選擇你的 GitHub repository

### 3. 設置建置配置

```yaml
Build command: pnpm build
Build output directory: .output/public
Root directory: /
Node version: 18
```

### 4. 設置環境變數

在 Cloudflare Pages 設置中添加所有 `.env` 中的環境變數：

```
DATABASE_URL=...
JWT_SECRET=...
TEBI_ENDPOINT=...
TEBI_ACCESS_KEY=...
TEBI_SECRET_KEY=...
TEBI_BUCKET=...
NUXT_PUBLIC_S3_BASE_URL=...
```

### 5. 部署

點擊 "Save and Deploy"，Cloudflare Pages 會自動建置和部署。

---

## 部署到 Vercel

### 1. 安裝 Vercel CLI

```bash
pnpm add -g vercel
```

### 2. 登入 Vercel

```bash
vercel login
```

### 3. 部署

```bash
# 第一次部署
vercel

# 生產環境部署
vercel --prod
```

### 4. 設置環境變數

```bash
# 方式 1: 使用 CLI
vercel env add DATABASE_URL
vercel env add JWT_SECRET
# ... 其他環境變數

# 方式 2: 在 Vercel Dashboard 設置
# https://vercel.com/你的用戶名/ai-app-share/settings/environment-variables
```

---

## 部署驗證

### 1. 檢查應用程式健康狀態

建立健康檢查 endpoint：

```typescript
// server/api/health.get.ts
export default defineEventHandler(async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: await checkDatabaseConnection(),
    s3: await checkS3Connection()
  }
})
```

訪問 `https://your-domain.com/api/health` 驗證。

### 2. 測試關鍵功能

- [ ] 使用者註冊
- [ ] 使用者登入
- [ ] 上傳 App（剪貼簿、檔案、ZIP）
- [ ] 瀏覽 App 列表
- [ ] 查看 App 詳情
- [ ] 評分、評論、收藏

### 3. 檢查效能

使用 [Lighthouse](https://developers.google.com/web/tools/lighthouse) 檢查：

```bash
# 使用 Chrome DevTools
# 或使用 CLI
npm install -g lighthouse
lighthouse https://your-domain.com --view
```

目標分數：
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 95
- SEO: ≥ 90

---

## 常見問題

### Q1: 資料庫連接失敗

**錯誤**: `Error: connect ECONNREFUSED`

**解決方案**:
1. 檢查 `DATABASE_URL` 格式是否正確
2. 確認資料庫服務正在運行
3. 檢查防火牆設定
4. 如果使用 SSL，添加 `?sslmode=require` 到連接字串

### Q2: S3 上傳失敗

**錯誤**: `Access Denied` 或 `403 Forbidden`

**解決方案**:
1. 確認 Access Key 和 Secret Key 正確
2. 檢查 Bucket 權限設定（需要 Public Read）
3. 確認 CORS 設定正確
4. 檢查 Bucket 名稱是否正確

### Q3: JWT 驗證失敗

**錯誤**: `Invalid token`

**解決方案**:
1. 確認 `JWT_SECRET` 在所有環境中一致
2. 檢查 token 是否過期
3. 清除瀏覽器 localStorage 重新登入

### Q4: Rate Limiting 問題

**錯誤**: `429 Too Many Requests`

**解決方案**:
1. 調整 Rate Limit 配置
2. 使用 Redis 替代記憶體儲存（生產環境）
3. 檢查是否有 IP 被錯誤識別

### Q5: Build 失敗

**錯誤**: `Build failed`

**解決方案**:
1. 檢查 Node.js 版本（需要 18+）
2. 清除快取：`rm -rf .nuxt node_modules && pnpm install`
3. 檢查 TypeScript 錯誤：`pnpm build`
4. 查看詳細錯誤日誌

---

## 監控與維護

### 1. 設置錯誤追蹤

建議使用 [Sentry](https://sentry.io/)：

```bash
pnpm add @sentry/nuxt
```

### 2. 設置日誌

使用 [Cloudflare Workers Analytics](https://developers.cloudflare.com/analytics/) 或 [Vercel Analytics](https://vercel.com/analytics)

### 3. 定期備份

```bash
# 備份資料庫
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# 備份 S3（使用 AWS CLI 或 rclone）
rclone sync tebi:ai-app-share ./backup-s3
```

### 4. 更新依賴

```bash
# 檢查過期的依賴
pnpm outdated

# 更新依賴
pnpm update
```

---

## 安全建議

1. **使用強密碼**：JWT_SECRET 至少 32 字元
2. **啟用 HTTPS**：所有生產環境必須使用 HTTPS
3. **定期更新**：保持依賴套件最新
4. **設置 Rate Limiting**：防止 API 濫用
5. **監控日誌**：定期檢查異常活動
6. **備份資料**：定期備份資料庫和 S3

---

## 效能優化

1. **啟用 CDN**：使用 Cloudflare CDN 加速靜態資源
2. **資料庫優化**：執行 `001_performance_optimization.sql` 遷移
3. **圖片優化**：使用 WebP 格式和適當的壓縮
4. **Code Splitting**：Nuxt 自動處理
5. **快取策略**：Cache middleware 已自動設置

---

## 聯絡支援

如有問題，請：
1. 查看 [GitHub Issues](https://github.com/你的用戶名/ai-app-share/issues)
2. 閱讀 [文檔](../README.md)
3. 提交新的 Issue

---

**最後更新**: 2024-12-09
**版本**: 1.0.0
