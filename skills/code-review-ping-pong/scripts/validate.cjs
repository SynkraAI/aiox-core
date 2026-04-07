#!/usr/bin/env node
'use strict';

/**
 * Code Review Ping-Pong v3 — Round File Validator
 *
 * Subset YAML parser (single-line scalars, flat arrays, arrays of flat objects).
 * Does NOT support: block scalars (|, >), nested arrays, multiline strings.
 * Validates structure, required fields, and YAML↔Markdown consistency for
 * review, fix, audit, stages, progress, and stage-summary files.
 *
 * Copy this to .code-review-ping-pong/validate.cjs in any project using the protocol.
 *
 * Usage: node validate.cjs <file>
 * Examples:
 *   node validate.cjs round-1.md
 *   node validate.cjs stages.yml
 *   node validate.cjs progress.yml
 *   node validate.cjs archive/stage-1-foo/summary.yml
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

// --- Detect file format (Markdown with frontmatter vs pure YAML) ---

const isYamlFile = resolvedPath.endsWith('.yml') || resolvedPath.endsWith('.yaml');
let yamlRaw;
let markdownBody = '';

if (isYamlFile) {
  // Pure YAML file (stages.yml, progress.yml, summary.yml)
  // Strip leading comment lines for parsing
  yamlRaw = content.replace(/^#[^\n]*\n/gm, '');
} else {
  // Markdown with YAML frontmatter (round files)
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    console.error('FAIL: No YAML frontmatter found. File must start with --- block.');
    process.exit(1);
  }
  yamlRaw = fmMatch[1];
  markdownBody = content.slice(fmMatch[0].length);
}

// --- Subset YAML parser ---
// Supports: top-level single-line scalars, arrays of strings, arrays of flat objects,
// nested scalar objects, and arrays nested within array objects (e.g., stages[].files[]).
// Does NOT support: block scalars (| or >), multiline strings, deeply nested objects.

function parseYaml(raw) {
  const result = {};
  const lines = raw.split('\n');
  let currentKey = null;       // top-level key name
  let currentArray = null;     // top-level array being built
  let currentObj = null;       // current object within top-level array
  let subArrayKey = null;      // key within currentObj that holds a nested array
  let subArray = null;         // nested array being built (e.g., stage.files)

  function cleanVal(v) {
    return (v || '').replace(/^["']|["']$/g, '').trim();
  }

  function flushSubArray() {
    if (subArray !== null && currentObj && subArrayKey) {
      currentObj[subArrayKey] = subArray;
    }
    subArray = null;
    subArrayKey = null;
  }

  function flushObj() {
    flushSubArray();
    if (currentObj) {
      if (currentArray !== null) currentArray.push(currentObj);
      currentObj = null;
    }
  }

  function flushArray() {
    flushObj();
    if (currentArray !== null) {
      result[currentKey] = currentArray;
      currentArray = null;
    }
  }

  for (const line of lines) {
    // Skip empty lines and comments
    if (line.trim() === '' || line.trim().startsWith('#')) continue;

    const indent = line.search(/\S/);

    // Top-level key (no leading whitespace): "key: value" or "key:"
    const topLevel = line.match(/^(\w[\w_]*):\s*(.*)$/);

    if (topLevel && indent === 0) {
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
      continue;
    }

    // Inside a top-level array (or what we think is one)
    if (currentArray !== null) {
      // "  - key: val" — new object item in array (indent 2-3, dash)
      const arrayItemKV = line.match(/^\s{2,3}-\s+(\w[\w_]*):\s*(.*)$/);
      // "  - simple-val" — simple string item in array (indent 2-3, dash)
      const arrayItemSimple = line.match(/^\s{2,3}-\s+["']?(.+?)["']?\s*$/);
      // "  key: val" — nested scalar, NOT an array item (indent 2-3, no dash)
      // This means the parent key is actually a nested object, not an array
      const nestedNoDash = line.match(/^\s{2,3}(\w[\w_]*):\s*["']?(.+?)["']?\s*$/);

      if (!arrayItemKV && !arrayItemSimple && nestedNoDash && currentArray.length === 0 && !currentObj) {
        // Revert: this was not an array, it's a nested object
        // e.g., summary:\n  total_stages: 3
        result[currentKey] = {};
        result[currentKey][nestedNoDash[1]] = cleanVal(nestedNoDash[2]);
        currentArray = null;
        // Stay in nested object mode — handled by the fallback at the end
        continue;
      }

      if (arrayItemKV) {
        // New object in array: "  - id: 1"
        flushObj();
        currentObj = {};
        currentObj[arrayItemKV[1]] = cleanVal(arrayItemKV[2]);
        continue;
      }

      if (arrayItemSimple && !arrayItemKV) {
        // Simple array item: "  - some/path" (only when NOT inside an object)
        if (subArray !== null) {
          // Actually a sub-array item at indent 2 — unlikely but handle
        }
        if (!currentObj) {
          currentArray.push(cleanVal(arrayItemSimple[1]));
          continue;
        }
      }

      // Inside an array object (currentObj exists)
      if (currentObj) {
        // "      - val" — nested sub-array item (indent 6+, dash)
        const subArrayItem = line.match(/^\s{6,}-\s+["']?(.+?)["']?\s*$/);
        // "    key: val" — object field continuation (indent 4-5, no dash)
        const objField = line.match(/^\s{4,5}(\w[\w_]*):\s*(.*)$/);

        if (subArray !== null && subArrayItem) {
          // Add to sub-array: "      - src/foo.ts"
          subArray.push(cleanVal(subArrayItem[1]));
          continue;
        }

        if (objField) {
          // Object field: "    slug: foo" or "    files:" (start sub-array)
          flushSubArray();
          const fieldVal = cleanVal(objField[2]);

          if (fieldVal === '' || fieldVal === '[]') {
            if (fieldVal === '[]') {
              currentObj[objField[1]] = [];
            } else {
              // Empty value means sub-array follows
              subArrayKey = objField[1];
              subArray = [];
            }
          } else {
            currentObj[objField[1]] = fieldVal;
          }
          continue;
        }
      }
    }

    // Nested scalar under top-level object (not inside an array): "  key: val"
    if (currentArray === null && currentKey) {
      const nestedScalar = line.match(/^\s{2,3}(\w[\w_]*):\s*["']?(.+?)["']?\s*$/);
      if (nestedScalar) {
        if (typeof result[currentKey] !== 'object' || Array.isArray(result[currentKey])) {
          result[currentKey] = {};
        }
        result[currentKey][nestedScalar[1]] = cleanVal(nestedScalar[2]);
        continue;
      }
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

// --- Detect validation mode ---
// Priority: explicit type field → filename match → YAML content heuristics → error
//
// This detects stages/progress files even when they have different filenames
// (e.g., stages-template.yml, my-stages.yml) by inspecting YAML content.

const basename = path.basename(resolvedPath);
let type;

if (yaml.type === 'stage-summary') {
  // Explicit type field — highest priority
  type = 'stage-summary';
} else if (basename === 'stages.yml' || basename === 'stages.yaml') {
  type = 'stages';
} else if (basename === 'progress.yml' || basename === 'progress.yaml') {
  type = 'progress';
} else if (isYamlFile && yaml.version && Array.isArray(yaml.stages) && !yaml.summary) {
  // Heuristic: has version + stages array + no summary → stages config
  type = 'stages';
} else if (isYamlFile && yaml.summary && yaml.updated) {
  // Heuristic: has summary + updated → progress tracker
  type = 'progress';
} else if (isYamlFile && !yaml.type && !yaml.round) {
  // YAML file without type or round — cannot determine type
  errors.push('Cannot detect file type. YAML files must be named stages.yml/progress.yml, or have a "type" field (e.g., type: stage-summary).');
  type = 'unknown';
} else {
  type = yaml.type;
  if (!type || !['review', 'fix', 'audit'].includes(type)) {
    errors.push(`type must be "review", "fix", or "audit", got "${type}"`);
  }
}

// --- Common validations for round files (review/fix/audit) ---

if (['review', 'fix', 'audit'].includes(type)) {
  const round = Number(yaml.round);
  if (!yaml.round || isNaN(round) || round < 1) {
    errors.push(`round must be a positive number, got "${yaml.round}"`);
  }

  if (!yaml.date) errors.push('date is required');
  if (!yaml.branch) errors.push('branch is required');
}

// Use round as variable for round-file validations below
const round = Number(yaml.round);

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

// --- Stages-specific ---

if (type === 'stages') {
  if (!yaml.version) warnings.push('version field recommended');
  if (!yaml.project) warnings.push('project field recommended');
  if (!yaml.created) warnings.push('created date recommended');

  const stages = yaml.stages;
  if (!Array.isArray(stages) || stages.length === 0) {
    errors.push('stages must be a non-empty array');
  } else {
    const ids = new Set();
    const slugs = new Set();
    let activeCount = 0;

    for (const stage of stages) {
      if (typeof stage !== 'object') {
        errors.push(`stages array contains non-object item: ${JSON.stringify(stage)}`);
        continue;
      }

      // Required fields
      const stageRequired = ['id', 'slug', 'name', 'status', 'files'];
      for (const field of stageRequired) {
        if (!stage[field]) {
          errors.push(`stage ${stage.id || '?'} missing required field: ${field}`);
        }
      }

      // Status validation
      if (stage.status && !['pending', 'active', 'complete'].includes(stage.status)) {
        errors.push(`stage ${stage.id} has invalid status: "${stage.status}" (must be pending, active, or complete)`);
      }

      if (stage.status === 'active') activeCount++;

      // Unique id
      if (stage.id) {
        if (ids.has(stage.id)) {
          errors.push(`duplicate stage id: ${stage.id}`);
        }
        ids.add(stage.id);
      }

      // Unique slug
      if (stage.slug) {
        if (slugs.has(stage.slug)) {
          errors.push(`duplicate stage slug: "${stage.slug}"`);
        }
        slugs.add(stage.slug);
      }

      // Files must be array (can be string list from parser)
      if (stage.files && !Array.isArray(stage.files)) {
        errors.push(`stage ${stage.id} files must be an array`);
      } else if (stage.files && stage.files.length === 0) {
        errors.push(`stage ${stage.id} files must be non-empty`);
      }
    }

    if (activeCount > 1) {
      errors.push(`only 1 stage can be active at a time, found ${activeCount}`);
    }
  }
}

// --- Progress-specific ---

if (type === 'progress') {
  if (!yaml.updated) warnings.push('updated date recommended');

  const summary = yaml.summary;
  if (!summary || typeof summary !== 'object') {
    errors.push('summary section is required');
  } else {
    const summaryFields = ['total_stages', 'completed', 'active', 'pending', 'completion_pct', 'total_issues_found', 'total_issues_fixed', 'total_rounds'];
    for (const field of summaryFields) {
      if (summary[field] === undefined || summary[field] === null || summary[field] === '') {
        errors.push(`summary missing field: ${field}`);
      }
    }

    // Math consistency: completed + active + pending = total_stages
    const total = Number(summary.total_stages) || 0;
    const completed = Number(summary.completed) || 0;
    const active = Number(summary.active) || 0;
    const pending = Number(summary.pending) || 0;
    if (completed + active + pending !== total) {
      errors.push(`summary math: completed(${completed}) + active(${active}) + pending(${pending}) = ${completed + active + pending}, but total_stages = ${total}`);
    }

    // completion_pct check
    const pct = Number(summary.completion_pct) || 0;
    const expectedPct = total > 0 ? Math.floor((completed / total) * 100) : 0;
    if (pct !== expectedPct) {
      warnings.push(`completion_pct is ${pct} but expected ${expectedPct} (floor(${completed}/${total} * 100))`);
    }
  }

  const stages = yaml.stages;
  if (!Array.isArray(stages)) {
    errors.push('stages array is required in progress file');
  } else {
    for (const stage of stages) {
      if (typeof stage !== 'object') continue;
      if (!stage.id) errors.push('progress stage entry missing id');
      if (!stage.slug) errors.push(`progress stage ${stage.id || '?'} missing slug`);
      if (!stage.status) errors.push(`progress stage ${stage.id || '?'} missing status`);
    }
  }
}

// --- Stage-summary-specific ---

if (type === 'stage-summary') {
  const required = ['stage_id', 'stage_slug', 'stage_name', 'completed_at', 'total_rounds', 'final_score', 'total_issues_found', 'total_issues_fixed'];
  for (const key of required) {
    if (!yaml[key] && yaml[key] !== 0) {
      errors.push(`stage-summary missing required field: ${key}`);
    }
  }

  const finalScore = Number(yaml.final_score);
  if (isNaN(finalScore) || finalScore !== 10) {
    errors.push(`final_score must be 10 (stage was PERFECT), got "${yaml.final_score}"`);
  }

  if (!Array.isArray(yaml.files_in_scope) || yaml.files_in_scope.length === 0) {
    errors.push('files_in_scope must be a non-empty array');
  }

  const rounds = yaml.rounds;
  if (!Array.isArray(rounds) || rounds.length === 0) {
    errors.push('rounds must be a non-empty array');
  } else {
    for (const r of rounds) {
      if (typeof r !== 'object') continue;
      if (!r.file) errors.push('round entry missing file');
      if (!r.type || !['review', 'fix', 'audit'].includes(r.type)) {
        errors.push(`round entry ${r.file || '?'} has invalid type: "${r.type}"`);
      }
    }
  }

  // Consistency: total_issues_fixed + total_issues_skipped <= total_issues_found
  const found = Number(yaml.total_issues_found) || 0;
  const fixed = Number(yaml.total_issues_fixed) || 0;
  const skipped = Number(yaml.total_issues_skipped) || 0;
  if (fixed + skipped > found) {
    errors.push(`fixed(${fixed}) + skipped(${skipped}) = ${fixed + skipped} exceeds total_issues_found(${found})`);
  }
}

// --- Output ---

if (errors.length === 0) {
  let label;
  if (type === 'stages') label = `stages config, ${(yaml.stages || []).length} stage(s)`;
  else if (type === 'progress') label = `progress tracker`;
  else if (type === 'stage-summary') label = `stage-summary for stage ${yaml.stage_id}`;
  else label = `type: ${type}, round: ${round}`;

  let msg = `PASS: ${basename} is valid (${label})`;
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
