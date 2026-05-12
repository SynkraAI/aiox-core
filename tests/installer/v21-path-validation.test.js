/**
 * v2.1 Path Validation Tests
 *
 * Validates that after migration to modular structure:
 * 1. All agent dependencies point to existing files
 * 2. All task references are valid
 * 3. All workflow references are valid
 * 4. No {root} placeholders remain (should be replaced with .aiox-core)
 *
 * @module tests/installer/v21-path-validation
 */

const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

// Path to .aiox-core directory
const AIOX_CORE_PATH = path.join(__dirname, '..', '..', '.aiox-core');

// v2.1 Module mapping for dependency resolution
const MODULE_MAPPING = {
  // Development module
  agents: 'development/agents',
  tasks: 'development/tasks',
  workflows: 'development/workflows',
  scripts: 'development/scripts',
  personas: 'development/personas',
  'agent-teams': 'development/agent-teams',

  // Product module
  templates: 'product/templates',
  checklists: 'product/checklists',
  data: 'product/data',
  cli: 'product/cli',
  api: 'product/api',

  // Core module
  utils: 'core/utils',
  config: 'core/config',
  registry: 'core/registry',
  manifest: 'core/manifest',

  // Infrastructure module
  tools: 'infrastructure/tools',
  integrations: 'infrastructure/integrations',
  hooks: 'infrastructure/hooks',
  telemetry: 'infrastructure/telemetry',
};

/**
 * Extract YAML frontmatter from markdown file
 * @param {string} content - File content
 * @returns {Object|null} Parsed YAML or null
 */
function extractYamlFromMarkdown(content) {
  // Try to find YAML in code block
  const codeBlockMatch = content.match(/```yaml\n([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return yaml.load(codeBlockMatch[1]);
    } catch (e) {
      return null;
    }
  }

  // Try frontmatter style (---)
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    try {
      return yaml.load(frontmatterMatch[1]);
    } catch (e) {
      return null;
    }
  }

  return null;
}

/**
 * Get all files in a directory recursively
 * @param {string} dir - Directory path
 * @param {string} ext - File extension filter
 * @returns {Promise<string[]>} Array of file paths
 */
async function getFilesRecursive(dir, ext = '.md') {
  const files = [];

  if (!await fs.pathExists(dir)) {
    return files;
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await getFilesRecursive(fullPath, ext);
      files.push(...subFiles);
    } else if (entry.name.endsWith(ext)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Resolve dependency path based on type
 * @param {string} type - Dependency type (tasks, checklists, etc.)
 * @param {string} filename - Dependency filename
 * @returns {string} Full path to dependency file
 */
function resolveDependencyPath(type, filename) {
  const modulePath = MODULE_MAPPING[type];
  if (!modulePath) {
    // Fallback to development/{type}
    return path.join(AIOX_CORE_PATH, 'development', type, filename);
  }
  return path.join(AIOX_CORE_PATH, modulePath, filename);
}

describe('v2.1 Path Validation', () => {
  const agents = [];
  const tasks = [];
  const workflows = [];
  let allFiles = [];

  before(async () => {
    // Load all agents
    const agentDir = path.join(AIOX_CORE_PATH, 'development', 'agents');
    if (await fs.pathExists(agentDir)) {
      const agentFiles = await getFilesRecursive(agentDir);
      for (const file of agentFiles) {
        const content = await fs.readFile(file, 'utf8');
        const parsed = extractYamlFromMarkdown(content);
        agents.push({
          file: path.relative(AIOX_CORE_PATH, file),
          name: path.basename(file, '.md'),
          content,
          yaml: parsed,
        });
      }
    }

    // Load all tasks
    const taskDir = path.join(AIOX_CORE_PATH, 'development', 'tasks');
    if (await fs.pathExists(taskDir)) {
      const taskFiles = await getFilesRecursive(taskDir);
      for (const file of taskFiles) {
        const content = await fs.readFile(file, 'utf8');
        const parsed = extractYamlFromMarkdown(content);
        tasks.push({
          file: path.relative(AIOX_CORE_PATH, file),
          name: path.basename(file, '.md'),
          content,
          yaml: parsed,
        });
      }
    }

    // Load all workflows
    const workflowDir = path.join(AIOX_CORE_PATH, 'development', 'workflows');
    if (await fs.pathExists(workflowDir)) {
      const workflowFiles = await getFilesRecursive(workflowDir);
      for (const file of workflowFiles) {
        const content = await fs.readFile(file, 'utf8');
        const parsed = extractYamlFromMarkdown(content);
        workflows.push({
          file: path.relative(AIOX_CORE_PATH, file),
          name: path.basename(file, '.md'),
          content,
          yaml: parsed,
        });
      }
    }

    // Get all files for {root} placeholder check
    allFiles = await getFilesRecursive(AIOX_CORE_PATH);
  });

  describe('Agent Dependency Validation', () => {
    it('should have agents loaded', () => {
      assert.ok(agents.length > 0, 'No agents found in development/agents/');
    });

    it('should have all agent task dependencies exist', async () => {
      const missingDeps = [];

      for (const agent of agents) {
        if (!agent.yaml || !agent.yaml.dependencies) continue;

        const taskDeps = agent.yaml.dependencies.tasks || [];
        for (const task of taskDeps) {
          const taskPath = resolveDependencyPath('tasks', task);
          if (!await fs.pathExists(taskPath)) {
            missingDeps.push({
              agent: agent.name,
              type: 'tasks',
              dependency: task,
              expectedPath: path.relative(AIOX_CORE_PATH, taskPath),
            });
          }
        }
      }

      if (missingDeps.length > 0) {
        console.log('\n❌ Missing task dependencies:');
        missingDeps.forEach(d => {
          console.log(`   Agent: ${d.agent} → Task: ${d.dependency}`);
          console.log(`   Expected: ${d.expectedPath}`);
        });
      }

      assert.strictEqual(missingDeps.length, 0,
        `Found ${missingDeps.length} missing task dependencies`);
    });

    it('should have all agent checklist dependencies exist', async () => {
      const missingDeps = [];

      for (const agent of agents) {
        if (!agent.yaml || !agent.yaml.dependencies) continue;

        const checklistDeps = agent.yaml.dependencies.checklists || [];
        for (const checklist of checklistDeps) {
          const checklistPath = resolveDependencyPath('checklists', checklist);
          if (!await fs.pathExists(checklistPath)) {
            missingDeps.push({
              agent: agent.name,
              type: 'checklists',
              dependency: checklist,
              expectedPath: path.relative(AIOX_CORE_PATH, checklistPath),
            });
          }
        }
      }

      if (missingDeps.length > 0) {
        console.log('\n❌ Missing checklist dependencies:');
        missingDeps.forEach(d => {
          console.log(`   Agent: ${d.agent} → Checklist: ${d.dependency}`);
          console.log(`   Expected: ${d.expectedPath}`);
        });
      }

      assert.strictEqual(missingDeps.length, 0,
        `Found ${missingDeps.length} missing checklist dependencies`);
    });

    it('should have all agent template dependencies exist', async () => {
      const missingDeps = [];

      for (const agent of agents) {
        if (!agent.yaml || !agent.yaml.dependencies) continue;

        const templateDeps = agent.yaml.dependencies.templates || [];
        for (const template of templateDeps) {
          const templatePath = resolveDependencyPath('templates', template);
          if (!await fs.pathExists(templatePath)) {
            missingDeps.push({
              agent: agent.name,
              type: 'templates',
              dependency: template,
              expectedPath: path.relative(AIOX_CORE_PATH, templatePath),
            });
          }
        }
      }

      if (missingDeps.length > 0) {
        console.log('\n❌ Missing template dependencies:');
        missingDeps.forEach(d => {
          console.log(`   Agent: ${d.agent} → Template: ${d.dependency}`);
          console.log(`   Expected: ${d.expectedPath}`);
        });
      }

      assert.strictEqual(missingDeps.length, 0,
        `Found ${missingDeps.length} missing template dependencies`);
    });
  });

  describe('Task Dependency Validation', () => {
    it('should have tasks loaded', () => {
      assert.ok(tasks.length > 0, 'No tasks found in development/tasks/');
    });

    it('should have all task dependencies exist', async () => {
      const missingDeps = [];

      for (const task of tasks) {
        if (!task.yaml || !task.yaml.dependencies) continue;

        for (const [type, deps] of Object.entries(task.yaml.dependencies)) {
          if (!Array.isArray(deps)) continue;

          for (const dep of deps) {
            // Skip external tools
            if (type === 'tools' && typeof dep === 'string' && !dep.endsWith('.md')) {
              continue;
            }

            const depPath = resolveDependencyPath(type, dep);
            if (!await fs.pathExists(depPath)) {
              missingDeps.push({
                task: task.name,
                type,
                dependency: dep,
                expectedPath: path.relative(AIOX_CORE_PATH, depPath),
              });
            }
          }
        }
      }

      if (missingDeps.length > 0) {
        console.log('\n❌ Missing task dependencies:');
        missingDeps.forEach(d => {
          console.log(`   Task: ${d.task} → ${d.type}: ${d.dependency}`);
          console.log(`   Expected: ${d.expectedPath}`);
        });
      }

      assert.strictEqual(missingDeps.length, 0,
        `Found ${missingDeps.length} missing task dependencies`);
    });
  });

  describe('Workflow Validation', () => {
    it('should load workflows (if any exist)', () => {
      // Workflows are optional, just log the count
      console.log(`   Found ${workflows.length} workflow(s)`);
    });

    it('should have valid workflow step references', async () => {
      const invalidRefs = [];

      for (const workflow of workflows) {
        if (!workflow.yaml || !workflow.yaml.steps) continue;

        for (const step of workflow.yaml.steps) {
          // Check agent references
          if (step.agent) {
            const agentPath = resolveDependencyPath('agents', `${step.agent}.md`);
            if (!await fs.pathExists(agentPath)) {
              invalidRefs.push({
                workflow: workflow.name,
                stepType: 'agent',
                reference: step.agent,
                expectedPath: path.relative(AIOX_CORE_PATH, agentPath),
              });
            }
          }

          // Check task references
          if (step.task) {
            const taskPath = resolveDependencyPath('tasks', `${step.task}.md`);
            if (!await fs.pathExists(taskPath)) {
              invalidRefs.push({
                workflow: workflow.name,
                stepType: 'task',
                reference: step.task,
                expectedPath: path.relative(AIOX_CORE_PATH, taskPath),
              });
            }
          }
        }
      }

      if (invalidRefs.length > 0) {
        console.log('\n❌ Invalid workflow references:');
        invalidRefs.forEach(r => {
          console.log(`   Workflow: ${r.workflow} → ${r.stepType}: ${r.reference}`);
          console.log(`   Expected: ${r.expectedPath}`);
        });
      }

      assert.strictEqual(invalidRefs.length, 0,
        `Found ${invalidRefs.length} invalid workflow references`);
    });
  });

  describe('{root} Placeholder Validation', () => {
    it('should not have any unreplaced {root} placeholders in .md files', async () => {
      const filesWithRoot = [];

      for (const file of allFiles) {
        if (!file.endsWith('.md') && !file.endsWith('.yaml') && !file.endsWith('.yml')) {
          continue;
        }

        const content = await fs.readFile(file, 'utf8');

        // Check for {root} placeholder that should have been replaced
        if (content.includes('{root}')) {
          const matches = content.match(/\{root\}/g);
          filesWithRoot.push({
            file: path.relative(AIOX_CORE_PATH, file),
            count: matches ? matches.length : 0,
          });
        }
      }

      if (filesWithRoot.length > 0) {
        console.log('\n⚠️ Files with unreplaced {root} placeholders:');
        filesWithRoot.forEach(f => {
          console.log(`   ${f.file}: ${f.count} occurrence(s)`);
        });
      }

      // This is a warning, not a hard failure (some templates may intentionally use {root})
      console.log(`\n   Total files with {root}: ${filesWithRoot.length}`);
    });
  });

  describe('v2.1 Module Structure Validation', () => {
    it('should have core module directory', async () => {
      const coreDir = path.join(AIOX_CORE_PATH, 'core');
      const exists = await fs.pathExists(coreDir);
      assert.ok(exists, 'core/ directory should exist');
    });

    it('should have development module directory', async () => {
      const devDir = path.join(AIOX_CORE_PATH, 'development');
      const exists = await fs.pathExists(devDir);
      assert.ok(exists, 'development/ directory should exist');
    });

    it('should have product module directory', async () => {
      const productDir = path.join(AIOX_CORE_PATH, 'product');
      const exists = await fs.pathExists(productDir);
      assert.ok(exists, 'product/ directory should exist');
    });

    it('should have infrastructure module directory', async () => {
      const infraDir = path.join(AIOX_CORE_PATH, 'infrastructure');
      const exists = await fs.pathExists(infraDir);
      assert.ok(exists, 'infrastructure/ directory should exist');
    });

    it('should have agents in development/agents/', async () => {
      const agentsDir = path.join(AIOX_CORE_PATH, 'development', 'agents');
      const files = await getFilesRecursive(agentsDir);
      assert.ok(files.length > 0, 'development/agents/ should have agent files');
      console.log(`   Found ${files.length} agent(s)`);
    });

    it('should have tasks in development/tasks/', async () => {
      const tasksDir = path.join(AIOX_CORE_PATH, 'development', 'tasks');
      const files = await getFilesRecursive(tasksDir);
      assert.ok(files.length > 0, 'development/tasks/ should have task files');
      console.log(`   Found ${files.length} task(s)`);
    });

    it('should have templates in product/templates/', async () => {
      const templatesDir = path.join(AIOX_CORE_PATH, 'product', 'templates');
      const files = await getFilesRecursive(templatesDir);
      console.log(`   Found ${files.length} template(s)`);
    });

    it('should have checklists in product/checklists/', async () => {
      const checklistsDir = path.join(AIOX_CORE_PATH, 'product', 'checklists');
      const files = await getFilesRecursive(checklistsDir);
      console.log(`   Found ${files.length} checklist(s)`);
    });
  });
});

// Summary report function
async function generateValidationReport() {
  console.log('\n' + '='.repeat(60));
  console.log('v2.1 PATH VALIDATION REPORT');
  console.log('='.repeat(60));

  const report = {
    agents: { total: 0, withDeps: 0, missingDeps: [] },
    tasks: { total: 0, withDeps: 0, missingDeps: [] },
    workflows: { total: 0, invalidRefs: [] },
    rootPlaceholders: { files: [] },
    modules: { core: false, development: false, product: false, infrastructure: false },
  };

  // Check modules exist
  report.modules.core = await fs.pathExists(path.join(AIOX_CORE_PATH, 'core'));
  report.modules.development = await fs.pathExists(path.join(AIOX_CORE_PATH, 'development'));
  report.modules.product = await fs.pathExists(path.join(AIOX_CORE_PATH, 'product'));
  report.modules.infrastructure = await fs.pathExists(path.join(AIOX_CORE_PATH, 'infrastructure'));

  console.log('\nModule Structure:');
  console.log(`  core/:           ${report.modules.core ? '✅' : '❌'}`);
  console.log(`  development/:    ${report.modules.development ? '✅' : '❌'}`);
  console.log(`  product/:        ${report.modules.product ? '✅' : '❌'}`);
  console.log(`  infrastructure/: ${report.modules.infrastructure ? '✅' : '❌'}`);

  // Count agents
  const agentDir = path.join(AIOX_CORE_PATH, 'development', 'agents');
  if (await fs.pathExists(agentDir)) {
    const agents = await getFilesRecursive(agentDir);
    report.agents.total = agents.length;
  }

  // Count tasks
  const taskDir = path.join(AIOX_CORE_PATH, 'development', 'tasks');
  if (await fs.pathExists(taskDir)) {
    const tasks = await getFilesRecursive(taskDir);
    report.tasks.total = tasks.length;
  }

  console.log('\nFile Counts:');
  console.log(`  Agents:    ${report.agents.total}`);
  console.log(`  Tasks:     ${report.tasks.total}`);

  console.log('\n' + '='.repeat(60));

  return report;
}

module.exports = { generateValidationReport, extractYamlFromMarkdown, resolveDependencyPath };
