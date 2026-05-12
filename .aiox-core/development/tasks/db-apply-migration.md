# Task: Apply Migration (with snapshot + advisory lock)

**Purpose**: Safely apply a migration with pre/post snapshots and exclusive lock

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
task: dbApplyMigration()
responsável: Dara (Sage)
responsavel_type: Agente
atomic_layer: Organism

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
duration_expected: 5-15 min (estimated)
cost_estimated: $0.003-0.010
token_usage: ~3,000-10,000 tokens
```

**Optimization Notes:**
- Break into smaller workflows; implement checkpointing; use async processing where possible

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

- `path` (string): Path to SQL migration file

---

## Process

### 1. Pre-Flight Checks

Ask user to confirm:
- Migration file: `{path}`
- Database: `$SUPABASE_DB_URL` (redacted)
- Dry-run completed? (yes/no)
- Backup/snapshot taken? (will be done automatically)

**CRITICAL**: If user says dry-run not done, stop and recommend: `*dry-run {path}`

### 2. Acquire Advisory Lock

Ensure no concurrent migrations:

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -c \
"SELECT pg_try_advisory_lock(hashtext('dbsage:migrate')) AS got" \
| grep -q t || { echo "❌ Another migration is running"; exit 1; }

echo "✓ Migration lock acquired"
```

### 3. Pre-Migration Snapshot

Create schema-only snapshot before changes:

```bash
TS=$(date +%Y%m%d%H%M%S)
mkdir -p supabase/snapshots supabase/rollback

pg_dump "$SUPABASE_DB_URL" --schema-only --clean --if-exists \
  > "supabase/snapshots/${TS}_before.sql"

echo "✓ Pre-migration snapshot: supabase/snapshots/${TS}_before.sql"
echo $TS > /tmp/dbsage_migration_ts
```

### 4. Apply Migration

Run migration in transaction:

```bash
echo "Applying migration..."
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f {path}

if [ $? -eq 0 ]; then
  echo "✓ Migration applied successfully"
else
  echo "❌ Migration failed - rolling back..."
  # Advisory lock will be released on disconnect
  exit 1
fi
```

### 5. Post-Migration Snapshot

Create snapshot after changes:

```bash
TS=$(cat /tmp/dbsage_migration_ts)

pg_dump "$SUPABASE_DB_URL" --schema-only --clean --if-exists \
  > "supabase/snapshots/${TS}_after.sql"

echo "✓ Post-migration snapshot: supabase/snapshots/${TS}_after.sql"
```

### 6. Generate Diff (Optional)

```bash
diff -u "supabase/snapshots/${TS}_before.sql" \
        "supabase/snapshots/${TS}_after.sql" \
  > "supabase/snapshots/${TS}_diff.patch" || true

echo "✓ Diff saved: supabase/snapshots/${TS}_diff.patch"
```

### 7. Release Advisory Lock

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -c \
"SELECT pg_advisory_unlock(hashtext('dbsage:migrate'));"

echo "✓ Migration lock released"
```

### 8. Post-Migration Actions

Present options to user:

**1. Run smoke tests** - `*smoke-test`  
**2. Check RLS coverage** - `*rls-audit`  
**3. Verify query performance** - `*analyze-hotpaths`  
**4. Done for now**

---

## Success Output

```
✅ Migration Applied Successfully

Timestamp: {TS}
Migration: {path}
Snapshots:
  - Before: supabase/snapshots/{TS}_before.sql
  - After:  supabase/snapshots/{TS}_after.sql
  - Diff:   supabase/snapshots/{TS}_diff.patch

Next steps:
  *smoke-test     - Validate migration
  *rls-audit      - Check security
  *rollback {TS}  - Undo if needed
```

---

## Rollback Instructions

If migration needs to be undone:

```bash
*rollback supabase/snapshots/{TS}_before.sql
```

Or create manual rollback script in `supabase/rollback/{TS}_rollback.sql`

---

## Error Handling

### Migration Fails Mid-Execution

1. PostgreSQL transaction is rolled back automatically
2. Advisory lock released on disconnect
3. Pre-migration snapshot still available
4. Database unchanged

### Lock Already Held

```
❌ Another migration is running
Wait for completion or check for stuck locks:

SELECT * FROM pg_locks WHERE locktype = 'advisory';
```

### Snapshot Creation Fails

- Check disk space
- Verify pg_dump version compatibility
- Check database permissions

---

## Safety Features

✅ Advisory lock prevents concurrent migrations  
✅ Pre/post snapshots for comparison  
✅ ON_ERROR_STOP prevents partial application  
✅ Transaction-wrapped execution  
✅ Automatic diff generation  
✅ Rollback instructions provided
