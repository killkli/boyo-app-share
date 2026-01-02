-- Migration 005: Add user status field
-- 新增用戶狀態欄位，用於管理員禁用/啟用帳號

-- 新增 is_active 欄位，預設為 true
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 建立索引以加速查詢
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- 註解
COMMENT ON COLUMN users.is_active IS '用戶帳號是否啟用（false 表示被管理員禁用）';
