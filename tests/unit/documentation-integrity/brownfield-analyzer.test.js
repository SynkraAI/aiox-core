/**
 * Brownfield Analyzer Unit Tests
 *
 * @module tests/unit/documentation-integrity/brownfield-analyzer
 * @story 6.9
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

const {
  analyzeProject,
  analyzeTechStack,
  analyzeCodeStandards,
  analyzeWorkflows,
  analyzeDirectoryStructure,
  generateRecommendations,
  formatMigrationReport,
} = require('../../../.aiox-core/infrastructure/scripts/documentation-integrity/brownfield-analyzer');

describe('Brownfield Analyzer', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-brownfield-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('analyzeProject', () => {
    it('should throw error for non-existent directory', () => {
      expect(() => analyzeProject('/non/existent/path')).toThrow('does not exist');
    });

    it('should return analysis object for empty directory', () => {
      const result = analyzeProject(tempDir);

      expect(result).toBeDefined();
      expect(result.techStack).toEqual([]);
      expect(result.frameworks).toEqual([]);
      expect(result.hasExistingStructure).toBe(false);
      expect(result.hasExistingWorkflows).toBe(false);
      expect(result.hasExistingStandards).toBe(false);
    });

    it('should detect Node.js project', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({ name: 'test-app', version: '1.0.0' }),
      );

      const result = analyzeProject(tempDir);

      expect(result.techStack).toContain('Node.js');
      expect(result.configs.packageJson).toBe('package.json');
    });

    it('should generate summary', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({ name: 'test-app', version: '1.0.0' }),
      );

      const result = analyzeProject(tempDir);

      expect(result.summary).toContain('Node.js');
      expect(result.summary).toContain('parallel');
    });
  });

  describe('analyzeTechStack', () => {
    it('should detect Node.js from package.json', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({ name: 'test', version: '1.0.0' }),
      );

      const analysis = { techStack: [], frameworks: [], configs: {} };
      analyzeTechStack(tempDir, analysis);

      expect(analysis.techStack).toContain('Node.js');
    });

    it('should detect React framework', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'test',
          dependencies: { react: '^18.0.0' },
        }),
      );

      const analysis = { techStack: [], frameworks: [], configs: {} };
      analyzeTechStack(tempDir, analysis);

      expect(analysis.frameworks).toContain('React');
    });

    it('should detect Vue framework', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'test',
          dependencies: { vue: '^3.0.0' },
        }),
      );

      const analysis = { techStack: [], frameworks: [], configs: {} };
      analyzeTechStack(tempDir, analysis);

      expect(analysis.frameworks).toContain('Vue');
    });

    it('should detect Angular framework', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'test',
          dependencies: { '@angular/core': '^15.0.0' },
        }),
      );

      const analysis = { techStack: [], frameworks: [], configs: {} };
      analyzeTechStack(tempDir, analysis);

      expect(analysis.frameworks).toContain('Angular');
    });

    it('should detect Next.js framework', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'test',
          dependencies: { next: '^13.0.0' },
        }),
      );

      const analysis = { techStack: [], frameworks: [], configs: {} };
      analyzeTechStack(tempDir, analysis);

      expect(analysis.frameworks).toContain('Next.js');
    });

    it('should detect NestJS framework', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'test',
          dependencies: { '@nestjs/core': '^9.0.0' },
        }),
      );

      const analysis = { techStack: [], frameworks: [], configs: {} };
      analyzeTechStack(tempDir, analysis);

      expect(analysis.frameworks).toContain('NestJS');
    });

    it('should detect TypeScript', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'test',
          devDependencies: { typescript: '^5.0.0' },
        }),
      );

      const analysis = { techStack: [], frameworks: [], configs: {} };
      analyzeTechStack(tempDir, analysis);

      expect(analysis.techStack).toContain('TypeScript');
    });

    it('should detect TypeScript from tsconfig.json', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({ name: 'test' }),
      );
      fs.writeFileSync(path.join(tempDir, 'tsconfig.json'), '{}');

      const analysis = { techStack: [], frameworks: [], configs: {} };
      analyzeTechStack(tempDir, analysis);

      expect(analysis.techStack).toContain('TypeScript');
    });

    it('should detect Jest testing framework', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'test',
          devDependencies: { jest: '^29.0.0' },
        }),
      );

      const analysis = { techStack: [], frameworks: [], configs: {}, testing: 'none' };
      analyzeTechStack(tempDir, analysis);

      expect(analysis.testing).toBe('Jest');
    });

    it('should detect Vitest testing framework', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'test',
          devDependencies: { vitest: '^0.34.0' },
        }),
      );

      const analysis = { techStack: [], frameworks: [], configs: {}, testing: 'none' };
      analyzeTechStack(tempDir, analysis);

      expect(analysis.testing).toBe('Vitest');
    });

    it('should detect Python from requirements.txt', () => {
      fs.writeFileSync(path.join(tempDir, 'requirements.txt'), 'flask==2.0.0\n');

      const analysis = { techStack: [], frameworks: [], configs: {}, testing: 'none' };
      analyzeTechStack(tempDir, analysis);

      expect(analysis.techStack).toContain('Python');
      expect(analysis.frameworks).toContain('Flask');
    });

    it('should detect Python from pyproject.toml', () => {
      fs.writeFileSync(path.join(tempDir, 'pyproject.toml'), '[project]\nname = "test"\n');

      const analysis = { techStack: [], frameworks: [], configs: {} };
      analyzeTechStack(tempDir, analysis);

      expect(analysis.techStack).toContain('Python');
    });

    it('should detect Django framework', () => {
      fs.writeFileSync(path.join(tempDir, 'requirements.txt'), 'django==4.0.0\n');

      const analysis = { techStack: [], frameworks: [], configs: {}, testing: 'none' };
      analyzeTechStack(tempDir, analysis);

      expect(analysis.frameworks).toContain('Django');
    });

    it('should detect FastAPI framework', () => {
      fs.writeFileSync(path.join(tempDir, 'requirements.txt'), 'fastapi==0.100.0\n');

      const analysis = { techStack: [], frameworks: [], configs: {}, testing: 'none' };
      analyzeTechStack(tempDir, analysis);

      expect(analysis.frameworks).toContain('FastAPI');
    });

    it('should detect pytest testing framework', () => {
      fs.writeFileSync(path.join(tempDir, 'requirements.txt'), 'pytest==7.0.0\n');

      const analysis = { techStack: [], frameworks: [], configs: {}, testing: 'none' };
      analyzeTechStack(tempDir, analysis);

      expect(analysis.testing).toBe('pytest');
    });

    it('should detect Go from go.mod', () => {
      fs.writeFileSync(path.join(tempDir, 'go.mod'), 'module example.com/test\n');

      const analysis = { techStack: [], frameworks: [], configs: {} };
      analyzeTechStack(tempDir, analysis);

      expect(analysis.techStack).toContain('Go');
      expect(analysis.configs.goMod).toBe('go.mod');
    });

    it('should detect Rust from Cargo.toml', () => {
      fs.writeFileSync(path.join(tempDir, 'Cargo.toml'), '[package]\nname = "test"\n');

      const analysis = { techStack: [], frameworks: [], configs: {} };
      analyzeTechStack(tempDir, analysis);

      expect(analysis.techStack).toContain('Rust');
    });

    it('should detect multiple technologies', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({ name: 'test', dependencies: { react: '^18.0.0' } }),
      );
      fs.writeFileSync(path.join(tempDir, 'requirements.txt'), 'flask\n');

      const analysis = { techStack: [], frameworks: [], configs: {}, testing: 'none' };
      analyzeTechStack(tempDir, analysis);

      expect(analysis.techStack).toContain('Node.js');
      expect(analysis.techStack).toContain('Python');
      expect(analysis.frameworks).toContain('React');
      expect(analysis.frameworks).toContain('Flask');
    });
  });

  describe('analyzeCodeStandards', () => {
    it('should detect ESLint from .eslintrc.js', () => {
      fs.writeFileSync(path.join(tempDir, '.eslintrc.js'), 'module.exports = {};');

      const analysis = { configs: {}, linting: 'none', formatting: 'none', hasExistingStandards: false };
      analyzeCodeStandards(tempDir, analysis);

      expect(analysis.configs.eslint).toBe('.eslintrc.js');
      expect(analysis.linting).toBe('ESLint');
      expect(analysis.hasExistingStandards).toBe(true);
    });

    it('should detect ESLint from .eslintrc.json', () => {
      fs.writeFileSync(path.join(tempDir, '.eslintrc.json'), '{}');

      const analysis = { configs: {}, linting: 'none', formatting: 'none', hasExistingStandards: false };
      analyzeCodeStandards(tempDir, analysis);

      expect(analysis.configs.eslint).toBe('.eslintrc.json');
    });

    it('should detect ESLint flat config', () => {
      fs.writeFileSync(path.join(tempDir, 'eslint.config.js'), 'export default [];');

      const analysis = { configs: {}, linting: 'none', formatting: 'none', hasExistingStandards: false };
      analyzeCodeStandards(tempDir, analysis);

      expect(analysis.configs.eslint).toBe('eslint.config.js');
    });

    it('should detect Prettier from .prettierrc', () => {
      fs.writeFileSync(path.join(tempDir, '.prettierrc'), '{}');

      const analysis = { configs: {}, linting: 'none', formatting: 'none', hasExistingStandards: false };
      analyzeCodeStandards(tempDir, analysis);

      expect(analysis.configs.prettier).toBe('.prettierrc');
      expect(analysis.formatting).toBe('Prettier');
      expect(analysis.hasExistingStandards).toBe(true);
    });

    it('should detect Prettier from prettier.config.js', () => {
      fs.writeFileSync(path.join(tempDir, 'prettier.config.js'), 'module.exports = {};');

      const analysis = { configs: {}, linting: 'none', formatting: 'none', hasExistingStandards: false };
      analyzeCodeStandards(tempDir, analysis);

      expect(analysis.configs.prettier).toBe('prettier.config.js');
    });

    it('should detect TypeScript config', () => {
      fs.writeFileSync(path.join(tempDir, 'tsconfig.json'), '{}');

      const analysis = { configs: {}, linting: 'none', formatting: 'none', hasExistingStandards: false };
      analyzeCodeStandards(tempDir, analysis);

      expect(analysis.configs.tsconfig).toBe('tsconfig.json');
      expect(analysis.hasExistingStandards).toBe(true);
    });

    it('should detect Flake8', () => {
      fs.writeFileSync(path.join(tempDir, '.flake8'), '[flake8]\nmax-line-length = 100');

      const analysis = { configs: {}, linting: 'none', formatting: 'none', hasExistingStandards: false };
      analyzeCodeStandards(tempDir, analysis);

      expect(analysis.configs.flake8).toBe('.flake8');
      expect(analysis.linting).toBe('Flake8');
    });

    it('should detect Black from pyproject.toml', () => {
      fs.writeFileSync(
        path.join(tempDir, 'pyproject.toml'),
        '[project]\nname = "test"\n\n[tool.black]\nline-length = 100',
      );

      const analysis = { configs: {}, linting: 'none', formatting: 'none', hasExistingStandards: false };
      analyzeCodeStandards(tempDir, analysis);

      expect(analysis.formatting).toBe('Black');
      expect(analysis.hasExistingStandards).toBe(true);
    });

    it('should detect multiple code standards', () => {
      fs.writeFileSync(path.join(tempDir, '.eslintrc.js'), 'module.exports = {};');
      fs.writeFileSync(path.join(tempDir, '.prettierrc'), '{}');
      fs.writeFileSync(path.join(tempDir, 'tsconfig.json'), '{}');

      const analysis = { configs: {}, linting: 'none', formatting: 'none', hasExistingStandards: false };
      analyzeCodeStandards(tempDir, analysis);

      expect(analysis.configs.eslint).toBe('.eslintrc.js');
      expect(analysis.configs.prettier).toBe('.prettierrc');
      expect(analysis.configs.tsconfig).toBe('tsconfig.json');
    });
  });

  describe('analyzeWorkflows', () => {
    it('should detect GitHub Actions', () => {
      const workflowsDir = path.join(tempDir, '.github', 'workflows');
      fs.mkdirSync(workflowsDir, { recursive: true });
      fs.writeFileSync(path.join(workflowsDir, 'ci.yml'), 'name: CI\n');

      const analysis = { hasExistingWorkflows: false, configs: {}, manualReviewItems: [] };
      analyzeWorkflows(tempDir, analysis);

      expect(analysis.hasExistingWorkflows).toBe(true);
      expect(analysis.configs.githubWorkflows).toBe('.github/workflows/');
      expect(analysis.manualReviewItems).toContainEqual(
        expect.stringContaining('GitHub workflow'),
      );
    });

    it('should count GitHub workflows', () => {
      const workflowsDir = path.join(tempDir, '.github', 'workflows');
      fs.mkdirSync(workflowsDir, { recursive: true });
      fs.writeFileSync(path.join(workflowsDir, 'ci.yml'), 'name: CI\n');
      fs.writeFileSync(path.join(workflowsDir, 'deploy.yml'), 'name: Deploy\n');
      fs.writeFileSync(path.join(workflowsDir, 'test.yml'), 'name: Test\n');

      const analysis = { hasExistingWorkflows: false, configs: {}, manualReviewItems: [] };
      analyzeWorkflows(tempDir, analysis);

      expect(analysis.manualReviewItems).toContainEqual(
        expect.stringContaining('3 existing GitHub workflow'),
      );
    });

    it('should detect GitLab CI', () => {
      fs.writeFileSync(path.join(tempDir, '.gitlab-ci.yml'), 'stages:\n  - test\n');

      const analysis = { hasExistingWorkflows: false, configs: {}, manualReviewItems: [] };
      analyzeWorkflows(tempDir, analysis);

      expect(analysis.hasExistingWorkflows).toBe(true);
      expect(analysis.configs.gitlabCi).toBe('.gitlab-ci.yml');
      expect(analysis.manualReviewItems).toContainEqual(
        expect.stringContaining('GitLab CI'),
      );
    });

    it('should detect CircleCI', () => {
      const circleDir = path.join(tempDir, '.circleci');
      fs.mkdirSync(circleDir, { recursive: true });
      fs.writeFileSync(path.join(circleDir, 'config.yml'), 'version: 2.1\n');

      const analysis = { hasExistingWorkflows: false, configs: {}, manualReviewItems: [] };
      analyzeWorkflows(tempDir, analysis);

      expect(analysis.hasExistingWorkflows).toBe(true);
      expect(analysis.manualReviewItems).toContainEqual(
        expect.stringContaining('CircleCI'),
      );
    });

    it('should detect multiple CI systems', () => {
      const workflowsDir = path.join(tempDir, '.github', 'workflows');
      fs.mkdirSync(workflowsDir, { recursive: true });
      fs.writeFileSync(path.join(workflowsDir, 'ci.yml'), 'name: CI\n');
      fs.writeFileSync(path.join(tempDir, '.gitlab-ci.yml'), 'stages:\n');

      const analysis = { hasExistingWorkflows: false, configs: {}, manualReviewItems: [] };
      analyzeWorkflows(tempDir, analysis);

      expect(analysis.hasExistingWorkflows).toBe(true);
      expect(analysis.configs.githubWorkflows).toBe('.github/workflows/');
      expect(analysis.configs.gitlabCi).toBe('.gitlab-ci.yml');
    });
  });

  describe('analyzeDirectoryStructure', () => {
    it('should detect src directory', () => {
      fs.mkdirSync(path.join(tempDir, 'src'));

      const analysis = { hasExistingStructure: false, conflicts: [] };
      analyzeDirectoryStructure(tempDir, analysis);

      expect(analysis.hasExistingStructure).toBe(true);
    });

    it('should detect lib directory', () => {
      fs.mkdirSync(path.join(tempDir, 'lib'));

      const analysis = { hasExistingStructure: false, conflicts: [] };
      analyzeDirectoryStructure(tempDir, analysis);

      expect(analysis.hasExistingStructure).toBe(true);
    });

    it('should detect tests directory', () => {
      fs.mkdirSync(path.join(tempDir, 'tests'));

      const analysis = { hasExistingStructure: false, conflicts: [] };
      analyzeDirectoryStructure(tempDir, analysis);

      expect(analysis.hasExistingStructure).toBe(true);
    });

    it('should detect __tests__ directory', () => {
      fs.mkdirSync(path.join(tempDir, '__tests__'));

      const analysis = { hasExistingStructure: false, conflicts: [] };
      analyzeDirectoryStructure(tempDir, analysis);

      expect(analysis.hasExistingStructure).toBe(true);
    });

    it('should detect docs/architecture conflict', () => {
      fs.mkdirSync(path.join(tempDir, 'docs', 'architecture'), { recursive: true });

      const analysis = { hasExistingStructure: false, conflicts: [] };
      analyzeDirectoryStructure(tempDir, analysis);

      expect(analysis.conflicts).toContainEqual(
        expect.stringContaining('docs/architecture/'),
      );
    });

    it('should not flag docs without architecture as conflict', () => {
      fs.mkdirSync(path.join(tempDir, 'docs'));

      const analysis = { hasExistingStructure: false, conflicts: [] };
      analyzeDirectoryStructure(tempDir, analysis);

      expect(analysis.conflicts).toHaveLength(0);
    });
  });

  describe('generateRecommendations', () => {
    it('should recommend preserving existing linting', () => {
      const analysis = {
        linting: 'ESLint',
        formatting: 'none',
        hasExistingWorkflows: false,
        configs: {},
        frameworks: [],
        recommendations: [],
        mergeStrategy: 'parallel',
      };

      generateRecommendations(analysis);

      expect(analysis.recommendations).toContainEqual(
        expect.stringContaining('Preserve existing ESLint'),
      );
    });

    it('should recommend adding linting if none exists', () => {
      const analysis = {
        linting: 'none',
        formatting: 'none',
        hasExistingWorkflows: false,
        configs: {},
        frameworks: [],
        recommendations: [],
        mergeStrategy: 'parallel',
      };

      generateRecommendations(analysis);

      expect(analysis.recommendations).toContainEqual(
        expect.stringContaining('Consider adding ESLint/Flake8'),
      );
    });

    it('should recommend preserving existing formatting', () => {
      const analysis = {
        linting: 'none',
        formatting: 'Prettier',
        hasExistingWorkflows: false,
        configs: {},
        frameworks: [],
        recommendations: [],
        mergeStrategy: 'parallel',
      };

      generateRecommendations(analysis);

      expect(analysis.recommendations).toContainEqual(
        expect.stringContaining('Keep existing Prettier'),
      );
    });

    it('should recommend reviewing CI/CD for existing workflows', () => {
      const analysis = {
        linting: 'none',
        formatting: 'none',
        hasExistingWorkflows: true,
        configs: {},
        frameworks: [],
        recommendations: [],
        mergeStrategy: 'parallel',
      };

      generateRecommendations(analysis);

      expect(analysis.recommendations).toContainEqual(
        expect.stringContaining('Review existing CI/CD'),
      );
      expect(analysis.mergeStrategy).toBe('manual');
    });

    it('should recommend setup-github for projects without workflows', () => {
      const analysis = {
        linting: 'none',
        formatting: 'none',
        hasExistingWorkflows: false,
        configs: {},
        frameworks: [],
        recommendations: [],
        mergeStrategy: 'parallel',
      };

      generateRecommendations(analysis);

      expect(analysis.recommendations).toContainEqual(
        expect.stringContaining('*setup-github'),
      );
    });

    it('should add TypeScript recommendation', () => {
      const analysis = {
        linting: 'none',
        formatting: 'none',
        hasExistingWorkflows: false,
        configs: { tsconfig: 'tsconfig.json' },
        frameworks: [],
        recommendations: [],
        mergeStrategy: 'parallel',
      };

      generateRecommendations(analysis);

      expect(analysis.recommendations).toContainEqual(
        expect.stringContaining('existing tsconfig.json'),
      );
    });

    it('should add Next.js specific recommendation', () => {
      const analysis = {
        linting: 'none',
        formatting: 'none',
        hasExistingWorkflows: false,
        configs: {},
        frameworks: ['Next.js'],
        recommendations: [],
        mergeStrategy: 'parallel',
      };

      generateRecommendations(analysis);

      expect(analysis.recommendations).toContainEqual(
        expect.stringContaining('Next.js detected'),
      );
    });

    it('should add NestJS specific recommendation', () => {
      const analysis = {
        linting: 'none',
        formatting: 'none',
        hasExistingWorkflows: false,
        configs: {},
        frameworks: ['NestJS'],
        recommendations: [],
        mergeStrategy: 'parallel',
      };

      generateRecommendations(analysis);

      expect(analysis.recommendations).toContainEqual(
        expect.stringContaining('NestJS detected'),
      );
    });
  });

  describe('formatMigrationReport', () => {
    it('should generate formatted report', () => {
      const analysis = {
        techStack: ['Node.js', 'TypeScript'],
        frameworks: ['React'],
        linting: 'ESLint',
        formatting: 'Prettier',
        testing: 'Jest',
        hasExistingWorkflows: true,
        mergeStrategy: 'manual',
        recommendations: ['Keep ESLint', 'Review workflows'],
        conflicts: [],
        manualReviewItems: ['Check CI/CD'],
      };

      const report = formatMigrationReport(analysis);

      expect(report).toContain('BROWNFIELD ANALYSIS REPORT');
      expect(report).toContain('Node.js');
      expect(report).toContain('TypeScript');
      expect(report).toContain('React');
      expect(report).toContain('ESLint');
      expect(report).toContain('Prettier');
      expect(report).toContain('Jest');
      expect(report).toContain('RECOMMENDATIONS');
      expect(report).toContain('MANUAL REVIEW');
    });

    it('should include conflicts section when present', () => {
      const analysis = {
        techStack: ['Node.js'],
        frameworks: [],
        linting: 'none',
        formatting: 'none',
        testing: 'none',
        hasExistingWorkflows: false,
        mergeStrategy: 'parallel',
        recommendations: [],
        conflicts: ['docs/architecture exists'],
        manualReviewItems: [],
      };

      const report = formatMigrationReport(analysis);

      expect(report).toContain('POTENTIAL CONFLICTS');
      expect(report).toContain('docs/architecture');
    });

    it('should handle empty tech stack', () => {
      const analysis = {
        techStack: [],
        frameworks: [],
        linting: 'none',
        formatting: 'none',
        testing: 'none',
        hasExistingWorkflows: false,
        mergeStrategy: 'parallel',
        recommendations: [],
        conflicts: [],
        manualReviewItems: [],
      };

      const report = formatMigrationReport(analysis);

      expect(report).toContain('Unknown');
    });

    it('should include box drawing characters', () => {
      const analysis = {
        techStack: ['Node.js'],
        frameworks: [],
        linting: 'none',
        formatting: 'none',
        testing: 'none',
        hasExistingWorkflows: false,
        mergeStrategy: 'parallel',
        recommendations: [],
        conflicts: [],
        manualReviewItems: [],
      };

      const report = formatMigrationReport(analysis);

      expect(report).toContain('╔');
      expect(report).toContain('╗');
      expect(report).toContain('╚');
      expect(report).toContain('╝');
      expect(report).toContain('║');
    });
  });

  describe('full integration', () => {
    it('should analyze a complete Node.js project', () => {
      // Setup a realistic Node.js project
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'my-app',
          version: '1.0.0',
          dependencies: {
            react: '^18.0.0',
            next: '^13.0.0',
          },
          devDependencies: {
            typescript: '^5.0.0',
            jest: '^29.0.0',
          },
        }),
      );
      fs.writeFileSync(path.join(tempDir, 'tsconfig.json'), '{}');
      fs.writeFileSync(path.join(tempDir, '.eslintrc.js'), 'module.exports = {};');
      fs.writeFileSync(path.join(tempDir, '.prettierrc'), '{}');
      fs.mkdirSync(path.join(tempDir, 'src'));
      fs.mkdirSync(path.join(tempDir, '__tests__'));
      const workflowsDir = path.join(tempDir, '.github', 'workflows');
      fs.mkdirSync(workflowsDir, { recursive: true });
      fs.writeFileSync(path.join(workflowsDir, 'ci.yml'), 'name: CI\n');

      const result = analyzeProject(tempDir);

      // Check tech stack detection
      expect(result.techStack).toContain('Node.js');
      expect(result.techStack).toContain('TypeScript');

      // Check framework detection
      expect(result.frameworks).toContain('React');
      expect(result.frameworks).toContain('Next.js');

      // Check standards detection
      expect(result.linting).toBe('ESLint');
      expect(result.formatting).toBe('Prettier');
      expect(result.testing).toBe('Jest');

      // Check flags
      expect(result.hasExistingStructure).toBe(true);
      expect(result.hasExistingWorkflows).toBe(true);
      expect(result.hasExistingStandards).toBe(true);

      // Check merge strategy
      expect(result.mergeStrategy).toBe('manual');

      // Check recommendations
      expect(result.recommendations.length).toBeGreaterThan(0);

      // Check summary
      expect(result.summary).toBeTruthy();
    });

    it('should analyze a Python project', () => {
      fs.writeFileSync(
        path.join(tempDir, 'requirements.txt'),
        'django==4.0.0\npytest==7.0.0\n',
      );
      fs.writeFileSync(
        path.join(tempDir, 'pyproject.toml'),
        '[project]\nname = "myapp"\n\n[tool.black]\nline-length = 100',
      );
      fs.writeFileSync(
        path.join(tempDir, '.flake8'),
        '[flake8]\nmax-line-length = 100',
      );
      fs.mkdirSync(path.join(tempDir, 'src'));
      fs.mkdirSync(path.join(tempDir, 'tests'));

      const result = analyzeProject(tempDir);

      expect(result.techStack).toContain('Python');
      expect(result.frameworks).toContain('Django');
      expect(result.linting).toBe('Flake8');
      expect(result.formatting).toBe('Black');
      expect(result.testing).toBe('pytest');
      expect(result.hasExistingStructure).toBe(true);
    });
  });
});
