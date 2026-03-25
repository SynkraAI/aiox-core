'use strict';

/**
 * Tier 3: Cross-Session Handoff
 *
 * Manages the human-readable session handoff markdown files in docs/.
 * Auto-trims to ~200 lines, archives excess to .aiox/session-history/.
 * Recovery validation compares handoff vs git status.
 *
 * @module cross-session-handoff
 * @see .claude/rules/unified-handoff.md
 * @see Story AIOX-HO-1
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/** Target max lines for trimmed handoff */
const MAX_LINES = 200;

/** Drift threshold for recovery validation (percentage) */
const DRIFT_THRESHOLD = 20;

/**
 * Resolve the handoff file path for a project.
 * @param {string} project - Project name (e.g., 'brand-system-service')
 * @param {string} [projectRoot] - Project root directory
 * @returns {string} Absolute path to docs/session-handoff-{project}.md
 */
function getHandoffFilePath(project, projectRoot) {
  const root = projectRoot || process.cwd();
  return path.join(root, 'docs', `session-handoff-${project}.md`);
}

/**
 * Resolve the archive directory for a project.
 * @param {string} project - Project name
 * @param {string} [projectRoot] - Project root directory
 * @returns {string} Absolute path to .aiox/session-history/{project}/
 */
function getArchiveDir(project, projectRoot) {
  const root = projectRoot || process.cwd();
  return path.join(root, '.aiox', 'session-history', project);
}

/**
 * Save a cross-session handoff file.
 *
 * @param {string} project - Project name
 * @param {object} data - Handoff data
 * @param {string} data.date - Date string
 * @param {string} data.lastSession - Last session summary
 * @param {string} data.next - Next step
 * @param {Array<{story: string, status: string, notes: string}>} [data.activeStories] - Active stories
 * @param {string[]} [data.recentWork] - Recent work items (last 5)
 * @param {object} [data.keyDocs] - Key documentation links
 * @param {string} [data.howToContinue] - Resume prompt
 * @param {string} [projectRoot] - Project root directory
 * @returns {string} Path to the saved file
 */
function saveHandoff(project, data, projectRoot) {
  const filePath = getHandoffFilePath(project, projectRoot);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const lines = [];
  lines.push(`# Session Handoff -- ${project}`);
  lines.push(`**Date:** ${data.date || new Date().toISOString().slice(0, 10)}`);
  lines.push(`**Last session:** ${data.lastSession || 'N/A'}`);
  lines.push(`**Next:** ${data.next || 'N/A'}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Active stories table
  if (data.activeStories && data.activeStories.length > 0) {
    lines.push('## Active Stories');
    lines.push('');
    lines.push('| Story | Status | Notes |');
    lines.push('|-------|--------|-------|');
    for (const s of data.activeStories) {
      lines.push(`| ${s.story} | ${s.status} | ${s.notes || ''} |`);
    }
    lines.push('');
  }

  // Recent work
  if (data.recentWork && data.recentWork.length > 0) {
    lines.push('## Recent Work');
    lines.push('');
    const items = data.recentWork.slice(0, 5);
    items.forEach((item, i) => {
      lines.push(`${i + 1}. ${item}`);
    });
    lines.push('');
  }

  // Key docs
  if (data.keyDocs && Object.keys(data.keyDocs).length > 0) {
    lines.push('## Key Docs');
    lines.push('');
    for (const [label, docPath] of Object.entries(data.keyDocs)) {
      lines.push(`- **${label}:** \`${docPath}\``);
    }
    lines.push('');
  }

  // How to continue
  if (data.howToContinue) {
    lines.push('## How to Continue');
    lines.push('');
    lines.push('```');
    lines.push(data.howToContinue);
    lines.push('```');
    lines.push('');
  }

  lines.push('---');
  lines.push(`*Handoff updated ${data.date || new Date().toISOString().slice(0, 10)}*`);

  const content = lines.join('\n');
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

/**
 * Trim a handoff file to ~MAX_LINES.
 * Preserves: header, active stories, last 5 work items, key docs, how to continue.
 * Archives excess content.
 *
 * @param {string} filePath - Absolute path to the handoff file
 * @param {string} [projectRoot] - Project root directory
 * @returns {{ trimmed: boolean, originalLines: number, newLines: number, archivePath: string|null }}
 */
function trimHandoff(filePath, projectRoot) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (_) {
    return { trimmed: false, originalLines: 0, newLines: 0, archivePath: null };
  }

  const lines = content.split('\n');
  const originalLines = lines.length;

  if (originalLines <= MAX_LINES) {
    return { trimmed: false, originalLines, newLines: originalLines, archivePath: null };
  }

  // Extract project name from filename
  const filename = path.basename(filePath, '.md');
  const project = filename.replace('session-handoff-', '');

  // Archive the full file first
  const archivePath = archiveSession(project, content, projectRoot);

  // Build trimmed version using section-aware approach
  const sections = parseSections(content);
  const trimmedLines = [];

  // 1. Header: everything before first ## (max 10 lines)
  if (sections.header) {
    const headerLines = sections.header.split('\n').filter((l) => l.trim()).slice(0, 10);
    trimmedLines.push(...headerLines);
    trimmedLines.push('');
    trimmedLines.push('---');
    trimmedLines.push('');
  }

  // Section matching patterns (supports Portuguese and English)
  const STORIES_PATTERNS = ['Estado Atual', 'Active Stories', 'Stories'];
  const WORK_PATTERNS = ['que foi feito', 'Recent Work', 'Sessao anterior', 'What was done'];
  const PLAN_PATTERNS = ['Plano de Execu', 'Execution Plan', 'Pendencias'];
  const DOCS_PATTERNS = ['Documentacao Chave', 'Key Docs', 'Documentacao'];
  const CONTINUE_PATTERNS = ['Como Continuar', 'How to Continue'];

  const matchSection = (title, patterns) =>
    patterns.some((p) => title.includes(p));

  // 2. Stories/Estado Atual section (keep summary table, max 40 lines)
  const storiesSection = sections.sections.find((s) => matchSection(s.title, STORIES_PATTERNS));
  if (storiesSection) {
    const sectionLines = storiesSection.content.split('\n');
    // Keep table lines and first few subsections
    const kept = sectionLines.slice(0, 40);
    trimmedLines.push(`## ${storiesSection.title}`);
    trimmedLines.push('');
    trimmedLines.push(...kept);
    trimmedLines.push('');
  }

  // 3. Recent Work section (keep last 5 top-level items with their sub-bullets, max 60 lines)
  const workSection = sections.sections.find((s) => matchSection(s.title, WORK_PATTERNS));
  if (workSection) {
    const workLines = workSection.content.split('\n');
    // Find ### headers (top-level work items)
    const itemStarts = [];
    workLines.forEach((line, idx) => {
      if (/^###\s/.test(line.trim())) {
        itemStarts.push(idx);
      }
    });

    if (itemStarts.length > 0) {
      // Keep last 5 items
      const lastStarts = itemStarts.slice(-5);
      const startIdx = lastStarts[0];
      const lastLines = workLines.slice(startIdx).filter((l) => l.trim()).slice(0, 60);
      trimmedLines.push('## Recent Work (trimmed)');
      trimmedLines.push('');
      trimmedLines.push(...lastLines);
      trimmedLines.push('');
    } else {
      // No ### headers, keep last 20 lines
      const lastLines = workLines.filter((l) => l.trim()).slice(-20);
      if (lastLines.length > 0) {
        trimmedLines.push('## Recent Work (trimmed)');
        trimmedLines.push('');
        trimmedLines.push(...lastLines);
        trimmedLines.push('');
      }
    }
  }

  // 4. Execution Plan (keep if present, max 30 lines)
  const planSection = sections.sections.find((s) => matchSection(s.title, PLAN_PATTERNS));
  if (planSection) {
    const planLines = planSection.content.split('\n').filter((l) => l.trim()).slice(0, 30);
    trimmedLines.push(`## ${planSection.title}`);
    trimmedLines.push('');
    trimmedLines.push(...planLines);
    trimmedLines.push('');
  }

  // 5. Key Docs section (keep as-is)
  const docsSection = sections.sections.find((s) => matchSection(s.title, DOCS_PATTERNS));
  if (docsSection) {
    trimmedLines.push(`## ${docsSection.title}`);
    trimmedLines.push('');
    trimmedLines.push(docsSection.content.trim());
    trimmedLines.push('');
  }

  // 6. How to Continue section (keep as-is)
  const continueSection = sections.sections.find((s) => matchSection(s.title, CONTINUE_PATTERNS));
  if (continueSection) {
    trimmedLines.push(`## ${continueSection.title}`);
    trimmedLines.push('');
    trimmedLines.push(continueSection.content.trim());
    trimmedLines.push('');
  }

  trimmedLines.push('---');
  trimmedLines.push(`*Handoff trimmed from ${originalLines} to ~${trimmedLines.length} lines. Full archive: ${archivePath}*`);

  const trimmedContent = trimmedLines.join('\n');
  fs.writeFileSync(filePath, trimmedContent, 'utf8');

  return {
    trimmed: true,
    originalLines,
    newLines: trimmedLines.length,
    archivePath,
  };
}

/**
 * Parse a markdown file into header + sections.
 * @param {string} content - Markdown content
 * @returns {{ header: string, sections: Array<{title: string, content: string}> }}
 */
function parseSections(content) {
  // Normalize line endings (Windows \r\n -> \n)
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  const result = { header: '', sections: [] };
  let currentSection = null;
  const headerLines = [];
  let headerDone = false;

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/);

    if (h2Match) {
      headerDone = true;
      if (currentSection) {
        result.sections.push(currentSection);
      }
      currentSection = { title: h2Match[1].trim(), content: '' };
    } else if (!headerDone) {
      headerLines.push(line);
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }

  if (currentSection) {
    result.sections.push(currentSection);
  }

  result.header = headerLines.join('\n');
  return result;
}

/**
 * Archive session content to .aiox/session-history/{project}/.
 *
 * @param {string} project - Project name
 * @param {string} content - Full handoff content to archive
 * @param {string} [projectRoot] - Project root directory
 * @returns {string} Path to the archive file
 */
function archiveSession(project, content, projectRoot) {
  const archiveDir = getArchiveDir(project, projectRoot);
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archivePath = path.join(archiveDir, `archive-${timestamp}.md`);
  fs.writeFileSync(archivePath, content, 'utf8');
  return archivePath;
}

/**
 * Validate handoff against current git state.
 * Returns a drift report.
 *
 * @param {string} project - Project name
 * @param {string} [projectRoot] - Project root directory
 * @returns {{ valid: boolean, drift: number, warning: string|null, handoffFiles: string[], gitFiles: string[] }}
 */
function validateHandoff(project, projectRoot) {
  const root = projectRoot || process.cwd();
  const filePath = getHandoffFilePath(project, root);

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (_) {
    return {
      valid: true,
      drift: 0,
      warning: null,
      handoffFiles: [],
      gitFiles: [],
    };
  }

  // Extract file paths mentioned in handoff (backtick-enclosed or in File List)
  const handoffFiles = extractFilePaths(content);

  // Get git status
  let gitFiles = [];
  try {
    const gitOutput = execSync('git status --short', {
      cwd: root,
      encoding: 'utf8',
      timeout: 5000,
    });
    gitFiles = gitOutput
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => l.trim().replace(/^[A-Z?!]\s+/, '').trim());
  } catch (_) {
    // Git not available or not a repo
    return {
      valid: true,
      drift: 0,
      warning: 'Could not run git status for validation',
      handoffFiles,
      gitFiles: [],
    };
  }

  // Calculate drift: files in git status that are NOT in handoff
  if (handoffFiles.length === 0) {
    return { valid: true, drift: 0, warning: null, handoffFiles, gitFiles };
  }

  const handoffSet = new Set(handoffFiles);
  const newInGit = gitFiles.filter((f) => !handoffSet.has(f));
  const driftPercent =
    gitFiles.length > 0
      ? Math.round((newInGit.length / gitFiles.length) * 100)
      : 0;

  const valid = driftPercent <= DRIFT_THRESHOLD;
  const warning = !valid
    ? `Handoff drift detected (${driftPercent}%). ${newInGit.length} files changed outside the last session.`
    : null;

  return { valid, drift: driftPercent, warning, handoffFiles, gitFiles };
}

/**
 * Extract file paths from markdown content.
 * Looks for backtick-enclosed paths and file list entries.
 * @param {string} content - Markdown content
 * @returns {string[]} Array of file paths
 */
function extractFilePaths(content) {
  const paths = new Set();

  // Match backtick-enclosed paths that look like files
  const backtickRegex = /`([^`]+\.[a-zA-Z]{1,10})`/g;
  let match;
  while ((match = backtickRegex.exec(content)) !== null) {
    const p = match[1].trim();
    // Filter: must contain / or \ to look like a path
    if (p.includes('/') || p.includes('\\')) {
      paths.add(p);
    }
  }

  return [...paths];
}

/**
 * Read the existing handoff file content.
 * @param {string} project - Project name
 * @param {string} [projectRoot] - Project root directory
 * @returns {string|null} File content or null
 */
function readHandoff(project, projectRoot) {
  const filePath = getHandoffFilePath(project, projectRoot);
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (_) {
    return null;
  }
}

/**
 * Get the line count of a handoff file.
 * @param {string} project - Project name
 * @param {string} [projectRoot] - Project root directory
 * @returns {number} Line count
 */
function getLineCount(project, projectRoot) {
  const content = readHandoff(project, projectRoot);
  if (!content) return 0;
  return content.split('\n').length;
}

module.exports = {
  saveHandoff,
  trimHandoff,
  archiveSession,
  validateHandoff,
  readHandoff,
  getLineCount,
  getHandoffFilePath,
  getArchiveDir,
  parseSections,
  extractFilePaths,
  MAX_LINES,
  DRIFT_THRESHOLD,
};
