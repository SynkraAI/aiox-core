# Database Migration Safety Guide

**Purpose:** Reference guide for safe database migrations in production
**Agent:** Dan (Data Engineer)
**Risk Level:** High - migrations can cause data loss and downtime

---

## MIGRATION PRINCIPLES

### Core Rules
1. **Never modify existing migrations** - Create new ones
2. **Always provide rollback** - Every up has a down
3. **Test on production copy** - Before running in production
4. **Use transactions** - Atomic schema changes
5. **Separate schema from data** - Different migration types
6. **Deploy during low traffic** - Minimize impact

---

## SAFE OPERATIONS

### Adding Columns (Safe)
```sql
-- ✅ Safe: Add nullable column
ALTER TABLE users ADD COLUMN bio TEXT;

-- ✅ Safe: Add column with default
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
```

### Adding Indexes (Safe with CONCURRENTLY)
```sql
-- ✅ Safe: Non-blocking index creation
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- ⚠️ Caution: This blocks writes
CREATE INDEX idx_users_email ON users(email);
```

### Creating Tables (Safe)
```sql
-- ✅ Safe: New table doesn't affect existing data
CREATE TABLE new_feature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## DANGEROUS OPERATIONS

### Dropping Columns (Dangerous)
```sql
-- ❌ DANGEROUS: Data loss
ALTER TABLE users DROP COLUMN bio;

-- ✅ Safe approach: Multi-step
-- Step 1: Stop writing to column (app change)
-- Step 2: Wait for deployment
-- Step 3: Drop column in next migration
```

### Renaming Columns (Dangerous)
```sql
-- ❌ DANGEROUS: Breaks existing queries
ALTER TABLE users RENAME COLUMN name TO full_name;

-- ✅ Safe approach: Multi-step
-- Migration 1: Add new column
ALTER TABLE users ADD COLUMN full_name TEXT;
-- App: Start writing to both columns
-- Migration 2: Copy data
UPDATE users SET full_name = name WHERE full_name IS NULL;
-- App: Read from new, write to both
-- Migration 3: Stop writing to old
-- Migration 4: Drop old column
```

### Changing Column Types (Dangerous)
```sql
-- ❌ DANGEROUS: Can fail with existing data
ALTER TABLE users ALTER COLUMN age TYPE INTEGER;

-- ✅ Safe approach: Add new column, migrate, swap
ALTER TABLE users ADD COLUMN age_new INTEGER;
UPDATE users SET age_new = age::INTEGER;
-- Verify data
ALTER TABLE users DROP COLUMN age;
ALTER TABLE users RENAME COLUMN age_new TO age;
```

### Adding NOT NULL (Dangerous)
```sql
-- ❌ DANGEROUS: Fails if nulls exist
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- ✅ Safe approach
-- Step 1: Add default for new rows
ALTER TABLE users ALTER COLUMN email SET DEFAULT 'unknown@example.com';
-- Step 2: Update existing nulls
UPDATE users SET email = 'unknown@example.com' WHERE email IS NULL;
-- Step 3: Add NOT NULL constraint
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
```

---

## LARGE TABLE MIGRATIONS

### Batch Updates
```sql
-- ❌ DANGEROUS: Locks table for long time
UPDATE large_table SET new_column = old_column;

-- ✅ Safe: Batch updates
DO $$
DECLARE
  batch_size INT := 10000;
  affected INT;
BEGIN
  LOOP
    UPDATE large_table
    SET new_column = old_column
    WHERE id IN (
      SELECT id FROM large_table
      WHERE new_column IS NULL
      LIMIT batch_size
    );

    GET DIAGNOSTICS affected = ROW_COUNT;

    IF affected = 0 THEN
      EXIT;
    END IF;

    COMMIT;
    PERFORM pg_sleep(0.1);  -- Brief pause
  END LOOP;
END $$;
```

### Online Schema Changes (pt-online-schema-change pattern)
```sql
-- For large table modifications:
-- 1. Create new table with desired schema
CREATE TABLE users_new (LIKE users INCLUDING ALL);
ALTER TABLE users_new ADD COLUMN new_field TEXT;

-- 2. Create trigger to sync changes
CREATE TRIGGER sync_users_to_new
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION sync_to_users_new();

-- 3. Copy data in batches
INSERT INTO users_new SELECT *, NULL as new_field FROM users
WHERE id BETWEEN 1 AND 10000;
-- Continue batches...

-- 4. Swap tables
ALTER TABLE users RENAME TO users_old;
ALTER TABLE users_new RENAME TO users;

-- 5. Update foreign keys, drop trigger
-- 6. Drop old table after verification
```

---

## ROLLBACK STRATEGIES

### Schema Rollback Template
```sql
-- migrations/00001_add_feature.up.sql
ALTER TABLE users ADD COLUMN feature_enabled BOOLEAN DEFAULT false;

-- migrations/00001_add_feature.down.sql
ALTER TABLE users DROP COLUMN feature_enabled;
```

### Data Rollback Template
```sql
-- Before data migration, create backup
CREATE TABLE users_backup_20240115 AS SELECT * FROM users;

-- Migration
UPDATE users SET status = 'active' WHERE status = 'enabled';

-- Rollback if needed
UPDATE users u
SET status = b.status
FROM users_backup_20240115 b
WHERE u.id = b.id;

-- Drop backup after verification period
DROP TABLE users_backup_20240115;
```

### Point-in-Time Recovery
```bash
# Supabase: Restore to specific timestamp
# Via Dashboard > Settings > Database > Point in Time Recovery

# Self-hosted: Use pg_restore with timestamp
pg_restore --target-time="2024-01-15 10:30:00" -d mydb backup.dump
```

---

## MIGRATION WORKFLOW

### Pre-Migration Checklist
- [ ] Migration tested on local database
- [ ] Migration tested on staging with production copy
- [ ] Rollback script exists and tested
- [ ] Backup verified
- [ ] Team notified of migration window
- [ ] Low traffic time selected
- [ ] Monitoring dashboards ready

### During Migration
- [ ] Take fresh backup before starting
- [ ] Run migration
- [ ] Verify schema changes
- [ ] Run smoke tests
- [ ] Check application functionality
- [ ] Monitor error rates

### Post-Migration
- [ ] Verify all features working
- [ ] Check query performance
- [ ] Monitor for 24 hours
- [ ] Document any issues
- [ ] Update rollback window (keep backup X days)

---

## SUPABASE-SPECIFIC

### Using Supabase Migrations
```bash
# Create new migration
supabase migration new add_user_bio

# Edit the migration file
# supabase/migrations/20240115120000_add_user_bio.sql

# Apply locally
supabase db reset

# Apply to remote
supabase db push
```

### Handling RLS in Migrations
```sql
-- migrations/00001_add_table_with_rls.sql

-- Create table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users NOT NULL,
  content TEXT
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can manage own documents"
ON documents FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());
```

### Edge Function Dependencies
```sql
-- If migration affects Edge Functions:
-- 1. Deploy migration
-- 2. Deploy updated Edge Functions
-- 3. Rollback order is reversed

-- Consider feature flags for seamless transitions
```

---

## EMERGENCY PROCEDURES

### Migration Failed Mid-Way
1. **Don't panic** - assess the state
2. Check which statements succeeded
3. If in transaction, it auto-rolled back
4. If not, manually run rollback statements
5. Restore from backup if needed

### Production is Down
1. Check application logs
2. Check database connectivity
3. Roll back if migration caused issue
4. If rollback fails, restore from backup
5. Communicate with stakeholders

### Data Corruption Detected
1. Stop all writes immediately
2. Take current state backup
3. Identify affected records
4. Restore affected data from backup
5. Investigate root cause

---

## TESTING MATRIX

| Operation | Local | Staging | Prod Copy | Low Traffic |
|-----------|-------|---------|-----------|-------------|
| Add column | ✅ | ✅ | - | - |
| Add index | ✅ | ✅ | ✅ | ✅ |
| Drop column | ✅ | ✅ | ✅ | ✅ |
| Modify type | ✅ | ✅ | ✅ | ✅ |
| Large update | ✅ | ✅ | ✅ | ✅ |
| Table rename | ✅ | ✅ | ✅ | ✅ |

---

**Reviewer:** ________ **Date:** ________
**Safety Audit:** [ ] PASS [ ] NEEDS REVIEW
