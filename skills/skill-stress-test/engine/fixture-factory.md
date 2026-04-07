# Fixture Factory — Test Project Generator

Creates minimal but realistic test projects for stress testing skills.

## Input

- `skill_profile`: parsed from `skill-profile.yaml` (output of recon)
- `fixture_type`: user choice or auto-detected from profile
- `fixture_path`: where to create (default: `/tmp/stress-test-{skill}-{timestamp}/`)

## Output

- Complete fixture directory at `fixture_path`
- `.stress-test/` communication directory initialized
- `session.yaml` created with initial state

## Algorithm

### Step 1: Determine Fixture Type

If user chose "criar fixture", auto-detect best archetype from skill profile:

| Skill expects | Fixture archetype |
|---------------|------------------|
| `package.json` or Node.js references | `node-minimal` |
| `pyproject.toml` or Python references | `python-minimal` |
| Git history, existing tests, brownfield workflow | `brownfield` |
| No specific project type detected | `node-minimal` (safest default) |

For Tier 4-5 chaos scenarios, the scenario-engine will request specific chaos fixtures:
- `chaos-empty` — tests empty directory handling
- `chaos-mismatch` — tests wrong project type handling
- `chaos-corrupt-state` — tests corrupt state recovery

### Step 2: Create Fixture Directory

```bash
# Generate unique path
FIXTURE_PATH="/tmp/stress-test-{skill_name}-$(date +%s)"
mkdir -p "$FIXTURE_PATH"
```

### Step 3: Populate Fixture Files

Load `references/fixture-templates.md` and create files based on archetype.

For each file in the template:
1. Create parent directories if needed
2. Write file contents exactly as specified in template
3. For `brownfield`: also initialize git and create commit history

```bash
# Example for brownfield
cd "$FIXTURE_PATH"
git init
git config user.email "stress-test@fixture.local"
git config user.name "Stress Test"
# Create files and commits as specified in fixture-templates.md
```

### Step 4: Create Communication Directory

```bash
mkdir -p "$FIXTURE_PATH/.stress-test"
```

### Step 5: Initialize Session State

Write `$FIXTURE_PATH/.stress-test/session.yaml`:

```yaml
# Stress test session — auto-generated
target_skill: {skill_name}
fixture_path: {fixture_path}
fixture_type: {archetype}
depth: {quick|full}
started_at: "{ISO timestamp}"
status: in_progress

current_scenario: null
current_tier: 1
scenarios_generated: 0

results: {}

totals:
  claude_code:
    pass: 0
    warn: 0
    fail: 0
    critical: 0
    skipped: 0
  codex:
    pass: 0
    warn: 0
    fail: 0
    critical: 0
    skipped: 0
```

### Step 6: Initialize next-step.md

Write `$FIXTURE_PATH/.stress-test/next-step.md`:

```yaml
---
current_state: READY
next_agent: stress-test
scenario: S-001
expected_artifact: scenario-001.md
---

## Proxima Acao
Stress test pronto. Gerando primeiro cenario...
```

### Step 7: Copy Skill Profile

Copy `skill-profile.yaml` into `.stress-test/` for reference by scenario engine.

### Step 8: Show Fixture Summary

```
=== FIXTURE CRIADO ===
Path: {fixture_path}
Tipo: {archetype}
Arquivos: {file count}
Comunicacao: {fixture_path}/.stress-test/

Proximo passo: gerando cenarios...
```

## Chaos Fixture Variants

For Tier 4-5 scenarios, the scenario-engine may need to MODIFY the fixture mid-test.
The factory provides helper instructions for common mutations:

### Mutation: Remove Dependency
```bash
rm "$FIXTURE_PATH/package.json"
# or
rm "$FIXTURE_PATH/pyproject.toml"
```

### Mutation: Corrupt State
```bash
echo "{ broken json" > "$FIXTURE_PATH/.aios/state.json"
```

### Mutation: Remove Git
```bash
rm -rf "$FIXTURE_PATH/.git"
```

### Mutation: Add Massive Files
```bash
# Create 500 dummy files to test context overflow
for i in $(seq 1 500); do
  echo "// File $i" > "$FIXTURE_PATH/src/file-$i.js"
done
```

### Mutation: Read-Only
```bash
chmod -R 444 "$FIXTURE_PATH/src/"
```

These mutations are described in `scenario-{N}.md` setup instructions,
executed by the Terminal 2 agent before running the skill.
