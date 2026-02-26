# Output Taxonomy — UAP Output Presets Definition

**Story:** NOG-9 — UAP & SYNAPSE Deep Research (Task 7)
**Author:** Aria (Architect Agent)
**Date:** 2026-02-21
**Based on:** 21 research reports + comparative matrix

---

## 1. Problem Statement

The UAP `activate()` currently returns a single monolithic object with **no output presets**:

```javascript
return {
  greeting,           // string (~8 lines formatted)
  context: enrichedContext,  // object (~20-25KB including _coreConfig)
  quality,            // 'full' | 'partial' | 'fallback'
  fallback,           // boolean (backward compat)
  metrics,            // object (per-loader timings)
};
```

The `enrichedContext` includes `_coreConfig` (~15-20KB) which is **never needed by consumers** — it was shared with GreetingBuilder during pipeline execution but leaks into the return value.

### Industry Comparison (from D1, D3, D4 research)

| Tool | Output Approach | Size |
|------|----------------|------|
| Claude Code | Flat merge of CLAUDE.md + rules (pre-loaded, 0 per-prompt cost) | Variable |
| Codex CLI | Metadata-first, full content on-demand (progressive) | ~200B metadata, full on request |
| Gemini CLI | 5-level concatenation (pre-loaded) | Variable |
| Cursor | SQLite-backed (DB query, no serialization) | N/A |
| **AIOS UAP** | Full object dump, no presets | ~25KB always |

---

## 2. Preset Definitions

### 2.1 `compact` — Greeting Only

**Use case:** Agent activation display, CI/CD scripts, health checks.

```typescript
interface CompactOutput {
  greeting: string;        // Formatted greeting (~8 lines)
  quality: 'full' | 'partial' | 'fallback';
  duration: number;        // Pipeline execution time (ms)
  agentId: string;         // Active agent ID
}
```

**Target size:** ~500-800 bytes
**Serialization time:** <0.1ms
**When to use:** Default for `generate-greeting.js` CLI wrapper, SYNAPSE session writes.

### 2.2 `standard` — Greeting + Key Metrics

**Use case:** Normal agent activation with diagnostic info.

```typescript
interface StandardOutput {
  greeting: string;
  quality: 'full' | 'partial' | 'fallback';
  duration: number;
  agentId: string;
  metrics: {
    loaders: Record<string, { duration: number; success: boolean }>;
    tiersCompleted: string[];    // ['critical', 'high', 'bestEffort']
    totalLoaderTime: number;
  };
  session: {
    type: 'new' | 'existing' | 'workflow';
    previousAgent: string | null;
    workflowState: string | null;
  };
}
```

**Target size:** ~2-4KB
**Serialization time:** <0.5ms
**When to use:** Default for interactive activation, debugging slow activations.

### 2.3 `full` — Context Without Config Blob

**Use case:** Deep diagnostics, context inspection, test assertions.

```typescript
interface FullOutput {
  greeting: string;
  quality: 'full' | 'partial' | 'fallback';
  duration: number;
  agentId: string;
  metrics: StandardOutput['metrics'];
  context: {
    agent: AgentDefinition;       // Agent persona, commands
    session: SessionContext;       // Session type, history
    projectStatus: ProjectStatus; // Branch, modified files
    gitConfig: GitConfig;         // Provider, branch
    permissions: PermissionData;  // Mode, badge
    preference: string;           // Greeting level
    sessionType: string;
    workflowState: string | null;
    userProfile: string;
    memories: MemoryHint[];
    // NOTE: _coreConfig EXCLUDED
  };
}
```

**Target size:** ~5-10KB (without _coreConfig)
**Serialization time:** <1ms
**When to use:** `--verbose` flag, test suites, SYNAPSE diagnostics.

### 2.4 `debug` — Everything Including Internals

**Use case:** Bug reproduction, performance profiling, framework development.

```typescript
interface DebugOutput {
  greeting: string;
  quality: 'full' | 'partial' | 'fallback';
  duration: number;
  agentId: string;
  metrics: {
    loaders: Record<string, {
      duration: number;
      success: boolean;
      tier: string;
      timeout: number;
      error?: string;
    }>;
    tiersCompleted: string[];
    totalLoaderTime: number;
    pipelineTimeout: number;
    bootTime: number;          // SYN-14 cold start
  };
  context: FullOutput['context'] & {
    _coreConfig: object;       // Full core-config.yaml
    _rawLoaderResults: object;  // Pre-enrichment loader data
    conversationHistory: any[]; // Legacy compat fields
  };
  _internals: {
    nodeVersion: string;
    platform: string;
    cwd: string;
    env: {
      AIOS_DEBUG: string;
      AIOS_PIPELINE_TIMEOUT: string;
    };
  };
}
```

**Target size:** ~25-40KB
**Serialization time:** ~2-5ms
**When to use:** `AIOS_DEBUG=true`, `*session-info` command, bug reports.

---

## 3. Implementation Design

### 3.1 API Surface

```javascript
// Option A: Parameter on activate()
const result = await UnifiedActivationPipeline.activate('dev', {
  outputPreset: 'compact',  // default: 'compact'
});

// Option B: Post-hoc formatting (recommended — no pipeline changes)
const result = await UnifiedActivationPipeline.activate('dev');
const output = formatOutput(result, 'standard');
```

**Recommendation:** Option B (post-hoc formatter). Reasons:
1. Zero changes to existing pipeline logic
2. Backward compatible — existing consumers unaffected
3. Testable independently
4. Follows Codex CLI pattern: metadata-first, detail on-demand (D3 research)

### 3.2 Formatter Function

```javascript
/**
 * Format UAP activation result to a specific preset.
 * @param {Object} result - Raw activate() result
 * @param {'compact'|'standard'|'full'|'debug'} preset - Output preset
 * @returns {Object} Formatted output matching preset interface
 */
function formatActivationOutput(result, preset = 'compact') {
  switch (preset) {
    case 'compact':
      return {
        greeting: result.greeting,
        quality: result.quality,
        duration: result.metrics?._pipelineDuration || 0,
        agentId: result.context?.agent?.id,
      };

    case 'standard':
      return {
        ...formatActivationOutput(result, 'compact'),
        metrics: summarizeMetrics(result.metrics),
        session: {
          type: result.context?.sessionType,
          previousAgent: result.context?.previousAgent,
          workflowState: result.context?.workflowState,
        },
      };

    case 'full': {
      const { _coreConfig, conversationHistory, ...cleanContext } = result.context || {};
      return {
        ...formatActivationOutput(result, 'standard'),
        context: cleanContext,
      };
    }

    case 'debug':
      return {
        ...formatActivationOutput(result, 'standard'),
        context: result.context,
        _internals: {
          nodeVersion: process.version,
          platform: process.platform,
          cwd: process.cwd(),
          env: {
            AIOS_DEBUG: process.env.AIOS_DEBUG || '',
            AIOS_PIPELINE_TIMEOUT: process.env.AIOS_PIPELINE_TIMEOUT || '',
          },
        },
      };

    default:
      return formatActivationOutput(result, 'compact');
  }
}
```

### 3.3 Resolution Logic

```
1. CLI flag (--output=standard)    → highest priority
2. Environment var (AIOS_OUTPUT)   → medium priority
3. AIOS_DEBUG=true                 → forces 'debug'
4. core-config.yaml setting        → project default
5. Default                         → 'compact'
```

---

## 4. Benchmarks (Estimated)

Based on current `enrichedContext` structure and JSON.stringify measurements:

| Preset | Serialized Size | Stringify Time | Reduction vs Current |
|--------|----------------|----------------|---------------------|
| `compact` | ~600B | <0.1ms | **97% smaller** |
| `standard` | ~3KB | ~0.3ms | **88% smaller** |
| `full` | ~8KB | ~0.8ms | **68% smaller** |
| `debug` | ~30KB | ~3ms | Baseline (current) |

### Key Insight

The current pipeline **always returns `debug`-level output** (~25KB). Simply defaulting to `compact` eliminates 97% of serialization overhead for the most common use case (displaying a greeting).

### Validation Methodology

To benchmark with real data:
```bash
node -e "
  const { UnifiedActivationPipeline } = require('./.aios-core/development/scripts/unified-activation-pipeline');
  const { formatActivationOutput } = require('./.aios-core/development/scripts/output-formatter');
  (async () => {
    const result = await UnifiedActivationPipeline.activate('dev');
    for (const preset of ['compact', 'standard', 'full', 'debug']) {
      const start = process.hrtime.bigint();
      const output = formatActivationOutput(result, preset);
      const serialized = JSON.stringify(output);
      const elapsed = Number(process.hrtime.bigint() - start) / 1e6;
      console.log(\`\${preset}: \${serialized.length}B in \${elapsed.toFixed(2)}ms\`);
    }
  })();
"
```

---

## 5. Consumer Mapping

| Consumer | Current Behavior | Recommended Preset |
|----------|-----------------|-------------------|
| `generate-greeting.js` (CLI) | Returns full context | `compact` |
| SYNAPSE session write | Writes agentId + quality | `compact` |
| `*session-info` command | Displays metrics | `standard` |
| Test suites (`tests/`) | Asserts on context fields | `full` |
| UAP diagnostics | Performance profiling | `debug` |
| Code-intel helpers | Enrichment input | `full` (specific fields) |

---

## 6. Migration Path

### Phase 1: Non-Breaking (Quick Win)
- Create `output-formatter.js` as standalone utility
- Update `generate-greeting.js` to use `compact` preset
- No changes to `activate()` return value

### Phase 2: Optimize Pipeline
- Stop including `_coreConfig` in `enrichedContext` by default
- Add `outputPreset` option to `activate()` for early-exit optimization
- Skip serialization of unused fields when preset is known upfront

### Phase 3: Progressive Loading (Strategic)
- Adopt Codex CLI pattern: return metadata immediately, load details on-demand
- `activate()` returns `compact` instantly
- `getFullContext()` loads remaining data lazily

---

*Aria, arquitetando o futuro* 🏗️
