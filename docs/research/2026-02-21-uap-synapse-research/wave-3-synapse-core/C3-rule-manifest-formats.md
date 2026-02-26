# C3 — Domain & Manifest System: Rule Storage Formats
**Story NOG-9 — UAP & SYNAPSE Deep Research | Wave 3: SYNAPSE Core**
**Research Date:** 2026-02-21
**Researcher:** Tech Researcher Agent

---

## Executive Summary

The SYNAPSE engine uses a custom dual-format system: a `KEY=VALUE` manifest registry
(`.synapse/manifest`) and KEY=VALUE domain files (`.synapse/<domain-name>`). This format
is unique in the AI tooling landscape — all major competitors use Markdown with YAML
frontmatter or plain Markdown. The custom format has engineering advantages (zero deps,
predictable parsing, machine-writeable) but creates a discoverability gap and diverges
from the emerging AGENTS.md industry standard that OpenAI, Google, Sourcegraph, and Cursor
are converging on.

---

## 1. Research Findings per Question

### RQ1: How does Cursor's `.cursorrules` / `.cursor/rules/*.mdc` format work?

**Format evolution:**
- **Legacy (deprecated):** `.cursorrules` — a single flat Markdown file at project root.
  Still supported but actively discouraged.
- **Current:** `.cursor/rules/*.mdc` — directory of individual `.mdc` files (one per rule).

**MDC format anatomy:**
Each `.mdc` file contains two sections: a YAML frontmatter block followed by a Markdown body.

```yaml
---
description: Standards for TypeScript code in this project
globs: "**/*.ts,**/*.tsx"
alwaysApply: false
---

# TypeScript Standards

- No `any` types
- Always define prop interfaces
```

**Frontmatter fields:**

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `description` | string | Conditional | Text shown to the AI agent for relevance decisions; required for "Agent Requested" mode |
| `globs` | string/array | Optional | Glob patterns for auto-attaching the rule when matched files are in context |
| `alwaysApply` | boolean | Optional | If `true`, the rule is injected into every session unconditionally |

**Four activation modes (determined by frontmatter combination):**

| Mode | `alwaysApply` | `globs` | `description` | Trigger |
|------|--------------|---------|---------------|---------|
| Always | `true` | — | — | Every session |
| Auto-Attach | `false` | set | — | File match |
| Agent Requested | `false` | — | set | AI decides relevance |
| Manual | — | — | — | User `@rule-name` mention |

**Glob pattern syntax:** Standard Unix globs (`**/*.ts`, `src/**/*.tsx`). Rules inject at
the start of model context. Precedence order: Team Rules > Project Rules > User Rules.

**Character limits:** Individual rule files are limited to 6,000 characters; total combined
global + local rules must not exceed 12,000 characters.

**Sources:**
- [awesome-cursor-rules-mdc reference](https://github.com/sanjeed5/awesome-cursor-rules-mdc/blob/main/cursor-rules-reference.md)
- [Cursor IDE Rules Deep Dive - Mervin Praison](https://mer.vin/2025/12/cursor-ide-rules-deep-dive/)
- [A Rule That Writes the Rules - Medium](https://medium.com/@devlato/a-rule-that-writes-the-rules-exploring-rules-mdc-288dc6cf4092)

---

### RQ2: How does Codex CLI's `AGENTS.md` format work?

**Format:** Pure Markdown. No required frontmatter. No schema enforcement. Flexible structure
using conventional section headers.

**Basic example:**
```markdown
# AGENTS.md

## Working agreements
- Keep functions under 50 lines
- Document public APIs in `docs/`

## Repository expectations
- Run `npm run lint` before opening a pull request
- Document public utilities in `docs/` when you change behavior

## Testing
- Use Jest for all unit tests
- Integration tests go in `tests/integration/`
```

**Discovery and hierarchy:** Codex discovers instruction files in a top-down precedence order:

```
~/.codex/AGENTS.md              (global defaults)
~/.codex/AGENTS.override.md     (global override, takes precedence)
repo/AGENTS.md                  (repository root)
repo/services/payments/AGENTS.md (subdirectory — closer proximity wins)
repo/services/payments/AGENTS.override.md (most specific wins)
```

**Merging strategy:** Files concatenate from root downward with blank line separators.
Files closer to the working directory appear later in the combined prompt and thus
effectively override earlier guidance through position in context.

**Override mechanism:** `AGENTS.override.md` at any directory level takes precedence over
`AGENTS.md` at the same level.

**Size limits:**
- Default: **32 KiB** combined (`project_doc_max_bytes`)
- Empty files are skipped
- Processing stops at the byte limit
- Recommendation: split large files across nested directories

**Verification command:**
```bash
codex --ask-for-approval never "Summarize current instructions."
```

**Sources:**
- [OpenAI Codex AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md/)
- [openai/codex AGENTS.md on GitHub](https://github.com/openai/codex/blob/main/AGENTS.md)

---

### RQ3: What standard formats exist for AI/LLM rule/instruction files?

The ecosystem is actively fragmented but converging. Key formats as of February 2026:

**A. AGENTS.md (Emerging Cross-Industry Standard)**
- Jointly launched by Google, OpenAI, Factory, Sourcegraph, and Cursor
- Pure Markdown, no schema, convention-over-configuration
- Tool-agnostic; symlink tool-specific files to it for cross-tool compatibility
- Supported natively by: OpenAI Codex CLI, Sourcegraph Amp, Claude Code (as CLAUDE.md),
  GitHub Copilot (via migration), Gemini CLI (as GEMINI.md)

**B. MDC / YAML Frontmatter + Markdown (Cursor, AIRS)**
- YAML frontmatter for machine-readable metadata + Markdown body for LLM instructions
- Balances machine precision (structured metadata) with LLM-friendly prose
- Used by Cursor's `.mdc`, AIRS standard, GitHub Copilot `.instructions.md`

**C. KEY=VALUE (SYNAPSE-specific, CARL-compatible)**
- Custom format used by AIOS SYNAPSE manifest and domain files
- Machine-writable, zero deps, predictable line-based parsing
- Not used by any other public AI tooling ecosystem

**D. TOML + Markdown (Ruler tool)**
- `ruler.toml` defines which agents are managed and their output paths
- `.ruler/AGENTS.md` and other `.md` files are the actual rule content
- Ruler reads all `.md` files in `.ruler/`, combines them, distributes to 30+ agents

**E. YAML (Continue, JetBrains AI)**
- Continue: `config.yaml` for assistant definitions + `.continuerules` for raw text rules
- JetBrains AI: `.aiassistant/rules/*.md` — Markdown files, folder-based

**F. Plain Markdown (Windsurf, Cline, GitHub Copilot)**
- Windsurf: `global_rules.md` (global) + `.windsurf/rules/` (project-level, with glob activation)
  - Limit: 6,000 chars per file, 12,000 chars total combined
- Cline: `.clinerules` (single file) or `.clinerules/` (folder of `.md`/`.txt` files)
  - Glob patterns in frontmatter: `src/**`, `*.config.js`
  - Rules without frontmatter are always active
- GitHub Copilot: `.github/copilot-instructions.md` (single) or `.github/instructions/**/*.instructions.md`

**AIRS (AI Editor Rules Standard):**
- Company-agnostic standard from [useairs.dev](https://www.useairs.dev)
- Markdown files with YAML frontmatter
- Core frontmatter fields: `id`, `name`, `description`, `activation` (always/conditional/selectable),
  `conditions` (path patterns, language IDs), `context`, `priority`, `tags`
- Designed for graceful degradation — rules useful even when editor-specific fields absent

**Format performance for LLMs (research finding):**
- YAML: best accuracy (preferred by GPT-4o, Gemini)
- Markdown: most token-efficient (34-38% fewer tokens than JSON, ~10% fewer than YAML)
- Best of both: YAML frontmatter + Markdown body (current industry consensus)

**Sources:**
- [AI Agent Rule Files Chaos - EveryDev.ai](https://www.everydev.ai/p/blog-ai-coding-agent-rules-files-fragmentation-formats-and-the-push-to-standardize)
- [Standardized AI Coding Rules - aicodingrules.org](https://aicodingrules.org/)
- [AIRS Standard - useairs.dev](https://www.useairs.dev/)
- [AI Agent Rule/Instruction Files overview - 0xdevalias gist](https://gist.github.com/0xdevalias/f40bc5a6f84c4c5ad862e314894b2fa6)
- [Which format do LLMs understand best? - improvingagents.com](https://www.improvingagents.com/blog/best-nested-data-format/)

---

### RQ4: How do other AI tools handle rule file discovery and loading?

**Glob-based (file-context-aware activation):**
- **Cursor:** `globs: "**/*.ts"` in frontmatter — rule injects when matching files are in context
- **Cline:** Glob patterns in `.clinerules/` frontmatter, e.g., `src/**`, `*.config.js`
- **Windsurf:** User-defined glob patterns in `.windsurf/rules/` — `*.js`, `src/**/*.ts`
- **GitHub Copilot:** `applyTo` frontmatter field in `.instructions.md` files
- **Sourcegraph Amp / AGENTS.md:** `globs` array in frontmatter (`['**/*.ts', '**/*.tsx']`)

**Hierarchical directory discovery:**
- **Claude Code:** Scans CLAUDE.md in repo root, parent directories, child directories, home folder
- **Codex CLI:** Traverses from repo root to working directory, merges by proximity
- **Windsurf:** All `.windsurf/rules/` directories in workspace + git repo structure up to root
- **Sourcegraph Amp:** All parent directories up to `$HOME`; `$HOME/.config/AGENTS.md` always included

**Explicit registration (manifest-based):**
- **SYNAPSE:** `.synapse/manifest` KEY=VALUE registry — domain must be explicitly listed
- No other public AI tool uses this pattern; closest is Ruler's `ruler.toml` which lists which agents to manage

**Convention-based (no registration needed):**
- Most tools (Cursor, Cline, Windsurf, Copilot, Codex) discover by convention: known file
  names in known directories, no registration file needed

**Key insight:** SYNAPSE is the only system in the ecosystem that requires explicit
manifest registration before a domain is discoverable. All competitors use convention
over registration.

**Sources:**
- [Cline Rules documentation](https://docs.cline.bot/customization/cline-rules)
- [Windsurf Cascade Memories](https://docs.windsurf.com/windsurf/cascade/memories)
- [OpenAI Codex AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md/)
- [Ruler GitHub](https://github.com/intellectronica/ruler)

---

### RQ5: Performance implications of different config formats for per-prompt parsing?

**Key findings on per-prompt parsing overhead:**

**KEY=VALUE (SYNAPSE current format):**
- Parsing: O(n) line scan, single-pass, no external dependencies
- SYNAPSE `parseManifest()` reads synchronously with `fs.readFileSync`; parses in one pass
  using `indexOf('=')` — extremely fast for files under 10 KB
- Domain files: dual-mode detection (KEY=VALUE vs plain text) adds a first-pass scan,
  but the overhead is negligible at the file sizes SYNAPSE uses
- **No caching**: manifest and domain files are read fresh on every hook invocation
  (every prompt); this is a measurable overhead at scale

**YAML frontmatter + Markdown:**
- Parsing cost: requires a YAML parser (`js-yaml` or similar) + frontmatter extractor
- More expressive but heavier: regex to detect `---` delimiters + YAML parse of block
- At hook latency budgets (SYNAPSE targets <5s), a `js-yaml` parse of a 1 KB file
  adds ~1–2ms overhead — acceptable but nonzero

**Plain Markdown (AGENTS.md, CLAUDE.md):**
- Parsing: zero — passed as raw text directly to the LLM context
- No parse overhead; the LLM interprets structure from prose
- Token cost: Markdown is 34-38% more token-efficient than JSON for the same content
- Claude Code reads CLAUDE.md at session start (not per-prompt); single-load, no per-prompt cost

**Prompt caching (LLM-side):**
- Anthropic's prompt caching (KV cache) can deliver 2-4x latency improvements and 50-80%
  cost reductions when rule content is stable across prompts
- Static rule content (rarely changing manifests/domains) is ideal for KV cache reuse
- KEY=VALUE and Markdown both benefit equally from LLM-side prompt caching since both
  are raw text from the model's perspective
- **The bigger performance lever is caching the loaded/parsed rule content in Node.js
  memory** (in-process cache keyed by file mtime), not the format itself

**AST / pre-parsed binary:**
- No AI tool in the ecosystem currently uses pre-parsed binary or AST caching for rule files
- The overhead of text parsing at these file sizes (< 32 KiB) is too small to justify
  the complexity of binary serialization
- In-memory JavaScript object caching (after first parse per session) is the practical
  optimization target

**Practical SYNAPSE implication:**
- Current architecture: cold read + parse on every hook call (every user prompt)
- Opportunity: cache parsed manifest + domain data keyed by `{file path → mtime}`;
  invalidate only when files change
- This is a bigger performance win than format changes

**Sources:**
- [Prompt Caching in LLMs - Medium](https://medium.com/@reddysureshcmc/prompt-caching-in-llms-cutting-costs-while-boosting-speed-7250833a1019)
- [LLM Prompt Caching Guide - Medium](https://medium.com/@michael.hannecke/llm-prompt-caching-what-you-should-know-2665d76d3d8d)
- [Which format do LLMs understand best?](https://www.improvingagents.com/blog/best-nested-data-format/)
- Direct code analysis: `domain-loader.js` (`parseManifest`, `loadDomainFile`)

---

## 2. Specific Projects/Tools Found

| Tool | Rule Format | Discovery | Glob Support | Size Limit |
|------|------------|-----------|-------------|------------|
| **Cursor** (`.cursor/rules/*.mdc`) | YAML frontmatter + Markdown | Directory scan `.cursor/rules/` | Yes (`globs` field) | 6K chars/file, 12K total |
| **Cursor legacy** (`.cursorrules`) | Plain Markdown | File convention at root | No | Unspecified |
| **OpenAI Codex CLI** (`AGENTS.md`) | Plain Markdown | Hierarchical dir traversal | No (proximity-based) | 32 KiB combined |
| **Claude Code** (`CLAUDE.md`) | Plain Markdown | Root + parents + children + home | Via `paths` field | Unspecified |
| **Windsurf** (`global_rules.md` + `.windsurf/rules/`) | Plain Markdown | Global file + rules directory | Yes (user-defined) | 6K/file, 12K total |
| **Cline** (`.clinerules` / `.clinerules/`) | Plain Markdown | File convention or folder | Yes (frontmatter) | Unspecified |
| **GitHub Copilot** (`.github/copilot-instructions.md`) | Markdown with optional frontmatter | Single known path | Yes (`applyTo`) | Unspecified |
| **Sourcegraph Amp** (`AGENTS.md`) | YAML frontmatter + Markdown | Dir traversal to $HOME | Yes (`globs` array) | Unspecified |
| **JetBrains AI** (`.aiassistant/rules/*.md`) | Plain Markdown | Directory scan | No | Unspecified |
| **Gemini CLI** (`GEMINI.md`) | Plain Markdown | Hierarchical | No | Unspecified |
| **Continue** (`config.yaml` + `.continuerules`) | YAML config + raw text | Config file + convention | No | Unspecified |
| **AIRS Standard** (`.prompt.md` / `.prompts/`) | YAML frontmatter + Markdown | Directory + scoped | Yes (`conditions.paths`) | Unspecified |
| **Ruler** (`ruler.toml` + `.ruler/*.md`) | TOML config + Markdown rules | TOML registry | No (content distribution) | Unspecified |
| **SYNAPSE** (`.synapse/manifest` + `.synapse/<domain>`) | KEY=VALUE manifest + KEY=VALUE domain | Explicit manifest registry | No | None |

**Key standardization projects:**
- [intellectronica/ruler](https://github.com/intellectronica/ruler) — Unified config management, 30+ agents
- [AGENTS.md cross-industry standard](https://addozhang.medium.com/agents-md-a-new-standard-for-unified-coding-agent-instructions-0635fc5cb759)
- [useairs.dev — AI Editor Rules Standard](https://www.useairs.dev/)
- [aicodingrules.org — Standardized AI Coding Rules](https://aicodingrules.org/)
- [sanjeed5/awesome-cursor-rules-mdc](https://github.com/sanjeed5/awesome-cursor-rules-mdc)

---

## 3. Format Comparison Table

| Dimension | SYNAPSE Manifest (current) | `.cursorrules` / MDC | `AGENTS.md` | `CLAUDE.md` rules |
|-----------|---------------------------|----------------------|-------------|-------------------|
| **File format** | KEY=VALUE (custom, CARL-compatible) | YAML frontmatter + Markdown | Plain Markdown | Plain Markdown |
| **Manifest/registry** | Explicit (`.synapse/manifest` required) | Convention only (no registry) | Convention only | Convention only |
| **Discovery** | Explicit registration in manifest | Directory scan `.cursor/rules/` | Hierarchical directory traversal | Root + parents + children |
| **Glob/file-context activation** | No | Yes (MDC `globs` field) | No | Yes (Claude Code `paths`) |
| **Always-on rules** | Yes (`_ALWAYS_ON=true`) | Yes (`alwaysApply: true`) | Yes (global `~/.codex/`) | Yes (root CLAUDE.md always loaded) |
| **Agent/trigger-based activation** | Yes (`_AGENT_TRIGGER=dev`) | Via "Agent Requested" mode + description | No native support | No native support |
| **Workflow/state activation** | Yes (`_WORKFLOW_TRIGGER=story_development`) | No | No | No |
| **Layered priority system** | Yes (L0-L7 explicit layers) | Partial (Team > Project > User) | Partial (closer overrides) | Partial (nested overrides) |
| **Comments support** | Yes (`# comment`) | N/A (standard Markdown) | N/A (standard Markdown) | N/A (standard Markdown) |
| **Machine-writeable** | Yes (trivial KEY=VALUE append) | Requires YAML parser | Plain text append | Plain text append |
| **Human readability** | Medium (structured but verbose keys) | High (prose with metadata) | High (pure prose) | High (pure prose) |
| **LLM comprehension** | Lower (raw KEY=VALUE passed to model) | High (Markdown native) | High (Markdown native) | High (Markdown native) |
| **Token efficiency** | Low (key prefixes consume tokens) | Medium-High | High (prose, no overhead) | High |
| **Tooling ecosystem** | AIOS only | Cursor, AIRS-compatible | 6+ major tools | Claude Code |
| **Schema/validation** | Implicit (suffix-based) | Implicit (frontmatter fields) | None | None |
| **Import/reference support** | No | No | Via `@mention` (Amp) | Via `@import` (Claude Code) |
| **Per-prompt parsing cost** | Very low (line scan, no deps) | Low (YAML parse ~1-2ms) | None (raw text) | None (raw text) |
| **Caching (current)** | None (cold read per prompt) | Tool-internal (unknown) | Tool-internal (unknown) | Session-start load |
| **External dependency** | Zero | `js-yaml` or equivalent | None | None |

---

## 4. Relevance to AIOS SYNAPSE Domain/Manifest System

### What SYNAPSE Does Uniquely Well

1. **Layered activation model (L0-L7):** No other tool has an explicit numeric layer hierarchy
   for rule priority and injection order. This is a genuine differentiator for multi-agent
   orchestration. Industry tools have 2-3 precedence levels; SYNAPSE has 8.

2. **Agent-trigger activation:** `AGENT_DEV_AGENT_TRIGGER=dev` is unique — rules activate
   based on the active agent identity, not just file context. No competitor does this.

3. **Workflow-state activation:** `WORKFLOW_STORY_DEV_WORKFLOW_TRIGGER=story_development`
   injects rules based on orchestration state (not file context). No competitor does this.

4. **Machine-writeable manifest:** The KEY=VALUE format is trivially appendable by scripts
   without a YAML/JSON parser. This matters for the UAP (Unified Activation Pipeline) that
   generates domain registrations programmatically.

5. **Zero external dependencies:** `parseManifest()` uses only Node.js built-ins. This is
   important for hook cold-start performance (SYNAPSE runs on every user prompt).

### Where SYNAPSE Diverges from Industry (Risk Areas)

1. **No glob/file-context activation:** SYNAPSE cannot say "inject these rules only when
   working with `*.test.js` files." Cursor, Cline, Windsurf, Copilot, and Amp all support
   this. This is the biggest missing activation dimension.

2. **Explicit registration required:** Users must add a domain to `.synapse/manifest` before
   it is discoverable. Industry tools use convention over registration — drop a file in the
   right directory and it works. This creates onboarding friction.

3. **KEY=VALUE domain body is not LLM-native:** When SYNAPSE passes `AGENT_DEV_RULE_0=Follow
   develop-story order...` to the LLM, the key prefix (`AGENT_DEV_RULE_0=`) consumes tokens
   and adds noise. The LLM must parse structured key names before reaching the rule content.
   Markdown rules eliminate this overhead.

4. **No per-prompt caching:** Every hook invocation reads all domain files from disk. At
   high prompt frequency, this is measurable I/O overhead. A file-mtime-keyed in-memory
   cache would eliminate it.

5. **Divergence from AGENTS.md standard:** As OpenAI, Google, Sourcegraph, and Cursor
   converge on AGENTS.md as the cross-tool standard, SYNAPSE's custom format becomes an
   island. Users who know AGENTS.md cannot directly apply that knowledge to SYNAPSE.

### Where SYNAPSE's Format Serves Its Architecture

The KEY=VALUE manifest is a deliberate design for SYNAPSE's specific problem space:
multi-agent orchestration with explicit layer control. The use case is fundamentally
different from "apply coding style rules to TypeScript files" — it is more akin to
a runtime configuration system for an agent orchestration engine. The custom format
is appropriate for that use case; the question is whether to keep it pure or add
a compatibility layer.

---

## 5. Prioritized Recommendations

### P0 — Critical: Add File-Mtime Caching to Domain Loader

**Problem:** `domain-loader.js` reads all domain files from disk on every hook call (every
user prompt). At high prompt frequency this creates unnecessary I/O.

**Recommendation:** Add an in-process cache in `domain-loader.js` (or a new `cache-manager.js`)
keyed by `{filePath -> lastModifiedMs}`. Invalidate and re-read only when `fs.statSync().mtimeMs`
changes. Since domains rarely change during a session, this should yield near-100% cache hit
rates in normal usage.

**Implementation sketch:**
```javascript
const _domainCache = new Map(); // path -> { mtime, rules }

function loadDomainFileCached(domainPath) {
  const stat = fs.statSync(domainPath, { throwIfNoEntry: false });
  if (!stat) return [];
  const mtime = stat.mtimeMs;
  const cached = _domainCache.get(domainPath);
  if (cached && cached.mtime === mtime) return cached.rules;
  const rules = loadDomainFile(domainPath);
  _domainCache.set(domainPath, { mtime, rules });
  return rules;
}
```

**Effort:** Small (1-2 hours). Impact: High (eliminates per-prompt disk I/O).

---

### P1 — High: Add Glob/File-Context Activation to Manifest

**Problem:** SYNAPSE cannot inject rules conditionally based on file context (e.g., only
inject QA rules when working in `tests/**`). This is the #1 missing activation dimension
compared to every competitor.

**Recommendation:** Add `_GLOB` attribute to manifest domain entries:
```
AGENT_QA_GLOB=tests/**,*.test.js,*.spec.ts
```

When the active session context contains files matching these globs, the domain injects
automatically. The domain-loader already has `matchKeywords()` infrastructure; glob
matching can be added via `minimatch` (or a lightweight custom implementation to avoid deps).

**Backward compatible:** domains without `_GLOB` behave exactly as today.

**Effort:** Medium (4-8 hours including tests). Impact: High (closes largest feature gap vs competitors).

---

### P1 — High: Migrate Domain File Body to Markdown

**Problem:** Domain files currently use `KEY=VALUE` bodies (e.g., `AGENT_DEV_RULE_0=text`).
When injected into the LLM context, the key prefix consumes tokens and adds cognitive noise
for the model.

**Recommendation:** Migrate domain file bodies to Markdown with YAML frontmatter for metadata,
plain Markdown list items for rules. The `loadDomainFile()` already detects plain-text format;
this migration just standardizes on it.

**Target format:**
```markdown
---
layer: 2
alwaysOn: false
agentTrigger: dev
---

# @dev (Dex) — Authority & Rules

**Allowed:** git add, commit, status, diff, log, branch, checkout, merge (local)
**Blocked:** git push — delegate to @devops
**Blocked:** gh pr create/merge — delegate to @devops

- Follow develop-story order: Read task → implement → write tests → validate → update checkbox
- Run CodeRabbit self-healing before marking story complete (max 2 iterations, CRITICAL+HIGH)
- Use Interactive mode by default; YOLO for simple tasks; Pre-Flight for ambiguous requirements
```

**The manifest** (`.synapse/manifest`) retains its KEY=VALUE format for the registry — this
is appropriate for machine-writeable config. Only the domain file _bodies_ migrate to Markdown.

**Effort:** Medium (domain content migration + updated `loadDomainFile()` + updated tests).
Impact: High (token efficiency, LLM comprehension, human readability).

---

### P2 — Medium: Add Convention-Based Discovery (Reduce Registration Friction)

**Problem:** New domains require explicit manifest registration. This is a friction point
for contributors and for programmatic domain generation.

**Recommendation:** Add auto-discovery: scan `.synapse/` for files not in the manifest and
offer to register them. Could be implemented as:
1. A `synapse doctor` sub-check that warns about unregistered domain files
2. An optional `_AUTODISCOVER=true` manifest flag that scans `.synapse/` and treats all
   files without a `_STATE` entry as inactive-but-discoverable

This preserves explicit registration as the default (existing behavior) while reducing
the "file exists but doesn't work" confusion.

**Effort:** Small (2-4 hours). Impact: Medium (developer experience improvement).

---

### P2 — Medium: Add AGENTS.md Compatibility Export

**Problem:** SYNAPSE's rule system is invisible to other AI tools. If a developer uses
Cursor or Codex alongside Claude Code, SYNAPSE rules do not apply to those tools.

**Recommendation:** Add a `synapse export` CLI command (or UAP pipeline step) that generates
an `AGENTS.md` file from the active SYNAPSE domains. This would allow always-on and global
domains to be exported as a cross-tool compatible instruction file.

```bash
npx aios-core synapse export --format agents-md > AGENTS.md
```

This does not require changing the internal format — it is a projection/export layer.

**Effort:** Medium (4-6 hours). Impact: Medium (cross-tool compatibility, ecosystem alignment).

---

### P3 — Low: Consider TOML for Manifest (Long-Term)

**Problem:** KEY=VALUE is a non-standard format that requires a custom parser
(`parseManifest()`). TOML provides equivalent key-value semantics with better tooling
(schema validation, editor support, syntax highlighting, existing parsers).

**Recommendation:** Evaluate migrating `.synapse/manifest` to TOML in a future major version.

**Proposed TOML equivalent:**
```toml
devmode = false

[constitution]
state = "active"
always_on = true
non_negotiable = true

[global]
state = "active"
always_on = true

[agent_dev]
state = "active"
agent_trigger = "dev"
glob = "packages/**,bin/**"

[workflow_story_dev]
state = "active"
workflow_trigger = "story_development"
```

**Trade-offs:**
- Pro: standard format, editor tooling, schema validation possible
- Con: adds `@iarna/toml` or similar dependency; requires rewriting `parseManifest()`
- Pro: TOML is already used by Ruler (the leading multi-agent config tool)

**Recommendation:** Keep KEY=VALUE for now (zero deps is a real advantage for a hook runtime).
Revisit when SYNAPSE matures and the manifest grows beyond 100 entries.

**Effort:** Large (format migration, parser replacement, all tests). Impact: Low short-term.

---

## Appendix A: SYNAPSE Current Format Summary

**`.synapse/manifest` (KEY=VALUE registry):**
```
# Comments supported
DEVMODE=false
DOMAIN_STATE=active|inactive
DOMAIN_ALWAYS_ON=true|false
DOMAIN_NON_NEGOTIABLE=true|false
DOMAIN_AGENT_TRIGGER=agent-id
DOMAIN_WORKFLOW_TRIGGER=workflow-id
DOMAIN_RECALL=keyword1,keyword2
DOMAIN_EXCLUDE=skip,ignore
GLOBAL_EXCLUDE=skip,ignore
```

**`.synapse/<domain-name>` (KEY=VALUE domain body — current):**
```
# Comments supported
DOMAIN_RULE_0=Rule text here
DOMAIN_RULE_1=Another rule
DOMAIN_AUTH_0=ALLOWED: git add
DOMAIN_AUTH_1=BLOCKED: git push
```

**Domain name convention:** UPPERCASE_SNAKE in manifest → lowercase-kebab filename
(e.g., `AGENT_DEV` → `.synapse/agent-dev`)

**Parser implementation:** `domain-loader.js` — pure Node.js, zero deps, synchronous,
single-pass O(n) per file.

---

## Appendix B: Industry Format Inventory (February 2026)

| Tool | Primary Rule File | Format | Discovery |
|------|-----------------|--------|-----------|
| Claude Code | `CLAUDE.md` | Markdown | Hierarchical |
| OpenAI Codex CLI | `AGENTS.md` | Markdown | Hierarchical |
| Cursor | `.cursor/rules/*.mdc` | YAML fm + Markdown | Dir scan |
| Windsurf | `.windsurf/rules/*.md` | Markdown | Dir scan |
| Cline | `.clinerules/` | Markdown | File convention |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown | Single known path |
| Sourcegraph Amp | `AGENTS.md` | YAML fm + Markdown | Hierarchical |
| JetBrains AI | `.aiassistant/rules/*.md` | Markdown | Dir scan |
| Gemini CLI | `GEMINI.md` | Markdown | Hierarchical |
| Continue | `.continuerules` | Raw text | Convention |
| Ruler (meta-tool) | `ruler.toml` + `.ruler/*.md` | TOML + Markdown | TOML registry |
| AIRS Standard | `.prompt.md` / `.prompts/` | YAML fm + Markdown | Dir + scoped |
| **SYNAPSE (AIOS)** | `.synapse/manifest` + `.synapse/<domain>` | **KEY=VALUE (custom)** | **Explicit registry** |

---

*Research complete. All findings are based on public documentation and source code as of 2026-02-21.*
*Primary sources linked inline. SYNAPSE internal format analyzed from `.synapse/manifest`, `.synapse/agent-dev`, `.synapse/global`, `.synapse/context`, and `domain-loader.js`.*
