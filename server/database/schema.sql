-- AI App Share - Database Schema
-- PostgreSQL 15+

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255),  -- 可選（OAuth 使用者不需要密碼）
  avatar_url TEXT,
  bio TEXT,
  email_verified BOOLEAN DEFAULT FALSE,  -- Email 是否已驗證
  image TEXT,  -- OAuth provider 提供的頭像 URL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

COMMENT ON COLUMN users.password_hash IS '密碼雜湊（OAuth 使用者可為 NULL）';
COMMENT ON COLUMN users.email_verified IS 'Email 是否已驗證（OAuth 使用者自動為 true）';
COMMENT ON COLUMN users.image IS 'OAuth provider 提供的頭像 URL（優先於 avatar_url）';

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

-- Accounts Table (OAuth Provider 連結)
CREATE TABLE accounts (
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

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_provider ON accounts(provider);
CREATE INDEX idx_accounts_provider_account_id ON accounts(provider_account_id);

COMMENT ON TABLE accounts IS 'OAuth provider accounts 連結表';
COMMENT ON COLUMN accounts.type IS 'Account 類型：oauth, email, credentials';
COMMENT ON COLUMN accounts.provider IS 'Provider 名稱：google, line, facebook, credentials';
COMMENT ON COLUMN accounts.provider_account_id IS 'OAuth provider 端的使用者 ID';

-- Sessions Table (Auth.js Session 管理)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_session_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires ON sessions(expires);

COMMENT ON TABLE sessions IS 'Auth.js 使用者 session 管理';
COMMENT ON COLUMN sessions.session_token IS 'Session token（唯一識別）';

-- Verification Tokens Table (Email 驗證和密碼重設)
CREATE TABLE verification_tokens (
  identifier VARCHAR(255) NOT NULL,  -- email address
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (identifier, token)
);

CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_verification_tokens_expires ON verification_tokens(expires);

COMMENT ON TABLE verification_tokens IS 'Email 驗證和密碼重設 token';
COMMENT ON COLUMN verification_tokens.identifier IS '通常是使用者的 email';
COMMENT ON COLUMN verification_tokens.token IS '驗證或重設 token（UUID）';

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
