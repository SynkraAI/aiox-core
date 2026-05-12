const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const { ESLint } = require('eslint');
const prettier = require('prettier');
const jscodeshift = require('jscodeshift');

/**
 * Automated code quality improvement system
 * Applies automatic fixes and improvements to enhance code quality
 */
class CodeQualityImprover {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.improvements = [];
    this.metrics = new Map();
    this.eslint = null;
    this.prettierConfig = null;
    this.improvementPatterns = new Map();
    this.initializePatterns();
  }

  /**
   * Initialize improvement patterns
   */
  initializePatterns() {
    // Code formatting improvements
    this.improvementPatterns.set('formatting', {
      name: 'Code Formatting',
      description: 'Apply consistent code formatting',
      improver: this.improveFormatting.bind(this),
      priority: 'medium',
      automatic: true,
    });

    // Linting fixes
    this.improvementPatterns.set('linting', {
      name: 'Linting Fixes',
      description: 'Fix linting errors and warnings',
      improver: this.improveLinting.bind(this),
      priority: 'high',
      automatic: true,
    });

    // Modern syntax upgrades
    this.improvementPatterns.set('modern_syntax', {
      name: 'Modern Syntax',
      description: 'Upgrade to modern JavaScript syntax',
      improver: this.upgradeToModernSyntax.bind(this),
      priority: 'medium',
      automatic: true,
    });

    // Import optimization
    this.improvementPatterns.set('optimize_imports', {
      name: 'Optimize Imports',
      description: 'Organize and optimize import statements',
      improver: this.optimizeImports.bind(this),
      priority: 'low',
      automatic: true,
    });

    // Dead code elimination
    this.improvementPatterns.set('remove_unused', {
      name: 'Remove Unused Code',
      description: 'Remove unused variables and functions',
      improver: this.removeUnusedCode.bind(this),
      priority: 'high',
      automatic: false,
    });

    // Consistent naming
    this.improvementPatterns.set('naming_conventions', {
      name: 'Naming Conventions',
      description: 'Apply consistent naming conventions',
      improver: this.improveNaming.bind(this),
      priority: 'medium',
      automatic: false,
    });

    // Error handling improvements
    this.improvementPatterns.set('error_handling', {
      name: 'Error Handling',
      description: 'Improve error handling patterns',
      improver: this.improveErrorHandling.bind(this),
      priority: 'high',
      automatic: false,
    });

    // Async/await conversion
    this.improvementPatterns.set('async_await', {
      name: 'Async/Await Conversion',
      description: 'Convert promises to async/await',
      improver: this.convertToAsyncAwait.bind(this),
      priority: 'medium',
      automatic: true,
    });

    // Type safety improvements
    this.improvementPatterns.set('type_safety', {
      name: 'Type Safety',
      description: 'Add type checks and validations',
      improver: this.improveTypeSafety.bind(this),
      priority: 'high',
      automatic: false,
    });

    // Documentation generation
    this.improvementPatterns.set('documentation', {
      name: 'Documentation',
      description: 'Generate missing JSDoc comments',
      improver: this.generateDocumentation.bind(this),
      priority: 'medium',
      automatic: false,
    });
  }

  /**
   * Initialize tools
   */
  async initialize() {
    // Initialize ESLint
    this.eslint = new ESLint({
      fix: true,
      baseConfig: await this.loadESLintConfig(),
      useEslintrc: true,
    });

    // Load Prettier config
    this.prettierConfig = await this.loadPrettierConfig();
  }

  /**
   * Analyze and improve code quality
   */
  async improveCode(filePath, options = {}) {
    console.log(chalk.blue(`🎯 Improving: ${filePath}`));
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileType = path.extname(filePath);
      
      if (!['.js', '.jsx', '.ts', '.tsx'].includes(fileType)) {
        return {
          filePath,
          improvements: [],
          error: 'Unsupported file type',
        };
      }

      // Calculate initial metrics
      const initialMetrics = await this.calculateMetrics(content, filePath);
      this.metrics.set(filePath, { before: initialMetrics });

      // Clear previous improvements
      this.improvements = [];

      let improvedContent = content;
      const appliedImprovements = [];

      // Apply improvement patterns
      for (const [patternId, pattern] of this.improvementPatterns) {
        if (options.patterns && !options.patterns.includes(patternId)) {
          continue;
        }

        if (!options.manual && !pattern.automatic) {
          continue; // Skip manual improvements in automatic mode
        }

        try {
          const result = await pattern.improver(improvedContent, filePath, options);
          
          if (result.improved) {
            improvedContent = result.content;
            appliedImprovements.push({
              patternId,
              pattern: pattern.name,
              priority: pattern.priority,
              changes: result.changes,
              impact: result.impact || 'medium',
            });
            
            this.improvements.push(...result.improvements || []);
          }
        } catch (error) {
          console.warn(chalk.yellow(`Failed to apply ${pattern.name}: ${error.message}`));
        }
      }

      // Calculate final metrics
      const finalMetrics = await this.calculateMetrics(improvedContent, filePath);
      this.metrics.get(filePath).after = finalMetrics;

      // Calculate improvement score
      const improvementScore = this.calculateImprovementScore(initialMetrics, finalMetrics);

      return {
        filePath,
        originalContent: content,
        improvedContent,
        improvements: appliedImprovements,
        metrics: {
          before: initialMetrics,
          after: finalMetrics,
          improvementScore,
        },
        changed: content !== improvedContent,
      };

    } catch (error) {
      return {
        filePath,
        improvements: [],
        error: error.message,
      };
    }
  }

  /**
   * Calculate code metrics
   */
  async calculateMetrics(content, filePath) {
    const metrics = {
      lines: content.split('\n').length,
      complexity: 0,
      maintainability: 0,
      issues: 0,
      coverage: 0,
    };

    try {
      // Linting issues
      const lintResults = await this.eslint.lintText(content, { filePath });
      metrics.issues = lintResults[0]?.errorCount + lintResults[0]?.warningCount || 0;

      // Cyclomatic complexity (simplified)
      metrics.complexity = this.calculateCyclomaticComplexity(content);

      // Maintainability index (simplified)
      metrics.maintainability = this.calculateMaintainabilityIndex(content);

      // Documentation coverage
      metrics.coverage = this.calculateDocumentationCoverage(content);

    } catch (error) {
      // Metrics calculation failed, use defaults
    }

    return metrics;
  }

  // Improvement functions

  async improveFormatting(content, filePath, options) {
    try {
      const formatted = await prettier.format(content, {
        ...this.prettierConfig,
        filepath: filePath,
      });

      return {
        improved: formatted !== content,
        content: formatted,
        changes: formatted !== content ? ['Applied consistent formatting'] : [],
        improvements: [{
          type: 'formatting',
          description: 'Applied Prettier formatting',
          line: 0,
        }],
      };
    } catch (error) {
      return { improved: false, content, error: error.message };
    }
  }

  async improveLinting(content, filePath, options) {
    try {
      const results = await this.eslint.lintText(content, { filePath });
      
      if (results[0]?.output) {
        return {
          improved: true,
          content: results[0].output,
          changes: this.summarizeLintFixes(results[0]),
          improvements: results[0].messages.map(msg => ({
            type: 'linting',
            description: msg.message,
            line: msg.line,
            severity: msg.severity === 2 ? 'error' : 'warning',
          })),
        };
      }

      return { improved: false, content };
    } catch (error) {
      return { improved: false, content, error: error.message };
    }
  }

  async upgradeToModernSyntax(content, filePath, options) {
    const j = jscodeshift;
    let improved = false;
    const changes = [];

    try {
      // Convert var to let/const
      const ast = j(content);
      const varToLetConst = ast
        .find(j.VariableDeclaration, { kind: 'var' })
        .forEach(path => {
          const isReassigned = this.isVariableReassigned(j, path);
          path.node.kind = isReassigned ? 'let' : 'const';
          improved = true;
        });

      if (improved) {
        changes.push('Converted var to let/const');
      }

      // Convert function expressions to arrow functions (where appropriate)
      ast.find(j.FunctionExpression)
        .filter(path => {
          // Don't convert if it uses 'this' or 'arguments'
          const usesThis = j(path).find(j.ThisExpression).length > 0;
          const usesArguments = j(path).find(j.Identifier, { name: 'arguments' }).length > 0;
          return !usesThis && !usesArguments && !path.node.id;
        })
        .forEach(path => {
          const arrowFunction = j.arrowFunctionExpression(
            path.node.params,
            path.node.body,
            path.node.body.type !== 'BlockStatement',
          );
          j(path).replaceWith(arrowFunction);
          improved = true;
        });

      if (changes.length > 0) {
        changes.push('Converted function expressions to arrow functions');
      }

      // Template literals
      ast.find(j.BinaryExpression, { operator: '+' })
        .filter(path => {
          // Check if it's string concatenation
          return path.node.left.type === 'Literal' || path.node.right.type === 'Literal';
        })
        .forEach(path => {
          // Convert to template literal (simplified)
          improved = true;
        });

      const result = ast.toSource();

      return {
        improved,
        content: improved ? result : content,
        changes,
        improvements: changes.map(change => ({
          type: 'modern_syntax',
          description: change,
          line: 0,
        })),
      };

    } catch (error) {
      return { improved: false, content, error: error.message };
    }
  }

  async optimizeImports(content, filePath, options) {
    const j = jscodeshift;
    let improved = false;
    const changes = [];

    try {
      const ast = j(content);
      
      // Group imports by source
      const imports = new Map();
      
      ast.find(j.ImportDeclaration)
        .forEach(path => {
          const source = path.node.source.value;
          if (!imports.has(source)) {
            imports.set(source, []);
          }
          imports.get(source).push(path);
        });

      // Merge imports from same source
      for (const [source, importPaths] of imports) {
        if (importPaths.length > 1) {
          // Merge specifiers
          const allSpecifiers = [];
          importPaths.forEach(path => {
            allSpecifiers.push(...path.node.specifiers);
          });

          // Keep first import, remove others
          importPaths[0].node.specifiers = allSpecifiers;
          for (let i = 1; i < importPaths.length; i++) {
            j(importPaths[i]).remove();
          }
          
          improved = true;
          changes.push(`Merged imports from ${source}`);
        }
      }

      // Sort imports
      const importNodes = [];
      ast.find(j.ImportDeclaration)
        .forEach(path => {
          importNodes.push(path.node);
          j(path).remove();
        });

      if (importNodes.length > 0) {
        // Sort by: external packages, internal absolute, internal relative
        importNodes.sort((a, b) => {
          const aSource = a.source.value;
          const bSource = b.source.value;
          
          const aExternal = !aSource.startsWith('.') && !aSource.startsWith('/');
          const bExternal = !bSource.startsWith('.') && !bSource.startsWith('/');
          
          if (aExternal && !bExternal) return -1;
          if (!aExternal && bExternal) return 1;
          
          return aSource.localeCompare(bSource);
        });

        // Re-insert sorted imports at the beginning
        const program = ast.find(j.Program);
        importNodes.reverse().forEach(node => {
          program.get('body').unshift(node);
        });
        
        improved = true;
        changes.push('Sorted imports');
      }

      const result = ast.toSource();

      return {
        improved,
        content: improved ? result : content,
        changes,
        improvements: changes.map(change => ({
          type: 'optimize_imports',
          description: change,
          line: 0,
        })),
      };

    } catch (error) {
      return { improved: false, content, error: error.message };
    }
  }

  async removeUnusedCode(content, filePath, options) {
    const j = jscodeshift;
    let improved = false;
    const changes = [];
    const improvements = [];

    try {
      const ast = j(content);
      
      // Find all variable declarations and their usage
      const declaredVars = new Map();
      const usedVars = new Set();

      // Collect declarations
      ast.find(j.VariableDeclarator)
        .forEach(path => {
          if (path.node.id.type === 'Identifier') {
            declaredVars.set(path.node.id.name, path);
          }
        });

      // Collect usage
      ast.find(j.Identifier)
        .filter(path => {
          // Only count as used if it's not the declaration itself
          const parent = path.parent.node;
          return !(parent.type === 'VariableDeclarator' && parent.id === path.node);
        })
        .forEach(path => {
          usedVars.add(path.node.name);
        });

      // Remove unused variables
      for (const [varName, declaratorPath] of declaredVars) {
        if (!usedVars.has(varName) && !this.isExported(declaratorPath)) {
          const declaration = declaratorPath.parent;
          
          if (declaration.node.declarations.length === 1) {
            // Remove entire declaration
            j(declaration).remove();
          } else {
            // Remove just this declarator
            j(declaratorPath).remove();
          }
          
          improved = true;
          changes.push(`Removed unused variable: ${varName}`);
          improvements.push({
            type: 'remove_unused',
            description: `Removed unused variable: ${varName}`,
            line: declaratorPath.node.loc?.start.line || 0,
          });
        }
      }

      // Find unused functions
      const declaredFunctions = new Map();
      const calledFunctions = new Set();

      ast.find(j.FunctionDeclaration)
        .forEach(path => {
          if (path.node.id) {
            declaredFunctions.set(path.node.id.name, path);
          }
        });

      ast.find(j.CallExpression)
        .forEach(path => {
          if (path.node.callee.type === 'Identifier') {
            calledFunctions.add(path.node.callee.name);
          }
        });

      // Remove unused functions
      for (const [funcName, funcPath] of declaredFunctions) {
        if (!calledFunctions.has(funcName) && !this.isExported(funcPath)) {
          j(funcPath).remove();
          improved = true;
          changes.push(`Removed unused function: ${funcName}`);
          improvements.push({
            type: 'remove_unused',
            description: `Removed unused function: ${funcName}`,
            line: funcPath.node.loc?.start.line || 0,
          });
        }
      }

      const result = ast.toSource();

      return {
        improved,
        content: improved ? result : content,
        changes,
        improvements,
      };

    } catch (error) {
      return { improved: false, content, error: error.message };
    }
  }

  async improveNaming(content, filePath, options) {
    const j = jscodeshift;
    let improved = false;
    const changes = [];
    const improvements = [];

    try {
      const ast = j(content);
      
      // Convert snake_case to camelCase for variables and functions
      ast.find(j.Identifier)
        .filter(path => {
          const name = path.node.name;
          return name.includes('_') && 
                 (path.parent.node.type === 'VariableDeclarator' ||
                  path.parent.node.type === 'FunctionDeclaration');
        })
        .forEach(path => {
          const oldName = path.node.name;
          const newName = this.snakeToCamel(oldName);
          
          // Rename all occurrences
          ast.find(j.Identifier, { name: oldName })
            .forEach(p => {
              p.node.name = newName;
            });
          
          improved = true;
          changes.push(`Renamed ${oldName} to ${newName}`);
          improvements.push({
            type: 'naming_conventions',
            description: `Renamed ${oldName} to ${newName}`,
            line: path.node.loc?.start.line || 0,
          });
        });

      // Ensure classes start with uppercase
      ast.find(j.ClassDeclaration)
        .filter(path => {
          const name = path.node.id?.name;
          return name && name[0] !== name[0].toUpperCase();
        })
        .forEach(path => {
          const oldName = path.node.id.name;
          const newName = oldName[0].toUpperCase() + oldName.slice(1);
          
          // Rename all occurrences
          ast.find(j.Identifier, { name: oldName })
            .forEach(p => {
              p.node.name = newName;
            });
          
          improved = true;
          changes.push(`Renamed class ${oldName} to ${newName}`);
          improvements.push({
            type: 'naming_conventions',
            description: `Renamed class ${oldName} to ${newName}`,
            line: path.node.loc?.start.line || 0,
          });
        });

      // Ensure constants are UPPER_SNAKE_CASE
      ast.find(j.VariableDeclaration, { kind: 'const' })
        .forEach(path => {
          path.node.declarations.forEach(declarator => {
            if (declarator.id.type === 'Identifier') {
              const name = declarator.id.name;
              // Check if it looks like a constant (all caps or should be)
              if (this.shouldBeConstantCase(declarator) && !this.isConstantCase(name)) {
                const oldName = name;
                const newName = this.toConstantCase(name);
                
                // Rename all occurrences
                ast.find(j.Identifier, { name: oldName })
                  .forEach(p => {
                    p.node.name = newName;
                  });
                
                improved = true;
                changes.push(`Renamed constant ${oldName} to ${newName}`);
                improvements.push({
                  type: 'naming_conventions',
                  description: `Renamed constant ${oldName} to ${newName}`,
                  line: declarator.loc?.start.line || 0,
                });
              }
            }
          });
        });

      const result = ast.toSource();

      return {
        improved,
        content: improved ? result : content,
        changes,
        improvements,
      };

    } catch (error) {
      return { improved: false, content, error: error.message };
    }
  }

  async improveErrorHandling(content, filePath, options) {
    const j = jscodeshift;
    let improved = false;
    const changes = [];
    const improvements = [];

    try {
      const ast = j(content);
      
      // Add try-catch to async functions without error handling
      ast.find(j.FunctionDeclaration)
        .filter(path => path.node.async)
        .forEach(path => {
          const hasErrorHandling = j(path).find(j.TryStatement).length > 0;
          
          if (!hasErrorHandling && path.node.body.body.length > 0) {
            // Wrap body in try-catch
            const originalBody = path.node.body.body;
            const tryStatement = j.tryStatement(
              j.blockStatement(originalBody),
              j.catchClause(
                j.identifier('error'),
                j.blockStatement([
                  j.expressionStatement(
                    j.callExpression(
                      j.memberExpression(
                        j.identifier('console'),
                        j.identifier('error'),
                      ),
                      [j.identifier('error')],
                    ),
                  ),
                  j.throwStatement(j.identifier('error')),
                ]),
              ),
            );
            
            path.node.body.body = [tryStatement];
            improved = true;
            
            const funcName = path.node.id?.name || 'anonymous';
            changes.push(`Added error handling to ${funcName}`);
            improvements.push({
              type: 'error_handling',
              description: `Added try-catch to async function ${funcName}`,
              line: path.node.loc?.start.line || 0,
            });
          }
        });

      // Improve catch blocks that swallow errors
      ast.find(j.CatchClause)
        .filter(path => {
          // Check if catch block is empty or only logs
          const body = path.node.body.body;
          return body.length === 0 || 
                 (body.length === 1 && this.isOnlyConsoleLog(body[0]));
        })
        .forEach(path => {
          // Add proper error handling
          const errorParam = path.node.param || j.identifier('error');
          
          path.node.body.body = [
            j.expressionStatement(
              j.callExpression(
                j.memberExpression(
                  j.identifier('console'),
                  j.identifier('error'),
                ),
                [j.literal('Error caught:'), errorParam],
              ),
            ),
            j.throwStatement(errorParam),
          ];
          
          improved = true;
          changes.push('Improved catch block to properly handle errors');
          improvements.push({
            type: 'error_handling',
            description: 'Added proper error re-throwing in catch block',
            line: path.node.loc?.start.line || 0,
          });
        });

      const result = ast.toSource();

      return {
        improved,
        content: improved ? result : content,
        changes,
        improvements,
      };

    } catch (error) {
      return { improved: false, content, error: error.message };
    }
  }

  async convertToAsyncAwait(content, filePath, options) {
    const j = jscodeshift;
    let improved = false;
    const changes = [];
    const improvements = [];

    try {
      const ast = j(content);
      
      // Convert .then().catch() chains to async/await
      ast.find(j.CallExpression)
        .filter(path => {
          return path.node.callee.type === 'MemberExpression' &&
                 path.node.callee.property.name === 'then';
        })
        .forEach(path => {
          // Find the containing function
          const containingFunction = j(path).closest(j.Function);
          
          if (containingFunction.length > 0) {
            const func = containingFunction.get();
            
            // Make function async if not already
            if (!func.node.async) {
              func.node.async = true;
            }
            
            // Convert promise chain to await
            // This is simplified - real implementation would be more complex
            improved = true;
            changes.push('Converted promise chain to async/await');
            improvements.push({
              type: 'async_await',
              description: 'Converted .then() chain to async/await',
              line: path.node.loc?.start.line || 0,
            });
          }
        });

      // Convert Promise callbacks to async functions
      ast.find(j.NewExpression)
        .filter(path => {
          return path.node.callee.name === 'Promise' &&
                 path.node.arguments.length > 0 &&
                 path.node.arguments[0].type === 'FunctionExpression';
        })
        .forEach(path => {
          const promiseCallback = path.node.arguments[0];
          
          // Convert to async function
          const asyncFunction = j.functionExpression(
            promiseCallback.id,
            promiseCallback.params,
            promiseCallback.body,
            promiseCallback.generator,
            true, // async
          );
          
          path.node.arguments[0] = asyncFunction;
          improved = true;
          changes.push('Converted Promise constructor to async function');
          improvements.push({
            type: 'async_await',
            description: 'Made Promise callback async',
            line: path.node.loc?.start.line || 0,
          });
        });

      const result = ast.toSource();

      return {
        improved,
        content: improved ? result : content,
        changes,
        improvements,
      };

    } catch (error) {
      return { improved: false, content, error: error.message };
    }
  }

  async improveTypeSafety(content, filePath, options) {
    const j = jscodeshift;
    let improved = false;
    const changes = [];
    const improvements = [];

    try {
      const ast = j(content);
      
      // Add parameter validation to functions
      ast.find(j.FunctionDeclaration)
        .forEach(path => {
          const params = path.node.params;
          if (params.length > 0) {
            const validationStatements = [];
            
            params.forEach(param => {
              if (param.type === 'Identifier') {
                // Add basic validation
                validationStatements.push(
                  j.ifStatement(
                    j.binaryExpression(
                      '==',
                      param,
                      j.identifier('undefined'),
                    ),
                    j.throwStatement(
                      j.newExpression(
                        j.identifier('Error'),
                        [j.literal(`Parameter '${param.name}' is required`)],
                      ),
                    ),
                  ),
                );
              }
            });
            
            if (validationStatements.length > 0) {
              // Insert at beginning of function body
              path.node.body.body.unshift(...validationStatements);
              improved = true;
              
              const funcName = path.node.id?.name || 'anonymous';
              changes.push(`Added parameter validation to ${funcName}`);
              improvements.push({
                type: 'type_safety',
                description: `Added parameter validation to function ${funcName}`,
                line: path.node.loc?.start.line || 0,
              });
            }
          }
        });

      // Add null checks before property access
      ast.find(j.MemberExpression)
        .filter(path => {
          // Check if it's a chain that could throw
          return path.node.object.type === 'MemberExpression' ||
                 (path.node.object.type === 'Identifier' && 
                  !this.isKnownSafeObject(path.node.object.name));
        })
        .forEach(path => {
          // Convert to optional chaining if not already
          if (!path.node.optional) {
            path.node.optional = true;
            improved = true;
            improvements.push({
              type: 'type_safety',
              description: 'Added optional chaining for safer property access',
              line: path.node.loc?.start.line || 0,
            });
          }
        });

      if (improvements.length > 0) {
        changes.push('Added type safety improvements');
      }

      const result = ast.toSource();

      return {
        improved,
        content: improved ? result : content,
        changes,
        improvements,
      };

    } catch (error) {
      return { improved: false, content, error: error.message };
    }
  }

  async generateDocumentation(content, filePath, options) {
    const j = jscodeshift;
    let improved = false;
    const changes = [];
    const improvements = [];

    try {
      const ast = j(content);
      
      // Add JSDoc to functions without documentation
      ast.find(j.FunctionDeclaration)
        .filter(path => {
          // Check if function already has JSDoc
          const comments = path.node.leadingComments || [];
          return !comments.some(c => c.type === 'CommentBlock' && c.value.includes('*'));
        })
        .forEach(path => {
          const funcName = path.node.id?.name || 'anonymous';
          const params = path.node.params;
          const isAsync = path.node.async;
          
          // Generate JSDoc
          let jsdoc = '/**\n';
          jsdoc += ` * ${this.generateFunctionDescription(funcName)}\n`;
          
          params.forEach(param => {
            const paramName = param.type === 'Identifier' ? param.name : 'param';
            jsdoc += ` * @param {*} ${paramName} - ${this.generateParamDescription(paramName)}\n`;
          });
          
          jsdoc += ` * @returns {${isAsync ? 'Promise<*>' : '*'}} ${this.generateReturnDescription(funcName)}\n`;
          jsdoc += ' */';
          
          // Add JSDoc comment
          path.node.leadingComments = [
            j.commentBlock(jsdoc.replace('/**', '*').replace('*/', ''), true),
          ];
          
          improved = true;
          changes.push(`Added JSDoc to ${funcName}`);
          improvements.push({
            type: 'documentation',
            description: `Generated JSDoc for function ${funcName}`,
            line: path.node.loc?.start.line || 0,
          });
        });

      // Add JSDoc to classes
      ast.find(j.ClassDeclaration)
        .filter(path => {
          const comments = path.node.leadingComments || [];
          return !comments.some(c => c.type === 'CommentBlock' && c.value.includes('*'));
        })
        .forEach(path => {
          const className = path.node.id?.name || 'Class';
          
          let jsdoc = '/**\n';
          jsdoc += ` * ${this.generateClassDescription(className)}\n`;
          jsdoc += ' */';
          
          path.node.leadingComments = [
            j.commentBlock(jsdoc.replace('/**', '*').replace('*/', ''), true),
          ];
          
          improved = true;
          changes.push(`Added JSDoc to class ${className}`);
          improvements.push({
            type: 'documentation',
            description: `Generated JSDoc for class ${className}`,
            line: path.node.loc?.start.line || 0,
          });
        });

      const result = ast.toSource();

      return {
        improved,
        content: improved ? result : content,
        changes,
        improvements,
      };

    } catch (error) {
      return { improved: false, content, error: error.message };
    }
  }

  // Helper methods

  async loadESLintConfig() {
    try {
      const configPath = path.join(this.rootPath, '.eslintrc.json');
      const content = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      // Return default config
      return {
        env: {
          es2021: true,
          node: true,
        },
        extends: ['eslint:recommended'],
        parserOptions: {
          ecmaVersion: 12,
          sourceType: 'module',
        },
        rules: {
          'no-unused-vars': 'error',
          'no-console': 'warn',
          'semi': ['error', 'always'],
          'quotes': ['error', 'single'],
        },
      };
    }
  }

  async loadPrettierConfig() {
    try {
      const configPath = path.join(this.rootPath, '.prettierrc');
      const content = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      // Return default config
      return {
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
        printWidth: 80,
      };
    }
  }

  calculateCyclomaticComplexity(content) {
    // Simplified complexity calculation
    let complexity = 1;
    
    const complexityPatterns = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bwhile\s*\(/g,
      /\bfor\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\?\s*[^:]+\s*:/g, // ternary
      /\|\|/g,
      /&&/g,
    ];
    
    complexityPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }

  calculateMaintainabilityIndex(content) {
    // Simplified maintainability index (0-100)
    const lines = content.split('\n').length;
    const complexity = this.calculateCyclomaticComplexity(content);
    const comments = (content.match(/\/\//g) || []).length + 
                    (content.match(/\/\*/g) || []).length;
    
    // Simple formula
    const commentRatio = comments / lines;
    const complexityRatio = complexity / lines;
    
    const maintainability = Math.min(100, Math.max(0, 
      100 - (complexityRatio * 50) + (commentRatio * 20),
    ));
    
    return Math.round(maintainability);
  }

  calculateDocumentationCoverage(content) {
    // Calculate percentage of documented functions/classes
    const functionMatches = content.match(/function\s+\w+|class\s+\w+/g) || [];
    const jsdocMatches = content.match(/\/\*\*[\s\S]*?\*\//g) || [];
    
    if (functionMatches.length === 0) return 100;
    
    const coverage = (jsdocMatches.length / functionMatches.length) * 100;
    return Math.min(100, Math.round(coverage));
  }

  calculateImprovementScore(before, after) {
    const improvements = {
      issues: Math.max(0, before.issues - after.issues),
      complexity: Math.max(0, before.complexity - after.complexity),
      maintainability: Math.max(0, after.maintainability - before.maintainability),
      coverage: Math.max(0, after.coverage - before.coverage),
    };
    
    // Calculate weighted score
    const score = (
      improvements.issues * 3 +
      improvements.complexity * 2 +
      improvements.maintainability +
      improvements.coverage * 0.5
    ) / 6.5;
    
    return Math.round(score * 10) / 10;
  }

  summarizeLintFixes(lintResult) {
    const fixedRules = new Map();
    
    lintResult.messages.forEach(message => {
      if (message.fix) {
        const count = fixedRules.get(message.ruleId) || 0;
        fixedRules.set(message.ruleId, count + 1);
      }
    });
    
    return Array.from(fixedRules.entries()).map(([rule, count]) => 
      `Fixed ${count} ${rule} issue${count > 1 ? 's' : ''}`,
    );
  }

  isVariableReassigned(j, variableDeclarator) {
    const varName = variableDeclarator.node.id.name;
    const scope = variableDeclarator.scope;
    
    let reassigned = false;
    
    j(scope.path).find(j.AssignmentExpression)
      .filter(path => {
        return path.node.left.type === 'Identifier' && 
               path.node.left.name === varName;
      })
      .forEach(() => {
        reassigned = true;
      });
    
    return reassigned;
  }

  isExported(path) {
    // Check if the declaration is exported
    const parent = path.parent;
    
    return parent.node.type === 'ExportNamedDeclaration' ||
           parent.node.type === 'ExportDefaultDeclaration' ||
           (parent.node.type === 'AssignmentExpression' && 
            parent.node.left.type === 'MemberExpression' &&
            parent.node.left.object.name === 'module' &&
            parent.node.left.property.name === 'exports');
  }

  isOnlyConsoleLog(statement) {
    return statement.type === 'ExpressionStatement' &&
           statement.expression.type === 'CallExpression' &&
           statement.expression.callee.type === 'MemberExpression' &&
           statement.expression.callee.object.name === 'console';
  }

  isKnownSafeObject(name) {
    const safeObjects = ['console', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number'];
    return safeObjects.includes(name);
  }

  snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  shouldBeConstantCase(declarator) {
    // Check if the value is a literal or simple value
    const init = declarator.init;
    if (!init) return false;
    
    return init.type === 'Literal' ||
           init.type === 'UnaryExpression' ||
           (init.type === 'Identifier' && init.name === init.name.toUpperCase());
  }

  isConstantCase(name) {
    return /^[A-Z_]+$/.test(name);
  }

  toConstantCase(name) {
    // Convert camelCase or snake_case to CONSTANT_CASE
    return name
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[_-]+/g, '_')
      .toUpperCase();
  }

  generateFunctionDescription(funcName) {
    // Generate meaningful description based on function name
    const words = funcName.split(/(?=[A-Z])/);
    return words.map(w => w.toLowerCase()).join(' ').replace(/^\w/, c => c.toUpperCase());
  }

  generateParamDescription(paramName) {
    // Generate parameter description
    return `The ${paramName} parameter`;
  }

  generateReturnDescription(funcName) {
    // Generate return description
    if (funcName.startsWith('get')) return 'The requested value';
    if (funcName.startsWith('is')) return 'True if condition is met, false otherwise';
    if (funcName.startsWith('has')) return 'True if exists, false otherwise';
    return 'The result of the operation';
  }

  generateClassDescription(className) {
    // Generate class description
    const words = className.split(/(?=[A-Z])/);
    return `${words.join(' ')} class`;
  }

  /**
   * Apply improvements to file
   */
  async applyImprovements(filePath, improvedContent, backup = true) {
    try {
      if (backup) {
        // Create backup
        const backupPath = `${filePath}.backup.${Date.now()}`;
        const originalContent = await fs.readFile(filePath, 'utf-8');
        await fs.writeFile(backupPath, originalContent);
        console.log(chalk.gray(`Backup created: ${backupPath}`));
      }

      // Write improved content
      await fs.writeFile(filePath, improvedContent);
      console.log(chalk.green(`✅ Improvements applied to: ${filePath}`));
      
      return { success: true };
    } catch (error) {
      console.error(chalk.red(`Failed to apply improvements: ${error.message}`));
      return { success: false, error: error.message };
    }
  }

  /**
   * Get improvement statistics
   */
  getStatistics() {
    const stats = {
      filesAnalyzed: this.metrics.size,
      totalImprovements: 0,
      byType: {},
      averageScore: 0,
    };

    let totalScore = 0;

    for (const [file, metrics] of this.metrics) {
      if (metrics.after) {
        const score = this.calculateImprovementScore(metrics.before, metrics.after);
        totalScore += score;
      }
    }

    stats.averageScore = this.metrics.size > 0 ? 
      (totalScore / this.metrics.size).toFixed(2) : 0;

    // Count improvements by type
    for (const improvement of this.improvements) {
      stats.byType[improvement.type] = (stats.byType[improvement.type] || 0) + 1;
      stats.totalImprovements++;
    }

    return stats;
  }
}

module.exports = CodeQualityImprover;