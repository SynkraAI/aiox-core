# Chaos Catalog — Failure Pattern Library

Generic failure patterns that apply to ANY skill. Used by `engine/scenario-engine.md`
when generating Tier 4-5 scenarios.

Each pattern describes: what breaks, how to trigger it, what SHOULD happen (graceful),
and what USUALLY happens (crash). Sorted by frequency of occurrence.

---

## Category 1: Missing Dependencies

### C1-001: Missing package.json / pyproject.toml
- **Trigger:** Delete the project manifest file before invoking the skill
- **Expected (graceful):** Skill detects missing manifest, warns user, suggests fix
- **Common failure:** Unhandled error reading undefined, crash
- **Severity:** HIGH — almost every skill reads project config

### C1-002: Missing .git directory
- **Trigger:** Remove .git/ from the fixture, or never init git
- **Expected:** Skill works without git, or warns "not a git repo"
- **Common failure:** git commands fail silently, state becomes inconsistent
- **Severity:** MEDIUM — many skills assume git exists

### C1-003: Missing engine/reference files
- **Trigger:** Delete a referenced engine module (e.g., engine/guide.md)
- **Expected:** Skill reports missing module, suggests reinstall
- **Common failure:** Read tool returns error, skill hangs or outputs garbage
- **Severity:** HIGH — skills that lazy-load modules are vulnerable

### C1-004: Missing agent definitions
- **Trigger:** Rename or delete an agent .md file that the skill depends on
- **Expected:** Skill falls back to direct execution or warns
- **Common failure:** Agent resolution fails, skill can't proceed
- **Severity:** MEDIUM — only affects skills that delegate to agents

---

## Category 2: Corrupt State

### C2-001: Malformed YAML state file
- **Trigger:** Write invalid YAML to a state file the skill reads (e.g., quest-log.yaml)
- **Expected:** Skill detects corruption, offers to reset or recover
- **Common failure:** YAML parse error, unhandled exception, lost progress
- **Severity:** CRITICAL — state corruption can lose user work

### C2-002: Malformed JSON state file
- **Trigger:** Write invalid JSON to a state file (e.g., state.json, forge-runs/)
- **Expected:** Skill detects corruption, offers to reset
- **Common failure:** JSON.parse throws, skill crashes
- **Severity:** CRITICAL

### C2-003: Conflicting state
- **Trigger:** State file says phase 3, but phase 1 artifacts don't exist
- **Expected:** Skill detects inconsistency, offers to re-sync or reset
- **Common failure:** Skill assumes phase 1 is done, produces incomplete output
- **Severity:** HIGH

### C2-004: State from different skill version
- **Trigger:** Create state with old schema (missing fields, deprecated keys)
- **Expected:** Skill migrates state or warns about version mismatch
- **Common failure:** undefined access, partial execution
- **Severity:** MEDIUM

---

## Category 3: Context & Scale

### C3-001: Project with 500+ files
- **Trigger:** Create 500+ dummy files in the fixture
- **Expected:** Skill handles large projects without context overflow
- **Common failure:** Glob returns too many results, context window exhausted
- **Severity:** HIGH — real projects can be large

### C3-002: Very long README or SKILL.md
- **Trigger:** Pad README with 10,000+ words of content
- **Expected:** Skill reads selectively, doesn't load entire file
- **Common failure:** Context budget blown on one file, no room for execution
- **Severity:** MEDIUM

### C3-003: Deeply nested directory structure
- **Trigger:** Create 10+ levels of nested directories
- **Expected:** Skill navigates or limits depth
- **Common failure:** Recursive glob takes too long, path strings overflow
- **Severity:** LOW

### C3-004: Binary files in project
- **Trigger:** Add large binary files (images, compiled code) to fixture
- **Expected:** Skill ignores binary files
- **Common failure:** Attempt to read binary as text, garbled output
- **Severity:** LOW

---

## Category 4: Runtime Differences

### C4-001: Agent tool unavailable (Codex)
- **Trigger:** Run skill in Codex where Agent tool doesn't exist
- **Expected:** Skill has fallback for non-Agent environments
- **Common failure:** Skill calls Agent tool, Codex ignores or hallucinates
- **Severity:** HIGH — major cross-runtime gap

### C4-002: Slash command unavailable (Codex)
- **Trigger:** Invoke skill via prompt instead of /slash-command
- **Expected:** Skill instructions are self-contained enough to work as prompt
- **Common failure:** Skill relies on Skill tool routing, doesn't work as raw prompt
- **Severity:** HIGH

### C4-003: Tool permission denied
- **Trigger:** Deny a tool call the skill needs (Write, Bash, etc.)
- **Expected:** Skill handles denial gracefully, suggests what permission is needed
- **Common failure:** Silent failure, skill continues without the denied operation
- **Severity:** MEDIUM

### C4-004: MCP server unavailable
- **Trigger:** Run skill when a required MCP server is not configured
- **Expected:** Skill detects missing MCP, suggests configuration
- **Common failure:** Tool call fails, skill crashes or produces empty output
- **Severity:** MEDIUM — only affects MCP-dependent skills

---

## Category 5: Concurrency & Timing

### C5-001: Interrupted execution (kill mid-run)
- **Trigger:** Cancel/interrupt the skill mid-execution (Ctrl+C or context reset)
- **Expected:** State files are consistent, skill can resume
- **Common failure:** Partial state written, next resume fails
- **Severity:** HIGH — users frequently interrupt and resume

### C5-002: Run skill twice in a row
- **Trigger:** Invoke the skill, let it complete, invoke again immediately
- **Expected:** Skill detects previous run, asks to resume or start fresh
- **Common failure:** Overwrites previous state, duplicates artifacts
- **Severity:** MEDIUM

### C5-003: Concurrent modification
- **Trigger:** While skill runs in Terminal 2, manually edit a file it's reading
- **Expected:** Skill reads latest version or detects conflict
- **Common failure:** Stale data, inconsistent output
- **Severity:** LOW — rare in practice but devastating when it happens

---

## Category 6: Input Validation

### C6-001: Empty string input
- **Trigger:** Invoke skill with empty argument: `/skill-name ""`
- **Expected:** Skill asks for input or uses default
- **Common failure:** Empty string propagates, causes downstream errors
- **Severity:** MEDIUM

### C6-002: Unicode / special characters
- **Trigger:** Invoke skill with unicode: `/skill-name "app com ações e funções"`
- **Expected:** Skill handles unicode correctly in file names and content
- **Common failure:** Encoding errors, garbled file names
- **Severity:** MEDIUM

### C6-003: Very long input
- **Trigger:** Invoke skill with 1000+ character argument
- **Expected:** Skill truncates or handles gracefully
- **Common failure:** Argument used as filename, OS path limit exceeded
- **Severity:** LOW

### C6-004: Injection in input
- **Trigger:** Invoke skill with shell metacharacters: `/skill-name "$(rm -rf /)"`
- **Expected:** Skill treats input as literal string, no execution
- **Common failure:** If input is interpolated into bash commands, disaster
- **Severity:** CRITICAL — security issue

---

## Category 7: Filesystem Permissions

### C7-001: Read-only source directory
- **Trigger:** `chmod -R 444 src/` before running skill
- **Expected:** Skill reports permission error, suggests fix
- **Common failure:** Write tool fails, skill crashes
- **Severity:** MEDIUM

### C7-002: No write permission to .aios/
- **Trigger:** `chmod 444 .aios/` before running skill
- **Expected:** Skill reports can't write state, continues without persistence
- **Common failure:** State write fails silently, progress lost
- **Severity:** MEDIUM

---

## Scenario Generation Rules

When generating Tier 4-5 scenarios from this catalog:

1. **Pick patterns relevant to the skill profile** — if skill doesn't use agents, skip C4-001
2. **Combine patterns** — e.g., C2-001 + C5-001 = "corrupt state after interrupted run"
3. **Escalate severity** — start with MEDIUM, end with CRITICAL
4. **Max 2 chaos patterns per scenario** — more than that is unrealistic
5. **Always include C1-001 and C2-001** — these are the most common real-world failures
6. **Include C4-001 and C4-002 for Codex runs** — these are the #1 cross-runtime gap
