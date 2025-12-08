# 資料庫設定指南

本文件說明如何設定資料庫環境以執行 AI App Share 專案。

## 環境變數設定

### 1. 建立 .env 檔案

在專案根目錄建立 `.env` 檔案（已在 `.gitignore` 中，不會被提交）：

```bash
# Database (Zeabur PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Secret
JWT_SECRET=your-super-secret-key-change-in-production

# Tebi S3 (待設定)
TEBI_ENDPOINT=https://s3.tebi.io
TEBI_ACCESS_KEY=your-access-key
TEBI_SECRET_KEY=your-secret-key
TEBI_BUCKET=ai-app-share

# Public
NUXT_PUBLIC_S3_BASE_URL=https://s3.tebi.io/ai-app-share
```

### 2. 執行資料庫 Schema

使用 psql 或任何 PostgreSQL 客戶端執行 `server/database/schema.sql`：

```bash
# 使用 psql 命令列
psql -h <host> -p <port> -U <user> -d <database> -f server/database/schema.sql

# 或使用環境變數中的連線字串
PGPASSWORD=<password> psql <connection_url> -f server/database/schema.sql
```

這會建立：
- `users` 表格（使用者資料）
- `apps` 表格（應用程式資料）
- `ratings` 表格（評分）
- `comments` 表格（評論）
- `favorites` 表格（收藏）
- `apps_with_stats` 視圖（統計資料）
- 所有必要的索引

## 驗證設定

### 1. 執行資料庫測試

```bash
pnpm test tests/integration/db.test.ts --run
```

如果顯示測試通過，表示資料庫連線成功。

### 2. 執行整合測試

```bash
pnpm test --run
```

認證相關的整合測試（register, login）應該會執行而不是被跳過。

### 3. 啟動開發伺服器測試 API

```bash
pnpm dev
```

使用 curl 或 Postman 測試 API：

**註冊**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

**登入**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Zeabur PostgreSQL 設定範例

如果使用 Zeabur PostgreSQL：

1. 在 Zeabur 建立 PostgreSQL 服務
2. 取得連線字串（格式：`postgresql://user:password@host:port/database`）
3. 將連線字串設定到 `.env` 的 `DATABASE_URL`
4. 執行上述 Schema 建立步驟

## 常見問題

### Q: 測試顯示 "skipped" 是什麼原因？

A: 如果 `DATABASE_URL` 環境變數未設定，整合測試會自動跳過。請確認：
1. `.env` 檔案存在且包含 `DATABASE_URL`
2. `vitest.config.ts` 已配置載入 `.env`（專案已配置）

### Q: bcrypt 模組錯誤？

A: 專案已升級至 bcrypt 6.0.0 以修復原生模組問題。如果仍有問題：
```bash
pnpm install
```

### Q: 如何重置資料庫？

A: 刪除所有表格後重新執行 schema.sql：
```sql
DROP TABLE IF EXISTS favorites, comments, ratings, apps, users CASCADE;
DROP VIEW IF EXISTS apps_with_stats;
```
然後重新執行 schema.sql。

## 安全注意事項

⚠️ **重要**:
- `.env` 檔案已在 `.gitignore` 中，請勿將其提交到 Git
- `JWT_SECRET` 在生產環境必須使用強隨機字串
- 資料庫密碼應使用安全的密碼管理方式
- 在生產環境使用 SSL 連線 (`?sslmode=require`)

## Tebi S3 設定 (選用)

雖然 S3 功能在 Stage 3 才會實作，但您可以提前設定並測試：

### 1. 取得 Tebi Credentials

1. 前往 [Tebi.io](https://tebi.io/) 註冊/登入
2. 建立 Bucket（例如：`boyocanvasapp`）
3. 建立 Access Key 並記下 Access Key 和 Secret Key

### 2. 更新 .env 檔案

```bash
# Tebi S3
TEBI_ENDPOINT=https://s3.tebi.io
TEBI_ACCESS_KEY=your-access-key
TEBI_SECRET_KEY=your-secret-key
TEBI_BUCKET=your-bucket-name

# Public
NUXT_PUBLIC_S3_BASE_URL=https://s3.tebi.io/your-bucket-name
```

### 3. 測試 S3 連線

```bash
npx tsx scripts/test-s3.ts
```

測試會執行：
- ✅ 列出 Buckets
- ✅ 上傳測試檔案
- ✅ 讀取檔案內容
- ✅ 刪除測試檔案

如果所有測試通過，表示 S3 設定正確！

## 相關文件

- [專案架構設計](./ARCHITECTURE_DESIGN.md)
- [技術堆疊](./TECH_STACK.md)
- [執行計畫](./IMPLEMENTATION_PLAN.md)
