const fs = require('fs').promises;
const os = require('os');
const path = require('path');

const FrameworkAnalyzer = require('../../.aiox-core/infrastructure/scripts/framework-analyzer');

/**
 * Regression tests for the framework artifact discovery paths.
 *
 * The analyzer previously resolved its root to `aiox-core/` (no leading dot) and
 * looked for `agents`, `tasks`, `workflows` and `templates` directly under it.
 * The real layout is `.aiox-core/development/<type>/`, so every discovery call
 * hit a non-existent directory, was swallowed by the surrounding try/catch and
 * returned an empty list — the analyzer reported a healthy, empty framework.
 *
 * These tests build a minimal fixture on disk and assert positive counts, so an
 * empty inventory fails loudly instead of passing silently.
 */
describe('FrameworkAnalyzer artifact discovery paths', () => {
  let fixtureRoot;

  const agentFile = `# Test Agent

\`\`\`yaml
agent:
  name: Tester
  id: tester
  title: Test Agent
\`\`\`
`;

  const taskFile = `# Test Task

\`\`\`yaml
task:
  name: test-task
  id: test-task
\`\`\`
`;

  const workflowFile = `workflow:
  id: test-workflow
  name: Test Workflow
  sequence:
    - agent: tester
      action: run
`;

  beforeAll(async () => {
    fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'aiox-analyzer-'));

    const developmentDir = path.join(fixtureRoot, '.aiox-core', 'development');
    await fs.mkdir(path.join(developmentDir, 'agents'), { recursive: true });
    await fs.mkdir(path.join(developmentDir, 'tasks'), { recursive: true });
    await fs.mkdir(path.join(developmentDir, 'workflows'), { recursive: true });
    await fs.mkdir(path.join(developmentDir, 'templates'), { recursive: true });
    await fs.mkdir(path.join(fixtureRoot, '.aiox-core', 'utils'), { recursive: true });

    await fs.writeFile(path.join(developmentDir, 'agents', 'tester.md'), agentFile);
    await fs.writeFile(path.join(developmentDir, 'tasks', 'test-task.md'), taskFile);
    await fs.writeFile(path.join(developmentDir, 'workflows', 'test-workflow.yaml'), workflowFile);
    await fs.writeFile(path.join(developmentDir, 'templates', 'test-tmpl.yaml'), 'template: {}\n');
    await fs.writeFile(
      path.join(fixtureRoot, '.aiox-core', 'utils', 'helper.js'),
      'module.exports = {};\n',
    );
  });

  afterAll(async () => {
    if (fixtureRoot) {
      await fs.rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  it('resolves the framework root to the dot-prefixed .aiox-core directory', () => {
    const analyzer = new FrameworkAnalyzer({ rootPath: fixtureRoot });

    expect(analyzer.aioxCoreDir).toBe(path.join(fixtureRoot, '.aiox-core'));
    expect(analyzer.developmentDir).toBe(path.join(fixtureRoot, '.aiox-core', 'development'));
  });

  it('discovers agents under .aiox-core/development/agents', async () => {
    const analyzer = new FrameworkAnalyzer({ rootPath: fixtureRoot });
    const agents = await analyzer.discoverAgents();

    expect(agents.length).toBeGreaterThan(0);
  });

  it('discovers tasks under .aiox-core/development/tasks', async () => {
    const analyzer = new FrameworkAnalyzer({ rootPath: fixtureRoot });
    const tasks = await analyzer.discoverTasks();

    expect(tasks.length).toBeGreaterThan(0);
  });

  it('discovers workflows under .aiox-core/development/workflows', async () => {
    const analyzer = new FrameworkAnalyzer({ rootPath: fixtureRoot });
    const workflows = await analyzer.discoverWorkflows();

    expect(workflows.length).toBeGreaterThan(0);
  });

  it('discovers templates under .aiox-core/development/templates', async () => {
    const analyzer = new FrameworkAnalyzer({ rootPath: fixtureRoot });
    const templates = await analyzer.discoverTemplates();

    expect(templates.length).toBeGreaterThan(0);
  });

  it('discovers utils under .aiox-core/utils, which is not nested in development/', async () => {
    const analyzer = new FrameworkAnalyzer({ rootPath: fixtureRoot });
    const utils = await analyzer.discoverUtils();

    expect(utils.length).toBeGreaterThan(0);
  });

  it('reports a non-empty inventory for a populated framework', async () => {
    const analyzer = new FrameworkAnalyzer({ rootPath: fixtureRoot });
    const result = await analyzer.analyzeFrameworkStructure('full');

    expect(result.total_components).toBeGreaterThan(0);
    expect(result.agents.length).toBeGreaterThan(0);
    expect(result.tasks.length).toBeGreaterThan(0);
    expect(result.workflows.length).toBeGreaterThan(0);
  });

  it('still returns empty lists when the framework directory is genuinely absent', async () => {
    const emptyRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'aiox-analyzer-empty-'));

    try {
      const analyzer = new FrameworkAnalyzer({ rootPath: emptyRoot });

      await expect(analyzer.discoverAgents()).resolves.toEqual([]);
      await expect(analyzer.discoverTasks()).resolves.toEqual([]);
    } finally {
      await fs.rm(emptyRoot, { recursive: true, force: true });
    }
  });
});
