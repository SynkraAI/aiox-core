'use strict';

jest.mock('../../.aiox-core/development/scripts/unified-activation-pipeline', () => ({
  UnifiedActivationPipeline: jest.fn().mockImplementation(() => ({
    activate: jest.fn(async () => ({
      greeting: 'ok',
      context: {},
      duration: 1,
      quality: 'full',
      metrics: {},
    })),
  })),
}));

const { ActivationRuntime, activateAgent } = require('../../.aiox-core/development/scripts/activation-runtime');
const { UnifiedActivationPipeline } = require('../../.aiox-core/development/scripts/unified-activation-pipeline');

describe('ActivationRuntime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses UnifiedActivationPipeline as canonical backend', async () => {
    const runtime = new ActivationRuntime();
    const result = await runtime.activate('dev');

    expect(UnifiedActivationPipeline).toHaveBeenCalledTimes(1);
    expect(result.greeting).toBe('ok');
  });

  it('returns greeting-only helper', async () => {
    const runtime = new ActivationRuntime();
    const greeting = await runtime.activateGreeting('qa');
    expect(greeting).toBe('ok');
  });

  it('returns empty string when activate result has no greeting', async () => {
    const runtime = new ActivationRuntime();
    runtime.activate = jest.fn(async () => null);
    const greeting = await runtime.activateGreeting('qa');
    expect(greeting).toBe('');
  });

  it('throws descriptive error when activation fails', async () => {
    const runtime = new ActivationRuntime();
    runtime.activate = jest.fn(async () => {
      throw new Error('pipeline exploded');
    });

    await expect(runtime.activateGreeting('qa')).rejects.toThrow(
      'ActivationRuntime.activateGreeting failed for "qa": pipeline exploded',
    );
  });

  it('supports one-shot activateAgent helper', async () => {
    const result = await activateAgent('architect');
    expect(result.quality).toBe('full');
  });
});
