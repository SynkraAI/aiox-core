---
paths:
  - ".aios-core/**"
  - "tests/**"
  - "packages/**"
  - "bin/**"
---

# CodeRabbit Integration — Detailed Rules

## Self-Healing Configuration

### Dev Phase (@dev — Story Development Cycle Phase 3)

```yaml
mode: light
max_iterations: 2
timeout_minutes: 30
severity_filter: [CRITICAL, HIGH]
behavior:
  CRITICAL: auto_fix
  HIGH: auto_fix (iteration < 2) else document_as_debt
  MEDIUM: document_as_debt
  LOW: ignore
```

**Flow:**
```
RUN CodeRabbit → CRITICAL found?
  YES → auto-fix (iteration < 2) → Re-run
  NO → Document HIGH as debt, proceed
After 2 iterations with CRITICAL → HALT, manual intervention
```

### QA Phase (@qa — QA Loop Pre-Review)

```yaml
mode: full
max_iterations: 3
timeout_minutes: 30
severity_filter: [CRITICAL, HIGH]
behavior:
  CRITICAL: auto_fix
  HIGH: auto_fix
  MEDIUM: document_as_debt
  LOW: ignore
```

**Flow:**
1. Pre-commit review scan
2. Self-healing loop (max 3 iterations)
3. Manual QA analysis (architectural, traceability, NFR)
4. Gate decision (verdict)

## Severity Handling Summary

| Severity | Dev Phase | QA Phase |
|----------|-----------|----------|
| CRITICAL | auto_fix, block if persists | auto_fix, block if persists |
| HIGH | auto_fix, document if fails | auto_fix, document if fails |
| MEDIUM | document_as_tech_debt | document_as_tech_debt |
| LOW | ignore | ignore |

## WSL Execution (Windows)

```bash
# Self-healing mode (automatic in dev tasks)
wsl bash -c 'cd /mnt/c/.../aios-core && ~/.local/bin/coderabbit --severity CRITICAL,HIGH --auto-fix'

# Manual review
wsl bash -c 'cd /mnt/c/.../aios-core && ~/.local/bin/coderabbit -t uncommitted'

# Prompt-only mode
wsl bash -c 'cd /mnt/c/.../aios-core && ~/.local/bin/coderabbit --prompt-only -t uncommitted'
```

## Integration Points

| Workflow | Phase | Trigger | Agent |
|----------|-------|---------|-------|
| Story Development Cycle | 3 (Implement) | After task completion | @dev |
| QA Loop | 1 (Review) | At review start | @qa |
| Standalone | Any | `*coderabbit-review` command | Any |

## Focus Areas by Story Type

| Story Type | Primary Focus |
|-----------|--------------|
| Feature | Code patterns, test coverage, API design |
| Bug Fix | Regression risk, root cause coverage |
| Refactor | Breaking changes, interface stability |
| Documentation | Markdown quality, reference validity |
| Database | SQL injection, RLS coverage, migration safety |

## Report Location

CodeRabbit reports saved to: `docs/qa/coderabbit-reports/`

## Configuration Reference

Full config in `.aios-core/core-config.yaml` under `coderabbit_integration` section.
