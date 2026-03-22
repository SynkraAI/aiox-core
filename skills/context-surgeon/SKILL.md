# Context Surgeon v1.1.0

Diagnose, cut, and optimize context loading efficiency.
Agnostic — works on any Claude Code project.

**Commands**: `scan` (default) | `cut` | `rewire`

## Activation

1. Identify command: `scan` (default) | `cut` | `rewire`
2. Execute the corresponding workflow
3. No arguments → run `scan`

## Five Laws of Context Engineering

1. **Wrong > Missing** — Incorrect context causes wrong decisions. Delete without mercy.
2. **Every Line Burns** — Auto-loaded content costs tokens EVERY turn. Target: ≤400 lines. Hard limit: 500.
3. **Code > Instruction** — Enforce with scripts/hooks, not prose. Zero-token enforcement.
4. **Pointer > Inline** — 1-line reference beats N-line duplication. Always.
5. **Decay Is Default** — Context rots. Unvalidated in 10 sessions = suspect.

## Commands

| Command | What | Cost |
|---------|------|------|
| `scan` | Measure + detect + health score | ~500 tokens |
| `cut` | Diagnose + surgical removal | ~1K tokens |
| `rewire` | Deep restructure (rare) | ~3K tokens |

## Scan Workflow

### Step 1: Measure (deterministic)

Run the measurement script located in `scripts/measure.sh` relative to this SKILL.md file:

```bash
bash "{SKILL_DIR}/scripts/measure.sh" "{project_root}"
```

### Step 2: Detect Dead References (deterministic)

```bash
bash "{SKILL_DIR}/scripts/dead-refs.sh" "{project_root}"
```

Where `{SKILL_DIR}` = the directory containing this SKILL.md file, and `{project_root}` = the project root (e.g., `git rev-parse --show-toplevel`).

### Step 3: Semantic Scan (LLM)

With script outputs, scan auto-loaded files for:
- `[PLANNED]` items that shouldn't be in auto-load → count as PLANNED penalty
- Duplicate instructions across files → count as DUPLICATE penalty
- Stale information (old dates, wrong status, outdated scores) → count as STALE penalty
- Content blocks >20 lines that should be a pointer → count as BLOAT penalty

### Step 4: Health Score

```
Score = 100 - Σ penalties

Penalties:
  total_lines > 400             → -1 per 10 lines over
  dead_reference                → -5 each
  duplicate_instruction         → -3 each
  stale_section                 → -5 each
  [PLANNED] in auto-load        → -2 each
  single_file > 150 lines       → -3 per file
  no .claudeignore              → -10
  MEMORY.md > 120 lines         → -1 per 10 over
```

Thresholds: **≥80** HEALTHY | **60-79** NEEDS_CARE | **<60** CRITICAL

### Step 5: Report

```
## Context Health: {score}/100 [{status}]

| File | Lines | ~Tokens | Issues |
|------|-------|---------|--------|
| {path} | {n} | {n×8} | {issues or "clean"} |

**Footprint**: {lines} lines, ~{tokens} tokens/turn
**Dead refs**: {n}
**Recommendation**: {action or "No action needed"}
```

## Cut Workflow

1. Run `scan` first (mandatory — never cut blind)
2. Read `references/cut-protocol.md` for categories and procedures
3. Present each finding with file, line, evidence, and proposed action
4. Execute ONLY with user approval — never auto-delete
5. After cuts: re-run `scan` to verify improvement

## Rewire Workflow

1. Run `scan`
2. Read `references/rewire-protocol.md`
3. Map full loading architecture (what → when → why → cost)
4. Propose restructured architecture following the Five Laws
5. Execute with user approval, verify with post-scan

## Auto-Load Discovery

Claude Code loads these files every turn:
- `$PROJECT/CLAUDE.md`
- `$PROJECT/.claude/CLAUDE.md`
- `$PROJECT/.claude/rules/*.md`
- `~/.claude/CLAUDE.md` (global)
- `~/.claude/projects/$HASH/memory/MEMORY.md`

`$HASH` = project path with separators replaced by dashes (e.g., `D:\foo` → `D--foo`)

Note: Token estimation uses ~8 tokens/line heuristic (~30% margin). Actual varies by content density.

## Example Output

```
## Context Health: 82/100 [HEALTHY]

| File | Lines | ~Tokens | Issues |
|------|-------|---------|--------|
| CLAUDE.md | 105 | 840 | clean |
| .claude/CLAUDE.md | 42 | 336 | clean |
| .claude/rules/anti-loop.md | 12 | 96 | clean |
| .claude/rules/dept-marketing.md | 68 | 544 | 3 [PLANNED] items |
| .claude/rules/enforcement.md | 34 | 272 | clean |
| MEMORY.md | 132 | 1056 | 12 lines over 120 limit |

**Footprint**: 393 lines, ~3144 tokens/turn
**Dead refs**: 1 (`reference/taxonomy.md` in CLAUDE.md:48)
**Recommendation**: Remove [PLANNED] routing entries, trim MEMORY.md historical data
```

## Scripts

Located in `scripts/` relative to this file.

| Script | Purpose | Output |
|--------|---------|--------|
| `discover.sh` | Find all auto-loaded files for a project | TSV (label, path) |
| `measure.sh` | Count lines + tokens for all auto-loaded files | YAML |
| `dead-refs.sh` | Find broken backtick-quoted file references | YAML |

All are **read-only**. They never modify files.

**Limitation**: `dead-refs.sh` only detects paths in backtick quotes (`` `file.md` ``). Bare paths or paths in other formats are not detected.
