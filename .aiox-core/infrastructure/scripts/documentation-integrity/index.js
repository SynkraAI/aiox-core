/**
 * Documentation Integrity System
 *
 * Mode-aware project configuration system for AIOX.
 * Supports three installation modes: framework-dev, greenfield, brownfield.
 *
 * @module documentation-integrity
 * @version 1.0.0
 * @story 6.9
 */

const modeDetector = require('./mode-detector');
const docGenerator = require('./doc-generator');
const configGenerator = require('./config-generator');
const deploymentConfigLoader = require('./deployment-config-loader');
const gitignoreGenerator = require('./gitignore-generator');
const brownfieldAnalyzer = require('./brownfield-analyzer');

// Re-export all modules
module.exports = {
  // Mode detection
  detectInstallationMode: modeDetector.detectInstallationMode,
  collectMarkers: modeDetector.collectMarkers,
  isAioxCoreRepository: modeDetector.isAioxCoreRepository,
  mapLegacyTypeToMode: modeDetector.mapLegacyTypeToMode,
  validateModeSelection: modeDetector.validateModeSelection,
  getModeOptions: modeDetector.getModeOptions,

  // Mode constants
  InstallationMode: modeDetector.InstallationMode,
  LegacyProjectType: modeDetector.LegacyProjectType,
  ModeDescriptions: modeDetector.ModeDescriptions,

  // Documentation generation (Phase 2)
  buildDocContext: docGenerator.buildDocContext,
  generateDocs: docGenerator.generateDocs,
  generateDoc: docGenerator.generateDoc,
  TemplateFiles: docGenerator.TemplateFiles,
  OutputFiles: docGenerator.OutputFiles,

  // Config generation (Phase 3)
  buildConfigContext: configGenerator.buildConfigContext,
  generateConfig: configGenerator.generateConfig,
  buildDeploymentConfig: configGenerator.buildDeploymentConfig,
  ConfigTemplates: configGenerator.ConfigTemplates,
  DeploymentWorkflow: configGenerator.DeploymentWorkflow,
  DeploymentPlatform: configGenerator.DeploymentPlatform,

  // Deployment config loader (shared utility)
  loadDeploymentConfig: deploymentConfigLoader.loadDeploymentConfig,
  loadProjectConfig: deploymentConfigLoader.loadProjectConfig,
  getTargetBranch: deploymentConfigLoader.getTargetBranch,
  getEnvironmentConfig: deploymentConfigLoader.getEnvironmentConfig,
  isQualityGateEnabled: deploymentConfigLoader.isQualityGateEnabled,
  getEnabledQualityGates: deploymentConfigLoader.getEnabledQualityGates,
  validateDeploymentConfig: deploymentConfigLoader.validateDeploymentConfig,

  // Gitignore generation (Phase 4)
  generateGitignore: gitignoreGenerator.generateGitignore,
  mergeGitignore: gitignoreGenerator.mergeGitignore,
  generateGitignoreFile: gitignoreGenerator.generateGitignoreFile,
  hasAioxIntegration: gitignoreGenerator.hasAioxIntegration,
  GitignoreTemplates: gitignoreGenerator.GitignoreTemplates,
  TechStack: gitignoreGenerator.TechStack,

  // Brownfield analysis (Phase 5)
  analyzeProject: brownfieldAnalyzer.analyzeProject,
  analyzeTechStack: brownfieldAnalyzer.analyzeTechStack,
  analyzeCodeStandards: brownfieldAnalyzer.analyzeCodeStandards,
  analyzeWorkflows: brownfieldAnalyzer.analyzeWorkflows,
  analyzeDirectoryStructure: brownfieldAnalyzer.analyzeDirectoryStructure,
  generateRecommendations: brownfieldAnalyzer.generateRecommendations,
  formatMigrationReport: brownfieldAnalyzer.formatMigrationReport,
};
