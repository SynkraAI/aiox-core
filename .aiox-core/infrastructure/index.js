/**
 * @fileoverview Infrastructure Module - Entry Point
 *
 * Centralizes tools, integrations, scripts, and PM adapters.
 * This is the base layer of the AIOX modular architecture.
 *
 * Uses safe loading to handle optional dependencies gracefully.
 *
 * @module infrastructure
 * @see ADR-002 Migration Map
 */

/**
 * Safely require a module, returning null if it fails
 */
function safeRequire(modulePath) {
  try {
    return require(modulePath);
  } catch (error) {
    // Only log in debug mode to avoid noise
    if (process.env.AIOX_DEBUG) {
      console.warn(`[infrastructure] Failed to load ${modulePath}: ${error.message}`);
    }
    return null;
  }
}

// Git Integration
const GitWrapper = safeRequire('./scripts/git-wrapper');
const GitConfigDetector = safeRequire('./scripts/git-config-detector');
const BranchManager = safeRequire('./scripts/branch-manager');
const CommitMessageGenerator = safeRequire('./scripts/commit-message-generator');

// PM Integration
const pmAdapter = safeRequire('./scripts/pm-adapter');
const PMAdapter = pmAdapter ? pmAdapter.PMAdapter : null;
const pmFactory = safeRequire('./scripts/pm-adapter-factory');
const getPMAdapter = pmFactory ? pmFactory.getPMAdapter : null;
const isPMToolConfigured = pmFactory ? pmFactory.isPMToolConfigured : null;
const clearPMAdapterCache = pmFactory ? pmFactory.clearPMAdapterCache : null;
const StatusMapper = safeRequire('./scripts/status-mapper');
const ClickUpHelpers = safeRequire('./scripts/clickup-helpers');

// Template & Generation
const TemplateEngine = safeRequire('./scripts/template-engine');
const ComponentGenerator = safeRequire('./scripts/component-generator');
const ComponentMetadata = safeRequire('./scripts/component-metadata');
const ComponentSearch = safeRequire('./scripts/component-search');
const BatchCreator = safeRequire('./scripts/batch-creator');

// Validation
const AioxValidator = safeRequire('./scripts/aiox-validator');
const TemplateValidator = safeRequire('./scripts/template-validator');
const validateOutputPatternModule = safeRequire('./scripts/validate-output-pattern');
const validateOutputPattern = validateOutputPatternModule ? validateOutputPatternModule.validateOutputPattern : null;
const SpotCheckValidator = safeRequire('./scripts/spot-check-validator');

// Analysis
const DependencyAnalyzer = safeRequire('./scripts/dependency-analyzer');
const DependencyImpactAnalyzer = safeRequire('./scripts/dependency-impact-analyzer');
const FrameworkAnalyzer = safeRequire('./scripts/framework-analyzer');
const CapabilityAnalyzer = safeRequire('./scripts/capability-analyzer');
const SecurityChecker = safeRequire('./scripts/security-checker');
const ModificationRiskAssessment = safeRequire('./scripts/modification-risk-assessment');

// Testing
const CoverageAnalyzer = safeRequire('./scripts/coverage-analyzer');
const TestGenerator = safeRequire('./scripts/test-generator');
const TestUtilities = safeRequire('./scripts/test-utilities');
const TestUtilitiesFast = safeRequire('./scripts/test-utilities-fast');
const TestQualityAssessment = safeRequire('./scripts/test-quality-assessment');
const SandboxTester = safeRequire('./scripts/sandbox-tester');

// Performance
const PerformanceAnalyzer = safeRequire('./scripts/performance-analyzer');
const PerformanceOptimizer = safeRequire('./scripts/performance-optimizer');
const PerformanceTracker = safeRequire('./scripts/performance-tracker');
const PerformanceAndErrorResolver = safeRequire('./scripts/performance-and-error-resolver');

// Quality
const CodeQualityImprover = safeRequire('./scripts/code-quality-improver');
const RefactoringSuggester = safeRequire('./scripts/refactoring-suggester');
const ImprovementEngine = safeRequire('./scripts/improvement-engine');
const ImprovementValidator = safeRequire('./scripts/improvement-validator');
const ModificationValidator = safeRequire('./scripts/modification-validator');

// Utilities
const ConflictResolver = safeRequire('./scripts/conflict-resolver');
const DocumentationSynchronizer = safeRequire('./scripts/documentation-synchronizer');
const toolResolver = safeRequire('./scripts/tool-resolver');
const resolveTool = toolResolver ? toolResolver.resolveTool : null;
const UsageAnalytics = safeRequire('./scripts/usage-analytics');
const projectStatusLoader = safeRequire('./scripts/project-status-loader');
const loadProjectStatus = projectStatusLoader ? projectStatusLoader.loadProjectStatus : null;
const formatStatusDisplay = projectStatusLoader ? projectStatusLoader.formatStatusDisplay : null;
const VisualImpactGenerator = safeRequire('./scripts/visual-impact-generator');
const AtomicLayerClassifier = safeRequire('./scripts/atomic-layer-classifier');

// System
const BackupManager = safeRequire('./scripts/backup-manager');
const TransactionManager = safeRequire('./scripts/transaction-manager');
const RepositoryDetector = safeRequire('./scripts/repository-detector');
const ApprovalWorkflow = safeRequire('./scripts/approval-workflow');

// Config
const ConfigCache = safeRequire('./scripts/config-cache');
const ConfigLoader = safeRequire('./scripts/config-loader');
const OutputFormatter = safeRequire('./scripts/output-formatter');
const YamlValidator = safeRequire('./scripts/yaml-validator');

// Build exports object, filtering out null values
const moduleExports = {
  // Git Integration
  GitWrapper,
  GitConfigDetector,
  BranchManager,
  CommitMessageGenerator,

  // PM Integration
  PMAdapter,
  getPMAdapter,
  isPMToolConfigured,
  clearPMAdapterCache,
  StatusMapper,
  ClickUpHelpers,

  // Template & Generation
  TemplateEngine,
  ComponentGenerator,
  ComponentMetadata,
  ComponentSearch,
  BatchCreator,

  // Validation
  AioxValidator,
  TemplateValidator,
  validateOutputPattern,
  SpotCheckValidator,

  // Analysis
  DependencyAnalyzer,
  DependencyImpactAnalyzer,
  FrameworkAnalyzer,
  CapabilityAnalyzer,
  SecurityChecker,
  ModificationRiskAssessment,

  // Testing
  CoverageAnalyzer,
  TestGenerator,
  TestUtilities,
  TestUtilitiesFast,
  TestQualityAssessment,
  SandboxTester,

  // Performance
  PerformanceAnalyzer,
  PerformanceOptimizer,
  PerformanceTracker,
  PerformanceAndErrorResolver,

  // Quality
  CodeQualityImprover,
  RefactoringSuggester,
  ImprovementEngine,
  ImprovementValidator,
  ModificationValidator,

  // Utilities
  ConflictResolver,
  DocumentationSynchronizer,
  resolveTool,
  UsageAnalytics,
  loadProjectStatus,
  formatStatusDisplay,
  VisualImpactGenerator,
  AtomicLayerClassifier,

  // System
  BackupManager,
  TransactionManager,
  RepositoryDetector,
  ApprovalWorkflow,

  // Config
  ConfigCache,
  ConfigLoader,
  OutputFormatter,
  YamlValidator,
};

// Remove null exports for cleaner API
Object.keys(moduleExports).forEach(key => {
  if (moduleExports[key] === null) {
    delete moduleExports[key];
  }
});

module.exports = moduleExports;
