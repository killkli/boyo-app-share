-- 004_add_oauth_support.sql
-- 新增 OAuth 社群登入支援（Google, LINE, Facebook）

-- ============================================================
-- 1. 修改 users 表以支援 OAuth
-- ============================================================

-- 將 password_hash 改為可選（OAuth 使用者不需要密碼）
ALTER TABLE users
  ALTER COLUMN password_hash DROP NOT NULL;

-- 新增 OAuth 相關欄位
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS image TEXT;

-- 為現有使用者設定 email_verified = false（預設值）
UPDATE users
  SET email_verified = FALSE
  WHERE email_verified IS NULL;

-- 新增欄位註解
COMMENT ON COLUMN users.email_verified IS 'Email 是否已驗證（OAuth 使用者自動為 true）';
COMMENT ON COLUMN users.image IS 'OAuth provider 提供的頭像 URL（優先於 avatar_url）';

-- ============================================================
-- 2. 創建 accounts 表（儲存 OAuth provider 資訊）
-- ============================================================

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,  -- 'oauth' | 'email' | 'credentials'
  provider VARCHAR(50) NOT NULL,  -- 'google' | 'line' | 'facebook' | 'credentials'
  provider_account_id VARCHAR(255) NOT NULL,  -- OAuth provider 的 user ID
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,  -- Unix timestamp (seconds)
  token_type VARCHAR(50),
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

-- 索引優化
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider);
CREATE INDEX IF NOT EXISTS idx_accounts_provider_account_id ON accounts(provider_account_id);

COMMENT ON TABLE accounts IS 'OAuth provider accounts 連結表';
COMMENT ON COLUMN accounts.type IS 'Account 類型：oauth, email, credentials';
COMMENT ON COLUMN accounts.provider IS 'Provider 名稱：google, line, facebook, credentials';
COMMENT ON COLUMN accounts.provider_account_id IS 'OAuth provider 端的使用者 ID';
COMMENT ON COLUMN accounts.expires_at IS 'Access token 過期時間（Unix timestamp）';

-- ============================================================
-- 3. 創建 sessions 表（Auth.js session 管理）
-- ============================================================

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引優化
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires);

COMMENT ON TABLE sessions IS 'Auth.js 使用者 session 管理（database strategy）';
COMMENT ON COLUMN sessions.session_token IS 'Session token（唯一識別）';
COMMENT ON COLUMN sessions.expires IS 'Session 過期時間';

-- ============================================================
-- 4. 創建 verification_tokens 表（Email 驗證和密碼重設）
-- ============================================================

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier VARCHAR(255) NOT NULL,  -- email address
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (identifier, token)
);

-- 索引優化
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires ON verification_tokens(expires);

COMMENT ON TABLE verification_tokens IS 'Email 驗證和密碼重設 token';
COMMENT ON COLUMN verification_tokens.identifier IS '通常是使用者的 email';
COMMENT ON COLUMN verification_tokens.token IS '驗證或重設 token（UUID）';
COMMENT ON COLUMN verification_tokens.expires IS 'Token 過期時間';

-- ============================================================
-- 5. 資料清理：定期刪除過期的 sessions 和 tokens
-- ============================================================

-- 建立清理過期 sessions 的函數（可選）
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires < NOW();
END;
$$ LANGUAGE plpgsql;

-- 建立清理過期 verification tokens 的函數（可選）
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_tokens WHERE expires < NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_sessions() IS '清理過期的 sessions（建議使用 cron job 定期執行）';
COMMENT ON FUNCTION cleanup_expired_tokens() IS '清理過期的 verification tokens（建議使用 cron job 定期執行）';

-- ============================================================
-- Migration 完成
-- ============================================================

-- 驗證 migration 是否成功
DO $$
BEGIN
  -- 檢查所有表是否存在
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accounts') THEN
    RAISE EXCEPTION 'Migration failed: accounts table not created';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') THEN
    RAISE EXCEPTION 'Migration failed: sessions table not created';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'verification_tokens') THEN
    RAISE EXCEPTION 'Migration failed: verification_tokens table not created';
  END IF;

  -- 檢查 users 表的新欄位
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email_verified'
  ) THEN
    RAISE EXCEPTION 'Migration failed: users.email_verified column not created';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'image'
  ) THEN
    RAISE EXCEPTION 'Migration failed: users.image column not created';
  END IF;

  RAISE NOTICE 'Migration 004_add_oauth_support.sql completed successfully!';
END $$;
