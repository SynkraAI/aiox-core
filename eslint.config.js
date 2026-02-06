// @ts-check
const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

/**
 * AIOS Framework ESLint Configuration
 * ESLint v9 flat config format
 * @type {import('eslint').Linter.Config[]}
 */
module.exports = [
  // Recommended JavaScript rules
  js.configs.recommended,

  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/coverage/**',
      '**/build/**',
      '**/dist/**',
      '**/.aios-core/_legacy-v4.31.0/**',
      '**/web-bundles/**',
      '**/*.min.js',
      '**/aios-core/*.js',
      '**/templates/squad/**',
      // Squad template - ES modules with placeholder imports
      '.aios-core/development/templates/squad-template/**',
      // ESM bundle files - auto-generated
      '**/*.esm.js',
      '**/index.esm.js',
      // Legacy and backup files
      '**/*.backup*.js',
      '**/aios-init-old.js',
      '**/aios-init-v4.js',
      // Scripts that need cleanup (TODO: fix in Story 6.2)
      '.aios-core/quality/**',
      '.aios-core/scripts/**',
      // Development scripts with known ESLint errors (TODO: fix in future story)
      '.aios-core/development/scripts/**',
      '.claude/commands/AIOS/scripts/**',
      // CLI files with legacy issues (TODO: fix)
      '.aios-core/cli/**',
      '.aios-core/infrastructure/scripts/**',
      // Bin files with legacy issues
      'bin/aios-init*.js',
      'bin/migrate-*.js',
      // Template files with placeholder syntax
      '.aios-core/product/templates/**',
      // Health Dashboard - uses Vite/React with ES modules
      'tools/health-dashboard/**',
      // Apps with their own ESLint configs
      'apps/dashboard/**',
      // Bun-based apps (different runtime, different globals)
      'apps/monitor-server/**',
      // Core orchestration/execution - legacy code with no-undef errors (TODO: fix)
      '.aios-core/core/orchestration/**',
      '.aios-core/core/execution/**',
      // Hook integrations - legacy code (TODO: fix)
      '.aios-core/hooks/**',
      // Pro module - legacy code
      'pro/**',
      // Glue scripts
      'scripts/glue/**',
      // Squad adapters with legacy issues
      'squads/mmos-squad/**',
    ],
  },

  // JavaScript files configuration
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        // Node.js globals
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        global: 'readonly',
        // Node.js 18+ globals
        fetch: 'readonly',
        AbortController: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        // Jest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      // Error prevention
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-undef': 'error',
      'no-console': 'off', // We need console for CLI tool

      // Code style
      semi: ['error', 'always'],
      quotes: ['warn', 'single', { avoidEscape: true }],
      indent: ['warn', 2, { SwitchCase: 1 }],
      'comma-dangle': ['warn', 'always-multiline'],

      // Best practices
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'warn',
      'no-throw-literal': 'error',

      // Relaxed rules for legacy code (TODO: fix and re-enable as errors)
      'no-case-declarations': 'warn',
      'no-useless-escape': 'warn',
      'no-control-regex': 'warn',
      'no-prototype-builtins': 'warn',
      'no-empty': 'warn',
    },
  },

  // TypeScript files configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Test files - more relaxed rules
  {
    files: ['**/*.test.js', '**/*.spec.js', '**/tests/**/*.js'],
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off', // Jest globals
    },
  },
];
