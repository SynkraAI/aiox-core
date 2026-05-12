/**
 * Jarvis Consultation Engine
 *
 * Smart search + mandatory consultation for AIOS agents.
 * Finds the best mind clones for a given project/topic,
 * ranks them by relevance, and can be called by any agent.
 *
 * Usage:
 *   node consultation-engine.js search --project tocks --topic "pricing strategy"
 *   node consultation-engine.js recommend --agent architect --project serenity
 *   node consultation-engine.js index
 *
 * @module core/jarvis/consultation-engine
 * @version 1.0.0
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { detect: detectProject } = require('./project-detector');

// ─── Config ─────────────────────────────────────────
const MEGA_BRAIN_ROOT = process.env.MEGA_BRAIN_ROOT || 'D:/jarvis/mega brain';
const AIOS_ROOT = process.env.AIOS_ROOT || 'D:/AIOS';
const MINDS_DIR = path.join(MEGA_BRAIN_ROOT, 'agents', 'minds');
const AGENTS_DIR = path.join(AIOS_ROOT, '.aios-core', 'development', 'agents');
const MAP_FILE = path.join(AIOS_ROOT, '.aios-core', 'data', 'jarvis-mind-clone-map.yaml');
const INDEX_FILE = path.join(AIOS_ROOT, '.aios-core', 'data', 'jarvis-mind-clone-index.json');

// ─── Keywords per domain (for smart matching) ───────
const DOMAIN_KEYWORDS = {
  'ai-science': ['ai', 'machine learning', 'deep learning', 'neural', 'model', 'training', 'inference', 'agi', 'llm', 'transformer'],
  'customer-ops': ['customer', 'support', 'churn', 'retention', 'onboarding', 'nps', 'satisfaction', 'success', 'community'],
  'design-terapeutico': ['therapy', 'mental health', 'psychology', 'wellbeing', 'behavior', 'habit', 'cbt', 'mindfulness', 'emotional'],
  'executive-team': ['strategy', 'leadership', 'vision', 'okr', 'kpi', 'board', 'investor', 'fundraising', 'c-suite'],
  'growth': ['growth', 'acquisition', 'viral', 'product-led', 'plg', 'outbound', 'inbound', 'scale', 'gtm'],
  'health-data': ['health data', 'ehr', 'fhir', 'interoperability', 'clinical', 'biomedical', 'genomics'],
  'health-tech': ['healthtech', 'telehealth', 'digital health', 'medtech', 'remote monitoring', 'patient'],
  'innovation': ['innovation', 'lean', 'startup', 'mvp', 'pivot', 'experiment', 'validation', 'disruption', 'architecture', 'distributed', 'cloud', 'serverless'],
  'legal': ['legal', 'compliance', 'regulation', 'hipaa', 'gdpr', 'lgpd', 'fda', 'privacy', 'policy'],
  'marketing-ops': ['marketing', 'campaign', 'ads', 'seo', 'content', 'email', 'social media', 'funnel', 'landing page', 'copy', 'conversion', 'influencer', 'analytics'],
  'product-research': ['research', 'competitor', 'market', 'trend', 'niche', 'analysis', 'benchmark'],
  'sales-ops': ['sales', 'pipeline', 'lead', 'proposal', 'pricing', 'crm', 'closing', 'prospecting', 'negotiation', 'deal', 'revenue', 'high-ticket'],
  'therapy': ['therapy', 'mental health', 'digital therapeutics', 'maternal', 'postpartum', 'anxiety', 'depression', 'impostor syndrome'],
};

// ─── Mind Clone Index Builder ───────────────────────

/**
 * Scan all mind clone AND AIOS agent files and build a searchable index.
 * Sources: Mega Brain minds (priority) + AIOS development agents (fallback).
 * Extracts: id, name, department, keywords, frameworks, file path, source.
 */
function buildIndex() {
  const index = [];
  const indexed = new Set();

  // Source 1: Mega Brain mind clones (priority — richer DNA)
  if (fs.existsSync(MINDS_DIR)) {
    const departments = fs.readdirSync(MINDS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('_'))
      .map(d => d.name);

    for (const dept of departments) {
      const deptDir = path.join(MINDS_DIR, dept);
      const files = fs.readdirSync(deptDir).filter(f => f.endsWith('.md') && !f.startsWith('_'));

      for (const file of files) {
        const filePath = path.join(deptDir, file);
        const entry = parseExpertFile(filePath, dept, 'mega-brain');
        if (entry) {
          index.push(entry);
          indexed.add(entry.id);
        }
      }
    }
  }

  // Source 2: AIOS development agents (fallback for experts not in Mega Brain)
  if (fs.existsSync(AGENTS_DIR)) {
    const files = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md') && !f.startsWith('_'));

    for (const file of files) {
      const id = path.basename(file, '.md');
      if (indexed.has(id)) continue; // Skip if already indexed from Mega Brain

      const filePath = path.join(AGENTS_DIR, file);
      const entry = parseExpertFile(filePath, 'aios-agent', 'aios-agent');
      if (entry) {
        index.push(entry);
        indexed.add(entry.id);
      }
    }
  }

  return index;
}

/**
 * Parse a single expert file and extract searchable metadata.
 */
function parseExpertFile(filePath, department, source) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const id = path.basename(filePath, '.md');

    // Extract name from first heading or Identity section
    const nameMatch = content.match(/^#\s+(.+)/m) || content.match(/Name:\s*(.+)/m);
    const name = nameMatch ? nameMatch[1].trim() : id;

    // Extract role from YAML block (more reliable) or markdown
    let role = '';
    const yamlRoleMatch = content.match(/role:\s*(.+)/m);
    if (yamlRoleMatch) {
      role = yamlRoleMatch[1].trim();
    } else {
      const mdRoleMatch = content.match(/## Role\n(.+)/m);
      if (mdRoleMatch) role = mdRoleMatch[1].trim();
    }

    // Extract identity
    const identityMatch = content.match(/identity:\s*(.+)/m);
    const identity = identityMatch ? identityMatch[1].trim() : '';

    // Extract key frameworks
    const frameworks = [];
    const fwMatches = content.matchAll(/\*\*(.+?)\*\*\s*[-—:]/g);
    for (const m of fwMatches) {
      const fw = m[1].trim().toLowerCase();
      if (fw.length > 3 && fw.length < 80) frameworks.push(fw);
    }

    // Extract commands
    const commands = [];
    const cmdMatches = content.matchAll(/`\*([a-z][\w-]+)`/g);
    for (const m of cmdMatches) {
      commands.push(m[1]);
    }

    // Build keyword set from content
    const contentLower = content.toLowerCase();
    const keywords = new Set();

    // Add department keywords
    if (DOMAIN_KEYWORDS[department]) {
      for (const kw of DOMAIN_KEYWORDS[department]) {
        if (contentLower.includes(kw)) keywords.add(kw);
      }
    }

    // Scan ALL domain keywords (not just the department) for cross-domain matching
    for (const [, domainKws] of Object.entries(DOMAIN_KEYWORDS)) {
      for (const kw of domainKws) {
        if (contentLower.includes(kw)) keywords.add(kw);
      }
    }

    // Add framework names as keywords
    frameworks.forEach(f => keywords.add(f));

    // Extract from role and identity
    const roleWords = (role + ' ' + identity).toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const stopWords = new Set(['this', 'that', 'with', 'from', 'have', 'been', 'will', 'they', 'their', 'each', 'every', 'into', 'when', 'what', 'more', 'than', 'also', 'must', 'should', 'could', 'would', 'about', 'which', 'other', 'where', 'there', 'these', 'those', 'being', 'doing', 'using', 'based', 'between', 'before', 'after']);
    roleWords.filter(w => !stopWords.has(w)).slice(0, 15).forEach(w => keywords.add(w));

    // Extract explicit keywords from responsibilities/key areas
    const respSection = content.match(/## (?:Responsibilities|Key Areas|Expertise|Specializations|Key Frameworks)\n([\s\S]*?)(?=\n## |$)/);
    if (respSection) {
      const words = respSection[1].toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
      words.filter(w => !stopWords.has(w)).slice(0, 20).forEach(w => keywords.add(w));
    }

    return {
      id,
      name,
      department,
      source,
      role: role.substring(0, 200),
      keywords: Array.from(keywords),
      frameworks: frameworks.slice(0, 20),
      commands: commands.slice(0, 20),
      filePath,
    };
  } catch {
    return null;
  }
}

/**
 * Save index to disk for fast subsequent lookups.
 */
function saveIndex(index) {
  const dir = path.dirname(INDEX_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
  return index;
}

/**
 * Load index from disk, or build fresh if missing/stale.
 */
function loadIndex() {
  try {
    if (fs.existsSync(INDEX_FILE)) {
      const stat = fs.statSync(INDEX_FILE);
      const ageHours = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60);
      // Rebuild if older than 24h
      if (ageHours < 24) {
        return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
      }
    }
  } catch {
    // Fall through to rebuild
  }
  return saveIndex(buildIndex());
}

// ─── Smart Search ───────────────────────────────────

/**
 * Search mind clones by topic/question relevance.
 * Returns ranked list of best matches.
 *
 * @param {string} query - Topic, question, or keywords
 * @param {object} [options]
 * @param {string} [options.project] - Project name for bonus scoring
 * @param {string} [options.agent] - Agent ID for role-based scoring
 * @param {number} [options.limit=5] - Max results
 * @returns {Array<{id, name, department, score, reason}>}
 */
function search(query, options = {}) {
  const index = loadIndex();
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

  // Auto-detect project if not provided
  if (!options.project) {
    const detected = detectProject({ prompt: query });
    if (detected.confidence !== 'low' || detected.project !== 'aios') {
      options.project = detected.project;
    }
  }

  const projectOverrides = getProjectExperts(options.project);

  const scored = index.map(clone => {
    let score = 0;
    const reasons = [];

    // 1. Keyword match (strongest signal)
    for (const kw of clone.keywords) {
      if (queryLower.includes(kw)) {
        score += 10;
        reasons.push(`keyword: ${kw}`);
      }
    }

    // 2. Framework match
    for (const fw of clone.frameworks) {
      if (queryLower.includes(fw)) {
        score += 8;
        reasons.push(`framework: ${fw}`);
      }
    }

    // 3. Word overlap with query
    for (const word of queryWords) {
      if (clone.keywords.some(kw => kw.includes(word))) {
        score += 3;
      }
      if (clone.role.toLowerCase().includes(word)) {
        score += 2;
      }
      if (clone.name.toLowerCase().includes(word)) {
        score += 5;
      }
    }

    // 4. Department relevance
    const deptKeywords = DOMAIN_KEYWORDS[clone.department] || [];
    for (const dkw of deptKeywords) {
      if (queryLower.includes(dkw)) {
        score += 5;
        reasons.push(`dept: ${clone.department}`);
        break;
      }
    }

    // 5. Project bonus (experts mapped to this project get a boost)
    if (projectOverrides.includes(clone.id)) {
      score += 15;
      reasons.push(`project-mapped: ${options.project}`);
    }

    // 6. Agent role affinity
    if (options.agent) {
      const agentMap = getAgentExperts(options.agent);
      if (agentMap.primary.includes(clone.id)) {
        score += 12;
        reasons.push(`agent-primary: ${options.agent}`);
      } else if (agentMap.secondary.includes(clone.id)) {
        score += 6;
        reasons.push(`agent-secondary: ${options.agent}`);
      }
    }

    return {
      id: clone.id,
      name: clone.name,
      department: clone.department,
      score,
      reasons: [...new Set(reasons)],
      role: clone.role,
      commands: clone.commands,
    };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.limit || 5);
}

/**
 * Get recommended experts for an agent + project combination.
 * Merges agent defaults + project overrides, deduplicates.
 */
function recommend(agent, project) {
  const agentExperts = getAgentExperts(agent);
  const projectExperts = getProjectExperts(project);

  const all = [...new Set([
    ...agentExperts.primary,
    ...projectExperts,
    ...agentExperts.secondary,
  ])];

  const index = loadIndex();
  return all.map(id => {
    const clone = index.find(c => c.id === id);
    if (!clone) return { id, name: id, department: 'unknown', source: 'mapped' };
    return {
      id: clone.id,
      name: clone.name,
      department: clone.department,
      role: clone.role,
      source: agentExperts.primary.includes(id) ? 'agent-primary'
        : projectExperts.includes(id) ? 'project'
        : 'agent-secondary',
    };
  });
}

// ─── Map Helpers ────────────────────────────────────

function getAgentExperts(agentId) {
  const defaults = {
    architect: { primary: ['martin-fowler', 'werner-vogels'], secondary: ['kelsey-hightower', 'will-larson'] },
    dev: { primary: ['sarah-drasner', 'simon-willison'], secondary: ['andrej-karpathy', 'martin-fowler'] },
    pm: { primary: ['eric-ries', 'april-dunford'], secondary: ['clayton-christensen', 'mariana-mazzucato'] },
    analyst: { primary: ['cassie-kozyrkov', 'aswath-damodaran'], secondary: ['scott-galloway', 'rand-fishkin'] },
    po: { primary: ['nir-eyal', 'julie-zhuo'], secondary: ['don-norman', 'bj-fogg'] },
    devops: { primary: ['gene-kim', 'kelsey-hightower'], secondary: ['mikko-hypponen', 'bruce-schneier'] },
    'data-engineer': { primary: ['martin-fowler', 'chip-huyen'], secondary: ['fei-fei-li', 'cassie-kozyrkov'] },
    qa: { primary: ['gene-kim', 'martin-fowler'], secondary: ['bruce-schneier'] },
    sm: { primary: ['will-larson', 'patty-mccord'], secondary: ['laszlo-bock', 'josh-bersin'] },
    'ux-design-expert': { primary: ['don-norman', 'dieter-rams'], secondary: ['john-maeda', 'vitaly-friedman'] },
  };
  return defaults[agentId] || { primary: [], secondary: [] };
}

function getProjectExperts(project) {
  const projectMap = {
    tocks: ['alex-hormozi', 'jeb-blount', 'morgan-housel', 'nick-mehta', 'sales-strategist', 'pricing-strategist', 'funnel-architect'],
    serenity: ['alison-darcy', 'bj-fogg', 'rafael-calvo', 'eduardo-bunge', 'acacia-parks', 'kate-ryder', 'dena-bravata'],
    jaci: ['alison-darcy', 'bj-fogg', 'rafael-calvo', 'eduardo-bunge', 'acacia-parks', 'kate-ryder', 'dena-bravata'],
    'low-ticket-10k': ['alex-hormozi', 'guillaume-moubeche', 'patrick-campbell', 'peep-laja', 'oli-gardner', 'funnel-architect', 'landing-page-optimizer', 'copy-specialist'],
    bretda: ['alex-hormozi', 'dieter-rams', 'rand-fishkin', 'donald-miller', 'sales-strategist', 'pricing-strategist'],
    'aiox-corporation': ['will-larson', 'patty-mccord', 'eliyahu-goldratt', 'peter-diamandis', 'eric-ries'],
  };
  return projectMap[project] || [];
}

// ─── CLI ────────────────────────────────────────────

function main() {
  const [,, command, ...args] = process.argv;

  switch (command) {
    case 'index': {
      const index = saveIndex(buildIndex());
      console.log(JSON.stringify({ indexed: index.length, file: INDEX_FILE }, null, 2));
      break;
    }

    case 'search': {
      const opts = parseArgs(args);
      if (!opts.topic) {
        console.error('Usage: node consultation-engine.js search --topic "pricing" [--project tocks] [--agent pm] [--limit 5]');
        process.exit(1);
      }
      const results = search(opts.topic, {
        project: opts.project,
        agent: opts.agent,
        limit: parseInt(opts.limit) || 5,
      });
      console.log(JSON.stringify(results, null, 2));
      break;
    }

    case 'recommend': {
      const opts = parseArgs(args);
      if (!opts.agent) {
        console.error('Usage: node consultation-engine.js recommend --agent architect [--project tocks]');
        process.exit(1);
      }
      const results = recommend(opts.agent, opts.project);
      console.log(JSON.stringify(results, null, 2));
      break;
    }

    default:
      console.log(`Jarvis Consultation Engine v1.0.0

Commands:
  index                                    Build/refresh mind clone search index
  search --topic "..." [--project X]       Find best experts for a topic
  recommend --agent X [--project X]        Get recommended experts for agent+project

Examples:
  node consultation-engine.js search --topic "pricing strategy for luxury furniture" --project tocks
  node consultation-engine.js recommend --agent architect --project serenity
  node consultation-engine.js index
`);
  }
}

function parseArgs(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--') && i + 1 < args.length) {
      result[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }
  return result;
}

// Export for use as module
module.exports = { search, recommend, buildIndex, loadIndex, saveIndex };

// Run as CLI
if (require.main === module) {
  main();
}
