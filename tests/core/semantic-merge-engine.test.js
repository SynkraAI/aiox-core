/**
 * Semantic Merge Engine - Test Suite
 * Story EXC-1, AC4 - semantic-merge-engine.js coverage
 *
 * Tests: SemanticAnalyzer, ConflictDetector, AutoMerger, AIResolver,
 * CustomRulesLoader, SemanticMergeEngine, enums
 */

const path = require('path');
const fs = require('fs');
const {
  createTempDir,
  cleanupTempDir,
} = require('./execution-test-helpers');

const {
  SemanticMergeEngine,
  SemanticAnalyzer,
  ConflictDetector,
  AutoMerger,
  AIResolver,
  CustomRulesLoader,
  ChangeType,
  MergeStrategy,
  ConflictSeverity,
  MergeDecision,
} = require('../../.aios-core/core/execution/semantic-merge-engine');

// ── Tests ────────────────────────────────────────────────────────────────────

describe('SemanticMergeEngine Module', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempDir('sme-test-');
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  // ── Enums ─────────────────────────────────────────────────────────────

  describe('Enums', () => {
    test('ChangeType has expected values', () => {
      expect(ChangeType.IMPORT_ADDED).toBe('import_added');
      expect(ChangeType.FUNCTION_ADDED).toBe('function_added');
      expect(ChangeType.FUNCTION_MODIFIED).toBe('function_modified');
      expect(ChangeType.FUNCTION_REMOVED).toBe('function_removed');
      expect(ChangeType.CLASS_ADDED).toBe('class_added');
      expect(ChangeType.CLASS_REMOVED).toBe('class_removed');
      expect(ChangeType.UNKNOWN).toBe('unknown');
    });

    test('MergeStrategy has expected values', () => {
      expect(MergeStrategy.COMBINE).toBe('combine');
      expect(MergeStrategy.TAKE_NEWER).toBe('take_newer');
      expect(MergeStrategy.AI_REQUIRED).toBe('ai_required');
      expect(MergeStrategy.HUMAN_REQUIRED).toBe('human_required');
    });

    test('ConflictSeverity has expected values', () => {
      expect(ConflictSeverity.LOW).toBe('low');
      expect(ConflictSeverity.MEDIUM).toBe('medium');
      expect(ConflictSeverity.HIGH).toBe('high');
      expect(ConflictSeverity.CRITICAL).toBe('critical');
    });

    test('MergeDecision has expected values', () => {
      expect(MergeDecision.AUTO_MERGED).toBe('auto_merged');
      expect(MergeDecision.AI_MERGED).toBe('ai_merged');
      expect(MergeDecision.NEEDS_HUMAN_REVIEW).toBe('needs_human_review');
      expect(MergeDecision.FAILED).toBe('failed');
    });
  });

  // ── SemanticAnalyzer ──────────────────────────────────────────────────

  describe('SemanticAnalyzer', () => {
    let analyzer;

    beforeEach(() => {
      analyzer = new SemanticAnalyzer();
    });

    test('detectLanguage maps extensions correctly', () => {
      expect(analyzer.detectLanguage('.js')).toBe('javascript');
      expect(analyzer.detectLanguage('.ts')).toBe('typescript');
      expect(analyzer.detectLanguage('.py')).toBe('python');
      expect(analyzer.detectLanguage('.css')).toBe('css');
      expect(analyzer.detectLanguage('.json')).toBe('json');
      expect(analyzer.detectLanguage('.xyz')).toBe('text');
    });

    test('extractElements returns empty for null content', () => {
      const result = analyzer.extractElements(null, 'javascript');
      expect(result.imports).toEqual([]);
      expect(result.functions).toEqual([]);
      expect(result.classes).toEqual([]);
    });

    test('extractElements finds JS imports', () => {
      const code = 'import { foo } from \'bar\';\nimport baz from \'qux\';';
      const result = analyzer.extractElements(code, 'javascript');
      expect(result.imports.length).toBeGreaterThanOrEqual(1);
    });

    test('extractElements finds JS functions', () => {
      const code = 'function hello() { return 1; }\nconst world = () => 2;';
      const result = analyzer.extractElements(code, 'javascript');
      expect(result.functions.length).toBeGreaterThanOrEqual(1);
    });

    test('extractElements finds JS classes', () => {
      const code = 'class MyClass extends Base { constructor() {} }';
      const result = analyzer.extractElements(code, 'javascript');
      expect(result.classes.length).toBe(1);
      expect(result.classes[0].name).toBe('MyClass');
    });

    test('analyzeDiff detects added functions', () => {
      const before = '';
      const after = 'function newFunc() { return true; }';
      const result = analyzer.analyzeDiff('test.js', before, after);
      expect(result.language).toBe('javascript');
      expect(result.functionsAdded).toContain('newFunc');
    });

    test('analyzeDiff detects removed functions', () => {
      const before = 'function oldFunc() { return true; }';
      const after = '';
      const result = analyzer.analyzeDiff('test.js', before, after);
      const removed = result.changes.filter(c => c.changeType === ChangeType.FUNCTION_REMOVED);
      expect(removed.length).toBe(1);
    });

    test('countChangedLines returns difference', () => {
      expect(analyzer.countChangedLines('a\nb\nc', 'a\nb\nc\nd\ne')).toBe(2);
      expect(analyzer.countChangedLines('', '')).toBe(0);
      expect(analyzer.countChangedLines(null, 'a\nb')).toBe(1);
    });

    test('extractImportSource extracts module path', () => {
      expect(analyzer.extractImportSource("import x from 'lodash'")).toBe('lodash');
      expect(analyzer.extractImportSource("import 'styles.css'")).toBe("import 'styles.css'");
    });

    test('getLocation returns line number', () => {
      const content = 'line1\nline2\nline3';
      expect(analyzer.getLocation(content, 6)).toBe('line 2');
    });
  });

  // ── ConflictDetector ──────────────────────────────────────────────────

  describe('ConflictDetector', () => {
    let detector;

    beforeEach(() => {
      detector = new ConflictDetector();
    });

    test('detectConflicts returns empty for single task', () => {
      const result = detector.detectConflicts({ task1: { changes: [] } });
      expect(result).toEqual([]);
    });

    test('detectConflicts finds overlapping function modifications', () => {
      const analyses = {
        task1: {
          filePath: 'app.js',
          changes: [{ changeType: ChangeType.FUNCTION_MODIFIED, target: 'handleSubmit', location: 'line 10' }],
        },
        task2: {
          filePath: 'app.js',
          changes: [{ changeType: ChangeType.FUNCTION_MODIFIED, target: 'handleSubmit', location: 'line 10' }],
        },
      };

      const conflicts = detector.detectConflicts(analyses);
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].severity).toBeDefined();
    });

    test('getCompatibility returns compatible for import+import', () => {
      const result = detector.getCompatibility(ChangeType.IMPORT_ADDED, ChangeType.IMPORT_ADDED);
      expect(result.compatible).toBe(true);
      expect(result.strategy).toBe(MergeStrategy.COMBINE);
    });

    test('getCompatibility returns incompatible for function_removed+function_modified', () => {
      const result = detector.getCompatibility(ChangeType.FUNCTION_REMOVED, ChangeType.FUNCTION_MODIFIED);
      expect(result.compatible).toBe(false);
      expect(result.severity).toBe(ConflictSeverity.CRITICAL);
    });

    test('getCompatibility returns default for unknown combinations', () => {
      const result = detector.getCompatibility('something', 'unknown');
      expect(result.compatible).toBe(false);
      expect(result.strategy).toBe(MergeStrategy.AI_REQUIRED);
    });

    test('mapStrategy maps string values', () => {
      expect(detector.mapStrategy('combine')).toBe(MergeStrategy.COMBINE);
      expect(detector.mapStrategy('human_required')).toBe(MergeStrategy.HUMAN_REQUIRED);
      expect(detector.mapStrategy(null)).toBe(MergeStrategy.AI_REQUIRED);
      expect(detector.mapStrategy('garbage')).toBe(MergeStrategy.AI_REQUIRED);
    });

    test('mapSeverity maps string values', () => {
      expect(detector.mapSeverity('low')).toBe(ConflictSeverity.LOW);
      expect(detector.mapSeverity('critical')).toBe(ConflictSeverity.CRITICAL);
      expect(detector.mapSeverity(null)).toBe(ConflictSeverity.MEDIUM);
    });
  });

  // ── AutoMerger ────────────────────────────────────────────────────────

  describe('AutoMerger', () => {
    let merger;

    beforeEach(() => {
      merger = new AutoMerger();
    });

    test('tryAutoMerge fails for non-COMBINE strategy', () => {
      const conflict = { mergeStrategy: MergeStrategy.AI_REQUIRED, changeTypes: [], targets: [] };
      const result = merger.tryAutoMerge(conflict, '', {});
      expect(result.success).toBe(false);
    });

    test('tryAutoMerge combines imports', () => {
      const conflict = {
        mergeStrategy: MergeStrategy.COMBINE,
        changeTypes: [ChangeType.IMPORT_ADDED, ChangeType.IMPORT_ADDED],
        targets: [],
      };
      const base = '// base file\nconst x = 1;';
      const taskContents = {
        t1: "import a from 'a';\nconst x = 1;",
        t2: "import b from 'b';\nconst x = 1;",
      };

      const result = merger.tryAutoMerge(conflict, base, taskContents);
      expect(result.success).toBe(true);
      expect(result.decision).toBe(MergeDecision.AUTO_MERGED);
    });

    test('tryAutoMerge fails for unsupported change combo', () => {
      const conflict = {
        mergeStrategy: MergeStrategy.COMBINE,
        changeTypes: [ChangeType.VARIABLE_MODIFIED, ChangeType.VARIABLE_ADDED],
        targets: [],
      };
      const result = merger.tryAutoMerge(conflict, '', {});
      expect(result.success).toBe(false);
    });
  });

  // ── AIResolver ────────────────────────────────────────────────────────

  describe('AIResolver', () => {
    let resolver;

    beforeEach(() => {
      resolver = new AIResolver({ maxContextTokens: 1000 });
    });

    test('constructor sets defaults', () => {
      const r = new AIResolver();
      expect(r.maxContextTokens).toBe(4000);
      expect(r.confidenceThreshold).toBe(0.7);
      expect(r.callCount).toBe(0);
    });

    test('extractCodeBlock extracts from markdown', () => {
      const response = 'Here is code:\n```js\nconst x = 1;\n```\nDone.';
      expect(resolver.extractCodeBlock(response)).toBe('const x = 1;');
    });

    test('extractCodeBlock returns null for no code block', () => {
      expect(resolver.extractCodeBlock('just text')).toBeNull();
    });

    test('assessConfidence scores based on response', () => {
      const good = '```\ncode\n```\nThis is a detailed explanation of the merge.';
      expect(resolver.assessConfidence(good)).toBeGreaterThanOrEqual(0.8);

      const bad = 'error: cannot resolve the conflict';
      expect(resolver.assessConfidence(bad)).toBeLessThan(0.8);
    });

    test('getStats returns call metrics', () => {
      const stats = resolver.getStats();
      expect(stats.callsMade).toBe(0);
      expect(stats.estimatedTokensUsed).toBe(0);
    });

    test('resolveConflict returns NEEDS_HUMAN_REVIEW for large context', async () => {
      const bigResolver = new AIResolver({ maxContextTokens: 10 });
      const conflict = {
        filePath: 'test.js',
        location: 'line 1',
        severity: 'high',
        tasksInvolved: ['t1'],
      };
      const result = await bigResolver.resolveConflict(conflict, 'a'.repeat(200), {
        t1: { intent: 'test', changes: [] },
      });
      expect(result.decision).toBe(MergeDecision.NEEDS_HUMAN_REVIEW);
    });

    test('buildContext includes conflict info', () => {
      const conflict = {
        filePath: 'app.js',
        location: 'line 5',
        severity: 'medium',
        tasksInvolved: ['t1'],
      };
      const ctx = resolver.buildContext(conflict, 'base code', {
        t1: { intent: 'fix bug', changes: [{ changeType: 'function_modified' }], content: 'new code' },
      });
      expect(ctx).toContain('app.js');
      expect(ctx).toContain('fix bug');
    });
  });

  // ── CustomRulesLoader ─────────────────────────────────────────────────

  describe('CustomRulesLoader', () => {
    let loader;

    beforeEach(() => {
      loader = new CustomRulesLoader(tmpDir);
    });

    test('constructor sets paths', () => {
      expect(loader.rootPath).toBe(tmpDir);
      expect(loader.rulesPath).toContain('.aios');
    });

    test('loadCustomRules returns null when no file', () => {
      expect(loader.loadCustomRules()).toBeNull();
    });

    test('isCacheValid returns false initially', () => {
      expect(loader.isCacheValid()).toBe(false);
    });

    test('clearCache resets cache', () => {
      loader.cache.rules = { test: true };
      loader.cache.lastLoad = Date.now();
      loader.clearCache();
      expect(loader.cache.rules).toBeNull();
      expect(loader.cache.lastLoad).toBeNull();
    });

    test('getDefaultRules returns expected structure', () => {
      const rules = loader.getDefaultRules();
      expect(rules.compatibility).toBeDefined();
      expect(rules.file_patterns).toBeDefined();
      expect(rules.languages).toBeDefined();
      expect(rules.strategies).toBeDefined();
      expect(rules.ai).toBeDefined();
    });

    test('getMergedRules returns defaults when no custom rules', () => {
      const rules = loader.getMergedRules();
      expect(rules.ai.enabled).toBe(true);
    });

    test('deepMerge merges objects correctly', () => {
      const target = { a: 1, b: { c: 2, d: 3 } };
      const source = { b: { c: 99 }, e: 5 };
      const result = loader.deepMerge(target, source);
      expect(result.a).toBe(1);
      expect(result.b.c).toBe(99);
      expect(result.b.d).toBe(3);
      expect(result.e).toBe(5);
    });

    test('deepMerge skips null/undefined values', () => {
      const target = { a: 1 };
      const source = { a: null, b: undefined };
      const result = loader.deepMerge(target, source);
      expect(result.a).toBe(1);
    });

    test('matchesPattern matches glob patterns', () => {
      expect(loader.matchesPattern('node_modules/foo/bar.js', ['node_modules/**'])).toBe(true);
      expect(loader.matchesPattern('src/components/app.ts', ['src/**/*.ts'])).toBe(true);
      expect(loader.matchesPattern('README.md', ['*.md'])).toBe(true);
      expect(loader.matchesPattern('src/app.ts', ['*.md'])).toBe(false);
    });

    test('matchesPattern returns false for null patterns', () => {
      expect(loader.matchesPattern('file.js', null)).toBe(false);
      expect(loader.matchesPattern('file.js', 'not-array')).toBe(false);
    });

    test('getFileCategory categorizes files correctly', () => {
      expect(loader.getFileCategory('node_modules/x.js')).toBe('skip');
      expect(loader.getFileCategory('README.md')).toBe('auto_merge');
      expect(loader.getFileCategory('package.json')).toBe('human_review');
      expect(loader.getFileCategory('src/components/App.tsx')).toBe('ai_preferred');
      expect(loader.getFileCategory('random.xyz')).toBe('default');
    });

    test('getCompatibilityRule returns null for unknown', () => {
      expect(loader.getCompatibilityRule('a', 'b')).toBeNull();
    });

    test('getLanguageConfig returns config for known language', () => {
      const jsConfig = loader.getLanguageConfig('javascript');
      expect(jsConfig.patterns).toBeDefined();
    });

    test('getLanguageConfig returns empty for unknown language', () => {
      expect(loader.getLanguageConfig('brainfuck')).toEqual({});
    });

    test('getAIConfig returns defaults', () => {
      const config = loader.getAIConfig();
      expect(config.enabled).toBe(true);
      expect(config.max_context_tokens).toBe(4000);
    });
  });

  // ── SemanticAnalyzer - Python ──────────────────────────────────────────

  describe('SemanticAnalyzer - Python analysis', () => {
    let pyAnalyzer;
    beforeEach(() => { pyAnalyzer = new SemanticAnalyzer(); });

    test('extractElements detects Python imports and functions', () => {
      const pyCode = `import os
from pathlib import Path

def hello():
    pass

class MyClass:
    pass
`;
      const elements = pyAnalyzer.extractElements(pyCode, 'python');
      expect(elements.imports.length).toBeGreaterThanOrEqual(1);
      expect(elements.functions.length).toBeGreaterThanOrEqual(1);
      expect(elements.classes.length).toBeGreaterThanOrEqual(1);
    });

    test('analyzeDiff for Python files', () => {
      const base = 'def greet():\n    print("hi")\n';
      const modified = 'def greet():\n    print("hello")\n\ndef goodbye():\n    print("bye")\n';
      const result = pyAnalyzer.analyzeDiff('app.py', base, modified, 'task-1');
      expect(result.filePath).toBe('app.py');
      expect(result.language).toBe('python');
    });
  });

  // ── AIResolver helper methods ────────────────────────────────────────

  describe('AIResolver helpers', () => {
    let resolver;
    beforeEach(() => { resolver = new AIResolver(); });

    test('buildContext returns formatted context string', () => {
      const conflict = {
        filePath: 'src/app.js',
        location: 'line 10',
        severity: 'high',
        tasksInvolved: ['t1'],
      };
      const taskSnapshots = {
        t1: { intent: 'Add feature', changes: [{ changeType: 'addition' }], content: 'code' },
      };
      const context = resolver.buildContext(conflict, 'const x = 1;', taskSnapshots);
      expect(context).toContain('src/app.js');
      expect(context).toContain('high');
      expect(context).toContain('Add feature');
    });

    test('buildMergePrompt returns prompt string', () => {
      const prompt = resolver.buildMergePrompt(
        { location: 'line 5' },
        '## Context\nSome context',
      );
      expect(prompt).toContain('code merge specialist');
      expect(prompt).toContain('Context');
    });

    test('extractCodeBlock extracts code from markdown', () => {
      const response = 'Here is the merged code:\n```\nconst x = 1;\n```\n';
      const code = resolver.extractCodeBlock(response);
      expect(code).toContain('const x = 1;');
    });

    test('extractCodeBlock returns null for no code block', () => {
      const response = 'No code here.';
      expect(resolver.extractCodeBlock(response)).toBeNull();
    });

    test('assessConfidence returns numeric confidence', () => {
      // 'high confidence merge' has no code block, is short, no error indicators
      // base 0.5 + 0.15 (no error indicators) = 0.65
      expect(resolver.assessConfidence('high confidence merge')).toBe(0.65);
      // With code block: base 0.5 + 0.3 (code block) + 0.15 (no errors) = 0.95
      expect(resolver.assessConfidence('```js\ncode\n```')).toBeCloseTo(0.95);
    });

    test('getStats returns call count', () => {
      const stats = resolver.getStats();
      expect(stats.callsMade).toBe(0);
      expect(stats.estimatedTokensUsed).toBe(0);
    });
  });

  // ── SemanticMergeEngine - mergeFile ──────────────────────────────────

  describe('SemanticMergeEngine - mergeFile', () => {
    test('returns human_review for files marked as human_review', async () => {
      const engine = new SemanticMergeEngine({ rootPath: tmpDir });
      const result = await engine.mergeFile('package.json', '{}', {
        t1: { files: { 'package.json': '{"a":1}' } },
        t2: { files: { 'package.json': '{"b":2}' } },
      });
      expect(result.decision).toBe(MergeDecision.NEEDS_HUMAN_REVIEW);
    });

    test('auto-merges single task modification', async () => {
      const engine = new SemanticMergeEngine({ rootPath: tmpDir });
      const result = await engine.mergeFile('src/utils.js', 'const a = 1;', {
        t1: { files: { 'src/utils.js': 'const a = 2;' } },
      });
      expect(result.decision).toBe(MergeDecision.AUTO_MERGED);
      expect(result.mergedContent).toBe('const a = 2;');
    });

    test('combineNonConflictingChanges picks most-changed version', () => {
      const engine = new SemanticMergeEngine({ rootPath: tmpDir });
      const result = engine.combineNonConflictingChanges(
        'base',
        { t1: 'a bit changed', t2: 'much more changed content here' },
        {
          t1: { changes: [{ type: 'edit' }] },
          t2: { changes: [{ type: 'edit' }, { type: 'add' }, { type: 'edit' }] },
        },
      );
      expect(result).toBe('much more changed content here');
    });
  });

  // ── SemanticMergeEngine (Orchestrator) ─────────────────────────────────

  describe('SemanticMergeEngine', () => {
    test('constructor initializes all components', () => {
      const engine = new SemanticMergeEngine({ rootPath: tmpDir });
      expect(engine.analyzer).toBeInstanceOf(SemanticAnalyzer);
      expect(engine.detector).toBeInstanceOf(ConflictDetector);
      expect(engine.autoMerger).toBeInstanceOf(AutoMerger);
      expect(engine.aiResolver).toBeInstanceOf(AIResolver);
    });

    test('extends EventEmitter', () => {
      const engine = new SemanticMergeEngine({ rootPath: tmpDir });
      expect(typeof engine.on).toBe('function');
      expect(typeof engine.emit).toBe('function');
    });

    test('findModifiedFiles collects all files from snapshots', () => {
      const engine = new SemanticMergeEngine({ rootPath: tmpDir });
      const snapshots = {
        t1: { files: { 'a.js': 'code', 'b.js': 'code' } },
        t2: { files: { 'b.js': 'code2', 'c.js': 'code' } },
      };
      const files = engine.findModifiedFiles(snapshots);
      expect(files.size).toBe(3);
      expect(files.has('a.js')).toBe(true);
      expect(files.has('c.js')).toBe(true);
    });

    test('shouldProcessFile skips node_modules', () => {
      const engine = new SemanticMergeEngine({ rootPath: tmpDir });
      expect(engine.shouldProcessFile('node_modules/foo.js')).toBe(false);
      expect(engine.shouldProcessFile('src/app.js')).toBe(true);
    });

    test('getFileCategory returns category', () => {
      const engine = new SemanticMergeEngine({ rootPath: tmpDir });
      const category = engine.getFileCategory('package.json');
      expect(category).toBe('human_review');
    });

    test('getRules returns merged rules', () => {
      const engine = new SemanticMergeEngine({ rootPath: tmpDir });
      const rules = engine.getRules();
      expect(rules).toBeDefined();
      expect(rules.ai).toBeDefined();
    });

    test('reloadRules clears cache and re-initializes detector', () => {
      const engine = new SemanticMergeEngine({ rootPath: tmpDir });
      const oldDetector = engine.detector;
      engine.reloadRules();
      expect(engine.detector).not.toBe(oldDetector);
    });

    test('getAIStats returns resolver stats', () => {
      const engine = new SemanticMergeEngine({ rootPath: tmpDir });
      const stats = engine.getAIStats();
      expect(stats.callsMade).toBe(0);
    });

    test('saveReport writes JSON and MD files', async () => {
      const engine = new SemanticMergeEngine({
        rootPath: tmpDir,
        storageDir: path.join(tmpDir, '.aios', 'merge'),
      });

      const report = {
        startedAt: new Date().toISOString(),
        tasks: ['t1'],
        results: [],
        status: 'success',
      };

      await engine.saveReport(report);

      const mergeDir = path.join(tmpDir, '.aios', 'merge');
      expect(fs.existsSync(mergeDir)).toBe(true);

      const latestPath = path.join(mergeDir, 'merge-report-latest.json');
      expect(fs.existsSync(latestPath)).toBe(true);
    });
  });
});
