/**
 * MMOS Squad Adapters
 *
 * Central export point for all MMOS infrastructure service adapters.
 * These adapters provide a unified interface to infrastructure services
 * while maintaining loose coupling.
 *
 * @module mmos-squad/adapters
 * @version 1.0.0
 * @story STORY-10.3
 *
 * @example
 * ```javascript
 * const { createSourceAdapter, createProjectAdapter, createStorageAdapter } = require('./adapters');
 *
 * // Create adapters
 * const sources = createSourceAdapter({ silent: false });
 * const project = createProjectAdapter({ listId: 'my-list-id' });
 * const storage = createStorageAdapter({ rootFolderId: 'folder-id' });
 *
 * // Use adapters
 * const transcript = await sources.extractYouTube('dQw4w9WgXcQ');
 * const task = await project.createTask({ name: 'Process content' });
 * const files = await storage.listFiles();
 * ```
 */

// Import adapters
const { SourceAdapter, createSourceAdapter } = require('./source-adapter');
const { ProjectAdapter, createProjectAdapter } = require('./project-adapter');
const { StorageAdapter, createStorageAdapter } = require('./storage-adapter');
const { MCPAdapter, createMCPAdapter } = require('./mcp-adapter');

/**
 * Create all MMOS adapters with shared configuration
 *
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.silent=false] - Suppress logs for all adapters
 * @param {string} [options.traceId] - Shared trace ID for correlation
 * @param {Object} [options.source] - Source adapter specific options
 * @param {Object} [options.project] - Project adapter specific options
 * @param {Object} [options.storage] - Storage adapter specific options
 * @returns {Object} Object containing all adapter instances
 *
 * @example
 * ```javascript
 * const adapters = createAdapters({
 *   silent: false,
 *   traceId: 'mmos-session-123',
 *   project: { listId: 'clickup-list-id' },
 *   storage: { rootFolderId: 'drive-folder-id' },
 * });
 *
 * // All adapters ready to use
 * const { source, project, storage } = adapters;
 * ```
 */
function createAdapters(options = {}) {
  const sharedOptions = {
    silent: options.silent ?? false,
    traceId: options.traceId ?? `mmos-${Date.now()}`,
  };

  return {
    source: createSourceAdapter({ ...sharedOptions, ...options.source }),
    project: createProjectAdapter({ ...sharedOptions, ...options.project }),
    storage: createStorageAdapter({ ...sharedOptions, ...options.storage }),
    mcp: createMCPAdapter({ ...sharedOptions, ...options.mcp }),
  };
}

/**
 * MMOS Adapter Set - Convenience class for managing all adapters
 */
class MMOSAdapters {
  /**
   * @param {Object} [options] - Configuration options
   */
  constructor(options = {}) {
    const adapters = createAdapters(options);
    this.source = adapters.source;
    this.project = adapters.project;
    this.storage = adapters.storage;
    this.mcp = adapters.mcp;
    this.options = options;
  }

  /**
   * Execute a complete mind mapping pipeline
   *
   * @param {Object} config - Pipeline configuration
   * @param {string} config.projectName - Project name
   * @param {Array<Object>} config.sources - Source definitions
   * @param {Object} [config.options] - Pipeline options
   * @returns {Promise<Object>} Pipeline results
   */
  async executePipeline(config) {
    const results = {
      projectName: config.projectName,
      startedAt: new Date().toISOString(),
      steps: [],
    };

    try {
      // Step 1: Create project structure in storage
      results.steps.push({ step: 'create_structure', status: 'in_progress' });
      const folders = await this.storage.createMMOSProjectStructure(config.projectName);
      results.folders = folders;
      results.steps[results.steps.length - 1].status = 'completed';

      // Step 2: Create project task
      results.steps.push({ step: 'create_task', status: 'in_progress' });
      const task = await this.project.createMindProject({
        subjectName: config.projectName,
        description: config.description ?? `Mind mapping project: ${config.projectName}`,
        sources: config.sources,
      });
      results.task = task;
      results.steps[results.steps.length - 1].status = 'completed';

      // Step 3: Extract content from sources
      results.steps.push({ step: 'extract_sources', status: 'in_progress' });
      const extractedContent = await this.source.batchExtract(config.sources, {
        concurrency: config.options?.concurrency ?? 3,
        continueOnError: true,
      });
      results.extracted = extractedContent;
      results.steps[results.steps.length - 1].status = 'completed';

      // Step 4: Update project progress
      await this.project.updateMindProjectProgress(task.id, {
        sourcesProcessed: extractedContent.filter((r) => r.success).length,
        totalSources: config.sources.length,
        currentPhase: 'extraction_complete',
      });

      results.completedAt = new Date().toISOString();
      results.status = 'success';
    } catch (error) {
      results.error = error.message;
      results.status = 'failed';
      results.completedAt = new Date().toISOString();
    }

    return results;
  }
}

module.exports = {
  // Classes
  SourceAdapter,
  ProjectAdapter,
  StorageAdapter,
  MCPAdapter,
  MMOSAdapters,

  // Factory functions
  createSourceAdapter,
  createProjectAdapter,
  createStorageAdapter,
  createMCPAdapter,
  createAdapters,
};
