# Fast Path Gate

## Purpose

Choose the fastest safe execution path before starting a task. This gate prevents slow one-by-one conversational edits for mechanical work such as YAML population, bulk replacements, structured data normalization, and repeated per-file updates.

## Elicitation

Both checkpoints below must be answered before proceeding to mode selection or invoking external delegation.

### Before mode selection

- Clarify any ambiguous `description` details, including the exact repeated operation and expected output shape.
- Validate the intended `files` list and `itemCount`; record whether targets are independent and complete.
- Confirm `acceptanceCriteria`, including syntax checks, diff review, and targeted validation commands.
- Confirm whether the task includes security, production, destructive, migration, architectural, or credential risk.

### Before external delegation

- Explicitly request user permission to use `externalExecutorsEnabled`.
- Confirm the allowed executor, sandbox, writable paths, timeout, retry limit, and failure fallback.
- Confirm that no secrets, production credentials, or protected customer data will be sent to the executor.
- Record any delegation constraints before running `aiox-delegate`.

## Inputs

- `description` — task summary or user request
- `files` — known target files
- `acceptanceCriteria` — expected outcomes
- `itemCount` — optional number of records, fields, or files to process
- `externalExecutorsEnabled` — whether delegation through `aiox-delegate` is allowed

## Execution

1. Run the "Before mode selection" elicitation checkpoint and record scope, intended files, security/production risk, acceptance criteria, and sandbox constraints.
2. Evaluate the task with `evaluateFastPath()` from `.aiox-core/core/orchestration/fast-path-gate.js`.
3. If `evaluateFastPath()` throws, returns invalid output, or returns an unknown mode, set `mode: standard`, record the error and fallback decision in evidence/logs, and continue with the normal story/task workflow.
4. If the gate returns `mode: standard`, continue with the normal story/task workflow.
5. If the gate returns `mode: deterministic_batch`, extract the schema and write one deterministic transform or structured edit plan before changing files.
6. If the gate returns `mode: parallel_batch`, map all independent targets first, then apply grouped edits in parallel batches.
7. If the gate returns `mode: external_executor`, run the "Before external delegation" elicitation checkpoint, create a bounded executor prompt, and run `aiox-delegate` with the configured sandbox, timeout, and retry limit.
8. If `aiox-delegate` times out, exhausts retries, or fails, record the executor error, fall back to `mode: standard`, resume the normal workflow, and surface the failure in targeted validation.
9. Always review the resulting diff and run targeted validation before story or issue closure.

## Acceptance Criteria

- Mechanical repeated tasks are not executed as long sequential conversational edits.
- Security, production, destructive, migration, and architectural tasks fall back to the standard workflow unless explicitly re-scoped.
- Fast-path decisions include confidence, reasons, evidence, and next actions.
- External executor usage remains opt-in and sandboxed by configuration.

## Anti-Patterns

- Do not use fast path for ambiguous architecture or security decisions.
- Do not skip validation because a task is mechanical.
- Do not delegate externally when the task contains secrets or production risk.
- Do not mutate story or issue state until the diff has been reviewed.
