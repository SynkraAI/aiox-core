'use strict';

const IdeationEngine = require('../../.aiox-core/core/ideation/ideation-engine');
const { ContextInjector } = require('../../.aiox-core/core/execution/context-injector');
const { SubagentDispatcher } = require('../../.aiox-core/core/execution/subagent-dispatcher');
const { GotchasMemory } = require('../../.aiox-core/core/memory/gotchas-memory');

describe('GotchasMemory named export consumers', () => {
  it('instantiates IdeationEngine with the default GotchasMemory dependency', () => {
    const engine = new IdeationEngine();

    expect(engine.gotchasMemory).toBeInstanceOf(GotchasMemory);
  });

  it('instantiates ContextInjector with the default GotchasMemory dependency', () => {
    const injector = new ContextInjector();

    expect(injector.gotchasMemory).toBeInstanceOf(GotchasMemory);
  });

  it('instantiates SubagentDispatcher with the default GotchasMemory dependency', () => {
    const dispatcher = new SubagentDispatcher();

    expect(dispatcher.gotchasMemory).toBeInstanceOf(GotchasMemory);
  });
});
