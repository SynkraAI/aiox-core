/**
 * PR Review AI
 * AI-powered Pull Request review system
 *
 * Analyzes PRs for:
 * - Code quality issues
 * - Security vulnerabilities
 * - Performance concerns
 * - Redundancy and duplication
 * - False positives and incorrect assumptions
 * - Test coverage
 *
 * Based on Auto-Claude's AI PR Reviewer architecture.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// ============================================================================
// REVIEW CATEGORIES
// ============================================================================

const ReviewCategory = {
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  CODE_QUALITY: 'code_quality',
  REDUNDANCY: 'redundancy',
  TEST_COVERAGE: 'test_coverage',
  DOCUMENTATION: 'documentation',
  BEST_PRACTICES: 'best_practices',
  ARCHITECTURE: 'architecture',
};

const Severity = {
  CRITICAL: 'critical', // Must fix before merge
  HIGH: 'high', // Should fix before merge
  MEDIUM: 'medium', // Consider fixing
  LOW: 'low', // Suggestion
  INFO: 'info', // Informational
};

const Verdict = {
  APPROVE: 'approve',
  REQUEST_CHANGES: 'request_changes',
  COMMENT: 'comment',
};

// ============================================================================
// DIFF ANALYZER
// ============================================================================

class DiffAnalyzer {
  /**
   * Parse a unified diff into structured changes
   * @param {string} diff - Unified diff content
   * @returns {Array} Parsed changes
   */
  parseDiff(diff) {
    const files = [];
    const fileRegex = /^diff --git a\/(.+) b\/(.+)$/gm;
    const hunkRegex = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@(.*)$/gm;

    let currentFile = null;
    const lines = diff.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // New file
      if (line.startsWith('diff --git')) {
        if (currentFile) files.push(currentFile);
        const match = line.match(/diff --git a\/(.+) b\/(.+)/);
        currentFile = {
          path: match ? match[2] : 'unknown',
          hunks: [],
          additions: 0,
          deletions: 0,
          isNew: false,
          isDeleted: false,
          isBinary: false,
        };
      }

      // File metadata
      if (line.startsWith('new file')) {
        if (currentFile) currentFile.isNew = true;
      }
      if (line.startsWith('deleted file')) {
        if (currentFile) currentFile.isDeleted = true;
      }
      if (line.includes('Binary files')) {
        if (currentFile) currentFile.isBinary = true;
      }

      // Hunk header
      if (line.startsWith('@@')) {
        const match = line.match(/@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@(.*)/);
        if (match && currentFile) {
          currentFile.hunks.push({
            oldStart: parseInt(match[1]),
            oldCount: parseInt(match[2] || '1'),
            newStart: parseInt(match[3]),
            newCount: parseInt(match[4] || '1'),
            context: match[5] || '',
            lines: [],
          });
        }
      }

      // Diff lines
      if (currentFile && currentFile.hunks.length > 0) {
        const currentHunk = currentFile.hunks[currentFile.hunks.length - 1];
        if (line.startsWith('+') && !line.startsWith('+++')) {
          currentHunk.lines.push({ type: 'add', content: line.substring(1) });
          currentFile.additions++;
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          currentHunk.lines.push({ type: 'del', content: line.substring(1) });
          currentFile.deletions++;
        } else if (line.startsWith(' ')) {
          currentHunk.lines.push({ type: 'context', content: line.substring(1) });
        }
      }
    }

    if (currentFile) files.push(currentFile);
    return files;
  }

  /**
   * Extract added lines from parsed diff
   */
  getAddedLines(parsedDiff) {
    const added = [];
    for (const file of parsedDiff) {
      for (const hunk of file.hunks) {
        let lineNum = hunk.newStart;
        for (const line of hunk.lines) {
          if (line.type === 'add') {
            added.push({
              file: file.path,
              line: lineNum,
              content: line.content,
            });
          }
          if (line.type !== 'del') lineNum++;
        }
      }
    }
    return added;
  }

  /**
   * Get statistics from parsed diff
   */
  getStats(parsedDiff) {
    return {
      filesChanged: parsedDiff.length,
      additions: parsedDiff.reduce((sum, f) => sum + f.additions, 0),
      deletions: parsedDiff.reduce((sum, f) => sum + f.deletions, 0),
      newFiles: parsedDiff.filter((f) => f.isNew).length,
      deletedFiles: parsedDiff.filter((f) => f.isDeleted).length,
      binaryFiles: parsedDiff.filter((f) => f.isBinary).length,
    };
  }
}

// ============================================================================
// CODE ANALYZERS
// ============================================================================

class SecurityAnalyzer {
  constructor() {
    this.patterns = [
      // Secrets and credentials
      {
        regex: /(?:api[_-]?key|apikey|secret|password|token|auth)[\s]*[=:]\s*['"][^'"]+['"]/gi,
        message: 'Potential hardcoded credential',
        severity: Severity.CRITICAL,
      },
      {
        regex: /-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/g,
        message: 'Private key detected',
        severity: Severity.CRITICAL,
      },
      {
        regex: /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}/g,
        message: 'GitHub token detected',
        severity: Severity.CRITICAL,
      },

      // SQL Injection
      {
        regex: /(?:execute|query)\s*\(\s*[`'"].*\$\{/gi,
        message: 'Potential SQL injection via template literal',
        severity: Severity.HIGH,
      },
      {
        regex: /\.query\s*\(\s*['"`].*\+/gi,
        message: 'String concatenation in SQL query',
        severity: Severity.HIGH,
      },

      // XSS
      {
        regex: /innerHTML\s*=/gi,
        message: 'innerHTML assignment (XSS risk)',
        severity: Severity.MEDIUM,
      },
      {
        regex: /dangerouslySetInnerHTML/gi,
        message: 'dangerouslySetInnerHTML usage',
        severity: Severity.MEDIUM,
      },
      {
        regex: /document\.write\s*\(/gi,
        message: 'document.write usage',
        severity: Severity.MEDIUM,
      },

      // Command Injection
      {
        regex: /exec(?:Sync)?\s*\(\s*[`'"].*\$\{/gi,
        message: 'Potential command injection',
        severity: Severity.HIGH,
      },
      {
        regex: /spawn(?:Sync)?\s*\([^,]+,\s*\[.*\$\{/gi,
        message: 'Potential command injection in spawn',
        severity: Severity.HIGH,
      },

      // Insecure practices
      { regex: /eval\s*\(/gi, message: 'eval() usage', severity: Severity.HIGH },
      { regex: /new\s+Function\s*\(/gi, message: 'new Function() usage', severity: Severity.HIGH },
      {
        regex: /crypto\.createHash\s*\(\s*['"](?:md5|sha1)['"]/gi,
        message: 'Weak hash algorithm',
        severity: Severity.MEDIUM,
      },
      {
        regex: /Math\.random\s*\(\)/g,
        message: 'Math.random() for security-sensitive operation',
        severity: Severity.LOW,
      },
    ];
  }

  analyze(addedLines) {
    const findings = [];

    for (const { file, line, content } of addedLines) {
      for (const pattern of this.patterns) {
        if (pattern.regex.test(content)) {
          findings.push({
            category: ReviewCategory.SECURITY,
            file,
            line,
            content: content.trim(),
            message: pattern.message,
            severity: pattern.severity,
          });
        }
        // Reset regex lastIndex
        pattern.regex.lastIndex = 0;
      }
    }

    return findings;
  }
}

class PerformanceAnalyzer {
  constructor() {
    this.patterns = [
      // React performance
      {
        regex: /useEffect\s*\(\s*(?:async\s*)?\(\)\s*=>\s*\{[^}]*\},\s*\[\s*\]\s*\)/g,
        message: 'Empty useEffect dependency array',
        severity: Severity.LOW,
      },
      {
        regex: /\.map\s*\([^)]+\)\.filter\s*\(/g,
        message: 'Consider combining map().filter() into single iteration',
        severity: Severity.LOW,
      },
      {
        regex: /JSON\.parse\s*\(.*JSON\.stringify/g,
        message: 'Deep clone via JSON (consider structuredClone)',
        severity: Severity.LOW,
      },

      // Database
      {
        regex: /SELECT\s+\*/gi,
        message: 'SELECT * query (consider explicit columns)',
        severity: Severity.LOW,
      },
      {
        regex: /\.find\s*\(\s*\{\s*\}\s*\)/g,
        message: 'Empty find query (full collection scan)',
        severity: Severity.MEDIUM,
      },

      // General
      {
        regex: /for\s*\([^)]+\)\s*\{[^}]*await/gi,
        message: 'Await in loop (consider Promise.all)',
        severity: Severity.MEDIUM,
      },
      {
        regex: /\.forEach\s*\(\s*async/g,
        message: "Async forEach (doesn't await properly)",
        severity: Severity.HIGH,
      },
      {
        regex: /new\s+RegExp\s*\(/g,
        message: 'Dynamic RegExp creation (consider caching)',
        severity: Severity.LOW,
      },
    ];
  }

  analyze(addedLines) {
    const findings = [];

    for (const { file, line, content } of addedLines) {
      for (const pattern of this.patterns) {
        if (pattern.regex.test(content)) {
          findings.push({
            category: ReviewCategory.PERFORMANCE,
            file,
            line,
            content: content.trim(),
            message: pattern.message,
            severity: pattern.severity,
          });
        }
        pattern.regex.lastIndex = 0;
      }
    }

    return findings;
  }
}

class CodeQualityAnalyzer {
  constructor() {
    this.patterns = [
      // Error handling
      {
        regex: /catch\s*\(\s*\w*\s*\)\s*\{\s*\}/g,
        message: 'Empty catch block',
        severity: Severity.MEDIUM,
      },
      {
        regex: /catch\s*\(\s*\w+\s*\)\s*\{[^}]*console\.log/g,
        message: 'Only logging error in catch',
        severity: Severity.LOW,
      },

      // Code smells
      { regex: /TODO|FIXME|HACK|XXX/gi, message: 'TODO/FIXME comment', severity: Severity.INFO },
      {
        regex: /console\.(log|debug|info)\s*\(/g,
        message: 'Console statement (remove before merge)',
        severity: Severity.LOW,
      },
      { regex: /debugger;/g, message: 'Debugger statement', severity: Severity.MEDIUM },

      // TypeScript
      { regex: /:\s*any(?:\s|;|,|\)|\])/g, message: "Type 'any' usage", severity: Severity.LOW },
      { regex: /@ts-ignore/g, message: '@ts-ignore directive', severity: Severity.MEDIUM },
      { regex: /@ts-expect-error/g, message: '@ts-expect-error directive', severity: Severity.LOW },
      { regex: /as\s+any/g, message: 'Type assertion to any', severity: Severity.LOW },

      // Magic values
      {
        regex: /setTimeout\s*\([^,]+,\s*\d{4,}\s*\)/g,
        message: 'Magic number in setTimeout',
        severity: Severity.LOW,
      },
      {
        regex: /if\s*\([^)]+===?\s*(?:\d{2,}|['"][^'"]{10,}['"])\s*\)/g,
        message: 'Magic value in condition',
        severity: Severity.LOW,
      },
    ];
  }

  analyze(addedLines) {
    const findings = [];

    for (const { file, line, content } of addedLines) {
      for (const pattern of this.patterns) {
        if (pattern.regex.test(content)) {
          findings.push({
            category: ReviewCategory.CODE_QUALITY,
            file,
            line,
            content: content.trim(),
            message: pattern.message,
            severity: pattern.severity,
          });
        }
        pattern.regex.lastIndex = 0;
      }
    }

    return findings;
  }
}

class RedundancyAnalyzer {
  /**
   * Detect potential redundancy in changes
   */
  analyze(parsedDiff, codebaseContext = {}) {
    const findings = [];

    for (const file of parsedDiff) {
      // Check for duplicate code patterns within the same file
      const addedContent = file.hunks
        .flatMap((h) => h.lines.filter((l) => l.type === 'add').map((l) => l.content))
        .join('\n');

      // Similar function detection
      const funcMatches =
        addedContent.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/g) ||
        [];
      const funcNames = funcMatches
        .map((m) => {
          const match = m.match(/(?:function\s+(\w+)|const\s+(\w+))/);
          return match ? match[1] || match[2] : null;
        })
        .filter(Boolean);

      // Check for similar patterns that might indicate copy-paste
      if (funcNames.length > 1) {
        const similar = this.findSimilarNames(funcNames);
        if (similar.length > 0) {
          findings.push({
            category: ReviewCategory.REDUNDANCY,
            file: file.path,
            message: `Similar function names detected: ${similar.join(', ')}. Consider abstracting common logic.`,
            severity: Severity.LOW,
          });
        }
      }

      // Check for repeated imports
      const imports = addedContent.match(/^import\s+.+from\s+['"][^'"]+['"]/gm) || [];
      const importSources = imports.map((i) => i.match(/from\s+['"]([^'"]+)['"]/)?.[1]);
      const duplicateImports = importSources.filter((s, i) => importSources.indexOf(s) !== i);
      if (duplicateImports.length > 0) {
        findings.push({
          category: ReviewCategory.REDUNDANCY,
          file: file.path,
          message: `Duplicate imports from: ${[...new Set(duplicateImports)].join(', ')}`,
          severity: Severity.MEDIUM,
        });
      }
    }

    return findings;
  }

  findSimilarNames(names) {
    const similar = [];
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        if (this.isSimilar(names[i], names[j])) {
          similar.push(`${names[i]} / ${names[j]}`);
        }
      }
    }
    return similar;
  }

  isSimilar(a, b) {
    // Check for common prefixes/suffixes
    const minLen = Math.min(a.length, b.length);
    if (minLen < 4) return false;

    // Levenshtein-like similarity
    let matches = 0;
    for (let i = 0; i < minLen; i++) {
      if (a[i] === b[i]) matches++;
    }
    return matches / minLen > 0.7;
  }
}

// ============================================================================
// AI REVIEWER
// ============================================================================

class AIReviewer {
  constructor(config = {}) {
    this.maxTokens = config.maxTokens || 8000;
  }

  /**
   * Get AI review for complex changes
   * @param {Object} prData - PR data (title, description, diff)
   * @param {Array} staticFindings - Findings from static analysis
   * @returns {Promise<Object>} AI review
   */
  async review(prData, staticFindings) {
    const prompt = this.buildPrompt(prData, staticFindings);

    try {
      const response = await this.callClaude(prompt);
      return this.parseResponse(response);
    } catch (error) {
      return {
        summary: 'AI review failed',
        error: error.message,
        suggestions: [],
      };
    }
  }

  buildPrompt(prData, staticFindings) {
    const findingsSummary =
      staticFindings.length > 0
        ? `\n\n## Static Analysis Findings\n${staticFindings
            .slice(0, 20)
            .map((f) => `- [${f.severity}] ${f.file}:${f.line || 'N/A'} - ${f.message}`)
            .join('\n')}`
        : '';

    return `You are an expert code reviewer. Review this Pull Request and provide constructive feedback.

## PR Title
${prData.title}

## PR Description
${prData.description || 'No description provided'}

## Changes Summary
Files changed: ${prData.stats?.filesChanged || 'unknown'}
Additions: ${prData.stats?.additions || 'unknown'}
Deletions: ${prData.stats?.deletions || 'unknown'}

## Diff (truncated)
\`\`\`diff
${prData.diff?.substring(0, 6000) || 'No diff available'}
\`\`\`
${findingsSummary}

## Review Instructions
1. Analyze the changes for correctness, security, and best practices
2. Identify any potential issues not caught by static analysis
3. Suggest improvements
4. Provide an overall verdict (approve, request_changes, comment)

## Response Format
Respond with a JSON object:
{
  "verdict": "approve|request_changes|comment",
  "summary": "Brief summary of your review",
  "highlights": ["Good aspects of the PR"],
  "concerns": ["Issues that need attention"],
  "suggestions": [
    {
      "file": "path/to/file",
      "line": 123,
      "message": "Suggestion text",
      "severity": "high|medium|low"
    }
  ]
}`;
  }

  async callClaude(prompt) {
    return new Promise((resolve, reject) => {
      try {
        const result = execSync(
          `claude --print --dangerously-skip-permissions -p "${prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/`/g, '\\`')}"`,
          {
            encoding: 'utf8',
            maxBuffer: 10 * 1024 * 1024,
            timeout: 180000,
          }
        );
        resolve(result);
      } catch (error) {
        reject(new Error(`Claude CLI error: ${error.message}`));
      }
    });
  }

  parseResponse(response) {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // Fall through to default
      }
    }

    return {
      verdict: Verdict.COMMENT,
      summary: response.substring(0, 500),
      highlights: [],
      concerns: [],
      suggestions: [],
    };
  }
}

// ============================================================================
// PR REVIEW ENGINE
// ============================================================================

class PRReviewAI extends EventEmitter {
  constructor(config = {}) {
    super();

    this.rootPath = config.rootPath || process.cwd();
    this.enableAI = config.enableAI !== false;

    // Initialize analyzers
    this.diffAnalyzer = new DiffAnalyzer();
    this.securityAnalyzer = new SecurityAnalyzer();
    this.performanceAnalyzer = new PerformanceAnalyzer();
    this.codeQualityAnalyzer = new CodeQualityAnalyzer();
    this.redundancyAnalyzer = new RedundancyAnalyzer();
    this.aiReviewer = new AIReviewer(config);
  }

  /**
   * Review a Pull Request
   * @param {string|number} prNumber - PR number or URL
   * @param {Object} options - Review options
   * @returns {Promise<Object>} Review result
   */
  async reviewPR(prNumber, options = {}) {
    const startTime = Date.now();

    this.emit('review_started', { prNumber });

    try {
      // Step 1: Fetch PR data
      const prData = await this.fetchPRData(prNumber);
      this.emit('pr_fetched', { title: prData.title, author: prData.author });

      // Step 2: Parse diff
      const parsedDiff = this.diffAnalyzer.parseDiff(prData.diff);
      const stats = this.diffAnalyzer.getStats(parsedDiff);
      const addedLines = this.diffAnalyzer.getAddedLines(parsedDiff);

      prData.stats = stats;

      // Step 3: Static analysis
      this.emit('analyzing', { phase: 'static' });

      const staticFindings = [
        ...this.securityAnalyzer.analyze(addedLines),
        ...this.performanceAnalyzer.analyze(addedLines),
        ...this.codeQualityAnalyzer.analyze(addedLines),
        ...this.redundancyAnalyzer.analyze(parsedDiff),
      ];

      // Step 4: AI review (if enabled and PR is substantial)
      let aiReview = null;
      if (this.enableAI && stats.additions > 10) {
        this.emit('analyzing', { phase: 'ai' });
        aiReview = await this.aiReviewer.review(prData, staticFindings);
      }

      // Step 5: Generate final review
      const review = this.generateReview(prData, staticFindings, aiReview);

      review.duration = Date.now() - startTime;

      this.emit('review_completed', {
        verdict: review.verdict,
        findingsCount: review.findings.length,
      });

      // Step 6: Post review (if requested)
      if (options.postReview) {
        await this.postReview(prNumber, review);
      }

      // Step 7: Save report
      if (options.saveReport) {
        await this.saveReport(prNumber, review);
      }

      return review;
    } catch (error) {
      this.emit('review_error', { error: error.message });
      throw error;
    }
  }

  /**
   * Fetch PR data from GitHub
   */
  async fetchPRData(prNumber) {
    try {
      // Get PR info
      const prJson = execSync(
        `gh pr view ${prNumber} --json title,body,author,baseRefName,headRefName,files,additions,deletions`,
        {
          cwd: this.rootPath,
          encoding: 'utf8',
        }
      );
      const pr = JSON.parse(prJson);

      // Get diff
      const diff = execSync(`gh pr diff ${prNumber}`, {
        cwd: this.rootPath,
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024,
      });

      return {
        number: prNumber,
        title: pr.title,
        description: pr.body,
        author: pr.author?.login || 'unknown',
        baseBranch: pr.baseRefName,
        headBranch: pr.headRefName,
        files: pr.files || [],
        diff,
      };
    } catch (error) {
      throw new Error(`Failed to fetch PR ${prNumber}: ${error.message}`);
    }
  }

  /**
   * Generate final review from all analyses
   */
  generateReview(prData, staticFindings, aiReview) {
    // Determine verdict
    const criticalCount = staticFindings.filter((f) => f.severity === Severity.CRITICAL).length;
    const highCount = staticFindings.filter((f) => f.severity === Severity.HIGH).length;

    let verdict;
    if (criticalCount > 0) {
      verdict = Verdict.REQUEST_CHANGES;
    } else if (highCount > 2) {
      verdict = Verdict.REQUEST_CHANGES;
    } else if (aiReview?.verdict) {
      verdict = aiReview.verdict;
    } else if (highCount > 0 || staticFindings.length > 5) {
      verdict = Verdict.COMMENT;
    } else {
      verdict = Verdict.APPROVE;
    }

    // Build summary
    const summary = this.buildSummary(prData, staticFindings, aiReview, verdict);

    // Combine all suggestions
    const suggestions = [
      ...staticFindings.map((f) => ({
        file: f.file,
        line: f.line,
        category: f.category,
        severity: f.severity,
        message: f.message,
      })),
      ...(aiReview?.suggestions || []),
    ];

    return {
      prNumber: prData.number,
      prTitle: prData.title,
      author: prData.author,
      verdict,
      summary,
      stats: prData.stats,
      findings: staticFindings,
      aiReview,
      suggestions,
      highlights: aiReview?.highlights || [],
      concerns: [
        ...(aiReview?.concerns || []),
        ...staticFindings
          .filter((f) => f.severity === Severity.CRITICAL || f.severity === Severity.HIGH)
          .map((f) => f.message),
      ],
      reviewedAt: new Date().toISOString(),
    };
  }

  /**
   * Build review summary
   */
  buildSummary(prData, findings, aiReview, verdict) {
    const parts = [];

    // Stats
    parts.push(`**PR #${prData.number}**: ${prData.title}`);
    parts.push(
      `- Files: ${prData.stats?.filesChanged || 0} | +${prData.stats?.additions || 0} / -${prData.stats?.deletions || 0}`
    );

    // Verdict
    const verdictEmoji = {
      [Verdict.APPROVE]: '✅',
      [Verdict.REQUEST_CHANGES]: '❌',
      [Verdict.COMMENT]: '💬',
    };
    parts.push(`\n**Verdict**: ${verdictEmoji[verdict]} ${verdict.toUpperCase()}`);

    // Findings summary
    if (findings.length > 0) {
      const bySeverity = {};
      for (const f of findings) {
        bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
      }
      parts.push(`\n**Static Analysis**: ${findings.length} findings`);
      if (bySeverity.critical) parts.push(`  - 🔴 Critical: ${bySeverity.critical}`);
      if (bySeverity.high) parts.push(`  - 🟠 High: ${bySeverity.high}`);
      if (bySeverity.medium) parts.push(`  - 🟡 Medium: ${bySeverity.medium}`);
      if (bySeverity.low) parts.push(`  - 🔵 Low: ${bySeverity.low}`);
    }

    // AI summary
    if (aiReview?.summary) {
      parts.push(`\n**AI Review**: ${aiReview.summary}`);
    }

    return parts.join('\n');
  }

  /**
   * Post review to GitHub PR
   */
  async postReview(prNumber, review) {
    const body = this.formatReviewBody(review);

    try {
      // Post as PR comment
      execSync(`gh pr comment ${prNumber} --body "${body.replace(/"/g, '\\"')}"`, {
        cwd: this.rootPath,
        encoding: 'utf8',
      });

      // If requesting changes, also submit a review
      if (review.verdict === Verdict.REQUEST_CHANGES) {
        execSync(
          `gh pr review ${prNumber} --request-changes --body "Please address the issues found by the automated review."`,
          {
            cwd: this.rootPath,
            encoding: 'utf8',
          }
        );
      } else if (
        review.verdict === Verdict.APPROVE &&
        review.findings.filter((f) => f.severity === Severity.CRITICAL).length === 0
      ) {
        execSync(`gh pr review ${prNumber} --approve --body "LGTM! Automated review passed."`, {
          cwd: this.rootPath,
          encoding: 'utf8',
        });
      }

      this.emit('review_posted', { prNumber });
    } catch (error) {
      console.error('Failed to post review:', error.message);
    }
  }

  /**
   * Format review body for GitHub
   */
  formatReviewBody(review) {
    const lines = ['## 🤖 AI Code Review', '', review.summary, ''];

    // Top findings
    const criticalFindings = review.findings
      .filter((f) => f.severity === Severity.CRITICAL || f.severity === Severity.HIGH)
      .slice(0, 10);

    if (criticalFindings.length > 0) {
      lines.push('### Issues to Address');
      lines.push('');
      for (const f of criticalFindings) {
        const emoji = f.severity === Severity.CRITICAL ? '🔴' : '🟠';
        lines.push(`${emoji} **${f.file}${f.line ? `:${f.line}` : ''}**`);
        lines.push(`  ${f.message}`);
        lines.push('');
      }
    }

    // Highlights
    if (review.highlights.length > 0) {
      lines.push('### 👍 Highlights');
      for (const h of review.highlights) {
        lines.push(`- ${h}`);
      }
      lines.push('');
    }

    lines.push('---');
    lines.push('*Generated by AIOS PR Review AI*');

    return lines.join('\n');
  }

  /**
   * Save review report
   */
  async saveReport(prNumber, review) {
    const reportDir = path.join(this.rootPath, '.aios', 'reviews');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `pr-${prNumber}-review.json`);
    fs.writeFileSync(reportPath, JSON.stringify(review, null, 2));

    // Also save markdown report
    const mdPath = path.join(reportDir, `pr-${prNumber}-review.md`);
    fs.writeFileSync(mdPath, this.formatReviewBody(review));
  }

  /**
   * Review local changes (not yet in PR)
   */
  async reviewLocal(baseBranch = 'main') {
    const diff = execSync(`git diff ${baseBranch}...HEAD`, {
      cwd: this.rootPath,
      encoding: 'utf8',
    });

    const parsedDiff = this.diffAnalyzer.parseDiff(diff);
    const stats = this.diffAnalyzer.getStats(parsedDiff);
    const addedLines = this.diffAnalyzer.getAddedLines(parsedDiff);

    const findings = [
      ...this.securityAnalyzer.analyze(addedLines),
      ...this.performanceAnalyzer.analyze(addedLines),
      ...this.codeQualityAnalyzer.analyze(addedLines),
      ...this.redundancyAnalyzer.analyze(parsedDiff),
    ];

    return {
      stats,
      findings,
      verdict:
        findings.filter((f) => f.severity === Severity.CRITICAL).length > 0
          ? Verdict.REQUEST_CHANGES
          : Verdict.APPROVE,
    };
  }
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
PR Review AI - AI-powered Pull Request review

Usage:
  node pr-review-ai.js <pr-number> [options]
  node pr-review-ai.js --local [base-branch]

Options:
  --post          Post review to GitHub PR
  --save          Save review report locally
  --no-ai         Disable AI review (static analysis only)
  --local         Review local changes (not in PR)
  --help          Show this help

Examples:
  node pr-review-ai.js 123
  node pr-review-ai.js 123 --post --save
  node pr-review-ai.js --local main
`);
    process.exit(0);
  }

  const reviewer = new PRReviewAI({
    enableAI: !args.includes('--no-ai'),
  });

  // Event listeners
  reviewer.on('review_started', ({ prNumber }) => console.log(`\n🔍 Reviewing PR #${prNumber}...`));
  reviewer.on('pr_fetched', ({ title }) => console.log(`📋 Title: ${title}`));
  reviewer.on('analyzing', ({ phase }) => console.log(`⚙️  Running ${phase} analysis...`));
  reviewer.on('review_completed', ({ verdict, findingsCount }) => {
    console.log(`\n✅ Review complete: ${verdict} (${findingsCount} findings)`);
  });

  const options = {
    postReview: args.includes('--post'),
    saveReport: args.includes('--save'),
  };

  if (args.includes('--local')) {
    const baseBranch = args.find((a) => !a.startsWith('--') && a !== '--local') || 'main';
    reviewer
      .reviewLocal(baseBranch)
      .then((result) => {
        console.log('\n📊 Local Review Results:');
        console.log(`   Files changed: ${result.stats.filesChanged}`);
        console.log(`   Findings: ${result.findings.length}`);
        console.log(`   Verdict: ${result.verdict}`);
        if (result.findings.length > 0) {
          console.log('\n📝 Findings:');
          for (const f of result.findings.slice(0, 10)) {
            console.log(`   [${f.severity}] ${f.file}:${f.line || '?'} - ${f.message}`);
          }
        }
      })
      .catch((err) => {
        console.error('Error:', err.message);
        process.exit(1);
      });
  } else {
    const prNumber = args.find((a) => !a.startsWith('--'));
    if (!prNumber) {
      console.error('Error: PR number required');
      process.exit(1);
    }

    reviewer
      .reviewPR(prNumber, options)
      .then((review) => {
        console.log('\n' + review.summary);
      })
      .catch((err) => {
        console.error('Error:', err.message);
        process.exit(1);
      });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = PRReviewAI;
module.exports.PRReviewAI = PRReviewAI;
module.exports.DiffAnalyzer = DiffAnalyzer;
module.exports.SecurityAnalyzer = SecurityAnalyzer;
module.exports.PerformanceAnalyzer = PerformanceAnalyzer;
module.exports.CodeQualityAnalyzer = CodeQualityAnalyzer;
module.exports.RedundancyAnalyzer = RedundancyAnalyzer;
module.exports.AIReviewer = AIReviewer;
module.exports.ReviewCategory = ReviewCategory;
module.exports.Severity = Severity;
module.exports.Verdict = Verdict;
