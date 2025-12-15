# OAuth 快速開始指南

本文件提供快速設定 OAuth 社群登入的精簡步驟。完整說明請參閱 [OAuth 設定指南](./OAUTH_SETUP_GUIDE.md)。

---

## 🚀 5 分鐘快速設定

### 1. Google OAuth（最簡單）

```bash
# 1. 前往 Google Cloud Console
https://console.cloud.google.com/

# 2. 建立專案 → APIs & Services → OAuth consent screen
# 3. 選擇 External → 填寫應用程式名稱和 email
# 4. Credentials → Create Credentials → OAuth client ID → Web application
# 5. 設定 Authorized redirect URIs：
http://localhost:3000/api/auth/callback/google

# 6. 複製 Client ID 和 Client Secret
```

### 2. LINE Login

```bash
# 1. 前往 LINE Developers
https://developers.line.biz/console/

# 2. 建立 Provider → 建立 LINE Login channel
# 3. 選擇 Web app
# 4. LINE Login 標籤 → 設定 Callback URL：
http://localhost:3000/api/auth/callback/line

# 5. Basic settings 標籤 → 複製 Channel ID 和 Channel secret
```

### 3. Facebook Login

```bash
# 1. 前往 Meta for Developers
https://developers.facebook.com/

# 2. Create App → Authenticate and request data → Consumer
# 3. 新增 Facebook Login 產品
# 4. Facebook Login → Settings → Valid OAuth Redirect URIs：
http://localhost:3000/api/auth/callback/facebook

# 5. Settings → Basic → 複製 App ID 和 App Secret
```

---

## 📝 環境變數設定

建立或編輯 `.env` 檔案：

```bash
# 生成 Auth Secret
openssl rand -base64 32

# 填入 .env
AUTH_SECRET="上面生成的字串"
AUTH_ORIGIN="http://localhost:3000"

# Google
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"

# LINE
LINE_CLIENT_ID="1234567890"
LINE_CLIENT_SECRET="xxxxx"

# Facebook
FACEBOOK_CLIENT_ID="1234567890123456"
FACEBOOK_CLIENT_SECRET="xxxxx"
```

---

## ✅ 測試

```bash
# 1. 啟動開發伺服器
pnpm dev

# 2. 開啟瀏覽器
http://localhost:3000/login

# 3. 點擊登入按鈕測試
```

---

## 🔧 常見錯誤快速修復

### ❌ Redirect URI mismatch

**問題**：OAuth provider 設定的 redirect URI 與實際不符

**解決**：
1. 檢查拼字（包含 http/https、port）
2. 確保沒有多餘的斜線
3. 重新複製 URI 到 OAuth 設定

### ❌ Invalid Client

**問題**：Client ID 或 Secret 錯誤

**解決**：
1. 重新複製 credentials
2. 檢查環境變數名稱
3. 確認沒有多餘空格

### ❌ Access Denied (Google)

**問題**：未加入測試使用者

**解決**：
1. Google Cloud Console → OAuth consent screen
2. Test users → Add Users
3. 輸入測試用的 Google email

---

## 📚 需要更多幫助？

- **完整指南**：[OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md)
- **實作計劃**：[IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md)
- **常見問題**：[OAUTH_SETUP_GUIDE.md#常見問題](./OAUTH_SETUP_GUIDE.md#常見問題)

---

**更新日期**：2025-12-15
