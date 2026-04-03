/**
 * @module llm-judge
 * @description LLM-as-Judge scoring for HYDRA curator (Phase 2).
 * Uses Claude Haiku to score content across 5 dimensions.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { callClaude } from '../processor/extractor.js';
import { calculateWeightedScore, classifyTier, DEFAULT_WEIGHTS } from './scoring-rubric.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Load active projects from domains.yaml config.
 * Falls back to hardcoded list if config is unavailable.
 * @returns {string[]}
 */
function loadActiveProjects() {
  try {
    const configPath = path.join(__dirname, '../config/domains.yaml');
    const config = yaml.load(fs.readFileSync(configPath, 'utf-8'));
    const projects = new Set();
    for (const domain of Object.values(config.domains || {})) {
      for (const project of domain.projects || []) {
        projects.add(project);
      }
    }
    return [...projects];
  } catch {
    return ['aios', 'serenity-ai', 'tocks', 'kr-interiores', 'low-ticket-10k', 'bretda'];
  }
}

/**
 * Build the scoring prompt for Claude.
 * @param {string} title - Content title
 * @param {string} text - Normalized text (truncated for efficiency)
 * @param {string[]} domains - Target domains
 * @param {string[]} activeProjects - Active project names
 * @returns {string}
 */
function buildScoringPrompt(title, text, domains, activeProjects) {
  return `You are a content quality judge for a knowledge base that serves these active projects: ${activeProjects.join(', ')}.

Score this content across 5 dimensions (1-5 scale each):

1. **Relevance** (weight: 30%) — How relevant is this to the target domains [${domains.join(', ')}] and active projects?
2. **Novelty** (weight: 25%) — Does this bring new information, perspectives, or insights? Or is it common knowledge?
3. **Actionability** (weight: 20%) — Does it contain practical, implementable insights or recommendations?
4. **Authority** (weight: 15%) — Is the source/author credible and recognized in the field?
5. **Depth** (weight: 10%) — Is the analysis thorough and well-supported?

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "scores": {
    "relevance": <1-5>,
    "novelty": <1-5>,
    "actionability": <1-5>,
    "authority": <1-5>,
    "depth": <1-5>
  },
  "reasoning": "<1-2 sentences explaining the scores>"
}`;
}

/**
 * Score content using LLM-as-Judge.
 * @param {Object} params - Scoring parameters
 * @param {string} params.title - Content title
 * @param {string} params.normalizedText - Normalized content text
 * @param {string[]} params.domains - Associated domains
 * @param {number} [params.sourceAuthority] - Source authority override (1-5)
 * @returns {Promise<{ tier: string, action: string, label: string, weightedScore: number, scores: Object, reasoning: string }>}
 */
export async function scoreContent(params) {
  const { title, normalizedText, domains, sourceAuthority } = params;

  // Truncate text to save tokens (first 3000 chars is enough for scoring)
  const truncated = normalizedText.length > 3000
    ? normalizedText.slice(0, 3000) + '\n\n[... truncated for scoring ...]'
    : normalizedText;

  const activeProjects = loadActiveProjects();

  const systemPrompt = buildScoringPrompt(title, truncated, domains, activeProjects);
  const rawResponse = await callClaude(systemPrompt, `# ${title}\n\n${truncated}`);

  try {
    const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)```/) || rawResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawResponse;
    const parsed = JSON.parse(jsonStr);

    const scores = parsed.scores || {};

    // Override authority with source authority if provided
    if (sourceAuthority && !isNaN(sourceAuthority)) {
      scores.authority = Math.round((scores.authority + sourceAuthority) / 2);
    }

    const weightedScore = calculateWeightedScore(scores);
    const tierInfo = classifyTier(weightedScore);

    return {
      ...tierInfo,
      weightedScore: Math.round(weightedScore * 100) / 100,
      scores,
      reasoning: parsed.reasoning || '',
    };
  } catch {
    console.warn('[LLM-Judge] Failed to parse scoring response, defaulting to C tier');
    return {
      tier: 'C',
      action: 'skip_store_reference',
      label: 'C-Tier (Parse Error)',
      weightedScore: 1.5,
      scores: { relevance: 1, novelty: 1, actionability: 1, authority: 1, depth: 1 },
      reasoning: 'Failed to parse LLM scoring response',
    };
  }
}
