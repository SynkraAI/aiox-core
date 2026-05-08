/**
 * Unit Tests for generate-greeting.js
 *
 * Tests the CLI wrapper around ActivationRuntime without invoking the full
 * activation pipeline.
 *
 * Part of Story 6.1.4: Unified Greeting System Integration
 */

'use strict';

const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT_PATH = path.join(
  REPO_ROOT,
  '.aiox-core',
  'development',
  'scripts',
  'generate-greeting.js',
);
const RUNTIME_PATH = path.join(
  REPO_ROOT,
  '.aiox-core',
  'development',
  'scripts',
  'activation-runtime.js',
);

function loadGenerateGreetingWithRuntime(activateMock) {
  jest.resetModules();
  jest.doMock(RUNTIME_PATH, () => ({
    ActivationRuntime: function MockActivationRuntime() {
      this.activate = activateMock;
    },
  }));

  return require(SCRIPT_PATH);
}

describe('generate-greeting.js', () => {
  afterEach(() => {
    jest.dontMock(RUNTIME_PATH);
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('exports generateGreeting()', () => {
    jest.resetModules();
    const moduleUnderTest = require(SCRIPT_PATH);

    expect(typeof moduleUnderTest.generateGreeting).toBe('function');
  });

  it('delegates greeting generation to ActivationRuntime', async () => {
    const activateMock = jest.fn().mockResolvedValue({
      greeting: 'QA runtime greeting',
      duration: 12,
    });
    const { generateGreeting } = loadGenerateGreetingWithRuntime(activateMock);

    const greeting = await generateGreeting('qa');

    expect(activateMock).toHaveBeenCalledWith('qa');
    expect(greeting).toBe('QA runtime greeting');
  });

  it('warns when the runtime reports slow generation', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const activateMock = jest.fn().mockResolvedValue({
      greeting: 'Slow but valid greeting',
      duration: 125,
    });
    const { generateGreeting } = loadGenerateGreetingWithRuntime(activateMock);

    const greeting = await generateGreeting('dev');

    expect(greeting).toBe('Slow but valid greeting');
    expect(warnSpy).toHaveBeenCalledWith('[generate-greeting] Slow generation: 125ms');
  });

  it('returns the real fallback greeting when runtime activation fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const activateMock = jest.fn().mockRejectedValue(new Error('Activation failed'));
    const { generateGreeting } = loadGenerateGreetingWithRuntime(activateMock);

    const greeting = await generateGreeting('missing-agent');

    expect(greeting).toContain('missing-agent Agent ready');
    expect(greeting).toContain('Type `*help`');
  });
});
