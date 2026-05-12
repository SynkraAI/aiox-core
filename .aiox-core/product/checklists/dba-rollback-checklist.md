# DBA Rollback Checklist

## Instructions for Data Engineer Agent

When a database rollback is needed, go through each item in this checklist. Report the status of each item (e.g., [x] Done, [ ] Not Done, [N/A] Not Applicable) and provide brief comments if necessary.

[[LLM: INITIALIZATION INSTRUCTIONS - DBA ROLLBACK EXECUTION

This checklist is for DATA ENGINEER AGENTS executing database rollbacks.

IMPORTANT: Rollbacks must be executed carefully to avoid data loss. Follow this checklist precisely.

EXECUTION APPROACH:

1. Remain calm - hasty rollbacks cause more problems
2. Go through each section in order
3. Mark items as [x] Done, [ ] Not Done, or [N/A] Not Applicable
4. Document everything for post-mortem analysis
5. Communicate status to stakeholders

Controlled rollback is better than panic.]]

## Checklist Items

1. **Situation Assessment:**

   [[LLM: Understand the problem before acting]]

   - [ ] Issue clearly identified and documented
   - [ ] Impact assessment completed (affected users, data, features)
   - [ ] Decision to rollback confirmed by appropriate stakeholder
   - [ ] Current database state captured (snapshot if possible)
   - [ ] Affected migration(s) identified

2. **Pre-Rollback Preparation:**

   [[LLM: Prepare before executing any rollback]]

   - [ ] Rollback script(s) located and reviewed
   - [ ] Dependencies between migrations understood
   - [ ] Application instances notified or stopped (if needed)
   - [ ] Maintenance mode enabled (if available)
   - [ ] Team members notified of rollback in progress

3. **Rollback Execution:**

   [[LLM: Execute carefully and monitor]]

   - [ ] Database connection established with appropriate privileges
   - [ ] Transaction started for rollback operations
   - [ ] Rollback script executed
   - [ ] No errors during execution
   - [ ] Transaction committed (or rolled back if errors)

4. **Post-Rollback Validation:**

   [[LLM: Verify the rollback was successful]]

   - [ ] Schema state matches expected pre-migration state
   - [ ] Application functionality restored
   - [ ] No data corruption detected
   - [ ] RLS policies functioning correctly
   - [ ] Critical queries performing as expected

5. **Recovery & Communication:**

   [[LLM: Complete the recovery process]]

   - [ ] Application instances restarted (if stopped)
   - [ ] Maintenance mode disabled
   - [ ] Stakeholders notified of rollback completion
   - [ ] End users notified (if necessary)
   - [ ] Monitoring confirmed normal operations

6. **Documentation & Post-Mortem:**

   [[LLM: Learn from this incident]]

   - [ ] Incident timeline documented
   - [ ] Root cause identified (if known)
   - [ ] Rollback procedure effectiveness noted
   - [ ] Improvements for future rollbacks documented
   - [ ] Post-mortem meeting scheduled (if significant incident)

## Final Confirmation

[[LLM: FINAL ROLLBACK SUMMARY

After completing the checklist:

1. Summarize what was rolled back and why
2. Confirm current database state is stable
3. Document any data impact
4. Identify follow-up actions needed
5. Confirm system is operational

Document everything for future reference.]]

- [ ] I, the Data Engineer Agent, confirm that the rollback has been completed successfully and the system is stable.
