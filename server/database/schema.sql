-- AI App Share - Database Schema
-- PostgreSQL 15+

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
