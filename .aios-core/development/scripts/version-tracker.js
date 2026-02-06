const fs = require('fs').promises;
const path = require('path');
const semver = require('semver');
const chalk = require('chalk');

/**
 * Framework version tracking utility for AIOS-FULLSTACK
 * Manages framework versions, migration history, and compatibility tracking
 */
class VersionTracker {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.versionFile = path.join(this.rootPath, '.aios', 'version-info.json');
    this.migrationDir = path.join(this.rootPath, '.aios', 'migrations');
    this.currentVersion = null;
    this.versionInfo = null;
  }

  /**
   * Initialize version tracking system
   */
  async initialize() {
    try {
      // Ensure directories exist
      await fs.mkdir(path.dirname(this.versionFile), { recursive: true });
      await fs.mkdir(this.migrationDir, { recursive: true });

      // Check if version info exists
      try {
        await fs.access(this.versionFile);
        this.versionInfo = await this.loadVersionInfo();
      } catch (_error) {
        // Create initial version info
        this.versionInfo = this.createInitialVersionInfo();
        await this.saveVersionInfo();
        console.log(chalk.green('✅ Version tracking initialized'));
      }

      this.currentVersion = this.versionInfo.current_version;
      return this.versionInfo;

    } catch (_error) {
      console.error(chalk.red(`Version tracking initialization failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Get current framework version
   */
  async getCurrentVersion() {
    if (!this.versionInfo) {
      await this.initialize();
    }
    return this.currentVersion;
  }

  /**
   * Record a new framework version
   */
  async recordVersion(versionData) {
    try {
      const {
        version,
        description,
        changes = [],
        migration_required = false,
        breaking_changes = [],
        compatibility_notes = '',
        release_notes = ''
      } = versionData;

      // Validate version format
      if (!semver.valid(version)) {
        throw new Error(`Invalid version format: ${version}`);
      }

      // Check if version already exists
      if (this.versionInfo.versions.some(v => v.version === version)) {
        throw new Error(`Version ${version} already exists`);
      }

      // Validate version increment
      if (this.currentVersion && !semver.gt(version, this.currentVersion)) {
        throw new Error(`New version ${version} must be greater than current ${this.currentVersion}`);
      }

      const versionEntry = {
        version,
        description,
        timestamp: new Date().toISOString(),
        changes,
        migration_required,
        breaking_changes,
        compatibility_notes,
        release_notes,
        previous_version: this.currentVersion,
        status: 'active',
        components_modified: await this.detectModifiedComponents(),
        api_changes: await this.detectApiChanges(),
        deprecations: [],
        migration_path: migration_required ? `${this.currentVersion}-to-${version}` : null
      };

      // Add to version history
      this.versionInfo.versions.unshift(versionEntry);
      this.versionInfo.current_version = version;
      this.versionInfo.previous_version = this.currentVersion;
      this.versionInfo.last_updated = new Date().toISOString();
      this.versionInfo.total_versions++;

      // Update current version
      this.currentVersion = version;

      // Save updated info
      await this.saveVersionInfo();

      console.log(chalk.green(`✅ Recorded new framework version: ${version}`));
      
      if (migration_required) {
        console.log(chalk.yellow(`⚠️  Migration required from ${this.versionInfo.previous_version} to ${version}`));
      }

      return versionEntry;

    } catch (_error) {
      console.error(chalk.red(`Failed to record version: ${error.message}`));
      throw error;
    }
  }

  /**
   * Get version history with optional filtering
   */
  async getVersionHistory(options = {}) {
    const {
      limit = 10,
      include_migrations = true,
      include_breaking = false,
      since_version = null,
      status_filter = null
    } = options;

    if (!this.versionInfo) {
      await this.initialize();
    }

    let versions = [...this.versionInfo.versions];

    // Apply filters
    if (since_version) {
      const sinceIndex = versions.findIndex(v => v.version === since_version);
      if (sinceIndex !== -1) {
        versions = versions.slice(0, sinceIndex);
      }
    }

    if (status_filter) {
      versions = versions.filter(v => v.status === status_filter);
    }

    if (include_breaking) {
      versions = versions.filter(v => v.breaking_changes?.length > 0);
    }

    if (!include_migrations) {
      versions = versions.filter(v => !v.migration_required);
    }

    // Apply limit
    versions = versions.slice(0, limit);

    return {
      current_version: this.currentVersion,
      total_versions: this.versionInfo.total_versions,
      filtered_count: versions.length,
      versions: versions.map(v => ({
        version: v.version,
        description: v.description,
        timestamp: v.timestamp,
        migration_required: v.migration_required,
        breaking_changes: v.breaking_changes?.length || 0,
        status: v.status,
        components_modified: v.components_modified?.length || 0
      }))
    };
  }

  /**
   * Check compatibility between versions
   */
  async checkCompatibility(fromVersion, toVersion) {
    const compatibility = {
      compatible: false,
      migration_required: false,
      breaking_changes: [],
      warnings: [],
      migration_path: null,
      estimated_effort: 'unknown',
      risk_level: 'low'
    };

    try {
      // Validate versions
      if (!semver.valid(fromVersion) || !semver.valid(toVersion)) {
        throw new Error('Invalid version format provided');
      }

      const fromVersionInfo = this.versionInfo.versions.find(v => v.version === fromVersion);
      const toVersionInfo = this.versionInfo.versions.find(v => v.version === toVersion);

      if (!fromVersionInfo) {
        compatibility.warnings.push(`Source version ${fromVersion} not found in history`);
      }

      if (!toVersionInfo) {
        compatibility.warnings.push(`Target version ${toVersion} not found in history`);
      }

      // Check semantic version compatibility
      const versionDiff = semver.diff(fromVersion, toVersion);
      
      switch (versionDiff) {
        case 'patch':
          compatibility.compatible = true;
          compatibility.risk_level = 'low';
          compatibility.estimated_effort = 'minimal';
          break;
          
        case 'minor':
          compatibility.compatible = true;
          compatibility.migration_required = toVersionInfo?.migration_required || false;
          compatibility.risk_level = 'low';
          compatibility.estimated_effort = 'low';
          break;
          
        case 'major':
          compatibility.migration_required = true;
          compatibility.risk_level = 'high';
          compatibility.estimated_effort = 'high';
          compatibility.compatible = false;
          break;
          
        case 'premajor':
        case 'preminor':
        case 'prepatch':
          compatibility.migration_required = true;
          compatibility.risk_level = 'medium';
          compatibility.estimated_effort = 'medium';
          compatibility.compatible = false;
          break;
      }

      // Collect breaking changes in the path
      const versionsInPath = this.getVersionsInPath(fromVersion, toVersion);
      
      for (const version of versionsInPath) {
        if (version.breaking_changes?.length > 0) {
          compatibility.breaking_changes.push(...version.breaking_changes);
          compatibility.migration_required = true;
        }
      }

      // Set migration path if needed
      if (compatibility.migration_required) {
        compatibility.migration_path = `${fromVersion}-to-${toVersion}`;
      }

      return compatibility;

    } catch (_error) {
      compatibility.warnings.push(`Compatibility check failed: ${error.message}`);
      return compatibility;
    }
  }

  /**
   * Mark a version as deprecated
   */
  async deprecateVersion(version, deprecationInfo = {}) {
    try {
      const versionEntry = this.versionInfo.versions.find(v => v.version === version);
      
      if (!versionEntry) {
        throw new Error(`Version ${version} not found`);
      }

      if (versionEntry.status === 'deprecated') {
        throw new Error(`Version ${version} is already deprecated`);
      }

      const deprecation = {
        deprecated_at: new Date().toISOString(),
        reason: deprecationInfo.reason || 'Version deprecated',
        migration_target: deprecationInfo.migration_target || this.currentVersion,
        removal_timeline: deprecationInfo.removal_timeline || 'TBD',
        deprecation_notice: deprecationInfo.notice || `Version ${version} is deprecated. Please upgrade to ${this.currentVersion}.`
      };

      versionEntry.status = 'deprecated';
      versionEntry.deprecation_info = deprecation;

      await this.saveVersionInfo();

      console.log(chalk.yellow(`⚠️  Version ${version} marked as deprecated`));
      return deprecation;

    } catch (_error) {
      console.error(chalk.red(`Failed to deprecate version: ${error.message}`));
      throw error;
    }
  }

  /**
   * Get migration path between versions
   */
  async getMigrationPath(fromVersion, toVersion) {
    const path = {
      from_version: fromVersion,
      to_version: toVersion,
      steps: [],
      total_migrations: 0,
      estimated_duration: 0,
      risk_assessment: 'low',
      requirements: [],
      rollback_available: true
    };

    try {
      const versionsInPath = this.getVersionsInPath(fromVersion, toVersion);
      
      for (const version of versionsInPath) {
        if (version.migration_required) {
          const step = {
            from: version.previous_version,
            to: version.version,
            migration_id: version.migration_path,
            breaking_changes: version.breaking_changes || [],
            estimated_time: this.estimateMigrationTime(version),
            risk_level: this.assessMigrationRisk(version),
            prerequisites: version.migration_prerequisites || [],
            rollback_supported: true
          };
          
          path.steps.push(step);
          path.total_migrations++;
          path.estimated_duration += step.estimated_time;
          
          if (step.risk_level === 'high') {
            path.risk_assessment = 'high';
          } else if (step.risk_level === 'medium' && path.risk_assessment === 'low') {
            path.risk_assessment = 'medium';
          }
        }
      }

      // Collect unique requirements
      path.requirements = [...new Set(
        path.steps.flatMap(step => step.prerequisites)
      )];

      return path;

    } catch (_error) {
      console.error(chalk.red(`Failed to get migration path: ${error.message}`));
      throw error;
    }
  }

  /**
   * Generate version report
   */
  async generateVersionReport() {
    if (!this.versionInfo) {
      await this.initialize();
    }

    const report = {
      timestamp: new Date().toISOString(),
      current_version: this.currentVersion,
      total_versions: this.versionInfo.total_versions,
      version_distribution: {
        active: 0,
        deprecated: 0,
        archived: 0
      },
      migration_summary: {
        total_migrations: 0,
        pending_migrations: 0,
        failed_migrations: 0
      },
      breaking_changes_summary: {
        total_breaking_versions: 0,
        recent_breaking_changes: []
      },
      compatibility_matrix: {},
      recommendations: []
    };

    // Analyze version distribution
    this.versionInfo.versions.forEach(version => {
      report.version_distribution[version.status]++;
      
      if (version.migration_required) {
        report.migration_summary.total_migrations++;
      }
      
      if (version.breaking_changes?.length > 0) {
        report.breaking_changes_summary.total_breaking_versions++;
        
        if (semver.gte(version.version, semver.major(this.currentVersion) + '.0.0')) {
          report.breaking_changes_summary.recent_breaking_changes.push({
            version: version.version,
            changes: version.breaking_changes.slice(0, 3)
          });
        }
      }
    });

    // Generate recommendations
    if (report.version_distribution.deprecated > 5) {
      report.recommendations.push({
        type: 'cleanup',
        priority: 'medium',
        message: `${report.version_distribution.deprecated} deprecated versions should be archived`
      });
    }

    if (report.breaking_changes_summary.total_breaking_versions > 10) {
      report.recommendations.push({
        type: 'stability',
        priority: 'high',
        message: 'High number of breaking changes detected. Consider stability improvements.'
      });
    }

    return report;
  }

  // Private helper methods
  createInitialVersionInfo() {
    return {
      schema_version: '1.0.0',
      current_version: '1.0.0',
      previous_version: null,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      total_versions: 1,
      versions: [{
        version: '1.0.0',
        description: 'Initial framework version',
        timestamp: new Date().toISOString(),
        changes: ['Initial framework setup'],
        migration_required: false,
        breaking_changes: [],
        compatibility_notes: 'Initial version',
        release_notes: 'AIOS-FULLSTACK framework v1.0.0',
        previous_version: null,
        status: 'active',
        components_modified: [],
        api_changes: [],
        deprecations: [],
        migration_path: null
      }],
      migration_history: [],
      compatibility_matrix: {}
    };
  }

  async loadVersionInfo() {
    try {
      const content = await fs.readFile(this.versionFile, 'utf-8');
      return JSON.parse(content);
    } catch (_error) {
      throw new Error(`Failed to load version info: ${error.message}`);
    }
  }

  async saveVersionInfo() {
    try {
      const content = JSON.stringify(this.versionInfo, null, 2);
      await fs.writeFile(this.versionFile, content);
    } catch (_error) {
      throw new Error(`Failed to save version info: ${error.message}`);
    }
  }

  async detectModifiedComponents() {
    // This would analyze git changes or compare with previous state
    // For now, return empty array
    return [];
  }

  async detectApiChanges() {
    // This would analyze API changes between versions
    // For now, return empty array
    return [];
  }

  getVersionsInPath(fromVersion, toVersion) {
    const versions = this.versionInfo.versions.filter(v => {
      return semver.gt(v.version, fromVersion) && semver.lte(v.version, toVersion);
    });
    
    return versions.sort((a, b) => semver.compare(a.version, b.version));
  }

  estimateMigrationTime(version) {
    // Simple heuristic based on breaking changes and components modified
    const baseTime = 30; // minutes
    const breakingChangeMultiplier = version.breaking_changes?.length || 0;
    const componentMultiplier = version.components_modified?.length || 0;
    
    return baseTime + (breakingChangeMultiplier * 15) + (componentMultiplier * 5);
  }

  assessMigrationRisk(version) {
    const breakingChanges = version.breaking_changes?.length || 0;
    const componentsModified = version.components_modified?.length || 0;
    
    if (breakingChanges > 5 || componentsModified > 20) return 'high';
    if (breakingChanges > 2 || componentsModified > 10) return 'medium';
    return 'low';
  }
}

module.exports = VersionTracker;