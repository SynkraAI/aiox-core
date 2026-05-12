/**
 * AIOX Performance Tracker
 *
 * Tracks and reports on config loading performance, cache efficiency,
 * and agent activation times to ensure optimization targets are met.
 *
 * @module performance-tracker
 * @version 1.0.0
 * @created 2025-01-16 (Story 6.1.2.6)
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Performance data storage
 */
const performanceData = {
  sessions: [],
  configLoads: [],
  agentActivations: [],
  startTime: Date.now(),
};

/**
 * Performance targets (from agent-config-requirements.yaml)
 */
const PERFORMANCE_TARGETS = {
  critical: 30,   // aiox-master
  high: 50,       // dev, qa, devops, security
  medium: 75,     // po, sm, architect, data-engineer, db-sage
  low: 100,        // pm, analyst, ux-expert
};

/**
 * Agent priority mapping
 */
const AGENT_PRIORITIES = {
  'aiox-master': 'critical',
  'dev': 'high',
  'qa': 'high',
  'devops': 'high',
  'security': 'high',
  'po': 'medium',
  'sm': 'medium',
  'architect': 'medium',
  'data-engineer': 'medium',
  'db-sage': 'medium',
  'pm': 'low',
  'analyst': 'low',
  'ux-expert': 'low',
};

/**
 * Tracks a config load operation
 *
 * @param {Object} loadData - Load operation data
 * @param {string} loadData.agentId - Agent requesting config
 * @param {number} loadData.loadTime - Time taken in ms
 * @param {number} loadData.configSize - Size in bytes
 * @param {boolean} loadData.cacheHit - Whether cache was used
 * @param {string[]} loadData.sectionsLoaded - Sections loaded
 */
function trackConfigLoad(loadData) {
  const entry = {
    timestamp: Date.now(),
    agentId: loadData.agentId,
    loadTime: loadData.loadTime,
    configSize: loadData.configSize,
    configSizeKB: (loadData.configSize / 1024).toFixed(2),
    cacheHit: loadData.cacheHit,
    sectionsLoaded: loadData.sectionsLoaded,
    sectionsCount: loadData.sectionsLoaded?.length || 0,
    priority: AGENT_PRIORITIES[loadData.agentId] || 'unknown',
    target: PERFORMANCE_TARGETS[AGENT_PRIORITIES[loadData.agentId]] || 100,
    meetsTarget: loadData.loadTime <= (PERFORMANCE_TARGETS[AGENT_PRIORITIES[loadData.agentId]] || 100),
  };

  performanceData.configLoads.push(entry);

  return entry;
}

/**
 * Tracks an agent activation
 *
 * @param {Object} activationData - Activation data
 * @param {string} activationData.agentId - Agent being activated
 * @param {number} activationData.totalTime - Total activation time
 * @param {number} activationData.configLoadTime - Time spent loading config
 * @param {number} activationData.initTime - Time spent in initialization
 */
function trackAgentActivation(activationData) {
  const entry = {
    timestamp: Date.now(),
    agentId: activationData.agentId,
    totalTime: activationData.totalTime,
    configLoadTime: activationData.configLoadTime,
    initTime: activationData.initTime,
    priority: AGENT_PRIORITIES[activationData.agentId] || 'unknown',
    target: PERFORMANCE_TARGETS[AGENT_PRIORITIES[activationData.agentId]] || 100,
    meetsTarget: activationData.totalTime <= (PERFORMANCE_TARGETS[AGENT_PRIORITIES[activationData.agentId]] || 100),
  };

  performanceData.agentActivations.push(entry);

  return entry;
}

/**
 * Starts a new session
 *
 * @param {string} sessionType - Type of session (e.g., 'development', 'testing')
 * @returns {string} Session ID
 */
function startSession(sessionType = 'default') {
  const sessionId = `session-${Date.now()}`;

  performanceData.sessions.push({
    id: sessionId,
    type: sessionType,
    startTime: Date.now(),
    endTime: null,
    configLoads: 0,
    agentActivations: 0,
  });

  return sessionId;
}

/**
 * Ends a session
 *
 * @param {string} sessionId - Session to end
 */
function endSession(sessionId) {
  const session = performanceData.sessions.find(s => s.id === sessionId);
  if (session) {
    session.endTime = Date.now();
    session.duration = session.endTime - session.startTime;

    // Count operations in this session
    session.configLoads = performanceData.configLoads.filter(
      load => load.timestamp >= session.startTime && load.timestamp <= session.endTime,
    ).length;

    session.agentActivations = performanceData.agentActivations.filter(
      act => act.timestamp >= session.startTime && act.timestamp <= session.endTime,
    ).length;
  }

  return session;
}

/**
 * Gets statistics for all tracked data
 *
 * @returns {Object} Performance statistics
 */
function getStatistics() {
  const configLoads = performanceData.configLoads;
  const agentActivations = performanceData.agentActivations;

  if (configLoads.length === 0) {
    return {
      configLoads: { count: 0 },
      agentActivations: { count: 0 },
      overall: { uptime: Date.now() - performanceData.startTime },
    };
  }

  // Config load stats
  const avgLoadTime = configLoads.reduce((sum, load) => sum + load.loadTime, 0) / configLoads.length;
  const avgConfigSize = configLoads.reduce((sum, load) => sum + load.configSize, 0) / configLoads.length;
  const cacheHits = configLoads.filter(load => load.cacheHit).length;
  const cacheHitRate = (cacheHits / configLoads.length * 100).toFixed(1);
  const meetsTarget = configLoads.filter(load => load.meetsTarget).length;
  const targetSuccessRate = (meetsTarget / configLoads.length * 100).toFixed(1);

  // Agent activation stats
  const avgActivationTime = agentActivations.length > 0
    ? agentActivations.reduce((sum, act) => sum + act.totalTime, 0) / agentActivations.length
    : 0;

  const activationTargetMet = agentActivations.filter(act => act.meetsTarget).length;
  const activationSuccessRate = agentActivations.length > 0
    ? (activationTargetMet / agentActivations.length * 100).toFixed(1)
    : '0';

  // By priority stats
  const byPriority = {};
  Object.keys(PERFORMANCE_TARGETS).forEach(priority => {
    const loads = configLoads.filter(load => load.priority === priority);
    if (loads.length > 0) {
      const avgTime = loads.reduce((sum, load) => sum + load.loadTime, 0) / loads.length;
      const target = PERFORMANCE_TARGETS[priority];
      const meets = loads.filter(load => load.meetsTarget).length;

      byPriority[priority] = {
        count: loads.length,
        avgTime: Math.round(avgTime),
        target,
        meetsTarget: meets,
        successRate: ((meets / loads.length) * 100).toFixed(1) + '%',
      };
    }
  });

  return {
    configLoads: {
      count: configLoads.length,
      avgLoadTime: Math.round(avgLoadTime),
      avgConfigSizeKB: (avgConfigSize / 1024).toFixed(2),
      cacheHits,
      cacheHitRate: cacheHitRate + '%',
      meetsTarget,
      targetSuccessRate: targetSuccessRate + '%',
    },
    agentActivations: {
      count: agentActivations.length,
      avgActivationTime: Math.round(avgActivationTime),
      meetsTarget: activationTargetMet,
      targetSuccessRate: activationSuccessRate + '%',
    },
    byPriority,
    overall: {
      uptime: Date.now() - performanceData.startTime,
      sessions: performanceData.sessions.length,
    },
  };
}

/**
 * Generates performance report
 *
 * @returns {string} Markdown formatted report
 */
function generateReport() {
  const stats = getStatistics();

  let report = `# AIOX Performance Report

**Generated:** ${new Date().toISOString()}
**Uptime:** ${(stats.overall.uptime / 1000 / 60).toFixed(1)} minutes

---

## 📊 Config Load Performance

**Total Loads:** ${stats.configLoads.count}
**Average Load Time:** ${stats.configLoads.avgLoadTime}ms
**Average Config Size:** ${stats.configLoads.avgConfigSizeKB} KB
**Cache Hit Rate:** ${stats.configLoads.cacheHitRate}
**Meets Target:** ${stats.configLoads.meetsTarget}/${stats.configLoads.count} (${stats.configLoads.targetSuccessRate})

---

## 🎯 Performance by Priority

`;

  Object.entries(stats.byPriority).forEach(([priority, data]) => {
    const emoji = priority === 'critical' ? '🔴' :
      priority === 'high' ? '🟠' :
        priority === 'medium' ? '🟡' : '🟢';

    report += `### ${emoji} ${priority.toUpperCase()} (Target: ${data.target}ms)\n\n`;
    report += `- Loads: ${data.count}\n`;
    report += `- Avg Time: ${data.avgTime}ms\n`;
    report += `- Meets Target: ${data.meetsTarget}/${data.count} (${data.successRate})\n\n`;
  });

  report += '---\n\n## 🚀 Agent Activations\n\n';
  report += `**Total Activations:** ${stats.agentActivations.count}\n`;
  report += `**Average Time:** ${stats.agentActivations.avgActivationTime}ms\n`;
  report += `**Meets Target:** ${stats.agentActivations.meetsTarget}/${stats.agentActivations.count} (${stats.agentActivations.targetSuccessRate})\n\n`;

  report += '---\n\n## 📋 Recent Operations (Last 10)\n\n';

  const recent = performanceData.configLoads.slice(-10).reverse();
  report += '| Agent | Load Time | Config Size | Cache Hit | Meets Target |\n';
  report += '|-------|-----------|-------------|-----------|-------------|\n';

  recent.forEach(load => {
    const meetsEmoji = load.meetsTarget ? '✅' : '❌';
    const cacheEmoji = load.cacheHit ? '💚' : '💛';

    report += `| @${load.agentId} | ${load.loadTime}ms | ${load.configSizeKB} KB | ${cacheEmoji} | ${meetsEmoji} |\n`;
  });

  report += '\n---\n\n*Auto-generated by AIOX Performance Tracker (Story 6.1.2.6)*\n';

  return report;
}

/**
 * Saves performance data to JSON file
 *
 * @param {string} filepath - Path to save data
 */
async function savePerformanceData(filepath = '.aiox-core/performance-data.json') {
  const data = {
    ...performanceData,
    statistics: getStatistics(),
    savedAt: new Date().toISOString(),
  };

  await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Performance data saved: ${filepath}`);
}

/**
 * Loads performance data from JSON file
 *
 * @param {string} filepath - Path to load data from
 */
async function loadPerformanceData(filepath = '.aiox-core/performance-data.json') {
  try {
    const content = await fs.readFile(filepath, 'utf8');
    const data = JSON.parse(content);

    performanceData.sessions = data.sessions || [];
    performanceData.configLoads = data.configLoads || [];
    performanceData.agentActivations = data.agentActivations || [];

    console.log(`✅ Performance data loaded: ${filepath}`);
    console.log(`   Config loads: ${performanceData.configLoads.length}`);
    console.log(`   Agent activations: ${performanceData.agentActivations.length}`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Failed to load performance data:', error.message);
    }
  }
}

/**
 * Resets all performance data
 */
function reset() {
  performanceData.sessions = [];
  performanceData.configLoads = [];
  performanceData.agentActivations = [];
  performanceData.startTime = Date.now();

  console.log('🗑️ Performance data reset');
}

// Export functions
module.exports = {
  trackConfigLoad,
  trackAgentActivation,
  startSession,
  endSession,
  getStatistics,
  generateReport,
  savePerformanceData,
  loadPerformanceData,
  reset,
  PERFORMANCE_TARGETS,
  AGENT_PRIORITIES,
};

// CLI support
if (require.main === module) {
  const command = process.argv[2];

  (async () => {
    try {
      switch (command) {
        case 'stats':
          await loadPerformanceData();
          const stats = getStatistics();
          console.log(JSON.stringify(stats, null, 2));
          break;

        case 'report':
          await loadPerformanceData();
          const report = generateReport();
          const outputPath = 'docs/architecture/performance-report.md';
          await fs.writeFile(outputPath, report, 'utf8');
          console.log(`✅ Report generated: ${outputPath}`);
          break;

        case 'test':
          console.log('\n🧪 Testing performance tracker...\n');

          // Simulate some operations
          console.log('Test 1: Track config loads');
          trackConfigLoad({
            agentId: 'dev',
            loadTime: 45,
            configSize: 1024,
            cacheHit: false,
            sectionsLoaded: ['frameworkDocsLocation', 'devLoadAlwaysFiles'],
          });

          trackConfigLoad({
            agentId: 'dev',
            loadTime: 2,
            configSize: 1024,
            cacheHit: true,
            sectionsLoaded: ['frameworkDocsLocation', 'devLoadAlwaysFiles'],
          });

          trackConfigLoad({
            agentId: 'pm',
            loadTime: 30,
            configSize: 512,
            cacheHit: false,
            sectionsLoaded: ['frameworkDocsLocation'],
          });

          console.log('  ✅ Tracked 3 config loads\n');

          console.log('Test 2: Track agent activations');
          trackAgentActivation({
            agentId: 'dev',
            totalTime: 50,
            configLoadTime: 45,
            initTime: 5,
          });

          console.log('  ✅ Tracked 1 activation\n');

          console.log('Test 3: Get statistics');
          const testStats = getStatistics();
          console.log(`  Config loads: ${testStats.configLoads.count}`);
          console.log(`  Avg load time: ${testStats.configLoads.avgLoadTime}ms`);
          console.log(`  Cache hit rate: ${testStats.configLoads.cacheHitRate}`);
          console.log(`  Target success: ${testStats.configLoads.targetSuccessRate}\n`);

          console.log('Test 4: Generate report');
          const testReport = generateReport();
          console.log(`  ✅ Report length: ${testReport.length} chars\n`);

          console.log('✅ All tests passed!\n');
          break;

        default:
          console.log(`
Usage:
  node performance-tracker.js stats    - Show statistics
  node performance-tracker.js report   - Generate markdown report
  node performance-tracker.js test     - Run test suite
          `);
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}
