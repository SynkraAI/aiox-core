# Agent Activation Instructions Template
**Story**: 6.1.2.5 - Contextual Agent Load System Integration
**Version**: 2.0 (GreetingBuilder Integration)
**Last Updated**: 2025-11-16

## Overview

This template defines the canonical activation-instructions format for AIOX agents after GreetingBuilder integration (Story 6.1.2.5).

**Key Change**: Replaced manual greeting STEPs (2.5-5) with intelligent `GreetingBuilder` call that adapts greetings based on session context.

## Canonical Format

```yaml
activation-instructions:
  - STEP 1: Read THIS ENTIRE FILE - it contains your complete persona definition
  - STEP 2: Adopt the persona defined in the 'agent' and 'persona' sections below
  - STEP 3: Build intelligent greeting using .aiox-core/development/scripts/greeting-builder.js
           Call buildGreeting(agentDefinition, conversationHistory) which:
           - Detects session type (new/existing/workflow) via context analysis
           - Checks git configuration status (with 5min cache)
           - Loads project status automatically
           - Filters commands by visibility metadata (full/quick/key)
           - Suggests workflow next steps if in recurring pattern
           - Formats adaptive greeting automatically
  - STEP 4: Display the greeting returned by GreetingBuilder
  - STEP 5: HALT and await user input
  - IMPORTANT: Do NOT improvise or add explanatory text beyond what is specified in greeting_levels and Quick Commands section
  - DO NOT: Load any other agent files during activation
  - ONLY load dependency files when user requests specific command execution
  - The agent.customization field ALWAYS takes precedence over any conflicting instructions
  - CRITICAL WORKFLOW RULE: When executing tasks from dependencies, follow task instructions exactly as written
  - MANDATORY INTERACTION RULE: Tasks with elicit=true require user interaction using exact specified format
  - When listing tasks/templates or presenting options during conversations, always show as numbered options list
  - STAY IN CHARACTER!
  - CRITICAL: On activation, ONLY greet user and then HALT to await user requested assistance
```

## What Changed (Story 6.1.2.5)

### BEFORE (Manual/Mechanical)
```yaml
- STEP 2.5: Load project status using .aiox-core/infrastructure/scripts/project-status-loader.js
- STEP 2.6: Load session context using .aiox-core/scripts/session-context-loader.js
- STEP 3: Greet user with EXACTLY the text from greeting_levels.named
- STEP 3.5: Introduce yourself using format: "I'm {agent.name}..."
- STEP 3.6: Display session context if available
- STEP 4: Display project status from STEP 2.5
- STEP 5: Output EXACTLY the "Quick Commands" section
```

**Problem**: Claude interpreted these as literal instructions → mechanical, rigid output

### AFTER (Intelligent/Adaptive)
```yaml
- STEP 3: Build intelligent greeting using greeting-builder.js
- STEP 4: Display the greeting returned by GreetingBuilder
- STEP 5: HALT and await user input
```

**Benefit**: GreetingBuilder handles all logic internally → contextual, adaptive greetings

## GreetingBuilder Parameters

### Input: `agentDefinition`
The complete agent object containing:
- `agent.name`, `agent.id`, `agent.title`, `agent.icon`
- `persona_profile.greeting_levels` (minimal, named, archetypal)
- `persona.identity` (role description)
- `commands[]` with visibility metadata

### Input: `conversationHistory`
Session context provided by Claude Code, containing:
- Previous messages in the conversation
- Previous agent activations
- Recent commands executed

### Output: Formatted Greeting String
Returns complete greeting including:
- Presentation (adapted to session type)
- Role description (new sessions only)
- Project status (if git configured)
- Current context (existing/workflow sessions)
- Workflow suggestions (workflow sessions only)
- Filtered commands (by session type)
- Git warning (if not configured)

## Session Type Detection

GreetingBuilder automatically detects three session types:

### 1. New Session (Minimal Context)
**Detection**: No conversation history or very short history
**Greeting Style**: Full
- ✅ Complete greeting with role description
- ✅ Up to 12 commands (visibility: full, quick, key)
- ✅ Project status or git warning
- ✅ Help text: "Type *help for all commands"

### 2. Existing Context (Active Session)
**Detection**: Conversation history exists, agent switch detected
**Greeting Style**: Quick
- ✅ Quick greeting (no role description)
- ✅ 6-8 commands (visibility: quick, key)
- ✅ Current Context section (previous agent)
- ✅ Compact project status

### 3. Workflow (Recurring Pattern)
**Detection**: Workflow pattern matched in conversation history
**Greeting Style**: Minimal
- ✅ Minimal greeting (e.g., "🎯 Pax ready")
- ✅ 3-5 commands (visibility: key only)
- ✅ Workflow Context section
- ✅ Next-step suggestion
- ✅ 1-line compact project status

## Command Visibility Metadata

Commands must include visibility metadata for filtering:

```yaml
commands:
  - name: help
    visibility: [full, quick, key]  # Always shown
    description: "Show all available commands"

  - name: create-story
    visibility: [full, quick]  # Shown in new and existing sessions
    description: "Create user story"

  - name: validate-story-draft
    visibility: [key]  # Shown only in workflow sessions
    description: "Validate story quality"
```

**Visibility Levels:**
- `full`: Show in new sessions (up to 12 total)
- `quick`: Show in existing sessions (6-8 total)
- `key`: Show in workflow sessions (3-5 total)

## Git Configuration Warning

If git is not configured, GreetingBuilder automatically appends:

```
⚠️  **Git Configuration Needed**
   Your project is not connected to a git repository.
   Run `git init` and `git remote add origin <url>` to enable version control.
```

**Configuration** (core-config.yaml):
```yaml
git:
  showConfigWarning: true  # User can disable
  cacheTimeSeconds: 300    # 5 minutes cache
```

## Performance Characteristics

- **Target**: < 150ms (hard limit with timeout protection)
- **Typical**: < 100ms average
- **Fallback**: Simple greeting on timeout or error

**Optimizations:**
- Git config cached for 5 minutes (0ms after first check)
- Context analysis ~20ms
- Parallel execution of checks

## Backwards Compatibility

GreetingBuilder includes safety features:

1. **Timeout Protection**: Falls back to simple greeting after 150ms
2. **Error Handling**: Graceful degradation on any error
3. **Missing Metadata**: Agents without visibility metadata show all commands
4. **Simple Fallback**: `{greeting}\n\nType *help to see available commands.`

## Migration Checklist

When creating new agents or updating existing ones:

- [ ] Use canonical activation-instructions format
- [ ] Include GreetingBuilder call (STEP 3)
- [ ] Remove manual greeting STEPs (2.5-5)
- [ ] Add visibility metadata to all commands
- [ ] Test with fresh Claude Code session
- [ ] Verify fallback greeting works

## Examples

### New Agent Creation
```yaml
agent:
  name: Nova
  id: new-agent
  title: New Agent Title
  icon: 🆕

persona_profile:
  greeting_levels:
    minimal: "🆕 Nova ready"
    named: "🆕 Nova (Archetype) ready. Let's work together!"

commands:
  - name: help
    visibility: [full, quick, key]
    description: "Show all commands"
  - name: do-thing
    visibility: [full, quick]
    description: "Do the thing"
```

### Testing
1. Activate agent in fresh session → Should show full greeting
2. Activate different agent, then return → Should show quick greeting
3. Execute workflow command, activate next agent → Should show workflow greeting

## Related Files

- **GreetingBuilder**: `.aiox-core/development/scripts/greeting-builder.js`
- **Context Detector**: `.aiox-core/core/session/context-detector.js`
- **Git Config Detector**: `.aiox-core/infrastructure/scripts/git-config-detector.js`
- **Workflow Navigator**: `.aiox-core/development/scripts/workflow-navigator.js`
- **Project Status Loader**: `.aiox-core/infrastructure/scripts/project-status-loader.js`
- **Workflow Patterns**: `.aiox-core/data/workflow-patterns.yaml`

## Troubleshooting

### Greeting appears mechanical
- Check that GreetingBuilder call is in STEP 3
- Verify old STEPs 2.5-5 are removed
- Test with fresh Claude Code session

### Commands not filtered
- Check command visibility metadata exists
- Verify session type detection is working
- Check conversation history is being passed

### Git warning not showing
- Check `git.showConfigWarning: true` in core-config.yaml
- Verify project has no git remote configured
- Check git config cache (may be cached from previous check)

### Performance issues
- Verify greeting displays in < 150ms
- Check git cache is enabled
- Monitor for timeout fallbacks in logs

## Version History

| Version | Date | Changes | Story |
|---------|------|---------|-------|
| 2.0 | 2025-11-16 | GreetingBuilder integration | 6.1.2.5 |
| 1.0 | 2025-01-15 | Manual activation STEPs | N/A |

---

*Template maintained by AIOX Framework Team*
