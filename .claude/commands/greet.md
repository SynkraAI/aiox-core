# greet

Generate contextual agent greeting using GreetingBuilder infrastructure.

---

## What This Command Does

When activated, this command:
1. Loads the GreetingBuilder module from `.aiox-core/development/scripts/greeting-builder.js`
2. Extracts agent definition from the calling agent (name, icon, persona_profile, commands)
3. Analyzes conversation history to detect session type (new/existing/workflow)
4. Generates intelligent greeting based on:
   - Session type (shows full/quick/key commands accordingly)
   - Git configuration status (shows warning if not configured)
   - Project status (branch, modifications, recent commits)
   - Workflow patterns (suggests next steps if in recurring workflow)
5. Returns formatted greeting string for agent to display

---

## Execution

Execute the greeting builder and return the formatted greeting:

```javascript
const GreetingBuilder = require('./.aiox-core/development/scripts/greeting-builder');
const builder = new GreetingBuilder();

// Extract agent definition from current agent context
const agent = {
  name: agentDefinition.name,
  id: agentDefinition.id,
  icon: agentDefinition.icon,
  title: agentDefinition.title,
  persona_profile: agentDefinition.persona_profile,
  persona: agentDefinition.persona,
  commands: agentDefinition.commands
};

// Build greeting with conversation history
const greeting = await builder.buildGreeting(agent, {
  conversationHistory: conversationHistory || []
});

// Return greeting for display
return greeting;
```

---

## Fallback Behavior

If greeting generation fails (timeout, error, module not found):
```
{agent.icon} {agent.name} ready

Type `*help` for available commands.
```

---

## Performance

- Target: < 150ms (enforced by GreetingBuilder timeout protection)
- Git check: Cached (5min TTL) for performance
- Context analysis: ~20ms average
- Total overhead: < 100ms typical, < 150ms hard limit

---

## Usage in Agent Activation

Agents call this command in STEP 3 of activation-instructions:

```yaml
activation-instructions:
  - STEP 1: Read THIS ENTIRE FILE
  - STEP 2: Adopt persona defined in 'agent' and 'persona' sections
  - STEP 3: Execute /greet slash command to generate contextual greeting
  - STEP 4: Display the greeting returned by /greet command
  - STEP 5: HALT and await user input
```

---

## Architecture

This follows **ADR-001: Agent Greeting Execution Pattern**:
- **YAML** = Declarative configuration (agent definitions)
- **Slash Command** = Execution layer (this file)
- **JavaScript** = Business logic (greeting-builder.js)

Industry alignment: Microsoft Copilot Security, Julep AI, Mastra patterns

---

**Created:** 2025-11-16
**ADR:** ADR-001
**Story:** 6.1.2.5 - Contextual Agent Load Integration
**Tests:** 27/27 passing (greeting-builder.test.js)
