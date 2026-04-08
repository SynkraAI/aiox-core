#!/usr/bin/env node
'use strict';

/**
 * Code Review Ping-Pong v3 — Round File Validator
 *
 * Subset YAML parser (single-line scalars, flat arrays, arrays of flat objects).
 * Does NOT support: block scalars (|, >), nested arrays, multiline strings.
 * Validates structure, required fields, and YAML↔Markdown consistency for both review AND fix files.
 *
 * Copy this to .code-review-ping-pong/validate.cjs in any project using the protocol.
 *
 * Usage: node validate.cjs <round-file.md>
 * Example: node validate.cjs round-1.md
 */

const fs = require('fs');
const path = require('path');

// --- File resolution ---

const file = process.argv[2];
if (!file) {
  console.error('Usage: node validate.cjs <round-file.md>');
  process.exit(1);
}

function resolveFile(f) {
  const direct = path.resolve(f);
  if (fs.existsSync(direct)) return direct;
  const inDir = path.resolve(process.cwd(), '.code-review-ping-pong', f);
  if (fs.existsSync(inDir)) return inDir;
  return null;
}

const resolvedPath = resolveFile(file);
if (!resolvedPath) {
  console.error(`File not found: ${file}`);
  process.exit(1);
}

const content = fs.readFileSync(resolvedPath, 'utf-8');
const errors = [];
const warnings = [];

// --- Extract frontmatter ---

const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
if (!fmMatch) {
  console.error('FAIL: No YAML frontmatter found. File must start with --- block.');
  process.exit(1);
}

const yamlRaw = fmMatch[1];
const markdownBody = content.slice(fmMatch[0].length);

// --- Subset YAML parser ---
// Supports: top-level single-line scalars, arrays of strings, arrays of flat objects, nested scalar objects.
// Does NOT support: block scalars (| or >), multiline strings, nested arrays/objects within arrays.
// This is intentional — the protocol constrains all YAML values to single-line to stay within this subset.

function parseYaml(raw) {
  const result = {};
  const lines = raw.split('\n');
  let currentKey = null;
  let currentArray = null;
  let currentObj = null;

  function flushArray() {
    if (currentArray !== null) {
      if (currentObj) { currentArray.push(currentObj); currentObj = null; }
      result[currentKey] = currentArray;
      currentArray = null;
    }
  }

  function cleanVal(v) {
    return (v || '').replace(/^["']|["']$/g, '').trim();
  }

  for (const line of lines) {
    // Skip empty lines and comments
    if (line.trim() === '' || line.trim().startsWith('#')) continue;

    // Top-level key (no leading whitespace): "key: value" or "key:"
    const topLevel = line.match(/^(\w[\w_]*):\s*(.*)$/);

    // Array item start: "  - key: val" or "  - val" (2+ spaces before dash)
    const arrayItemKV = line.match(/^\s+- (\w[\w_]*):\s*(.*)$/);
    const arrayItemSimple = line.match(/^\s+- ["']?(.+?)["']?\s*$/);

    // Continuation of array object: "    key: val" (4+ spaces, no dash)
    const objContinuation = line.match(/^\s{4,}(\w[\w_]*):\s*["']?(.+?)["']?\s*$/);

    // Nested scalar under top-level object: "  key: val" (2 spaces, no dash)
    const nestedScalar = line.match(/^\s{2,3}(\w[\w_]*):\s*["']?(.+?)["']?\s*$/);

    if (topLevel && !line.match(/^\s/)) {
      // New top-level key
      flushArray();
      currentKey = topLevel[1];
      const val = cleanVal(topLevel[2]);

      if (val === '' || val === '[]') {
        currentArray = [];
        if (val === '[]') {
          result[currentKey] = [];
          currentArray = null;
        }
      } else {
        result[currentKey] = val;
      }
    } else if (currentArray !== null && arrayItemKV) {
      // New object in array: "  - id: 1.1"
      if (currentObj) currentArray.push(currentObj);
      currentObj = {};
      currentObj[arrayItemKV[1]] = cleanVal(arrayItemKV[2]);
    } else if (currentArray !== null && currentObj && objContinuation) {
      // Continue object: "    severity: HIGH"
      currentObj[objContinuation[1]] = cleanVal(objContinuation[2]);
    } else if (currentArray !== null && arrayItemSimple && !arrayItemKV) {
      // Simple array item: "  - some/path"
      if (currentObj) { currentArray.push(currentObj); currentObj = null; }
      currentArray.push(cleanVal(arrayItemSimple[1]));
    } else if (currentArray === null && currentKey && nestedScalar) {
      // Nested object scalar (e.g., quality_checks.lint)
      if (typeof result[currentKey] !== 'object' || Array.isArray(result[currentKey])) {
        result[currentKey] = {};
      }
      result[currentKey][nestedScalar[1]] = cleanVal(nestedScalar[2]);
    }
  }

  flushArray();
  return result;
}

const yaml = parseYaml(yamlRaw);

// --- Common validations ---

if (yaml.protocol !== 'code-review-ping-pong') {
  errors.push(`protocol must be "code-review-ping-pong", got "${yaml.protocol}"`);
}

const type = yaml.type;
if (!type || !['review', 'fix', 'audit'].includes(type)) {
  errors.push(`type must be "review", "fix", or "audit", got "${type}"`);
}

const round = Number(yaml.round);
if (!yaml.round || isNaN(round) || round < 1) {
  errors.push(`round must be a positive number, got "${yaml.round}"`);
}

if (!yaml.date) errors.push('date is required');
if (!yaml.branch) errors.push('branch is required');

// --- Review-specific ---

if (type === 'review') {
  const required = ['reviewer', 'commit_sha', 'score', 'verdict'];
  for (const key of required) {
    if (!yaml[key]) errors.push(`review missing required field: ${key}`);
  }

  const verdict = yaml.verdict;
  if (verdict && !['CONTINUE', 'PERFECT'].includes(verdict)) {
    errors.push(`verdict must be CONTINUE or PERFECT, got "${verdict}"`);
  }

  const score = Number(yaml.score);
  if (isNaN(score) || score < 1 || score > 10) {
    errors.push(`score must be 1-10, got "${yaml.score}"`);
  }

  if (verdict === 'PERFECT' && score !== 10) {
    errors.push(`verdict is PERFECT but score is ${score} (must be 10)`);
  }
  if (score === 10 && verdict !== 'PERFECT') {
    errors.push(`score is 10 but verdict is ${verdict} (must be PERFECT when score is 10)`);
  }

  // files_in_scope
  if (!Array.isArray(yaml.files_in_scope) || yaml.files_in_scope.length === 0) {
    errors.push('files_in_scope must be a non-empty array');
  }

  // issues array
  const issues = yaml.issues;
  if (!Array.isArray(issues)) {
    errors.push('issues must be an array (use [] if PERFECT)');
  } else {
    if (verdict === 'PERFECT' && issues.length > 0) {
      errors.push(`verdict is PERFECT but issues array has ${issues.length} items (must be empty)`);
    }

    // Validate each issue object
    for (const issue of issues) {
      if (typeof issue !== 'object') {
        errors.push(`issues array contains non-object item: ${JSON.stringify(issue)}`);
        continue;
      }
      const issueRequired = ['id', 'severity', 'title', 'file', 'line', 'suggestion'];
      for (const field of issueRequired) {
        if (!issue[field]) {
          errors.push(`issue ${issue.id || '?'} missing field: ${field}`);
        }
      }
      if (issue.severity && !['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(issue.severity)) {
        errors.push(`issue ${issue.id} has invalid severity: ${issue.severity}`);
      }
    }

    // --- YAML↔Markdown consistency ---
    const yamlIds = issues.map(i => i.id).filter(Boolean).sort();
    const mdIssuePattern = /####\s+Issue\s+([\d.]+)/g;
    const mdIds = [];
    let match;
    while ((match = mdIssuePattern.exec(markdownBody)) !== null) {
      mdIds.push(match[1]);
    }
    mdIds.sort();

    if (yamlIds.length > 0 || mdIds.length > 0) {
      if (yamlIds.length !== mdIds.length) {
        errors.push(`YAML has ${yamlIds.length} issues but Markdown has ${mdIds.length} Issue headings — they must match`);
      } else {
        const mismatched = yamlIds.filter((id, i) => id !== mdIds[i]);
        if (mismatched.length > 0) {
          errors.push(`YAML/Markdown issue ID mismatch: YAML=[${yamlIds.join(',')}] MD=[${mdIds.join(',')}]`);
        }
      }
    }
  }
}

// --- Fix-specific ---

if (type === 'fix') {
  const required = ['fixer', 'review_file', 'commit_sha_before', 'issues_fixed', 'issues_total'];
  for (const key of required) {
    if (!yaml[key]) errors.push(`fix missing required field: ${key}`);
  }

  // git_diff_stat is the new preferred field; commit_sha_after is optional
  if (!yaml.git_diff_stat && !yaml.commit_sha_after) {
    warnings.push('neither git_diff_stat nor commit_sha_after present — at least one recommended for git state tracking');
  }

  if (!yaml.quality_checks) {
    errors.push('quality_checks is required for fix files');
  }

  // fixes array
  const fixes = yaml.fixes;
  if (!Array.isArray(fixes)) {
    errors.push('fixes must be an array');
  } else {
    for (const fix of fixes) {
      if (typeof fix !== 'object') {
        errors.push(`fixes array contains non-object item: ${JSON.stringify(fix)}`);
        continue;
      }
      if (!fix.id) errors.push('fix item missing id');
      if (!fix.status || !['FIXED', 'SKIPPED', 'PARTIAL'].includes(fix.status)) {
        errors.push(`fix ${fix.id || '?'} has invalid status: ${fix.status}`);
      }
    }

    // Count consistency
    const totalFromYaml = Number(yaml.issues_total) || 0;
    if (fixes.length !== totalFromYaml) {
      errors.push(`fixes array has ${fixes.length} items but issues_total says ${totalFromYaml}`);
    }

    const fixedCount = fixes.filter(f => f.status === 'FIXED').length;
    const declaredFixed = Number(yaml.issues_fixed) || 0;
    if (fixedCount !== declaredFixed) {
      errors.push(`issues_fixed says ${declaredFixed} but ${fixedCount} fixes have status FIXED`);
    }

    const skippedCount = fixes.filter(f => f.status === 'SKIPPED').length;
    const declaredSkipped = Number(yaml.issues_skipped) || 0;
    if (skippedCount !== declaredSkipped) {
      errors.push(`issues_skipped says ${declaredSkipped} but ${skippedCount} fixes have status SKIPPED`);
    }

    // Validate each fix has required fields
    for (const fix of fixes) {
      if (typeof fix !== 'object') continue;
      if (!fix.deviation) {
        warnings.push(`fix ${fix.id || '?'} missing deviation field (use "none" if no deviation)`);
      }
    }

    // --- YAML↔Markdown consistency for fix reports ---
    // Match "### Fix for Issue X.Y" and "Issue X.Y" in Skipped Issues
    const yamlFixIds = fixes.map(f => f.id).filter(Boolean).sort();

    const mdFixPattern = /###\s+Fix for Issue\s+([\d.]+)/g;
    const mdSkipPattern = /\*\*Issue\s+([\d.]+)/g;
    const mdFixIds = [];
    let fixMatch;
    while ((fixMatch = mdFixPattern.exec(markdownBody)) !== null) {
      mdFixIds.push(fixMatch[1]);
    }
    while ((fixMatch = mdSkipPattern.exec(markdownBody)) !== null) {
      mdFixIds.push(fixMatch[1]);
    }
    mdFixIds.sort();

    if (yamlFixIds.length > 0 || mdFixIds.length > 0) {
      if (yamlFixIds.length !== mdFixIds.length) {
        errors.push(`YAML has ${yamlFixIds.length} fixes but Markdown has ${mdFixIds.length} Fix/Skip entries — they must match`);
      } else {
        const mismatched = yamlFixIds.filter((id, i) => id !== mdFixIds[i]);
        if (mismatched.length > 0) {
          errors.push(`YAML/Markdown fix ID mismatch: YAML=[${yamlFixIds.join(',')}] MD=[${mdFixIds.join(',')}]`);
        }
      }
    }
  }
}

// --- Audit-specific ---

if (type === 'audit') {
  const required = ['auditor', 'commit_sha', 'process_health'];
  for (const key of required) {
    if (!yaml[key]) errors.push(`audit missing required field: ${key}`);
  }

  const health = Number(yaml.process_health);
  if (isNaN(health) || health < 1 || health > 10) {
    errors.push(`process_health must be 1-10, got "${yaml.process_health}"`);
  }

  if (!Array.isArray(yaml.files_in_scope) || yaml.files_in_scope.length === 0) {
    errors.push('files_in_scope must be a non-empty array');
  }

  if (!Array.isArray(yaml.rounds_reviewed) || yaml.rounds_reviewed.length === 0) {
    errors.push('rounds_reviewed must be a non-empty array');
  }

  // new_issues array
  const newIssues = yaml.new_issues;
  if (!Array.isArray(newIssues)) {
    errors.push('new_issues must be an array (use [] if none found)');
  } else {
    for (const issue of newIssues) {
      if (typeof issue !== 'object') {
        errors.push(`new_issues contains non-object item: ${JSON.stringify(issue)}`);
        continue;
      }
      const issueRequired = ['id', 'severity', 'title', 'file', 'line', 'suggestion', 'missed_by'];
      for (const field of issueRequired) {
        if (!issue[field]) {
          errors.push(`audit issue ${issue.id || '?'} missing field: ${field}`);
        }
      }
      if (issue.severity && !['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(issue.severity)) {
        errors.push(`audit issue ${issue.id} has invalid severity: ${issue.severity}`);
      }
      if (issue.missed_by && !['review', 'fix', 'both'].includes(issue.missed_by)) {
        errors.push(`audit issue ${issue.id} has invalid missed_by: ${issue.missed_by}`);
      }
      // Audit issue IDs must start with "A"
      if (issue.id && !issue.id.startsWith('A')) {
        errors.push(`audit issue ${issue.id} must use "A" prefix (e.g., A${round}.1)`);
      }
    }

    // YAML↔Markdown consistency for audit
    const yamlAuditIds = newIssues.map(i => i.id).filter(Boolean).sort();
    const mdAuditPattern = /####\s+Issue\s+(A[\d.]+)/g;
    const mdAuditIds = [];
    let auditMatch;
    while ((auditMatch = mdAuditPattern.exec(markdownBody)) !== null) {
      mdAuditIds.push(auditMatch[1]);
    }
    mdAuditIds.sort();

    if (yamlAuditIds.length > 0 || mdAuditIds.length > 0) {
      if (yamlAuditIds.length !== mdAuditIds.length) {
        errors.push(`YAML has ${yamlAuditIds.length} audit issues but Markdown has ${mdAuditIds.length} Issue headings — they must match`);
      } else {
        const mismatched = yamlAuditIds.filter((id, i) => id !== mdAuditIds[i]);
        if (mismatched.length > 0) {
          errors.push(`YAML/Markdown audit ID mismatch: YAML=[${yamlAuditIds.join(',')}] MD=[${mdAuditIds.join(',')}]`);
        }
      }
    }
  }

  // findings array (optional but validated if present)
  const findings = yaml.findings;
  if (findings && Array.isArray(findings)) {
    const validTypes = ['recurring_issue', 'fix_quality', 'regression_missed', 'architecture_gap', 'blind_spot', 'review_drift'];
    for (const finding of findings) {
      if (typeof finding !== 'object') continue;
      if (finding.type && !validTypes.includes(finding.type)) {
        errors.push(`finding has invalid type: ${finding.type}. Valid: ${validTypes.join(', ')}`);
      }
    }
  }
}

// --- Output ---

const basename = path.basename(resolvedPath);

if (errors.length === 0) {
  let msg = `PASS: ${basename} is valid (type: ${type}, round: ${round})`;
  if (warnings.length > 0) {
    msg += `\n  Warnings:`;
    for (const w of warnings) msg += `\n    - ${w}`;
  }
  console.log(msg);
  process.exit(0);
} else {
  console.error(`FAIL: ${basename} has ${errors.length} error(s):`);
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  if (warnings.length > 0) {
    console.error(`  Warnings:`);
    for (const w of warnings) console.error(`    - ${w}`);
  }
  process.exit(1);
}
