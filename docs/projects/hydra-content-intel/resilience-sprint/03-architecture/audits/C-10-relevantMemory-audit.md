# C-10 Audit — `mindCloneEnrichment.relevantMemory` Shape-Break Risk

**Author:** Aria (@architect)
**Date:** 2026-05-12
**Scope:** PO v0.8 concern C-10 — Story 1.12 proposes changing `mindCloneEnrichment.relevantMemory` from `string[]` (today) to `FeedEntry[]` (per AC #2). This audit identifies every caller of that field across `D:/AIOS/` and `D:/jarvis/bridge-data/` to determine whether the shape change breaks anything.
**Related:** [ADR-004 Decision 7](../adrs/ADR-004-consumption-side.md#7-shape-compatibility-rename-to-feedentries-retain-relevantmemory-as-legacy-alias)
**Tool:** `Grep` (ripgrep) across `.aios-core/`, `tools/hydra/`, `packages/`, `bin/`, `tests/`, `squads/`, `pro/`, `.claude/`, and `bridge-data/`.

---

## TL;DR

**Recommendation: RENAME — add a new field `feedEntries: FeedEntry[]` and keep the existing `relevantMemory: string[]` untouched for one release cycle.**

The field name `relevantMemory` is **already in use today** with a different semantic (agent-memory file paths) and at least two non-trivial consumers (`subagent-dispatcher.js`, `mind-clone-pipeline.js`). Repurposing the field — even with the "everything treats it as opaque, it'll be fine" framing — silently breaks the greeting builder's `length` count (line 199-201 of `mind-clone-pipeline.js`) and would inject structured `FeedEntry` objects into the consultation prompt's `## Relevant Memory Files` block (line 362 of `self-consultation.js`) where it currently renders strings as backtick-wrapped paths.

Adding `feedEntries` as a sibling field is zero-break. Sprint #2 may delete `relevantMemory` if a re-audit confirms zero live consumers after the 30-day quarantine window. Mirrors the `pipeline.js` shim retention policy from PRD v0.7.

---

## Method

Searched for the literal string `relevantMemory` (case-sensitive) and the field-bearing object `mindCloneEnrichment` across:

| Path | Tool | Hits |
|---|---|---|
| `D:/AIOS/.aios-core/` | Grep | 3 files / 14 references |
| `D:/AIOS/tools/hydra/` | Grep | 0 |
| `D:/AIOS/packages/` | Grep | 0 |
| `D:/AIOS/bin/` | Grep | 0 |
| `D:/AIOS/tests/` | Grep | 1 file / 1 reference (mock object only) |
| `D:/AIOS/squads/` | Grep | 0 |
| `D:/AIOS/pro/` | Grep | 0 |
| `D:/AIOS/.claude/` | Grep | 0 (CLAUDE.md and rules don't mention the field) |
| `D:/jarvis/bridge-data/` | Glob + persistence-code inspection | 0 (the field is **not persisted** by `saveConsultation`) |

Bridge-data result was determined by reading `self-consultation.js` lines 400-437: the `saveConsultation` helper writes a request.json with only `{id, expert, question, context, project, requested_at, requested_by, mode}` — `mindCloneEnrichment` is **not serialized to disk**. So no saved consultation file persists the field; no historical artifact can break on a shape change.

---

## Callers found

### Caller 1 — `self-consultation.js` (writer of the field)

**File:** `D:/AIOS/.aios-core/core/jarvis/self-consultation.js`
**Lines:** 270-275 (writes), 309 (returns), 361-362 (renders into prompt)

```js
// line 270-275 — writes the field
const relevantMemory = fs.existsSync(memDir)
  ? fs.readdirSync(memDir)
      .filter((f) => f.endsWith('.md') && (f.startsWith('feedback_') || f.includes(expert)))
      .slice(0, 5)
  : [];
mindCloneEnrichment = { advisorContext, relevantMemory, source: resolved.source };

// line 361-362 — renders the field into the prompt
if (enrichment?.relevantMemory?.length) {
  memoryBlock = `\n## Relevant Memory Files\n${enrichment.relevantMemory.map((f) => `- \`${f}\``).join('\n')}\n...`;
}
```

**Current usage:** `string[]` of agent-memory file paths. The prompt renders each entry as a backtick-wrapped Markdown list item.

**Would it break with `FeedEntry[]` shape?** **YES, catastrophically.** Each `FeedEntry` would render as `[object Object]` via the implicit `.toString()` in the template literal. The `## Relevant Memory Files` block would become Markdown garbage. The consultation prompt would degrade in quality.

**Mitigation chosen:** Field unchanged. New `feedEntries` field added separately, rendered in its own new `## Recent Knowledge` section (architecture §10A.3).

---

### Caller 2 — `subagent-dispatcher.js` (reads relevantMemory from a different source)

**File:** `D:/AIOS/.aios-core/core/execution/subagent-dispatcher.js`
**Line:** 322

```js
enriched.memory = memory.relevantMemory || [];
```

**Current usage:** Copies the array from `memoryQuery.getContextForAgent()` (different code path — NOT from `self-consultation.js`'s `mindCloneEnrichment`). The `memory.relevantMemory` here comes from a **separate `MemoryQuery` interface**, not from the consultation enrichment object.

**Would it break with the Story 1.12 change?** **NO.** This is a name collision, not a shared field. `subagent-dispatcher.js` reads from `MemoryQuery.getContextForAgent()` (an independent module), not from `mindCloneEnrichment`. The two `relevantMemory` arrays are unrelated. Story 1.12's change to `mindCloneEnrichment.relevantMemory` does not flow into `enriched.memory` because the dispatcher does not invoke `self-consultation.js`.

**Test confirmation:** `tests/core/subagent-dispatcher.test.js` line 177 mocks `getContextForAgent` returning `relevantMemory: [{ type: 'pattern', content: 'use hooks' }]` — already an object array. The test passes today because the dispatcher treats the contents opaquely (only `.length` and array-copy).

**Mitigation:** No action needed. The two fields share a name but not a data flow.

---

### Caller 3 — `mind-clone-pipeline.js` (greeting builder, line 199-201 and 246-271)

**File:** `D:/AIOS/.aios-core/core/jarvis/mind-clone-pipeline.js`
**Lines:** 180 (function param), 199-201 (renders as count), 246 (loads from `loadRelevantMemory`), 254 (passes to greeting builder), 271 (returns)

```js
// line 199-201 — greeting builder
if (relevantMemory?.length > 0) {
  lines.push('');
  lines.push(`🧠 ${relevantMemory.length} relevant memory entry(ies) available — invoke *recall to access`);
}

// line 246 — loads from its own helper
const [body, advisorContext, relevantMemory] = await Promise.all([
  loadBody(agentId),
  loadAdvisorContext(...),
  loadRelevantMemory(options.callingAgent || 'aios-master', agentId),
]);
```

**Current usage:** `MindClonePipeline.activate()` is the **greeting** code path (different from consultation). It calls its own `loadRelevantMemory` helper. The result is rendered as a count in the greeting line.

**Would it break with Story 1.12?** **NO.** Same name-collision pattern as Caller 2. `MindClonePipeline.activate()` does NOT invoke `self-consultation.js`'s `consult()`; it reads its own `loadRelevantMemory` helper. Story 1.12 changes `self-consultation.js`'s `mindCloneEnrichment.relevantMemory` field. The two paths share a name and a directory but not a data flow.

**Caveat:** If a future refactor were to *unify* these two paths (e.g., make `MindClonePipeline.activate` call into `self-consultation.js`'s enrichment), the unified field would need to settle on one shape. Today they are independent.

**Mitigation:** No action needed. Document that the two `relevantMemory` names are separate (this audit serves as the documentation).

---

### Caller 4 — `tests/core/subagent-dispatcher.test.js` (mock object)

**File:** `D:/AIOS/tests/core/subagent-dispatcher.test.js`
**Line:** 177

```js
const mq = createMockMemoryQuery({
  getContextForAgent: jest.fn().mockResolvedValue({
    relevantMemory: [{ type: 'pattern', content: 'use hooks' }],
    suggestedPatterns: [{ name: 'hooks-pattern' }],
  }),
});
```

**Current usage:** Mocks `MemoryQuery.getContextForAgent()` (Caller 2's data source). Already returns object array; the test asserts `result.memory.length === 1`.

**Would it break?** **NO.** Mock is for a different interface. Story 1.12 does not touch `MemoryQuery`.

**Mitigation:** None needed.

---

### Non-callers (verified by grep, no hits)

- **`D:/AIOS/tools/hydra/`** — HYDRA tool code does not currently reference `relevantMemory`. The Story 1.12 change introduces `feedEntries` here for the first time.
- **`D:/AIOS/packages/`** — no hits.
- **`D:/AIOS/bin/`** — no hits.
- **`D:/AIOS/squads/`** — no hits.
- **`D:/AIOS/pro/`** — no hits.
- **`D:/AIOS/.claude/`** — no hits (rules and commands do not depend on the field).
- **`D:/AIOS/.aios-core/core/jarvis/consultation-engine.js`** — no hits (the engine module wraps around `self-consultation.js` but does not destructure or iterate the field).
- **`D:/AIOS/.aios-core/core/jarvis/trajectory-recorder.js`** — no hits (records only `consultationId, expert, question, project, callingAgent, contextLength` — see `self-consultation.js` line 317).
- **`D:/AIOS/.aios-core/core/jarvis/mind-clone-cached-prompt.js`** — no hits.
- **`D:/jarvis/bridge-data/consultations/*/request.json`** — `saveConsultation` (line 400-437) does NOT serialize `mindCloneEnrichment`, so no persisted request file carries the field. Verified by reading the persistence helper directly.
- **`D:/jarvis/bridge-data/consultations/*/response.json`** — same; responses persist `consultation_id, expert, response, mode` only (line 442-449).

---

## Risk reassessment (PO v0.8 RA-8)

PO v0.8 §Q6 RA-8 was scored **LOW likelihood / HIGH impact**: low because few external consumers; high because silent corruption of the consultation prompt would degrade clone outputs without any error signal.

After this audit:

- **External-to-self-consultation consumers of the literal field:** 0 (verified — bridge-data does not persist; no other module reads `mindCloneEnrichment.relevantMemory`).
- **Internal consumer (the prompt builder itself, line 361-362):** would render `[object Object]` if shape changed in place. **This is the only actual break path.**
- **Two name-collision modules (`subagent-dispatcher.js`, `mind-clone-pipeline.js`):** Independent data flows; unaffected.

**Revised severity:** LOW/MEDIUM. The only break path is the internal prompt renderer, which is fixed by the rename approach (it keeps reading the legacy string array from `relevantMemory` while the new feed section reads from `feedEntries`).

---

## Recommendation

**Choose option (b) RENAME — add `feedEntries: FeedEntry[]` as a new field, keep `relevantMemory: string[]` untouched.**

Rationale:

1. **Zero break in the current renderer.** The prompt builder at line 361-362 keeps rendering `relevantMemory` as Markdown-listed string paths. The new `## Recent Knowledge` section (architecture §10A.3) reads from `feedEntries` independently.
2. **Zero break in name-collision modules.** `subagent-dispatcher.js` line 322 and `mind-clone-pipeline.js` line 199-201 continue to work because they read from independent data sources (same name, different flow).
3. **Field semantics stay coherent.** `relevantMemory` continues to mean "agent-memory file paths" (its historical meaning). `feedEntries` means "HYDRA feed payload". A future reader of the code can tell what each field is without context.
4. **Mirrors the v0.7 shim policy.** PRD v0.7 (C-03) approved keeping `pipeline.js` as a thin re-export shim for one release cycle. The same precedent applies here: keep the legacy field for one cycle, then re-audit and remove.
5. **No new test required for the legacy path.** Existing prompts render exactly as before. The new path gets its own test (`tests/consultation/feed-injection.test.js`) per Story 1.12 AC #9.

**Cleanup trigger for Sprint #2:** Re-run this audit after 2026-06-12 (30 days post-Story-1.12-merge). If hits remain 0 outside the writer (`self-consultation.js`) and the now-empty renderer block (line 361-362, which will have been deleted as part of Story 1.12 if `relevantMemory` is consistently empty post-rename), delete the field from the writer side and from the prompt renderer. Estimated effort: 15 minutes including test update.

---

## Action items emitted by this audit

| Item | Owner | Action |
|---|---|---|
| Story 1.12 AC #2 wording | @pm | Change "Populates `mindCloneEnrichment.relevantMemory` with feed entries" → "Adds new field `mindCloneEnrichment.feedEntries: FeedEntry[]` (separate from existing `relevantMemory: string[]`)" |
| Story 1.12 AC #11 (new, per PO C-10) | @pm | Add: "New field is `feedEntries`. Legacy `relevantMemory` field unchanged in semantics and shape. See ADR-004 Decision 7 and audit `C-10-relevantMemory-audit.md`." |
| Sprint #2 backlog | @po | Schedule re-audit + cleanup of `relevantMemory` for 2026-06-12 or later. |
| Architecture §10A.2 table | @architect (this commit) | Audit summary table embedded in architecture.md §10A.2 — already done. |

---

**Audit closed 2026-05-12 by Aria (@architect).** No blockers remain on Story 1.12 shape compatibility. Rename approach approved; @pm to update AC #2 + add AC #11.
