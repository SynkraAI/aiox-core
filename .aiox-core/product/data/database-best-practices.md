# Database Best Practices Guide

**Purpose:** Reference guide for database design and implementation patterns
**Agent:** Dan (Data Engineer)
**Standard:** Production-ready PostgreSQL/Supabase patterns

---

## SCHEMA DESIGN

### Naming Conventions
- [ ] Tables: snake_case, plural (e.g., `user_profiles`)
- [ ] Columns: snake_case, descriptive (e.g., `created_at`, `is_active`)
- [ ] Primary keys: `id` (UUID preferred) or `{table}_id`
- [ ] Foreign keys: `{referenced_table}_id`
- [ ] Indexes: `idx_{table}_{column(s)}`
- [ ] Constraints: `{table}_{type}_{column}` (e.g., `users_unique_email`)

### Data Types
- [ ] Use appropriate types (not just VARCHAR for everything)
- [ ] UUID for primary keys (better distribution, security)
- [ ] TIMESTAMPTZ for timestamps (timezone-aware)
- [ ] JSONB for flexible/nested data (not JSON)
- [ ] ENUM types for fixed value sets
- [ ] TEXT over VARCHAR (PostgreSQL handles efficiently)

---

## INDEXING STRATEGY

### When to Index
- [ ] Primary keys (automatic)
- [ ] Foreign keys (manual, but critical)
- [ ] Columns in WHERE clauses
- [ ] Columns in JOIN conditions
- [ ] Columns in ORDER BY (frequently sorted)
- [ ] Composite indexes for multi-column queries

### Index Types
- [ ] B-tree: Default, good for most cases
- [ ] GIN: JSONB fields, full-text search, arrays
- [ ] GiST: Geometric data, range types
- [ ] BRIN: Large tables with natural ordering

### Index Anti-patterns
- [ ] Don't index low-cardinality columns alone
- [ ] Don't create redundant indexes
- [ ] Don't index frequently updated columns without reason
- [ ] Monitor unused indexes with `pg_stat_user_indexes`

---

## QUERY OPTIMIZATION

### General Rules
- [ ] Use EXPLAIN ANALYZE before optimizing
- [ ] Avoid SELECT * in production code
- [ ] Use specific columns in SELECT
- [ ] Limit result sets (pagination)
- [ ] Use EXISTS instead of COUNT for existence checks

### Join Optimization
- [ ] Ensure foreign keys are indexed
- [ ] Use appropriate join types (INNER, LEFT, etc.)
- [ ] Consider query order for optimal execution
- [ ] Break complex joins into CTEs if clearer

### Subquery vs JOIN
- [ ] Prefer JOINs for related data retrieval
- [ ] Use subqueries for scalar values
- [ ] CTEs for complex, multi-step queries
- [ ] Avoid correlated subqueries when possible

---

## DATA INTEGRITY

### Constraints
- [ ] Primary key on every table
- [ ] Foreign keys with appropriate ON DELETE/UPDATE
- [ ] NOT NULL where data is required
- [ ] CHECK constraints for valid value ranges
- [ ] UNIQUE constraints for business rules

### Referential Actions
```sql
-- Safe cascade for dependent data
ON DELETE CASCADE
ON UPDATE CASCADE

-- Protect against accidental deletion
ON DELETE RESTRICT

-- Set to NULL when parent deleted
ON DELETE SET NULL
```

---

## MIGRATIONS

### Best Practices
- [ ] One concern per migration
- [ ] Always provide rollback (down) migration
- [ ] Test migrations on copy of production data
- [ ] Never modify existing migration files
- [ ] Use transactions for schema changes
- [ ] Handle data migrations separately from schema

### Safe Operations
```sql
-- Add column (safe)
ALTER TABLE users ADD COLUMN bio TEXT;

-- Add index concurrently (no lock)
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- Drop with IF EXISTS (idempotent)
DROP INDEX IF EXISTS idx_old_index;
```

### Dangerous Operations
- [ ] Dropping columns with data
- [ ] Changing column types
- [ ] Adding NOT NULL without default
- [ ] Large table migrations without batching

---

## PERFORMANCE MONITORING

### Key Metrics
- [ ] Query execution time (pg_stat_statements)
- [ ] Index usage (pg_stat_user_indexes)
- [ ] Table bloat (pgstattuple)
- [ ] Connection pool usage
- [ ] Cache hit ratio

### Tools
- [ ] EXPLAIN ANALYZE for query plans
- [ ] pg_stat_statements for query stats
- [ ] pgBadger for log analysis
- [ ] Supabase Dashboard for managed instances

---

## BACKUP & RECOVERY

### Backup Strategy
- [ ] Automated daily backups
- [ ] Point-in-time recovery enabled
- [ ] Off-site backup storage
- [ ] Regular restore testing
- [ ] Documented recovery procedures

### Supabase Specific
- [ ] Automatic daily backups (Pro plan+)
- [ ] Point-in-time recovery available
- [ ] Download backups via Dashboard
- [ ] Use `pg_dump` for manual backups

---

## SECURITY

### Access Control
- [ ] Principle of least privilege
- [ ] Role-based access (not user-based)
- [ ] Row Level Security (RLS) for multi-tenant
- [ ] Never expose superuser credentials
- [ ] Rotate credentials regularly

### Data Protection
- [ ] Encrypt sensitive data at rest
- [ ] Use SSL/TLS for connections
- [ ] Audit logging for sensitive tables
- [ ] Mask sensitive data in logs

---

**Reviewer:** ________ **Date:** ________
**Quality Gate:** [ ] PASS [ ] NEEDS REVIEW
