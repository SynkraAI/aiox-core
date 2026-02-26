# PTC Template: Research Aggregation Batch

---
execution_mode: programmatic
ptc_type: bash-batch  # Fallback — true PTC not available in Claude Code CLI (ADR-7)
adr_reference: ADR-3 (PTC native ONLY — no MCP tools in batch blocks)
story: TOK-3
---

## Purpose

Consolidate multi-file research aggregation (scan docs, extract findings, merge)
into a single Bash block. Intermediate grep/read results stay in shell variables.

**Token savings:** ~20% vs multiple Read + Grep tool calls.

**Note:** This template uses native CLI tools only. For web-based research
(WebSearch, EXA), those tool calls must remain separate — they are NOT
ptc_eligible (MCP tools excluded per ADR-3). This template covers the
**aggregation** phase (local file scanning), not the **search** phase.

## Restriction (ADR-3)

**ONLY native/CLI tools allowed inside this batch block.**
MCP tools (EXA, Context7, Apify) are EXCLUDED from batch blocks.
WebSearch/WebFetch are native Tier 1 but operate as API calls — they can be
included in batch if executed via shell scripting patterns.

## Template

```bash
#!/bin/bash
# PTC-RESEARCH-AGGREGATION: Batch scan research docs and aggregate findings
# Usage: Execute as single Bash tool call. Only the final summary enters context.

RESEARCH_DIR="docs/research"
OUTPUT=""
TOPICS_FOUND=0
FILES_SCANNED=0

# --- Scan all research directories ---
for dir in "$RESEARCH_DIR"/*/; do
  if [ -d "$dir" ]; then
    readme="$dir/README.md"
    if [ -f "$readme" ]; then
      ((FILES_SCANNED++))

      # Extract title (first H1)
      title=$(grep -m1 "^# " "$readme" | sed 's/^# //')

      # Extract key findings (lines with "finding" or "conclusion" or "result")
      findings=$(grep -i -c "finding\|conclusion\|result\|recommendation" "$readme" 2>/dev/null || echo "0")

      # Extract token/performance metrics if present
      metrics=$(grep -i "token\|reduction\|saving\|performance\|latency" "$readme" | head -3)

      OUTPUT+="## $title\n"
      OUTPUT+="- Source: $readme\n"
      OUTPUT+="- Key findings count: $findings\n"
      if [ -n "$metrics" ]; then
        OUTPUT+="- Metrics:\n"
        while IFS= read -r line; do
          OUTPUT+="  - $line\n"
        done <<< "$metrics"
      fi
      OUTPUT+="\n"
      ((TOPICS_FOUND++))
    fi
  fi
done

# --- Summary ---
echo "=== RESEARCH AGGREGATION SUMMARY ==="
echo "Directories scanned: $FILES_SCANNED"
echo "Topics with findings: $TOPICS_FOUND"
echo ""
echo -e "$OUTPUT"
```

## Token Comparison

| Approach | Tool Calls | Context Entries | Estimated Tokens |
|----------|-----------|-----------------|-----------------|
| Direct (N reads + N greps) | 10-20 | 10-20 results | ~8,000-15,000 |
| Batch (1 call) | 1 | 1 (summary only) | ~3,000-5,000 |
| **Reduction** | -90% calls | -90% entries | **~30-50%** |

## Notes

- Scans `docs/research/*/README.md` by default — adjust path as needed
- Extracts title, findings count, and performance metrics per research doc
- Only the aggregated summary enters context
- For web research (EXA, WebSearch), run those as separate tool calls first,
  then use this template to aggregate the saved results
