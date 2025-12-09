# 博幼APP分享平臺 - API 文檔

> RESTful API 完整規格

## 📋 目錄

- [認證 API](#認證-api)
  - [註冊](#post-apiauthregister)
  - [登入](#post-apiauthlogin)
  - [取得當前使用者](#get-apiauthme)
- [App 管理 API](#app-管理-api)
  - [上傳 App](#post-apiapps)
  - [取得 App 列表](#get-apiapps)
  - [取得 App 詳情](#get-apiappsid)
  - [更新 App](#put-apiappsid)
  - [刪除 App](#delete-apiappsid)
- [互動 API](#互動-api)
  - [評分](#post-apiappsidrate)
  - [取得評論](#get-apiappsidcomments)
  - [新增評論](#post-apiappsidcomments)
  - [收藏/取消收藏](#post-apiappsidfavorite)
- [系統 API](#系統-api)
  - [健康檢查](#get-apihealth)

---

## 認證 API

### POST /api/auth/register

註冊新使用者。

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**驗證規則**:
- `email`: 必須是有效的 email 格式
- `username`: 3-50 個字元
- `password`: 至少 8 個字元

**Response** (201 Created):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "created_at": "2024-12-09T12:00:00.000Z"
  },
  "token": "jwt-token-string"
}
```

**錯誤回應**:
- `400 Bad Request`: Email 已被使用 / 驗證失敗
- `500 Internal Server Error`: 伺服器錯誤

---

### POST /api/auth/login

使用者登入。

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "created_at": "2024-12-09T12:00:00.000Z"
  },
  "token": "jwt-token-string"
}
```

**錯誤回應**:
- `400 Bad Request`: 驗證失敗
- `401 Unauthorized`: Email 或密碼錯誤
- `500 Internal Server Error`: 伺服器錯誤

---

### GET /api/auth/me

取得當前登入使用者資訊。

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "created_at": "2024-12-09T12:00:00.000Z"
  }
}
```

**錯誤回應**:
- `401 Unauthorized`: 未提供 token 或 token 無效
- `500 Internal Server Error`: 伺服器錯誤

---

## App 管理 API

### POST /api/apps

上傳新 App（支援三種方式：剪貼簿、檔案、ZIP）。

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Request Body - 剪貼簿上傳** (`uploadType: 'paste'`):
```json
{
  "uploadType": "paste",
  "title": "My App",
  "description": "App description",
  "category": "tool",
  "tags": ["interactive", "utility"],
  "htmlContent": "<!DOCTYPE html><html>...</html>"
}
```

**Request Body - 檔案上傳** (`uploadType: 'file'`):
```json
{
  "uploadType": "file",
  "title": "My App",
  "description": "App description",
  "category": "game",
  "tags": ["fun"],
  "fileContent": "base64-encoded-html-content",
  "fileName": "index.html"
}
```

**Request Body - ZIP 上傳** (`uploadType: 'zip'`):
```json
{
  "uploadType": "zip",
  "title": "My App",
  "description": "App description",
  "category": "animation",
  "tags": ["creative"],
  "zipContent": "base64-encoded-zip-content",
  "fileName": "app.zip"
}
```

**驗證規則**:
- `title`: 必填，1-200 個字元
- `description`: 選填，最多 1000 個字元
- `category`: 必填，可選值：`tool`, `game`, `tutorial`, `animation`, `test`, `other`
- `tags`: 選填，最多 10 個標籤，每個標籤最多 50 個字元

**Response** (201 Created):
```json
{
  "app": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "My App",
    "description": "App description",
    "category": "tool",
    "tags": ["interactive", "utility"],
    "upload_type": "paste",
    "main_file": "apps/uuid/index.html",
    "file_manifest": ["apps/uuid/index.html"],
    "view_count": 0,
    "created_at": "2024-12-09T12:00:00.000Z",
    "updated_at": "2024-12-09T12:00:00.000Z"
  },
  "urls": {
    "html": "https://s3.tebi.io/bucket/apps/uuid/index.html",
    "preview": "/app/uuid"
  }
}
```

**錯誤回應**:
- `400 Bad Request`: 驗證失敗 / 不支援的上傳類型
- `401 Unauthorized`: 未認證
- `500 Internal Server Error`: 伺服器錯誤 / S3 上傳失敗

---

### GET /api/apps

取得 App 列表（支援分頁、篩選、排序）。

**Query Parameters**:
- `page` (number, default: 1): 頁碼
- `limit` (number, default: 20, max: 100): 每頁數量
- `category` (string): 分類篩選
- `tags` (string): 標籤篩選（逗號分隔，如 `interactive,fun`）
- `search` (string): 搜尋關鍵字（搜尋標題與描述）
- `sort` (string, default: 'latest'): 排序方式
  - `latest`: 最新（依建立時間降冪）
  - `popular`: 熱門（依瀏覽次數降冪）
  - `rating`: 評分（依平均評分降冪）

**範例請求**:
```
GET /api/apps?page=1&limit=20&category=game&tags=fun&sort=popular
```

**Response** (200 OK):
```json
{
  "apps": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "username": "author",
      "title": "App Title",
      "description": "App description",
      "category": "game",
      "tags": ["fun", "interactive"],
      "upload_type": "paste",
      "main_file": "apps/uuid/index.html",
      "view_count": 100,
      "avg_rating": 4.5,
      "rating_count": 10,
      "comment_count": 5,
      "favorite_count": 8,
      "created_at": "2024-12-09T12:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

**錯誤回應**:
- `400 Bad Request`: 無效的參數
- `500 Internal Server Error`: 伺服器錯誤

---

### GET /api/apps/[id]

取得特定 App 詳情（自動增加瀏覽次數）。

**Response** (200 OK):
```json
{
  "app": {
    "id": "uuid",
    "user_id": "uuid",
    "username": "author",
    "title": "App Title",
    "description": "App description",
    "category": "game",
    "tags": ["fun", "interactive"],
    "upload_type": "zip",
    "main_file": "apps/uuid/index.html",
    "file_manifest": [
      "apps/uuid/index.html",
      "apps/uuid/style.css",
      "apps/uuid/script.js"
    ],
    "view_count": 101,
    "avg_rating": 4.5,
    "rating_count": 10,
    "comment_count": 5,
    "favorite_count": 8,
    "created_at": "2024-12-09T12:00:00.000Z",
    "updated_at": "2024-12-09T12:00:00.000Z"
  },
  "urls": {
    "html": "https://s3.tebi.io/bucket/apps/uuid/index.html",
    "files": {
      "apps/uuid/index.html": "https://s3.tebi.io/bucket/apps/uuid/index.html",
      "apps/uuid/style.css": "https://s3.tebi.io/bucket/apps/uuid/style.css",
      "apps/uuid/script.js": "https://s3.tebi.io/bucket/apps/uuid/script.js"
    }
  }
}
```

**錯誤回應**:
- `404 Not Found`: App 不存在
- `500 Internal Server Error`: 伺服器錯誤

---

### PUT /api/apps/[id]

更新 App metadata（僅作者可更新）。

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Request Body**:
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "tool",
  "tags": ["updated", "tags"]
}
```

**Response** (200 OK):
```json
{
  "app": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Updated Title",
    "description": "Updated description",
    "category": "tool",
    "tags": ["updated", "tags"],
    "updated_at": "2024-12-09T12:30:00.000Z"
  }
}
```

**錯誤回應**:
- `400 Bad Request`: 驗證失敗
- `401 Unauthorized`: 未認證
- `403 Forbidden`: 非作者嘗試更新
- `404 Not Found`: App 不存在
- `500 Internal Server Error`: 伺服器錯誤

---

### DELETE /api/apps/[id]

刪除 App（僅作者可刪除，同步刪除 S3 檔案）。

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "App deleted successfully"
}
```

**錯誤回應**:
- `401 Unauthorized`: 未認證
- `403 Forbidden`: 非作者嘗試刪除
- `404 Not Found`: App 不存在
- `500 Internal Server Error`: 伺服器錯誤 / S3 刪除失敗

---

## 互動 API

### POST /api/apps/[id]/rate

評分（1-5 星，可更新已存在的評分）。

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Request Body**:
```json
{
  "rating": 5
}
```

**驗證規則**:
- `rating`: 必須是 1-5 的整數

**Response** (200 OK):
```json
{
  "rating": 5,
  "avgRating": 4.5,
  "ratingCount": 11
}
```

**錯誤回應**:
- `400 Bad Request`: 驗證失敗（rating 不在 1-5 範圍）
- `401 Unauthorized`: 未認證
- `404 Not Found`: App 不存在
- `500 Internal Server Error`: 伺服器錯誤

---

### GET /api/apps/[id]/comments

取得 App 的評論列表。

**Query Parameters**:
- `page` (number, default: 1): 頁碼
- `limit` (number, default: 20, max: 50): 每頁數量

**Response** (200 OK):
```json
{
  "comments": [
    {
      "id": "uuid",
      "app_id": "uuid",
      "user_id": "uuid",
      "username": "commenter",
      "content": "Great app!",
      "created_at": "2024-12-09T12:00:00.000Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

**錯誤回應**:
- `404 Not Found`: App 不存在
- `500 Internal Server Error`: 伺服器錯誤

---

### POST /api/apps/[id]/comments

新增評論。

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Request Body**:
```json
{
  "content": "This is a comment"
}
```

**驗證規則**:
- `content`: 必填，1-1000 個字元

**Response** (201 Created):
```json
{
  "comment": {
    "id": "uuid",
    "app_id": "uuid",
    "user_id": "uuid",
    "username": "commenter",
    "content": "This is a comment",
    "created_at": "2024-12-09T12:00:00.000Z"
  }
}
```

**錯誤回應**:
- `400 Bad Request`: 驗證失敗
- `401 Unauthorized`: 未認證
- `404 Not Found`: App 不存在
- `500 Internal Server Error`: 伺服器錯誤

---

### POST /api/apps/[id]/favorite

收藏或取消收藏 App（toggle）。

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Request Body**: 無

**Response** (200 OK):
```json
{
  "favorited": true,
  "favoriteCount": 9
}
```

**錯誤回應**:
- `401 Unauthorized`: 未認證
- `404 Not Found`: App 不存在
- `500 Internal Server Error`: 伺服器錯誤

---

## 系統 API

### GET /api/health

健康檢查 endpoint，用於監控系統狀態。

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2024-12-09T12:00:00.000Z",
  "database": "connected",
  "uptime": 12345
}
```

**Response** (503 Service Unavailable) - 資料庫連接失敗:
```json
{
  "status": "unhealthy",
  "timestamp": "2024-12-09T12:00:00.000Z",
  "database": "disconnected",
  "uptime": 12345,
  "error": "Database connection failed"
}
```

---

## 認證機制

### JWT Token

所有需要認證的 API 都需要在 Header 中攜帶 JWT token：

```
Authorization: Bearer <jwt-token>
```

### Token 有效期

- 預設有效期: 7 天
- Token 過期後需要重新登入

### 取得 Token

透過 `/api/auth/register` 或 `/api/auth/login` 取得 token。

---

## Rate Limiting

為了防止濫用，所有 API 都有速率限制：

- **未認證請求**: 60 requests / 分鐘
- **認證請求**: 100 requests / 分鐘

超過限制時會返回 `429 Too Many Requests`。

---

## 錯誤處理

### 統一錯誤格式

所有錯誤回應都遵循以下格式：

```json
{
  "statusCode": 400,
  "message": "Error message"
}
```

### HTTP 狀態碼

- `200 OK`: 請求成功
- `201 Created`: 資源建立成功
- `400 Bad Request`: 請求參數錯誤
- `401 Unauthorized`: 未認證或 token 無效
- `403 Forbidden`: 無權限執行操作
- `404 Not Found`: 資源不存在
- `429 Too Many Requests`: 超過速率限制
- `500 Internal Server Error`: 伺服器錯誤
- `503 Service Unavailable`: 服務暫時無法使用

---

## 範例：完整上傳流程

### 1. 註冊並取得 Token

```bash
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "myusername",
    "password": "password123"
  }'
```

回應：
```json
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. 上傳 App

```bash
curl -X POST https://your-domain.com/api/apps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "uploadType": "paste",
    "title": "My First App",
    "description": "A simple calculator",
    "category": "tool",
    "tags": ["calculator", "utility"],
    "htmlContent": "<!DOCTYPE html><html>...</html>"
  }'
```

### 3. 取得 App 列表

```bash
curl https://your-domain.com/api/apps?category=tool&sort=latest&limit=10
```

### 4. 評分

```bash
curl -X POST https://your-domain.com/api/apps/{app-id}/rate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "rating": 5
  }'
```

---

## 版本資訊

- **API 版本**: v1
- **最後更新**: 2024-12-09
- **維護者**: Development Team

---

## 相關文檔

- [README.md](../README.md) - 專案說明
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署指南
- [CLAUDE.md](../CLAUDE.md) - TDD 開發指南
