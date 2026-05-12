# GitHub Actions Workflows

This directory contains automated workflows for the AIOX project.

---

## Quarterly Architecture Gap Audit

**File:** `quarterly-gap-audit.yml`  
**Story:** 3.25  
**Created:** 2025-10-28

### Purpose

Automatically audits architecture gaps on a quarterly basis and generates trend reports with MCP adoption metrics.

### Schedule

- **Automatic:** Runs quarterly on Jan 1, Apr 1, Jul 1, Oct 1 at midnight UTC
- **Manual:** Can be triggered via GitHub Actions UI

### What It Does

1. **Parses framework entities** (agents, tasks, templates, tools)
2. **Validates tool references** (Story 3.21)
3. **Synthesizes relationships** (Story 3.22)
4. **Detects gaps** in the architecture
5. **Generates trend report** with:
   - Gap count comparison vs previous quarter
   - Gap breakdown by category
   - Top 10 entities with most gaps
   - MCP adoption metrics (Docker MCP Toolkit)
   - Token savings estimates
   - Story suggestions for remediation
6. **Creates GitHub issue** with the trend report
7. **Uploads artifacts** for historical tracking

### Manual Trigger

To manually run the audit:

1. Go to **Actions** tab in GitHub
2. Select **Quarterly Architecture Gap Audit**
3. Click **Run workflow**
4. Select branch (usually `main`)
5. Click **Run workflow** button

The workflow will execute all steps and create a new issue with the audit results.

### Artifacts

Each run creates artifacts:
- `gap-backlog.csv` - Current gap backlog
- `gap-trend.json` - Latest trend data
- `gap-trend.md` - Markdown report
- `gap-trend-history.json` - Historical trend data

Download from the workflow run page under **Artifacts** section.

### Generated Issue

The workflow automatically creates a GitHub issue with:
- Title: `Q{1-4} {YEAR} Architecture Gap Audit`
- Labels: `architecture`, `gap-remediation`, `quarterly-audit`
- Body: Complete trend report with metrics and recommendations

### MCP Metrics

The report includes Docker MCP Toolkit metrics:
- Tools via Docker gateway vs direct count
- Adoption rate percentage
- Token savings estimate
- MCP governance status

> **Note:** Legacy 1MCP metrics have been deprecated. AIOX now uses Docker MCP Toolkit exclusively (Story 5.11).

### Maintenance

**Dependencies:**
- Node.js 18
- npm packages (installed via `npm ci`)
- Architecture mapping scripts in `outputs/architecture-map/schemas/`

**Configuration:**
- Edit assignees in workflow YAML if needed
- Adjust schedule by modifying cron expression
- Customize labels or issue template in workflow

**Troubleshooting:**
- Check workflow logs for errors
- Verify all parsing scripts exist
- Ensure gap-backlog.csv exists (run detect-gaps.js first)

---

## PR Automation (pr-automation.yml)

**File:** `pr-automation.yml`
**Story:** 3.3-3.4
**Created:** 2025-12-02

### Purpose

Automates PR validation with coverage reporting, quality summary comments, and required status checks.

### Features

1. **Required Status Checks** - Lint, TypeCheck, Tests, Story Validation
2. **Coverage Comments** - Posts coverage report to PR
3. **Quality Summary** - Generates quality gate summary comment
4. **CodeRabbit Integration** - Verifies CodeRabbit configuration

### Performance Targets

| Job | Target | Timeout |
|-----|--------|---------|
| lint | < 60s | 5 min |
| typecheck | < 60s | 5 min |
| test | < 2 min | 10 min |
| story-validation | < 30s | 5 min |
| **Total (parallel)** | **< 3 min** | - |

All main jobs run in parallel, achieving total PR validation time under 3 minutes.

### Required Checks for Merge

These checks must pass before a PR can be merged to `main`:

```yaml
# Required status checks
- lint
- typecheck
- test
- story-validation
- quality-summary
```

---

## Other Workflows

### CI (ci.yml)
Continuous integration testing for push events and PRs.

### Test (test.yml)
Extended test suite with security audit, build validation, and compatibility testing.

### Cross-Platform Tests (cross-platform-tests.yml)
Tests the framework across different operating systems.

---

**Last Updated:** 2025-12-02 (Story 3.3-3.4)


