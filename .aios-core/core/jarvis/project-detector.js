/**
 * Jarvis Project Detector
 *
 * Auto-detects the active project from context:
 * 1. AIOS_PROJECT env var (explicit override)
 * 2. Current working directory name matching known projects
 * 3. Active story file in docs/stories/
 * 4. Git branch name
 * 5. Package.json name field
 *
 * @module core/jarvis/project-detector
 * @version 1.0.0
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const AIOS_ROOT = process.env.AIOS_ROOT || 'D:/AIOS';

// Known project identifiers and their aliases
const PROJECT_MAP = {
  'tocks': ['tocks', 'kr-interiores', 'sales-dashboard', 'tocks-sales', 'sales-ai'],
  'serenity': ['serenity', 'serenity-ai', 'jaci', 'jaci-app'],
  'bretda': ['bretda', 'bretda-landingpage', 'bilhar', 'sinuca'],
  'low-ticket-10k': ['low-ticket', 'low-ticket-10k', '10k', 'finch', 'black-box'],
  'aiox-corporation': ['aiox-corp', 'aiox-corporation', 'corporation', 'corp'],
  'aios': ['aios', 'aiox', 'aiox-core', 'aios-core', 'synkra'],
};

/**
 * Detect the active project from all available signals.
 *
 * @param {object} [hints] - Optional hints to help detection
 * @param {string} [hints.cwd] - Working directory
 * @param {string} [hints.prompt] - User prompt text
 * @param {string} [hints.storyId] - Active story ID
 * @returns {{project: string, confidence: string, source: string}}
 */
function detect(hints = {}) {
  // 1. Explicit env var (highest priority)
  if (process.env.AIOS_PROJECT) {
    return {
      project: normalize(process.env.AIOS_PROJECT),
      confidence: 'high',
      source: 'env:AIOS_PROJECT',
    };
  }

  // 2. Detect from user prompt keywords
  if (hints.prompt) {
    const detected = detectFromText(hints.prompt);
    if (detected) {
      return { project: detected, confidence: 'high', source: 'prompt' };
    }
  }

  // 3. Active story in docs/stories/
  const storyProject = detectFromStories(hints.storyId);
  if (storyProject) {
    return { project: storyProject, confidence: 'medium', source: 'active-story' };
  }

  // 4. Git branch name
  const branchProject = detectFromBranch();
  if (branchProject) {
    return { project: branchProject, confidence: 'medium', source: 'git-branch' };
  }

  // 5. Current working directory
  const cwd = hints.cwd || process.cwd();
  const cwdProject = detectFromPath(cwd);
  if (cwdProject) {
    return { project: cwdProject, confidence: 'low', source: 'cwd' };
  }

  // 6. Default to 'aios' (we're in the AIOS monorepo)
  return { project: 'aios', confidence: 'low', source: 'default' };
}

/**
 * Normalize a project name to its canonical form.
 */
function normalize(input) {
  const lower = input.toLowerCase().trim();
  for (const [canonical, aliases] of Object.entries(PROJECT_MAP)) {
    if (aliases.includes(lower) || canonical === lower) {
      return canonical;
    }
  }
  return lower;
}

/**
 * Detect project from free text (prompt, story content).
 */
function detectFromText(text) {
  const lower = text.toLowerCase();

  // Check for explicit project mentions
  for (const [canonical, aliases] of Object.entries(PROJECT_MAP)) {
    for (const alias of aliases) {
      // Word boundary match to avoid false positives
      const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lower)) {
        return canonical;
      }
    }
  }

  // Check for project-specific keywords
  if (/\b(mesa|bilhar|sinuca|luxo|luxury.*furniture|moveis)\b/i.test(text)) return 'tocks';
  if (/\b(mental.*health|therapy|wellbeing|saude.*mental|jaci)\b/i.test(text)) return 'serenity';
  if (/\b(landing.*page|bretda|mesa.*sinuca)\b/i.test(text)) return 'bretda';
  if (/\b(low.*ticket|funil|funnel.*r\$|10k.*mes)\b/i.test(text)) return 'low-ticket-10k';
  if (/\b(corporation|departamento|hierarquia.*agent)\b/i.test(text)) return 'aiox-corporation';

  return null;
}

/**
 * Detect project from active stories in docs/stories/.
 */
function detectFromStories(storyId) {
  if (storyId) {
    return detectFromText(storyId);
  }

  const storiesDir = path.join(AIOS_ROOT, 'docs', 'stories', 'active');
  try {
    if (!fs.existsSync(storiesDir)) return null;
    const files = fs.readdirSync(storiesDir).filter(f => f.endsWith('.md'));
    if (files.length === 0) return null;

    // Check most recent story
    const sorted = files
      .map(f => ({ name: f, mtime: fs.statSync(path.join(storiesDir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);

    return detectFromText(sorted[0].name);
  } catch {
    return null;
  }
}

/**
 * Detect project from git branch name.
 */
function detectFromBranch() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: AIOS_ROOT,
      encoding: 'utf-8',
      timeout: 3000,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();

    if (branch === 'main' || branch === 'master') return null;
    return detectFromText(branch);
  } catch {
    return null;
  }
}

/**
 * Detect project from directory path.
 */
function detectFromPath(dirPath) {
  const parts = dirPath.replace(/\\/g, '/').split('/');
  // Check each path segment
  for (let i = parts.length - 1; i >= 0; i--) {
    const detected = detectFromText(parts[i]);
    if (detected && detected !== 'aios') return detected;
  }
  return null;
}

// ─── CLI ────────────────────────────────────────────
if (require.main === module) {
  const hints = {};
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--prompt' && args[i + 1]) hints.prompt = args[++i];
    if (args[i] === '--cwd' && args[i + 1]) hints.cwd = args[++i];
    if (args[i] === '--story' && args[i + 1]) hints.storyId = args[++i];
  }
  const result = detect(hints);
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { detect, normalize, detectFromText, PROJECT_MAP };
