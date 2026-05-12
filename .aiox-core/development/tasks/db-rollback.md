# Task: Rollback Database

**Purpose**: Restore database to previous snapshot or run rollback script

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
task: dbRollback()
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

**Strategy:** abort

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

- `target` (string): Path to snapshot file or rollback script

---

## Process

### 1. Confirm Rollback

**CRITICAL WARNING**: Display to user before proceeding

```
⚠️  DATABASE ROLLBACK WARNING ⚠️

You are about to restore the database to a previous state.

Target: {target}

This will:
  ✓ Drop and recreate all schema objects
  ✓ Preserve existing data (if schema-only snapshot)
  ✗ Lose any schema changes made after snapshot
  ✗ Potentially break application if schema incompatible

Are you ABSOLUTELY SURE you want to proceed?
```

Ask user to type: `ROLLBACK` to confirm

### 2. Pre-Rollback Safety Checks

```bash
# Create emergency snapshot before rollback
echo "Creating emergency snapshot before rollback..."
TS=$(date +%Y%m%d_%H%M%S)
EMERGENCY="supabase/snapshots/${TS}_emergency_before_rollback.sql"

pg_dump "$SUPABASE_DB_URL" \
  --schema-only \
  --clean \
  --if-exists \
  > "$EMERGENCY"

if [ $? -eq 0 ]; then
  echo "✓ Emergency snapshot: $EMERGENCY"
else
  echo "❌ Emergency snapshot failed - ABORTING ROLLBACK"
  exit 1
fi
```

### 3. Validate Rollback Target

```bash
TARGET="{target}"

# Check file exists
if [ ! -f "$TARGET" ]; then
  echo "❌ Rollback target not found: $TARGET"
  exit 1
fi

# Check file is valid SQL
if ! grep -q "CREATE\|DROP\|ALTER" "$TARGET"; then
  echo "❌ File doesn't appear to be valid SQL"
  exit 1
fi

echo "✓ Rollback target validated: $TARGET"
echo "  File size: $(ls -lh "$TARGET" | awk '{print $5}')"
echo "  Modified: $(ls -lh "$TARGET" | awk '{print $6, $7, $8}')"
```

### 4. Acquire Exclusive Lock

Prevent concurrent operations:

```bash
echo "Acquiring exclusive lock..."

psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -c \
"SELECT pg_try_advisory_lock(hashtext('dbsage:rollback')) AS got" \
| grep -q t || { echo "❌ Another operation is running"; exit 1; }

echo "✓ Lock acquired"
```

### 5. Execute Rollback

```bash
echo ""
echo "=== EXECUTING ROLLBACK ==="
echo "Started: $(date -Iseconds)"
echo ""

# Run rollback in single transaction
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$TARGET"

RESULT=$?

echo ""
echo "Completed: $(date -Iseconds)"
echo ""

if [ $RESULT -eq 0 ]; then
  echo "✅ ROLLBACK SUCCESSFUL"
else
  echo "❌ ROLLBACK FAILED"
  echo "Emergency snapshot available: $EMERGENCY"
  echo "Attempting to restore from emergency snapshot..."
  
  # Try to restore emergency snapshot
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$EMERGENCY"
  
  if [ $? -eq 0 ]; then
    echo "✓ Restored from emergency snapshot"
  else
    echo "❌ Emergency restore also failed - DATABASE MAY BE INCONSISTENT"
    echo "Manual intervention required"
  fi
  
  exit 1
fi
```

### 6. Post-Rollback Validation

```bash
echo ""
echo "=== POST-ROLLBACK VALIDATION ==="
echo ""

# Count schema objects
echo "Schema object counts:"
psql "$SUPABASE_DB_URL" -t -c \
"SELECT 
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname='public') AS tables,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname='public') AS policies,
  (SELECT COUNT(*) FROM pg_proc WHERE pronamespace='public'::regnamespace) AS functions;"

# Check for basic sanity
echo ""
echo "Quick sanity checks:"
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
-- Check tables exist
SELECT 'Tables exist' AS check, COUNT(*) > 0 AS pass 
FROM pg_tables WHERE schemaname='public';

-- Check functions exist  
SELECT 'Functions exist' AS check, COUNT(*) > 0 AS pass
FROM pg_proc WHERE pronamespace='public'::regnamespace;

-- Check for orphaned objects (optional)
-- SELECT 'No orphaned triggers' AS check, COUNT(*) = 0 AS pass
-- FROM pg_trigger WHERE tgrelid NOT IN (SELECT oid FROM pg_class);
SQL
```

### 7. Release Lock & Create Post-Rollback Snapshot

```bash
# Release lock
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -c \
"SELECT pg_advisory_unlock(hashtext('dbsage:rollback'));"

echo "✓ Lock released"

# Create post-rollback snapshot
POST_SNAPSHOT="supabase/snapshots/${TS}_post_rollback.sql"
pg_dump "$SUPABASE_DB_URL" --schema-only --clean --if-exists > "$POST_SNAPSHOT"

echo "✓ Post-rollback snapshot: $POST_SNAPSHOT"
```

### 8. Report Results

```
✅ DATABASE ROLLBACK COMPLETED

Rolled back to: {target}
Timestamp: {TS}

Snapshots created:
  - Emergency (before): $EMERGENCY
  - Post-rollback (after): $POST_SNAPSHOT

Next steps:
  1. *smoke-test - Validate schema
  2. *rls-audit - Check security
  3. Test application functionality
  4. Monitor for issues

If issues detected:
  *rollback $EMERGENCY  # Restore to pre-rollback state
```

---

## Rollback Strategies

### Strategy 1: Snapshot Restore (Recommended)

**Use when**: Reverting schema changes

```bash
*rollback supabase/snapshots/20251026_pre_migration.sql
```

**Pros**:
- ✅ Fast
- ✅ Complete schema state
- ✅ Tested with pg_dump

**Cons**:
- ❌ Data preserved (may be incompatible)
- ❌ Requires prior snapshot

### Strategy 2: Explicit Rollback Script

**Use when**: Surgical changes to specific objects

```sql
-- supabase/rollback/20251026_rollback_user_roles.sql

BEGIN;

-- Undo changes in reverse order
DROP TRIGGER IF EXISTS set_user_role_timestamp ON user_roles;
DROP FUNCTION IF EXISTS update_user_role_timestamp();
DROP TABLE IF EXISTS user_roles;

-- Restore previous state if needed
-- ...

COMMIT;
```

```bash
*rollback supabase/rollback/20251026_rollback_user_roles.sql
```

**Pros**:
- ✅ Precise control
- ✅ Documented undo process
- ✅ Can be tested

**Cons**:
- ❌ Must write manually
- ❌ Easy to forget steps
- ❌ Must maintain with migration

### Strategy 3: Forward Fix

**Use when**: Rollback is dangerous, fix forward instead

```sql
-- Instead of rolling back, apply corrective migration
-- migration: 20251026_fix_user_roles_bug.sql
```

**Pros**:
- ✅ No data loss risk
- ✅ Maintains history
- ✅ Safe in production

**Cons**:
- ❌ More work
- ❌ Leaves intermediate state in history

---

## Rollback Decision Matrix

| Situation | Strategy | Command |
|-----------|----------|---------|
| Migration failed mid-way | Restore snapshot | `*rollback snapshot_before.sql` |
| Schema breaks app | Restore snapshot | `*rollback snapshot_before.sql` |
| Wrong migration applied | Restore snapshot | `*rollback snapshot_before.sql` |
| Minor bug in function | Forward fix | Create fix migration |
| Data corruption risk | Forward fix | Don't rollback |
| Production with users | Forward fix | Avoid schema rollback |

---

## Safety Checklist

Before executing rollback:

- [ ] Emergency snapshot created automatically ✓
- [ ] Application stopped or in maintenance mode
- [ ] Users notified of downtime
- [ ] Team aware of rollback operation
- [ ] Rollback target validated
- [ ] Exclusive lock acquired
- [ ] Post-rollback test plan ready

---

## Rollback in Different Environments

### Development
```bash
# Fast and loose - just do it
*rollback snapshot.sql
```

### Staging
```bash
# Test the rollback process
*rollback snapshot.sql
*smoke-test
# Test app functionality
```

### Production
```bash
# CAREFUL - follow full checklist
# 1. Notify stakeholders
# 2. Enable maintenance mode
# 3. Create emergency snapshot (automatic)
# 4. Coordinate with team
*rollback snapshot.sql
# 5. Validation
*smoke-test
*rls-audit
# 6. Test critical flows
# 7. Disable maintenance mode
# 8. Monitor closely
```

---

## Common Rollback Scenarios

### Scenario 1: Migration Failed During Apply

**Situation**: `*apply-migration` failed halfway

**Action**: PostgreSQL already rolled back transaction ✓

**No rollback needed**: Database unchanged

**Next steps**:
1. Fix migration file
2. `*dry-run` to test
3. `*apply-migration` again

### Scenario 2: Migration Succeeded but Breaks App

**Situation**: Schema change incompatible with application

**Action**: Rollback to pre-migration snapshot

```bash
*rollback supabase/snapshots/20251026_143022_pre_migration.sql
*smoke-test
# Deploy previous app version or fix app
```

### Scenario 3: Wrong Migration Applied

**Situation**: Applied v1.3.0 migration instead of v1.2.5

**Action**: Rollback to last known good state

```bash
*rollback supabase/snapshots/20251026_120000_v1_2_4.sql
*smoke-test
# Apply correct migration
*apply-migration v1_2_5.sql
```

### Scenario 4: Data Corruption After Migration

**Situation**: Schema change caused data integrity issues

**Action**: DON'T rollback schema - fix data

```sql
-- Forward fix with data correction
BEGIN;

-- Fix data
UPDATE users SET status = 'active' WHERE status IS NULL;

-- Add constraint to prevent recurrence
ALTER TABLE users ADD CONSTRAINT status_not_null CHECK (status IS NOT NULL);

COMMIT;
```

---

## Troubleshooting

### "Rollback failed: relation already exists"

**Problem**: Objects from new schema still exist  
**Fix**: Snapshot should have `DROP ... IF EXISTS` statements

Check snapshot file:
```bash
grep -c "DROP.*IF EXISTS" snapshot.sql
```

If missing, regenerate snapshot with `--clean --if-exists` flags.

### "Rollback succeeded but app still broken"

**Problem**: Application incompatible with rolled-back schema  
**Solutions**:
1. Deploy previous app version
2. Fix app code to work with old schema
3. Roll forward with new migration instead

### "Emergency snapshot failed during rollback"

**Problem**: Cannot create safety snapshot  
**Action**: ABORT ROLLBACK

```
❌ ROLLBACK ABORTED
Cannot proceed without emergency snapshot
Check database connectivity and disk space
```

### "Rollback created orphaned objects"

**Problem**: Some objects not cleaned up  
**Fix**: Manually identify and remove

```sql
-- Find orphaned triggers
SELECT tgname FROM pg_trigger 
WHERE tgrelid NOT IN (SELECT oid FROM pg_class);

-- Find orphaned indexes
SELECT indexname FROM pg_indexes 
WHERE tablename NOT IN (SELECT tablename FROM pg_tables);
```

---

## Best Practices

### DO

- ✅ Always snapshot before rollback (automatic)
- ✅ Test rollback in staging first
- ✅ Coordinate with team
- ✅ Have post-rollback test plan
- ✅ Monitor application after rollback
- ✅ Document why rollback was needed

### DON'T

- ❌ Rollback in production without coordination
- ❌ Rollback without emergency snapshot
- ❌ Rollback when forward fix is safer
- ❌ Rollback if data corruption risk
- ❌ Rollback during peak usage times
- ❌ Rollback without understanding impact

---

## Zero-Downtime Alternatives

Instead of rollback, consider:

### Blue-Green Deployment
- Keep old schema running
- Deploy new app + schema separately
- Switch traffic when ready
- Rollback = switch back

### Feature Flags
- Deploy schema changes
- Keep old code paths active
- Toggle features via flags
- Rollback = flip flag

### Backward Compatible Migrations
- Add new columns as nullable
- Keep old columns temporarily
- Remove old columns in later migration
- Rollback = just remove new columns

---

## Rollback Metrics

Track these after rollback:

- **Rollback duration**: How long did it take?
- **Downtime**: How long was app unavailable?
- **Data loss**: Any data lost? (should be none)
- **Schema object count**: Before vs after
- **Application errors**: Any post-rollback issues?
- **Recovery time**: Time to full functionality

```bash
# Log rollback event
echo "$(date -Iseconds) | ROLLBACK | $TARGET | Duration: ${DURATION}s" \
  >> supabase/rollback/rollback.log
```

---

## Related Commands

- `*snapshot {label}` - Create rollback point
- `*apply-migration {path}` - Creates automatic snapshots
- `*smoke-test` - Validate after rollback
- `*rls-audit` - Check security after rollback

---

## Emergency Contacts

If rollback fails critically:

1. **Check emergency snapshot**: `$EMERGENCY`
2. **Review Supabase dashboard**: Check for locks/issues
3. **Contact team**: Get help immediately
4. **Document state**: Save logs and error messages
5. **Consider Supabase restore**: Point-in-time recovery

**Never panic**: Emergency snapshot has your back.
