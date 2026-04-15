---
paths: **/*
---

# MCP Usage Rules

## Governance

MCP infrastructure managed EXCLUSIVELY by `@devops`. Other agents are consumers.

## Tool Selection Priority — ALWAYS prefer native tools:

| Task | Use | NOT |
|------|-----|-----|
| Files | `Read`/`Write`/`Edit` | docker-gateway |
| Commands | `Bash` | docker-gateway |
| Search | `Glob`/`Grep` | docker-gateway |

## MCP Servers

**Direct (Claude Code):**
- `playwright` — browser automation, screenshots (only for web interaction)
- `desktop-commander` — Docker container ops via docker-gateway

**Docker (via docker-gateway):**
- `EXA` — web search, research (`web_search_exa`)
- `Context7` — library docs (`resolve-library-id`, `get-library-docs`)
- `Apify` — web scraping, social media data (7 tools: `search-actors`, `call-actor`, etc.)

**Custom:**
- `aios-brain-bridge` — Mind Clone consultation (16 tools)
- `mcp-ads-bridge` — Google/Meta Ads management (52 tools)
- `mcp-image-studio` — Image generation/transformation

**Design Squad AI Tools:**
- `nano-banana-2` — AI image generation via Gemini 3.1 Flash (5 tools: `generate_image`, `edit_image`, `continue_editing`, `get_configuration_status`, `get_last_image_info`). Used by: @design-lead, @ui-designer, @ux-designer, @ux-design-expert, @design-systems-engineer.
- `stitch` — Google Stitch AI UI prototyping, generates interactive HTML/CSS/JS from prompts. Used by: @design-lead, @ui-designer, @ux-designer, @ux-design-expert, @design-systems-engineer.
- `ui-ux-pro-max` — Design intelligence skill (67 styles, 161 palettes, 57 fonts, 99 UX guidelines). CLI: `python3 .claude/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "{query}" --domain {domain}`. Used by: all design squad agents.
- `@21st-dev/magic` — AI UI component generation from natural language (like v0 in your IDE). Tool: `/ui {description}`. Generates polished components matching project code style. Used by: @ui-designer, @ux-design-expert, @design-systems-engineer.

## When to use docker-gateway

ONLY when: user says "use docker/container", task requires Docker ops, or accessing Docker MCPs (EXA, Context7, Apify).

## Docker Secrets Bug

If `docker mcp tools ls` shows "(N prompts)" instead of "(N tools)", edit `~/.docker/mcp/catalogs/docker-mcp.yaml` with hardcoded env values.
