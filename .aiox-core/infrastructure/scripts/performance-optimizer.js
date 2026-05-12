/**
 * AIOX Performance Optimizer
 * 
 * Analyzes code for performance bottlenecks and suggests optimizations
 * to improve runtime performance, memory usage, and scalability.
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const { performance } = require('perf_hooks');

class PerformanceOptimizer extends EventEmitter {
  constructor(options = {}) {
    super();
    this.rootPath = options.rootPath || process.cwd();
    this.optimizationPatterns = new Map();
    this.performanceMetrics = new Map();
    this.optimizationHistory = [];
    this.options = {
      enableProfiling: options.enableProfiling !== false,
      profileDuration: options.profileDuration || 5000, // 5 seconds
      memoryThreshold: options.memoryThreshold || 100 * 1024 * 1024, // 100MB
      timeThreshold: options.timeThreshold || 1000, // 1 second
      complexityThreshold: options.complexityThreshold || 10,
      ...options,
    };
    
    this.initializeOptimizationPatterns();
  }

  initializeOptimizationPatterns() {
    // Algorithm optimizations
    this.optimizationPatterns.set('algorithm_complexity', {
      name: 'Algorithm Complexity',
      description: 'Optimize algorithms with high time complexity',
      detector: this.detectHighComplexityAlgorithms.bind(this),
      optimizer: this.suggestAlgorithmOptimizations.bind(this),
      impact: 'high',
      category: 'algorithm',
    });

    // Loop optimizations
    this.optimizationPatterns.set('loop_optimization', {
      name: 'Loop Optimization',
      description: 'Optimize nested loops and inefficient iterations',
      detector: this.detectIneffientLoops.bind(this),
      optimizer: this.suggestLoopOptimizations.bind(this),
      impact: 'high',
      category: 'algorithm',
    });

    // Memory optimizations
    this.optimizationPatterns.set('memory_usage', {
      name: 'Memory Usage',
      description: 'Reduce memory consumption and prevent leaks',
      detector: this.detectMemoryIssues.bind(this),
      optimizer: this.suggestMemoryOptimizations.bind(this),
      impact: 'medium',
      category: 'memory',
    });

    // Async optimizations
    this.optimizationPatterns.set('async_operations', {
      name: 'Async Operations',
      description: 'Optimize async/await patterns and Promise usage',
      detector: this.detectAsyncIssues.bind(this),
      optimizer: this.suggestAsyncOptimizations.bind(this),
      impact: 'high',
      category: 'async',
    });

    // Caching opportunities
    this.optimizationPatterns.set('caching', {
      name: 'Caching Opportunities',
      description: 'Identify opportunities for memoization and caching',
      detector: this.detectCachingOpportunities.bind(this),
      optimizer: this.suggestCachingStrategies.bind(this),
      impact: 'medium',
      category: 'caching',
    });

    // Database query optimizations
    this.optimizationPatterns.set('database_queries', {
      name: 'Database Query Optimization',
      description: 'Optimize database queries and reduce N+1 problems',
      detector: this.detectDatabaseIssues.bind(this),
      optimizer: this.suggestDatabaseOptimizations.bind(this),
      impact: 'high',
      category: 'database',
    });

    // Bundle size optimizations
    this.optimizationPatterns.set('bundle_size', {
      name: 'Bundle Size',
      description: 'Reduce JavaScript bundle size',
      detector: this.detectBundleSizeIssues.bind(this),
      optimizer: this.suggestBundleOptimizations.bind(this),
      impact: 'medium',
      category: 'bundle',
    });

    // React-specific optimizations
    this.optimizationPatterns.set('react_performance', {
      name: 'React Performance',
      description: 'Optimize React component rendering',
      detector: this.detectReactIssues.bind(this),
      optimizer: this.suggestReactOptimizations.bind(this),
      impact: 'medium',
      category: 'framework',
    });

    // String operation optimizations
    this.optimizationPatterns.set('string_operations', {
      name: 'String Operations',
      description: 'Optimize string concatenation and manipulation',
      detector: this.detectStringIssues.bind(this),
      optimizer: this.suggestStringOptimizations.bind(this),
      impact: 'low',
      category: 'algorithm',
    });

    // Object operation optimizations
    this.optimizationPatterns.set('object_operations', {
      name: 'Object Operations',
      description: 'Optimize object creation and manipulation',
      detector: this.detectObjectIssues.bind(this),
      optimizer: this.suggestObjectOptimizations.bind(this),
      impact: 'medium',
      category: 'memory',
    });
  }

  async analyzePerformance(filePath, options = {}) {
    const startTime = performance.now();
    const analysis = {
      filePath,
      timestamp: new Date().toISOString(),
      issues: [],
      suggestions: [],
      metrics: {},
    };

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Parse the code
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy'],
        errorRecovery: true,
      });

      // Run static analysis
      await this.performStaticAnalysis(ast, analysis, content);
      
      // Run pattern detection
      const patterns = options.patterns || Array.from(this.optimizationPatterns.keys());
      
      for (const patternName of patterns) {
        const pattern = this.optimizationPatterns.get(patternName);
        if (!pattern) continue;
        
        try {
          const issues = await pattern.detector(ast, content, filePath);
          
          if (issues && issues.length > 0) {
            for (const issue of issues) {
              const suggestion = await pattern.optimizer(issue, ast, content);
              
              analysis.issues.push({
                pattern: patternName,
                category: pattern.category,
                impact: pattern.impact,
                ...issue,
              });
              
              if (suggestion) {
                analysis.suggestions.push({
                  pattern: patternName,
                  issueId: issue.id || `${patternName}-${analysis.issues.length}`,
                  ...suggestion,
                });
              }
            }
          }
        } catch (error) {
          console.warn(`Pattern detection failed for ${patternName}:`, error);
        }
      }

      // Calculate performance score
      analysis.metrics.performanceScore = this.calculatePerformanceScore(analysis);
      analysis.metrics.analysisTime = performance.now() - startTime;

      // Run runtime profiling if enabled and applicable
      if (this.options.enableProfiling && this.isExecutable(filePath)) {
        const runtimeMetrics = await this.profileRuntime(filePath);
        analysis.metrics.runtime = runtimeMetrics;
      }

      this.emit('analyzed', analysis);
      return analysis;

    } catch (error) {
      analysis.error = error.message;
      this.emit('error', { phase: 'analysis', error, filePath });
      return analysis;
    }
  }

  async performStaticAnalysis(ast, analysis, content) {
    const metrics = {
      complexity: 0,
      functionCount: 0,
      loopDepth: 0,
      asyncOperations: 0,
      stringOperations: 0,
      objectOperations: 0,
      arrayOperations: 0,
      domOperations: 0,
      fileSize: content.length,
      lineCount: content.split('\n').length,
    };

    let currentLoopDepth = 0;
    let maxLoopDepth = 0;

    traverse(ast, {
      FunctionDeclaration(path) {
        metrics.functionCount++;
        metrics.complexity += calculateCyclomaticComplexity(path.node);
      },
      FunctionExpression(path) {
        metrics.functionCount++;
        metrics.complexity += calculateCyclomaticComplexity(path.node);
      },
      ArrowFunctionExpression(path) {
        metrics.functionCount++;
        metrics.complexity += calculateCyclomaticComplexity(path.node);
      },
      'ForStatement|WhileStatement|DoWhileStatement|ForInStatement|ForOfStatement': {
        enter() {
          currentLoopDepth++;
          maxLoopDepth = Math.max(maxLoopDepth, currentLoopDepth);
          metrics.loopDepth = maxLoopDepth;
        },
        exit() {
          currentLoopDepth--;
        },
      },
      AwaitExpression() {
        metrics.asyncOperations++;
      },
      BinaryExpression(path) {
        if (path.node.operator === '+' && 
            (t.isStringLiteral(path.node.left) || t.isStringLiteral(path.node.right))) {
          metrics.stringOperations++;
        }
      },
      TemplateLiteral() {
        metrics.stringOperations++;
      },
      ObjectExpression() {
        metrics.objectOperations++;
      },
      ArrayExpression() {
        metrics.arrayOperations++;
      },
      CallExpression(path) {
        const callee = path.node.callee;
        
        // Check for DOM operations
        if (t.isMemberExpression(callee)) {
          const object = callee.object;
          const property = callee.property;
          
          if (t.isIdentifier(object, { name: 'document' }) ||
              (t.isIdentifier(property) && ['querySelector', 'getElementById', 'getElementsBy'].some(m => property.name.startsWith(m)))) {
            metrics.domOperations++;
          }
        }
      },
    });

    analysis.metrics.static = metrics;

    function calculateCyclomaticComplexity(node) {
      let complexity = 1;
      
      traverse(node, {
        'IfStatement|ConditionalExpression|SwitchCase|WhileStatement|DoWhileStatement|ForStatement': {
          enter() {
            complexity++;
          },
        },
        LogicalExpression(path) {
          if (path.node.operator === '&&' || path.node.operator === '||') {
            complexity++;
          }
        },
      }, null, { noScope: true });
      
      return complexity;
    }
  }

  async detectHighComplexityAlgorithms(ast, content) {
    const issues = [];
    const self = this;

    traverse(ast, {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
    });

    function checkFunction(path) {
      const complexity = calculateTimeComplexity(path.node);
      
      if (complexity.score > self.options.complexityThreshold) {
        issues.push({
          type: 'high_complexity',
          location: {
            start: path.node.loc?.start,
            end: path.node.loc?.end,
          },
          functionName: path.node.id?.name || '<anonymous>',
          complexity: complexity,
          description: `Function has high time complexity: ${complexity.notation}`,
          severity: complexity.score > 15 ? 'critical' : 'warning',
        });
      }
    }

    function calculateTimeComplexity(node) {
      let loopDepth = 0;
      let maxLoopDepth = 0;
      let recursiveCall = false;
      let exponentialPatterns = 0;
      
      traverse(node, {
        'ForStatement|WhileStatement|DoWhileStatement|ForInStatement|ForOfStatement': {
          enter(path) {
            loopDepth++;
            maxLoopDepth = Math.max(maxLoopDepth, loopDepth);
            
            // Check for exponential patterns
            if (loopDepth > 1 && isNestedLoopOverSameData(path)) {
              exponentialPatterns++;
            }
          },
          exit() {
            loopDepth--;
          },
        },
        CallExpression(path) {
          // Check for recursive calls
          if (t.isIdentifier(path.node.callee) && 
              path.node.callee.name === node.id?.name) {
            recursiveCall = true;
          }
          
          // Check for expensive operations
          if (t.isMemberExpression(path.node.callee)) {
            const property = path.node.callee.property;
            if (t.isIdentifier(property) && 
                ['sort', 'reverse', 'includes', 'indexOf'].includes(property.name)) {
              // These can be expensive in loops
              if (loopDepth > 0) exponentialPatterns++;
            }
          }
        },
      }, null, { noScope: true });
      
      // Calculate complexity score and notation
      let score = maxLoopDepth * 5;
      let notation = 'O(1)';
      
      if (recursiveCall) {
        score += 10;
        notation = exponentialPatterns > 0 ? 'O(2^n)' : 'O(n)';
      } else if (maxLoopDepth === 1) {
        notation = 'O(n)';
      } else if (maxLoopDepth === 2) {
        notation = exponentialPatterns > 0 ? 'O(n³)' : 'O(n²)';
      } else if (maxLoopDepth >= 3) {
        notation = `O(n^${maxLoopDepth})`;
      }
      
      if (exponentialPatterns > 0) {
        score += exponentialPatterns * 5;
      }
      
      return { score, notation, loopDepth: maxLoopDepth, hasRecursion: recursiveCall };
    }

    function isNestedLoopOverSameData(path) {
      // Simplified check - would need more sophisticated analysis
      return false;
    }

    return issues;
  }

  async suggestAlgorithmOptimizations(issue, ast, content) {
    const suggestions = [];
    
    if (issue.complexity.loopDepth >= 2) {
      suggestions.push({
        type: 'algorithm_optimization',
        description: 'Consider using a more efficient algorithm',
        recommendations: [
          'Use hash maps/Set for lookups instead of nested loops',
          'Consider sorting data first if searching frequently',
          'Use dynamic programming for overlapping subproblems',
          'Consider using binary search for sorted data',
        ],
        example: this.generateOptimizationExample(issue.complexity),
      });
    }
    
    if (issue.complexity.hasRecursion) {
      suggestions.push({
        type: 'recursion_optimization',
        description: 'Optimize recursive algorithm',
        recommendations: [
          'Add memoization to cache results',
          'Convert to iterative approach if possible',
          'Implement tail recursion optimization',
          'Add base case optimization',
        ],
      });
    }
    
    return {
      optimizations: suggestions,
      estimatedImprovement: this.estimatePerformanceImprovement(issue),
      priority: issue.severity === 'critical' ? 'high' : 'medium',
    };
  }

  async detectIneffientLoops(ast, content) {
    const issues = [];
    
    traverse(ast, {
      'ForStatement|WhileStatement|DoWhileStatement|ForInStatement|ForOfStatement'(path) {
        // Check for array operations in loops
        const loopIssues = [];
        
        path.traverse({
          CallExpression(innerPath) {
            if (t.isMemberExpression(innerPath.node.callee)) {
              const property = innerPath.node.callee.property;
              
              // Check for inefficient array methods in loops
              if (t.isIdentifier(property)) {
                if (['push', 'unshift'].includes(property.name)) {
                  loopIssues.push({
                    type: 'array_growth_in_loop',
                    method: property.name,
                    description: 'Growing array in loop can cause performance issues',
                  });
                }
                
                if (['concat', 'slice'].includes(property.name)) {
                  loopIssues.push({
                    type: 'array_copy_in_loop',
                    method: property.name,
                    description: 'Creating array copies in loop is inefficient',
                  });
                }
                
                if (['find', 'filter', 'map', 'reduce'].includes(property.name)) {
                  // Check if this is nested iteration
                  const parentLoop = innerPath.findParent(p => 
                    p.isForStatement() || p.isWhileStatement() || p.isDoWhileStatement(),
                  );
                  
                  if (parentLoop && parentLoop !== path) {
                    loopIssues.push({
                      type: 'nested_iteration',
                      method: property.name,
                      description: 'Nested iteration can lead to O(n²) complexity',
                    });
                  }
                }
              }
            }
          },
          BinaryExpression(innerPath) {
            // Check for string concatenation in loops
            if (innerPath.node.operator === '+' && 
                innerPath.isAncestor(path) &&
                (t.isStringLiteral(innerPath.node.left) || t.isStringLiteral(innerPath.node.right))) {
              loopIssues.push({
                type: 'string_concatenation_in_loop',
                description: 'String concatenation in loop is inefficient',
              });
            }
          },
        });
        
        if (loopIssues.length > 0) {
          issues.push({
            type: 'inefficient_loop',
            location: {
              start: path.node.loc?.start,
              end: path.node.loc?.end,
            },
            problems: loopIssues,
            description: 'Loop contains inefficient operations',
          });
        }
      },
    });
    
    return issues;
  }

  async suggestLoopOptimizations(issue) {
    const optimizations = [];
    
    for (const problem of issue.problems) {
      switch (problem.type) {
        case 'array_growth_in_loop':
          optimizations.push({
            type: 'preallocate_array',
            description: 'Preallocate array with known size',
            code: 'const result = new Array(knownSize);',
            improvement: 'Avoids dynamic array resizing',
          });
          break;
          
        case 'array_copy_in_loop':
          optimizations.push({
            type: 'avoid_copies',
            description: 'Work with original array or use single copy',
            improvement: 'Reduces memory allocation and copying',
          });
          break;
          
        case 'nested_iteration':
          optimizations.push({
            type: 'use_lookup',
            description: 'Use Set or Map for O(1) lookups',
            code: 'const lookup = new Set(array2);\nfor (const item of array1) {\n  if (lookup.has(item)) { ... }\n}',
            improvement: 'Reduces complexity from O(n²) to O(n)',
          });
          break;
          
        case 'string_concatenation_in_loop':
          optimizations.push({
            type: 'use_array_join',
            description: 'Use array push and join',
            code: 'const parts = [];\nfor (...) { parts.push(str); }\nconst result = parts.join(\'\');',
            improvement: 'Avoids creating intermediate strings',
          });
          break;
      }
    }
    
    return {
      optimizations,
      priority: issue.problems.some(p => p.type === 'nested_iteration') ? 'high' : 'medium',
    };
  }

  async detectMemoryIssues(ast, content) {
    const issues = [];
    
    traverse(ast, {
      VariableDeclarator(path) {
        // Check for potential memory leaks
        if (t.isIdentifier(path.node.id)) {
          const binding = path.scope.getBinding(path.node.id.name);
          
          // Check if variable holds large data
          if (t.isArrayExpression(path.node.init) && 
              path.node.init.elements.length > 1000) {
            issues.push({
              type: 'large_array',
              variableName: path.node.id.name,
              size: path.node.init.elements.length,
              location: path.node.loc,
              description: 'Large array allocation',
            });
          }
          
          // Check for potential closures holding references
          if (binding && !binding.referenced) {
            path.traverse({
              FunctionExpression(innerPath) {
                if (innerPath.node.id?.name || innerPath.parent.type === 'VariableDeclarator') {
                  issues.push({
                    type: 'potential_closure_leak',
                    variableName: path.node.id.name,
                    location: innerPath.node.loc,
                    description: 'Closure may retain reference to large object',
                  });
                }
              },
            });
          }
        }
      },
      CallExpression(path) {
        // Check for common memory-intensive operations
        if (t.isMemberExpression(path.node.callee)) {
          const object = path.node.callee.object;
          const property = path.node.callee.property;
          
          // Check for potential memory issues
          if (t.isIdentifier(property)) {
            if (property.name === 'slice' && path.node.arguments.length === 0) {
              issues.push({
                type: 'unnecessary_copy',
                method: 'slice',
                location: path.node.loc,
                description: 'Creating unnecessary array copy',
              });
            }
            
            if (property.name === 'concat' && isInLoop(path)) {
              issues.push({
                type: 'concat_in_loop',
                location: path.node.loc,
                description: 'Concatenating arrays in loop creates many intermediate arrays',
              });
            }
          }
        }
      },
    });
    
    function isInLoop(path) {
      return path.findParent(p => 
        p.isForStatement() || p.isWhileStatement() || p.isDoWhileStatement(),
      );
    }
    
    return issues;
  }

  async suggestMemoryOptimizations(issue) {
    const optimizations = [];
    
    switch (issue.type) {
      case 'large_array':
        optimizations.push({
          type: 'lazy_loading',
          description: 'Consider lazy loading or pagination',
          recommendation: 'Load data in chunks as needed',
        });
        optimizations.push({
          type: 'typed_array',
          description: 'Use TypedArray for numeric data',
          code: `const data = new Float32Array(${issue.size});`,
          improvement: 'More memory efficient for numbers',
        });
        break;
        
      case 'potential_closure_leak':
        optimizations.push({
          type: 'cleanup_references',
          description: 'Clear references when no longer needed',
          code: `${issue.variableName} = null; // Clear reference`,
          improvement: 'Allows garbage collection',
        });
        break;
        
      case 'unnecessary_copy':
        optimizations.push({
          type: 'avoid_copy',
          description: 'Use original array if not modifying',
          improvement: 'Saves memory and copying time',
        });
        break;
        
      case 'concat_in_loop':
        optimizations.push({
          type: 'use_push_spread',
          description: 'Use push with spread operator',
          code: 'result.push(...newItems);',
          improvement: 'Modifies array in place',
        });
        break;
    }
    
    return {
      optimizations,
      estimatedMemorySaving: this.estimateMemorySaving(issue),
    };
  }

  async detectAsyncIssues(ast, content) {
    const issues = [];
    
    traverse(ast, {
      AwaitExpression(path) {
        // Check for sequential awaits that could be parallelized
        const parent = path.getFunctionParent();
        if (!parent) return;
        
        const awaits = [];
        parent.traverse({
          AwaitExpression(innerPath) {
            awaits.push(innerPath);
          },
        });
        
        // Check for sequential independent awaits
        if (awaits.length > 1) {
          const sequentialAwaits = this.findSequentialAwaits(awaits);
          if (sequentialAwaits.length > 1) {
            issues.push({
              type: 'sequential_awaits',
              count: sequentialAwaits.length,
              location: parent.node.loc,
              description: 'Sequential awaits could be parallelized',
            });
          }
        }
      },
      CallExpression(path) {
        // Check for Promise anti-patterns
        if (t.isMemberExpression(path.node.callee)) {
          const property = path.node.callee.property;
          
          if (t.isIdentifier(property, { name: 'forEach' })) {
            // Check if forEach contains async operations
            const callback = path.node.arguments[0];
            if (t.isArrowFunctionExpression(callback) && callback.async) {
              issues.push({
                type: 'async_foreach',
                location: path.node.loc,
                description: 'forEach does not wait for async operations',
              });
            }
          }
        }
        
        // Check for Promise constructor anti-pattern
        if (t.isNewExpression(path.node) && 
            t.isIdentifier(path.node.callee, { name: 'Promise' })) {
          const executor = path.node.arguments[0];
          if (t.isFunctionExpression(executor) || t.isArrowFunctionExpression(executor)) {
            let hasAsyncOperation = false;
            
            path.traverse({
              AwaitExpression() {
                hasAsyncOperation = true;
              },
            });
            
            if (hasAsyncOperation) {
              issues.push({
                type: 'promise_constructor_antipattern',
                location: path.node.loc,
                description: 'Avoid using async/await in Promise constructor',
              });
            }
          }
        }
      },
    });
    
    return issues;
  }

  findSequentialAwaits(awaits) {
    // Simplified check - would need data flow analysis for accuracy
    const sequential = [];
    
    for (let i = 0; i < awaits.length - 1; i++) {
      const current = awaits[i];
      const next = awaits[i + 1];
      
      // Check if they're in the same block and sequential
      if (current.parent === next.parent) {
        sequential.push(current);
        if (i === awaits.length - 2) {
          sequential.push(next);
        }
      }
    }
    
    return sequential;
  }

  async suggestAsyncOptimizations(issue) {
    const optimizations = [];
    
    switch (issue.type) {
      case 'sequential_awaits':
        optimizations.push({
          type: 'parallel_execution',
          description: 'Use Promise.all for parallel execution',
          code: 'const [result1, result2] = await Promise.all([\n  asyncOperation1(),\n  asyncOperation2()\n]);',
          improvement: `Execute ${issue.count} operations in parallel`,
        });
        break;
        
      case 'async_foreach':
        optimizations.push({
          type: 'use_for_of',
          description: 'Use for...of loop for sequential async operations',
          code: 'for (const item of items) {\n  await processItem(item);\n}',
        });
        optimizations.push({
          type: 'use_promise_all',
          description: 'Use Promise.all for parallel async operations',
          code: 'await Promise.all(items.map(item => processItem(item)));',
        });
        break;
        
      case 'promise_constructor_antipattern':
        optimizations.push({
          type: 'use_async_function',
          description: 'Use async function instead of Promise constructor',
          code: 'async function operation() {\n  const result = await asyncCall();\n  return result;\n}',
        });
        break;
    }
    
    return {
      optimizations,
      priority: issue.type === 'sequential_awaits' ? 'high' : 'medium',
    };
  }

  async detectCachingOpportunities(ast, content) {
    const issues = [];
    const functionCalls = new Map();
    
    traverse(ast, {
      CallExpression(path) {
        // Track repeated function calls
        const callSignature = this.getFunctionCallSignature(path.node);
        if (callSignature) {
          if (!functionCalls.has(callSignature)) {
            functionCalls.set(callSignature, []);
          }
          functionCalls.get(callSignature).push(path);
        }
        
        // Check for expensive operations without caching
        if (t.isMemberExpression(path.node.callee)) {
          const property = path.node.callee.property;
          
          if (t.isIdentifier(property)) {
            // Check for repeated expensive operations
            if (['filter', 'map', 'reduce', 'sort'].includes(property.name)) {
              const parent = path.getFunctionParent();
              if (parent) {
                // Count similar operations in same function
                let count = 0;
                parent.traverse({
                  CallExpression(innerPath) {
                    if (this.isSimilarCall(path.node, innerPath.node)) {
                      count++;
                    }
                  },
                });
                
                if (count > 1) {
                  issues.push({
                    type: 'repeated_computation',
                    operation: property.name,
                    count,
                    location: path.node.loc,
                    description: `${property.name} called ${count} times with similar data`,
                  });
                }
              }
            }
          }
        }
      },
      FunctionDeclaration(path) {
        // Check for pure functions that could benefit from memoization
        if (this.isPureFunction(path)) {
          const complexity = this.calculateComplexity(path.node);
          if (complexity > 5) {
            issues.push({
              type: 'memoization_candidate',
              functionName: path.node.id?.name,
              complexity,
              location: path.node.loc,
              description: 'Pure function with high complexity could benefit from memoization',
            });
          }
        }
      },
    });
    
    // Check for repeated function calls
    for (const [signature, calls] of functionCalls) {
      if (calls.length > 2) {
        issues.push({
          type: 'repeated_calls',
          signature,
          count: calls.length,
          location: calls[0].node.loc,
          description: `Function called ${calls.length} times with same signature`,
        });
      }
    }
    
    return issues;
  }

  getFunctionCallSignature(node) {
    if (t.isIdentifier(node.callee)) {
      return node.callee.name;
    } else if (t.isMemberExpression(node.callee)) {
      const object = node.callee.object;
      const property = node.callee.property;
      
      if (t.isIdentifier(object) && t.isIdentifier(property)) {
        return `${object.name}.${property.name}`;
      }
    }
    return null;
  }

  isSimilarCall(call1, call2) {
    // Simplified comparison
    return this.getFunctionCallSignature(call1) === this.getFunctionCallSignature(call2);
  }

  isPureFunction(path) {
    const isPure = true;
    let hasSideEffects = false;
    
    path.traverse({
      AssignmentExpression(innerPath) {
        // Check if assignment is to external variable
        if (t.isIdentifier(innerPath.node.left)) {
          const binding = innerPath.scope.getBinding(innerPath.node.left.name);
          if (!binding || binding.scope !== path.scope) {
            hasSideEffects = true;
          }
        }
      },
      CallExpression(innerPath) {
        // Check for console.log, DOM manipulation, etc.
        const callee = innerPath.node.callee;
        if (t.isMemberExpression(callee)) {
          const object = callee.object;
          if (t.isIdentifier(object) && 
              ['console', 'document', 'window'].includes(object.name)) {
            hasSideEffects = true;
          }
        }
      },
      UpdateExpression() {
        hasSideEffects = true;
      },
    });
    
    return !hasSideEffects;
  }

  calculateComplexity(node) {
    let complexity = 1;
    
    traverse(node, {
      'IfStatement|ConditionalExpression|SwitchCase': {
        enter() {
          complexity++;
        },
      },
      'ForStatement|WhileStatement|DoWhileStatement': {
        enter() {
          complexity += 2;
        },
      },
      CallExpression() {
        complexity++;
      },
    }, null, { noScope: true });
    
    return complexity;
  }

  async suggestCachingStrategies(issue) {
    const strategies = [];
    
    switch (issue.type) {
      case 'repeated_computation':
        strategies.push({
          type: 'cache_result',
          description: 'Cache computation result',
          code: `const cached${issue.operation} = data.${issue.operation}(...);\n// Use cached result instead of recomputing`,
          improvement: `Avoid ${issue.count - 1} redundant computations`,
        });
        break;
        
      case 'memoization_candidate':
        strategies.push({
          type: 'add_memoization',
          description: 'Add memoization to function',
          code: `const memoized${issue.functionName} = memoize(${issue.functionName});`,
          improvement: 'Cache results for repeated calls with same arguments',
        });
        break;
        
      case 'repeated_calls':
        strategies.push({
          type: 'cache_calls',
          description: 'Cache function call results',
          code: 'const cache = new Map();\nfunction getCached(key) {\n  if (!cache.has(key)) {\n    cache.set(key, expensiveOperation(key));\n  }\n  return cache.get(key);\n}',
          improvement: `Reduce ${issue.count} calls to 1 + cache lookups`,
        });
        break;
    }
    
    return {
      strategies,
      estimatedImprovement: this.estimateCachingImprovement(issue),
    };
  }

  async detectDatabaseIssues(ast, content) {
    const issues = [];
    
    traverse(ast, {
      CallExpression(path) {
        // Look for database query patterns
        const callee = path.node.callee;
        
        // Check for ORM/database methods
        if (t.isMemberExpression(callee)) {
          const property = callee.property;
          
          if (t.isIdentifier(property)) {
            // Check for N+1 query patterns
            if (['find', 'findOne', 'findById', 'query', 'get'].includes(property.name)) {
              const inLoop = path.findParent(p => 
                p.isForStatement() || p.isWhileStatement() || 
                p.isDoWhileStatement() || 
                (p.isCallExpression() && t.isMemberExpression(p.node.callee) && 
                 ['forEach', 'map', 'filter'].includes(p.node.callee.property?.name)),
              );
              
              if (inLoop) {
                issues.push({
                  type: 'n_plus_one',
                  method: property.name,
                  location: path.node.loc,
                  description: 'Database query inside loop (N+1 problem)',
                });
              }
            }
            
            // Check for missing indexes
            if (property.name === 'find' || property.name === 'findOne') {
              const args = path.node.arguments;
              if (args.length > 0 && t.isObjectExpression(args[0])) {
                const fields = args[0].properties.map(p => 
                  t.isIdentifier(p.key) ? p.key.name : null,
                ).filter(Boolean);
                
                if (fields.length > 0) {
                  issues.push({
                    type: 'potential_missing_index',
                    fields,
                    location: path.node.loc,
                    description: `Query on fields: ${fields.join(', ')}`,
                  });
                }
              }
            }
          }
        }
        
        // Check for inefficient query patterns
        if (t.isIdentifier(callee) || t.isMemberExpression(callee)) {
          // Look for multiple sequential queries
          const parent = path.getFunctionParent();
          if (parent) {
            const queries = [];
            parent.traverse({
              CallExpression(innerPath) {
                if (this.isDatabaseQuery(innerPath.node)) {
                  queries.push(innerPath);
                }
              },
            });
            
            if (queries.length > 3) {
              issues.push({
                type: 'multiple_queries',
                count: queries.length,
                location: parent.node.loc,
                description: `${queries.length} database queries in single function`,
              });
            }
          }
        }
      },
    });
    
    return issues;
  }

  isDatabaseQuery(node) {
    // Simplified check - would need to identify actual database libraries
    if (t.isMemberExpression(node.callee)) {
      const property = node.callee.property;
      if (t.isIdentifier(property)) {
        return ['find', 'findOne', 'findById', 'query', 'select', 'insert', 'update', 'delete']
          .includes(property.name);
      }
    }
    return false;
  }

  async suggestDatabaseOptimizations(issue) {
    const optimizations = [];
    
    switch (issue.type) {
      case 'n_plus_one':
        optimizations.push({
          type: 'use_join',
          description: 'Use JOIN or populate to fetch related data',
          code: 'const results = await Model.find().populate(\'relatedField\');',
          improvement: 'Reduce N+1 queries to single query',
        });
        optimizations.push({
          type: 'batch_loading',
          description: 'Load all data upfront',
          code: 'const ids = items.map(item => item.id);\nconst related = await RelatedModel.find({ id: { $in: ids } });',
          improvement: 'Single query instead of N queries',
        });
        break;
        
      case 'potential_missing_index':
        optimizations.push({
          type: 'add_index',
          description: `Consider adding index on: ${issue.fields.join(', ')}`,
          code: `db.collection.createIndex({ ${issue.fields.map(f => `${f}: 1`).join(', ')} });`,
          improvement: 'Faster query execution',
        });
        break;
        
      case 'multiple_queries':
        optimizations.push({
          type: 'aggregate_queries',
          description: 'Combine multiple queries using aggregation',
          improvement: `Reduce ${issue.count} queries to fewer operations`,
        });
        optimizations.push({
          type: 'use_transactions',
          description: 'Use database transactions for consistency',
          code: 'const session = await mongoose.startSession();\nawait session.withTransaction(async () => {\n  // Multiple operations\n});',
        });
        break;
    }
    
    return {
      optimizations,
      priority: issue.type === 'n_plus_one' ? 'critical' : 'high',
    };
  }

  async detectBundleSizeIssues(ast, content) {
    const issues = [];
    const imports = new Map();
    
    traverse(ast, {
      ImportDeclaration(path) {
        const source = path.node.source.value;
        
        // Track imports
        if (!imports.has(source)) {
          imports.set(source, []);
        }
        
        // Check for large library imports
        if (this.isLargeLibrary(source)) {
          const specifiers = path.node.specifiers;
          
          if (specifiers.some(s => t.isImportNamespaceSpecifier(s))) {
            issues.push({
              type: 'namespace_import',
              library: source,
              location: path.node.loc,
              description: `Importing entire ${source} library`,
            });
          } else if (specifiers.some(s => t.isImportDefaultSpecifier(s))) {
            issues.push({
              type: 'default_import',
              library: source,
              location: path.node.loc,
              description: `Default import from ${source} may include unnecessary code`,
            });
          }
        }
        
        // Check for duplicate imports
        imports.get(source).push(path.node);
      },
      CallExpression(path) {
        // Check for dynamic imports
        if (t.isImport(path.node.callee)) {
          issues.push({
            type: 'dynamic_import',
            location: path.node.loc,
            description: 'Dynamic import found - ensure it\'s necessary',
          });
        }
        
        // Check for require() in browser code
        if (t.isIdentifier(path.node.callee, { name: 'require' })) {
          issues.push({
            type: 'commonjs_require',
            location: path.node.loc,
            description: 'CommonJS require may not tree-shake well',
          });
        }
      },
    });
    
    // Check for duplicate imports
    for (const [source, importNodes] of imports) {
      if (importNodes.length > 1) {
        issues.push({
          type: 'duplicate_imports',
          source,
          count: importNodes.length,
          description: `${source} imported ${importNodes.length} times`,
        });
      }
    }
    
    return issues;
  }

  isLargeLibrary(source) {
    const largeLibraries = [
      'lodash',
      'moment',
      'rxjs',
      'd3',
      'three',
      'antd',
      'material-ui',
      '@material-ui/core',
    ];
    
    return largeLibraries.some(lib => source.includes(lib));
  }

  async suggestBundleOptimizations(issue) {
    const optimizations = [];
    
    switch (issue.type) {
      case 'namespace_import':
        optimizations.push({
          type: 'named_imports',
          description: 'Use named imports instead of namespace import',
          code: `import { specificFunction } from '${issue.library}';`,
          improvement: 'Enable tree-shaking to reduce bundle size',
        });
        break;
        
      case 'default_import':
        if (issue.library.includes('lodash')) {
          optimizations.push({
            type: 'modular_import',
            description: 'Import specific lodash modules',
            code: 'import debounce from \'lodash/debounce\';',
            improvement: 'Import only what you need',
          });
        }
        break;
        
      case 'duplicate_imports':
        optimizations.push({
          type: 'consolidate_imports',
          description: 'Combine duplicate imports',
          code: `import { func1, func2, func3 } from '${issue.source}';`,
          improvement: 'Cleaner code and potential optimization',
        });
        break;
        
      case 'commonjs_require':
        optimizations.push({
          type: 'use_esm',
          description: 'Use ES modules for better tree-shaking',
          code: 'import module from \'module-name\';',
          improvement: 'Better optimization and tree-shaking',
        });
        break;
    }
    
    return {
      optimizations,
      estimatedSizeReduction: this.estimateBundleSizeReduction(issue),
    };
  }

  async detectReactIssues(ast, content) {
    const issues = [];
    
    // Only run React checks if React is imported
    const hasReact = content.includes('react') || content.includes('React');
    if (!hasReact) return issues;
    
    traverse(ast, {
      CallExpression(path) {
        // Check for setState in loops
        if (t.isMemberExpression(path.node.callee) && 
            t.isThisExpression(path.node.callee.object) &&
            t.isIdentifier(path.node.callee.property, { name: 'setState' })) {
          
          const inLoop = path.findParent(p => 
            p.isForStatement() || p.isWhileStatement() || p.isDoWhileStatement(),
          );
          
          if (inLoop) {
            issues.push({
              type: 'setState_in_loop',
              location: path.node.loc,
              description: 'Multiple setState calls in loop cause unnecessary re-renders',
            });
          }
        }
        
        // Check for missing React.memo
        if (t.isIdentifier(path.node.callee) || t.isMemberExpression(path.node.callee)) {
          const funcParent = path.getFunctionParent();
          if (funcParent && this.isReactComponent(funcParent)) {
            const componentName = this.getComponentName(funcParent);
            
            // Check if component is wrapped in React.memo
            const hasReactMemo = funcParent.parent?.callee?.property?.name === 'memo';
            
            if (!hasReactMemo && this.shouldMemoize(funcParent)) {
              issues.push({
                type: 'missing_memo',
                componentName,
                location: funcParent.node.loc,
                description: 'Component could benefit from React.memo',
              });
            }
          }
        }
      },
      JSXElement(path) {
        // Check for inline function props
        const openingElement = path.node.openingElement;
        
        for (const attr of openingElement.attributes) {
          if (t.isJSXAttribute(attr) && t.isJSXExpressionContainer(attr.value)) {
            const expression = attr.value.expression;
            
            if (t.isArrowFunctionExpression(expression) || t.isFunctionExpression(expression)) {
              issues.push({
                type: 'inline_function_prop',
                propName: attr.name.name,
                location: attr.loc,
                description: 'Inline function prop causes unnecessary re-renders',
              });
            }
          }
        }
      },
    });
    
    return issues;
  }

  isReactComponent(path) {
    // Check if it's a React component
    const node = path.node;
    
    // Function component
    if (t.isFunctionDeclaration(node) || t.isArrowFunctionExpression(node)) {
      // Check if returns JSX
      let returnsJSX = false;
      
      path.traverse({
        ReturnStatement(returnPath) {
          if (t.isJSXElement(returnPath.node.argument) || 
              t.isJSXFragment(returnPath.node.argument)) {
            returnsJSX = true;
          }
        },
      });
      
      return returnsJSX;
    }
    
    return false;
  }

  getComponentName(path) {
    if (t.isFunctionDeclaration(path.node)) {
      return path.node.id?.name;
    } else if (t.isVariableDeclarator(path.parent)) {
      return path.parent.id?.name;
    }
    return '<Component>';
  }

  shouldMemoize(componentPath) {
    // Simple heuristic - component with props and no side effects
    let hasProps = false;
    let hasSideEffects = false;
    
    // Check for props parameter
    const params = componentPath.node.params;
    if (params.length > 0) {
      hasProps = true;
    }
    
    // Check for side effects
    componentPath.traverse({
      CallExpression(path) {
        const callee = path.node.callee;
        if (t.isMemberExpression(callee)) {
          const object = callee.object;
          if (t.isIdentifier(object) && 
              ['console', 'document', 'window'].includes(object.name)) {
            hasSideEffects = true;
          }
        }
      },
    });
    
    return hasProps && !hasSideEffects;
  }

  async suggestReactOptimizations(issue) {
    const optimizations = [];
    
    switch (issue.type) {
      case 'setState_in_loop':
        optimizations.push({
          type: 'batch_state_updates',
          description: 'Batch state updates outside loop',
          code: 'const updates = [];\nfor (...) {\n  updates.push(...);\n}\nthis.setState({ items: updates });',
          improvement: 'Single re-render instead of multiple',
        });
        break;
        
      case 'missing_memo':
        optimizations.push({
          type: 'add_react_memo',
          description: 'Wrap component in React.memo',
          code: `const ${issue.componentName} = React.memo(function ${issue.componentName}(props) {\n  // component code\n});`,
          improvement: 'Prevent unnecessary re-renders',
        });
        break;
        
      case 'inline_function_prop':
        optimizations.push({
          type: 'use_callback',
          description: 'Use useCallback for function props',
          code: `const handle${issue.propName} = useCallback(() => {\n  // handler code\n}, [dependencies]);`,
          improvement: 'Stable function reference',
        });
        break;
    }
    
    return {
      optimizations,
      priority: 'medium',
    };
  }

  async detectStringIssues(ast, content) {
    const issues = [];
    
    traverse(ast, {
      BinaryExpression(path) {
        // Check for string concatenation in loops
        if (path.node.operator === '+') {
          const inLoop = path.findParent(p => 
            p.isForStatement() || p.isWhileStatement() || p.isDoWhileStatement(),
          );
          
          if (inLoop && (t.isStringLiteral(path.node.left) || t.isStringLiteral(path.node.right))) {
            issues.push({
              type: 'string_concat_in_loop',
              location: path.node.loc,
              description: 'String concatenation in loop is inefficient',
            });
          }
        }
      },
      CallExpression(path) {
        if (t.isMemberExpression(path.node.callee)) {
          const property = path.node.callee.property;
          
          if (t.isIdentifier(property)) {
            // Check for repeated string operations
            if (['split', 'replace', 'substring', 'substr'].includes(property.name)) {
              const parent = path.getFunctionParent();
              if (parent) {
                // Count similar operations
                let count = 0;
                parent.traverse({
                  CallExpression(innerPath) {
                    if (t.isMemberExpression(innerPath.node.callee) &&
                        innerPath.node.callee.property?.name === property.name) {
                      count++;
                    }
                  },
                });
                
                if (count > 2) {
                  issues.push({
                    type: 'repeated_string_operation',
                    operation: property.name,
                    count,
                    location: path.node.loc,
                    description: `${property.name} called ${count} times`,
                  });
                }
              }
            }
          }
        }
      },
    });
    
    return issues;
  }

  async suggestStringOptimizations(issue) {
    const optimizations = [];
    
    switch (issue.type) {
      case 'string_concat_in_loop':
        optimizations.push({
          type: 'use_array_join',
          description: 'Use array and join for string building',
          code: 'const parts = [];\nfor (...) {\n  parts.push(stringPart);\n}\nconst result = parts.join(\'\');',
          improvement: 'More efficient string concatenation',
        });
        break;
        
      case 'repeated_string_operation':
        optimizations.push({
          type: 'cache_result',
          description: `Cache ${issue.operation} result`,
          code: `const processed = str.${issue.operation}(...);\n// Reuse processed instead of calling again`,
          improvement: `Avoid ${issue.count - 1} redundant operations`,
        });
        break;
    }
    
    return {
      optimizations,
      priority: 'low',
    };
  }

  async detectObjectIssues(ast, content) {
    const issues = [];
    
    traverse(ast, {
      ObjectExpression(path) {
        // Check for large object literals
        if (path.node.properties.length > 50) {
          issues.push({
            type: 'large_object_literal',
            size: path.node.properties.length,
            location: path.node.loc,
            description: 'Large object literal may impact performance',
          });
        }
      },
      MemberExpression(path) {
        // Check for deep property access
        let depth = 0;
        let current = path.node;
        
        while (t.isMemberExpression(current)) {
          depth++;
          current = current.object;
        }
        
        if (depth > 3) {
          issues.push({
            type: 'deep_property_access',
            depth,
            location: path.node.loc,
            description: `Deep property access (${depth} levels)`,
          });
        }
      },
      CallExpression(path) {
        // Check for Object.keys/values/entries in loops
        if (t.isMemberExpression(path.node.callee)) {
          const object = path.node.callee.object;
          const property = path.node.callee.property;
          
          if (t.isIdentifier(object, { name: 'Object' }) &&
              t.isIdentifier(property) &&
              ['keys', 'values', 'entries'].includes(property.name)) {
            
            const inLoop = path.findParent(p => 
              p.isForStatement() || p.isWhileStatement() || p.isDoWhileStatement(),
            );
            
            if (inLoop) {
              issues.push({
                type: 'object_iteration_in_loop',
                method: property.name,
                location: path.node.loc,
                description: `Object.${property.name} in loop creates intermediate array`,
              });
            }
          }
        }
      },
    });
    
    return issues;
  }

  async suggestObjectOptimizations(issue) {
    const optimizations = [];
    
    switch (issue.type) {
      case 'large_object_literal':
        optimizations.push({
          type: 'use_map',
          description: 'Consider using Map for large key-value stores',
          code: 'const map = new Map([\n  [\'key1\', value1],\n  [\'key2\', value2]\n]);',
          improvement: 'Better performance for frequent updates',
        });
        break;
        
      case 'deep_property_access':
        optimizations.push({
          type: 'cache_reference',
          description: 'Cache intermediate references',
          code: 'const intermediate = obj.level1.level2;\nconst value = intermediate.level3.level4;',
          improvement: 'Reduce property lookup overhead',
        });
        optimizations.push({
          type: 'flatten_structure',
          description: 'Consider flattening data structure',
          improvement: 'Simpler and faster access',
        });
        break;
        
      case 'object_iteration_in_loop':
        optimizations.push({
          type: 'cache_iteration',
          description: `Cache Object.${issue.method} result`,
          code: `const ${issue.method} = Object.${issue.method}(obj);\nfor (...) {\n  // Use cached ${issue.method}\n}`,
          improvement: 'Avoid creating array multiple times',
        });
        break;
    }
    
    return {
      optimizations,
      priority: issue.type === 'large_object_literal' ? 'medium' : 'low',
    };
  }

  generateOptimizationExample(complexity) {
    if (complexity.loopDepth >= 2) {
      return '// Instead of nested loops O(n²):\nfor (const item1 of array1) {\n  for (const item2 of array2) {\n    if (item1.id === item2.id) { ... }\n  }\n}\n\n// Use a Map for O(n):\nconst map = new Map(array2.map(item => [item.id, item]));\nfor (const item1 of array1) {\n  const item2 = map.get(item1.id);\n  if (item2) { ... }\n}';
    }
    return '';
  }

  estimatePerformanceImprovement(issue) {
    const improvements = {
      high_complexity: {
        'O(n²)': '10-100x faster for large datasets',
        'O(n³)': '100-1000x faster for large datasets',
        'O(2^n)': 'Exponential improvement',
      },
    };
    
    if (issue.type === 'high_complexity' && issue.complexity.notation) {
      return improvements.high_complexity[issue.complexity.notation] || 'Significant improvement';
    }
    
    return 'Performance improvement depends on data size';
  }

  estimateMemorySaving(issue) {
    const savings = {
      large_array: `~${(issue.size * 8 / 1024 / 1024).toFixed(1)}MB`,
      concat_in_loop: 'Reduces intermediate array allocations',
      unnecessary_copy: 'Saves memory equal to array size',
    };
    
    return savings[issue.type] || 'Memory savings depend on data size';
  }

  estimateCachingImprovement(issue) {
    if (issue.type === 'repeated_calls') {
      return `${((issue.count - 1) / issue.count * 100).toFixed(0)}% reduction in computation`;
    }
    return 'Significant for repeated operations';
  }

  estimateBundleSizeReduction(issue) {
    const reductions = {
      namespace_import: {
        lodash: '~500KB to ~5KB per function',
        moment: '~300KB to ~50KB with date-fns',
        rxjs: '~200KB to ~20KB with proper imports',
      },
      default_import: {
        lodash: '~70KB to ~5KB per function',
      },
    };
    
    if (reductions[issue.type]?.[issue.library]) {
      return reductions[issue.type][issue.library];
    }
    
    return 'Size reduction depends on usage';
  }

  calculatePerformanceScore(analysis) {
    let score = 100;
    
    // Deduct points for issues based on impact
    for (const issue of analysis.issues) {
      switch (issue.impact) {
        case 'critical':
          score -= 20;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    }
    
    // Factor in static metrics
    const metrics = analysis.metrics.static;
    if (metrics) {
      if (metrics.complexity > 20) score -= 10;
      if (metrics.loopDepth > 3) score -= 15;
      if (metrics.fileSize > 50000) score -= 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  isExecutable(filePath) {
    // Check if file is a script that can be profiled
    return filePath.endsWith('.js') && !filePath.includes('.test.') && !filePath.includes('.spec.');
  }

  async profileRuntime(filePath) {
    // This would require actual runtime profiling
    // For now, return placeholder metrics
    return {
      executionTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
    };
  }

  async applyOptimization(filePath, optimization) {
    // Apply specific optimization to file
    const result = {
      success: false,
      changes: [],
      error: null,
    };
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Parse and transform based on optimization type
      // This would involve AST transformation
      
      result.success = true;
      result.changes.push({
        type: optimization.type,
        description: optimization.description,
      });
      
      this.optimizationHistory.push({
        filePath,
        optimization,
        timestamp: new Date().toISOString(),
        result,
      });
      
    } catch (error) {
      result.error = error.message;
    }
    
    return result;
  }

  async generateOptimizationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        filesAnalyzed: this.performanceMetrics.size,
        totalIssues: 0,
        criticalIssues: 0,
        optimizationsApplied: this.optimizationHistory.length,
      },
      byCategory: {},
      topIssues: [],
      recommendations: [],
    };
    
    // Aggregate metrics
    for (const [file, metrics] of this.performanceMetrics) {
      report.summary.totalIssues += metrics.issues.length;
      report.summary.criticalIssues += metrics.issues.filter(i => i.severity === 'critical').length;
      
      // Group by category
      for (const issue of metrics.issues) {
        const category = issue.category || 'other';
        if (!report.byCategory[category]) {
          report.byCategory[category] = {
            count: 0,
            issues: [],
          };
        }
        report.byCategory[category].count++;
        report.byCategory[category].issues.push({
          file: file.replace(this.rootPath, '.'),
          ...issue,
        });
      }
    }
    
    // Top issues
    const allIssues = [];
    for (const [file, metrics] of this.performanceMetrics) {
      allIssues.push(...metrics.issues.map(i => ({
        file: file.replace(this.rootPath, '.'),
        ...i,
      })));
    }
    
    report.topIssues = allIssues
      .sort((a, b) => {
        const impactScore = { critical: 3, high: 2, medium: 1, low: 0 };
        return (impactScore[b.impact] || 0) - (impactScore[a.impact] || 0);
      })
      .slice(0, 10);
    
    // General recommendations
    report.recommendations = this.generateRecommendations(report);
    
    return report;
  }

  generateRecommendations(report) {
    const recommendations = [];
    
    if (report.byCategory.algorithm?.count > 5) {
      recommendations.push({
        category: 'algorithm',
        recommendation: 'Consider algorithm optimization training for the team',
        priority: 'high',
      });
    }
    
    if (report.byCategory.async?.count > 10) {
      recommendations.push({
        category: 'async',
        recommendation: 'Review async/await patterns and consider using Promise.all',
        priority: 'medium',
      });
    }
    
    if (report.byCategory.memory?.count > 0) {
      recommendations.push({
        category: 'memory',
        recommendation: 'Implement memory profiling in development',
        priority: 'medium',
      });
    }
    
    return recommendations;
  }
}

module.exports = PerformanceOptimizer;