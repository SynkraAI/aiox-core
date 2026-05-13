# delegate-to-external-executor.md

**Task**: Delegate Implementation to External Executor

**Purpose**: Standardize the orchestrator/executor split for AIOX workflows. The active AIOX runtime keeps authority over story interpretation, acceptance criteria validation, constitutional gates, review, and story updates while a separate CLI runtime performs only the implementation attempt.

**When to use**: Use only for `@dev` implementation work where the story scope is clear enough to hand to another runtime. Do not use for PO, QA, SM, DevOps, architecture approval, or release authority.

## Task Definition

```yaml
task: delegateToExternalExecutor()
responsavel: Orchestrating agent
responsavel_type: Agente
atomic_layer: Organism

inputs:
  - campo: prompt
    tipo: string
    obrigatorio: true
    validacao: Must cite acceptance criteria, story path, file scope, and explicit non-goals
  - campo: slug
    tipo: string
    obrigatorio: true
    validacao: Stable filesystem-safe run slug
  - campo: story_id
    tipo: string
    obrigatorio: false
  - campo: story_path
    tipo: string
    obrigatorio: false
  - campo: workdir
    tipo: string
    obrigatorio: false
    default: Current project root
  - campo: provider
    tipo: string
    obrigatorio: false
    default: codex

outputs:
  - campo: run_dir
    tipo: string
    destino: Orchestrator
  - campo: output
    tipo: file
    destino: <run_dir>/output.md
  - campo: log
    tipo: file
    destino: <run_dir>/<provider>.log
  - campo: diff
    tipo: git-diff
    destino: Orchestrator review
```

## Configuration

Delegation is disabled by default.

```yaml
dev:
  execution_mode: native       # native | delegate
  delegate_to: codex
  auto_review: true

external_executors:
  enabled: false
  default_sandbox: workspace-write   # read-only | workspace-write | full-auto | danger-full-access
  run_dir: .aiox/external-runs
```

## Pre-Conditions

```yaml
pre_conditions:
  - [ ] External executor provider is installed and available on PATH.
  - [ ] Working tree is clean, or existing intentional changes are already committed.
  - [ ] Prompt cites the story path and acceptance criteria.
  - [ ] Prompt lists allowed file scope and explicit non-goals.
  - [ ] Delegated work is implementation work owned by @dev.
  - [ ] Orchestrator has enough context to review the resulting diff.
```

## Execution

### 1. Build the Prompt

The orchestrator writes a prompt that contains:

- Story ID and story path
- Acceptance criteria copied or summarized from the story
- Allowed file paths or modules
- Testing expectations
- Constraints from Constitution and project rules
- Explicit instruction that the executor must not update story status, checkboxes, File List, PRs, or releases

### 2. Start the Delegate Run

Use the wrapper:

```bash
aiox-delegate codex -t <slug> -f <prompt_file> -d <workdir>
```

The wrapper prints:

```text
STATUS=started
RUN_DIR=.aiox/external-runs/<timestamp>-<slug>
PID=<pid>
LOG=<run_dir>/codex.log
OUTPUT=<run_dir>/output.md
PROMPT=<run_dir>/prompt.md
COMMAND=<provider command>
```

### 3. Monitor Completion

The orchestrator may tail the log or wait for the PID. Do not mark story progress while the external executor is still running.

### 4. Review Output and Diff

The orchestrator must read:

- `<run_dir>/output.md`
- `<run_dir>/<provider>.log`
- `git diff`

Then validate:

```yaml
review_checklist:
  - [ ] Every acceptance criterion is satisfied.
  - [ ] Diff scope matches the story and prompt.
  - [ ] Article IV No Invention: every change traces to a requirement.
  - [ ] Tests were added or updated when behavior changed.
  - [ ] Lint, typecheck, and relevant tests pass.
  - [ ] No story state was mutated before review approval.
```

### 5. Accept or Iterate

- **Approved**: orchestrator updates story checkboxes, File List, status, and final validation evidence.
- **Rejected**: orchestrator writes specific feedback and may start a new run with a new slug or iteration suffix.

## Anti-Patterns

- Marking a story done by trusting the executor summary without reading the diff.
- Delegating PO/QA/SM/DevOps authority to an external runtime.
- Letting the executor create PRs, push, release, or mutate story state.
- Delegating vague work without acceptance criteria and file scope.
- Running with `danger-full-access` unless the surrounding environment is externally sandboxed.
