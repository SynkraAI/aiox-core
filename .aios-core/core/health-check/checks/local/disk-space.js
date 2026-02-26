/**
 * Disk Space Check
 *
 * Verifies sufficient disk space is available.
 *
 * @module aios-core/health-check/checks/local/disk-space
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const { execSync } = require('child_process');
const os = require('os');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Minimum recommended free space (1GB)
 */
const MIN_FREE_SPACE_GB = 1;

/**
 * Warning threshold (5GB)
 */
const WARNING_FREE_SPACE_GB = 5;

/**
 * Disk space check
 *
 * @class DiskSpaceCheck
 * @extends BaseCheck
 */
class DiskSpaceCheck extends BaseCheck {
  constructor() {
    super({
      id: 'local.disk-space',
      name: 'Disk Space',
      description: 'Verifies sufficient disk space is available',
      domain: CheckDomain.LOCAL,
      severity: CheckSeverity.MEDIUM,
      timeout: 5000,
      cacheable: false, // Don't cache - space can change
      healingTier: 3, // Manual cleanup
      tags: ['disk', 'resources'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const platform = os.platform();
    const projectRoot = context.projectRoot || process.cwd();

    try {
      let freeSpaceGB;
      let totalSpaceGB;
      let usedPercent;

      if (platform === 'win32') {
        // Windows: use wmic or PowerShell
        const diskInfo = this.getWindowsDiskSpace(projectRoot);
        freeSpaceGB = diskInfo.free;
        totalSpaceGB = diskInfo.total;
        usedPercent = diskInfo.usedPercent;
      } else {
        // Unix: use df
        const diskInfo = this.getUnixDiskSpace(projectRoot);
        freeSpaceGB = diskInfo.free;
        totalSpaceGB = diskInfo.total;
        usedPercent = diskInfo.usedPercent;
      }

      const details = {
        freeSpace: `${freeSpaceGB.toFixed(1)} GB`,
        totalSpace: `${totalSpaceGB.toFixed(1)} GB`,
        usedPercent: `${usedPercent}%`,
        projectRoot,
      };

      // Critical: below minimum
      if (freeSpaceGB < MIN_FREE_SPACE_GB) {
        return this.fail(
          `Low disk space: ${freeSpaceGB.toFixed(1)} GB free (minimum ${MIN_FREE_SPACE_GB} GB)`,
          {
            recommendation:
              'Free up disk space by removing unused files, node_modules, or clearing caches',
            healable: false,
            healingTier: 3,
            details,
          },
        );
      }

      // Warning: below recommended
      if (freeSpaceGB < WARNING_FREE_SPACE_GB) {
        return this.warning(`Disk space running low: ${freeSpaceGB.toFixed(1)} GB free`, {
          recommendation:
            'Consider freeing up disk space (npm cache clean, remove old node_modules)',
          details,
        });
      }

      return this.pass(`Disk space OK: ${freeSpaceGB.toFixed(1)} GB free`, {
        details,
      });
    } catch (error) {
      return this.error(`Could not check disk space: ${error.message}`, error);
    }
  }

  /**
   * Get disk space on Windows
   * @private
   */
  getWindowsDiskSpace(projectPath) {
    try {
      // Try PowerShell first
      const drive = projectPath.substring(0, 2);
      const output = execSync(
        `powershell -Command "Get-PSDrive ${drive[0]} | Select-Object Used,Free | ConvertTo-Json"`,
        { encoding: 'utf8', timeout: 5000, windowsHide: true },
      );

      const info = JSON.parse(output);
      const freeBytes = info.Free;
      const usedBytes = info.Used;
      const totalBytes = freeBytes + usedBytes;

      return {
        free: freeBytes / (1024 * 1024 * 1024),
        total: totalBytes / (1024 * 1024 * 1024),
        usedPercent: Math.round((usedBytes / totalBytes) * 100),
      };
    } catch {
      // Fallback to wmic
      try {
        const drive = projectPath.substring(0, 2);
        const output = execSync(
          `wmic logicaldisk where "DeviceID='${drive}'" get FreeSpace,Size /format:csv`,
          { encoding: 'utf8', timeout: 5000, windowsHide: true },
        );

        const lines = output.trim().split('\n');
        if (lines.length >= 2) {
          const parts = lines[1].split(',');
          const freeBytes = parseInt(parts[1], 10);
          const totalBytes = parseInt(parts[2], 10);

          return {
            free: freeBytes / (1024 * 1024 * 1024),
            total: totalBytes / (1024 * 1024 * 1024),
            usedPercent: Math.round(((totalBytes - freeBytes) / totalBytes) * 100),
          };
        }
      } catch {
        // Return default estimate
      }

      return { free: 10, total: 100, usedPercent: 90 };
    }
  }

  /**
   * Get disk space on Unix
   * @private
   */
  getUnixDiskSpace(projectPath) {
    const output = execSync(`df -k "${projectPath}"`, {
      encoding: 'utf8',
      timeout: 5000,
    });

    const lines = output.trim().split('\n');
    if (lines.length >= 2) {
      // Parse df output (1K blocks)
      const parts = lines[1].split(/\s+/);
      const totalKB = parseInt(parts[1], 10);
      const usedKB = parseInt(parts[2], 10);
      const availKB = parseInt(parts[3], 10);

      return {
        free: availKB / (1024 * 1024),
        total: totalKB / (1024 * 1024),
        usedPercent: Math.round((usedKB / totalKB) * 100),
      };
    }

    throw new Error('Could not parse df output');
  }

  /**
   * Get healer (manual guide)
   */
  getHealer() {
    return {
      name: 'disk-cleanup-guide',
      action: 'manual',
      manualGuide: 'Free up disk space',
      steps: [
        'Run: npm cache clean --force',
        'Remove unused node_modules: find . -name "node_modules" -type d -prune -exec rm -rf {} +',
        'Clear temporary files',
        'Use disk cleanup tools (Windows) or Disk Utility (macOS)',
        'Consider moving large files to external storage',
      ],
      warning: 'Be careful not to delete important files',
    };
  }
}

module.exports = DiskSpaceCheck;
