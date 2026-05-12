# Task: Design Custom Hooks

**Task ID:** CCM-PI-006
**Version:** 1.0.0
**Command:** `*hook-designer`
**Agent:** Conduit (project-integrator)
**Purpose:** Design custom Claude Code hooks for a project by identifying automation needs, choosing appropriate hook types and events, designing hook logic, and producing implementation-ready specifications.

---

## Overview

```
  Automation Needs
       |
       v
  +---------------------+
  | 1. Identify Hook     |
  |    Needs             |
  +---------------------+
       |
       v
  +---------------------+
  | 2. Choose Hook Type  |
  |    & Category        |
  +---------------------+
       |
       v
  +---------------------+
  | 3. Select Events     |
  +---------------------+
       |
       v
  +---------------------+
  | 4. Design Hook Logic |
  +---------------------+
       |
       v
  +---------------------+
  | 5. Implement & Test  |
  +---------------------+
       |
       v
  +---------------------+
  | 6. Integration       |
  |    Verification      |
  +---------------------+
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| hook_purpose | string | User | Yes | Description of what the hook should automate |
| trigger_event | string | User | No | Specific event if known (e.g., "PreToolUse", "Stop") |
| project_path | string | User or cwd | Yes | Project directory for context |

---

## Preconditions

- Claude Code installed and functional
- Understanding of the project's workflow and pain points
- `.claude/` directory exists (or will be created)

---

## Execution Phases

### Phase 1: Identify Hook Needs

Analyze the requested automation against hook capabilities:

1. **Categorize the need**:
   - Security: blocking dangerous commands, validating inputs
   - Automation: auto-formatting, auto-logging, state management
   - Quality: linting on save, test on commit, review on complete
   - Observability: timing, token tracking, cost monitoring
   - Context management: compaction, memory updates, state persistence

2. **Validate hook-suitability**: some needs are better served by:
   - Skills/commands (user-triggered, not event-triggered)
   - Rules (static instructions, not runtime logic)
   - CI/CD (post-merge, not during session)

If the need is not hook-suitable, recommend the appropriate alternative.

### Phase 2: Choose Hook Type and Category

Claude Code hooks operate in two transport modes:

| Transport | Language | Best For | Constraint |
|-----------|----------|----------|------------|
| command | Any (bash, node, python) | File operations, API calls, complex logic | Must exit within timeout |
| prompt | N/A (returns text) | Injecting context into conversation | Output added to assistant context |

**Hook categories by event:**

| Event | When Fires | Common Uses |
|-------|-----------|-------------|
| PreToolUse | Before any tool call | Block dangerous commands, validate inputs |
| PostToolUse | After tool completes | Log results, capture metrics, trigger follow-ups |
| Stop | Session ends normally | Save state, generate summary, update memory |
| SubagentStop | Subagent completes | Collect results, merge outputs |
| PreCompact | Before context compaction | Preserve critical state |
| Notification | User receives notification | Custom notification routing |
| UserPromptSubmit | User sends message | Input preprocessing, routing |

Select the appropriate event based on when the automation should trigger.

### Phase 3: Select Appropriate Events

For the identified need, determine:

1. **Primary event**: the main trigger for the hook
2. **Guard conditions**: when the hook should fire vs skip
   - Tool name filter (for PreToolUse/PostToolUse)
   - Session state checks
   - File pattern matching
3. **Timeout**: maximum execution time (default 10s for command hooks)
4. **Error behavior**: what happens if the hook fails
   - `continue`: session proceeds (recommended for non-critical hooks)
   - `stop`: session halts (use only for security-critical hooks)

### Phase 4: Design Hook Logic

Design the hook implementation:

1. **Input contract**: what data the hook receives from Claude Code
   ```json
   {
     "tool_name": "Bash",
     "tool_input": { "command": "rm -rf /tmp/test" },
     "session_id": "abc123"
   }
   ```

2. **Processing logic**: what the hook does with the input
   - Parse input data
   - Apply business logic (validation, transformation, logging)
   - Produce output (block/allow, log entry, context injection)

3. **Output contract**: what the hook returns
   - For PreToolUse: `{ "decision": "allow" }` or `{ "decision": "block", "reason": "..." }`
   - For prompt hooks: plain text to inject into conversation
   - For command hooks: exit code 0 (success) or non-zero (failure)

4. **Performance requirements**:
   - Hook must complete within timeout
   - No blocking I/O without timeouts
   - Graceful degradation on failure

5. **State management** (if needed):
   - Where to store state (file, environment variable)
   - State format (JSON, YAML)
   - Concurrency considerations

### Phase 5: Implement and Test

Create the hook implementation:

1. **Write the hook script** following the designed logic
   - Use the language best suited to the task (Node.js for JSON, Bash for simple commands)
   - Include error handling and timeout protection
   - Add inline comments explaining the logic

2. **Register the hook** in settings.json:
   ```json
   {
     "hooks": {
       "{EventName}": [
         {
           "type": "command",
           "command": "node .claude/hooks/{hook-name}.js",
           "timeout": 10000
         }
       ]
     }
   }
   ```

3. **Test the hook**:
   - Manual trigger with sample input
   - Edge cases: missing fields, malformed input, timeout simulation
   - Verify exit code and output format

### Phase 6: Integration Verification

Verify the hook works within the full Claude Code session:

1. Start a Claude Code session
2. Trigger the event that fires the hook
3. Verify the hook executed (check logs, output, or behavior)
4. Confirm no interference with other hooks or normal workflow
5. Check performance: hook completes well within timeout

---

## Output Format

```markdown
## Hook Design Specification

**Purpose:** {hook_purpose}
**Event:** {event_name}
**Type:** {command|prompt}
**Language:** {node|bash|python}

### Design

**Trigger:** {when the hook fires}
**Guard:** {conditions to skip execution}
**Timeout:** {N}ms

### Input/Output Contract

**Input:**
```json
{input_schema}
```

**Output:**
```json
{output_schema}
```

### Implementation

**File:** `.claude/hooks/{hook-name}.js`
**Registration:**
```json
{settings_json_snippet}
```

### Test Plan

| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| Normal case | {input} | {output} |
| Edge case | {input} | {output} |
| Error case | {input} | {output} |

### Performance

- Expected execution time: {N}ms
- Timeout configured: {N}ms
- Failure mode: {continue|stop}
```

---

## Veto Conditions

- **NEVER** design hooks that block all tool use without escape hatch
- **NEVER** design hooks that send data to external services without user consent
- **NEVER** set hook timeout above 30 seconds (causes session lag)
- **NEVER** use `stop` error behavior for non-security hooks
- **NEVER** design hooks that modify source code -- hooks observe and gate, they do not author

---

## Completion Criteria

- [ ] Hook need identified and validated as hook-suitable
- [ ] Hook type and event selected with rationale
- [ ] Input/output contract defined
- [ ] Hook logic designed with error handling
- [ ] Implementation created and registered in settings.json
- [ ] Test plan documented with at least 3 scenarios
- [ ] Integration verified in a real session
