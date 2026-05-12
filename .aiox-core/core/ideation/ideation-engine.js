/**
 * Ideation Engine
 * Story 11.1 - Enhanced Capabilities
 *
 * AI-powered analysis for codebase improvements.
 * Suggests optimizations for performance, security, code quality, and UX.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import dependencies with fallbacks
let GotchasMemory;
try {
  GotchasMemory = require('../memory/gotchas-memory');
} catch {
  GotchasMemory = null;
}

class IdeationEngine {
  constructor(config = {}) {
    // Root path
    this.rootPath = config.rootPath || process.cwd();

    // Analysis areas
    this.areas = config.areas || ['performance', 'security', 'codeQuality', 'ux', 'architecture'];

    // Dependencies
    this.gotchasMemory = config.gotchasMemory || (GotchasMemory ? new GotchasMemory() : null);

    // Output paths
    this.outputDir = config.outputDir || path.join(this.rootPath, '.aiox', 'ideation');

    // Analyzers
    this.analyzers = {
      performance: new PerformanceAnalyzer(this.rootPath),
      security: new SecurityAnalyzer(this.rootPath),
      codeQuality: new CodeQualityAnalyzer(this.rootPath),
      ux: new UXAnalyzer(this.rootPath),
      architecture: new ArchitectureAnalyzer(this.rootPath),
    };
  }

  /**
   * Run ideation analysis
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} - Analysis results
   */
  async ideate(options = {}) {
    const focus = options.focus || this.areas;
    const focusAreas = Array.isArray(focus) ? focus : [focus];

    const suggestions = [];
    const startTime = Date.now();

    for (const area of focusAreas) {
      const analyzer = this.analyzers[area];
      if (!analyzer) continue;

      try {
        const findings = await analyzer.analyze();
        suggestions.push(
          ...findings.map((f) => ({
            ...f,
            area,
            priority: this.calculatePriority(f),
          })),
        );
      } catch (error) {
        console.warn(`Analysis failed for ${area}:`, error.message);
      }
    }

    // Filter out known gotchas
    let filtered = suggestions;
    if (this.gotchasMemory) {
      try {
        const knownIssues = await this.gotchasMemory.getAll();
        filtered = suggestions.filter((s) => !this.isKnownGotcha(s, knownIssues));
      } catch {
        // Ignore
      }
    }

    // Sort by priority
    const sorted = filtered.sort((a, b) => b.priority - a.priority);

    // Categorize
    const result = {
      generatedAt: new Date().toISOString(),
      projectId: path.basename(this.rootPath),
      duration: Date.now() - startTime,

      summary: {
        totalSuggestions: sorted.length,
        quickWins: sorted.filter((s) => s.category === 'quick-win').length,
        highImpact: sorted.filter((s) => s.impact >= 0.8).length,
        byArea: this.countByArea(sorted),
      },

      quickWins: sorted.filter((s) => s.effort === 'low' && s.impact >= 0.7),
      highImpact: sorted.filter((s) => s.impact >= 0.8),
      allSuggestions: sorted,
    };

    // Save if requested
    if (options.save !== false) {
      await this.save(result);
    }

    return result;
  }

  /**
   * Calculate priority for a finding
   * @param {Object} finding - Finding
   * @returns {number} - Priority score
   */
  calculatePriority(finding) {
    const impact = finding.impact || 0.5;
    const effortMultiplier = { low: 1.5, medium: 1.0, high: 0.6 }[finding.effort] || 1.0;

    // Quick wins get highest priority
    if (finding.effort === 'low' && impact >= 0.7) {
      finding.category = 'quick-win';
      return impact * 1.5;
    }

    return impact * effortMultiplier;
  }

  /**
   * Check if suggestion matches known gotcha
   * @param {Object} suggestion - Suggestion
   * @param {Array} knownIssues - Known gotchas
   * @returns {boolean} - True if matches
   */
  isKnownGotcha(suggestion, knownIssues) {
    if (!knownIssues) return false;

    const suggestionText = `${suggestion.title} ${suggestion.description}`.toLowerCase();

    return knownIssues.some((gotcha) => {
      const gotchaText = `${gotcha.pattern || ''} ${gotcha.description || ''}`.toLowerCase();
      // Check for significant overlap
      const words = gotchaText.split(/\s+/).filter((w) => w.length > 4);
      const matches = words.filter((w) => suggestionText.includes(w));
      return matches.length >= 3;
    });
  }

  /**
   * Count suggestions by area
   * @param {Array} suggestions - Suggestions
   * @returns {Object} - Counts by area
   */
  countByArea(suggestions) {
    const counts = {};
    for (const s of suggestions) {
      counts[s.area] = (counts[s.area] || 0) + 1;
    }
    return counts;
  }

  /**
   * Save results to files
   * @param {Object} result - Analysis result
   */
  async save(result) {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Save JSON
    const jsonPath = path.join(this.outputDir, 'suggestions.json');
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));

    // Save markdown
    const mdPath = path.join(this.outputDir, 'suggestions.md');
    fs.writeFileSync(mdPath, this.formatMarkdown(result));
  }

  /**
   * Format results as markdown
   * @param {Object} result - Analysis result
   * @returns {string} - Markdown content
   */
  formatMarkdown(result) {
    let md = '# Ideation Report\n\n';
    md += `> **Generated:** ${result.generatedAt}\n`;
    md += `> **Project:** ${result.projectId}\n`;
    md += `> **Duration:** ${result.duration}ms\n\n`;

    md += '## Summary\n\n';
    md += '| Metric | Value |\n';
    md += '|--------|-------|\n';
    md += `| Total Suggestions | ${result.summary.totalSuggestions} |\n`;
    md += `| Quick Wins | ${result.summary.quickWins} |\n`;
    md += `| High Impact | ${result.summary.highImpact} |\n\n`;

    if (result.quickWins.length > 0) {
      md += '## 🎯 Quick Wins\n\n';
      md += '*Low effort, high impact suggestions*\n\n';
      for (const s of result.quickWins.slice(0, 5)) {
        md += this.formatSuggestion(s);
      }
    }

    if (result.highImpact.length > 0) {
      md += '## 🚀 High Impact\n\n';
      md += '*Suggestions with significant potential impact*\n\n';
      for (const s of result.highImpact.slice(0, 5)) {
        md += this.formatSuggestion(s);
      }
    }

    // By area
    for (const area of this.areas) {
      const areaSuggestions = result.allSuggestions.filter((s) => s.area === area);
      if (areaSuggestions.length === 0) continue;

      const areaTitle = area.charAt(0).toUpperCase() + area.slice(1);
      md += `## ${areaTitle}\n\n`;
      for (const s of areaSuggestions.slice(0, 3)) {
        md += this.formatSuggestion(s);
      }
    }

    md += '---\n*Generated by AIOX Ideation Engine*\n';

    return md;
  }

  /**
   * Format a single suggestion
   * @param {Object} s - Suggestion
   * @returns {string} - Formatted markdown
   */
  formatSuggestion(s) {
    let md = `### ${s.title}\n\n`;
    md += `- **Impact:** ${Math.round(s.impact * 100)}%\n`;
    md += `- **Effort:** ${s.effort}\n`;
    md += `- **Area:** ${s.area}\n`;

    if (s.location) {
      md += `- **Location:** \`${s.location.file}\``;
      if (s.location.lines) md += ` (lines ${s.location.lines})`;
      md += '\n';
    }

    md += `\n${s.description}\n`;

    if (s.suggestedFix) {
      md += `\n**Suggested Fix:** ${s.suggestedFix}\n`;
    }

    md += '\n';
    return md;
  }
}

/**
 * Performance Analyzer
 */
class PerformanceAnalyzer {
  constructor(rootPath) {
    this.rootPath = rootPath;
  }

  async analyze() {
    const findings = [];

    // Check for common performance issues
    findings.push(...this.checkSyncOperations());
    findings.push(...this.checkLargeLoops());
    findings.push(...this.checkUnoptimizedImports());
    findings.push(...this.checkMissingCaching());

    return findings;
  }

  checkSyncOperations() {
    const findings = [];

    try {
      // Search for sync file operations
      const result = execSync(
        `grep -rn "readFileSync\\|writeFileSync\\|existsSync" --include="*.js" --include="*.ts" ${this.rootPath}/src ${this.rootPath}/.aiox-core 2>/dev/null || true`,
        {
          encoding: 'utf8',
          maxBuffer: 5 * 1024 * 1024,
        },
      );

      const lines = result.split('\n').filter((l) => l.trim() && !l.includes('node_modules'));

      if (lines.length > 10) {
        findings.push({
          id: `perf-sync-${Date.now()}`,
          title: 'Excessive synchronous file operations',
          description: `Found ${lines.length} synchronous file operations that could block the event loop.`,
          impact: 0.7,
          effort: 'medium',
          location: { file: 'multiple files' },
          suggestedFix: 'Convert to async/await using fs.promises',
        });
      }
    } catch {
      // Ignore
    }

    return findings;
  }

  checkLargeLoops() {
    const findings = [];

    try {
      // Look for nested loops
      const result = execSync(
        `grep -rn "for.*for\\|forEach.*forEach" --include="*.js" --include="*.ts" ${this.rootPath} 2>/dev/null || true`,
        {
          encoding: 'utf8',
          maxBuffer: 5 * 1024 * 1024,
        },
      );

      const lines = result.split('\n').filter((l) => l.trim() && !l.includes('node_modules'));

      if (lines.length > 5) {
        findings.push({
          id: `perf-loops-${Date.now()}`,
          title: 'Potential nested loop performance issue',
          description: `Found ${lines.length} nested loops that may impact performance.`,
          impact: 0.6,
          effort: 'medium',
          suggestedFix: 'Consider using Map/Set for lookups or optimizing algorithms',
        });
      }
    } catch {
      // Ignore
    }

    return findings;
  }

  checkUnoptimizedImports() {
    const findings = [];

    try {
      // Check for large library imports without tree shaking
      const result = execSync(
        `grep -rn "import.*from 'lodash'" --include="*.js" --include="*.ts" ${this.rootPath} 2>/dev/null || true`,
        {
          encoding: 'utf8',
          maxBuffer: 5 * 1024 * 1024,
        },
      );

      const lines = result.split('\n').filter((l) => l.trim() && !l.includes('node_modules'));

      if (lines.length > 0) {
        findings.push({
          id: `perf-imports-${Date.now()}`,
          title: 'Unoptimized lodash imports',
          description: 'Importing entire lodash library instead of specific functions.',
          impact: 0.5,
          effort: 'low',
          suggestedFix: "Use import { func } from 'lodash/func' for tree shaking",
        });
      }
    } catch {
      // Ignore
    }

    return findings;
  }

  checkMissingCaching() {
    const findings = [];

    try {
      // Look for repeated file reads without caching
      const result = execSync(
        `grep -rn "JSON.parse.*readFile\\|readFile.*JSON.parse" --include="*.js" --include="*.ts" ${this.rootPath} 2>/dev/null || true`,
        {
          encoding: 'utf8',
          maxBuffer: 5 * 1024 * 1024,
        },
      );

      const lines = result
        .split('\n')
        .filter((l) => l.trim() && !l.includes('node_modules') && !l.includes('Cache'));

      if (lines.length > 5) {
        findings.push({
          id: `perf-cache-${Date.now()}`,
          title: 'Consider adding caching for file reads',
          description: `Found ${lines.length} JSON file reads that could benefit from caching.`,
          impact: 0.6,
          effort: 'low',
          suggestedFix: 'Add TTL-based caching for frequently read config files',
        });
      }
    } catch {
      // Ignore
    }

    return findings;
  }
}

/**
 * Security Analyzer
 */
class SecurityAnalyzer {
  constructor(rootPath) {
    this.rootPath = rootPath;
  }

  async analyze() {
    const findings = [];

    findings.push(...this.checkHardcodedSecrets());
    findings.push(...this.checkInsecurePatterns());
    findings.push(...this.checkDependencyVulnerabilities());

    return findings;
  }

  checkHardcodedSecrets() {
    const findings = [];

    try {
      // Look for potential hardcoded secrets
      const result = execSync(
        `grep -rn "password.*=\\s*['\\"]\\|api_key.*=\\s*['\\"]\\|secret.*=\\s*['\\"]" --include="*.js" --include="*.ts" ${this.rootPath} 2>/dev/null || true`,
        {
          encoding: 'utf8',
          maxBuffer: 5 * 1024 * 1024,
        },
      );

      const lines = result
        .split('\n')
        .filter(
          (l) =>
            l.trim() && !l.includes('node_modules') && !l.includes('.env') && !l.includes('test'),
        );

      if (lines.length > 0) {
        findings.push({
          id: `sec-secrets-${Date.now()}`,
          title: 'Potential hardcoded secrets',
          description: `Found ${lines.length} potential hardcoded secrets in source code.`,
          impact: 0.95,
          effort: 'low',
          suggestedFix: 'Move secrets to environment variables or secrets manager',
        });
      }
    } catch {
      // Ignore
    }

    return findings;
  }

  checkInsecurePatterns() {
    const findings = [];

    try {
      // Check for eval usage
      const evalResult = execSync(
        `grep -rn "\\beval\\s*(" --include="*.js" --include="*.ts" ${this.rootPath} 2>/dev/null || true`,
        {
          encoding: 'utf8',
        },
      );

      const evalLines = evalResult
        .split('\n')
        .filter((l) => l.trim() && !l.includes('node_modules'));

      if (evalLines.length > 0) {
        findings.push({
          id: `sec-eval-${Date.now()}`,
          title: 'Dangerous eval() usage',
          description: `Found ${evalLines.length} uses of eval() which can lead to code injection.`,
          impact: 0.9,
          effort: 'medium',
          suggestedFix:
            'Replace eval with safer alternatives like JSON.parse or Function constructor',
        });
      }
    } catch {
      // Ignore
    }

    return findings;
  }

  checkDependencyVulnerabilities() {
    const findings = [];

    try {
      const auditResult = execSync('npm audit --json 2>/dev/null || true', {
        cwd: this.rootPath,
        encoding: 'utf8',
      });

      const audit = JSON.parse(auditResult);
      const vulns = audit.metadata?.vulnerabilities || {};
      const critical = vulns.critical || 0;
      const high = vulns.high || 0;

      if (critical > 0 || high > 0) {
        findings.push({
          id: `sec-deps-${Date.now()}`,
          title: 'Vulnerable dependencies detected',
          description: `Found ${critical} critical and ${high} high severity vulnerabilities in dependencies.`,
          impact: critical > 0 ? 0.95 : 0.8,
          effort: 'low',
          suggestedFix: 'Run npm audit fix or update vulnerable packages',
        });
      }
    } catch {
      // Ignore audit failures
    }

    return findings;
  }
}

/**
 * Code Quality Analyzer
 */
class CodeQualityAnalyzer {
  constructor(rootPath) {
    this.rootPath = rootPath;
  }

  async analyze() {
    const findings = [];

    findings.push(...this.checkLongFunctions());
    findings.push(...this.checkDuplication());
    findings.push(...this.checkConsoleStatements());

    return findings;
  }

  checkLongFunctions() {
    const findings = [];

    // This is a simplified check - in production would use AST analysis
    try {
      const result = execSync(
        `wc -l ${this.rootPath}/src/**/*.js ${this.rootPath}/.aiox-core/**/*.js 2>/dev/null | sort -rn | head -10 || true`,
        {
          encoding: 'utf8',
        },
      );

      const lines = result.split('\n').filter((l) => l.trim() && !l.includes('total'));
      const longFiles = lines.filter((l) => {
        const count = parseInt(l.trim().split(/\s+/)[0]);
        return count > 500;
      });

      if (longFiles.length > 0) {
        findings.push({
          id: `quality-long-${Date.now()}`,
          title: 'Large source files detected',
          description: `Found ${longFiles.length} files with over 500 lines that may benefit from splitting.`,
          impact: 0.5,
          effort: 'high',
          suggestedFix: 'Consider splitting large files into smaller, focused modules',
        });
      }
    } catch {
      // Ignore
    }

    return findings;
  }

  checkDuplication() {
    const findings = [];

    // Simplified duplication check
    try {
      const result = execSync(
        `grep -rh "function\\|const.*=.*=>" --include="*.js" ${this.rootPath}/src 2>/dev/null | sort | uniq -d | head -5 || true`,
        {
          encoding: 'utf8',
        },
      );

      if (result.trim().length > 0) {
        findings.push({
          id: `quality-dup-${Date.now()}`,
          title: 'Potential code duplication',
          description: 'Some function patterns appear multiple times in the codebase.',
          impact: 0.4,
          effort: 'medium',
          suggestedFix: 'Extract common patterns into shared utility functions',
        });
      }
    } catch {
      // Ignore
    }

    return findings;
  }

  checkConsoleStatements() {
    const findings = [];

    try {
      const result = execSync(
        `grep -rn "console\\.log\\|console\\.error" --include="*.js" --include="*.ts" ${this.rootPath}/src 2>/dev/null || true`,
        {
          encoding: 'utf8',
        },
      );

      const lines = result.split('\n').filter((l) => l.trim() && !l.includes('node_modules'));

      if (lines.length > 20) {
        findings.push({
          id: `quality-console-${Date.now()}`,
          title: 'Excessive console statements',
          description: `Found ${lines.length} console statements that should use proper logging.`,
          impact: 0.3,
          effort: 'low',
          suggestedFix: 'Replace console.log with a proper logging library',
        });
      }
    } catch {
      // Ignore
    }

    return findings;
  }
}

/**
 * UX Analyzer
 */
class UXAnalyzer {
  constructor(rootPath) {
    this.rootPath = rootPath;
  }

  async analyze() {
    const findings = [];

    findings.push(...this.checkAccessibility());
    findings.push(...this.checkLoadingStates());

    return findings;
  }

  checkAccessibility() {
    const findings = [];

    try {
      // Check for missing aria labels in React components
      const result = execSync(
        `grep -rn "<button\\|<a\\s" --include="*.tsx" --include="*.jsx" ${this.rootPath} 2>/dev/null || true`,
        {
          encoding: 'utf8',
        },
      );

      const lines = result
        .split('\n')
        .filter((l) => l.trim() && !l.includes('aria-') && !l.includes('node_modules'));

      if (lines.length > 10) {
        findings.push({
          id: `ux-a11y-${Date.now()}`,
          title: 'Missing accessibility attributes',
          description: `Found ${lines.length} interactive elements potentially missing aria labels.`,
          impact: 0.6,
          effort: 'low',
          suggestedFix: 'Add aria-label or aria-labelledby to interactive elements',
        });
      }
    } catch {
      // Ignore
    }

    return findings;
  }

  checkLoadingStates() {
    const findings = [];

    try {
      // Check for fetch/async without loading states
      const result = execSync(
        `grep -rn "fetch\\|axios\\|useQuery" --include="*.tsx" --include="*.jsx" ${this.rootPath} 2>/dev/null || true`,
        {
          encoding: 'utf8',
        },
      );

      const asyncCalls = result
        .split('\n')
        .filter((l) => l.trim() && !l.includes('node_modules')).length;

      const loadingResult = execSync(
        `grep -rn "isLoading\\|loading\\|Spinner\\|Skeleton" --include="*.tsx" --include="*.jsx" ${this.rootPath} 2>/dev/null || true`,
        {
          encoding: 'utf8',
        },
      );

      const loadingStates = loadingResult
        .split('\n')
        .filter((l) => l.trim() && !l.includes('node_modules')).length;

      if (asyncCalls > loadingStates * 2) {
        findings.push({
          id: `ux-loading-${Date.now()}`,
          title: 'Consider adding loading states',
          description: 'Many async operations may be missing loading indicators.',
          impact: 0.5,
          effort: 'low',
          suggestedFix: 'Add loading spinners or skeletons for async operations',
        });
      }
    } catch {
      // Ignore
    }

    return findings;
  }
}

/**
 * Architecture Analyzer
 */
class ArchitectureAnalyzer {
  constructor(rootPath) {
    this.rootPath = rootPath;
  }

  async analyze() {
    const findings = [];

    findings.push(...this.checkCircularDependencies());
    findings.push(...this.checkLayerViolations());

    return findings;
  }

  checkCircularDependencies() {
    const findings = [];

    try {
      // Use madge if available
      const result = execSync(
        `npx madge --circular --warning ${this.rootPath}/src 2>/dev/null || true`,
        {
          encoding: 'utf8',
          timeout: 30000,
        },
      );

      if (result.includes('Circular')) {
        const circularCount = (result.match(/→/g) || []).length;

        findings.push({
          id: `arch-circular-${Date.now()}`,
          title: 'Circular dependencies detected',
          description: `Found ${circularCount} circular dependency chains that complicate the codebase.`,
          impact: 0.7,
          effort: 'high',
          suggestedFix:
            'Refactor to break circular dependencies using dependency injection or interfaces',
        });
      }
    } catch {
      // Ignore if madge not available
    }

    return findings;
  }

  checkLayerViolations() {
    const findings = [];

    try {
      // Check if UI imports from infrastructure
      const result = execSync(
        `grep -rn "from.*infrastructure\\|from.*database" --include="*.tsx" --include="*.jsx" ${this.rootPath}/src/components 2>/dev/null || true`,
        {
          encoding: 'utf8',
        },
      );

      const violations = result.split('\n').filter((l) => l.trim());

      if (violations.length > 0) {
        findings.push({
          id: `arch-layers-${Date.now()}`,
          title: 'Architecture layer violation',
          description: 'UI components are importing directly from infrastructure layer.',
          impact: 0.6,
          effort: 'medium',
          suggestedFix: 'Use services or hooks as intermediary layer',
        });
      }
    } catch {
      // Ignore
    }

    return findings;
  }
}

module.exports = IdeationEngine;
module.exports.IdeationEngine = IdeationEngine;
module.exports.PerformanceAnalyzer = PerformanceAnalyzer;
module.exports.SecurityAnalyzer = SecurityAnalyzer;
module.exports.CodeQualityAnalyzer = CodeQualityAnalyzer;
module.exports.UXAnalyzer = UXAnalyzer;
module.exports.ArchitectureAnalyzer = ArchitectureAnalyzer;
