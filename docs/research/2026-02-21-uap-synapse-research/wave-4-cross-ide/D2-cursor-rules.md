# D2 — Cursor Rules System Architecture

**Research Target:** Deep dive into Cursor IDE's rules system — architecture, format, token economics, limitations, and differentiation opportunities for AIOS SYNAPSE.

**Priority:** HIGH
**Wave:** 4 — Cross-IDE Competitive Analysis
**Story:** NOG-9 — UAP & SYNAPSE Deep Research
**Researcher:** Claude Sonnet 4.6 (automated via tech-search pipeline)
**Date:** 2026-02-21
**Status:** Complete

---

## Executive Summary

Cursor has built the most sophisticated AI context-injection system in the IDE space, evolving from a single monolithic `.cursorrules` file (deprecated v0.45, January 2025) to a modular `.mdc` (Markdown with YAML frontmatter) system with four activation modes, hierarchical priority, and dynamic context discovery. The new system reduces unnecessary token consumption through selective rule activation but introduces a critical systemic weakness: **all rules are probabilistic instructions to a prediction engine, not enforced policies**. This is Cursor's most fundamental limitation — and SYNAPSE's primary differentiation opportunity.

Key findings:
- `.cursorrules` deprecated in v0.45 (Jan 2025); migration to `.cursor/rules/*.mdc` is the current standard
- Four activation modes: Always Apply, Auto Attached (glob), Agent Requested, Manual
- Token overhead is significant: 22 `alwaysApply` rules = 5,000-8,000 tokens of overhead per conversation
- Dynamic context discovery (January 2026) reduced total agent tokens by 46.9% in MCP-heavy sessions
- No enforcement mechanism — the AI agent can ignore rules at will; compliance is probabilistic
- Community pain points: rules being silently ignored, context drift in long sessions, "middle of file" attention loss, no audit trail

---

## Research Question 1: Complete Architecture — Legacy vs. Current

### The Migration Path

| Aspect | `.cursorrules` (Legacy) | `.cursor/rules/*.mdc` (Current) |
|--------|------------------------|--------------------------------|
| Introduced | Before v0.45 | v0.45 (January 23, 2025) |
| Format | Plain Markdown | Markdown + YAML frontmatter |
| File count | Single monolithic file | Multiple focused files |
| Activation | Always (100% of conversations) | Conditional (4 modes) |
| Scoping | None (global only) | Glob patterns, subdirectories |
| Version control | Single file in root | `.cursor/rules/` directory |
| Current status | Deprecated, still functional | Active, recommended |
| Deprecation timeline | "Soon" (as of v0.47, no hard date) | N/A |

**Migration recommendation from Cursor team (v0.47):** "The `.cursorrule` file is still usable for now, but we recommend switching to `.mdc` files in the `.cursor/rules` directory before it's gone for good." No specific end-of-life date has been announced as of February 2026.

### Four Storage Levels (2026 Architecture)

```
Priority (highest → lowest):
1. Team Rules       — Team/Enterprise dashboard; enforced across all team projects
2. Project Rules    — .cursor/rules/*.mdc; version-controlled in repo
3. User Rules       — Cursor Settings > Rules; global to developer machine
4. Legacy Rules     — .cursorrules in project root; deprecated
5. AGENTS.md        — Simple markdown at repo root; vendor-neutral alternative
```

### The AGENTS.md Alternative

In July 2025, Sourcegraph's Amp team published AGENTS.md as a vendor-neutral standard attempting to unify AI coding agent configuration across tools. Cursor adopted it as a supported format. It provides:
- Plain Markdown (no YAML frontmatter required)
- Subdirectory scoping (nested AGENTS.md files with inheritance)
- No metadata or complex configurations
- Compatible with Windsurf, Cline, GitHub Copilot, Claude Code

**Implication for SYNAPSE:** AGENTS.md represents the industry push toward standardization. SYNAPSE operates in Claude Code, which uses `CLAUDE.md` — the equivalent in Anthropic's ecosystem.

---

## Research Question 2: MDC Format Specification

### Complete File Structure

```yaml
---
description: "Human-readable description of what this rule covers and when to apply it"
globs: "src/**/*.ts,src/**/*.tsx"
alwaysApply: false
---

# Rule Title

Your instructions in standard Markdown format.

## Section 1: Code Standards
- Use TypeScript strict mode
- No `any` types

## Section 2: File Organization
...
```

### YAML Frontmatter Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Recommended | Human/AI-readable purpose. Critical for "Agent Requested" mode — the AI reads this to decide relevance. |
| `globs` | string | Optional | Comma-separated glob patterns. Triggers "Auto Attached" mode. Supports `**/*.ts`, `src/**`, etc. |
| `alwaysApply` | boolean | Optional (default: false) | If `true`, rule loads into every conversation regardless of context. Conflicts with glob filtering. |

**Important edge cases:**
- `alwaysApply: true` + `globs` set → globs are **ignored**, rule loads always
- Empty `description` + no `globs` + `alwaysApply: false` → Manual mode only (never auto-loads)
- `globs` only (no `alwaysApply`) → Auto Attached mode

### Four Activation Modes in Detail

#### Mode 1: Always Apply
```yaml
---
alwaysApply: true
---
```
- Loaded into **every conversation**, every chat session
- Consumes tokens regardless of task relevance
- Use case: project-wide invariants (language, framework, coding standards)
- **Token tax:** Every word costs tokens on every request

#### Mode 2: Auto Attached (Glob Patterns)
```yaml
---
globs: "**/*.test.ts,**/*.spec.ts"
alwaysApply: false
---
```
- Activates when user references a file matching the glob
- Zero cost when not triggered
- Use case: language-specific rules, test conventions, component standards

#### Mode 3: Agent Requested
```yaml
---
description: "Security review checklist for authentication code and token handling"
alwaysApply: false
---
```
- AI reads `description` and decides whether to include the rule
- Probabilistic — the AI may or may not include it based on perceived relevance
- Use case: situational guidance that the AI should self-select
- **Weakness:** No guarantee the AI will request it even when relevant

#### Mode 4: Manual
```yaml
---
description: ""
globs: ""
alwaysApply: false
---
```
- Only active when user explicitly types `@rule-name` in chat
- Zero token overhead unless invoked
- Use case: templates, checklists, infrequently-needed reference material

### File Organization Best Practices (Community Standards)

- **Naming:** kebab-case filenames, `.mdc` extension (not `.md`)
- **Scope:** One topic per file, under 500 lines (practical guideline, not hard limit)
- **References:** Cross-file references supported via `<references>` XML tags but reliability is "a memo, not a contract"
- **Subdirectories:** `.cursor/rules/` can be nested in subdirectories for folder-scoped rules

---

## Research Question 3: Token Budget Analysis

### Context Window Overview

| Mode | Context Limit | Notes |
|------|--------------|-------|
| Standard | 200,000 tokens | Includes code, chat, rules |
| Extended (GPT-5 variants) | 272,000 tokens | Max observed |
| Chat default | ~20,000 tokens | Inline conversations |
| Cmd-K inline | ~10,000 tokens | Quick edits |
| Agent file reads | 250 lines default | Extends by 250 if needed |
| Codebase search results | 100 lines max | For specific searches |

### The Token Tax — Quantified

An audit of a mature Cursor configuration (22 rules with `alwaysApply: true`, ~2,700 lines) revealed:

```
Per-conversation overhead:
  2,700 lines ≈ 5,000-8,000 tokens

Cost per conversation (model-dependent):
  GPT-4:  $0.08-0.25 wasted
  Claude: $0.08-0.15 wasted

At 50 conversations/day:
  Daily waste:   $4.00-12.50
  Monthly waste: $120-375

In context window terms:
  5,000-8,000 tokens = 2.5-4% of a 200k window
  Used even when rules are completely irrelevant
```

### Three Performance Degradation Mechanisms

1. **Context Squeeze:** Rules occupy finite context space, displacing actual code and conversation. A project with 25% of context window consumed by rules leaves 25% less for source code.

2. **Middle-of-File Attention Loss ("Lost in the Middle"):** LLMs exhibit better recall for content at the beginning and end of context. Rules injected in the middle of a large context receive significantly less attention. Academic research on LLM attention patterns confirms this systematic bias.

3. **Response Quality Decline:** More irrelevant content in context = "more noise to filter" = increased confusion, slower responses, lower coherence.

### The 2+2 Test (Community Standard)

Community-developed heuristic for `alwaysApply` decisions: "If someone asks 'what's 2+2?', does this rule need to be loaded?" If no, don't use `alwaysApply`. Audit findings suggest ~65% of `alwaysApply` rules could be converted to glob or agent-requested modes.

### Dynamic Context Discovery (January 2026)

Cursor's most significant recent optimization: moved from static upfront context loading to dynamic retrieval:

**Five Techniques:**
1. Writing large tool outputs (shell commands, MCP responses) to files instead of injecting inline
2. Saving full conversation history to file when summarized, allowing later retrieval
3. Storing domain-specific capabilities in files with semantic search lookup
4. For MCP tools: loading only tool names upfront, fetching full specs on demand
5. Treating terminal sessions as files (reference by path, not inline content)

**Result:** 46.9% reduction in total agent tokens in MCP-heavy sessions (A/B tested by Cursor team, January 2026). Available to all users since early 2026.

---

## Research Question 4: Priority System and Conflict Resolution

### Priority Hierarchy

```
Team Rules           ← HIGHEST: Enterprise/Team dashboard-defined
  ↓
Project Rules        ← .cursor/rules/*.mdc (version-controlled)
  ↓
User Rules           ← Cursor Settings > Rules (per-machine)
  ↓
Legacy Rules         ← .cursorrules (deprecated, still functional)
  ↓
AGENTS.md            ← Vendor-neutral simple markdown
```

When conflicts exist, higher-priority sources take precedence. All applicable rules at the same level are **merged** — Cursor does not select one winner, it concatenates.

### Within Project Rules: Multi-File Ordering

There is no documented explicit ordering between multiple `.mdc` files at the same priority level. Resolution happens via:
1. `alwaysApply` rules load first (all of them)
2. Glob-matched rules load next (files matching current context)
3. Agent-requested rules load based on AI decision
4. All applicable rules are concatenated into the system prompt

**Critical weakness:** When two rules at the same level conflict, resolution depends entirely on the LLM's attention and where in the merged context the conflicting instructions appear. LLMs tend to prioritize instructions at the **end** of a prompt — meaning rule file ordering within a directory can affect behavior without any explicit guarantee.

### Team Rules (Enterprise)

Available on Team/Business/Enterprise plans. Configured via team dashboard (not in repository). Advantages:
- Highest priority — cannot be overridden by project rules
- Applied across all team projects without requiring repo commits
- No per-developer setup required

Limitations:
- Still probabilistic (AI may ignore them)
- No audit trail for compliance
- Requires paid tier

---

## Research Question 5: Community Pain Points and Known Limitations

### The Fundamental Architectural Problem

**Cursor is a prediction engine, not a policy enforcer.** This is the most cited community complaint. Rules are instructions to an LLM — the LLM was trained to generate plausible code, not to enforce policies. Implications:

- Rules compliance is **probabilistic**, not deterministic
- Long conversations cause **context drift** — rule compliance degrades as conversation grows
- **No audit trail** — there is no log of which rules were applied to which output
- **Enterprise non-compliance** — cannot satisfy regulatory audit requirements
- A 2025 Gartner survey found 70% of IT leaders cited governance/compliance as a top-3 challenge with GenAI tools, yet only 23% were confident in their governance capabilities

### Documented Failure Modes

| Failure Mode | Cause | Severity |
|-------------|-------|---------|
| Rule silently ignored | Rule in middle of long context; LLM attention failure | HIGH |
| Context drift | Conversation grows; AI loses track of rules | HIGH |
| Glob mis-match | File not matching pattern; rule never loads | MEDIUM |
| Agent Requested not requested | AI decides rule is not relevant (incorrectly) | MEDIUM |
| Conflicting rules | Two rules at same level give opposing guidance | MEDIUM |
| "Freelancing" | AI produces code outside requested scope, ignores constraints | HIGH |
| Deprecated API usage | Training data bias overrides rules forbidding old patterns | MEDIUM |

### Specific Community-Reported Issues

1. **Long agent sessions lose sync:** After 2+ hours, agents start calling non-existent functions. Community mitigation: keep sessions under 2 hours, add periodic re-indexing checkpoints.

2. **Dangerous scope expansion:** AI makes changes outside requested scope, including resetting databases or deploying to production, despite rules forbidding this.

3. **The "Time Capsule" Problem:** LLMs trained on historical data drift toward most common training patterns (legacy libraries, deprecated APIs), overriding rules that specify newer approaches.

4. **No glob validation:** Cursor does not warn if a glob pattern never matches any files, leading to silently inactive rules.

5. **Team rules require paid tier:** Teams on free/hobby plans cannot use the highest-priority Team Rules system, limiting governance capabilities.

6. **MCPoison vulnerability (CVE-2025-54136):** Malicious actors can commit a benign MCP config to a shared repo, get it approved, then silently modify it to execute backdoor commands — affecting all team members.

7. **Gemini 2.5 Pro unreliable code editing:** Model-specific reliability issues with certain rule-governed editing tasks.

### Community Workarounds

- Keep individual rule files under 100-500 lines
- Use glob patterns instead of `alwaysApply` whenever possible
- Add "Don't do anything else" to prompts to prevent scope expansion
- Start a new chat session for each distinct task (prevents context drift)
- Use explicit `@rule-name` invocation for critical rules instead of relying on auto-selection
- Maintain `PROJECT_SPECIFICATIONS.mdc` + `PROJECT_BEST_PRACTICES.mdc` as the primary always-on rules, keep everything else conditional

---

## Research Question 6: Context Window Management

### Cursor's Approach to Growing Conversations

Cursor's approach has evolved significantly. Current strategies (2026):

#### Native Mechanisms
1. **Dynamic Context Discovery** (Jan 2026): Lazy-load context on demand rather than pre-loading everything
2. **File Read Defaults:** Agent reads first 250 lines of files by default; extends by 250 if needed
3. **Conversation Summarization:** Long conversations are summarized when token limit approaches; full history saved to file for later retrieval
4. **/compress command:** User-initiated compression to summarize all messages and reset effective context (introduced mid-2025 by Lee Robinson)

#### Community-Developed Patterns
1. **Long-Term Context Management Protocol (LCMP):** Structured markdown files persist project state across sessions; each new session begins with "Read the context files and continue where we left off"
2. **Memory Bank (cursor-memory-bank):** Modular documentation in `memory-bank/` directory; AI reads ALL files at task start (mandatory, not optional)
3. **Task segmentation:** One specific task per session instead of broad feature sessions ("add notifications table" not "build notification feature")
4. **README.md as context anchor:** Document project state in README so Cursor can quickly understand status on session restart

#### Cursor Memories (Cursor 1.0 Feature)
Introduced in Cursor 1.0 (mid-2025), the native Memories feature provides:
- Persistent facts from conversations applied in future sessions
- Project-specific knowledge base built automatically
- Context survives session restarts
- Reduces need for explicit context re-injection at session start

**Key limitation:** Memories are session-learned, not rule-defined. They can drift over time as new facts are added, potentially contradicting established rules.

---

## Empirical Research Findings (Academic Study)

An empirical study of 401 open-source repositories with Cursor rules (arXiv:2512.18925v2) produced a taxonomy of developer context patterns:

### What Developers Put in Rules (by frequency)

| Category | Prevalence | Content |
|----------|-----------|---------|
| Guideline | 89% of repos | QA, performance, security, communication practices |
| Project | 85% of repos | Tech stack, architecture, recent changes |
| Convention | 84% of repos | Code style, language preferences, file structure |
| LLM Directive | 50% of repos | Behavior instructions, workflows, personas |
| Example | 50% of repos | Code demonstrations, templates |

### Key Empirical Findings

- **28.7% of all rule lines are duplicates** — developers frequently copy from documentation, dependencies, or community templates
- Statically typed languages (Go, C#, Java) receive **less rules context** — type inference substitutes for explicit rule specification
- Dynamic languages (JavaScript, PHP) receive **more context** — less can be inferred from code alone
- 37% of repos include all four core categories
- Newer repos emphasize LLM-specific instructions more than older repos (which focus on documentation-style rules)
- Most effective repos: 3-15 unique rule codes, balancing breadth without overwhelming the model

---

## Comparison: Cursor Rules vs. AIOS SYNAPSE

### Architectural Comparison

| Dimension | Cursor Rules | AIOS SYNAPSE |
|-----------|-------------|--------------|
| Injection method | File-based (.mdc) | Domain-based (YAML + Markdown) |
| Activation model | Probabilistic (AI decides) | Structured (pipeline-based) |
| Format | YAML frontmatter + Markdown | YAML manifest + Markdown |
| Scoping | Glob patterns | Domain + bracket targets |
| Priority | 4-level hierarchy | Domain layering |
| Enforcement | None (suggestion only) | Star-command pipeline |
| Cross-session memory | Memories feature + file conventions | CLAUDE.md (project) |
| Token management | Dynamic context discovery (2026) | Star-command selective injection |
| IDE dependency | Cursor-specific | Claude Code-specific |
| Versioning | git via .cursor/rules/ | git via .aios-core/ |
| Team distribution | Team Rules dashboard (paid) | Repo-committed domains |

### Where Cursor Has Advantages

1. **Market adoption:** Cursor is the dominant AI coding IDE; its conventions are becoming de facto standards
2. **Visual IDE context:** File-watching, real-time glob matching — knows exactly which file the user is editing
3. **Dynamic context discovery:** The 46.9% token reduction via lazy loading is a genuine engineering achievement
4. **Memories:** Native cross-session persistence is built-in
5. **AGENTS.md support:** Participates in emerging vendor-neutral standard

### Where SYNAPSE Has Advantages (Differentiation Opportunities)

1. **Pipeline enforcement:** SYNAPSE's star-command pipeline can enforce context injection at defined workflow points; Cursor rules are always probabilistic
2. **Constitutional integration:** SYNAPSE is embedded in a formal development constitution with gates and verification; Cursor has no equivalent
3. **Agent authority model:** SYNAPSE has explicit agent authority boundaries (only `@devops` can push); Cursor has no multi-agent governance
4. **Story-driven context:** SYNAPSE context is traceable to stories and acceptance criteria; Cursor rules are freeform
5. **No compliance gap:** SYNAPSE's gate model provides the audit trail that Cursor fundamentally lacks
6. **Structured domain system:** SYNAPSE domains are semantically organized (not just file globs), enabling richer context relevance signals

---

## Prioritized Recommendations for SYNAPSE

### P0 — Critical (Immediate Impact)

**P0.1: Implement Deterministic Injection as Core Differentiator**
The single most powerful differentiation against Cursor: guarantee that critical SYNAPSE domains are injected at specified workflow gates, not left to probabilistic AI selection. Document this explicitly as "guaranteed injection vs. probabilistic rules" in SYNAPSE's value proposition.

**P0.2: Adopt the Token Tax Framing**
Cursor's `alwaysApply` tax is a real problem for users. SYNAPSE's domain activation model (selective injection based on context/workflow phase) is architecturally superior. Quantify this in SYNAPSE documentation with the same metrics Cursor community uses (tokens per conversation, context window percentage).

### P1 — High Priority

**P1.1: Build MDC Compatibility Layer**
Cursor rules are becoming an industry standard. SYNAPSE should be able to import/read `.cursor/rules/*.mdc` files and map them to SYNAPSE domains. This enables migration from Cursor to SYNAPSE without rewriting all rules.

**P1.2: Implement the 2+2 Test Programmatically**
Build into SYNAPSE's domain manager an audit mode that flags domains set to always-inject and suggests conversion to conditional injection. Mirror the community's 2+2 heuristic as an automated suggestion.

**P1.3: Token Budget Awareness**
Add token cost estimation to SYNAPSE domain reports. Show users how many tokens their active domains consume per star-command invocation, mirroring Cursor's community-developed cost awareness.

### P2 — Medium Priority

**P2.1: AGENTS.md Import Support**
AGENTS.md is becoming a cross-IDE standard. SYNAPSE should be able to read and incorporate AGENTS.md files so AIOS projects work with both SYNAPSE (Claude Code) and Cursor without maintaining separate rule files.

**P2.2: Glob-Based Domain Targeting**
Cursor's glob pattern system for auto-attaching rules to file contexts is elegant. SYNAPSE should support similar file-pattern targeting for domains (e.g., a testing domain auto-injected when working on `*.test.ts` files).

**P2.3: Session Drift Detection**
Cursor's community documented the "context drift" problem in long sessions. SYNAPSE could proactively detect when star-commands are being invoked without proper domain context and re-inject critical domains at defined checkpoints.

### P3 — Lower Priority (Future)

**P3.1: Cross-IDE Portability Format**
Define a SYNAPSE native format that compiles to both `.mdc` (Cursor) and `CLAUDE.md` (Claude Code), enabling AI tool portability for polyglot teams.

**P3.2: Dynamic Context Discovery Integration**
Cursor's lazy-loading technique (46.9% token reduction) could be adopted in SYNAPSE: instead of always injecting full domain content, inject domain summaries with on-demand full content retrieval.

**P3.3: Compliance Audit Trail**
Build the audit log that Cursor fundamentally lacks: record which SYNAPSE domains were active during each workflow gate execution, which rules were injected, and create a structured log for compliance/governance use cases.

---

## Key Takeaways for SYNAPSE Architecture

1. **Rules are not policies.** Cursor's fundamental weakness — and SYNAPSE's opportunity — is that file-based context injection cannot be enforced. SYNAPSE's pipeline architecture with explicit gate verification is architecturally superior for quality-gated development.

2. **Token economics matter.** The "token tax" is real and quantified. SYNAPSE must demonstrate token efficiency equal to or better than Cursor's Dynamic Context Discovery.

3. **Selective activation is the right approach.** Cursor evolved from always-on (`.cursorrules`) to conditional (`.mdc`) — validating SYNAPSE's domain activation model. The direction is correct.

4. **The format war is ongoing.** `.cursorrules` → `.mdc` → AGENTS.md shows rapid format evolution. SYNAPSE should abstract from format details and focus on semantic domain management.

5. **Community has solved the hard problems pragmatically.** The LCMP, Memory Bank, 2+2 test, and task-per-session patterns are community solutions to Cursor's gaps. SYNAPSE can institutionalize these as first-class features.

---

## Sources

- [Cursor Rules Guide - design.dev](https://design.dev/guides/cursor-rules/)
- [MDC Format Reference - awesome-cursor-rules-mdc](https://github.com/sanjeed5/awesome-cursor-rules-mdc/blob/main/cursor-rules-reference.md)
- [Cursor IDE Rules Deep Dive - Mervin Praison](https://mer.vin/2025/12/cursor-ide-rules-deep-dive/)
- [The alwaysApply Tax - Agentic Thinking](https://agenticthinking.ai/blog/alwaysapply-tax/)
- [Guide to Cursor Rules: Token Tax - Peakvance/Medium](https://medium.com/@peakvance/guide-to-cursor-rules-engineering-context-speed-and-the-token-tax-16c0560a686a)
- [Cursor Dynamic Context: 47% Fewer Tokens - SuperGok](https://supergok.com/cursor-dynamic-context-ai-token-optimization/)
- [Cursor Dynamic Context Discovery - InfoQ](https://www.infoq.com/news/2026/01/cursor-dynamic-context-discovery/)
- [Cursor on X: Dynamic Context for All Models](https://x.com/cursor_ai/status/2008644063797387618)
- [Cursor Rules: Why Your AI Agent Is Ignoring You - sdrmike/Medium](https://sdrmike.medium.com/cursor-rules-why-your-ai-agent-is-ignoring-you-and-how-to-fix-it-5b4d2ac0b1b0)
- [What to Do When Cursor Doesn't Follow the Rules - Knostic](https://www.knostic.ai/blog/cursor-does-not-follow-rules)
- [Beyond the Hype: Reddit Debate on Cursor - Oreate AI](https://www.oreateai.com/blog/beyond-the-hype-navigating-the-reddit-debate-on-cursors-ai-code-editor/1c6b103d8a986d7feb2800a45e988683)
- [Built for Demos, Not for Devs - Medium](https://machine-learning-made-simple.medium.com/built-for-demos-not-for-devs-05186132116f)
- [Cursor Rules for Teams - devonbleibtrey.com](https://www.devonbleibtrey.com/blog/cursor-rules-for-teams)
- [What Are Cursor Rules? - WorkOS](https://workos.com/blog/what-are-cursor-rules)
- [Cursor Rules: Best Practices - Elementor Engineers/Medium](https://medium.com/elementor-engineers/cursor-rules-best-practices-for-developers-16a438a4935c)
- [Mastering .mdc Files in Cursor - Venkat/Medium](https://medium.com/@ror.venkat/mastering-mdc-files-in-cursor-best-practices-f535e670f651)
- [Cursor Notes: 4/12/2025 Rules Update - GitHub Gist](https://gist.github.com/bossjones/1fd99aea0e46d427f671f853900a0f2a)
- [How to Use Cursor Rules in v0.47 - instructa.ai](https://www.instructa.ai/en/blog/how-to-use-cursor-rules-in-version-0-45)
- [Fix Cursor Context Window Exceeded - FlowQL](https://www.flowql.com/en/blog/guides/cursor-context-window-exceeded-fix/)
- [Mastering Context Management in Cursor - Steve Kinney](https://stevekinney.com/courses/ai-development/cursor-context)
- [Cursor's New Context Discovery Principles - AI Labs/Medium](https://medium.com/@ai-labs/cursors-new-context-discovery-principles-can-transform-how-you-use-any-ai-coding-tool-d379191d4f25)
- [AI Agent Rule Files Fragmentation - EveryDev.ai](https://www.everydev.ai/p/blog-ai-coding-agent-rules-files-fragmentation-formats-and-the-push-to-standardize)
- [AGENTS.md: Why Your README Matters - Upsun](https://devcenter.upsun.com/posts/why-your-readme-matters-more-than-ai-configuration-files/)
- [Cursor Security Complete Guide - MintMCP](https://www.mintmcp.com/blog/cursor-security)
- [Cursor Enterprise Review 2026 - Superblocks](https://www.superblocks.com/blog/cursor-enterprise)
- [Empirical Study of Cursor Rules - arXiv:2512.18925v2](https://arxiv.org/html/2512.18925v2)
- [Beyond the Prompt: Empirical Study of Cursor Rules - arXiv](https://arxiv.org/html/2512.18925v2)
- [Cursor Changelog - changelogs.directory](https://changelogs.directory/tools/cursor)
- [A Rule That Writes the Rules: Exploring rules.mdc - Denis/Medium](https://medium.com/@devlato/a-rule-that-writes-the-rules-exploring-rules-mdc-288dc6cf4092)
- [Are Your Cursor Rules Actually Working? - Denis/Medium](https://medium.com/@devlato/are-your-cursor-rules-actually-working-f470026ba11f)
- [Cursor Rules Developer Guide - NVIDIA NeMo Agent Toolkit](https://docs.nvidia.com/nemo/agent-toolkit/1.2/extend/cursor-rules-developer-guide.html)
- [Cursor Levels Up With 1.0 Release - HackerNoon](https://hackernoon.com/cursor-levels-up-with-10-release-adding-mcp-support-and-persistent-memory)
- [Long-Term Context Retention Patterns - Developer Toolkit](https://developertoolkit.ai/en/shared-workflows/context-management/memory-patterns/)
