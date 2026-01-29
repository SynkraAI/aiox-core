/**
 * CI/CD Discovery
 * Gap Analysis Implementation
 *
 * Auto-detects CI/CD infrastructure in projects and provides
 * integration points for AIOS workflows.
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

/**
 * Provider configurations for different CI/CD systems
 */
const PROVIDERS = {
  'github-actions': {
    name: 'GitHub Actions',
    configPaths: ['.github/workflows'],
    configPatterns: ['*.yml', '*.yaml'],
    triggerTypes: ['push', 'pull_request', 'workflow_dispatch', 'schedule', 'release'],
  },
  'gitlab-ci': {
    name: 'GitLab CI',
    configPaths: ['.'],
    configPatterns: ['.gitlab-ci.yml', '.gitlab-ci.yaml'],
    triggerTypes: ['push', 'merge_request', 'schedule', 'pipeline', 'trigger'],
  },
  jenkins: {
    name: 'Jenkins',
    configPaths: ['.'],
    configPatterns: ['Jenkinsfile', 'jenkins.yml', 'jenkins.yaml'],
    triggerTypes: ['scm', 'cron', 'upstream', 'manual'],
  },
  circleci: {
    name: 'CircleCI',
    configPaths: ['.circleci'],
    configPatterns: ['config.yml', 'config.yaml'],
    triggerTypes: ['push', 'pull_request', 'schedule', 'api'],
  },
  'travis-ci': {
    name: 'Travis CI',
    configPaths: ['.'],
    configPatterns: ['.travis.yml', '.travis.yaml'],
    triggerTypes: ['push', 'pull_request', 'cron', 'api'],
  },
  'azure-pipelines': {
    name: 'Azure Pipelines',
    configPaths: ['.'],
    configPatterns: ['azure-pipelines.yml', 'azure-pipelines.yaml'],
    triggerTypes: ['push', 'pull_request', 'schedule', 'manual'],
  },
  bitbucket: {
    name: 'Bitbucket Pipelines',
    configPaths: ['.'],
    configPatterns: ['bitbucket-pipelines.yml'],
    triggerTypes: ['push', 'pull_request', 'manual', 'schedule'],
  },
  'aws-codepipeline': {
    name: 'AWS CodePipeline',
    configPaths: ['.'],
    configPatterns: ['buildspec.yml', 'buildspec.yaml'],
    triggerTypes: ['push', 'manual', 'cloudwatch'],
  },
};

/**
 * ConfigParser - Parses CI/CD configuration files
 */
class ConfigParser {
  constructor() {
    this.yamlParser = null;
  }

  /**
   * Parse YAML content (simple parser without external deps)
   */
  parseYaml(content) {
    // Simple YAML parser for CI/CD configs
    const result = {};
    const lines = content.split('\n');
    const stack = [{ obj: result, indent: -1 }];

    for (const line of lines) {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || !line.trim()) continue;

      const indent = line.search(/\S/);
      const trimmed = line.trim();

      // Pop stack until we find parent with smaller indent
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const parent = stack[stack.length - 1].obj;

      // Handle list items
      if (trimmed.startsWith('- ')) {
        const value = trimmed.substring(2).trim();
        const lastKey = Object.keys(parent).pop();
        if (lastKey && !Array.isArray(parent[lastKey])) {
          parent[lastKey] = [];
        }
        if (lastKey) {
          if (value.includes(':')) {
            const obj = {};
            const [k, v] = value.split(':').map((s) => s.trim());
            obj[k] = v || {};
            parent[lastKey].push(obj);
            stack.push({ obj: obj, indent: indent });
          } else {
            parent[lastKey].push(value);
          }
        }
        continue;
      }

      // Handle key-value pairs
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0) {
        const key = trimmed.substring(0, colonIdx).trim();
        const value = trimmed.substring(colonIdx + 1).trim();

        if (value) {
          // Inline value
          parent[key] = value.replace(/^["']|["']$/g, '');
        } else {
          // Nested object
          parent[key] = {};
          stack.push({ obj: parent[key], indent: indent });
        }
      }
    }

    return result;
  }

  /**
   * Parse Jenkinsfile (Groovy-based)
   */
  parseJenkinsfile(content) {
    const result = {
      type: 'jenkinsfile',
      stages: [],
      agents: [],
      environment: {},
      triggers: [],
      options: [],
    };

    // Extract pipeline blocks
    const pipelineMatch = content.match(/pipeline\s*\{([\s\S]*)\}/);
    if (!pipelineMatch) {
      // Scripted pipeline
      result.type = 'scripted';
      const stageMatches = content.matchAll(/stage\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
      for (const match of stageMatches) {
        result.stages.push({ name: match[1] });
      }
      return result;
    }

    const pipelineContent = pipelineMatch[1];

    // Extract agent
    const agentMatch = pipelineContent.match(/agent\s*\{([^}]+)\}/);
    if (agentMatch) {
      const agentContent = agentMatch[1].trim();
      if (agentContent.includes('docker')) {
        result.agents.push({ type: 'docker', config: agentContent });
      } else if (agentContent.includes('kubernetes')) {
        result.agents.push({ type: 'kubernetes', config: agentContent });
      } else if (agentContent.includes('label')) {
        const labelMatch = agentContent.match(/label\s+['"]([^'"]+)['"]/);
        result.agents.push({ type: 'label', value: labelMatch?.[1] });
      } else {
        result.agents.push({ type: 'any' });
      }
    }

    // Extract stages
    const stagesMatch = pipelineContent.match(
      /stages\s*\{([\s\S]*?)\}(?=\s*(?:post|options|triggers|\}|$))/
    );
    if (stagesMatch) {
      const stageMatches = stagesMatch[1].matchAll(/stage\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
      for (const match of stageMatches) {
        result.stages.push({ name: match[1] });
      }
    }

    // Extract environment
    const envMatch = pipelineContent.match(/environment\s*\{([^}]+)\}/);
    if (envMatch) {
      const envLines = envMatch[1].trim().split('\n');
      for (const line of envLines) {
        const eqMatch = line.match(/(\w+)\s*=\s*(.+)/);
        if (eqMatch) {
          result.environment[eqMatch[1]] = eqMatch[2].trim();
        }
      }
    }

    // Extract triggers
    const triggersMatch = pipelineContent.match(/triggers\s*\{([^}]+)\}/);
    if (triggersMatch) {
      if (triggersMatch[1].includes('pollSCM')) result.triggers.push('scm');
      if (triggersMatch[1].includes('cron')) result.triggers.push('cron');
      if (triggersMatch[1].includes('upstream')) result.triggers.push('upstream');
    }

    return result;
  }

  /**
   * Parse GitHub Actions workflow
   */
  parseGitHubActions(content, filename) {
    const config = this.parseYaml(content);

    const result = {
      name: config.name || filename,
      triggers: [],
      jobs: [],
      env: config.env || {},
    };

    // Extract triggers
    if (config.on) {
      if (typeof config.on === 'string') {
        result.triggers.push(config.on);
      } else if (Array.isArray(config.on)) {
        result.triggers = config.on;
      } else {
        result.triggers = Object.keys(config.on);
      }
    }

    // Extract jobs
    if (config.jobs) {
      for (const [jobName, jobConfig] of Object.entries(config.jobs)) {
        const job = {
          name: jobName,
          runsOn: jobConfig['runs-on'] || 'ubuntu-latest',
          steps: [],
          needs: jobConfig.needs || [],
          env: jobConfig.env || {},
        };

        if (Array.isArray(jobConfig.steps)) {
          for (const step of jobConfig.steps) {
            job.steps.push({
              name: step.name || step.uses || step.run?.substring(0, 50),
              uses: step.uses,
              run: step.run,
            });
          }
        }

        result.jobs.push(job);
      }
    }

    return result;
  }

  /**
   * Parse GitLab CI configuration
   */
  parseGitLabCI(content) {
    const config = this.parseYaml(content);

    const result = {
      stages: config.stages || [],
      jobs: [],
      variables: config.variables || {},
      include: config.include || [],
    };

    // Reserved keywords (not jobs)
    const reserved = [
      'stages',
      'variables',
      'include',
      'default',
      'workflow',
      'image',
      'services',
      'before_script',
      'after_script',
      'cache',
    ];

    // Extract jobs
    for (const [key, value] of Object.entries(config)) {
      if (reserved.includes(key) || key.startsWith('.')) continue;
      if (typeof value === 'object') {
        result.jobs.push({
          name: key,
          stage: value.stage || 'test',
          script: value.script || [],
          only: value.only || [],
          except: value.except || [],
          needs: value.needs || [],
        });
      }
    }

    return result;
  }

  /**
   * Parse CircleCI configuration
   */
  parseCircleCI(content) {
    const config = this.parseYaml(content);

    const result = {
      version: config.version,
      orbs: config.orbs || {},
      jobs: [],
      workflows: [],
    };

    // Extract jobs
    if (config.jobs) {
      for (const [name, jobConfig] of Object.entries(config.jobs)) {
        result.jobs.push({
          name,
          docker: jobConfig.docker || [],
          steps: jobConfig.steps || [],
          workingDirectory: jobConfig.working_directory,
        });
      }
    }

    // Extract workflows
    if (config.workflows) {
      for (const [name, wfConfig] of Object.entries(config.workflows)) {
        if (name === 'version') continue;
        result.workflows.push({
          name,
          jobs: wfConfig.jobs || [],
          triggers: wfConfig.triggers || [],
        });
      }
    }

    return result;
  }

  /**
   * Parse any CI/CD config based on provider
   */
  parse(content, provider, filename = '') {
    switch (provider) {
      case 'github-actions':
        return this.parseGitHubActions(content, filename);
      case 'gitlab-ci':
        return this.parseGitLabCI(content);
      case 'jenkins':
        return this.parseJenkinsfile(content);
      case 'circleci':
        return this.parseCircleCI(content);
      default:
        return this.parseYaml(content);
    }
  }
}

/**
 * ProviderDetector - Detects which CI/CD providers are in use
 */
class ProviderDetector {
  constructor(rootPath) {
    this.rootPath = rootPath;
  }

  /**
   * Detect all CI/CD providers in the project
   */
  async detect() {
    const detected = [];

    for (const [providerId, config] of Object.entries(PROVIDERS)) {
      const files = this.findConfigFiles(providerId, config);
      if (files.length > 0) {
        detected.push({
          id: providerId,
          name: config.name,
          files,
          triggerTypes: config.triggerTypes,
        });
      }
    }

    return detected;
  }

  /**
   * Find configuration files for a provider
   */
  findConfigFiles(providerId, config) {
    const files = [];

    for (const configPath of config.configPaths) {
      const fullPath = path.join(this.rootPath, configPath);

      if (!fs.existsSync(fullPath)) continue;

      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Search directory for matching files
        try {
          const entries = fs.readdirSync(fullPath);
          for (const entry of entries) {
            if (this.matchesPattern(entry, config.configPatterns)) {
              files.push(path.join(configPath, entry));
            }
          }
        } catch {
          // Ignore permission errors
        }
      } else {
        // Direct file match
        const basename = path.basename(fullPath);
        if (this.matchesPattern(basename, config.configPatterns)) {
          files.push(configPath);
        }
      }
    }

    return files;
  }

  /**
   * Check if filename matches any pattern
   */
  matchesPattern(filename, patterns) {
    for (const pattern of patterns) {
      if (pattern.startsWith('*.')) {
        const ext = pattern.substring(1);
        if (filename.endsWith(ext)) return true;
      } else if (filename === pattern) {
        return true;
      }
    }
    return false;
  }
}

/**
 * PipelineAnalyzer - Analyzes parsed pipeline configurations
 */
class PipelineAnalyzer {
  /**
   * Analyze a parsed pipeline configuration
   */
  analyze(parsed, provider) {
    const analysis = {
      provider,
      complexity: 'simple',
      hasTests: false,
      hasBuild: false,
      hasDeploy: false,
      hasLint: false,
      hasSecurityScan: false,
      environments: [],
      secrets: [],
      dependencies: [],
      parallelism: false,
      caching: false,
      artifacts: false,
    };

    // Analyze based on provider
    switch (provider) {
      case 'github-actions':
        this.analyzeGitHubActions(parsed, analysis);
        break;
      case 'gitlab-ci':
        this.analyzeGitLabCI(parsed, analysis);
        break;
      case 'jenkins':
        this.analyzeJenkins(parsed, analysis);
        break;
      case 'circleci':
        this.analyzeCircleCI(parsed, analysis);
        break;
      default:
        this.analyzeGeneric(parsed, analysis);
    }

    // Calculate complexity
    analysis.complexity = this.calculateComplexity(analysis);

    return analysis;
  }

  /**
   * Analyze GitHub Actions workflow
   */
  analyzeGitHubActions(parsed, analysis) {
    const jobs = parsed.jobs || [];

    for (const job of jobs) {
      // Check for parallel jobs
      if (jobs.length > 1) {
        analysis.parallelism = true;
      }

      // Check steps
      for (const step of job.steps || []) {
        const stepStr = JSON.stringify(step).toLowerCase();

        // Test detection
        if (
          stepStr.includes('test') ||
          stepStr.includes('jest') ||
          stepStr.includes('pytest') ||
          stepStr.includes('npm run test')
        ) {
          analysis.hasTests = true;
        }

        // Build detection
        if (
          stepStr.includes('build') ||
          stepStr.includes('compile') ||
          stepStr.includes('npm run build')
        ) {
          analysis.hasBuild = true;
        }

        // Deploy detection
        if (
          stepStr.includes('deploy') ||
          stepStr.includes('publish') ||
          stepStr.includes('release')
        ) {
          analysis.hasDeploy = true;
        }

        // Lint detection
        if (
          stepStr.includes('lint') ||
          stepStr.includes('eslint') ||
          stepStr.includes('prettier')
        ) {
          analysis.hasLint = true;
        }

        // Security scan detection
        if (
          stepStr.includes('security') ||
          stepStr.includes('snyk') ||
          stepStr.includes('codeql') ||
          stepStr.includes('trivy')
        ) {
          analysis.hasSecurityScan = true;
        }

        // Cache detection
        if (step.uses?.includes('cache')) {
          analysis.caching = true;
        }

        // Artifacts detection
        if (step.uses?.includes('upload-artifact') || step.uses?.includes('download-artifact')) {
          analysis.artifacts = true;
        }
      }

      // Extract environments from job
      if (job.env) {
        for (const key of Object.keys(job.env)) {
          if (key.includes('ENV') || key.includes('ENVIRONMENT')) {
            const value = job.env[key];
            if (!analysis.environments.includes(value)) {
              analysis.environments.push(value);
            }
          }
        }
      }

      // Extract secrets
      const jobStr = JSON.stringify(job);
      const secretMatches = jobStr.matchAll(/secrets\.(\w+)/g);
      for (const match of secretMatches) {
        if (!analysis.secrets.includes(match[1])) {
          analysis.secrets.push(match[1]);
        }
      }
    }
  }

  /**
   * Analyze GitLab CI configuration
   */
  analyzeGitLabCI(parsed, analysis) {
    const stages = parsed.stages || [];
    const jobs = parsed.jobs || [];

    // Check stages for common patterns
    for (const stage of stages) {
      const stageLower = stage.toLowerCase();
      if (stageLower.includes('test')) analysis.hasTests = true;
      if (stageLower.includes('build')) analysis.hasBuild = true;
      if (stageLower.includes('deploy')) analysis.hasDeploy = true;
      if (stageLower.includes('lint')) analysis.hasLint = true;
      if (stageLower.includes('security') || stageLower.includes('scan')) {
        analysis.hasSecurityScan = true;
      }
    }

    // Check jobs
    for (const job of jobs) {
      const jobStr = JSON.stringify(job).toLowerCase();

      if (jobStr.includes('test')) analysis.hasTests = true;
      if (jobStr.includes('build')) analysis.hasBuild = true;
      if (jobStr.includes('deploy')) analysis.hasDeploy = true;

      // Extract environments
      if (job.environment) {
        analysis.environments.push(job.environment);
      }
    }

    // Extract variables/secrets
    if (parsed.variables) {
      for (const key of Object.keys(parsed.variables)) {
        if (key.includes('SECRET') || key.includes('TOKEN') || key.includes('KEY')) {
          analysis.secrets.push(key);
        }
      }
    }

    // Parallelism (multiple jobs in same stage)
    const jobsByStage = {};
    for (const job of jobs) {
      const stage = job.stage || 'test';
      jobsByStage[stage] = (jobsByStage[stage] || 0) + 1;
    }
    if (Object.values(jobsByStage).some((count) => count > 1)) {
      analysis.parallelism = true;
    }
  }

  /**
   * Analyze Jenkins pipeline
   */
  analyzeJenkins(parsed, analysis) {
    const stages = parsed.stages || [];

    for (const stage of stages) {
      const nameLower = stage.name.toLowerCase();
      if (nameLower.includes('test')) analysis.hasTests = true;
      if (nameLower.includes('build')) analysis.hasBuild = true;
      if (nameLower.includes('deploy')) analysis.hasDeploy = true;
      if (nameLower.includes('lint')) analysis.hasLint = true;
      if (nameLower.includes('security') || nameLower.includes('scan')) {
        analysis.hasSecurityScan = true;
      }
    }

    // Check environment for secrets
    if (parsed.environment) {
      for (const [key, value] of Object.entries(parsed.environment)) {
        if (value.includes('credentials(') || key.includes('SECRET') || key.includes('TOKEN')) {
          analysis.secrets.push(key);
        }
      }
    }

    // Check triggers
    if (parsed.triggers?.length > 0) {
      analysis.triggers = parsed.triggers;
    }
  }

  /**
   * Analyze CircleCI configuration
   */
  analyzeCircleCI(parsed, analysis) {
    const jobs = parsed.jobs || [];
    const workflows = parsed.workflows || [];

    for (const job of jobs) {
      const nameLower = job.name.toLowerCase();
      const stepsStr = JSON.stringify(job.steps || []).toLowerCase();

      if (nameLower.includes('test') || stepsStr.includes('test')) {
        analysis.hasTests = true;
      }
      if (nameLower.includes('build') || stepsStr.includes('build')) {
        analysis.hasBuild = true;
      }
      if (nameLower.includes('deploy') || stepsStr.includes('deploy')) {
        analysis.hasDeploy = true;
      }

      // Check for caching
      if (stepsStr.includes('restore_cache') || stepsStr.includes('save_cache')) {
        analysis.caching = true;
      }

      // Check for artifacts
      if (stepsStr.includes('store_artifacts') || stepsStr.includes('persist_to_workspace')) {
        analysis.artifacts = true;
      }
    }

    // Check workflows for parallelism
    for (const workflow of workflows) {
      if (workflow.jobs?.length > 1) {
        analysis.parallelism = true;
      }
    }

    // Check orbs
    if (parsed.orbs) {
      for (const orbName of Object.keys(parsed.orbs)) {
        if (orbName.includes('security') || orbName.includes('snyk')) {
          analysis.hasSecurityScan = true;
        }
      }
    }
  }

  /**
   * Generic analysis for unknown providers
   */
  analyzeGeneric(parsed, analysis) {
    const str = JSON.stringify(parsed).toLowerCase();

    analysis.hasTests = str.includes('test');
    analysis.hasBuild = str.includes('build');
    analysis.hasDeploy = str.includes('deploy');
    analysis.hasLint = str.includes('lint');
    analysis.hasSecurityScan = str.includes('security') || str.includes('scan');
  }

  /**
   * Calculate pipeline complexity
   */
  calculateComplexity(analysis) {
    let score = 0;

    if (analysis.hasTests) score += 1;
    if (analysis.hasBuild) score += 1;
    if (analysis.hasDeploy) score += 2;
    if (analysis.hasLint) score += 1;
    if (analysis.hasSecurityScan) score += 2;
    if (analysis.parallelism) score += 1;
    if (analysis.caching) score += 1;
    if (analysis.artifacts) score += 1;
    if (analysis.environments.length > 1) score += 2;
    if (analysis.secrets.length > 3) score += 1;

    if (score <= 3) return 'simple';
    if (score <= 6) return 'moderate';
    if (score <= 9) return 'complex';
    return 'enterprise';
  }
}

/**
 * IntegrationSuggester - Suggests AIOS integration points
 */
class IntegrationSuggester {
  /**
   * Generate integration suggestions based on analysis
   */
  suggest(analysis, provider) {
    const suggestions = [];

    // Add AIOS build step
    suggestions.push({
      type: 'add_step',
      priority: 'high',
      title: 'Add AIOS Build Orchestration',
      description: 'Integrate AIOS build orchestrator for intelligent parallel builds',
      code: this.getAIOSBuildStep(provider),
    });

    // Add test step if missing
    if (!analysis.hasTests) {
      suggestions.push({
        type: 'add_step',
        priority: 'medium',
        title: 'Add Test Discovery',
        description: 'Use AIOS test discovery to automatically find and run tests',
        code: this.getTestStep(provider),
      });
    }

    // Add lint step if missing
    if (!analysis.hasLint) {
      suggestions.push({
        type: 'add_step',
        priority: 'low',
        title: 'Add Linting Step',
        description: 'Add code quality checks with ESLint/Prettier',
        code: this.getLintStep(provider),
      });
    }

    // Add security scan if missing
    if (!analysis.hasSecurityScan) {
      suggestions.push({
        type: 'add_step',
        priority: 'high',
        title: 'Add Security Scanning',
        description: 'Add AIOS PR Review AI for security analysis',
        code: this.getSecurityStep(provider),
      });
    }

    // Add caching if missing
    if (!analysis.caching && provider === 'github-actions') {
      suggestions.push({
        type: 'add_step',
        priority: 'medium',
        title: 'Add Dependency Caching',
        description: 'Cache node_modules to speed up builds',
        code: this.getCacheStep(provider),
      });
    }

    // Add AIOS status reporting
    suggestions.push({
      type: 'add_step',
      priority: 'low',
      title: 'Add AIOS Status Reporting',
      description: 'Report build status to AIOS dashboard',
      code: this.getStatusStep(provider),
    });

    return suggestions;
  }

  /**
   * Get AIOS build step for provider
   */
  getAIOSBuildStep(provider) {
    const steps = {
      'github-actions': `- name: AIOS Build Orchestration
  run: npx aios build --parallel --smart-cache
  env:
    AIOS_CI: true`,

      'gitlab-ci': `aios_build:
  stage: build
  script:
    - npx aios build --parallel --smart-cache
  variables:
    AIOS_CI: "true"`,

      jenkins: `stage('AIOS Build') {
  steps {
    sh 'npx aios build --parallel --smart-cache'
  }
  environment {
    AIOS_CI = 'true'
  }
}`,

      circleci: `- run:
    name: AIOS Build Orchestration
    command: npx aios build --parallel --smart-cache
    environment:
      AIOS_CI: true`,
    };

    return steps[provider] || steps['github-actions'];
  }

  /**
   * Get test step for provider
   */
  getTestStep(provider) {
    const steps = {
      'github-actions': `- name: Run Tests
  run: npx aios test --discover --coverage`,

      'gitlab-ci': `test:
  stage: test
  script:
    - npx aios test --discover --coverage
  coverage: '/Coverage: \\d+\\.\\d+%/'`,

      jenkins: `stage('Test') {
  steps {
    sh 'npx aios test --discover --coverage'
  }
}`,

      circleci: `- run:
    name: Run Tests
    command: npx aios test --discover --coverage`,
    };

    return steps[provider] || steps['github-actions'];
  }

  /**
   * Get lint step for provider
   */
  getLintStep(provider) {
    const steps = {
      'github-actions': `- name: Lint Code
  run: npm run lint`,

      'gitlab-ci': `lint:
  stage: test
  script:
    - npm run lint`,

      jenkins: `stage('Lint') {
  steps {
    sh 'npm run lint'
  }
}`,

      circleci: `- run:
    name: Lint Code
    command: npm run lint`,
    };

    return steps[provider] || steps['github-actions'];
  }

  /**
   * Get security step for provider
   */
  getSecurityStep(provider) {
    const steps = {
      'github-actions': `- name: Security Scan
  run: npx aios review --security-only
  continue-on-error: true`,

      'gitlab-ci': `security_scan:
  stage: test
  script:
    - npx aios review --security-only
  allow_failure: true`,

      jenkins: `stage('Security Scan') {
  steps {
    sh 'npx aios review --security-only'
  }
  post {
    failure {
      echo 'Security issues found'
    }
  }
}`,

      circleci: `- run:
    name: Security Scan
    command: npx aios review --security-only
    when: always`,
    };

    return steps[provider] || steps['github-actions'];
  }

  /**
   * Get cache step for GitHub Actions
   */
  getCacheStep(provider) {
    if (provider !== 'github-actions') return '';

    return `- name: Cache node_modules
  uses: actions/cache@v4
  with:
    path: node_modules
    key: \${{ runner.os }}-node-\${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      \${{ runner.os }}-node-`;
  }

  /**
   * Get status reporting step
   */
  getStatusStep(provider) {
    const steps = {
      'github-actions': `- name: Report to AIOS
  if: always()
  run: npx aios status --report-ci
  env:
    AIOS_BUILD_STATUS: \${{ job.status }}`,

      'gitlab-ci': `report_status:
  stage: .post
  script:
    - npx aios status --report-ci
  when: always`,

      jenkins: `post {
  always {
    sh 'npx aios status --report-ci'
  }
}`,

      circleci: `- run:
    name: Report to AIOS
    command: npx aios status --report-ci
    when: always`,
    };

    return steps[provider] || steps['github-actions'];
  }
}

/**
 * CICDDiscovery - Main discovery engine
 */
class CICDDiscovery extends EventEmitter {
  constructor(config = {}) {
    super();
    this.rootPath = config.rootPath || process.cwd();
    this.detector = new ProviderDetector(this.rootPath);
    this.parser = new ConfigParser();
    this.analyzer = new PipelineAnalyzer();
    this.suggester = new IntegrationSuggester();
  }

  /**
   * Scan project for CI/CD configurations
   */
  async scan(options = {}) {
    this.emit('scan:start', { rootPath: this.rootPath });

    const result = {
      providers: [],
      pipelines: [],
      analysis: {},
      suggestions: [],
      summary: {},
    };

    try {
      // Detect providers
      const providers = await this.detector.detect();
      result.providers = providers;
      this.emit('providers:detected', { count: providers.length, providers });

      if (providers.length === 0) {
        result.summary = {
          hasCI: false,
          message: 'No CI/CD configuration found',
          recommendation: 'Consider adding GitHub Actions for automated builds',
        };
        this.emit('scan:complete', result);
        return result;
      }

      // Parse and analyze each provider's configs
      for (const provider of providers) {
        for (const file of provider.files) {
          const filePath = path.join(this.rootPath, file);

          try {
            const content = fs.readFileSync(filePath, 'utf8');
            const parsed = this.parser.parse(content, provider.id, path.basename(file));
            const analysis = this.analyzer.analyze(parsed, provider.id);

            const pipeline = {
              provider: provider.id,
              providerName: provider.name,
              file,
              parsed,
              analysis,
            };

            result.pipelines.push(pipeline);
            result.analysis[file] = analysis;

            // Generate suggestions
            const suggestions = this.suggester.suggest(analysis, provider.id);
            for (const suggestion of suggestions) {
              suggestion.file = file;
              suggestion.provider = provider.id;
              result.suggestions.push(suggestion);
            }

            this.emit('pipeline:analyzed', { file, analysis });
          } catch (error) {
            this.emit('pipeline:error', { file, error: error.message });
          }
        }
      }

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
      hasCI: result.providers.length > 0,
      providerCount: result.providers.length,
      pipelineCount: result.pipelines.length,
      providers: result.providers.map((p) => p.name),
      features: {
        hasTests: false,
        hasBuild: false,
        hasDeploy: false,
        hasLint: false,
        hasSecurityScan: false,
      },
      complexity: 'none',
      suggestionCount: result.suggestions.length,
      highPrioritySuggestions: result.suggestions.filter((s) => s.priority === 'high').length,
    };

    // Aggregate features
    for (const analysis of Object.values(result.analysis)) {
      if (analysis.hasTests) summary.features.hasTests = true;
      if (analysis.hasBuild) summary.features.hasBuild = true;
      if (analysis.hasDeploy) summary.features.hasDeploy = true;
      if (analysis.hasLint) summary.features.hasLint = true;
      if (analysis.hasSecurityScan) summary.features.hasSecurityScan = true;
    }

    // Determine overall complexity
    const complexities = Object.values(result.analysis).map((a) => a.complexity);
    if (complexities.includes('enterprise')) summary.complexity = 'enterprise';
    else if (complexities.includes('complex')) summary.complexity = 'complex';
    else if (complexities.includes('moderate')) summary.complexity = 'moderate';
    else if (complexities.includes('simple')) summary.complexity = 'simple';

    return summary;
  }

  /**
   * Get quick status of CI/CD
   */
  async quickCheck() {
    const providers = await this.detector.detect();

    return {
      hasCI: providers.length > 0,
      providers: providers.map((p) => ({
        id: p.id,
        name: p.name,
        fileCount: p.files.length,
      })),
    };
  }

  /**
   * Validate pipeline configuration
   */
  async validate(filePath) {
    const fullPath = path.join(this.rootPath, filePath);

    if (!fs.existsSync(fullPath)) {
      return { valid: false, error: 'File not found' };
    }

    // Detect provider from path
    let provider = null;
    for (const [id, config] of Object.entries(PROVIDERS)) {
      for (const pattern of config.configPatterns) {
        if (filePath.includes(pattern.replace('*', '')) || path.basename(filePath) === pattern) {
          provider = id;
          break;
        }
      }
      if (provider) break;
    }

    if (!provider) {
      return { valid: false, error: 'Unknown CI/CD provider' };
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const parsed = this.parser.parse(content, provider, path.basename(filePath));

      // Basic validation
      const errors = [];
      const warnings = [];

      if (provider === 'github-actions') {
        if (!parsed.triggers || parsed.triggers.length === 0) {
          warnings.push('No triggers defined - workflow will never run automatically');
        }
        if (!parsed.jobs || parsed.jobs.length === 0) {
          errors.push('No jobs defined');
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        parsed,
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const discovery = new CICDDiscovery();

  discovery.on('providers:detected', ({ count }) => {
    console.log(`Found ${count} CI/CD provider(s)`);
  });

  discovery.on('pipeline:analyzed', ({ file }) => {
    console.log(`  Analyzed: ${file}`);
  });

  if (args.includes('--quick')) {
    discovery.quickCheck().then((result) => {
      console.log(JSON.stringify(result, null, 2));
    });
  } else {
    discovery
      .scan()
      .then((result) => {
        console.log('\n--- Summary ---');
        console.log(JSON.stringify(result.summary, null, 2));

        if (args.includes('--suggestions')) {
          console.log('\n--- Suggestions ---');
          for (const suggestion of result.suggestions) {
            console.log(`\n[${suggestion.priority.toUpperCase()}] ${suggestion.title}`);
            console.log(suggestion.description);
            console.log('```');
            console.log(suggestion.code);
            console.log('```');
          }
        }
      })
      .catch((error) => {
        console.error('Error:', error.message);
        process.exit(1);
      });
  }
}

module.exports = CICDDiscovery;
module.exports.CICDDiscovery = CICDDiscovery;
module.exports.ConfigParser = ConfigParser;
module.exports.ProviderDetector = ProviderDetector;
module.exports.PipelineAnalyzer = PipelineAnalyzer;
module.exports.IntegrationSuggester = IntegrationSuggester;
module.exports.PROVIDERS = PROVIDERS;
