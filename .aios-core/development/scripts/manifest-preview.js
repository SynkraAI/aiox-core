/**
 * Manifest Preview Utility
 * Shows diff view for manifest updates
 * @module manifest-preview
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const ComponentPreview = require('./component-preview');
const chalk = require('chalk');

class ManifestPreview {
  constructor(rootPath) {
    this.rootPath = rootPath || process.cwd();
    this.manifestPath = path.join(this.rootPath, 'aios-core', 'team-manifest.yaml');
    this.componentPreview = new ComponentPreview();
  }

  /**
   * Preview manifest update for a new component
   * @param {string} componentType - Type of component
   * @param {Object} componentInfo - Component information
   * @returns {Promise<Object>} Preview result with diff
   */
  async previewManifestUpdate(componentType, componentInfo) {
    try {
      // Read current manifest
      const currentContent = await fs.readFile(this.manifestPath, 'utf8');
      const manifest = yaml.load(currentContent);
      
      // Create updated manifest
      const updatedManifest = this.addComponentToManifest(manifest, componentType, componentInfo);
      const updatedContent = yaml.dump(updatedManifest, {
        styles: {
          '!!null': 'canonical'
        },
        sortKeys: false
      });
      
      // Generate diff preview
      const diff = this.componentPreview.generateManifestDiff(currentContent, updatedContent);
      
      return {
        success: true,
        diff,
        currentContent,
        updatedContent,
        changes: this.summarizeChanges(manifest, updatedManifest)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Add component to manifest structure
   * @private
   */
  addComponentToManifest(manifest, componentType, componentInfo) {
    const updated = JSON.parse(JSON.stringify(manifest)); // Deep clone
    
    switch (componentType) {
      case 'agent':
        if (!updated.team) updated.team = {};
        if (!updated.team.agents) updated.team.agents = [];
        
        // Check if agent already exists
        const existingAgentIndex = updated.team.agents.findIndex(
          a => a.id === componentInfo.id
        );
        
        if (existingAgentIndex >= 0) {
          // Update existing
          updated.team.agents[existingAgentIndex] = {
            id: componentInfo.id,
            path: `agents/${componentInfo.id}.md`,
            name: componentInfo.name || componentInfo.id,
            ...(componentInfo.description && { description: componentInfo.description })
          };
        } else {
          // Add new
          updated.team.agents.push({
            id: componentInfo.id,
            path: `agents/${componentInfo.id}.md`,
            name: componentInfo.name || componentInfo.id,
            ...(componentInfo.description && { description: componentInfo.description })
          });
        }
        break;
        
      case 'workflow':
        if (!updated.workflows) updated.workflows = [];
        
        const existingWorkflowIndex = updated.workflows.findIndex(
          w => w.id === componentInfo.id
        );
        
        if (existingWorkflowIndex >= 0) {
          updated.workflows[existingWorkflowIndex] = {
            id: componentInfo.id,
            path: `workflows/${componentInfo.id}.yaml`,
            name: componentInfo.name || componentInfo.id,
            type: componentInfo.type || 'standard',
            ...(componentInfo.description && { description: componentInfo.description })
          };
        } else {
          updated.workflows.push({
            id: componentInfo.id,
            path: `workflows/${componentInfo.id}.yaml`,
            name: componentInfo.name || componentInfo.id,
            type: componentInfo.type || 'standard',
            ...(componentInfo.description && { description: componentInfo.description })
          });
        }
        break;
    }
    
    // Update metadata
    if (!updated.metadata) updated.metadata = {};
    updated.metadata.lastUpdated = new Date().toISOString();
    updated.metadata.version = this.incrementVersion(updated.metadata.version || '1.0.0');
    
    return updated;
  }

  /**
   * Increment semantic version
   * @private
   */
  incrementVersion(version) {
    const parts = version.split('.');
    parts[2] = String(parseInt(parts[2] || '0') + 1);
    return parts.join('.');
  }

  /**
   * Summarize changes made to manifest
   * @private
   */
  summarizeChanges(oldManifest, newManifest) {
    const changes = [];
    
    // Check agents
    const oldAgents = oldManifest.team?.agents || [];
    const newAgents = newManifest.team?.agents || [];
    
    if (newAgents.length > oldAgents.length) {
      const added = newAgents.slice(oldAgents.length);
      added.forEach(agent => {
        changes.push({
          type: 'added',
          category: 'agent',
          item: agent.id
        });
      });
    }
    
    // Check workflows
    const oldWorkflows = oldManifest.workflows || [];
    const newWorkflows = newManifest.workflows || [];
    
    if (newWorkflows.length > oldWorkflows.length) {
      const added = newWorkflows.slice(oldWorkflows.length);
      added.forEach(workflow => {
        changes.push({
          type: 'added',
          category: 'workflow',
          item: workflow.id
        });
      });
    }
    
    // Version change
    if (oldManifest.metadata?.version !== newManifest.metadata?.version) {
      changes.push({
        type: 'updated',
        category: 'version',
        from: oldManifest.metadata?.version || '1.0.0',
        to: newManifest.metadata?.version
      });
    }
    
    return changes;
  }

  /**
   * Apply manifest update after preview
   * @param {string} updatedContent - New manifest content
   */
  async applyManifestUpdate(updatedContent) {
    await fs.writeFile(this.manifestPath, updatedContent, 'utf8');
  }

  /**
   * Show interactive manifest update prompt
   * @param {string} componentType - Type of component
   * @param {Object} componentInfo - Component information
   * @returns {Promise<boolean>} Whether update was applied
   */
  async interactiveManifestUpdate(componentType, componentInfo) {
    const preview = await this.previewManifestUpdate(componentType, componentInfo);
    
    if (!preview.success) {
      console.log(chalk.red(`\n❌ Failed to preview manifest update: ${preview.error}`));
      return false;
    }
    
    // Show diff
    console.log(preview.diff);
    
    // Show change summary
    console.log(chalk.cyan('\n📋 Summary of changes:'));
    preview.changes.forEach(change => {
      if (change.type === 'added') {
        console.log(chalk.green(`  + Added ${change.category}: ${change.item}`));
      } else if (change.type === 'updated') {
        console.log(chalk.yellow(`  ~ Updated ${change.category}: ${change.from} → ${change.to}`));
      }
    });
    
    // Confirm update
    const inquirer = require('inquirer');
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'Apply these changes to team-manifest.yaml?',
      default: true
    }]);
    
    if (confirm) {
      await this.applyManifestUpdate(preview.updatedContent);
      console.log(chalk.green('\n✅ Manifest updated successfully!'));
      return true;
    }
    
    console.log(chalk.yellow('\n⚠️  Manifest update cancelled'));
    return false;
  }
}

module.exports = ManifestPreview;