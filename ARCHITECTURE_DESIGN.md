# AI App Share - 單頁 HTML App 快速分享平台 - 完整架構設計

## 技術架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                      使用者瀏覽器                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│          Cloudflare Pages (全域 CDN)                        │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │            Nuxt.js 全端應用                        │     │
│  │                                                   │     │
│  │  ┌─────────────────┐  ┌──────────────────┐      │     │
│  │  │   Pages (SSR)   │  │  Server API      │      │     │
│  │  │   - 首頁        │  │  /api/auth/*     │      │     │
│  │  │   - 探索        │  │  /api/apps/*     │      │     │
│  │  │   - APP 詳情    │  │  /api/users/*    │      │     │
│  │  │   - 創建編輯    │  │  /api/comments/* │      │     │
│  │  └─────────────────┘  └──────────────────┘      │     │
│  │                                                   │     │
│  │  Components + Composables + Utils                │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  Nitro Engine (Cloudflare Workers Runtime)                 │
└─────────────────────────────────────────────────────────────┘
             ↓                              ↓
    ┌─────────────────┐          ┌──────────────────────┐
    │ Zeabur          │          │  Tebi S3             │
    │                 │          │                      │
    │  PostgreSQL 15  │          │  檔案儲存            │
    │  - users        │          │  - HTML/CSS/JS       │
    │  - apps         │          │  - 縮圖              │
    │  - comments     │          │  - 頭像              │
    │  - ratings      │          │  25GB 免費           │
    │  - favorites    │          │  250GB 流量/月        │
    └─────────────────┘          └──────────────────────┘
```

---

## 核心技術選型

### 前端 + 後端：Nuxt.js 3 on Cloudflare Pages

#### 為什麼選 Nuxt.js？
✅ **全端框架** - 前端 + API 在同一專案
✅ **零配置** - Cloudflare Pages 原生支援
✅ **SSR/SSG** - 靈活的渲染模式
✅ **Server Routes** - 內建 API 路由
✅ **Nitro 引擎** - 部署到 Cloudflare Workers
✅ **TypeScript** - 完整型別支援

#### Cloudflare Pages 規格
| 項目 | 免費額度 |
|------|----------|
| 頻寬 | **無限制** |
| 請求數 | **無限制** |
| Builds | 500/月 |
| 並發 Build | 1 個 |
| 自訂域名 | ✅ |
| SSL 證書 | ✅ 自動 |

---

### 資料庫：Zeabur PostgreSQL

#### 連接方式
```javascript
// Nuxt server/api 可以直接連接
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})
```

#### Zeabur PostgreSQL 規格
- **免費額度**: $5/月 credit
- **外部連接**: ✅ 支援（提供 connection string）
- **SSL/TLS**: ✅ 支援
- **備份**: 自動快照
- **版本**: PostgreSQL 15+

#### 環境變數（Zeabur 自動提供）
```bash
POSTGRES_HOST=xxx.zeabur.internal
POSTGRES_PORT=5432
POSTGRES_DATABASE=zeabur
POSTGRES_USERNAME=root
POSTGRES_PASSWORD=xxx
POSTGRES_CONNECTION_STRING=postgresql://root:xxx@host:port/zeabur
```

---

### 儲存：Tebi S3

#### 免費額度
- 💾 **25GB 儲存**
- 📤 **250GB 流量/月**
- 🔁 **2 份備份**
- 🌍 **歐洲機房**
- 🆓 **API 呼叫免費**

#### S3 相容性
✅ AWS SDK v3 完全相容
✅ Presigned URLs
✅ Bucket Policy
✅ CORS 設定

---

## 專案結構

```
ai-app-share/
├── .output/                      # Nuxt 建構輸出
├── .nuxt/                        # Nuxt 開發快取
├── public/                       # 靜態資源
│   ├── favicon.ico
│   └── images/
├── assets/                       # 需編譯的資源
│   └── css/
│       └── main.css
├── components/                   # Vue 組件
│   ├── app/
│   │   ├── AppCard.vue
│   │   ├── AppGrid.vue
│   │   ├── AppEditor.vue
│   │   └── AppPreview.vue
│   ├── layout/
│   │   ├── Header.vue
│   │   ├── Footer.vue
│   │   └── Sidebar.vue
│   ├── ui/                       # shadcn-vue 組件
│   │   ├── Button.vue
│   │   ├── Input.vue
│   │   ├── Dialog.vue
│   │   └── ...
│   └── common/
│       ├── Rating.vue
│       ├── Comments.vue
│       └── TagInput.vue
├── composables/                  # Vue Composables
│   ├── useAuth.ts
│   ├── useApps.ts
│   ├── useComments.ts
│   └── useS3Upload.ts
├── layouts/                      # Nuxt Layouts
│   ├── default.vue
│   └── auth.vue
├── middleware/                   # Nuxt Middleware
│   ├── auth.ts                   # 前端路由保護
│   └── guest.ts
├── pages/                        # Nuxt Pages (File-based Routing)
│   ├── index.vue                 # 首頁
│   ├── explore.vue               # 探索頁面
│   ├── app/
│   │   └── [id].vue             # APP 詳情
│   ├── create.vue               # 創建 APP
│   ├── edit/
│   │   └── [id].vue             # 編輯 APP
│   ├── profile/
│   │   └── [username].vue       # 使用者頁面
│   ├── login.vue
│   └── register.vue
├── server/                       # Nuxt Server (Backend)
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   ├── register.post.ts
│   │   │   ├── login.post.ts
│   │   │   ├── logout.post.ts
│   │   │   └── me.get.ts
│   │   ├── apps/
│   │   │   ├── index.get.ts     # GET /api/apps
│   │   │   ├── index.post.ts    # POST /api/apps
│   │   │   ├── [id].get.ts
│   │   │   ├── [id].put.ts
│   │   │   ├── [id].delete.ts
│   │   │   └── [id]/
│   │   │       ├── rate.post.ts
│   │   │       ├── comment.post.ts
│   │   │       └── favorite.post.ts
│   │   ├── users/
│   │   │   └── [username]/
│   │   │       ├── index.get.ts
│   │   │       └── apps.get.ts
│   │   └── upload/
│   │       ├── presigned-url.post.ts  # 生成 S3 上傳 URL
│   │       └── confirm.post.ts        # 確認上傳完成
│   ├── middleware/                     # Server Middleware
│   │   ├── auth.ts                     # JWT 驗證
│   │   └── error.ts                    # 錯誤處理
│   ├── utils/                          # Server Utils
│   │   ├── db.ts                       # 資料庫連接
│   │   ├── s3.ts                       # S3 客戶端
│   │   ├── jwt.ts                      # JWT 工具
│   │   └── validation.ts               # Zod schemas
│   └── plugins/                        # Server Plugins
│       └── database.ts
├── types/                        # TypeScript 類型
│   ├── app.ts
│   ├── user.ts
│   └── api.ts
├── utils/                        # Client Utils
│   ├── constants.ts
│   └── helpers.ts
├── .env                          # 環境變數
├── .gitignore
├── nuxt.config.ts               # Nuxt 配置
├── tailwind.config.ts           # Tailwind 配置
├── tsconfig.json                # TypeScript 配置
├── package.json
└── README.md
```

---

## 資料庫設計

### Schema (PostgreSQL)

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Apps Table
CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  tags TEXT[],

  -- 上傳方式與檔案儲存
  upload_type VARCHAR(10) CHECK (upload_type IN ('paste', 'file', 'zip')),
  html_s3_key TEXT NOT NULL,           -- 主 HTML 檔案的 S3 key
  assets_s3_prefix TEXT,               -- 壓縮檔案解壓後的 S3 路徑前綴 (僅 zip)
  file_manifest JSONB,                 -- 檔案清單 {files: [{path, size, type}]}

  -- Metadata
  thumbnail_s3_key TEXT,               -- 'thumbnails/{uuid}.png'
  is_public BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_apps_user_id ON apps(user_id);
CREATE INDEX idx_apps_category ON apps(category);
CREATE INDEX idx_apps_is_public ON apps(is_public);
CREATE INDEX idx_apps_created_at ON apps(created_at DESC);
CREATE INDEX idx_apps_tags ON apps USING GIN(tags);

-- Ratings Table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(app_id, user_id)
);

CREATE INDEX idx_ratings_app_id ON ratings(app_id);

-- Comments Table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_app_id ON comments(app_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Favorites Table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(app_id, user_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_app_id ON favorites(app_id);

-- View to get app with stats
CREATE VIEW apps_with_stats AS
SELECT
  a.*,
  u.username as author_username,
  u.avatar_url as author_avatar,
  COUNT(DISTINCT r.id) as rating_count,
  COALESCE(AVG(r.rating), 0) as avg_rating,
  COUNT(DISTINCT c.id) as comment_count,
  COUNT(DISTINCT f.id) as favorite_count
FROM apps a
LEFT JOIN users u ON a.user_id = u.id
LEFT JOIN ratings r ON a.id = r.app_id
LEFT JOIN comments c ON a.id = c.app_id
LEFT JOIN favorites f ON a.id = f.app_id
GROUP BY a.id, u.username, u.avatar_url;
```

---

## S3 檔案結構 (Tebi)

### Bucket: `ai-app-share`

```
ai-app-share/
├── apps/
│   ├── {uuid}/                  # 單個 App 的目錄
│   │   ├── index.html          # 主 HTML 檔案（必須）
│   │   ├── style.css           # CSS 檔案（可選，來自 ZIP）
│   │   ├── script.js           # JS 檔案（可選，來自 ZIP）
│   │   ├── images/             # 圖片目錄（來自 ZIP）
│   │   │   ├── logo.png
│   │   │   └── background.jpg
│   │   ├── libs/               # 第三方庫（來自 ZIP）
│   │   │   └── jquery.min.js
│   │   └── ...                 # 其他檔案（保持 ZIP 內的目錄結構）
│   ├── {uuid2}/
│   │   └── index.html          # 僅剪貼簿/單檔上傳的 App
│   └── ...
├── thumbnails/
│   ├── {uuid}.png              # APP 縮圖
│   ├── {uuid2}.png
│   └── ...
└── avatars/
    ├── {user-uuid}.jpg         # 使用者頭像
    └── ...
```

### URL 範例

#### 剪貼簿/單檔上傳
```
HTML: https://s3.tebi.io/ai-app-share/apps/123.../index.html
```

#### ZIP 壓縮檔上傳（保持目錄結構）
```
主 HTML: https://s3.tebi.io/ai-app-share/apps/456.../index.html
CSS:     https://s3.tebi.io/ai-app-share/apps/456.../style.css
圖片:    https://s3.tebi.io/ai-app-share/apps/456.../images/logo.png
JS 庫:   https://s3.tebi.io/ai-app-share/apps/456.../libs/jquery.min.js
```

#### 其他
```
縮圖: https://s3.tebi.io/ai-app-share/thumbnails/123.../thumb.png
頭像: https://s3.tebi.io/ai-app-share/avatars/user-uuid.jpg
```

---

## API 設計

### 認證 API

#### POST /api/auth/register
```typescript
// Request
{
  email: string
  username: string
  password: string
}

// Response
{
  user: {
    id: string
    email: string
    username: string
  }
  token: string
}
```

#### POST /api/auth/login
```typescript
// Request
{
  email: string
  password: string
}

// Response
{
  user: User
  token: string
}
```

#### GET /api/auth/me
```typescript
// Headers
Authorization: Bearer {token}

// Response
{
  user: User
}
```

---

### APP API

#### GET /api/apps
```typescript
// Query Params
?page=1
&limit=20
&category=math
&tags=interactive,game
&sort=latest|popular|rating
&search=keyword

// Response
{
  apps: App[]
  total: number
  page: number
  totalPages: number
}
```

#### GET /api/apps/[id]
```typescript
// Response
{
  app: App & {
    author: User
    stats: {
      views: number
      ratings: number
      avgRating: number
      comments: number
      favorites: number
    }
  }
  userRating?: number  // 當前使用者評分
  isFavorited: boolean
}
```

#### POST /api/apps
```typescript
// Headers
Authorization: Bearer {token}

// Request (三種上傳方式)

// 方式 1: 剪貼簿貼上
{
  uploadType: 'paste'
  title: string
  description: string
  category: string
  tags: string[]
  htmlContent: string      // HTML 程式碼
  thumbnail?: string       // Base64 image
}

// 方式 2: 上傳 HTML 檔案
{
  uploadType: 'file'
  title: string
  description: string
  category: string
  tags: string[]
  htmlFile: File           // HTML 檔案
  thumbnail?: File
}

// 方式 3: 上傳 ZIP 壓縮檔
{
  uploadType: 'zip'
  title: string
  description: string
  category: string
  tags: string[]
  zipFile: File            // ZIP 檔案
  mainHtmlPath?: string    // 主 HTML 檔案路徑（可選，自動偵測）
  thumbnail?: File
}

// Response
{
  app: App
  urls: {
    html: string
    preview: string
    assets?: string[]      // ZIP 上傳時的所有檔案 URL
  }
  manifest?: {             // ZIP 上傳時的檔案清單
    files: Array<{
      path: string
      size: number
      type: string
    }>
  }
}
```

#### PUT /api/apps/[id]
```typescript
// Headers
Authorization: Bearer {token}

// Request (same as POST)

// Response
{
  app: App
}
```

#### DELETE /api/apps/[id]
```typescript
// Headers
Authorization: Bearer {token}

// Response
{
  success: boolean
}
```

---

### 互動 API

#### POST /api/apps/[id]/rate
```typescript
// Headers
Authorization: Bearer {token}

// Request
{
  rating: 1 | 2 | 3 | 4 | 5
}

// Response
{
  rating: number
  avgRating: number
}
```

#### POST /api/apps/[id]/comment
```typescript
// Headers
Authorization: Bearer {token}

// Request
{
  content: string
}

// Response
{
  comment: Comment & {
    user: User
  }
}
```

#### POST /api/apps/[id]/favorite
```typescript
// Headers
Authorization: Bearer {token}

// Response
{
  isFavorited: boolean
}
```

---

## 核心功能實現

### 1. 認證流程

```typescript
// server/utils/jwt.ts
import jwt from 'jsonwebtoken'

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: '7d'
  })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!)
}

// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  const path = event.node.req.url

  // 公開路由跳過
  if (path?.startsWith('/api/auth') || path?.startsWith('/api/apps') && event.node.req.method === 'GET') {
    return
  }

  // 驗證 JWT
  const authorization = getHeader(event, 'authorization')
  if (!authorization) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const token = authorization.replace('Bearer ', '')
  const decoded = verifyToken(token)
  event.context.userId = decoded.userId
})
```

---

### 2. S3 檔案上傳

```typescript
// server/utils/s3.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.TEBI_ENDPOINT,
  credentials: {
    accessKeyId: process.env.TEBI_ACCESS_KEY!,
    secretAccessKey: process.env.TEBI_SECRET_KEY!,
  },
})

export const uploadToS3 = async (key: string, body: string | Buffer, contentType: string) => {
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.TEBI_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: 'public-read',
  }))

  return `${process.env.TEBI_ENDPOINT}/${process.env.TEBI_BUCKET}/${key}`
}

export const deleteFromS3 = async (key: string) => {
  await s3Client.send(new DeleteObjectCommand({
    Bucket: process.env.TEBI_BUCKET,
    Key: key,
  }))
}

export const getPresignedUploadUrl = async (key: string, contentType: string) => {
  const command = new PutObjectCommand({
    Bucket: process.env.TEBI_BUCKET,
    Key: key,
    ContentType: contentType,
    ACL: 'public-read',
  })

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

// server/api/apps/index.post.ts
export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const { uploadType, title, description, category, tags } = await readBody(event)
  const appId = crypto.randomUUID()

  let htmlS3Key: string
  let assetsPrefix: string | null = null
  let fileManifest: any = null

  // 根據上傳方式處理
  switch (uploadType) {
    case 'paste': {
      // 剪貼簿貼上
      const { htmlContent } = await readBody(event)
      htmlS3Key = `apps/${appId}/index.html`
      await uploadToS3(htmlS3Key, htmlContent, 'text/html')
      break
    }

    case 'file': {
      // 上傳單個 HTML 檔案
      const formData = await readMultipartFormData(event)
      const htmlFile = formData?.find(f => f.name === 'htmlFile')
      htmlS3Key = `apps/${appId}/index.html`
      await uploadToS3(htmlS3Key, htmlFile.data, 'text/html')
      break
    }

    case 'zip': {
      // 上傳 ZIP 壓縮檔
      const formData = await readMultipartFormData(event)
      const zipFile = formData?.find(f => f.name === 'zipFile')

      // 解壓縮 ZIP
      const AdmZip = (await import('adm-zip')).default
      const zip = new AdmZip(zipFile.data)
      const zipEntries = zip.getEntries()

      // 檔案清單
      const files: any[] = []

      // 上傳所有檔案到 S3（保持目錄結構）
      for (const entry of zipEntries) {
        if (!entry.isDirectory) {
          const s3Key = `apps/${appId}/${entry.entryName}`
          const mimeType = getMimeType(entry.entryName)
          await uploadToS3(s3Key, entry.getData(), mimeType)

          files.push({
            path: entry.entryName,
            size: entry.header.size,
            type: mimeType
          })
        }
      }

      // 自動偵測主 HTML 檔案
      const mainHtml = files.find(f =>
        f.path === 'index.html' ||
        f.path.endsWith('/index.html') ||
        f.path.endsWith('.html')
      )

      htmlS3Key = `apps/${appId}/${mainHtml.path}`
      assetsPrefix = `apps/${appId}/`
      fileManifest = { files }
      break
    }
  }

  // 儲存到資料庫
  const app = await db.query(`
    INSERT INTO apps (
      id, user_id, title, description, category, tags,
      upload_type, html_s3_key, assets_s3_prefix, file_manifest
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `, [
    appId, userId, title, description, category, tags,
    uploadType, htmlS3Key, assetsPrefix, JSON.stringify(fileManifest)
  ])

  return {
    app: app.rows[0],
    urls: {
      html: `${process.env.TEBI_ENDPOINT}/${process.env.TEBI_BUCKET}/${htmlS3Key}`,
      preview: `/app/${appId}`
    },
    manifest: fileManifest
  }
})
```

---

### 3. APP 預覽（安全沙盒）

```vue
<!-- components/app/AppPreview.vue -->
<template>
  <div class="app-preview">
    <iframe
      :src="previewUrl"
      sandbox="allow-scripts allow-same-origin"
      class="w-full h-full border-0"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  appId: string
}>()

const previewUrl = computed(() =>
  `https://s3.tebi.io/ai-app-share/apps/${props.appId}/index.html`
)
</script>
```

---

### 4. 即時編輯器

```vue
<!-- pages/create.vue -->
<template>
  <div class="grid grid-cols-2 gap-4 h-screen">
    <!-- 編輯器 -->
    <div>
      <MonacoEditor
        v-model="htmlContent"
        language="html"
        theme="vs-dark"
      />
    </div>

    <!-- 預覽 -->
    <div>
      <iframe
        :srcdoc="htmlContent"
        sandbox="allow-scripts"
        class="w-full h-full"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const htmlContent = ref(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; }
  </style>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>`)

const saveApp = async () => {
  await $fetch('/api/apps', {
    method: 'POST',
    body: {
      title: '...',
      htmlContent: htmlContent.value
    },
    headers: {
      Authorization: `Bearer ${token.value}`
    }
  })
}
</script>
```

---

## 環境變數配置

### `.env` (本地開發)
```bash
# Database (Zeabur)
DATABASE_URL=postgresql://root:password@host:5432/database

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# Tebi S3
TEBI_ENDPOINT=https://s3.tebi.io
TEBI_ACCESS_KEY=your-access-key
TEBI_SECRET_KEY=your-secret-key
TEBI_BUCKET=ai-app-share

# App
NUXT_PUBLIC_API_BASE=/api
```

### Cloudflare Pages 環境變數
在 Cloudflare Dashboard 設定：
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
TEBI_ENDPOINT=https://s3.tebi.io
TEBI_ACCESS_KEY=...
TEBI_SECRET_KEY=...
TEBI_BUCKET=ai-app-share
```

---

## 部署配置

### `nuxt.config.ts`
```typescript
export default defineNuxtConfig({
  // Cloudflare Pages 自動偵測，但可明確指定
  nitro: {
    preset: 'cloudflare-pages',

    // 數據庫連接池配置
    experimental: {
      database: true
    }
  },

  // 運行時配置
  runtimeConfig: {
    // Private (server-only)
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    tebiEndpoint: process.env.TEBI_ENDPOINT,
    tebiAccessKey: process.env.TEBI_ACCESS_KEY,
    tebiSecretKey: process.env.TEBI_SECRET_KEY,
    tebiBucket: process.env.TEBI_BUCKET,

    // Public (client-exposed)
    public: {
      apiBase: '/api',
      s3BaseUrl: 'https://s3.tebi.io/ai-app-share'
    }
  },

  // 模組
  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@vueuse/nuxt'
  ],

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: true
  },

  // 開發伺服器
  devServer: {
    port: 3000
  }
})
```

### `package.json`
```json
{
  "name": "ai-app-share",
  "type": "module",
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "preview": "nuxt preview",
    "deploy": "wrangler pages deploy .output/public"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.550.0",
    "@aws-sdk/s3-request-presigner": "^3.550.0",
    "adm-zip": "^0.5.10",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "mime-types": "^2.1.35",
    "nuxt": "^3.11.0",
    "pg": "^8.11.3",
    "vue": "^3.4.21",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@nuxtjs/tailwindcss": "^6.11.4",
    "@types/adm-zip": "^0.5.5",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/mime-types": "^2.1.4",
    "@types/pg": "^8.11.5",
    "@vueuse/nuxt": "^10.9.0",
    "shadcn-nuxt": "^0.10.0",
    "typescript": "^5.4.3",
    "wrangler": "^3.45.0"
  }
}
```

---

## 部署流程

### 1. 前置準備

#### A. 設定 Zeabur PostgreSQL
```bash
1. 登入 Zeabur Dashboard
2. 創建新專案
3. 新增服務 → PostgreSQL
4. 複製 POSTGRES_CONNECTION_STRING
```

#### B. 設定 Tebi S3
```bash
1. 註冊 Tebi 帳號 (https://tebi.io)
2. 創建 Bucket: ai-app-share
3. 設定 Public Read 權限
4. 生成 Access Key 和 Secret Key
5. 設定 CORS:
   {
     "CORSRules": [{
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["*"]
     }]
   }
```

#### C. 執行資料庫遷移
```bash
# 連接到 Zeabur PostgreSQL
psql $DATABASE_URL

# 執行 SQL schema (從上面的資料庫設計)
\i schema.sql
```

---

### 2. Cloudflare Pages 部署

#### 方法 1：Git 整合（推薦）

```bash
# 1. 推送到 GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/ai-app-share.git
git push -u origin main

# 2. 連接 Cloudflare Pages
1. 登入 Cloudflare Dashboard
2. Pages → Create a project
3. Connect to Git → 選擇你的倉庫
4. 配置建構設定:
   - Framework preset: Nuxt.js
   - Build command: nuxt build
   - Build output directory: .output/public
5. 設定環境變數 (上面列的所有變數)
6. Save and Deploy
```

#### 方法 2：CLI 部署

```bash
# 1. 建構專案
npm run build

# 2. 部署到 Cloudflare
npm install -g wrangler
wrangler login
wrangler pages deploy .output/public --project-name=ai-app-share
```

---

### 3. 設定自訂域名（可選）

```bash
1. Cloudflare Pages Dashboard
2. 選擇專案 → Custom domains
3. 新增域名: app.yourdomain.com
4. 更新 DNS 記錄（Cloudflare 會自動處理）
```

---

## 成本估算

### 免費階段（0-1000 使用者）

| 服務 | 用量預估 | 成本 |
|------|----------|------|
| **Cloudflare Pages** | 50K 請求/月 | **$0** |
| **Zeabur PostgreSQL** | 256MB RAM + 500MB 儲存 | **$0** (在 $5 credit 內) |
| **Tebi S3** | 5GB 儲存 + 50GB 流量 | **$0** |
| **總計** | | **$0/月** ✅ |

### 成長階段（1000-10000 使用者）

| 服務 | 用量預估 | 成本 |
|------|----------|------|
| **Cloudflare Pages** | 1M 請求/月 | **$0** (無限流量) |
| **Zeabur** | 512MB RAM + 2GB 儲存 | **~$8-12/月** |
| **Tebi S3** | 40GB 儲存 + 300GB 流量 | **$0.8 + $0.5 = $1.3/月** |
| **總計** | | **~$9-13/月** |

### 擴展階段（10000+ 使用者）

| 服務 | 用量預估 | 成本 |
|------|----------|------|
| **Cloudflare Pages** | 10M 請求/月 | **$0** |
| **Zeabur** | 1GB RAM + 10GB 儲存 | **~$25-35/月** |
| **Tebi S3** | 150GB 儲存 + 1TB 流量 | **$2.5 + $7.5 = $10/月** |
| **總計** | | **~$35-45/月** |

---

## 性能優化

### 1. Cloudflare 快取
```typescript
// server/middleware/cache.ts
export default defineEventHandler((event) => {
  const path = event.node.req.url

  // 靜態資源快取 1 天
  if (path?.match(/\.(png|jpg|css|js)$/)) {
    setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')
  }

  // API 回應快取 5 分鐘
  if (path?.startsWith('/api/apps') && event.node.req.method === 'GET') {
    setResponseHeader(event, 'Cache-Control', 'public, max-age=300')
  }
})
```

### 2. 資料庫連接池
```typescript
// server/utils/db.ts
import { Pool } from 'pg'

let pool: Pool

export const getDb = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: useRuntimeConfig().databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }
  return pool
}
```

### 3. S3 CDN 快取
```typescript
// 上傳時設定 Cache-Control
await uploadToS3(key, body, contentType, {
  CacheControl: 'public, max-age=31536000' // 1 年
})
```

---

## 安全措施

### 1. SQL Injection 防護
```typescript
// 使用 Parameterized Queries
const result = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
)
```

### 2. XSS 防護
```typescript
// server/utils/validation.ts
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

export const sanitizeHtml = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'button', 'input'],
    ALLOWED_ATTR: ['class', 'id', 'style', 'type', 'value']
  })
}

export const appSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000),
  htmlContent: z.string().max(1000000), // 1MB
})
```

### 3. Rate Limiting
```typescript
// server/middleware/rateLimit.ts
const rateLimitMap = new Map()

export default defineEventHandler((event) => {
  const ip = getHeader(event, 'cf-connecting-ip') || 'unknown'
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 分鐘
  const maxRequests = 100

  const requests = rateLimitMap.get(ip) || []
  const recentRequests = requests.filter((time: number) => now - time < windowMs)

  if (recentRequests.length >= maxRequests) {
    throw createError({
      statusCode: 429,
      message: 'Too many requests'
    })
  }

  recentRequests.push(now)
  rateLimitMap.set(ip, recentRequests)
})
```

### 4. CORS 設定
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    routeRules: {
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization'
        }
      }
    }
  }
})
```

---

## 監控與日誌

### Cloudflare Analytics
```typescript
// 自動啟用，在 Dashboard 查看:
- 請求數
- 頻寬使用
- 錯誤率
- 回應時間
```

### 錯誤追蹤
```typescript
// server/middleware/error.ts
export default defineEventHandler(async (event) => {
  try {
    await runHandler(event)
  } catch (error) {
    console.error('[API Error]', {
      path: event.node.req.url,
      method: event.node.req.method,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })

    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    })
  }
})
```

---

## 開發工作流程

### 1. 本地開發
```bash
# 啟動開發伺服器
npm run dev

# 訪問
http://localhost:3000
```

### 2. 預覽建構
```bash
# 建構
npm run build

# 本地預覽
npm run preview
```

### 3. 部署
```bash
# Git Push（自動部署）
git add .
git commit -m "feat: add new feature"
git push

# 或手動部署
npm run build
wrangler pages deploy .output/public
```

---

## 待辦事項（實施階段）

### 階段 1：專案初始化 ✅
- [ ] 建立 Nuxt.js 專案
- [ ] 安裝依賴
- [ ] 設定 TailwindCSS + shadcn-vue
- [ ] 建立基本 Layout

### 階段 2：資料庫與認證
- [ ] 設定 Zeabur PostgreSQL
- [ ] 執行資料庫 schema
- [ ] 實現註冊/登入 API
- [ ] JWT 認證中介層
- [ ] 登入/註冊頁面

### 階段 3：S3 檔案上傳
- [ ] 設定 Tebi S3
- [ ] S3 上傳工具函數
- [ ] Presigned URL API
- [ ] 檔案上傳組件

### 階段 4：APP CRUD
- [ ] 創建 APP API
- [ ] Monaco Editor 整合
- [ ] 即時預覽
- [ ] APP 列表頁面
- [ ] APP 詳情頁面

### 階段 5：互動功能
- [ ] 評分系統
- [ ] 評論系統
- [ ] 收藏功能
- [ ] 搜尋與篩選

### 階段 6：部署與優化
- [ ] Cloudflare Pages 部署
- [ ] 環境變數設定
- [ ] 性能優化
- [ ] 測試與除錯

---

## 下一步

✅ **架構設計完成**

現在你可以：
1. **審查設計** - 檢查是否有需要調整的地方
2. **開始實施** - 我可以幫你建立專案
3. **提出問題** - 任何不清楚的地方

準備好開始了嗎？
