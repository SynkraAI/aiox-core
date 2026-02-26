# A5: AI Coding Assistant Memory Architecture -- Research Report

**Date:** 2026-02-21
**Researcher:** Atlas (AIOS Analyst Agent)
**Confidence Level:** HIGH (8/10) -- based on official docs, open-source repos, and published research
**Scope:** Memory systems in AI coding assistants and LLM agent memory architectures

---

## Executive Summary

AI coding assistants have converged on a **file-based, hierarchical memory architecture** as the dominant pattern for persistent context across sessions. The field divides into two tiers:

1. **Instruction Memory** (human-authored rules): `.cursorrules`, `CLAUDE.md`, `AGENTS.md`, `CONVENTIONS.md` -- static files that tell the AI how to behave.
2. **Auto Memory** (AI-authored learnings): Claude Code's `MEMORY.md`, GitHub Copilot's repository-scoped memories, Codex's session rollouts -- dynamic content the AI generates and consumes.

The most sophisticated systems (Letta/MemGPT, Mem0) implement a **tiered memory hierarchy** inspired by operating systems: in-context "RAM" (core memory blocks) and out-of-context "disk" (archival/recall memory accessed via search tools). The key engineering challenge is **token budget allocation** -- research consistently shows that smaller, intelligently-retrieved context outperforms large context dumps.

**Key finding for AIOS:** Our current 500ms-budget file-based Memory Loader is architecturally aligned with industry practice. The primary upgrade path is adding **semantic retrieval** (vector search over memory entries) and **memory self-editing** (agents write their own memories), both of which Claude Code and Copilot have shipped in production.

---

## 1. Claude Code -- Auto Memory System

### Architecture

Claude Code implements a **two-layer memory system**:

| Layer | Type | Location | Loaded | Editable By |
|-------|------|----------|--------|-------------|
| CLAUDE.md files | Instruction memory | Project root, `~/.claude/`, `.claude/rules/` | Full content at startup | Human |
| Auto Memory | AI-authored notes | `~/.claude/projects/<project>/memory/` | First 200 lines of `MEMORY.md` | AI + Human |

### How Auto Memory Works

- **Storage:** Each project gets its own memory directory derived from the git repository root. All subdirectories within the same repo share one auto memory directory. Git worktrees get separate directories.
- **Structure:**
  ```
  ~/.claude/projects/<project>/memory/
  +-- MEMORY.md          # Concise index (first 200 lines loaded)
  +-- debugging.md       # Topic-specific detailed notes
  +-- api-conventions.md # More detailed notes
  +-- ...
  ```
- **Loading:** The first 200 lines of `MEMORY.md` are injected into the **system prompt** at session start. Topic files are read on-demand during the session using standard file tools.
- **Writing:** Claude reads and writes memory files during sessions. Users can also explicitly ask: "remember that we use pnpm, not npm".
- **What gets saved:** Project patterns, build commands, debugging insights, architecture notes, user preferences, code style conventions.

### Hierarchical Rule Loading

Claude Code loads `CLAUDE.md` files recursively from cwd upward (excluding root `/`). Child directory CLAUDE.md files are loaded on-demand only when Claude reads files in those subtrees. Rules in `.claude/rules/*.md` support path-scoped activation via glob patterns in YAML frontmatter.

### Token Budget Strategy

- `MEMORY.md`: Hard cap at 200 lines for auto-loaded content
- `CLAUDE.md` files: Full content loaded (no documented limit)
- `.claude/rules/`: Conditional loading based on file paths being accessed
- Import system: `@path/to/file` syntax with max depth of 5 hops

### Key Design Decisions

1. **Plain markdown** -- no database, no vector store, no special format
2. **Index + topic files** pattern -- keeps the auto-loaded portion small
3. **AI self-management** -- Claude decides what to remember and how to organize
4. **Git-repo scoping** -- memory is tied to repository, not directory

**Source:** [Claude Code Memory Documentation](https://code.claude.com/docs/en/memory)

---

## 2. Cursor -- Rules + Community Memory Banks

### Architecture

Cursor does **NOT** have native persistent memory across sessions. Instead, it relies on:

| Mechanism | Type | Location | Persistence |
|-----------|------|----------|-------------|
| `.cursor/rules/*.mdc` | Instruction rules | Project root | File-based, version-controlled |
| `.cursorrules` (deprecated) | Legacy rules | Project root | File-based |
| Memory Bank (community) | Project state docs | `memory-bank/` directory | File-based, AI-managed |

### Rules System

- Rules are stored as `.mdc` files in `.cursor/rules/` directory
- Rules provide persistent, reusable context included at the **start of model context**
- Path-scoped rules supported (similar to Claude Code)
- Version 0.7 introduced hierarchical rule loading with ~70% token reduction through lazy-loading

### Community Memory Bank Pattern

Since Cursor lacks native memory, the community built the **Cursor Memory Bank** pattern:
- A `memory-bank/` directory with structured markdown files
- Custom modes (VAN, PLAN, CREATIVE, IMPLEMENT) read from and update the bank
- Each mode updates specific files after completing features
- Next session loads the bank for continuity

### MCP-Based Memory Extensions

- **Graphiti MCP:** Graph-based memory using Zep, persisting preferences and procedures across sessions
- **Basic Memory MCP:** Persistent context through Model Context Protocol integration
- **Claude-mem:** Compression system that captures tool usage, compresses with AI, and injects into future sessions

### Token Optimization

Cursor's token optimization strategy includes:
- Initial load of essential rules only
- Specialized lazy-loading for detailed rules
- Rule contents injected at prompt start, not system prompt

**Sources:** [Cursor Memory Bank](https://github.com/vanzan01/cursor-memory-bank), [Lullabot Guide](https://www.lullabot.com/articles/supercharge-your-ai-coding-cursor-rules-and-memory-banks)

---

## 3. GitHub Copilot -- Repository-Scoped Agentic Memory

### Architecture (2026, Early Access)

GitHub Copilot recently shipped a **repository-scoped memory feature** that represents the most sophisticated production memory system in the market:

| Aspect | Detail |
|--------|--------|
| **Scope** | Repository-level (not user-level) |
| **Creation** | AI-deduced from Copilot operations |
| **Storage** | Server-side, GitHub-managed |
| **Validation** | Citation-based: each memory has code location references |
| **TTL** | Auto-deleted after 28 days; reuse extends lifetime |
| **Access** | All repo collaborators with Copilot Memory enabled |

### How Memories Work

1. **Creation:** As Copilot works (coding agent, code review, CLI), it deduces "tightly scoped pieces of information" about the repository.
2. **Citation attachment:** Each memory stores references to specific code locations that support it.
3. **Validation on use:** When Copilot finds a potentially relevant memory, it checks citations against the current codebase and branch. Memory is only used if successfully validated.
4. **Cross-component sharing:** A memory created by the coding agent can be used by code review, and vice versa.

### Key Design Decisions

1. **Repository-scoped, not user-scoped** -- treats codebases as long-lived entities with multiple contributors
2. **Citation-based validation** -- prevents stale memories from degrading performance
3. **28-day TTL with renewal** -- automatic garbage collection for unused memories
4. **Server-side storage** -- no local files, centralized for all collaborators
5. **Disabled by default** -- requires explicit enablement at enterprise/org/personal level

### Copilot CLI Session State

Separate from agentic memory, Copilot CLI manages session state:
- Sessions stored in `~/.copilot/session-state`
- Large tool outputs written to disk rather than in-memory
- Decoupled session storage from timeline display

**Sources:** [GitHub Copilot Memory Docs](https://docs.github.com/en/copilot/concepts/agents/copilot-memory), [Visual Studio Blog](https://devblogs.microsoft.com/visualstudio/copilot-memories/)

---

## 4. OpenAI Codex CLI -- AGENTS.md + Session Rollouts

### Architecture

Codex CLI implements a **two-layer approach**:

| Layer | Mechanism | Persistence |
|-------|-----------|-------------|
| Instruction memory | `AGENTS.md` files (hierarchical) | Permanent, human-authored |
| Session memory | JSONL rollout files | Client-side, resumable |

### AGENTS.md System

- **Three-level hierarchy:** Global (`~/.codex/AGENTS.md`), Project (`./AGENTS.md`), Subdirectory
- **Override mechanism:** `AGENTS.override.md` at each level; later overrides earlier
- **Max size:** 32 KiB default (configurable via `project_doc_max_bytes`)
- **Discovery:** Global scope first, then project scope walks from repo root to cwd, then per-directory

### Session Persistence

- **ConversationHistory:** In-memory structure of `ResponseItem` objects consulted every turn
- **RolloutRecorder:** Writes JSONL files to `~/.codex/sessions/` with full session transcript
- **Resume/Fork:** Sessions can be resumed (keeping full transcript + plan history) or forked
- **Auto-compaction:** When conversation history grows too large, triggers compaction replacing verbose history with concise summary. Threshold configured via `model_auto_compact_token_limit`

### Key Design Decisions

1. **Client-side only** -- no server-side persistence, full local control
2. **JSONL format** -- append-only, efficient for streaming writes
3. **Explicit compaction** -- automatic summarization when context exceeds threshold
4. **Markdown instructions** -- same pattern as Claude Code (plain files, hierarchical)

**Sources:** [Codex CLI Memory Deep Dive](https://mer.vin/2025/12/openai-codex-cli-memory-deep-dive/), [Codex CLI Features](https://developers.openai.com/codex/cli/features/)

---

## 5. Aider -- Repository Map + Conventions

### Architecture

Aider takes a fundamentally different approach, focusing on **intelligent code context** rather than persistent memory:

| Mechanism | Purpose | Token Budget |
|-----------|---------|-------------|
| Repository Map | Codebase structure awareness | 1k tokens default (`--map-tokens`) |
| `CONVENTIONS.md` | Coding standards | Loaded via `--read` flag, cached if prompt caching enabled |
| `.aider.conf.yml` | Persistent configuration | N/A (config, not context) |

### Repository Map (Core Innovation)

- Uses **tree-sitter** to parse the entire git repository
- Builds a **graph** where files are nodes and dependency relationships are edges
- Applies **graph ranking algorithm** to identify the most-referenced symbols
- Dynamically adjusts map size based on chat state
- Includes only "the most important identifiers, the ones which are most often referenced by other portions of the code"
- Default token budget: 1k tokens, configurable via `--map-tokens`

### Conventions System

- `CONVENTIONS.md` file loaded as read-only context
- Marked as cacheable for prompt caching optimization
- Can be permanently configured in `.aider.conf.yml`
- Forwarded to the LLM as coding standards context

### Key Design Decisions

1. **No persistent AI memory** -- focuses on code understanding, not learned preferences
2. **Graph-based retrieval** -- intelligent selection of what to include in context
3. **Dynamic budget** -- map expands when no files are in chat, shrinks when files are added
4. **Read-only conventions** -- human-authored, never AI-modified

**Sources:** [Aider Repository Map](https://aider.chat/docs/repomap.html), [Aider Conventions](https://aider.chat/docs/usage/conventions.html)

---

## 6. LLM Agent Memory Architectures (Academic/Framework)

### Letta/MemGPT -- OS-Inspired Tiered Memory

The most influential memory architecture, drawing from operating system virtual memory:

```
+--------------------------------------------+
|           CONTEXT WINDOW ("RAM")           |
|  +--------------------------------------+  |
|  | System Prompt + Persona              |  |
|  +--------------------------------------+  |
|  | Core Memory Blocks (self-editable)   |  |
|  |  - human: user info                  |  |
|  |  - persona: agent personality        |  |
|  |  - task: current objective           |  |
|  +--------------------------------------+  |
|  | Message Buffer (recent messages)     |  |
|  +--------------------------------------+  |
+--------------------------------------------+
           |              |
     (search tools)  (write tools)
           |              |
+--------------------------------------------+
|        EXTERNAL STORAGE ("DISK")           |
|  +------------------+  +----------------+  |
|  | Recall Memory    |  | Archival Memory|  |
|  | (conversation    |  | (processed,    |  |
|  |  history search) |  |  indexed facts) |  |
|  +------------------+  +----------------+  |
+--------------------------------------------+
```

**Key mechanisms:**
- **Core memory blocks:** Pinned in-context, self-editable by the agent via tools (`memory_replace`, `memory_insert`, `memory_rethink`)
- **Recall memory:** Complete conversation history, searchable by text and date
- **Archival memory:** Processed knowledge in vector/graph databases
- **Eviction + summarization:** Recursive summarization compresses older messages when context fills
- **Sleep-time agents:** Asynchronous memory refinement during idle periods

**Source:** [Letta Agent Memory](https://www.letta.com/blog/agent-memory), [MemGPT Paper](https://arxiv.org/abs/2310.08560)

### Mem0 -- Hybrid Memory Layer

Production-ready memory system combining three storage technologies:

| Store | Technology | Purpose |
|-------|-----------|---------|
| Vector DB | Qdrant, Chroma, etc. | Semantic similarity search |
| Graph DB | Neo4j, Memgraph, Neptune | Relationship modeling |
| Key-Value Store | ElastiCache, Redis | Fast fact retrieval |

**Pipeline:**
1. **Extraction Phase:** Ingests latest exchange + rolling summary + recent messages; LLM extracts candidate memories
2. **Update Phase:** Deduplicates against existing memories; stores only novel/updated facts
3. **Retrieval:** Semantic search over embeddings + graph traversal for related entities

**Performance:** 91% lower p95 latency vs naive approaches, 90%+ token cost savings, 26% accuracy improvement.

**Source:** [Mem0 Research Paper](https://arxiv.org/abs/2504.19413), [Mem0 GitHub](https://github.com/mem0ai/mem0)

### Four-Type Cognitive Memory Model

Academic research identifies four memory types for LLM agents:

| Type | Analog | Implementation | Persistence |
|------|--------|---------------|-------------|
| **Working Memory** | Current focus | Context window, recent messages | Session only |
| **Episodic Memory** | Personal experiences | Timestamped interaction logs, indexed | Long-term |
| **Semantic Memory** | General knowledge | RAG over docs, vector DB, knowledge graphs | Long-term |
| **Procedural Memory** | Skills/habits | Tool definitions, learned workflows, rules | Long-term |

**Key insight from research:** "The primary mechanism of lifelong learning is the continuous consolidation of episodic experience into semantic assets." Episodic memories (raw experiences) are distilled into semantic knowledge (generalized patterns) over time.

**Sources:** [Agent Memory Paper List](https://github.com/Shichun-Liu/Agent-Memory-Paper-List), [Episodic Memory for Long-Term Agents](https://arxiv.org/pdf/2502.06975)

---

## 7. Token Budget Strategy for Memory Injection

### Industry Consensus

Research and production systems consistently show that **quality of context beats quantity**:

> "Optimized context windows with smart retrieval beat massive context dumps across every dimension -- faster response times, higher accuracy, lower hallucination rates, better cost efficiency." -- Augment Code

### Practical Budget Allocation

| System | Memory Budget | Total Context | Ratio |
|--------|--------------|---------------|-------|
| Claude Code Auto Memory | ~200 lines (~2-4k tokens) | 200k tokens | ~1-2% |
| Aider Repo Map | 1k tokens default | 200k tokens | ~0.5% |
| Codex AGENTS.md | 32 KiB max (~8k tokens) | 200k tokens | ~4% |
| Cursor Rules | Hierarchical, lazy-loaded | 200k tokens | ~2-5% estimated |

### Optimization Techniques Used in Production

1. **Hierarchical loading:** Load index/summary first, detail on demand (Claude Code, Cursor)
2. **Graph-based retrieval:** Use dependency graphs to select most relevant context (Aider)
3. **Citation validation:** Check if memory is still relevant before injecting (GitHub Copilot)
4. **Auto-compaction:** Summarize when context exceeds threshold (Codex CLI)
5. **Conditional rules:** Only load rules matching current file paths (Claude Code, Cursor)
6. **TTL with renewal:** Auto-expire unused memories (GitHub Copilot -- 28 days)
7. **Tiered storage:** Keep essentials in-context, retrieve details on demand (Letta/MemGPT)

### Recommended Budget Split

Based on production systems analysis:

```
Total Context Budget: 100%
  +-- System prompt + instructions:     10-15%
  +-- Memory (persistent context):       2-5%    <-- sweet spot
  +-- Current task/conversation:        60-70%
  +-- Code context (files, diffs):      15-25%
  +-- Buffer/safety margin:              5%
```

**Source:** [Augment Code Context Window Analysis](https://www.augmentcode.com/tools/context-window-wars-200k-vs-1m-token-strategies)

---

## Relevance to AIOS

### Current State (Memory Loader)

The AIOS Memory Loader operates within a 500ms budget and uses file-based retrieval to load agent-specific memories. This is architecturally aligned with the dominant industry pattern (plain markdown files, hierarchical loading).

### Gap Analysis

| Capability | Industry State-of-Art | AIOS Current | Gap |
|-----------|----------------------|--------------|-----|
| Static instruction files | Universal (CLAUDE.md, AGENTS.md, .cursorrules) | Yes (agent YAML, CLAUDE.md, rules/) | None |
| AI self-authored memory | Claude Code, Copilot | Basic file retrieval | Medium |
| Semantic retrieval | Mem0, Letta, Aider repo-map | None | High |
| Memory validation/TTL | Copilot citations + 28d TTL | None | Medium |
| Cross-agent memory sharing | Copilot (cross-component) | Shared via file system | Low |
| Auto-compaction | Codex CLI | None | Low |
| Graph-based memory | Mem0, Letta, Graphiti | None | High (future) |
| Token budget management | All systems (2-5% allocation) | Implicit (500ms time budget) | Medium |

### Alignment with AIOS Architecture

The AIOS agent system already has several memory-adjacent features:

1. **Agent YAML definitions** = Procedural memory (how agents behave)
2. **Gotchas.json** = Episodic memory (learned pitfalls)
3. **Entity Registry** = Semantic memory (project knowledge graph)
4. **Decision logs** = Episodic memory (past decisions)
5. **Agent auto-memory directory** = Per-agent AI-authored memory (already scaffolded)

---

## Recommendations

### R1: Adopt the Index + Topic Files Pattern (SHORT-TERM, Low Effort)

Follow Claude Code's proven pattern for the Memory Loader:
- Load a concise `MEMORY.md` index per agent (cap at 150-200 lines)
- Topic files loaded on-demand, not at startup
- This fits within the 500ms budget easily

### R2: Implement Agent Self-Authoring Memory (SHORT-TERM, Medium Effort)

Allow agents to write to their own memory directory:
- After completing stories or encountering gotchas, agents save learnings
- Memory entries should be structured (category, confidence, date, source)
- Implement simple deduplication (check for similar entries before writing)

### R3: Add Token Budget Awareness (SHORT-TERM, Low Effort)

Convert the 500ms time budget into a **token budget**:
- Target 2-5% of total context for memory injection
- For 200k context models: 4,000-10,000 tokens for memory
- Prioritize: agent-specific > project-wide > global memories
- Count tokens before injection, truncate if over budget

### R4: Implement Memory Validation (MEDIUM-TERM, Medium Effort)

Adopt Copilot's citation-validation pattern:
- Each memory entry references the files/code that generated it
- Before injection, verify referenced files still exist and are relevant
- Auto-expire memories older than 30 days unless revalidated

### R5: Add Semantic Retrieval (MEDIUM-TERM, High Effort)

Move beyond filename-based retrieval to semantic search:
- Embed memory entries using a lightweight embedding model
- At load time, embed the current task/query and retrieve top-k relevant memories
- Could use local vector store (LanceDB) to stay within 500ms budget
- This is the single highest-impact upgrade for memory quality

### R6: Explore Graph Memory for Entity Registry (LONG-TERM, High Effort)

The Entity Registry already functions as a lightweight knowledge graph. Consider:
- Mem0-style hybrid storage (vector + graph + key-value)
- Entity relationships as graph edges for traversal-based retrieval
- This would enable questions like "what entities are affected by this change?"

### Priority Matrix

| Recommendation | Impact | Effort | Timeline |
|---------------|--------|--------|----------|
| R1: Index + Topic Files | High | Low | Sprint 1 |
| R2: Agent Self-Authoring | High | Medium | Sprint 1-2 |
| R3: Token Budget | Medium | Low | Sprint 1 |
| R4: Memory Validation | Medium | Medium | Sprint 2-3 |
| R5: Semantic Retrieval | Very High | High | Sprint 3-4 |
| R6: Graph Memory | High | Very High | Future epic |

---

## Appendix: Comparison Matrix

| Feature | Claude Code | Cursor | Copilot | Codex CLI | Aider | Letta/MemGPT | Mem0 |
|---------|------------|--------|---------|-----------|-------|-------------|------|
| Instruction files | CLAUDE.md + rules/ | .cursor/rules/*.mdc | copilot-instructions.md | AGENTS.md | CONVENTIONS.md | System prompt | -- |
| AI auto-memory | MEMORY.md | No (community banks) | Repo-scoped memories | Session rollouts | No | Core memory blocks | Extracted memories |
| Memory scope | Per-repo | Per-project | Per-repo | Per-session + global | Per-session | Per-agent | Per-user/session |
| Storage | Local files | Local files | Server-side | Local JSONL | None | DB (postgres) | Vector + Graph + KV |
| Retrieval method | File read | Rule injection | Citation validation | Session resume | Graph ranking | Tool-based search | Semantic + graph |
| Token management | 200-line cap | Lazy loading | Server-managed | Auto-compaction | 1k map budget | Context window mgmt | Extraction pipeline |
| Self-editing | Yes | No | Yes (AI-deduced) | No | No | Yes (tools) | Yes (pipeline) |
| TTL/Expiry | Manual | Manual | 28 days | Manual | N/A | Manual | Configurable |
| Open source | No | No | No | Yes | Yes | Yes | Yes |

---

## Sources

- [Claude Code Memory Documentation](https://code.claude.com/docs/en/memory)
- [GitHub Copilot Memory Docs](https://docs.github.com/en/copilot/concepts/agents/copilot-memory)
- [Visual Studio Blog: Copilot Memories](https://devblogs.microsoft.com/visualstudio/copilot-memories/)
- [Codex CLI Memory Deep Dive](https://mer.vin/2025/12/openai-codex-cli-memory-deep-dive/)
- [Codex CLI Features](https://developers.openai.com/codex/cli/features/)
- [Aider Repository Map](https://aider.chat/docs/repomap.html)
- [Aider Conventions](https://aider.chat/docs/usage/conventions.html)
- [Cursor Memory Bank](https://github.com/vanzan01/cursor-memory-bank)
- [Letta Agent Memory](https://www.letta.com/blog/agent-memory)
- [MemGPT Paper](https://arxiv.org/abs/2310.08560)
- [Mem0 Research Paper](https://arxiv.org/abs/2504.19413)
- [Mem0 GitHub](https://github.com/mem0ai/mem0)
- [Agent Memory Paper List](https://github.com/Shichun-Liu/Agent-Memory-Paper-List)
- [Episodic Memory for Long-Term Agents](https://arxiv.org/pdf/2502.06975)
- [Augment Code Context Window Analysis](https://www.augmentcode.com/tools/context-window-wars-200k-vs-1m-token-strategies)
- [Graphiti MCP for Cursor](https://blog.getzep.com/cursor-adding-memory-with-graphiti-mcp/)
- [Aider-Desk Project](https://github.com/hotovo/aider-desk)
- [GitHub Copilot CLI Updates](https://winbuzzer.com/2026/01/16/github-copilot-cli-gains-specialized-agents-parallel-execution-and-smarter-context-management-xcxwbn/)
