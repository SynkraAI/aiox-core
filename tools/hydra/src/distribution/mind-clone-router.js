/**
 * @module mind-clone-router
 * @description Content Router (Story 5.1) — Routes processed content to mind clones
 * and projects based on keyword matching, department alignment, and tier bonuses.
 *
 * Routing algorithm:
 *   score = (keyword_hits * 0.6) + (department_match * 0.3) + (tier_bonus * 0.1)
 *   Filter: score >= min_relevance_score (default 0.3)
 *   Limit: max_clones_per_item (default 10)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {Object} RoutedClone
 * @property {string} id - Clone ID
 * @property {string} department - Department
 * @property {string} source - "mega-brain" or "aios"
 * @property {number} relevanceScore - 0.0-1.0
 * @property {string[]} matchedKeywords - Keywords that caused the match
 */

/**
 * @typedef {Object} ContentRouteResult
 * @property {string} contentId
 * @property {RoutedClone[]} targetClones - Clones that should receive content
 * @property {string[]} targetProjects - Projects benefited
 * @property {'urgent'|'normal'|'low'} priority - Based on tier
 */

/**
 * Load routing config.
 * @param {string} [configDir]
 * @returns {Object}
 */
function loadRoutingConfig(configDir) {
  const dir = configDir || path.resolve(__dirname, '../config');
  const filePath = path.join(dir, 'routing.yaml');
  if (!fs.existsSync(filePath)) {
    return { routing: {} };
  }
  return yaml.load(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Load mind clone index from .aios-core/data.
 * @param {string} [indexPath]
 * @returns {Array}
 */
function loadMindCloneIndex(indexPath) {
  const defaultPath = indexPath || path.resolve(__dirname, '../../../.aios-core/data/jarvis-mind-clone-index.json');
  if (!fs.existsSync(defaultPath)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(defaultPath, 'utf-8'));
  } catch {
    return [];
  }
}

/**
 * Load domains config.
 * @param {string} [configDir]
 * @returns {Object}
 */
function loadDomainsConfig(configDir) {
  const dir = configDir || path.resolve(__dirname, '../config');
  const filePath = path.join(dir, 'domains.yaml');
  if (!fs.existsSync(filePath)) {
    return { domains: {} };
  }
  return yaml.load(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Load mind clone map for project overrides.
 * @param {string} [mapPath]
 * @returns {Object}
 */
function loadMindCloneMap(mapPath) {
  const defaultPath = mapPath || path.resolve(__dirname, '../../../.aios-core/data/jarvis-mind-clone-map.yaml');
  if (!fs.existsSync(defaultPath)) {
    return {};
  }
  try {
    return yaml.load(fs.readFileSync(defaultPath, 'utf-8'));
  } catch {
    return {};
  }
}

/**
 * Normalize a string for keyword comparison.
 * @param {string} str
 * @returns {string}
 */
function normalizeKeyword(str) {
  return (str || '').toLowerCase().trim();
}

/**
 * Calculate keyword overlap between content tags/entities and a clone's keywords.
 * @param {string[]} contentKeywords - Tags, entities, domains from content
 * @param {string[]} cloneKeywords - Keywords from clone index
 * @returns {{ hits: number, matched: string[], ratio: number }}
 */
function calculateKeywordOverlap(contentKeywords, cloneKeywords) {
  if (!cloneKeywords || cloneKeywords.length === 0 || !contentKeywords || contentKeywords.length === 0) {
    return { hits: 0, matched: [], ratio: 0 };
  }

  const normalizedCloneKw = cloneKeywords.map(normalizeKeyword).filter(Boolean);
  const normalizedContentKw = contentKeywords.map(normalizeKeyword).filter(Boolean);
  const matched = [];

  for (const ckw of normalizedContentKw) {
    for (const mkw of normalizedCloneKw) {
      if (ckw === mkw || ckw.includes(mkw) || mkw.includes(ckw)) {
        if (!matched.includes(mkw)) {
          matched.push(mkw);
        }
        break;
      }
    }
  }

  const ratio = normalizedCloneKw.length > 0 ? matched.length / normalizedCloneKw.length : 0;
  return { hits: matched.length, matched, ratio: Math.min(ratio, 1) };
}

/**
 * Check if a clone's department aligns with the content's domains.
 * @param {string} cloneDepartment
 * @param {string[]} contentDomains
 * @param {Object} domainsConfig
 * @returns {boolean}
 */
function departmentMatchesDomains(cloneDepartment, contentDomains, domainsConfig) {
  if (!cloneDepartment || !contentDomains || contentDomains.length === 0) {
    return false;
  }

  const normalizedDept = normalizeKeyword(cloneDepartment);
  const domains = domainsConfig?.domains || {};

  // Direct match: department name equals a domain
  for (const domain of contentDomains) {
    if (normalizeKeyword(domain) === normalizedDept) return true;
  }

  // Keyword-based: domain keywords might mention the department
  // Map well-known departments to domains
  const deptToDomainMap = {
    'ai-science': ['ai-ml'],
    'growth': ['marketing', 'negocios'],
    'growth-ops': ['marketing', 'negocios'],
    'expert-council': ['engenharia'],
    'product': ['negocios'],
    'product-ops': ['negocios'],
    'engineering': ['engenharia'],
    'engineering-ops': ['engenharia'],
    'design': ['design-interiores'],
    'design-ops': ['design-interiores'],
    'legal': ['legal'],
    'legal-ops': ['legal'],
    'marketing': ['marketing'],
    'marketing-ops': ['marketing', 'negocios'],
    'sales': ['negocios', 'moveis-luxo', 'marketing'],
    'sales-ops': ['negocios', 'moveis-luxo', 'marketing'],
    'mental-health': ['saude-mental'],
    'mental-health-ops': ['saude-mental'],
    'clinical': ['saude-mental'],
    'clinical-ops': ['saude-mental'],
    'therapy': ['saude-mental'],                    // 4 clones (Anipis)
    'design-terapeutico': ['saude-mental', 'design-interiores'],  // 3 clones (Anipis UX)
    'health-tech': ['saude-mental', 'ai-ml', 'engenharia'],       // 2 clones
    'health-data': ['saude-mental', 'ai-ml'],       // 1 clone
    'customer-ops': ['negocios', 'marketing'],
    'finance': ['negocios'],
    'finance-ops': ['negocios'],
    'product-research': ['negocios', 'marketing'],
    'executive-team': ['negocios', 'marketing'],
    'innovation': ['ai-ml', 'engenharia', 'negocios'],
    'aios-agent': [],                               // 40 AIOS core agents — not auto-routed
  };

  const mappedDomains = deptToDomainMap[normalizedDept] || [];
  for (const domain of contentDomains) {
    if (mappedDomains.includes(normalizeKeyword(domain))) return true;
  }

  return false;
}

/**
 * Get tier bonus value.
 * @param {string} tier
 * @returns {number}
 */
function getTierBonus(tier) {
  switch (tier) {
    case 'S': return 1.0;
    case 'A': return 0.7;
    case 'B': return 0.4;
    default: return 0.1;
  }
}

/**
 * Get priority from tier.
 * @param {string} tier
 * @param {Object} tierMap
 * @returns {'urgent'|'normal'|'low'}
 */
function getPriority(tier, tierMap = {}) {
  return tierMap[tier] || (tier === 'S' ? 'urgent' : tier === 'A' ? 'normal' : 'low');
}

/**
 * Find projects that benefit from the content.
 * @param {string[]} contentDomains
 * @param {Object} domainsConfig
 * @returns {string[]}
 */
function findTargetProjects(contentDomains, domainsConfig) {
  const projects = new Set();
  const domains = domainsConfig?.domains || {};

  for (const domain of contentDomains) {
    const domainConfig = domains[domain];
    if (domainConfig && domainConfig.projects) {
      for (const p of domainConfig.projects) {
        projects.add(p);
      }
    }
  }

  return [...projects];
}

/**
 * Apply feedback adjustments to a clone's relevance score.
 * @param {string} cloneId
 * @param {number} baseScore
 * @param {string[]} matchedKeywords
 * @param {Object} adjustments - Feedback adjustments object
 * @param {number} floor - Minimum relevance floor
 * @returns {number}
 */
function applyFeedbackAdjustments(cloneId, baseScore, matchedKeywords, adjustments, floor = 0.2) {
  if (!adjustments || !adjustments[cloneId]) {
    return baseScore;
  }

  const adj = adjustments[cloneId];
  let adjusted = baseScore;

  // Apply keyword boosts
  if (adj.keyword_boosts) {
    for (const kw of matchedKeywords) {
      const nkw = normalizeKeyword(kw);
      if (adj.keyword_boosts[nkw]) {
        adjusted += adj.keyword_boosts[nkw];
      }
    }
  }

  // Apply keyword penalties
  if (adj.keyword_penalties) {
    for (const kw of matchedKeywords) {
      const nkw = normalizeKeyword(kw);
      if (adj.keyword_penalties[nkw]) {
        adjusted += adj.keyword_penalties[nkw]; // penalties are negative
      }
    }
  }

  // Apply min_relevance_override
  if (adj.min_relevance_override && adjusted < adj.min_relevance_override) {
    return 0; // Below override threshold, exclude
  }

  return Math.max(adjusted, floor);
}

/**
 * Load feedback routing adjustments.
 * @param {string} [dataDir]
 * @returns {Object}
 */
function loadFeedbackAdjustments(dataDir) {
  const dir = dataDir || path.resolve(__dirname, '../../hydra-data/feedback');
  const filePath = path.join(dir, 'routing-adjustments.yaml');
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    const data = yaml.load(fs.readFileSync(filePath, 'utf-8'));
    return data?.adjustments || {};
  } catch {
    return {};
  }
}

/**
 * Route content to mind clones and projects.
 * @param {Object} content - Processed content
 * @param {string} content.contentId - Unique content ID
 * @param {string[]} [content.domains] - Content domains
 * @param {string[]} [content.keywords] - Content keywords/tags
 * @param {string[]} [content.tags] - Content tags (merged with keywords)
 * @param {string[]} [content.entities] - Named entities
 * @param {string} [content.tier] - Quality tier
 * @param {string} [content.project] - Specific project override
 * @param {Object} [options]
 * @param {number} [options.minRelevance] - Min relevance score
 * @param {number} [options.maxClones] - Max clones per item
 * @param {string} [options.configDir] - Config directory
 * @param {string} [options.indexPath] - Mind clone index path
 * @param {string} [options.mapPath] - Mind clone map path
 * @param {string} [options.feedbackDir] - Feedback data dir
 * @returns {ContentRouteResult}
 */
export function routeToMindClones(content, options = {}) {
  const routingConfig = loadRoutingConfig(options.configDir);
  const rc = routingConfig.routing || {};

  const minRelevance = options.minRelevance ?? rc.min_relevance_score ?? 0.3;
  const maxClones = options.maxClones ?? rc.max_clones_per_item ?? 10;
  const keywordWeight = rc.keyword_weight ?? 0.6;
  const departmentWeight = rc.department_weight ?? 0.3;
  const tierWeight = rc.tier_weight ?? 0.1;
  const feedbackFloor = rc.feedback_floor ?? 0.2;

  const mindClones = loadMindCloneIndex(options.indexPath);
  const domainsConfig = loadDomainsConfig(options.configDir);
  const mindCloneMap = loadMindCloneMap(options.mapPath);
  const feedbackAdjustments = loadFeedbackAdjustments(options.feedbackDir);
  const forcedRoutes = rc.forced_routes || {};

  // Build content keywords from all available signals
  const contentKeywords = [
    ...(content.keywords || []),
    ...(content.tags || []),
    ...(content.entities || []),
    ...(content.domains || []),
  ];

  const tier = content.tier || 'B';
  const tierBonus = getTierBonus(tier);
  const contentDomains = content.domains || [];

  // Score each mind clone
  /** @type {RoutedClone[]} */
  const scoredClones = [];

  for (const clone of mindClones) {
    if (!clone.id || !clone.keywords) continue;

    const overlap = calculateKeywordOverlap(contentKeywords, clone.keywords);
    const deptMatch = departmentMatchesDomains(clone.department, contentDomains, domainsConfig) ? 1 : 0;

    let score = (overlap.ratio * keywordWeight) + (deptMatch * departmentWeight) + (tierBonus * tierWeight);

    // Check forced routes
    let isForced = false;
    for (const domain of contentDomains) {
      const forcedClones = forcedRoutes[domain] || [];
      if (forcedClones.includes(clone.id)) {
        score = Math.max(score, minRelevance + 0.1); // Ensure forced clones pass threshold
        isForced = true;
        break;
      }
    }

    // Apply feedback adjustments
    score = applyFeedbackAdjustments(clone.id, score, overlap.matched, feedbackAdjustments, feedbackFloor);

    if (score >= minRelevance) {
      scoredClones.push({
        id: clone.id,
        department: clone.department || 'unknown',
        source: clone.source || 'unknown',
        relevanceScore: Math.round(score * 1000) / 1000,
        matchedKeywords: overlap.matched,
        isForced,
      });
    }
  }

  // Sort by score descending
  scoredClones.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Limit
  const targetClones = scoredClones.slice(0, maxClones);

  // Find target projects (Story 5.3)
  const targetProjects = findTargetProjects(contentDomains, domainsConfig);

  // Add project-specific override if content.project is set
  if (content.project && !targetProjects.includes(content.project)) {
    targetProjects.push(content.project);
  }

  return {
    contentId: content.contentId,
    targetClones,
    targetProjects,
    priority: getPriority(tier, rc.tier_priority_map),
  };
}

// Export internals for testing
export {
  loadRoutingConfig,
  loadMindCloneIndex,
  loadDomainsConfig,
  loadMindCloneMap,
  calculateKeywordOverlap,
  departmentMatchesDomains,
  getTierBonus,
  getPriority,
  findTargetProjects,
  applyFeedbackAdjustments,
  loadFeedbackAdjustments,
  normalizeKeyword,
};
