/**
 * AIOX Documentation Synchronizer
 * 
 * Automatically synchronizes documentation with code changes,
 * ensuring documentation stays up-to-date with implementation.
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const yaml = require('js-yaml');
const marked = require('marked');

class DocumentationSynchronizer extends EventEmitter {
  constructor(options = {}) {
    super();
    this.rootPath = options.rootPath || process.cwd();
    this.syncedComponents = new Map();
    this.documentationIndex = new Map();
    this.syncHistory = [];
    this.options = {
      autoSync: options.autoSync !== false,
      syncInterval: options.syncInterval || 60000, // 1 minute
      docFormats: options.docFormats || ['.md', '.yaml', '.yml', '.json'],
      codeFormats: options.codeFormats || ['.js', '.jsx', '.ts', '.tsx'],
      syncStrategies: options.syncStrategies || ['jsdoc', 'markdown', 'schema', 'api', 'examples'],
      ...options,
    };
    
    this.syncStrategies = new Map();
    this.initializeSyncStrategies();
    
    if (this.options.autoSync) {
      this.startAutoSync();
    }
  }

  initializeSyncStrategies() {
    // JSDoc synchronization
    this.syncStrategies.set('jsdoc', {
      name: 'JSDoc Synchronization',
      description: 'Sync JSDoc comments with markdown documentation',
      detector: this.detectJSDocChanges.bind(this),
      synchronizer: this.syncJSDoc.bind(this),
      priority: 'high',
    });

    // Markdown documentation
    this.syncStrategies.set('markdown', {
      name: 'Markdown Documentation',
      description: 'Update markdown files with code changes',
      detector: this.detectMarkdownChanges.bind(this),
      synchronizer: this.syncMarkdown.bind(this),
      priority: 'medium',
    });

    // Schema synchronization
    this.syncStrategies.set('schema', {
      name: 'Schema Documentation',
      description: 'Sync YAML/JSON schemas with code structures',
      detector: this.detectSchemaChanges.bind(this),
      synchronizer: this.syncSchema.bind(this),
      priority: 'high',
    });

    // API documentation
    this.syncStrategies.set('api', {
      name: 'API Documentation',
      description: 'Update API documentation with endpoint changes',
      detector: this.detectAPIChanges.bind(this),
      synchronizer: this.syncAPI.bind(this),
      priority: 'high',
    });

    // Code examples
    this.syncStrategies.set('examples', {
      name: 'Code Examples',
      description: 'Update code examples in documentation',
      detector: this.detectExampleChanges.bind(this),
      synchronizer: this.syncExamples.bind(this),
      priority: 'medium',
    });
  }

  async initialize() {
    try {
      // Build documentation index
      await this.buildDocumentationIndex();
      
      // Analyze code-documentation relationships
      await this.analyzeRelationships();
      
      this.emit('initialized', {
        documentationFiles: this.documentationIndex.size,
        syncedComponents: this.syncedComponents.size,
      });
      
    } catch (error) {
      this.emit('error', { phase: 'initialization', error });
      throw error;
    }
  }

  async buildDocumentationIndex() {
    const docFiles = await this.findDocumentationFiles();
    
    for (const docFile of docFiles) {
      try {
        const content = await fs.readFile(docFile, 'utf-8');
        const metadata = await this.extractDocumentationMetadata(docFile, content);
        
        this.documentationIndex.set(docFile, {
          path: docFile,
          content,
          metadata,
          lastSync: null,
          linkedComponents: [],
        });
      } catch (error) {
        console.warn(`Failed to index documentation: ${docFile}`, error);
      }
    }
  }

  async findDocumentationFiles() {
    const files = [];
    const docsDir = path.join(this.rootPath, 'docs');
    const readmeFiles = ['README.md', 'readme.md', 'README.MD'];
    
    // Find documentation in docs directory
    if (await this.exists(docsDir)) {
      await this.scanDirectory(docsDir, files);
    }
    
    // Find README files throughout the project
    await this.scanForReadme(this.rootPath, files, readmeFiles);
    
    // Find inline documentation (markdown in code directories)
    await this.scanForInlineDocs(this.rootPath, files);
    
    return files;
  }

  async scanDirectory(dir, files) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        await this.scanDirectory(fullPath, files);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (this.options.docFormats.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  async extractDocumentationMetadata(filePath, content) {
    const metadata = {
      title: null,
      description: null,
      linkedFiles: [],
      codeBlocks: [],
      schemas: [],
      apis: [],
      lastModified: null,
    };
    
    const ext = path.extname(filePath);
    
    if (ext === '.md') {
      // Extract markdown metadata
      const lines = content.split('\n');
      
      // Find title
      const titleMatch = lines.find(line => line.startsWith('# '));
      if (titleMatch) {
        metadata.title = titleMatch.substring(2).trim();
      }
      
      // Find code blocks
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      let match;
      while ((match = codeBlockRegex.exec(content)) !== null) {
        metadata.codeBlocks.push({
          language: match[1] || 'text',
          code: match[2].trim(),
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
      
      // Find file references
      const fileRefRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      while ((match = fileRefRegex.exec(content)) !== null) {
        if (match[2].endsWith('.js') || match[2].endsWith('.ts')) {
          metadata.linkedFiles.push({
            text: match[1],
            path: match[2],
          });
        }
      }
    } else if (ext === '.yaml' || ext === '.yml') {
      // Extract YAML metadata
      try {
        const data = yaml.load(content);
        metadata.title = data.name || data.title || path.basename(filePath, ext);
        metadata.description = data.description;
        metadata.schemas.push(data);
      } catch (error) {
        console.warn(`Failed to parse YAML: ${filePath}`, error);
      }
    }
    
    // Get file stats
    const stats = await fs.stat(filePath);
    metadata.lastModified = stats.mtime;
    
    return metadata;
  }

  async analyzeRelationships() {
    // Find relationships between code and documentation
    for (const [docPath, docInfo] of this.documentationIndex) {
      const relationships = await this.findCodeRelationships(docPath, docInfo);
      
      for (const relationship of relationships) {
        this.syncedComponents.set(relationship.codePath, {
          codePath: relationship.codePath,
          docPath: docPath,
          type: relationship.type,
          lastSync: null,
          syncStrategies: relationship.strategies,
        });
        
        docInfo.linkedComponents.push(relationship.codePath);
      }
    }
  }

  async findCodeRelationships(docPath, docInfo) {
    const relationships = [];
    const docDir = path.dirname(docPath);
    const docName = path.basename(docPath, path.extname(docPath));
    
    // Strategy 1: Same directory, same name
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx'];
    for (const ext of codeExtensions) {
      const codePath = path.join(docDir, docName + ext);
      if (await this.exists(codePath)) {
        relationships.push({
          codePath,
          type: 'same-name',
          strategies: ['jsdoc', 'examples'],
        });
      }
    }
    
    // Strategy 2: Referenced files in documentation
    for (const linkedFile of docInfo.metadata.linkedFiles) {
      const codePath = path.resolve(docDir, linkedFile.path);
      if (await this.exists(codePath)) {
        relationships.push({
          codePath,
          type: 'referenced',
          strategies: ['jsdoc', 'api', 'examples'],
        });
      }
    }
    
    // Strategy 3: Agent/Task/Workflow documentation
    if (docPath.includes('agents') || docPath.includes('tasks') || docPath.includes('workflows')) {
      const componentType = docPath.includes('agents') ? 'agent' :
        docPath.includes('tasks') ? 'task' : 'workflow';
      
      // Find manifest file
      const manifestPath = path.join(docDir, 'manifest.yaml');
      if (await this.exists(manifestPath)) {
        relationships.push({
          codePath: manifestPath,
          type: componentType,
          strategies: ['schema', 'markdown'],
        });
      }
    }
    
    return relationships;
  }

  async synchronizeComponent(componentPath, options = {}) {
    const component = this.syncedComponents.get(componentPath);
    if (!component) {
      throw new Error(`Component not found in sync registry: ${componentPath}`);
    }
    
    const doc = this.documentationIndex.get(component.docPath);
    if (!doc) {
      throw new Error(`Documentation not found: ${component.docPath}`);
    }
    
    const changes = [];
    const strategies = options.strategies || component.syncStrategies;
    
    for (const strategyName of strategies) {
      const strategy = this.syncStrategies.get(strategyName);
      if (!strategy) continue;
      
      try {
        // Detect changes
        const detected = await strategy.detector(componentPath, component.docPath);
        
        if (detected && detected.length > 0) {
          // Apply synchronization
          const result = await strategy.synchronizer(
            componentPath,
            component.docPath,
            detected,
            options,
          );
          
          changes.push({
            strategy: strategyName,
            changes: result.changes,
            success: result.success,
          });
        }
      } catch (error) {
        changes.push({
          strategy: strategyName,
          error: error.message,
          success: false,
        });
      }
    }
    
    // Update sync metadata
    component.lastSync = new Date().toISOString();
    doc.lastSync = new Date().toISOString();
    
    // Record in history
    this.syncHistory.push({
      timestamp: new Date().toISOString(),
      componentPath,
      docPath: component.docPath,
      changes,
      success: changes.every(c => c.success),
    });
    
    this.emit('synchronized', {
      componentPath,
      docPath: component.docPath,
      changes,
    });
    
    return changes;
  }

  async detectJSDocChanges(codePath, docPath) {
    const changes = [];
    
    try {
      const codeContent = await fs.readFile(codePath, 'utf-8');
      const docContent = await fs.readFile(docPath, 'utf-8');
      
      // Parse code for JSDoc comments
      const jsdocComments = await this.extractJSDocComments(codeContent);
      
      // Find corresponding sections in documentation
      for (const jsdoc of jsdocComments) {
        const docSection = this.findDocumentationSection(
          docContent,
          jsdoc.name,
          jsdoc.type,
        );
        
        if (docSection) {
          // Compare and detect changes
          const diff = this.compareJSDocWithDoc(jsdoc, docSection);
          if (diff) {
            changes.push({
              type: 'jsdoc-update',
              name: jsdoc.name,
              jsdoc,
              docSection,
              diff,
            });
          }
        } else {
          // New function/class not in documentation
          changes.push({
            type: 'jsdoc-new',
            name: jsdoc.name,
            jsdoc,
          });
        }
      }
    } catch (error) {
      console.error(`Error detecting JSDoc changes: ${error.message}`);
    }
    
    return changes;
  }

  async extractJSDocComments(codeContent) {
    const comments = [];
    
    try {
      const ast = parser.parse(codeContent, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
        attachComment: true,
      });
      
      traverse(ast, {
        enter(path) {
          if (path.node.leadingComments) {
            for (const comment of path.node.leadingComments) {
              if (comment.type === 'CommentBlock' && comment.value.startsWith('*')) {
                const jsdoc = this.parseJSDoc(comment.value);
                if (jsdoc) {
                  // Attach the associated node info
                  if (t.isFunctionDeclaration(path.node) || t.isClassDeclaration(path.node)) {
                    jsdoc.name = path.node.id?.name;
                    jsdoc.type = path.node.type;
                  } else if (t.isVariableDeclarator(path.node)) {
                    jsdoc.name = path.node.id?.name;
                    jsdoc.type = 'VariableDeclarator';
                  }
                  
                  if (jsdoc.name) {
                    comments.push(jsdoc);
                  }
                }
              }
            }
          }
        },
      });
    } catch (error) {
      console.error(`Error parsing code: ${error.message}`);
    }
    
    return comments;
  }

  parseJSDoc(commentText) {
    const jsdoc = {
      description: '',
      params: [],
      returns: null,
      examples: [],
      tags: {},
    };
    
    const lines = commentText.split('\n').map(line => 
      line.trim().replace(/^\* ?/, ''),
    );
    
    let currentSection = 'description';
    let currentParam = null;
    
    for (const line of lines) {
      if (line.startsWith('@param')) {
        const paramMatch = line.match(/@param\s+(?:\{([^}]+)\}\s+)?(\w+)(?:\s+-\s+(.*))?/);
        if (paramMatch) {
          currentParam = {
            type: paramMatch[1],
            name: paramMatch[2],
            description: paramMatch[3] || '',
          };
          jsdoc.params.push(currentParam);
          currentSection = 'param';
        }
      } else if (line.startsWith('@returns') || line.startsWith('@return')) {
        const returnMatch = line.match(/@returns?\s+(?:\{([^}]+)\}\s+)?(.*)$/);
        if (returnMatch) {
          jsdoc.returns = {
            type: returnMatch[1],
            description: returnMatch[2] || '',
          };
          currentSection = 'returns';
        }
      } else if (line.startsWith('@example')) {
        currentSection = 'example';
        jsdoc.examples.push('');
      } else if (line.startsWith('@')) {
        const tagMatch = line.match(/@(\w+)(?:\s+(.*))?/);
        if (tagMatch) {
          jsdoc.tags[tagMatch[1]] = tagMatch[2] || true;
          currentSection = tagMatch[1];
        }
      } else if (line) {
        // Continue current section
        if (currentSection === 'description') {
          jsdoc.description += (jsdoc.description ? '\n' : '') + line;
        } else if (currentSection === 'param' && currentParam) {
          currentParam.description += (currentParam.description ? '\n' : '') + line;
        } else if (currentSection === 'returns' && jsdoc.returns) {
          jsdoc.returns.description += (jsdoc.returns.description ? '\n' : '') + line;
        } else if (currentSection === 'example' && jsdoc.examples.length > 0) {
          const lastExample = jsdoc.examples.length - 1;
          jsdoc.examples[lastExample] += (jsdoc.examples[lastExample] ? '\n' : '') + line;
        }
      }
    }
    
    return jsdoc;
  }

  async syncJSDoc(codePath, docPath, changes, options = {}) {
    const result = {
      changes: [],
      success: true,
    };
    
    try {
      let docContent = await fs.readFile(docPath, 'utf-8');
      const backup = docContent; // Keep backup for rollback
      
      for (const change of changes) {
        if (change.type === 'jsdoc-update') {
          // Update existing documentation section
          docContent = this.updateDocumentationSection(
            docContent,
            change.name,
            change.jsdoc,
            change.docSection,
          );
          
          result.changes.push({
            type: 'updated',
            name: change.name,
            description: `Updated documentation for ${change.name}`,
          });
        } else if (change.type === 'jsdoc-new') {
          // Add new documentation section
          docContent = this.addDocumentationSection(
            docContent,
            change.jsdoc,
          );
          
          result.changes.push({
            type: 'added',
            name: change.name,
            description: `Added documentation for ${change.name}`,
          });
        }
      }
      
      // Write updated documentation
      if (docContent !== backup) {
        await fs.writeFile(docPath, docContent);
      }
      
    } catch (error) {
      result.success = false;
      result.error = error.message;
    }
    
    return result;
  }

  findDocumentationSection(docContent, name, type) {
    // Look for section headers that match the function/class name
    const patterns = [
      new RegExp(`^#+\\s*${name}\\s*$`, 'gm'),
      new RegExp(`^#+\\s*\\W?${name}\\(`, 'gm'),
      new RegExp(`^#+\\s*class\\s+${name}`, 'gm'),
      new RegExp(`^#+\\s*function\\s+${name}`, 'gm'),
    ];
    
    for (const pattern of patterns) {
      const match = pattern.exec(docContent);
      if (match) {
        // Extract section content
        const startIndex = match.index;
        const headerLevel = match[0].match(/^#+/)[0].length;
        
        // Find end of section (next header of same or higher level)
        const endPattern = new RegExp(`^#{1,${headerLevel}}\\s`, 'gm');
        endPattern.lastIndex = startIndex + match[0].length;
        
        const endMatch = endPattern.exec(docContent);
        const endIndex = endMatch ? endMatch.index : docContent.length;
        
        return {
          startIndex,
          endIndex,
          content: docContent.substring(startIndex, endIndex),
          headerLevel,
        };
      }
    }
    
    return null;
  }

  updateDocumentationSection(docContent, name, jsdoc, docSection) {
    // Generate updated documentation
    const updatedSection = this.generateDocumentationSection(jsdoc, docSection.headerLevel);
    
    // Replace the section
    return docContent.substring(0, docSection.startIndex) +
           updatedSection +
           docContent.substring(docSection.endIndex);
  }

  addDocumentationSection(docContent, jsdoc) {
    // Find appropriate place to add the new section
    const sectionHeader = this.generateDocumentationSection(jsdoc, 3);
    
    // Try to find a suitable location (e.g., after "## API" or "## Functions")
    const apiMatch = /^##\s*(API|Functions|Methods)/gm.exec(docContent);
    
    if (apiMatch) {
      // Find the end of the API section
      const nextSectionMatch = /^#{1,2}\s/gm.exec(
        docContent.substring(apiMatch.index + apiMatch[0].length),
      );
      
      const insertIndex = nextSectionMatch ? 
        apiMatch.index + apiMatch[0].length + nextSectionMatch.index :
        docContent.length;
      
      return docContent.substring(0, insertIndex) +
             '\n\n' + sectionHeader +
             docContent.substring(insertIndex);
    } else {
      // Append to end
      return docContent + '\n\n## API\n\n' + sectionHeader;
    }
  }

  generateDocumentationSection(jsdoc, headerLevel = 3) {
    const header = '#'.repeat(headerLevel);
    let section = `${header} ${jsdoc.name}\n\n`;
    
    if (jsdoc.description) {
      section += `${jsdoc.description}\n\n`;
    }
    
    if (jsdoc.params.length > 0) {
      section += '**Parameters:**\n';
      for (const param of jsdoc.params) {
        section += `- \`${param.name}\``;
        if (param.type) section += ` _{${param.type}}_`;
        if (param.description) section += ` - ${param.description}`;
        section += '\n';
      }
      section += '\n';
    }
    
    if (jsdoc.returns) {
      section += '**Returns:**\n';
      if (jsdoc.returns.type) section += `_{${jsdoc.returns.type}}_ `;
      section += jsdoc.returns.description + '\n\n';
    }
    
    if (jsdoc.examples.length > 0) {
      section += '**Examples:**\n';
      for (const example of jsdoc.examples) {
        section += '```javascript\n';
        section += example + '\n';
        section += '```\n\n';
      }
    }
    
    return section;
  }

  async detectMarkdownChanges(codePath, docPath) {
    // Detect changes that affect markdown documentation
    const changes = [];
    
    try {
      const codeContent = await fs.readFile(codePath, 'utf-8');
      const docContent = await fs.readFile(docPath, 'utf-8');
      
      // Check for command pattern changes in tasks
      if (codePath.endsWith('.md') && codePath.includes('tasks')) {
        const commandPattern = this.extractCommandPattern(codeContent);
        const docCommandPattern = this.extractCommandPattern(docContent);
        
        if (commandPattern && docCommandPattern && commandPattern !== docCommandPattern) {
          changes.push({
            type: 'command-pattern',
            oldPattern: docCommandPattern,
            newPattern: commandPattern,
          });
        }
      }
      
      // Check for implementation changes
      const codeBlocks = this.extractCodeBlocks(docContent);
      for (const block of codeBlocks) {
        if (block.language === 'javascript' || block.language === 'typescript') {
          // Check if code block references actual implementation
          const referenced = this.findReferencedCode(block.code, codeContent);
          if (referenced && referenced.changed) {
            changes.push({
              type: 'code-block',
              block,
              referenced,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error detecting markdown changes: ${error.message}`);
    }
    
    return changes;
  }

  async syncMarkdown(codePath, docPath, changes, options = {}) {
    const result = {
      changes: [],
      success: true,
    };
    
    try {
      let docContent = await fs.readFile(docPath, 'utf-8');
      const backup = docContent;
      
      for (const change of changes) {
        if (change.type === 'command-pattern') {
          // Update command pattern
          docContent = docContent.replace(
            change.oldPattern,
            change.newPattern,
          );
          
          result.changes.push({
            type: 'command-pattern',
            description: 'Updated command pattern',
          });
        } else if (change.type === 'code-block') {
          // Update code block
          docContent = this.updateCodeBlock(
            docContent,
            change.block,
            change.referenced.newCode,
          );
          
          result.changes.push({
            type: 'code-block',
            description: 'Updated code example',
          });
        }
      }
      
      if (docContent !== backup) {
        await fs.writeFile(docPath, docContent);
      }
      
    } catch (error) {
      result.success = false;
      result.error = error.message;
    }
    
    return result;
  }

  extractCommandPattern(content) {
    const match = content.match(/^\*[\w-]+(?:\s+<[^>]+>)*(?:\s+\[[^\]]+\])*/m);
    return match ? match[0] : null;
  }

  extractCodeBlocks(content) {
    const blocks = [];
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim(),
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        fullMatch: match[0],
      });
    }
    
    return blocks;
  }

  updateCodeBlock(docContent, block, newCode) {
    const newBlock = '```' + block.language + '\n' + newCode + '\n```';
    
    return docContent.substring(0, block.startIndex) +
           newBlock +
           docContent.substring(block.endIndex);
  }

  async detectSchemaChanges(codePath, docPath) {
    // Detect changes in YAML/JSON schemas
    const changes = [];
    
    if (!codePath.endsWith('.yaml') && !codePath.endsWith('.yml') && !codePath.endsWith('.json')) {
      return changes;
    }
    
    try {
      const schemaContent = await fs.readFile(codePath, 'utf-8');
      const docContent = await fs.readFile(docPath, 'utf-8');
      
      // Parse schema
      const schema = codePath.endsWith('.json') ? 
        JSON.parse(schemaContent) :
        yaml.load(schemaContent);
      
      // Find schema documentation
      if (docPath.endsWith('.md')) {
        // Look for schema tables or descriptions in markdown
        const schemaTables = this.extractSchemaTables(docContent);
        const schemaFields = this.extractSchemaFields(schema);
        
        // Compare fields
        for (const field of schemaFields) {
          const documented = schemaTables.find(t => t.fields.includes(field.name));
          if (!documented) {
            changes.push({
              type: 'schema-field-new',
              field,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error detecting schema changes: ${error.message}`);
    }
    
    return changes;
  }

  async syncSchema(codePath, docPath, changes, options = {}) {
    const result = {
      changes: [],
      success: true,
    };
    
    try {
      let docContent = await fs.readFile(docPath, 'utf-8');
      const backup = docContent;
      
      for (const change of changes) {
        if (change.type === 'schema-field-new') {
          // Add new field to documentation
          docContent = this.addSchemaFieldDoc(docContent, change.field);
          
          result.changes.push({
            type: 'schema-field',
            description: `Added documentation for field: ${change.field.name}`,
          });
        }
      }
      
      if (docContent !== backup) {
        await fs.writeFile(docPath, docContent);
      }
      
    } catch (error) {
      result.success = false;
      result.error = error.message;
    }
    
    return result;
  }

  extractSchemaFields(schema, prefix = '') {
    const fields = [];
    
    function traverse(obj, path) {
      for (const [key, value] of Object.entries(obj)) {
        const fieldPath = path ? `${path}.${key}` : key;
        
        fields.push({
          name: key,
          path: fieldPath,
          type: typeof value,
          required: obj.required?.includes(key),
          description: value.description || '',
        });
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          if (!value.type || value.properties) {
            traverse(value.properties || value, fieldPath);
          }
        }
      }
    }
    
    traverse(schema.properties || schema, prefix);
    return fields;
  }

  async detectAPIChanges(codePath, docPath) {
    // Detect API endpoint changes
    const changes = [];
    
    try {
      const codeContent = await fs.readFile(codePath, 'utf-8');
      
      // Look for Express/Koa route definitions
      const routes = this.extractAPIRoutes(codeContent);
      
      if (routes.length > 0) {
        const docContent = await fs.readFile(docPath, 'utf-8');
        const documentedRoutes = this.extractDocumentedRoutes(docContent);
        
        // Compare routes
        for (const route of routes) {
          const documented = documentedRoutes.find(
            r => r.method === route.method && r.path === route.path,
          );
          
          if (!documented) {
            changes.push({
              type: 'api-route-new',
              route,
            });
          } else if (this.routeChanged(route, documented)) {
            changes.push({
              type: 'api-route-update',
              route,
              documented,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error detecting API changes: ${error.message}`);
    }
    
    return changes;
  }

  extractAPIRoutes(codeContent) {
    const routes = [];
    
    // Express pattern: app.get('/path', ...)
    const expressPattern = /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = expressPattern.exec(codeContent)) !== null) {
      routes.push({
        method: match[1].toUpperCase(),
        path: match[2],
        lineNumber: codeContent.substring(0, match.index).split('\n').length,
      });
    }
    
    // Router pattern: router.get('/path', ...)
    const routerPattern = /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    
    while ((match = routerPattern.exec(codeContent)) !== null) {
      routes.push({
        method: match[1].toUpperCase(),
        path: match[2],
        lineNumber: codeContent.substring(0, match.index).split('\n').length,
      });
    }
    
    return routes;
  }

  async syncAPI(codePath, docPath, changes, options = {}) {
    const result = {
      changes: [],
      success: true,
    };
    
    try {
      let docContent = await fs.readFile(docPath, 'utf-8');
      const backup = docContent;
      
      for (const change of changes) {
        if (change.type === 'api-route-new') {
          // Add new route documentation
          docContent = this.addAPIRouteDoc(docContent, change.route);
          
          result.changes.push({
            type: 'api-route',
            description: `Added documentation for ${change.route.method} ${change.route.path}`,
          });
        } else if (change.type === 'api-route-update') {
          // Update existing route documentation
          docContent = this.updateAPIRouteDoc(
            docContent,
            change.route,
            change.documented,
          );
          
          result.changes.push({
            type: 'api-route',
            description: `Updated documentation for ${change.route.method} ${change.route.path}`,
          });
        }
      }
      
      if (docContent !== backup) {
        await fs.writeFile(docPath, docContent);
      }
      
    } catch (error) {
      result.success = false;
      result.error = error.message;
    }
    
    return result;
  }

  async detectExampleChanges(codePath, docPath) {
    // Detect changes in code examples
    const changes = [];
    
    try {
      const docContent = await fs.readFile(docPath, 'utf-8');
      const codeBlocks = this.extractCodeBlocks(docContent);
      
      for (const block of codeBlocks) {
        if (block.code.includes('// Example') || block.code.includes('// Usage')) {
          // Check if example is still valid
          const validation = await this.validateExample(block.code, codePath);
          
          if (!validation.valid) {
            changes.push({
              type: 'example-invalid',
              block,
              validation,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error detecting example changes: ${error.message}`);
    }
    
    return changes;
  }

  async syncExamples(codePath, docPath, changes, options = {}) {
    const result = {
      changes: [],
      success: true,
    };
    
    try {
      let docContent = await fs.readFile(docPath, 'utf-8');
      const backup = docContent;
      
      for (const change of changes) {
        if (change.type === 'example-invalid') {
          // Update invalid example
          const updatedExample = await this.updateExample(
            change.block.code,
            change.validation,
          );
          
          if (updatedExample) {
            docContent = this.updateCodeBlock(
              docContent,
              change.block,
              updatedExample,
            );
            
            result.changes.push({
              type: 'example',
              description: 'Updated code example',
            });
          }
        }
      }
      
      if (docContent !== backup) {
        await fs.writeFile(docPath, docContent);
      }
      
    } catch (error) {
      result.success = false;
      result.error = error.message;
    }
    
    return result;
  }

  async validateExample(exampleCode, referencedFile) {
    const validation = {
      valid: true,
      errors: [],
      warnings: [],
    };
    
    try {
      // Parse the example
      const ast = parser.parse(exampleCode, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
        errorRecovery: true,
      });
      
      // Check for undefined references
      const referencedCode = await fs.readFile(referencedFile, 'utf-8');
      
      traverse(ast, {
        Identifier(path) {
          const name = path.node.name;
          
          // Check if identifier exists in referenced file
          if (!referencedCode.includes(name)) {
            validation.warnings.push({
              type: 'undefined-reference',
              name,
              line: path.node.loc?.start.line,
            });
          }
        },
      });
      
      if (validation.errors.length > 0) {
        validation.valid = false;
      }
      
    } catch (error) {
      validation.valid = false;
      validation.errors.push({
        type: 'parse-error',
        message: error.message,
      });
    }
    
    return validation;
  }

  async startAutoSync() {
    this.syncInterval = setInterval(async () => {
      try {
        await this.checkForChanges();
      } catch (error) {
        this.emit('error', { phase: 'auto-sync', error });
      }
    }, this.options.syncInterval);
  }

  async checkForChanges() {
    const changes = [];
    
    for (const [componentPath, component] of this.syncedComponents) {
      try {
        const stats = await fs.stat(componentPath);
        const lastModified = stats.mtime.toISOString();
        
        if (!component.lastSync || lastModified > component.lastSync) {
          // Component changed since last sync
          const syncResult = await this.synchronizeComponent(componentPath);
          
          if (syncResult.length > 0) {
            changes.push({
              componentPath,
              syncResult,
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to check component: ${componentPath}`, error);
      }
    }
    
    if (changes.length > 0) {
      this.emit('auto-sync', { changes });
    }
  }

  async generateSyncReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalComponents: this.syncedComponents.size,
        totalDocumentation: this.documentationIndex.size,
        syncHistory: this.syncHistory.length,
        lastSync: this.syncHistory[this.syncHistory.length - 1]?.timestamp,
      },
      components: [],
      documentation: [],
      recentSync: this.syncHistory.slice(-10),
    };
    
    // Component details
    for (const [path, component] of this.syncedComponents) {
      report.components.push({
        path: path.replace(this.rootPath, '.'),
        docPath: component.docPath.replace(this.rootPath, '.'),
        type: component.type,
        lastSync: component.lastSync,
        strategies: component.syncStrategies,
      });
    }
    
    // Documentation details
    for (const [path, doc] of this.documentationIndex) {
      report.documentation.push({
        path: path.replace(this.rootPath, '.'),
        title: doc.metadata.title,
        linkedComponents: doc.linkedComponents.length,
        lastSync: doc.lastSync,
      });
    }
    
    return report;
  }

  async exists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  compareJSDocWithDoc(jsdoc, docSection) {
    // Simple comparison - could be made more sophisticated
    const docText = docSection.content.toLowerCase();
    const jsdocText = JSON.stringify(jsdoc).toLowerCase();
    
    // Check if key information is missing
    const differences = [];
    
    if (jsdoc.params.length > 0) {
      for (const param of jsdoc.params) {
        if (!docText.includes(param.name.toLowerCase())) {
          differences.push({ type: 'missing-param', param: param.name });
        }
      }
    }
    
    if (jsdoc.returns && !docText.includes('return')) {
      differences.push({ type: 'missing-returns' });
    }
    
    return differences.length > 0 ? differences : null;
  }

  findReferencedCode(codeBlock, actualCode) {
    // Try to find the code block in the actual implementation
    const normalizedBlock = codeBlock.replace(/\s+/g, ' ').trim();
    const normalizedActual = actualCode.replace(/\s+/g, ' ');
    
    if (normalizedActual.includes(normalizedBlock)) {
      return { changed: false };
    }
    
    // Try to find similar code (this is simplified)
    const blockLines = codeBlock.split('\n').filter(l => l.trim());
    let matchCount = 0;
    
    for (const line of blockLines) {
      if (actualCode.includes(line.trim())) {
        matchCount++;
      }
    }
    
    const matchRatio = matchCount / blockLines.length;
    
    if (matchRatio < 0.8) {
      return {
        changed: true,
        matchRatio,
        newCode: this.findSimilarCode(codeBlock, actualCode),
      };
    }
    
    return { changed: false };
  }

  findSimilarCode(codeBlock, actualCode) {
    // This is a placeholder - real implementation would use more sophisticated matching
    return codeBlock;
  }

  extractSchemaTables(markdown) {
    const tables = [];
    const tableRegex = /\|(.+)\|[\s\S]+?\|(.+)\|/g;
    
    let match;
    while ((match = tableRegex.exec(markdown)) !== null) {
      // Simple table extraction - could be improved
      tables.push({
        content: match[0],
        fields: [], // Would need to parse table properly
      });
    }
    
    return tables;
  }

  addSchemaFieldDoc(docContent, field) {
    // Find schema documentation section
    const schemaSection = /^##\s*Schema/m.exec(docContent);
    
    if (schemaSection) {
      // Add to existing schema section
      const insertion = `\n- \`${field.name}\` _(${field.type})_ - ${field.description || 'No description'}${field.required ? ' **Required**' : ''}`;
      
      return docContent.substring(0, schemaSection.index + schemaSection[0].length) +
             insertion +
             docContent.substring(schemaSection.index + schemaSection[0].length);
    } else {
      // Add new schema section
      return docContent + '\n\n## Schema\n\n' +
             `- \`${field.name}\` _(${field.type})_ - ${field.description || 'No description'}${field.required ? ' **Required**' : ''}`;
    }
  }

  extractDocumentedRoutes(docContent) {
    const routes = [];
    
    // Look for API documentation patterns
    // Example: ### GET /api/users
    const routePattern = /^###\s*(GET|POST|PUT|DELETE|PATCH)\s+([^\s]+)/gm;
    let match;
    
    while ((match = routePattern.exec(docContent)) !== null) {
      routes.push({
        method: match[1],
        path: match[2],
        startIndex: match.index,
      });
    }
    
    return routes;
  }

  routeChanged(route, documented) {
    // Simple comparison - could check parameters, responses, etc.
    return false;
  }

  addAPIRouteDoc(docContent, route) {
    // Find API section
    const apiSection = /^##\s*API/m.exec(docContent);
    
    const routeDoc = `\n\n### ${route.method} ${route.path}\n\n` +
                    'Description of the endpoint.\n\n' +
                    '**Parameters:**\n' +
                    '- None\n\n' +
                    '**Response:**\n' +
                    '```json\n{\n  // Response structure\n}\n```\n';
    
    if (apiSection) {
      // Find insertion point
      const nextSection = /^##\s/m.exec(
        docContent.substring(apiSection.index + apiSection[0].length),
      );
      
      const insertIndex = nextSection ? 
        apiSection.index + apiSection[0].length + nextSection.index :
        docContent.length;
      
      return docContent.substring(0, insertIndex) +
             routeDoc +
             docContent.substring(insertIndex);
    } else {
      // Add API section
      return docContent + '\n\n## API\n' + routeDoc;
    }
  }

  updateAPIRouteDoc(docContent, route, documented) {
    // This would update existing route documentation
    // For now, just return unchanged
    return docContent;
  }

  updateExample(exampleCode, validation) {
    // This would fix the example based on validation errors
    // For now, just return the original
    return exampleCode;
  }

  async scanForReadme(dir, files, readmeNames) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isFile() && readmeNames.includes(entry.name)) {
          files.push(fullPath);
        } else if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await this.scanForReadme(fullPath, files, readmeNames);
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  async scanForInlineDocs(dir, files) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'docs') {
          await this.scanForInlineDocs(fullPath, files);
        } else if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.toLowerCase().startsWith('readme')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

module.exports = DocumentationSynchronizer;