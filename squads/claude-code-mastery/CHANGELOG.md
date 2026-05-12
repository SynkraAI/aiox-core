# Changelog — claude-code-mastery

All notable changes to the Claude Code Mastery squad.

## [1.0.0] - 2026-03-02

### Added
- 8 specialist agents: claude-mastery-chief (Orion), hooks-architect (Latch), mcp-integrator (Piper), swarm-orchestrator (Nexus), config-engineer (Sigil), skill-craftsman (Anvil), project-integrator (Conduit), roadmap-sentinel (Vigil)
- 26 executable tasks across all agents
- 3 multi-phase workflows (wf-project-setup, wf-knowledge-update, wf-audit-complete)
- 5 knowledge base files (quick-ref, project-type-signatures, hook-patterns, ci-cd-patterns, mcp-catalog)
- 7 templates (5 CLAUDE.md project templates + 2 GitHub Actions workflows)
- 8 mind DNA summaries (disler, steipete, kieran-klaassen, reuven-cohen, superclaude-org, bmad-code-org, daniel-miessler, boris-cherny)
- 1 validation script (validate-setup.js)
- Tier architecture: Tier 0 (Diagnosis), Tier 1 (Core Mastery), Tier 2 (Strategic & Context)
- Handoff matrix with full routing between all agents
- AIOX-core integration bridge (agents, tasks, hooks, config mapping)

### Architecture
- Entry agent: claude-mastery-chief (Orion) with 7-domain routing matrix
- Cross-cutting concern: all agents understand AIOX-core architecture
- Knowledge sources: Claude Code changelog, official docs, community resources
