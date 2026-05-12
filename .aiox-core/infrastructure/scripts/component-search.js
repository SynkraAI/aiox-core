const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

/**
 * Component search utility for Synkra AIOX framework
 * Finds and searches components across the framework
 */
class ComponentSearch {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.componentCache = new Map();
    this.componentTypes = {
      agent: { directory: 'agents', extension: '.md' },
      task: { directory: 'tasks', extension: '.md' },
      workflow: { directory: 'workflows', extension: '.yaml' },
      util: { directory: 'utils', extension: '.js' },
    };
  }

  /**
   * Find a specific component by type and name
   */
  async findComponent(componentType, componentName) {
    const cacheKey = `${componentType}/${componentName}`;
    
    if (this.componentCache.has(cacheKey)) {
      return this.componentCache.get(cacheKey);
    }

    try {
      const component = await this.searchComponent(componentType, componentName);
      
      if (component) {
        this.componentCache.set(cacheKey, component);
      }
      
      return component;

    } catch (error) {
      console.warn(chalk.yellow(`Failed to find component ${componentType}/${componentName}: ${error.message}`));
      return null;
    }
  }

  /**
   * Search for a component in the filesystem
   */
  async searchComponent(componentType, componentName) {
    const typeConfig = this.componentTypes[componentType];
    if (!typeConfig) {
      throw new Error(`Unknown component type: ${componentType}`);
    }

    const searchPaths = [
      path.join(this.rootPath, 'aiox-core', typeConfig.directory),
      path.join(this.rootPath, typeConfig.directory),
    ];

    for (const searchPath of searchPaths) {
      try {
        await fs.access(searchPath);
        
        // Try exact match first
        const exactMatch = await this.findExactMatch(searchPath, componentName, typeConfig.extension);
        if (exactMatch) {
          return exactMatch;
        }

        // Try fuzzy matching
        const fuzzyMatch = await this.findFuzzyMatch(searchPath, componentName, typeConfig.extension);
        if (fuzzyMatch) {
          return fuzzyMatch;
        }

      } catch (error) {
        // Search path doesn't exist, continue to next
        continue;
      }
    }

    return null;
  }

  /**
   * Find exact match for component
   */
  async findExactMatch(searchPath, componentName, extension) {
    const possibleNames = [
      `${componentName}${extension}`,
      `${componentName.toLowerCase()}${extension}`,
      `${componentName.replace(/-/g, '_')}${extension}`,
      `${componentName.replace(/_/g, '-')}${extension}`,
    ];

    for (const filename of possibleNames) {
      const filePath = path.join(searchPath, filename);
      
      try {
        await fs.access(filePath);
        
        const component = await this.createComponentInfo(filePath, componentName);
        return component;

      } catch (error) {
        // File doesn't exist, try next name variation
        continue;
      }
    }

    return null;
  }

  /**
   * Find fuzzy match for component
   */
  async findFuzzyMatch(searchPath, componentName, extension) {
    try {
      const files = await fs.readdir(searchPath);
      const matchingFiles = files.filter(file => {
        const basename = path.basename(file, extension);
        return this.calculateSimilarity(componentName, basename) > 0.7;
      });

      if (matchingFiles.length > 0) {
        // Return the best match
        const bestMatch = matchingFiles.reduce((best, current) => {
          const bestScore = this.calculateSimilarity(componentName, path.basename(best, extension));
          const currentScore = this.calculateSimilarity(componentName, path.basename(current, extension));
          return currentScore > bestScore ? current : best;
        });

        const filePath = path.join(searchPath, bestMatch);
        return await this.createComponentInfo(filePath, componentName);
      }

    } catch (error) {
      // Can't read directory
    }

    return null;
  }

  /**
   * Find similar components for suggestions
   */
  async findSimilarComponents(componentType, componentName, limit = 5) {
    const suggestions = [];
    const typeConfig = this.componentTypes[componentType];
    
    if (!typeConfig) {
      return suggestions;
    }

    const searchPaths = [
      path.join(this.rootPath, 'aiox-core', typeConfig.directory),
      path.join(this.rootPath, typeConfig.directory),
    ];

    for (const searchPath of searchPaths) {
      try {
        await fs.access(searchPath);
        const files = await fs.readdir(searchPath);
        
        for (const file of files) {
          if (path.extname(file) === typeConfig.extension) {
            const basename = path.basename(file, typeConfig.extension);
            const similarity = this.calculateSimilarity(componentName, basename);
            
            if (similarity > 0.3 && similarity < 1.0) {
              suggestions.push({
                type: componentType,
                name: basename,
                similarity: similarity,
                file_path: path.join(searchPath, file),
              });
            }
          }
        }

      } catch (error) {
        // Search path doesn't exist or can't be read
        continue;
      }
    }

    // Sort by similarity and return top matches
    return suggestions
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    const matrix = Array(len2 + 1).fill().map(() => Array(len1 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j - 1][i] + 1,     // deletion
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i - 1] + cost, // substitution
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len2][len1]) / maxLen;
  }

  /**
   * Create component information object
   */
  async createComponentInfo(filePath, componentName) {
    const componentType = this.inferComponentType(filePath);
    
    const component = {
      id: `${componentType}/${componentName}`,
      type: componentType,
      name: componentName,
      filePath: filePath,
      registrationFile: await this.findRegistrationFile(componentType, componentName),
      created_at: new Date().toISOString(),
    };

    return component;
  }

  /**
   * Infer component type from file path
   */
  inferComponentType(filePath) {
    for (const [type, config] of Object.entries(this.componentTypes)) {
      if (filePath.includes(config.directory) && filePath.endsWith(config.extension)) {
        return type;
      }
    }
    
    return 'unknown';
  }

  /**
   * Find component registration file
   */
  async findRegistrationFile(componentType, componentName) {
    const possibleRegistrationFiles = [
      path.join(this.rootPath, 'aiox-core', 'registry.json'),
      path.join(this.rootPath, 'components.json'),
      path.join(this.rootPath, 'manifest.yaml'),
    ];

    for (const regFile of possibleRegistrationFiles) {
      try {
        await fs.access(regFile);
        return regFile;
      } catch (error) {
        // File doesn't exist, continue
      }
    }

    return null;
  }
}

module.exports = ComponentSearch;
