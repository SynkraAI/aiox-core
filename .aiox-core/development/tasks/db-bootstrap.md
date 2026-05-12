# Task: Bootstrap Supabase Project

**Purpose**: Create standard Supabase project structure

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
task: dbBootstrap()
responsible: Dara (Sage)
responsible_type: Agent
atomic_layer: Organism

inputs:
  - field: query
    type: string
    source: User Input
    required: true
    validation: Valid SQL query

  - field: params
    type: object
    source: User Input
    required: false
    validation: Query parameters

  - field: connection
    type: object
    source: config
    required: true
    validation: Valid PostgreSQL connection via Supabase

outputs:
  - field: query_result
    type: array
    destination: Memory
    persisted: false

  - field: records_affected
    type: number
    destination: Return value
    persisted: false

  - field: execution_time
    type: number
    destination: Memory
    persisted: false
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


## Process

### 1. Confirm Project Setup

Ask user:

**Project name**: (e.g., "mmos-platform")

**Include starter templates?**
1. Minimal - Directories only
2. Standard - Directories + READMEs + config
3. Full - Everything + baseline schema example

### 2. Create Directory Structure

```bash
mkdir -p supabase/{migrations,seeds,tests,rollback,snapshots,docs}

echo "✓ Created directories:
  supabase/migrations/    - Schema migrations
  supabase/seeds/         - Seed data
  supabase/tests/         - Smoke tests
  supabase/rollback/      - Rollback scripts
  supabase/snapshots/     - Schema snapshots
  supabase/docs/          - Documentation"
```

### 3. Create Core Files

#### supabase/migrations/README.md

```markdown
# Migrations

## Naming: YYYYMMDDHHMMSS_description.sql

Example: 20251026120000_baseline_schema.sql

## Order (within each file):
1. Extensions
2. Tables + Constraints
3. Functions
4. Triggers
5. RLS (enable + policies)
6. Views

## Workflow:
*verify-order migration.sql  # Check order
*dry-run migration.sql       # Test
*snapshot pre_migration      # Create rollback point
*apply-migration migration.sql  # Apply
*smoke-test                  # Validate
```

#### supabase/seeds/README.md

```markdown
# Seeds

## Naming: YYYYMMDDHHMMSS_description_seed.sql

## Types:
- Required: Data app needs to function
- Test: Sample data for development
- Reference: Lookup tables (countries, categories)

## Idempotent pattern:
INSERT INTO table (id, name) VALUES (1, 'value')
ON CONFLICT (id) DO NOTHING;
```

#### supabase/tests/README.md

```markdown
# Tests

## Smoke tests (post-migration validation):
- Tables exist
- RLS enabled
- Policies installed
- Functions callable
- Basic queries work

## Run: *smoke-test
```

#### supabase/rollback/README.md

```markdown
# Rollback

## Snapshots (automatic):
Created by *apply-migration and *snapshot commands
Located in: ../snapshots/

## Manual rollback scripts:
Write explicit undo operations for complex migrations

Example: YYYYMMDDHHMMSS_rollback_description.sql
```

#### supabase/.gitignore

```gitignore
# Local dev
.env
.env.local
.branches
.temp

# OS
.DS_Store
Thumbs.db

# Optional: Snapshots (if too large for git)
# snapshots/*.sql
```

### 4. Generate config.toml (if Standard or Full)

```toml
# Supabase Local Development Config

[api]
enabled = true
port = 54321

[db]
port = 54322
shadow_port = 54320
major_version = 15

[db.pooler]
enabled = true
port = 54329
pool_mode = "transaction"

[studio]
enabled = true
port = 54323

[auth]
enabled = true
site_url = "http://localhost:3000"

# See: https://supabase.com/docs/guides/cli/config
```

### 5. Create Baseline Schema (if Full option)

#### supabase/migrations/00000000000000_baseline.sql

```sql
-- Baseline Schema
-- Run after: supabase init

BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Example table (customize for your project)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Grants
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

COMMIT;
```

### 6. Create Initial Smoke Test

#### supabase/tests/smoke_test.sql

```sql
-- Basic smoke test
SET client_min_messages = warning;

\echo 'Checking tables...'
SELECT COUNT(*) AS tables FROM information_schema.tables 
WHERE table_schema='public';

\echo 'Checking RLS...'
SELECT COUNT(*) AS rls_enabled FROM pg_tables 
WHERE schemaname='public' AND rowsecurity=true;

\echo 'Checking policies...'
SELECT COUNT(*) AS policies FROM pg_policies 
WHERE schemaname='public';

\echo '✓ Smoke test complete'
```

### 7. Create Migration Log

#### supabase/docs/migration-log.md

```markdown
# Migration Log

## Format:
### Version X.Y.Z - Description (Date)
- Migration: filename.sql
- Status: ✅ Success / ❌ Failed / ⏪ Rolled Back
- Changes: What changed
- Rollback: How to undo

---

## Baseline (Initial)
- Migration: 00000000000000_baseline.sql
- Status: ⏳ Pending
- Changes: Initial project structure
- Rollback: N/A (baseline)
```

---

## Success Output

```
✅ Supabase Project Bootstrapped

Structure created:
  supabase/
  ├── migrations/      (migration files)
  ├── seeds/          (seed data)
  ├── tests/          (smoke tests)
  ├── rollback/       (rollback scripts)
  ├── snapshots/      (schema snapshots)
  ├── docs/           (documentation)
  ├── config.toml     (local config)
  └── .gitignore

Next steps:
  1. Set SUPABASE_DB_URL in .env
  2. *env-check - Validate setup
  3. *apply-migration supabase/migrations/00000000000000_baseline.sql
  4. *smoke-test - Validate baseline
  5. *snapshot baseline - Create initial snapshot

Documentation:
  - supabase/migrations/README.md
  - supabase/docs/migration-log.md
```

---

## Environment Setup

Create `.env` file in project root:

```bash
# Supabase Database Connection
# Get from: https://app.supabase.com/project/_/settings/database

# Pooler (recommended for migrations)
SUPABASE_DB_URL="postgresql://postgres.[PASSWORD]@[PROJECT-REF].supabase.co:6543/postgres?sslmode=require"

# Direct (for backups/analysis)
# SUPABASE_DB_URL="postgresql://postgres.[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
```

**Security**:
- ✅ Added to .gitignore
- ✅ Use pooler (port 6543)
- ✅ Require SSL

---

## Project Options

### Minimal (Directories Only)
```
supabase/
├── migrations/
├── seeds/
├── tests/
├── rollback/
├── snapshots/
└── docs/
```
**Use for**: Existing projects, simple setups

### Standard (+ READMEs + Config)
```
+ README.md files
+ config.toml
+ .gitignore
+ migration-log.md
```
**Use for**: New projects, team environments

### Full (+ Baseline Schema)
```
+ baseline.sql migration
+ smoke_test.sql
+ Example profiles table
+ RLS policies
```
**Use for**: Greenfield projects, learning

---

## Integration with Existing Projects

If `supabase/` already exists:

```bash
# Backup existing
mv supabase supabase.backup

# Bootstrap new
*bootstrap

# Merge as needed
cp supabase.backup/migrations/* supabase/migrations/
```

---

## Customization

### For Your Project

Replace baseline.sql with your tables:
- Copy schema from existing DB
- Or design with: `*create-schema`
- Then create migration file

### Team Standards

Edit READMEs to add:
- Team-specific naming conventions
- Required reviewers for migrations
- Deployment procedures
- Contact information

### CI/CD Integration

Add to pipeline:

```yaml
# .github/workflows/db-test.yml
- name: Run smoke tests
  run: |
    /db-sage
    *smoke-test
```

---

## Next Steps After Bootstrap

1. **Environment**: Set SUPABASE_DB_URL
2. **Validate**: `*env-check`
3. **Design**: `*create-schema` (or use existing)
4. **Migrate**: `*apply-migration baseline.sql`
5. **Test**: `*smoke-test`
6. **Snapshot**: `*snapshot baseline`
7. **Document**: Update migration-log.md

---

## Common Issues

### "Directory already exists"

**Problem**: supabase/ folder exists  
**Options**:
1. Backup and replace (recommended)
2. Merge manually
3. Choose different directory

### "No permission to create directories"

**Problem**: Insufficient file permissions  
**Fix**: Check you're in project root with write access

### "Config conflicts with existing Supabase project"

**Problem**: Already using Supabase CLI  
**Solution**: Bootstrap is compatible with Supabase CLI
- Keep existing config
- Use bootstrap for organization only

---

## Related Commands

- `*create-schema` - Design schema interactively
- `*apply-migration {path}` - Run first migration
- `*smoke-test` - Validate setup
- `*snapshot baseline` - Create initial snapshot
- `*env-check` - Validate environment
