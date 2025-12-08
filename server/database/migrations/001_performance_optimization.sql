-- Performance Optimization Migration
-- 添加複合索引優化查詢效能

-- 1. Apps 表優化
-- 為排序欄位添加索引
CREATE INDEX IF NOT EXISTS idx_apps_view_count ON apps(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_apps_like_count ON apps(like_count DESC);

-- 複合索引：公開狀態 + 創建時間（優化最新公開 Apps 查詢）
CREATE INDEX IF NOT EXISTS idx_apps_is_public_created_at
  ON apps(is_public, created_at DESC)
  WHERE is_public = TRUE;

-- 複合索引：公開狀態 + 瀏覽次數（優化熱門公開 Apps 查詢）
CREATE INDEX IF NOT EXISTS idx_apps_is_public_view_count
  ON apps(is_public, view_count DESC)
  WHERE is_public = TRUE;

-- 複合索引：分類 + 創建時間（優化分類篩選查詢）
CREATE INDEX IF NOT EXISTS idx_apps_category_created_at
  ON apps(category, created_at DESC);

-- 2. 全文搜索索引（標題和描述）
CREATE INDEX IF NOT EXISTS idx_apps_search
  ON apps USING GIN(to_tsvector('english',
    COALESCE(title, '') || ' ' || COALESCE(description, '')
  ));

-- 3. Comments 表優化
-- 複合索引：app_id + 創建時間（優化評論列表查詢）
CREATE INDEX IF NOT EXISTS idx_comments_app_id_created_at
  ON comments(app_id, created_at DESC);

-- 複合索引：user_id + 創建時間（優化使用者評論歷史查詢）
CREATE INDEX IF NOT EXISTS idx_comments_user_id_created_at
  ON comments(user_id, created_at DESC);

-- 4. Ratings 表優化
-- 複合索引：user_id + app_id（優化使用者評分查詢）
CREATE INDEX IF NOT EXISTS idx_ratings_user_id_app_id
  ON ratings(user_id, app_id);

-- 5. 自動更新 updated_at 觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為 users 表添加觸發器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 為 apps 表添加觸發器
DROP TRIGGER IF EXISTS update_apps_updated_at ON apps;
CREATE TRIGGER update_apps_updated_at
  BEFORE UPDATE ON apps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 為 comments 表添加觸發器
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. 優化 apps_with_stats view（物化視圖）
-- 注意：物化視圖需要定期刷新，可以使用 cron job
DROP MATERIALIZED VIEW IF EXISTS apps_with_stats_mv;
CREATE MATERIALIZED VIEW apps_with_stats_mv AS
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

-- 為物化視圖創建索引
CREATE UNIQUE INDEX idx_apps_with_stats_mv_id ON apps_with_stats_mv(id);
CREATE INDEX idx_apps_with_stats_mv_created_at ON apps_with_stats_mv(created_at DESC);
CREATE INDEX idx_apps_with_stats_mv_view_count ON apps_with_stats_mv(view_count DESC);
CREATE INDEX idx_apps_with_stats_mv_avg_rating ON apps_with_stats_mv(avg_rating DESC);

-- 刷新物化視圖的函數（可以由 cron 定期執行）
CREATE OR REPLACE FUNCTION refresh_apps_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY apps_with_stats_mv;
END;
$$ LANGUAGE plpgsql;
