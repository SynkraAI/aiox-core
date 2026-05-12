#!/usr/bin/env node
/**
 * AIOX Before Agent Hook for Gemini CLI
 * Story GEMINI-INT.6 - AIOX Hooks System
 *
 * Executes before agent processing to inject gotchas and patterns.
 * Output must be valid JSON to stdout.
 */

const fs = require('fs');
const path = require('path');

async function beforeAgent() {
  const projectDir = process.env.GEMINI_PROJECT_DIR || process.cwd();

  const result = {
    status: 'success',
    contextInjection: {
      gotchas: [],
      patterns: [],
      conventions: {},
    },
  };

  // Load gotchas
  try {
    const gotchasPath = path.join(projectDir, '.aiox', 'gotchas.json');
    if (fs.existsSync(gotchasPath)) {
      const gotchas = JSON.parse(fs.readFileSync(gotchasPath, 'utf8'));
      result.contextInjection.gotchas = gotchas.slice(0, 5); // Top 5 recent
    }
  } catch (error) {
    // Non-critical
  }

  // Load patterns from codebase map
  try {
    const codebaseMapPath = path.join(projectDir, '.aiox', 'codebase-map.json');
    if (fs.existsSync(codebaseMapPath)) {
      const map = JSON.parse(fs.readFileSync(codebaseMapPath, 'utf8'));
      if (map.patterns) {
        result.contextInjection.patterns = map.patterns.slice(0, 5);
      }
      if (map.conventions) {
        result.contextInjection.conventions = map.conventions;
      }
    }
  } catch (error) {
    // Non-critical
  }

  // Load CLAUDE.md conventions (works for both CLIs)
  try {
    const claudeMdPath = path.join(projectDir, '.claude', 'CLAUDE.md');
    if (fs.existsSync(claudeMdPath)) {
      const content = fs.readFileSync(claudeMdPath, 'utf8');
      // Extract key sections
      const importConventions = content.match(/## (?:Code Standards|Conventions)([\s\S]*?)(?=##|$)/i);
      if (importConventions) {
        result.contextInjection.projectConventions = importConventions[1].trim().slice(0, 500);
      }
    }
  } catch (error) {
    // Non-critical
  }

  return result;
}

// Execute and output JSON
beforeAgent()
  .then((result) => {
    console.log(JSON.stringify(result));
    process.exit(0);
  })
  .catch((error) => {
    console.log(JSON.stringify({ status: 'error', error: error.message }));
    process.exit(0);
  });
