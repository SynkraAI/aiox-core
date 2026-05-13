# SYNAPSE Context Runtime

This directory contains bounded-context helpers for the SYNAPSE runtime.

## HierarchicalContextManager

`HierarchicalContextManager` keeps an LLM-ready message array under a configured
token budget by moving older short-term messages into long-term summaries.
Summarization is injectable and has a deterministic local fallback, so the
manager can run in tests, CLI flows and offline agent loops without a live LLM.

```javascript
const { HierarchicalContextManager } = require('./.aiox-core/core/synapse/context');

const contextManager = new HierarchicalContextManager({
  maxTokens: 8192,
  summarizationThreshold: 0.75,
  tokenizer: text => Math.ceil(text.length / 4),
  summarizer: async ({ messages }) => {
    return messages.map(message => `${message.role}: ${message.content}`).join('\n');
  },
});

contextManager.on('swap:complete', data => {
  console.log(`Compacted ${data.messagesRemoved} message(s).`);
});

await contextManager.addMessage({ role: 'user', content: 'Build the next task.' });
const safeContext = contextManager.getContext();
```

The manager does not call OpenAI, Anthropic, Claude, Gemini, Kimi or OpenRouter
directly. Inject a summarizer when an agent loop wants model-based compression.
If that summarizer fails, the manager emits `swap:error` and falls back to a
local extractive summary instead of crashing the loop.

## SemanticHandshakeEngine

`SemanticHandshakeEngine` turns planning constraints into executable checks that
can run before implementation. It is deterministic by default and does not call
an LLM.

```javascript
const { SemanticHandshakeEngine } = require('./.aiox-core/core/synapse/context');

const handshake = new SemanticHandshakeEngine();
handshake.registerConstraints('Use serverless functions with PostgreSQL.');

const result = await handshake.validateExecutionIntent({
  files: [
    {
      path: 'src/db.js',
      content: "const { Pool } = require('pg');",
    },
  ],
});

if (!result.passed) {
  throw new Error(handshake.generateComplianceReport(result));
}
```

The first supported extraction rules cover PostgreSQL, serverless local-state
writes, absolute imports and `eval` bans. Callers can also add structured custom
constraints with `addConstraint()`. Use `toContextMessage()` to inject the
handshake result into an agent context as a system message.
