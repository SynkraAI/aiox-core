# C5 — Memory Bridge: Long-Term Memory Systems Research

**Story:** NOG-9 — UAP & SYNAPSE Deep Research
**Wave:** 3 — SYNAPSE Core
**Component:** C5 — Memory Bridge (SYN-10)
**Researcher:** Tech Search Agent
**Date:** 2026-02-21
**Status:** Complete

---

## Executive Summary

The LLM long-term memory space has matured dramatically in 2025-2026. The field has moved from naive RAG (Retrieval-Augmented Generation) toward hybrid retrieval architectures combining vector similarity search, knowledge graphs, and keyword (BM25) methods. Production leaders — Mem0, Zep, MemGPT/Letta, LangMem, GitHub Copilot's agentic memory, and the community-built Cursor Memory Bank — each represent different trade-offs between retrieval speed, accuracy, freshness, and complexity.

For the AIOS Memory Bridge (SYN-10), the **critical constraint is the 15ms timeout**. This fundamentally shapes which retrieval architectures are viable. The research confirms that in-process vector search (HNSW/FAISS) against a local index is the only general-purpose approach that reliably fits within 15ms. Network-bound systems (Redis at 24.6ms median, Pinecone at 7ms p99 but with network overhead) are generally too slow. The Cursor/Cline Memory Bank's markdown-file pattern, however, may be directly applicable as a zero-latency local supplement.

---

## Research Findings

### RQ1: State-of-the-Art LLM Long-Term Memory Systems (2025-2026)

#### The Memory Taxonomy

Academic consensus (arxiv:2512.13564, "Memory in the Age of AI Agents") classifies agent memory into four types:

| Type | Description | Example in production |
|------|-------------|----------------------|
| **Semantic** | General facts and knowledge | User preferences, project conventions |
| **Episodic** | Past interaction records | Previous conversation summaries |
| **Procedural** | Behavioral patterns and rules | How to commit, how to run tests |
| **Working** | Current context window contents | Active prompt tokens |

#### Key Systems

**Mem0** (production leader as of 2025-2026):
- Selective fact extraction from conversations using an LLM extraction pass
- Dual-store: vector store for semantic retrieval + graph store for relational memory (Mem0g variant)
- Benchmark results: 66.9% accuracy (vs 52.9% OpenAI baseline) on LOCOMO; Mem0g reaches 68.4%
- Latency: 0.71s median, 1.44s p95 end-to-end (extraction + retrieval combined)
- 91% lower p95 latency vs full-context methods; 90% fewer tokens (~1.8K vs ~26K tokens)
- Architecture: extraction pipeline runs asynchronously post-conversation; retrieval is synchronous at query time

**MemGPT / Letta** (research pioneer, now production platform):
- Operating-system metaphor: context window = RAM, external storage = disk
- Two-tier memory: in-context "core memory blocks" + out-of-context archival/recall storage
- Memory management via explicit tool calls: `memory_replace`, `archival_memory_insert`, `archival_memory_search`
- Self-managed write-back: agent decides at ~70% context fill to page out content
- Multi-agent memory sharing: agents share memory blocks via `block_id` references (Letta extension)
- 2026 update: Letta is introducing Context Repositories with git-based versioning
- Limitation: every memory operation burns context tokens on the tool call itself

**Zep** (temporal knowledge graph, best for relational/enterprise memory):
- Core engine: Graphiti — a temporally-aware knowledge graph G = (N, E, phi)
- Three-tier graph: episode subgraph + semantic entity subgraph + community subgraph
- Bi-temporal data model: tracks T' (transaction time) and T (event time) separately
- Hybrid retrieval: cosine semantic similarity + BM25 full-text search (via Neo4j/Lucene) + breadth-first graph traversal
- Reranking: Reciprocal Rank Fusion, Maximal Marginal Relevance, cross-encoder LLM scoring
- Benchmark: 94.8% on DMR (vs MemGPT's 93.4%); 18.5% improvement on LongMemEval
- Latency: 90% reduction vs full-context (2.58-3.20s vs 28.9-31.3s baseline)
- Token efficiency: 1.6K tokens vs 115K baseline context
- Weakness: background graph construction involves multiple async LLM calls; initial queries may miss recent facts until processing completes

**LangMem** (LangChain's SDK, flexible framework):
- Three memory types: Semantic (facts), Episodic (past interactions), Procedural (behaviors)
- Two storage forms: Collections (individual docs, semantic search) vs Profiles (single schema doc)
- Two processing modes: Active (hot path, adds perceptible latency) vs Background (subconscious, post-conversation)
- Storage-agnostic: works with any backend via LangGraph BaseStore or custom stores
- Retrieval: direct key lookup + semantic similarity search + metadata filtering
- Prompt optimization: metaprompt, gradient, and simple prompt_memory algorithms for updating procedural memory

**EM-LLM** (Episodic Memory for LLMs — research, not yet production):
- Integrates human episodic memory and event cognition into LLMs with no fine-tuning
- Claims to surpass full-context models on most benchmarks across up to 10M token retrieval windows

**Industry trend direction (2025-2026):**
- Classical RAG is declining as a default; long-context models + selective memory are ascending
- Autonomous memory orchestration (agents decide what to store, when to retrieve) is replacing developer-managed RAG
- Knowledge graph usage for relational reasoning is standard in enterprise systems
- Multi-agent memory sharing is an active focus (shared block architectures)

---

### RQ2: GitHub Copilot Agentic Memory

Source: [GitHub Docs — About agentic memory](https://docs.github.com/en/copilot/concepts/agents/copilot-memory)

#### Architecture

Copilot's agentic memory is a **citation-validated, repository-scoped, auto-expiring knowledge store** built on top of Copilot's PR and code review workflows.

**Memory Creation:**
- Generated automatically in response to Copilot activity on repositories where the user has write permissions
- Triggered by: coding agent task completion, code review analysis, CLI operations on pull requests
- Memories represent "tightly scoped pieces of knowledge" discovered during these activities

**Citation System (the key innovation):**
- Each memory is stored with citations — references to specific code locations that support the memory
- Before using a memory, Copilot validates the citations against the current codebase AND the current branch
- If citations are stale (code moved/deleted), the memory is rejected, not injected
- This is a lightweight form of automatic staleness detection: if the code backing a memory no longer exists as cited, the memory is discarded

**Expiration Policy:**
- Memories automatically delete after 28 days
- If a memory is validated and used during that window, a new memory with the same details may be stored, effectively resetting the 28-day timer
- This creates a "usage-based longevity" system: frequently validated memories persist; dormant ones expire

**Sharing Scope:**
- Repository-scoped, not user-scoped — ALL users with Copilot Memory access on a repository see the same memories
- Cross-tool sharing: memories from coding agent inform code review; memories from code review inform coding agent
- Cross-repository isolation: strict — memories cannot cross repository boundaries

**Current Implementation Footprint:**
- Copilot coding agent (PR-based)
- Copilot code review (PR-based)
- Copilot CLI

#### Key Design Insight for AIOS
The citation validation model maps well to AIOS's entity-registry approach. Rather than time-based or confidence-based staleness, Copilot uses **structural validation** (does the cited code still exist?). AIOS's MIS sectors could adopt a similar approach: each memory hint could cite its source file/entity, and the Memory Bridge could validate the citation before injection.

---

### RQ3: Cursor/Cline Memory Bank Pattern

Sources:
- [Cline Memory Bank Docs](https://docs.cline.bot/prompting/cline-memory-bank)
- [Cursor Memory Bank GitHub](https://gist.github.com/ipenywis/1bdb541c3a612dbac4a14e1e3f4341ab)

#### The Pattern

The Memory Bank is a **file-system-based, markdown-structured, explicit memory layer** for AI coding assistants. It is not a vector database. It is not an LLM-extracted semantic store. It is structured documentation that the AI agent reads at the start of every session.

**File Structure:**
```
memory-bank/
├── projectbrief.md      # Foundation: core requirements and goals
├── productContext.md    # Why the project exists, problems solved
├── activeContext.md     # Current work focus, recent changes, next steps
├── systemPatterns.md    # Architecture, design patterns, component relationships
├── techContext.md       # Tech stack, setup, constraints, dependencies
└── progress.md          # Completed work, remaining tasks, known issues
```

Optional: additional `.md` files for complex features, integrations, APIs, test strategies.

**How Context is Injected:**
- The AI reads ALL memory bank files at the start of EVERY task — this is mandatory, not optional
- Files are read sequentially via normal file read tool calls
- Context is injected into the prompt as raw markdown text
- No vector search, no embedding, no retrieval model — pure file read

**The `.mdc` files (Cursor-specific):**
- Stored in `.cursor/rules/` directory (replacement for deprecated `.cursorrules`)
- Loaded progressively: Core Rules always load, Command-Specific Rules load on command match, Complexity Rules load by task complexity
- Four core modes: VAN (analysis), PLAN (planning), CREATIVE (brainstorming), IMPLEMENT (execution)
- Memory Bank paths referenced in `memory-bank-paths.mdc`

**Update Mechanisms:**
- Manual: user types "update memory bank" — agent reviews all files and updates
- Via `/smol` command: compresses conversation history within session
- Via `/newtask` command: distills decisions and progress for a fresh context window
- Automatic compact: optional auto-compress on context fill

**Key Design Constraints:**
- Files must remain concise (one to two pages each) to minimize context overhead
- `.clineignore` can drop starting context from 200K+ tokens to under 50K
- Detailed information goes in separate linked files for on-demand (not automatic) loading

#### Relevance to AIOS Memory Bridge

The Memory Bank pattern is the closest analog to what AIOS's MIS (Memory Intelligence System) already does conceptually — sector-based structured memory files read on demand. The critical difference: Cursor/Cline reads ALL files at session start unconditionally; AIOS's MemoryBridge reads selectively based on bracket + agent scope + token budget. AIOS's approach is strictly superior for latency, but the file format and sector organization align.

---

### RQ4: Architectural Patterns for Memory Retrieval in Real-Time LLM Applications

#### Four Primary Architectural Patterns

**Pattern 1: MemGPT / Letta OS Model**
- Context window as RAM, external storage as disk
- Agent explicitly calls retrieval tools (function calls consume context)
- Write-back triggered by fill threshold (~70%)
- Suitable for: long-running stateful agents where token cost of tool calls is acceptable
- Not suitable for: sub-15ms retrieval budgets (tool call overhead alone exceeds this)

**Pattern 2: Semantic RAG (Vector Store)**
- Fact extraction → embedding → vector store write (async, post-conversation)
- Retrieval: embedding query → approximate nearest neighbor search → rerank → inject
- Libraries: FAISS (CPU/GPU ANN), HNSWlib (in-process HNSW), Annoy (tree-based)
- In-process HNSW latency: sub-1ms for small indexes; scales to millions of vectors sub-10ms
- Suitable for: semantic similarity matching, "what did we discuss before about X?"
- Weakness: poor at temporal/relational queries; no sense of "when was this true?"

**Pattern 3: Temporal Knowledge Graph (Zep/Graphiti)**
- Hybrid: vector similarity + BM25 keyword + graph traversal + reranking
- Bi-temporal model: distinguishes "when fact was created" from "when fact was valid"
- Conflict resolution: newer edges invalidate older edges; both preserved for point-in-time queries
- Suitable for: enterprise multi-agent systems, relational reasoning, fact evolution tracking
- Not suitable for: sub-15ms latency (Neo4j graph traversal + BM25 + reranking adds up to hundreds of ms)

**Pattern 4: Structured File Memory (Cursor/Cline Memory Bank)**
- Plain markdown files organized by concern (project, context, patterns, progress)
- No retrieval model — raw file reads at session start
- Read latency: effectively 0ms for local files (filesystem I/O only)
- Suitable for: project-level persistent context, explicit developer-controlled memory
- Weakness: no semantic retrieval; agent reads everything, not what's relevant; context cost is fixed, not adaptive

#### Hybrid Approaches (Emerging Best Practice)

Production systems increasingly use hybrids. Mem0g (Mem0 + graph) achieved 68.4% accuracy vs 66.9% for vector-only Mem0. The Zep architecture combines three retrieval methods before reranking. The emerging pattern:

```
Query
  ├── Vector similarity search (fast, semantic relevance)
  ├── BM25 keyword search (fast, exact term matching)
  └── Graph traversal (slower, relational context)
        └── → Reciprocal Rank Fusion → Reranker → Top-K results
```

For sub-15ms budgets, graph traversal and reranking must be excluded. The viable sub-15ms recipe:

```
Query
  ├── In-process HNSW vector search (<2ms for <100K vectors)
  ├── BM25 keyword filter (<1ms for pre-indexed data)
  └── → Simple score fusion → Top-K results (no cross-encoder reranking)
```

---

### RQ5: Performance Envelope for Memory Retrieval

#### Latency Budget Analysis

The AIOS Memory Bridge has a **15ms hard timeout**. Here is what fits within that budget:

| Retrieval Method | Typical Latency | Fits in 15ms? | Notes |
|-----------------|----------------|---------------|-------|
| In-process file read (local FS) | <1ms | Yes | Markdown file reads |
| In-process Map/object lookup | <0.1ms | Yes | Session cache hit |
| In-process HNSW search (HNSWlib) | 0.15-2ms | Yes | Up to ~1M vectors in RAM |
| In-process FAISS (CPU, flat) | 1-5ms | Yes | Exact search, smaller indexes |
| In-process FAISS (IVF, ANN) | 1-10ms | Yes | Approximate, large indexes |
| Redis vector search (local) | 24.6ms median | No | Network I/O adds minimum ~5-10ms |
| Redis semantic cache hit | 25ms median | No | Still includes network round-trip |
| Pinecone (managed, best case) | 7ms p99 | Borderline | Network-dependent, cloud latency variable |
| Milvus (self-hosted, tuned) | 1-5ms | Yes (self-hosted) | Self-hosted only, not cloud |
| Elasticsearch vector (HNSW+quantization) | <50ms | No | Too slow for 15ms budget |
| Zep/Neo4j graph traversal | 300ms-3s | No | Far too slow |
| Mem0 end-to-end | 710ms-1440ms | No | Includes extraction + retrieval |
| MemGPT tool call round-trip | >100ms | No | Context token overhead |

**The 15ms budget is achievable only with:**
1. In-process memory (session cache — already implemented in MemoryBridge)
2. In-process vector search against a pre-loaded local index
3. Local filesystem reads (the MIS markdown sector files)
4. Pre-computed keyword indexes (inverted index, BM25 over local files)

**The 50ms budget (if timeout were relaxed) additionally enables:**
- Redis local deployment (~25ms median)
- Self-hosted Milvus (1-5ms + network overhead if co-located)
- Simple BM25 over a moderate corpus

#### What the Research Confirms About Sub-15ms

- Annoy: ~0.15ms per query (sub-millisecond, exceptional)
- HNSWlib: sub-millisecond for most practical sizes, in-process
- FAISS (flat CPU): 1-5ms for indexes up to ~1M 768-dim vectors
- Redis vector search: 24.6ms median (too slow, unless co-located with extremely low network latency)
- The AIOS Memory Bridge's current session cache (Map lookup) is sub-0.1ms — the fastest possible retrieval for already-fetched memories

---

### RQ6: Production Handling of Memory Staleness, Conflicts, and Expiration

#### Staleness Strategies in Production Systems

| System | Staleness Strategy |
|--------|-------------------|
| GitHub Copilot | Citation validation: memory rejected if cited code no longer exists |
| Zep | Bi-temporal model: edges marked valid/invalid with timestamps; point-in-time queries possible |
| MemGPT/Letta | Agent-managed: agent reads and overwrites stale facts when it detects them |
| Mem0 | LLM extraction with conflict detection: "update" vs "create new" decided by extraction LLM |
| LangMem | Developer-designed; memory enrichment process balances creation vs consolidation |
| Cursor Memory Bank | Manual: developer types "update memory bank"; no automatic detection |

#### Conflict Resolution Approaches

Academic research (Memory in LLM-based Multi-agent Systems, TechRxiv 2025) identifies four approaches:

1. **Role-based arbitration**: An orchestrator or voting mechanism decides which conflicting entry is authoritative
2. **Provenance tracking**: Entries tagged with author agent, timestamp, confidence, evidence source
3. **Serialization policies**: Locking or versioning to prevent concurrent conflicting writes
4. **Reconciliation steps**: A "post-thinking" step that checks for inconsistency across retrieved memories before finalizing the answer

#### Expiration Policies

| System | Expiration Policy |
|--------|------------------|
| GitHub Copilot | 28-day hard TTL; usage resets timer |
| Zep | T_invalid timestamp: when a newer fact supersedes an old one, old edge is invalidated but preserved |
| Mem0 | No hard TTL by default; LLM extraction decides to update or create new |
| LangMem | Developer-configured; namespace-based isolation |
| AIOS MemoryBridge | Session-level cache only; no persistent expiration logic (gap) |

#### Memory Quality Maintenance in Production

Key signals used by production systems to evaluate memory quality:
- **Semantic relevance** at retrieval time (cosine similarity score)
- **Citation validity** (Copilot model: does the backing code still exist?)
- **Temporal freshness** (Zep model: when was this fact last confirmed as valid?)
- **Usage frequency** (Copilot model: unused memories expire)
- **Confidence decay** (research models: confidence decreases with time without validation)

---

## Comparison Table: Memory Systems

| Dimension | Mem0 | MemGPT/Letta | Zep/Graphiti | LangMem | Copilot Memory | Cursor Memory Bank |
|-----------|------|-------------|-------------|---------|---------------|-------------------|
| **Architecture** | Selective extraction + dual store (vector+graph) | OS model: RAM/disk with tool calls | Temporal knowledge graph (Neo4j) | Framework SDK, storage-agnostic | Citation-validated repo store | Markdown files, filesystem |
| **Storage** | Vector DB + Graph DB | In-context blocks + vector archival | Neo4j knowledge graph | Any (LangGraph BaseStore) | Proprietary (GitHub) | Local `.md` files |
| **Retrieval** | Semantic vector search | LLM tool calls (archival_memory_search) | Cosine + BM25 + Graph + RRF reranking | Semantic search + key lookup + metadata filter | Citation validation + semantic | Sequential file read (all files) |
| **Staleness handling** | LLM-based conflict detection | Agent-managed overwrite | Bi-temporal edge invalidation | Developer-designed | Citation code validation | Manual developer update |
| **Accuracy (LOCOMO)** | 66.9% (Mem0), 68.4% (Mem0g) | N/A | 94.8% DMR, 18.5% LongMemEval gain | N/A | N/A | N/A |
| **Retrieval latency** | 0.71s median e2e | >100ms (tool call) | 90% latency reduction vs full-context (still seconds) | Variable (hot path adds latency) | Unknown (managed) | <1ms (file read) |
| **Token efficiency** | 1.8K vs 26K full-context | Variable (tool call cost) | 1.6K vs 115K full-context | Variable | Unknown | Fixed (all files loaded) |
| **Production readiness** | High (managed API) | High (Letta cloud) | High (managed + self-hosted) | Medium (SDK) | High (GitHub managed) | High (simple, no deps) |
| **Setup complexity** | Low (API) | Medium | Medium-High (Neo4j) | Medium | None (auto) | Very Low |
| **Fits 15ms budget** | No (e2e) | No | No | No (hot path) | No (managed) | Yes (local file read) |
| **Self-hosted option** | Yes (open source) | Yes (open source) | Yes (Graphiti) | Yes (SDK) | No | Yes (just files) |
| **Best fit for AIOS** | Background memory building | Inspiration for block structure | Temporal staleness model | Memory type taxonomy | Citation validation model | Sector file pattern |

---

## Performance Benchmarks

### Retrieval Latency Reference (2025-2026 Data)

| System / Method | Median Latency | p95 Latency | Notes |
|----------------|---------------|-------------|-------|
| In-process Map cache lookup | <0.1ms | <0.1ms | Already in MemoryBridge |
| Annoy (in-process ANN) | 0.15ms | <1ms | Small-medium indexes |
| HNSWlib (in-process HNSW) | <1ms | <2ms | Up to ~1M vectors |
| FAISS IVF (CPU, tuned) | 1-5ms | <10ms | Large indexes, ANN |
| **AIOS 15ms budget** | **—** | **—** | **Hard limit** |
| Redis vector search | 24.6ms | ~50ms | Local deployment |
| Redis semantic cache hit | 25ms | ~50ms | Includes application overhead |
| Pinecone (managed) | 7ms p99 | Variable | Network-dependent |
| Mem0 end-to-end | 710ms | 1,440ms | Includes extraction |
| Zep baseline (full-context) | ~31.3s | — | Without Graphiti |
| Zep with Graphiti | ~2.58-3.20s | — | 90% reduction |

### Accuracy Benchmarks (LOCOMO Dataset)

| System | Accuracy | vs Baseline |
|--------|----------|------------|
| OpenAI Memory (baseline) | 52.9% | — |
| MemGPT | Lower than Mem0 | — |
| Mem0 (vector only) | 66.9% | +26% relative |
| Mem0g (vector + graph) | 68.4% | +29% relative |

### Accuracy Benchmarks (LongMemEval Dataset)

| System | Accuracy | vs Baseline |
|--------|----------|------------|
| gpt-4o-mini baseline | ~55% | — |
| gpt-4o baseline | ~60% | — |
| Zep + gpt-4o-mini | 63.8% | +15.2% |
| Zep + gpt-4o | 71.2% | +18.5% |

### Accuracy Benchmarks (DMR — Deep Memory Retrieval)

| System | Accuracy |
|--------|----------|
| MemGPT (original paper baseline) | 93.4% |
| Zep (Graphiti) | 94.8% |
| Zep with gpt-4o-mini | 98.2% |

---

## Relevance to AIOS Memory Bridge (SYN-10)

### Current Architecture Assessment

The AIOS MemoryBridge already makes several architecturally sound decisions:

**Strengths of current implementation:**
1. **15ms hard timeout with warn-and-proceed** — correct production pattern; never blocks on memory failure
2. **Session-level Map cache** — sub-0.1ms for repeated agentId-bracket queries; industry best practice
3. **Bracket-aware progressive disclosure** — MODERATE (Layer 1, 50 tokens) → DEPLETED (Layer 2, 200 tokens) → CRITICAL (Layer 3, 1000 tokens) — aligns with resource-aware retrieval patterns
4. **Feature gate isolation** — lazy load prevents any cost when Pro is unavailable
5. **Token budget enforcement** — prevents memory injection from consuming excessive context
6. **Consumer-only pattern** — reads from MIS, never writes; correct separation of concerns

**Gaps identified by research:**

1. **No staleness detection**: MIS memories could be stale if source files changed. No citation validation (Copilot pattern) or bi-temporal model (Zep pattern) exists.

2. **Retrieval mechanism unknown**: The `MemoryLoader.queryMemories()` call is the black box. Research suggests in-process HNSW or BM25 are the only options that reliably fit in 15ms. If `queryMemories` uses any network call, the 15ms budget is almost certainly violated in practice.

3. **Single-layer retrieval per bracket**: Current implementation picks one MIS layer per bracket. The research suggests hybrid retrieval (vector + keyword) even within a single layer improves precision significantly.

4. **No memory type taxonomy**: Current implementation uses "sectors" but does not distinguish semantic (facts), episodic (past interactions), or procedural (patterns). LangMem's taxonomy would allow more targeted injection.

5. **No background memory building**: The MemoryBridge only reads. There is no mechanism for the SYNAPSE engine to contribute to MIS (write-back). This means MIS depends entirely on external population.

6. **No confidence/freshness scoring**: Memories are returned with a relevance score but no temporal freshness signal. A memory from 6 months ago with high relevance may be outdated.

---

## Prioritized Recommendations

### P0 — Critical (Must Address for SYN-10 Reliability)

**P0.1: Validate MemoryLoader is in-process and sub-15ms**
- The 15ms timeout is meaningless if `MemoryLoader.queryMemories()` makes any I/O beyond local filesystem reads
- Action: Profile `queryMemories` under realistic conditions; confirm it reads from pre-loaded in-memory index or local files only
- If it makes network calls: increase timeout to 50ms and add a local cache tier (Map with TTL) as fallback

**P0.2: Add BM25 / keyword search as a parallel fast path**
- Vector search requires an embedding to be computed from the current context (which itself takes >15ms)
- BM25 keyword search over sector files is computable in <1ms without an embedding
- Action: Add a keyword pre-filter using agent ID and current command/task as BM25 query terms; return BM25 results as fallback if vector search times out

### P1 — High (Should Address for NOG-9 / Next Sprint)

**P1.1: Implement citation validation for staleness detection (Copilot pattern)**
- Each MIS memory entry should carry a source reference (file path, entity ID, story ID)
- Before injection, MemoryBridge should validate that the referenced source still exists (1ms filesystem stat)
- Stale memories (source deleted/moved) are silently dropped rather than injected
- This prevents hallucination-via-stale-memory without requiring complex temporal models

**P1.2: Differentiate memory types in sector configuration (LangMem taxonomy)**
- Map MIS sectors to the standard taxonomy:
  - `semantic` sector → facts and knowledge (stable, high confidence, long TTL)
  - `episodic` sector → past interactions and story history (medium stability, medium TTL)
  - `procedural` sector → patterns, conventions, workflows (very stable, very long TTL)
- This allows bracket-aware retrieval to prioritize procedural memories first (most stable) and episodic memories last (most volatile)

**P1.3: Add freshness scoring to relevance calculation**
- Current: `relevance = memory.relevance || memory.attention || 0`
- Enhanced: `effectiveRelevance = relevance * freshnessFactor(memory.createdAt)`
- Freshness factor: decay function (e.g., exponential decay over 30 days) that penalizes old memories
- Aligns with Copilot's 28-day expiration and Zep's bi-temporal model without requiring graph infrastructure

**P1.4: Extend token budget tiers for MODERATE bracket**
- Current MODERATE budget: 50 tokens — sufficient only for a single metadata entry (title + source)
- Research shows even shallow context injection benefits from 100-200 tokens
- Suggested: MODERATE → 100 tokens (2-3 metadata hints); DEPLETED → 350 tokens; CRITICAL → 1000 tokens

### P2 — Medium (Architecture Improvements for v2)

**P2.1: Introduce in-process HNSW index for semantic sector**
- Use HNSWlib (Node.js binding: `hnswlib-node`) to build an in-process index over semantic sector embeddings
- Index built once at process start from MIS files; no network dependency
- Query: compute embedding of current agent context → HNSW search → top-K results in <2ms
- Challenge: embedding computation itself takes >15ms with most models; requires a pre-computed embedding approach or a fast local model (e.g., nomic-embed-text via ollama)

**P2.2: Adopt structured Memory Bank file format for MIS sectors**
- Current MIS organization is sector-based but format is unspecified
- Adopt the Cursor/Cline Memory Bank file taxonomy for the procedural and episodic sectors:
  ```
  .aios/memory/
  ├── activeContext.md     → episodic: current work focus
  ├── systemPatterns.md    → procedural: architecture patterns
  ├── techContext.md       → semantic: tech stack and constraints
  └── progress.md          → episodic: completed work, known issues
  ```
- These files are already readable in <1ms and would serve as a zero-latency memory layer for Layer 1 retrieval

**P2.3: Implement background memory write-back from SYNAPSE sessions**
- Currently MemoryBridge is consumer-only
- Add optional async write-back: after each SYNAPSE session, extract key facts/patterns via LLM and write to MIS
- Pattern from LangMem's "Background (Subconscious)" mode: post-conversation reflection without slowing immediate interaction
- This makes MIS a living system rather than a statically populated store

### P3 — Low (Research-Inspired Long-Term Vision)

**P3.1: Evaluate Zep/Graphiti for the MIS backend (long-term)**
- If AIOS evolves toward multi-agent coordination, Zep's temporal knowledge graph handles:
  - Conflict resolution between agents with different memory states
  - Point-in-time queries ("what did we know about X when story NOG-5 was being developed?")
  - Cross-agent shared knowledge with provenance tracking
- Not viable for the 15ms MemoryBridge timeout, but suitable as the MIS storage backend (with MemoryBridge reading pre-computed results)

**P3.2: Evaluate Letta memory blocks for agent persona persistence**
- Letta's memory blocks (`persona`, `human`, `knowledge`) map naturally to SYNAPSE agent configs
- Agent-specific blocks persist across sessions and are explicitly bounded in size
- Could replace or augment the AGENT_SECTOR_PREFERENCES map with richer per-agent memory schemas

**P3.3: Research sub-15ms embedding for local semantic search**
- The fundamental challenge: computing an embedding from the current prompt takes >15ms with API-based models
- Candidates: nomic-embed-text (via local ollama), all-MiniLM-L6 (via native ONNX runtime in Node.js)
- ONNX Runtime with a quantized MiniLM model can produce a 384-dim embedding in ~5-10ms on modern hardware
- This would unlock true semantic retrieval within the 15ms budget

---

## Sources

- [State of LLMs 2025 — Sebastian Raschka](https://magazine.sebastianraschka.com/p/state-of-llms-2025)
- [Design Patterns for Long-Term Memory in LLM-Powered Architectures — Serokell](https://serokell.io/blog/design-patterns-for-long-term-memory-in-llm-powered-architectures)
- [Mem0 Research — 26% Accuracy Boost](https://mem0.ai/research)
- [Mem0 Production Architecture — arXiv](https://arxiv.org/html/2504.19413v1)
- [AI Memory Benchmark: Mem0 vs OpenAI vs LangMem vs MemGPT](https://mem0.ai/blog/benchmarked-openai-memory-vs-langmem-vs-memgpt-vs-mem0-for-long-term-memory-here-s-how-they-stacked-up)
- [Graph Memory for AI Agents (January 2026) — Mem0](https://mem0.ai/blog/graph-memory-solutions-ai-agents)
- [Mem0 Alternatives Guide 2025](https://www.edopedia.com/blog/mem0-alternatives/)
- [Zep: A Temporal Knowledge Graph Architecture — arXiv 2501.13956](https://arxiv.org/abs/2501.13956)
- [Zep arXiv Paper HTML](https://arxiv.org/html/2501.13956v1)
- [Graphiti — Build Real-Time Knowledge Graphs — GitHub](https://github.com/getzep/graphiti)
- [Graphiti — Neo4j Blog](https://neo4j.com/blog/developer/graphiti-knowledge-graph-memory/)
- [LangMem SDK Launch — LangChain Blog](https://blog.langchain.com/langmem-sdk-launch/)
- [LangMem Conceptual Guide](https://langchain-ai.github.io/langmem/concepts/conceptual_guide/)
- [LangMem GitHub](https://github.com/langchain-ai/langmem)
- [About agentic memory — GitHub Copilot Docs](https://docs.github.com/en/copilot/concepts/agents/copilot-memory)
- [Enabling and curating Copilot Memory — GitHub Docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/copilot-memory)
- [GitHub Copilot Agentic Memory — Arinco](https://arinco.com.au/blog/github-copilots-agentic-memory-teaching-ai-to-remember-and-learn-your-codebase/)
- [Cline Memory Bank Docs](https://docs.cline.bot/prompting/cline-memory-bank)
- [Cursor Memory Bank GitHub Gist](https://gist.github.com/ipenywis/1bdb541c3a612dbac4a14e1e3f4341ab)
- [vanzan01/cursor-memory-bank — GitHub](https://github.com/vanzan01/cursor-memory-bank)
- [Redis Real-Time RAG Blog](https://redis.io/blog/using-redis-for-real-time-rag-goes-beyond-a-vector-database/)
- [Best Vector Databases 2026 — Firecrawl](https://www.firecrawl.dev/blog/best-vector-databases)
- [Comparing Memory Systems: Vector, Graph, Event Logs — MarkTechPost](https://www.marktechpost.com/2025/11/10/comparing-memory-systems-for-llm-agents-vector-graph-and-event-logs/)
- [FAISS vs HNSWlib — Zilliz](https://zilliz.com/blog/faiss-vs-hnswlib-choosing-the-right-tool-for-vector-search)
- [Annoy vs FAISS — Zilliz](https://zilliz.com/blog/annoy-vs-faiss-choosing-the-right-tool-for-vector-search)
- [Memory in the Age of AI Agents — arXiv 2512.13564](https://arxiv.org/abs/2512.13564)
- [Letta: Memory Blocks](https://www.letta.com/blog/memory-blocks)
- [Letta: Agent Memory](https://www.letta.com/blog/agent-memory)
- [Letta: Anatomy of a Context Window](https://www.letta.com/blog/guide-to-context-engineering)
- [Intro to Letta / MemGPT](https://docs.letta.com/concepts/memgpt/)
- [EM-LLM: Human-inspired Episodic Memory](https://em-llm.github.io/)
- [Persistent Memory in LLM Agents — EmergentMind](https://www.emergentmind.com/topics/persistent-memory-for-llm-agents)
- [Memory for AI Agents: A New Paradigm — The New Stack](https://thenewstack.io/memory-for-ai-agents-a-new-paradigm-of-context-engineering)
- [Survey of AI Agent Memory Frameworks — Graphlit](https://www.graphlit.com/blog/survey-of-ai-agent-memory-frameworks)
- [Agentic Memory: Unified Long-Term and Short-Term Memory — arXiv 2601.01885](https://arxiv.org/html/2601.01885v1)
- [High-Latency LLM Memory Fix — TechEduByte](https://www.techedubyte.com/high-latency-llm-memory-fix-faster-retrieval/)
- [LLM Latency Benchmark 2026 — AI Multiple](https://research.aimultiple.com/llm-latency-benchmark/)
- [GitHub Copilot Coding Agent Architecture — ITNEXT](https://itnext.io/github-copilot-coding-agent-the-complete-architecture-behind-agentic-devops-at-enterprise-scale-1f42c1c132aa)

---

*Research completed: 2026-02-21*
*Next: C6 research (if applicable) or integration into NOG-9 story acceptance criteria*
