const {
  HierarchicalContextManager,
  buildDefaultSummary,
} = require('../../.aiox-core/core/synapse/context');

const wordTokenizer = text => String(text || '').trim().split(/\s+/).filter(Boolean).length;

describe('HierarchicalContextManager', () => {
  test('exports the manager from the SYNAPSE context surface', () => {
    expect(HierarchicalContextManager).toBeDefined();
    expect(typeof HierarchicalContextManager).toBe('function');
  });

  test('supports addMessage, getContext, getStats and clear without a live LLM provider', async () => {
    const manager = new HierarchicalContextManager({
      maxTokens: 100,
      summarizationThreshold: 0.75,
      tokenizer: wordTokenizer,
    });

    await manager.addMessage({ role: 'user', content: 'short request', metadata: { traceId: 'm1' } });

    expect(manager.getContext()).toEqual([
      { role: 'user', content: 'short request', metadata: { traceId: 'm1' } },
    ]);
    expect(manager.getStats()).toMatchObject({
      maxTokens: 100,
      shortTermMessages: 1,
      longTermSummaries: 0,
      swapCount: 0,
    });

    manager.clear();

    expect(manager.getContext()).toEqual([]);
    expect(manager.getStats()).toMatchObject({
      shortTermMessages: 0,
      longTermSummaries: 0,
      swapCount: 0,
    });
  });

  test('compacts older messages when threshold is crossed and preserves recent metadata', async () => {
    const completeEvents = [];
    const manager = new HierarchicalContextManager({
      maxTokens: 40,
      summarizationThreshold: 0.5,
      tokenizer: wordTokenizer,
    });
    manager.on('swap:complete', event => completeEvents.push(event));

    await manager.addMessages([
      {
        id: 'm1',
        role: 'user',
        content: 'alpha beta gamma delta epsilon zeta eta theta iota kappa',
        metadata: { decision: 'keep rationale' },
      },
      {
        id: 'm2',
        role: 'assistant',
        content: 'lambda mu nu xi omicron pi rho sigma tau upsilon',
        metadata: { result: 'draft' },
      },
      {
        id: 'm3',
        role: 'user',
        content: 'phi chi psi omega',
        metadata: { current: true },
      },
    ]);

    const context = manager.getContext();
    const stats = manager.getStats();

    expect(completeEvents.length).toBeGreaterThan(0);
    expect(stats.longTermSummaries).toBeGreaterThanOrEqual(1);
    expect(stats.totalTokens).toBeLessThanOrEqual(stats.maxTokens);
    expect(context[0].role).toBe('system');
    expect(context[0].metadata.aiox.type).toBe('hierarchical_context_summary');
    expect(context[0].metadata.aiox.sourceMessages[0]).toEqual({
      role: 'user',
      id: 'm1',
      metadata: { decision: 'keep rationale' },
    });
    expect(context[context.length - 1]).toMatchObject({
      role: 'user',
      content: 'phi chi psi omega',
      metadata: { current: true },
    });
  });

  test('uses injected summarizer and keeps context under maxTokens for repeated long messages', async () => {
    const manager = new HierarchicalContextManager({
      maxTokens: 24,
      summarizationThreshold: 0.75,
      tokenizer: wordTokenizer,
      summarizer: async ({ messages }) => `summary of ${messages.length} message(s)`,
    });

    for (let index = 0; index < 8; index += 1) {
      await manager.addMessage({
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: 'one two three four five six seven eight nine ten',
      });
    }

    const stats = manager.getStats();
    const contextText = manager.getContext().map(message => message.content).join('\n');

    expect(stats.totalTokens).toBeLessThanOrEqual(stats.maxTokens);
    expect(stats.swapCount).toBeGreaterThan(0);
    expect(contextText).toContain('summary of');
  });

  test('emits swap:error and falls back to deterministic summary when summarizer fails', async () => {
    const errorEvents = [];
    const manager = new HierarchicalContextManager({
      maxTokens: 30,
      summarizationThreshold: 0.5,
      tokenizer: wordTokenizer,
      summarizer: async () => {
        throw new Error('summarizer unavailable');
      },
      onSwapError: event => errorEvents.push(event),
    });

    manager.on('swap:error', event => errorEvents.push(event));

    await manager.addMessages([
      { role: 'user', content: 'one two three four five six seven eight nine ten eleven' },
      { role: 'assistant', content: 'twelve thirteen fourteen fifteen sixteen seventeen' },
    ]);

    const context = manager.getContext();

    expect(errorEvents.length).toBeGreaterThan(0);
    expect(manager.getStats().lastError).toEqual({ message: 'summarizer unavailable' });
    expect(context[0].content).toContain('Long-term context summary');
    expect(context[0].metadata.aiox.fallbackUsed).toBe(true);
  });

  test('default summary includes role and content excerpts', () => {
    const summary = buildDefaultSummary([
      { role: 'user', content: 'please remember the first decision' },
      { role: 'assistant', content: 'the decision was stored' },
    ]);

    expect(summary).toContain('2 message(s) compacted');
    expect(summary).toContain('user');
    expect(summary).toContain('assistant');
  });
});
