# D5 — Antigravity Architecture Research Report

**Research Target:** D5 — Antigravity Architecture (LOW)
**Story:** NOG-9 — UAP & SYNAPSE Deep Research
**Wave:** 4 — Cross-IDE Compatibility
**Date:** 2026-02-21
**Researcher:** /tech-search automated research agent

---

## Executive Summary

Google Antigravity is a VS Code fork launched November 18, 2025 as an agent-first IDE powered by Gemini 3. Its rules system uses plain Markdown files stored in `.antigravity/rules.md` (project-level) and `~/.gemini/GEMINI.md` (global), with a secondary `.agent/` directory for workflows and skills. AIOS already generates output to `.antigravity/rules/agents/` using a cursor-style format — this is partially correct but does not match Antigravity's primary convention (`rules.md` single file vs. directory of agents). Adoption is early-stage (public preview, free tier, no concrete user count disclosed). Optimization is LOW priority but worth a minor alignment fix.

---

## 1. Architecture: What Is Antigravity?

### 1.1 Origin and Base

Google Antigravity is a **VS Code fork**, launched on **November 18, 2025** alongside Gemini 3. The precise lineage is contested:

- Primary reports describe it as a "heavily modified fork of Visual Studio Code"
- Investigation of its codebase by developers has found references to "Cascade" — Windsurf's proprietary agentic system — suggesting it may be a **fork of Windsurf**, which is itself a fork of VS Code
- Google officially describes it as a VS Code-based IDE; the Windsurf fork theory is community-identified, not officially confirmed

**Key implication for AIOS:** Antigravity is not a standalone tool; it is a GUI IDE (not CLI-first). It is conceptually further from Claude Code than Cursor or Windsurf in terms of workflow philosophy.

### 1.2 Agent-First Architecture

Antigravity introduces a **three-surface architecture**:

| Surface | Purpose |
|---------|---------|
| **Editor** | Synchronous coding (familiar VS Code UX) |
| **Manager (Agent Panel)** | Autonomous agent orchestration — dispatch agents for background tasks |
| **Browser** | Integrated browser agent for automated UI testing and web tasks |

The core philosophy: developers become **task managers**, not coders. You define what to build; the agent plans, executes terminal commands, writes code, and verifies outputs autonomously.

**Plan-Review-Execute loop:**
1. Agent generates a Structured Implementation Plan (Artifact)
2. Developer reviews and comments before any code is touched
3. Agent executes against approved plan

### 1.3 Underlying Models

Antigravity is powered by Google's Gemini family:

- **Primary:** Gemini 3 Pro (up to 1M token context window)
- **Reasoning:** Gemini 3 Deep Think
- **Fast:** Gemini 3 Flash
- **Browser control:** Gemini 2.5 Computer Use
- **Additional (non-Google):** Claude Sonnet 4.5, Claude Opus 4.5, GPT-OSS-120B (community-reported)

---

## 2. Rules System Architecture

### 2.1 Directory Structure (Official)

Antigravity uses **two separate directory trees** for its configuration:

```
# Global (personal preferences across all projects)
~/.gemini/GEMINI.md                              # Global rules
~/.gemini/antigravity/global_workflows/          # Global workflows

# Workspace/Project (project-specific, committed to git)
<workspace-root>/.antigravity/rules.md           # Primary project rules (auto-loaded)
<workspace-root>/.agent/rules/                   # Additional rules (directory form)
<workspace-root>/.agent/workflows/               # Workflow definitions
<workspace-root>/.agent/skills/                  # Skills definitions
```

**Critical observation:** There are actually TWO rule storage patterns in the wild:
1. **Single-file pattern:** `.antigravity/rules.md` — described in most documentation as the primary auto-loaded file
2. **Directory pattern:** `.agent/rules/*.md` or `.agent/rules/*.mdc` — used in more advanced configurations

The `.antigravity/` directory appears to be a **project-config namespace** (holds `rules.md` and `antigravity.json`), while `.agent/` is the **runtime namespace** (holds workflows, skills, and additional rule sets).

### 2.2 File Format

Rules are stored as **plain Markdown (.md) files**. There is NO special syntax for the base rules format — just structured markdown text. This contrasts with Cursor's modern `.mdc` format.

However, community tooling has introduced the `.mdc` extension in the `.agent/rules/` directory (Cursor-style), with Python/Node.js scripts that convert `.mdc` → `.md` for Antigravity consumption. This cross-compatibility layer is community-driven, not official.

**Example `.antigravity/rules.md` structure:**
```markdown
# Project Rules

## Code Standards
- Use Python type hints everywhere
- Google-style docstrings required

## Artifact Protocol
- Always create artifacts/plan_[task_id].md before touching src/
- Save output logs to artifacts/logs/
```

### 2.3 Activation Modes

Rules have **four activation modes** (documented in advanced community guides):

| Mode | Behavior | Trigger |
|------|----------|---------|
| **Always On** | Applied to every prompt automatically | Default for `.antigravity/rules.md` |
| **Glob Pattern** | File-type conditional (e.g., `**/*.test.ts`) | File context match |
| **Model Decision** | Agent determines relevance | Agent reasoning |
| **Manual** | Explicit reference required (e.g., `@security-rule`) | User mention |

### 2.4 Scope Priority Order

```
System Rules (Google DeepMind, immutable)
  ↓ overridden by
Global Rules (~/.gemini/GEMINI.md)
  ↓ overridden by
Workspace Rules (.antigravity/rules.md or .agent/rules/)
  ↓ overridden by
Task Rules (one-off, session-level)
```

### 2.5 Workflows System

Workflows are **separate from rules** — they are triggered on-demand via `/command` prefix in the chat panel. Format uses Markdown with YAML frontmatter:

```markdown
---
description: Brief task description
---

## Steps

### 1. Step Name
- Action instructions
- Expected outcomes
```

Triggered via: `/generate`, `/deploy`, `/review`, etc.

### 2.6 Skills System

Skills are **Progressive Disclosure** packages — dormant until the agent determines the request matches the skill's description. Two scopes:

- **Global:** `~/.gemini/antigravity/skills/` (e.g., "Format JSON")
- **Workspace:** `<workspace-root>/.agent/skills/` (e.g., "Deploy to this app's staging")

Skills only load into context when needed, reducing token overhead.

---

## 3. Comparison: Antigravity Rules vs. Cursor MDC Format

| Dimension | Cursor | Antigravity |
|-----------|--------|-------------|
| **Primary format** | `.mdc` (MDC = Markdown Component, with YAML frontmatter) | `.md` (plain Markdown, no special syntax) |
| **Rules directory** | `.cursor/rules/*.mdc` | `.antigravity/rules.md` (single file) OR `.agent/rules/*.md` |
| **Global config** | `~/.cursor/rules/` | `~/.gemini/GEMINI.md` |
| **Activation scopes** | `alwaysApply`, `autoAttached` (glob), `agentRequested`, `manual` | Always-On, Glob, Model Decision, Manual |
| **Scope naming** | Explicit `alwaysApply: true` in YAML frontmatter | Implied by file location (`.antigravity/rules.md` = always-on) |
| **Glob pattern support** | Yes, native in `.mdc` frontmatter | Yes, in `.agent/rules/` directory |
| **Workflow system** | Composer (multi-file edit mode) | Separate `/workflow` commands + `.agent/workflows/` |
| **File granularity** | One rule per `.mdc` file (modular) | Monolithic `rules.md` OR directory of `.md` files |
| **Cross-compatibility** | Base for community cross-conversion scripts | Community tools convert Cursor `.mdc` → Antigravity `.md` |

**Key differences:**
1. Cursor uses YAML frontmatter in `.mdc` files to control activation; Antigravity uses file location to imply activation
2. Cursor has a mature, well-documented modular rules system; Antigravity's is simpler but less structured
3. The antigravity.codes marketplace treats Cursor Rules and Antigravity Rules as **interchangeable** under the same category — indicating functional parity for simple rules, but implementation differs

---

## 4. Context Management

### 4.1 Context Window

- Gemini 3 Pro: up to **1 million tokens** standard context window
- Community claims of "2 million" or "infinite" context are marketing-adjacent; Gemini 1.5 Pro had 2M, Gemini 3 Pro has 1M as standard

### 4.2 Multi-Layer Memory Architecture

Antigravity manages context beyond raw token count via:

1. **Artifacts System:** As the agent works, it creates rich markdown files, architecture diagrams, code diffs, and screenshots — these are persisted and referenceable across sessions
2. **Knowledge Items:** The agent distills recurring patterns into Knowledge Bundles (code snippets, summaries, project-specific terminology) that can be injected into later sessions without re-research
3. **External Memory Routing:** Vector DBs, knowledge graphs, orchestration logs — the agent routes the relevant "sliver" of memory into context at each step
4. **Conversation Pruning/Branching:** Available via the developer forum; context is bounded per prompt but operational patterns make it feel expansive

### 4.3 Skills as Context Optimization

The Skills system serves a context management role: skills are only loaded when relevant, preventing context bloat from always-loaded instruction sets. This is analogous to Cursor's `agentRequested` activation mode.

---

## 5. Unique Features vs. Cursor, Claude Code, and Codex CLI

| Feature | Antigravity | Cursor | Claude Code | Codex CLI |
|---------|-------------|--------|-------------|-----------|
| **Multi-agent parallel tasks** | Yes (Manager surface) | No (single-threaded) | Yes (Task tool subagents) | No |
| **Browser agent** | Native (Gemini 2.5 Computer Use) | No | Playwright MCP | No |
| **Async/background execution** | Yes (dispatch and return later) | No | No (session-bound) | No |
| **Plan-before-code** | Native (Artifact-first) | Opt-in (Composer) | Opt-in (pre-flight mode) | No |
| **IDE surface** | Full GUI IDE | Full GUI IDE | CLI only | CLI only |
| **Google Cloud native** | Firebase, Cloud Run, BigQuery native | Via extensions | Via MCP | No |
| **Model flexibility** | Gemini 3 primary + Claude/GPT | Claude, GPT, Gemini | Claude only | OpenAI |
| **MCP support** | Native (as "USB-C of AI apps") | Config-based | Native | No |
| **Long-term project memory** | Knowledge Items + Artifacts | Limited (.cursorrules) | CLAUDE.md | No |
| **Skills system** | Progressive disclosure skills | No equivalent | Slash commands | No |
| **Performance (SWE-bench)** | 76.2% | ~72% (est.) | ~77% (Claude Sonnet 4.5) | ~49% |

**Antigravity's genuine differentiators:**
1. **Asynchronous multi-agent orchestration** — dispatch agents to background tasks while working on something else; no other IDE does this natively
2. **Browser-in-IDE** — automated visual testing without leaving the IDE
3. **Google Cloud native integration** — Firebase, Cloud Run, BigQuery without MCP configuration
4. **Artifact-first transparency** — all plans are reviewable before execution, reducing AI hallucination risk

---

## 6. Adoption and Market Position

### 6.1 Launch and Current Status

- **Launch date:** November 18, 2025 (public preview)
- **Current status (Feb 2026):** Still in public preview — approximately 3 months post-launch
- **Pricing:** Free for personal Gmail accounts during preview; enterprise tier pricing not yet announced
- **Usage limits:** "Generous rate limits" for Gemini 3 Pro — no specific numbers disclosed

### 6.2 Adoption Signals (Qualitative)

Google has not released adoption numbers. Observable signals:

| Signal | Observation |
|--------|-------------|
| Community forum activity | Active discussions on Google AI Developers Forum, including performance decline reports (Jan 2026) |
| Marketplace | antigravity.codes hosts 1,500+ MCP servers and AI rules, indicating community engagement |
| Comparisons | Widely covered in developer media: Codecademy, Medium, VentureBeat, etc. |
| GitHub templates | Community workspace templates (antigravity-workspace-template) emerging |
| Performance issues | Forum threads about "performance decline in Jan 2026" — suggests real users hitting real issues |

### 6.3 Market Position Assessment

Antigravity is an **early adopter tool** targeting:
- Developers heavily invested in Google Cloud (Firebase, BigQuery, Cloud Run)
- Python/Web developers (strongest model support)
- Experimenters and "vibe coders" willing to tolerate preview instability
- Enterprises evaluating Google's AI stack

It is **NOT yet** a mainstream developer tool. Cursor has 2+ years of production history; Antigravity is 3 months old.

**Competitive position:**
```
Maturity:      Cursor > Windsurf > Antigravity
Autonomy:      Antigravity > Windsurf > Cursor
Google Cloud:  Antigravity (exclusive)
Enterprise:    Cursor > Windsurf > Antigravity (too new)
```

### 6.4 Is It Worth Optimizing AIOS Output?

**Short answer: Minor fix is worth it; major investment is not (yet).**

Reasoning:
- Antigravity's rules system is simpler than Cursor's (plain Markdown, no `.mdc` format)
- AIOS already generates `.antigravity/rules/agents/*.md` — this shows existing intent
- The current AIOS output goes to a **directory of agent files**, while Antigravity's canonical structure uses a **single `rules.md` file** plus a separate `.agent/` directory
- The format mismatch is minor (`.md` content is correct; directory structure needs review)
- Community templates (antigravity-workspace-template) confirm both `.antigravity/rules.md` AND `.agent/rules/` as valid paths
- Adoption is growing but early; investing heavily now could be premature

---

## 7. AIOS Compatibility Analysis

### 7.1 Current AIOS Implementation

From code analysis of the existing codebase:

**File:** `C:\Users\AllFluence-User\Workspaces\AIOS\SynkraAI\aios-core\.aios-core\infrastructure\scripts\ide-sync\transformers\antigravity.js`

- Format declared as `'cursor-style'` — correct; Antigravity accepts cursor-style Markdown
- Target path: `.antigravity/rules/agents/*.md` — **partially correct** (directory form is supported, but not the canonical path)
- Content format: plain Markdown headers + bullet lists — **correct**; no `.mdc` conversion needed

**File:** `C:\Users\AllFluence-User\Workspaces\AIOS\SynkraAI\aios-core\.aios-core\product\templates\ide-rules\antigravity-rules.md`

- Content: correct AIOS-framework rules for Antigravity context
- Missing: no Skills system definition, no Workflow definitions

**File:** `C:\Users\AllFluence-User\Workspaces\AIOS\SynkraAI\aios-core\docs\pt\platforms\antigravity.md`

- Documents expected structure as:
  ```
  .antigravity/
  ├── rules.md              # Primary rules
  ├── antigravity.json      # Config
  └── agents/               # Agent definitions
  .agent/
  └── workflows/            # Workflow definitions
  ```
- This matches research findings well

### 7.2 Gaps and Discrepancies

| Aspect | Current AIOS Output | Correct Antigravity Convention | Gap |
|--------|--------------------|---------------------------------|-----|
| Primary rules file | Not generated | `.antigravity/rules.md` | Missing canonical single-file rules |
| Agent files | `.antigravity/rules/agents/*.md` | `.agent/rules/*.md` OR `.antigravity/agents/*.md` | Wrong subdirectory under `.antigravity` |
| Skills | Not generated | `.agent/skills/*.md` | Missing skills output |
| Workflows | `.agent/workflows/` (per PT docs) | `.agent/workflows/*.md` | Likely correct |
| Config file | Not generated | `.antigravity/antigravity.json` | Optional but useful |
| Global rules | Not generated | `~/.gemini/GEMINI.md` | Out of scope for project sync |

### 7.3 Summary of What Works

The current AIOS transformer produces valid Markdown that Antigravity can understand. The content format (plain `.md`, structured headers, agent commands) is correct. The structural placement of files needs a minor adjustment.

---

## 8. Recommendations (Prioritized P0-P3)

### P1 — Fix Rules File Path (1-2 hours)

**Current:** `antigravity.js` targets `.antigravity/rules/agents/*.md`

**Recommended:** Generate BOTH:
1. `.antigravity/rules.md` — consolidated project rules (merged from template + agent summaries)
2. `.antigravity/agents/*.md` OR `.agent/rules/agents/*.md` — individual agent files

This ensures Antigravity's auto-load picks up the primary rules file on project open.

```javascript
// In antigravity.js transformer, add a consolidated rules.md generator
// alongside the per-agent files
```

### P2 — Add Skills Output (2-3 hours)

**Gap:** AIOS has no Skills output for Antigravity.

**Recommended:** Generate `.agent/skills/` with per-agent skills packages. Each agent's commands/capabilities can be mapped to a skill that only loads when relevant (reducing context overhead for Antigravity users).

This would differentiate AIOS output for Antigravity vs. Cursor — making it feel native rather than ported.

### P3 — Add Workflow Definitions (3-4 hours)

**Gap:** AIOS workflows (SDC, QA Loop, etc.) are not translated to Antigravity's `/command` workflow format.

**Recommended:** Generate `.agent/workflows/` files translating AIOS task sequences into Antigravity `/` commands (e.g., `/dev-develop`, `/qa-gate`, `/create-story`).

This would provide the deepest Antigravity integration and let AIOS users trigger workflows natively within the IDE.

### P3 — Add `antigravity.json` Config (1 hour)

Generate `.antigravity/antigravity.json` with project metadata, available agents list, and MCP server declarations. Low effort, improves discoverability.

### NOT RECOMMENDED — MDC Format Conversion

Antigravity does NOT use `.mdc` format natively (that is Cursor's format). Do not attempt to convert AIOS rules to `.mdc` for Antigravity. Plain `.md` is correct.

### NOT RECOMMENDED — Deep Antigravity Optimization Right Now

Antigravity is 3 months into public preview. Major feature investment should wait for Q3 2026 when:
- Enterprise pricing/GA launch gives market signal
- Rules system is more stable and documented officially
- Adoption numbers are available to justify effort

---

## 9. Rules System Comparison Summary Table

| Dimension | Cursor | Antigravity | Windsurf | Claude Code |
|-----------|--------|-------------|----------|-------------|
| Format | `.mdc` (YAML frontmatter + Markdown) | `.md` (plain Markdown) | `.md` (plain Markdown) | `.md` (plain Markdown) |
| Project rules dir | `.cursor/rules/` | `.antigravity/rules.md` + `.agent/rules/` | `.windsurf/rules/` | `.claude/` |
| Global rules | `~/.cursor/rules/` | `~/.gemini/GEMINI.md` | `~/.codeium/windsurf/` | `~/.claude/CLAUDE.md` |
| Activation control | YAML frontmatter (`alwaysApply`, `globs`) | File location + 4 modes | File location | File location |
| Modular rules | Yes (one `.mdc` per rule) | Partial (directory or single file) | Yes | Yes |
| Workflow system | Composer (multi-file) | `/command` + `.agent/workflows/` | Cascade Flows | Task tool |
| Skills/progressive loading | No | Yes (`.agent/skills/`) | No | Slash commands |

---

## 10. Sources

- [Google Developers Blog — Build with Google Antigravity](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/)
- [VentureBeat — Antigravity agent-first architecture](https://venturebeat.com/orchestration/google-antigravity-introduces-agent-first-architecture-for-asynchronous)
- [Mete Atamel — Customize Google Antigravity with rules and workflows](https://atamel.dev/posts/2025/11-25_customize_antigravity_rules_workflows/)
- [Jimmy Liao — Antigravity Rules & Workflows Guide](https://memo.jimmyliao.net/p/antigravity-rules-and-workflows-guide)
- [Lanxk AI — How to Add Rules to Google Antigravity](https://www.lanxk.com/posts/google-antigravity-rules/)
- [Amulya Bhatia — Advanced Tips for Mastering Google Antigravity](https://iamulya.one/posts/advanced-tips-for-mastering-google-antigravity/)
- [Antigravity Codes — Rules Marketplace](https://antigravity.codes/rules)
- [Antigravity Codes — User Rules Blog](https://antigravity.codes/blog/user-rules)
- [Baytech Consulting — Google Antigravity AI IDE 2026](https://www.baytechconsulting.com/blog/google-antigravity-ai-ide-2026)
- [Google AI Fire — Antigravity 2026 Guide](https://www.aifire.co/p/google-antigravity-the-2026-guide-to-the-best-ai-ide)
- [Grokipedia — Google Antigravity](https://grokipedia.com/page/Google_Antigravity)
- [Visual Studio Magazine — Google's Antigravity IDE Sparks Forking Debate](https://visualstudiomagazine.com/articles/2025/11/21/googles-antigravity-ide-sparks-forking-debate.aspx)
- [XDA Developers — Google Antigravity is the best VS Code fork](https://www.xda-developers.com/google-antigravity-is-the-best-fork-of-microsoft-vs-code/)
- [GitHub — antigravity-workspace-template (study8677)](https://github.com/study8677/antigravity-workspace-template)
- [GitHub — ai-agent-unity-rules (Common-ka)](https://github.com/Common-ka/ai-agent-unity-rules)
- [Codecademy — Agentic IDE Comparison](https://www.codecademy.com/article/agentic-ide-comparison-cursor-vs-windsurf-vs-antigravity)
- [Cursor vs Antigravity — Skywork AI](https://skywork.ai/blog/antigravity-vs-cursor/)
- [Index.dev — Google Antigravity Agentic IDE](https://www.index.dev/blog/google-antigravity-agentic-ide)
- [Skywork AI — Antigravity Infinite Context Window](https://skywork.ai/blog/ai-agent/antigravity-infinite-context-window-explained/)

---

*Research completed: 2026-02-21*
*Story: NOG-9 — UAP & SYNAPSE Deep Research*
*Wave: 4 — Cross-IDE Compatibility*
*Priority: LOW (but P1 fix recommended)*
