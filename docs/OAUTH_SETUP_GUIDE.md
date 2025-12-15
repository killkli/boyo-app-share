# OAuth 社群登入設定指南

本指南將協助您設定 Google、LINE 和 Facebook 三種 OAuth 社群登入方式。

---

## 📋 目錄

- [前置準備](#前置準備)
- [Google OAuth 2.0 設定](#google-oauth-20-設定)
- [LINE Login 設定](#line-login-設定)
- [Facebook Login 設定](#facebook-login-設定)
- [環境變數設定](#環境變數設定)
- [測試與驗證](#測試與驗證)
- [常見問題](#常見問題)
- [參考資源](#參考資源)

---

## 前置準備

### 系統需求

- Node.js 18+ 已安裝
- 專案已完成基礎設定
- 可存取的網域（開發階段可使用 localhost）

### 重要提醒

⚠️ **安全性注意事項**：
- Client Secret 絕對不可提交至版本控制系統
- 生產環境必須使用 HTTPS
- 定期輪換 Client Secret
- 限制 OAuth redirect URIs 到已知的網域

---

## Google OAuth 2.0 設定

### 步驟 1：建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 登入您的 Google 帳號
3. 點擊頂部導覽列的**專案下拉選單** → **新增專案**
4. 輸入專案名稱（例如：`boyo-app-share`）
5. 點擊**建立**

### 步驟 2：設定 OAuth 同意畫面

1. 在左側選單選擇 **APIs & Services** → **OAuth consent screen**
2. 選擇使用者類型：
   - **External**（外部）：適用於任何 Google 帳號使用者
   - **Internal**（內部）：僅限 Google Workspace 組織內部
3. 點擊**建立**

4. 填寫應用程式資訊：
   - **App name**（應用程式名稱）：`博幼APP分享平臺`
   - **User support email**（使用者支援電子郵件）：您的 email
   - **App logo**（應用程式標誌）：（選填）上傳 Logo
   - **Application home page**：`https://yourdomain.com`
   - **Application privacy policy link**：隱私權政策連結
   - **Application terms of service link**：服務條款連結（選填）

5. **Authorized domains**（授權網域）：
   - 開發階段：不需填寫（localhost 可直接使用）
   - 生產環境：輸入您的網域（例如：`yourdomain.com`）

6. **Developer contact information**（開發者聯絡資訊）：
   - 輸入您的 email 地址

7. 點擊**儲存並繼續**

### 步驟 3：設定 Scopes（權限範圍）

1. 點擊 **Add or Remove Scopes**
2. 選擇以下權限：
   - `openid`
   - `profile`（基本個人資料）
   - `email`（電子郵件地址）
3. 點擊**更新** → **儲存並繼續**

### 步驟 4：建立 OAuth 2.0 憑證

1. 在左側選單選擇 **APIs & Services** → **Credentials**
2. 點擊 **+ Create Credentials** → **OAuth client ID**
3. 選擇應用程式類型：**Web application**

4. 設定應用程式：
   - **Name**（名稱）：`博幼APP分享 Web Client`

   - **Authorized JavaScript origins**（已授權的 JavaScript 來源）：
     ```
     http://localhost:3000
     https://yourdomain.com
     ```

   - **Authorized redirect URIs**（已授權的重新導向 URI）：
     ```
     http://localhost:3000/api/auth/callback/google
     https://yourdomain.com/api/auth/callback/google
     ```

5. 點擊**建立**

### 步驟 5：取得憑證

建立完成後會顯示：
- **Client ID**：`xxxxx.apps.googleusercontent.com`
- **Client Secret**：`GOCSPX-xxxxx`

⚠️ **重要**：從 2025 年 6 月起，Client Secret 只會在建立時顯示一次，請立即複製並安全儲存！

### 步驟 6：啟用測試使用者（開發階段）

如果您的應用程式處於測試階段：

1. 回到 **OAuth consent screen**
2. 捲動到 **Test users** 區塊
3. 點擊 **Add Users**
4. 輸入測試使用者的 Google email
5. 點擊**儲存**

> 💡 **提示**：未發布的應用程式僅限測試使用者登入。要開放給所有人使用，需要提交應用程式審查。

---

## LINE Login 設定

### 步驟 1：註冊 LINE Developers 帳號

1. 前往 [LINE Developers](https://developers.line.biz/)
2. 點擊右上角 **Log in to Console**
3. 使用 LINE 帳號登入
4. 如果是第一次使用，需要：
   - 同意開發者條款
   - 填寫開發者資訊

### 步驟 2：建立 Provider

1. 在 LINE Developers Console 點擊 **Create a new provider**
2. 輸入 Provider name（例如：`博幼基金會`）
3. 點擊**建立**

### 步驟 3：建立 LINE Login Channel

1. 在 Provider 頁面，選擇 **Channels** 標籤
2. 點擊 **Create a LINE Login channel**

3. 填寫 Channel 資訊：
   - **Channel type**：LINE Login
   - **Region**（地區）：選擇 Taiwan
   - **Company or owner's country or region**：Taiwan
   - **Channel name**（頻道名稱）：`博幼APP分享平臺`
   - **Channel description**（頻道說明）：
     ```
     博幼基金會教學應用分享平台，提供使用者快速分享與瀏覽教育性 HTML 應用。
     ```
   - **App types**：勾選 **Web app**
   - **Email address**：您的 email
   - **Privacy policy URL**：隱私權政策連結
   - **Terms of use URL**：服務條款連結（選填）

4. 同意相關條款
5. 點擊**建立**

### 步驟 4：設定 Callback URL

1. 在 Channel 頁面，選擇 **LINE Login** 標籤
2. 找到 **Callback URL** 欄位
3. 輸入以下 URL（每行一個）：
   ```
   http://localhost:3000/api/auth/callback/line
   https://yourdomain.com/api/auth/callback/line
   ```
4. 點擊**更新**

### 步驟 5：取得 Channel ID 和 Secret

1. 在 Channel 頁面，選擇 **Basic settings** 標籤
2. 找到：
   - **Channel ID**：`1234567890`（10 位數字）
   - **Channel secret**：點擊 **Issue** 按鈕產生，然後複製

### 步驟 6：申請 Email 權限（選填但建議）

預設情況下 LINE Login 無法取得使用者的 email。如需取得：

1. 在 Channel 頁面，選擇 **LINE Login** 標籤
2. 捲動到 **OpenID Connect** 區塊
3. 找到 **Email address permission** 欄位
4. 點擊 **Apply**
5. 填寫申請表單並提交
6. 等待 LINE 審核（通常 1-3 個工作天）

> 💡 **提示**：即使沒有 email 權限，仍可使用 LINE Login。系統會使用 LINE User ID 作為唯一識別。

### 步驟 7：發布 Channel（生產環境）

開發完成後：

1. 在 **LINE Login** 標籤底部
2. 找到 **Publish** 按鈕
3. 點擊發布，讓所有 LINE 使用者都可以登入

---

## Facebook Login 設定

### 步驟 1：建立 Meta for Developers 帳號

1. 前往 [Meta for Developers](https://developers.facebook.com/)
2. 點擊右上角 **Log In**
3. 使用 Facebook 帳號登入
4. 如果是第一次使用，需要：
   - 驗證電話號碼
   - 同意開發者條款

### 步驟 2：建立應用程式

1. 點擊右上角 **My Apps** → **Create App**
2. 選擇應用程式類型：
   - **Use case**（使用案例）：選擇 **Authenticate and request data from users with Facebook Login**
   - **App type**（應用程式類型）：**Consumer**（一般使用者）或 **Business**（商業）

3. 點擊**下一步**

4. 填寫應用程式資訊：
   - **App name**（應用程式名稱）：`博幼APP分享平臺`
   - **App contact email**：您的 email
   - **Business Account**：（選填）如果有的話

5. 點擊**建立應用程式**

### 步驟 3：設定 Facebook Login

1. 在應用程式儀表板，找到 **Facebook Login** 產品
2. 點擊 **Set up**

3. 選擇平台：**Web**

4. 填寫網站 URL：
   - **Site URL**：`https://yourdomain.com`（開發階段填 `http://localhost:3000`）

5. 點擊**儲存** → **繼續**

### 步驟 4：設定 Valid OAuth Redirect URIs

1. 在左側選單選擇 **Facebook Login** → **Settings**

2. 找到 **Valid OAuth Redirect URIs** 欄位

3. 輸入以下 URL（每行一個）：
   ```
   http://localhost:3000/api/auth/callback/facebook
   https://yourdomain.com/api/auth/callback/facebook
   ```

4. 點擊**儲存變更**

### 步驟 5：取得 App ID 和 App Secret

1. 在左側選單選擇 **Settings** → **Basic**

2. 找到：
   - **App ID**：`1234567890123456`
   - **App Secret**：點擊 **Show** 按鈕顯示，然後複製

⚠️ **安全提醒**：App Secret 非常敏感，請妥善保管！

### 步驟 6：設定應用程式權限

1. 在左側選單選擇 **App Review** → **Permissions and Features**

2. 確認以下權限已啟用：
   - `public_profile`（預設啟用）
   - `email`（預設啟用）

> 💡 **提示**：如需更多權限（如 user_birthday），需要提交審查。

### 步驟 7：開發與生產模式

**開發模式**（Development Mode）：
- 僅限應用程式角色（管理員、開發者、測試者）登入
- 不需審查即可使用

**生產模式**（Live Mode）：
1. 在左側選單選擇 **Settings** → **Basic**
2. 捲動到底部
3. 填寫必要資訊：
   - **Privacy Policy URL**（隱私權政策）
   - **Terms of Service URL**（服務條款，選填）
   - **User Data Deletion**（使用者資料刪除說明）
4. 切換到 **App Review** → **Requests**
5. 點擊 **Switch to Live**

⚠️ **重要**：生產模式無法使用 `localhost` URLs，必須使用 HTTPS 網域。

### 步驟 8：新增測試使用者（開發階段）

1. 在左側選單選擇 **Roles** → **Test Users**
2. 點擊 **Add**
3. 建立測試使用者（Facebook 會自動生成虛擬帳號）
4. 使用測試帳號進行登入測試

---

## 環境變數設定

建立或更新專案根目錄的 `.env` 檔案：

```bash
# Auth.js Secret（使用 openssl 生成）
AUTH_SECRET="your-randomly-generated-secret-here"
AUTH_ORIGIN="http://localhost:3000"  # 生產環境改為您的網域

# Google OAuth 2.0
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"

# LINE Login
LINE_CLIENT_ID="1234567890"
LINE_CLIENT_SECRET="xxxxx"

# Facebook Login
FACEBOOK_CLIENT_ID="1234567890123456"
FACEBOOK_CLIENT_SECRET="xxxxx"
```

### 生成 AUTH_SECRET

在終端機執行：

```bash
openssl rand -base64 32
```

複製輸出的字串到 `AUTH_SECRET`。

### 生產環境設定

生產環境（如 Vercel、Netlify、AWS 等）：

1. 在平台的環境變數設定頁面新增上述變數
2. 確保 `AUTH_ORIGIN` 設定為您的正式網域（含 HTTPS）
3. 各 OAuth provider 的 redirect URIs 也要更新為正式網域

---

## 測試與驗證

### 本地測試

1. 啟動開發伺服器：
   ```bash
   pnpm dev
   ```

2. 開啟瀏覽器前往：`http://localhost:3000/login`

3. 測試各個登入按鈕：
   - **Google 登入**：應該跳轉到 Google 授權頁面
   - **LINE 登入**：應該跳轉到 LINE 授權頁面
   - **Facebook 登入**：應該跳轉到 Facebook 授權頁面

4. 授權後應該：
   - 自動重定向回應用程式
   - 顯示登入成功
   - Header 顯示使用者頭像和名稱

### 檢查資料庫

登入成功後，檢查資料庫：

```sql
-- 檢查使用者是否建立
SELECT id, email, username, email_verified, image
FROM users
WHERE email = '你的email';

-- 檢查 OAuth 帳號是否連結
SELECT user_id, provider, provider_account_id
FROM accounts
WHERE user_id = '上面查到的user_id';
```

### 常見錯誤排查

#### 錯誤 1：Redirect URI mismatch

**錯誤訊息**：
```
Error: redirect_uri_mismatch
```

**解決方案**：
1. 檢查各 OAuth provider 設定的 redirect URI 是否完全符合
2. 確認 protocol（http/https）、domain、port、path 都正確
3. 不要有多餘的斜線或空格

#### 錯誤 2：Invalid Client

**錯誤訊息**：
```
Error: invalid_client
```

**解決方案**：
1. 檢查 Client ID 和 Client Secret 是否正確複製
2. 確認沒有多餘的空格或換行
3. 確認環境變數名稱正確

#### 錯誤 3：Access Denied

**錯誤訊息**：
```
Error: access_denied
```

**解決方案**：
1. **Google**：檢查是否已加入測試使用者（未發布的應用程式）
2. **Facebook**：確認應用程式處於開發模式，或已切換到生產模式
3. **LINE**：確認 Channel 已發布

#### 錯誤 4：Email not returned

**現象**：使用者登入成功但沒有 email

**解決方案**：
- **Google**：確認 scope 包含 `email`
- **LINE**：申請 email 權限（需審核）
- **Facebook**：確認請求了 `email` 權限

---

## 安全性最佳實踐

### 1. 保護敏感資訊

✅ **應該做的**：
- 將所有 secrets 儲存在環境變數
- 使用 `.gitignore` 忽略 `.env` 檔案
- 生產環境使用平台的 secrets 管理服務
- 定期輪換 Client Secrets

❌ **不應該做的**：
- 將 secrets 硬編碼在程式碼中
- 提交 `.env` 到版本控制
- 在客戶端（前端）暴露 secrets
- 在公開的文件或 issue 中分享 secrets

### 2. Redirect URI 限制

✅ **建議設定**：
```
# 開發環境
http://localhost:3000/api/auth/callback/{provider}

# 正式環境
https://yourdomain.com/api/auth/callback/{provider}
https://www.yourdomain.com/api/auth/callback/{provider}
```

❌ **避免使用**：
```
# 太寬鬆的設定
http://*.yourdomain.com/*
https://*
```

### 3. HTTPS 要求

- **開發環境**：可使用 HTTP（僅限 localhost）
- **正式環境**：必須使用 HTTPS
- 考慮使用 [Let's Encrypt](https://letsencrypt.org/) 免費 SSL 憑證

### 4. CSRF 保護

✅ 本專案已實作：
- Auth.js 內建 CSRF token 驗證
- Session cookie 使用 `sameSite: 'lax'`
- Cookie 設定 `httpOnly: true`

### 5. Rate Limiting

✅ 本專案已實作：
- 一般 API：60 requests/min（未登入）
- 認證 endpoints：5 requests/min
- 基於 IP 的限制（防止暴力破解）

---

## 常見問題

### Q1：可以同時使用三種 OAuth provider 嗎？

**A**：可以。本專案支援同時啟用多種登入方式。使用者可以選擇任一方式登入。

### Q2：相同 email 的不同 OAuth 帳號會怎樣？

**A**：系統會自動合併。例如：
1. 使用者用 Google 登入（email: user@example.com）
2. 之後用 Facebook 登入（同樣 email）
3. 系統會將 Facebook 帳號連結到同一個使用者

### Q3：如果 LINE 沒有 email 怎麼辦？

**A**：
- LINE 預設不提供 email
- 系統會使用 LINE User ID 作為唯一識別
- 如需 email，必須向 LINE 申請權限（需審核）

### Q4：開發階段可以不用 HTTPS 嗎？

**A**：
- **Google**：localhost 可以使用 HTTP
- **LINE**：localhost 可以使用 HTTP
- **Facebook**：開發模式可以使用 HTTP（僅限 localhost）

生產環境必須使用 HTTPS。

### Q5：測試使用者有什麼限制？

**A**：
- **Google**：未發布的應用程式僅限測試使用者登入（最多 100 人）
- **Facebook**：開發模式僅限應用程式角色登入（管理員、開發者、測試者）
- **LINE**：未發布的 Channel 所有人都可以登入，但會顯示警告

### Q6：如何新增更多 OAuth providers？

**A**：Auth.js 支援 80+ providers。新增步驟：
1. 安裝對應的 provider（如果需要）
2. 在 `server/api/auth/[...].ts` 新增 provider
3. 設定環境變數
4. 在前端新增登入按鈕

支援的 providers：[Auth.js Providers](https://authjs.dev/getting-started/providers)

### Q7：OAuth 登入會儲存什麼資料？

**A**：本專案儲存：
- **users 表**：id, email, username, image, email_verified
- **accounts 表**：provider, provider_account_id, tokens

不會儲存：
- 密碼（OAuth 使用者）
- 完整的 access token（僅用於初始認證）

### Q8：使用者可以解除 OAuth 連結嗎？

**A**：目前尚未實作。未來可以新增「帳號設定」頁面讓使用者：
- 查看已連結的 OAuth 帳號
- 解除特定 OAuth 連結
- 綁定新的 OAuth 帳號

---

## 參考資源

### 官方文檔

**Google OAuth 2.0**：
- [Using OAuth 2.0 to Access Google APIs](https://developers.google.com/identity/protocols/oauth2)
- [Setting up OAuth 2.0](https://support.google.com/googleapi/answer/6158849)
- [Configure the OAuth consent screen](https://developers.google.com/workspace/guides/configure-oauth-consent)

**LINE Login**：
- [Getting started with LINE Login](https://developers.line.biz/en/docs/line-login/getting-started/)
- [Integrating LINE Login with your web app](https://developers.line.biz/en/docs/line-login/integrate-line-login/)
- [LINE Developers Console](https://developers.line.biz/console/)

**Facebook Login**：
- [Meta for Developers](https://developers.facebook.com/)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Manually Build a Login Flow](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/)

**Auth.js**：
- [Auth.js Documentation](https://authjs.dev/)
- [Auth.js Google Provider](https://authjs.dev/getting-started/providers/google)
- [Auth.js LINE Provider](https://authjs.dev/getting-started/providers/line)
- [Auth.js Facebook Provider](https://authjs.dev/getting-started/providers/facebook)

### 本專案文檔

- [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) - 完整實作計劃
- [MIGRATION_004_TEST_REPORT.md](../MIGRATION_004_TEST_REPORT.md) - 資料庫 migration 測試報告

### 社群資源

- [Auth.js Discord](https://discord.gg/authjs)
- [Stack Overflow - oauth](https://stackoverflow.com/questions/tagged/oauth)
- [Google Cloud Community](https://www.googlecloudcommunity.com/)

---

## 支援與回饋

如果您在設定過程中遇到問題：

1. 檢查本指南的[常見問題](#常見問題)區塊
2. 查看各 OAuth provider 的官方文檔
3. 在專案 GitHub repo 開 issue
4. 聯繫開發團隊

---

**最後更新**：2025-12-15
**版本**：1.0.0
**維護者**：博幼APP分享平臺開發團隊
