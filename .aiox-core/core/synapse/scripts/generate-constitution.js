/**
 * Constitution Generator
 *
 * Reads .aiox-core/constitution.md and generates .synapse/constitution
 * in KEY=VALUE format for the SYNAPSE Context Engine L0 layer.
 *
 * Usage: node .aiox-core/core/synapse/scripts/generate-constitution.js
 *
 * @module core/synapse/scripts/generate-constitution
 * @version 1.0.0
 * @created Story SYN-8 - Domain Content Files
 */

const fs = require('fs');
const path = require('path');

/**
 * Roman numeral to Arabic number map (I-X)
 */
const ROMAN_TO_ARABIC = {
  'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
  'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
};

/**
 * Clean markdown formatting from text
 * Removes backticks and trims whitespace
 *
 * @param {string} text - Text with possible markdown formatting
 * @returns {string} Cleaned text
 */
function cleanText(text) {
  return text.replace(/`/g, '').trim();
}

/**
 * Parse constitution.md and extract articles with their rules
 *
 * @param {string} content - Raw markdown content of constitution.md
 * @returns {Array<{number: number, roman: string, title: string, severity: string, rules: string[]}>}
 */
function parseConstitution(content) {
  if (!content || typeof content !== 'string') {
    return [];
  }

  const articles = [];

  // Match article headers: ### I. Title (SEVERITY)
  const articleRegex = /^### ([IVXLC]+)\.\s+(.+?)\s*\(([^)]+)\)\s*$/gm;

  let match;
  const articlePositions = [];

  while ((match = articleRegex.exec(content)) !== null) {
    articlePositions.push({
      roman: match[1],
      title: match[2].trim(),
      severity: match[3].trim(),
      startIndex: match.index,
    });
  }

  for (let i = 0; i < articlePositions.length; i++) {
    const start = articlePositions[i].startIndex;
    const end = i + 1 < articlePositions.length
      ? articlePositions[i + 1].startIndex
      : content.indexOf('## Governance', start) !== -1
        ? content.indexOf('## Governance', start)
        : content.length;

    const articleContent = content.substring(start, end);
    const rules = extractRules(articleContent);

    const num = ROMAN_TO_ARABIC[articlePositions[i].roman];
    if (!num) {
      continue;
    }

    articles.push({
      number: num,
      roman: articlePositions[i].roman,
      title: articlePositions[i].title,
      severity: articlePositions[i].severity,
      rules,
    });
  }

  return articles;
}

/**
 * Extract rules from article content
 * Matches bullet points starting with MUST:, MUST NOT:, SHOULD:, SHOULD NOT:, EXCEPTION:
 *
 * @param {string} articleContent - Markdown content of a single article
 * @returns {string[]} Array of rule strings
 */
function extractRules(articleContent) {
  const rules = [];
  const lines = articleContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    const ruleMatch = trimmed.match(/^-\s+(MUST(?:\s+NOT)?|SHOULD(?:\s+NOT)?|EXCEPTION):\s+(.+)$/);
    if (ruleMatch) {
      rules.push(`${ruleMatch[1]}: ${cleanText(ruleMatch[2])}`);
    }
  }

  return rules;
}

/**
 * Generate KEY=VALUE constitution content from parsed articles
 *
 * @param {Array<{number: number, roman: string, title: string, severity: string, rules: string[]}>} articles
 * @returns {string} KEY=VALUE formatted content
 */
function generateConstitution(articles) {
  const lines = [
    '# SYNAPSE Constitution Domain (L0)',
    '# Auto-generated from .aiox-core/constitution.md',
    '# DO NOT EDIT MANUALLY — re-run generate-constitution.js',
    '',
  ];

  for (const article of articles) {
    lines.push(`# Article ${article.roman}: ${article.title} (${article.severity})`);

    // Rule 0: title + severity summary
    lines.push(`CONSTITUTION_RULE_ART${article.number}_0=${article.title} (${article.severity})`);

    // Subsequent rules from bullet points
    for (let i = 0; i < article.rules.length; i++) {
      lines.push(`CONSTITUTION_RULE_ART${article.number}_${i + 1}=${article.rules[i]}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Main entry point: read constitution.md, generate .synapse/constitution
 *
 * @param {object} [options] - Override paths for testing
 * @param {string} [options.projectRoot] - Project root directory
 * @param {string} [options.constitutionPath] - Path to constitution.md
 * @param {string} [options.outputPath] - Path to output file
 * @returns {{success: boolean, articles?: number, rules?: number, outputPath?: string, error?: string}}
 */
function main(options = {}) {
  const projectRoot = options.projectRoot || path.resolve(__dirname, '..', '..', '..', '..');
  const constitutionPath = options.constitutionPath || path.join(projectRoot, '.aiox-core', 'constitution.md');
  const outputPath = options.outputPath || path.join(projectRoot, '.synapse', 'constitution');

  // Read source
  let content;
  try {
    content = fs.readFileSync(constitutionPath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Constitution not found: ${constitutionPath}`);
      process.exitCode = 1;
      return { success: false, error: 'Constitution file not found' };
    }
    throw error;
  }

  // Parse articles
  const articles = parseConstitution(content);

  if (articles.length === 0) {
    console.error('No articles found in constitution.md');
    process.exitCode = 1;
    return { success: false, error: 'No articles found' };
  }

  // Generate output
  const output = generateConstitution(articles);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write output (idempotent — overwrites cleanly)
  fs.writeFileSync(outputPath, output, 'utf8');

  const totalRules = articles.reduce((sum, a) => sum + a.rules.length + 1, 0);
  console.log(`Constitution generated: ${articles.length} articles, ${totalRules} rules`);

  return { success: true, articles: articles.length, rules: totalRules, outputPath };
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { parseConstitution, extractRules, generateConstitution, cleanText, main, ROMAN_TO_ARABIC };
