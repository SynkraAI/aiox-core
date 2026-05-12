'use strict';

const { buildLayerContext } = require('../../.aiox-core/core/synapse/context/context-builder');

describe('buildLayerContext', () => {
  it('builds normalized context with defaults', () => {
    const context = buildLayerContext({
      synapsePath: '/tmp/.synapse',
    });

    expect(context.prompt).toBe('');
    expect(context.session).toEqual({});
    expect(context.previousLayers).toEqual([]);
    expect(context.config.synapsePath).toBe('/tmp/.synapse');
    expect(context.config.manifest).toEqual({});
  });

  it('preserves prompt, session, config and previous layers', () => {
    const context = buildLayerContext({
      prompt: 'hello',
      session: { prompt_count: 3 },
      config: { devmode: true },
      synapsePath: '/repo/.synapse',
      manifest: { version: '2.0' },
      previousLayers: [{ layer: 'global' }],
    });

    expect(context.prompt).toBe('hello');
    expect(context.session.prompt_count).toBe(3);
    expect(context.config.devmode).toBe(true);
    expect(context.config.synapsePath).toBe('/repo/.synapse');
    expect(context.config.manifest.version).toBe('2.0');
    expect(context.previousLayers).toHaveLength(1);
  });
});
