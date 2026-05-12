#!/usr/bin/env node

/**
 * AIOX Gotchas Documenter
 *
 * Story: 7.4 - Gotchas Documenter
 * Epic: Epic 7 - Memory Layer
 *
 * Automatically extracts gotchas from session insights and consolidates
 * them into a searchable, categorized knowledge base.
 *
 * Features:
 * - AC1: Extracts gotchas from session insights automatically
 * - AC2: Generates `.aiox/gotchas.md` consolidated
 * - AC3: Format: Wrong, Right, Reason for each gotcha
 * - AC4: Categorized by area (API, Frontend, Database, etc.)
 * - AC5: Referenced by Self-Critique (Epic 4)
 * - AC6: Updated automatically after session insights
 * - AC7: Command `*list-gotchas` for quick lookup
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // Output paths
  outputPath: '.aiox/gotchas.md',
  outputJsonPath: '.aiox/gotchas.json',

  // Input paths for scanning
  insightsPaths: [
    'docs/stories/**/insights/*.json',
    'docs/stories/**/session-*.json',
    '.aiox/insights/*.json',
  ],

  // Version
  version: '1.0.0',

  // Schema version
  schemaVersion: 'aiox-gotchas-v1',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              ENUMS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Gotcha categories (AC4)
 */
const Category = {
  STATE_MANAGEMENT: 'State Management',
  API: 'API',
  DATABASE: 'Database',
  FRONTEND: 'Frontend/React',
  TESTING: 'Testing',
  BUILD_DEPLOY: 'Build/Deploy',
  TYPESCRIPT: 'TypeScript',
  AUTHENTICATION: 'Authentication',
  PERFORMANCE: 'Performance',
  SECURITY: 'Security',
  OTHER: 'Other',
};

/**
 * Severity levels
 */
const Severity = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

/**
 * Category keywords for auto-detection
 */
const CATEGORY_KEYWORDS = {
  [Category.STATE_MANAGEMENT]: [
    'zustand',
    'redux',
    'state',
    'store',
    'persist',
    'hydration',
    'context',
    'recoil',
    'jotai',
    'mobx',
  ],
  [Category.API]: [
    'fetch',
    'axios',
    'http',
    'endpoint',
    'rest',
    'graphql',
    'api',
    'request',
    'response',
    'cors',
  ],
  [Category.DATABASE]: [
    'sql',
    'postgres',
    'mysql',
    'mongodb',
    'prisma',
    'drizzle',
    'supabase',
    'query',
    'migration',
    'orm',
  ],
  [Category.FRONTEND]: [
    'react',
    'component',
    'hook',
    'useEffect',
    'useState',
    'render',
    'jsx',
    'tsx',
    'dom',
    'css',
    'tailwind',
    'nextjs',
    'next.js',
  ],
  [Category.TESTING]: [
    'test',
    'jest',
    'vitest',
    'mock',
    'stub',
    'expect',
    'assert',
    'coverage',
    'e2e',
    'playwright',
  ],
  [Category.BUILD_DEPLOY]: [
    'build',
    'deploy',
    'ci',
    'cd',
    'webpack',
    'vite',
    'docker',
    'vercel',
    'railway',
    'bundle',
  ],
  [Category.TYPESCRIPT]: [
    'typescript',
    'type',
    'interface',
    'generic',
    'infer',
    'as const',
    'satisfies',
    'enum',
    'tsconfig',
  ],
  [Category.AUTHENTICATION]: [
    'auth',
    'login',
    'logout',
    'session',
    'token',
    'jwt',
    'oauth',
    'password',
    'credential',
  ],
  [Category.PERFORMANCE]: [
    'performance',
    'memory',
    'leak',
    'optimization',
    'cache',
    'lazy',
    'debounce',
    'throttle',
    'memoize',
  ],
  [Category.SECURITY]: [
    'security',
    'xss',
    'csrf',
    'injection',
    'sanitize',
    'escape',
    'vulnerability',
    'encrypt',
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              GOTCHAS DOCUMENTER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

class GotchasDocumenter {
  /**
   * Create a new GotchasDocumenter instance
   *
   * @param {string} rootPath - Project root path
   * @param {Object} [options] - Configuration options
   * @param {string} [options.outputPath] - Custom output path for gotchas.md
   * @param {boolean} [options.quiet] - Suppress console output
   */
  constructor(rootPath, options = {}) {
    this.rootPath = rootPath || process.cwd();
    this.outputPath = options.outputPath || CONFIG.outputPath;
    this.quiet = options.quiet || false;

    // Initialize gotchas storage
    this.gotchas = new Map(); // id -> gotcha
    this.byCategory = new Map(); // category -> gotcha[]
    this.byStory = new Map(); // storyId -> gotcha[]

    // Statistics
    this.stats = {
      insightsScanned: 0,
      gotchasExtracted: 0,
      gotchasDeduplicated: 0,
      categoriesFound: 0,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              COLLECTION METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Scan all insights files for gotchas (AC1)
   *
   * @returns {Promise<number>} Number of insights files scanned
   */
  async scanInsightsFiles() {
    const insightsFiles = [];

    // Find all insights files using glob patterns
    for (const pattern of CONFIG.insightsPaths) {
      const files = this._findFiles(pattern);
      insightsFiles.push(...files);
    }

    // Remove duplicates
    const uniqueFiles = [...new Set(insightsFiles)];

    this._log(`Found ${uniqueFiles.length} insights files to scan`);

    // Process each file
    for (const filePath of uniqueFiles) {
      try {
        const gotchas = await this.extractGotchas(filePath);
        this.stats.insightsScanned++;

        if (gotchas.length > 0) {
          this._log(`  Extracted ${gotchas.length} gotchas from ${path.basename(filePath)}`);
        }
      } catch (error) {
        this._log(`  Warning: Failed to process ${filePath}: ${error.message}`, 'warn');
      }
    }

    return this.stats.insightsScanned;
  }

  /**
   * Extract gotchas from a single insights file (AC1)
   *
   * @param {string} insightsFile - Path to insights JSON file
   * @returns {Object[]} Array of extracted gotchas
   */
  async extractGotchas(insightsFile) {
    const absolutePath = path.isAbsolute(insightsFile)
      ? insightsFile
      : path.join(this.rootPath, insightsFile);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Insights file not found: ${absolutePath}`);
    }

    const content = fs.readFileSync(absolutePath, 'utf-8');
    const insights = JSON.parse(content);
    const extractedGotchas = [];

    // Extract from gotchasFound array (standard schema)
    if (insights.gotchasFound && Array.isArray(insights.gotchasFound)) {
      for (const gotcha of insights.gotchasFound) {
        const normalized = this._normalizeGotcha(gotcha, insights);
        if (normalized) {
          extractedGotchas.push(normalized);
          this._addGotcha(normalized);
        }
      }
    }

    // Extract from discoveries that look like gotchas
    if (insights.discoveries && Array.isArray(insights.discoveries)) {
      for (const discovery of insights.discoveries) {
        if (this._isGotchaLike(discovery)) {
          const gotcha = this._discoveryToGotcha(discovery, insights);
          if (gotcha) {
            extractedGotchas.push(gotcha);
            this._addGotcha(gotcha);
          }
        }
      }
    }

    // Extract from patternsLearned that include gotcha aspects
    if (insights.patternsLearned && Array.isArray(insights.patternsLearned)) {
      for (const pattern of insights.patternsLearned) {
        if (pattern.antiPattern || pattern.wrong) {
          const gotcha = this._patternToGotcha(pattern, insights);
          if (gotcha) {
            extractedGotchas.push(gotcha);
            this._addGotcha(gotcha);
          }
        }
      }
    }

    this.stats.gotchasExtracted += extractedGotchas.length;
    return extractedGotchas;
  }

  /**
   * Deduplicate gotchas based on content similarity
   *
   * @returns {number} Number of duplicates removed
   */
  deduplicateGotchas() {
    const initialCount = this.gotchas.size;
    const seen = new Map(); // hash -> gotchaId

    for (const [id, gotcha] of this.gotchas) {
      const hash = this._generateGotchaHash(gotcha);

      if (seen.has(hash)) {
        // Merge with existing, keeping the more recent one
        const existingId = seen.get(hash);
        const existing = this.gotchas.get(existingId);

        if (new Date(gotcha.discoveredAt) > new Date(existing.discoveredAt)) {
          // Replace with newer
          this.gotchas.delete(existingId);
          this.gotchas.set(id, gotcha);
          seen.set(hash, id);
        } else {
          // Remove duplicate
          this.gotchas.delete(id);
        }
      } else {
        seen.set(hash, id);
      }
    }

    const removed = initialCount - this.gotchas.size;
    this.stats.gotchasDeduplicated = removed;

    // Rebuild category index
    this._rebuildCategoryIndex();

    return removed;
  }

  /**
   * Categorize gotchas by area (AC4)
   *
   * @returns {Map<string, Object[]>} Gotchas by category
   */
  categorizeGotchas() {
    // Clear and rebuild category index
    this._rebuildCategoryIndex();
    this.stats.categoriesFound = this.byCategory.size;
    return this.byCategory;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              OUTPUT METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Generate markdown output (AC2, AC3)
   *
   * @returns {string} Markdown content for gotchas.md
   */
  generateMarkdown() {
    const categories = this.categorizeGotchas();
    const now = new Date().toISOString();

    let md = `# Known Gotchas

> Auto-generated from session insights
> Last updated: ${now}
> Total gotchas: ${this.gotchas.size}

This document contains common pitfalls and their solutions discovered during development.
Each gotcha includes the **wrong** approach, the **right** approach, and the **reason** why.

---

## Table of Contents

`;

    // Generate TOC
    for (const category of Object.values(Category)) {
      if (categories.has(category)) {
        const count = categories.get(category).length;
        const anchor = this._toAnchor(category);
        md += `- [${category}](#${anchor}) (${count})\n`;
      }
    }

    md += '\n---\n\n';

    // Generate content for each category
    for (const category of Object.values(Category)) {
      if (!categories.has(category)) continue;

      const gotchasList = categories.get(category);
      if (gotchasList.length === 0) continue;

      md += `## ${category}\n\n`;

      // Sort by severity (high first), then by date (recent first)
      const sorted = [...gotchasList].sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        const severityDiff = (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2);
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.discoveredAt) - new Date(a.discoveredAt);
      });

      for (const gotcha of sorted) {
        md += this._renderGotcha(gotcha);
      }
    }

    // Add statistics section
    md += `---

## Statistics

| Metric | Value |
|--------|-------|
| Total Gotchas | ${this.gotchas.size} |
| Categories | ${this.stats.categoriesFound} |
| Insights Scanned | ${this.stats.insightsScanned} |
| Duplicates Merged | ${this.stats.gotchasDeduplicated} |

---

*Generated by AIOX Gotchas Documenter v${CONFIG.version}*
`;

    return md;
  }

  /**
   * Save gotchas to file (AC2)
   *
   * @param {string} [outputPath] - Custom output path
   * @returns {string} Path to saved file
   */
  saveGotchas(outputPath) {
    const markdown = this.generateMarkdown();
    const savePath = outputPath
      ? path.isAbsolute(outputPath)
        ? outputPath
        : path.join(this.rootPath, outputPath)
      : path.join(this.rootPath, this.outputPath);

    // Ensure directory exists
    const dir = path.dirname(savePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(savePath, markdown, 'utf-8');
    this._log(`Saved gotchas to: ${savePath}`);

    // Also save JSON version
    const jsonPath = savePath.replace('.md', '.json');
    fs.writeFileSync(jsonPath, JSON.stringify(this.toJSON(), null, 2), 'utf-8');
    this._log(`Saved JSON to: ${jsonPath}`);

    return savePath;
  }

  /**
   * Merge with existing gotchas file
   *
   * @param {string} existingPath - Path to existing gotchas.json
   * @returns {number} Number of new gotchas added
   */
  mergeWithExisting(existingPath) {
    const absolutePath = path.isAbsolute(existingPath)
      ? existingPath
      : path.join(this.rootPath, existingPath);

    if (!fs.existsSync(absolutePath)) {
      this._log('No existing gotchas file found, creating new');
      return this.gotchas.size;
    }

    try {
      const content = fs.readFileSync(absolutePath, 'utf-8');
      const existing = JSON.parse(content);

      // Add existing gotchas
      const initialCount = this.gotchas.size;

      if (existing.gotchas && Array.isArray(existing.gotchas)) {
        for (const gotcha of existing.gotchas) {
          this._addGotcha(gotcha);
        }
      }

      // Deduplicate after merge
      this.deduplicateGotchas();

      const newCount = this.gotchas.size - initialCount;
      this._log(`Merged with existing: ${newCount} new gotchas added`);

      return newCount;
    } catch (error) {
      this._log(`Warning: Failed to merge with existing: ${error.message}`, 'warn');
      return 0;
    }
  }

  /**
   * Convert to JSON schema (AC6)
   *
   * @returns {Object} JSON schema for gotchas
   */
  toJSON() {
    const categories = this.categorizeGotchas();

    return {
      schema: CONFIG.schemaVersion,
      version: CONFIG.version,
      generatedAt: new Date().toISOString(),
      statistics: {
        total: this.gotchas.size,
        bySeverity: {
          high: [...this.gotchas.values()].filter((g) => g.severity === Severity.HIGH).length,
          medium: [...this.gotchas.values()].filter((g) => g.severity === Severity.MEDIUM).length,
          low: [...this.gotchas.values()].filter((g) => g.severity === Severity.LOW).length,
        },
        byCategory: Object.fromEntries(
          [...categories.entries()].map(([cat, items]) => [cat, items.length])
        ),
        insightsScanned: this.stats.insightsScanned,
      },
      gotchas: [...this.gotchas.values()],
      categories: Object.fromEntries(categories),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              QUERY METHODS (AC7)
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * List gotchas by category
   *
   * @param {string} category - Category name
   * @returns {Object[]} Gotchas in category
   */
  listByCategory(category) {
    const normalizedCategory = this._normalizeCategory(category);
    return this.byCategory.get(normalizedCategory) || [];
  }

  /**
   * List gotchas by severity
   *
   * @param {string} severity - Severity level (high, medium, low)
   * @returns {Object[]} Gotchas with severity
   */
  listBySeverity(severity) {
    const normalizedSeverity = severity.toLowerCase();
    return [...this.gotchas.values()].filter((g) => g.severity === normalizedSeverity);
  }

  /**
   * Search gotchas by query string
   *
   * @param {string} query - Search query
   * @returns {Object[]} Matching gotchas
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    return [...this.gotchas.values()].filter((gotcha) => {
      const searchText = [
        gotcha.title || '',
        gotcha.wrong || '',
        gotcha.right || '',
        gotcha.reason || '',
        gotcha.category || '',
      ]
        .join(' ')
        .toLowerCase();

      return searchText.includes(lowerQuery);
    });
  }

  /**
   * Get all gotchas
   *
   * @returns {Object[]} All gotchas
   */
  getAll() {
    return [...this.gotchas.values()];
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              PRIVATE HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Find files matching glob pattern (simplified implementation)
   * @private
   */
  _findFiles(pattern) {
    const files = [];

    // Convert glob to regex-ish pattern
    const parts = pattern.split('/');
    const basePath = this.rootPath;

    const search = (currentPath, patternParts) => {
      if (patternParts.length === 0) return;

      const currentPattern = patternParts[0];
      const remaining = patternParts.slice(1);

      if (currentPattern === '**') {
        // Recursive search
        if (fs.existsSync(currentPath) && fs.statSync(currentPath).isDirectory()) {
          const entries = fs.readdirSync(currentPath, { withFileTypes: true });

          for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);

            if (entry.isDirectory()) {
              // Continue recursive search
              search(fullPath, patternParts);
              // Also try next pattern at this level
              search(fullPath, remaining);
            } else if (entry.isFile() && remaining.length === 0) {
              files.push(fullPath);
            }
          }
        }
      } else if (currentPattern.includes('*')) {
        // Wildcard pattern
        const regex = new RegExp('^' + currentPattern.replace(/\*/g, '.*') + '$');

        if (fs.existsSync(currentPath) && fs.statSync(currentPath).isDirectory()) {
          const entries = fs.readdirSync(currentPath, { withFileTypes: true });

          for (const entry of entries) {
            if (regex.test(entry.name)) {
              const fullPath = path.join(currentPath, entry.name);

              if (remaining.length === 0) {
                if (entry.isFile()) {
                  files.push(fullPath);
                }
              } else if (entry.isDirectory()) {
                search(fullPath, remaining);
              }
            }
          }
        }
      } else {
        // Exact match
        const fullPath = path.join(currentPath, currentPattern);

        if (fs.existsSync(fullPath)) {
          if (remaining.length === 0) {
            if (fs.statSync(fullPath).isFile()) {
              files.push(fullPath);
            }
          } else if (fs.statSync(fullPath).isDirectory()) {
            search(fullPath, remaining);
          }
        }
      }
    };

    search(basePath, parts);
    return files;
  }

  /**
   * Normalize gotcha from raw insight data
   * @private
   */
  _normalizeGotcha(raw, insights) {
    if (!raw || (!raw.wrong && !raw.right && !raw.reason && !raw.description)) {
      return null;
    }

    const id = this._generateGotchaId(raw, insights);
    const category = raw.category
      ? this._normalizeCategory(raw.category)
      : this._detectCategory(raw);

    return {
      id,
      title: raw.title || this._generateTitle(raw),
      category,
      wrong: raw.wrong || raw.antiPattern || '',
      right: raw.right || raw.correctPattern || raw.pattern || '',
      reason: raw.reason || raw.explanation || raw.description || '',
      severity: this._normalizeSeverity(raw.severity),
      discoveredAt: raw.discoveredAt || insights.capturedAt || new Date().toISOString(),
      storyId: insights.storyId || null,
      relatedFiles: raw.relatedFiles || [],
      tags: raw.tags || [],
    };
  }

  /**
   * Check if a discovery looks like a gotcha
   * @private
   */
  _isGotchaLike(discovery) {
    const text = `${discovery.description || ''} ${discovery.content || ''}`.toLowerCase();
    return (
      text.includes('pitfall') ||
      text.includes('gotcha') ||
      text.includes('wrong') ||
      text.includes('avoid') ||
      text.includes('don\'t') ||
      text.includes('should not') ||
      text.includes('instead of') ||
      text.includes('common mistake')
    );
  }

  /**
   * Convert a discovery to a gotcha
   * @private
   */
  _discoveryToGotcha(discovery, insights) {
    return this._normalizeGotcha(
      {
        description: discovery.description,
        category: discovery.category,
        relatedFiles: discovery.relatedFiles,
        severity: discovery.relevance === 'high' ? Severity.HIGH : Severity.MEDIUM,
      },
      insights
    );
  }

  /**
   * Convert a pattern to a gotcha
   * @private
   */
  _patternToGotcha(pattern, insights) {
    return this._normalizeGotcha(
      {
        title: pattern.name,
        wrong: pattern.antiPattern || pattern.wrong || '',
        right: pattern.example || pattern.pattern || pattern.right || '',
        reason: pattern.description || pattern.reason || '',
        category: this._detectCategory(pattern),
        severity: Severity.MEDIUM,
      },
      insights
    );
  }

  /**
   * Add gotcha to storage
   * @private
   */
  _addGotcha(gotcha) {
    if (!gotcha || !gotcha.id) return;

    this.gotchas.set(gotcha.id, gotcha);

    // Index by category
    if (!this.byCategory.has(gotcha.category)) {
      this.byCategory.set(gotcha.category, []);
    }
    this.byCategory.get(gotcha.category).push(gotcha);

    // Index by story
    if (gotcha.storyId) {
      if (!this.byStory.has(gotcha.storyId)) {
        this.byStory.set(gotcha.storyId, []);
      }
      this.byStory.get(gotcha.storyId).push(gotcha);
    }
  }

  /**
   * Rebuild category index
   * @private
   */
  _rebuildCategoryIndex() {
    this.byCategory.clear();

    for (const gotcha of this.gotchas.values()) {
      const category = gotcha.category || Category.OTHER;

      if (!this.byCategory.has(category)) {
        this.byCategory.set(category, []);
      }
      this.byCategory.get(category).push(gotcha);
    }
  }

  /**
   * Generate unique gotcha ID
   * @private
   */
  _generateGotchaId(gotcha, insights) {
    const content = `${gotcha.wrong || ''}${gotcha.right || ''}${gotcha.reason || ''}`;
    const hash = this._simpleHash(content);
    const storyPart = insights.storyId ? `-${insights.storyId}` : '';
    return `gotcha${storyPart}-${hash}`;
  }

  /**
   * Generate hash for deduplication
   * @private
   */
  _generateGotchaHash(gotcha) {
    const content = `${gotcha.wrong || ''}${gotcha.right || ''}`.toLowerCase().replace(/\s+/g, '');
    return this._simpleHash(content);
  }

  /**
   * Simple hash function
   * @private
   */
  _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }

  /**
   * Detect category from gotcha content
   * @private
   */
  _detectCategory(gotcha) {
    const text = `${gotcha.wrong || ''} ${gotcha.right || ''} ${gotcha.reason || ''} ${gotcha.description || ''} ${gotcha.title || ''}`.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }

    return Category.OTHER;
  }

  /**
   * Normalize category name
   * @private
   */
  _normalizeCategory(category) {
    if (!category) return Category.OTHER;

    const lower = category.toLowerCase();

    // Direct match
    for (const cat of Object.values(Category)) {
      if (cat.toLowerCase() === lower) {
        return cat;
      }
    }

    // Keyword-based match
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lower.includes(keyword.toLowerCase())) {
          return cat;
        }
      }
    }

    return Category.OTHER;
  }

  /**
   * Normalize severity level
   * @private
   */
  _normalizeSeverity(severity) {
    if (!severity) return Severity.MEDIUM;

    const lower = severity.toLowerCase();
    if (lower === 'high' || lower === 'critical') return Severity.HIGH;
    if (lower === 'low' || lower === 'minor') return Severity.LOW;
    return Severity.MEDIUM;
  }

  /**
   * Generate title from gotcha content
   * @private
   */
  _generateTitle(gotcha) {
    const reason = gotcha.reason || gotcha.description || '';
    if (reason.length > 0) {
      // Take first sentence or first 60 chars
      const firstSentence = reason.split(/[.!?]/)[0];
      return firstSentence.length > 60 ? firstSentence.substring(0, 57) + '...' : firstSentence;
    }
    return 'Untitled Gotcha';
  }

  /**
   * Convert string to anchor link
   * @private
   */
  _toAnchor(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Render a single gotcha as markdown (AC3)
   * @private
   */
  _renderGotcha(gotcha) {
    const severityEmoji =
      {
        high: '**[HIGH]**',
        medium: '**[MEDIUM]**',
        low: '[LOW]',
      }[gotcha.severity] || '';

    let md = `### ${gotcha.title}\n\n`;
    md += `${severityEmoji}\n\n`;

    if (gotcha.wrong) {
      md += `**Wrong:**\n\`\`\`typescript\n${gotcha.wrong}\n\`\`\`\n\n`;
    }

    if (gotcha.right) {
      md += `**Right:**\n\`\`\`typescript\n${gotcha.right}\n\`\`\`\n\n`;
    }

    if (gotcha.reason) {
      md += `**Reason:** ${gotcha.reason}\n\n`;
    }

    md += `**Severity:** ${gotcha.severity.charAt(0).toUpperCase() + gotcha.severity.slice(1)}\n\n`;

    if (gotcha.storyId) {
      const date = gotcha.discoveredAt
        ? new Date(gotcha.discoveredAt).toISOString().split('T')[0]
        : 'Unknown';
      md += `**Discovered:** ${gotcha.storyId} (${date})\n\n`;
    }

    if (gotcha.relatedFiles && gotcha.relatedFiles.length > 0) {
      md += `**Related Files:** ${gotcha.relatedFiles.join(', ')}\n\n`;
    }

    md += '---\n\n';
    return md;
  }

  /**
   * Log message
   * @private
   */
  _log(message, level = 'info') {
    if (this.quiet) return;

    const prefix = {
      info: '',
      warn: '\x1b[33m[WARN]\x1b[0m ',
      error: '\x1b[31m[ERROR]\x1b[0m ',
    }[level];

    console.log(`${prefix}${message}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              STATIC METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * CLI main function
   */
  static async main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
      GotchasDocumenter.showHelp();
      process.exit(0);
    }

    // Parse arguments
    let command = 'update';
    let rootPath = process.cwd();
    let outputPath = null;
    let severity = null;
    let category = null;
    let format = 'md';
    let quiet = false;
    let query = null;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === '--root' && args[i + 1]) {
        rootPath = args[++i];
      } else if (arg === '--output' && args[i + 1]) {
        outputPath = args[++i];
      } else if (arg === '--severity' && args[i + 1]) {
        severity = args[++i];
      } else if (arg === '--category' && args[i + 1]) {
        category = args[++i];
      } else if (arg === '--format' && args[i + 1]) {
        format = args[++i];
      } else if (arg === '--quiet' || arg === '-q') {
        quiet = true;
      } else if (!arg.startsWith('-')) {
        if (['update', 'list', 'search', 'category'].includes(arg)) {
          command = arg;
        } else if (command === 'search' || command === 'category') {
          query = arg;
        }
      }
    }

    try {
      const documenter = new GotchasDocumenter(rootPath, { outputPath, quiet });

      switch (command) {
        case 'update': {
          // Merge with existing if present
          const existingJson = path.join(rootPath, CONFIG.outputJsonPath);
          documenter.mergeWithExisting(existingJson);

          // Scan and extract
          await documenter.scanInsightsFiles();
          documenter.deduplicateGotchas();

          // Save
          const savedPath = documenter.saveGotchas(outputPath);

          if (!quiet) {
            console.log(`\nGotchas updated: ${savedPath}`);
            console.log(`Total: ${documenter.gotchas.size} gotchas`);
          }
          break;
        }

        case 'list': {
          // Load existing
          const existingJson = path.join(rootPath, CONFIG.outputJsonPath);
          documenter.mergeWithExisting(existingJson);

          let gotchas = documenter.getAll();

          // Filter by severity if specified
          if (severity) {
            gotchas = documenter.listBySeverity(severity);
          }

          // Output
          if (format === 'json') {
            console.log(JSON.stringify(gotchas, null, 2));
          } else {
            console.log(`\n=== Known Gotchas (${gotchas.length}) ===\n`);
            for (const gotcha of gotchas) {
              console.log(`[${gotcha.severity.toUpperCase()}] ${gotcha.title}`);
              console.log(`  Category: ${gotcha.category}`);
              if (gotcha.storyId) console.log(`  Story: ${gotcha.storyId}`);
              console.log('');
            }
          }
          break;
        }

        case 'search': {
          if (!query) {
            console.error('Error: Search query required');
            process.exit(1);
          }

          // Load existing
          const existingJson = path.join(rootPath, CONFIG.outputJsonPath);
          documenter.mergeWithExisting(existingJson);

          const results = documenter.search(query);

          if (format === 'json') {
            console.log(JSON.stringify(results, null, 2));
          } else {
            console.log(`\n=== Search Results for "${query}" (${results.length}) ===\n`);
            for (const gotcha of results) {
              console.log(`[${gotcha.severity.toUpperCase()}] ${gotcha.title}`);
              console.log(`  ${gotcha.reason.substring(0, 100)}...`);
              console.log('');
            }
          }
          break;
        }

        case 'category': {
          if (!query && !category) {
            console.error('Error: Category name required');
            process.exit(1);
          }

          // Load existing
          const existingJson = path.join(rootPath, CONFIG.outputJsonPath);
          documenter.mergeWithExisting(existingJson);

          const catResults = documenter.listByCategory(category || query);

          if (format === 'json') {
            console.log(JSON.stringify(catResults, null, 2));
          } else {
            console.log(`\n=== ${category || query} Gotchas (${catResults.length}) ===\n`);
            for (const gotcha of catResults) {
              console.log(`[${gotcha.severity.toUpperCase()}] ${gotcha.title}`);
              if (gotcha.reason) console.log(`  ${gotcha.reason.substring(0, 100)}...`);
              console.log('');
            }
          }
          break;
        }

        default:
          console.error(`Unknown command: ${command}`);
          process.exit(1);
      }
    } catch (error) {
      console.error(`\nError: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Show CLI help
   */
  static showHelp() {
    console.log(`
Gotchas Documenter - AIOX Memory Layer (Story 7.4)

Automatically extracts gotchas from session insights and consolidates
them into a searchable, categorized knowledge base.

Usage:
  node gotchas-documenter.js [command] [options]
  *list-gotchas [command] [options]

Commands:
  update          Update gotchas from all insights (default)
  list            List all gotchas
  search <query>  Search gotchas
  category <cat>  List by category

Options:
  --root <path>      Project root (default: cwd)
  --output <path>    Custom output path
  --severity <s>     Filter by severity (high, medium, low)
  --format <f>       Output format (md, json)
  --quiet, -q        Suppress output
  --help, -h         Show this help message

Categories:
  - State Management
  - API
  - Database
  - Frontend/React
  - Testing
  - Build/Deploy
  - TypeScript
  - Authentication
  - Performance
  - Security
  - Other

Examples:
  node gotchas-documenter.js update
  node gotchas-documenter.js list --severity high
  node gotchas-documenter.js search "zustand persist"
  node gotchas-documenter.js category TypeScript
  node gotchas-documenter.js list --format json > gotchas.json

Acceptance Criteria Coverage:
  AC1: Extracts gotchas from session insights automatically
  AC2: Generates .aiox/gotchas.md consolidated
  AC3: Format: Wrong, Right, Reason for each gotcha
  AC4: Categorized by area (API, Frontend, Database, etc.)
  AC5: Referenced by Self-Critique (Epic 4)
  AC6: Updated automatically after session insights
  AC7: Command *list-gotchas for quick lookup
`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Quick helper to update gotchas
 *
 * @param {string} rootPath - Project root path
 * @param {Object} options - Options
 * @returns {Promise<string>} Path to saved gotchas file
 */
async function updateGotchas(rootPath, options = {}) {
  const documenter = new GotchasDocumenter(rootPath, options);

  // Merge with existing
  const existingJson = path.join(rootPath, CONFIG.outputJsonPath);
  documenter.mergeWithExisting(existingJson);

  // Scan and extract
  await documenter.scanInsightsFiles();
  documenter.deduplicateGotchas();

  // Save
  return documenter.saveGotchas(options.outputPath);
}

/**
 * Get gotchas for self-critique integration (AC5)
 *
 * @param {string} rootPath - Project root path
 * @param {string} [category] - Filter by category
 * @returns {Object[]} Gotchas for self-critique
 */
function getGotchasForSelfCritique(rootPath, category = null) {
  const documenter = new GotchasDocumenter(rootPath, { quiet: true });

  // Load existing
  const existingJson = path.join(rootPath, CONFIG.outputJsonPath);
  documenter.mergeWithExisting(existingJson);

  if (category) {
    return documenter.listByCategory(category);
  }

  return documenter.getAll();
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  GotchasDocumenter,
  // Enums
  Category,
  Severity,
  // Helper functions
  updateGotchas,
  getGotchasForSelfCritique,
  // Config
  CONFIG,
};

// Run CLI if executed directly
if (require.main === module) {
  GotchasDocumenter.main();
}
