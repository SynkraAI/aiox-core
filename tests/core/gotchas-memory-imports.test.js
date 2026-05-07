'use strict';

const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const requireFromRoot = (modulePath) => require(path.join(repoRoot, modulePath));

const IdeationEngine = requireFromRoot('.aiox-core/core/ideation/ideation-engine');
const { ContextInjector } = requireFromRoot('.aiox-core/core/execution/context-injector');
const { SubagentDispatcher } = requireFromRoot('.aiox-core/core/execution/subagent-dispatcher');
const { GotchasMemory } = requireFromRoot('.aiox-core/core/memory/gotchas-memory');
const gotchasMemoryModulePath = path.join(repoRoot, '.aiox-core/core/memory/gotchas-memory');

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

  it('exposes a load error when GotchasMemory named export is missing', () => {
    const previousDebug = process.env.AIOX_DEBUG;
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    process.env.AIOX_DEBUG = 'true';
    jest.resetModules();
    jest.doMock(gotchasMemoryModulePath, () => ({}));

    try {
      jest.isolateModules(() => {
        const MissingIdeationEngine = requireFromRoot('.aiox-core/core/ideation/ideation-engine');
        const { ContextInjector: MissingContextInjector } = requireFromRoot('.aiox-core/core/execution/context-injector');
        const { SubagentDispatcher: MissingSubagentDispatcher } = requireFromRoot(
          '.aiox-core/core/execution/subagent-dispatcher',
        );

        expect(new MissingIdeationEngine().gotchasMemory).toBeNull();
        expect(new MissingContextInjector().gotchasMemory).toBeNull();
        expect(new MissingSubagentDispatcher().gotchasMemory).toBeNull();
        expect(MissingIdeationEngine.gotchasMemoryLoadError.message).toContain('Missing named export GotchasMemory');
        expect(MissingContextInjector.gotchasMemoryLoadError.message).toContain('Missing named export GotchasMemory');
        expect(MissingSubagentDispatcher.gotchasMemoryLoadError.message).toContain('Missing named export GotchasMemory');
      });

      expect(warnSpy).toHaveBeenCalledTimes(3);
    } finally {
      jest.dontMock(gotchasMemoryModulePath);
      jest.resetModules();
      if (typeof previousDebug === 'undefined') {
        delete process.env.AIOX_DEBUG;
      } else {
        process.env.AIOX_DEBUG = previousDebug;
      }
      warnSpy.mockRestore();
    }
  });

  it('exposes a load error when GotchasMemory named export is not constructible', () => {
    const previousDebug = process.env.AIOX_DEBUG;
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    process.env.AIOX_DEBUG = 'true';
    jest.resetModules();
    jest.doMock(gotchasMemoryModulePath, () => ({ GotchasMemory: {} }));

    try {
      jest.isolateModules(() => {
        const InvalidIdeationEngine = requireFromRoot('.aiox-core/core/ideation/ideation-engine');
        const { ContextInjector: InvalidContextInjector } = requireFromRoot('.aiox-core/core/execution/context-injector');
        const { SubagentDispatcher: InvalidSubagentDispatcher } = requireFromRoot(
          '.aiox-core/core/execution/subagent-dispatcher',
        );

        expect(new InvalidIdeationEngine().gotchasMemory).toBeNull();
        expect(new InvalidContextInjector().gotchasMemory).toBeNull();
        expect(new InvalidSubagentDispatcher().gotchasMemory).toBeNull();
        expect(InvalidIdeationEngine.gotchasMemoryLoadError.message).toContain('to be constructible; got object');
        expect(InvalidContextInjector.gotchasMemoryLoadError.message).toContain('to be constructible; got object');
        expect(InvalidSubagentDispatcher.gotchasMemoryLoadError.message).toContain('to be constructible; got object');
      });

      expect(warnSpy).toHaveBeenCalledTimes(3);
    } finally {
      jest.dontMock(gotchasMemoryModulePath);
      jest.resetModules();
      if (typeof previousDebug === 'undefined') {
        delete process.env.AIOX_DEBUG;
      } else {
        process.env.AIOX_DEBUG = previousDebug;
      }
      warnSpy.mockRestore();
    }
  });
});
