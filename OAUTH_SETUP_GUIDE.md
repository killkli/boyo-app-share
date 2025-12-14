# OAuth 社群登入設定指南

本文件說明如何設定 Google、LINE、Facebook 的 OAuth 應用程式，以在博幼APP分享平臺啟用社群登入功能。

---

## 目錄

- [Google OAuth 2.0 設定](#google-oauth-20-設定)
- [LINE Login 設定](#line-login-設定)
- [Facebook Login 設定](#facebook-login-設定)
- [環境變數設定](#環境變數設定)
- [測試 OAuth 登入](#測試-oauth-登入)
- [常見問題](#常見問題)

---

## Google OAuth 2.0 設定

### 1. 建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 點擊「Select a project」→「New Project」
3. 輸入專案名稱（例如：博幼APP分享平臺）
4. 點擊「Create」

### 2. 啟用 Google+ API

1. 在左側選單選擇「APIs & Services」→「Enabled APIs & services」
2. 點擊「+ ENABLE APIS AND SERVICES」
3. 搜尋「Google+ API」或「Google People API」
4. 點擊「Enable」

### 3. 設定 OAuth 同意畫面

1. 在左側選單選擇「OAuth consent screen」
2. 選擇「External」（外部使用者）
3. 填寫應用程式資訊：
   - **App name**: 博幼APP分享平臺
   - **User support email**: 你的 email
   - **Developer contact information**: 你的 email
4. 點擊「Save and Continue」
5. **Scopes**: 點擊「Add or Remove Scopes」，選擇：
   - `./auth/userinfo.email`
   - `./auth/userinfo.profile`
6. 點擊「Save and Continue」
7. **Test users** (開發階段): 新增測試使用者的 email
8. 點擊「Save and Continue」

### 4. 建立 OAuth 2.0 憑證

1. 在左側選單選擇「Credentials」
2. 點擊「+ CREATE CREDENTIALS」→「OAuth client ID」
3. Application type: 選擇「Web application」
4. 填寫資訊：
   - **Name**: 博幼APP分享平臺 - Web Client
   - **Authorized JavaScript origins**:
     - Development: `http://localhost:3000`
     - Production: `https://yourdomain.com`
   - **Authorized redirect URIs**:
     - Development: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://yourdomain.com/api/auth/callback/google`
5. 點擊「Create」
6. **記下 Client ID 和 Client Secret**

### 5. 環境變數

將 Client ID 和 Client Secret 加到 `.env` 檔案：

```bash
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

---

## LINE Login 設定

### 1. 建立 LINE Developers 帳號

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 使用你的 LINE 帳號登入
3. 如果是第一次使用，需要同意開發者條款

### 2. 建立 Provider

1. 點擊「Create New Provider」
2. 輸入 Provider name（例如：博幼基金會）
3. 點擊「Create」

### 3. 建立 LINE Login Channel

1. 在 Provider 頁面，點擊「Create a LINE Login channel」
2. 填寫 Channel 資訊：
   - **Channel type**: LINE Login
   - **Provider**: 選擇剛才建立的 Provider
   - **Region**: Taiwan
   - **Channel name**: 博幼APP分享平臺
   - **Channel description**: 博幼基金會教學應用分享平台
   - **App types**: Web app
3. 填寫必要資訊並點擊「Create」

### 4. 設定 Callback URL

1. 在 Channel 的「LINE Login」頁籤
2. 找到「Callback URL」設定
3. 新增以下 URL：
   - Development: `http://localhost:3000/api/auth/callback/line`
   - Production: `https://yourdomain.com/api/auth/callback/line`
4. 點擊「Update」

### 5. 取得 Channel ID 和 Channel Secret

1. 在 Channel 的「Basic settings」頁籤
2. 找到：
   - **Channel ID**
   - **Channel Secret**（點擊「Issue」如果尚未建立）
3. **記下這兩個值**

### 6. 環境變數

將 Channel ID 和 Channel Secret 加到 `.env` 檔案：

```bash
LINE_CLIENT_ID="your-line-channel-id"
LINE_CLIENT_SECRET="your-line-channel-secret"
```

---

## Facebook Login 設定

### 1. 建立 Facebook 開發者帳號

1. 前往 [Facebook for Developers](https://developers.facebook.com/)
2. 點擊「Get Started」並登入你的 Facebook 帳號
3. 完成開發者註冊流程

### 2. 建立應用程式

1. 在 Dashboard 點擊「Create App」或「My Apps」→「Create App」
2. 選擇使用案例：「Allow people to log in with their Facebook account」
3. 選擇應用程式類型：「Consumer」
4. 填寫應用程式資訊：
   - **App name**: 博幼APP分享平臺
   - **App contact email**: 你的 email
5. 點擊「Create App」

### 3. 設定 Facebook Login

1. 在 Dashboard 找到「Add a product」
2. 選擇「Facebook Login」→「Set Up」
3. 選擇平台：「Web」
4. 輸入網站 URL：
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
5. 完成設定精靈

### 4. 設定 Valid OAuth Redirect URIs

1. 在左側選單選擇「Facebook Login」→「Settings」
2. 在「Valid OAuth Redirect URIs」欄位新增：
   - Development: `http://localhost:3000/api/auth/callback/facebook`
   - Production: `https://yourdomain.com/api/auth/callback/facebook`
3. 點擊「Save Changes」

### 5. 取得 App ID 和 App Secret

1. 在左側選單選擇「Settings」→「Basic」
2. 找到：
   - **App ID**
   - **App Secret**（點擊「Show」查看）
3. **記下這兩個值**

### 6. 設定應用程式模式

**重要：開發階段使用開發模式，正式環境需要切換到上線模式**

#### 開發模式（Development Mode）
- 預設為開發模式
- 只有開發者和測試使用者可以登入
- 適合測試階段使用

#### 切換到上線模式（Live Mode）
1. 完成「App Review」要求的所有資訊
2. 在「Settings」→「Basic」填寫：
   - Privacy Policy URL
   - Terms of Service URL
   - App Icon
   - Category
3. 在 Dashboard 上方將開關從「Development」切換到「Live」

### 7. 環境變數

將 App ID 和 App Secret 加到 `.env` 檔案：

```bash
FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"
```

---

## 環境變數設定

完整的 `.env` 檔案應該包含以下 OAuth 相關設定：

```bash
# Auth.js Secret (使用 openssl rand -base64 32 生成)
AUTH_SECRET="your-generated-secret-key"

# 開發環境
AUTH_ORIGIN="http://localhost:3000"

# Google OAuth 2.0
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# LINE Login
LINE_CLIENT_ID="your-line-channel-id"
LINE_CLIENT_SECRET="your-line-channel-secret"

# Facebook Login
FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"
```

### 生成 AUTH_SECRET

執行以下指令生成安全的密鑰：

```bash
openssl rand -base64 32
```

將生成的密鑰貼到 `.env` 的 `AUTH_SECRET` 欄位。

---

## 測試 OAuth 登入

### 1. 啟動開發伺服器

```bash
pnpm dev
```

### 2. 測試流程

1. 開啟瀏覽器前往 `http://localhost:3000/login`
2. 點擊「使用 Google 登入」（或 LINE、Facebook）
3. 完成 OAuth 授權流程
4. 應該會重定向回網站並自動登入
5. 檢查資料庫：
   ```sql
   -- 檢查使用者是否建立
   SELECT * FROM users WHERE email = 'your-test-email@example.com';

   -- 檢查 OAuth account 是否建立
   SELECT * FROM accounts WHERE provider = 'google';
   ```

### 3. 驗證功能

- ✅ 新使用者可以透過 Google/LINE/Facebook 註冊
- ✅ 現有使用者可以綁定多個 OAuth 帳號（相同 email）
- ✅ OAuth 使用者資訊正確儲存（email、username、image）
- ✅ OAuth 使用者的 `email_verified` 設為 `true`
- ✅ 登入後正確重定向到探索頁面
- ✅ 使用者頭像顯示正確
- ✅ 登出功能正常

---

## 常見問題

### Q1: Google OAuth 顯示「redirect_uri_mismatch」錯誤

**原因**: Redirect URI 設定不正確

**解決方法**:
1. 確認 `.env` 中的 `AUTH_ORIGIN` 正確
2. 檢查 Google Cloud Console 中的 Authorized redirect URIs 是否包含：
   - `http://localhost:3000/api/auth/callback/google`（開發環境）
   - `https://yourdomain.com/api/auth/callback/google`（正式環境）
3. 注意 URL 必須完全一致（包括 http/https、埠號等）

### Q2: LINE Login 顯示「invalid_request」錯誤

**原因**: Callback URL 未設定或不正確

**解決方法**:
1. 前往 LINE Developers Console
2. 在 Channel 的「LINE Login」頁籤中設定 Callback URL
3. 確保 URL 為：`http://localhost:3000/api/auth/callback/line`

### Q3: Facebook Login 只有我能登入，其他人無法登入

**原因**: 應用程式仍在開發模式

**解決方法**:
- **開發階段**: 在 Facebook 開發者後台新增測試使用者
  1. 「Roles」→「Test Users」
  2. 「Add」新增測試使用者
- **正式環境**: 將應用程式切換到上線模式（見上方說明）

### Q4: 登入後顯示「Sign in error」

**原因**: 可能是資料庫連線問題或 callback 邏輯錯誤

**解決方法**:
1. 檢查開發伺服器的 console 錯誤訊息
2. 確認資料庫連線正常：
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```
3. 檢查 `accounts` 表是否存在：
   ```sql
   \d accounts
   ```

### Q5: 如何允許使用者綁定多個 OAuth 帳號？

**答案**: 已經自動支援！

當使用者用相同的 email 透過不同 OAuth provider 登入時：
- 系統會自動將新的 provider 綁定到現有帳號
- 使用者可以用任何已綁定的 provider 登入
- 資料儲存在 `accounts` 表中

範例：
```sql
-- 查看某使用者綁定的所有 OAuth 帳號
SELECT provider, provider_account_id, created_at
FROM accounts
WHERE user_id = 'user-uuid-here';
```

### Q6: 如何在正式環境部署？

**檢查清單**:

1. **環境變數**:
   - ✅ 更新 `AUTH_ORIGIN` 為正式網域（`https://yourdomain.com`）
   - ✅ 確認所有 OAuth credentials 已設定

2. **OAuth 應用程式設定**:
   - ✅ Google: 新增正式環境的 Authorized redirect URI
   - ✅ LINE: 新增正式環境的 Callback URL
   - ✅ Facebook: 新增正式環境的 Valid OAuth Redirect URI

3. **Facebook 特別注意**:
   - ✅ 將應用程式從「Development」切換到「Live」
   - ✅ 完成 App Review 要求的資訊（Privacy Policy、App Icon 等）

4. **SSL/HTTPS**:
   - ✅ 確保正式環境使用 HTTPS
   - ✅ OAuth providers 通常要求正式環境必須使用 HTTPS

---

## 安全性建議

### 1. 保護敏感資訊

- ❌ **絕對不要**將 `.env` 檔案提交到 Git
- ✅ 確保 `.gitignore` 包含 `.env`
- ✅ 使用環境變數管理工具（如 Vercel、Netlify 的環境變數設定）

### 2. 定期更新 Secrets

- 定期更換 `AUTH_SECRET`
- 如果懷疑 OAuth credentials 洩漏，立即在各平台重新生成

### 3. 監控異常登入

- 檢查資料庫中的異常 OAuth 帳號
- 設定登入失敗次數限制
- 記錄可疑的登入活動

### 4. HTTPS Only

- 正式環境必須使用 HTTPS
- 設定 HSTS (HTTP Strict Transport Security)

---

## 參考資源

- [Auth.js 官方文檔](https://authjs.dev/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [LINE Login 文檔](https://developers.line.biz/en/docs/line-login/)
- [Facebook Login 文檔](https://developers.facebook.com/docs/facebook-login/)
- [@sidebase/nuxt-auth](https://sidebase.io/nuxt-auth)

---

**建立日期**: 2025-12-15
**版本**: 1.0
**維護**: 博幼APP分享平臺開發團隊
