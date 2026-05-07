'use strict';

const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const requireFromRoot = (modulePath) => require(path.join(repoRoot, modulePath));

const IdeationEngine = requireFromRoot('.aiox-core/core/ideation/ideation-engine');
const { ContextInjector } = requireFromRoot('.aiox-core/core/execution/context-injector');
const { SubagentDispatcher } = requireFromRoot('.aiox-core/core/execution/subagent-dispatcher');
const { GotchasMemory } = requireFromRoot('.aiox-core/core/memory/gotchas-memory');

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
