'use strict';

const {
  detectDuplicateStory,
  suggestRelevantFiles,
  validateNoDuplicates,
  _formatDuplicateWarning,
} = require('../../.aios-core/core/code-intel/helpers/story-helper');

// Mock the code-intel module
jest.mock('../../.aios-core/core/code-intel/index', () => ({
  isCodeIntelAvailable: jest.fn(),
  getEnricher: jest.fn(),
  getClient: jest.fn(),
}));

const {
  isCodeIntelAvailable,
  getEnricher,
  getClient,
} = require('../../.aios-core/core/code-intel/index');

// --- Helper to setup mocks ---

function setupProviderAvailable() {
  isCodeIntelAvailable.mockReturnValue(true);
}

function setupProviderUnavailable() {
  isCodeIntelAvailable.mockReturnValue(false);
}

function createMockEnricher(overrides = {}) {
  const enricher = {
    detectDuplicates: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
  getEnricher.mockReturnValue(enricher);
  return enricher;
}

function createMockClient(overrides = {}) {
  const client = {
    findReferences: jest.fn().mockResolvedValue(null),
    analyzeCodebase: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
  getClient.mockReturnValue(client);
  return client;
}

// --- Tests ---

beforeEach(() => {
  jest.clearAllMocks();
});

describe('StoryHelper', () => {
  // === T1: detectDuplicateStory with provider — matches found ===
  describe('detectDuplicateStory', () => {
    it('should return matches and warning when duplicates found (T1)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        detectDuplicates: jest.fn().mockResolvedValue({
          matches: [
            { file: 'src/auth/login.js', line: 10, context: 'login handler' },
            { file: 'src/auth/session.js', line: 5, context: 'session manager' },
          ],
          codebaseOverview: { patterns: ['CommonJS'] },
        }),
      });

      const result = await detectDuplicateStory('implement user login');

      expect(result).not.toBeNull();
      expect(result.matches).toHaveLength(2);
      expect(result.matches[0].file).toBe('src/auth/login.js');
      expect(result.warning).toContain('src/auth/login.js');
      expect(result.warning).toContain('ADAPT instead of CREATE');
    });

    // === T2: detectDuplicateStory with provider — no matches ===
    it('should return null when no duplicates found (T2)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        detectDuplicates: jest.fn().mockResolvedValue({
          matches: [],
          codebaseOverview: {},
        }),
      });

      const result = await detectDuplicateStory('brand new feature');

      expect(result).toBeNull();
    });

    // === T3: detectDuplicateStory without provider ===
    it('should return null without provider (T3)', async () => {
      setupProviderUnavailable();

      const result = await detectDuplicateStory('implement user login');

      expect(result).toBeNull();
      expect(getEnricher).not.toHaveBeenCalled();
    });

    it('should return null when enricher throws', async () => {
      setupProviderAvailable();
      createMockEnricher({
        detectDuplicates: jest.fn().mockRejectedValue(new Error('provider error')),
      });

      const result = await detectDuplicateStory('some description');

      expect(result).toBeNull();
    });

    it('should return null when enricher returns null', async () => {
      setupProviderAvailable();
      createMockEnricher({
        detectDuplicates: jest.fn().mockResolvedValue(null),
      });

      const result = await detectDuplicateStory('some description');

      expect(result).toBeNull();
    });
  });

  // === T4: suggestRelevantFiles with provider ===
  describe('suggestRelevantFiles', () => {
    it('should return files and codebaseContext when provider available (T4)', async () => {
      setupProviderAvailable();
      createMockClient({
        findReferences: jest.fn().mockResolvedValue([
          { file: 'src/auth/login.js', line: 10, context: 'login' },
          { file: 'src/auth/session.js', line: 5, context: 'session' },
        ]),
        analyzeCodebase: jest.fn().mockResolvedValue({
          patterns: ['CommonJS', 'Express'],
        }),
      });

      const result = await suggestRelevantFiles('user authentication flow');

      expect(result).not.toBeNull();
      expect(result.files).toHaveLength(2);
      expect(result.files[0].file).toBe('src/auth/login.js');
      expect(result.codebaseContext).not.toBeNull();
      expect(result.codebaseContext.patterns).toContain('CommonJS');
    });

    // === T5: suggestRelevantFiles with partial results ===
    it('should return partial results when analyzeCodebase fails (T5)', async () => {
      setupProviderAvailable();
      createMockClient({
        findReferences: jest.fn().mockResolvedValue([
          { file: 'src/utils/helper.js', line: 1, context: 'helper' },
        ]),
        analyzeCodebase: jest.fn().mockRejectedValue(new Error('analysis failed')),
      });

      const result = await suggestRelevantFiles('utility helper functions');

      expect(result).not.toBeNull();
      expect(result.files).toHaveLength(1);
      expect(result.codebaseContext).toBeNull();
    });

    it('should return partial results when findReferences fails but analyzeCodebase succeeds', async () => {
      setupProviderAvailable();
      createMockClient({
        findReferences: jest.fn().mockRejectedValue(new Error('refs failed')),
        analyzeCodebase: jest.fn().mockResolvedValue({ patterns: ['ESM'] }),
      });

      const result = await suggestRelevantFiles('some feature');

      expect(result).not.toBeNull();
      expect(result.files).toEqual([]);
      expect(result.codebaseContext).toEqual({ patterns: ['ESM'] });
    });

    // === T6: suggestRelevantFiles without provider ===
    it('should return null without provider (T6)', async () => {
      setupProviderUnavailable();

      const result = await suggestRelevantFiles('user authentication flow');

      expect(result).toBeNull();
      expect(getClient).not.toHaveBeenCalled();
    });

    it('should return null when both capabilities return nothing', async () => {
      setupProviderAvailable();
      createMockClient({
        findReferences: jest.fn().mockResolvedValue(null),
        analyzeCodebase: jest.fn().mockResolvedValue(null),
      });

      const result = await suggestRelevantFiles('obscure feature');

      expect(result).toBeNull();
    });
  });

  // === T7: validateNoDuplicates with provider — duplicates found ===
  describe('validateNoDuplicates', () => {
    it('should return hasDuplicates true with matches and suggestion (T7)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        detectDuplicates: jest.fn().mockResolvedValue({
          matches: [
            { file: 'src/auth/login.js', line: 10, context: 'login handler' },
          ],
          codebaseOverview: {},
        }),
      });

      const result = await validateNoDuplicates('implement user login');

      expect(result).not.toBeNull();
      expect(result.hasDuplicates).toBe(true);
      expect(result.matches).toHaveLength(1);
      expect(result.suggestion).toContain('ADAPT');
    });

    // === T8: validateNoDuplicates with provider — no duplicates ===
    it('should return hasDuplicates false when no matches (T8)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        detectDuplicates: jest.fn().mockResolvedValue({
          matches: [],
          codebaseOverview: {},
        }),
      });

      const result = await validateNoDuplicates('brand new unique feature');

      expect(result).not.toBeNull();
      expect(result.hasDuplicates).toBe(false);
      expect(result.matches).toEqual([]);
      expect(result.suggestion).toBeNull();
    });

    // === T9: validateNoDuplicates without provider ===
    it('should return null without provider (T9)', async () => {
      setupProviderUnavailable();

      const result = await validateNoDuplicates('implement user login');

      expect(result).toBeNull();
      expect(getEnricher).not.toHaveBeenCalled();
    });

    it('should return hasDuplicates false when enricher returns null', async () => {
      setupProviderAvailable();
      createMockEnricher({
        detectDuplicates: jest.fn().mockResolvedValue(null),
      });

      const result = await validateNoDuplicates('some description');

      expect(result).not.toBeNull();
      expect(result.hasDuplicates).toBe(false);
      expect(result.matches).toEqual([]);
      expect(result.suggestion).toBeNull();
    });

    it('should return null when enricher throws', async () => {
      setupProviderAvailable();
      createMockEnricher({
        detectDuplicates: jest.fn().mockRejectedValue(new Error('provider error')),
      });

      const result = await validateNoDuplicates('some description');

      expect(result).toBeNull();
    });
  });

  // === T10: All functions fallback simultaneously ===
  describe('fallback behavior (all functions)', () => {
    it('should return null for all functions when provider unavailable (T10)', async () => {
      setupProviderUnavailable();

      const [detect, suggest, validate] = await Promise.all([
        detectDuplicateStory('test description'),
        suggestRelevantFiles('test description'),
        validateNoDuplicates('test description'),
      ]);

      expect(detect).toBeNull();
      expect(suggest).toBeNull();
      expect(validate).toBeNull();

      // Verify no enricher/client calls were made
      expect(getEnricher).not.toHaveBeenCalled();
      expect(getClient).not.toHaveBeenCalled();
    });
  });

  // === T11: Input validation — null/empty ===
  describe('input validation', () => {
    it('should return null for null input on all functions (T11)', async () => {
      setupProviderAvailable();

      const [detect, suggest, validate] = await Promise.all([
        detectDuplicateStory(null),
        suggestRelevantFiles(null),
        validateNoDuplicates(null),
      ]);

      expect(detect).toBeNull();
      expect(suggest).toBeNull();
      expect(validate).toBeNull();
    });

    it('should return null for empty string input on all functions (T11)', async () => {
      setupProviderAvailable();

      const [detect, suggest, validate] = await Promise.all([
        detectDuplicateStory(''),
        suggestRelevantFiles(''),
        validateNoDuplicates(''),
      ]);

      expect(detect).toBeNull();
      expect(suggest).toBeNull();
      expect(validate).toBeNull();
    });

    it('should return null for undefined input on all functions', async () => {
      setupProviderAvailable();

      const [detect, suggest, validate] = await Promise.all([
        detectDuplicateStory(undefined),
        suggestRelevantFiles(undefined),
        validateNoDuplicates(undefined),
      ]);

      expect(detect).toBeNull();
      expect(suggest).toBeNull();
      expect(validate).toBeNull();
    });
  });

  // === _formatDuplicateWarning ===
  describe('_formatDuplicateWarning', () => {
    it('should format warning with file list', () => {
      const matches = [
        { file: 'src/auth/login.js' },
        { file: 'src/auth/session.js' },
      ];

      const warning = _formatDuplicateWarning(matches);

      expect(warning).toContain('src/auth/login.js');
      expect(warning).toContain('src/auth/session.js');
      expect(warning).toContain('ADAPT instead of CREATE');
    });

    it('should handle matches with path instead of file', () => {
      const matches = [{ path: 'src/utils/helper.js' }];

      const warning = _formatDuplicateWarning(matches);

      expect(warning).toContain('src/utils/helper.js');
    });

    it('should limit to 5 files maximum', () => {
      const matches = Array.from({ length: 8 }, (_, i) => ({ file: `file${i}.js` }));

      const warning = _formatDuplicateWarning(matches);

      expect(warning).toContain('file0.js');
      expect(warning).toContain('file4.js');
      expect(warning).not.toContain('file5.js');
    });

    it('should return empty string for empty/null matches', () => {
      expect(_formatDuplicateWarning([])).toBe('');
      expect(_formatDuplicateWarning(null)).toBe('');
      expect(_formatDuplicateWarning(undefined)).toBe('');
    });

    it('should handle matches without file or path', () => {
      const matches = [{ context: 'something' }];

      const warning = _formatDuplicateWarning(matches);

      expect(warning).toContain('unknown');
    });
  });
});
