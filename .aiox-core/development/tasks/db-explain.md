# Task: EXPLAIN (ANALYZE, BUFFERS)

**Purpose**: Run detailed query plan analysis to assess performance

**Elicit**: true

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
task: dbExplain()
responsável: Dara (Sage)
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: query
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Valid SQL query

- campo: params
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Query parameters

- campo: connection
  tipo: object
  origem: config
  obrigatório: true
  validação: Valid PostgreSQL connection via Supabase

**Saída:**
- campo: query_result
  tipo: array
  destino: Memory
  persistido: false

- campo: records_affected
  tipo: number
  destino: Return value
  persistido: false

- campo: execution_time
  tipo: number
  destino: Memory
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Database connection established; query syntax valid
    tipo: pre-condition
    blocker: true
    validação: |
      Check database connection established; query syntax valid
    error_message: "Pre-condition failed: Database connection established; query syntax valid"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Query executed; results returned; transaction committed
    tipo: post-condition
    blocker: true
    validação: |
      Verify query executed; results returned; transaction committed
    error_message: "Post-condition failed: Query executed; results returned; transaction committed"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Data persisted correctly; constraints respected; no orphaned data
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert data persisted correctly; constraints respected; no orphaned data
    error_message: "Acceptance criterion not met: Data persisted correctly; constraints respected; no orphaned data"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** supabase
  - **Purpose:** PostgreSQL database connection via Supabase client
  - **Source:** @supabase/supabase-js

- **Tool:** query-validator
  - **Purpose:** SQL query syntax validation
  - **Source:** .aiox-core/utils/db-query-validator.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** db-query.js
  - **Purpose:** Execute PostgreSQL queries with error handling via Supabase
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/db-query.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Connection Failed
   - **Cause:** Unable to connect to Neo4j database
   - **Resolution:** Check connection string, credentials, network
   - **Recovery:** Retry with exponential backoff (max 3 attempts)

2. **Error:** Query Syntax Error
   - **Cause:** Invalid Cypher query syntax
   - **Resolution:** Validate query syntax before execution
   - **Recovery:** Return detailed syntax error, suggest fix

3. **Error:** Transaction Rollback
   - **Cause:** Query violates constraints or timeout
   - **Resolution:** Review query logic and constraints
   - **Recovery:** Automatic rollback, preserve data integrity

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-10 min (estimated)
cost_estimated: $0.001-0.008
token_usage: ~800-2,500 tokens
```

**Optimization Notes:**
- Validate configuration early; use atomic writes; implement rollback checkpoints

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - database
  - infrastructure
updated_at: 2025-11-17
```

---


## Inputs

- `sql` (string): SQL query to analyze

---

## Process

### 1. Confirm Query

Ask user:
- Query to analyze
- Expected result count (approximate)
- Known performance issues?

### 2. Run EXPLAIN ANALYZE

Execute with full analysis options:

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<SQL
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT TEXT)
{sql};
SQL
```

### 3. Interpret Results

Present key metrics:

```
=== Query Performance Analysis ===

Execution Time: X.XX ms
Planning Time: Y.YY ms
Total Time: Z.ZZ ms

Buffers:
  - Shared Hit: XXX (cache hits)
  - Shared Read: YYY (disk reads)
  - Temp Read/Written: ZZZ (temp files)

Cost: XXX.XX..YYY.YY
Rows: Estimated XXX, Actual YYY
```

---

## Understanding EXPLAIN Output

### Top-Level Metrics

**Planning Time**
- Time spent planning query
- High value (>100ms) suggests complex query or missing statistics

**Execution Time**
- Actual query execution time
- This is what users experience

**Total Cost**
- Estimated cost units (not milliseconds)
- Higher = more expensive
- Compare different query versions

### Node Types (Common Patterns)

**Seq Scan** (Sequential Scan)
- 🔴 Reads entire table
- Slow for large tables
- **Fix**: Add index if filtering rows

**Index Scan**
- ✅ Uses index to find rows
- Fast for selective queries
- Good when returning few rows

**Index Only Scan**
- ✅✅ Best case - reads only index
- No table access needed
- Requires VACUUM to update visibility map

**Bitmap Heap Scan**
- ✅ Good for medium selectivity
- Combines multiple indexes
- Better than multiple index scans

**Nested Loop**
- Good for small result sets
- Joins by iterating
- Can be slow with large data

**Hash Join**
- Good for large result sets
- Builds hash table in memory
- Fast for equi-joins

**Merge Join**
- Good for sorted inputs
- Efficient for large sorted data
- Requires sorted inputs (or sorts them)

### Buffer Analysis

**Shared Hits** (Good)
- Data found in cache
- No disk I/O needed
- High ratio = good caching

**Shared Reads** (Bad if high)
- Data read from disk
- Slow compared to cache
- High ratio = cache misses

**Temp Read/Written** (Bad)
- Using temp disk files
- Memory insufficient
- Often due to large sorts/hashes

---

## Common Performance Issues

### Issue 1: Sequential Scan on Large Table

```
Seq Scan on fragments  (cost=0.00..10000 rows=1000000)
  Filter: (user_id = '...')
```

**Problem**: Scanning entire table  
**Impact**: Slow for large tables  
**Fix**: Create index

```sql
CREATE INDEX idx_fragments_user_id ON fragments(user_id);
```

### Issue 2: Missing Index on Join

```
Nested Loop  (cost=0.00..50000)
  -> Seq Scan on users
  -> Seq Scan on fragments
       Filter: (fragments.user_id = users.id)
```

**Problem**: No index for join condition  
**Impact**: Quadratic complexity  
**Fix**: Index foreign key

```sql
CREATE INDEX idx_fragments_user_id ON fragments(user_id);
```

### Issue 3: High Temp File Usage

```
Sort  (cost=10000..12000)
  Sort Key: created_at DESC
  Sort Method: external merge  Disk: 5000kB
```

**Problem**: Sorting spills to disk  
**Impact**: Much slower than in-memory  
**Fix**: Increase work_mem or add index

```sql
-- Option 1: Increase memory (session)
SET work_mem = '64MB';

-- Option 2: Add index to avoid sort
CREATE INDEX idx_fragments_created_at ON fragments(created_at DESC);
```

### Issue 4: Poor Row Estimate

```
Seq Scan on users  (cost=0.00..100 rows=10 actual rows=10000)
```

**Problem**: Estimated 10 rows, actually 10,000  
**Impact**: Wrong join strategy chosen  
**Fix**: Update statistics

```sql
ANALYZE users;
-- Or more aggressive:
VACUUM ANALYZE users;
```

### Issue 5: Slow RLS Policy

```
Seq Scan on fragments  (cost=0.00..10000 rows=500000)
  Filter: ((user_id = auth.uid()) AND (deleted_at IS NULL))
  Rows Removed by Filter: 499990
```

**Problem**: RLS policy not using index  
**Impact**: Scans all rows to apply policy  
**Fix**: Index RLS policy columns

```sql
CREATE INDEX idx_fragments_user_id_not_deleted 
ON fragments(user_id) 
WHERE deleted_at IS NULL;
```

---

## Optimization Workflow

### 1. Baseline

Run current query:
```bash
*explain "SELECT * FROM table WHERE ..."
```

Note execution time and plan.

### 2. Hypothesize

What might be slow?
- Sequential scans?
- Missing indexes?
- Sort/hash spills?
- Poor statistics?

### 3. Test Fix

Apply potential fix:
```sql
CREATE INDEX ...;
-- or
VACUUM ANALYZE table;
-- or
SET work_mem = '...';
```

### 4. Re-Measure

Run explain again:
```bash
*explain "SELECT * FROM table WHERE ..."
```

Compare:
- Execution time improved?
- Plan changed as expected?
- Cost reduced?

### 5. Iterate

Repeat until performance acceptable.

---

## Advanced Options

### Compare Different Queries

```bash
# Option A
*explain "SELECT * FROM users WHERE status = 'active'"

# Option B (rewritten)
*explain "SELECT * FROM users WHERE deleted_at IS NULL AND status = 'active'"
```

Pick query with better plan.

### Analyze Hot Paths

For critical queries, analyze under load:

```sql
-- Run multiple times to warm cache
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;

-- Check consistency of execution time
```

### Export Plan for Analysis

```bash
psql "$SUPABASE_DB_URL" -qAt -c \
"EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT ..." \
> query_plan.json
```

Upload to: https://explain.depesz.com or https://explain.dalibo.com

---

## Performance Targets

### Response Time Goals

**Interactive queries**: < 100ms  
**Reports**: < 1s  
**Batch/Background**: < 5s  

**If slower:**
- Check for sequential scans
- Add/optimize indexes
- Consider caching
- Optimize RLS policies

### Cache Hit Ratio

**Goal**: > 95% shared hits

```sql
-- Check overall cache hit ratio
SELECT 
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) AS cache_hit_ratio
FROM pg_statio_user_tables;
```

**If low:**
- Increase shared_buffers (DBA task)
- Query optimization needed
- Consider query pattern changes

---

## When to Use EXPLAIN

**Always:**
- New query in production code
- After schema changes
- When adding indexes
- RLS policy changes

**Reactive:**
- Slow query reports
- Performance degradation
- High database load
- Before optimization attempts

**Never:**
- For queries already known to be fast
- On queries with no data yet (stats unreliable)
- Without ANALYZE if you need actual timing

---

## Limitations

### EXPLAIN ANALYZE Runs Query

⚠️ **Warning**: ANALYZE actually executes query

**Safe:**
- SELECT queries
- Read-only queries

**Dangerous:**
- INSERT/UPDATE/DELETE (use transaction + rollback)
- Queries with side effects

```sql
-- Safe way to EXPLAIN write queries
BEGIN;
EXPLAIN ANALYZE DELETE FROM ...;
ROLLBACK;  -- Undo changes
```

### Statistics May Be Stale

Plans based on table statistics:
- Updated by VACUUM/ANALYZE
- May not reflect current data
- Run ANALYZE if estimates way off

### Plan Can Change

Plans vary based on:
- Data distribution
- Table size
- Server configuration
- Cache state
- Time of day (load)

---

## Integration with Workflow

Query optimization workflow:

1. Find slow query (logs, monitoring)
2. `*explain "SELECT ..."` - Baseline
3. Analyze plan (sequential scans? missing indexes?)
4. Hypothesize fix
5. Apply fix in dev
6. `*explain "SELECT ..."` - Verify improvement
7. Test with real data volume
8. Deploy to production
9. Monitor actual performance

---

## Resources

**Visualization Tools:**
- https://explain.depesz.com
- https://explain.dalibo.com
- https://tatiyants.com/pev/

**Documentation:**
- PostgreSQL EXPLAIN: https://www.postgresql.org/docs/current/sql-explain.html
- Using EXPLAIN: https://www.postgresql.org/docs/current/using-explain.html

**Related Commands:**
- `*analyze-hotpaths` - Check common query patterns
- `*design-indexes` - Plan index strategy
- `*rls-audit` - Check RLS policy performance
