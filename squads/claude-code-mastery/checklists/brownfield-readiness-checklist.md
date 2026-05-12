# Brownfield Readiness Checklist

**Checklist ID:** CCM-CL-006
**Referenced by:** project-integrator
**Purpose:** Readiness check before integrating Claude Code into an existing (brownfield) project. Ensures the repository is analyzed, conventions are discovered, sensitive files are mapped, and risks are mitigated.

[[LLM: INITIALIZATION INSTRUCTIONS - BROWNFIELD READINESS

This checklist is used BEFORE adding Claude Code configuration to an
existing project. It ensures we understand the codebase, protect
sensitive files, and integrate without disrupting existing workflows.

EXECUTION APPROACH:
1. Analyze the repository structure and existing tooling
2. Discover conventions and patterns already in use
3. Map ALL sensitive files and secrets
4. Assess team considerations for configuration choices
5. Document risks and prepare rollback plan
6. All CRITICAL items must pass before starting integration

Brownfield integration done carelessly exposes secrets and breaks workflows.
Take the time to understand before modifying.]]

---

## 1. Repository Analysis

- [ ] Git repository is initialized and has commit history
- [ ] `.gitignore` exists and covers common patterns (node_modules, build output, OS files)
- [ ] CI/CD pipeline is present (GitHub Actions, GitLab CI, Jenkins, etc.)
- [ ] Repository has a defined branching strategy (main/develop, trunk-based, etc.)
- [ ] Package manager is identified (npm, yarn, pnpm, bun) with lockfile present
- [ ] Build system is identified and functional (`npm run build` or equivalent works)
- [ ] Project language and framework are documented or identifiable

## 2. Existing Tooling

- [ ] Linter is configured (ESLint, Prettier, etc.) with existing rules
- [ ] Test framework is present (Jest, Vitest, Mocha, pytest, etc.)
- [ ] Code formatting rules are defined and enforced
- [ ] Pre-commit hooks exist (husky, lint-staged, etc.)
- [ ] IDE configuration files are present (.vscode/, .idea/, etc.)
- [ ] Other AI coding tools are configured (Copilot, Cursor rules, etc.)

## 3. Convention Discovery

- [ ] Naming patterns identified (camelCase, PascalCase, kebab-case for files)
- [ ] Directory structure mapped (src/, lib/, app/, components/, etc.)
- [ ] Import style identified (absolute vs relative, path aliases)
- [ ] Error handling patterns documented (try/catch, Result types, error boundaries)
- [ ] State management approach identified (if frontend project)
- [ ] API patterns documented (REST, GraphQL, tRPC, etc.)
- [ ] Test file naming convention identified (*.test.ts, *.spec.ts, __tests__/)

## 4. Sensitive Files

- [ ] All `.env` files located and cataloged (CRITICAL)
- [ ] Credentials files identified (service accounts, API keys, certificates) (CRITICAL)
- [ ] Secret management approach documented (vault, env vars, config files)
- [ ] `.gitignore` already excludes secret files (verify, do not assume)
- [ ] No committed secrets found in git history (run secret scanner if available)
- [ ] Private key files (*.key, *.pem, *.p12) located and mapped
- [ ] Database connection strings identified and their storage method documented

## 5. Team Considerations

- [ ] Team size documented (solo, small team, large team)
- [ ] Permission mode preference decided (explore for solo, ask for teams, auto for trusted CI)
- [ ] Shared vs local settings strategy decided (settings.json vs settings.local.json)
- [ ] Existing code review process documented (PR reviews, pair programming)
- [ ] Team familiarity with AI coding tools assessed
- [ ] Communication plan for introducing Claude Code to team members defined

## 6. Risk Assessment

- [ ] Critical paths identified (auth, payments, data processing) that need extra deny rules
- [ ] Rollback plan exists (can remove .claude/ directory cleanly) (CRITICAL)
- [ ] No existing .claude/ directory that would be overwritten
- [ ] Integration will not modify existing CI/CD without explicit approval
- [ ] First integration scope is limited (start with CLAUDE.md + settings, add rules incrementally)
- [ ] Test environment available for validating integration before team-wide rollout

---

## PASS/FAIL Criteria

**PASS:** All items marked (CRITICAL) are checked. Sensitive files are fully mapped. Rollback plan documented. Risk assessment complete with mitigations for each identified risk.

**FAIL:** Any (CRITICAL) item unchecked. Sensitive files not fully identified. No rollback plan. Risk assessment incomplete.

**Action on FAIL:** Complete sensitive file mapping before any integration work. Document rollback plan. If secrets are found in git history, address that security issue before proceeding with Claude Code integration.
