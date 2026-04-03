import { SourceAdapter } from '../../src/sources/adapter-interface.js';

describe('SourceAdapter', () => {
  test('cannot be instantiated directly', () => {
    expect(() => new SourceAdapter('test', 'test')).toThrow('abstract');
  });

  test('subclass can be instantiated', () => {
    class TestAdapter extends SourceAdapter {
      constructor() {
        super('Test', 'test');
      }
      async fetch() {
        return [];
      }
    }
    const adapter = new TestAdapter();
    expect(adapter.name).toBe('Test');
    expect(adapter.type).toBe('test');
  });

  test('validate checks required fields', () => {
    class TestAdapter extends SourceAdapter {
      constructor() {
        super('Test', 'test');
      }
      async fetch() {
        return [];
      }
    }
    const adapter = new TestAdapter();

    const valid = adapter.validate({ name: 'Feed', url: 'http://test.com', domains: ['ai'] });
    expect(valid.valid).toBe(true);

    const invalid = adapter.validate({});
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.length).toBeGreaterThan(0);
  });

  test('createRawContent creates proper structure', () => {
    class TestAdapter extends SourceAdapter {
      constructor() {
        super('Test', 'test');
      }
      async fetch() {
        return [];
      }
    }
    const adapter = new TestAdapter();
    const content = adapter.createRawContent({
      title: 'Test Title',
      url: 'http://test.com',
      contentRaw: 'Some content',
    });

    expect(content.source).toBe('test');
    expect(content.title).toBe('Test Title');
    expect(content.url).toBe('http://test.com');
    expect(content.contentRaw).toBe('Some content');
    expect(content.publishedAt).toBeInstanceOf(Date);
  });
});
