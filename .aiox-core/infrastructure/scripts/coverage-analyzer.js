const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

/**
 * Coverage analyzer for Synkra AIOX test generation
 * Analyzes existing test coverage and identifies gaps
 */
class CoverageAnalyzer {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.testsDir = path.join(this.rootPath, 'tests');
    this.coverageReportsDir = path.join(this.rootPath, 'coverage');
    this.coverageCache = new Map();
    this.analysisHistory = [];
  }

  /**
   * Initialize coverage analyzer
   */
  async initialize() {
    try {
      // Create coverage reports directory
      await fs.mkdir(this.coverageReportsDir, { recursive: true });

      // Load existing coverage data if available
      await this.loadExistingCoverageData();

      console.log(chalk.green('✅ Coverage analyzer initialized'));
      return true;

    } catch (error) {
      console.error(chalk.red(`Failed to initialize coverage analyzer: ${error.message}`));
      throw error;
    }
  }

  /**
   * Analyze test coverage for components
   */
  async analyzeCoverage(components, options = {}) {
    const analysisId = `coverage-analysis-${Date.now()}`;
    
    console.log(chalk.blue('📊 Analyzing test coverage...'));
    
    const analysis = {
      analysis_id: analysisId,
      timestamp: new Date().toISOString(),
      components: components.length,
      overall_coverage: {
        lines_covered: 0,
        lines_total: 0,
        percentage: 0,
        functions_covered: 0,
        functions_total: 0,
        function_percentage: 0,
        branches_covered: 0,
        branches_total: 0,
        branch_percentage: 0,
      },
      component_coverage: {},
      coverage_gaps: [],
      recommendations: [],
    };

    try {
      // Analyze coverage for each component
      for (const component of components) {
        const componentCoverage = await this.analyzeComponentCoverage(component, options);
        analysis.component_coverage[component.id] = componentCoverage;
        
        // Aggregate overall coverage
        this.aggregateCoverage(analysis.overall_coverage, componentCoverage);
      }

      // Calculate final percentages
      this.calculateCoveragePercentages(analysis.overall_coverage);

      // Identify coverage gaps
      analysis.coverage_gaps = await this.identifyCoverageGaps(analysis.component_coverage);

      // Generate recommendations
      analysis.recommendations = this.generateCoverageRecommendations(analysis);

      // Cache analysis results
      this.coverageCache.set(analysisId, analysis);
      this.analysisHistory.push({
        analysis_id: analysisId,
        timestamp: analysis.timestamp,
        overall_percentage: analysis.overall_coverage.percentage,
      });

      // Save analysis report
      await this.saveCoverageAnalysis(analysis);

      console.log(chalk.green('✅ Coverage analysis completed'));
      console.log(chalk.gray(`   Overall coverage: ${analysis.overall_coverage.percentage.toFixed(1)}%`));
      console.log(chalk.gray(`   Components analyzed: ${components.length}`));
      console.log(chalk.gray(`   Coverage gaps identified: ${analysis.coverage_gaps.length}`));

      return analysis;

    } catch (error) {
      console.error(chalk.red(`Coverage analysis failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Analyze coverage for a single component
   */
  async analyzeComponentCoverage(component, options = {}) {
    const coverage = {
      component_id: component.id,
      component_type: component.type,
      has_tests: false,
      test_files: [],
      lines: { covered: 0, total: 0, percentage: 0 },
      functions: { covered: 0, total: 0, percentage: 0 },
      branches: { covered: 0, total: 0, percentage: 0 },
      coverage_quality: 'unknown',
      missing_tests: [],
      untested_functions: [],
      uncovered_branches: [],
    };

    try {
      // Find existing test files for component
      coverage.test_files = await this.findTestFiles(component);
      coverage.has_tests = coverage.test_files.length > 0;

      if (coverage.has_tests) {
        // Analyze existing coverage data
        const existingCoverage = await this.getExistingCoverage(component);
        if (existingCoverage) {
          Object.assign(coverage, existingCoverage);
        } else {
          // Estimate coverage based on test file analysis
          const estimatedCoverage = await this.estimateCoverage(component, coverage.test_files);
          Object.assign(coverage, estimatedCoverage);
        }
      } else {
        // No tests exist, analyze component to estimate required coverage
        const componentAnalysis = await this.analyzeComponentForCoverage(component);
        coverage.lines.total = componentAnalysis.lines || 0;
        coverage.functions.total = componentAnalysis.functions || 0;
        coverage.branches.total = componentAnalysis.branches || 0;
        coverage.missing_tests = componentAnalysis.testable_elements || [];
      }

      // Determine coverage quality
      coverage.coverage_quality = this.determineCoverageQuality(coverage);

      // Identify specific gaps
      if (component.filePath) {
        coverage.untested_functions = await this.identifyUntestedFunctions(component);
        coverage.uncovered_branches = await this.identifyUncoveredBranches(component);
      }

    } catch (error) {
      console.warn(chalk.yellow(`Failed to analyze coverage for ${component.id}: ${error.message}`));
    }

    return coverage;
  }

  /**
   * Find test files for a component
   */
  async findTestFiles(component) {
    const testFiles = [];
    const possibleTestPaths = [
      path.join(this.testsDir, 'unit', component.type, `${component.name}.test.js`),
      path.join(this.testsDir, 'unit', component.type, `${component.name}.spec.js`),
      path.join(this.testsDir, 'integration', component.type, `${component.name}.integration.test.js`),
      path.join(this.testsDir, 'e2e', component.type, `${component.name}.e2e.test.js`),
      path.join(this.rootPath, 'test', `${component.name}.test.js`),
      path.join(this.rootPath, '__tests__', `${component.name}.test.js`),
    ];

    for (const testPath of possibleTestPaths) {
      try {
        const stats = await fs.stat(testPath);
        if (stats.isFile()) {
          const testType = this.determineTestType(testPath);
          const testAnalysis = await this.analyzeTestFile(testPath);
          
          testFiles.push({
            file_path: testPath,
            test_type: testType,
            test_count: testAnalysis.test_count,
            assertion_count: testAnalysis.assertion_count,
            mock_count: testAnalysis.mock_count,
            async_tests: testAnalysis.async_tests,
            last_modified: stats.mtime.toISOString(),
          });
        }
      } catch (error) {
        // File doesn't exist, continue
      }
    }

    return testFiles;
  }

  /**
   * Get existing coverage data from coverage reports
   */
  async getExistingCoverage(component) {
    try {
      // Try to find coverage data from different coverage tools
      const coverageFiles = [
        path.join(this.rootPath, 'coverage', 'lcov-report', 'index.html'),
        path.join(this.rootPath, 'coverage', 'coverage-final.json'),
        path.join(this.rootPath, 'coverage', 'clover.xml'),
        path.join(this.rootPath, '.nyc_output', 'coverage.json'),
      ];

      for (const coverageFile of coverageFiles) {
        try {
          const exists = await fs.access(coverageFile).then(() => true).catch(() => false);
          if (exists) {
            const coverageData = await this.parseCoverageFile(coverageFile, component);
            if (coverageData) {
              return coverageData;
            }
          }
        } catch (error) {
          continue;
        }
      }

      return null;

    } catch (error) {
      return null;
    }
  }

  /**
   * Estimate coverage based on test file analysis
   */
  async estimateCoverage(component, testFiles) {
    const coverage = {
      lines: { covered: 0, total: 0, percentage: 0 },
      functions: { covered: 0, total: 0, percentage: 0 },
      branches: { covered: 0, total: 0, percentage: 0 },
    };

    try {
      // Analyze component source to get totals
      const componentAnalysis = await this.analyzeComponentForCoverage(component);
      coverage.lines.total = componentAnalysis.lines || 0;
      coverage.functions.total = componentAnalysis.functions || 0;
      coverage.branches.total = componentAnalysis.branches || 0;

      // Estimate coverage based on test comprehensiveness
      let estimatedCoveragePercentage = 0;
      let totalTestWeight = 0;

      for (const testFile of testFiles) {
        const testWeight = this.calculateTestWeight(testFile);
        totalTestWeight += testWeight;
      }

      // Convert test weight to coverage estimate
      if (totalTestWeight > 0) {
        estimatedCoveragePercentage = Math.min(totalTestWeight * 10, 95); // Cap at 95%
      }

      // Apply coverage percentages
      coverage.lines.covered = Math.round(coverage.lines.total * (estimatedCoveragePercentage / 100));
      coverage.functions.covered = Math.round(coverage.functions.total * (estimatedCoveragePercentage / 100));
      coverage.branches.covered = Math.round(coverage.branches.total * (estimatedCoveragePercentage / 100));

      this.calculateCoveragePercentages(coverage);

    } catch (error) {
      console.warn(chalk.yellow(`Failed to estimate coverage for ${component.id}: ${error.message}`));
    }

    return coverage;
  }

  /**
   * Analyze component to determine coverage requirements
   */
  async analyzeComponentForCoverage(component) {
    const analysis = {
      lines: 0,
      functions: 0,
      branches: 0,
      testable_elements: [],
    };

    try {
      if (!component.filePath) {
        return analysis;
      }

      const content = await fs.readFile(component.filePath, 'utf-8');

      if (component.type === 'util') {
        // JavaScript utility analysis
        const lines = content.split('\n').filter(line => 
          line.trim() && 
          !line.trim().startsWith('//') && 
          !line.trim().startsWith('/*'),
        );
        analysis.lines = lines.length;

        const functions = content.match(/(?:function\s+\w+|[\w\$]+\s*[=:]\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g) || [];
        analysis.functions = functions.length;

        const branches = content.match(/\b(?:if|else|switch|case|for|while|try|catch)\b/g) || [];
        analysis.branches = branches.length;

        // Identify testable elements
        analysis.testable_elements = [
          ...functions.map(f => ({ type: 'function', name: this.extractFunctionName(f) })),
          ...branches.map((b, i) => ({ type: 'branch', name: `branch_${i + 1}` })),
        ];

      } else if (component.type === 'agent' || component.type === 'task') {
        // Markdown with embedded JavaScript
        const jsBlocks = content.match(/```javascript([\s\S]*?)```/g) || [];
        let totalLines = 0;
        let totalFunctions = 0;
        let totalBranches = 0;

        for (const block of jsBlocks) {
          const jsCode = block.replace(/```javascript|```/g, '');
          const lines = jsCode.split('\n').filter(line => 
            line.trim() && 
            !line.trim().startsWith('//'),
          );
          totalLines += lines.length;

          const functions = jsCode.match(/(?:function\s+\w+|[\w\$]+\s*[=:]\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g) || [];
          totalFunctions += functions.length;

          const branches = jsCode.match(/\b(?:if|else|switch|case|for|while|try|catch)\b/g) || [];
          totalBranches += branches.length;
        }

        analysis.lines = totalLines;
        analysis.functions = totalFunctions;
        analysis.branches = totalBranches;

        // For agents/tasks, also consider configuration testing
        analysis.testable_elements.push(
          { type: 'configuration', name: 'config_validation' },
          { type: 'execution', name: 'execute_method' },
        );

      } else if (component.type === 'workflow') {
        // YAML workflow analysis
        const steps = content.match(/^\s*-\s+name:/gm) || [];
        analysis.lines = content.split('\n').length;
        analysis.functions = steps.length; // Each step is like a function
        analysis.branches = (content.match(/\bif\b/g) || []).length; // Conditional steps

        analysis.testable_elements = steps.map((step, i) => ({
          type: 'workflow_step',
          name: `step_${i + 1}`,
        }));
      }

    } catch (error) {
      console.warn(chalk.yellow(`Failed to analyze component for coverage: ${error.message}`));
    }

    return analysis;
  }

  /**
   * Analyze test file to understand its comprehensiveness
   */
  async analyzeTestFile(testFilePath) {
    const analysis = {
      test_count: 0,
      assertion_count: 0,
      mock_count: 0,
      async_tests: 0,
      test_types: [],
    };

    try {
      const content = await fs.readFile(testFilePath, 'utf-8');

      // Count test cases
      const testCases = content.match(/\b(?:it|test|describe)\s*\(/g) || [];
      analysis.test_count = testCases.length;

      // Count assertions
      const assertions = content.match(/\bexpect\s*\(/g) || [];
      analysis.assertion_count = assertions.length;

      // Count mocks
      const mocks = content.match(/\b(?:mock|spy|stub|fake)\b/gi) || [];
      analysis.mock_count = mocks.length;

      // Count async tests
      const asyncTests = content.match(/\basync\s*\([^)]*\)\s*=>/g) || [];
      analysis.async_tests = asyncTests.length;

      // Identify test types
      if (content.includes('integration') || testFilePath.includes('integration')) {
        analysis.test_types.push('integration');
      }
      if (content.includes('e2e') || testFilePath.includes('e2e')) {
        analysis.test_types.push('e2e');
      }
      if (!analysis.test_types.length) {
        analysis.test_types.push('unit');
      }

    } catch (error) {
      console.warn(chalk.yellow(`Failed to analyze test file ${testFilePath}: ${error.message}`));
    }

    return analysis;
  }

  /**
   * Calculate test weight based on comprehensiveness
   */
  calculateTestWeight(testFile) {
    let weight = 0;

    // Base weight from test count
    weight += Math.min(testFile.test_count * 0.5, 5);

    // Weight from assertions
    weight += Math.min(testFile.assertion_count * 0.2, 3);

    // Weight from mocks (indicates interaction testing)
    weight += Math.min(testFile.mock_count * 0.3, 2);

    // Weight from async tests
    weight += Math.min(testFile.async_tests * 0.4, 2);

    // Weight from test types
    if (testFile.test_type === 'integration') weight += 1;
    if (testFile.test_type === 'e2e') weight += 1.5;

    return Math.min(weight, 10); // Cap at 10
  }

  /**
   * Determine test type from file path
   */
  determineTestType(testPath) {
    if (testPath.includes('integration')) return 'integration';
    if (testPath.includes('e2e')) return 'e2e';
    return 'unit';
  }

  /**
   * Parse coverage file to extract coverage data
   */
  async parseCoverageFile(coverageFile, component) {
    try {
      const ext = path.extname(coverageFile);
      
      if (ext === '.json') {
        const data = JSON.parse(await fs.readFile(coverageFile, 'utf-8'));
        return this.extractCoverageFromJson(data, component);
      } else if (ext === '.xml') {
        const data = await fs.readFile(coverageFile, 'utf-8');
        return this.extractCoverageFromXml(data, component);
      } else if (ext === '.html') {
        const data = await fs.readFile(coverageFile, 'utf-8');
        return this.extractCoverageFromHtml(data, component);
      }

      return null;

    } catch (error) {
      return null;
    }
  }

  /**
   * Extract coverage from JSON format (Istanbul/NYC)
   */
  extractCoverageFromJson(data, component) {
    // Find coverage data for this component's files
    const componentFile = component.filePath;
    if (!componentFile || !data[componentFile]) {
      return null;
    }

    const fileCoverage = data[componentFile];
    
    return {
      lines: {
        covered: Object.values(fileCoverage.s || {}).filter(count => count > 0).length,
        total: Object.keys(fileCoverage.s || {}).length,
        percentage: 0,
      },
      functions: {
        covered: Object.values(fileCoverage.f || {}).filter(count => count > 0).length,
        total: Object.keys(fileCoverage.f || {}).length,
        percentage: 0,
      },
      branches: {
        covered: Object.values(fileCoverage.b || {}).flat().filter(count => count > 0).length,
        total: Object.values(fileCoverage.b || {}).flat().length,
        percentage: 0,
      },
    };
  }

  /**
   * Extract coverage from XML format (Clover)
   */
  extractCoverageFromXml(data, component) {
    // Basic XML parsing for Clover format
    // This is a simplified implementation
    return null;
  }

  /**
   * Extract coverage from HTML format (LCOV)
   */
  extractCoverageFromHtml(data, component) {
    // Basic HTML parsing for LCOV reports
    // This is a simplified implementation
    return null;
  }

  /**
   * Aggregate coverage data
   */
  aggregateCoverage(overall, component) {
    overall.lines_covered += component.lines.covered || 0;
    overall.lines_total += component.lines.total || 0;
    overall.functions_covered += component.functions.covered || 0;
    overall.functions_total += component.functions.total || 0;
    overall.branches_covered += component.branches.covered || 0;
    overall.branches_total += component.branches.total || 0;
  }

  /**
   * Calculate coverage percentages
   */
  calculateCoveragePercentages(coverage) {
    if (coverage.lines_total > 0) {
      coverage.percentage = (coverage.lines_covered / coverage.lines_total) * 100;
    }
    
    if (coverage.functions_total > 0) {
      coverage.function_percentage = (coverage.functions_covered / coverage.functions_total) * 100;
    }
    
    if (coverage.branches_total > 0) {
      coverage.branch_percentage = (coverage.branches_covered / coverage.branches_total) * 100;
    }

    // For individual component coverage objects
    if (coverage.lines && coverage.lines.total > 0) {
      coverage.lines.percentage = (coverage.lines.covered / coverage.lines.total) * 100;
    }
    
    if (coverage.functions && coverage.functions.total > 0) {
      coverage.functions.percentage = (coverage.functions.covered / coverage.functions.total) * 100;
    }
    
    if (coverage.branches && coverage.branches.total > 0) {
      coverage.branches.percentage = (coverage.branches.covered / coverage.branches.total) * 100;
    }
  }

  /**
   * Identify coverage gaps
   */
  async identifyCoverageGaps(componentCoverage) {
    const gaps = [];

    for (const [componentId, coverage] of Object.entries(componentCoverage)) {
      // Components with no tests
      if (!coverage.has_tests) {
        gaps.push({
          component_id: componentId,
          gap_type: 'no_tests',
          severity: 'high',
          description: 'Component has no test files',
          recommendation: 'Create comprehensive test suite',
        });
      }

      // Low coverage components
      else if (coverage.lines.percentage < 50) {
        gaps.push({
          component_id: componentId,
          gap_type: 'low_coverage',
          severity: 'medium',
          description: `Low line coverage: ${coverage.lines.percentage.toFixed(1)}%`,
          recommendation: 'Add more test cases to improve coverage',
        });
      }

      // Missing function coverage
      if (coverage.functions.total > 0 && coverage.functions.percentage < 70) {
        gaps.push({
          component_id: componentId,
          gap_type: 'untested_functions',
          severity: 'medium',
          description: `${coverage.functions.total - coverage.functions.covered} functions not tested`,
          recommendation: 'Add tests for untested functions',
        });
      }

      // Missing branch coverage
      if (coverage.branches.total > 0 && coverage.branches.percentage < 60) {
        gaps.push({
          component_id: componentId,
          gap_type: 'untested_branches',
          severity: 'low',
          description: `${coverage.branches.total - coverage.branches.covered} branches not covered`,
          recommendation: 'Add tests for edge cases and error paths',
        });
      }
    }

    return gaps;
  }

  /**
   * Generate coverage recommendations
   */
  generateCoverageRecommendations(analysis) {
    const recommendations = [];

    // Overall coverage recommendations
    if (analysis.overall_coverage.percentage < 70) {
      recommendations.push({
        type: 'overall_coverage',
        priority: 'high',
        message: `Overall coverage is ${analysis.overall_coverage.percentage.toFixed(1)}% - target is 80%+`,
        action: 'Focus on components with no tests or low coverage',
      });
    }

    // Function coverage recommendations
    if (analysis.overall_coverage.function_percentage < 80) {
      recommendations.push({
        type: 'function_coverage',
        priority: 'medium',
        message: `Function coverage is ${analysis.overall_coverage.function_percentage.toFixed(1)}% - target is 90%+`,
        action: 'Add tests for untested functions',
      });
    }

    // Components without tests
    const componentsWithoutTests = Object.values(analysis.component_coverage)
      .filter(c => !c.has_tests).length;
    
    if (componentsWithoutTests > 0) {
      recommendations.push({
        type: 'missing_tests',
        priority: 'high',
        message: `${componentsWithoutTests} components have no tests`,
        action: 'Create test files for untested components',
      });
    }

    // Test quality recommendations
    const lowQualityTests = Object.values(analysis.component_coverage)
      .filter(c => c.coverage_quality === 'poor').length;
    
    if (lowQualityTests > 0) {
      recommendations.push({
        type: 'test_quality',
        priority: 'medium',
        message: `${lowQualityTests} components have poor test quality`,
        action: 'Improve test comprehensiveness and add edge cases',
      });
    }

    return recommendations;
  }

  /**
   * Determine coverage quality rating
   */
  determineCoverageQuality(coverage) {
    if (!coverage.has_tests) return 'none';
    
    const linePercentage = coverage.lines.percentage || 0;
    const functionPercentage = coverage.functions.percentage || 0;
    
    const averagePercentage = (linePercentage + functionPercentage) / 2;
    
    if (averagePercentage >= 90) return 'excellent';
    if (averagePercentage >= 80) return 'good';
    if (averagePercentage >= 60) return 'fair';
    if (averagePercentage >= 40) return 'poor';
    return 'very_poor';
  }

  /**
   * Identify untested functions
   */
  async identifyUntestedFunctions(component) {
    const untestedFunctions = [];
    
    try {
      if (component.type === 'util' && component.filePath) {
        const content = await fs.readFile(component.filePath, 'utf-8');
        const functions = this.extractFunctionNames(content);
        
        // Check if each function is tested
        const testFiles = await this.findTestFiles(component);
        const testContent = await this.getCombinedTestContent(testFiles);
        
        for (const func of functions) {
          if (!testContent.includes(func.name)) {
            untestedFunctions.push(func);
          }
        }
      }
    } catch (error) {
      console.warn(chalk.yellow(`Failed to identify untested functions: ${error.message}`));
    }
    
    return untestedFunctions;
  }

  /**
   * Identify uncovered branches
   */
  async identifyUncoveredBranches(component) {
    const uncoveredBranches = [];
    
    // This would require more sophisticated analysis
    // For now, return empty array
    
    return uncoveredBranches;
  }

  // Helper methods

  extractFunctionName(functionMatch) {
    const nameMatch = functionMatch.match(/function\s+(\w+)|(\w+)\s*[=:]/);
    return nameMatch ? (nameMatch[1] || nameMatch[2]) : 'anonymous';
  }

  extractFunctionNames(content) {
    const functions = [];
    const functionMatches = content.match(/(?:function\s+(\w+)|(\w+)\s*[=:]\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g) || [];
    
    for (const match of functionMatches) {
      const name = this.extractFunctionName(match);
      if (name && name !== 'anonymous') {
        functions.push({ name, match });
      }
    }
    
    return functions;
  }

  async getCombinedTestContent(testFiles) {
    let combinedContent = '';
    
    for (const testFile of testFiles) {
      try {
        const content = await fs.readFile(testFile.file_path, 'utf-8');
        combinedContent += content + '\n';
      } catch (error) {
        continue;
      }
    }
    
    return combinedContent;
  }

  async loadExistingCoverageData() {
    // Load any existing coverage cache or history
    try {
      const historyFile = path.join(this.coverageReportsDir, 'analysis-history.json');
      const exists = await fs.access(historyFile).then(() => true).catch(() => false);
      
      if (exists) {
        const data = JSON.parse(await fs.readFile(historyFile, 'utf-8'));
        this.analysisHistory = data.analysis_history || [];
      }
    } catch (error) {
      // No existing data, start fresh
    }
  }

  async saveCoverageAnalysis(analysis) {
    try {
      // Save individual analysis
      const analysisFile = path.join(this.coverageReportsDir, `${analysis.analysis_id}.json`);
      await fs.writeFile(analysisFile, JSON.stringify(analysis, null, 2));

      // Update history
      const historyFile = path.join(this.coverageReportsDir, 'analysis-history.json');
      const historyData = {
        last_updated: new Date().toISOString(),
        analysis_history: this.analysisHistory.slice(-10), // Keep last 10 analyses
      };
      await fs.writeFile(historyFile, JSON.stringify(historyData, null, 2));

      console.log(chalk.gray(`Coverage analysis saved: ${analysisFile}`));

    } catch (error) {
      console.warn(chalk.yellow(`Failed to save coverage analysis: ${error.message}`));
    }
  }

  /**
   * Get coverage trends over time
   */
  getCoverageTrends() {
    if (this.analysisHistory.length < 2) {
      return { trend: 'insufficient_data', message: 'Need at least 2 analyses for trend calculation' };
    }

    const recent = this.analysisHistory.slice(-5); // Last 5 analyses
    const percentages = recent.map(a => a.overall_percentage);
    
    const firstPercentage = percentages[0];
    const lastPercentage = percentages[percentages.length - 1];
    const difference = lastPercentage - firstPercentage;

    let trend = 'stable';
    if (difference > 5) trend = 'improving';
    else if (difference < -5) trend = 'declining';

    return {
      trend,
      difference: difference.toFixed(1),
      current_percentage: lastPercentage,
      analysis_count: recent.length,
    };
  }

  /**
   * Get coverage summary for reporting
   */
  getCoverageSummary(analysisId) {
    const analysis = this.coverageCache.get(analysisId);
    
    if (!analysis) {
      return null;
    }

    return {
      analysis_id: analysisId,
      timestamp: analysis.timestamp,
      overall_percentage: analysis.overall_coverage.percentage,
      components_analyzed: analysis.components,
      components_with_tests: Object.values(analysis.component_coverage)
        .filter(c => c.has_tests).length,
      coverage_gaps: analysis.coverage_gaps.length,
      quality_distribution: this.calculateQualityDistribution(analysis.component_coverage),
    };
  }

  calculateQualityDistribution(componentCoverage) {
    const distribution = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      very_poor: 0,
      none: 0,
    };

    for (const coverage of Object.values(componentCoverage)) {
      distribution[coverage.coverage_quality]++;
    }

    return distribution;
  }
}

module.exports = CoverageAnalyzer;