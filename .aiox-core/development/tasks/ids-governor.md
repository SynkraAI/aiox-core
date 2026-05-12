# Task: IDS Governor Commands

**Task ID:** ids-governor
**Version:** 1.0
**Purpose:** Execute IDS Framework Governor commands (*ids query, *ids health, *ids stats, *ids impact)
**Agent:** @aiox-master
**Story:** IDS-7 (aiox-master IDS Governor Integration)

---

## Overview

This task handles the execution of IDS (Incremental Development System) commands through the FrameworkGovernor facade. All commands are advisory and non-blocking.

### Available Commands

| Command | Description | Arguments |
|---------|-------------|-----------|
| `*ids query {intent}` | Query registry for REUSE/ADAPT/CREATE recommendations | intent (required), --type (optional) |
| `*ids health` | Registry health check | none |
| `*ids stats` | Registry statistics (entity counts, health score) | --json (optional) |
| `*ids impact {entity-id}` | Impact analysis for modifications | entity-id (required) |

---

## Execution Steps

### *ids query {intent}

1. Load FrameworkGovernor (RegistryLoader + DecisionEngine + RegistryUpdater)
2. Call `governor.preCheck(intent, entityType)`
3. Display formatted output using `FrameworkGovernor.formatPreCheckOutput(result)`
4. If matches found, present options: [1] ADAPT existing [2] CREATE new [3] Skip
5. Log decision

### *ids health

1. Load FrameworkGovernor
2. Call `governor.healthCheck()`
3. If RegistryHealer available: display full health report
4. If RegistryHealer unavailable: display basic stats with degraded mode message
5. Show entity count and registry loaded status

### *ids stats

1. Load FrameworkGovernor
2. Call `governor.getStats()`
3. Display formatted output using `FrameworkGovernor.formatStatsOutput(result)`
4. Show: totalEntities, byType, byCategory, healthScore, healerAvailable

### *ids impact {entity-id}

1. Load FrameworkGovernor
2. Call `governor.impactAnalysis(entityId)`
3. Display formatted output using `FrameworkGovernor.formatImpactOutput(result)`
4. Show: directConsumers, indirectConsumers, riskLevel, adaptabilityScore
5. If HIGH/CRITICAL risk: display warning

---

## CLI Equivalents

All commands are also available via CLI:

```bash
node bin/aiox-ids.js ids:check "your intent" --type task
node bin/aiox-ids.js ids:impact create-doc
node bin/aiox-ids.js ids:stats --json
node bin/aiox-ids.js ids:register path/to/file.md
```

---

## Dependencies

- `.aiox-core/core/ids/framework-governor.js` — FrameworkGovernor class
- `.aiox-core/core/ids/registry-loader.js` — RegistryLoader
- `.aiox-core/core/ids/incremental-decision-engine.js` — DecisionEngine
- `.aiox-core/core/ids/registry-updater.js` — RegistryUpdater
- `.aiox-core/core/ids/registry-healer.js` — RegistryHealer (optional, IDS-4a)

---

## Error Handling

All commands apply graceful degradation:
- Timeout: 2 seconds (warn and proceed)
- Missing healer: Show degraded mode message
- Registry load failure: Display error with recovery suggestion
- All operations are advisory and never block the user

---

*IDS-7 | Created 2026-02-10 by @dev (Dex)*
