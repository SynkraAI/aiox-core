# Task: Create Database Snapshot

**Purpose**: Create schema-only snapshot for rollback capability

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
task: dbSnapshot()
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

- `label` (string): Snapshot label/name (e.g., "baseline", "pre_migration", "v1_2_0")

---

## Process

### 1. Confirm Snapshot Details

Ask user:
- Snapshot label: `{label}`
- Purpose of this snapshot (e.g., "before adding user_roles table")
- Include data? (schema-only is default, safer, faster)

### 2. Create Snapshots Directory

```bash
mkdir -p supabase/snapshots
```

### 3. Generate Snapshot

```bash
TS=$(date +%Y%m%d_%H%M%S)
LABEL="{label}"
FILENAME="supabase/snapshots/${TS}_${LABEL}.sql"

echo "Creating snapshot: $FILENAME"

pg_dump "$SUPABASE_DB_URL" \
  --schema-only \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  > "$FILENAME"

if [ $? -eq 0 ]; then
  echo "✅ Snapshot created: $FILENAME"
  ls -lh "$FILENAME"
else
  echo "❌ Snapshot failed"
  exit 1
fi
```

### 4. Verify Snapshot

Quick sanity check:

```bash
# Check file size (should be > 0)
if [ ! -s "$FILENAME" ]; then
  echo "⚠️ Snapshot file is empty"
  exit 1
fi

# Count schema objects
echo ""
echo "=== Snapshot Contents ==="
grep -c "CREATE TABLE" "$FILENAME" && echo "tables found" || echo "no tables"
grep -c "CREATE FUNCTION" "$FILENAME" && echo "functions found" || echo "no functions"
grep -c "CREATE POLICY" "$FILENAME" && echo "policies found" || echo "no policies"
```

### 5. Create Snapshot Metadata

```bash
cat > "supabase/snapshots/${TS}_${LABEL}.meta" <<EOF
Snapshot: ${TS}_${LABEL}
Created: $(date -Iseconds)
Label: ${LABEL}
Database: $(echo "$SUPABASE_DB_URL" | sed 's/:.*/:[REDACTED]/')
Purpose: [user provided purpose]
File: ${FILENAME}
Size: $(ls -lh "$FILENAME" | awk '{print $5}')

To restore:
  *rollback supabase/snapshots/${TS}_${LABEL}.sql

Or manually:
  psql "\$SUPABASE_DB_URL" -f "${FILENAME}"
EOF

cat "supabase/snapshots/${TS}_${LABEL}.meta"
```

---

## Output

```
✅ Snapshot Created Successfully

File: supabase/snapshots/20251026_143022_pre_migration.sql
Size: 45.2 KB
Timestamp: 20251026_143022
Label: pre_migration

Contents:
  - 12 tables
  - 8 functions
  - 15 policies

To restore this snapshot:
  *rollback supabase/snapshots/20251026_143022_pre_migration.sql

Metadata saved to:
  supabase/snapshots/20251026_143022_pre_migration.meta
```

---

## Snapshot Options

### Schema-Only (Default)
- ✅ Fast (seconds)
- ✅ Small file size
- ✅ Safe to apply to any environment
- ❌ No data preserved
- **Use for**: Migration rollback, schema versioning

### Schema + Data
```bash
pg_dump "$SUPABASE_DB_URL" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  > "$FILENAME"
```
- ⚠️ Slower (minutes to hours)
- ⚠️ Large file size
- ⚠️ Data may conflict on restore
- ✅ Complete backup
- **Use for**: Disaster recovery, environment cloning

### Specific Tables Only
```bash
pg_dump "$SUPABASE_DB_URL" \
  --schema-only \
  --table="users" \
  --table="profiles" \
  > "$FILENAME"
```
- ✅ Targeted snapshot
- ✅ Smaller file
- **Use for**: Testing specific table changes

---

## Best Practices

### When to Snapshot

**Always before:**
- Migrations
- Schema changes
- RLS policy changes
- Function modifications
- Major data operations

**Regularly:**
- Daily schema snapshots (automated)
- Before each deployment
- After successful migrations (post-snapshot)

### Snapshot Naming

**Good names:**
- `baseline` - Initial schema state
- `pre_migration` - Before any migration
- `pre_v1_2_0` - Before version deployment
- `working_state` - Known good state

**Bad names:**
- `backup` - Too generic
- `test` - Unclear purpose
- `snapshot1` - No context

### Retention

Keep snapshots for:
- Last 7 days: All snapshots
- Last 30 days: Daily snapshots
- Last year: Monthly snapshots
- Forever: Major version snapshots

```bash
# Example cleanup (keep last 10)
cd supabase/snapshots
ls -t *.sql | tail -n +11 | xargs rm -f
```

---

## Snapshot vs Backup

| Feature | Snapshot (pg_dump) | Supabase Backup |
|---------|-------------------|-----------------|
| Speed | Fast | Depends |
| Scope | Schema only (default) | Full database |
| Storage | Local files | Supabase managed |
| Restore | Manual psql | Supabase dashboard |
| Version control | ✅ Git-friendly | ❌ Binary |
| Automation | Easy (script) | Automatic |

**Use snapshots for:**
- Schema version control
- Migration rollback
- Development workflows
- Quick local backups

**Use Supabase backups for:**
- Disaster recovery
- Point-in-time restore
- Production incidents
- Long-term retention

---

## Troubleshooting

### "pg_dump: error: connection failed"

**Problem**: Cannot connect to database  
**Fix**: Check SUPABASE_DB_URL

```bash
*env-check
```

### "pg_dump: error: permission denied"

**Problem**: Insufficient privileges  
**Fix**: Use connection string with sufficient permissions

### "Snapshot file is empty"

**Problem**: No schema objects or connection failed  
**Fix**: 
1. Verify database has tables: `SELECT * FROM pg_tables WHERE schemaname='public';`
2. Check pg_dump version compatibility
3. Verify network connectivity

### "Snapshot is huge"

**Problem**: Including data unintentionally  
**Fix**: Use `--schema-only` flag explicitly

---

## Integration with Workflow

### Pre-Migration Workflow
```bash
*snapshot pre_migration      # Create rollback point
*verify-order migration.sql  # Check DDL order
*dry-run migration.sql       # Test safely
*apply-migration migration.sql  # Apply
*snapshot post_migration     # Capture new state
```

### Comparison Workflow
```bash
*snapshot before_changes
# ... make changes ...
*snapshot after_changes
diff supabase/snapshots/*_before_changes.sql \
     supabase/snapshots/*_after_changes.sql
```

---

## Advanced Usage

### Compare Two Snapshots

```bash
# Visual diff
diff -u snapshot1.sql snapshot2.sql | less

# Summary of changes
diff snapshot1.sql snapshot2.sql | grep "^[<>]" | head -20
```

### Extract Specific Objects

```bash
# Just table definitions
grep -A 20 "CREATE TABLE" snapshot.sql

# Just functions
sed -n '/CREATE FUNCTION/,/\$\$/p' snapshot.sql
```

### Version in Git

```bash
# Snapshot before commit
*snapshot before_feature_x
git add supabase/snapshots/*_before_feature_x.sql
git commit -m "snapshot: schema before feature X"
```

---

## Security Notes

⚠️ **Snapshots may contain sensitive schema info**:
- Table names reveal business logic
- Function names expose features
- Comments may contain internal notes

**In public repos:**
- Consider .gitignore for snapshots
- Or sanitize before committing
- Or use private repos only

**Do NOT commit:**
- Snapshots with `--data-included`
- Files containing passwords/secrets
- Connection strings in metadata

---

## Automation

### Daily Snapshot Script

```bash
#!/bin/bash
# Save as: scripts/daily-snapshot.sh

DATE=$(date +%Y%m%d)
*snapshot "daily_${DATE}"

# Cleanup old snapshots (keep 7 days)
find supabase/snapshots -name "daily_*.sql" -mtime +7 -delete
```

### Pre-Deploy Hook

```bash
# In CI/CD pipeline
- name: Create pre-deploy snapshot
  run: |
    /db-sage
    *snapshot "pre_deploy_${CI_COMMIT_SHA}"
```

---

## Related Commands

- `*rollback {snapshot}` - Restore snapshot
- `*apply-migration {path}` - Includes automatic snapshots
- `*env-check` - Verify pg_dump available
