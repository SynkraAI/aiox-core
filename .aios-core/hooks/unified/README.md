# Unified Hooks System

**Module:** `.aios-core/hooks/unified`
**Purpose:** Cross-CLI hook abstraction layer
**Supported CLIs:** Claude Code, Gemini Code

---

## Overview

The Unified Hooks System provides a consistent interface for lifecycle hooks across different AI coding assistants (Claude Code, Gemini Code, future CLIs).

### Architecture

```
CLI-Specific Hooks (.claude/hooks/, .gemini/hooks/)
         ↓
Hook Interface (hook-interface.js)
         ↓
Hook Runners (runners/*.js)
         ↓
Application Logic (aios-core, aios-pro)
```

---

## Components

### 1. Hook Interface (`hook-interface.js`)

**Purpose:** Normalize hook events across CLIs

**Event Mapping:**

| Unified Event | Claude Code | Gemini Code |
|---------------|-------------|-------------|
| `sessionStart` | N/A | `SessionStart` |
| `beforeAgent` | `PreToolUse` | `BeforeAgent` |
| `beforeTool` | `PreToolUse` | `BeforeTool` |
| `afterTool` | `PostToolUse` | `AfterTool` |
| `sessionEnd` | `Stop` | `SessionEnd` |

**Usage:**

```javascript
const { UnifiedHook, EVENT_MAPPING } = require('./hook-interface');

class MyHook extends UnifiedHook {
  constructor() {
    super({
      name: 'my-hook',
      event: 'beforeTool',
      matcher: 'write_file',
      timeout: 5000,
    });
  }

  async execute(context) {
    // Your logic here
    return { status: 'allow' };
  }
}
```

### 2. Hook Runners (`runners/`)

**Purpose:** Implement specific hook logic

**Current Runners:**

- **`precompact-runner.js`** (Story MIS-3)
  - Captures session digest before context compact
  - Open Core architecture (delegates to aios-pro)
  - Fire-and-forget async execution

**Runner Pattern:**

```javascript
async function onHookEvent(context) {
  try {
    // 1. Check preconditions
    // 2. Execute async (setImmediate for non-blocking)
    // 3. Return immediately
  } catch (err) {
    // Silent failure - never block user
  }
}

function getHookConfig() {
  return {
    name: 'hook-name',
    event: 'UnifiedEvent',
    handler: onHookEvent,
    timeout: 5000,
  };
}
```

### 3. Hook Registry (`hook-registry.js`)

**Purpose:** Register and discover hooks

**API:**

```javascript
const registry = require('./hook-registry');

// Register hook
registry.register(myHook);

// Get hooks for event
const hooks = registry.getHooksForEvent('beforeTool');

// Execute hooks
await registry.executeHooks('beforeTool', context);
```

---

## PreCompact Hook (Story MIS-3)

### Purpose

Capture session knowledge before context compact to preserve institutional learnings.

### Architecture

```
Claude Code PreCompact Event
         ↓
.claude/hooks/precompact-session-digest.cjs
         ↓
runners/precompact-runner.js
         ↓ (pro-detector check)
pro/memory/session-digest/extractor.js
         ↓
.aios/session-digests/{session-id}-{timestamp}.yaml
```

### Performance

- **Hook return:** < 50ms (fire-and-forget)
- **Digest completion:** < 5s
- **Never blocks compact**

### Graceful Degradation

- If aios-pro not available: no-op (log and return)
- If extraction fails: silent failure (log error)
- If write fails: error propagated to logger

---

## Creating New Hooks

### Step 1: Create Runner

```javascript
// .aios-core/hooks/unified/runners/my-runner.js

async function onMyEvent(context) {
  try {
    // Implement your logic
    console.log('[MyHook] Event fired');

    // Fire-and-forget if needed
    setImmediate(async () => {
      await doAsyncWork(context);
    });

    return; // Return immediately
  } catch (err) {
    console.error('[MyHook] Error:', err.message);
  }
}

function getHookConfig() {
  return {
    name: 'my-hook',
    event: 'beforeTool',
    handler: onMyEvent,
    timeout: 5000,
  };
}

module.exports = { onMyEvent, getHookConfig };
```

### Step 2: Register Hook

**IMPORTANT:** Claude Code hooks must be registered as `type: "command"` in `settings.json`. They run as separate processes reading JSON from stdin — NOT as module exports.

```javascript
// .claude/hooks/my-hook.cjs — Process-based hook (reads stdin)
#!/usr/bin/env node
'use strict';

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch (e) { reject(e); }
    });
  });
}

async function main() {
  const input = await readStdin();
  const { onMyEvent } = require('../../.aios-core/hooks/unified/runners/my-runner');
  await onMyEvent(input);
}

if (require.main === module) {
  main().then(() => process.exit(0)).catch(() => process.exit(0));
}
```

Then add the mapping to `HOOK_EVENT_MAP` in `packages/installer/src/wizard/ide-config-generator.js`:

```javascript
'my-hook.cjs': {
  event: 'PreToolUse', // or UserPromptSubmit, PreCompact, etc.
  matcher: null,       // or 'Write|Edit' for PreToolUse filtering
  timeout: 10,
},
```

### Step 3: Test Hook

```javascript
// tests/hooks/unified/runners/my-runner.test.js

describe('My Hook', () => {
  it('should execute without blocking', async () => {
    const startTime = Date.now();
    await onMyEvent(context);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(50); // Fire-and-forget
  });
});
```

---

## Testing

### Unit Tests

```bash
npm test -- tests/hooks/unified/
```

### Integration Tests

```bash
npm test -- tests/integration/hooks/
```

---

## Best Practices

### 1. Fire-and-Forget Pattern

```javascript
// ✓ Good: Non-blocking
setImmediate(async () => {
  await slowOperation();
});
return; // Return immediately

// ✗ Bad: Blocking
await slowOperation();
return;
```

### 2. Silent Failures

```javascript
// ✓ Good: Silent failure
catch (err) {
  console.error('[Hook] Failed:', err.message);
  // Don't throw - graceful degradation
}

// ✗ Bad: Propagates error
catch (err) {
  throw err; // Blocks user!
}
```

### 3. Timeout Limits

```javascript
// ✓ Good: < 5s timeout
{
  timeout: 5000
}

// ✗ Bad: Long timeout
{
  timeout: 30000 // May delay user
}
```

### 4. Pro Detection (Open Core)

```javascript
// ✓ Good: Graceful degradation
const { isProAvailable } = require('../../../bin/utils/pro-detector');

if (!isProAvailable()) {
  console.log('[Hook] aios-pro not available, skipping');
  return;
}

// ✗ Bad: Hard dependency
const proModule = require('../../pro/...'); // Fails if pro absent
```

---

## Related Stories

- **Story GEMINI-INT.8:** Unified Hook Interface (completed)
- **Story MIS-2:** Dead Code Cleanup (restored hooks foundation)
- **Story MIS-3:** Session Digest (PreCompact Hook)
- **Story MIS-3.1:** Fix Session-Digest Hook Registration ← **CURRENT**
- **Story PRO-5:** aios-pro Repository Bootstrap (pro-detector pattern)

---

*Unified Hooks System - AIOS Core*
*Updated: 2026-02-26 - Story MIS-3.1*
