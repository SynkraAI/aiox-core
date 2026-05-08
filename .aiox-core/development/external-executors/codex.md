# Codex External Executor Adapter

## Provider ID

`codex`

## Invocation

The `aiox-delegate` wrapper launches Codex in non-interactive exec mode and sends the prompt through stdin:

```bash
codex -a never -s workspace-write exec -C <workdir> -o <run_dir>/output.md -
```

For `--sandbox danger-full-access`, the wrapper uses the explicit Codex bypass flag:

```bash
codex --dangerously-bypass-approvals-and-sandbox exec -C <workdir> -o <run_dir>/output.md -
```

## Sandbox Mapping

| AIOX sandbox | Codex behavior |
| --- | --- |
| `read-only` | `-a never -s read-only` |
| `workspace-write` | `-a never -s workspace-write` |
| `full-auto` | `-a never -s workspace-write` |
| `danger-full-access` | `--dangerously-bypass-approvals-and-sandbox` |

`full-auto` is retained as an AIOX abstraction for background executor runs. On current Codex CLI versions, it maps to `workspace-write` plus `approval=never` rather than bypassing the sandbox.

## Supported Options

- `--model <model>` maps to `codex -m <model>`.
- `--profile <name>` maps to `codex -p <name>`.
- `--image <path>` maps to `codex exec -i <path>`.
- `--workdir <path>` maps to `codex exec -C <path>`.
- `--prompt` and `--prompt-file` are sent via stdin.
- `--output-last-message` is managed by the wrapper through `-o <run_dir>/output.md`.

## Exit Code Semantics

- In background mode, `aiox-delegate` returns after a process is spawned and prints the PID.
- In foreground mode, `aiox-delegate` waits for Codex and returns Codex's exit code.
- Missing Codex binary is a pre-condition failure.
- Dirty git worktrees are blocked unless `--allow-dirty` is explicit.

## Run Artifacts

Each run directory contains:

- `prompt.md`: prompt sent to Codex
- `output.md`: last Codex message, written by Codex
- `codex.log`: stdout/stderr stream
- `command.txt`: exact command line
- `metadata.json`: provider, workdir, sandbox, PID, and artifact paths

