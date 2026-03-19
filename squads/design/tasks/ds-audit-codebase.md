# Audit Codebase for UI Pattern Redundancy

> Task ID: brad-audit-codebase
> Agent: Brad (Design System Architect)
> Version: 1.1.0
> v4.0-compatible: true
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[ds-consolidate-patterns]` · workflow: `brownfield-audit`
> **On Fail:** If scan finds 0 patterns → verify path and file extensions. If scan errors → check file permissions and memory limits (`--max-old-space-size=4096`). Do NOT proceed to consolidate with empty/corrupt inventory. Re-run audit after fixing root cause.

## Description

Scan codebase to detect UI pattern redundancies (buttons, colors, spacing, typography, forms) and quantify technical debt with hard metrics. Brad's specialty: showing you the horror show you've created. **v4.0: Also evaluates machine-readability for agentic DS workflows and motion token coverage.**

## Output Schema
- **produces:** `outputs/design-system/{project}/audit/pattern-inventory.json`
- **format:** JSON data
- **consumed_by:** ds-consolidate-patterns

## Prerequisites

- Codebase with UI code (React, Vue, HTML, or vanilla CSS)
- Bash shell access
- grep, find, awk utilities available
- Reference: Read data/agentic-ds-principles.md for machine-readability checks
- Reference: Read data/motion-tokens-guide.md for animation audit criteria

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to gather scan parameters.

1. **Gather Scan Parameters**
   - Ask for scan path (e.g., ./src, ./app, ./components)
   - Detect frameworks automatically or ask for confirmation
   - Confirm output directory (default: outputs/design-system/{project}/audit/)

2. **Validate Scan Path**
   - Run `test -d $path && test -r $path` and confirm both return exit code 0
   - Count total files with `find $path -type f \( -name "*.tsx" -o -name "*.jsx" -o -name "*.vue" -o -name "*.css" \) | wc -l`
   - Estimate scan time (100k LOC ~2 min)

3. **Confirm and Execute**
   - Show scan plan summary
   - Ask for confirmation before starting
   - Begin pattern detection

### Steps

1. **Validate Environment**
   - Run `test -d $path` to confirm scan path exists; abort if exit code != 0
   - Run `test -r $path` to confirm read permissions; abort if exit code != 0
   - Create output directory structure with `mkdir -p`
   - Check: `test -d $path && test -r $path` — abort with "Path not found or not readable: $path"

2. **Detect Frameworks**
   - Count React/JSX files (*.jsx, *.tsx)
   - Count Vue files (*.vue)
   - Count HTML files (*.html)
   - Count CSS files (*.css, *.scss, *.sass)
   - Check: file count > 0 for at least one of (.jsx, .tsx, .vue, .html, .css) — abort with "No UI files found in $path"

3. **Scan Button Patterns**
   - Detect button elements (<button, <Button, className="btn")
   - Count total button instances across all files
   - Extract unique button class names and patterns
   - Calculate redundancy factor (instances / unique patterns)
   - Check: button_count is integer >= 0 — log "Found {N} button patterns across {M} files"

4. **Scan Color Usage**
   - Extract hex colors (#RGB, #RRGGBB)
   - Extract rgb/rgba colors
   - Count unique color values
   - Count total color usage instances
   - Identify top 10 most-used colors
   - Calculate redundancy factor
   - Check: unique_colors array length > 0 OR log "No colors found — verify CSS/SCSS files exist in scan path"

5. **Scan Spacing Patterns**
   - Extract padding values (padding: Npx)
   - Extract margin values (margin: Npx)
   - Count unique spacing values
   - Identify most common patterns
   - Check: spacing_values array populated — log "{N} unique spacing values found"

6. **Scan Typography**
   - Extract font-family declarations
   - Extract font-size values
   - Extract font-weight values
   - Count unique typography patterns
   - Check: font_families count >= 1 AND font_sizes count >= 1 — log "{N} font families, {M} font sizes cataloged"

7. **Scan Form Patterns**
   - Count input elements
   - Extract unique input class patterns
   - Count form elements
   - Extract unique form patterns
   - Check: input_instances and form_instances are integers >= 0 — log "{N} input elements, {M} form elements found"

8. **Generate Inventory Report**
   - Create pattern-inventory.json with all metrics
   - Include scan metadata (timestamp, path, file counts)
   - Calculate redundancy factors for each pattern type
   - Check: `python -m json.tool pattern-inventory.json` returns exit code 0 — abort with "Invalid JSON in pattern-inventory.json"

9. **Create State File**
   - Generate .state.yaml for Merovingian handoff
   - Record all pattern counts and metrics
   - Log agent history
   - Set phase to "audit_complete"
   - Write inventory summary to .state.yaml:
     ```yaml
     last_command: audit
     audit_complete: true
     inventory_file: pattern-inventory.json
     scan_path: {path}
     timestamp: {ISO-8601}
     summary:
       total_files: {count}
       patterns_found: {count}
       redundancy_score: {score}
     ```
   - Check: `test -f .state.yaml` AND YAML parses without error — abort with "State file missing or invalid YAML"

## Output

- **pattern-inventory.json**: Structured data with all pattern counts, redundancy factors, and usage statistics
- **.state.yaml**: Brad's state file for handoff to Merovingian or next command
- **Console summary**: Key metrics displayed for immediate review

### Output Format

```json
{
  "scan_metadata": {
    "timestamp": "2025-10-27T12:00:00Z",
    "scan_path": "./src",
    "total_files": 487,
    "frameworks_detected": {
      "react": true,
      "vue": false,
      "html": false
    }
  },
  "patterns": {
    "buttons": {
      "unique_patterns": 47,
      "total_instances": 327,
      "redundancy_factor": 6.96
    },
    "colors": {
      "unique_hex": 82,
      "unique_rgb": 7,
      "total_unique": 89,
      "total_instances": 1247,
      "redundancy_factor": 14.01
    },
    "spacing": {
      "unique_padding": 19,
      "unique_margin": 15
    },
    "typography": {
      "unique_font_families": 4,
      "unique_font_sizes": 15,
      "unique_font_weights": 6
    },
    "forms": {
      "input_instances": 189,
      "unique_input_patterns": 23,
      "form_instances": 45,
      "unique_form_patterns": 12
    }
  }
}
```

## Anti-Patterns

- **"Grep and pray"** — Running generic grep without framework-specific patterns. A React codebase needs JSX-aware scanning (`className=`, `styled.`), not just CSS selectors. Always detect framework FIRST
- **"Color counting without context"** — Counting `#fff` and `#FFF` as different colors. Normalize all colors to lowercase hex before counting. Also convert `rgb(255,255,255)` to hex for deduplication
- **"Ignoring dynamic patterns"** — Only scanning static CSS while missing Tailwind classes (`bg-blue-500`), CSS-in-JS (`styled.div`), or theme variables. Scan ALL style sources, not just .css files
- **"Partial scan, full conclusions"** — Scanning only `/components` but making claims about the entire codebase. Always state scan scope clearly and don't extrapolate beyond scanned files
- **"Redundancy without severity"** — Reporting "47 unique colors" without indicating which are close duplicates (e.g., #333 vs #343434). Use HSL clustering to group near-duplicates and show actual waste

## Failure Handling

- **Scan timeout (>5 min for <100k LOC):** Reduce scan scope — split into subdirectories and audit individually
- **Zero patterns detected:** Verify scan path contains UI code. Try alternate file extensions. If truly zero, document as "clean codebase"
- **Permission errors >10%:** Run with elevated permissions or exclude restricted directories. Document excluded paths
- **Invalid JSON output:** Re-run scan step that failed. If persistent, generate partial report with available data

## Success Criteria

- [ ] Scan completes in <2 minutes for 100k LOC
- [ ] All pattern types detected (buttons, colors, spacing, typography, forms)
- [ ] Redundancy factors calculated for measurable patterns
- [ ] Valid JSON output generated with complete data
- [ ] State file created for next command (consolidate/tokenize)
- [ ] No scan errors or missing permissions

## Error Handling

- **Scan path does not exist**: Exit with clear error message, suggest valid paths
- **No UI files found**: Warn user, check if path is correct or files exist
- **Permission denied**: Explain which directory needs read access
- **Partial scan failure**: Log which files failed, continue with remaining files, report incomplete data

## Security Considerations

- Read-only access to codebase (no writes during scan)
- No code execution during pattern detection
- Validate file paths to prevent directory traversal
- Handle malformed files gracefully (invalid CSS/JSX)
- Skip binary files and large non-text files

## Examples

### Example 1: React Codebase Scan

```bash
*audit ./src
```

Output:
```
🔍 Brad: Scanning ./src for UI chaos...

📊 Files found:
  - React/JSX: 234
  - CSS/SCSS: 89
  - TOTAL: 323

🔍 Scanning BUTTONS...
📊 BUTTONS:
  - Total instances: 327
  - Unique patterns: 47
  - Redundancy factor: 7.0x

🎨 Scanning COLORS...
📊 COLORS:
  - Unique hex values: 82
  - Total usage instances: 1247
  - Redundancy factor: 15.2x

✅ Inventory saved: outputs/design-system/my-app/audit/pattern-inventory.json
✅ State saved: outputs/design-system/my-app/.state.yaml
```

### Example 2: Vue Codebase Scan

```bash
*audit ./components
```

Output shows Vue-specific patterns (v-btn, el-button, etc.)

## Notes

- Redundancy factor >3x indicates significant technical debt
- Colors >50 unique values = major consolidation opportunity
- Buttons >20 variations = serious pattern explosion
- Run this audit periodically to prevent pattern regression
- Brad recommends: If redundancy factors are high, run *consolidate next
- For cost analysis of this waste, run *calculate-roi after audit
- v4.0: Also scan for animation/transition values as motion token candidates
- v4.0: Check machine-readability score (Storybook, structured tokens, docs) per agentic-ds-principles.md
- v4.0: Use *motion-audit for deep animation analysis, *agentic-audit for full agentic readiness
## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

