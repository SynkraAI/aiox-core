/**
 * LayerProcessor Base Class Tests
 *
 * Tests for abstract class enforcement, _safeProcess() timeout guard,
 * error handling, and constructor validation.
 *
 * @story SYN-4 - Layer Processors L0-L3
 */

const LayerProcessor = require('../../.aiox-core/core/synapse/layers/layer-processor');

jest.setTimeout(30000);

/**
 * Concrete subclass for testing
 */
class TestProcessor extends LayerProcessor {
  constructor(opts = {}) {
    super({ name: 'test', layer: 99, timeout: 15, ...opts });
  }

  process(context) {
    return {
      rules: ['rule1', 'rule2'],
      metadata: { layer: 99, source: 'test' },
    };
  }
}

describe('LayerProcessor', () => {
  describe('abstract class enforcement', () => {
    test('should throw when instantiated directly', () => {
      expect(() => new LayerProcessor({ name: 'direct', layer: 0 }))
        .toThrow('LayerProcessor is abstract and cannot be instantiated directly');
    });

    test('should allow subclass instantiation', () => {
      const processor = new TestProcessor();
      expect(processor).toBeInstanceOf(LayerProcessor);
      expect(processor).toBeInstanceOf(TestProcessor);
    });
  });

  describe('constructor properties', () => {
    test('should set name, layer, and timeout', () => {
      const processor = new TestProcessor({ name: 'custom', layer: 5, timeout: 20 });
      expect(processor.name).toBe('custom');
      expect(processor.layer).toBe(5);
      expect(processor.timeout).toBe(20);
    });

    test('should default timeout to 15ms', () => {
      const processor = new TestProcessor();
      expect(processor.timeout).toBe(15);
    });
  });

  describe('process() abstract method', () => {
    test('should throw when not overridden', () => {
      class EmptyProcessor extends LayerProcessor {
        constructor() {
          super({ name: 'empty', layer: 0 });
        }
        // process() intentionally NOT overridden
      }

      const processor = new EmptyProcessor();
      expect(() => processor.process({}))
        .toThrow('empty: process() must be implemented by subclass');
    });

    test('should return result when overridden', () => {
      const processor = new TestProcessor();
      const result = processor.process({});
      expect(result).toEqual({
        rules: ['rule1', 'rule2'],
        metadata: { layer: 99, source: 'test' },
      });
    });
  });

  describe('_safeProcess()', () => {
    test('should return process() result on success', () => {
      const processor = new TestProcessor();
      const result = processor._safeProcess({});
      expect(result).toEqual({
        rules: ['rule1', 'rule2'],
        metadata: { layer: 99, source: 'test' },
      });
    });

    test('should return null on process() error', () => {
      class ErrorProcessor extends LayerProcessor {
        constructor() {
          super({ name: 'error-test', layer: 0 });
        }
        process() {
          throw new Error('Something went wrong');
        }
      }

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const processor = new ErrorProcessor();
      const result = processor._safeProcess({});

      expect(result).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith(
        '[synapse:error-test] Error: Something went wrong',
      );
      warnSpy.mockRestore();
    });

    test('should warn when timeout exceeded but still return result', () => {
      class SlowProcessor extends LayerProcessor {
        constructor() {
          super({ name: 'slow', layer: 0, timeout: 1 });
        }
        process() {
          // Simulate slow operation
          const start = Date.now();
          while (Date.now() - start < 5) { /* busy wait */ }
          return { rules: ['slow-rule'], metadata: {} };
        }
      }

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const processor = new SlowProcessor();
      const result = processor._safeProcess({});

      expect(result).toEqual({ rules: ['slow-rule'], metadata: {} });
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[synapse:slow] Warning: Layer exceeded timeout'),
      );
      warnSpy.mockRestore();
    });

    test('should not warn when within timeout', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const processor = new TestProcessor({ timeout: 1000 });
      processor._safeProcess({});

      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    test('should return null when process() returns null', () => {
      class NullProcessor extends LayerProcessor {
        constructor() {
          super({ name: 'null-test', layer: 0 });
        }
        process() {
          return null;
        }
      }

      const processor = new NullProcessor();
      const result = processor._safeProcess({});
      expect(result).toBeNull();
    });
  });
});
