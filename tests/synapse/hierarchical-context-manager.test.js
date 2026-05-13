const {
  HierarchicalContextManager,
  buildDefaultSummary,
} = require('aiox-core/core/synapse/context');

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
    const firstCompleteEvent = completeEvents[0];

    expect(completeEvents.length).toBeGreaterThan(0);
    expect(firstCompleteEvent).toMatchObject({
      source: 'short-term',
      messagesRemoved: 1,
      swapCount: 1,
    });
    expect(firstCompleteEvent.tokensBefore).toBeGreaterThan(0);
    expect(firstCompleteEvent.tokensAfter).toBeGreaterThan(0);
    expect(firstCompleteEvent.summaryTokens).toBeGreaterThan(0);
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

  test('serializes concurrent addMessage calls so swaps cannot corrupt state', async () => {
    const manager = new HierarchicalContextManager({
      maxTokens: 32,
      summarizationThreshold: 0.5,
      minRecentMessages: 0,
      tokenizer: wordTokenizer,
      summarizer: async ({ messages }) => {
        await new Promise(resolve => setTimeout(resolve, 5));
        return `summary for ${messages.map(message => message.id).join(',')}`;
      },
    });

    await Promise.all(
      Array.from({ length: 6 }, (_, index) => manager.addMessage({
        id: `m${index + 1}`,
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: 'one two three four five six seven eight',
      })),
    );

    const context = manager.getContext();
    const contextIds = context
      .flatMap(message => [
        message.id,
        ...(message.metadata?.aiox?.sourceMessages || []).map(source => source.id),
      ])
      .filter(Boolean);

    expect(new Set(contextIds).size).toBe(contextIds.length);
    expect(contextIds).toEqual(expect.arrayContaining(['m1', 'm2', 'm3', 'm4', 'm5', 'm6']));
    expect(manager.getStats().totalTokens).toBeLessThanOrEqual(manager.getStats().maxTokens);
  });

  test('collapses all long-term summaries before hard-limit truncation', async () => {
    const manager = new HierarchicalContextManager({
      maxTokens: 14,
      summarizationThreshold: 0.75,
      tokenizer: wordTokenizer,
      summarizer: async ({ messages }) => `combined ${messages
        .flatMap(message => message.metadata?.aiox?.sourceMessages || [])
        .map(source => source.id)
        .join(' ')}`,
    });

    manager._longTermSummaries = [
      {
        role: 'system',
        content: 'first summary one two three four five six',
        metadata: {
          aiox: {
            sourceMessages: [{ id: 'm1' }, { id: 'm2' }],
          },
        },
      },
      {
        role: 'system',
        content: 'second summary seven eight nine ten eleven twelve',
        metadata: {
          aiox: {
            sourceMessages: [{ id: 'm3' }, { id: 'm4' }],
          },
        },
      },
    ];

    await manager._fitLongTermSummariesToBudget();

    expect(manager._longTermSummaries).toHaveLength(1);
    expect(manager._longTermSummaries[0].metadata.aiox.sourceMessages).toEqual([
      { id: 'm1' },
      { id: 'm2' },
      { id: 'm3' },
      { id: 'm4' },
    ]);
    expect(manager.getStats().totalTokens).toBeLessThanOrEqual(manager.getStats().maxTokens);
  });

  test('emits swap:error and falls back to deterministic summary when summarizer fails', async () => {
    const callbackEvents = [];
    const emitterEvents = [];
    const manager = new HierarchicalContextManager({
      maxTokens: 30,
      summarizationThreshold: 0.5,
      tokenizer: wordTokenizer,
      summarizer: async () => {
        throw new Error('summarizer unavailable');
      },
      onSwapError: event => callbackEvents.push(event),
    });

    manager.on('swap:error', event => emitterEvents.push(event));

    await manager.addMessages([
      { role: 'user', content: 'one two three four five six seven eight nine ten eleven' },
      { role: 'assistant', content: 'twelve thirteen fourteen fifteen sixteen seventeen' },
    ]);

    const context = manager.getContext();

    expect(callbackEvents).toHaveLength(1);
    expect(emitterEvents).toHaveLength(1);
    expect(callbackEvents[0]).toMatchObject({ source: 'short-term' });
    expect(emitterEvents[0]).toMatchObject({ source: 'short-term' });
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
