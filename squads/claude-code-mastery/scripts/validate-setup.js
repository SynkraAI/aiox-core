#!/usr/bin/env node

/**
 * validate-setup.js
 * Quick validation of Claude Code setup in a project.
 * Used by audit-setup.md task.
 *
 * Usage: node squads/claude-code-mastery/scripts/validate-setup.js [project-path]
 */

const fs = require('fs');
const path = require('path');

const projectPath = process.argv[2] || process.cwd();

const checks = [
  {
    name: '.claude/ directory exists',
    weight: 15,
    check: () => fs.existsSync(path.join(projectPath, '.claude')),
  },
  {
    name: 'CLAUDE.md exists',
    weight: 15,
    check: () =>
      fs.existsSync(path.join(projectPath, 'CLAUDE.md')) ||
      fs.existsSync(path.join(projectPath, '.claude', 'CLAUDE.md')),
  },
  {
    name: 'settings.json exists',
    weight: 15,
    check: () =>
      fs.existsSync(path.join(projectPath, '.claude', 'settings.json')),
  },
  {
    name: 'settings.json has deny rules',
    weight: 10,
    check: () => {
      const settingsPath = path.join(projectPath, '.claude', 'settings.json');
      if (!fs.existsSync(settingsPath)) return false;
      try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        const deny = settings.permissions?.deny || [];
        return deny.length > 0;
      } catch {
        return false;
      }
    },
  },
  {
    name: '.claude/rules/ directory exists',
    weight: 10,
    check: () => fs.existsSync(path.join(projectPath, '.claude', 'rules')),
  },
  {
    name: 'At least 1 rule file',
    weight: 5,
    check: () => {
      const rulesDir = path.join(projectPath, '.claude', 'rules');
      if (!fs.existsSync(rulesDir)) return false;
      const files = fs.readdirSync(rulesDir).filter((f) => f.endsWith('.md'));
      return files.length > 0;
    },
  },
  {
    name: 'Hooks configured',
    weight: 10,
    check: () => {
      const settingsPath = path.join(projectPath, '.claude', 'settings.json');
      if (!fs.existsSync(settingsPath)) return false;
      try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        return settings.hooks && Object.keys(settings.hooks).length > 0;
      } catch {
        return false;
      }
    },
  },
  {
    name: 'MCP servers configured',
    weight: 10,
    check: () => {
      const settingsPath = path.join(projectPath, '.claude', 'settings.json');
      if (!fs.existsSync(settingsPath)) return false;
      try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        return (
          settings.mcpServers && Object.keys(settings.mcpServers).length > 0
        );
      } catch {
        return false;
      }
    },
  },
  {
    name: 'CLAUDE.md under 200 lines',
    weight: 5,
    check: () => {
      const claudeMdPath =
        fs.existsSync(path.join(projectPath, '.claude', 'CLAUDE.md'))
          ? path.join(projectPath, '.claude', 'CLAUDE.md')
          : path.join(projectPath, 'CLAUDE.md');
      if (!fs.existsSync(claudeMdPath)) return false;
      const lines = fs.readFileSync(claudeMdPath, 'utf8').split('\n').length;
      return lines <= 200;
    },
  },
  {
    name: '.env in deny rules',
    weight: 5,
    check: () => {
      const settingsPath = path.join(projectPath, '.claude', 'settings.json');
      if (!fs.existsSync(settingsPath)) return false;
      try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        const deny = settings.permissions?.deny || [];
        return deny.some(
          (rule) =>
            typeof rule === 'string'
              ? rule.includes('.env')
              : rule.pattern && rule.pattern.includes('.env')
        );
      } catch {
        return false;
      }
    },
  },
];

let totalScore = 0;
let maxScore = 0;

console.log(`\nClaude Code Setup Validation`);
console.log(`Project: ${projectPath}`);
console.log(`${'='.repeat(60)}\n`);

for (const check of checks) {
  const passed = check.check();
  const icon = passed ? 'PASS' : 'FAIL';
  const score = passed ? check.weight : 0;
  totalScore += score;
  maxScore += check.weight;
  console.log(`  [${icon}] ${check.name} (${score}/${check.weight})`);
}

const percentage = Math.round((totalScore / maxScore) * 100);
const grade =
  percentage >= 90
    ? 'A'
    : percentage >= 80
      ? 'B'
      : percentage >= 70
        ? 'C'
        : percentage >= 60
          ? 'D'
          : 'F';

console.log(`\n${'='.repeat(60)}`);
console.log(`  Score: ${totalScore}/${maxScore} (${percentage}%)`);
console.log(`  Grade: ${grade}`);
console.log(`${'='.repeat(60)}\n`);

process.exit(percentage >= 70 ? 0 : 1);
