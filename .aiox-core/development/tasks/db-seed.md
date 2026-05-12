# Task: Apply Seed Data

**Purpose**: Safely apply seed data to database with idempotent operations

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
task: dbSeed()
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

- `path` (string): Path to SQL seed file

---

## Process

### 1. Pre-Flight Checks

Ask user to confirm:
- Seed file: `{path}`
- Database: `$SUPABASE_DB_URL` (redacted)
- Environment: (dev/staging/production)
- Idempotent? (uses INSERT...ON CONFLICT or similar)

**CRITICAL**: Never seed production without explicit confirmation!

### 2. Validate Seed File

Check that seed file is idempotent:

```bash
echo "Validating seed file..."

# Check for dangerous patterns
if grep -qi "TRUNCATE\|DELETE FROM" {path}; then
  echo "⚠️  WARNING: Seed contains TRUNCATE/DELETE"
  echo "   This is destructive. Continue? (yes/no)"
  read CONFIRM
  [ "$CONFIRM" != "yes" ] && { echo "Aborted"; exit 1; }
fi

# Check for INSERT...ON CONFLICT (idempotent pattern)
if ! grep -qi "ON CONFLICT" {path}; then
  echo "⚠️  WARNING: No ON CONFLICT detected"
  echo "   Seed may not be idempotent. Continue? (yes/no)"
  read CONFIRM
  [ "$CONFIRM" != "yes" ] && { echo "Aborted"; exit 1; }
fi

echo "✓ Seed file validated"
```

### 3. Create Snapshot (Optional but Recommended)

```bash
TS=$(date +%Y%m%d%H%M%S)
mkdir -p supabase/snapshots

echo "Creating pre-seed snapshot..."
pg_dump "$SUPABASE_DB_URL" --schema-only --clean --if-exists \
  > "supabase/snapshots/${TS}_before_seed.sql"

echo "✓ Snapshot: supabase/snapshots/${TS}_before_seed.sql"
```

### 4. Apply Seed Data

Run seed in transaction with error handling:

```bash
echo "Applying seed data..."

psql "$SUPABASE_DB_URL" \
  -v ON_ERROR_STOP=1 \
  -f {path}

if [ $? -eq 0 ]; then
  echo "✓ Seed data applied successfully"
else
  echo "❌ Seed failed"
  echo "   Rollback snapshot: supabase/snapshots/${TS}_before_seed.sql"
  exit 1
fi
```

### 5. Verify Seed Data

Run basic verification:

```bash
echo "Verifying seed data..."

# Count inserted rows (example - customize per seed)
psql "$SUPABASE_DB_URL" -c \
"SELECT
  'users' AS table, COUNT(*) AS rows FROM users
UNION ALL
SELECT
  'categories', COUNT(*) FROM categories
ORDER BY table;"

echo "✓ Verification complete"
```

### 6. Document Seed

Log what was seeded:

```bash
cat >> supabase/docs/SEED_LOG.md << EOF

## Seed Applied: ${TS}
- File: {path}
- Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
- Environment: ${ENVIRONMENT:-unknown}
- Applied by: ${USER:-unknown}

EOF

echo "✓ Logged to supabase/docs/SEED_LOG.md"
```

---

## Output

Display summary:
```
✅ SEED COMPLETE

File:      {path}
Timestamp: {TS}
Snapshot:  supabase/snapshots/{TS}_before_seed.sql
Log:       supabase/docs/SEED_LOG.md

Next steps:
- Verify data manually in database
- Run smoke tests if appropriate
- Commit seed file to git
```

---

## Idempotent Seed Pattern

Best practice example for seed files:

```sql
-- ✅ GOOD: Idempotent seed
INSERT INTO categories (id, name, slug)
VALUES
  ('cat-1', 'Technology', 'technology'),
  ('cat-2', 'Design', 'design')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug;

-- ✅ GOOD: Conditional insert
INSERT INTO users (id, email, role)
SELECT 'user-1', 'admin@example.com', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@example.com'
);

-- ❌ BAD: Not idempotent
INSERT INTO categories (name, slug)
VALUES ('Technology', 'technology');  -- Will fail on retry
```

---

## Error Handling

If seed fails:
1. Check error message in terminal
2. Fix seed file
3. Restore snapshot if needed: `*rollback {TS}_before_seed`
4. Re-run seed: `*seed {path}`

---

## Notes

- Seeds should be idempotent (safe to run multiple times)
- Use `ON CONFLICT` or `INSERT...WHERE NOT EXISTS`
- Never TRUNCATE in production seeds
- Test seeds in dev/staging first
- Version seed files in git (supabase/seeds/)
