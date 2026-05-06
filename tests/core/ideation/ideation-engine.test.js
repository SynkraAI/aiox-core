/**
 * @jest-environment node
 *
 * Testes unitários para o módulo ideation-engine
 *
 * Testa IdeationEngine (orquestrador) e os 5 Analyzers individuais
 * com mocks para execSync e fs, garantindo isolamento de I/O.
 */

const child_process = require('child_process');
const fs = require('fs');

// Mock gotchas-memory com shape de constructor.
// O módulo retornado funciona como constructor diretamente (import atual sem
// destructuring) E como named export { GotchasMemory } (pós-fix #519).
jest.mock('../../../.aios-core/core/memory/gotchas-memory', () => {
  const MockGotchasMemory = jest.fn().mockImplementation(() => ({
    getAll: jest.fn().mockResolvedValue([]),
  }));
  MockGotchasMemory.GotchasMemory = MockGotchasMemory;
  return MockGotchasMemory;
});

const execSyncSpy = jest.spyOn(child_process, 'execSync').mockReturnValue('');
jest.spyOn(fs, 'existsSync').mockReturnValue(true);
jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

const IdeationEngine = require('../../../.aios-core/core/ideation/ideation-engine.js');
const {
  PerformanceAnalyzer,
  SecurityAnalyzer,
  CodeQualityAnalyzer,
  UXAnalyzer,
  ArchitectureAnalyzer,
} = IdeationEngine;

describe('IdeationEngine', () => {
  let engine;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reconfigurar retornos padrão para evitar leak entre testes
    execSyncSpy.mockReturnValue('');
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockImplementation(() => {});
    fs.writeFileSync.mockImplementation(() => {});
    engine = new IdeationEngine({
      rootPath: '/fake/project',
      gotchasMemory: null,
    });
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('usa rootPath fornecido', () => {
      expect(engine.rootPath).toBe('/fake/project');
    });

    test('usa process.cwd() como padrão', () => {
      const e = new IdeationEngine();
      expect(e.rootPath).toBe(process.cwd());
    });

    test('inicializa 5 áreas padrão', () => {
      expect(engine.areas).toEqual([
        'performance', 'security', 'codeQuality', 'ux', 'architecture',
      ]);
    });

    test('aceita áreas customizadas', () => {
      const e = new IdeationEngine({ areas: ['security'] });
      expect(e.areas).toEqual(['security']);
    });

    test('inicializa 5 analyzers', () => {
      expect(engine.analyzers.performance).toBeInstanceOf(PerformanceAnalyzer);
      expect(engine.analyzers.security).toBeInstanceOf(SecurityAnalyzer);
      expect(engine.analyzers.codeQuality).toBeInstanceOf(CodeQualityAnalyzer);
      expect(engine.analyzers.ux).toBeInstanceOf(UXAnalyzer);
      expect(engine.analyzers.architecture).toBeInstanceOf(ArchitectureAnalyzer);
    });
  });

  // ============================================================
  // calculatePriority
  // ============================================================
  describe('calculatePriority', () => {
    test('quick-win: low effort + impact >= 0.7 → prioridade alta', () => {
      const finding = { effort: 'low', impact: 0.8 };
      const priority = engine.calculatePriority(finding);
      expect(priority).toBe(0.8 * 1.5); // 1.2
      expect(finding.category).toBe('quick-win');
    });

    test('quick-win: low effort + impact 0.7 exato', () => {
      const finding = { effort: 'low', impact: 0.7 };
      engine.calculatePriority(finding);
      expect(finding.category).toBe('quick-win');
    });

    test('low effort + impact < 0.7 → NÃO é quick-win', () => {
      const finding = { effort: 'low', impact: 0.6 };
      const priority = engine.calculatePriority(finding);
      // low effort multiplier = 1.5, mas não é quick-win
      expect(priority).toBe(0.6 * 1.5);
      expect(finding.category).toBeUndefined();
    });

    test('medium effort usa multiplicador 1.0', () => {
      const finding = { effort: 'medium', impact: 0.5 };
      expect(engine.calculatePriority(finding)).toBe(0.5);
    });

    test('high effort usa multiplicador 0.6', () => {
      const finding = { effort: 'high', impact: 0.8 };
      expect(engine.calculatePriority(finding)).toBeCloseTo(0.48);
    });

    test('effort desconhecido usa multiplicador 1.0', () => {
      const finding = { effort: 'unknown', impact: 0.5 };
      expect(engine.calculatePriority(finding)).toBe(0.5);
    });

    test('impact padrão é 0.5 quando não fornecido', () => {
      const finding = { effort: 'medium' };
      expect(engine.calculatePriority(finding)).toBe(0.5);
    });
  });

  // ============================================================
  // isKnownGotcha
  // ============================================================
  describe('isKnownGotcha', () => {
    test('retorna false quando knownIssues é null', () => {
      const suggestion = { title: 'Test', description: 'desc' };
      expect(engine.isKnownGotcha(suggestion, null)).toBe(false);
    });

    test('retorna false quando knownIssues é vazio', () => {
      const suggestion = { title: 'Test', description: 'desc' };
      expect(engine.isKnownGotcha(suggestion, [])).toBe(false);
    });

    test('detecta gotcha com 3+ palavras em comum (>4 chars)', () => {
      const suggestion = {
        title: 'Synchronous operations blocking event loop',
        description: 'Multiple readFileSync calls detected',
      };
      const knownIssues = [{
        pattern: 'readFileSync blocking event',
        description: 'synchronous operations cause performance issues',
      }];
      expect(engine.isKnownGotcha(suggestion, knownIssues)).toBe(true);
    });

    test('não detecta gotcha com <3 palavras em comum', () => {
      const suggestion = {
        title: 'Missing aria labels',
        description: 'Interactive elements need accessibility',
      };
      const knownIssues = [{
        pattern: 'database timeout',
        description: 'connection pooling issues',
      }];
      expect(engine.isKnownGotcha(suggestion, knownIssues)).toBe(false);
    });

    test('ignora palavras curtas (<=4 chars) na comparação', () => {
      const suggestion = {
        title: 'the and for but not with',
        description: 'small words only here and there',
      };
      const knownIssues = [{
        pattern: 'the and for but not with',
        description: 'small words also matching',
      }];
      // Nenhuma palavra >4 chars → matches.length = 0 < 3
      expect(engine.isKnownGotcha(suggestion, knownIssues)).toBe(false);
    });

    test('gotcha sem pattern/description não causa erro', () => {
      const suggestion = { title: 'Test', description: 'desc' };
      const knownIssues = [{ id: 'gotcha-1' }];
      expect(engine.isKnownGotcha(suggestion, knownIssues)).toBe(false);
    });
  });

  // ============================================================
  // countByArea
  // ============================================================
  describe('countByArea', () => {
    test('conta sugestões por área', () => {
      const suggestions = [
        { area: 'security' },
        { area: 'performance' },
        { area: 'security' },
        { area: 'ux' },
      ];
      expect(engine.countByArea(suggestions)).toEqual({
        security: 2,
        performance: 1,
        ux: 1,
      });
    });

    test('retorna objeto vazio para array vazio', () => {
      expect(engine.countByArea([])).toEqual({});
    });
  });

  // ============================================================
  // formatSuggestion
  // ============================================================
  describe('formatSuggestion', () => {
    test('formata sugestão básica em markdown', () => {
      const md = engine.formatSuggestion({
        title: 'Fix sync ops',
        impact: 0.7,
        effort: 'low',
        area: 'performance',
        description: 'Convert to async.',
      });
      expect(md).toContain('### Fix sync ops');
      expect(md).toContain('**Impact:** 70%');
      expect(md).toContain('**Effort:** low');
      expect(md).toContain('**Area:** performance');
      expect(md).toContain('Convert to async.');
    });

    test('inclui location quando presente', () => {
      const md = engine.formatSuggestion({
        title: 'T', impact: 0.5, effort: 'low', area: 'security',
        description: 'd',
        location: { file: 'src/app.js', lines: '10-20' },
      });
      expect(md).toContain('`src/app.js`');
      expect(md).toContain('(lines 10-20)');
    });

    test('inclui suggestedFix quando presente', () => {
      const md = engine.formatSuggestion({
        title: 'T', impact: 0.5, effort: 'low', area: 'x',
        description: 'd',
        suggestedFix: 'Use async/await',
      });
      expect(md).toContain('**Suggested Fix:** Use async/await');
    });

    test('omite location e suggestedFix quando ausentes', () => {
      const md = engine.formatSuggestion({
        title: 'T', impact: 0.5, effort: 'low', area: 'x',
        description: 'd',
      });
      expect(md).not.toContain('Location');
      expect(md).not.toContain('Suggested Fix');
    });
  });

  // ============================================================
  // formatMarkdown
  // ============================================================
  describe('formatMarkdown', () => {
    const baseResult = {
      generatedAt: '2026-02-25T12:00:00Z',
      projectId: 'test-project',
      duration: 150,
      summary: { totalSuggestions: 2, quickWins: 1, highImpact: 1 },
      quickWins: [{
        title: 'QW1', impact: 0.8, effort: 'low', area: 'performance',
        description: 'Quick win desc',
      }],
      highImpact: [{
        title: 'HI1', impact: 0.9, effort: 'high', area: 'security',
        description: 'High impact desc',
      }],
      allSuggestions: [
        { title: 'QW1', impact: 0.8, effort: 'low', area: 'performance', description: 'qw' },
        { title: 'HI1', impact: 0.9, effort: 'high', area: 'security', description: 'hi' },
      ],
    };

    test('inclui cabeçalho com metadata', () => {
      const md = engine.formatMarkdown(baseResult);
      expect(md).toContain('# Ideation Report');
      expect(md).toContain('2026-02-25T12:00:00Z');
      expect(md).toContain('test-project');
      expect(md).toContain('150ms');
    });

    test('inclui tabela de sumário', () => {
      const md = engine.formatMarkdown(baseResult);
      expect(md).toContain('Total Suggestions | 2');
      expect(md).toContain('Quick Wins | 1');
      expect(md).toContain('High Impact | 1');
    });

    test('inclui seção Quick Wins', () => {
      const md = engine.formatMarkdown(baseResult);
      expect(md).toContain('Quick Wins');
      expect(md).toContain('QW1');
    });

    test('inclui seção High Impact', () => {
      const md = engine.formatMarkdown(baseResult);
      expect(md).toContain('High Impact');
      expect(md).toContain('HI1');
    });

    test('omite seção Quick Wins quando vazio', () => {
      const result = { ...baseResult, quickWins: [] };
      const md = engine.formatMarkdown(result);
      // A seção Quick Wins usa emoji 🎯
      expect(md).not.toContain('🎯');
    });

    test('omite High Impact quando vazio', () => {
      const result = { ...baseResult, highImpact: [] };
      const md = engine.formatMarkdown(result);
      expect(md).not.toContain('🚀 High Impact');
    });

    test('limita Quick Wins a 5 itens', () => {
      const qws = Array.from({ length: 8 }, (_, i) => ({
        title: `QW${i}`, impact: 0.8, effort: 'low', area: 'perf', description: 'd',
      }));
      const md = engine.formatMarkdown({ ...baseResult, quickWins: qws });
      expect(md).toContain('QW4');
      expect(md).not.toContain('QW5');
    });

    test('inclui rodapé', () => {
      const md = engine.formatMarkdown(baseResult);
      expect(md).toContain('Generated by AIOS Ideation Engine');
    });
  });

  // ============================================================
  // ideate (orquestração)
  // ============================================================
  describe('ideate', () => {
    test('retorna resultado com structure correta', async () => {
      const result = await engine.ideate({ save: false });
      expect(result).toHaveProperty('generatedAt');
      expect(result).toHaveProperty('projectId', 'project');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('quickWins');
      expect(result).toHaveProperty('highImpact');
      expect(result).toHaveProperty('allSuggestions');
    });

    test('filtra por área de foco', async () => {
      // Mock security analyzer to return findings
      engine.analyzers.security.analyze = jest.fn().mockResolvedValue([{
        title: 'Hardcoded secret', description: 'Found API key',
        impact: 0.95, effort: 'low',
      }]);

      const result = await engine.ideate({ focus: 'security', save: false });
      expect(result.allSuggestions.length).toBe(1);
      expect(result.allSuggestions[0].area).toBe('security');
    });

    test('aceita focus como array', async () => {
      engine.analyzers.security.analyze = jest.fn().mockResolvedValue([{
        title: 'S1', description: 'd', impact: 0.9, effort: 'low',
      }]);
      engine.analyzers.ux.analyze = jest.fn().mockResolvedValue([{
        title: 'U1', description: 'd', impact: 0.5, effort: 'low',
      }]);

      const result = await engine.ideate({
        focus: ['security', 'ux'], save: false,
      });
      expect(result.allSuggestions.length).toBe(2);
    });

    test('ignora analyzers inválidos sem erro', async () => {
      const result = await engine.ideate({ focus: 'invalid_area', save: false });
      expect(result.allSuggestions.length).toBe(0);
    });

    test('captura erros de analyzers sem propagar', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      engine.analyzers.security.analyze = jest.fn().mockRejectedValue(
        new Error('analysis failed'),
      );

      const result = await engine.ideate({ focus: 'security', save: false });
      expect(result.allSuggestions.length).toBe(0);
      warnSpy.mockRestore();
    });

    test('ordena por prioridade decrescente', async () => {
      engine.analyzers.security.analyze = jest.fn().mockResolvedValue([
        { title: 'Low', description: 'd', impact: 0.3, effort: 'high' },
        { title: 'High', description: 'd', impact: 0.95, effort: 'low' },
        { title: 'Med', description: 'd', impact: 0.6, effort: 'medium' },
      ]);

      const result = await engine.ideate({ focus: 'security', save: false });
      const priorities = result.allSuggestions.map(s => s.priority);
      expect(priorities[0]).toBeGreaterThan(priorities[1]);
      expect(priorities[1]).toBeGreaterThan(priorities[2]);
    });

    test('filtra gotchas conhecidas quando gotchasMemory disponível', async () => {
      const mockMemory = {
        getAll: jest.fn().mockResolvedValue([{
          pattern: 'synchronous operations blocking event',
          description: 'known performance issue with readFileSync',
        }]),
      };
      engine.gotchasMemory = mockMemory;

      engine.analyzers.performance.analyze = jest.fn().mockResolvedValue([{
        title: 'Synchronous operations blocking event loop',
        description: 'Found readFileSync calls in production code',
        impact: 0.7, effort: 'medium',
      }]);

      const result = await engine.ideate({ focus: 'performance', save: false });
      // Deve filtrar a sugestão que é um gotcha conhecido
      expect(result.allSuggestions.length).toBe(0);
    });

    test('salva resultado quando save !== false', async () => {
      await engine.ideate();
      expect(fs.writeFileSync).toHaveBeenCalledTimes(2); // JSON + MD
    });

    test('não salva quando save é false', async () => {
      await engine.ideate({ save: false });
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    test('summary.byArea conta corretamente', async () => {
      engine.analyzers.security.analyze = jest.fn().mockResolvedValue([
        { title: 'S1', description: 'd', impact: 0.9, effort: 'low' },
        { title: 'S2', description: 'd', impact: 0.8, effort: 'medium' },
      ]);

      const result = await engine.ideate({ focus: 'security', save: false });
      expect(result.summary.byArea).toEqual({ security: 2 });
    });
  });

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    test('cria diretório de output se não existe', async () => {
      fs.existsSync.mockReturnValue(false);
      await engine.save({
        generatedAt: 'now', projectId: 'p', duration: 0,
        summary: { totalSuggestions: 0, quickWins: 0, highImpact: 0 },
        quickWins: [], highImpact: [], allSuggestions: [],
      });
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('ideation'),
        { recursive: true },
      );
    });

    test('salva JSON e markdown', async () => {
      const result = {
        generatedAt: 'now', projectId: 'p', duration: 100,
        summary: { totalSuggestions: 0, quickWins: 0, highImpact: 0 },
        quickWins: [], highImpact: [], allSuggestions: [],
      };
      await engine.save(result);

      expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
      const jsonCall = fs.writeFileSync.mock.calls.find(c => c[0].endsWith('.json'));
      const mdCall = fs.writeFileSync.mock.calls.find(c => c[0].endsWith('.md'));
      expect(jsonCall).toBeDefined();
      expect(mdCall).toBeDefined();
    });
  });
});

// ============================================================
// Analyzers individuais (com execSync mockado)
// ============================================================
describe('PerformanceAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    jest.clearAllMocks();
    analyzer = new PerformanceAnalyzer('/fake/project');
  });

  test('detecta operações síncronas excessivas (>10)', async () => {
    execSyncSpy.mockReturnValue(
      Array(15).fill('src/app.js:10: readFileSync(file)').join('\n'),
    );
    const findings = await analyzer.analyze();
    const syncFinding = findings.find(f => f.title.includes('synchronous'));
    expect(syncFinding).toBeDefined();
    expect(syncFinding.impact).toBe(0.7);
  });

  test('não reporta quando <10 operações síncronas', async () => {
    execSyncSpy.mockReturnValue('src/app.js:1: readFileSync\nsrc/app.js:2: writeFileSync');
    const findings = await analyzer.analyze();
    expect(findings.find(f => f.title.includes('synchronous'))).toBeUndefined();
  });

  test('ignora erros de execSync', async () => {
    execSyncSpy.mockImplementation(() => { throw new Error('command failed'); });
    const findings = await analyzer.analyze();
    expect(findings).toEqual([]);
  });
});

describe('SecurityAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    jest.clearAllMocks();
    analyzer = new SecurityAnalyzer('/fake/project');
  });

  test('detecta secrets hardcoded', async () => {
    execSyncSpy.mockImplementation((cmd) => {
      if (cmd.includes('password')) {
        return 'src/config.js:5: password = "secret123"';
      }
      return '';
    });
    const findings = await analyzer.analyze();
    const secretFinding = findings.find(f => f.title.includes('secrets'));
    expect(secretFinding).toBeDefined();
    expect(secretFinding.impact).toBe(0.95);
  });

  test('detecta uso de eval()', async () => {
    execSyncSpy.mockImplementation((cmd) => {
      if (cmd.includes('eval')) {
        return 'src/utils.js:42: eval(userInput)';
      }
      return '';
    });
    const findings = await analyzer.analyze();
    const evalFinding = findings.find(f => f.title.includes('eval'));
    expect(evalFinding).toBeDefined();
    expect(evalFinding.impact).toBe(0.9);
  });

  test('detecta vulnerabilidades de dependências', async () => {
    execSyncSpy.mockImplementation((cmd) => {
      if (cmd.includes('npm audit')) {
        return JSON.stringify({
          metadata: { vulnerabilities: { critical: 2, high: 3 } },
        });
      }
      return '';
    });
    const findings = await analyzer.analyze();
    const depsFinding = findings.find(f => f.title.includes('Vulnerable'));
    expect(depsFinding).toBeDefined();
    expect(depsFinding.impact).toBe(0.95); // critical > 0
  });
});

describe('CodeQualityAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    jest.clearAllMocks();
    analyzer = new CodeQualityAnalyzer('/fake/project');
  });

  test('detecta arquivos grandes (>500 linhas)', async () => {
    execSyncSpy.mockImplementation((cmd) => {
      if (cmd.includes('wc -l')) {
        return '  750 src/huge.js\n  600 src/big.js\n';
      }
      return '';
    });
    const findings = await analyzer.analyze();
    const longFinding = findings.find(f => f.title.includes('Large'));
    expect(longFinding).toBeDefined();
  });

  test('detecta console.log excessivo (>20)', async () => {
    execSyncSpy.mockImplementation((cmd) => {
      if (cmd.includes('console')) {
        return Array(25).fill('src/app.js:1: console.log("debug")').join('\n');
      }
      return '';
    });
    const findings = await analyzer.analyze();
    const consoleFinding = findings.find(f => f.title.includes('console'));
    expect(consoleFinding).toBeDefined();
  });
});

describe('ArchitectureAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    jest.clearAllMocks();
    analyzer = new ArchitectureAnalyzer('/fake/project');
  });

  test('detecta dependências circulares', async () => {
    execSyncSpy.mockImplementation((cmd) => {
      if (cmd.includes('madge')) {
        return 'Circular dependency found:\n  a.js → b.js → c.js → a.js';
      }
      return '';
    });
    const findings = await analyzer.analyze();
    const circularFinding = findings.find(f => f.title.includes('Circular'));
    expect(circularFinding).toBeDefined();
    expect(circularFinding.impact).toBe(0.7);
  });

  test('detecta violações de camada', async () => {
    execSyncSpy.mockImplementation((cmd) => {
      if (cmd.includes('from.*infrastructure')) {
        return 'src/components/App.tsx:5: import { db } from "infrastructure/db"';
      }
      return '';
    });
    const findings = await analyzer.analyze();
    const layerFinding = findings.find(f => f.title.includes('layer'));
    expect(layerFinding).toBeDefined();
  });
});
