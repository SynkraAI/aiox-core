/**
 * Greeting Preference Configuration Manager
 *
 * Manages user preferences for agent greeting personification levels.
 * Integrates with GreetingBuilder (Story 6.1.2.5).
 *
 * Story ACT-2: Now accounts for user_profile — bob mode forces minimal/named.
 *
 * Performance: Preference check <5ms (called on every agent activation)
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const CONFIG_PATH = path.join(process.cwd(), '.aiox-core', 'core-config.yaml');
const BACKUP_PATH = path.join(process.cwd(), '.aiox-core', 'core-config.yaml.backup');
const VALID_PREFERENCES = ['auto', 'minimal', 'named', 'archetypal'];

// Bob mode restricts greeting to simpler levels (Story ACT-2)
const BOB_MODE_ALLOWED_PREFERENCES = ['minimal', 'named'];
const BOB_MODE_DEFAULT_PREFERENCE = 'named';

class GreetingPreferenceManager {
  /**
   * Get current greeting preference, accounting for user_profile restrictions.
   *
   * Story ACT-2 - AC1: When user_profile === 'bob', forces preference to
   * 'minimal' or 'named' regardless of what is configured. If the configured
   * preference is 'auto' or 'archetypal', it falls back to BOB_MODE_DEFAULT_PREFERENCE.
   *
   * @param {string} [userProfile] - Optional user_profile override. If not provided, reads from config.
   * @returns {string} Current preference (auto|minimal|named|archetypal)
   */
  getPreference(userProfile) {
    try {
      const config = this._loadConfig();
      const rawPreference = config?.agentIdentity?.greeting?.preference || 'auto';

      // Story ACT-2: If bob mode, restrict preference to minimal/named
      const effectiveProfile = userProfile || config?.user_profile;
      if (effectiveProfile === 'bob') {
        if (BOB_MODE_ALLOWED_PREFERENCES.includes(rawPreference)) {
          return rawPreference;
        }
        // Override non-allowed preferences (auto, archetypal) to bob default
        return BOB_MODE_DEFAULT_PREFERENCE;
      }

      return rawPreference;
    } catch (error) {
      console.warn('[GreetingPreference] Failed to load, using default:', error.message);
      return 'auto';
    }
  }

  /**
   * Set greeting preference
   * @param {string} preference - New preference (auto|minimal|named|archetypal)
   * @throws {Error} If preference is invalid
   */
  setPreference(preference) {
    // Validate preference
    if (!VALID_PREFERENCES.includes(preference)) {
      const validOptions = VALID_PREFERENCES.join(', ');
      throw new Error(
        `Invalid preference: "${preference}". ` +
        `Valid options: ${validOptions}. ` +
        'Examples: "auto" (session-aware), "minimal" (always minimal), "named" (always named), "archetypal" (always archetypal)',
      );
    }

    try {
      // Backup existing config before modification
      this._backupConfig();

      const config = this._loadConfig();

      // Ensure structure exists
      if (!config.agentIdentity) config.agentIdentity = {};
      if (!config.agentIdentity.greeting) config.agentIdentity.greeting = {};

      // Set preference
      config.agentIdentity.greeting.preference = preference;

      // Validate YAML before write
      const yamlContent = yaml.dump(config, { lineWidth: -1 });
      try {
        yaml.load(yamlContent); // Validate syntax
      } catch (yamlError) {
        this._restoreBackup();
        throw new Error(`Invalid YAML generated: ${yamlError.message}`);
      }

      // Write back
      this._saveConfig(config);

      return { success: true, preference };
    } catch (error) {
      // Restore backup on error
      this._restoreBackup();
      throw new Error(`Failed to set preference: ${error.message}`);
    }
  }

  /**
   * Get all greeting configuration
   * @returns {Object} Complete greeting config
   */
  getConfig() {
    try {
      const config = this._loadConfig();
      return config?.agentIdentity?.greeting || {};
    } catch (error) {
      console.warn('[GreetingPreference] Failed to load config, returning empty:', error.message);
      return {};
    }
  }

  /**
   * Backup config file before modification
   * @private
   */
  _backupConfig() {
    try {
      if (fs.existsSync(CONFIG_PATH)) {
        fs.copyFileSync(CONFIG_PATH, BACKUP_PATH);
      }
    } catch (error) {
      console.warn('[GreetingPreference] Failed to backup config:', error.message);
    }
  }

  /**
   * Restore config from backup
   * @private
   */
  _restoreBackup() {
    try {
      if (fs.existsSync(BACKUP_PATH)) {
        fs.copyFileSync(BACKUP_PATH, CONFIG_PATH);
        console.log('[GreetingPreference] Config restored from backup');
      }
    } catch (error) {
      console.error('[GreetingPreference] Failed to restore backup:', error.message);
    }
  }

  /**
   * Load config from YAML
   * @private
   */
  _loadConfig() {
    const content = fs.readFileSync(CONFIG_PATH, 'utf8');
    return yaml.load(content);
  }

  /**
   * Save config to YAML
   * @private
   */
  _saveConfig(config) {
    const content = yaml.dump(config, { lineWidth: -1 });
    fs.writeFileSync(CONFIG_PATH, content, 'utf8');
  }
}

module.exports = GreetingPreferenceManager;

