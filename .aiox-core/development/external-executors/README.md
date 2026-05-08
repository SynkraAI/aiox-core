# External Executors

External executors let one AIOX runtime keep orchestration authority while another CLI runtime performs the implementation work in an isolated run directory.

This pattern is opt-in. The default development mode remains `native`, where the active AIOX agent plans, implements, validates, and updates story state in the same runtime.

## Contract

- The orchestrator owns story selection, acceptance criteria, scope, review, and story state updates.
- The external executor owns only the delegated implementation attempt.
- Run artifacts live under `.aiox/external-runs/<timestamp>-<slug>/`.
- The orchestrator must read the executor output and inspect the diff before updating checkboxes, File List, or story status.

## Providers

- `codex.md`: reference provider for Codex CLI headless execution.

Future provider files can document `aider`, `cline`, `cursor-cli`, `gemini-cli`, or any other runtime that supports non-interactive execution.

