# 博幼APP分享平臺 - 部署指南

本指南將協助您將 博幼APP分享平臺 部署到生產環境。

## 目錄

1. [環境需求](#環境需求)
2. [環境變數配置](#環境變數配置)
3. [資料庫設置](#資料庫設置)
4. [S3 儲存設置](#s3-儲存設置)
5. [部署到 Zeabur](#部署到-zeabur)
6. [部署驗證](#部署驗證)
7. [常見問題](#常見問題)

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
DATABASE_URL=postgresql://postgres:mypassword@db.zeabur.app:5432/boyo-app-share
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
TEBI_BUCKET=boyo-app-share
NUXT_PUBLIC_S3_BASE_URL=https://s3.tebi.io/boyo-app-share
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
  -e POSTGRES_DB=boyo-app-share \
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
3. 輸入 bucket 名稱（例如：`boyo-app-share`）
4. 選擇地區
5. 設置為 **Public Read**（允許公開讀取）

#### 3. 取得 API Keys

1. 前往 Account Settings > API Keys
2. 點擊 "Generate New Key"
3. 複製 Access Key 和 Secret Key
4. 填入 `.env` 檔案

#### 4. 設置 CORS

在 Tebi Dashboard 中設置 CORS 規則：

```xml
<?xml version='1.0' encoding='UTF-8'?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>PUT</AllowedMethod>
        <AllowedMethod>GET</AllowedMethod>
        <AllowedHeader>*</AllowedHeader>
    </CORSRule>
</CORSConfiguration>
```

### 使用其他 S3 服務

- **AWS S3**: [設置指南](https://docs.aws.amazon.com/s3/index.html)
- **Cloudflare R2**: [設置指南](https://developers.cloudflare.com/r2/)
- **MinIO**: [設置指南](https://min.io/docs/minio/linux/)

---

## 部署到 Zeabur

### 1. 準備 GitHub Repository

確保您的程式碼已推送到 GitHub：

```bash
git remote add origin https://github.com/你的用戶名/boyo-app-share.git
git branch -M main
git push -u origin main
```

### 2. 建立 Zeabur 專案

1. 前往 [Zeabur Dashboard](https://zeabur.com)
2. 點擊 "Create Project"
3. 選擇地區（建議選擇離使用者最近的地區，如 Asia）

### 3. 部署服務

1. 在專案中點擊 "Create Service"
2. 選擇 "Git" 作為來源
3. 選擇 GitHub Repository "boyo-app-share"
4. Zeabur 會自動偵測這是一個 Nuxt 專案並開始建置

### 4. 設置環境變數

在服務部署完成前或完成後，前往 "Variables" 頁籤，加入以下變數（參考您的 `.env`）：

```
DATABASE_URL=...
JWT_SECRET=...
TEBI_ENDPOINT=...
TEBI_ACCESS_KEY=...
TEBI_SECRET_KEY=...
TEBI_BUCKET=...
NUXT_PUBLIC_S3_BASE_URL=...
# 其他公開變數
NUXT_PUBLIC_APP_NAME=博幼APP分享平臺
...
```

### 5. 綁定網域 (可選)

1. 前往 "Domain" 頁籤
2. 您可以使用 Zeabur 提供的免費子網域 (`*.zeabur.app`)
3. 或綁定您的自定義網域

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
3. 如果在 Zeabur 內部連接（App 連接同專案的 DB），確保使用內部主機名稱（如 `postgres` 或 Zeabur 提供的變數）而非外部網域，以獲得更佳效能。但 Zeabur 通常會注入正確的環境變數。

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

### Q4: Build 失敗

**錯誤**: `Build failed`

**解決方案**:
1. 檢查 Node.js 版本
2. 查看 Zeabur 的建置日誌
3. Zeabur 預設會執行 `pnpm build`，確保您的 `package.json` 中的 `build` script 正確。

---

## 監控與維護

### 1. 設置錯誤追蹤

建議使用 [Sentry](https://sentry.io/)：

```bash
pnpm add @sentry/nuxt
```

### 2. 設置日誌

Zeabur Dashboard 提供即時日誌查看功能。

### 3. 定期備份

```bash
# 備份資料庫
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# 備份 S3（使用 AWS CLI 或 rclone）
rclone sync tebi:boyo-app-share ./backup-s3
```

---

## 安全建議

1. **使用強密碼**：JWT_SECRET 至少 32 字元
2. **啟用 HTTPS**：Zeabur 自動為所有網域啟用 HTTPS
3. **定期更新**：保持依賴套件最新
4. **設置 Rate Limiting**：防止 API 濫用
5. **備份資料**：定期備份資料庫和 S3

---

## 效能優化

1. **CDN**: Zeabur 部署通常包含 CDN 支援
2. **資料庫優化**：執行 `001_performance_optimization.sql` 遷移
3. **圖片優化**：使用 WebP 格式和適當的壓縮
4. **Code Splitting**：Nuxt 自動處理
5. **快取策略**：Cache middleware 已自動設置

---

## 聯絡支援

如有問題，請：
1. 查看 [GitHub Issues](https://github.com/你的用戶名/boyo-app-share/issues)
2. 閱讀 [文檔](../README.md)
3. 提交新的 Issue

---

**最後更新**: 2024-12-09
**版本**: 1.1.0
