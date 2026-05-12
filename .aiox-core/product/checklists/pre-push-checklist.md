# Pre-Push Quality Gate Checklist

## Instructions for DevOps Agent

Before pushing code to the remote repository, go through each item in this checklist. Report the status of each item (e.g., [x] Done, [ ] Not Done, [N/A] Not Applicable) and provide brief comments if necessary.

[[LLM: INITIALIZATION INSTRUCTIONS - PRE-PUSH VALIDATION

This checklist is for DEVOPS AGENTS validating code before pushing to remote.

IMPORTANT: Pushing broken code affects the entire team. This checklist ensures quality.

EXECUTION APPROACH:

1. Run all automated checks first
2. Mark items as [x] Done, [ ] Not Done, or [N/A] Not Applicable
3. Add comments for any failures or concerns
4. Block push if any critical items fail
5. Get user confirmation before pushing

Quality gates protect everyone.]]

## Checklist Items

1. **Code Quality:**

   [[LLM: Code must pass all quality checks]]

   - [ ] `npm run lint` passes with no errors
   - [ ] `npm run typecheck` passes (if TypeScript)
   - [ ] `npm run build` completes successfully
   - [ ] No console.log or debugging statements in production code
   - [ ] No commented-out code blocks

2. **Testing:**

   [[LLM: Tests prove the code works]]

   - [ ] `npm test` passes with all tests green
   - [ ] No skipped tests without documented reason
   - [ ] Test coverage meets project standards
   - [ ] New features have corresponding tests
   - [ ] No flaky tests introduced

3. **Security:**

   [[LLM: Security vulnerabilities must be caught before push]]

   - [ ] No hardcoded credentials or secrets
   - [ ] No API keys or tokens in code
   - [ ] `.env` files not staged for commit
   - [ ] `npm audit` shows no high/critical vulnerabilities
   - [ ] No sensitive data in logs or error messages

4. **CodeRabbit Review:**

   [[LLM: Automated code review catches issues humans miss]]

   - [ ] CodeRabbit review executed (if available)
   - [ ] No CRITICAL issues identified
   - [ ] HIGH issues addressed or documented
   - [ ] Security concerns resolved
   - [ ] Performance issues noted

5. **Git State:**

   [[LLM: Clean git state prevents merge problems]]

   - [ ] Working directory is clean (no uncommitted changes)
   - [ ] All intended changes are committed
   - [ ] Commit messages follow conventional commits format
   - [ ] No merge conflicts pending
   - [ ] Branch is up to date with target branch

6. **Story Compliance:**

   [[LLM: Code should match story requirements]]

   - [ ] All story acceptance criteria met
   - [ ] Story status is "Ready for Review" or "Done"
   - [ ] File List in story is complete
   - [ ] No scope creep (only story-related changes)
   - [ ] Story checkboxes updated

7. **Documentation:**

   [[LLM: Changes should be documented]]

   - [ ] README updated if needed
   - [ ] API documentation updated if endpoints changed
   - [ ] Breaking changes documented
   - [ ] Changelog entry prepared (if release)

## Final Confirmation

[[LLM: FINAL PRE-PUSH SUMMARY

After completing the checklist:

1. Summarize what is being pushed
2. List any items marked as [ ] Not Done with explanations
3. Confirm all critical gates pass
4. Note any concerns for reviewers
5. Get user approval before executing push

Only push when confident in quality.]]

- [ ] I, the DevOps Agent, confirm that all quality gates have passed and the code is safe to push to remote.
