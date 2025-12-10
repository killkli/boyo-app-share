-- Migration: 添加創作者連結欄位
-- Date: 2025-12-10
-- Description: 為 app_creators 表添加可選的創作者連結欄位

-- 添加創作者連結欄位
ALTER TABLE app_creators
ADD COLUMN creator_link VARCHAR(500);

-- 添加註解
COMMENT ON COLUMN app_creators.creator_link IS '創作者個人連結（可選，如個人網站、社群媒體等）';

-- 添加檢查約束（確保是有效的 URL 格式或為空）
ALTER TABLE app_creators
ADD CONSTRAINT check_creator_link_format
CHECK (
  creator_link IS NULL
  OR creator_link = ''
  OR creator_link ~ '^https?://.+'
);
