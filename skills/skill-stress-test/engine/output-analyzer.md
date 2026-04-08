# Output Analyzer — Result Evaluation Engine

Reads `result-{N}.md` written by Terminal 2, evaluates against scenario criteria,
and produces `analysis-{N}.md` with verdict, root cause, and fix suggestions.

## Input

> **Convention:** `{N}` in all file names means a zero-padded 3-digit number: `001`, `002`, etc.

- `result-{N}.md` from `.stress-test/` (written by Terminal 2)
- `scenario-{N}.md` from `.stress-test/` (reference for expected behavior)
- `skill-profile.yaml` for context about the target skill

## Output

- `analysis-{N}.md` written to `.stress-test/`
- `session.yaml` updated with result totals
- Verdict displayed to user

---

## Analysis Algorithm

### Step 1: Read & Parse Result

Read `result-{N}.md` and parse YAML frontmatter:

```yaml
scenario_id: S-{N}
runtime: {claude-code|codex}
executed_at: "{timestamp}"
status: {completed|crashed|hung|partial|incompatible}
```

If `result-{N}.md` doesn't exist:
- Display: "result-{N}.md não encontrado. Terminal 2 já executou?"
- ABORT analysis for this scenario

If frontmatter is missing or malformed:
- Treat the entire file as unstructured output
- Set runtime = "unknown", status = "unknown"
- Continue with fuzzy analysis

### Step 2: Quick Status Check

Based on `status` field:

| Status | Immediate Action |
|--------|-----------------|
| `completed` | Proceed to detailed analysis |
| `crashed` | Likely FAIL or CRITICAL — analyze error output |
| `hung` | FAIL — skill didn't terminate |
| `partial` | WARN or FAIL — skill stopped mid-execution |
| `incompatible` | SKIP — structural gap documented, no code fix possible |

### Step 3: Output Pattern Analysis

Scan the "Output" section for known failure patterns:

#### Red Flags (indicate FAIL or CRITICAL)

| Pattern | Meaning | Verdict |
|---------|---------|---------|
| `Error:`, `TypeError:`, `ReferenceError:` | Unhandled JavaScript error | FAIL |
| `Traceback (most recent call last)` | Unhandled Python error | FAIL |
| `ENOENT`, `EACCES`, `EPERM` | File system error not caught | FAIL |
| `Cannot read properties of undefined` | Null reference | FAIL |
| `YAML parse error`, `JSON parse error` | State corruption not handled | FAIL |
| `command not found` | Missing dependency | FAIL |
| `Permission denied` | Unhandled permission error | FAIL |
| `context window`, `token limit`, `too long` | Context overflow | FAIL |
| `Maximum call stack size exceeded` | Infinite recursion | CRITICAL |
| `SIGKILL`, `SIGTERM`, `killed` | Process killed | CRITICAL |
| `rm -rf`, `delete`, shell injection indicators | Security issue | CRITICAL |

#### Yellow Flags (indicate WARN)

| Pattern | Meaning | Verdict |
|---------|---------|---------|
| `{placeholder}`, `{{`, `TODO:` | Unresolved template variables | WARN |
| `undefined`, `null` in output text | Data leak | WARN |
| `[object Object]` | Serialization failure | WARN |
| Raw JSON/YAML blobs in prose text | Format leak | WARN |
| Repeated content / duplicate sections | Generation loop | WARN |
| Missing expected sections (no banner, no summary) | Incomplete output | WARN |

#### Green Signals (indicate PASS)

| Pattern | Meaning |
|---------|---------|
| Structured output with headers | Skill formatted output correctly |
| Clear completion message | Skill ran to end |
| State files valid (reported by Terminal 2) | State management works |
| No error patterns detected | Clean execution |

### Step 4: Criteria Evaluation

Read the scenario's "Critérios de PASS" and "O que observar" sections.
For each observation point:

1. Search the result output for evidence of the expected behavior
2. Mark as: confirmed / not found / contradicted
3. If all confirmed → PASS
4. If some not found → WARN (partial success)
5. If any contradicted → FAIL

### Step 5: Runtime-Specific Analysis

Adjust expectations based on runtime:

#### Claude Code specific checks
- Did the skill use tool calls correctly? (look for tool results in output)
- Did it respect tool permissions? (look for "permission denied" from user)
- Did discovery questions use AskUserQuestion? (proper format)

#### Codex specific checks
- Did the skill instructions work as a raw prompt? (no Skill tool dependency)
- Did Codex follow the multi-step instructions? (or skip/hallucinate)
- Were Agent tool calls attempted? (these will fail in Codex)
- Did Codex write files correctly? (Codex sometimes describes instead of writes)

### Step 6: Root Cause Analysis (for FAIL/CRITICAL)

When verdict is FAIL or CRITICAL:

1. **Identify the failing module:** Which engine module or section of SKILL.md caused the issue?
   - Match error patterns to specific code paths
   - Check if the error mentions a file path (that's likely the source)

2. **Classify the root cause:**
   - `missing-guard` — no existence check before file read
   - `no-error-handling` — try/catch missing
   - `state-corruption` — invalid state not detected
   - `runtime-dependency` — feature only works in one runtime
   - `hardcoded-assumption` — assumes specific project structure
   - `context-overflow` — too much loaded into context
   - `logic-error` — algorithm produces wrong result
   - `security-flaw` — input not sanitized

3. **Suggest fix:** Be specific — name the file, describe the change
   ```
   Fix: Add file existence check in skills/{skill}/engine/recon.md Step 2
   Before reading package.json, check with Glob("package.json").
   If not found, skip project analysis and warn user.
   ```

4. **Suggest contingency:** What can the user do RIGHT NOW to work around the issue
   ```
   Contingência: Garanta que package.json existe antes de rodar a skill.
   Ou crie um package.json mínimo com: echo '{"name":"fix"}' > package.json
   ```

### Step 7: Write analysis-{N}.md

```yaml
---
scenario_id: S-{N}
runtime: {runtime}
verdict: {PASS|WARN|FAIL|CRITICAL|SKIP}
analyzed_at: "{ISO timestamp}"
red_flags: {count}
yellow_flags: {count}
criteria_met: {X}/{Y}
---

## Veredito: {verdict} {emoji}

{1-2 sentence summary of what happened}

## Observações
{numbered list matching scenario's "O que observar"}
1. {observation}: {confirmed|not found|contradicted}
2. ...

## Padrões Detectados
{list of red/yellow flags found, if any}

## Root Cause (only if FAIL/CRITICAL)
**Módulo:** {file path}
**Tipo:** {root cause classification}
**Descrição:** {what went wrong and why}

## Fix Sugerido (only if FAIL/CRITICAL)
{specific change with file path and description}

## Contingência (only if FAIL/CRITICAL)
{workaround the user can apply immediately}
```

### Step 8: Update Session

Update `session.yaml`:
- Add result entry under `results.S-{N}.{runtime}`
- Increment appropriate counter in `totals.{runtime}`
- Update `current_scenario` and `current_tier`

### Step 9: Display Verdict

Show concise verdict to user:

```
S-{N} [{runtime}] — {verdict} {emoji}
{one-line reason}
```

Examples:
```
S-001 [claude-code] — PASS — Skill rodou clean, todos os artefatos criados.
S-008 [codex] — WARN — Codex pulou 2 discovery questions, output incompleto.
S-013 [claude-code] — FAIL — Crash ao ler package.json inexistente. Fix: guard em recon.md.
S-019 [codex] — CRITICAL — Input com metacaracteres executou comando shell.
```

---

## Handling Edge Cases in Analysis

### Result file has no YAML frontmatter
- Parse entire content as unstructured output
- Set runtime/status to "unknown"
- Analyze based on text patterns only

### Result file is empty
- Verdict: FAIL
- Root cause: "Terminal 2 não capturou output. Possível crash silencioso."

### Result file describes an error but marks status as "completed"
- Override status based on content analysis
- If red flags found despite "completed": verdict is FAIL, not PASS

### Terminal 2 reports skill "did nothing"
- Check if skill requires specific trigger (slash command vs prompt)
- If Codex: likely the skill instructions weren't followed — WARN with runtime note
- If Claude Code: likely permission denied or missing context — FAIL
