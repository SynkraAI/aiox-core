# ADR-002: SQLite-Backed Vector Search with In-Memory LRU Cache

**Format:** Michael Nygard
**Date:** 2026-05-11
**Status:** Accepted (with benchmark spike exit criterion)
**Deciders:** Aria (@architect), synthesizing 2/3 conclave consensus + 1 process-only opinion
**Conclave experts consulted:** martin-fowler, werner-vogels, charity-majors
**Conclave consensus:** werner-vogels recommends LRU cache as default; martin-fowler accepts the choice but mandates a benchmark spike before merge; charity-majors deferred (not their domain)
**Related PRD requirements:** FR2 (migrate vector-store + semantic-dedup to SQLite), NFR2 (semantic-dedup p99 ≤ 50ms), NFR5 (vector-store.search p99 ≤ 200ms), Story 1.2 (vector-store SQLite + LRU spike), Story 1.3 (semantic-dedup SQLite)

---

## Context

Two HYDRA modules are responsible for the OOM crash documented in `01-analysis` §6.1 and §8.1:

- **`src/store/vector-store.js`** persists vector embeddings in `hydra-data/vectors/vector-index.json` (16.7MB)
- **`src/dedup/semantic-dedup.js`** persists semantic fingerprints in `hydra-data/fingerprints/fingerprints.json` (20.7MB)

Both modules implement the same anti-pattern:
1. `loadFromDisk()` reads the entire JSON file into memory
2. `mutateInMemory()` adds/updates a single entry
3. `saveToDisk()` re-serializes the entire array back to disk

This happens **per item** processed by the pipeline. For a 3,771-item run (the largest historical run), this is ~3,771 full reads + 3,771 full writes of ~37MB JSON combined. The V8 transient peak of `JSON.parse` of multi-MB strings (3-5× string size during object graph construction) cumulatively exceeds the default Node heap.

**ADR-001 addresses the streaming pattern** (orchestration), but even with streaming, each per-item read/write of 37MB JSON would still produce the same heap churn. The storage layer must also change.

**Three storage approaches were under consideration:**

1. **SQLite + in-memory LRU cosine cache** (vectors persist in SQLite; cache holds working set for fast similarity search)
2. **SQLite + sqlite-vss extension** (native vector similarity at the database layer; well-known approach)
3. **Status quo + write batching** (defer JSON write to end of run; risky if pipeline crashes mid-run; fundamentally a band-aid)

**Performance requirements** (PRD):
- NFR2: `semantic-dedup.checkSemantic()` p99 ≤ 50ms for 10k fingerprints
- NFR5: `vector-store.search()` p99 ≤ 200ms for 10k vectors

**Operational requirements:**
- Single-machine Windows deployment
- No new dependencies (PRD §3.1 sprint constraint)
- Migration must be idempotent + reversible (NFR8)
- Existing `hydra search` CLI public contract preserved (NFR5 / CR1)

## Decision

**Adopt SQLite as the source of truth for both vector-store and semantic-dedup. Use an in-memory LRU cosine cache as the primary read path for `vector-store.search()`. Gate the decision behind a 1-day benchmark spike before merge.**

Concretely:

1. **Storage schema** (additive per CR2 — full DDL in `architecture.md` §5.1):
   - New table `vector_embeddings(id, content_id, embedding_blob, dimension, source_name, created_at)`
   - New table `semantic_fingerprints(id, content_id, fingerprint_hash, title_normalized, source_name, created_at)`
   - Both reuse the existing SQLite singleton at `src/dedup/dedup-store.js:20` (DO NOT open a second connection)

2. **Embedding storage format:** `embedding_blob` stored as `BLOB` containing little-endian `Float32Array` serialized via `Buffer.from(new Float32Array(vec).buffer)`. Decoded on read. Avoids per-row JSON parse overhead.

3. **Read paths:**
   - **`vector-store.search(query, options)`** (used by `hydra search` CLI):
     - On first call after process start, lazily load all embeddings from SQLite into an in-memory cache (`Map<contentId, Float32Array>`)
     - Cosine similarity computed in pure JS over the cache
     - Top-K via min-heap of size K
     - **Cache invalidation:** write-through on `upsert()` — cache entry replaced when SQLite is updated
     - For 10k vectors × 1536 dims × 4 bytes ≈ 60MB resident — comfortable on a 16GB box
   - **`semantic-dedup.checkSemantic(item)`** (per-item in pipeline):
     - Indexed lookup on `fingerprint_hash` (SHA-style equality match) — O(log n) via B-tree index
     - Fallback: title-normalized lookup if hash-equality misses (rare)
     - Per-item cache (size configurable, defaults to 1000 entries) for hot fingerprints

4. **Write paths:**
   - **`vector-store.upsert(contentId, embedding)`**:
     - `INSERT OR REPLACE INTO vector_embeddings (content_id, embedding_blob, dimension, source_name) VALUES (?, ?, ?, ?)` via prepared statement
     - Cache write-through: `cache.set(contentId, new Float32Array(embedding))`
   - **`semantic-dedup.registerFingerprint(item)`**:
     - `INSERT OR IGNORE INTO semantic_fingerprints (...) VALUES (...)` via prepared statement
     - Cache eviction on age (LRU)

5. **Benchmark spike (Story 1.2 AC #7 — Fowler's exit criterion):**
   - 1-day spike branch implementing both LRU cache AND sqlite-vss
   - Fixture: 10k vectors × 1536 dims + 100 query vectors
   - Measure: cosine similarity top-10 retrieval, mean + p99 latency, peak resident memory
   - **Decision rule:**
     - If LRU p99 ≤ 200ms → adopt LRU (the default, this ADR's primary recommendation)
     - If LRU p99 > 200ms → adopt sqlite-vss (accept native dep risk, file follow-up risk to runbook)
   - Document loser as "considered, rejected because [data]" in this ADR's revision history

6. **Migration (one-shot per module):**
   - Gated by `preflight/all.mjs` (Story 1.1) — refuses to run without backups
   - Reads existing JSON, bulk-inserts via transaction
   - Renames JSON to `*.legacy.json` (NOT deleted) for one release cycle
   - Post-flight: row count in SQLite must equal entry count in JSON

7. **Rollback:** Env flag `HYDRA_USE_LEGACY_VECTOR_STORE=1` reactivates the legacy JSON readers (see `architecture.md` §9.1 Layer 1).

8. **sqlite-vss explicitly rejected as default** for this sprint. Reasons:
   - Adds a native C extension (cross-platform build risk on Windows specifically)
   - Introduces a new failure mode (extension load failure → pipeline broken)
   - Conclave (werner-vogels) noted: "external native dep introduces a new failure mode (build failures cross-platform)"
   - Operational cost (install, verify on each Node version upgrade) is real
   - We can reconsider in 6 months if corpus grows >100k vectors and LRU no longer fits in RAM

## Conclave Consensus

**Werner Vogels (primary voice on storage):**
> "For 10k vectors at p99 < 200ms, LRU cache wins on operational simplicity. 10k × 1536 dimensions × 4 bytes = ~60MB resident. That's nothing on a 16GB box. Cosine similarity over 10k vectors in pure JS is <20ms on modern Node. The cost: a cold-cache miss on the first query after startup."

> "SQLite is the SOURCE OF TRUTH — vectors persist there. Cache invalidates on upsert() (write-through). Refuse sqlite-vss for this sprint. Reason: external native dep introduces a new failure mode (build failures cross-platform)."

> "Frugality is wisdom. Don't pay maintenance cost on dependencies you don't need yet."

**Martin Fowler (process-only, no preference between options):**
> "I don't have strong opinions on the vector index — that's not my domain. But I have opinions on HOW you decide. The question is: do you have the search latency data right now? Don't pick without data. And don't pick hybrid first — hybrid means two failure modes."

> "Spike sqlite-vss in a branch (1 day). Spike in-memory LRU cache in a branch (1 day). Benchmark both. Pick the winner. Document loser as 'considered, rejected because…'"

**Charity Majors:**
> "Pass — not my domain."

**Dissent:** Fowler (process-only, prefers data-driven choice) vs. Vogels (recommends LRU based on reasoning from first principles). Synthesis: **Vogels' default position wins, but Fowler's process gate is honored** — the benchmark spike is the exit criterion.

## Consequences

### Positive

1. **OOM root cause eliminated.** Per-item JSON read/write disappears entirely. Heap churn from `JSON.parse` of 37MB strings is gone.
2. **Single source of truth.** Same SQLite database as `urls`, `content_hashes`, `pipeline_runs`, `audit_log`, `entity_graph`. Operator queries one file.
3. **Operational simplicity.** No native build steps. No second database. No extension to install. `better-sqlite3` is already a dependency.
4. **Cache is pure JS** — debuggable, profiling-friendly, no opaque vector index data structures.
5. **Write-through invalidation** is the simplest cache coherence model; impossible to have stale cache state.
6. **Reversible.** Env flag rollback returns to JSON reader in seconds. JSON files retained for one release cycle.
7. **Read latency for fresh queries** is faster than current JSON path. Current path loads full 16.7MB JSON per query (file IO + parse). New path: lazy cache load once, then in-memory cosine.
8. **Memory footprint** is bounded and known: ~60MB resident for 10k 1536-dim vectors. Compare to current path which transient-spikes to 5× the 16.7MB JSON file during parse (≈83MB) on every query.

### Negative

1. **Cold-cache miss on first `hydra search` after process startup.** First query pays the cache-load cost (~50ms for 10k vectors). **Trade-off accepted:** subsequent queries are fast, and the operator's interactive `hydra search` use is rare enough that the cold start is invisible most of the time.
2. **Cache eviction not implemented** at sprint scope. If corpus grows past available RAM, cache loads will fail. **Mitigation:** corpus is ~10k today; we have orders of magnitude of headroom before this matters. Reconsider when corpus crosses 100k.
3. **LRU cache complicates testing.** Tests must either prewarm the cache or assert behavior in both warm and cold states. **Mitigation:** test helper `resetVectorCache()` exposed for unit tests (similar to existing `resetDedupStore()`).
4. **Pure-JS cosine is slower than SIMD-optimized native code** (sqlite-vss uses Faiss internally). For 10k vectors, the difference is ~10ms vs ~3ms — invisible at our scale. At 100k+ vectors, this would matter.
5. **No vector index data structure** (no HNSW, no IVF). We do linear scan on the cache. **Trade-off accepted:** correct for 10k, will revisit for 100k.
6. **BLOB encoding is fragile if endianness changes.** Windows / Linux / Mac on x86_64 are all little-endian; ARM Macs are little-endian by default. If we ever target a big-endian platform, the BLOB format breaks. **Mitigation:** add `dimension` column as a sanity check; document encoding format in JSDoc on `vector-store.upsert`.

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **R2 from PRD** — Semantic-dedup latency regresses past 50ms | Medium | Medium | Pre-test SQLite-backed lookup with 10k synthetic fingerprints. Add in-memory LRU layer (size = 1000) for hot fingerprints. Index on `fingerprint_hash` + `title_normalized`. |
| **R6 from PRD** — `vector-store.search()` p99 > 200ms post-migration | Medium | Medium | Benchmark spike (Story 1.2 AC #7) is the exit criterion. If LRU fails, fall back to sqlite-vss (with operational debt acknowledged). |
| **R1 from PRD** — SQLite migration corrupts data | Low | High | Mandatory backup (`preflight/02-backup-verify.mjs`). Idempotent migration via `INSERT OR IGNORE`. Post-flight row count check. Reversible via env flag for 1 release. |
| **RA-1 from architecture.md** — LRU cache eviction thrashing on cold start | Low | Low | Cache sized for full corpus (10k vectors ≈ 60MB). Lazy load on first `search()` avoids paying cost at process startup. |
| **Endianness bug** in BLOB encoding | Very Low | Medium | x86_64 + ARM Mac are little-endian by default. Add `dimension` column sanity check + JSDoc comment. Defer cross-arch test until needed. |
| **Cache + SQLite drift** — cache mutation succeeds but SQLite write fails | Low | High | Write order: SQLite first, cache second (only on SQLite success). Failures propagated as `{success: false, error}` per ADR-001 contract. |

### Things we are NOT doing (and why)

- **sqlite-vss as default:** Native dep risk on Windows, install verification overhead, new failure mode. Reserved as fallback if LRU misses NFR5 in benchmark.
- **HNSW / IVF approximate nearest neighbor:** Premature for 10k vectors. Linear scan is correct and faster than the indexing overhead at this scale.
- **Embedding compression** (int8 quantization, product quantization): Saves RAM but adds precision risk. ~60MB is not a problem today.
- **Hybrid LRU + sqlite-vss:** Fowler's blind spot catch ("hybrid means two failure modes"). Pick one.
- **External vector store** (Qdrant, Weaviate, Pinecone): HYDRA is a single-machine CLI tool. External vector store is operational overkill.
- **Replacing better-sqlite3 with sqlite3-wasm or libsql:** Out of scope. better-sqlite3 is established, fast, synchronous (matches our usage pattern), and reused via the singleton.

### Things requiring future work (post-sprint)

- Cache eviction policy (true LRU with size cap) if corpus grows past ~50k vectors
- HNSW or sqlite-vss when corpus crosses 100k (revisit in 6 months per Werner's note)
- Embedding upgrade path if we move from 1536-dim to higher-dim model — `dimension` column allows mixed-dim corpus during migration

## References

- `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/03-architecture/conclave/conclave-output.md` (full conclave responses, ADR-002 section)
- `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/01-analysis/project-documentation.md` §6.1 (OOM evidence), §5.3 (SQLite vs JSON storage split)
- `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/02-prd/prd.md` §2.1 FR2, §2.2 NFR2 + NFR5 + NFR8, §3.5 R1/R2/R6, §4-5 Stories 1.2 + 1.3
- `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/03-architecture/architecture.md` §3.1 Phase 1, §5.1, §9
- Code under migration: `D:/AIOS/tools/hydra/src/store/vector-store.js:118-161` (`upsert`), `:173` (`search`); `D:/AIOS/tools/hydra/src/dedup/semantic-dedup.js:242-263` (`registerFingerprint`)
- Existing SQLite singleton: `D:/AIOS/tools/hydra/src/dedup/dedup-store.js:17` (createRequire workaround), `:20` (`_instance`)
- Heap diagnostic: `D:/AIOS/tools/hydra/validate-heap.mjs`

## Related ADRs

- [ADR-001](./ADR-001-streaming-pattern.md) — addresses the pipeline orchestration; this ADR addresses the storage layer the orchestration depends on. Both must ship together to fully eliminate OOM.
- [ADR-003](./ADR-003-observability-stack.md) — uses the same SQLite singleton for `pipeline_items`, `pipeline_errors`, `llm_calls`; design principles cohere.

---

*ADR-002 authored 2026-05-11 by Aria (@architect) on the basis of conclave 2/3 + 1 process-only.*
