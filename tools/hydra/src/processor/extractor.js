/**
 * @module extractor
 * @description LLM-powered extraction via configurable provider (Anthropic, DeepSeek, OpenAI-compatible).
 * Extracts insights with mandatory evidence grounding (Anti-Hallucination).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PATTERNS_DIR = path.resolve(__dirname, '../../patterns');

/**
 * @typedef {Object} ExtractedInsight
 * @property {string} insight - The extracted insight
 * @property {string} evidence - Verbatim excerpt from original text that supports it
 * @property {number} sourceParagraph - Paragraph number where evidence was found
 * @property {number} confidence - Self-assessed confidence 1-5
 * @property {'fact'|'opinion'|'framework'|'quote'|'recommendation'} type - Insight type
 */

/**
 * @typedef {Object} ExtractionResult
 * @property {ExtractedInsight[]} insights - Extracted insights with evidence
 * @property {string[]} summary - 3-5 bullet summary
 * @property {string[]} tags - Auto-generated tags (max 10)
 * @property {string[]} entities - People, companies, technologies mentioned
 * @property {string[]} quotes - Notable quotes from the content
 * @property {string} tier - Suggested tier (S/A/B/C/D)
 * @property {Object} scores - Scoring breakdown
 */

/**
 * @typedef {'anthropic'|'deepseek'|'openai'} LLMProvider
 */

/**
 * Load a Fabric pattern from the patterns directory.
 * @param {string} patternName - Pattern directory name
 * @returns {string} System prompt from the pattern
 */
export function loadPattern(patternName) {
  const patternPath = path.join(PATTERNS_DIR, patternName, 'system.md');
  if (!fs.existsSync(patternPath)) {
    throw new Error(`Pattern "${patternName}" not found at ${patternPath}`);
  }
  return fs.readFileSync(patternPath, 'utf-8');
}

// --- Provider detection & client management ---

/**
 * Detect which LLM provider to use based on available environment variables.
 * Priority: ANTHROPIC > DEEPSEEK > OPENAI
 * @returns {{ provider: LLMProvider, apiKey: string, model: string, baseURL?: string }}
 */
export function detectProvider() {
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.HYDRA_MODEL || 'claude-haiku-4-5-20251001',
    };
  }

  if (process.env.DEEPSEEK_API_KEY) {
    return {
      provider: 'deepseek',
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: process.env.HYDRA_MODEL || 'deepseek-chat',
      baseURL: 'https://api.deepseek.com',
    };
  }

  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.HYDRA_MODEL || 'gpt-4o-mini',
    };
  }

  throw new Error(
    'No LLM API key found. Set one of: ANTHROPIC_API_KEY, DEEPSEEK_API_KEY, or OPENAI_API_KEY'
  );
}

/** @type {any} */
let _client = null;
/** @type {{ provider: LLMProvider, model: string } | null} */
let _providerInfo = null;

/**
 * Initialize the LLM client with a specific provider config.
 * @param {any} [clientInstance] - Optional pre-configured client
 * @param {{ provider: LLMProvider, model: string }} [providerInfo] - Provider info
 */
export function initAnthropicClient(clientInstance, providerInfo) {
  _client = clientInstance || null;
  _providerInfo = providerInfo || null;
}

/**
 * Get or create the LLM client based on detected provider.
 * @returns {Promise<{ client: any, provider: LLMProvider, model: string }>}
 */
async function getClient() {
  if (_client && _providerInfo) {
    return { client: _client, ...(_providerInfo) };
  }

  const config = detectProvider();

  if (config.provider === 'anthropic') {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    _client = new Anthropic({ apiKey: config.apiKey });
  } else {
    // DeepSeek and OpenAI use the same OpenAI-compatible SDK
    const { default: OpenAI } = await import('openai');
    _client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  _providerInfo = { provider: config.provider, model: config.model };
  return { client: _client, provider: config.provider, model: config.model };
}

/**
 * Call LLM with a system prompt and content. Works with any supported provider.
 * @param {string} systemPrompt - System prompt (from Fabric pattern)
 * @param {string} content - User content to process
 * @param {string} [modelOverride] - Model override (uses detected default otherwise)
 * @returns {Promise<string>} Model response text
 */
export async function callClaude(systemPrompt, content, modelOverride) {
  const { client, provider, model } = await getClient();
  const useModel = modelOverride || model;

  if (provider === 'anthropic') {
    const response = await client.messages.create({
      model: useModel,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content }],
    });
    const textBlock = response.content.find((block) => block.type === 'text');
    return textBlock?.text || '';
  }

  // OpenAI-compatible (DeepSeek, OpenAI, etc.)
  const response = await client.chat.completions.create({
    model: useModel,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content },
    ],
    temperature: 0.3,
  });

  return response.choices?.[0]?.message?.content || '';
}

/**
 * Get the current provider name (for logging).
 * @returns {string}
 */
export function getProviderName() {
  if (_providerInfo) return `${_providerInfo.provider}/${_providerInfo.model}`;
  try {
    const config = detectProvider();
    return `${config.provider}/${config.model}`;
  } catch {
    return 'none';
  }
}

/**
 * Check if any LLM API key is available.
 * @returns {boolean}
 */
export function hasLLMKey() {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY);
}

/**
 * Extract wisdom/insights from content using the extract_wisdom pattern.
 * Returns structured insights with evidence grounding.
 * @param {string} numberedText - Paragraph-numbered content
 * @param {string} title - Content title for context
 * @returns {Promise<ExtractionResult>}
 */
export async function extractWisdom(numberedText, title) {
  const systemPrompt = loadPattern('extract_wisdom');
  const userContent = `# ${title}\n\n${numberedText}`;
  const rawResponse = await callClaude(systemPrompt, userContent);

  try {
    // Try parsing as JSON first
    const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)```/) || rawResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawResponse;
    const parsed = JSON.parse(jsonStr);

    return {
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      summary: Array.isArray(parsed.summary) ? parsed.summary : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      entities: Array.isArray(parsed.entities) ? parsed.entities : [],
      quotes: Array.isArray(parsed.quotes) ? parsed.quotes : [],
      tier: parsed.tier || 'C',
      scores: parsed.scores || {},
    };
  } catch {
    // If JSON parsing fails, return a minimal result
    console.warn('[Extractor] Failed to parse extraction JSON, returning raw text as single insight');
    return {
      insights: [
        {
          insight: rawResponse.slice(0, 500),
          evidence: '',
          sourceParagraph: 0,
          confidence: 1,
          type: 'fact',
        },
      ],
      summary: [rawResponse.slice(0, 200)],
      tags: [],
      entities: [],
      quotes: [],
      tier: 'C',
      scores: {},
    };
  }
}

/**
 * Process long content in chunks, extracting wisdom from each chunk independently,
 * then return per-chunk results for aggregation.
 *
 * @param {Array<{index: number, text: string, startToken: number, endToken: number}>} chunks
 * @param {string} title - Content title
 * @param {Object} [options={}]
 * @param {boolean} [options.verbose=false] - Log progress
 * @returns {Promise<Array<{chunkIndex: number, result: ExtractionResult}>>}
 */
export async function processChunked(chunks, title, options = {}) {
  const { verbose = false } = options;
  const results = [];

  for (const chunk of chunks) {
    const chunkLabel = `[Chunk ${chunk.index + 1}/${chunks.length}]`;
    if (verbose) {
      console.log(`${chunkLabel} Processing "${title}" (tokens: ~${chunk.endToken - chunk.startToken})...`);
    }

    try {
      // Number paragraphs within this chunk for evidence grounding
      const paragraphs = chunk.text.split(/\n\n+/).filter((p) => p.trim());
      const numbered = paragraphs.map((p, i) => `[P${i + 1}] ${p.trim()}`).join('\n\n');

      const result = await extractWisdom(numbered, `${title} (Part ${chunk.index + 1})`);
      results.push({ chunkIndex: chunk.index, result });
    } catch (error) {
      console.error(`${chunkLabel} Extraction failed: ${error.message}`);
      results.push({
        chunkIndex: chunk.index,
        result: {
          insights: [],
          summary: [],
          tags: [],
          entities: [],
          quotes: [],
          tier: 'C',
          scores: {},
        },
      });
    }
  }

  return results;
}

/**
 * Summarize content using the summarize pattern.
 * @param {string} text - Normalized text
 * @param {string} title - Content title
 * @returns {Promise<string[]>} 3-5 bullet summary
 */
export async function summarize(text, title) {
  const systemPrompt = loadPattern('summarize');
  const rawResponse = await callClaude(systemPrompt, `# ${title}\n\n${text}`);

  // Parse bullet points
  const bullets = rawResponse
    .split('\n')
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter((line) => line.length > 10);

  return bullets.slice(0, 5);
}

/**
 * Score content using the label_and_rate pattern.
 * @param {string} text - Normalized text
 * @param {string} title - Content title
 * @param {string[]} domains - Target domains for relevance check
 * @returns {Promise<{ tier: string, scores: Object, label: string }>}
 */
export async function labelAndRate(text, title, domains = []) {
  const systemPrompt = loadPattern('label_and_rate');
  const context = domains.length > 0 ? `\n\nTarget domains: ${domains.join(', ')}` : '';
  const rawResponse = await callClaude(systemPrompt, `# ${title}${context}\n\n${text}`);

  try {
    const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)```/) || rawResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawResponse;
    return JSON.parse(jsonStr);
  } catch {
    return { tier: 'C', scores: {}, label: 'unparseable' };
  }
}
