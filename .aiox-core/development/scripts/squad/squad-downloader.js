/**
 * Squad Downloader Utility
 *
 * Downloads squads from the aiox-squads GitHub repository.
 * Uses GitHub API for registry.json and raw file downloads.
 *
 * @module squad-downloader
 * @version 1.0.0
 * @see Story SQS-6: Download & Publish Tasks
 */

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

/**
 * Default registry URL for aiox-squads
 * @constant {string}
 */
const REGISTRY_URL =
  'https://raw.githubusercontent.com/SynkraAI/aiox-squads/main/registry.json';

/**
 * GitHub API base URL for aiox-squads contents
 * @constant {string}
 */
const GITHUB_API_BASE =
  'https://api.github.com/repos/SynkraAI/aiox-squads/contents/packages';

/**
 * Default path for downloaded squads
 * @constant {string}
 */
const DEFAULT_SQUADS_PATH = './squads';

/**
 * Error codes for SquadDownloaderError
 * @enum {string}
 */
const DownloaderErrorCodes = {
  REGISTRY_FETCH_ERROR: 'REGISTRY_FETCH_ERROR',
  SQUAD_NOT_FOUND: 'SQUAD_NOT_FOUND',
  VERSION_NOT_FOUND: 'VERSION_NOT_FOUND',
  DOWNLOAD_ERROR: 'DOWNLOAD_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SQUAD_EXISTS: 'SQUAD_EXISTS',
  RATE_LIMIT: 'RATE_LIMIT',
};

/**
 * Custom error class for Squad Downloader operations
 * @extends Error
 */
class SquadDownloaderError extends Error {
  /**
   * Create a SquadDownloaderError
   * @param {string} code - Error code from DownloaderErrorCodes
   * @param {string} message - Human-readable error message
   * @param {string} [suggestion] - Suggested fix for the error
   */
  constructor(code, message, suggestion) {
    super(message);
    this.name = 'SquadDownloaderError';
    this.code = code;
    this.suggestion = suggestion || '';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SquadDownloaderError);
    }
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
 * Squad Downloader class for downloading squads from aiox-squads repository
 */
class SquadDownloader {
  /**
   * Create a SquadDownloader instance
   * @param {Object} [options={}] - Configuration options
   * @param {string} [options.squadsPath='./squads'] - Path to download squads to
   * @param {boolean} [options.verbose=false] - Enable verbose logging
   * @param {boolean} [options.overwrite=false] - Overwrite existing squads
   * @param {string} [options.registryUrl] - Custom registry URL
   * @param {string} [options.githubToken] - GitHub token for API rate limits
   */
  constructor(options = {}) {
    this.squadsPath = options.squadsPath || DEFAULT_SQUADS_PATH;
    this.verbose = options.verbose || false;
    this.overwrite = options.overwrite || false;
    this.registryUrl = options.registryUrl || REGISTRY_URL;
    this.githubToken = options.githubToken || process.env.GITHUB_TOKEN || null;

    // Cache for registry data
    this._registryCache = null;
    this._registryCacheTime = null;
    this._cacheMaxAge = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Log message if verbose mode is enabled
   * @private
   * @param {string} message - Message to log
   */
  _log(message) {
    if (this.verbose) {
      console.log(`[SquadDownloader] ${message}`);
    }
  }

  /**
   * List available squads from registry
   *
   * @returns {Promise<Array<{name: string, version: string, description: string, type: string}>>}
   * @throws {SquadDownloaderError} REGISTRY_FETCH_ERROR if registry cannot be fetched
   *
   * @example
   * const downloader = new SquadDownloader();
   * const squads = await downloader.listAvailable();
   * // [{ name: 'etl-squad', version: '1.0.0', description: '...', type: 'official' }]
   */
  async listAvailable() {
    this._log('Listing available squads from registry');
    const registry = await this.fetchRegistry();

    const squads = [];

    // Add official squads
    if (registry.squads && registry.squads.official) {
      for (const squad of registry.squads.official) {
        squads.push({
          name: squad.name,
          version: squad.version || 'latest',
          description: squad.description || '',
          type: 'official',
          author: squad.author || 'SynkraAI',
        });
      }
    }

    // Add community squads
    if (registry.squads && registry.squads.community) {
      for (const squad of registry.squads.community) {
        squads.push({
          name: squad.name,
          version: squad.version || 'latest',
          description: squad.description || '',
          type: 'community',
          author: squad.author || 'Community',
        });
      }
    }

    this._log(`Found ${squads.length} available squad(s)`);
    return squads;
  }

  /**
   * Download squad by name
   *
   * @param {string} squadName - Name of squad to download (can include @version)
   * @param {Object} [options={}] - Download options
   * @param {string} [options.version='latest'] - Specific version to download
   * @param {boolean} [options.validate=true] - Validate after download
   * @returns {Promise<{path: string, manifest: object, validation: object}>}
   * @throws {SquadDownloaderError} SQUAD_NOT_FOUND if squad doesn't exist in registry
   * @throws {SquadDownloaderError} SQUAD_EXISTS if squad exists and overwrite is false
   * @throws {SquadDownloaderError} DOWNLOAD_ERROR if download fails
   *
   * @example
   * const downloader = new SquadDownloader();
   * const result = await downloader.download('etl-squad');
   * // { path: './squads/etl-squad', manifest: {...}, validation: {...} }
   *
   * // With version
   * await downloader.download('etl-squad@2.0.0');
   */
  async download(squadName, options = {}) {
    // Parse name@version syntax
    let name = squadName;
    let version = options.version || 'latest';

    if (squadName.includes('@')) {
      const parts = squadName.split('@');
      name = parts[0];
      version = parts[1] || 'latest';
    }

    this._log(`Downloading squad: ${name}@${version}`);

    // 1. Check if squad already exists locally
    const targetPath = path.join(this.squadsPath, name);
    if (!this.overwrite && (await this._pathExists(targetPath))) {
      throw new SquadDownloaderError(
        DownloaderErrorCodes.SQUAD_EXISTS,
        `Squad "${name}" already exists at ${targetPath}`,
        'Use --overwrite flag or delete existing squad first',
      );
    }

    // 2. Check registry for squad
    const registry = await this.fetchRegistry();
    const squadInfo = this._findSquad(registry, name);

    if (!squadInfo) {
      throw new SquadDownloaderError(
        DownloaderErrorCodes.SQUAD_NOT_FOUND,
        `Squad "${name}" not found in registry`,
        'Use *download-squad --list to see available squads',
      );
    }

    // 3. Verify version if specified
    if (version !== 'latest' && squadInfo.version !== version) {
      this._log(
        `Warning: Requested version ${version}, but only ${squadInfo.version} is available`,
      );
    }

    // 4. Download squad files
    await this._downloadSquadFiles(squadInfo, targetPath);

    // 5. Validate downloaded squad (optional)
    let validation = { valid: true, errors: [], warnings: [] };
    if (options.validate !== false) {
      try {
        const { SquadValidator } = require('./squad-validator');
        const validator = new SquadValidator({ verbose: this.verbose });
        validation = await validator.validate(targetPath);
      } catch (error) {
        this._log(`Validation skipped: ${error.message}`);
      }
    }

    // 6. Load manifest
    let manifest = null;
    try {
      const { SquadLoader } = require('./squad-loader');
      const loader = new SquadLoader({ squadsPath: this.squadsPath });
      manifest = await loader.loadManifest(targetPath);
    } catch (error) {
      this._log(`Failed to load manifest: ${error.message}`);
    }

    this._log(`Squad "${name}" downloaded successfully to ${targetPath}`);
    return { path: targetPath, manifest, validation };
  }

  /**
   * Fetch registry from aiox-squads repository
   *
   * @returns {Promise<Object>} Registry data
   * @throws {SquadDownloaderError} REGISTRY_FETCH_ERROR if fetch fails
   */
  async fetchRegistry() {
    // Check cache
    if (
      this._registryCache &&
      this._registryCacheTime &&
      Date.now() - this._registryCacheTime < this._cacheMaxAge
    ) {
      this._log('Using cached registry');
      return this._registryCache;
    }

    this._log(`Fetching registry from: ${this.registryUrl}`);

    try {
      const data = await this._fetch(this.registryUrl);
      const registry = JSON.parse(data.toString('utf-8'));

      // Update cache
      this._registryCache = registry;
      this._registryCacheTime = Date.now();

      return registry;
    } catch (error) {
      if (error.code === 'RATE_LIMIT') {
        throw error;
      }
      throw new SquadDownloaderError(
        DownloaderErrorCodes.REGISTRY_FETCH_ERROR,
        `Failed to fetch registry: ${error.message}`,
        'Check network connection or try again later',
      );
    }
  }

  /**
   * Find squad in registry
   * @private
   * @param {Object} registry - Registry data
   * @param {string} name - Squad name
   * @returns {Object|null} Squad info or null
   */
  _findSquad(registry, name) {
    if (!registry || !registry.squads) {
      return null;
    }

    // Check official squads
    if (registry.squads.official) {
      const found = registry.squads.official.find((s) => s.name === name);
      if (found) {
        return { ...found, type: 'official' };
      }
    }

    // Check community squads
    if (registry.squads.community) {
      const found = registry.squads.community.find((s) => s.name === name);
      if (found) {
        return { ...found, type: 'community' };
      }
    }

    return null;
  }

  /**
   * Download squad files from GitHub
   * @private
   * @param {Object} squadInfo - Squad info from registry
   * @param {string} targetPath - Local path to download to
   */
  async _downloadSquadFiles(squadInfo, targetPath) {
    this._log(`Downloading files to: ${targetPath}`);

    // Ensure target directory exists
    await fs.mkdir(targetPath, { recursive: true });

    // Get squad files from GitHub API
    const apiUrl = `${GITHUB_API_BASE}/${squadInfo.name}`;
    let contents;

    try {
      const data = await this._fetch(apiUrl, true);
      contents = JSON.parse(data.toString('utf-8'));
    } catch (error) {
      throw new SquadDownloaderError(
        DownloaderErrorCodes.DOWNLOAD_ERROR,
        `Failed to fetch squad contents: ${error.message}`,
        'Squad may not exist in repository yet',
      );
    }

    if (!Array.isArray(contents)) {
      throw new SquadDownloaderError(
        DownloaderErrorCodes.DOWNLOAD_ERROR,
        'Invalid response from GitHub API',
        'Check if squad exists in aiox-squads repository',
      );
    }

    // Download each file/directory recursively
    await this._downloadContents(contents, targetPath);

    this._log(`Downloaded ${contents.length} items to ${targetPath}`);
  }

  /**
   * Download contents recursively
   * @private
   * @param {Array} contents - GitHub API contents array
   * @param {string} targetPath - Local target path
   */
  async _downloadContents(contents, targetPath) {
    for (const item of contents) {
      const itemPath = path.join(targetPath, item.name);

      if (item.type === 'file') {
        // Download file - Buffer is written directly (supports binary files)
        this._log(`Downloading: ${item.name}`);
        const fileContent = await this._fetch(item.download_url);
        await fs.writeFile(itemPath, fileContent);
      } else if (item.type === 'dir') {
        // Create directory and download contents
        await fs.mkdir(itemPath, { recursive: true });
        const dirContents = await this._fetch(item.url, true);
        const parsed = JSON.parse(dirContents.toString('utf-8'));
        await this._downloadContents(parsed, itemPath);
      }
    }
  }

  /**
   * Make HTTPS request
   * @private
   * @param {string} url - URL to fetch
   * @param {boolean} [useApi=false] - Whether to use GitHub API headers
   * @returns {Promise<Buffer>} Response body as Buffer (supports binary files)
   */
  _fetch(url, useApi = false) {
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'User-Agent': 'AIOX-SquadDownloader/1.0',
        },
      };

      if (useApi) {
        options.headers['Accept'] = 'application/vnd.github.v3+json';
        if (this.githubToken) {
          options.headers['Authorization'] = `token ${this.githubToken}`;
        }
      }

      https
        .get(url, options, (res) => {
          // Check for rate limiting
          if (res.statusCode === 403) {
            const rateLimitRemaining = res.headers['x-ratelimit-remaining'];
            if (rateLimitRemaining === '0') {
              const resetTime = res.headers['x-ratelimit-reset'];
              const resetDate = new Date(parseInt(resetTime) * 1000);
              reject(
                new SquadDownloaderError(
                  DownloaderErrorCodes.RATE_LIMIT,
                  `GitHub API rate limit exceeded. Resets at ${resetDate.toISOString()}`,
                  'Set GITHUB_TOKEN environment variable to increase rate limit',
                ),
              );
              return;
            }
          }

          // Check for redirect
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            this._fetch(res.headers.location, useApi).then(resolve).catch(reject);
            return;
          }

          // Check for errors
          if (res.statusCode !== 200) {
            reject(
              new SquadDownloaderError(
                DownloaderErrorCodes.NETWORK_ERROR,
                `HTTP ${res.statusCode}: ${res.statusMessage}`,
              ),
            );
            return;
          }

          // Collect chunks as Buffer objects to support binary files
          const chunks = [];
          res.on('data', (chunk) => {
            chunks.push(chunk);
          });
          res.on('end', () => {
            // Concatenate all chunks into a single Buffer
            resolve(Buffer.concat(chunks));
          });
        })
        .on('error', (error) => {
          reject(
            new SquadDownloaderError(
              DownloaderErrorCodes.NETWORK_ERROR,
              `Network error: ${error.message}`,
              'Check internet connection',
            ),
          );
        });
    });
  }

  /**
   * Check if path exists
   * @private
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>}
   */
  async _pathExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear registry cache
   */
  clearCache() {
    this._registryCache = null;
    this._registryCacheTime = null;
    this._log('Registry cache cleared');
  }
}

module.exports = {
  SquadDownloader,
  SquadDownloaderError,
  DownloaderErrorCodes,
  REGISTRY_URL,
  GITHUB_API_BASE,
  DEFAULT_SQUADS_PATH,
};
