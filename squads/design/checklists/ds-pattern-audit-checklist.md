# Pattern Audit Checklist

**Purpose:** Validate audit results before consolidation
**Agent:** Brad (Design System Architect)
**References:** audit-codebase.md task

---

## SCAN COMPLETENESS

- [ ] All UI file types detected (React, Vue, HTML, CSS)
  → Fix: Verify scan config includes all extensions: `.tsx`, `.jsx`, `.vue`, `.html`, `.css`, `.scss`, `.module.css`. Add missing globs
- [ ] Scan completed without critical errors
  → Fix: Check scan logs for errors. Common: memory limits (increase `--max-old-space-size`), timeout (increase `--timeout`)
- [ ] Total file count matches expectations
  → Fix: Re-run scan with `find $path -name "*.tsx" -o -name "*.css" | wc -l` to verify. Exclude `node_modules`, `dist`, `.next`
- [ ] No permission errors blocking scan
  → Fix: Run with `sudo` or exclude restricted dirs with `--exclude-dir`. Check `.gitignore` patterns aren't over-filtering

---

## PATTERN DETECTION

### Buttons
- [ ] Button instances counted accurately
  → Fix: Verify regex matches `<button`, `<Button`, `role="button"`. Check for custom button components with non-standard names
- [ ] Unique button patterns identified
  → Fix: Deduplicate by visual fingerprint (class combos), not just tag name. Two `<button>` with different styles = 2 patterns
- [ ] Redundancy factor calculated (instances / unique)
  → Fix: Verify denominator (unique patterns) is correct. Manual spot-check 3 patterns against source code
- [ ] Most-used buttons captured
  → Fix: Sort by frequency descending. If top button has <5 instances, scan may have missed variants

### Colors
- [ ] Hex colors extracted (#RGB, #RRGGBB)
  → Fix: Regex should match both 3-digit and 6-digit hex. Include uppercase: `/#[0-9a-fA-F]{3,8}/g` (covers 8-digit alpha hex)
- [ ] RGB/RGBA colors extracted
  → Fix: Match `rgb(`, `rgba(`, `hsl(`, `hsla(` patterns. Normalize to hex for deduplication
- [ ] Total unique colors counted
  → Fix: Normalize before counting: lowercase hex, collapse `#aabbcc` to `#abc`, convert rgb to hex. Avoid double-counting
- [ ] Top 10 most-used colors identified
  → Fix: Sort by occurrence count. If top color is white/black/transparent, consider filtering utility colors separately
- [ ] Redundancy factor calculated
  → Fix: Verify denominator (unique patterns) is correct. Manual spot-check 3 patterns against source files

### Spacing
- [ ] Padding values extracted
  → Fix: Match `padding:`, `padding-top:`, shorthand values. Include Tailwind classes like `p-4`, `px-2` if applicable
- [ ] Margin values extracted
  → Fix: Match `margin:`, `margin-top:`, shorthand values. Include negative margins (`-mt-2`, `margin: -8px`)
- [ ] Unique spacing values counted
  → Fix: Normalize units (convert `1rem` = `16px`). Group near-identical values (14px vs 15px likely same intent)

### Typography
- [ ] Font families identified
  → Fix: Match `font-family:`, CSS variables, Tailwind `font-` classes. Include fallback stacks as single entry
- [ ] Font sizes extracted
  → Fix: Match `font-size:`, `text-{size}` Tailwind classes. Normalize to px for comparison (1rem = 16px)
- [ ] Font weights counted
  → Fix: Match `font-weight:`, numeric values (400, 700) and keywords (normal, bold). Map keywords to numbers

### Forms
- [ ] Input elements counted
  → Fix: Match `<input`, `<textarea`, `<select`, and custom input components. Check for uncontrolled vs controlled patterns
- [ ] Form elements counted
  → Fix: Match `<form`, `<fieldset`, `<legend`. Include form wrapper components with non-standard names
- [ ] Unique patterns identified
  → Fix: Classify by input type (`text`, `email`, `password`, `checkbox`, `radio`) + wrapper pattern. Each combo = unique pattern

---

## OUTPUT VALIDATION

- [ ] pattern-inventory.json generated
  → Fix: Check output directory exists and is writable. Verify scan command includes `--output` flag pointing to correct path
- [ ] JSON is valid and parseable
  → Fix: Run `cat pattern-inventory.json | python -m json.tool` to validate. Common errors: trailing commas, unescaped quotes
- [ ] All pattern types included
  → Fix: Verify JSON has keys for: `buttons`, `colors`, `spacing`, `typography`, `forms`. Missing = scan config incomplete
- [ ] Metadata complete (timestamp, scan path, file counts)
  → Fix: Check JSON root for `metadata` object with `timestamp`, `scanPath`, `totalFiles`, `scanDuration` fields
- [ ] .state.yaml created
  → Fix: Verify state file path matches convention: `.state.yaml` in project root or `outputs/` directory
- [ ] State file has valid YAML syntax
  → Fix: Run `python -c "import yaml; yaml.safe_load(open('.state.yaml'))"` to validate. Check indentation (spaces, not tabs)
- [ ] Phase set to "audit_complete"
  → Fix: Open `.state.yaml`, verify `phase: audit_complete`. If missing, update manually and re-run validation

---

## METRICS VALIDATION

- [ ] Redundancy factors >1 (indicates duplication)
  → Fix: If factor is exactly 1.0, either codebase has zero duplication (unlikely) or scan missed instances. Re-verify scan coverage
- [ ] Pattern counts seem reasonable (not artificially inflated)
  → Fix: Cross-reference with manual count of 1-2 pattern types. If automated count is >2x manual, check for false positives in regex
- [ ] No zero counts for major pattern types (unless truly zero)
  → Fix: Zero buttons/colors in a UI codebase = scan failure. Verify file extensions and scan path include UI source files

---

## Edge Cases

- [ ] **Monorepo scanning:** Patterns detected across packages, not just root
- [ ] **Dynamic classes:** Tailwind JIT/dynamic classes (`bg-${color}-500`) counted correctly
- [ ] **CSS-in-JS:** styled-components/emotion patterns included in scan
- [ ] **Duplicate filenames:** Same component name in different directories counted separately
- [ ] **Generated files:** Build artifacts (dist/, .next/) excluded from scan
- [ ] **Theme override:** Pattern still works when design tokens are overridden by theme
  → Fix: Test with alternate theme tokens, verify no hardcoded fallbacks break
- [ ] **Optional slots:** Pattern handles missing optional slots/children gracefully
  → Fix: Add conditional rendering for optional slots, test with minimal props
- [ ] **Multi-framework:** Pattern works across all supported frameworks (React, Vue, etc.)
  → Fix: Verify framework-agnostic token usage, no framework-specific APIs in shared code
- [ ] **No-JS fallback:** Pattern degrades gracefully when JavaScript is disabled
  → Fix: Ensure base HTML/CSS provides functional layout without JS enhancement

---

## NEXT STEPS DECISION

**If redundancy factors >3x:**
- Proceed to *consolidate
- Significant pattern reduction opportunity

**If redundancy factors <2x:**
- Codebase is relatively clean
- Consider if design system is worth investment

**If colors >50 or buttons >20:**
- Major technical debt
- Strong candidate for consolidation

---

**Reviewer:** ________ **Date:** ________
**Audit Quality:** [ ] Excellent [ ] Good [ ] Needs Review

---

## Scoring

### Point System
Each checkbox item = 1 point.

| Category | Items | Weight |
|----------|-------|--------|
| Scan Completeness (Pattern Inventory) | 4 | 4pts |
| Pattern Detection (Redundancy Analysis + Classification) | 18 | 18pts |
| Output Validation (Consolidation Readiness) | 7 | 7pts |
| Metrics Validation | 3 | 3pts |
| Edge Cases | 9 | 9pts |
| **Total** | **41** | **41pts** |

### Pass/Fail Thresholds
| Grade | Score | Action |
|-------|-------|--------|
| PASS | >= 80% (33+) | Proceed to next phase |
| CONDITIONAL | 60-79% (25-32) | Fix critical items, re-check |
| FAIL | < 60% (24-) | Major rework required |

### Auto-Correction
If items fail:
- Run `*ds-consolidate-patterns` to identify merge candidates. Use `*ds-scan-artifact` for pattern detection.
