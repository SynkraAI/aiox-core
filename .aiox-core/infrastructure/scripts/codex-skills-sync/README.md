# Codex Skills Sync

Tools for generating local Codex skills (`.codex/skills/aiox-*`) from AIOX agent and squad definitions.

## When To Use Which

There are two complementary entry points:

| Tool | Scope | Use case |
|------|-------|----------|
| `npm run sync:skills:codex` (`index.js`) | **Core agents only** (`.aiox-core/development/agents/*.md`) | CI / incremental sync. Tightly coupled with the shared `agent-parser.js` from `ide-sync/`. Used after editing core agent files to keep `.codex/skills/` in step. |
| `npm run setup:codex-skills` (`bootstrap.js`) | **Core agents + squad entry chiefs** (`squads/*/config.yaml` → entry agent) | First-time / operator bootstrap. Standalone with vendored `js-yaml` fallback. Use after a fresh checkout, after adding a new squad, or when the `$` menu in Codex is missing skills (e.g. squad chiefs not loading). |

If a skill exists in `.codex/skills/` but does not contain the marker `<!-- AIOX-CODEX-LOCAL-SKILLS: generated -->`, `bootstrap.js` skips it by default to preserve hand-edits. Pass `--force` to overwrite (a `.bak-<timestamp>` copy is created first).

## bootstrap.js

```
npm run setup:codex-skills              # generate / update
npm run setup:codex-skills:dry          # preview without writes
node bootstrap.js --force               # overwrite non-generated skills (creates .bak)
node bootstrap.js --help                # full options
```

Discovery rules:

1. **Core agents** — every `*.md` in `.aiox-core/development/agents/` becomes a `aiox-<id>` skill.
2. **Squad chiefs** — every `squads/*/config.yaml` is parsed; the entry agent is resolved via:
   - explicit `entry_agent`, `squad.entry_agent`, `pack.entry_agent`, `orchestrator.agent`, or `tier_system.orchestrator` field
   - first agent with `tier: orchestrator` or id matching `*chief`
   - file matching `*-chief.md` in `squads/<name>/agents/`
   - first agent file as fallback
3. **Skill ID** — `aiox-<entry>` if the entry name is squad-specific (e.g. `mega-brain-chief`); otherwise `aiox-<squad>-<entry>` to avoid collisions.

After running, restart Codex CLI from the project root if the `$` menu does not refresh automatically.

## index.js (canonical incremental sync)

```
npm run sync:skills:codex               # local .codex/skills only
npm run sync:skills:codex:global        # also write to ~/.codex/skills
```

Used by CI and by the unified ide-sync pipeline. Does not generate squad-chief skills — use `bootstrap.js` for that.

## validate.js

```
npm run validate:codex-skills           # validate aiox-* skill / agent parity (strict)
```

Verifies that every core agent has a corresponding `.codex/skills/aiox-<id>/SKILL.md`. Squad-chief skills are out of scope for this validator.

## Files generated

Output directory defaults to `.codex/skills/<skill-id>/SKILL.md`. The generated files include:

- A YAML frontmatter (`name`, `description`)
- The `<!-- AIOX-CODEX-LOCAL-SKILLS: generated -->` marker (used by future runs to detect ownership)
- A pointer to the source-of-truth file (loaded on demand by Codex)
- A short activation protocol and starter command list

The source files in `.aiox-core/development/agents/` and `squads/*/agents/` remain authoritative. Generated skills are activator stubs.

## Story reference

Story 123.9 — Codex local skills bootstrap (squad chief coverage).

Background: students reported that squad-chief skills (e.g. `mega-brain-chief`, `slides-chief`) did not appear in Codex's `$` menu. Root cause: `index.js` only generated skills from `.aiox-core/development/agents/` — squad chiefs in `squads/*/agents/` were not covered. A provisional standalone script was distributed manually; this directory captures the definitive vendored solution.
