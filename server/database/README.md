# 資料庫管理

## 初始化資料庫

```bash
# 連接到 PostgreSQL
psql $DATABASE_URL

# 執行 schema
\i server/database/schema.sql
```

## 執行效能優化遷移

```bash
# 執行效能優化遷移
psql $DATABASE_URL -f server/database/migrations/001_performance_optimization.sql
```

## 效能優化說明

### 1. 索引優化

**Apps 表索引**：
- `idx_apps_view_count` - 優化按瀏覽次數排序
- `idx_apps_like_count` - 優化按點讚數排序
- `idx_apps_is_public_created_at` - 優化公開 Apps 按時間排序（部分索引）
- `idx_apps_is_public_view_count` - 優化熱門公開 Apps 查詢（部分索引）
- `idx_apps_category_created_at` - 優化分類篩選查詢
- `idx_apps_search` - 全文搜索索引（GIN 索引）

**Comments 表索引**：
- `idx_comments_app_id_created_at` - 優化評論列表查詢
- `idx_comments_user_id_created_at` - 優化使用者評論歷史

**Ratings 表索引**：
- `idx_ratings_user_id_app_id` - 優化使用者評分查詢

### 2. 自動更新時間戳

為以下表格添加自動更新 `updated_at` 觸發器：
- `users`
- `apps`
- `comments`

### 3. 物化視圖

`apps_with_stats_mv` - 預先計算的 Apps 統計資料

**刷新物化視圖**：
```bash
# 手動刷新
psql $DATABASE_URL -c "SELECT refresh_apps_stats();"

# 或使用 SQL
REFRESH MATERIALIZED VIEW CONCURRENTLY apps_with_stats_mv;
```

**建議設置定期刷新（使用 pg_cron）**：
```sql
-- 每 5 分鐘刷新一次
SELECT cron.schedule('refresh-apps-stats', '*/5 * * * *', $$SELECT refresh_apps_stats()$$);
```

### 4. 查詢優化建議

**使用物化視圖進行列表查詢**：
```sql
-- 不好的做法（每次都計算）
SELECT * FROM apps_with_stats WHERE is_public = TRUE ORDER BY created_at DESC;

-- 好的做法（使用預先計算的資料）
SELECT * FROM apps_with_stats_mv WHERE is_public = TRUE ORDER BY created_at DESC;
```

**使用全文搜索**：
```sql
-- 使用 GIN 索引進行全文搜索
SELECT * FROM apps
WHERE to_tsvector('english', title || ' ' || COALESCE(description, ''))
  @@ plainto_tsquery('english', 'search query');
```

## 監控與維護

### 查看索引使用情況

```sql
-- 查看表格的索引使用統計
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### 查看表格大小

```sql
-- 查看表格和索引大小
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 分析慢查詢

```sql
-- 啟用查詢日誌（需要超級用戶權限）
ALTER DATABASE your_database SET log_min_duration_statement = 1000; -- 記錄超過 1 秒的查詢

-- 查看當前執行的查詢
SELECT pid, age(clock_timestamp(), query_start), usename, query
FROM pg_stat_activity
WHERE query != '<IDLE>' AND query NOT ILIKE '%pg_stat_activity%'
ORDER BY query_start DESC;
```

## 備份與還原

```bash
# 備份
pg_dump $DATABASE_URL > backup.sql

# 還原
psql $DATABASE_URL < backup.sql
```
