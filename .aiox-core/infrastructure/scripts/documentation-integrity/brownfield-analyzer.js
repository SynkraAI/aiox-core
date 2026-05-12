/**
 * Brownfield Analyzer Module
 *
 * Analyzes existing projects to detect structure, standards, and tech stack.
 * Used for brownfield mode installation to adapt AIOX to existing projects.
 *
 * @module documentation-integrity/brownfield-analyzer
 * @version 1.0.0
 * @story 6.9
 */

const fs = require('fs');
const path = require('path');

/**
 * Analysis result structure
 * @typedef {Object} BrownfieldAnalysis
 * @property {boolean} hasExistingStructure - Has defined directory structure
 * @property {boolean} hasExistingWorkflows - Has CI/CD workflows
 * @property {boolean} hasExistingStandards - Has coding standard configs
 * @property {string} mergeStrategy - Recommended merge strategy
 * @property {string[]} techStack - Detected technologies
 * @property {string[]} frameworks - Detected frameworks
 * @property {Object} configs - Detected config file paths
 * @property {string[]} recommendations - Recommendations for integration
 * @property {string[]} conflicts - Potential conflicts detected
 * @property {string[]} manualReviewItems - Items needing manual review
 */

/**
 * Analyzes an existing project for brownfield integration
 *
 * @param {string} targetDir - Directory to analyze
 * @returns {BrownfieldAnalysis} Analysis results
 */
function analyzeProject(targetDir) {
  const normalizedDir = path.resolve(targetDir);

  if (!fs.existsSync(normalizedDir)) {
    throw new Error(`Directory does not exist: ${normalizedDir}`);
  }

  const analysis = {
    // Basic flags
    hasExistingStructure: false,
    hasExistingWorkflows: false,
    hasExistingStandards: false,

    // Merge strategy
    mergeStrategy: 'parallel',

    // Detected stack
    techStack: [],
    frameworks: [],
    version: null,

    // Config paths
    configs: {
      eslint: null,
      prettier: null,
      tsconfig: null,
      flake8: null,
      packageJson: null,
      requirements: null,
      goMod: null,
      githubWorkflows: null,
      gitlabCi: null,
    },

    // Detected settings
    linting: 'none',
    formatting: 'none',
    testing: 'none',

    // Integration guidance
    recommendations: [],
    conflicts: [],
    manualReviewItems: [],

    // Summary
    summary: '',
  };

  // Run all analyzers
  analyzeTechStack(normalizedDir, analysis);
  analyzeCodeStandards(normalizedDir, analysis);
  analyzeWorkflows(normalizedDir, analysis);
  analyzeDirectoryStructure(normalizedDir, analysis);
  generateRecommendations(analysis);
  generateSummary(analysis);

  return analysis;
}

/**
 * Analyzes the tech stack from project files
 *
 * @param {string} targetDir - Directory to analyze
 * @param {BrownfieldAnalysis} analysis - Analysis object to populate
 */
function analyzeTechStack(targetDir, analysis) {
  // Check for Node.js
  const packageJsonPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    analysis.techStack.push('Node.js');
    analysis.configs.packageJson = 'package.json';

    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      analysis.version = pkg.version;

      // Detect frameworks from dependencies
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };

      if (allDeps.react) analysis.frameworks.push('React');
      if (allDeps.vue) analysis.frameworks.push('Vue');
      if (allDeps.angular || allDeps['@angular/core']) analysis.frameworks.push('Angular');
      if (allDeps.next) analysis.frameworks.push('Next.js');
      if (allDeps.nuxt) analysis.frameworks.push('Nuxt');
      if (allDeps.express) analysis.frameworks.push('Express');
      if (allDeps.fastify) analysis.frameworks.push('Fastify');
      if (allDeps.nest || allDeps['@nestjs/core']) analysis.frameworks.push('NestJS');

      // Detect TypeScript
      if (allDeps.typescript || fs.existsSync(path.join(targetDir, 'tsconfig.json'))) {
        analysis.techStack.push('TypeScript');
      }

      // Detect testing frameworks
      if (allDeps.jest) analysis.testing = 'Jest';
      else if (allDeps.mocha) analysis.testing = 'Mocha';
      else if (allDeps.vitest) analysis.testing = 'Vitest';
    } catch (error) {
      console.warn(`Warning: Could not parse package.json: ${error.message}`);
    }
  }

  // Check for Python
  if (
    fs.existsSync(path.join(targetDir, 'requirements.txt')) ||
    fs.existsSync(path.join(targetDir, 'pyproject.toml')) ||
    fs.existsSync(path.join(targetDir, 'setup.py'))
  ) {
    analysis.techStack.push('Python');

    if (fs.existsSync(path.join(targetDir, 'requirements.txt'))) {
      analysis.configs.requirements = 'requirements.txt';

      try {
        const requirements = fs.readFileSync(
          path.join(targetDir, 'requirements.txt'),
          'utf8',
        );

        if (requirements.includes('django')) analysis.frameworks.push('Django');
        if (requirements.includes('flask')) analysis.frameworks.push('Flask');
        if (requirements.includes('fastapi')) analysis.frameworks.push('FastAPI');
        if (requirements.includes('pytest')) analysis.testing = 'pytest';
      } catch {
        // Ignore parse errors
      }
    }
  }

  // Check for Go
  if (fs.existsSync(path.join(targetDir, 'go.mod'))) {
    analysis.techStack.push('Go');
    analysis.configs.goMod = 'go.mod';
  }

  // Check for Rust
  if (fs.existsSync(path.join(targetDir, 'Cargo.toml'))) {
    analysis.techStack.push('Rust');
  }
}

/**
 * Analyzes existing coding standards configurations
 *
 * @param {string} targetDir - Directory to analyze
 * @param {BrownfieldAnalysis} analysis - Analysis object to populate
 */
function analyzeCodeStandards(targetDir, analysis) {
  // ESLint
  const eslintConfigs = [
    '.eslintrc.js',
    '.eslintrc.json',
    '.eslintrc.yaml',
    '.eslintrc.yml',
    '.eslintrc',
    'eslint.config.js',
  ];

  for (const config of eslintConfigs) {
    if (fs.existsSync(path.join(targetDir, config))) {
      analysis.configs.eslint = config;
      analysis.linting = 'ESLint';
      analysis.hasExistingStandards = true;
      break;
    }
  }

  // Prettier
  const prettierConfigs = [
    '.prettierrc',
    '.prettierrc.json',
    '.prettierrc.yaml',
    '.prettierrc.yml',
    '.prettierrc.js',
    'prettier.config.js',
  ];

  for (const config of prettierConfigs) {
    if (fs.existsSync(path.join(targetDir, config))) {
      analysis.configs.prettier = config;
      analysis.formatting = 'Prettier';
      analysis.hasExistingStandards = true;
      break;
    }
  }

  // TypeScript
  if (fs.existsSync(path.join(targetDir, 'tsconfig.json'))) {
    analysis.configs.tsconfig = 'tsconfig.json';
    analysis.hasExistingStandards = true;
  }

  // Python - Flake8
  if (fs.existsSync(path.join(targetDir, '.flake8'))) {
    analysis.configs.flake8 = '.flake8';
    analysis.linting = 'Flake8';
    analysis.hasExistingStandards = true;
  }

  // Python - Black
  const pyprojectPath = path.join(targetDir, 'pyproject.toml');
  if (fs.existsSync(pyprojectPath)) {
    try {
      const content = fs.readFileSync(pyprojectPath, 'utf8');
      if (content.includes('[tool.black]')) {
        analysis.formatting = 'Black';
        analysis.hasExistingStandards = true;
      }
    } catch {
      // Ignore
    }
  }
}

/**
 * Analyzes existing CI/CD workflows
 *
 * @param {string} targetDir - Directory to analyze
 * @param {BrownfieldAnalysis} analysis - Analysis object to populate
 */
function analyzeWorkflows(targetDir, analysis) {
  // GitHub Actions
  const githubWorkflowsDir = path.join(targetDir, '.github', 'workflows');
  if (fs.existsSync(githubWorkflowsDir)) {
    analysis.hasExistingWorkflows = true;
    analysis.configs.githubWorkflows = '.github/workflows/';

    try {
      const workflows = fs.readdirSync(githubWorkflowsDir);
      if (workflows.length > 0) {
        analysis.manualReviewItems.push(
          `Review ${workflows.length} existing GitHub workflow(s) for potential conflicts`,
        );
      }
    } catch {
      // Ignore
    }
  }

  // GitLab CI
  if (fs.existsSync(path.join(targetDir, '.gitlab-ci.yml'))) {
    analysis.hasExistingWorkflows = true;
    analysis.configs.gitlabCi = '.gitlab-ci.yml';
    analysis.manualReviewItems.push('Review existing GitLab CI configuration');
  }

  // CircleCI
  if (fs.existsSync(path.join(targetDir, '.circleci', 'config.yml'))) {
    analysis.hasExistingWorkflows = true;
    analysis.manualReviewItems.push('Review existing CircleCI configuration');
  }
}

/**
 * Analyzes the directory structure
 *
 * @param {string} targetDir - Directory to analyze
 * @param {BrownfieldAnalysis} analysis - Analysis object to populate
 */
function analyzeDirectoryStructure(targetDir, analysis) {
  // Common source directories
  const srcDirs = ['src', 'lib', 'app', 'source', 'pkg', 'cmd', 'internal'];
  const testDirs = ['test', 'tests', '__tests__', 'spec'];
  const docDirs = ['docs', 'doc', 'documentation'];

  let hasSrcDir = false;
  let hasTestDir = false;
  let hasDocDir = false;

  try {
    const contents = fs.readdirSync(targetDir);

    for (const item of contents) {
      const itemPath = path.join(targetDir, item);
      if (fs.statSync(itemPath).isDirectory()) {
        if (srcDirs.includes(item.toLowerCase())) hasSrcDir = true;
        if (testDirs.includes(item.toLowerCase())) hasTestDir = true;
        if (docDirs.includes(item.toLowerCase())) hasDocDir = true;
      }
    }
  } catch {
    // Ignore
  }

  analysis.hasExistingStructure = hasSrcDir || hasTestDir;

  // Check for docs/architecture conflict
  if (hasDocDir) {
    const archDir = path.join(targetDir, 'docs', 'architecture');
    if (fs.existsSync(archDir)) {
      analysis.conflicts.push(
        'docs/architecture/ already exists - AIOX docs may need different location',
      );
    }
  }
}

/**
 * Generates recommendations based on analysis
 *
 * @param {BrownfieldAnalysis} analysis - Analysis object to update
 */
function generateRecommendations(analysis) {
  // Linting recommendations
  if (analysis.linting !== 'none') {
    analysis.recommendations.push(
      `Preserve existing ${analysis.linting} configuration - AIOX will adapt`,
    );
  } else {
    analysis.recommendations.push('Consider adding ESLint/Flake8 for code quality');
  }

  // Formatting recommendations
  if (analysis.formatting !== 'none') {
    analysis.recommendations.push(
      `Keep existing ${analysis.formatting} settings - AIOX coding-standards.md will document them`,
    );
  }

  // Workflow recommendations
  if (analysis.hasExistingWorkflows) {
    analysis.recommendations.push('Review existing CI/CD before adding AIOX workflows');
    analysis.mergeStrategy = 'manual';
  } else {
    analysis.recommendations.push('Use *setup-github to add AIOX standard workflows');
    analysis.mergeStrategy = 'parallel';
  }

  // TypeScript recommendations
  if (analysis.configs.tsconfig) {
    analysis.recommendations.push('AIOX will use existing tsconfig.json settings');
  }

  // Framework-specific
  if (analysis.frameworks.includes('Next.js')) {
    analysis.recommendations.push('Next.js detected - use pages/ or app/ structure');
  }

  if (analysis.frameworks.includes('NestJS')) {
    analysis.recommendations.push('NestJS detected - AIOX will adapt to module structure');
  }
}

/**
 * Generates a summary of the analysis
 *
 * @param {BrownfieldAnalysis} analysis - Analysis object to update
 */
function generateSummary(analysis) {
  const parts = [];

  parts.push(`Tech Stack: ${analysis.techStack.join(', ') || 'Unknown'}`);

  if (analysis.frameworks.length > 0) {
    parts.push(`Frameworks: ${analysis.frameworks.join(', ')}`);
  }

  if (analysis.hasExistingStandards) {
    parts.push(`Standards: ${analysis.linting}/${analysis.formatting}`);
  }

  if (analysis.hasExistingWorkflows) {
    parts.push('CI/CD: Existing workflows detected');
  }

  parts.push(`Recommended Strategy: ${analysis.mergeStrategy}`);

  analysis.summary = parts.join(' | ');
}

/**
 * Gets a migration report for display
 *
 * @param {BrownfieldAnalysis} analysis - Analysis results
 * @returns {string} Formatted migration report
 */
function formatMigrationReport(analysis) {
  const lines = [];
  const width = 70;
  const border = '═'.repeat(width);

  lines.push(`╔${border}╗`);
  lines.push(`║${'BROWNFIELD ANALYSIS REPORT'.padStart((width + 26) / 2).padEnd(width)}║`);
  lines.push(`╠${border}╣`);

  // Tech Stack
  lines.push(`║${''.padEnd(width)}║`);
  lines.push(`║  Tech Stack: ${(analysis.techStack.join(', ') || 'Unknown').padEnd(width - 16)}║`);

  if (analysis.frameworks.length > 0) {
    lines.push(`║  Frameworks: ${analysis.frameworks.join(', ').padEnd(width - 16)}║`);
  }

  // Standards
  lines.push(`║${''.padEnd(width)}║`);
  lines.push(`║  Linting: ${analysis.linting.padEnd(width - 13)}║`);
  lines.push(`║  Formatting: ${analysis.formatting.padEnd(width - 16)}║`);
  lines.push(`║  Testing: ${analysis.testing.padEnd(width - 13)}║`);

  // Workflows
  lines.push(`║${''.padEnd(width)}║`);
  lines.push(
    `║  Existing Workflows: ${(analysis.hasExistingWorkflows ? 'Yes' : 'No').padEnd(width - 24)}║`,
  );
  lines.push(`║  Merge Strategy: ${analysis.mergeStrategy.padEnd(width - 20)}║`);

  // Recommendations
  if (analysis.recommendations.length > 0) {
    lines.push(`║${''.padEnd(width)}║`);
    lines.push(`╠${border}╣`);
    lines.push(`║  RECOMMENDATIONS${' '.repeat(width - 18)}║`);
    lines.push(`╠${border}╣`);
    lines.push(`║${''.padEnd(width)}║`);

    for (const rec of analysis.recommendations) {
      const truncated = rec.substring(0, width - 6);
      lines.push(`║  • ${truncated.padEnd(width - 5)}║`);
    }
  }

  // Conflicts
  if (analysis.conflicts.length > 0) {
    lines.push(`║${''.padEnd(width)}║`);
    lines.push(`╠${border}╣`);
    lines.push(`║  ⚠️  POTENTIAL CONFLICTS${' '.repeat(width - 25)}║`);
    lines.push(`╠${border}╣`);
    lines.push(`║${''.padEnd(width)}║`);

    for (const conflict of analysis.conflicts) {
      const truncated = conflict.substring(0, width - 6);
      lines.push(`║  • ${truncated.padEnd(width - 5)}║`);
    }
  }

  // Manual Review Items
  if (analysis.manualReviewItems.length > 0) {
    lines.push(`║${''.padEnd(width)}║`);
    lines.push(`╠${border}╣`);
    lines.push(`║  📋 MANUAL REVIEW REQUIRED${' '.repeat(width - 28)}║`);
    lines.push(`╠${border}╣`);
    lines.push(`║${''.padEnd(width)}║`);

    for (const item of analysis.manualReviewItems) {
      const truncated = item.substring(0, width - 6);
      lines.push(`║  • ${truncated.padEnd(width - 5)}║`);
    }
  }

  lines.push(`║${''.padEnd(width)}║`);
  lines.push(`╚${border}╝`);

  return lines.join('\n');
}

module.exports = {
  analyzeProject,
  analyzeTechStack,
  analyzeCodeStandards,
  analyzeWorkflows,
  analyzeDirectoryStructure,
  generateRecommendations,
  formatMigrationReport,
};
