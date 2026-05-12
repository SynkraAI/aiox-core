# Session Update Pattern

**Integration Guide for Story 6.1.4**

## Overview

The session update pattern enables intelligent greeting adaptation by tracking command execution history and agent transitions. This allows AIOX to provide contextual greetings that reflect workflow continuity.

## Architecture

```
[Agent Activation] → [Generate Greeting] → [Execute Command] → [Update Session] → [Next Activation]
                            ↑                                          ↓
                            └─────────── Session State ───────────────┘
```

## Integration Points

### 1. Command Execution Wrapper

All agent commands should be wrapped with session updates:

```javascript
const { updateSessionAfterCommand } = require('./.aiox-core/scripts/command-execution-hook');

async function executeCommand(agentId, commandName, commandFn) {
  try {
    const result = await commandFn();
    
    // Update session after successful execution
    await updateSessionAfterCommand(agentId, commandName, { result });
    
    return result;
  } catch (error) {
    // Still update session even on error
    await updateSessionAfterCommand(agentId, commandName, { 
      result: { error: error.message } 
    });
    throw error;
  }
}
```

### 2. Agent Transition Tracking

When switching agents, record the transition:

```javascript
const { updateSessionAfterCommand } = require('./.aiox-core/scripts/command-execution-hook');

async function switchAgent(fromAgent, toAgent) {
  await updateSessionAfterCommand(toAgent, 'agent-activation', {
    previousAgent: fromAgent
  });
}
```

### 3. Session-Aware Greeting

The greeting system automatically uses session state:

```javascript
const GreetingBuilder = require('./.aiox-core/development/scripts/greeting-builder');
const builder = new GreetingBuilder();

// Session context is loaded automatically
const greeting = await builder.buildGreeting(agentDef, { conversationHistory: [] });
console.log(greeting);
```

## Session State Structure

```json
{
  "sessionType": "workflow",
  "currentAgent": "dev",
  "previousAgent": "qa",
  "commandHistory": [
    {
      "command": "review",
      "agent": "qa",
      "timestamp": 1234567890,
      "success": true
    },
    {
      "command": "apply-qa-fixes",
      "agent": "dev",
      "timestamp": 1234567900,
      "success": true
    }
  ],
  "agentTransitions": [
    {
      "from": "qa",
      "to": "dev",
      "timestamp": 1234567895
    }
  ],
  "createdAt": 1234567800,
  "lastUpdated": 1234567900
}
```

## Session Types

### New Session
- **Criteria:** No command history
- **Greeting:** Full introduction, all commands, project status
- **Use Case:** First interaction in conversation

### Existing Session
- **Criteria:** 1-2 commands in history
- **Greeting:** Quick commands only, abbreviated status
- **Use Case:** User returning to same agent

### Workflow Session
- **Criteria:** 3+ commands OR agent transitions
- **Greeting:** Minimal presentation, workflow suggestions
- **Use Case:** Multi-agent collaboration flow

## Implementation Checklist

### Phase 1: Core Integration (Story 6.1.4)
- [x] Create `command-execution-hook.js`
- [x] Update `generate-greeting.js` to load session
- [x] Modify `greeting-builder.js` to adapt to session type
- [ ] Document pattern (this file)

### Phase 2: Agent Integration (Future)
- [ ] Wrap QA commands with session updates
- [ ] Wrap Dev commands with session updates
- [ ] Wrap PM/PO/SM commands with session updates
- [ ] Add agent transition tracking to `/AIOX/agents/*` commands

### Phase 3: Advanced Features (Future)
- [ ] Workflow pattern detection (e.g., "QA → Dev → QA" cycle)
- [ ] Smart command suggestions based on history
- [ ] Session persistence across conversations
- [ ] Analytics dashboard for common workflows

## Usage Examples

### Example 1: Single Agent Session

```javascript
// First activation
await updateSessionAfterCommand('dev', 'agent-activation');
// → sessionType: 'new'

// Execute command
await updateSessionAfterCommand('dev', 'develop-yolo');
// → sessionType: 'existing'

// Next activation shows abbreviated greeting
const GreetingBuilder = require('./.aiox-core/development/scripts/greeting-builder');
const builder = new GreetingBuilder();
const greeting = await builder.buildGreeting(devAgent, { conversationHistory });
// Uses 'existing' session type
```

### Example 2: Multi-Agent Workflow

```javascript
// QA reviews code
await updateSessionAfterCommand('qa', 'review');
// → sessionType: 'existing'

// QA finds issues
await updateSessionAfterCommand('qa', 'gate');
// → sessionType: 'existing'

// Switch to Dev
await updateSessionAfterCommand('dev', 'agent-activation', {
  previousAgent: 'qa'
});
// → sessionType: 'workflow' (agent transition detected)

// Dev applies fixes
await updateSessionAfterCommand('dev', 'apply-qa-fixes');
// → sessionType: 'workflow'

// Next greeting shows workflow context
const GreetingBuilder = require('./.aiox-core/development/scripts/greeting-builder');
const builder = new GreetingBuilder();
const greeting = await builder.buildGreeting(devAgent, { conversationHistory });
// Includes: "Continuing from @qa review..."
```

## Performance Considerations

### Session File Location
- **Path:** `.aiox-core/.session/current-session.json`
- **Size:** ~1-2KB (with history limit)
- **I/O:** Read on greeting, write after command
- **Impact:** <10ms per operation

### Caching Strategy
Session state is not cached (always fresh reads) to ensure accuracy across:
- Multiple terminal sessions
- Concurrent agent activations
- Manual session edits

### Error Handling
All session operations are non-blocking:
- Failed reads → Default to 'new' session
- Failed writes → Log warning, continue execution
- Corrupted JSON → Reset to empty session

## Testing

### Unit Tests
```bash
node tests/unit/command-execution-hook.test.js
```

### Integration Tests
```bash
node tests/integration/session-workflow.test.js
```

### Manual Testing
```bash
# Clear session
rm .aiox-core/.session/current-session.json

# Test new session greeting
node .aiox-core/development/scripts/test-greeting-system.js

# Simulate command
node -e "require('./.aiox-core/scripts/command-execution-hook').updateSessionAfterCommand('dev', 'develop-yolo')"

# Test existing session (command history exists)
node .aiox-core/development/scripts/test-greeting-system.js
```

## Troubleshooting

### Session Not Updating
**Symptom:** Greetings always show "new" session
**Solution:** Check session file permissions and path

```bash
ls -la .aiox-core/.session/
cat .aiox-core/.session/current-session.json
```

### Wrong Session Type
**Symptom:** Workflow session detected too early/late
**Solution:** Adjust thresholds in `determineSessionType()`

```javascript
// In command-execution-hook.js
function determineSessionType(commandHistory) {
  if (commandHistory.length >= 3) { // Adjust this threshold
    return 'workflow';
  }
  // ...
}
```

### Commands Not Tracked
**Symptom:** Command history empty
**Solution:** Ensure commands call `updateSessionAfterCommand()`

```javascript
// Add to command wrapper
await updateSessionAfterCommand(agentId, commandName);
```

## Migration Notes

### From Inline Greeting Logic
Old approach (deprecated):
```javascript
// STEP 3: Generate contextual greeting using inline logic
// 1. Detect session type from conversation history...
```

New approach (Story 6.1.4):
```javascript
// STEP 3: Build intelligent greeting using GreetingBuilder
const GreetingBuilder = require('./.aiox-core/development/scripts/greeting-builder');
const builder = new GreetingBuilder();
const greeting = await builder.buildGreeting(agentDef, { conversationHistory });
```

### Backward Compatibility
- Session updates are optional (system defaults to 'new')
- Agents work without integration (degraded UX only)
- No breaking changes to existing commands

## Future Enhancements

### Planned (Post-Story 6.1.4)
1. **Workflow Pattern Library:** Detect common sequences (e.g., "review → fix → test")
2. **Smart Suggestions:** Recommend next command based on history
3. **Session Analytics:** Track which workflows are most common
4. **Cross-Conversation Persistence:** Link sessions across Claude conversations

### Under Consideration
- Session branching for parallel workflows
- Command rollback/undo tracking
- Session export for debugging
- Real-time session dashboard

---

**Related Documentation:**
- [Story 6.1.4 Implementation](../../stories/aiox migration/story-6.1.4.md)
- [Agent Configuration Guide](../config/agent-config-requirements.yaml)
- [Greeting System Architecture](./greeting-system-architecture.md)

**Last Updated:** 2025-01-18 (Story 6.1.4)

