/**
 * Epic3Executor - Spec Pipeline Executor
 *
 * Story: 0.3 - Epic Executors (AC2)
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Wraps the spec-pipeline.yaml workflow to generate specifications
 * from requirements/PRD through phases: gather → assess → research → spec → critique
 *
 * @module core/orchestration/executors/epic-3-executor
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const EpicExecutor = require('./epic-executor');

/**
 * Spec Pipeline phases
 */
const SPEC_PHASES = [
  'gather-requirements',
  'assess-complexity',
  'research-dependencies',
  'write-spec',
  'critique',
];

/**
 * Epic 3 Executor - Spec Pipeline
 * Generates specifications from requirements/stories
 */
class Epic3Executor extends EpicExecutor {
  constructor(orchestrator) {
    super(orchestrator, 3);
    this.pipelinePath = this._getPath(
      '.aiox-core',
      'development',
      'workflows',
      'spec-pipeline.yaml',
    );
  }

  /**
   * Execute the Spec Pipeline
   * @param {Object} context - Execution context
   * @param {string} context.storyId - Story identifier
   * @param {string} context.source - Source type (story, prd, prompt)
   * @param {string} [context.prdPath] - Path to PRD if source is 'prd'
   * @returns {Promise<Object>} Execution result with specPath
   */
  async execute(context) {
    this._startExecution();

    try {
      const { storyId, source, prdPath, techStack } = context;

      this._log(`Executing Spec Pipeline for ${storyId}`);
      this._log(`Source: ${source}, Tech Stack: ${techStack ? 'detected' : 'none'}`);

      // Validate inputs
      if (!storyId) {
        return this._failExecution('storyId is required');
      }

      // Check for existing spec
      const existingSpec = await this._findExistingSpec(storyId);
      if (existingSpec) {
        this._log(`Found existing spec: ${existingSpec}`);
        this._addArtifact('spec', existingSpec, { reused: true });
        return this._completeExecution({
          specPath: existingSpec,
          reused: true,
        });
      }

      // Execute spec pipeline phases
      const phaseResults = {};
      let specPath = null;

      for (const phase of SPEC_PHASES) {
        this._log(`Running phase: ${phase}`);

        const phaseResult = await this._executePhase(phase, {
          storyId,
          source,
          prdPath,
          techStack,
          previousPhases: phaseResults,
        });

        phaseResults[phase] = phaseResult;

        if (!phaseResult.success) {
          this._log(`Phase ${phase} failed`, 'warn');
          // Continue to next phase unless critical
          if (phase === 'write-spec') {
            return this._failExecution(`Critical phase failed: ${phase}`);
          }
        }

        // Extract spec path from write-spec phase
        if (phase === 'write-spec' && phaseResult.specPath) {
          specPath = phaseResult.specPath;
        }
      }

      // Validate spec was created
      if (!specPath) {
        // Generate default spec path
        specPath = this._getPath('docs', 'stories', storyId, 'spec.md');
      }

      // Check if spec file exists
      if (!(await fs.pathExists(specPath))) {
        // Create stub spec for pipeline to continue
        await this._createStubSpec(specPath, storyId, context);
        this._log('Created stub spec (real spec generation requires agent invocation)');
      }

      this._addArtifact('spec', specPath);

      // Collect complexity and requirements from phases
      const complexity = phaseResults['assess-complexity']?.complexity || 'STANDARD';
      const requirements = phaseResults['gather-requirements']?.requirements || [];

      return this._completeExecution({
        specPath,
        complexity,
        requirements,
        phases: Object.keys(phaseResults),
      });
    } catch (error) {
      return this._failExecution(error);
    }
  }

  /**
   * Find existing spec for story
   * @private
   */
  async _findExistingSpec(storyId) {
    const possiblePaths = [
      this._getPath('docs', 'stories', storyId, 'spec.md'),
      this._getPath('docs', 'stories', storyId, 'SPEC.md'),
      this._getPath('docs', 'specs', `${storyId}.md`),
      this._getPath('.aiox', 'specs', `${storyId}.md`),
    ];

    for (const specPath of possiblePaths) {
      if (await fs.pathExists(specPath)) {
        return specPath;
      }
    }

    return null;
  }

  /**
   * Execute a single pipeline phase
   * @private
   */
  async _executePhase(phase, _context) {
    const taskPath = this._getPath('.aiox-core', 'development', 'tasks', `spec-${phase}.md`);

    // Check if task file exists
    if (!(await fs.pathExists(taskPath))) {
      this._log(`Task file not found: ${taskPath}`, 'warn');
      return { success: true, skipped: true, reason: 'task_not_found' };
    }

    // In a full implementation, this would invoke the agent
    // For now, return success to allow pipeline to continue
    return {
      success: true,
      phase,
      timestamp: new Date().toISOString(),
      // Stub values - real implementation invokes agents
      complexity: phase === 'assess-complexity' ? 'STANDARD' : undefined,
      requirements: phase === 'gather-requirements' ? [] : undefined,
    };
  }

  /**
   * Create stub spec file
   * @private
   */
  async _createStubSpec(specPath, storyId, context) {
    const stubContent = `# Specification: ${storyId}

> **Status:** Draft (Auto-generated stub)
> **Generated:** ${new Date().toISOString()}
> **Tech Stack:** ${context.techStack ? JSON.stringify(context.techStack, null, 2) : 'Not detected'}

## Overview

This is an auto-generated specification stub. The full specification will be generated
when the Spec Pipeline agents are invoked.

## Requirements

*To be gathered from ${context.source || 'story'}*

## Complexity Assessment

*To be assessed*

## Implementation Notes

*To be researched*

---
*Generated by Epic 3 Executor - Spec Pipeline*
`;

    await fs.ensureDir(path.dirname(specPath));
    await fs.writeFile(specPath, stubContent);
  }
}

module.exports = Epic3Executor;
