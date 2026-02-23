# PTC Template: QA Gate Batch

---
execution_mode: programmatic
ptc_type: bash-batch  # Fallback — true PTC not available in Claude Code CLI (ADR-7)
adr_reference: ADR-3 (PTC native ONLY — no MCP tools in batch blocks)
story: TOK-3
---

## Purpose

Consolidate QA Gate checks (lint, typecheck, test) into a single Bash block.
Intermediate results stay in shell variables — only the final summary enters context.

**Token savings:** ~20% vs 3 separate tool calls (conservative estimate).
True PTC (API-level) would yield ~37% but is not available in Claude Code CLI.

## Restriction (ADR-3)

**ONLY native/CLI tools allowed inside this batch block.**
MCP tools (EXA, Playwright, Apify, Context7, Nogic, Code-Graph) are EXCLUDED.

Eligible tools: Bash, Read, Write, Edit, Grep, Glob (all `ptc_eligible: true` in tool-registry.yaml).

## Template

```bash
#!/bin/bash
# PTC-QA-GATE: Batch quality checks — single Bash block, one summary output
# Usage: Execute as single Bash tool call. Only the final echo enters context.

set -o pipefail

PASS=0
FAIL=0
RESULTS=""

# --- Check 1: Lint ---
lint_output=$(npm run lint 2>&1)
lint_exit=$?
if [ $lint_exit -eq 0 ]; then
  RESULTS+="LINT: PASS\n"
  ((PASS++))
else
  RESULTS+="LINT: FAIL\n${lint_output}\n"
  ((FAIL++))
fi

# --- Check 2: TypeCheck ---
typecheck_output=$(npm run typecheck 2>&1)
typecheck_exit=$?
if [ $typecheck_exit -eq 0 ]; then
  RESULTS+="TYPECHECK: PASS\n"
  ((PASS++))
else
  RESULTS+="TYPECHECK: FAIL\n${typecheck_output}\n"
  ((FAIL++))
fi

# --- Check 3: Tests ---
test_output=$(npm test 2>&1)
test_exit=$?
if [ $test_exit -eq 0 ]; then
  RESULTS+="TESTS: PASS\n"
  ((PASS++))
else
  RESULTS+="TESTS: FAIL\n${test_output}\n"
  ((FAIL++))
fi

# --- Summary (only this enters context) ---
echo "=== QA GATE SUMMARY ==="
echo "Passed: $PASS / $((PASS + FAIL))"
echo "Failed: $FAIL"
echo ""
echo -e "$RESULTS"

if [ $FAIL -gt 0 ]; then
  echo "VERDICT: FAIL"
  exit 1
else
  echo "VERDICT: PASS"
  exit 0
fi
```

## Token Comparison

| Approach | Tool Calls | Context Entries | Estimated Tokens |
|----------|-----------|-----------------|-----------------|
| Direct (3 calls) | 3 | 3 (each result) | ~3,000-9,000 |
| Batch (1 call) | 1 | 1 (summary only) | ~1,500-3,000 |
| **Reduction** | -67% calls | -67% entries | **~20-50%** |

## Notes

- If any check fails, the full output for that check is included in summary
- Passing checks show only "PASS" (minimal context)
- Exit code 1 = at least one check failed
- This template can be extended with additional checks (build, coverage, etc.)
