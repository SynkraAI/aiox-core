/**
 * Tech Stack Detector - Detects project technology stack before workflow execution
 *
 * DETERMINISTIC: All operations use file system checks (fs-extra),
 * no AI involvement in detection.
 *
 * Responsibilities:
 * - Detect database configuration (Supabase, PostgreSQL, MongoDB, etc.)
 * - Detect frontend framework (React, Vue, Angular, etc.)
 * - Detect backend framework (Express, Fastify, etc.)
 * - Detect build tools and styling (Vite, Tailwind, etc.)
 * - Determine which workflow phases are applicable
 *
 * @module core/orchestration/tech-stack-detector
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * @typedef {Object} DatabaseProfile
 * @property {string|null} type - Database type (supabase, postgresql, mongodb, mysql, sqlite)
 * @property {boolean} hasSchema - Whether schema files exist
 * @property {boolean} hasMigrations - Whether migration files exist
 * @property {boolean} hasRLS - Whether RLS policies are configured
 * @property {boolean} envVarsConfigured - Whether DB env vars are set
 */

/**
 * @typedef {Object} FrontendProfile
 * @property {string|null} framework - Frontend framework (react, vue, angular, svelte)
 * @property {string|null} buildTool - Build tool (vite, webpack, esbuild)
 * @property {string|null} styling - Styling approach (tailwind, css, scss, styled-components)
 * @property {string|null} componentLibrary - UI component library (shadcn, mui, chakra)
 */

/**
 * @typedef {Object} BackendProfile
 * @property {string|null} type - Backend type (express, fastify, nest, edge-functions)
 * @property {boolean} hasAPI - Whether API routes exist
 */

/**
 * @typedef {Object} TechStackProfile
 * @property {boolean} hasDatabase
 * @property {boolean} hasFrontend
 * @property {boolean} hasBackend
 * @property {boolean} hasTypeScript
 * @property {boolean} hasTests
 * @property {DatabaseProfile} database
 * @property {FrontendProfile} frontend
 * @property {BackendProfile} backend
 * @property {number[]} applicablePhases
 * @property {number} confidence
 * @property {string} detectedAt
 */

/**
 * Detects project technology stack for workflow phase determination
 */
class TechStackDetector {
  /**
   * @param {string} projectRoot - Project root directory
   */
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this._packageJsonCache = null;
  }

  /**
   * Main detection method - runs before workflow phases
   * DETERMINISTIC: All detection uses fs operations
   * @returns {Promise<TechStackProfile>}
   */
  async detect() {
    const profile = this._createEmptyProfile();

    // Run all detectors
    await this._detectDatabase(profile);
    await this._detectFrontend(profile);
    await this._detectBackend(profile);
    await this._detectTypeScript(profile);
    await this._detectTests(profile);

    // Compute applicable phases based on detection
    this._computeApplicablePhases(profile);

    // Calculate detection confidence
    this._calculateConfidence(profile);

    profile.detectedAt = new Date().toISOString();

    return profile;
  }

  /**
   * Create empty profile structure
   * @private
   * @returns {TechStackProfile}
   */
  _createEmptyProfile() {
    return {
      // Core detection flags
      hasDatabase: false,
      hasFrontend: false,
      hasBackend: false,
      hasTypeScript: false,
      hasTests: false,

      // Database details
      database: {
        type: null,
        hasSchema: false,
        hasMigrations: false,
        hasRLS: false,
        envVarsConfigured: false,
      },

      // Frontend details
      frontend: {
        framework: null,
        buildTool: null,
        styling: null,
        componentLibrary: null,
      },

      // Backend details
      backend: {
        type: null,
        hasAPI: false,
      },

      // Computed fields
      applicablePhases: [],
      confidence: 0,
      detectedAt: null,
    };
  }

  /**
   * Load and cache package.json
   * @private
   * @returns {Promise<Object|null>}
   */
  async _loadPackageJson() {
    if (this._packageJsonCache !== null) {
      return this._packageJsonCache;
    }

    const packageJsonPath = path.join(this.projectRoot, 'package.json');

    if (await fs.pathExists(packageJsonPath)) {
      try {
        this._packageJsonCache = await fs.readJson(packageJsonPath);
      } catch {
        this._packageJsonCache = null;
      }
    } else {
      this._packageJsonCache = null;
    }

    return this._packageJsonCache;
  }

  /**
   * Get all dependencies from package.json
   * @private
   * @returns {Promise<Object>}
   */
  async _getAllDependencies() {
    const pkg = await this._loadPackageJson();
    if (!pkg) return {};

    return {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };
  }

  /**
   * Detect database configuration
   * @private
   * @param {TechStackProfile} profile
   */
  async _detectDatabase(profile) {
    const deps = await this._getAllDependencies();

    // Check for Supabase directory
    const supabasePath = path.join(this.projectRoot, 'supabase');
    if (await fs.pathExists(supabasePath)) {
      profile.hasDatabase = true;
      profile.database.type = 'supabase';

      // Check for migrations
      const migrationsPath = path.join(supabasePath, 'migrations');
      profile.database.hasMigrations = await fs.pathExists(migrationsPath);
      profile.database.hasSchema = profile.database.hasMigrations;

      // Check for RLS in migrations
      if (profile.database.hasMigrations) {
        try {
          const migrations = await fs.readdir(migrationsPath);
          for (const file of migrations) {
            if (file.endsWith('.sql')) {
              const content = await fs.readFile(path.join(migrationsPath, file), 'utf8');
              if (
                content.includes('ENABLE ROW LEVEL SECURITY') ||
                content.includes('CREATE POLICY')
              ) {
                profile.database.hasRLS = true;
                break;
              }
            }
          }
        } catch {
          // Ignore read errors
        }
      }
    }

    // Check for Prisma
    const prismaPath = path.join(this.projectRoot, 'prisma');
    if (await fs.pathExists(prismaPath)) {
      profile.hasDatabase = true;
      if (!profile.database.type) {
        profile.database.type = 'postgresql';
      }
      profile.database.hasSchema = await fs.pathExists(path.join(prismaPath, 'schema.prisma'));
    }

    // Check package.json dependencies
    if (deps['@supabase/supabase-js']) {
      profile.hasDatabase = true;
      if (!profile.database.type) {
        profile.database.type = 'supabase';
      }
    }

    if (deps['pg'] || deps['postgres'] || deps['@prisma/client']) {
      profile.hasDatabase = true;
      if (!profile.database.type) {
        profile.database.type = 'postgresql';
      }
    }

    if (deps['mongoose'] || deps['mongodb']) {
      profile.hasDatabase = true;
      // Only set type if not already detected (preserve first detection)
      if (!profile.database.type) {
        profile.database.type = 'mongodb';
      }
    }

    if (deps['mysql'] || deps['mysql2']) {
      profile.hasDatabase = true;
      if (!profile.database.type) {
        profile.database.type = 'mysql';
      }
    }

    if (deps['better-sqlite3'] || deps['sqlite3']) {
      profile.hasDatabase = true;
      if (!profile.database.type) {
        profile.database.type = 'sqlite';
      }
    }

    // Check for environment variables
    await this._checkDatabaseEnvVars(profile);
  }

  /**
   * Check for database environment variables
   * @private
   * @param {TechStackProfile} profile
   */
  async _checkDatabaseEnvVars(profile) {
    const envFiles = ['.env', '.env.local', '.env.example'];

    for (const envFile of envFiles) {
      const envPath = path.join(this.projectRoot, envFile);
      if (await fs.pathExists(envPath)) {
        try {
          const content = await fs.readFile(envPath, 'utf8');
          if (
            content.includes('SUPABASE_URL') ||
            content.includes('DATABASE_URL') ||
            content.includes('POSTGRES_') ||
            content.includes('MONGODB_URI') ||
            content.includes('MYSQL_')
          ) {
            profile.database.envVarsConfigured = true;
            break;
          }
        } catch {
          // Ignore read errors
        }
      }
    }
  }

  /**
   * Detect frontend framework and tools
   * @private
   * @param {TechStackProfile} profile
   */
  async _detectFrontend(profile) {
    const deps = await this._getAllDependencies();

    // Framework detection
    if (deps['react'] || deps['react-dom']) {
      profile.hasFrontend = true;
      profile.frontend.framework = 'react';
    } else if (deps['vue']) {
      profile.hasFrontend = true;
      profile.frontend.framework = 'vue';
    } else if (deps['@angular/core']) {
      profile.hasFrontend = true;
      profile.frontend.framework = 'angular';
    } else if (deps['svelte']) {
      profile.hasFrontend = true;
      profile.frontend.framework = 'svelte';
    } else if (deps['next']) {
      profile.hasFrontend = true;
      profile.frontend.framework = 'react'; // Next.js uses React
    } else if (deps['nuxt']) {
      profile.hasFrontend = true;
      profile.frontend.framework = 'vue'; // Nuxt uses Vue
    }

    // Build tool detection
    if (deps['vite']) {
      profile.frontend.buildTool = 'vite';
    } else if (deps['webpack']) {
      profile.frontend.buildTool = 'webpack';
    } else if (deps['esbuild']) {
      profile.frontend.buildTool = 'esbuild';
    } else if (deps['parcel']) {
      profile.frontend.buildTool = 'parcel';
    }

    // Styling detection
    if (deps['tailwindcss']) {
      profile.frontend.styling = 'tailwind';
    } else if (deps['styled-components']) {
      profile.frontend.styling = 'styled-components';
    } else if (deps['@emotion/react'] || deps['@emotion/styled']) {
      profile.frontend.styling = 'emotion';
    } else if (deps['sass'] || deps['node-sass']) {
      profile.frontend.styling = 'scss';
    }

    // Component library detection
    if (await fs.pathExists(path.join(this.projectRoot, 'src/components/ui'))) {
      profile.frontend.componentLibrary = 'shadcn';
    } else if (deps['@mui/material'] || deps['@material-ui/core']) {
      profile.frontend.componentLibrary = 'mui';
    } else if (deps['@chakra-ui/react']) {
      profile.frontend.componentLibrary = 'chakra';
    } else if (deps['antd']) {
      profile.frontend.componentLibrary = 'antd';
    }

    // Check for src directory as fallback indicator
    if (!profile.hasFrontend) {
      const srcPath = path.join(this.projectRoot, 'src');
      if (await fs.pathExists(srcPath)) {
        const srcFiles = await fs.readdir(srcPath).catch(() => []);
        const hasUIFiles = srcFiles.some(
          (f) =>
            f.endsWith('.jsx') ||
            f.endsWith('.tsx') ||
            f.endsWith('.vue') ||
            f === 'App.jsx' ||
            f === 'App.tsx',
        );
        if (hasUIFiles) {
          profile.hasFrontend = true;
        }
      }
    }
  }

  /**
   * Detect backend framework
   * @private
   * @param {TechStackProfile} profile
   */
  async _detectBackend(profile) {
    const deps = await this._getAllDependencies();

    // Express
    if (deps['express']) {
      profile.hasBackend = true;
      profile.backend.type = 'express';
    }

    // Fastify
    if (deps['fastify']) {
      profile.hasBackend = true;
      profile.backend.type = 'fastify';
    }

    // NestJS
    if (deps['@nestjs/core']) {
      profile.hasBackend = true;
      profile.backend.type = 'nest';
    }

    // Hono
    if (deps['hono']) {
      profile.hasBackend = true;
      profile.backend.type = 'hono';
    }

    // Check for Supabase Edge Functions
    const edgeFunctionsPath = path.join(this.projectRoot, 'supabase', 'functions');
    if (await fs.pathExists(edgeFunctionsPath)) {
      profile.hasBackend = true;
      if (!profile.backend.type) {
        profile.backend.type = 'edge-functions';
      }
    }

    // Check for API routes
    const apiPaths = [
      path.join(this.projectRoot, 'api'),
      path.join(this.projectRoot, 'src/api'),
      path.join(this.projectRoot, 'pages/api'), // Next.js
      path.join(this.projectRoot, 'app/api'), // Next.js App Router
    ];

    for (const apiPath of apiPaths) {
      if (await fs.pathExists(apiPath)) {
        profile.backend.hasAPI = true;
        break;
      }
    }
  }

  /**
   * Detect TypeScript usage
   * @private
   * @param {TechStackProfile} profile
   */
  async _detectTypeScript(profile) {
    const deps = await this._getAllDependencies();

    // Check for TypeScript dependency
    if (deps['typescript']) {
      profile.hasTypeScript = true;
    }

    // Check for tsconfig.json
    const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
    if (await fs.pathExists(tsconfigPath)) {
      profile.hasTypeScript = true;
    }
  }

  /**
   * Detect test framework
   * @private
   * @param {TechStackProfile} profile
   */
  async _detectTests(profile) {
    const deps = await this._getAllDependencies();

    // Check for test frameworks
    const testFrameworks = [
      'jest',
      'vitest',
      'mocha',
      'jasmine',
      '@testing-library/react',
      'cypress',
      'playwright',
    ];

    for (const framework of testFrameworks) {
      if (deps[framework]) {
        profile.hasTests = true;
        break;
      }
    }

    // Check for test directories
    const testPaths = [
      path.join(this.projectRoot, 'tests'),
      path.join(this.projectRoot, 'test'),
      path.join(this.projectRoot, '__tests__'),
      path.join(this.projectRoot, 'src/__tests__'),
    ];

    for (const testPath of testPaths) {
      if (await fs.pathExists(testPath)) {
        profile.hasTests = true;
        break;
      }
    }
  }

  /**
   * Compute which workflow phases are applicable
   * @private
   * @param {TechStackProfile} profile
   */
  _computeApplicablePhases(profile) {
    // Phase 1 (System Architecture) - Always applicable
    profile.applicablePhases.push(1);

    // Phase 2 (Database) - Only if hasDatabase
    if (profile.hasDatabase) {
      profile.applicablePhases.push(2);
    }

    // Phase 3 (Frontend/UX) - Only if hasFrontend
    if (profile.hasFrontend) {
      profile.applicablePhases.push(3);
    }

    // Phases 4-10 (Consolidation, Validation, Planning) - Always applicable
    // But their content adapts based on what was collected
    profile.applicablePhases.push(4, 5, 6, 7, 8, 9, 10);
  }

  /**
   * Calculate detection confidence score
   * @private
   * @param {TechStackProfile} profile
   */
  _calculateConfidence(profile) {
    let confidence = 50; // Base confidence

    // Add confidence for each detection
    if (profile.hasDatabase) {
      confidence += 10;
      if (profile.database.type) confidence += 5;
      if (profile.database.envVarsConfigured) confidence += 5;
    }

    if (profile.hasFrontend) {
      confidence += 10;
      if (profile.frontend.framework) confidence += 5;
      if (profile.frontend.buildTool) confidence += 3;
      if (profile.frontend.styling) confidence += 2;
    }

    if (profile.hasBackend) {
      confidence += 5;
      if (profile.backend.type) confidence += 3;
    }

    if (profile.hasTypeScript) {
      confidence += 3;
    }

    if (profile.hasTests) {
      confidence += 2;
    }

    profile.confidence = Math.min(100, confidence);
  }

  /**
   * Get a human-readable summary of the detection
   * @param {TechStackProfile} profile
   * @returns {string}
   */
  static getSummary(profile) {
    const parts = [];

    if (profile.hasFrontend) {
      const fw = profile.frontend.framework || 'unknown';
      const style = profile.frontend.styling ? ` + ${profile.frontend.styling}` : '';
      parts.push(`Frontend: ${fw}${style}`);
    }

    if (profile.hasDatabase) {
      const db = profile.database.type || 'unknown';
      const rls = profile.database.hasRLS ? ' (RLS)' : '';
      parts.push(`Database: ${db}${rls}`);
    }

    if (profile.hasBackend) {
      const be = profile.backend.type || 'unknown';
      parts.push(`Backend: ${be}`);
    }

    if (profile.hasTypeScript) {
      parts.push('TypeScript');
    }

    return parts.length > 0 ? parts.join(' | ') : 'No stack detected';
  }
}

module.exports = TechStackDetector;
