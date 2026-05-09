# AIOX Resilience

Core resilience modules that preserve agent execution continuity after fatal failures.

## Agent Immortality Protocol

```js
const {
  AgentImmortalityProtocol,
  CauseOfDeath,
} = require('@aiox-squads/core/resilience');

const protocol = new AgentImmortalityProtocol(process.cwd());

const result = protocol.captureFailure({
  agentState: {
    id: 'dev-1',
    lastGoal: 'Implement story 482.1',
    lastSuccessfulStep: 'Created tests',
    currentAction: 'retry failing tool call',
    workingMemory: ['large history omitted', 'last useful step'],
    criticalVariables: { storyId: '482.1' },
  },
  error: new Error('Tool execution failed: invalid schema'),
});

console.log(result.reincarnationContext);
console.log(result.report.cause === CauseOfDeath.TOOL_EXECUTION_FAILURE);
```

The protocol records:

- a compact autopsy report, without rehydrating the full failed context;
- a reincarnation queue item with prevention directives;
- a delta state commit that can be replayed later;
- an evolution event for repeated failure-pattern analysis.

Storage defaults to `.aiox/immortality/` inside the project root.
