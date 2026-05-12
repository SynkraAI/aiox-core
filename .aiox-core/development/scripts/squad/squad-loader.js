/**
 * Squad Loader Utility
 *
 * Utilities for loading and resolving squad manifests from local directories.
 * Used by squad-creator agent tasks.
 *
 * @module squad-loader
 * @version 1.0.0
 * @see Story SQS-2: Squad Loader Utility
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * Supported manifest file names in order of preference
 * @constant {string[]}
 */
const MANIFEST_FILES = ['squad.yaml', 'config.yaml'];

/**
 * Default path for squads directory
 * @constant {string}
 */
const DEFAULT_SQUADS_PATH = './squads';

/**
 * Error codes for SquadLoaderError
 * @enum {string}
 */
const ErrorCodes = {
  SQUAD_NOT_FOUND: 'SQUAD_NOT_FOUND',
  MANIFEST_NOT_FOUND: 'MANIFEST_NOT_FOUND',
  YAML_PARSE_ERROR: 'YAML_PARSE_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
};

/**
 * Suggestions for each error code
 * @constant {Object.<string, string|Function>}
 */
const ErrorSuggestions = {
  [ErrorCodes.SQUAD_NOT_FOUND]: (squadName) =>
    `Create squad with: @squad-creator *create-squad ${squadName}`,
  [ErrorCodes.MANIFEST_NOT_FOUND]: () =>
    'Create squad.yaml in squad directory',
  [ErrorCodes.YAML_PARSE_ERROR]: () =>
    'Check YAML syntax - use a YAML linter',
  [ErrorCodes.PERMISSION_DENIED]: (filePath) =>
    `Check file permissions: chmod 644 ${filePath}`,
};

/**
 * Custom error class for Squad Loader operations
 * @extends Error
 */
class SquadLoaderError extends Error {
  /**
   * Create a SquadLoaderError
   * @param {string} code - Error code from ErrorCodes enum
   * @param {string} message - Human-readable error message
   * @param {string} [suggestion] - Suggested fix for the error
   * @param {string} [filePath] - Path to the problematic file/directory
   */
  constructor(code, message, suggestion, filePath) {
    super(message);
    this.name = 'SquadLoaderError';
    this.code = code;
    this.suggestion = suggestion || '';
    this.filePath = filePath || '';

    // Maintains proper stack trace for where error was thrown (V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SquadLoaderError);
    }
  }

  /**
   * Create error for squad not found
   * @param {string} squadName - Name of the squad
   * @param {string} squadsPath - Path searched
   * @returns {SquadLoaderError}
   */
  static squadNotFound(squadName, squadsPath) {
    const filePath = path.join(squadsPath, squadName);
    return new SquadLoaderError(
      ErrorCodes.SQUAD_NOT_FOUND,
      `Squad "${squadName}" not found in ${squadsPath}/`,
      ErrorSuggestions[ErrorCodes.SQUAD_NOT_FOUND](squadName),
      filePath,
    );
  }

  /**
   * Create error for manifest not found
   * @param {string} squadPath - Path to squad directory
   * @returns {SquadLoaderError}
   */
  static manifestNotFound(squadPath) {
    return new SquadLoaderError(
      ErrorCodes.MANIFEST_NOT_FOUND,
      `No manifest found in ${squadPath}/ (expected squad.yaml or config.yaml)`,
      ErrorSuggestions[ErrorCodes.MANIFEST_NOT_FOUND](),
      squadPath,
    );
  }

  /**
   * Create error for YAML parse failure
   * @param {string} filePath - Path to the YAML file
   * @param {Error} parseError - Original YAML parse error
   * @returns {SquadLoaderError}
   */
  static yamlParseError(filePath, parseError) {
    return new SquadLoaderError(
      ErrorCodes.YAML_PARSE_ERROR,
      `Failed to parse YAML in ${filePath}: ${parseError.message}`,
      ErrorSuggestions[ErrorCodes.YAML_PARSE_ERROR](),
      filePath,
    );
  }

  /**
   * Create error for permission denied
   * @param {string} filePath - Path to the file/directory
   * @param {Error} originalError - Original file system error
   * @returns {SquadLoaderError}
   */
  static permissionDenied(filePath, originalError) {
    return new SquadLoaderError(
      ErrorCodes.PERMISSION_DENIED,
      `Permission denied accessing ${filePath}: ${originalError.message}`,
      ErrorSuggestions[ErrorCodes.PERMISSION_DENIED](filePath),
      filePath,
    );
  }

  /**
   * Returns formatted error string
   * @returns {string}
   */
  toString() {
    let str = `[${this.code}] ${this.message}`;
    if (this.suggestion) {
      str += `\n  Suggestion: ${this.suggestion}`;
    }
    return str;
  }
}

/**
 * Squad Loader class for loading and resolving squad manifests
 */
class SquadLoader {
  /**
   * Create a SquadLoader instance
   * @param {Object} [options={}] - Configuration options
   * @param {string} [options.squadsPath='./squads'] - Path to squads directory
   * @param {boolean} [options.verbose=false] - Enable verbose logging
   */
  constructor(options = {}) {
    this.squadsPath = options.squadsPath || DEFAULT_SQUADS_PATH;
    this.verbose = options.verbose || false;
  }

  /**
   * Log message if verbose mode is enabled
   * @private
   * @param {string} message - Message to log
   */
  _log(message) {
    if (this.verbose) {
      console.log(`[SquadLoader] ${message}`);
    }
  }

  /**
   * Resolve squad path by name
   *
   * Finds a squad directory and its manifest file.
   *
   * @param {string} squadName - Name of the squad (kebab-case)
   * @returns {Promise<{path: string, manifestPath: string}>} Resolved paths
   * @throws {SquadLoaderError} SQUAD_NOT_FOUND if squad directory doesn't exist
   * @throws {SquadLoaderError} MANIFEST_NOT_FOUND if no manifest file found
   *
   * @example
   * const loader = new SquadLoader();
   * const { path, manifestPath } = await loader.resolve('etl-squad');
   * // { path: './squads/etl-squad', manifestPath: './squads/etl-squad/squad.yaml' }
   */
  async resolve(squadName) {
    this._log(`Resolving squad: ${squadName}`);
    const squadPath = path.join(this.squadsPath, squadName);

    // Check if squad directory exists
    const exists = await this._pathExists(squadPath);
    if (!exists) {
      throw SquadLoaderError.squadNotFound(squadName, this.squadsPath);
    }

    // Find manifest file
    const manifestPath = await this._findManifest(squadPath);
    if (!manifestPath) {
      throw SquadLoaderError.manifestNotFound(squadPath);
    }

    this._log(`Resolved: ${squadPath} -> ${manifestPath}`);
    return { path: squadPath, manifestPath };
  }

  /**
   * Load and parse squad manifest
   *
   * Loads the manifest file from a squad directory and parses it.
   * Shows deprecation warning for config.yaml files.
   *
   * @param {string} squadPath - Path to squad directory
   * @returns {Promise<Object>} Parsed manifest data
   * @throws {SquadLoaderError} MANIFEST_NOT_FOUND if no manifest file found
   * @throws {SquadLoaderError} YAML_PARSE_ERROR if YAML parsing fails
   * @throws {SquadLoaderError} PERMISSION_DENIED if file cannot be read
   *
   * @example
   * const loader = new SquadLoader();
   * const manifest = await loader.loadManifest('./squads/etl-squad');
   * console.log(manifest.name); // 'etl-squad'
   */
  async loadManifest(squadPath) {
    this._log(`Loading manifest from: ${squadPath}`);

    const manifestPath = await this._findManifest(squadPath);
    if (!manifestPath) {
      throw SquadLoaderError.manifestNotFound(squadPath);
    }

    // Deprecation warning for config.yaml
    const manifestFilename = path.basename(manifestPath);
    if (manifestFilename === 'config.yaml') {
      console.warn(
        `\u26a0\ufe0f  DEPRECATED: ${manifestPath} uses legacy format. Rename to squad.yaml`,
      );
    }

    try {
      const content = await fs.readFile(manifestPath, 'utf-8');
      const parsed = yaml.load(content);
      this._log(`Manifest loaded successfully: ${manifestPath}`);
      return parsed;
    } catch (error) {
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        throw SquadLoaderError.permissionDenied(manifestPath, error);
      }
      if (error.name === 'YAMLException') {
        throw SquadLoaderError.yamlParseError(manifestPath, error);
      }
      throw error;
    }
  }

  /**
   * List all local squads in project
   *
   * Scans the squads directory for valid squad directories
   * (directories containing a manifest file).
   *
   * @returns {Promise<Array<{name: string, path: string, manifestPath: string}>>}
   *          Array of squad info objects
   *
   * @example
   * const loader = new SquadLoader();
   * const squads = await loader.listLocal();
   * // [
   * //   { name: 'etl-squad', path: './squads/etl-squad', manifestPath: '...' },
   * //   { name: 'creator-squad', path: './squads/creator-squad', manifestPath: '...' }
   * // ]
   */
  async listLocal() {
    this._log(`Listing squads in: ${this.squadsPath}`);

    const exists = await this._pathExists(this.squadsPath);
    if (!exists) {
      this._log('Squads directory does not exist, returning empty array');
      return [];
    }

    let entries;
    try {
      entries = await fs.readdir(this.squadsPath, { withFileTypes: true });
    } catch (error) {
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        throw SquadLoaderError.permissionDenied(this.squadsPath, error);
      }
      throw error;
    }

    const squads = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const squadPath = path.join(this.squadsPath, entry.name);
        const manifestPath = await this._findManifest(squadPath);
        if (manifestPath) {
          squads.push({
            name: entry.name,
            path: squadPath,
            manifestPath,
          });
          this._log(`Found squad: ${entry.name}`);
        } else {
          this._log(`Skipped directory (no manifest): ${entry.name}`);
        }
      }
    }

    this._log(`Found ${squads.length} squad(s)`);
    return squads;
  }

  /**
   * Find manifest file in squad directory
   * @private
   * @param {string} squadPath - Path to squad directory
   * @returns {Promise<string|null>} Path to manifest or null if not found
   */
  async _findManifest(squadPath) {
    for (const filename of MANIFEST_FILES) {
      const manifestPath = path.join(squadPath, filename);
      if (await this._pathExists(manifestPath)) {
        return manifestPath;
      }
    }
    return null;
  }

  /**
   * Check if path exists
   * @private
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>} True if path exists
   */
  async _pathExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = {
  SquadLoader,
  SquadLoaderError,
  MANIFEST_FILES,
  DEFAULT_SQUADS_PATH,
  ErrorCodes,
};
