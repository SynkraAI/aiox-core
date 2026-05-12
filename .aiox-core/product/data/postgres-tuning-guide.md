# PostgreSQL Performance Tuning Guide

**Purpose:** Reference guide for PostgreSQL performance optimization
**Agent:** Dan (Data Engineer)
**Standard:** Production-ready PostgreSQL configurations

---

## CONFIGURATION TUNING

### Memory Settings

#### shared_buffers
- **Purpose:** Shared memory for caching data
- **Recommendation:** 25% of total RAM (max ~8GB for most workloads)
```sql
-- Check current value
SHOW shared_buffers;

-- Example: 8GB RAM system
-- Set to 2GB (in postgresql.conf)
shared_buffers = 2GB
```

#### effective_cache_size
- **Purpose:** Planner's estimate of available cache
- **Recommendation:** 50-75% of total RAM
```sql
-- Example: 8GB RAM system
effective_cache_size = 6GB
```

#### work_mem
- **Purpose:** Memory per operation (sort, hash)
- **Recommendation:** total_ram / max_connections / 4
- **Caution:** Set too high can cause memory exhaustion
```sql
-- Example: 8GB RAM, 100 connections
work_mem = 20MB

-- For specific queries needing more
SET work_mem = '256MB';
-- Run query
RESET work_mem;
```

#### maintenance_work_mem
- **Purpose:** Memory for maintenance operations (VACUUM, CREATE INDEX)
- **Recommendation:** 256MB-1GB depending on RAM
```sql
maintenance_work_mem = 512MB
```

---

## CONNECTION POOLING

### Why Pool Connections
- PostgreSQL forks a process per connection (~10MB each)
- Too many connections = memory exhaustion
- Connection overhead is significant

### PgBouncer Configuration
```ini
[databases]
mydb = host=localhost port=5432 dbname=mydb

[pgbouncer]
listen_port = 6432
listen_addr = *
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
min_pool_size = 5
reserve_pool_size = 5
```

### Pool Modes
- **session:** Connection held until client disconnects
- **transaction:** Connection returned after transaction (recommended)
- **statement:** Connection returned after each statement

### Supabase Connection Pooling
- Built-in Supavisor pooler
- Use pooler URL for application connections
- Use direct URL for migrations only

---

## QUERY OPTIMIZATION

### EXPLAIN ANALYZE
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders
WHERE customer_id = 123
ORDER BY created_at DESC
LIMIT 10;
```

### Key Metrics to Watch
- **Seq Scan:** Full table scan (may indicate missing index)
- **Rows Removed by Filter:** High count = inefficient query
- **Buffers:** Shared hit (cache) vs read (disk)
- **Actual Time:** Startup time vs total time

### Common Optimizations

#### Add Missing Indexes
```sql
-- Before: Seq Scan on orders
EXPLAIN SELECT * FROM orders WHERE customer_id = 123;

-- Add index
CREATE INDEX idx_orders_customer_id ON orders(customer_id);

-- After: Index Scan on idx_orders_customer_id
```

#### Use Covering Indexes
```sql
-- Query
SELECT email, name FROM users WHERE email = 'test@example.com';

-- Covering index (includes all columns needed)
CREATE INDEX idx_users_email_covering ON users(email) INCLUDE (name);
```

#### Partial Indexes
```sql
-- Only index active users
CREATE INDEX idx_users_active ON users(email)
WHERE is_active = true;
```

---

## VACUUM AND MAINTENANCE

### Autovacuum Tuning
```sql
-- Check autovacuum stats
SELECT schemaname, relname, n_dead_tup, last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;

-- Per-table settings for high-churn tables
ALTER TABLE high_churn_table SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);
```

### Manual Maintenance
```sql
-- Analyze table statistics
ANALYZE table_name;

-- Vacuum (reclaim space)
VACUUM table_name;

-- Vacuum + analyze
VACUUM ANALYZE table_name;

-- Full vacuum (locks table, rewrites)
VACUUM FULL table_name;  -- Use with caution
```

### Reindex
```sql
-- Rebuild bloated index (non-blocking)
REINDEX INDEX CONCURRENTLY idx_name;

-- Rebuild all indexes on table
REINDEX TABLE CONCURRENTLY table_name;
```

---

## MONITORING QUERIES

### Find Slow Queries
```sql
-- Enable pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 slowest queries
SELECT
  calls,
  round(total_exec_time::numeric, 2) as total_ms,
  round(mean_exec_time::numeric, 2) as avg_ms,
  query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Check Index Usage
```sql
-- Unused indexes
SELECT
  schemaname,
  relname,
  indexrelname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname NOT IN ('pg_catalog', 'pg_toast')
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Table Bloat
```sql
-- Check table sizes and bloat
SELECT
  schemaname,
  relname,
  n_live_tup,
  n_dead_tup,
  round(100 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_pct
FROM pg_stat_user_tables
WHERE n_dead_tup > 0
ORDER BY n_dead_tup DESC;
```

### Cache Hit Ratio
```sql
-- Should be > 99% for good performance
SELECT
  round(100 * sum(blks_hit) / sum(blks_hit + blks_read), 2) as cache_hit_ratio
FROM pg_stat_database;
```

---

## LOCKING AND CONCURRENCY

### Check Active Locks
```sql
SELECT
  l.pid,
  l.mode,
  l.granted,
  a.usename,
  a.query,
  a.state
FROM pg_locks l
JOIN pg_stat_activity a ON l.pid = a.pid
WHERE NOT l.granted;
```

### Kill Long-Running Queries
```sql
-- Find long-running queries
SELECT
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state
FROM pg_stat_activity
WHERE state != 'idle'
AND now() - pg_stat_activity.query_start > interval '5 minutes';

-- Cancel query (graceful)
SELECT pg_cancel_backend(pid);

-- Terminate connection (force)
SELECT pg_terminate_backend(pid);
```

---

## PRODUCTION CHECKLIST

### Before Go-Live
- [ ] shared_buffers configured (25% RAM)
- [ ] effective_cache_size configured (50-75% RAM)
- [ ] work_mem tuned for workload
- [ ] Connection pooling configured
- [ ] Autovacuum tuned for high-churn tables
- [ ] pg_stat_statements enabled
- [ ] Slow query logging enabled
- [ ] Backup strategy tested
- [ ] Index strategy reviewed

### Regular Maintenance
- [ ] Monitor cache hit ratio (>99%)
- [ ] Check unused indexes monthly
- [ ] Review slow query logs weekly
- [ ] Analyze table statistics after bulk loads
- [ ] Monitor table bloat
- [ ] Test backup restoration quarterly

---

**Reviewer:** ________ **Date:** ________
**Quality Gate:** [ ] PASS [ ] NEEDS REVIEW
