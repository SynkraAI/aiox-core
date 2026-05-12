const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

/**
 * Test quality assessment for Synkra AIOX test generation
 * Evaluates generated test quality and provides improvement recommendations
 */
class TestQualityAssessment {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.qualityReportsDir = path.join(this.rootPath, '.aiox', 'quality-reports');
    this.qualityStandards = this.initializeQualityStandards();
    this.assessmentCache = new Map();
    this.qualityHistory = [];
  }

  /**
   * Initialize test quality assessment
   */
  async initialize() {
    try {
      // Create quality reports directory
      await fs.mkdir(this.qualityReportsDir, { recursive: true });

      // Load existing quality history
      await this.loadQualityHistory();

      console.log(chalk.green('✅ Test quality assessment initialized'));
      return true;

    } catch (error) {
      console.error(chalk.red(`Failed to initialize test quality assessment: ${error.message}`));
      throw error;
    }
  }

  /**
   * Assess quality of a single test file
   */
  async analyzeSingleTestFile(testFilePath) {
    console.log(chalk.blue(`🔍 Assessing test quality: ${path.basename(testFilePath)}`));
    
    const assessment = {
      file_path: testFilePath,
      analyzed_at: new Date().toISOString(),
      overall_score: 0,
      quality_rating: 'unknown',
      metrics: {},
      issues: [],
      recommendations: [],
      estimatedCoverage: 0,
    };

    try {
      // Read test file content
      const content = await fs.readFile(testFilePath, 'utf-8');
      
      // Analyze various quality metrics
      assessment.metrics = await this.analyzeQualityMetrics(_content);
      
      // Calculate overall quality score
      assessment.overall_score = this.calculateOverallScore(assessment.metrics);
      
      // Determine quality rating
      assessment.quality_rating = this.determineQualityRating(assessment.overall_score);
      
      // Identify quality issues
      assessment.issues = this.identifyQualityIssues(assessment.metrics, content);
      
      // Generate improvement recommendations
      assessment.recommendations = this.generateRecommendations(assessment.metrics, assessment.issues);
      
      // Estimate coverage contribution
      assessment.estimatedCoverage = this.estimateCoverageContribution(assessment.metrics);

      // Cache assessment
      this.assessmentCache.set(testFilePath, assessment);

      console.log(chalk.green(`✅ Test quality assessed: ${assessment.quality_rating} (${assessment.overall_score.toFixed(1)}/10)`));
      
      return assessment;

    } catch (error) {
      console.error(chalk.red(`Failed to assess test quality for ${testFilePath}: ${error.message}`));
      throw error;
    }
  }

  /**
   * Assess quality of multiple test files
   */
  async assessTestSuite(testFiles, options = {}) {
    const suiteAssessment = {
      assessed_at: new Date().toISOString(),
      test_files: testFiles.length,
      overall_suite_score: 0,
      quality_distribution: {},
      common_issues: [],
      suite_recommendations: [],
      file_assessments: {},
    };

    console.log(chalk.blue(`📋 Assessing test suite quality (${testFiles.length} files)`));

    const scores = [];
    const allIssues = [];
    const qualityRatings = { excellent: 0, good: 0, fair: 0, poor: 0, very_poor: 0 };

    // Assess each test file
    for (const testFile of testFiles) {
      try {
        const assessment = await this.analyzeSingleTestFile(testFile);
        
        suiteAssessment.file_assessments[testFile] = assessment;
        scores.push(assessment.overall_score);
        allIssues.push(...assessment.issues);
        qualityRatings[assessment.quality_rating]++;

      } catch (error) {
        console.warn(chalk.yellow(`Failed to assess ${testFile}: ${error.message}`));
      }
    }

    // Calculate suite-level metrics
    suiteAssessment.overall_suite_score = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0;

    suiteAssessment.quality_distribution = qualityRatings;
    suiteAssessment.common_issues = this.identifyCommonIssues(allIssues);
    suiteAssessment.suite_recommendations = this.generateSuiteRecommendations(suiteAssessment);

    // Save suite assessment
    await this.saveSuiteAssessment(suiteAssessment);

    console.log(chalk.green('✅ Test suite assessment completed'));
    console.log(chalk.gray(`   Overall score: ${suiteAssessment.overall_suite_score.toFixed(1)}/10`));
    console.log(chalk.gray(`   Files assessed: ${testFiles.length}`));
    console.log(chalk.gray(`   Common issues: ${suiteAssessment.common_issues.length}`));

    return suiteAssessment;
  }

  /**
   * Analyze quality metrics for test content
   */
  async analyzeQualityMetrics(_content) {
    const metrics = {
      // Structure metrics
      test_organization: this.analyzeTestOrganization(_content),
      naming_quality: this.analyzeNamingQuality(_content),
      
      // Content metrics
      assertion_quality: this.analyzeAssertionQuality(_content),
      test_coverage_breadth: this.analyzeTestCoverageBreadth(_content),
      edge_case_coverage: this.analyzeEdgeCaseCoverage(_content),
      
      // Code quality metrics
      code_clarity: this.analyzeCodeClarity(_content),
      maintainability: this.analyzeMaintainability(_content),
      
      // Testing best practices
      isolation: this.analyzeTestIsolation(_content),
      reliability: this.analyzeTestReliability(_content),
      performance: this.analyzeTestPerformance(_content),
      
      // Framework usage
      framework_usage: this.analyzeFrameworkUsage(_content),
      mock_quality: this.analyzeMockQuality(_content),
    };

    return metrics;
  }

  /**
   * Analyze test organization and structure
   */
  analyzeTestOrganization(_content) {
    const score = { value: 0, max: 10, details: {} };
    
    // Check for describe blocks
    const describeBlocks = content.match(/describe\s*\([^{]+\{/g) || [];
    score.details.has_describe_blocks = describeBlocks.length > 0;
    if (score.details.has_describe_blocks) score.value += 2;
    
    // Check for nested organization
    const nestedDescribe = content.match(/describe\s*\([^{]*\{\s*[\s\S]*?describe\s*\(/g) || [];
    score.details.has_nested_structure = nestedDescribe.length > 0;
    if (score.details.has_nested_structure) score.value += 1;
    
    // Check for setup/teardown
    const setupMethods = content.match(/\b(?:beforeEach|beforeAll|afterEach|afterAll)\s*\(/g) || [];
    score.details.has_setup_teardown = setupMethods.length > 0;
    if (score.details.has_setup_teardown) score.value += 2;
    
    // Check for logical grouping
    const testBlocks = content.match(/\b(?:it|test)\s*\(/g) || [];
    score.details.test_count = testBlocks.length;
    score.details.tests_per_describe = describeBlocks.length > 0 
      ? testBlocks.length / describeBlocks.length 
      : testBlocks.length;
    
    // Good ratio of tests per describe block
    if (score.details.tests_per_describe >= 2 && score.details.tests_per_describe <= 8) {
      score.value += 2;
    }
    
    // Check for comments and documentation
    const comments = content.match(/\/\*[\s\S]*?\*\/|\/\/.*$/gm) || [];
    score.details.has_documentation = comments.length > 0;
    if (score.details.has_documentation) score.value += 1;
    
    // Consistent indentation
    const lines = content.split('\n');
    const indentationConsistent = this.checkIndentationConsistency(lines);
    score.details.consistent_indentation = indentationConsistent;
    if (indentationConsistent) score.value += 2;
    
    return score;
  }

  /**
   * Analyze naming quality of tests
   */
  analyzeNamingQuality(_content) {
    const score = { value: 0, max: 10, details: {} };
    
    // Extract test names
    const testNames = this.extractTestNames(_content);
    score.details.total_tests = testNames.length;
    
    if (testNames.length === 0) return score;
    
    // Check naming patterns
    let descriptiveNames = 0;
    let consistentPatterns = 0;
    let appropriateLength = 0;
    
    const patterns = {
      should_pattern: /should\s+/i,
      can_pattern: /can\s+/i,
      when_pattern: /when\s+/i,
      given_pattern: /given\s+/i,
    };
    
    for (const name of testNames) {
      // Descriptive (contains action verbs or clear intent)
      if (name.length > 20 && (name.includes('should') || name.includes('when') || name.includes('given'))) {
        descriptiveNames++;
      }
      
      // Appropriate length (not too short, not too long)
      if (name.length >= 15 && name.length <= 80) {
        appropriateLength++;
      }
      
      // Consistent patterns
      for (const pattern of Object.values(patterns)) {
        if (pattern.test(name)) {
          consistentPatterns++;
          break;
        }
      }
    }
    
    score.details.descriptive_ratio = descriptiveNames / testNames.length;
    score.details.length_appropriate_ratio = appropriateLength / testNames.length;
    score.details.pattern_consistent_ratio = consistentPatterns / testNames.length;
    
    // Scoring
    score.value += score.details.descriptive_ratio * 4;
    score.value += score.details.length_appropriate_ratio * 3;
    score.value += score.details.pattern_consistent_ratio * 3;
    
    return score;
  }

  /**
   * Analyze assertion quality
   */
  analyzeAssertionQuality(_content) {
    const score = { value: 0, max: 10, details: {} };
    
    // Count different types of assertions
    const assertions = {
      specific: content.match(/\.toBe\(|\.toEqual\(|\.toStrictEqual\(/g) || [],
      existence: content.match(/\.toBeDefined\(|\.toBeNull\(|\.toBeUndefined\(/g) || [],
      boolean: content.match(/\.toBeTruthy\(|\.toBeFalsy\(|\.toBeTrue\(|\.toBeFalse\(/g) || [],
      numeric: content.match(/\.toBeGreaterThan\(|\.toBeLessThan\(|\.toBeCloseTo\(/g) || [],
      array: content.match(/\.toHaveLength\(|\.toContain\(|\.toContainEqual\(/g) || [],
      object: content.match(/\.toHaveProperty\(|\.toMatchObject\(/g) || [],
      error: content.match(/\.toThrow\(|\.rejects\.|\.resolves\./g) || [],
      custom: content.match(/\.toMatch\(|\.toMatchSnapshot\(/g) || [],
    };
    
    const totalAssertions = Object.values(assertions).reduce((sum, arr) => sum + arr.length, 0);
    score.details.total_assertions = totalAssertions;
    
    if (totalAssertions === 0) return score;
    
    // Diversity of assertion types
    const assertionTypes = Object.entries(assertions).filter(([_, arr]) => arr.length > 0).length;
    score.details.assertion_type_diversity = assertionTypes / Object.keys(assertions).length;
    score.value += score.details.assertion_type_diversity * 3;
    
    // Specific vs generic assertions ratio
    const specificAssertions = assertions.specific.length + assertions.numeric.length + assertions.object.length;
    const genericAssertions = assertions.existence.length + assertions.boolean.length;
    score.details.specific_ratio = specificAssertions / (specificAssertions + genericAssertions + 1);
    score.value += score.details.specific_ratio * 4;
    
    // Error handling coverage
    score.details.error_handling_ratio = assertions.error.length / totalAssertions;
    score.value += Math.min(score.details.error_handling_ratio * 10, 3);
    
    return score;
  }

  /**
   * Analyze test coverage breadth
   */
  analyzeTestCoverageBreadth(_content) {
    const score = { value: 0, max: 10, details: {} };
    
    // Identify different test scenarios
    const scenarios = {
      happy_path: content.match(/should\s+.*(?:work|succeed|return|complete)/gi) || [],
      error_cases: content.match(/should\s+.*(?:throw|fail|error|reject)/gi) || [],
      edge_cases: content.match(/should\s+.*(?:empty|null|undefined|zero|negative|boundary|limit)/gi) || [],
      async_cases: content.match(/async\s*\(|await\s+/g) || [],
      integration: content.match(/integration|end.to.end|e2e/gi) || [],
    };
    
    // Count covered scenario types
    const scenariosCovered = Object.entries(scenarios).filter(([_, matches]) => matches.length > 0).length;
    score.details.scenario_coverage = scenariosCovered / Object.keys(scenarios).length;
    score.value += score.details.scenario_coverage * 5;
    
    // Test comprehensiveness
    const testCount = (content.match(/\b(?:it|test)\s*\(/g) || []).length;
    score.details.test_count = testCount;
    
    if (testCount >= 10) score.value += 2;
    else if (testCount >= 5) score.value += 1;
    
    // Mock usage indicating interaction testing
    const mockUsage = content.match(/\b(?:mock|spy|stub|fake)\b/gi) || [];
    score.details.interaction_testing = mockUsage.length > 0;
    if (score.details.interaction_testing) score.value += 3;
    
    return score;
  }

  /**
   * Analyze edge case coverage
   */
  analyzeEdgeCaseCoverage(_content) {
    const score = { value: 0, max: 10, details: {} };
    
    const edgeCasePatterns = {
      null_undefined: /\b(?:null|undefined)\b/gi,
      empty_values: /\b(?:empty|blank|zero|''|""|\[\]|\{\})\b/gi,
      boundary_values: /\b(?:min|max|first|last|boundary|limit)\b/gi,
      negative_cases: /\b(?:negative|invalid|malformed|corrupt)\b/gi,
      large_values: /\b(?:large|huge|maximum|overflow)\b/gi,
      concurrent: /\b(?:concurrent|parallel|race|async)\b/gi,
    };
    
    let edgeCasesFound = 0;
    const edgeCaseDetails = {};
    
    for (const [category, pattern] of Object.entries(edgeCasePatterns)) {
      const matches = content.match(pattern) || [];
      edgeCaseDetails[category] = matches.length;
      if (matches.length > 0) edgeCasesFound++;
    }
    
    score.details.edge_case_categories = edgeCasesFound;
    score.details.edge_case_details = edgeCaseDetails;
    score.details.edge_case_ratio = edgeCasesFound / Object.keys(edgeCasePatterns).length;
    
    score.value = score.details.edge_case_ratio * 10;
    
    return score;
  }

  /**
   * Analyze code clarity and readability
   */
  analyzeCodeClarity(_content) {
    const score = { value: 0, max: 10, details: {} };
    
    const lines = content.split('\n');
    let clearLines = 0;
    let complexLines = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;
      
      // Check line complexity
      const complexity = this.calculateLineComplexity(trimmed);
      if (complexity < 3) clearLines++;
      else if (complexity > 5) complexLines++;
    }
    
    const totalCodeLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*');
    }).length;
    
    score.details.clear_lines_ratio = totalCodeLines > 0 ? clearLines / totalCodeLines : 0;
    score.details.complex_lines_ratio = totalCodeLines > 0 ? complexLines / totalCodeLines : 0;
    
    // Variable naming clarity
    const variables = content.match(/(?:let|const|var)\s+(\w+)/g) || [];
    let descriptiveVariables = 0;
    
    for (const variable of variables) {
      const name = variable.match(/(?:let|const|var)\s+(\w+)/)[1];
      if (name.length > 3 && !name.match(/^[a-z]$/)) {
        descriptiveVariables++;
      }
    }
    
    score.details.descriptive_variables_ratio = variables.length > 0 
      ? descriptiveVariables / variables.length 
      : 1;
    
    // Scoring
    score.value += score.details.clear_lines_ratio * 4;
    score.value += (1 - score.details.complex_lines_ratio) * 3;
    score.value += score.details.descriptive_variables_ratio * 3;
    
    return score;
  }

  /**
   * Analyze maintainability factors
   */
  analyzeMaintainability(_content) {
    const score = { value: 0, max: 10, details: {} };
    
    // DRY principle - look for repeated code patterns
    const lines = content.split('\n').filter(line => line.trim());
    const uniqueLines = new Set(lines.map(line => line.trim()));
    score.details.code_duplication_ratio = 1 - (uniqueLines.size / lines.length);
    
    // Helper function usage
    const helperFunctions = content.match(/function\s+\w+Helper|const\s+\w+Helper/g) || [];
    score.details.uses_helpers = helperFunctions.length > 0;
    
    // Test data management
    const testData = content.match(/const\s+(?:test|mock|fixture|sample)Data/gi) || [];
    score.details.organized_test_data = testData.length > 0;
    
    // Magic numbers/strings
    const magicNumbers = content.match(/\b(?!0|1|2|10|100|1000)\d{3,}\b/g) || [];
    const magicStrings = content.match(/'[^']{20,}'|"[^"]{20,}"/g) || [];
    score.details.magic_values_count = magicNumbers.length + magicStrings.length;
    
    // Scoring
    score.value += (1 - Math.min(score.details.code_duplication_ratio, 0.5)) * 4;
    score.value += score.details.uses_helpers ? 2 : 0;
    score.value += score.details.organized_test_data ? 2 : 0;
    score.value += Math.max(0, 2 - (score.details.magic_values_count * 0.5));
    
    return score;
  }

  /**
   * Analyze test isolation
   */
  analyzeTestIsolation(_content) {
    const score = { value: 0, max: 10, details: {} };
    
    // Check for proper setup/teardown
    const setupTeardown = content.match(/\b(?:beforeEach|afterEach)\s*\(/g) || [];
    score.details.has_isolation_setup = setupTeardown.length > 0;
    if (score.details.has_isolation_setup) score.value += 3;
    
    // Check for shared state usage
    const _sharedVariables = content.match(/\b(?:let|var)\s+\w+(?=\s*;|\s*=.*;\s*$)/gm) || [];
    const sharedInDescribe = content.match(/describe[^{]*\{[^}]*(?:let|var)\s+\w+/g) || [];
    score.details.shared_state_usage = sharedInDescribe.length;
    
    // Penalty for excessive shared state
    if (score.details.shared_state_usage > 3) score.value -= 2;
    else if (score.details.shared_state_usage === 0) score.value += 2;
    
    // Check for test dependencies (tests that depend on order)
    const testOrder = content.includes('beforeAll') && !content.includes('afterAll');
    score.details.potential_order_dependency = testOrder;
    if (!testOrder) score.value += 2;
    
    // Mock cleanup
    const mockCleanup = content.match(/\b(?:jest\.clearAllMocks|sinon\.restore|vi\.clearAllMocks)\b/g) || [];
    score.details.mock_cleanup = mockCleanup.length > 0;
    if (score.details.mock_cleanup) score.value += 3;
    
    return score;
  }

  /**
   * Analyze test reliability
   */
  analyzeTestReliability(_content) {
    const score = { value: 0, max: 10, details: {} };
    
    // Check for flaky patterns
    const flakyPatterns = {
      timeouts: content.match(/setTimeout|setInterval/g) || [],
      dates: content.match(/new Date\(\)|Date\.now\(\)/g) || [],
      random: content.match(/Math\.random\(\)|Math\.floor.*random/g) || [],
      external_deps: content.match(/fetch\(|axios\.|http\./g) || [],
    };
    
    const totalFlakyPatterns = Object.values(flakyPatterns).reduce((sum, arr) => sum + arr.length, 0);
    score.details.flaky_pattern_count = totalFlakyPatterns;
    
    // Deterministic test data
    const deterministicData = content.match(/const\s+\w+\s*=\s*\{|const\s+\w+\s*=\s*\[/g) || [];
    score.details.uses_deterministic_data = deterministicData.length > 0;
    
    // Proper async handling
    const asyncTests = content.match(/async\s*\(|await\s+/g) || [];
    const promiseHandling = content.match(/\.resolves\.|\.rejects\.|return\s+\w+\(/g) || [];
    score.details.proper_async_handling = asyncTests.length > 0 && promiseHandling.length > 0;
    
    // Scoring
    score.value += Math.max(0, 4 - totalFlakyPatterns);
    score.value += score.details.uses_deterministic_data ? 3 : 0;
    score.value += score.details.proper_async_handling ? 3 : 0;
    
    return score;
  }

  /**
   * Analyze test performance considerations
   */
  analyzeTestPerformance(_content) {
    const score = { value: 0, max: 10, details: {} };
    
    // Count expensive operations
    const expensiveOps = {
      file_io: content.match(/fs\.|readFile|writeFile/g) || [],
      network: content.match(/fetch\(|axios\.|http\./g) || [],
      heavy_computation: content.match(/for\s*\([^)]*1000|while\s*\(/g) || [],
      large_objects: content.match(/Array\(\d{3,}\)|new Array\(\d{3,}\)/g) || [],
    };
    
    const totalExpensiveOps = Object.values(expensiveOps).reduce((sum, arr) => sum + arr.length, 0);
    score.details.expensive_operations = totalExpensiveOps;
    
    // Mocking of expensive operations
    const mockedOps = content.match(/mock\w*\s*\(\s*['"`](?:fs|http|fetch)/g) || [];
    score.details.mocked_expensive_ops = mockedOps.length;
    
    // Timeout configurations
    const timeouts = content.match(/timeout\s*\(\s*\d+/g) || [];
    score.details.has_timeout_config = timeouts.length > 0;
    
    // Scoring
    score.value = 10; // Start with perfect score
    score.value -= Math.min(totalExpensiveOps * 2, 6); // Penalty for expensive ops
    score.value += Math.min(mockedOps.length, 3); // Bonus for mocking
    score.value += score.details.has_timeout_config ? 1 : 0;
    
    return Math.max(score.value, 0);
  }

  /**
   * Analyze framework usage quality
   */
  analyzeFrameworkUsage(_content) {
    const score = { value: 0, max: 10, details: {} };
    
    // Detect framework
    const framework = this.detectTestFramework(_content);
    score.details.framework = framework;
    
    // Framework-specific best practices
    switch (framework) {
      case 'jest':
        score.value += this.analyzeJestUsage(_content);
        break;
      case 'mocha':
        score.value += this.analyzeMochaUsage(_content);
        break;
      case 'vitest':
        score.value += this.analyzeVitestUsage(_content);
        break;
      default:
        score.value += 5; // Neutral score for unknown framework
    }
    
    return score;
  }

  /**
   * Analyze mock quality
   */
  analyzeMockQuality(_content) {
    const score = { value: 0, max: 10, details: {} };
    
    // Mock usage patterns
    const mocks = {
      jest_mocks: content.match(/jest\.mock\(|jest\.fn\(\)|mockImplementation/g) || [],
      sinon_mocks: content.match(/sinon\.mock\(|sinon\.spy\(|sinon\.stub\(/g) || [],
      vitest_mocks: content.match(/vi\.mock\(|vi\.fn\(\)|mockImplementation/g) || [],
    };
    
    const totalMocks = Object.values(mocks).reduce((sum, arr) => sum + arr.length, 0);
    score.details.total_mocks = totalMocks;
    
    if (totalMocks === 0) {
      score.value = 7; // Neutral score for no mocks
      return score;
    }
    
    // Mock verification
    const mockVerifications = content.match(/toHaveBeenCalled|toHaveBeenCalledWith|calledWith|called/g) || [];
    score.details.mock_verifications = mockVerifications.length;
    score.details.verification_ratio = mockVerifications.length / totalMocks;
    
    // Mock cleanup
    const mockCleanup = content.match(/mockRestore|mockClear|restore\(\)|clearAllMocks/g) || [];
    score.details.mock_cleanup = mockCleanup.length > 0;
    
    // Scoring
    score.value += Math.min(score.details.verification_ratio * 6, 6);
    score.value += score.details.mock_cleanup ? 2 : 0;
    score.value += Math.min(totalMocks * 0.5, 2); // Bonus for using mocks appropriately
    
    return score;
  }

  // Helper methods for analysis

  checkIndentationConsistency(lines) {
    const indentations = lines
      .filter(line => line.trim())
      .map(line => line.match(/^\s*/)[0].length)
      .filter(indent => indent > 0);
    
    if (indentations.length < 2) return true;
    
    // Check if indentation follows a consistent pattern (2 or 4 spaces)
    const commonIndent = indentations.reduce((acc, indent) => {
      const factor = indent % 2 === 0 ? 2 : (indent % 4 === 0 ? 4 : 1);
      acc[factor] = (acc[factor] || 0) + 1;
      return acc;
    }, {});
    
    const mostCommon = Object.keys(commonIndent).reduce((a, b) => 
      commonIndent[a] > commonIndent[b] ? a : b,
    );
    
    const consistent = indentations.filter(indent => indent % mostCommon === 0).length;
    return consistent / indentations.length > 0.8;
  }

  extractTestNames(_content) {
    const testMatches = content.match(/(?:it|test)\s*\(\s*['"`]([^'"`]+)['"`]/g) || [];
    return testMatches.map(match => {
      const nameMatch = match.match(/['"`]([^'"`]+)['"`]/);
      return nameMatch ? nameMatch[1] : '';
    }).filter(name => name);
  }

  calculateLineComplexity(line) {
    let complexity = 0;
    
    // Nesting indicators
    complexity += (line.match(/[\(\)\[\]\{\}]/g) || []).length * 0.5;
    
    // Logical operators
    complexity += (line.match(/&&|\|\||!(?!=)/g) || []).length;
    
    // Conditional statements
    complexity += (line.match(/\?|\:|if|else|switch|case/g) || []).length;
    
    // Function calls
    complexity += (line.match(/\w+\s*\(/g) || []).length * 0.3;
    
    return complexity;
  }

  detectTestFramework(_content) {
    if (content.includes('jest') || content.includes('expect(')) return 'jest';
    if (content.includes('mocha') || content.includes('chai')) return 'mocha';
    if (content.includes('vitest') || content.includes('vi.')) return 'vitest';
    return 'unknown';
  }

  analyzeJestUsage(_content) {
    let score = 0;
    
    // Good Jest practices
    if (content.includes('expect.extend')) score += 1;
    if (content.includes('jest.mock')) score += 1;
    if (content.includes('toMatchSnapshot')) score += 1;
    if (content.includes('toHaveBeenCalled')) score += 1;
    if (content.includes('jest.clearAllMocks')) score += 1;
    
    return Math.min(score, 5);
  }

  analyzeMochaUsage(_content) {
    let score = 0;
    
    // Good Mocha practices
    if (content.includes('this.timeout')) score += 1;
    if (content.includes('done')) score += 1;
    if (content.includes('chai')) score += 1;
    if (content.includes('sinon')) score += 1;
    
    return Math.min(score, 4);
  }

  analyzeVitestUsage(_content) {
    let score = 0;
    
    // Good Vitest practices
    if (content.includes('vi.mock')) score += 1;
    if (content.includes('vi.spyOn')) score += 1;
    if (content.includes('vi.clearAllMocks')) score += 1;
    
    return Math.min(score, 3);
  }

  /**
   * Calculate overall quality score
   */
  calculateOverallScore(metrics) {
    const weights = {
      test_organization: 0.15,
      naming_quality: 0.12,
      assertion_quality: 0.15,
      test_coverage_breadth: 0.15,
      edge_case_coverage: 0.10,
      code_clarity: 0.08,
      maintainability: 0.08,
      isolation: 0.07,
      reliability: 0.05,
      performance: 0.03,
      framework_usage: 0.01,
      mock_quality: 0.01,
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const [metric, weight] of Object.entries(weights)) {
      if (metrics[metric]) {
        const normalizedScore = (metrics[metric].value || metrics[metric]) / 10;
        totalScore += normalizedScore * weight * 10;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Determine quality rating from score
   */
  determineQualityRating(score) {
    if (score >= 9) return 'excellent';
    if (score >= 7.5) return 'good';
    if (score >= 6) return 'fair';
    if (score >= 4) return 'poor';
    return 'very_poor';
  }

  /**
   * Identify quality issues from metrics
   */
  identifyQualityIssues(metrics, content) {
    const issues = [];

    // Organization issues
    if (metrics.test_organization.value < 5) {
      issues.push({
        category: 'organization',
        severity: 'medium',
        message: 'Poor test organization - missing describe blocks or setup/teardown',
        suggestion: 'Use describe blocks to group related tests and add beforeEach/afterEach for setup',
      });
    }

    // Naming issues
    if (metrics.naming_quality.value < 5) {
      issues.push({
        category: 'naming',
        severity: 'medium',
        message: 'Poor test naming - tests should clearly describe what they verify',
        suggestion: 'Use descriptive test names that explain the expected behavior',
      });
    }

    // Assertion issues
    if (metrics.assertion_quality.value < 6) {
      issues.push({
        category: 'assertions',
        severity: 'high',
        message: 'Weak assertions - too many generic or few specific assertions',
        suggestion: 'Use specific assertions like toEqual() instead of toBeTruthy()',
      });
    }

    // Coverage issues
    if (metrics.test_coverage_breadth.value < 5) {
      issues.push({
        category: 'coverage',
        severity: 'high',
        message: 'Limited test coverage - missing error cases or edge cases',
        suggestion: 'Add tests for error conditions, edge cases, and different input scenarios',
      });
    }

    // Edge case issues
    if (metrics.edge_case_coverage.value < 4) {
      issues.push({
        category: 'edge_cases',
        severity: 'medium',
        message: 'Insufficient edge case coverage',
        suggestion: 'Add tests for null/undefined values, empty inputs, and boundary conditions',
      });
    }

    // Reliability issues
    if (metrics.reliability.value < 6) {
      issues.push({
        category: 'reliability',
        severity: 'high',
        message: 'Tests may be flaky due to timing, randomness, or external dependencies',
        suggestion: 'Mock external dependencies and use deterministic test data',
      });
    }

    return issues;
  }

  /**
   * Generate improvement recommendations
   */
  generateRecommendations(metrics, issues) {
    const recommendations = [];

    // Prioritize recommendations based on impact and severity
    const _highImpactIssues = issues.filter(issue => issue.severity === 'high');
    const _mediumImpactIssues = issues.filter(issue => issue.severity === 'medium');

    // Add specific recommendations based on metrics
    if (metrics.assertion_quality.value < 7) {
      recommendations.push({
        priority: 'high',
        category: 'assertions',
        action: 'Improve assertion specificity',
        details: 'Replace generic assertions with specific ones that verify exact expected values',
      });
    }

    if (metrics.test_coverage_breadth.value < 6) {
      recommendations.push({
        priority: 'high',
        category: 'coverage',
        action: 'Expand test scenarios',
        details: 'Add tests for error handling, async operations, and integration scenarios',
      });
    }

    if (metrics.maintainability.value < 6) {
      recommendations.push({
        priority: 'medium',
        category: 'maintainability',
        action: 'Reduce code duplication',
        details: 'Extract common test setup into helper functions or use test factories',
      });
    }

    if (metrics.isolation.value < 7) {
      recommendations.push({
        priority: 'medium',
        category: 'isolation',
        action: 'Improve test isolation',
        details: 'Ensure tests can run independently by using proper setup/teardown',
      });
    }

    return recommendations;
  }

  /**
   * Estimate coverage contribution of the test
   */
  estimateCoverageContribution(metrics) {
    // Base coverage from test breadth
    let coverage = metrics.test_coverage_breadth.value * 5; // 0-50%
    
    // Bonus from assertion quality
    coverage += metrics.assertion_quality.value * 2; // 0-20%
    
    // Bonus from edge case coverage
    coverage += metrics.edge_case_coverage.value * 2; // 0-20%
    
    // Bonus from mock usage (interaction testing)
    if (metrics.mock_quality.total_mocks > 0) {
      coverage += 10; // 10% bonus
    }
    
    return Math.min(coverage, 95); // Cap at 95%
  }

  /**
   * Identify common issues across multiple test files
   */
  identifyCommonIssues(allIssues) {
    const issueCounts = {};
    
    for (const issue of allIssues) {
      const key = `${issue.category}-${issue.message}`;
      issueCounts[key] = (issueCounts[key] || 0) + 1;
    }
    
    // Return issues that appear in multiple files
    return Object.entries(issueCounts)
      .filter(([_, count]) => count > 1)
      .map(([key, count]) => {
        const [category, message] = key.split('-', 2);
        return { category, message, occurrences: count };
      })
      .sort((a, b) => b.occurrences - a.occurrences);
  }

  /**
   * Generate suite-level recommendations
   */
  generateSuiteRecommendations(suiteAssessment) {
    const recommendations = [];
    
    if (suiteAssessment.overall_suite_score < 6) {
      recommendations.push({
        priority: 'high',
        type: 'overall_quality',
        message: 'Test suite quality is below acceptable standards',
        action: 'Focus on improving test organization, assertions, and coverage breadth',
      });
    }
    
    const poorQualityFiles = suiteAssessment.quality_distribution.poor + 
                           suiteAssessment.quality_distribution.very_poor;
    
    if (poorQualityFiles > suiteAssessment.test_files * 0.3) {
      recommendations.push({
        priority: 'high',
        type: 'poor_quality_files',
        message: `${poorQualityFiles} files have poor test quality`,
        action: 'Prioritize refactoring tests with quality ratings of "poor" or "very_poor"',
      });
    }
    
    if (suiteAssessment.common_issues.length > 3) {
      recommendations.push({
        priority: 'medium',
        type: 'systematic_issues',
        message: 'Multiple files share common quality issues',
        action: 'Address systematic issues across the test suite with consistent patterns',
      });
    }
    
    return recommendations;
  }

  // Data persistence methods

  async loadQualityHistory() {
    try {
      const historyFile = path.join(this.qualityReportsDir, 'quality-history.json');
      const exists = await fs.access(historyFile).then(() => true).catch(() => false);
      
      if (exists) {
        const data = JSON.parse(await fs.readFile(historyFile, 'utf-8'));
        this.qualityHistory = data.quality_history || [];
      }
    } catch {
      // No existing data, start fresh
    }
  }

  async saveSuiteAssessment(suiteAssessment) {
    try {
      // Save individual suite assessment
      const assessmentId = `suite-${Date.now()}`;
      const assessmentFile = path.join(this.qualityReportsDir, `${assessmentId}.json`);
      await fs.writeFile(assessmentFile, JSON.stringify(suiteAssessment, null, 2));

      // Update quality history
      this.qualityHistory.push({
        assessment_id: assessmentId,
        timestamp: suiteAssessment.assessed_at,
        overall_score: suiteAssessment.overall_suite_score,
        test_files: suiteAssessment.test_files,
      });

      // Save updated history
      const historyFile = path.join(this.qualityReportsDir, 'quality-history.json');
      const historyData = {
        last_updated: new Date().toISOString(),
        quality_history: this.qualityHistory.slice(-20), // Keep last 20 assessments
      };
      await fs.writeFile(historyFile, JSON.stringify(historyData, null, 2));

      console.log(chalk.gray(`Quality assessment saved: ${assessmentFile}`));

    } catch (error) {
      console.warn(chalk.yellow(`Failed to save quality assessment: ${error.message}`));
    }
  }

  /**
   * Initialize quality standards configuration
   */
  initializeQualityStandards() {
    return {
      minimum_scores: {
        overall: 6.0,
        test_organization: 5.0,
        naming_quality: 5.0,
        assertion_quality: 6.0,
        test_coverage_breadth: 5.0,
        reliability: 6.0,
      },
      target_scores: {
        overall: 8.5,
        test_organization: 8.0,
        naming_quality: 7.5,
        assertion_quality: 8.5,
        test_coverage_breadth: 8.0,
        reliability: 8.5,
      },
      quality_thresholds: {
        excellent: 9.0,
        good: 7.5,
        fair: 6.0,
        poor: 4.0,
      },
    };
  }

  /**
   * Get quality trends over time
   */
  getQualityTrends() {
    if (this.qualityHistory.length < 2) {
      return { trend: 'insufficient_data', message: 'Need at least 2 assessments for trend calculation' };
    }

    const recent = this.qualityHistory.slice(-5); // Last 5 assessments
    const scores = recent.map(h => h.overall_score);
    
    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    const difference = lastScore - firstScore;

    let trend = 'stable';
    if (difference > 0.5) trend = 'improving';
    else if (difference < -0.5) trend = 'declining';

    return {
      trend,
      difference: difference.toFixed(1),
      current_score: lastScore,
      assessment_count: recent.length,
    };
  }
}

module.exports = TestQualityAssessment;