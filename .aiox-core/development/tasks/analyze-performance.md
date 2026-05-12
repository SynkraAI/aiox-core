# Task: Analyze Performance

**Purpose**: Query performance analysis and optimization (explain plans, hotpath detection, interactive optimization)

**Elicit**: true

**Consolidated From (Story 6.1.2.3):**
- `db-explain.md` - Query execution plan analysis
- `db-analyze-hotpaths.md` - Performance bottleneck detection
- `query-optimization.md` - Interactive query optimization (if existed)

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: analyzePerformance()
responsável: Dex (Builder)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: target
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Valid path or identifier

- campo: options
  tipo: object
  origem: config
  obrigatório: false
  validação: Analysis configuration

- campo: depth
  tipo: number
  origem: User Input
  obrigatório: false
  validação: Default: 1 (0-3)

**Saída:**
- campo: analysis_report
  tipo: object
  destino: File (.ai/*.json)
  persistido: true

- campo: findings
  tipo: array
  destino: Memory
  persistido: false

- campo: metrics
  tipo: object
  destino: Memory
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Target exists and is accessible; analysis tools available
    tipo: pre-condition
    blocker: true
    validação: |
      Check target exists and is accessible; analysis tools available
    error_message: "Pre-condition failed: Target exists and is accessible; analysis tools available"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Analysis complete; report generated; no critical issues
    tipo: post-condition
    blocker: true
    validação: |
      Verify analysis complete; report generated; no critical issues
    error_message: "Post-condition failed: Analysis complete; report generated; no critical issues"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Analysis accurate; all targets covered; report complete
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert analysis accurate; all targets covered; report complete
    error_message: "Acceptance criterion not met: Analysis accurate; all targets covered; report complete"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** code-analyzer
  - **Purpose:** Static code analysis and metrics
  - **Source:** .aiox-core/utils/code-analyzer.js

- **Tool:** file-system
  - **Purpose:** Recursive directory traversal
  - **Source:** Node.js fs module

---

## Scripts

**Agent-specific code for this task:**

- **Script:** analyze-codebase.js
  - **Purpose:** Codebase analysis and reporting
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/analyze-codebase.js

---

## Error Handling

**Strategy:** fallback

**Common Errors:**

1. **Error:** Target Not Accessible
   - **Cause:** Path does not exist or permissions denied
   - **Resolution:** Verify path and check permissions
   - **Recovery:** Skip inaccessible paths, continue with accessible ones

2. **Error:** Analysis Timeout
   - **Cause:** Analysis exceeds time limit for large codebases
   - **Resolution:** Reduce analysis depth or scope
   - **Recovery:** Return partial results with timeout warning

3. **Error:** Memory Limit Exceeded
   - **Cause:** Large codebase exceeds memory allocation
   - **Resolution:** Process in batches or increase memory limit
   - **Recovery:** Graceful degradation to summary analysis

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-20 min (estimated)
cost_estimated: $0.003-0.015
token_usage: ~2,000-8,000 tokens
```

**Optimization Notes:**
- Iterative analysis with depth limits; cache intermediate results; batch similar operations

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - analysis
  - metrics
updated_at: 2025-11-17
```

---


## Elicitation

**Prompt user to select analysis type:**

```
Select performance analysis type:

1. **query** - Analyze specific query execution plan
2. **hotpaths** - Detect performance bottlenecks across system
3. **interactive** - Interactive query optimization session

Which type? [query/hotpaths/interactive]:
```

**Capture:** `{type}`

**If type=query, also prompt:**
```
Enter SQL query to analyze (or file path):
```

**Capture:** `{query}`

---

## Process

### Type: Query Analysis (EXPLAIN)

**When:** User selects `query`

**Purpose:** Analyze execution plan for specific query

#### Step 1: Validate Query

```bash
# Check if query is a file path
if [[ -f "$QUERY" ]]; then
  QUERY_SQL=$(cat "$QUERY")
else
  QUERY_SQL="$QUERY"
fi

# Validate SQL syntax (basic)
echo "$QUERY_SQL" | grep -iE '^(SELECT|WITH|EXPLAIN)' || {
  echo "❌ Error: Query must start with SELECT, WITH, or EXPLAIN"
  exit 1
}
```

#### Step 2: Run EXPLAIN ANALYZE

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<SQL
\echo '=== Query Performance Analysis ==='
\echo ''
\echo 'Query:'
\echo '$QUERY_SQL'
\echo ''
\echo '=== Execution Plan (EXPLAIN ANALYZE) ==='

EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT TEXT)
$QUERY_SQL;

\echo ''
\echo '=== JSON Format (for tools) ==='

EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
$QUERY_SQL;

SQL
```

#### Step 3: Analyze Results

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo ''
\echo '=== Performance Recommendations ==='

-- Check for sequential scans on large tables
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  CASE
    WHEN seq_scan > idx_scan THEN '⚠️ Consider adding index'
    WHEN seq_tup_read > 10000 THEN '⚠️ Large sequential scan detected'
    ELSE '✓ Looks good'
  END AS recommendation
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND (seq_scan > idx_scan OR seq_tup_read > 10000)
ORDER BY seq_tup_read DESC
LIMIT 10;

SQL
```

---

### Type: Hotpaths Analysis

**When:** User selects `hotpaths`

**Purpose:** Detect performance bottlenecks across entire system

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== Performance Hotpaths Analysis ==='
\echo ''

-- 1. Slowest Queries (requires pg_stat_statements extension)
\echo '1. Top 10 Slowest Queries:'
SELECT
  LEFT(query, 80) AS query_preview,
  calls,
  ROUND(total_exec_time::numeric / 1000, 2) AS total_seconds,
  ROUND(mean_exec_time::numeric, 2) AS avg_ms,
  ROUND((100 * total_exec_time / SUM(total_exec_time) OVER ())::numeric, 2) AS percent_total
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY total_exec_time DESC
LIMIT 10;

\echo ''
\echo '2. Most Frequent Queries:'
SELECT
  LEFT(query, 80) AS query_preview,
  calls,
  ROUND(mean_exec_time::numeric, 2) AS avg_ms,
  ROUND(total_exec_time::numeric / 1000, 2) AS total_seconds
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY calls DESC
LIMIT 10;

\echo ''
\echo '3. Tables with Most Sequential Scans:'
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  n_live_tup AS approx_rows,
  ROUND((seq_tup_read::numeric / NULLIF(seq_scan, 0)), 0) AS avg_rows_per_scan
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 10;

\echo ''
\echo '4. Tables with Bloat (Dead Tuples):'
SELECT
  schemaname,
  tablename,
  n_live_tup,
  n_dead_tup,
  ROUND((n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100), 2) AS dead_tuple_percent,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND n_dead_tup > 100
ORDER BY n_dead_tup DESC
LIMIT 10;

\echo ''
\echo '5. Missing Indexes (Foreign Keys without indexes):'
SELECT
  t.tablename,
  c.column_name,
  pg_size_pretty(pg_relation_size(t.tablename::regclass)) AS table_size,
  'CREATE INDEX idx_' || t.tablename || '_' || c.column_name || ' ON ' || t.tablename || '(' || c.column_name || ');' AS suggested_index
FROM pg_tables t
JOIN information_schema.columns c ON c.table_name = t.tablename
LEFT JOIN pg_indexes i ON i.tablename = t.tablename
  AND i.indexdef LIKE '%' || c.column_name || '%'
WHERE t.schemaname = 'public'
  AND c.table_schema = 'public'
  AND c.column_name LIKE '%_id'
  AND c.column_name != 'id'
  AND i.indexname IS NULL
ORDER BY pg_relation_size(t.tablename::regclass) DESC
LIMIT 10;

\echo ''
\echo '6. Index Usage Statistics:'
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  CASE
    WHEN idx_scan = 0 THEN '❌ Unused - consider dropping'
    WHEN idx_scan < 100 THEN '⚠️ Low usage'
    ELSE '✓ Active'
  END AS usage_status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC
LIMIT 15;

\echo ''
\echo '7. Cache Hit Ratio (should be > 99%):'
SELECT
  'Index Hit Rate' AS metric,
  ROUND((SUM(idx_blks_hit) / NULLIF(SUM(idx_blks_hit + idx_blks_read), 0) * 100)::numeric, 2) AS percentage
FROM pg_statio_user_indexes
UNION ALL
SELECT
  'Table Hit Rate' AS metric,
  ROUND((SUM(heap_blks_hit) / NULLIF(SUM(heap_blks_hit + heap_blks_read), 0) * 100)::numeric, 2) AS percentage
FROM pg_statio_user_tables;

\echo ''
\echo '8. Connection Pool Status:'
SELECT
  COUNT(*) AS total_connections,
  COUNT(*) FILTER (WHERE state = 'active') AS active,
  COUNT(*) FILTER (WHERE state = 'idle') AS idle,
  COUNT(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_transaction,
  MAX(EXTRACT(EPOCH FROM (NOW() - query_start))) AS longest_query_seconds
FROM pg_stat_activity
WHERE datname = current_database();

SQL
```

---

### Type: Interactive Optimization

**When:** User selects `interactive`

**Purpose:** Guided query optimization session

```bash
\echo '=== Interactive Query Optimization Session ==='
\echo ''
\echo 'This will guide you through optimizing a slow query.'
\echo ''

# Prompt for query
read -p "Paste your slow query: " SLOW_QUERY

# Step 1: Current performance
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<SQL
\echo ''
\echo 'Step 1: Current Performance Baseline'
\echo ''

\timing on
EXPLAIN (ANALYZE, BUFFERS)
$SLOW_QUERY;
\timing off

SQL

# Step 2: Analyze table statistics
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo ''
\echo 'Step 2: Table Statistics'
\echo ''

-- Extract table names from query (basic regex)
-- This is simplified - actual implementation would parse query
SELECT
  schemaname,
  tablename,
  n_live_tup AS row_count,
  seq_scan,
  idx_scan,
  n_tup_ins,
  n_tup_upd,
  n_tup_del,
  last_vacuum,
  last_analyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

SQL

# Step 3: Suggest indexes
\echo ''
\echo 'Step 3: Index Suggestions'
\echo ''
\echo 'Based on your query, consider these indexes:'
\echo ''
\echo '  1. Check WHERE clause columns - add index'
\echo '  2. Check JOIN columns - add composite index'
\echo '  3. Check ORDER BY columns - add index'
\echo ''
read -p "Would you like to see existing indexes? (y/n): " SHOW_INDEXES

if [[ "$SHOW_INDEXES" == "y" ]]; then
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
  SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
  FROM pg_indexes
  WHERE schemaname = 'public'
  ORDER BY tablename, indexname;
SQL
fi

# Step 4: Optimization recommendations
\echo ''
\echo 'Step 4: General Optimization Tips'
\echo ''
\echo '  ✓ Use EXPLAIN ANALYZE to understand execution'
\echo '  ✓ Add indexes on WHERE/JOIN/ORDER BY columns'
\echo '  ✓ Avoid SELECT * - specify only needed columns'
\echo '  ✓ Use LIMIT for large result sets'
\echo '  ✓ Consider materialized views for complex aggregations'
\echo '  ✓ Use connection pooling (Supabase Pooler)'
\echo '  ✓ Run VACUUM ANALYZE periodically'
\echo ''

read -p "Create index now? (y/n): " CREATE_INDEX

if [[ "$CREATE_INDEX" == "y" ]]; then
  read -p "Enter index SQL: " INDEX_SQL
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<SQL
  $INDEX_SQL;
  \echo 'Index created. Re-run EXPLAIN to see improvement.'
SQL
fi
```

---

## Output Examples

### Query Analysis Output

```
=== Query Performance Analysis ===

Query:
SELECT u.*, COUNT(p.id) FROM users u LEFT JOIN posts p ON p.user_id = u.id GROUP BY u.id;

=== Execution Plan (EXPLAIN ANALYZE) ===

 HashAggregate  (cost=1234.56..1234.78 rows=22 width=520) (actual time=12.345..12.456 rows=22 loops=1)
   ->  Hash Left Join  (cost=45.67..890.12 rows=34567 width=512) (actual time=2.345..10.123 rows=34567 loops=1)
         Hash Cond: (p.user_id = u.id)
         ->  Seq Scan on posts p  (cost=0.00..678.90 rows=34567 width=8) (actual time=0.012..5.678 rows=34567 loops=1)
         ->  Hash  (cost=23.45..23.45 rows=22 width=504) (actual time=0.234..0.234 rows=22 loops=1)
               ->  Seq Scan on users u  (cost=0.00..23.45 rows=22 width=504) (actual time=0.012..0.123 rows=22 loops=1)
 Planning Time: 1.234 ms
 Execution Time: 12.567 ms
```

### Hotpaths Output

```
=== Performance Hotpaths Analysis ===

1. Top 10 Slowest Queries:
 query_preview                                    | calls | total_seconds | avg_ms | percent_total
--------------------------------------------------+-------+---------------+--------+---------------
 SELECT * FROM large_table WHERE complex_cond...  |  1234 |        123.45 | 100.04 |         45.67
 UPDATE users SET last_seen = NOW() WHERE...     |  5678 |         67.89 |  11.95 |         25.12

... (additional output)
```

---

## Recommendations by Analysis Type

### After Query Analysis

- **Seq Scan → Index Scan:** Add index on WHERE clause columns
- **High execution time:** Consider query rewrite or caching
- **High buffer reads:** Add indexes to reduce I/O

### After Hotpaths Analysis

- **High seq_scan:** Add indexes on frequently scanned tables
- **High dead_tup:** Run VACUUM ANALYZE
- **Unused indexes:** Drop to reduce write overhead
- **Low cache hit:** Increase shared_buffers or optimize queries

### After Interactive Optimization

- Test index impact with EXPLAIN ANALYZE before/after
- Monitor query performance over time
- Document optimization decisions

---

## Related Commands

- `*security-audit` - Check for missing indexes on FKs
- `*verify-order {migration}` - Validate index creation order
- `*create-migration-plan` - Plan index additions
- `*explain {query}` - Legacy command (deprecated, use `*analyze-performance query`)

---

**Prerequisites:**

- `pg_stat_statements` extension enabled for hotpaths analysis:
  ```sql
  CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
  ```

---

**Note:** This consolidated task replaces `db-explain.md` and `db-analyze-hotpaths.md` (deprecated in v3.0)
