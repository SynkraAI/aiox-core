# Memory Intelligence System - Integration Guide

**Epic:** MIS (Memory Intelligence System)
**Story:** MIS-6 - Pipeline Integration & Agent Memory API
**Last Updated:** 2026-02-09

---

## Overview

This guide explains how the Memory Intelligence System integrates with the UnifiedActivationPipeline to provide agents with automatic access to institutional knowledge.

**Key Concepts:**
- **Progressive Disclosure:** Memories loaded in layers (HOT → WARM → COLD) based on token budget
- **Agent Scoping:** Each agent accesses only their own + shared memories (privacy enforced)
- **Graceful Degradation:** System works at all levels (no pro, no digests, with digests)
- **Feature Gating:** Memory features controlled via `pro.memory.extended` and `pro.memory.pipeline-integration`

---

## Architecture

### Extension Point Pattern

The integration follows the AIOX Open Core model:
- **aiox-core:** Extension point in UnifiedActivationPipeline (this guide)
- **aiox-pro:** Memory intelligence implementation (retrieval, scoring, learning)

```
UnifiedActivationPipeline (Tier 2 Enrich)
  └─> isProAvailable()?
      ├─> YES: Load MemoryLoader from pro/
      │   └─> isFeatureEnabled('pro.memory.extended')?
      │       ├─> YES: Load memories into enrichedContext.memories
      │       └─> NO: enrichedContext.memories = []
      └─> NO: enrichedContext.memories = []
```

### Data Flow

1. **Agent Activation:**
   ```javascript
   @dev  // User activates dev agent
   ```

2. **Pipeline Tier 2 (Enrich):**
   ```javascript
   // UnifiedActivationPipeline checks pro availability
   if (isProAvailable()) {
     const MemoryLoader = loadProModule('memory/memory-loader');
     const loader = new MemoryLoader(projectRoot);

     // Load memories for agent with budget
     const result = await loader.loadForAgent('dev', { budget: 2000 });
     enrichedContext.memories = result.memories;
   }
   ```

3. **Progressive Disclosure:**
   ```javascript
   // HOT tier first (high-attention memories)
   hotMemories = retrieve({ tier: 'hot', layer: 1 }) // ~600 tokens

   // If budget allows, add WARM tier
   if (tokensUsed < budget * 0.7) {
     warmMemories = retrieve({ tier: 'warm', layer: 2 }) // ~800 tokens
   }

   // Total: 13 memories, 1400 tokens used
   ```

4. **Context Enrichment:**
   ```javascript
   enrichedContext = {
     agent: agentDefinition,
     config: agentConfig,
     memories: [
       {
         id: 'mem-001',
         title: 'Story MIS-4 completed with 121 tests',
         summary: 'Progressive Memory Retrieval implemented...',
         sector: 'procedural',
         tier: 'hot',
         attention_score: 0.85,
         agent: 'dev'
       },
       // ... 12 more memories
     ],
     // ... other context fields
   }
   ```

---

## Memory Loader API

The Memory Loader provides 6 methods for memory retrieval:

### 1. `loadForAgent(agentId, options)` - Primary Method

Load memories for agent activation (used by UnifiedActivationPipeline).

```javascript
const { MemoryLoader } = require('pro/memory/memory-loader');
const loader = new MemoryLoader(projectRoot);

const result = await loader.loadForAgent('dev', {
  budget: 2000,      // Token budget
  layers: [1, 2]     // Progressive disclosure layers
});

// Result:
{
  memories: [
    { id, title, summary, sector, tier, attention_score, agent, ... }
  ],
  metadata: {
    agent: 'dev',
    count: 13,
    tokensUsed: 1400,
    budget: 2000,
    tiers: ['hot', 'warm']
  }
}
```

**Progressive Disclosure Logic:**
- Starts with HOT tier (Layer 1 - index only)
- If `tokensUsed < budget * 0.7`, adds WARM tier (Layer 2 - context chunks)
- Never exceeds configured budget

### 2. `queryMemories(agentId, options)` - Flexible Query

Query memories with advanced filtering.

```javascript
const memories = await loader.queryMemories('dev', {
  tokenBudget: 2000,
  attentionMin: 0.3,              // WARM+ by default
  sectors: ['procedural', 'semantic'],  // Override agent preferences
  tags: ['performance', 'testing'],
  tier: 'hot',                    // Filter by tier
  layer: 1,                       // Force specific layer
  limit: 10                       // Max memories to return
});
```

### 3. `getHotMemories(agentId, options)` - Quick Access

Get only high-attention memories (score > 0.7).

```javascript
const hotMemories = await loader.getHotMemories('dev', {
  limit: 5,
  tokenBudget: 1000
});
```

### 4. `getWarmMemories(agentId, options)` - Moderate Attention

Get moderate-attention memories (0.3 ≤ score < 0.7).

```javascript
const warmMemories = await loader.getWarmMemories('dev', {
  limit: 10,
  tokenBudget: 1500
});
```

### 5. `searchByTags(agentId, tags, options)` - Tag-Based Retrieval

Find memories by tags.

```javascript
const memories = await loader.searchByTags('dev', ['mcp', 'docker'], {
  limit: 5
});
```

### 6. `getRecentMemories(agentId, days, options)` - Time-Based

Get memories from last N days.

```javascript
const recentMemories = await loader.getRecentMemories('dev', 7, {
  limit: 10
});
```

---

## Agent Sector Preferences

Each agent has preferred cognitive sectors based on their role:

| Agent | Sectors | Rationale |
|-------|---------|-----------|
| **dev** | Procedural, Semantic | HOW (patterns, gotchas) + WHAT (facts, APIs) |
| **qa** | Reflective, Episodic | LEARNED (mistakes) + HAPPENED (test results) |
| **architect** | Semantic, Reflective | WHAT (architecture) + LEARNED (design decisions) |
| **pm** | Episodic, Semantic | HAPPENED (decisions) + FACTS (requirements) |
| **po** | Episodic, Semantic | HAPPENED (feedback) + FACTS (stories) |
| **sm** | Procedural, Episodic | HOW (process) + HAPPENED (sprint events) |

**4 Cognitive Sectors:**
1. **Episodic:** What happened (events, outcomes, milestones)
2. **Semantic:** What is true (facts, definitions, architecture)
3. **Procedural:** How to do things (patterns, gotchas, procedures)
4. **Reflective:** What was learned (insights, corrections, lessons)

---

## Token Budget Management

### Default Budget

```javascript
// Default: 2000 tokens per agent activation
const defaultBudget = 2000;
```

### Custom Budget (Agent Config)

Configure per-agent budgets in agent config:

```yaml
# .aiox-core/development/agents/dev.md
agent:
  id: dev
  config:
    memoryBudget: 3000  # Custom budget for dev agent
```

### Progressive Disclosure Strategy

1. **HOT Tier (Layer 1 - Index Only):**
   - High-attention memories (score > 0.7)
   - Typical usage: 600 tokens (8 memories × 75 tokens each)

2. **WARM Tier (Layer 2 - Context Chunks):**
   - Added only if `tokensUsed < budget * 0.7`
   - Typical usage: 800 tokens (5 memories × 160 tokens each)

3. **Total:**
   - 13 memories, 1400 tokens (70% of 2000 budget)
   - Leaves 600 tokens buffer for system overhead

---

## Graceful Degradation

The system works at 3 levels:

### Level 1: No Pro Available

```javascript
isProAvailable() === false
```

**Behavior:**
- `enrichedContext.memories = []`
- No errors thrown
- Pipeline continues normally
- Agents function as they did before MIS

### Level 2: Pro Available, No Digests

```javascript
isProAvailable() === true
// but .aiox/session-digests/ is empty
```

**Behavior:**
- `MemoryLoader` returns `{ memories: [], metadata: { count: 0 } }`
- No errors thrown
- Pipeline continues normally

### Level 3: Pro Available, With Digests

```javascript
isProAvailable() === true
// and .aiox/session-digests/ contains memory digests
```

**Behavior:**
- Full memory intelligence active
- Memories loaded and injected into `enrichedContext`
- Agent receives institutional knowledge automatically

---

## Feature Gate Configuration

### Required Features

1. **pro.memory.extended:** Controls memory injection
2. **pro.memory.pipeline-integration:** Tracks integration status

### Checking Feature Availability

```javascript
const { featureGate } = require('pro/license/feature-gate');

if (featureGate.isAvailable('pro.memory.extended')) {
  // Memory injection enabled
}

if (featureGate.isAvailable('pro.memory.pipeline-integration')) {
  // Pipeline integration active
}
```

### License Tiers

| Tier | Features Included |
|------|------------------|
| **Individual** | `pro.memory.extended` |
| **Team** | `pro.memory.*` (all memory features) |
| **Enterprise** | `pro.*` (all pro features) |

---

## Performance Requirements

### Latency Targets

- **Memory Load (Tier 2):** < 200ms typical
- **Timeout Safeguard:** 500ms max
- **Total Pipeline:** < 500ms (including memory load)

### Performance Monitoring

The pipeline tracks memory loader metrics:

```javascript
result.metrics.loaders.memories = {
  status: 'ok',          // 'ok' | 'timeout' | 'error'
  duration: 45,          // milliseconds
  startTime: 1234567890,
  endTime: 1234567935
}
```

---

## Agent Privacy

### Scoping Rules

Each agent accesses ONLY:
1. **Own memories:** `agent === agentId`
2. **Shared memories:** `agent === 'shared'`

**NEVER:**
- Private memories of other agents

### Example

```javascript
// Dev agent activates
const devResult = await pipeline.activate('dev');

// Dev sees:
devResult.context.memories.map(m => m.agent)
// → ['dev', 'dev', 'shared', 'dev', 'shared', ...]

// QA agent activates
const qaResult = await pipeline.activate('qa');

// QA sees:
qaResult.context.memories.map(m => m.agent)
// → ['qa', 'shared', 'qa', 'qa', 'shared', ...]
```

**Privacy Enforcement:**
- Implemented at retrieval layer (`memory-retriever.js`)
- 6 dedicated privacy tests (from MIS-4)
- No cross-agent leaks detected

---

## Troubleshooting

### Issue: Memories Not Appearing

**Diagnosis:**
```javascript
// Check pro availability
const { isProAvailable } = require('bin/utils/pro-detector');
console.log('Pro available:', isProAvailable());

// Check feature gate
const { featureGate } = require('pro/license/feature-gate');
console.log('Memory enabled:', featureGate.isAvailable('pro.memory.extended'));

// Check digests directory
const fs = require('fs');
const digests = fs.readdirSync('.aiox/session-digests');
console.log('Digests:', digests.length);
```

**Solutions:**
1. **Pro not available:** Initialize `pro/` submodule: `git submodule update --init --recursive`
2. **Feature gate disabled:** Check license key: `cat pro/license-cache.json`
3. **No digests:** Capture first session: `@dev` (activate any agent, then compact context)

### Issue: Memory Load Timeout

**Diagnosis:**
```javascript
result.metrics.loaders.memories.status === 'timeout'
result.metrics.loaders.memories.duration > 500
```

**Solutions:**
1. Reduce digest count (archive old digests to `.aiox/session-digests/archive/`)
2. Increase timeout (in `unified-activation-pipeline.js`): `memoryTimeout = 1000`
3. Rebuild memory index: `node pro/memory/rebuild-index.js`

### Issue: Wrong Memories for Agent

**Diagnosis:**
```javascript
// Verify agent sector preferences
const { AGENT_SECTOR_PREFERENCES } = require('pro/memory/memory-loader');
console.log('Dev sectors:', AGENT_SECTOR_PREFERENCES['dev']);
```

**Solutions:**
1. Update sector preferences in `pro/memory/memory-loader.js`
2. Override sectors in query: `loader.loadForAgent('dev', { sectors: ['custom'] })`
3. Retrain attention scoring (MIS-5 - Self-Learning Engine, future story)

---

## Integration Tests

### Test Coverage

5 integration test scenarios:

1. **No Pro Available:** Activation without pro/ → empty memories, no errors
2. **Pro Available, No Digests:** Pro present but no memory data → empty array
3. **Pro Available, With Digests:** Full MIS active → memories injected
4. **Token Budget Enforcement:** Never exceeds configured limit
5. **Agent Scoping Privacy:** Only own + shared memories returned

### Running Tests

```bash
# Run all integration tests
npm test -- tests/integration/pipeline-memory-integration.test.js

# Run specific scenario
npm test -- tests/integration/pipeline-memory-integration.test.js -t "No Pro Available"

# With coverage
npm test -- tests/integration/pipeline-memory-integration.test.js --coverage
```

**Target Coverage:** >= 85% for integration code

---

## Related Documentation

- **[Memory System (Current State)](MEMORY-SYSTEM.md)** - Overview of memory architecture
- **[Memory Intelligence System (Target State)](MEMORY-INTELLIGENCE-SYSTEM.md)** - Full MIS vision
- **Story MIS-3:** Session Digest (PreCompact Hook) - Memory capture
- **Story MIS-4:** Progressive Memory Retrieval - Retrieval API
- **Story MIS-6:** Pipeline Integration - This guide

---

## Future Enhancements

**MIS-5: Self-Learning Engine** (Pending)
- Automatic attention scoring tuning
- Pattern recognition from user corrections
- Heuristic extraction from outcomes

**MIS-7: CLAUDE.md Auto-Evolution** (Pending)
- Rule updates based on learnings
- Agent config auto-optimization
- Gotchas auto-documentation

---

*Memory Intelligence System - Integration Guide*
*Last Updated: 2026-02-09*
*Epic MIS - Story MIS-6*
