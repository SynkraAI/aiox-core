# Task: RLS Audit

**Purpose**: Report tables with/without RLS and list all policies

**Elicit**: false

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
task: dbRlsAudit()
responsável: Dara (Sage)
responsavel_type: Agente
atomic_layer: Strategy

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

- **Tool:** neo4j-driver
  - **Purpose:** Neo4j database connection and query execution
  - **Source:** npm: neo4j-driver

- **Tool:** query-validator
  - **Purpose:** Cypher query syntax validation
  - **Source:** .aiox-core/utils/db-query-validator.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** db-query.js
  - **Purpose:** Execute Neo4j queries with error handling
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
  - database
  - infrastructure
updated_at: 2025-11-17
```

---


## Process

### Run Comprehensive RLS Audit

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== RLS Coverage Audit ==='
\echo ''

-- Tables with/without RLS
WITH t AS (
  SELECT tablename, rowsecurity
  FROM pg_tables WHERE schemaname='public'
)
SELECT
  tablename,
  CASE WHEN rowsecurity THEN '✓ ENABLED' ELSE '❌ DISABLED' END AS rls_status,
  (SELECT json_agg(json_build_object(
    'policy', policyname,
    'cmd', cmd,
    'roles', roles,
    'qual', qual,
    'with_check', with_check
  ))
   FROM pg_policies p 
   WHERE p.tablename=t.tablename 
   AND p.schemaname='public') AS policies
FROM t
ORDER BY rowsecurity DESC, tablename;

\echo ''
\echo '=== Summary ==='

SELECT 
  COUNT(*) AS total_tables,
  COUNT(*) FILTER (WHERE rowsecurity) AS rls_enabled,
  COUNT(*) FILTER (WHERE NOT rowsecurity) AS rls_disabled
FROM pg_tables 
WHERE schemaname='public';

\echo ''
\echo '=== Tables Without RLS (Security Risk) ==='

SELECT tablename 
FROM pg_tables 
WHERE schemaname='public' 
AND rowsecurity = false
ORDER BY tablename;

\echo ''
\echo '=== Policy Coverage ==='

SELECT 
  t.tablename,
  COUNT(p.policyname) AS policy_count,
  ARRAY_AGG(p.cmd) AS commands_covered
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
AND t.rowsecurity = true
GROUP BY t.tablename
ORDER BY policy_count, t.tablename;

SQL
```

---

## Output Interpretation

### RLS Status

**✓ ENABLED** - Table has RLS active (good)  
**❌ DISABLED** - Table has no RLS (security risk)

### Policy Coverage

**Good coverage:**
- 1 policy with `FOR ALL` (KISS approach), OR
- 4 policies covering SELECT, INSERT, UPDATE, DELETE (granular)

**Incomplete coverage:**
- Enabled RLS but 0 policies = nobody can access
- 1-3 policies (granular) = some operations not covered

**No coverage:**
- RLS disabled = full access without restrictions

---

## Common Issues & Fixes

### Issue: Table has RLS but no policies

**Problem**: RLS enabled but no policies defined  
**Impact**: Table is inaccessible to all users  
**Fix**: Add policies or disable RLS

```sql
-- Add KISS policy
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "table_name_all"
ON table_name FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

Or use: `*policy-apply table_name kiss`

### Issue: Table has no RLS

**Problem**: Table accessible without restrictions  
**Impact**: Security vulnerability, data exposure  
**Fix**: Enable RLS and add policies

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
-- Then add policies
```

### Issue: Incomplete policy coverage (granular)

**Problem**: RLS enabled with 1-3 policies (not covering all operations)  
**Impact**: Some operations may be blocked unexpectedly  
**Fix**: Either add missing policies or switch to KISS approach

---

## Recommended Actions

### For Public Data
Tables that should be publicly readable:

```sql
-- Public read, authenticated write
CREATE POLICY "public_read"
ON table_name FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "authenticated_write"
ON table_name FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

### For User-Owned Data
Use KISS policy:

```bash
*policy-apply table_name kiss
```

### For Multi-Tenant Data
Organization-scoped access:

```sql
CREATE POLICY "org_isolation"
ON table_name FOR ALL
TO authenticated
USING (org_id = (auth.jwt() ->> 'org_id')::uuid)
WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
```

---

## Testing RLS Policies

After fixing issues, test with:

```bash
*impersonate {user_id}
# Then run queries to verify access
```

---

## Best Practices

✅ **Enable RLS on all tables with sensitive data**  
✅ **Use KISS policies for simple owner-based access**  
✅ **Document why RLS is disabled if intentional**  
✅ **Test policies with real user contexts**  
✅ **Index columns used in RLS policies**  
✅ **Run this audit after every migration**

❌ **Don't enable RLS without policies**  
❌ **Don't use service role to bypass RLS in app code**  
❌ **Don't forget to test negative cases**

---

## Integration with Workflow

Run RLS audit:
1. After migrations: `*smoke-test` → `*rls-audit`
2. Before production deploy: `*rls-audit`
3. Regular security reviews: `*rls-audit`
4. When adding new tables: `*rls-audit`
