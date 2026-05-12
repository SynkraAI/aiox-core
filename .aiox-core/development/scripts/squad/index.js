/**
 * Squad Scripts Module
 *
 * Central exports for squad-related utilities used by the squad-creator agent.
 *
 * @module squad
 * @see {@link ./squad-loader.js} - Load and resolve squad manifests
 * @see {@link ./squad-validator.js} - Validate squad structure (SQS-3)
 * @see {@link ./squad-generator.js} - Generate new squads (SQS-4)
 * @see {@link ./squad-designer.js} - Design squads from documentation (SQS-9)
 * @see {@link ./squad-migrator.js} - Migrate legacy squads to AIOX 2.1 (SQS-7)
 * @see {@link ./squad-downloader.js} - Download squads from registry (SQS-6)
 * @see {@link ./squad-publisher.js} - Publish squads to registry (SQS-6)
 */

const {
  SquadLoader,
  SquadLoaderError,
  MANIFEST_FILES,
  DEFAULT_SQUADS_PATH,
  ErrorCodes,
} = require('./squad-loader');

const {
  SquadValidator,
  ValidationErrorCodes,
  TASK_REQUIRED_FIELDS,
} = require('./squad-validator');

const {
  SquadGenerator,
  SquadGeneratorError,
  GeneratorErrorCodes,
  AVAILABLE_TEMPLATES,
  AVAILABLE_LICENSES,
  CONFIG_MODES,
  DEFAULT_DESIGNS_PATH,
  SQUAD_DESIGN_SCHEMA_PATH,
  isValidSquadName,
  getGitUserName,
} = require('./squad-generator');

const {
  SquadDesigner,
  SquadDesignerError,
  DesignerErrorCodes,
} = require('./squad-designer');

const {
  SquadMigrator,
  SquadMigratorError,
  MigratorErrorCodes,
} = require('./squad-migrator');

const {
  SquadDownloader,
  SquadDownloaderError,
  DownloaderErrorCodes,
  REGISTRY_URL,
  GITHUB_API_BASE,
} = require('./squad-downloader');

const {
  SquadPublisher,
  SquadPublisherError,
  PublisherErrorCodes,
  AIOX_SQUADS_REPO,
  SAFE_NAME_PATTERN,
  sanitizeForShell,
  isValidName,
} = require('./squad-publisher');

module.exports = {
  // Squad Loader (SQS-2)
  SquadLoader,
  SquadLoaderError,
  MANIFEST_FILES,
  DEFAULT_SQUADS_PATH,
  ErrorCodes,

  // Squad Validator (SQS-3)
  SquadValidator,
  ValidationErrorCodes,
  TASK_REQUIRED_FIELDS,

  // Squad Generator (SQS-4)
  SquadGenerator,
  SquadGeneratorError,
  GeneratorErrorCodes,
  AVAILABLE_TEMPLATES,
  AVAILABLE_LICENSES,
  CONFIG_MODES,
  DEFAULT_DESIGNS_PATH,
  SQUAD_DESIGN_SCHEMA_PATH,
  isValidSquadName,
  getGitUserName,

  // Squad Designer (SQS-9)
  SquadDesigner,
  SquadDesignerError,
  DesignerErrorCodes,

  // Squad Migrator (SQS-7)
  SquadMigrator,
  SquadMigratorError,
  MigratorErrorCodes,

  // Squad Downloader (SQS-6)
  SquadDownloader,
  SquadDownloaderError,
  DownloaderErrorCodes,
  REGISTRY_URL,
  GITHUB_API_BASE,

  // Squad Publisher (SQS-6)
  SquadPublisher,
  SquadPublisherError,
  PublisherErrorCodes,
  AIOX_SQUADS_REPO,
  SAFE_NAME_PATTERN,
  sanitizeForShell,
  isValidName,
};
