/**
 * Testes para build-registry.js
 *
 * Valida a construção do service registry: conversão de nomes,
 * extração de tags/agents/descriptions, deduplicação de IDs,
 * ordenação e serialização.
 */

const path = require('path');

// Mock glob antes do require do módulo
jest.mock('glob', () => ({
  glob: jest.fn().mockResolvedValue([]),
}));

const fs = require('fs').promises;
const { glob } = require('glob');
const { buildRegistry, saveRegistry, REGISTRY_VERSION } = require('../../../.aiox-core/core/registry/build-registry');

// Mock fs.promises
jest.spyOn(fs, 'readFile').mockResolvedValue('');
jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

// Silenciar console durante testes
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
  console.warn.mockRestore();
  console.error.mockRestore();
});

beforeEach(() => {
  jest.clearAllMocks();
  glob.mockResolvedValue([]);
  fs.readFile.mockResolvedValue('');
  fs.writeFile.mockResolvedValue(undefined);
});

// ============================================================
// REGISTRY_VERSION
// ============================================================
describe('REGISTRY_VERSION', () => {
  test('é uma string semver válida', () => {
    expect(REGISTRY_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

// ============================================================
// buildRegistry - estrutura básica
// ============================================================
describe('buildRegistry', () => {
  test('retorna registry vazio quando não encontra arquivos', async () => {
    const registry = await buildRegistry('/fake/project');
    expect(registry.version).toBe(REGISTRY_VERSION);
    expect(registry.totalWorkers).toBe(0);
    expect(registry.workers).toEqual([]);
    expect(registry.categories).toEqual({});
    expect(registry.generated).toBeDefined();
  });

  test('inclui timestamp ISO no campo generated', async () => {
    const registry = await buildRegistry('/fake');
    expect(new Date(registry.generated).toISOString()).toBe(registry.generated);
  });

  // ============================================================
  // toKebabId (testado indiretamente via worker.id)
  // ============================================================
  describe('toKebabId (via worker.id)', () => {
    test('converte filename .md para kebab-case', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-create-component.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('# Title\nDescription here');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers[0];
      expect(worker.id).toBe('dev-create-component');
    });

    test('converte filename .js removendo extensão', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('scripts')) return ['yaml-validator.js'];
        return [];
      });
      fs.readFile.mockResolvedValue('/** Script description */');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.id === 'yaml-validator');
      expect(worker).toBeDefined();
    });

    test('converte filename .yaml removendo extensão', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('workflows')) return ['brownfield-workflow.yaml'];
        return [];
      });
      fs.readFile.mockResolvedValue('');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.id === 'brownfield-workflow');
      expect(worker).toBeDefined();
    });

    test('remove caracteres especiais convertendo para hifens', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev_Create Component!.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('Desc');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].id).toBe('dev-create-component');
    });
  });

  // ============================================================
  // toTitleCase (via worker.name)
  // ============================================================
  describe('toTitleCase (via worker.name)', () => {
    test('converte kebab-case para Title Case', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-create-story.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('Desc');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].name).toBe('Dev Create Story');
    });
  });

  // ============================================================
  // extractMarkdownDescription
  // ============================================================
  describe('extractMarkdownDescription (via description)', () => {
    test('extrai primeiro parágrafo não-header de markdown', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-task.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('# Title\n---\nActual description of the task');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].description).toBe('Actual description of the task');
    });

    test('remove formatação markdown (bold, italic, code)', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-task.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('# Title\n**Bold** *italic* `code` text');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].description).toBe('Bold italic code text');
    });

    test('retorna fallback quando arquivo só tem headers', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-task.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('# Title\n## Subtitle\n---');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].description).toBe('No description available');
    });

    test('trunca descrição em 200 caracteres', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-task.md'];
        return [];
      });
      const longDesc = 'A'.repeat(300);
      fs.readFile.mockResolvedValue(`# Title\n${longDesc}`);

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].description.length).toBe(200);
    });

    test('retorna fallback quando readFile falha', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-task.md'];
        return [];
      });
      fs.readFile.mockRejectedValue(new Error('ENOENT'));

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].description).toBe('No description available');
    });
  });

  // ============================================================
  // extractJSDescription
  // ============================================================
  describe('extractJSDescription (via JS file description)', () => {
    test('extrai @description de JSDoc', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('scripts')) return ['config-loader.js'];
        return [];
      });
      fs.readFile.mockResolvedValue(
        '/**\n * @description Loads configuration from YAML files\n * @version 1.0\n */'
      );

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.id === 'config-loader');
      expect(worker.description).toBe('Loads configuration from YAML files');
    });

    test('extrai primeiro parágrafo de JSDoc quando sem @description', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('scripts')) return ['validator.js'];
        return [];
      });
      fs.readFile.mockResolvedValue(
        '/**\n * Validates YAML configuration files\n *\n * @module validator\n */'
      );

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.id === 'validator');
      expect(worker.description).toBe('Validates YAML configuration files');
    });

    test('retorna fallback quando sem JSDoc', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('scripts')) return ['simple.js'];
        return [];
      });
      fs.readFile.mockResolvedValue('const x = 1;\nmodule.exports = x;');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.id === 'simple');
      expect(worker.description).toBe('JavaScript utility script');
    });

    test('retorna fallback quando readFile falha para JS', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('scripts')) return ['missing.js'];
        return [];
      });
      fs.readFile.mockRejectedValue(new Error('ENOENT'));

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.id === 'missing');
      expect(worker.description).toBe('JavaScript utility script');
    });
  });

  // ============================================================
  // extractTags
  // ============================================================
  describe('extractTags (via worker.tags)', () => {
    test('inclui category e subcategory nas tags', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-create-test.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('Desc');

      const registry = await buildRegistry('/fake');
      const tags = registry.workers[0].tags;
      expect(tags).toContain('task');
      expect(tags).toContain('dev');
    });

    test('extrai palavras do filename como tags (>2 chars)', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['qa-validate-database.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('Desc');

      const registry = await buildRegistry('/fake');
      const tags = registry.workers[0].tags;
      expect(tags).toContain('validate');
      expect(tags).toContain('database');
    });

    test('adiciona tag testing para arquivos com qa/test', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['qa-test-runner.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('Desc');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].tags).toContain('testing');
    });

    test('adiciona tag database para arquivos com db', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['db-migrate-schema.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('Desc');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].tags).toContain('database');
    });

    test('adiciona tag git para arquivos com github/git', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['github-devops-deploy.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('Desc');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].tags).toContain('git');
    });

    test('adiciona tag product para arquivos com po/story', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['po-create-story.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('Desc');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].tags).toContain('product');
    });

    test('adiciona tag creation para arquivos com create/generate', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-generate-report.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('Desc');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].tags).toContain('creation');
    });

    test('adiciona tag validation para arquivos com validate/check', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('scripts')) return ['config-checker.js'];
        return [];
      });
      fs.readFile.mockResolvedValue('/** desc */');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.id === 'config-checker');
      expect(worker.tags).toContain('validation');
    });

    test('adiciona tag analysis para arquivos com analyze/audit', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('scripts')) return ['code-analyzer.js'];
        return [];
      });
      fs.readFile.mockResolvedValue('/** desc */');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.id === 'code-analyzer');
      expect(worker.tags).toContain('analysis');
    });
  });

  // ============================================================
  // extractAgents
  // ============================================================
  describe('extractAgents (via worker.agents)', () => {
    const agentCases = [
      ['dev-task.md', 'dev'],
      ['qa-test.md', 'qa'],
      ['po-story.md', 'po'],
      ['pm-roadmap.md', 'pm'],
      ['sm-sprint.md', 'sm'],
      ['db-migration.md', 'db-sage'],
      ['architect-design.md', 'architect'],
      ['analyst-research.md', 'analyst'],
      ['github-devops-deploy.md', 'github-devops'],
      ['ux-wireframe.md', 'ux-expert'],
    ];

    test.each(agentCases)('detecta agente %s → %s', async (filename, expectedAgent) => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return [filename];
        return [];
      });
      fs.readFile.mockResolvedValue('Desc');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].agents).toContain(expectedAgent);
    });

    test('retorna array vazio para arquivo sem prefixo de agente', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['general-config.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('Desc');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].agents).toEqual([]);
    });
  });

  // ============================================================
  // getExecutorTypes
  // ============================================================
  describe('getExecutorTypes (via worker.executorTypes)', () => {
    test('task → [Agent, Worker]', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-x.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('D');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].executorTypes).toEqual(['Agent', 'Worker']);
    });

    test('script → [CLI, Script]', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('scripts')) return ['util.js'];
        return [];
      });
      fs.readFile.mockResolvedValue('/** d */');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'script');
      expect(worker.executorTypes).toEqual(['CLI', 'Script']);
    });

    test('template → [Agent]', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('product/templates')) return ['doc-template.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('Template');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'template');
      expect(worker.executorTypes).toEqual(['Agent']);
    });

    test('checklist → [Agent]', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('checklists')) return ['quality-check.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('Check');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'checklist');
      expect(worker.executorTypes).toEqual(['Agent']);
    });

    test('workflow → [Agent, Worker]', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('workflows')) return ['build-flow.yaml'];
        return [];
      });
      fs.readFile.mockResolvedValue('');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'workflow');
      expect(worker.executorTypes).toEqual(['Agent', 'Worker']);
    });
  });

  // ============================================================
  // estimatePerformance
  // ============================================================
  describe('estimatePerformance (via worker.performance)', () => {
    test('task tem avgDuration 1m e não cacheable', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-x.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('D');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].performance).toEqual({
        avgDuration: '1m',
        cacheable: false,
        parallelizable: false,
      });
    });

    test('script tem avgDuration 500ms e cacheable', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('scripts')) return ['util.js'];
        return [];
      });
      fs.readFile.mockResolvedValue('/** d */');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'script');
      expect(worker.performance.cacheable).toBe(true);
      expect(worker.performance.parallelizable).toBe(true);
    });
  });

  // ============================================================
  // subcategoryExtractor
  // ============================================================
  describe('subcategoryExtractor (via worker.subcategory)', () => {
    test('task: extrai prefixo dev- como subcategory dev', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-build-app.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('D');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].subcategory).toBe('dev');
    });

    test('task: db- mapeia para database', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['db-migrate.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('D');

      const registry = await buildRegistry('/fake');
      // NOTE: db- matches regex prefix first → 'db', not 'database'
      // The db- → database branch is dead code (regex catches it first)
      expect(registry.workers[0].subcategory).toBe('db');
    });

    test('task: create keyword sem prefixo agent → creation', async () => {
      // NOTE: regex ^([a-z]+)- captura 'create' como prefixo.
      // O branch 'includes(create)' é dead code para filenames
      // que já matcham o regex. Testamos o regex behavior real:
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['create-module.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('D');

      const registry = await buildRegistry('/fake');
      // regex captura 'create' como prefixo
      expect(registry.workers[0].subcategory).toBe('create');
    });

    test('task: validate keyword capturado por regex como prefixo', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['validate-config.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('D');

      const registry = await buildRegistry('/fake');
      // regex ^([a-z]+)- captura 'validate' antes do branch includes()
      expect(registry.workers[0].subcategory).toBe('validate');
    });

    test('task: analyze keyword capturado por regex como prefixo', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['analyze-performance.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('D');

      const registry = await buildRegistry('/fake');
      // regex captura 'analyze' como prefixo
      expect(registry.workers[0].subcategory).toBe('analyze');
    });

    test('task: filename sem hifens → general', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['README.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('D');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].subcategory).toBe('general');
    });

    test('script: validator → validation subcategory', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('scripts')) return ['config-validator.js'];
        return [];
      });
      fs.readFile.mockResolvedValue('/** d */');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'script');
      expect(worker.subcategory).toBe('validation');
    });

    test('script: analyzer → analysis subcategory', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('scripts')) return ['code-analyzer.js'];
        return [];
      });
      fs.readFile.mockResolvedValue('/** d */');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'script');
      expect(worker.subcategory).toBe('analysis');
    });

    test('script: generator → generation subcategory', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('scripts')) return ['report-generator.js'];
        return [];
      });
      fs.readFile.mockResolvedValue('/** d */');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'script');
      expect(worker.subcategory).toBe('generation');
    });

    test('script: manager → management subcategory', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('scripts')) return ['state-manager.js'];
        return [];
      });
      fs.readFile.mockResolvedValue('/** d */');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'script');
      expect(worker.subcategory).toBe('management');
    });

    test('script: config/loader → configuration subcategory', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('scripts')) return ['config-loader.js'];
        return [];
      });
      fs.readFile.mockResolvedValue('/** d */');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'script');
      expect(worker.subcategory).toBe('configuration');
    });

    test('script: test → testing subcategory', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('scripts')) return ['run-test-suite.js'];
        return [];
      });
      fs.readFile.mockResolvedValue('/** d */');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'script');
      expect(worker.subcategory).toBe('testing');
    });

    test('script: genérico → utility', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('scripts')) return ['helpers.js'];
        return [];
      });
      fs.readFile.mockResolvedValue('/** d */');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'script');
      expect(worker.subcategory).toBe('utility');
    });

    test('template: ide-rules path → ide-rules', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('product/templates')) return ['ide-rules/vscode.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('Template');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'template');
      expect(worker.subcategory).toBe('ide-rules');
    });

    test('template: personalized path → personalized', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('product/templates')) return ['personalized/custom.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('Template');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'template');
      expect(worker.subcategory).toBe('personalized');
    });

    test('template: genérico → document', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('product/templates')) return ['readme-template.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('Template');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'template');
      expect(worker.subcategory).toBe('document');
    });

    test('checklist: sempre quality', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('checklists')) return ['pre-deploy.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('Check');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'checklist');
      expect(worker.subcategory).toBe('quality');
    });

    test('workflow: brownfield → brownfield', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('workflows')) return ['brownfield-integration.yaml'];
        return [];
      });
      fs.readFile.mockResolvedValue('');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'workflow');
      expect(worker.subcategory).toBe('brownfield');
    });

    test('workflow: greenfield → greenfield', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('workflows')) return ['greenfield-setup.yaml'];
        return [];
      });
      fs.readFile.mockResolvedValue('');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'workflow');
      expect(worker.subcategory).toBe('greenfield');
    });

    test('workflow: genérico → general', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('workflows')) return ['ci-pipeline.yaml'];
        return [];
      });
      fs.readFile.mockResolvedValue('');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'workflow');
      expect(worker.subcategory).toBe('general');
    });
  });

  // ============================================================
  // Deduplicação de IDs
  // ============================================================
  describe('deduplicação de IDs', () => {
    test('adiciona sufixo de category quando ID duplica', async () => {
      // Dois arquivos em categorias diferentes com mesmo basename
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['setup-env.md'];
        if (pattern.includes('checklists')) return ['setup-env.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('Desc');

      const registry = await buildRegistry('/fake');
      const ids = registry.workers.map((w) => w.id);
      expect(ids).toContain('setup-env');
      expect(ids).toContain('setup-env-checklist');
    });
  });

  // ============================================================
  // Ordenação
  // ============================================================
  describe('ordenação', () => {
    test('ordena workers por category e depois por name', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-z-task.md', 'dev-a-task.md'];
        if (pattern.includes('checklists')) return ['alpha-check.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('D');

      const registry = await buildRegistry('/fake');
      const categories = registry.workers.map((w) => w.category);
      // checklist < task (alphabetical)
      expect(categories[0]).toBe('checklist');
      expect(categories[1]).toBe('task');

      // Within task: A antes de Z (localeCompare)
      const tasks = registry.workers.filter((w) => w.category === 'task');
      expect(tasks[0].name.localeCompare(tasks[1].name)).toBeLessThan(0);
    });
  });

  // ============================================================
  // buildCategorySummary
  // ============================================================
  describe('buildCategorySummary (via registry.categories)', () => {
    test('conta workers por categoria', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-a.md', 'qa-b.md'];
        if (pattern.includes('scripts')) return ['util.js'];
        return [];
      });
      fs.readFile.mockResolvedValue('D');

      const registry = await buildRegistry('/fake');
      expect(registry.categories.task.count).toBe(2);
      expect(registry.categories.script.count).toBe(1);
    });

    test('lista subcategorias únicas e ordenadas', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-a.md', 'qa-b.md', 'dev-c.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('D');

      const registry = await buildRegistry('/fake');
      const subs = registry.categories.task.subcategories;
      expect(subs).toContain('dev');
      expect(subs).toContain('qa');
      // Deve estar ordenado
      expect(subs).toEqual([...subs].sort());
    });

    test('inclui description da categoria', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-a.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('D');

      const registry = await buildRegistry('/fake');
      expect(registry.categories.task.description).toBe('Executable task workflows for agents');
    });
  });

  // ============================================================
  // worker.metadata
  // ============================================================
  describe('worker.metadata', () => {
    test('task tem source development', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-x.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('D');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].metadata.source).toBe('development');
    });

    test('script tem source infrastructure', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('scripts')) return ['util.js'];
        return [];
      });
      fs.readFile.mockResolvedValue('/** d */');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'script');
      expect(worker.metadata.source).toBe('infrastructure');
    });

    test('template tem source product', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('product/templates')) return ['doc.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('T');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'template');
      expect(worker.metadata.source).toBe('product');
    });

    test('data tem source core', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('core/data') && pattern.includes('.md')) return ['knowledge-base.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('KB');

      const registry = await buildRegistry('/fake');
      const worker = registry.workers.find((w) => w.category === 'data');
      expect(worker.metadata.source).toBe('core');
    });

    test('metadata inclui addedVersion', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-x.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('D');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].metadata.addedVersion).toBe(REGISTRY_VERSION);
    });
  });

  // ============================================================
  // worker.path
  // ============================================================
  describe('worker.path', () => {
    test('normaliza backslashes para forward slashes', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['subdir\\dev-task.md'];
        return [];
      });
      fs.readFile.mockResolvedValue('D');

      const registry = await buildRegistry('/fake');
      expect(registry.workers[0].path).not.toContain('\\');
      expect(registry.workers[0].path).toContain('/');
    });
  });

  // ============================================================
  // Tratamento de erros no glob
  // ============================================================
  describe('tratamento de erros', () => {
    test('continua quando glob falha para um pattern', async () => {
      let callCount = 0;
      glob.mockImplementation(async () => {
        callCount++;
        if (callCount === 1) throw new Error('Permission denied');
        return [];
      });

      const registry = await buildRegistry('/fake');
      expect(registry.totalWorkers).toBe(0);
      expect(console.error).toHaveBeenCalled();
    });
  });

  // ============================================================
  // totalWorkers
  // ============================================================
  describe('totalWorkers', () => {
    test('reflete quantidade real de workers', async () => {
      glob.mockImplementation(async (pattern) => {
        if (pattern.includes('tasks')) return ['dev-a.md', 'qa-b.md'];
        if (pattern.includes('scripts')) return ['util.js'];
        return [];
      });
      fs.readFile.mockResolvedValue('D');

      const registry = await buildRegistry('/fake');
      expect(registry.totalWorkers).toBe(registry.workers.length);
      expect(registry.totalWorkers).toBe(3);
    });
  });
});

// ============================================================
// saveRegistry
// ============================================================
describe('saveRegistry', () => {
  test('salva JSON formatado no path especificado', async () => {
    const registry = { version: '1.0.0', workers: [] };
    await saveRegistry(registry, '/output/registry.json');
    expect(fs.writeFile).toHaveBeenCalledWith(
      '/output/registry.json',
      JSON.stringify(registry, null, 2),
      'utf8'
    );
  });

  test('serializa registry com indentação de 2 espaços', async () => {
    const registry = { version: '1.0.0', workers: [{ id: 'test' }] };
    await saveRegistry(registry, '/out.json');
    const written = fs.writeFile.mock.calls[0][1];
    expect(written).toContain('  ');
    expect(JSON.parse(written)).toEqual(registry);
  });
});
