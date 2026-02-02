/**
 * Test Discovery
 * Gap Analysis Implementation
 *
 * Auto-detects test frameworks, test files, and provides
 * intelligent test execution capabilities.
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const { execSync, spawn } = require('child_process');

/**
 * Test framework configurations
 */
const FRAMEWORKS = {
  jest: {
    name: 'Jest',
    configFiles: ['jest.config.js', 'jest.config.ts', 'jest.config.json', 'jest.config.mjs'],
    packageKey: 'jest',
    testPatterns: [
      '**/*.test.js',
      '**/*.test.ts',
      '**/*.test.jsx',
      '**/*.test.tsx',
      '**/*.spec.js',
      '**/*.spec.ts',
    ],
    runCommand: 'npx jest',
    coverageFlag: '--coverage',
    watchFlag: '--watch',
    selectiveFlag: '--findRelatedTests',
  },
  vitest: {
    name: 'Vitest',
    configFiles: ['vitest.config.js', 'vitest.config.ts', 'vite.config.js', 'vite.config.ts'],
    packageKey: 'vitest',
    testPatterns: ['**/*.test.js', '**/*.test.ts', '**/*.spec.js', '**/*.spec.ts'],
    runCommand: 'npx vitest run',
    coverageFlag: '--coverage',
    watchFlag: '--watch',
    selectiveFlag: '--related',
  },
  mocha: {
    name: 'Mocha',
    configFiles: ['.mocharc.js', '.mocharc.json', '.mocharc.yaml', 'mocha.opts'],
    packageKey: 'mocha',
    testPatterns: ['test/**/*.js', 'test/**/*.ts', '**/*.test.js', '**/*.spec.js'],
    runCommand: 'npx mocha',
    coverageFlag: '', // Uses nyc separately
    watchFlag: '--watch',
    selectiveFlag: '--grep',
  },
  pytest: {
    name: 'Pytest',
    configFiles: ['pytest.ini', 'pyproject.toml', 'setup.cfg', 'conftest.py'],
    packageKey: 'pytest',
    testPatterns: ['test_*.py', '*_test.py', 'tests/**/*.py'],
    runCommand: 'pytest',
    coverageFlag: '--cov',
    watchFlag: '', // Uses pytest-watch
    selectiveFlag: '-k',
  },
  rspec: {
    name: 'RSpec',
    configFiles: ['.rspec', 'spec/spec_helper.rb'],
    packageKey: 'rspec',
    testPatterns: ['spec/**/*_spec.rb'],
    runCommand: 'bundle exec rspec',
    coverageFlag: '', // Uses simplecov
    watchFlag: '', // Uses guard
    selectiveFlag: '--example',
  },
  go: {
    name: 'Go Test',
    configFiles: ['go.mod'],
    packageKey: null, // Built-in
    testPatterns: ['**/*_test.go'],
    runCommand: 'go test',
    coverageFlag: '-cover',
    watchFlag: '', // Uses gowatch
    selectiveFlag: '-run',
  },
  phpunit: {
    name: 'PHPUnit',
    configFiles: ['phpunit.xml', 'phpunit.xml.dist'],
    packageKey: 'phpunit',
    testPatterns: ['tests/**/*Test.php', '**/*Test.php'],
    runCommand: 'vendor/bin/phpunit',
    coverageFlag: '--coverage-text',
    watchFlag: '', // Uses phpunit-watcher
    selectiveFlag: '--filter',
  },
  junit: {
    name: 'JUnit',
    configFiles: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
    packageKey: 'junit',
    testPatterns: ['**/Test*.java', '**/*Test.java', '**/*Tests.java'],
    runCommand: 'mvn test',
    coverageFlag: '', // Uses jacoco
    watchFlag: '',
    selectiveFlag: '-Dtest=',
  },
  playwright: {
    name: 'Playwright',
    configFiles: ['playwright.config.js', 'playwright.config.ts'],
    packageKey: '@playwright/test',
    testPatterns: ['**/*.spec.js', '**/*.spec.ts', 'e2e/**/*.js', 'e2e/**/*.ts'],
    runCommand: 'npx playwright test',
    coverageFlag: '',
    watchFlag: '',
    selectiveFlag: '--grep',
    type: 'e2e',
  },
  cypress: {
    name: 'Cypress',
    configFiles: ['cypress.config.js', 'cypress.config.ts', 'cypress.json'],
    packageKey: 'cypress',
    testPatterns: [
      'cypress/e2e/**/*.cy.js',
      'cypress/e2e/**/*.cy.ts',
      'cypress/integration/**/*.js',
    ],
    runCommand: 'npx cypress run',
    coverageFlag: '',
    watchFlag: '',
    selectiveFlag: '--spec',
    type: 'e2e',
  },
};

/**
 * FrameworkDetector - Detects test frameworks in use
 */
class FrameworkDetector {
  constructor(rootPath) {
    this.rootPath = rootPath;
  }

  /**
   * Detect all test frameworks in the project
   */
  async detect() {
    const detected = [];

    // Check package.json for Node.js projects
    const packageJson = this.readPackageJson();

    for (const [frameworkId, config] of Object.entries(FRAMEWORKS)) {
      const detection = {
        id: frameworkId,
        name: config.name,
        confidence: 0,
        configFile: null,
        inPackageJson: false,
        type: config.type || 'unit',
      };

      // Check config files
      for (const configFile of config.configFiles) {
        const configPath = path.join(this.rootPath, configFile);
        if (fs.existsSync(configPath)) {
          detection.configFile = configFile;
          detection.confidence += 50;
          break;
        }
      }

      // Check package.json
      if (packageJson && config.packageKey) {
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };
        if (deps[config.packageKey]) {
          detection.inPackageJson = true;
          detection.confidence += 40;
        }

        // Check scripts
        if (packageJson.scripts) {
          const scriptsStr = JSON.stringify(packageJson.scripts);
          if (scriptsStr.includes(config.packageKey) || scriptsStr.includes(frameworkId)) {
            detection.confidence += 10;
          }
        }
      }

      // Special case for Go
      if (frameworkId === 'go' && fs.existsSync(path.join(this.rootPath, 'go.mod'))) {
        detection.confidence = 90;
        detection.configFile = 'go.mod';
      }

      if (detection.confidence > 0) {
        detected.push(detection);
      }
    }

    // Sort by confidence
    detected.sort((a, b) => b.confidence - a.confidence);

    return detected;
  }

  /**
   * Read package.json if it exists
   */
  readPackageJson() {
    const packagePath = path.join(this.rootPath, 'package.json');
    if (!fs.existsSync(packagePath)) return null;

    try {
      return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    } catch {
      return null;
    }
  }

  /**
   * Get the primary test framework
   */
  async getPrimary() {
    const detected = await this.detect();
    return detected.length > 0 ? detected[0] : null;
  }
}

/**
 * TestFileFinder - Finds test files in the project
 */
class TestFileFinder {
  constructor(rootPath) {
    this.rootPath = rootPath;
    this.ignorePatterns = [
      'node_modules',
      'dist',
      'build',
      '.git',
      'coverage',
      'vendor',
      '__pycache__',
    ];
  }

  /**
   * Find all test files for a framework
   */
  async findTests(frameworkId) {
    const config = FRAMEWORKS[frameworkId];
    if (!config) return [];

    const testFiles = [];

    for (const pattern of config.testPatterns) {
      const files = await this.glob(pattern);
      testFiles.push(...files);
    }

    // Remove duplicates
    return [...new Set(testFiles)];
  }

  /**
   * Find all test files regardless of framework
   */
  async findAllTests() {
    const allPatterns = new Set();

    for (const config of Object.values(FRAMEWORKS)) {
      for (const pattern of config.testPatterns) {
        allPatterns.add(pattern);
      }
    }

    const testFiles = [];
    for (const pattern of allPatterns) {
      const files = await this.glob(pattern);
      testFiles.push(...files);
    }

    return [...new Set(testFiles)];
  }

  /**
   * Simple glob implementation
   */
  async glob(pattern) {
    const files = [];
    const parts = pattern.split('/');

    const walk = (dir, patternParts, depth = 0) => {
      if (depth > 10) return; // Prevent infinite recursion

      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          // Skip ignored directories
          if (entry.isDirectory() && this.ignorePatterns.includes(entry.name)) {
            continue;
          }

          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(this.rootPath, fullPath);

          if (entry.isDirectory()) {
            // Handle ** pattern
            if (patternParts[0] === '**') {
              walk(fullPath, patternParts, depth + 1);
              walk(fullPath, patternParts.slice(1), depth + 1);
            } else if (this.matchPart(entry.name, patternParts[0])) {
              walk(fullPath, patternParts.slice(1), depth + 1);
            }
          } else if (entry.isFile()) {
            // Check if file matches remaining pattern
            const remainingPattern = patternParts.join('/');
            if (
              this.matchFile(entry.name, remainingPattern) ||
              this.matchFile(entry.name, patternParts[patternParts.length - 1])
            ) {
              files.push(relativePath);
            }
          }
        }
      } catch {
        // Ignore permission errors
      }
    };

    // Handle patterns starting with **
    if (parts[0] === '**') {
      walk(this.rootPath, parts, 0);
    } else {
      walk(this.rootPath, parts, 0);
    }

    return files;
  }

  /**
   * Match a single path part against a pattern part
   */
  matchPart(name, pattern) {
    if (pattern === '**' || pattern === '*') return true;
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(name);
    }
    return name === pattern;
  }

  /**
   * Match a filename against a pattern
   */
  matchFile(filename, pattern) {
    // Handle simple wildcard patterns
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
      return regex.test(filename);
    }
    return filename === pattern;
  }

  /**
   * Find tests related to changed files
   */
  async findRelatedTests(changedFiles) {
    const allTests = await this.findAllTests();
    const relatedTests = new Set();

    for (const changedFile of changedFiles) {
      const baseName = path.basename(changedFile, path.extname(changedFile));
      const dirName = path.dirname(changedFile);

      for (const testFile of allTests) {
        // Check if test file name contains the source file name
        if (testFile.includes(baseName)) {
          relatedTests.add(testFile);
          continue;
        }

        // Check if test is in same directory or __tests__ subdirectory
        const testDir = path.dirname(testFile);
        if (testDir === dirName || testDir === path.join(dirName, '__tests__')) {
          relatedTests.add(testFile);
        }
      }
    }

    return [...relatedTests];
  }
}

/**
 * TestAnalyzer - Analyzes test files and extracts metadata
 */
class TestAnalyzer {
  /**
   * Analyze a test file
   */
  analyze(filePath, content) {
    const ext = path.extname(filePath);
    const analysis = {
      file: filePath,
      suites: [],
      tests: [],
      imports: [],
      hooks: [],
      skipped: 0,
      focused: 0,
      totalTests: 0,
    };

    switch (ext) {
      case '.js':
      case '.jsx':
      case '.ts':
      case '.tsx':
      case '.mjs':
        this.analyzeJavaScript(content, analysis);
        break;
      case '.py':
        this.analyzePython(content, analysis);
        break;
      case '.rb':
        this.analyzeRuby(content, analysis);
        break;
      case '.go':
        this.analyzeGo(content, analysis);
        break;
      case '.php':
        this.analyzePHP(content, analysis);
        break;
      case '.java':
        this.analyzeJava(content, analysis);
        break;
      default:
        // Try JavaScript patterns as fallback
        this.analyzeJavaScript(content, analysis);
    }

    analysis.totalTests = analysis.tests.length;

    return analysis;
  }

  /**
   * Analyze JavaScript/TypeScript test file
   */
  analyzeJavaScript(content, analysis) {
    // Extract imports
    const importMatches = content.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      analysis.imports.push(match[1]);
    }

    const requireMatches = content.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
    for (const match of requireMatches) {
      analysis.imports.push(match[1]);
    }

    // Extract describe blocks (suites)
    const describeMatches = content.matchAll(/describe\s*\(\s*['"`]([^'"`]+)['"`]/g);
    for (const match of describeMatches) {
      analysis.suites.push(match[1]);
    }

    // Extract test/it blocks
    const testMatches = content.matchAll(/(?:test|it)\s*\(\s*['"`]([^'"`]+)['"`]/g);
    for (const match of testMatches) {
      analysis.tests.push(match[1]);
    }

    // Check for skipped tests
    const skipMatches = content.matchAll(/(?:test|it|describe)\.skip\s*\(/g);
    analysis.skipped = [...skipMatches].length;

    // Check for focused tests (only/fit)
    const focusMatches = content.matchAll(/(?:test|it|describe)\.only\s*\(|fit\s*\(/g);
    analysis.focused = [...focusMatches].length;

    // Extract hooks
    if (content.includes('beforeEach')) analysis.hooks.push('beforeEach');
    if (content.includes('afterEach')) analysis.hooks.push('afterEach');
    if (content.includes('beforeAll')) analysis.hooks.push('beforeAll');
    if (content.includes('afterAll')) analysis.hooks.push('afterAll');
  }

  /**
   * Analyze Python test file
   */
  analyzePython(content, analysis) {
    // Extract imports
    const importMatches = content.matchAll(/(?:from|import)\s+([\w.]+)/g);
    for (const match of importMatches) {
      analysis.imports.push(match[1]);
    }

    // Extract test classes (suites)
    const classMatches = content.matchAll(/class\s+(Test\w+)/g);
    for (const match of classMatches) {
      analysis.suites.push(match[1]);
    }

    // Extract test functions
    const testMatches = content.matchAll(/def\s+(test_\w+)/g);
    for (const match of testMatches) {
      analysis.tests.push(match[1]);
    }

    // Check for skipped tests
    const skipMatches = content.matchAll(/@pytest\.mark\.skip|@unittest\.skip/g);
    analysis.skipped = [...skipMatches].length;

    // Check for fixtures
    if (content.includes('@pytest.fixture')) analysis.hooks.push('fixture');
    if (content.includes('setUp')) analysis.hooks.push('setUp');
    if (content.includes('tearDown')) analysis.hooks.push('tearDown');
  }

  /**
   * Analyze Ruby test file
   */
  analyzeRuby(content, analysis) {
    // Extract describe blocks
    const describeMatches = content.matchAll(/describe\s+['"]?([^'"]+)['"]?\s+do/g);
    for (const match of describeMatches) {
      analysis.suites.push(match[1].trim());
    }

    // Extract it blocks
    const itMatches = content.matchAll(/it\s+['"]([^'"]+)['"]\s+do/g);
    for (const match of itMatches) {
      analysis.tests.push(match[1]);
    }

    // Check for pending/skipped
    const skipMatches = content.matchAll(/(?:xit|pending)\s+/g);
    analysis.skipped = [...skipMatches].length;

    // Check for hooks
    if (content.includes('before(:each)') || content.includes('before do')) {
      analysis.hooks.push('before');
    }
    if (content.includes('after(:each)') || content.includes('after do')) {
      analysis.hooks.push('after');
    }
  }

  /**
   * Analyze Go test file
   */
  analyzeGo(content, analysis) {
    // Extract test functions
    const testMatches = content.matchAll(/func\s+(Test\w+)\s*\(/g);
    for (const match of testMatches) {
      analysis.tests.push(match[1]);
    }

    // Extract benchmark functions
    const benchMatches = content.matchAll(/func\s+(Benchmark\w+)\s*\(/g);
    for (const match of benchMatches) {
      analysis.tests.push(match[1]);
    }

    // Check for t.Skip
    const skipMatches = content.matchAll(/t\.Skip\(/g);
    analysis.skipped = [...skipMatches].length;
  }

  /**
   * Analyze PHP test file
   */
  analyzePHP(content, analysis) {
    // Extract test class
    const classMatches = content.matchAll(/class\s+(\w+Test)\s+extends/g);
    for (const match of classMatches) {
      analysis.suites.push(match[1]);
    }

    // Extract test methods
    const testMatches = content.matchAll(/function\s+(test\w+)\s*\(/g);
    for (const match of testMatches) {
      analysis.tests.push(match[1]);
    }

    // Also check for @test annotation
    const annotationMatches = content.matchAll(/@test[\s\S]*?function\s+(\w+)\s*\(/g);
    for (const match of annotationMatches) {
      if (!analysis.tests.includes(match[1])) {
        analysis.tests.push(match[1]);
      }
    }

    // Check for skipped
    const skipMatches = content.matchAll(/->markTestSkipped\(|@skip/g);
    analysis.skipped = [...skipMatches].length;
  }

  /**
   * Analyze Java test file
   */
  analyzeJava(content, analysis) {
    // Extract test class
    const classMatches = content.matchAll(/class\s+(\w+(?:Test|Tests))\s+/g);
    for (const match of classMatches) {
      analysis.suites.push(match[1]);
    }

    // Extract test methods (@Test annotation)
    const testMatches = content.matchAll(/@Test[\s\S]*?(?:public|void)\s+(?:void\s+)?(\w+)\s*\(/g);
    for (const match of testMatches) {
      analysis.tests.push(match[1]);
    }

    // Check for disabled tests
    const skipMatches = content.matchAll(/@Disabled|@Ignore/g);
    analysis.skipped = [...skipMatches].length;

    // Check for lifecycle methods
    if (content.includes('@BeforeEach') || content.includes('@Before')) {
      analysis.hooks.push('beforeEach');
    }
    if (content.includes('@AfterEach') || content.includes('@After')) {
      analysis.hooks.push('afterEach');
    }
  }
}

/**
 * CoverageAnalyzer - Analyzes test coverage configuration
 */
class CoverageAnalyzer {
  constructor(rootPath) {
    this.rootPath = rootPath;
  }

  /**
   * Analyze coverage configuration
   */
  async analyze() {
    const result = {
      enabled: false,
      tool: null,
      threshold: null,
      include: [],
      exclude: [],
      reportFormats: [],
    };

    // Check Jest coverage config
    const jestConfig = this.readConfig(['jest.config.js', 'jest.config.ts', 'jest.config.json']);
    if (jestConfig) {
      if (jestConfig.collectCoverage || jestConfig.coverageThreshold) {
        result.enabled = true;
        result.tool = 'jest';
        result.threshold =
          jestConfig.coverageThreshold?.global?.branches ||
          jestConfig.coverageThreshold?.global?.lines;
        result.include = jestConfig.collectCoverageFrom || [];
        result.exclude = jestConfig.coveragePathIgnorePatterns || [];
        result.reportFormats = jestConfig.coverageReporters || ['text', 'lcov'];
      }
    }

    // Check nyc config (for Mocha)
    const nycConfig = this.readConfig(['.nycrc', '.nycrc.json', 'nyc.config.js']);
    if (nycConfig) {
      result.enabled = true;
      result.tool = 'nyc';
      result.threshold = nycConfig.branches || nycConfig.lines;
      result.include = nycConfig.include || [];
      result.exclude = nycConfig.exclude || [];
      result.reportFormats = nycConfig.reporter || ['text', 'lcov'];
    }

    // Check pytest coverage
    const pytestConfig = this.readConfig(['pytest.ini', 'setup.cfg', 'pyproject.toml']);
    if (
      pytestConfig &&
      (pytestConfig.addopts?.includes('--cov') ||
        pytestConfig.tool?.pytest?.ini_options?.addopts?.includes('--cov'))
    ) {
      result.enabled = true;
      result.tool = 'pytest-cov';
    }

    // Check package.json scripts
    const packageJson = this.readConfig(['package.json']);
    if (packageJson?.scripts) {
      const scriptsStr = JSON.stringify(packageJson.scripts);
      if (scriptsStr.includes('coverage') || scriptsStr.includes('--coverage')) {
        result.enabled = true;
        if (!result.tool) result.tool = 'unknown';
      }
    }

    return result;
  }

  /**
   * Read configuration file
   */
  readConfig(files) {
    for (const file of files) {
      const fullPath = path.join(this.rootPath, file);
      if (!fs.existsSync(fullPath)) continue;

      try {
        const content = fs.readFileSync(fullPath, 'utf8');

        if (file.endsWith('.json') || file === 'package.json') {
          return JSON.parse(content);
        }

        if (file.endsWith('.js') || file.endsWith('.ts')) {
          // Extract object from module.exports
          const match = content.match(/module\.exports\s*=\s*(\{[\s\S]*\})/);
          if (match) {
            try {
              // eslint-disable-next-line no-eval
              return eval('(' + match[1] + ')');
            } catch {
              return {};
            }
          }
        }

        return { raw: content };
      } catch {
        continue;
      }
    }
    return null;
  }
}

/**
 * TestRunner - Executes tests
 */
class TestRunner extends EventEmitter {
  constructor(rootPath, frameworkId) {
    super();
    this.rootPath = rootPath;
    this.frameworkId = frameworkId;
    this.framework = FRAMEWORKS[frameworkId];
    this.process = null;
  }

  /**
   * Run all tests
   */
  async runAll(options = {}) {
    const args = [];

    if (options.coverage && this.framework.coverageFlag) {
      args.push(this.framework.coverageFlag);
    }

    if (options.watch && this.framework.watchFlag) {
      args.push(this.framework.watchFlag);
    }

    if (options.verbose) {
      args.push('--verbose');
    }

    return this.execute(args, options);
  }

  /**
   * Run specific test files
   */
  async runFiles(files, options = {}) {
    const args = [...files];

    if (options.coverage && this.framework.coverageFlag) {
      args.push(this.framework.coverageFlag);
    }

    return this.execute(args, options);
  }

  /**
   * Run tests related to changed files
   */
  async runRelated(changedFiles, options = {}) {
    if (!this.framework.selectiveFlag) {
      // Framework doesn't support selective testing, run all
      return this.runAll(options);
    }

    const args = [this.framework.selectiveFlag, ...changedFiles];

    if (options.coverage && this.framework.coverageFlag) {
      args.push(this.framework.coverageFlag);
    }

    return this.execute(args, options);
  }

  /**
   * Run tests matching a pattern
   */
  async runPattern(pattern, options = {}) {
    const args = [];

    // Different frameworks handle patterns differently
    switch (this.frameworkId) {
      case 'jest':
      case 'vitest':
        args.push('-t', pattern);
        break;
      case 'mocha':
        args.push('--grep', pattern);
        break;
      case 'pytest':
        args.push('-k', pattern);
        break;
      case 'rspec':
        args.push('--example', pattern);
        break;
      case 'go':
        args.push('-run', pattern);
        break;
      default:
        args.push(pattern);
    }

    if (options.coverage && this.framework.coverageFlag) {
      args.push(this.framework.coverageFlag);
    }

    return this.execute(args, options);
  }

  /**
   * Execute test command
   */
  execute(args, options = {}) {
    return new Promise((resolve, reject) => {
      const command = this.framework.runCommand;
      const [cmd, ...cmdArgs] = command.split(' ');
      const fullArgs = [...cmdArgs, ...args];

      this.emit('run:start', { command, args: fullArgs });

      const startTime = Date.now();
      let stdout = '';
      let stderr = '';

      this.process = spawn(cmd, fullArgs, {
        cwd: this.rootPath,
        shell: true,
        env: {
          ...process.env,
          FORCE_COLOR: '1',
          CI: options.ci ? 'true' : undefined,
        },
      });

      this.process.stdout.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        this.emit('output', { type: 'stdout', text });
      });

      this.process.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        this.emit('output', { type: 'stderr', text });
      });

      this.process.on('close', (code) => {
        const duration = Date.now() - startTime;

        const result = {
          success: code === 0,
          exitCode: code,
          duration,
          stdout,
          stderr,
          summary: this.parseOutput(stdout + stderr),
        };

        this.emit('run:complete', result);
        this.process = null;

        if (code === 0 || options.allowFailure) {
          resolve(result);
        } else {
          reject(new Error(`Tests failed with exit code ${code}`));
        }
      });

      this.process.on('error', (error) => {
        this.emit('run:error', { error: error.message });
        reject(error);
      });
    });
  }

  /**
   * Parse test output for summary
   */
  parseOutput(output) {
    const summary = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: null,
    };

    // Jest/Vitest format
    const jestMatch = output.match(
      /Tests:\s+(\d+)\s+passed(?:,\s+(\d+)\s+failed)?(?:,\s+(\d+)\s+skipped)?(?:,\s+(\d+)\s+total)?/
    );
    if (jestMatch) {
      summary.passed = parseInt(jestMatch[1]) || 0;
      summary.failed = parseInt(jestMatch[2]) || 0;
      summary.skipped = parseInt(jestMatch[3]) || 0;
      summary.total = parseInt(jestMatch[4]) || summary.passed + summary.failed + summary.skipped;
      return summary;
    }

    // Mocha format
    const mochaMatch = output.match(/(\d+)\s+passing.*?(\d+)\s+failing/s);
    if (mochaMatch) {
      summary.passed = parseInt(mochaMatch[1]) || 0;
      summary.failed = parseInt(mochaMatch[2]) || 0;
      summary.total = summary.passed + summary.failed;
      return summary;
    }

    // Pytest format
    const pytestMatch = output.match(
      /(\d+)\s+passed(?:,\s+(\d+)\s+failed)?(?:,\s+(\d+)\s+skipped)?/
    );
    if (pytestMatch) {
      summary.passed = parseInt(pytestMatch[1]) || 0;
      summary.failed = parseInt(pytestMatch[2]) || 0;
      summary.skipped = parseInt(pytestMatch[3]) || 0;
      summary.total = summary.passed + summary.failed + summary.skipped;
      return summary;
    }

    // Go format
    const goMatch = output.match(/ok\s+.*?\s+([\d.]+)s|FAIL\s+.*?\s+([\d.]+)s/g);
    if (goMatch) {
      summary.total = goMatch.length;
      summary.passed = (output.match(/ok\s+/g) || []).length;
      summary.failed = (output.match(/FAIL\s+/g) || []).length;
      return summary;
    }

    return summary;
  }

  /**
   * Stop running tests
   */
  stop() {
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
  }
}

/**
 * TestDiscovery - Main discovery engine
 */
class TestDiscovery extends EventEmitter {
  constructor(config = {}) {
    super();
    this.rootPath = config.rootPath || process.cwd();
    this.detector = new FrameworkDetector(this.rootPath);
    this.finder = new TestFileFinder(this.rootPath);
    this.analyzer = new TestAnalyzer();
    this.coverageAnalyzer = new CoverageAnalyzer(this.rootPath);
  }

  /**
   * Full scan of test infrastructure
   */
  async scan(options = {}) {
    this.emit('scan:start', { rootPath: this.rootPath });

    const result = {
      frameworks: [],
      primaryFramework: null,
      testFiles: [],
      analysis: {},
      coverage: {},
      summary: {},
    };

    try {
      // Detect frameworks
      result.frameworks = await this.detector.detect();
      result.primaryFramework = result.frameworks[0] || null;
      this.emit('frameworks:detected', { count: result.frameworks.length });

      // Find test files
      if (result.primaryFramework) {
        result.testFiles = await this.finder.findTests(result.primaryFramework.id);
      } else {
        result.testFiles = await this.finder.findAllTests();
      }
      this.emit('files:found', { count: result.testFiles.length });

      // Analyze test files (optional, can be slow)
      if (options.analyzeFiles && result.testFiles.length <= 100) {
        for (const file of result.testFiles) {
          try {
            const content = fs.readFileSync(path.join(this.rootPath, file), 'utf8');
            result.analysis[file] = this.analyzer.analyze(file, content);
          } catch {
            // Skip files that can't be read
          }
        }
      }

      // Analyze coverage
      result.coverage = await this.coverageAnalyzer.analyze();

      // Generate summary
      result.summary = this.generateSummary(result);
      this.emit('scan:complete', result);

      return result;
    } catch (error) {
      this.emit('scan:error', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate summary from scan results
   */
  generateSummary(result) {
    const summary = {
      hasTests: result.testFiles.length > 0,
      framework: result.primaryFramework?.name || 'Unknown',
      frameworkId: result.primaryFramework?.id || null,
      testFileCount: result.testFiles.length,
      hasCoverage: result.coverage.enabled,
      coverageTool: result.coverage.tool,
      coverageThreshold: result.coverage.threshold,
      testTypes: {
        unit: 0,
        e2e: 0,
      },
    };

    // Count test types
    for (const framework of result.frameworks) {
      if (framework.type === 'e2e') {
        summary.testTypes.e2e++;
      } else {
        summary.testTypes.unit++;
      }
    }

    // Count tests from analysis
    if (Object.keys(result.analysis).length > 0) {
      summary.totalTests = 0;
      summary.totalSuites = 0;
      summary.skippedTests = 0;

      for (const analysis of Object.values(result.analysis)) {
        summary.totalTests += analysis.totalTests;
        summary.totalSuites += analysis.suites.length;
        summary.skippedTests += analysis.skipped;
      }
    }

    return summary;
  }

  /**
   * Quick check for test presence
   */
  async quickCheck() {
    const frameworks = await this.detector.detect();
    const primary = frameworks[0];

    let fileCount = 0;
    if (primary) {
      const files = await this.finder.findTests(primary.id);
      fileCount = files.length;
    }

    return {
      hasTests: frameworks.length > 0 && fileCount > 0,
      framework: primary?.name || null,
      fileCount,
    };
  }

  /**
   * Find tests affected by changed files
   */
  async findAffected(changedFiles) {
    return this.finder.findRelatedTests(changedFiles);
  }

  /**
   * Run tests
   */
  async run(options = {}) {
    const primary = await this.detector.getPrimary();

    if (!primary) {
      throw new Error('No test framework detected');
    }

    const runner = new TestRunner(this.rootPath, primary.id);

    // Forward events
    runner.on('run:start', (data) => this.emit('run:start', data));
    runner.on('output', (data) => this.emit('output', data));
    runner.on('run:complete', (data) => this.emit('run:complete', data));
    runner.on('run:error', (data) => this.emit('run:error', data));

    if (options.files) {
      return runner.runFiles(options.files, options);
    } else if (options.related) {
      return runner.runRelated(options.related, options);
    } else if (options.pattern) {
      return runner.runPattern(options.pattern, options);
    } else {
      return runner.runAll(options);
    }
  }

  /**
   * Run tests affected by changed files
   */
  async runAffected(changedFiles, options = {}) {
    const affectedTests = await this.findAffected(changedFiles);

    if (affectedTests.length === 0) {
      return { success: true, message: 'No affected tests found', tests: [] };
    }

    return this.run({ ...options, files: affectedTests });
  }

  /**
   * Get changed files from git
   */
  async getChangedFiles(baseBranch = 'main') {
    try {
      const output = execSync(`git diff --name-only ${baseBranch}...HEAD`, {
        cwd: this.rootPath,
        encoding: 'utf8',
      });
      return output.split('\n').filter((f) => f.trim());
    } catch {
      // Fallback to unstaged changes
      try {
        const output = execSync('git diff --name-only', {
          cwd: this.rootPath,
          encoding: 'utf8',
        });
        return output.split('\n').filter((f) => f.trim());
      } catch {
        return [];
      }
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const discovery = new TestDiscovery();

  discovery.on('frameworks:detected', ({ count }) => {
    console.log(`Found ${count} test framework(s)`);
  });

  discovery.on('files:found', ({ count }) => {
    console.log(`Found ${count} test file(s)`);
  });

  discovery.on('output', ({ text }) => {
    process.stdout.write(text);
  });

  if (args.includes('--quick')) {
    discovery.quickCheck().then((result) => {
      console.log(JSON.stringify(result, null, 2));
    });
  } else if (args.includes('--run')) {
    discovery
      .run({
        coverage: args.includes('--coverage'),
        verbose: args.includes('--verbose'),
      })
      .then((result) => {
        console.log('\n--- Results ---');
        console.log(JSON.stringify(result.summary, null, 2));
        process.exit(result.success ? 0 : 1);
      })
      .catch((error) => {
        console.error('Error:', error.message);
        process.exit(1);
      });
  } else if (args.includes('--affected')) {
    discovery
      .getChangedFiles()
      .then((files) => discovery.runAffected(files))
      .then((result) => {
        if (result.message) {
          console.log(result.message);
        } else {
          console.log('\n--- Results ---');
          console.log(JSON.stringify(result.summary, null, 2));
        }
        process.exit(result.success ? 0 : 1);
      })
      .catch((error) => {
        console.error('Error:', error.message);
        process.exit(1);
      });
  } else {
    discovery
      .scan({ analyzeFiles: args.includes('--analyze') })
      .then((result) => {
        console.log('\n--- Summary ---');
        console.log(JSON.stringify(result.summary, null, 2));

        if (args.includes('--files')) {
          console.log('\n--- Test Files ---');
          for (const file of result.testFiles) {
            console.log(`  ${file}`);
          }
        }
      })
      .catch((error) => {
        console.error('Error:', error.message);
        process.exit(1);
      });
  }
}

module.exports = TestDiscovery;
module.exports.TestDiscovery = TestDiscovery;
module.exports.FrameworkDetector = FrameworkDetector;
module.exports.TestFileFinder = TestFileFinder;
module.exports.TestAnalyzer = TestAnalyzer;
module.exports.CoverageAnalyzer = CoverageAnalyzer;
module.exports.TestRunner = TestRunner;
module.exports.FRAMEWORKS = FRAMEWORKS;
