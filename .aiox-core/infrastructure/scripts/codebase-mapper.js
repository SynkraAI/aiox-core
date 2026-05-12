#!/usr/bin/env node

/**
 * AIOX Codebase Mapper
 *
 * Story: 7.2 - Codebase Mapper
 * Epic: Epic 7 - Memory Layer
 *
 * Generates comprehensive maps of the codebase for context generation.
 * Used by the Context Generator (Epic 4) to understand project structure.
 *
 * Features:
 * - AC1: Located in `.aiox-core/infrastructure/scripts/`
 * - AC2: Generates: services, directories, patterns, conventions, dependencies
 * - AC3: Output: `.aiox/codebase-map.json`
 * - AC4: Automatic updates after significant merges
 * - AC5: Command `*map-codebase` available globally
 * - AC6: Used by Context Generator (Epic 4)
 * - AC7: Excludes node_modules, .git, build outputs
 *
 * @author @architect (Aria)
 * @version 1.0.0
 */

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // AC3: Output path
  outputPath: '.aiox/codebase-map.json',
  // Schema version
  schemaVersion: '1.0',
  // Default max depth
  defaultMaxDepth: 5,
  // AC7: Directories to exclude
  excludeDirs: [
    'node_modules',
    '.git',
    'dist',
    'build',
    'out',
    '.next',
    '.nuxt',
    '.svelte-kit',
    'coverage',
    '.cache',
    '.parcel-cache',
    '.turbo',
    '__pycache__',
    '.pytest_cache',
    'venv',
    '.venv',
    'env',
    '.env',
    'vendor',
    'tmp',
    'temp',
    'logs',
  ],
  // File patterns to exclude
  excludeFiles: [
    '*.log',
    '*.lock',
    '*.map',
    '.DS_Store',
    'Thumbs.db',
    '*.min.js',
    '*.min.css',
    '*.chunk.js',
    '*.bundle.js',
  ],
  // File extensions to analyze for patterns
  codeExtensions: [
    '.js', '.mjs', '.cjs',
    '.ts', '.tsx', '.jsx',
    '.py', '.rb', '.go',
    '.java', '.kt', '.scala',
    '.rs', '.cpp', '.c', '.h',
    '.vue', '.svelte',
  ],
  // Config file names to detect
  configFiles: [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'vite.config.js',
    'next.config.js',
    'next.config.mjs',
    'nuxt.config.ts',
    'webpack.config.js',
    '.eslintrc',
    '.eslintrc.js',
    '.prettierrc',
    'jest.config.js',
    'vitest.config.ts',
    'turbo.json',
    'pnpm-workspace.yaml',
    'lerna.json',
    'nx.json',
    'docker-compose.yml',
    'Dockerfile',
    '.env.example',
    'pyproject.toml',
    'Cargo.toml',
    'go.mod',
    'Gemfile',
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              PATTERN DETECTORS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Pattern detection rules for common frameworks and conventions
 */
const PatternDetectors = {
  // State management patterns
  stateManagement: {
    'zustand': {
      patterns: [/import.*from ['"]zustand['"]/, /create\s*\(/],
      files: ['**/stores/**', '**/store/**'],
    },
    'redux': {
      patterns: [/import.*from ['"]@reduxjs\/toolkit['"]/, /createSlice\(/, /configureStore\(/],
      files: ['**/store/**', '**/slices/**', '**/reducers/**'],
    },
    'mobx': {
      patterns: [/import.*from ['"]mobx['"]/, /@observable/, /@action/],
      files: ['**/stores/**'],
    },
    'vuex': {
      patterns: [/import.*from ['"]vuex['"]/, /createStore\(/],
      files: ['**/store/**'],
    },
    'pinia': {
      patterns: [/import.*from ['"]pinia['"]/, /defineStore\(/],
      files: ['**/stores/**'],
    },
    'context-api': {
      patterns: [/createContext\(/, /useContext\(/],
      files: ['**/contexts/**', '**/context/**'],
    },
  },

  // API patterns
  apiPatterns: {
    'fetch-wrapper': {
      patterns: [/export.*fetch/, /async.*fetch\(/],
      files: ['**/lib/api.*', '**/utils/api.*', '**/services/api.*'],
    },
    'axios': {
      patterns: [/import.*from ['"]axios['"]/, /axios\.create\(/],
      files: ['**/lib/axios.*', '**/services/**'],
    },
    'react-query': {
      patterns: [/import.*from ['"]@tanstack\/react-query['"]/, /useQuery\(/, /useMutation\(/],
      files: ['**/hooks/**', '**/queries/**'],
    },
    'swr': {
      patterns: [/import.*from ['"]swr['"]/, /useSWR\(/],
      files: ['**/hooks/**'],
    },
    'trpc': {
      patterns: [/import.*from ['"]@trpc\//, /trpc\.router\(/],
      files: ['**/trpc/**', '**/server/routers/**'],
    },
    'graphql': {
      patterns: [/import.*from ['"]@apollo\/client['"]/, /gql`/, /useQuery\(/],
      files: ['**/graphql/**', '**/*.graphql'],
    },
  },

  // Testing patterns
  testingPatterns: {
    'jest': {
      patterns: [/describe\(/, /it\(/, /test\(/, /expect\(/],
      files: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
    },
    'vitest': {
      patterns: [/import.*from ['"]vitest['"]/, /vi\.fn\(/],
      files: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
    },
    'react-testing-library': {
      patterns: [/import.*from ['"]@testing-library\/react['"]/, /render\(/, /screen\./],
      files: ['**/__tests__/**', '**/*.test.*'],
    },
    'cypress': {
      patterns: [/cy\./, /describe\(/, /it\(/],
      files: ['**/cypress/**', '**/*.cy.*'],
    },
    'playwright': {
      patterns: [/import.*from ['"]@playwright\/test['"]/, /test\(/, /expect\(/],
      files: ['**/e2e/**', '**/*.spec.ts'],
    },
  },

  // Error handling patterns
  errorHandling: {
    'try-catch-toast': {
      patterns: [/try\s*{[\s\S]*catch[\s\S]*toast\./],
      files: null,
    },
    'error-boundary': {
      patterns: [/ErrorBoundary/, /componentDidCatch/],
      files: ['**/components/**'],
    },
    'global-error-handler': {
      patterns: [/window\.onerror/, /process\.on\(['"]uncaughtException['"]\)/],
      files: null,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CODEBASE MAPPER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

class CodebaseMapper {
  /**
   * Create a new CodebaseMapper instance
   *
   * @param {string} rootPath - Project root path
   * @param {Object} options - Configuration options
   * @param {number} [options.maxDepth] - Maximum directory depth to scan
   * @param {string[]} [options.excludeDirs] - Additional directories to exclude
   * @param {boolean} [options.quiet] - Suppress output
   */
  constructor(rootPath, options = {}) {
    this.rootPath = rootPath || process.cwd();
    this.maxDepth = options.maxDepth || CONFIG.defaultMaxDepth;
    this.excludeDirs = [...CONFIG.excludeDirs, ...(options.excludeDirs || [])];
    this.quiet = options.quiet || false;

    // Internal state
    this._structure = {};
    this._services = [];
    this._patterns = {};
    this._conventions = {};
    this._dependencies = { runtime: [], dev: [] };
    this._fileIndex = new Map();
    this._configFiles = [];
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              SCANNING
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Scan the codebase directory structure
   * @returns {Promise<void>}
   */
  async scanDirectory() {
    if (!this.quiet) {
      console.log(`\nScanning codebase: ${this.rootPath}`);
    }

    this._structure = await this._scanRecursive(this.rootPath, 0);

    if (!this.quiet) {
      console.log(`Found ${this._fileIndex.size} files`);
    }
  }

  /**
   * Recursively scan directories
   * @private
   */
  async _scanRecursive(dirPath, depth) {
    const result = {
      type: 'directory',
      purpose: this._inferPurpose(path.basename(dirPath)),
      children: {},
      files: [],
    };

    if (depth >= this.maxDepth) {
      return result;
    }

    try {
      const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(this.rootPath, fullPath);

        // AC7: Skip excluded directories
        if (entry.isDirectory()) {
          if (this._isExcluded(entry.name)) {
            continue;
          }

          result.children[entry.name] = await this._scanRecursive(fullPath, depth + 1);
        } else if (entry.isFile()) {
          // Skip excluded files
          if (this._isExcludedFile(entry.name)) {
            continue;
          }

          const fileInfo = await this._analyzeFile(fullPath, relativePath);
          result.files.push(entry.name);
          this._fileIndex.set(relativePath, fileInfo);

          // Track config files
          if (CONFIG.configFiles.includes(entry.name)) {
            this._configFiles.push({ name: entry.name, path: relativePath });
          }
        }
      }
    } catch (error) {
      if (!this.quiet) {
        console.warn(`Warning: Cannot access ${dirPath}: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Analyze a single file
   * @private
   */
  async _analyzeFile(fullPath, relativePath) {
    const stats = await fsPromises.stat(fullPath);
    const ext = path.extname(fullPath).toLowerCase();

    const fileInfo = {
      path: relativePath,
      size: stats.size,
      extension: ext,
      modified: stats.mtime.toISOString(),
    };

    // Only read code files for pattern analysis
    if (CONFIG.codeExtensions.includes(ext) && stats.size < 500000) {
      try {
        const content = await fsPromises.readFile(fullPath, 'utf-8');
        fileInfo.lineCount = content.split('\n').length;
        fileInfo.hasTests = /\.(test|spec)\.(js|ts|jsx|tsx)$/.test(relativePath);
        fileInfo.isComponent = /\.(jsx|tsx|vue|svelte)$/.test(ext);

        // Extract imports for dependency graph
        fileInfo.imports = this._extractImports(content);

        // Extract exports
        fileInfo.exports = this._extractExports(content);
      } catch {
        // Ignore read errors
      }
    }

    return fileInfo;
  }

  /**
   * Check if directory should be excluded (AC7)
   * @private
   */
  _isExcluded(name) {
    return this.excludeDirs.includes(name) || name.startsWith('.');
  }

  /**
   * Check if file should be excluded
   * @private
   */
  _isExcludedFile(name) {
    return CONFIG.excludeFiles.some(pattern => {
      if (pattern.startsWith('*')) {
        return name.endsWith(pattern.slice(1));
      }
      return name === pattern;
    });
  }

  /**
   * Infer directory purpose from name
   * @private
   */
  _inferPurpose(dirName) {
    const purposes = {
      src: 'Application source code',
      lib: 'Library/utility code',
      utils: 'Utility functions',
      helpers: 'Helper functions',
      components: 'UI components',
      pages: 'Page components/routes',
      views: 'View components',
      stores: 'State management stores',
      store: 'State management',
      hooks: 'Custom React/Vue hooks',
      composables: 'Vue composables',
      services: 'Service layer/API clients',
      api: 'API routes/endpoints',
      server: 'Server-side code',
      client: 'Client-side code',
      public: 'Static assets',
      assets: 'Media/static files',
      styles: 'CSS/styling files',
      types: 'TypeScript type definitions',
      interfaces: 'Interface definitions',
      models: 'Data models/schemas',
      schemas: 'Data schemas',
      config: 'Configuration files',
      tests: 'Test files',
      __tests__: 'Jest test files',
      e2e: 'End-to-end tests',
      cypress: 'Cypress tests',
      docs: 'Documentation',
      scripts: 'Build/utility scripts',
      bin: 'CLI/executable scripts',
      migrations: 'Database migrations',
      seeders: 'Database seeders',
      middleware: 'Middleware functions',
      plugins: 'Plugin/extension code',
      locales: 'i18n/localization files',
      i18n: 'Internationalization',
    };

    return purposes[dirName.toLowerCase()] || null;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              PATTERN DETECTION
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Detect patterns in the codebase
   * @returns {Promise<Object>}
   */
  async detectPatterns() {
    if (!this.quiet) {
      console.log('Detecting patterns...');
    }

    const patterns = {
      stateManagement: null,
      apiCalls: null,
      errorHandling: null,
      testing: null,
    };

    // Sample files for pattern detection
    const sampleFiles = this._getSampleFiles();

    for (const [filePath, fileInfo] of sampleFiles) {
      if (!fileInfo.imports) continue;

      try {
        const fullPath = path.join(this.rootPath, filePath);
        const content = await fsPromises.readFile(fullPath, 'utf-8');

        // Detect state management
        if (!patterns.stateManagement) {
          for (const [name, detector] of Object.entries(PatternDetectors.stateManagement)) {
            if (this._matchesPattern(content, detector.patterns)) {
              patterns.stateManagement = name;
              break;
            }
          }
        }

        // Detect API patterns
        if (!patterns.apiCalls) {
          for (const [name, detector] of Object.entries(PatternDetectors.apiPatterns)) {
            if (this._matchesPattern(content, detector.patterns)) {
              patterns.apiCalls = name;
              break;
            }
          }
        }

        // Detect testing patterns
        if (!patterns.testing && fileInfo.hasTests) {
          for (const [name, detector] of Object.entries(PatternDetectors.testingPatterns)) {
            if (this._matchesPattern(content, detector.patterns)) {
              patterns.testing = name;
              break;
            }
          }
        }

        // Detect error handling
        if (!patterns.errorHandling) {
          for (const [name, detector] of Object.entries(PatternDetectors.errorHandling)) {
            if (this._matchesPattern(content, detector.patterns)) {
              patterns.errorHandling = name;
              break;
            }
          }
        }
      } catch {
        // Skip files that can't be read
      }
    }

    // Try to infer patterns from directory structure
    if (!patterns.stateManagement) {
      if (this._hasDirectory('stores')) {
        patterns.stateManagement = 'store-based (inferred from directory)';
      }
    }

    this._patterns = patterns;
    return patterns;
  }

  /**
   * Match content against pattern array
   * @private
   */
  _matchesPattern(content, patterns) {
    return patterns.some(pattern => pattern.test(content));
  }

  /**
   * Get sample files for pattern detection
   * @private
   */
  _getSampleFiles() {
    const samples = [];
    const maxSamples = 50;

    for (const [filePath, fileInfo] of this._fileIndex) {
      if (CONFIG.codeExtensions.includes(fileInfo.extension)) {
        samples.push([filePath, fileInfo]);
        if (samples.length >= maxSamples) break;
      }
    }

    return samples;
  }

  /**
   * Check if directory exists in structure
   * @private
   */
  _hasDirectory(name) {
    const checkRecursive = (obj) => {
      if (obj.children && obj.children[name]) return true;
      for (const child of Object.values(obj.children || {})) {
        if (checkRecursive(child)) return true;
      }
      return false;
    };
    return checkRecursive(this._structure);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              CONVENTION DETECTION
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Detect coding conventions
   * @returns {Promise<Object>}
   */
  async detectConventions() {
    if (!this.quiet) {
      console.log('Detecting conventions...');
    }

    const conventions = {
      fileNaming: this._detectFileNaming(),
      componentNaming: this._detectComponentNaming(),
      imports: this._detectImportStyle(),
      exports: this._detectExportStyle(),
      indentation: null,
      quotes: null,
    };

    // Detect from config files
    const eslintConfig = this._configFiles.find(f => f.name.startsWith('.eslintrc'));
    const prettierConfig = this._configFiles.find(f => f.name.startsWith('.prettierrc'));

    if (eslintConfig || prettierConfig) {
      conventions.linting = eslintConfig ? 'ESLint' : 'Prettier';
    }

    // Detect TypeScript usage
    const tsConfig = this._configFiles.find(f => f.name === 'tsconfig.json');
    if (tsConfig) {
      conventions.language = 'TypeScript';
      conventions.typeChecking = 'strict'; // Default assumption
    } else {
      conventions.language = 'JavaScript';
    }

    this._conventions = conventions;
    return conventions;
  }

  /**
   * Detect file naming convention
   * @private
   */
  _detectFileNaming() {
    const namingPatterns = {
      camelCase: 0,
      kebabCase: 0,
      snakeCase: 0,
      PascalCase: 0,
    };

    for (const [filePath] of this._fileIndex) {
      const fileName = path.basename(filePath, path.extname(filePath));

      // Skip test files and index files
      if (fileName === 'index' || fileName.includes('.test') || fileName.includes('.spec')) {
        continue;
      }

      if (/^[a-z][a-zA-Z0-9]*$/.test(fileName)) {
        if (fileName.includes('-')) {
          namingPatterns.kebabCase++;
        } else if (fileName.includes('_')) {
          namingPatterns.snakeCase++;
        } else {
          namingPatterns.camelCase++;
        }
      } else if (/^[A-Z][a-zA-Z0-9]*$/.test(fileName)) {
        namingPatterns.PascalCase++;
      } else if (/^[a-z]+(-[a-z]+)*$/.test(fileName)) {
        namingPatterns.kebabCase++;
      } else if (/^[a-z]+(_[a-z]+)*$/.test(fileName)) {
        namingPatterns.snakeCase++;
      }
    }

    const dominant = Object.entries(namingPatterns)
      .sort((a, b) => b[1] - a[1])[0];

    if (dominant[1] > 0) {
      return `${dominant[0]} (${dominant[1]} files)`;
    }
    return 'mixed';
  }

  /**
   * Detect component naming convention
   * @private
   */
  _detectComponentNaming() {
    let pascalCount = 0;
    let totalComponents = 0;

    for (const [filePath, fileInfo] of this._fileIndex) {
      if (fileInfo.isComponent) {
        totalComponents++;
        const fileName = path.basename(filePath, path.extname(filePath));
        if (/^[A-Z][a-zA-Z0-9]*$/.test(fileName)) {
          pascalCount++;
        }
      }
    }

    if (totalComponents === 0) return null;

    const ratio = pascalCount / totalComponents;
    if (ratio > 0.8) return 'PascalCase';
    if (ratio > 0.5) return 'mostly PascalCase';
    return 'mixed';
  }

  /**
   * Detect import style
   * @private
   */
  _detectImportStyle() {
    let absoluteCount = 0;
    let relativeCount = 0;

    for (const [, fileInfo] of this._fileIndex) {
      if (!fileInfo.imports) continue;

      for (const imp of fileInfo.imports) {
        if (imp.startsWith('@/') || imp.startsWith('~/')) {
          absoluteCount++;
        } else if (imp.startsWith('./') || imp.startsWith('../')) {
          relativeCount++;
        }
      }
    }

    if (absoluteCount > relativeCount * 2) {
      return 'absolute via @/ alias';
    } else if (relativeCount > absoluteCount * 2) {
      return 'relative paths';
    }
    return 'mixed (absolute and relative)';
  }

  /**
   * Detect export style
   * @private
   */
  _detectExportStyle() {
    let namedCount = 0;
    let defaultCount = 0;

    for (const [, fileInfo] of this._fileIndex) {
      if (!fileInfo.exports) continue;

      namedCount += fileInfo.exports.named || 0;
      defaultCount += fileInfo.exports.default ? 1 : 0;
    }

    if (namedCount > defaultCount * 2) {
      return 'named exports preferred';
    } else if (defaultCount > namedCount * 2) {
      return 'default exports preferred';
    }
    return 'mixed';
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              DEPENDENCY EXTRACTION
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Extract dependencies from package.json
   * @returns {Promise<Object>}
   */
  async extractDependencies() {
    if (!this.quiet) {
      console.log('Extracting dependencies...');
    }

    const pkgPath = path.join(this.rootPath, 'package.json');

    try {
      const content = await fsPromises.readFile(pkgPath, 'utf-8');
      const pkg = JSON.parse(content);

      this._dependencies = {
        runtime: Object.keys(pkg.dependencies || {}),
        dev: Object.keys(pkg.devDependencies || {}),
        peer: Object.keys(pkg.peerDependencies || {}),
        optional: Object.keys(pkg.optionalDependencies || {}),
      };

      // Detect package manager
      if (fs.existsSync(path.join(this.rootPath, 'pnpm-lock.yaml'))) {
        this._dependencies.packageManager = 'pnpm';
      } else if (fs.existsSync(path.join(this.rootPath, 'yarn.lock'))) {
        this._dependencies.packageManager = 'yarn';
      } else if (fs.existsSync(path.join(this.rootPath, 'package-lock.json'))) {
        this._dependencies.packageManager = 'npm';
      } else if (fs.existsSync(path.join(this.rootPath, 'bun.lockb'))) {
        this._dependencies.packageManager = 'bun';
      }

      // Detect monorepo
      if (pkg.workspaces) {
        this._dependencies.monorepo = true;
        this._dependencies.workspaces = pkg.workspaces;
      }

      // Detect Node.js version requirement
      if (pkg.engines?.node) {
        this._dependencies.nodeVersion = pkg.engines.node;
      }
    } catch {
      // No package.json or invalid JSON
      this._dependencies = { runtime: [], dev: [] };
    }

    return this._dependencies;
  }

  /**
   * Extract imports from file content
   * @private
   */
  _extractImports(content) {
    const imports = [];

    // ES6 imports
    const es6Matches = content.matchAll(/import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g);
    for (const match of es6Matches) {
      imports.push(match[1]);
    }

    // CommonJS requires
    const cjsMatches = content.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
    for (const match of cjsMatches) {
      imports.push(match[1]);
    }

    return [...new Set(imports)];
  }

  /**
   * Extract exports from file content
   * @private
   */
  _extractExports(content) {
    const exports = { named: 0, default: false };

    // Named exports
    const namedMatches = content.match(/export\s+(const|let|var|function|class|async\s+function)/g);
    if (namedMatches) {
      exports.named = namedMatches.length;
    }

    // Export statements
    const exportStatements = content.match(/export\s*\{/g);
    if (exportStatements) {
      exports.named += exportStatements.length;
    }

    // Default export
    if (/export\s+default/.test(content)) {
      exports.default = true;
    }

    return exports;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              SERVICE IDENTIFICATION
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Identify services in the codebase
   * @returns {Promise<Array>}
   */
  async identifyServices() {
    if (!this.quiet) {
      console.log('Identifying services...');
    }

    const services = [];

    // Check for common service directories
    const serviceIndicators = [
      { dir: 'src/services', type: 'internal' },
      { dir: 'services', type: 'internal' },
      { dir: 'src/api', type: 'api' },
      { dir: 'api', type: 'api' },
      { dir: 'server', type: 'backend' },
      { dir: 'backend', type: 'backend' },
      { dir: 'src/server', type: 'backend' },
      { dir: 'packages', type: 'package' },
      { dir: 'apps', type: 'app' },
    ];

    for (const indicator of serviceIndicators) {
      const dirPath = path.join(this.rootPath, indicator.dir);
      if (fs.existsSync(dirPath)) {
        try {
          const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });

          for (const entry of entries) {
            if (entry.isDirectory() && !entry.name.startsWith('.')) {
              const servicePath = path.join(indicator.dir, entry.name);
              const entrypoint = await this._findEntrypoint(path.join(dirPath, entry.name));

              services.push({
                name: entry.name,
                type: indicator.type,
                directory: servicePath,
                entrypoint: entrypoint || null,
                dependencies: await this._getServiceDependencies(path.join(dirPath, entry.name)),
              });
            } else if (entry.isFile() && !entry.name.startsWith('.')) {
              const ext = path.extname(entry.name);
              if (CONFIG.codeExtensions.includes(ext)) {
                services.push({
                  name: path.basename(entry.name, ext),
                  type: indicator.type,
                  entrypoint: path.join(indicator.dir, entry.name),
                  dependencies: [],
                });
              }
            }
          }
        } catch {
          // Directory not accessible
        }
      }
    }

    // Detect monorepo packages/apps as services
    if (this._dependencies.workspaces) {
      const workspaces = Array.isArray(this._dependencies.workspaces)
        ? this._dependencies.workspaces
        : this._dependencies.workspaces.packages || [];

      for (const workspace of workspaces) {
        const basePath = workspace.replace('/*', '');
        const wsPath = path.join(this.rootPath, basePath);

        if (fs.existsSync(wsPath)) {
          try {
            const entries = await fsPromises.readdir(wsPath, { withFileTypes: true });
            for (const entry of entries) {
              if (entry.isDirectory() && !entry.name.startsWith('.')) {
                const pkgJsonPath = path.join(wsPath, entry.name, 'package.json');
                if (fs.existsSync(pkgJsonPath)) {
                  const pkgContent = JSON.parse(await fsPromises.readFile(pkgJsonPath, 'utf-8'));
                  services.push({
                    name: pkgContent.name || entry.name,
                    type: 'workspace',
                    directory: path.join(basePath, entry.name),
                    entrypoint: pkgContent.main || null,
                    dependencies: Object.keys(pkgContent.dependencies || {}),
                  });
                }
              }
            }
          } catch {
            // Workspace not accessible
          }
        }
      }
    }

    this._services = services;
    return services;
  }

  /**
   * Find entrypoint file in directory
   * @private
   */
  async _findEntrypoint(dirPath) {
    const entrypoints = ['index.ts', 'index.js', 'main.ts', 'main.js', 'mod.ts', 'mod.js'];

    for (const entry of entrypoints) {
      const filePath = path.join(dirPath, entry);
      if (fs.existsSync(filePath)) {
        return path.relative(this.rootPath, filePath);
      }
    }

    // Check for src/index
    for (const entry of entrypoints) {
      const filePath = path.join(dirPath, 'src', entry);
      if (fs.existsSync(filePath)) {
        return path.relative(this.rootPath, filePath);
      }
    }

    return null;
  }

  /**
   * Get dependencies for a service
   * @private
   */
  async _getServiceDependencies(dirPath) {
    const pkgPath = path.join(dirPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const content = await fsPromises.readFile(pkgPath, 'utf-8');
        const pkg = JSON.parse(content);
        return Object.keys(pkg.dependencies || {});
      } catch {
        return [];
      }
    }
    return [];
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              OUTPUT
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Generate the complete codebase map
   * @returns {Promise<Object>}
   */
  async generateMap() {
    // Run all analysis
    await this.scanDirectory();
    await this.detectPatterns();
    await this.detectConventions();
    await this.extractDependencies();
    await this.identifyServices();

    // Get project name from package.json or directory
    let projectName = path.basename(this.rootPath);
    const pkgPath = path.join(this.rootPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(await fsPromises.readFile(pkgPath, 'utf-8'));
        projectName = pkg.name || projectName;
      } catch {
        // Use directory name
      }
    }

    const map = {
      project: projectName,
      mappedAt: new Date().toISOString(),
      version: CONFIG.schemaVersion,

      structure: this._simplifyStructure(this._structure),

      services: this._services,

      patterns: this._patterns,

      conventions: this._conventions,

      dependencies: this._dependencies,

      stats: {
        totalFiles: this._fileIndex.size,
        codeFiles: [...this._fileIndex.values()].filter(f =>
          CONFIG.codeExtensions.includes(f.extension)
        ).length,
        testFiles: [...this._fileIndex.values()].filter(f => f.hasTests).length,
        components: [...this._fileIndex.values()].filter(f => f.isComponent).length,
        configFiles: this._configFiles.length,
      },

      configFiles: this._configFiles,
    };

    return map;
  }

  /**
   * Simplify structure for output (remove empty directories, limit depth)
   * @private
   */
  _simplifyStructure(structure, depth = 0) {
    if (depth > 3) {
      return { type: 'directory', truncated: true };
    }

    const simplified = {
      type: structure.type,
    };

    if (structure.purpose) {
      simplified.purpose = structure.purpose;
    }

    if (structure.files && structure.files.length > 0) {
      simplified.files = structure.files.slice(0, 20);
      if (structure.files.length > 20) {
        simplified.filesCount = structure.files.length;
        simplified.files.push(`... and ${structure.files.length - 20} more`);
      }
    }

    if (structure.children && Object.keys(structure.children).length > 0) {
      simplified.children = {};
      for (const [name, child] of Object.entries(structure.children)) {
        simplified.children[name] = this._simplifyStructure(child, depth + 1);
      }
    }

    return simplified;
  }

  /**
   * Save the codebase map to file
   * @param {string} [outputPath] - Custom output path
   * @returns {Promise<string>} - Path to saved file
   */
  async saveMap(outputPath) {
    const map = await this.generateMap();
    const savePath = outputPath || path.join(this.rootPath, CONFIG.outputPath);

    // Ensure directory exists
    const dir = path.dirname(savePath);
    if (!fs.existsSync(dir)) {
      await fsPromises.mkdir(dir, { recursive: true });
    }

    await fsPromises.writeFile(savePath, JSON.stringify(map, null, 2), 'utf-8');

    if (!this.quiet) {
      console.log(`\nCodebase map saved to: ${savePath}`);
    }

    return savePath;
  }

  /**
   * Get map as JSON object
   * @returns {Promise<Object>}
   */
  async toJSON() {
    return await this.generateMap();
  }

  /**
   * Compare with existing map
   * @returns {Promise<Object>}
   */
  async diff() {
    const existingPath = path.join(this.rootPath, CONFIG.outputPath);

    if (!fs.existsSync(existingPath)) {
      return { error: 'No existing map found', newMap: true };
    }

    const existingContent = await fsPromises.readFile(existingPath, 'utf-8');
    const existingMap = JSON.parse(existingContent);
    const newMap = await this.generateMap();

    const diff = {
      previousMappedAt: existingMap.mappedAt,
      currentMappedAt: newMap.mappedAt,
      changes: {
        files: {
          added: newMap.stats.totalFiles - existingMap.stats.totalFiles,
          codeFiles: newMap.stats.codeFiles - existingMap.stats.codeFiles,
        },
        services: {
          previous: existingMap.services.length,
          current: newMap.services.length,
        },
        patterns: {
          changed: JSON.stringify(existingMap.patterns) !== JSON.stringify(newMap.patterns),
        },
        dependencies: {
          runtime: {
            added: newMap.dependencies.runtime.filter(d => !existingMap.dependencies.runtime.includes(d)),
            removed: existingMap.dependencies.runtime.filter(d => !newMap.dependencies.runtime.includes(d)),
          },
        },
      },
    };

    return diff;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CLI INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Codebase Mapper - AIOX Memory Layer (Story 7.2)

Usage:
  node codebase-mapper.js [command] [options]
  *map-codebase [command] [options]

Commands:
  map             Generate codebase map (default)
  json            Output as JSON to stdout
  save            Save to .aiox/codebase-map.json
  diff            Compare with existing map

Options:
  --root <path>   Project root (default: cwd)
  --output <path> Custom output path
  --depth <n>     Max directory depth (default: 5)
  --quiet, -q     Suppress output
  --help, -h      Show this help message

Examples:
  node codebase-mapper.js
  node codebase-mapper.js save
  node codebase-mapper.js json
  node codebase-mapper.js diff
  node codebase-mapper.js --root /path/to/project save
  node codebase-mapper.js --depth 3 --output ./custom-map.json

Acceptance Criteria Coverage:
  AC1: Located in .aiox-core/infrastructure/scripts/
  AC2: Generates: services, directories, patterns, conventions, dependencies
  AC3: Output: .aiox/codebase-map.json
  AC4: Automatic updates after significant merges (via git hooks)
  AC5: Command *map-codebase available globally
  AC6: Used by Context Generator (Epic 4)
  AC7: Excludes node_modules, .git, build outputs
`);
    process.exit(0);
  }

  // Parse arguments
  let rootPath = process.cwd();
  let outputPath = null;
  let depth = CONFIG.defaultMaxDepth;
  let quiet = false;
  let command = 'map';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--root' && args[i + 1]) {
      rootPath = args[++i];
      if (!path.isAbsolute(rootPath)) {
        rootPath = path.join(process.cwd(), rootPath);
      }
    } else if (arg === '--output' && args[i + 1]) {
      outputPath = args[++i];
    } else if (arg === '--depth' && args[i + 1]) {
      depth = parseInt(args[++i], 10);
    } else if (arg === '--quiet' || arg === '-q') {
      quiet = true;
    } else if (!arg.startsWith('-')) {
      command = arg;
    }
  }

  try {
    const mapper = new CodebaseMapper(rootPath, { maxDepth: depth, quiet });

    switch (command) {
      case 'map':
      case 'save': {
        const savePath = await mapper.saveMap(outputPath);
        if (!quiet) {
          console.log('\nCodebase map generated successfully.');
          const map = await mapper.toJSON();
          console.log(`\nStats:`);
          console.log(`  Total files: ${map.stats.totalFiles}`);
          console.log(`  Code files: ${map.stats.codeFiles}`);
          console.log(`  Test files: ${map.stats.testFiles}`);
          console.log(`  Components: ${map.stats.components}`);
          console.log(`  Services: ${map.services.length}`);
        }
        break;
      }

      case 'json': {
        const map = await mapper.toJSON();
        console.log(JSON.stringify(map, null, 2));
        break;
      }

      case 'diff': {
        const diff = await mapper.diff();
        if (diff.error) {
          console.log(`\n${diff.error}`);
          if (diff.newMap) {
            console.log('Run `codebase-mapper save` to create initial map.');
          }
        } else {
          console.log('\nCodebase Map Diff:');
          console.log(`  Previous: ${diff.previousMappedAt}`);
          console.log(`  Current:  ${diff.currentMappedAt}`);
          console.log(`\nChanges:`);
          console.log(`  Files: ${diff.changes.files.added >= 0 ? '+' : ''}${diff.changes.files.added}`);
          console.log(`  Services: ${diff.changes.services.previous} -> ${diff.changes.services.current}`);
          console.log(`  Patterns changed: ${diff.changes.patterns.changed ? 'Yes' : 'No'}`);

          if (diff.changes.dependencies.runtime.added.length > 0) {
            console.log(`  Dependencies added: ${diff.changes.dependencies.runtime.added.join(', ')}`);
          }
          if (diff.changes.dependencies.runtime.removed.length > 0) {
            console.log(`  Dependencies removed: ${diff.changes.dependencies.runtime.removed.join(', ')}`);
          }
        }
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = {
  CodebaseMapper,
  CONFIG,
  PatternDetectors,
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
