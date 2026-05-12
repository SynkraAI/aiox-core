const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Detects the current repository context and installation mode
 *
 * @returns {Object|null} Repository context object or null if detection fails
 * @property {string} repositoryUrl - Git remote URL
 * @property {string} mode - 'framework-development' or 'project-development'
 * @property {string} projectRoot - Current working directory
 * @property {string} frameworkLocation - Path to AIOX framework files
 * @property {string} packageName - Name from package.json
 * @property {string} packageVersion - Version from package.json
 */
function detectRepositoryContext() {
  const cwd = process.cwd();

  // Detect git remote URL
  let remoteUrl = null;
  try {
    remoteUrl = execSync('git config --get remote.origin.url', { cwd })
      .toString()
      .trim();
  } catch (error) {
    console.warn('⚠️  No git repository detected');
    return null;
  }

  // Read package.json
  const packageJsonPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.warn('⚠️  No package.json found');
    return null;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Detect if we're in aiox-core repo itself
  const isFrameworkRepo =
    packageJson.name === '@aiox/fullstack' ||
    packageJson.name === 'aiox-core' ||
    remoteUrl.includes('aiox-core');

  // Load installation config if exists
  let installConfig = null;
  const configPath = path.join(cwd, '.aiox-installation-config.yaml');
  if (fs.existsSync(configPath)) {
    const yaml = require('js-yaml');
    installConfig = yaml.load(fs.readFileSync(configPath, 'utf8'));
  }

  return {
    repositoryUrl: remoteUrl,
    mode: installConfig?.installation?.mode ||
          (isFrameworkRepo ? 'framework-development' : 'project-development'),
    projectRoot: cwd,
    frameworkLocation: isFrameworkRepo ? cwd : path.join(cwd, 'node_modules/@aiox/fullstack'),
    packageName: packageJson.name,
    packageVersion: packageJson.version,
  };
}

module.exports = { detectRepositoryContext };
