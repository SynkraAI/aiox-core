'use strict';

describe('Jest moduleNameMapper', () => {
  test('resolves package-style aiox-core imports to framework modules', () => {
    const LayerProcessor = require('aiox-core/core/synapse/layers/layer-processor');

    expect(typeof LayerProcessor).toBe('function');
    expect(LayerProcessor.name).toBe('LayerProcessor');
  });
});
