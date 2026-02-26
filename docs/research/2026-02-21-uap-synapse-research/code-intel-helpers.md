# Code Intelligence Helpers — New Helper Identification

**Story:** NOG-9 — UAP & SYNAPSE Deep Research (Task 9)
**Author:** Aria (Architect Agent)
**Date:** 2026-02-21
**Based on:** 21 research reports + existing helpers analysis

---

## 1. Current Helper Landscape

### Existing Helpers (`.aios-core/core/code-intel/helpers/`)

| Helper | Agent | Purpose | Tests |
|--------|-------|---------|-------|
| `dev-helper.js` | @dev | Duplicate check, blast radius, IDS G4 | 156+ passing |
| `qa-helper.js` | @qa | Coverage analysis, risk assessment | Passing |
| `planning-helper.js` | @architect | Brownfield analysis, impact estimation | Passing |
| `creation-helper.js` | @sm | Duplicate story detection | Passing |
| `devops-helper.js` | @devops | Pre-push impact analysis, PR enrichment | Passing |
| `story-helper.js` | @po | Story context enrichment | Passing |

### Architecture Pattern

All helpers follow the same contract:
- Accept parameters relevant to their agent's task
- Query `CodeIntelClient` / `CodeIntelEnricher` for graph data
- Return enriched results or `null` on failure
- **Never throw** — graceful degradation always

---

## 2. Proposed New Helpers

### 2.1 `activation-helper.js` — UAP Pipeline Optimization

**Agent consumer:** All agents (via UAP)
**Research evidence:** A4 (git perf), A7 (project status), QW-5, QW-6

**Purpose:** Optimize UAP loader execution using code intelligence data.

```javascript
/**
 * Suggest which loaders can be skipped based on code graph.
 * Example: If no git-related files changed, skip deep git status.
 *
 * @param {string} agentId - Active agent ID
 * @param {Object} sessionContext - Current session context
 * @returns {Promise<{skipLoaders: string[], reason: string}|null>}
 */
async function suggestLoaderOptimizations(agentId, sessionContext) { }

/**
 * Check if ProjectStatus can use cached data.
 * Uses file modification timestamps from code graph vs last activation.
 *
 * @param {number} lastActivationTime - Timestamp of last UAP activation
 * @returns {Promise<{canUseCached: boolean, changedFiles: string[]}|null>}
 */
async function checkProjectStatusFreshness(lastActivationTime) { }
```

**ROI:** Could reduce UAP p50 by 30-50ms for consecutive activations.
**Effort:** Medium (2-3h)

### 2.2 `synapse-helper.js` — Context Injection Intelligence

**Agent consumer:** SYNAPSE engine (hook-runtime)
**Research evidence:** C1 (layered pipeline), C3 (domain efficiency), C6 (token budget)

**Purpose:** Make SYNAPSE domain selection smarter using code graph context.

```javascript
/**
 * Suggest which domains are relevant for current prompt.
 * Uses code graph to determine which domains have rules affecting
 * files mentioned in the user's prompt.
 *
 * @param {string} userPrompt - Current user prompt text
 * @param {string[]} activeDomains - Currently enabled domains
 * @returns {Promise<{relevant: string[], irrelevant: string[], reason: string}|null>}
 */
async function suggestRelevantDomains(userPrompt, activeDomains) { }

/**
 * Estimate real token count for SYNAPSE output.
 * Uses code graph file sizes + rule counts for better estimation.
 * Addresses C6 finding: chars/4 underestimates 15-25% on XML.
 *
 * @param {string} synapseOutput - The assembled <synapse-rules> XML
 * @returns {Promise<{estimatedTokens: number, method: string}|null>}
 */
async function estimateTokenCount(synapseOutput) { }
```

**ROI:** More precise domain loading, reduced token waste.
**Effort:** Medium (2-3h)

### 2.3 `session-helper.js` — Session Intelligence

**Agent consumer:** UAP (ContextDetector, WorkflowNavigator)
**Research evidence:** B2 (session continuity), B3 (workflow suggestion), C4 (session bridge)

**Purpose:** Enhance session detection using code graph patterns.

```javascript
/**
 * Infer likely next workflow step based on:
 * - Story file Status field (B3 recommendation)
 * - Recently modified files from code graph
 * - Current branch pattern
 *
 * @param {Object} sessionContext - Current session
 * @param {Object} projectStatus - Project status
 * @returns {Promise<{nextStep: string, confidence: number, signal: string}|null>}
 */
async function inferWorkflowState(sessionContext, projectStatus) { }

/**
 * Detect if current session is a continuation of previous work.
 * Uses code graph to check if same files are being accessed.
 *
 * @param {Object} currentFiles - Files in current context
 * @param {Object} lastSession - Previous session data
 * @returns {Promise<{isContinuation: boolean, confidence: number, sharedFiles: string[]}|null>}
 */
async function detectSessionContinuity(currentFiles, lastSession) { }
```

**ROI:** More accurate workflow suggestions, better session type detection.
**Effort:** Medium (2-3h)

### 2.4 `config-helper.js` — Configuration Intelligence

**Agent consumer:** UAP (CoreConfig loader)
**Research evidence:** A1 (config loading), STR-1 (config separation)

**Purpose:** Smart config validation and optimization hints.

```javascript
/**
 * Analyze core-config.yaml for unused or redundant settings.
 * Uses code graph to check which config keys are actually referenced.
 *
 * @param {Object} config - Parsed core-config object
 * @returns {Promise<{unusedKeys: string[], suggestions: string[]}|null>}
 */
async function analyzeConfigUsage(config) { }

/**
 * Suggest config keys that could be moved to separate files.
 * Supports STR-1 (config/context separation) planning.
 *
 * @param {Object} config - Parsed core-config object
 * @returns {Promise<{static: string[], dynamic: string[], recommendation: string}|null>}
 */
async function suggestConfigSeparation(config) { }
```

**ROI:** Enables data-driven config refactoring.
**Effort:** Low (1-2h)

---

## 3. Enhancement to Existing Helpers

### 3.1 `devops-helper.js` — Add SYNAPSE Impact

**Evidence:** NOG-7 (devops impact analysis) + C1 (SYNAPSE architecture)

Currently `devops-helper.js` analyzes code impact for pre-push. Enhancement:

```javascript
/**
 * Check if changed files affect SYNAPSE domains or rules.
 * Extends blast radius to include SYNAPSE configuration.
 *
 * @param {string[]} changedFiles - Files changed in commit
 * @returns {Promise<{affectedDomains: string[], riskLevel: string}|null>}
 */
async function analyzeSynapseImpact(changedFiles) { }
```

**Effort:** Low (30min — extends existing helper)

### 3.2 `qa-helper.js` — Add Token Budget Validation

**Evidence:** C6 (token budget), C2 (context tracking)

```javascript
/**
 * Validate that SYNAPSE output stays within token budgets.
 * Part of QA quality gate for SYNAPSE-affecting changes.
 *
 * @param {Object} synapseConfig - SYNAPSE configuration
 * @returns {Promise<{withinBudget: boolean, details: Object}|null>}
 */
async function validateTokenBudgets(synapseConfig) { }
```

**Effort:** Low (1h — extends existing helper)

---

## 4. UAP Loader Optimization Map

How each helper maps to UAP loaders for optimization:

| UAP Loader | Current Issue | Helper | Optimization |
|-----------|--------------|--------|-------------|
| CoreConfig (Tier 0) | 3.3ms YAML parse, no cache | `config-helper` | Smart invalidation, usage analysis |
| AgentConfig (Tier 1) | 80ms budget, full parse | — | Already fast (0.46ms). No helper needed |
| PermissionMode (Tier 2) | Standard, no issues | — | No helper needed |
| GitConfig (Tier 2) | 52ms execSync ×3 | `activation-helper` | Suggest skipping when no git changes |
| Memory (Tier 2.5) | 500ms budget, Pro-only | — | MIS handles this internally |
| SessionContext (Tier 3) | File-based, no continuity | `session-helper` | Better detection, continuation inference |
| ProjectStatus (Tier 3) | 60% timeout rate | `activation-helper` | Freshness check, cached fallback |

### Net Impact

| Metric | Without Helpers | With Helpers |
|--------|----------------|-------------|
| Consecutive activation time | ~260ms | ~120-150ms (skip unchanged loaders) |
| Workflow suggestion accuracy | ~60% (command history) | ~85% (story Status + code graph) |
| SYNAPSE domain relevance | 100% loaded always | ~70% loaded (irrelevant skipped) |
| Token budget accuracy | ~70% (chars/4) | ~90% (code graph + XML awareness) |

---

## 5. Implementation Priority

| Helper | Priority | Effort | Depends On |
|--------|----------|--------|-----------|
| `synapse-helper.js` | P1 | 3h | QW-1 (fix updateSession) |
| `activation-helper.js` | P1 | 3h | QW-5 (git/HEAD read) |
| `session-helper.js` | P2 | 3h | MED-4, MED-5 |
| `config-helper.js` | P2 | 2h | STR-1 (config separation) |
| `devops-helper.js` (enhance) | P1 | 30min | None |
| `qa-helper.js` (enhance) | P2 | 1h | QW-3 (token estimation fix) |

### Recommended Order

```
1. devops-helper enhancement (P1, 30min, no deps)
2. synapse-helper.js (P1, 3h, after QW-1)
3. activation-helper.js (P1, 3h, after QW-5)
4. qa-helper enhancement (P2, 1h, after QW-3)
5. session-helper.js (P2, 3h, after MED-4/5)
6. config-helper.js (P2, 2h, after STR-1 planning)
```

---

## 6. Test Strategy

Each new helper follows the existing test pattern in `tests/code-intel/`:

```
tests/code-intel/
├── activation-helper.test.js   (new)
├── synapse-helper.test.js      (new)
├── session-helper.test.js      (new)
├── config-helper.test.js       (new)
├── devops-helper.test.js       (enhanced)
└── qa-helper.test.js           (enhanced)
```

Test contract for all helpers:
- Returns `null` when CodeIntelClient is not available
- Never throws exceptions
- Returns structured data matching documented interface
- Handles empty/invalid inputs gracefully

---

*Aria, arquitetando o futuro* 🏗️
