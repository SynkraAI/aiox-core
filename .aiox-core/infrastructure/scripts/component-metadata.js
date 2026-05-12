/**
 * Component Metadata Manager for Synkra AIOX
 * Manages detailed metadata for all framework components
 * @module component-metadata
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// Optional memory adapter - gracefully handle if not available
let MemoryAdapter = null;
try {
  ({ MemoryAdapter } = require('../../memory'));
} catch (e) {
  // Memory module not available - will use null adapter
}

class ComponentMetadata {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.metadataPath = path.join(this.rootPath, 'aiox-core', 'metadata');

    // Initialize memory adapter if available
    this.memoryClient = MemoryAdapter ? new MemoryAdapter({
      persistencePath: path.join(this.rootPath, 'aiox-memory-layer-mvp', 'data'),
      namespace: 'component-metadata',
    }) : null;
    
    // Component metadata schema version
    this.schemaVersion = '1.0';
  }

  /**
   * Get metadata schema for a component type
   * @param {string} componentType - Type of component (agent/task/workflow)
   * @returns {Object} Metadata schema
   */
  getMetadataSchema(componentType) {
    const baseSchema = {
      id: null,
      type: componentType,
      name: null,
      version: '1.0',
      created: {
        timestamp: null,
        creator: null,
        context: null,
      },
      modified: {
        timestamp: null,
        modifier: null,
        changes: [],
      },
      description: null,
      tags: [],
      status: 'active', // active, deprecated, experimental
      visibility: 'private', // private, team, public
      relationships: {
        dependencies: [],
        dependents: [],
        related: [],
      },
      usage: {
        count: 0,
        lastUsed: null,
        frequency: 'never', // never, rarely, occasionally, frequently, always
        contexts: [],
      },
      metrics: {
        complexity: 0, // 0-10 scale
        maintainability: 0, // 0-10 scale
        reliability: 0, // 0-10 scale
        performance: null,
      },
      security: {
        level: 'standard', // standard, elevated, restricted
        permissions: [],
        auditLog: [],
      },
      customFields: {},
    };
    
    // Add type-specific fields
    switch (componentType) {
      case 'agent':
        return {
          ...baseSchema,
          agentSpecific: {
            commands: [],
            persona: {},
            capabilities: [],
            integrations: [],
          },
        };
        
      case 'task':
        return {
          ...baseSchema,
          taskSpecific: {
            agent: null,
            command: null,
            workflow: null,
            inputSchema: {},
            outputSchema: {},
            errorCodes: [],
          },
        };
        
      case 'workflow':
        return {
          ...baseSchema,
          workflowSpecific: {
            steps: [],
            triggers: [],
            variables: {},
            outcomes: [],
            branchingLogic: {},
          },
        };
        
      default:
        return baseSchema;
    }
  }

  /**
   * Create metadata for a new component
   * @param {string} componentType - Type of component
   * @param {Object} componentData - Component configuration data
   * @param {Object} context - Creation context
   * @returns {Promise<Object>} Created metadata
   */
  async createMetadata(componentType, componentData, context = {}) {
    try {
      const schema = this.getMetadataSchema(componentType);
      
      // Populate metadata
      const metadata = {
        ...schema,
        id: componentData.id || componentData.name || componentData.agentName || componentData.taskId || componentData.workflowId,
        name: componentData.name || componentData.title || componentData.agentTitle || componentData.taskTitle || componentData.workflowName,
        created: {
          timestamp: new Date().toISOString(),
          creator: context.creator || process.env.USER || 'system',
          context: context.description || 'Component created',
        },
        modified: {
          timestamp: new Date().toISOString(),
          modifier: context.creator || process.env.USER || 'system',
          changes: [{
            timestamp: new Date().toISOString(),
            type: 'created',
            description: 'Initial creation',
          }],
        },
        description: componentData.description || componentData.whenToUse || componentData.taskDescription || componentData.workflowDescription || '',
        tags: context.tags || [],
        status: context.status || 'active',
        visibility: context.visibility || 'private',
      };
      
      // Add type-specific data
      this.addTypeSpecificData(componentType, metadata, componentData);
      
      // Save to memory layer
      await this.memoryClient.addMemory({
        type: 'component_metadata',
        component: componentType,
        metadata: metadata,
      });
      
      // Save to file system
      await this.saveMetadataToFile(componentType, metadata.id, metadata);
      
      return metadata;
      
    } catch (error) {
      console.error(chalk.red(`Failed to create metadata: ${error.message}`));
      throw error;
    }
  }

  /**
   * Add type-specific data to metadata
   * @private
   */
  addTypeSpecificData(componentType, metadata, componentData) {
    switch (componentType) {
      case 'agent':
        if (metadata.agentSpecific) {
          metadata.agentSpecific.commands = componentData.commands || [];
          metadata.agentSpecific.persona = componentData.persona || {};
          metadata.agentSpecific.capabilities = this.extractCapabilities(componentData);
          metadata.agentSpecific.integrations = componentData.dependencies || [];
        }
        break;
        
      case 'task':
        if (metadata.taskSpecific) {
          metadata.taskSpecific.agent = componentData.agentName;
          metadata.taskSpecific.command = componentData.command;
          metadata.taskSpecific.workflow = componentData.workflow;
          metadata.taskSpecific.inputSchema = componentData.inputSchema || {};
          metadata.taskSpecific.outputSchema = componentData.outputSchema || {};
          metadata.taskSpecific.errorCodes = componentData.errorCodes || [];
        }
        break;
        
      case 'workflow':
        if (metadata.workflowSpecific) {
          metadata.workflowSpecific.steps = componentData.steps || [];
          metadata.workflowSpecific.triggers = componentData.triggers || [];
          metadata.workflowSpecific.variables = componentData.variables || {};
          metadata.workflowSpecific.outcomes = componentData.outcomes || [];
          metadata.workflowSpecific.branchingLogic = componentData.branchingLogic || {};
        }
        break;
    }
  }

  /**
   * Update metadata for an existing component
   * @param {string} componentType - Type of component
   * @param {string} componentId - Component ID
   * @param {Object} updates - Updates to apply
   * @param {Object} context - Update context
   * @returns {Promise<Object>} Updated metadata
   */
  async updateMetadata(componentType, componentId, updates, context = {}) {
    try {
      // Load existing metadata
      const metadata = await this.getMetadata(componentType, componentId);
      if (!metadata) {
        throw new Error(`Metadata not found for ${componentType}: ${componentId}`);
      }
      
      // Apply updates
      Object.assign(metadata, updates);
      
      // Update modified fields
      metadata.modified = {
        timestamp: new Date().toISOString(),
        modifier: context.modifier || process.env.USER || 'system',
        changes: [
          ...metadata.modified.changes,
          {
            timestamp: new Date().toISOString(),
            type: context.changeType || 'updated',
            description: context.changeDescription || 'Component updated',
            fields: Object.keys(updates),
          },
        ],
      };
      
      // Update version if significant change
      if (context.incrementVersion) {
        metadata.version = this.incrementVersion(metadata.version);
      }
      
      // Save to memory layer
      await this.memoryClient.updateMemory({
        type: 'component_metadata',
        component: componentType,
        id: componentId,
        metadata: metadata,
      });
      
      // Save to file system
      await this.saveMetadataToFile(componentType, componentId, metadata);
      
      return metadata;
      
    } catch (error) {
      console.error(chalk.red(`Failed to update metadata: ${error.message}`));
      throw error;
    }
  }

  /**
   * Get metadata for a component
   * @param {string} componentType - Type of component
   * @param {string} componentId - Component ID
   * @returns {Promise<Object|null>} Component metadata
   */
  async getMetadata(componentType, componentId) {
    try {
      // Try memory layer first
      const memories = await this.memoryClient.searchMemories({
        filters: {
          type: 'component_metadata',
          component: componentType,
          'metadata.id': componentId,
        },
      });
      
      if (memories && memories.length > 0) {
        return memories[0].metadata;
      }
      
      // Fallback to file system
      const filePath = this.getMetadataFilePath(componentType, componentId);
      if (await fs.pathExists(filePath)) {
        return await fs.readJson(filePath);
      }
      
      return null;
      
    } catch (error) {
      console.error(chalk.red(`Failed to get metadata: ${error.message}`));
      return null;
    }
  }

  /**
   * Track component relationship
   * @param {Object} source - Source component {type, id}
   * @param {Object} target - Target component {type, id}
   * @param {string} relationshipType - Type of relationship (depends-on, used-by, related-to)
   * @returns {Promise<void>}
   */
  async trackRelationship(source, target, relationshipType) {
    try {
      // Update source component
      const sourceMetadata = await this.getMetadata(source.type, source.id);
      if (sourceMetadata) {
        if (!sourceMetadata.relationships) {
          sourceMetadata.relationships = { dependencies: [], dependents: [], related: [] };
        }
        
        const relationship = {
          type: target.type,
          id: target.id,
          relationshipType,
          timestamp: new Date().toISOString(),
        };
        
        switch (relationshipType) {
          case 'depends-on':
            sourceMetadata.relationships.dependencies.push(relationship);
            break;
          case 'used-by':
            sourceMetadata.relationships.dependents.push(relationship);
            break;
          case 'related-to':
            sourceMetadata.relationships.related.push(relationship);
            break;
        }
        
        await this.updateMetadata(source.type, source.id, {
          relationships: sourceMetadata.relationships,
        });
      }
      
      // Update target component (reverse relationship)
      const targetMetadata = await this.getMetadata(target.type, target.id);
      if (targetMetadata) {
        if (!targetMetadata.relationships) {
          targetMetadata.relationships = { dependencies: [], dependents: [], related: [] };
        }
        
        const reverseRelationship = {
          type: source.type,
          id: source.id,
          relationshipType: this.getReverseRelationship(relationshipType),
          timestamp: new Date().toISOString(),
        };
        
        switch (reverseRelationship.relationshipType) {
          case 'depends-on':
            targetMetadata.relationships.dependencies.push(reverseRelationship);
            break;
          case 'used-by':
            targetMetadata.relationships.dependents.push(reverseRelationship);
            break;
          case 'related-to':
            targetMetadata.relationships.related.push(reverseRelationship);
            break;
        }
        
        await this.updateMetadata(target.type, target.id, {
          relationships: targetMetadata.relationships,
        });
      }
      
    } catch (error) {
      console.error(chalk.red(`Failed to track relationship: ${error.message}`));
      throw error;
    }
  }

  /**
   * Search components by criteria
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Array>} Matching components
   */
  async searchComponents(criteria = {}) {
    try {
      const filters = {};
      
      // Build filters
      if (criteria.type) {
        filters.component = criteria.type;
      }
      
      if (criteria.tags && criteria.tags.length > 0) {
        filters['metadata.tags'] = { $in: criteria.tags };
      }
      
      if (criteria.status) {
        filters['metadata.status'] = criteria.status;
      }
      
      if (criteria.creator) {
        filters['metadata.created.creator'] = criteria.creator;
      }
      
      if (criteria.text) {
        filters.$text = { $search: criteria.text };
      }
      
      // Search in memory layer
      const memories = await this.memoryClient.searchMemories({
        filters: {
          type: 'component_metadata',
          ...filters,
        },
        limit: criteria.limit || 100,
      });
      
      return memories.map(m => m.metadata);
      
    } catch (error) {
      console.error(chalk.red(`Search failed: ${error.message}`));
      return [];
    }
  }

  /**
   * Collect usage analytics for a component
   * @param {string} componentType - Type of component
   * @param {string} componentId - Component ID
   * @param {Object} usageData - Usage information
   * @returns {Promise<void>}
   */
  async collectUsageAnalytics(componentType, componentId, usageData) {
    try {
      const metadata = await this.getMetadata(componentType, componentId);
      if (!metadata) {
        return;
      }
      
      // Update usage stats
      if (!metadata.usage) {
        metadata.usage = {
          count: 0,
          lastUsed: null,
          frequency: 'never',
          contexts: [],
        };
      }
      
      metadata.usage.count++;
      metadata.usage.lastUsed = new Date().toISOString();
      
      // Add context if provided
      if (usageData.context) {
        metadata.usage.contexts.push({
          timestamp: new Date().toISOString(),
          context: usageData.context,
          user: usageData.user || process.env.USER,
          duration: usageData.duration,
          success: usageData.success !== false,
        });
        
        // Keep only last 100 contexts
        if (metadata.usage.contexts.length > 100) {
          metadata.usage.contexts = metadata.usage.contexts.slice(-100);
        }
      }
      
      // Update frequency based on usage patterns
      metadata.usage.frequency = this.calculateFrequency(metadata.usage);
      
      // Save updated metadata
      await this.updateMetadata(componentType, componentId, {
        usage: metadata.usage,
      }, {
        changeType: 'usage',
        changeDescription: 'Usage analytics updated',
      });
      
      // Also log to memory layer for analytics
      await this.memoryClient.addMemory({
        type: 'component_usage',
        component: componentType,
        id: componentId,
        timestamp: new Date().toISOString(),
        ...usageData,
      });
      
    } catch (error) {
      console.error(chalk.red(`Failed to collect usage analytics: ${error.message}`));
    }
  }

  /**
   * Get component versioning history
   * @param {string} componentType - Type of component
   * @param {string} componentId - Component ID
   * @returns {Promise<Array>} Version history
   */
  async getVersionHistory(componentType, componentId) {
    try {
      const metadata = await this.getMetadata(componentType, componentId);
      if (!metadata) {
        return [];
      }
      
      // Extract version history from changes
      const versionHistory = metadata.modified.changes
        .filter(change => change.type === 'version')
        .map(change => ({
          version: change.version,
          timestamp: change.timestamp,
          modifier: change.modifier || metadata.modified.modifier,
          description: change.description,
          changes: change.fields || [],
        }));
      
      return versionHistory;
      
    } catch (error) {
      console.error(chalk.red(`Failed to get version history: ${error.message}`));
      return [];
    }
  }

  /**
   * Extract capabilities from component data
   * @private
   */
  extractCapabilities(componentData) {
    const capabilities = [];
    
    if (componentData.commands) {
      capabilities.push(...componentData.commands.map(cmd => `command:${cmd}`));
    }
    
    if (componentData.integrations) {
      capabilities.push(...componentData.integrations.map(int => `integration:${int}`));
    }
    
    if (componentData.features) {
      capabilities.push(...componentData.features);
    }
    
    return capabilities;
  }

  /**
   * Get reverse relationship type
   * @private
   */
  getReverseRelationship(relationshipType) {
    const reverseMap = {
      'depends-on': 'used-by',
      'used-by': 'depends-on',
      'related-to': 'related-to',
    };
    
    return reverseMap[relationshipType] || relationshipType;
  }

  /**
   * Calculate usage frequency
   * @private
   */
  calculateFrequency(usage) {
    if (!usage.contexts || usage.contexts.length === 0) {
      return 'never';
    }
    
    // Get usage in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsage = usage.contexts.filter(ctx => 
      new Date(ctx.timestamp) > thirtyDaysAgo,
    ).length;
    
    if (recentUsage === 0) return 'rarely';
    if (recentUsage < 5) return 'occasionally';
    if (recentUsage < 20) return 'frequently';
    return 'always';
  }

  /**
   * Increment version number
   * @private
   */
  incrementVersion(version) {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || 0) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  /**
   * Get metadata file path
   * @private
   */
  getMetadataFilePath(componentType, componentId) {
    return path.join(this.metadataPath, componentType, `${componentId}.metadata.json`);
  }

  /**
   * Save metadata to file
   * @private
   */
  async saveMetadataToFile(componentType, componentId, metadata) {
    const filePath = this.getMetadataFilePath(componentType, componentId);
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeJson(filePath, metadata, { spaces: 2 });
  }
}

module.exports = ComponentMetadata;