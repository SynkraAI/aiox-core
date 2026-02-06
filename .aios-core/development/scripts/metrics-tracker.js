const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

/**
 * Tracks metrics for self-improvement operations
 */
class MetricsTracker {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.metricsFile = path.join(this.rootPath, '.aios', 'improvement-metrics.json');
    this.maxEntries = options.maxEntries || 1000;
    
    // Metric categories
    this.categories = {
      performance: ['execution_time', 'memory_usage', 'cpu_usage'],
      quality: ['test_coverage', 'code_complexity', 'error_rate'],
      impact: ['files_modified', 'functions_improved', 'bugs_fixed'],
      user: ['approval_rate', 'rollback_rate', 'satisfaction_score']
    };
  }

  /**
   * Initialize metrics system
   * @returns {Promise<void>}
   */
  async initialize() {
    const metricsDir = path.dirname(this.metricsFile);
    
    try {
      await fs.mkdir(metricsDir, { recursive: true });
      
      // Initialize file if doesn't exist
      try {
        await fs.access(this.metricsFile);
      } catch {
        await this.saveMetrics({
          version: '1.0.0',
          created: new Date().toISOString(),
          improvements: [],
          aggregates: this.initializeAggregates(),
          trends: {}
        });
      }
    } catch (error) {
      console.error(chalk.red(`Failed to initialize metrics: ${error.message}`));
    }
  }

  /**
   * Record improvement metrics
   * @param {Object} improvement - Improvement data
   * @returns {Promise<void>}
   */
  async recordImprovement(improvement) {
    await this.initialize();
    
    const metrics = await this.loadMetrics();
    
    const entry = {
      improvement_id: improvement.improvement_id,
      timestamp: new Date().toISOString(),
      metrics: improvement.metrics || {},
      analysis: improvement.analysis || {},
      plan: improvement.plan || {},
      outcome: 'pending',
      measurements: await this.gatherMeasurements(improvement)
    };

    metrics.improvements.push(entry);
    
    // Keep only recent entries
    if (metrics.improvements.length > this.maxEntries) {
      metrics.improvements = metrics.improvements.slice(-this.maxEntries);
    }
    
    // Update aggregates
    await this.updateAggregates(metrics, entry);
    
    // Calculate trends
    metrics.trends = await this.calculateTrends(metrics);
    
    await this.saveMetrics(metrics);
    
    console.log(chalk.green(`📊 Metrics recorded for improvement: ${improvement.improvement_id}`));
  }

  /**
   * Update improvement outcome
   * @param {string} improvementId - Improvement ID
   * @param {Object} outcome - Outcome data
   * @returns {Promise<void>}
   */
  async updateOutcome(improvementId, outcome) {
    const metrics = await this.loadMetrics();
    
    const entry = metrics.improvements.find(i => i.improvement_id === improvementId);
    if (!entry) {
      throw new Error(`Improvement not found: ${improvementId}`);
    }
    
    entry.outcome = outcome.status; // 'success', 'failed', 'rolled_back'
    entry.outcome_details = outcome;
    entry.end_timestamp = new Date().toISOString();
    
    // Calculate duration
    const start = new Date(entry.timestamp);
    const end = new Date(entry.end_timestamp);
    entry.duration_ms = end - start;
    
    // Update aggregates based on outcome
    await this.updateOutcomeAggregates(metrics, entry);
    
    await this.saveMetrics(metrics);
  }

  /**
   * Get improvement report
   * @param {string} improvementId - Improvement ID
   * @returns {Promise<Object>} Improvement report
   */
  async getImprovementReport(improvementId) {
    const metrics = await this.loadMetrics();
    const entry = metrics.improvements.find(i => i.improvement_id === improvementId);
    
    if (!entry) {
      throw new Error(`Improvement not found: ${improvementId}`);
    }
    
    const report = {
      improvement_id: improvementId,
      timestamp: entry.timestamp,
      outcome: entry.outcome,
      duration: entry.duration_ms ? `${(entry.duration_ms / 1000).toFixed(2)}s` : 'ongoing',
      metrics: entry.metrics,
      measurements: entry.measurements,
      impact_summary: this.generateImpactSummary(entry),
      recommendations: this.generateRecommendations(entry)
    };
    
    return report;
  }

  /**
   * Get dashboard data
   * @param {Object} options - Dashboard options
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboard(options = {}) {
    const { period = '7d' } = options;
    const metrics = await this.loadMetrics();
    
    const cutoff = this.getPeriodCutoff(period);
    const recentImprovements = metrics.improvements.filter(
      i => new Date(i.timestamp) > cutoff
    );
    
    const dashboard = {
      period,
      summary: {
        total_improvements: recentImprovements.length,
        successful: recentImprovements.filter(i => i.outcome === 'success').length,
        failed: recentImprovements.filter(i => i.outcome === 'failed').length,
        rolled_back: recentImprovements.filter(i => i.outcome === 'rolled_back').length,
        pending: recentImprovements.filter(i => i.outcome === 'pending').length
      },
      performance: this.calculatePerformanceMetrics(recentImprovements),
      quality: this.calculateQualityMetrics(recentImprovements),
      trends: metrics.trends,
      top_improvements: this.getTopImprovements(recentImprovements, 5),
      recommendations: this.generateDashboardRecommendations(metrics)
    };
    
    return dashboard;
  }

  /**
   * Generate analytics report
   * @param {Object} options - Report options
   * @returns {Promise<Object>} Analytics report
   */
  async generateAnalytics(options = {}) {
    const metrics = await this.loadMetrics();
    
    const analytics = {
      generated: new Date().toISOString(),
      period: options.period || 'all-time',
      improvements: {
        total: metrics.improvements.length,
        by_outcome: this.groupByOutcome(metrics.improvements),
        by_category: this.groupByCategory(metrics.improvements),
        by_month: this.groupByMonth(metrics.improvements)
      },
      performance: {
        average_duration: this.calculateAverageDuration(metrics.improvements),
        success_rate: this.calculateSuccessRate(metrics.improvements),
        improvement_velocity: this.calculateVelocity(metrics.improvements)
      },
      impact: {
        total_files_modified: metrics.aggregates.total_files_modified,
        total_functions_improved: metrics.aggregates.total_functions_improved,
        average_improvement_score: this.calculateAverageImprovementScore(metrics.improvements)
      },
      patterns: this.identifyPatterns(metrics.improvements),
      insights: this.generateInsights(metrics)
    };
    
    return analytics;
  }

  /**
   * Gather measurements for improvement
   * @private
   */
  async gatherMeasurements(improvement) {
    const measurements = {
      baseline: {},
      projected: {},
      actual: {}
    };
    
    // Baseline measurements from analysis
    if (improvement.analysis) {
      measurements.baseline = {
        overall_score: improvement.analysis.overall_score,
        category_scores: improvement.analysis.categories
          ? Object.entries(improvement.analysis.categories).reduce((acc, [cat, data]) => {
              acc[cat] = data.score;
              return acc;
            }, {})
          : {}
      };
    }
    
    // Projected improvements from plan
    if (improvement.plan) {
      measurements.projected = {
        impact: improvement.plan.estimatedImpact,
        effort: improvement.plan.estimatedEffort,
        risk: improvement.plan.riskLevel,
        files: improvement.plan.affectedFiles?.length || 0
      };
    }
    
    // Actual measurements will be filled later
    measurements.actual = {
      timestamp: new Date().toISOString()
    };
    
    return measurements;
  }

  /**
   * Update aggregates
   * @private
   */
  async updateAggregates(metrics, entry) {
    const agg = metrics.aggregates;
    
    agg.total_improvements++;
    
    if (entry.measurements.projected.files) {
      agg.total_files_modified += entry.measurements.projected.files;
    }
    
    // Update category counts
    if (entry.plan && entry.plan.target_areas) {
      entry.plan.target_areas.forEach(area => {
        agg.improvements_by_category[area] = (agg.improvements_by_category[area] || 0) + 1;
      });
    }
    
    // Update hourly distribution
    const hour = new Date(entry.timestamp).getHours();
    agg.improvements_by_hour[hour] = (agg.improvements_by_hour[hour] || 0) + 1;
  }

  /**
   * Update outcome aggregates
   * @private
   */
  async updateOutcomeAggregates(metrics, entry) {
    const agg = metrics.aggregates;
    
    switch (entry.outcome) {
      case 'success':
        agg.successful_improvements++;
        if (entry.duration_ms) {
          agg.total_duration_ms += entry.duration_ms;
        }
        break;
      case 'failed':
        agg.failed_improvements++;
        break;
      case 'rolled_back':
        agg.rolled_back_improvements++;
        break;
    }
    
    // Update success rate
    const total = agg.successful_improvements + agg.failed_improvements + agg.rolled_back_improvements;
    agg.success_rate = total > 0 ? (agg.successful_improvements / total) * 100 : 0;
  }

  /**
   * Calculate trends
   * @private
   */
  async calculateTrends(metrics) {
    const trends = {};
    
    // Success rate trend (last 5 periods)
    const periods = 5;
    const periodLength = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    trends.success_rate = [];
    
    for (let i = 0; i < periods; i++) {
      const end = Date.now() - (i * periodLength);
      const start = end - periodLength;
      
      const periodImprovements = metrics.improvements.filter(imp => {
        const timestamp = new Date(imp.timestamp).getTime();
        return timestamp >= start && timestamp < end;
      });
      
      const successRate = this.calculateSuccessRate(periodImprovements);
      trends.success_rate.unshift({
        period: i,
        rate: successRate,
        count: periodImprovements.length
      });
    }
    
    // Velocity trend
    trends.velocity = this.calculateVelocityTrend(metrics.improvements);
    
    // Category trends
    trends.categories = this.calculateCategoryTrends(metrics.improvements);
    
    return trends;
  }

  /**
   * Calculate success rate
   * @private
   */
  calculateSuccessRate(_improvements) {
    const completed = improvements.filter(i => i.outcome !== 'pending');
    if (completed.length === 0) return 0;
    
    const successful = completed.filter(i => i.outcome === 'success').length;
    return (successful / completed.length) * 100;
  }

  /**
   * Calculate velocity trend
   * @private
   */
  calculateVelocityTrend(_improvements) {
    const last30Days = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const last60Days = Date.now() - (60 * 24 * 60 * 60 * 1000);
    
    const recent = improvements.filter(i => new Date(i.timestamp) > last30Days).length;
    const previous = improvements.filter(i => {
      const timestamp = new Date(i.timestamp);
      return timestamp > last60Days && timestamp <= last30Days;
    }).length;
    
    const change = previous > 0 ? ((recent - previous) / previous) * 100 : 0;
    
    return {
      current: recent,
      previous,
      change: change.toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  }

  /**
   * Generate impact summary
   * @private
   */
  generateImpactSummary(entry) {
    const summary = {
      scope: 'unknown',
      magnitude: 'unknown',
      areas_affected: []
    };
    
    if (entry.measurements.projected) {
      const files = entry.measurements.projected.files || 0;
      
      if (files === 0) summary.scope = 'none';
      else if (files <= 3) summary.scope = 'small';
      else if (files <= 10) summary.scope = 'medium';
      else summary.scope = 'large';
      
      summary.magnitude = entry.measurements.projected.impact || 'unknown';
    }
    
    if (entry.plan && entry.plan.target_areas) {
      summary.areas_affected = entry.plan.target_areas;
    }
    
    return summary;
  }

  /**
   * Generate recommendations
   * @private
   */
  generateRecommendations(entry) {
    const recommendations = [];
    
    if (entry.outcome === 'failed') {
      recommendations.push({
        type: 'investigation',
        message: 'Investigate failure cause and adjust validation criteria'
      });
    }
    
    if (entry.outcome === 'rolled_back') {
      recommendations.push({
        type: 'review',
        message: 'Review rollback reasons and improve testing coverage'
      });
    }
    
    if (entry.measurements.projected && entry.measurements.projected.risk === 'high') {
      recommendations.push({
        type: 'caution',
        message: 'Consider breaking high-risk improvements into smaller changes'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate dashboard recommendations
   * @private
   */
  generateDashboardRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.aggregates.success_rate < 70) {
      recommendations.push({
        priority: 'high',
        message: 'Success rate below 70% - review validation and testing processes'
      });
    }
    
    if (metrics.aggregates.rolled_back_improvements > metrics.aggregates.successful_improvements * 0.2) {
      recommendations.push({
        priority: 'medium',
        message: 'High rollback rate detected - improve sandbox testing'
      });
    }
    
    const recentTrend = metrics.trends.velocity;
    if (recentTrend && recentTrend.direction === 'down' && recentTrend.change < -50) {
      recommendations.push({
        priority: 'low',
        message: 'Improvement velocity decreasing - consider process optimization'
      });
    }
    
    return recommendations;
  }

  /**
   * Get top improvements
   * @private
   */
  getTopImprovements(_improvements, limit) {
    return improvements
      .filter(i => i.outcome === 'success')
      .sort((a, b) => {
        const scoreA = a.measurements.projected?.impact || 0;
        const scoreB = b.measurements.projected?.impact || 0;
        return scoreB - scoreA;
      })
      .slice(0, limit)
      .map(i => ({
        id: i.improvement_id,
        timestamp: i.timestamp,
        impact: i.measurements.projected?.impact,
        areas: i.plan?.target_areas || []
      }));
  }

  /**
   * Identify patterns
   * @private
   */
  identifyPatterns(_improvements) {
    const patterns = {
      common_failures: {},
      success_factors: [],
      time_patterns: {}
    };
    
    // Analyze failures
    const failures = improvements.filter(i => i.outcome === 'failed');
    failures.forEach(f => {
      if (f.plan && f.plan.target_areas) {
        f.plan.target_areas.forEach(area => {
          patterns.common_failures[area] = (patterns.common_failures[area] || 0) + 1;
        });
      }
    });
    
    // Success patterns
    const successes = improvements.filter(i => i.outcome === 'success');
    if (successes.length > 0) {
      const avgFiles = successes.reduce((sum, s) => 
        sum + (s.measurements.projected?.files || 0), 0) / successes.length;
      
      patterns.success_factors.push({
        factor: 'optimal_file_count',
        value: Math.round(avgFiles),
        confidence: 0.7
      });
    }
    
    return patterns;
  }

  /**
   * Generate insights
   * @private
   */
  generateInsights(metrics) {
    const insights = [];
    
    // Time-based insights
    const hourlyDist = metrics.aggregates.improvements_by_hour;
    const peakHour = Object.entries(hourlyDist)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (peakHour) {
      insights.push({
        type: 'timing',
        message: `Most improvements occur at ${peakHour[0]}:00 hours`,
        data: { hour: peakHour[0], count: peakHour[1] }
      });
    }
    
    // Category insights
    const categories = metrics.aggregates.improvements_by_category;
    const topCategory = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topCategory) {
      insights.push({
        type: 'focus',
        message: `${topCategory[0]} improvements are most common (${topCategory[1]} times)`,
        data: { category: topCategory[0], count: topCategory[1] }
      });
    }
    
    return insights;
  }

  /**
   * Initialize aggregates
   * @private
   */
  initializeAggregates() {
    return {
      total_improvements: 0,
      successful_improvements: 0,
      failed_improvements: 0,
      rolled_back_improvements: 0,
      total_files_modified: 0,
      total_functions_improved: 0,
      total_duration_ms: 0,
      success_rate: 0,
      improvements_by_category: {},
      improvements_by_hour: {}
    };
  }

  /**
   * Get period cutoff date
   * @private
   */
  getPeriodCutoff(period) {
    const now = new Date();
    
    switch (period) {
      case '24h':
        return new Date(now - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0); // All time
    }
  }

  /**
   * Calculate average duration
   * @private
   */
  calculateAverageDuration(_improvements) {
    const completed = improvements.filter(i => i.duration_ms);
    if (completed.length === 0) return 0;
    
    const total = completed.reduce((sum, i) => sum + i.duration_ms, 0);
    return Math.round(total / completed.length);
  }

  /**
   * Calculate improvement velocity
   * @private
   */
  calculateVelocity(_improvements) {
    const last7Days = this.getPeriodCutoff('7d');
    const recent = improvements.filter(i => new Date(i.timestamp) > last7Days);
    return recent.length / 7; // Per day
  }

  /**
   * Calculate average improvement score
   * @private
   */
  calculateAverageImprovementScore(_improvements) {
    const withScores = improvements.filter(i => 
      i.measurements?.baseline?.overall_score && 
      i.outcome === 'success'
    );
    
    if (withScores.length === 0) return 0;
    
    const totalImprovement = withScores.reduce((sum, i) => {
      const baseline = parseFloat(i.measurements.baseline.overall_score) || 0;
      const projected = baseline + (i.measurements.projected?.impact || 0);
      return sum + (projected - baseline);
    }, 0);
    
    return (totalImprovement / withScores.length).toFixed(2);
  }

  /**
   * Group improvements by outcome
   * @private
   */
  groupByOutcome(_improvements) {
    return improvements.reduce((groups, imp) => {
      const outcome = imp.outcome || 'pending';
      groups[outcome] = (groups[outcome] || 0) + 1;
      return groups;
    }, {});
  }

  /**
   * Group improvements by category
   * @private
   */
  groupByCategory(_improvements) {
    const groups = {};
    
    improvements.forEach(imp => {
      if (imp.plan && imp.plan.target_areas) {
        imp.plan.target_areas.forEach(area => {
          groups[area] = (groups[area] || 0) + 1;
        });
      }
    });
    
    return groups;
  }

  /**
   * Group improvements by month
   * @private
   */
  groupByMonth(_improvements) {
    return improvements.reduce((groups, imp) => {
      const month = new Date(imp.timestamp).toISOString().substring(0, 7);
      groups[month] = (groups[month] || 0) + 1;
      return groups;
    }, {});
  }

  /**
   * Calculate performance metrics
   * @private
   */
  calculatePerformanceMetrics(_improvements) {
    const successful = improvements.filter(i => i.outcome === 'success');
    
    return {
      average_duration: this.calculateAverageDuration(successful),
      fastest_improvement: successful
        .filter(i => i.duration_ms)
        .sort((a, b) => a.duration_ms - b.duration_ms)[0]?.duration_ms || null,
      slowest_improvement: successful
        .filter(i => i.duration_ms)
        .sort((a, b) => b.duration_ms - a.duration_ms)[0]?.duration_ms || null
    };
  }

  /**
   * Calculate quality metrics
   * @private
   */
  calculateQualityMetrics(_improvements) {
    return {
      test_coverage_impact: 'N/A', // Would need actual test data
      complexity_reduction: 'N/A', // Would need complexity analysis
      error_rate_change: 'N/A' // Would need error tracking
    };
  }

  /**
   * Calculate category trends
   * @private
   */
  calculateCategoryTrends(_improvements) {
    const trends = {};
    const categories = Object.keys(this.categories);
    
    categories.forEach(cat => {
      const catImprovements = improvements.filter(i => 
        i.plan?.target_areas?.includes(cat)
      );
      
      trends[cat] = {
        total: catImprovements.length,
        success_rate: this.calculateSuccessRate(catImprovements),
        recent_activity: catImprovements.filter(i => 
          new Date(i.timestamp) > this.getPeriodCutoff('7d')
        ).length
      };
    });
    
    return trends;
  }

  /**
   * Load metrics
   * @private
   */
  async loadMetrics() {
    try {
      const content = await fs.readFile(this.metricsFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {
        version: '1.0.0',
        improvements: [],
        aggregates: this.initializeAggregates(),
        trends: {}
      };
    }
  }

  /**
   * Save metrics
   * @private
   */
  async saveMetrics(metrics) {
    await fs.writeFile(
      this.metricsFile,
      JSON.stringify(metrics, null, 2)
    );
  }
}

module.exports = MetricsTracker;