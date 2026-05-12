# Task: Supabase Setup Guide

**Purpose**: Interactive guide to set up Supabase project with best practices

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
task: dbSupabaseSetup()
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


## Overview

This task guides you through setting up a new Supabase project with optimal configuration and DB Sage integration.

---

## Process

### 1. Prerequisites Check

Verify required tools:

```bash
echo "Checking prerequisites..."

# Check Supabase CLI
if command -v supabase >/dev/null 2>&1; then
  echo "✓ Supabase CLI: $(supabase --version)"
else
  echo "❌ Supabase CLI not installed"
  echo "   Install: https://supabase.com/docs/guides/cli"
  exit 1
fi

# Check psql
if command -v psql >/dev/null 2>&1; then
  echo "✓ psql: $(psql --version)"
else
  echo "⚠️  psql not found (optional but recommended)"
fi

# Check git
if command -v git >/dev/null 2>&1; then
  echo "✓ git: $(git --version)"
else
  echo "⚠️  git not found (recommended for version control)"
fi

echo ""
```

### 2. Choose Setup Path

Present options:

```
Supabase Setup Options:

1. NEW PROJECT - Create new Supabase project from scratch
2. EXISTING PROJECT - Link to existing Supabase project
3. LOCAL ONLY - Set up local development environment only

Select option (1/2/3):
```

### 3a. New Project Path

If option 1 selected:

```bash
echo "Creating new Supabase project..."

# Login to Supabase
echo "Step 1: Login to Supabase"
supabase login

# Create project
echo ""
echo "Step 2: Create project on Supabase dashboard"
echo "  → Go to: https://supabase.com/dashboard"
echo "  → Click 'New Project'"
echo "  → Enter details:"
read -p "    Project name: " PROJECT_NAME
read -p "    Organization: " ORG_NAME
read -p "    Region (default: us-east-1): " REGION
REGION=${REGION:-us-east-1}
read -sp "    Database password (strong!): " DB_PASSWORD
echo ""

echo ""
echo "✓ Project created on dashboard"
echo "  Wait 2-3 minutes for provisioning..."
read -p "  Press Enter when ready..."
```

### 3b. Existing Project Path

If option 2 selected:

```bash
echo "Linking existing Supabase project..."

# List projects
echo "Your Supabase projects:"
supabase projects list

read -p "Enter project reference ID: " PROJECT_REF

# Link project
supabase link --project-ref "$PROJECT_REF"

echo "✓ Project linked"
```

### 3c. Local Only Path

If option 3 selected:

```bash
echo "Setting up local Supabase environment..."

# Initialize local setup
supabase init

# Start local Supabase
echo "Starting local Supabase (Docker required)..."
supabase start

echo "✓ Local Supabase running"
echo "  Studio: http://localhost:54323"
echo "  API: http://localhost:54321"
```

### 4. Initialize DB Sage Structure

Create recommended folder structure:

```bash
echo "Initializing DB Sage project structure..."

# Run db-bootstrap task internally
mkdir -p supabase/{migrations,seeds,tests,rollback,docs,snapshots}

# Create .env.local (gitignored)
cat > .env.local << 'EOF'
# Supabase Configuration
# DO NOT COMMIT THIS FILE

# Project Details
SUPABASE_PROJECT_ID={project_ref}
SUPABASE_PROJECT_NAME={project_name}

# Database URLs
# Connection pooler (port 6543) for serverless/edge functions
SUPABASE_DB_URL_POOLER=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:6543/postgres

# Direct connection (port 5432) for migrations
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# API Keys
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
EOF

echo "✓ DB Sage structure created"
echo "✓ .env.local template created (UPDATE WITH YOUR KEYS!)"
```

### 5. Configure .gitignore

Ensure sensitive files are not committed:

```bash
echo "Configuring .gitignore..."

cat >> .gitignore << 'EOF'

# Supabase
.env.local
.env.production
supabase/.branches
supabase/.temp
supabase/snapshots/*.sql
supabase/rollback/*.sql

# DB Sage
/tmp/dbsage_*
*.dump
*.backup
EOF

echo "✓ .gitignore updated"
```

### 6. Set Up Environment Variables

Guide user through configuration:

```
Setting up environment variables...

1. Get your project keys from Supabase Dashboard:
   → https://supabase.com/dashboard/project/{project_ref}/settings/api

2. Update .env.local with:
   - Database password
   - Project reference ID
   - Anon key
   - Service role key (keep secret!)

3. Source the file:
   source .env.local

4. Verify connection:
   psql "$SUPABASE_DB_URL" -c "SELECT version();"

Press Enter when complete...
```

### 7. Apply Initial Schema

Create baseline schema:

```bash
echo "Setting up initial schema..."

# Check if migrations exist
if [ -z "$(ls -A supabase/migrations 2>/dev/null)" ]; then
  echo "No migrations found."
  echo "Options:"
  echo "  1. Generate schema from design document"
  echo "  2. Import existing schema"
  echo "  3. Skip (will create later)"
  read -p "Select option (1/2/3): " SCHEMA_OPTION

  if [ "$SCHEMA_OPTION" = "1" ]; then
    # Use domain modeling task
    echo "→ Run: *model-domain to create schema"
  elif [ "$SCHEMA_OPTION" = "2" ]; then
    read -p "Path to existing schema SQL file: " SCHEMA_FILE
    cp "$SCHEMA_FILE" "supabase/migrations/$(date +%Y%m%d%H%M%S)_initial_schema.sql"
    echo "✓ Migration file created"
  fi
else
  echo "✓ Migrations directory already has files"
fi
```

### 8. Enable Recommended Extensions

Install useful PostgreSQL extensions:

```bash
echo "Enabling recommended extensions..."

psql "$SUPABASE_DB_URL" << 'EOF'
-- Core extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Encryption functions
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";  -- Query performance tracking

-- Supabase extensions
CREATE EXTENSION IF NOT EXISTS "pgjwt";          -- JWT functions
CREATE EXTENSION IF NOT EXISTS "pg_net";         -- HTTP client

-- Optional: Full-text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Trigram matching

-- Optional: PostGIS (if using geospatial data)
-- CREATE EXTENSION IF NOT EXISTS "postgis";

SELECT 'Extensions enabled' AS status;
EOF

echo "✓ Extensions enabled"
```

### 9. Configure Database Settings

Apply recommended settings:

```bash
echo "Applying recommended database settings..."

psql "$SUPABASE_DB_URL" << 'EOF'
-- Performance settings (adjust based on your tier)
-- These are set at session level - for permanent changes, use Supabase dashboard

-- Enable auto_explain for slow queries (dev only)
-- ALTER SYSTEM SET auto_explain.log_min_duration = 1000;  -- Log queries > 1s
-- ALTER SYSTEM SET auto_explain.log_analyze = on;

-- Work memory for complex queries
SET work_mem = '16MB';

-- Statement timeout to prevent runaway queries
SET statement_timeout = '30s';

-- Lock timeout to prevent long lock waits
SET lock_timeout = '10s';

SELECT 'Settings configured' AS status;
EOF

echo "✓ Database settings configured"
echo "  (For permanent settings, use Supabase Dashboard → Database → Settings)"
```

### 10. Set Up Development Workflow

Configure recommended workflow:

```bash
echo "Setting up development workflow..."

# Create helpful scripts
mkdir -p scripts

cat > scripts/db-connect.sh << 'EOF'
#!/bin/bash
# Connect to Supabase database
source .env.local
psql "$SUPABASE_DB_URL"
EOF

cat > scripts/db-reset-local.sh << 'EOF'
#!/bin/bash
# Reset local Supabase database
supabase db reset
EOF

chmod +x scripts/*.sh

echo "✓ Helper scripts created in scripts/"
```

---

## Output

Display setup summary:

```
✅ SUPABASE SETUP COMPLETE

Project: {project_name}
Region: {region}
Status: Ready for development

Environment:
✓ Supabase CLI configured
✓ Project linked/created
✓ DB Sage structure initialized
✓ Extensions enabled
✓ .env.local created (REMEMBER TO UPDATE!)

Folder Structure:
supabase/
├── migrations/    # Database migrations
├── seeds/         # Seed data
├── tests/         # SQL tests
├── docs/          # Documentation
└── snapshots/     # Backup snapshots

Next Steps:
1. Update .env.local with your keys
2. Test connection: psql "$SUPABASE_DB_URL"
3. Design your schema: *model-domain
4. Create first migration: *create-migration
5. Set up RLS policies: *create-rls-policies

Useful Commands:
- Connect to DB: ./scripts/db-connect.sh
- Create migration: supabase migration new {name}
- Push changes: supabase db push
- Pull remote: supabase db pull

Documentation:
- Supabase Docs: https://supabase.com/docs
- DB Sage Guide: docs/architecture/db-sage/README.md
```

---

## Common Next Steps

### 1. Create Initial Schema

```bash
# Option A: Interactive modeling
*model-domain

# Option B: Create migration manually
supabase migration new initial_schema
# Edit: supabase/migrations/{timestamp}_initial_schema.sql
```

### 2. Set Up Row Level Security

```bash
# Create RLS policies
*create-rls-policies

# Or manually:
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_data" ON users
  FOR ALL TO authenticated
  USING (auth.uid() = id);
```

### 3. Add Seed Data

```bash
# Create seed file
supabase migration new seed_initial_data

# Or use DB Sage:
*seed supabase/migrations/{timestamp}_seed.sql
```

### 4. Test Migration Workflow

```bash
# Create snapshot
*snapshot baseline

# Test migration
*dry-run supabase/migrations/{file}.sql

# Apply
*apply-migration supabase/migrations/{file}.sql

# Verify
*smoke-test v1.0
```

---

## Supabase CLI Cheat Sheet

```bash
# Project Management
supabase projects list              # List all projects
supabase link --project-ref {ref}  # Link to project
supabase status                     # Show project status

# Local Development
supabase init                       # Initialize local setup
supabase start                      # Start local Supabase
supabase stop                       # Stop local Supabase
supabase db reset                   # Reset local database

# Migrations
supabase migration new {name}       # Create new migration
supabase db push                    # Push migrations to remote
supabase db pull                    # Pull remote schema
supabase db diff                    # Compare local vs remote

# Functions (Edge Functions)
supabase functions new {name}       # Create new function
supabase functions serve            # Run functions locally
supabase functions deploy {name}    # Deploy function

# Secrets
supabase secrets set {name}={value} # Set secret
supabase secrets list               # List secrets
```

---

## Troubleshooting

### Issue 1: Connection Refused

**Error:** `could not connect to server`

**Fix:**
1. Check database is running (Dashboard → Database → Connection info)
2. Verify password in .env.local
3. Check firewall allows port 5432/6543
4. Try connection pooler (port 6543) instead

### Issue 2: SSL Error

**Error:** `SSL connection has been closed unexpectedly`

**Fix:**
Add `?sslmode=require` to connection string:
```bash
postgresql://postgres:password@db.ref.supabase.co:5432/postgres?sslmode=require
```

### Issue 3: Permission Denied

**Error:** `permission denied for schema public`

**Fix:**
Use service_role key for admin operations, or grant permissions:
```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

---

## References

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [DB Sage Documentation](docs/architecture/db-sage/README.md)
