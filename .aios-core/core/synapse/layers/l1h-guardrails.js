// L1h Guardrails Layer Processor
//
// Injects contextual tips when the user's prompt matches tasks/workflows
// from a different squad than the currently active one.
//
// Features:
//   - IDF-weighted keyword scoring with title boost
//   - PT-BR synonym expansion
//   - Squad aggregation (avgScore x kwDiversity x domainCoverage)
//   - Handoff protocol (wrong agent detection)
//   - Tips history with learning boosts
//   - *tips on/off/stats toggle
//
// @module core/synapse/layers/l1h-guardrails
// @version 1.0.0

const fs = require('fs');
const path = require('path');
const LayerProcessor = require('./layer-processor');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_TIP_ENTRIES = 3;
const CONFIDENCE_THRESHOLD = 0.6;
const TITLE_BOOST = 2.0;
const WORKFLOW_BOOST = 1.15;
const MIN_PROMPT_KEYWORDS = 2;
const MAX_HISTORY = 500;
const HISTORY_MIN_TOTAL = 5;
const HISTORY_MIN_PER_SQUAD = 3;

const STOPWORDS = new Set([
  'a', 'o', 'e', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos',
  'nas', 'um', 'uma', 'uns', 'umas', 'com', 'por', 'para', 'que', 'se',
  'ou', 'ao', 'os', 'as', 'mais', 'como', 'ser', 'ter', 'fazer', 'dar',
  'ir', 'vir', 'ver', 'cada', 'todo', 'toda', 'todos', 'todas', 'seu', 'sua',
  'meu', 'minha', 'ele', 'ela', 'voce', 'ja', 'ate', 'sem', 'the', 'and',
  'for', 'with', 'from', 'this', 'that', 'are', 'was', 'you', 'all', 'can',
]);

// Short/internal prompts that should never trigger tips
const SKIP_PATTERNS = [
  /^\s*\*/, // star commands
  /^\s*(sim|nao|ok|yes|no|sure|certo|entendi|beleza|valeu|obrigado|thanks)\s*[.!]?\s*$/i,
  /^\s*.{0,3}\s*$/, // too short
];

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

let _indexCache = null;
let _indexMtime = 0;
let _synonymsCache = null;

function getIndexPath(synapsePath) {
  return path.join(synapsePath, 'cache', 'tips-index.json');
}

function getHistoryPath(synapsePath) {
  return path.join(synapsePath, 'cache', 'tips-history.json');
}

function loadIndex(synapsePath) {
  const indexPath = getIndexPath(synapsePath);
  if (!fs.existsSync(indexPath)) return null;

  try {
    const stat = fs.statSync(indexPath);
    const mtime = stat.mtimeMs;
    if (_indexCache && mtime === _indexMtime) return _indexCache;

    _indexCache = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    _indexMtime = mtime;
    return _indexCache;
  } catch {
    return null;
  }
}

function loadSynonyms() {
  if (_synonymsCache) return _synonymsCache;
  try {
    const synPath = path.join(__dirname, 'synonyms-pt.json');
    if (!fs.existsSync(synPath)) return {};
    const data = JSON.parse(fs.readFileSync(synPath, 'utf8'));
    // Build bidirectional map: any term → all related terms
    const biMap = {};
    for (const [canonical, synonyms] of Object.entries(data)) {
      const allTerms = [canonical, ...synonyms];
      for (const term of allTerms) {
        if (!biMap[term]) biMap[term] = new Set();
        for (const related of allTerms) {
          if (related !== term) biMap[term].add(related);
        }
      }
    }
    // Convert sets to arrays
    const result = {};
    for (const [term, relatedSet] of Object.entries(biMap)) {
      result[term] = [...relatedSet];
    }
    _synonymsCache = result;
    return _synonymsCache;
  } catch {
    return {};
  }
}

function loadHistory(synapsePath) {
  const histPath = getHistoryPath(synapsePath);
  if (!fs.existsSync(histPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(histPath, 'utf8'));
  } catch {
    return [];
  }
}

function saveHistory(synapsePath, history) {
  try {
    const histPath = getHistoryPath(synapsePath);
    const cacheDir = path.dirname(histPath);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    // FIFO: keep last MAX_HISTORY
    const trimmed = history.slice(-MAX_HISTORY);
    fs.writeFileSync(histPath, JSON.stringify(trimmed, null, 2), 'utf8');
  } catch { /* fire and forget */ }
}

// ---------------------------------------------------------------------------
// Keyword extraction
// ---------------------------------------------------------------------------

function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function extractPromptKeywords(prompt) {
  const normalized = removeAccents(prompt.toLowerCase());
  const tokens = normalized
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));

  // Expand with synonyms (bidirectional)
  const synonyms = loadSynonyms();
  const expanded = [];
  for (const token of tokens) {
    expanded.push(token);
    const related = synonyms[token];
    if (related) {
      for (const rel of related) {
        expanded.push(rel);
      }
    }
  }

  return [...new Set(expanded)];
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function scoreEntries(entries, promptKeywords, idf, historyBoosts) {
  const scored = [];
  const promptSet = new Set(promptKeywords);

  for (const entry of entries) {
    const entryKeywords = entry.keywords || [];
    const titleKeywords = new Set(
      removeAccents((entry.title || '').toLowerCase())
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 2),
    );

    let score = 0;
    const matchedKeywords = [];

    for (const kw of promptKeywords) {
      if (entryKeywords.includes(kw)) {
        const idfScore = idf[kw] || 1;
        const titleMult = titleKeywords.has(kw) ? TITLE_BOOST : 1;
        score += idfScore * titleMult;
        matchedKeywords.push(kw);
      }
    }

    // Workflow boost
    if (entry.type === 'workflow') {
      score *= WORKFLOW_BOOST;
    }

    // History boost
    if (historyBoosts && historyBoosts[entry.squad]) {
      score *= historyBoosts[entry.squad];
    }

    if (score > 0 && matchedKeywords.length >= 1) {
      scored.push({
        ...entry,
        score,
        matchedKeywords,
      });
    }
  }

  return scored.sort((a, b) => b.score - a.score);
}

function aggregateBySquad(scoredEntries, promptKeywords) {
  const squads = {};
  const promptSet = new Set(promptKeywords || []);

  for (const entry of scoredEntries) {
    if (!squads[entry.squad]) {
      squads[entry.squad] = { entries: [], totalScore: 0, uniqueKws: new Set() };
    }
    squads[entry.squad].entries.push(entry);
    squads[entry.squad].totalScore += entry.score;
    for (const kw of entry.matchedKeywords) {
      squads[entry.squad].uniqueKws.add(kw);
    }
  }

  const results = [];
  for (const [squadName, data] of Object.entries(squads)) {
    // Top 3 entries avg score
    const top3 = data.entries.slice(0, 3);
    const avgScore = top3.reduce((s, e) => s + e.score, 0) / top3.length;
    const kwDiversity = Math.log2(data.uniqueKws.size + 1);
    const domainCoverage = Math.log2(data.entries.length + 1);
    let aggregateScore = avgScore * kwDiversity * domainCoverage;

    // Squad name boost: if prompt keywords match the squad name, boost 3x
    // This is a strong signal — user explicitly mentioned the domain name
    const squadTokens = removeAccents(squadName.toLowerCase()).split(/[-_\s]+/);
    const nameMatch = squadTokens.some(t => t.length > 2 && promptSet.has(t));
    if (nameMatch) {
      aggregateScore *= 3.0;
    }

    results.push({
      squad: squadName,
      aggregateScore,
      topEntries: top3,
      matchedCount: data.entries.length,
      uniqueKeywords: [...data.uniqueKws],
    });
  }

  return results.sort((a, b) => b.aggregateScore - a.aggregateScore);
}

function calculateHistoryBoosts(history) {
  if (history.length < HISTORY_MIN_TOTAL) return {};

  const squadStats = {};
  for (const entry of history) {
    const sq = entry.squad;
    if (!sq) continue;
    if (!squadStats[sq]) squadStats[sq] = { shown: 0, followed: 0 };
    squadStats[sq].shown++;
    if (entry.followed) squadStats[sq].followed++;
  }

  const boosts = {};
  for (const [sq, stats] of Object.entries(squadStats)) {
    if (stats.shown < HISTORY_MIN_PER_SQUAD) continue;
    const followRate = stats.followed / stats.shown;
    // Range: 0.85 (never follows) to 1.15 (always follows)
    boosts[sq] = 0.85 + (followRate * 0.30);
  }

  return boosts;
}

// ---------------------------------------------------------------------------
// Tip generation
// ---------------------------------------------------------------------------

function generateTips(topSquads, activeAgent, squadMap) {
  if (topSquads.length === 0) return null;

  const best = topSquads[0];
  const bestSquadInfo = squadMap[best.squad] || {};
  const recommendedAgent = bestSquadInfo.entry_agent || best.squad;

  // Determine tip type
  const isWrongAgent = activeAgent && recommendedAgent &&
    activeAgent !== recommendedAgent &&
    activeAgent !== 'aiox-master' &&
    activeAgent !== best.squad;

  const tipType = isWrongAgent ? 'handoff-offer' : 'agent-suggestion';

  // Build tip content
  const lines = [];
  if (isWrongAgent) {
    lines.push(`HANDOFF: Para esta demanda, o agente recomendado e @${recommendedAgent} (squad: ${best.squad}).`);
    if (best.topEntries[0]?.trigger) {
      lines.push(`COMANDO: ${best.topEntries[0].trigger}`);
    }
  } else {
    lines.push(`TIP: Squad recomendado: ${best.squad} (@${recommendedAgent}).`);
  }

  // Show top entries
  const topByType = { workflow: [], task: [] };
  for (const entry of best.topEntries) {
    if (topByType[entry.type]) topByType[entry.type].push(entry);
  }
  if (topByType.workflow.length > 0) {
    const wf = topByType.workflow[0];
    lines.push(`WORKFLOW: ${wf.name}${wf.stages ? ` (${wf.stages} fases)` : ''}`);
    if (wf.prerequisites) {
      lines.push(`PRE-REQUISITOS: ${wf.prerequisites.slice(0, 3).join(', ')}`);
    }
  }
  if (topByType.task.length > 0) {
    lines.push(`TASKS: ${topByType.task.map(t => t.name).join(', ')}`);
  }

  // Alternatives
  if (topSquads.length > 1) {
    const alts = topSquads.slice(1, 3).map(s => s.squad);
    lines.push(`ALTERNATIVAS: ${alts.join(', ')}`);
  }

  return {
    type: tipType,
    squad: best.squad,
    agent: recommendedAgent,
    confidence: Math.min(best.aggregateScore / 20, 1).toFixed(2),
    content: lines.join('\n    '),
  };
}

// ---------------------------------------------------------------------------
// L1h Guardrails Processor
// ---------------------------------------------------------------------------

class L1hGuardrailsProcessor extends LayerProcessor {
  constructor() {
    super({ name: 'guardrails', layer: 1, timeout: 50 });
    this._disabled = false;
  }

  process(context) {
    const { prompt, session, config } = context;
    const synapsePath = config?.synapsePath;
    if (!synapsePath) return null;

    // Handle *tips commands
    if (prompt.trim().startsWith('*tips')) {
      return this._handleTipsCommand(prompt.trim(), synapsePath);
    }

    // Check if disabled
    if (this._disabled) return null;

    // Skip internal/short prompts
    for (const pattern of SKIP_PATTERNS) {
      if (pattern.test(prompt)) return null;
    }

    // Load index
    const index = loadIndex(synapsePath);
    if (!index || !index.entries) return null;

    // Extract keywords
    const promptKeywords = extractPromptKeywords(prompt);
    if (promptKeywords.length < MIN_PROMPT_KEYWORDS) return null;

    // Load history and calculate boosts
    const history = loadHistory(synapsePath);
    const historyBoosts = calculateHistoryBoosts(history);

    // Score entries
    const scored = scoreEntries(index.entries, promptKeywords, index.idf || {}, historyBoosts);
    if (scored.length === 0) return null;

    // Aggregate by squad
    const topSquads = aggregateBySquad(scored, promptKeywords);
    if (topSquads.length === 0) return null;

    // Get active agent
    const activeAgent = session?.activeAgent || session?.active_agent || null;

    // Generate tip
    const tip = generateTips(topSquads, activeAgent, index.squadMap || {});
    if (!tip || parseFloat(tip.confidence) < CONFIDENCE_THRESHOLD) return null;

    // Record in history
    const histEntry = {
      timestamp: new Date().toISOString(),
      prompt: prompt.slice(0, 100),
      squad: tip.squad,
      score: parseFloat(tip.confidence),
      activeAgent,
      isHandoff: tip.type === 'handoff-offer',
      followed: null, // unknown at this point
    };
    history.push(histEntry);
    saveHistory(synapsePath, history);

    // Format as aios-tips rule
    const tipXml = [
      `<aios-tips confidence="${tip.confidence}" type="${tip.type}">`,
      `    ${tip.content}`,
      '</aios-tips>',
    ].join('\n');

    return {
      rules: [tipXml],
      metadata: {
        layer: 'guardrails',
        source: 'tips-index',
        type: tip.type,
        squad: tip.squad,
        confidence: tip.confidence,
      },
    };
  }

  _handleTipsCommand(prompt, synapsePath) {
    const cmd = prompt.replace('*tips', '').trim().toLowerCase();

    if (cmd === 'off') {
      this._disabled = true;
      return {
        rules: ['Tips desabilitadas para esta sessao. Use *tips on para reativar.'],
        metadata: { layer: 'guardrails', source: 'command', action: 'disabled' },
      };
    }

    if (cmd === 'on') {
      this._disabled = false;
      return {
        rules: ['Tips reativadas.'],
        metadata: { layer: 'guardrails', source: 'command', action: 'enabled' },
      };
    }

    if (cmd === 'rebuild') {
      try {
        const { execSync } = require('child_process');
        const rootDir = path.resolve(synapsePath, '..');
        execSync(`node ${path.join(rootDir, '.aios-core', 'scripts', 'build-tips-index.mjs')}`, {
          cwd: rootDir,
          timeout: 30000,
        });
        // Invalidate cache
        _indexCache = null;
        _indexMtime = 0;
        return {
          rules: ['Index de tips reconstruido com sucesso. Use *tips stats para ver detalhes.'],
          metadata: { layer: 'guardrails', source: 'command', action: 'rebuild' },
        };
      } catch (err) {
        return {
          rules: [`Erro ao reconstruir index: ${err.message}`],
          metadata: { layer: 'guardrails', source: 'command', action: 'rebuild-error' },
        };
      }
    }

    if (cmd === 'stats') {
      const history = loadHistory(synapsePath);
      const total = history.length;
      const followed = history.filter(h => h.followed === true).length;
      const ignored = history.filter(h => h.followed === false).length;
      const unknown = total - followed - ignored;
      const accuracy = total > 0 ? ((followed / total) * 100).toFixed(1) : '0.0';

      // Top 5 squads
      const squadCounts = {};
      for (const h of history) {
        if (h.squad) {
          squadCounts[h.squad] = (squadCounts[h.squad] || 0) + 1;
        }
      }
      const topSquads = Object.entries(squadCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([sq, count]) => `${sq}: ${count}`)
        .join(', ');

      const statsText = [
        `Tips Stats: ${total} mostradas, ${followed} seguidas, ${ignored} ignoradas, ${unknown} pendentes`,
        `Accuracy: ${accuracy}%`,
        `Top squads: ${topSquads || 'nenhum'}`,
        `Historico: ${total}/${MAX_HISTORY}`,
      ].join('\n');

      return {
        rules: [statsText],
        metadata: { layer: 'guardrails', source: 'command', action: 'stats' },
      };
    }

    return null;
  }
}

module.exports = L1hGuardrailsProcessor;
