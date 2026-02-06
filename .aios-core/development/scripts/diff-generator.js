const diffLib = require('diff');
const chalk = require('chalk');
const yaml = require('js-yaml');

/**
 * Generates visual diffs for component modifications
 */
class DiffGenerator {
  constructor() {
    this.colors = {
      added: chalk.green,
      removed: chalk.red,
      unchanged: chalk.gray,
      header: chalk.cyan,
      lineNumber: chalk.yellow
    };
  }

  /**
   * Generate a unified diff between two text contents
   * @param {string} originalContent - Original file content
   * @param {string} modifiedContent - Modified file content
   * @param {string} fileName - Name of the file being diffed
   * @param {Object} options - Diff options
   * @returns {string} Formatted diff output
   */
  generateUnifiedDiff(originalContent, modifiedContent, fileName, options = {}) {
    const {
      contextLines = 3,
      showLineNumbers = true,
      colorize = true
    } = options;

    const patch = diffLib.createPatch(
      fileName,
      originalContent,
      modifiedContent,
      'Current Version',
      'Modified Version',
      { context: contextLines }
    );

    if (!colorize) {
      return patch;
    }

    return this.colorizeDiff(patch, showLineNumbers);
  }

  /**
   * Generate a diff specifically for YAML content
   * @param {string} originalYaml - Original YAML content
   * @param {string} modifiedYaml - Modified YAML content
   * @param {string} componentName - Name of the component
   * @returns {Object} Structured diff with sections
   */
  generateYamlDiff(originalYaml, modifiedYaml, componentName) {
    const original = yaml.load(originalYaml);
    const modified = yaml.load(modifiedYaml);

    const diff = {
      component: componentName,
      sections: {},
      summary: {
        added: [],
        removed: [],
        modified: []
      }
    };

    // Compare top-level keys
    const allKeys = new Set([...Object.keys(original), ...Object.keys(modified)]);

    for (const key of allKeys) {
      if (!original.hasOwnProperty(key)) {
        diff.sections[key] = { status: 'added', value: modified[key] };
        diff.summary.added.push(key);
      } else if (!modified.hasOwnProperty(key)) {
        diff.sections[key] = { status: 'removed', value: original[key] };
        diff.summary.removed.push(key);
      } else if (JSON.stringify(original[key]) !== JSON.stringify(modified[key])) {
        diff.sections[key] = {
          status: 'modified',
          original: original[key],
          modified: modified[key],
          changes: this.compareValues(original[key], modified[key])
        };
        diff.summary.modified.push(key);
      }
    }

    return diff;
  }

  /**
   * Generate a structured diff for agents
   * @param {string} originalContent - Original agent content
   * @param {string} modifiedContent - Modified agent content
   * @param {string} agentName - Name of the agent
   * @returns {Object} Structured agent diff
   */
  generateAgentDiff(originalContent, modifiedContent, agentName) {
    // Split content into YAML and markdown sections
    const originalParts = this.splitAgentContent(originalContent);
    const modifiedParts = this.splitAgentContent(modifiedContent);

    const yamlDiff = this.generateYamlDiff(
      originalParts.yaml,
      modifiedParts.yaml,
      agentName
    );

    const markdownDiff = this.generateUnifiedDiff(
      originalParts.markdown,
      modifiedParts.markdown,
      `${agentName}.md`,
      { contextLines: 5 }
    );

    return {
      agent: agentName,
      yamlChanges: yamlDiff,
      markdownChanges: markdownDiff,
      impactSummary: this.generateImpactSummary(yamlDiff)
    };
  }

  /**
   * Generate a visual diff summary
   * @param {Object} diff - Structured diff object
   * @returns {string} Formatted summary
   */
  generateDiffSummary(diff) {
    const lines = [];
    
    lines.push(this.colors.header('=== Modification Summary ==='));
    lines.push('');

    if (diff.summary) {
      if (diff.summary.added.length > 0) {
        lines.push(this.colors.added(`+ Added (${diff.summary.added.length}):`));
        diff.summary.added.forEach(item => {
          lines.push(this.colors.added(`  + ${item}`));
        });
        lines.push('');
      }

      if (diff.summary.modified.length > 0) {
        lines.push(this.colors.header(`~ Modified (${diff.summary.modified.length}):`));
        diff.summary.modified.forEach(item => {
          lines.push(this.colors.header(`  ~ ${item}`));
        });
        lines.push('');
      }

      if (diff.summary.removed.length > 0) {
        lines.push(this.colors.removed(`- Removed (${diff.summary.removed.length}):`));
        diff.summary.removed.forEach(item => {
          lines.push(this.colors.removed(`  - ${item}`));
        });
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  /**
   * Split agent content into YAML and markdown sections
   * @private
   */
  splitAgentContent(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) {
      throw new Error('Invalid agent content format');
    }

    return {
      yaml: match[1],
      markdown: match[2]
    };
  }

  /**
   * Compare two values and generate change details
   * @private
   */
  compareValues(original, modified) {
    const changes = [];

    if (Array.isArray(original) && Array.isArray(modified)) {
      const added = modified.filter(item => !original.includes(item));
      const removed = original.filter(item => !modified.includes(item));

      if (added.length > 0) {
        changes.push({ type: 'added', items: added });
      }
      if (removed.length > 0) {
        changes.push({ type: 'removed', items: removed });
      }
    } else if (typeof original === 'object' && typeof modified === 'object') {
      const allKeys = new Set([...Object.keys(original), ...Object.keys(modified)]);
      
      for (const key of allKeys) {
        if (!original.hasOwnProperty(key)) {
          changes.push({ type: 'added', key, value: modified[key] });
        } else if (!modified.hasOwnProperty(key)) {
          changes.push({ type: 'removed', key, value: original[key] });
        } else if (JSON.stringify(original[key]) !== JSON.stringify(modified[key])) {
          changes.push({
            type: 'modified',
            key,
            original: original[key],
            modified: modified[key]
          });
        }
      }
    } else {
      changes.push({
        type: 'value_changed',
        original,
        modified
      });
    }

    return changes;
  }

  /**
   * Colorize a diff patch
   * @private
   */
  colorizeDiff(patch, showLineNumbers) {
    const lines = patch.split('\n');
    const colorized = [];
    let lineNumOriginal = 0;
    let lineNumModified = 0;

    for (const line of lines) {
      if (line.startsWith('@@')) {
        // Parse line numbers from hunk header
        const match = line.match(/@@ -(\d+),\d+ \+(\d+),\d+ @@/);
        if (match) {
          lineNumOriginal = parseInt(match[1]);
          lineNumModified = parseInt(match[2]);
        }
        colorized.push(this.colors.header(line));
      } else if (line.startsWith('+')) {
        const lineNum = showLineNumbers ? `${lineNumModified.toString().padStart(4)}: ` : '';
        colorized.push(this.colors.added(`+${lineNum}${line.substring(1)}`));
        lineNumModified++;
      } else if (line.startsWith('-')) {
        const lineNum = showLineNumbers ? `${lineNumOriginal.toString().padStart(4)}: ` : '';
        colorized.push(this.colors.removed(`-${lineNum}${line.substring(1)}`));
        lineNumOriginal++;
      } else if (line.startsWith(' ')) {
        const lineNum = showLineNumbers ? 
          `${lineNumOriginal.toString().padStart(4)}: ` : '';
        colorized.push(this.colors.unchanged(` ${lineNum}${line.substring(1)}`));
        lineNumOriginal++;
        lineNumModified++;
      } else {
        colorized.push(this.colors.header(line));
      }
    }

    return colorized.join('\n');
  }

  /**
   * Generate impact summary from YAML diff
   * @private
   */
  generateImpactSummary(yamlDiff) {
    const impacts = [];

    // Check for dependency changes
    if (yamlDiff.sections.dependencies) {
      const changes = yamlDiff.sections.dependencies.changes || [];
      for (const change of changes) {
        if (change.type === 'added') {
          impacts.push(`New dependency added: ${change.items.join(', ')}`);
        } else if (change.type === 'removed') {
          impacts.push(`Dependency removed: ${change.items.join(', ')}`);
        }
      }
    }

    // Check for command changes
    if (yamlDiff.sections.commands) {
      impacts.push('Commands modified - users may need to update their workflows');
    }

    // Check for persona changes
    if (yamlDiff.sections.persona) {
      impacts.push('Agent persona modified - behavior may change');
    }

    return impacts;
  }

  /**
   * Generate a side-by-side diff view
   * @param {string} original - Original content
   * @param {string} modified - Modified content
   * @param {Object} options - Display options
   * @returns {string} Side-by-side diff
   */
  generateSideBySideDiff(original, modified, options = {}) {
    const { width = 80, gutter = 3 } = options;
    const columnWidth = Math.floor((width - gutter) / 2);

    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');
    const maxLines = Math.max(originalLines.length, modifiedLines.length);

    const output = [];
    output.push(this.colors.header('─'.repeat(width)));
    output.push(
      this.colors.header('Original'.padEnd(columnWidth)) +
      ' '.repeat(gutter) +
      this.colors.header('Modified'.padEnd(columnWidth))
    );
    output.push(this.colors.header('─'.repeat(width)));

    for (let i = 0; i < maxLines; i++) {
      const origLine = (originalLines[i] || '').substring(0, columnWidth);
      const modLine = (modifiedLines[i] || '').substring(0, columnWidth);

      let coloredOrig = origLine.padEnd(columnWidth);
      let coloredMod = modLine.padEnd(columnWidth);

      if (origLine !== modLine) {
        if (!originalLines[i]) {
          coloredMod = this.colors.added(coloredMod);
        } else if (!modifiedLines[i]) {
          coloredOrig = this.colors.removed(coloredOrig);
        } else {
          coloredOrig = this.colors.removed(coloredOrig);
          coloredMod = this.colors.added(coloredMod);
        }
      }

      output.push(coloredOrig + ' '.repeat(gutter) + coloredMod);
    }

    output.push(this.colors.header('─'.repeat(width)));
    return output.join('\n');
  }
}

module.exports = DiffGenerator;