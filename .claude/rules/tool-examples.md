# Tool Input Examples — Selection Guidance

## Purpose

Improve tool selection accuracy by providing concrete input examples for the most-used tools. When choosing which tool to use, reference these examples to match the current task to the correct tool.

## ADR-5 Compliance

These examples apply ONLY to always-loaded (Tier 1/2) and essential Tier 3 tools. Non-essential Tier 3 tools are discovered via tool search — do NOT reference examples for them.

## Tool Examples

### context7 — Library Documentation Lookup
Use when you need up-to-date documentation for a library or framework.
- **React docs:** `resolve-library-id("react")` then `get-library-docs` with topic "server components"
- **Supabase RLS:** `resolve-library-id("supabase")` then `get-library-docs` with topic "row level security"
- **Jest mocks:** `resolve-library-id("jest")` then `get-library-docs` with topic "mock functions"

### git — Version Control
Use for repository state, history, and branch management.
- **Check changes:** `git diff --stat` — file-level summary of uncommitted changes
- **Recent history:** `git log --oneline -10` — last 10 commits with conventional messages
- **Branch comparison:** `git diff main...HEAD --stat` — all changes since branching from main

### coderabbit — Automated Code Review
Use before commits and PRs for quality validation. Runs in WSL.
- **Pre-commit:** `wsl bash -c 'cd /mnt/c/.../aios-core && ~/.local/bin/coderabbit --prompt-only -t uncommitted'`
- **Pre-PR:** `wsl bash -c 'cd /mnt/c/.../aios-core && ~/.local/bin/coderabbit --prompt-only --base main'`

### browser — Web Testing
Use for UI validation, console checks, and web interaction.
- **Navigate:** Open `http://localhost:3000` to inspect the running app
- **Console check:** Navigate to a page and check for JavaScript errors/warnings

### supabase — Database Operations
Use for migrations and database management.
- **Apply migrations:** `supabase db push`
- **Check status:** `supabase migration list`

### github-cli — GitHub Operations
Use for PRs, issues, and repository management. `@devops` exclusive for push/PR.
- **Create PR:** `gh pr create --title 'feat: ...' --body '## Summary...'`
- **List issues:** `gh issue list --state open --label bug`
- **PR status:** `gh pr view 123 --json reviews,statusCheckRollup`

### nogic — Code Intelligence (Essential)
Use for code analysis, dependency tracking, and usage patterns.
- **Dependencies:** Analyze import chain for a specific module
- **Usages:** Find all locations where a function is called

### code-graph — Dependency Analysis (Essential)
Use for dependency graphs and circular dependency detection.
- **Dependency tree:** Generate graph for a package with configurable depth
- **Circular check:** Detect circular dependency chains in the project

### docker-gateway — MCP Infrastructure
Use for managing Docker-based MCP servers. `@devops` manages infrastructure.
- **Health check:** `curl http://localhost:8080/health`
- **List servers:** `docker mcp server ls`

## Reference

Full examples registry: `.aios-core/data/mcp-tool-examples.yaml`
Tool registry: `.aios-core/data/tool-registry.yaml`
