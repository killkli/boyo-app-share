-- Migration: 添加多作者支援
-- Date: 2025-12-09
-- Description: 建立 app_creators 表以支援一個APP有多個創作者

-- 建立 app_creators 表
CREATE TABLE IF NOT EXISTS app_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  creator_name VARCHAR(100) NOT NULL,
  creator_order INTEGER DEFAULT 0,  -- 排序順序，數字越小越前面
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_app_creator UNIQUE(app_id, creator_name)
);

-- 建立索引以優化查詢效能
CREATE INDEX IF NOT EXISTS idx_app_creators_app_id ON app_creators(app_id);
CREATE INDEX IF NOT EXISTS idx_app_creators_order ON app_creators(app_id, creator_order);

-- 註解說明
COMMENT ON TABLE app_creators IS '應用程式創作者關聯表，支援多個創作者';
COMMENT ON COLUMN app_creators.creator_name IS '創作者名稱（可以不是平台使用者）';
COMMENT ON COLUMN app_creators.creator_order IS '顯示順序，數字越小越前面';
