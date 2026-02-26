/**
 * Memory Check
 *
 * Verifies sufficient memory is available.
 *
 * @module aios-core/health-check/checks/local/memory
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const os = require('os');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Minimum free memory (512MB)
 */
const MIN_FREE_MEMORY_MB = 512;

/**
 * Warning threshold (1GB)
 */
const WARNING_FREE_MEMORY_MB = 1024;

/**
 * Memory availability check
 *
 * @class MemoryCheck
 * @extends BaseCheck
 */
class MemoryCheck extends BaseCheck {
  constructor() {
    super({
      id: 'local.memory',
      name: 'Memory Availability',
      description: 'Verifies sufficient memory is available',
      domain: CheckDomain.LOCAL,
      severity: CheckSeverity.MEDIUM,
      timeout: 1000,
      cacheable: false, // Don't cache - memory can change
      healingTier: 3, // Manual - close applications
      tags: ['memory', 'resources'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(_context) {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const totalMB = Math.round(totalMemory / (1024 * 1024));
    const freeMB = Math.round(freeMemory / (1024 * 1024));
    const usedMB = Math.round(usedMemory / (1024 * 1024));
    const usedPercent = Math.round((usedMemory / totalMemory) * 100);

    // Get Node.js memory usage
    const nodeMemory = process.memoryUsage();
    const nodeHeapMB = Math.round(nodeMemory.heapUsed / (1024 * 1024));

    const details = {
      total: this.formatMemory(totalMB),
      free: this.formatMemory(freeMB),
      used: this.formatMemory(usedMB),
      usedPercent: `${usedPercent}%`,
      nodeHeap: `${nodeHeapMB} MB`,
    };

    // Critical: below minimum
    if (freeMB < MIN_FREE_MEMORY_MB) {
      return this.fail(
        `Low memory: ${this.formatMemory(freeMB)} free (minimum ${this.formatMemory(MIN_FREE_MEMORY_MB)})`,
        {
          recommendation: 'Close unused applications to free up memory',
          healable: false,
          healingTier: 3,
          details,
        },
      );
    }

    // Warning: below recommended
    if (freeMB < WARNING_FREE_MEMORY_MB) {
      return this.warning(`Memory running low: ${this.formatMemory(freeMB)} free`, {
        recommendation: 'Consider closing some applications for better performance',
        details,
      });
    }

    // Warning: high usage percentage
    if (usedPercent > 90) {
      return this.warning(`High memory usage: ${usedPercent}% used`, {
        recommendation: 'Memory usage is high - performance may be affected',
        details,
      });
    }

    return this.pass(`Memory OK: ${this.formatMemory(freeMB)} free (${100 - usedPercent}%)`, {
      details,
    });
  }

  /**
   * Format memory for display
   * @private
   */
  formatMemory(mb) {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  }

  /**
   * Get healer (manual guide)
   */
  getHealer() {
    return {
      name: 'memory-cleanup-guide',
      action: 'manual',
      manualGuide: 'Free up system memory',
      steps: [
        'Close unused browser tabs',
        'Close unused applications',
        'Restart heavy applications (IDEs, Docker)',
        'If persistent, consider adding more RAM',
      ],
      warning: 'Save your work before closing applications',
    };
  }
}

module.exports = MemoryCheck;
