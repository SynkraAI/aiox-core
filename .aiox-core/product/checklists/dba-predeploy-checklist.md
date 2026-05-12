# DBA Pre-Deploy Checklist

## Instructions for Data Engineer Agent

Before deploying database changes to production, please go through each item in this checklist. Report the status of each item (e.g., [x] Done, [ ] Not Done, [N/A] Not Applicable) and provide brief comments if necessary.

[[LLM: INITIALIZATION INSTRUCTIONS - DBA PRE-DEPLOY VALIDATION

This checklist is for DATA ENGINEER AGENTS to validate database changes before production deployment.

IMPORTANT: Database changes are often irreversible or costly to fix. This checklist ensures safe deployment.

EXECUTION APPROACH:

1. Go through each section systematically
2. Mark items as [x] Done, [ ] Not Done, or [N/A] Not Applicable
3. Add brief comments explaining any [ ] or [N/A] items
4. Be specific about what was validated
5. Flag any concerns or risks identified

Production safety is paramount.]]

## Checklist Items

1. **Migration Validation:**

   [[LLM: Migrations must be safe and reversible]]

   - [ ] All migrations have been tested in development environment
   - [ ] Migrations are idempotent (safe to run multiple times)
   - [ ] Rollback scripts exist for all schema changes
   - [ ] Migration order dependencies are documented
   - [ ] No destructive operations without explicit safeguards

2. **Schema Review:**

   [[LLM: Schema changes can break applications. Verify carefully]]

   - [ ] No breaking changes to existing APIs/tables
   - [ ] Foreign key constraints are properly defined
   - [ ] Indexes exist for all foreign keys and frequently queried columns
   - [ ] NOT NULL constraints are appropriate
   - [ ] Default values are set where needed

3. **Security Review:**

   [[LLM: Database security is critical. Check each item]]

   - [ ] RLS policies are enabled on all user-facing tables
   - [ ] RLS policies have been tested with positive and negative cases
   - [ ] No sensitive data exposed without proper authorization
   - [ ] SECURITY DEFINER functions are justified and safe
   - [ ] No hardcoded credentials or secrets in migrations

4. **Performance Review:**

   [[LLM: Performance issues in production are costly. Validate]]

   - [ ] Large table alterations have been planned for low-traffic periods
   - [ ] New indexes have been tested for query performance
   - [ ] No full table scans introduced on large tables
   - [ ] EXPLAIN ANALYZE run on critical queries
   - [ ] Connection pooling considerations addressed

5. **Backup & Recovery:**

   [[LLM: Always have a way back. Ensure recovery options]]

   - [ ] Database snapshot created before deployment
   - [ ] Rollback procedure documented and tested
   - [ ] Recovery time estimate documented
   - [ ] Data backup verified and accessible

6. **Documentation:**

   [[LLM: Future DBAs need to understand what changed]]

   - [ ] COMMENT ON statements added for new tables/columns
   - [ ] Migration notes document the purpose of changes
   - [ ] Breaking changes communicated to development team
   - [ ] Changelog updated with database changes

## Final Confirmation

[[LLM: FINAL PRE-DEPLOY SUMMARY

After completing the checklist:

1. Summarize database changes being deployed
2. List any items marked as [ ] Not Done with explanations
3. Identify risks and mitigation strategies
4. Confirm rollback procedure is ready
5. Confirm whether deployment should proceed

Production database changes require confidence.]]

- [ ] I, the Data Engineer Agent, confirm that all applicable items above have been addressed and deployment is safe to proceed.
