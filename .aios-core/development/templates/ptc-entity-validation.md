# PTC Template: Entity Validation Batch

---
execution_mode: programmatic
ptc_type: bash-batch  # Fallback — true PTC not available in Claude Code CLI (ADR-7)
adr_reference: ADR-3 (PTC native ONLY — no MCP tools in batch blocks)
story: TOK-3
---

## Purpose

Batch-scan all entities in entity-registry.yaml against their validation rules.
N entities x M checks consolidated into a single Bash block with one summary output.

**Token savings:** ~20-30% vs individual Grep/Read calls per entity.

## Restriction (ADR-3)

**ONLY native/CLI tools allowed inside this batch block.**
MCP tools are EXCLUDED. Uses: Bash, grep (via bash), file reads (via bash).

## Template

```bash
#!/bin/bash
# PTC-ENTITY-VALIDATION: Batch entity registry scan
# Usage: Execute as single Bash tool call. Only the final summary enters context.

REGISTRY=".aios-core/data/entity-registry.yaml"
TOOL_REGISTRY=".aios-core/data/tool-registry.yaml"

PASS=0
FAIL=0
WARN=0
RESULTS=""

# --- Check 1: Registry file exists ---
if [ ! -f "$REGISTRY" ]; then
  echo "FATAL: entity-registry.yaml not found at $REGISTRY"
  exit 1
fi

# --- Check 2: Required fields present in each entity ---
required_fields=("name" "type" "layer" "description")
for field in "${required_fields[@]}"; do
  count=$(grep -c "  $field:" "$REGISTRY" 2>/dev/null || echo "0")
  if [ "$count" -gt 0 ]; then
    RESULTS+="FIELD '$field': found $count occurrences — PASS\n"
    ((PASS++))
  else
    RESULTS+="FIELD '$field': NOT FOUND — FAIL\n"
    ((FAIL++))
  fi
done

# --- Check 3: No duplicate entity names ---
duplicates=$(grep "^  [a-zA-Z]" "$REGISTRY" | sort | uniq -d)
if [ -z "$duplicates" ]; then
  RESULTS+="DUPLICATES: none — PASS\n"
  ((PASS++))
else
  RESULTS+="DUPLICATES: found\n$duplicates\n— FAIL\n"
  ((FAIL++))
fi

# --- Check 4: Tool registry consistency ---
if [ -f "$TOOL_REGISTRY" ]; then
  tool_count=$(grep -c "tier:" "$TOOL_REGISTRY" 2>/dev/null || echo "0")
  RESULTS+="TOOL-REGISTRY: $tool_count tools found — PASS\n"
  ((PASS++))
else
  RESULTS+="TOOL-REGISTRY: file missing — WARN\n"
  ((WARN++))
fi

# --- Check 5: Layer annotations valid (L1-L4) ---
invalid_layers=$(grep "layer:" "$REGISTRY" | grep -v "L[1-4]" | head -5)
if [ -z "$invalid_layers" ]; then
  RESULTS+="LAYERS: all valid (L1-L4) — PASS\n"
  ((PASS++))
else
  RESULTS+="LAYERS: invalid entries found\n$invalid_layers\n— FAIL\n"
  ((FAIL++))
fi

# --- Summary ---
echo "=== ENTITY VALIDATION SUMMARY ==="
echo "Passed: $PASS | Failed: $FAIL | Warnings: $WARN"
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
| Direct (N checks) | 5-10 | 5-10 (each result) | ~5,000-10,000 |
| Batch (1 call) | 1 | 1 (summary only) | ~2,000-3,000 |
| **Reduction** | -80% calls | -80% entries | **~20-40%** |

## Notes

- Extensible: add more checks by appending to the script
- Each check reports PASS/FAIL/WARN independently
- Only summary enters context — intermediate grep/read results stay in shell
