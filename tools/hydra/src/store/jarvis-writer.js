/**
 * @module jarvis-writer
 * @description Write curated content to Jarvis/Mega Brain knowledge base.
 * Generates Markdown files with frontmatter in the appropriate domain directory.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HYDRA_ROOT = path.resolve(__dirname, '../..');

const JARVIS_KB_ROOT = process.env.JARVIS_KB_ROOT || 'D:/jarvis/mega brain/knowledge';
const ORIGINALS_DIR = path.resolve(process.env.HYDRA_DATA_DIR || path.join(HYDRA_ROOT, 'hydra-data'), 'originals');

/**
 * @typedef {Object} WriteParams
 * @property {string} contentId - Unique content identifier
 * @property {string} title - Content title
 * @property {string} url - Source URL
 * @property {string} author - Author name
 * @property {Date} publishedAt - Publication date
 * @property {string} tier - Quality tier (S/A/B/C/D)
 * @property {number} weightedScore - Weighted quality score
 * @property {string[]} tags - Auto-generated tags
 * @property {string[]} domains - Target domains
 * @property {import('../processor/extractor.js').ExtractedInsight[]} insights - Extracted insights
 * @property {string[]} summary - Summary bullets
 * @property {string[]} quotes - Notable quotes
 * @property {string[]} entities - Named entities
 * @property {string} normalizedText - Full normalized text (for originals)
 * @property {Object} hallucinationResults - Hallucination check results
 */

/**
 * Sanitize a string for use as a filename.
 * @param {string} str - Raw string
 * @returns {string} Safe filename
 */
function sanitizeFilename(str) {
  // Explicit path traversal block (defense-in-depth)
  let safe = str;
  if (safe.includes('..') || safe.includes('/') || safe.includes('\\')) {
    safe = safe.replace(/\.\./g, '').replace(/[/\\]/g, '');
  }
  return safe
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Generate Markdown frontmatter + content for a KB entry.
 * @param {WriteParams} params - Write parameters
 * @returns {string} Markdown content
 */
function generateMarkdown(params) {
  const date = new Date(params.publishedAt).toISOString().split('T')[0];
  const now = new Date().toISOString();

  const confirmedInsights = (params.insights || []).filter((i) => {
    if (!params.hallucinationResults) return true;
    const check = params.hallucinationResults[i.insight];
    return !check || check.status !== 'HALLUCINATED';
  });

  let md = `---
title: "${params.title.replace(/"/g, '\\"')}"
source: "${params.url}"
author: "${params.author}"
date: ${date}
ingested: ${now}
tier: ${params.tier}
score: ${params.weightedScore}
tags: [${params.tags.map((t) => `"${t}"`).join(', ')}]
domains: [${params.domains.map((d) => `"${d}"`).join(', ')}]
entities: [${params.entities.map((e) => `"${e}"`).join(', ')}]
content_id: "${params.contentId}"
---

# ${params.title}

**Source:** [${params.url}](${params.url})
**Author:** ${params.author} | **Date:** ${date} | **Tier:** ${params.tier} (${params.weightedScore})

## Summary

${(params.summary || []).map((b) => `- ${b}`).join('\n')}

## Key Insights

`;

  for (const insight of confirmedInsights) {
    const status = params.hallucinationResults?.[insight.insight]?.status || 'UNVERIFIED';
    md += `### ${insight.type?.toUpperCase() || 'INSIGHT'} (confidence: ${insight.confidence}/5, ${status})\n\n`;
    md += `${insight.insight}\n\n`;
    if (insight.evidence) {
      md += `> **Evidence [P${insight.sourceParagraph}]:** "${insight.evidence}"\n\n`;
    }
  }

  if (params.quotes && params.quotes.length > 0) {
    md += `## Notable Quotes\n\n`;
    for (const quote of params.quotes) {
      md += `> ${quote}\n\n`;
    }
  }

  md += `---\n*Ingested by HYDRA on ${now}*\n`;

  return md;
}

/**
 * Ensure a directory exists.
 * @param {string} dirPath - Directory path
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write curated content to the Jarvis KB.
 * @param {WriteParams} params - Content parameters
 * @returns {Promise<{ written: boolean, paths: string[], errors: string[] }>}
 */
export async function writeToJarvisKB(params) {
  const paths = [];
  const errors = [];

  try {
    const filename = `${new Date(params.publishedAt).toISOString().split('T')[0]}-${sanitizeFilename(params.title)}.md`;
    const markdown = generateMarkdown(params);

    // Write to each domain directory
    for (const domain of params.domains) {
      const domainDir = path.join(JARVIS_KB_ROOT, domain);
      ensureDir(domainDir);

      const filePath = path.join(domainDir, filename);
      // Path traversal prevention: verify resolved path is within KB root
      const resolvedPath = path.resolve(filePath);
      const resolvedRoot = path.resolve(JARVIS_KB_ROOT);
      if (!resolvedPath.startsWith(resolvedRoot)) {
        errors.push(`SECURITY: Path traversal detected: ${resolvedPath}`);
        continue;
      }
      fs.writeFileSync(filePath, markdown, 'utf-8');
      paths.push(filePath);
    }

    // Save original text for reference (Anti-Hallucination Contramedida 6)
    if (params.normalizedText) {
      const originalsDir = path.resolve(ORIGINALS_DIR);
      ensureDir(originalsDir);

      const originalPath = path.join(originalsDir, `${params.contentId}.md`);
      const originalContent = `---
title: "${params.title.replace(/"/g, '\\"')}"
source: "${params.url}"
content_id: "${params.contentId}"
saved: ${new Date().toISOString()}
---

${params.normalizedText}
`;
      fs.writeFileSync(originalPath, originalContent, 'utf-8');
      paths.push(originalPath);
    }
  } catch (error) {
    errors.push(`Failed to write KB entry: ${error.message}`);
  }

  return {
    written: errors.length === 0,
    paths,
    errors,
  };
}

/**
 * Write a metadata-only reference (for B-tier content).
 * @param {WriteParams} params - Content parameters
 * @returns {Promise<{ written: boolean, path: string }>}
 */
export async function writeMetadataOnly(params) {
  try {
    const indexDir = path.resolve(process.env.HYDRA_DATA_DIR || path.join(HYDRA_ROOT, 'hydra-data'), 'index');
    ensureDir(indexDir);

    const entry = {
      contentId: params.contentId,
      title: params.title,
      url: params.url,
      author: params.author,
      publishedAt: new Date(params.publishedAt).toISOString(),
      tier: params.tier,
      score: params.weightedScore,
      tags: params.tags,
      domains: params.domains,
      summary: params.summary,
      processedAt: new Date().toISOString(),
    };

    const indexPath = path.join(indexDir, 'content-metadata.jsonl');
    fs.appendFileSync(indexPath, JSON.stringify(entry) + '\n', 'utf-8');

    return { written: true, path: indexPath };
  } catch (error) {
    console.error(`[JarvisWriter] Failed to write metadata: ${error.message}`);
    return { written: false, path: '' };
  }
}
