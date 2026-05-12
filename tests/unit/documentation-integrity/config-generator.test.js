/**
 * Config Generator Unit Tests
 *
 * @module tests/unit/documentation-integrity/config-generator
 * @story 6.9
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const yaml = require('js-yaml');

const {
  buildConfigContext,
  renderConfigTemplate,
  loadConfigTemplate,
  generateConfig,
  buildDeploymentConfig,
  getDefaultDeploymentConfig,
  ConfigTemplates,
  DeploymentWorkflow,
  DeploymentPlatform,
} = require('../../../.aiox-core/infrastructure/scripts/documentation-integrity/config-generator');

describe('Config Generator', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-configgen-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('buildConfigContext', () => {
    it('should build context for greenfield project', () => {
      const deploymentConfig = {
        workflow: DeploymentWorkflow.STAGING_FIRST,
        platform: DeploymentPlatform.RAILWAY,
      };

      const context = buildConfigContext('my-project', 'greenfield', deploymentConfig);

      expect(context.PROJECT_NAME).toBe('my-project');
      expect(context.DEPLOYMENT_WORKFLOW).toBe('staging-first');
      expect(context.DEPLOYMENT_PLATFORM).toBe('Railway');
      expect(context.STAGING_BRANCH).toBe('staging');
      expect(context.PRODUCTION_BRANCH).toBe('main');
    });

    it('should build context for direct-to-main workflow', () => {
      const deploymentConfig = {
        workflow: DeploymentWorkflow.DIRECT_TO_MAIN,
      };

      const context = buildConfigContext('solo-project', 'greenfield', deploymentConfig);

      expect(context.DEPLOYMENT_WORKFLOW).toBe('direct-to-main');
      expect(context.STAGING_BRANCH).toBe('null');
      // direct-to-main uses 'production' as symbolic target (resolved by deployment-config-loader)
      expect(context.DEFAULT_TARGET).toBe('production');
    });

    it('should include quality gates', () => {
      const deploymentConfig = {
        qualityGates: {
          lint: true,
          typecheck: false,
          tests: true,
          securityScan: true,
          minCoverage: 80,
        },
      };

      const context = buildConfigContext('test', 'greenfield', deploymentConfig);

      expect(context.QUALITY_LINT).toBe(true);
      expect(context.QUALITY_TYPECHECK).toBe(false);
      expect(context.QUALITY_TESTS).toBe(true);
      expect(context.QUALITY_SECURITY).toBe(true);
      expect(context.MIN_COVERAGE).toBe(80);
    });

    it('should include brownfield analysis results', () => {
      const analysisResults = {
        hasExistingStructure: true,
        hasExistingWorkflows: true,
        mergeStrategy: 'manual',
        techStack: ['Node.js', 'TypeScript'],
        eslintPath: '.eslintrc.js',
      };

      const context = buildConfigContext('existing-app', 'brownfield', {}, analysisResults);

      expect(context.HAS_EXISTING_STRUCTURE).toBe(true);
      expect(context.HAS_EXISTING_WORKFLOWS).toBe(true);
      expect(context.MERGE_STRATEGY).toBe('manual');
      expect(context.ESLINT_CONFIG_PATH).toBe('.eslintrc.js');
    });

    it('should include generation date', () => {
      const context = buildConfigContext('test', 'greenfield', {});
      const today = new Date().toISOString().split('T')[0];

      expect(context.GENERATED_DATE).toBe(today);
    });
  });

  describe('renderConfigTemplate', () => {
    it('should replace simple variables', () => {
      const template = 'name: "{{PROJECT_NAME}}"';
      const context = { PROJECT_NAME: 'my-app' };

      const result = renderConfigTemplate(template, context);

      expect(result).toBe('name: "my-app"');
    });

    it('should handle boolean values', () => {
      const template = 'lint: {{QUALITY_LINT}}';
      const context = { QUALITY_LINT: true };

      const result = renderConfigTemplate(template, context);

      expect(result).toBe('lint: true');
    });

    it('should handle number values', () => {
      const template = 'coverage: {{MIN_COVERAGE}}';
      const context = { MIN_COVERAGE: 80 };

      const result = renderConfigTemplate(template, context);

      expect(result).toBe('coverage: 80');
    });

    it('should process each blocks', () => {
      const template = 'items:\n{{#each ITEMS}}  - "{{this}}"\n{{/each}}';
      const context = { ITEMS: ['a', 'b', 'c'] };

      const result = renderConfigTemplate(template, context);

      expect(result).toContain('- "a"');
      expect(result).toContain('- "b"');
      expect(result).toContain('- "c"');
    });

    it('should handle empty each blocks', () => {
      const template = 'items:\n{{#each ITEMS}}  - "{{this}}"\n{{/each}}';
      const context = { ITEMS: [] };

      const result = renderConfigTemplate(template, context);

      expect(result).toBe('items:\n');
    });
  });

  describe('loadConfigTemplate', () => {
    it('should load greenfield template', () => {
      const template = loadConfigTemplate(ConfigTemplates.GREENFIELD);

      expect(template).toContain('{{PROJECT_NAME}}');
      expect(template).toContain('greenfield');
      expect(template).toContain('deployment');
    });

    it('should load brownfield template', () => {
      const template = loadConfigTemplate(ConfigTemplates.BROWNFIELD);

      expect(template).toContain('{{PROJECT_NAME}}');
      expect(template).toContain('brownfield');
      expect(template).toContain('analysis');
    });

    it('should throw for non-existent template', () => {
      expect(() => loadConfigTemplate('non-existent.yaml')).toThrow('template not found');
    });
  });

  describe('generateConfig', () => {
    it('should generate valid YAML for greenfield', () => {
      const context = buildConfigContext('test-project', 'greenfield', {
        workflow: DeploymentWorkflow.STAGING_FIRST,
        platform: DeploymentPlatform.RAILWAY,
      });

      const result = generateConfig(tempDir, 'greenfield', context);

      expect(result.success).toBe(true);
      expect(result.content).toBeTruthy();

      // Verify YAML is valid
      const parsed = yaml.load(result.content);
      expect(parsed.project.name).toBe('test-project');
      expect(parsed.project.mode).toBe('greenfield');
      expect(parsed.deployment.workflow).toBe('staging-first');
    });

    it('should generate valid YAML for brownfield', () => {
      const analysisResults = {
        hasExistingStructure: true,
        techStack: ['Python'],
      };
      const context = buildConfigContext('legacy-app', 'brownfield', {}, analysisResults);

      const result = generateConfig(tempDir, 'brownfield', context);

      expect(result.success).toBe(true);

      const parsed = yaml.load(result.content);
      expect(parsed.project.mode).toBe('brownfield');
      expect(parsed.project.analysis).toBeDefined();
    });

    it('should create .aiox-core directory', () => {
      const context = buildConfigContext('test', 'greenfield', {});

      generateConfig(tempDir, 'greenfield', context);

      expect(fs.existsSync(path.join(tempDir, '.aiox-core'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, '.aiox-core', 'core-config.yaml'))).toBe(true);
    });

    it('should support dry run mode', () => {
      const context = buildConfigContext('test', 'greenfield', {});

      const result = generateConfig(tempDir, 'greenfield', context, { dryRun: true });

      expect(result.success).toBe(true);
      expect(result.content).toBeTruthy();
      expect(fs.existsSync(path.join(tempDir, '.aiox-core'))).toBe(false);
    });

    it('should include devLoadAlwaysFiles', () => {
      const context = buildConfigContext('test', 'greenfield', {});

      const result = generateConfig(tempDir, 'greenfield', context, { dryRun: true });
      const parsed = yaml.load(result.content);

      expect(parsed.devLoadAlwaysFiles).toContain('docs/architecture/coding-standards.md');
      expect(parsed.devLoadAlwaysFiles).toContain('docs/architecture/tech-stack.md');
      expect(parsed.devLoadAlwaysFiles).toContain('docs/architecture/source-tree.md');
    });
  });

  describe('buildDeploymentConfig', () => {
    it('should build config with defaults', () => {
      const config = buildDeploymentConfig({});

      expect(config.workflow).toBe(DeploymentWorkflow.STAGING_FIRST);
      expect(config.stagingBranch).toBe('staging');
      expect(config.productionBranch).toBe('main');
      expect(config.qualityGates.lint).toBe(true);
    });

    it('should apply user inputs', () => {
      const config = buildDeploymentConfig({
        workflow: DeploymentWorkflow.DIRECT_TO_MAIN,
        productionBranch: 'master',
        platform: DeploymentPlatform.VERCEL,
        lint: false,
      });

      expect(config.workflow).toBe('direct-to-main');
      expect(config.productionBranch).toBe('master');
      expect(config.platform).toBe('Vercel');
      expect(config.qualityGates.lint).toBe(false);
    });
  });

  describe('getDefaultDeploymentConfig', () => {
    it('should return staging-first config by default', () => {
      const config = getDefaultDeploymentConfig('greenfield');

      expect(config.workflow).toBe('staging-first');
    });

    it('should return similar config for brownfield', () => {
      const config = getDefaultDeploymentConfig('brownfield');

      expect(config.workflow).toBe('staging-first');
    });
  });

  describe('ConfigTemplates enum', () => {
    it('should have all required templates', () => {
      expect(ConfigTemplates.GREENFIELD).toBe('core-config-greenfield.tmpl.yaml');
      expect(ConfigTemplates.BROWNFIELD).toBe('core-config-brownfield.tmpl.yaml');
    });
  });

  describe('DeploymentWorkflow enum', () => {
    it('should have all workflow types', () => {
      expect(DeploymentWorkflow.STAGING_FIRST).toBe('staging-first');
      expect(DeploymentWorkflow.DIRECT_TO_MAIN).toBe('direct-to-main');
    });
  });

  describe('DeploymentPlatform enum', () => {
    it('should have all platform options', () => {
      expect(DeploymentPlatform.RAILWAY).toBe('Railway');
      expect(DeploymentPlatform.VERCEL).toBe('Vercel');
      expect(DeploymentPlatform.AWS).toBe('AWS');
      expect(DeploymentPlatform.DOCKER).toBe('Docker');
      expect(DeploymentPlatform.NONE).toBe('None');
    });
  });
});
