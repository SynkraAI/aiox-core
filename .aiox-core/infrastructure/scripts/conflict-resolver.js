const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const diffLib = require('diff');
const inquirer = require('inquirer');
const GitWrapper = require('./git-wrapper');

/**
 * Handles conflict detection and resolution for meta-agent modifications
 */
class ConflictResolver {
  constructor(options = {}) {
    this.git = new GitWrapper(options);
    this.rootPath = options.rootPath || process.cwd();
    this.strategies = {
      'ours': this.resolveOurs.bind(this),
      'theirs': this.resolveTheirs.bind(this),
      'manual': this.resolveManual.bind(this),
      'auto': this.resolveAuto.bind(this),
      'interactive': this.resolveInteractive.bind(this),
    };
  }

  /**
   * Detect conflicts in the repository
   * @returns {Promise<Object>} Conflict information
   */
  async detectConflicts() {
    try {
      const conflicts = await this.git.getConflicts();
      
      if (conflicts.length === 0) {
        return {
          hasConflicts: false,
          files: [],
        };
      }

      const conflictDetails = [];
      for (const file of conflicts) {
        const content = await fs.readFile(
          path.join(this.rootPath, file),
          'utf-8',
        );
        
        const conflictInfo = this.parseConflictMarkers(content);
        conflictDetails.push({
          file,
          conflicts: conflictInfo.conflicts,
          conflictCount: conflictInfo.conflicts.length,
          type: this.detectConflictType(file, conflictInfo),
        });
      }

      return {
        hasConflicts: true,
        files: conflictDetails,
        totalConflicts: conflictDetails.reduce((sum, f) => sum + f.conflictCount, 0),
      };
    } catch (error) {
      console.error(chalk.red(`Error detecting conflicts: ${error.message}`));
      return {
        hasConflicts: false,
        error: error.message,
      };
    }
  }

  /**
   * Parse conflict markers in file content
   * @private
   */
  parseConflictMarkers(content) {
    const conflicts = [];
    const lines = content.split('\n');
    let inConflict = false;
    let currentConflict = null;
    let lineNumber = 0;

    for (const line of lines) {
      lineNumber++;
      
      if (line.startsWith('<<<<<<<')) {
        inConflict = true;
        currentConflict = {
          startLine: lineNumber,
          ours: [],
          theirs: [],
          separator: null,
          endLine: null,
          branch: line.substring(8).trim(),
        };
      } else if (inConflict && line.startsWith('=======')) {
        currentConflict.separator = lineNumber;
      } else if (inConflict && line.startsWith('>>>>>>>')) {
        currentConflict.endLine = lineNumber;
        currentConflict.theirBranch = line.substring(8).trim();
        conflicts.push(currentConflict);
        inConflict = false;
        currentConflict = null;
      } else if (inConflict && currentConflict) {
        if (currentConflict.separator === null) {
          currentConflict.ours.push(line);
        } else {
          currentConflict.theirs.push(line);
        }
      }
    }

    return { conflicts, totalLines: lineNumber };
  }

  /**
   * Detect the type of conflict
   * @private
   */
  detectConflictType(file, conflictInfo) {
    const ext = path.extname(file);
    const conflicts = conflictInfo.conflicts;

    // Check for specific conflict patterns
    for (const conflict of conflicts) {
      const oursContent = conflict.ours.join('\n');
      const theirsContent = conflict.theirs.join('\n');

      // Whitespace only conflict
      if (oursContent.trim() === theirsContent.trim()) {
        return 'whitespace';
      }

      // Import/require conflict
      if ((oursContent.includes('import') || oursContent.includes('require')) &&
          (theirsContent.includes('import') || theirsContent.includes('require'))) {
        return 'imports';
      }

      // Version number conflict
      if (oursContent.match(/\d+\.\d+\.\d+/) && theirsContent.match(/\d+\.\d+\.\d+/)) {
        return 'version';
      }
    }

    // File type specific
    if (ext === '.json') return 'json';
    if (ext === '.yaml' || ext === '.yml') return 'yaml';
    if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) return 'code';
    if (ext === '.md') return 'markdown';

    return 'general';
  }

  /**
   * Resolve conflicts using a specific strategy
   * @param {string} strategy - Resolution strategy
   * @param {Object} options - Resolution options
   * @returns {Promise<Object>} Resolution result
   */
  async resolveConflicts(strategy = 'interactive', options = {}) {
    const conflictInfo = await this.detectConflicts();
    
    if (!conflictInfo.hasConflicts) {
      console.log(chalk.green('✅ No conflicts detected'));
      return { success: true, resolved: 0 };
    }

    console.log(chalk.yellow(
      `Found ${conflictInfo.totalConflicts} conflicts in ${conflictInfo.files.length} files`,
    ));

    const resolver = this.strategies[strategy];
    if (!resolver) {
      throw new Error(`Unknown resolution strategy: ${strategy}`);
    }

    const results = {
      resolved: 0,
      failed: 0,
      files: [],
    };

    for (const fileInfo of conflictInfo.files) {
      try {
        console.log(chalk.blue(`\nResolving conflicts in: ${fileInfo.file}`));
        const resolved = await resolver(fileInfo, options);
        
        if (resolved.success) {
          results.resolved += resolved.conflictsResolved;
          results.files.push({
            file: fileInfo.file,
            status: 'resolved',
            method: resolved.method,
          });
        } else {
          results.failed++;
          results.files.push({
            file: fileInfo.file,
            status: 'failed',
            error: resolved.error,
          });
        }
      } catch (error) {
        results.failed++;
        results.files.push({
          file: fileInfo.file,
          status: 'error',
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Resolve using 'ours' strategy (keep current branch changes)
   * @private
   */
  async resolveOurs(fileInfo) {
    try {
      await this.git.execGit(`checkout --ours "${fileInfo.file}"`);
      await this.git.execGit(`add "${fileInfo.file}"`);
      
      return {
        success: true,
        conflictsResolved: fileInfo.conflictCount,
        method: 'ours',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Resolve using 'theirs' strategy (keep incoming branch changes)
   * @private
   */
  async resolveTheirs(fileInfo) {
    try {
      await this.git.execGit(`checkout --theirs "${fileInfo.file}"`);
      await this.git.execGit(`add "${fileInfo.file}"`);
      
      return {
        success: true,
        conflictsResolved: fileInfo.conflictCount,
        method: 'theirs',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Resolve conflicts manually by editing the file
   * @private
   */
  async resolveManual(fileInfo) {
    const filePath = path.join(this.rootPath, fileInfo.file);
    const content = await fs.readFile(filePath, 'utf-8');
    
    console.log(chalk.yellow(
      `Manual resolution required for ${fileInfo.file}`,
    ));
    console.log(chalk.gray(
      'Edit the file to resolve conflicts, then mark as resolved',
    ));
    
    // In a real implementation, this would open an editor
    // For now, we'll return a message
    return {
      success: false,
      error: 'Manual resolution required',
      instruction: `Edit ${filePath} and run: git add "${fileInfo.file}"`,
    };
  }

  /**
   * Automatically resolve conflicts based on type
   * @private
   */
  async resolveAuto(fileInfo) {
    const filePath = path.join(this.rootPath, fileInfo.file);
    const content = await fs.readFile(filePath, 'utf-8');
    
    let resolved = content;
    let resolvedCount = 0;

    switch (fileInfo.type) {
      case 'whitespace':
        // For whitespace conflicts, keep theirs
        resolved = await this.autoResolveWhitespace(content, fileInfo);
        resolvedCount = fileInfo.conflictCount;
        break;
        
      case 'imports':
        // For import conflicts, merge both
        resolved = await this.autoResolveImports(content, fileInfo);
        resolvedCount = fileInfo.conflictCount;
        break;
        
      case 'version':
        // For version conflicts, keep higher version
        resolved = await this.autoResolveVersion(content, fileInfo);
        resolvedCount = fileInfo.conflictCount;
        break;
        
      case 'json':
        // For JSON conflicts, attempt to merge
        resolved = await this.autoResolveJSON(content, fileInfo);
        resolvedCount = fileInfo.conflictCount;
        break;
        
      default:
        // Can't auto-resolve
        return {
          success: false,
          error: `Cannot auto-resolve ${fileInfo.type} conflicts`,
        };
    }

    // Write resolved content
    await fs.writeFile(filePath, resolved);
    await this.git.execGit(`add "${fileInfo.file}"`);

    return {
      success: true,
      conflictsResolved: resolvedCount,
      method: `auto-${fileInfo.type}`,
    };
  }

  /**
   * Interactive conflict resolution
   * @private
   */
  async resolveInteractive(fileInfo) {
    const filePath = path.join(this.rootPath, fileInfo.file);
    const content = await fs.readFile(filePath, 'utf-8');
    const conflicts = this.parseConflictMarkers(content).conflicts;
    
    let resolvedContent = content;
    let resolvedCount = 0;

    console.log(chalk.blue(`\nResolving ${fileInfo.file} (${conflicts.length} conflicts)`));

    for (let i = 0; i < conflicts.length; i++) {
      const conflict = conflicts[i];
      console.log(chalk.yellow(`\nConflict ${i + 1}/${conflicts.length}:`));
      
      // Show conflict preview
      console.log(chalk.red('<<<< OURS:'));
      console.log(conflict.ours.slice(0, 5).join('\n'));
      if (conflict.ours.length > 5) console.log(chalk.gray('...'));
      
      console.log(chalk.green('\n>>>> THEIRS:'));
      console.log(conflict.theirs.slice(0, 5).join('\n'));
      if (conflict.theirs.length > 5) console.log(chalk.gray('...'));

      const { resolution } = await inquirer.prompt([{
        type: 'list',
        name: 'resolution',
        message: 'How to resolve this conflict?',
        choices: [
          { name: 'Keep ours (current branch)', value: 'ours' },
          { name: 'Keep theirs (incoming)', value: 'theirs' },
          { name: 'Keep both (ours first)', value: 'both-ours' },
          { name: 'Keep both (theirs first)', value: 'both-theirs' },
          { name: 'Custom merge', value: 'custom' },
          { name: 'Skip this conflict', value: 'skip' },
        ],
      }]);

      if (resolution !== 'skip') {
        resolvedContent = await this.applyResolution(
          resolvedContent,
          conflict,
          resolution,
        );
        resolvedCount++;
      }
    }

    if (resolvedCount > 0) {
      await fs.writeFile(filePath, resolvedContent);
      await this.git.execGit(`add "${fileInfo.file}"`);
    }

    return {
      success: true,
      conflictsResolved: resolvedCount,
      method: 'interactive',
    };
  }

  /**
   * Apply a specific resolution to content
   * @private
   */
  async applyResolution(content, conflict, resolution) {
    const lines = content.split('\n');
    const newLines = [];
    let skipUntil = null;

    for (let i = 0; i < lines.length; i++) {
      if (skipUntil && i < skipUntil) continue;
      
      if (i === conflict.startLine - 1) {
        switch (resolution) {
          case 'ours':
            newLines.push(...conflict.ours);
            break;
          case 'theirs':
            newLines.push(...conflict.theirs);
            break;
          case 'both-ours':
            newLines.push(...conflict.ours);
            newLines.push(...conflict.theirs);
            break;
          case 'both-theirs':
            newLines.push(...conflict.theirs);
            newLines.push(...conflict.ours);
            break;
          case 'custom':
            const { custom } = await inquirer.prompt([{
              type: 'editor',
              name: 'custom',
              message: 'Enter custom resolution:',
              default: conflict.ours.join('\n'),
            }]);
            newLines.push(...custom.split('\n'));
            break;
        }
        skipUntil = conflict.endLine;
      } else {
        newLines.push(lines[i]);
      }
    }

    return newLines.join('\n');
  }

  /**
   * Auto-resolve whitespace conflicts
   * @private
   */
  async autoResolveWhitespace(content, fileInfo) {
    // Remove conflict markers and keep theirs (usually has correct formatting)
    let resolved = content;
    
    for (const conflict of fileInfo.conflicts) {
      const pattern = new RegExp(
        '<<<<<<<[^\\n]*\\n[\\s\\S]*?=======\\n([\\s\\S]*?)>>>>>>>[^\\n]*\\n',
        'g',
      );
      resolved = resolved.replace(pattern, '$1');
    }
    
    return resolved;
  }

  /**
   * Auto-resolve import conflicts
   * @private
   */
  async autoResolveImports(content, fileInfo) {
    // Merge imports from both sides, removing duplicates
    const imports = new Set();
    
    for (const conflict of fileInfo.conflicts) {
      // Extract imports from both sides
      const oursImports = conflict.ours
        .filter(line => line.includes('import') || line.includes('require'))
        .map(line => line.trim());
      
      const theirsImports = conflict.theirs
        .filter(line => line.includes('import') || line.includes('require'))
        .map(line => line.trim());
      
      // Add all unique imports
      [...oursImports, ...theirsImports].forEach(imp => imports.add(imp));
    }
    
    // Replace conflicts with merged imports
    let resolved = content;
    for (const conflict of fileInfo.conflicts) {
      const pattern = new RegExp(
        '<<<<<<<[^\\n]*\\n[\\s\\S]*?>>>>>>>[^\\n]*\\n',
        'g',
      );
      resolved = resolved.replace(pattern, Array.from(imports).join('\n') + '\n');
    }
    
    return resolved;
  }

  /**
   * Auto-resolve version conflicts
   * @private
   */
  async autoResolveVersion(content, fileInfo) {
    let resolved = content;
    
    for (const conflict of fileInfo.conflicts) {
      const oursVersion = conflict.ours.join('').match(/(\d+)\.(\d+)\.(\d+)/);
      const theirsVersion = conflict.theirs.join('').match(/(\d+)\.(\d+)\.(\d+)/);
      
      if (oursVersion && theirsVersion) {
        // Compare versions and keep higher
        const ours = oursVersion.slice(1, 4).map(Number);
        const theirs = theirsVersion.slice(1, 4).map(Number);
        
        let useTheirs = false;
        for (let i = 0; i < 3; i++) {
          if (theirs[i] > ours[i]) {
            useTheirs = true;
            break;
          } else if (ours[i] > theirs[i]) {
            break;
          }
        }
        
        const pattern = new RegExp(
          '<<<<<<<[^\\n]*\\n[\\s\\S]*?=======\\n([\\s\\S]*?)>>>>>>>[^\\n]*\\n',
        );
        
        if (useTheirs) {
          resolved = resolved.replace(pattern, '$1');
        } else {
          resolved = resolved.replace(pattern, conflict.ours.join('\n') + '\n');
        }
      }
    }
    
    return resolved;
  }

  /**
   * Auto-resolve JSON conflicts
   * @private
   */
  async autoResolveJSON(content, fileInfo) {
    try {
      // Try to parse and merge JSON objects
      const oursMatch = content.match(/<<<<<<<[^{]*({[\s\S]*?})[\s\S]*?=======/);
      const theirsMatch = content.match(/=======[\s\S]*?({[\s\S]*?})[\s\S]*?>>>>>>>/);
      
      if (oursMatch && theirsMatch) {
        const oursObj = JSON.parse(oursMatch[1]);
        const theirsObj = JSON.parse(theirsMatch[1]);
        
        // Deep merge objects
        const merged = this.deepMerge(oursObj, theirsObj);
        
        // Replace entire file with merged JSON
        return JSON.stringify(merged, null, 2);
      }
    } catch (error) {
      console.error(chalk.red('Failed to auto-resolve JSON:', error.message));
    }
    
    // Fallback to manual resolution
    return content;
  }

  /**
   * Deep merge two objects
   * @private
   */
  deepMerge(obj1, obj2) {
    const result = { ...obj1 };
    
    for (const key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        if (typeof obj2[key] === 'object' && !Array.isArray(obj2[key]) && 
            obj1[key] && typeof obj1[key] === 'object') {
          result[key] = this.deepMerge(obj1[key], obj2[key]);
        } else {
          result[key] = obj2[key];
        }
      }
    }
    
    return result;
  }

  /**
   * Generate conflict report
   * @returns {Promise<Object>} Conflict report
   */
  async generateConflictReport() {
    const conflictInfo = await this.detectConflicts();
    
    if (!conflictInfo.hasConflicts) {
      return {
        summary: 'No conflicts detected',
        details: [],
      };
    }

    const report = {
      summary: `${conflictInfo.totalConflicts} conflicts in ${conflictInfo.files.length} files`,
      timestamp: new Date().toISOString(),
      details: conflictInfo.files.map(file => ({
        file: file.file,
        type: file.type,
        conflicts: file.conflictCount,
        preview: file.conflicts.map(c => ({
          lines: `${c.startLine}-${c.endLine}`,
          oursPreview: c.ours.slice(0, 2).join('\n'),
          theirsPreview: c.theirs.slice(0, 2).join('\n'),
        })),
      })),
      recommendations: this.generateRecommendations(conflictInfo),
    };

    return report;
  }

  /**
   * Generate resolution recommendations
   * @private
   */
  generateRecommendations(conflictInfo) {
    const recommendations = [];
    const types = {};
    
    // Count conflict types
    conflictInfo.files.forEach(file => {
      types[file.type] = (types[file.type] || 0) + file.conflictCount;
    });

    // Generate recommendations based on types
    if (types.whitespace > 0) {
      recommendations.push({
        type: 'whitespace',
        suggestion: 'Use auto-resolution for whitespace conflicts',
        command: "resolver.resolveConflicts('auto', { type: 'whitespace' })",
      });
    }

    if (types.imports > 0) {
      recommendations.push({
        type: 'imports',
        suggestion: 'Merge import statements from both branches',
        command: "resolver.resolveConflicts('auto', { type: 'imports' })",
      });
    }

    if (types.version > 0) {
      recommendations.push({
        type: 'version',
        suggestion: 'Keep the higher version number',
        command: "resolver.resolveConflicts('auto', { type: 'version' })",
      });
    }

    // General recommendation
    if (conflictInfo.totalConflicts > 10) {
      recommendations.push({
        type: 'general',
        suggestion: 'Consider reviewing branch merge strategy',
        command: 'Use smaller, more focused branches',
      });
    }

    return recommendations;
  }
}

module.exports = ConflictResolver;