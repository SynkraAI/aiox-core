/**
 * Jarvis Self-Consultation Engine
 *
 * Enables agents to consult mind clones WITHOUT external processes.
 * Reads the mind clone/agent file, extracts expertise, and provides
 * the knowledge context for the calling agent to generate a response
 * in the expert's persona.
 *
 * Flow:
 *   1. Agent needs advice → calls consult()
 *   2. Engine finds expert file (Mega Brain minds OR AIOS agents)
 *   3. Extracts persona, frameworks, expertise sections
 *   4. Returns structured consultation context
 *   5. Calling agent uses context to generate expert-perspective response
 *   6. Response saved to bridge-data for history
 *
 * Usage:
 *   node self-consultation.js consult --expert martin-fowler --question "Should we use microservices?" --project tocks
 *   node self-consultation.js consult --expert alex-hormozi --question "How to price this offer?" --project low-ticket-10k --agent pm
 *   node self-consultation.js batch --experts "martin-fowler,alex-hormozi" --question "..." --project tocks
 *   node self-consultation.js list-available
 *
 * @module core/jarvis/self-consultation
 * @version 1.0.0
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { pathToFileURL } = require('url');
const { detect: detectProject } = require('./project-detector');

// ─── Config ─────────────────────────────────────────
const MEGA_BRAIN_ROOT = process.env.MEGA_BRAIN_ROOT || 'D:/jarvis/mega brain';
const AIOS_ROOT = process.env.AIOS_ROOT || 'D:/AIOS';
const BRIDGE_DIR = process.env.AIOS_BRAIN_BRIDGE_DIR || 'D:/jarvis/bridge-data';

// Story 1.12 — Bridge to HYDRA's ESM feed-reader from this CJS module.
const FEED_READER_PATH = path.resolve(
  __dirname, '..', '..', '..', 'tools', 'hydra', 'src', 'distribution', 'feed-reader.js',
);
let _feedReaderPromise = null;
function _loadFeedReader() {
  if (!_feedReaderPromise) {
    const dynamicImport = new Function('p', 'return import(p)');
    _feedReaderPromise = dynamicImport(pathToFileURL(FEED_READER_PATH).href);
  }
  return _feedReaderPromise;
}

const SEARCH_PATHS = [
  // Priority 1: Mega Brain mind clones (richer DNA)
  path.join(MEGA_BRAIN_ROOT, 'agents', 'minds'),
  // Priority 2: AIOS development agents (full YAML definitions)
  path.join(AIOS_ROOT, '.aios-core', 'development', 'agents'),
];

// ─── Expert File Resolver ───────────────────────────

/**
 * Find the expert's definition file across all search paths.
 * Searches recursively in Mega Brain (nested by department),
 * and flat in AIOS agents directory.
 *
 * @param {string} expertId - Expert identifier (e.g., 'martin-fowler')
 * @returns {{path: string, source: string, content: string} | null}
 */
function resolveExpert(expertId) {
  const filename = `${expertId}.md`;

  // Search Mega Brain minds (recursive — files are in dept subdirs)
  const mindsDir = SEARCH_PATHS[0];
  if (fs.existsSync(mindsDir)) {
    const found = findFileRecursive(mindsDir, filename);
    if (found) {
      return {
        path: found,
        source: 'mega-brain',
        content: fs.readFileSync(found, 'utf-8'),
      };
    }
  }

  // Search AIOS agents (flat directory)
  const agentsDir = SEARCH_PATHS[1];
  const agentPath = path.join(agentsDir, filename);
  if (fs.existsSync(agentPath)) {
    return {
      path: agentPath,
      source: 'aios-agent',
      content: fs.readFileSync(agentPath, 'utf-8'),
    };
  }

  // Also check nested agent dirs (e.g., agents/architect/)
  if (fs.existsSync(agentsDir)) {
    const found = findFileRecursive(agentsDir, filename);
    if (found) {
      return {
        path: found,
        source: 'aios-agent',
        content: fs.readFileSync(found, 'utf-8'),
      };
    }
  }

  return null;
}

function findFileRecursive(dir, filename) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name === filename) {
        return path.join(dir, entry.name);
      }
      if (entry.isDirectory() && !entry.name.startsWith('_')) {
        const found = findFileRecursive(path.join(dir, entry.name), filename);
        if (found) return found;
      }
    }
  } catch {
    // Directory not accessible
  }
  return null;
}

// ─── Expertise Extractor ────────────────────────────

/**
 * Extract structured expertise from an expert's definition file.
 * Works with both Mega Brain mind clones and AIOS agent YAML format.
 *
 * @param {string} content - Raw markdown content of expert file
 * @returns {object} Structured expertise
 */
function extractExpertise(content) {
  const expertise = {
    name: '',
    role: '',
    identity: '',
    frameworks: [],
    principles: [],
    commands: [],
    keyQuotes: [],
    fullContext: '',
  };

  // Extract name from heading
  const nameMatch = content.match(/^#\s+(.+)/m);
  if (nameMatch) expertise.name = nameMatch[1].trim();

  // Extract from YAML block
  const yamlMatch = content.match(/```yaml\n([\s\S]*?)```/);
  if (yamlMatch) {
    const yaml = yamlMatch[1];

    // Role
    const roleMatch = yaml.match(/role:\s*(.+)/);
    if (roleMatch) expertise.role = roleMatch[1].trim();

    // Identity
    const identityMatch = yaml.match(/identity:\s*(.+)/);
    if (identityMatch) expertise.identity = identityMatch[1].trim();

    // Core principles
    const principlesMatch = yaml.match(/core_principles:\s*\n((?:\s+-\s+.+\n?)+)/);
    if (principlesMatch) {
      expertise.principles = principlesMatch[1]
        .split('\n')
        .filter(l => l.trim().startsWith('-'))
        .map(l => l.replace(/^\s*-\s*/, '').trim())
        .filter(Boolean);
    }

    // Commands
    const cmdMatches = [...yaml.matchAll(/- name:\s*(.+)/g)];
    expertise.commands = cmdMatches.map(m => m[1].trim());
  }

  // Extract frameworks (bold text with description)
  const fwMatches = [...content.matchAll(/\*\*(.+?)\*\*\s*[-—:]+\s*(.+)/g)];
  expertise.frameworks = fwMatches.map(m => ({
    name: m[1].trim(),
    description: m[2].trim().substring(0, 200),
  }));

  // Extract key sections for context
  const sections = ['Role', 'Responsibilities', 'Key Frameworks', 'Expertise',
    'Specializations', 'DNA Schema', 'Knowledge Base', 'Philosophies',
    'Mental Models', 'Heuristics'];

  for (const section of sections) {
    const sectionMatch = content.match(
      new RegExp(`## ${section}[\\s\\S]*?(?=\\n## |$)`)
    );
    if (sectionMatch) {
      expertise.fullContext += sectionMatch[0] + '\n\n';
    }
  }

  // If no structured sections found, use the full content (trimmed)
  if (!expertise.fullContext) {
    expertise.fullContext = content.substring(0, 4000);
  }

  return expertise;
}

// ─── Self-Consultation ──────────────────────────────

/**
 * Perform a self-consultation with a mind clone expert.
 * Returns the expert's knowledge context for the agent to use.
 *
 * Async because Story 1.12 added a HYDRA-feed read step to mitigate the
 * write-only-silo bug (see ADR-004 and architecture §10A).
 *
 * @param {object} params
 * @param {string} params.expert - Expert ID
 * @param {string} params.question - Question to consult about
 * @param {string} [params.context] - Additional context
 * @param {string} [params.project] - Project name
 * @param {string} [params.agent] - Calling agent ID
 * @param {boolean} [params.noFeed=false] - Disable HYDRA feed injection (regression testing)
 * @returns {Promise<object>} Consultation result with expert context
 */
async function consult({ expert, question, context = '', project = '', agent = '', noFeed = false }) {
  // Auto-detect project if not provided
  if (!project) {
    const detected = detectProject({ prompt: question + ' ' + context });
    project = detected.project;
  }

  const resolved = resolveExpert(expert);

  if (!resolved) {
    return {
      success: false,
      expert,
      error: `Expert "${expert}" not found in Mega Brain or AIOS agents`,
      suggestion: `Run: node .aios-core/core/jarvis/self-consultation.js list-available`,
    };
  }

  const expertise = extractExpertise(resolved.content);
  const consultationId = randomUUID();

  // Story 1.12 — Load HYDRA feed entries for this expert.
  // Non-blocking on failure: feed-reader errors must NOT break consultations.
  let feedEntries = [];
  let feedStats = { isEmpty: true, totalTokens: 0, truncatedCount: 0 };
  if (!noFeed) {
    try {
      const fr = await _loadFeedReader();
      const result = await fr.loadCloneFeeds(expert, {
        days: 30,
        maxTokens: 30000,
        minTier: 'A',
      });
      feedEntries = result.entries;
      feedStats = {
        isEmpty: result.isEmpty,
        totalTokens: result.totalTokens,
        truncatedCount: result.truncatedCount,
      };
    } catch (err) {
      // Telemetry-only — never break the consultation.
      console.warn(`[self-consultation] feed-reader failed for ${expert}: ${err.message}`);
    }
  }

  /**
   * mindCloneEnrichment — Story 1.12 enrichment payload.
   *
   * @property feedEntries  - HYDRA feed entries injected (per ADR-004 §1, §2).
   * @property advisorContext - Expert role/identity (existing).
   * @property source        - Expert file source (mega-brain | aios-agent).
   * @property relevantMemory @deprecated since v1.0 — legacy field kept empty for
   *                          one release cycle (Sprint #2 removal post-2026-06-12 re-audit).
   *                          Use `feedEntries` instead. See C-10 audit + ADR-004 §7.
   */
  const mindCloneEnrichment = {
    advisorContext: {
      name: expertise.name || expert,
      role: expertise.role,
      identity: expertise.identity,
    },
    feedEntries,
    feedStats,
    source: resolved.source,
    relevantMemory: [], // @deprecated — see jsdoc above.
  };

  // Build consultation prompt context
  const consultationContext = {
    success: true,
    consultationId,
    expert: {
      id: expert,
      name: expertise.name || expert,
      role: expertise.role,
      identity: expertise.identity,
      source: resolved.source,
      filePath: resolved.path,
    },
    question,
    projectContext: context,
    project,
    callingAgent: agent,

    // The expert's knowledge for the agent to use
    expertKnowledge: {
      frameworks: expertise.frameworks.slice(0, 10),
      principles: expertise.principles.slice(0, 10),
      commands: expertise.commands.slice(0, 15),
      fullContext: expertise.fullContext,
    },

    // Story 1.12 — new shape with feed entries.
    mindCloneEnrichment,

    // Instruction for the calling agent (now includes feed section).
    consultationPrompt: await buildConsultationPrompt(expertise, question, context, project, {
      feedEntries,
      noFeed,
    }),
  };

  // Save consultation to bridge-data for history
  saveConsultation(consultationId, consultationContext);

  return consultationContext;
}

/**
 * Build the prompt that the calling agent should use to generate
 * the expert's response.
 *
 * Story 1.12 — async because feed section uses ESM `renderFeedSection`.
 * Backward-compat: opts.noFeed=true or omitted feedEntries renders no Recent
 * Knowledge block; opts.feedEntries=[] renders staleness warning.
 *
 * @param {object} expertise
 * @param {string} question
 * @param {string} context
 * @param {string} project
 * @param {object} [opts]
 * @param {Array} [opts.feedEntries]
 * @param {boolean} [opts.noFeed]
 * @returns {Promise<string>}
 */
async function buildConsultationPrompt(expertise, question, context, project, opts = {}) {
  const name = expertise.name || 'Expert';
  const role = expertise.role || 'Domain Expert';
  const frameworkList = expertise.frameworks
    .slice(0, 5)
    .map(f => `- **${f.name}**: ${f.description}`)
    .join('\n');
  const principleList = expertise.principles
    .slice(0, 5)
    .map(p => `- ${p}`)
    .join('\n');

  // Story 1.12 — inject feed section between Principles and Question.
  let feedSection = '';
  if (!opts.noFeed) {
    try {
      const fr = await _loadFeedReader();
      feedSection = fr.renderFeedSection(opts.feedEntries || []);
    } catch {
      feedSection = '';
    }
  }

  return `You are now consulting as **${name}** (${role}).

Based on this expert's knowledge and frameworks, provide a focused recommendation.

## Expert's Key Frameworks
${frameworkList || '(see full context below)'}

## Expert's Core Principles
${principleList || '(see full context below)'}

${feedSection}
## Question
${question}

${context ? `## Context\n${context}` : ''}
${project ? `## Project: ${project}` : ''}

## Instructions
- Answer AS this expert, using their frameworks and mental models
- Be specific and actionable, not generic
- Reference the expert's specific methodologies when applicable
- Keep the response focused (3-5 key points max)
- End with a concrete next step recommendation`;
}

/**
 * Batch consult multiple experts on the same question.
 * Story 1.12 — async; awaits each consult so feed-reader injection completes.
 *
 * @returns {Promise<object[]>}
 */
async function batchConsult({ experts, question, context = '', project = '', agent = '', noFeed = false }) {
  const results = [];
  for (const expert of experts) {
    // Sequential to keep per-expert feed-stats logs in deterministic order.
    const r = await consult({ expert, question, context, project, agent, noFeed });
    results.push(r);
  }
  return results;
}

// ─── Bridge Integration ─────────────────────────────

function saveConsultation(id, data) {
  try {
    const dir = path.join(BRIDGE_DIR, 'consultations', id);
    fs.mkdirSync(dir, { recursive: true });

    // Save request
    const request = {
      id,
      expert: data.expert.id,
      question: data.question,
      context: data.projectContext,
      project: data.project,
      requested_at: new Date().toISOString(),
      requested_by: data.callingAgent || 'aios',
      mode: 'self-consultation',
    };
    fs.writeFileSync(
      path.join(dir, 'request.json'),
      JSON.stringify(request, null, 2),
      'utf-8'
    );

    // Log to sync log
    const logDir = path.join(BRIDGE_DIR, 'sync-log');
    fs.mkdirSync(logDir, { recursive: true });
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(logDir, `${date}.jsonl`);
    fs.appendFileSync(logFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      action: 'self_consultation',
      id,
      expert: data.expert.id,
      source: data.expert.source,
    }) + '\n', 'utf-8');
  } catch {
    // Non-blocking
  }
}

/**
 * Save the expert's response (generated by the calling agent).
 */
function saveResponse(consultationId, expertId, response) {
  try {
    const dir = path.join(BRIDGE_DIR, 'consultations', consultationId);
    const responseData = {
      consultation_id: consultationId,
      expert: expertId,
      response,
      mode: 'self-consultation',
      confidence: 'high',
      responded_at: new Date().toISOString(),
    };
    fs.writeFileSync(
      path.join(dir, 'response.json'),
      JSON.stringify(responseData, null, 2),
      'utf-8'
    );
  } catch {
    // Non-blocking
  }
}

// ─── List Available ─────────────────────────────────

function listAvailable() {
  const available = new Map();

  for (const searchPath of SEARCH_PATHS) {
    if (!fs.existsSync(searchPath)) continue;

    const source = searchPath.includes('mega brain') ? 'mega-brain' : 'aios-agent';
    const scanDir = (dir, dept = '') => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && !entry.name.startsWith('_')) {
            scanDir(path.join(dir, entry.name), entry.name);
          }
          if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
            const id = path.basename(entry.name, '.md');
            // Don't overwrite mega-brain entries with aios-agent
            if (!available.has(id)) {
              available.set(id, { id, source, department: dept || 'general' });
            }
          }
        }
      } catch { /* skip */ }
    };
    scanDir(searchPath);
  }

  return [...available.values()].sort((a, b) => a.id.localeCompare(b.id));
}

// ─── Auto-Conclave (Mini-Debate) ───────────────────

/**
 * Run an automatic mini-conclave: search top experts, consult each,
 * and synthesize a debate report with consensus and dissent points.
 *
 * @param {object} params
 * @param {string} params.question - The decision/question to debate
 * @param {string} [params.project] - Project name
 * @param {string} [params.agent] - Calling agent
 * @param {string} [params.context] - Additional context
 * @param {number} [params.experts_count] - Number of experts (default 3)
 * @returns {object} Conclave result with expert opinions + synthesis
 */
async function conclave({ question, project = '', agent = '', context = '', experts_count = 3, noFeed = false }) {
  const { search } = require('./consultation-engine');

  // Auto-detect project if not provided
  if (!project) {
    const detected = detectProject({ prompt: question + ' ' + context });
    project = detected.project;
  }

  // Step 1: Find best experts for this topic
  const topExperts = search(question, { project, agent, limit: experts_count });

  if (topExperts.length === 0) {
    return {
      success: false,
      error: 'No relevant experts found for this topic',
      suggestion: 'Try broadening your question or run: node self-consultation.js list-available',
    };
  }

  // Step 2: Consult each expert (Story 1.12 — await async batchConsult).
  const expertIds = topExperts.map(e => e.id);
  const consultations = await batchConsult({
    experts: expertIds,
    question,
    context,
    project,
    agent,
    noFeed,
  });

  // Step 3: Build debate synthesis
  const conclaveId = randomUUID();
  const successful = consultations.filter(c => c.success);
  const failed = consultations.filter(c => !c.success);

  const expertSummaries = successful.map(c => ({
    id: c.expert.id,
    name: c.expert.name,
    role: c.expert.role,
    source: c.expert.source,
    consultationId: c.consultationId,
    frameworks: c.expertKnowledge.frameworks.slice(0, 5),
    principles: c.expertKnowledge.principles.slice(0, 5),
  }));

  // Build the debate prompt for the calling agent to synthesize
  const debatePrompt = buildDebatePrompt(question, context, project, successful);

  const conclaveResult = {
    success: true,
    conclaveId,
    question,
    project,
    callingAgent: agent,
    expertCount: successful.length,
    experts: expertSummaries,
    failedExperts: failed.map(f => f.expert || f.error),
    consultationIds: successful.map(c => c.consultationId),

    // Individual consultation prompts (agent uses each to generate expert opinion)
    individualPrompts: successful.map(c => ({
      expertId: c.expert.id,
      expertName: c.expert.name,
      prompt: c.consultationPrompt,
    })),

    // Synthesis prompt (agent uses AFTER generating individual opinions)
    debatePrompt,
  };

  // Save conclave to bridge-data
  saveConclave(conclaveId, conclaveResult);

  return conclaveResult;
}

/**
 * Build a synthesis prompt that the agent uses after generating
 * each expert's individual response.
 */
function buildDebatePrompt(question, context, project, consultations) {
  const expertNames = consultations.map(c =>
    `**${c.expert.name}** (${c.expert.role})`
  ).join(', ');

  const frameworksSummary = consultations.map(c => {
    const fws = c.expertKnowledge.frameworks.slice(0, 3)
      .map(f => f.name).join(', ');
    return `- **${c.expert.name}**: ${fws || 'domain expertise'}`;
  }).join('\n');

  return `## Conclave Synthesis

You have consulted ${consultations.length} experts on: "${question}"
${project ? `Project: ${project}` : ''}

### Experts Consulted
${expertNames}

### Frameworks in Play
${frameworksSummary}

### Instructions
After generating each expert's individual recommendation above, now synthesize:

1. **CONSENSUS** — Points where experts agree. What do they ALL recommend?
2. **DISSENT** — Points where experts disagree. What are the tradeoffs?
3. **BLIND SPOTS** — What did no expert address? What risks remain?
4. **VERDICT** — Your synthesized recommendation combining the best insights.
5. **NEXT STEP** — One concrete action to take immediately.

${context ? `### Context\n${context}` : ''}

Format the synthesis as a concise report. Be specific, not generic.`;
}

/**
 * Save conclave results to bridge-data.
 */
function saveConclave(id, data) {
  try {
    const dir = path.join(BRIDGE_DIR, 'conclaves', id);
    fs.mkdirSync(dir, { recursive: true });

    // Save conclave request
    fs.writeFileSync(
      path.join(dir, 'conclave.json'),
      JSON.stringify({
        id,
        question: data.question,
        project: data.project,
        experts: data.experts.map(e => e.id),
        expert_count: data.expertCount,
        requested_at: new Date().toISOString(),
        requested_by: data.callingAgent || 'aios',
        consultation_ids: data.consultationIds,
      }, null, 2),
      'utf-8'
    );

    // Log to sync log
    const logDir = path.join(BRIDGE_DIR, 'sync-log');
    fs.mkdirSync(logDir, { recursive: true });
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(logDir, `${date}.jsonl`);
    fs.appendFileSync(logFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      action: 'auto_conclave',
      id,
      experts: data.experts.map(e => e.id),
      project: data.project,
    }) + '\n', 'utf-8');
  } catch {
    // Non-blocking
  }
}

// ─── CLI ────────────────────────────────────────────

async function main() {
  const [,, command, ...args] = process.argv;
  const opts = parseArgs(args);
  // Story 1.12 — flag style (no value): `--no-feed` disables feed injection.
  const noFeed = process.argv.includes('--no-feed');

  switch (command) {
    case 'consult': {
      if (!opts.expert || !opts.question) {
        console.error('Usage: node self-consultation.js consult --expert martin-fowler --question "..." [--project X] [--agent X] [--context "..."] [--no-feed]');
        process.exit(1);
      }
      const result = await consult({
        expert: opts.expert,
        question: opts.question,
        context: opts.context || '',
        project: opts.project || '',
        agent: opts.agent || '',
        noFeed,
      });
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    case 'batch': {
      if (!opts.experts || !opts.question) {
        console.error('Usage: node self-consultation.js batch --experts "a,b,c" --question "..." [--project X] [--no-feed]');
        process.exit(1);
      }
      const experts = opts.experts.split(',').map(e => e.trim());
      const results = await batchConsult({
        experts,
        question: opts.question,
        context: opts.context || '',
        project: opts.project || '',
        agent: opts.agent || '',
        noFeed,
      });
      console.log(JSON.stringify(results, null, 2));
      break;
    }

    case 'list-available': {
      const list = listAvailable();
      const megaBrain = list.filter(e => e.source === 'mega-brain');
      const aios = list.filter(e => e.source === 'aios-agent');
      console.log(`Available experts: ${list.length} total`);
      console.log(`  Mega Brain minds: ${megaBrain.length}`);
      console.log(`  AIOS agents: ${aios.length}`);
      console.log('\n' + JSON.stringify(list, null, 2));
      break;
    }

    case 'conclave': {
      if (!opts.question) {
        console.error('Usage: node self-consultation.js conclave --question "..." [--project X] [--agent X] [--context "..."] [--experts 3] [--no-feed]');
        process.exit(1);
      }
      const conclaveResult = await conclave({
        question: opts.question,
        project: opts.project || '',
        agent: opts.agent || '',
        context: opts.context || '',
        experts_count: parseInt(opts.experts) || 3,
        noFeed,
      });
      console.log(JSON.stringify(conclaveResult, null, 2));
      break;
    }

    case 'save-response': {
      if (!opts.id || !opts.expert || !opts.response) {
        console.error('Usage: node self-consultation.js save-response --id UUID --expert X --response "..."');
        process.exit(1);
      }
      saveResponse(opts.id, opts.expert, opts.response);
      console.log(JSON.stringify({ saved: true, id: opts.id }));
      break;
    }

    default:
      console.log(`Jarvis Self-Consultation Engine v1.1.0

Commands:
  consult --expert X --question "..." [--project X] [--agent X] [--context "..."]
    Consult a specific expert. Returns their knowledge context + consultation prompt.

  batch --experts "a,b,c" --question "..." [--project X]
    Consult multiple experts at once.

  conclave --question "..." [--project X] [--agent X] [--experts 3]
    Auto-conclave: search top experts, consult each, return debate synthesis prompt.
    Produces individual expert prompts + a synthesis prompt for consensus/dissent.

  list-available
    List all available experts (Mega Brain + AIOS agents).

  save-response --id UUID --expert X --response "..."
    Save the generated response back to bridge-data for history.

Examples:
  node self-consultation.js consult --expert martin-fowler --question "Microservices vs monolith?" --project tocks
  node self-consultation.js conclave --question "Best pricing strategy for luxury furniture?" --project tocks --agent pm
  node self-consultation.js batch --experts "alex-hormozi,pricing-strategist" --question "How to price?" --project tocks
  node self-consultation.js list-available
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

// Export for module use
module.exports = { consult, batchConsult, conclave, resolveExpert, extractExpertise, listAvailable, saveResponse };

if (require.main === module) {
  main().catch((err) => {
    console.error('[self-consultation] fatal:', err);
    process.exit(1);
  });
}
