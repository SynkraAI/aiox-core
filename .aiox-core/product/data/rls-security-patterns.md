# Row Level Security (RLS) Patterns Guide

**Purpose:** Reference guide for implementing secure RLS policies
**Agent:** Dan (Data Engineer)
**Platform:** PostgreSQL / Supabase
**Security:** Multi-tenant data isolation patterns

---

## RLS FUNDAMENTALS

### Enabling RLS
```sql
-- Enable RLS on table (required before policies work)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner (recommended in Supabase)
ALTER TABLE posts FORCE ROW LEVEL SECURITY;
```

### Policy Structure
```sql
CREATE POLICY policy_name
ON table_name
FOR operation           -- ALL, SELECT, INSERT, UPDATE, DELETE
TO role                 -- PUBLIC, authenticated, specific_role
USING (expression)      -- Filter for SELECT, UPDATE, DELETE
WITH CHECK (expression) -- Filter for INSERT, UPDATE
```

---

## COMMON PATTERNS

### Pattern 1: User Owns Row
```sql
-- Users can only see/modify their own data
CREATE POLICY "Users can view own data"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own data"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

### Pattern 2: Organization/Team Based
```sql
-- Users can see data from their organization
CREATE POLICY "Team members can view team data"
ON projects FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
  )
);
```

### Pattern 3: Role-Based Access
```sql
-- Different access levels based on user role
CREATE POLICY "Admins have full access"
ON sensitive_data FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Regular users read-only"
ON sensitive_data FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'user'
  )
);
```

### Pattern 4: Public Read, Authenticated Write
```sql
-- Anyone can read, only authenticated can write
CREATE POLICY "Public read access"
ON public_content FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "Authenticated write access"
ON public_content FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);
```

### Pattern 5: Time-Based Access
```sql
-- Access expires after a certain date
CREATE POLICY "Time-limited access"
ON trial_content FOR SELECT
TO authenticated
USING (
  trial_expires_at > now()
  AND user_id = auth.uid()
);
```

---

## SUPABASE-SPECIFIC PATTERNS

### Using auth.uid()
```sql
-- Get the current authenticated user's ID
SELECT auth.uid();

-- In policy
CREATE POLICY "Owner access"
ON documents FOR ALL
TO authenticated
USING (owner_id = auth.uid());
```

### Using auth.jwt()
```sql
-- Access JWT claims
SELECT auth.jwt() ->> 'email';
SELECT auth.jwt() -> 'app_metadata' ->> 'role';

-- Policy using custom claims
CREATE POLICY "Premium users only"
ON premium_content FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'plan') = 'premium'
);
```

### Using auth.role()
```sql
-- Different policies for different Supabase roles
CREATE POLICY "Anon can read public"
ON content FOR SELECT
TO anon
USING (is_public = true);

CREATE POLICY "Authenticated can read all"
ON content FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role bypasses RLS"
ON content FOR ALL
TO service_role
USING (true);
```

---

## PERFORMANCE OPTIMIZATION

### Use Indexes for RLS
```sql
-- Create index on columns used in RLS policies
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_org_members_user_org ON organization_members(user_id, organization_id);
```

### Avoid Expensive Subqueries
```sql
-- ❌ Bad: Subquery in every row check
CREATE POLICY "Expensive policy"
ON documents FOR SELECT
USING (
  owner_id IN (
    SELECT user_id FROM complex_permissions_view
    WHERE /* complex logic */
  )
);

-- ✅ Better: Use a security definer function
CREATE OR REPLACE FUNCTION get_accessible_document_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT document_id FROM user_document_access
  WHERE user_id = auth.uid()
$$;

CREATE POLICY "Optimized policy"
ON documents FOR SELECT
USING (id IN (SELECT get_accessible_document_ids()));
```

### Materialized Permissions
```sql
-- Pre-compute permissions for complex access patterns
CREATE TABLE user_document_access (
  user_id uuid REFERENCES auth.users,
  document_id uuid REFERENCES documents,
  PRIMARY KEY (user_id, document_id)
);

CREATE INDEX idx_uda_user ON user_document_access(user_id);

-- Simple, fast policy
CREATE POLICY "Precomputed access"
ON documents FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT document_id FROM user_document_access
    WHERE user_id = auth.uid()
  )
);
```

---

## SECURITY BEST PRACTICES

### Always Enable RLS
```sql
-- Check tables without RLS
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
  SELECT tablename FROM pg_policies WHERE schemaname = 'public'
);
```

### Default Deny
```sql
-- Enable RLS = default deny (no access without policy)
ALTER TABLE sensitive_data ENABLE ROW LEVEL SECURITY;

-- Only specific policies grant access
CREATE POLICY "Explicit access only"
ON sensitive_data FOR SELECT
TO authenticated
USING (/* specific conditions */);
```

### Avoid USING (true)
```sql
-- ❌ Dangerous: Opens access to all
CREATE POLICY "Too permissive"
ON users FOR ALL
USING (true);

-- ✅ Always specify conditions
CREATE POLICY "Proper restriction"
ON users FOR SELECT
TO authenticated
USING (id = auth.uid() OR is_public = true);
```

### Separate Policies by Operation
```sql
-- ✅ Granular control
CREATE POLICY "Select policy" ON posts FOR SELECT ...;
CREATE POLICY "Insert policy" ON posts FOR INSERT ...;
CREATE POLICY "Update policy" ON posts FOR UPDATE ...;
CREATE POLICY "Delete policy" ON posts FOR DELETE ...;

-- ❌ Avoid overly broad policies
CREATE POLICY "All operations" ON posts FOR ALL ...;
```

---

## DEBUGGING RLS

### Test Policies
```sql
-- Check what policies exist
SELECT * FROM pg_policies WHERE tablename = 'posts';

-- Test as specific user (Supabase)
-- Use the SQL Editor with a specific user's JWT

-- Debug query with RLS
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM posts;
RESET ROLE;
```

### Common Issues
1. **No data returned:** Check USING clause conditions
2. **Can't insert:** Check WITH CHECK clause
3. **Performance slow:** Add indexes on RLS filter columns
4. **Bypass needed:** Use service_role (admin only)

---

## TESTING CHECKLIST

- [ ] RLS enabled on all user-facing tables
- [ ] Policies exist for all CRUD operations
- [ ] Indexes created for policy filter columns
- [ ] Tested with different user roles
- [ ] Tested edge cases (no org, expired trial, etc.)
- [ ] Performance tested with realistic data volume
- [ ] service_role access restricted to backend only
- [ ] No USING (true) on sensitive tables

---

**Reviewer:** ________ **Date:** ________
**Security Audit:** [ ] PASS [ ] NEEDS REVIEW
