-- Migration 006: Add featured flag for apps
-- 新增精選標記，讓管理員可以將優質 App 設為精選

-- 新增 is_featured 欄位，預設為 false
ALTER TABLE apps ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- 建立索引以加速查詢精選 App
CREATE INDEX IF NOT EXISTS idx_apps_is_featured ON apps(is_featured) WHERE is_featured = TRUE;

-- 註解
COMMENT ON COLUMN apps.is_featured IS '是否為精選 App（由管理員設定）';
