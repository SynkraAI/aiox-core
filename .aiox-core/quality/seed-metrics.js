/**
 * Quality Metrics Seed Data Generator
 *
 * Generates realistic seed data for testing the metrics dashboard.
 * Creates 30 days of historical data with realistic patterns.
 *
 * @module quality/seed-metrics
 * @version 1.0.0
 * @story 3.11a - Quality Gates Metrics Collector
 */

const { MetricsCollector, createEmptyMetrics } = require('./metrics-collector');

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random boolean with given probability of true
 * @param {number} probability - Probability of true (0-1)
 * @returns {boolean} Random boolean
 */
function randomBool(probability = 0.5) {
  return Math.random() < probability;
}

/**
 * Generate realistic Layer 1 (pre-commit) run
 * @param {Date} timestamp - Run timestamp
 * @returns {Object} Run data
 */
function generateLayer1Run(timestamp) {
  // Layer 1 has high pass rate (90-95%)
  const passed = randomBool(0.92);

  // Duration varies: passed runs are faster
  const baseDuration = passed ? randomInt(2000, 5000) : randomInt(4000, 8000);

  // Findings: 0-2 for passed, 1-5 for failed
  const findingsCount = passed ? randomInt(0, 2) : randomInt(1, 5);

  return {
    timestamp: timestamp.toISOString(),
    layer: 1,
    passed,
    durationMs: baseDuration,
    findingsCount,
    metadata: {
      triggeredBy: randomBool(0.8) ? 'hook' : 'cli',
    },
  };
}

/**
 * Generate realistic Layer 2 (PR automation) run
 * @param {Date} timestamp - Run timestamp
 * @returns {Object} Run data
 */
function generateLayer2Run(timestamp) {
  // Layer 2 has moderate pass rate (85-90%)
  const passed = randomBool(0.87);

  // PR reviews take longer
  const baseDuration = randomInt(120000, 600000); // 2-10 minutes

  // CodeRabbit findings distribution
  const crActive = randomBool(0.95); // CodeRabbit active 95% of time
  const crCritical = passed ? 0 : randomInt(0, 2);
  const crHigh = passed ? randomInt(0, 1) : randomInt(1, 4);
  const crMedium = randomInt(0, 5);
  const crLow = randomInt(1, 8);
  const crTotal = crCritical + crHigh + crMedium + crLow;

  // Quinn findings
  const quinnFindings = randomInt(0, 6);
  const categories = [
    'test-coverage',
    'documentation',
    'error-handling',
    'performance',
    'security',
    'code-style',
    'maintainability',
  ];
  const topCategories = categories
    .sort(() => Math.random() - 0.5)
    .slice(0, randomInt(1, 3));

  return {
    timestamp: timestamp.toISOString(),
    layer: 2,
    passed,
    durationMs: baseDuration,
    findingsCount: crTotal + quinnFindings,
    metadata: {
      triggeredBy: 'pr',
      coderabbit: crActive ? {
        findingsCount: crTotal,
        severityBreakdown: {
          critical: crCritical,
          high: crHigh,
          medium: crMedium,
          low: crLow,
        },
      } : null,
      quinn: {
        findingsCount: quinnFindings,
        topCategories,
      },
    },
  };
}

/**
 * Generate realistic Layer 3 (human review) run
 * @param {Date} timestamp - Run timestamp
 * @returns {Object} Run data
 */
function generateLayer3Run(timestamp) {
  // Layer 3 has highest pass rate (95-98%)
  const passed = randomBool(0.96);

  // Human reviews vary widely in time
  const baseDuration = randomInt(300000, 1800000); // 5-30 minutes

  // Findings are usually minimal at this stage
  const findingsCount = passed ? randomInt(0, 1) : randomInt(1, 3);

  return {
    timestamp: timestamp.toISOString(),
    layer: 3,
    passed,
    durationMs: baseDuration,
    findingsCount,
    metadata: {
      triggeredBy: 'manual',
      reviewer: randomBool(0.7) ? 'human' : 'team-lead',
    },
  };
}

/**
 * Generate seed data for a specified number of days
 * @param {Object} options - Generation options
 * @param {number} [options.days=30] - Number of days of history
 * @param {number} [options.runsPerDay=8] - Average runs per day
 * @param {boolean} [options.weekendReduction=true] - Reduce weekend activity
 * @returns {Object} Generated metrics data
 */
function generateSeedData(options = {}) {
  const days = options.days || 30;
  const runsPerDay = options.runsPerDay || 8;
  const weekendReduction = options.weekendReduction !== false;

  const metrics = createEmptyMetrics();
  const history = [];

  const now = new Date();

  // Generate history for each day
  for (let d = days; d >= 0; d--) {
    const dayDate = new Date(now);
    dayDate.setDate(dayDate.getDate() - d);
    dayDate.setHours(9, 0, 0, 0); // Start at 9 AM

    const dayOfWeek = dayDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Reduce runs on weekends
    const dayRuns = isWeekend && weekendReduction
      ? Math.floor(runsPerDay * 0.3)
      : runsPerDay + randomInt(-2, 2);

    for (let r = 0; r < Math.max(1, dayRuns); r++) {
      // Spread runs throughout the workday (9 AM - 6 PM)
      const runTime = new Date(dayDate);
      runTime.setHours(9 + randomInt(0, 9), randomInt(0, 59), randomInt(0, 59));

      // Layer distribution: Layer 1 most common, Layer 3 least common
      const layerRoll = Math.random();
      let layer;
      if (layerRoll < 0.6) {
        layer = 1;
      } else if (layerRoll < 0.9) {
        layer = 2;
      } else {
        layer = 3;
      }

      let run;
      switch (layer) {
        case 1:
          run = generateLayer1Run(runTime);
          break;
        case 2:
          run = generateLayer2Run(runTime);
          break;
        case 3:
          run = generateLayer3Run(runTime);
          break;
      }

      history.push(run);
    }
  }

  // Sort history by timestamp
  history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  metrics.history = history;

  // Calculate layer aggregates
  for (let layer = 1; layer <= 3; layer++) {
    const layerKey = `layer${layer}`;
    const layerRuns = history.filter((r) => r.layer === layer);

    if (layerRuns.length > 0) {
      const passedRuns = layerRuns.filter((r) => r.passed).length;
      const totalDuration = layerRuns.reduce((sum, r) => sum + r.durationMs, 0);

      metrics.layers[layerKey].passRate = passedRuns / layerRuns.length;
      metrics.layers[layerKey].avgTimeMs = Math.round(totalDuration / layerRuns.length);
      metrics.layers[layerKey].totalRuns = layerRuns.length;
      metrics.layers[layerKey].lastRun = layerRuns[layerRuns.length - 1].timestamp;
    }
  }

  // Calculate Layer 2 specific metrics
  const layer2Runs = history.filter((r) => r.layer === 2);
  if (layer2Runs.length > 0) {
    let totalCrFindings = 0;
    let crCritical = 0, crHigh = 0, crMedium = 0, crLow = 0;
    let quinnFindings = 0;
    const allCategories = [];

    layer2Runs.forEach((r) => {
      if (r.metadata?.coderabbit) {
        const cr = r.metadata.coderabbit;
        totalCrFindings += cr.findingsCount || 0;
        crCritical += cr.severityBreakdown?.critical || 0;
        crHigh += cr.severityBreakdown?.high || 0;
        crMedium += cr.severityBreakdown?.medium || 0;
        crLow += cr.severityBreakdown?.low || 0;
      }
      if (r.metadata?.quinn) {
        quinnFindings += r.metadata.quinn.findingsCount || 0;
        allCategories.push(...(r.metadata.quinn.topCategories || []));
      }
    });

    // Top categories by frequency
    const categoryCount = {};
    allCategories.forEach((cat) => {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat);

    metrics.layers.layer2.autoCatchRate = totalCrFindings / layer2Runs.length;
    metrics.layers.layer2.coderabbit = {
      active: true,
      findingsCount: totalCrFindings,
      severityBreakdown: {
        critical: crCritical,
        high: crHigh,
        medium: crMedium,
        low: crLow,
      },
    };
    metrics.layers.layer2.quinn = {
      findingsCount: quinnFindings,
      topCategories,
    };
  }

  // Generate trend data
  const trendDays = Math.min(days, 30);
  for (let d = trendDays; d >= 0; d--) {
    const trendDate = new Date(now);
    trendDate.setDate(trendDate.getDate() - d);
    const dateStr = trendDate.toISOString().split('T')[0];

    // Daily pass rate
    const dayRuns = history.filter((r) =>
      r.timestamp.startsWith(dateStr),
    );
    if (dayRuns.length > 0) {
      const passedToday = dayRuns.filter((r) => r.passed).length;
      metrics.trends.passRates.push({
        date: dateStr,
        value: passedToday / dayRuns.length,
      });
    }

    // Daily auto-catch rate (Layer 2)
    const layer2DayRuns = dayRuns.filter((r) => r.layer === 2);
    if (layer2DayRuns.length > 0) {
      const findings = layer2DayRuns.reduce((sum, r) => sum + (r.findingsCount || 0), 0);
      metrics.trends.autoCatchRate.push({
        date: dateStr,
        value: findings / layer2DayRuns.length,
      });
    }
  }

  metrics.lastUpdated = new Date().toISOString();

  return metrics;
}

/**
 * Seed the metrics file with generated data
 * @param {Object} options - Seed options
 * @returns {Promise<Object>} Generated metrics
 */
async function seedMetrics(options = {}) {
  const collector = new MetricsCollector(options);
  const metrics = generateSeedData(options);
  await collector.save(metrics);
  return metrics;
}

module.exports = {
  generateSeedData,
  seedMetrics,
  generateLayer1Run,
  generateLayer2Run,
  generateLayer3Run,
};
