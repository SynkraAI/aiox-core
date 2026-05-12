# Release Checklist

## Instructions for DevOps Agent

Before creating a release, go through each item in this checklist. Report the status of each item (e.g., [x] Done, [ ] Not Done, [N/A] Not Applicable) and provide brief comments if necessary.

[[LLM: INITIALIZATION INSTRUCTIONS - RELEASE VALIDATION

This checklist is for DEVOPS AGENTS preparing releases.

IMPORTANT: Releases are public milestones. This checklist ensures release quality.

EXECUTION APPROACH:

1. Complete all pre-release tasks
2. Mark items as [x] Done, [ ] Not Done, or [N/A] Not Applicable
3. Add comments for any incomplete items
4. Get stakeholder approval before release
5. Follow semantic versioning strictly

Releases represent commitment to quality.]]

## Checklist Items

1. **Version Management:**

   [[LLM: Version numbers communicate change significance]]

   - [ ] Version number follows semantic versioning (MAJOR.MINOR.PATCH)
   - [ ] Version bump type is appropriate for changes:
     - MAJOR: Breaking changes
     - MINOR: New features (backward compatible)
     - PATCH: Bug fixes only
   - [ ] Version updated in package.json
   - [ ] Version updated in all relevant files
   - [ ] Git tag prepared with v prefix (e.g., v4.32.0)

2. **Quality Gates:**

   [[LLM: All quality checks must pass before release]]

   - [ ] All pre-push checklist items completed
   - [ ] All tests pass on release branch
   - [ ] Build succeeds for all target environments
   - [ ] CodeRabbit review completed with no CRITICAL issues
   - [ ] No known blocking bugs

3. **Changelog:**

   [[LLM: Changelog communicates what changed to users]]

   - [ ] CHANGELOG.md updated with new version section
   - [ ] All significant changes documented
   - [ ] Breaking changes clearly marked
   - [ ] Contributors credited (if applicable)
   - [ ] Date of release included

4. **Documentation:**

   [[LLM: Users need updated documentation]]

   - [ ] README reflects current state
   - [ ] Installation instructions verified
   - [ ] API documentation current
   - [ ] Migration guide written (if breaking changes)
   - [ ] Known issues documented

5. **Pre-Release Testing:**

   [[LLM: Final verification before going public]]

   - [ ] Release candidate tested in staging environment
   - [ ] Critical user flows verified
   - [ ] Upgrade path tested (from previous version)
   - [ ] Fresh installation tested
   - [ ] Smoke tests passed

6. **Communication:**

   [[LLM: Stakeholders need to know about releases]]

   - [ ] Release notes prepared for GitHub
   - [ ] Team notified of pending release
   - [ ] Users notified of breaking changes (if any)
   - [ ] Support team briefed on changes
   - [ ] Marketing notified (if significant release)

7. **Rollback Plan:**

   [[LLM: Always have a way back]]

   - [ ] Previous version tagged and accessible
   - [ ] Rollback procedure documented
   - [ ] Database rollback scripts ready (if applicable)
   - [ ] Monitoring in place to detect issues
   - [ ] On-call support available post-release

8. **Release Execution:**

   [[LLM: Execute release carefully]]

   - [ ] All commits included in release
   - [ ] Tag created and pushed
   - [ ] GitHub release created with notes
   - [ ] npm publish executed (if npm package)
   - [ ] Release artifacts verified

## Final Confirmation

[[LLM: FINAL RELEASE SUMMARY

After completing the checklist:

1. Summarize what is in this release
2. List version number and release type
3. Document any known issues or limitations
4. Confirm stakeholder approval received
5. Confirm readiness to execute release

Releases are public commitments to quality.]]

- [ ] I, the DevOps Agent, confirm that all release criteria have been met and the release is ready to proceed.
