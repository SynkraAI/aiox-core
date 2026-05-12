/**
 * Manifest Generator
 *
 * Generates CSV manifest files for agents, workers, and tasks.
 * Scans the .aiox-core directory structure to build comprehensive manifests.
 *
 * @module manifest-generator
 * @version 1.0.0
 * @story 2.13 - Manifest System
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * CSV escape helper - escapes special characters in CSV values
 * @param {string} value - Value to escape
 * @returns {string} Escaped value
 */
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Parse YAML front matter from markdown files
 * Handles various YAML formats and parsing errors gracefully
 * @param {string} content - File content
 * @returns {object|null} Parsed YAML or null
 */
function parseYAMLFromMarkdown(content) {
  // Look for YAML in code blocks (```yaml ... ```)
  const yamlBlockMatch = content.match(/```yaml\n([\s\S]*?)```/);
  if (yamlBlockMatch) {
    try {
      return yaml.load(yamlBlockMatch[1]);
    } catch (_e) {
      // Try to extract just the agent section if full parse fails
      return extractAgentSection(yamlBlockMatch[1]);
    }
  }

  // Look for YAML front matter (--- ... ---)
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontMatterMatch) {
    try {
      return yaml.load(frontMatterMatch[1]);
    } catch (_e) {
      return extractAgentSection(frontMatterMatch[1]);
    }
  }

  return null;
}

/**
 * Extract agent section from YAML when full parse fails
 * @param {string} yamlContent - YAML content string
 * @returns {object|null} Agent data or null
 */
function extractAgentSection(yamlContent) {
  try {
    // Find agent: block and extract key fields using regex
    const agentMatch = yamlContent.match(/^agent:\s*\n((?: {2}.+\n)*)/m);
    if (!agentMatch) return null;

    const agentLines = agentMatch[1];

    // Extract individual fields
    const nameMatch = agentLines.match(/name:\s*(.+)/);
    const idMatch = agentLines.match(/id:\s*(.+)/);
    const titleMatch = agentLines.match(/title:\s*(.+)/);
    const iconMatch = agentLines.match(/icon:\s*(.+)/);
    const whenToUseMatch = agentLines.match(/whenToUse:\s*(.+)/);

    // Find persona_profile section
    const personaMatch = yamlContent.match(/persona_profile:\s*\n(?: {2}.+\n)*/m);
    let archetype = null;
    if (personaMatch) {
      const archetypeMatch = personaMatch[0].match(/archetype:\s*(.+)/);
      if (archetypeMatch) archetype = archetypeMatch[1].trim();
    }

    if (idMatch || nameMatch) {
      return {
        agent: {
          name: nameMatch ? nameMatch[1].trim() : null,
          id: idMatch ? idMatch[1].trim() : null,
          title: titleMatch ? titleMatch[1].trim() : null,
          icon: iconMatch ? iconMatch[1].trim() : null,
          whenToUse: whenToUseMatch ? whenToUseMatch[1].trim() : null,
        },
        persona_profile: archetype ? { archetype } : null,
      };
    }
  } catch (_e) {
    // Fallback failed
  }

  return null;
}

/**
 * Manifest Generator class
 */
class ManifestGenerator {
  constructor(options = {}) {
    this.basePath = options.basePath || process.cwd();
    this.aioxCoreDir = path.join(this.basePath, '.aiox-core');
    this.manifestDir = path.join(this.aioxCoreDir, 'manifests');
    this.version = '2.1.0';
  }

  /**
   * Generate all manifests
   * @returns {Promise<object>} Generation results
   */
  async generateAll() {
    const startTime = Date.now();
    const results = {
      agents: null,
      workers: null,
      tasks: null,
      errors: [],
      duration: 0,
    };

    try {
      // Ensure manifest directory exists
      await fs.mkdir(this.manifestDir, { recursive: true });

      // Generate all manifests in parallel
      const [agents, workers, tasks] = await Promise.all([
        this.generateAgentsManifest(),
        this.generateWorkersManifest(),
        this.generateTasksManifest(),
      ]);

      results.agents = agents;
      results.workers = workers;
      results.tasks = tasks;

    } catch (error) {
      results.errors.push(error.message);
    }

    results.duration = Date.now() - startTime;
    return results;
  }

  /**
   * Generate agents.csv manifest
   * @returns {Promise<object>} Generation result
   */
  async generateAgentsManifest() {
    const agentsDir = path.join(this.aioxCoreDir, 'development', 'agents');
    const outputPath = path.join(this.manifestDir, 'agents.csv');

    const agents = [];
    const errors = [];

    try {
      const files = await fs.readdir(agentsDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));

      for (const file of mdFiles) {
        try {
          const filePath = path.join(agentsDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          const parsed = parseYAMLFromMarkdown(content);

          if (parsed && parsed.agent) {
            const agent = parsed.agent;
            const persona = parsed.persona_profile || parsed.persona || {};

            agents.push({
              id: agent.id || file.replace('.md', ''),
              name: agent.name || 'Unknown',
              archetype: persona.archetype || agent.title || 'Agent',
              icon: agent.icon || '🤖',
              version: this.version,
              status: 'active',
              file_path: `.aiox-core/development/agents/${file}`,
              when_to_use: agent.whenToUse || '',
            });
          }
        } catch (e) {
          errors.push(`Error parsing ${file}: ${e.message}`);
        }
      }

      // Generate CSV content
      const header = 'id,name,archetype,icon,version,status,file_path,when_to_use';
      const rows = agents.map(a =>
        [a.id, a.name, a.archetype, a.icon, a.version, a.status, a.file_path, a.when_to_use]
          .map(escapeCSV)
          .join(','),
      );

      const csvContent = [header, ...rows].join('\n');
      await fs.writeFile(outputPath, csvContent, 'utf8');

      return {
        success: true,
        count: agents.length,
        path: outputPath,
        errors,
      };

    } catch (error) {
      return {
        success: false,
        count: 0,
        path: outputPath,
        errors: [error.message],
      };
    }
  }

  /**
   * Generate workers.csv manifest from service registry
   * @returns {Promise<object>} Generation result
   */
  async generateWorkersManifest() {
    const registryPath = path.join(this.aioxCoreDir, 'core', 'registry', 'service-registry.json');
    const outputPath = path.join(this.manifestDir, 'workers.csv');

    try {
      const registryContent = await fs.readFile(registryPath, 'utf8');
      const registry = JSON.parse(registryContent);

      const workers = registry.workers.map(w => ({
        id: w.id,
        name: w.name,
        category: w.category,
        subcategory: w.subcategory || '',
        executor_types: (w.executorTypes || []).join(';'),
        tags: (w.tags || []).join(';'),
        file_path: w.path,
        status: 'active',
      }));

      // Generate CSV content
      const header = 'id,name,category,subcategory,executor_types,tags,file_path,status';
      const rows = workers.map(w =>
        [w.id, w.name, w.category, w.subcategory, w.executor_types, w.tags, w.file_path, w.status]
          .map(escapeCSV)
          .join(','),
      );

      const csvContent = [header, ...rows].join('\n');
      await fs.writeFile(outputPath, csvContent, 'utf8');

      return {
        success: true,
        count: workers.length,
        path: outputPath,
        errors: [],
      };

    } catch (error) {
      return {
        success: false,
        count: 0,
        path: outputPath,
        errors: [error.message],
      };
    }
  }

  /**
   * Generate tasks.csv manifest
   * @returns {Promise<object>} Generation result
   */
  async generateTasksManifest() {
    const tasksDir = path.join(this.aioxCoreDir, 'development', 'tasks');
    const outputPath = path.join(this.manifestDir, 'tasks.csv');

    const tasks = [];
    const errors = [];

    try {
      const files = await fs.readdir(tasksDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));

      for (const file of mdFiles) {
        try {
          const filePath = path.join(tasksDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          const parsed = parseYAMLFromMarkdown(content);

          const taskId = file.replace('.md', '');
          let taskName = taskId.split('-').map(w =>
            w.charAt(0).toUpperCase() + w.slice(1),
          ).join(' ');

          let category = 'general';
          let format = 'TASK-FORMAT-V1';
          let hasElicitation = false;

          if (parsed) {
            if (parsed.task) {
              taskName = parsed.task.name || taskName;
              category = parsed.task.category || category;
              format = parsed.task.format || format;
              hasElicitation = parsed.task.elicit === true || parsed.elicit === true;
            }
            if (parsed.name) taskName = parsed.name;
            if (parsed.category) category = parsed.category;
            if (parsed.format) format = parsed.format;
            if (parsed.elicit !== undefined) hasElicitation = parsed.elicit;
          }

          // Detect category from filename prefix
          if (taskId.startsWith('db-')) category = 'database';
          else if (taskId.startsWith('qa-')) category = 'quality';
          else if (taskId.startsWith('dev-')) category = 'development';
          else if (taskId.startsWith('po-')) category = 'product';
          else if (taskId.startsWith('github-')) category = 'devops';

          // Detect elicitation from content
          if (content.includes('elicit: true') || content.includes('elicit=true')) {
            hasElicitation = true;
          }

          tasks.push({
            id: taskId,
            name: taskName,
            category,
            format,
            has_elicitation: hasElicitation,
            file_path: `.aiox-core/development/tasks/${file}`,
            status: 'active',
          });

        } catch (e) {
          errors.push(`Error parsing ${file}: ${e.message}`);
        }
      }

      // Generate CSV content
      const header = 'id,name,category,format,has_elicitation,file_path,status';
      const rows = tasks.map(t =>
        [t.id, t.name, t.category, t.format, t.has_elicitation, t.file_path, t.status]
          .map(escapeCSV)
          .join(','),
      );

      const csvContent = [header, ...rows].join('\n');
      await fs.writeFile(outputPath, csvContent, 'utf8');

      return {
        success: true,
        count: tasks.length,
        path: outputPath,
        errors,
      };

    } catch (error) {
      return {
        success: false,
        count: 0,
        path: outputPath,
        errors: [error.message],
      };
    }
  }
}

// Factory function
function createManifestGenerator(options = {}) {
  return new ManifestGenerator(options);
}

module.exports = {
  ManifestGenerator,
  createManifestGenerator,
  escapeCSV,
  parseYAMLFromMarkdown,
  extractAgentSection,
};
