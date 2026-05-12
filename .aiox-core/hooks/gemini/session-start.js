#!/usr/bin/env node
/**
 * AIOX Session Start Hook for Gemini CLI
 * Story GEMINI-INT.6 - AIOX Hooks System
 *
 * Executes at session start to load AIOX context and memory.
 * Output must be valid JSON to stdout.
 */

const fs = require('fs');
const path = require('path');

async function sessionStart() {
  const projectDir = process.env.GEMINI_PROJECT_DIR || process.cwd();
  const sessionId = process.env.GEMINI_SESSION_ID || `session-${Date.now()}`;

  const result = {
    status: 'success',
    contextInjection: {
      aioxVersion: '3.0',
      sessionId,
      projectType: detectProjectType(projectDir),
      timestamp: new Date().toISOString(),
    },
  };

  // Load project context if available
  try {
    const codebaseMapPath = path.join(projectDir, '.aiox', 'codebase-map.json');
    if (fs.existsSync(codebaseMapPath)) {
      const codebaseMap = JSON.parse(fs.readFileSync(codebaseMapPath, 'utf8'));
      result.contextInjection.codebaseInfo = {
        services: codebaseMap.services?.length || 0,
        patterns: codebaseMap.patterns?.length || 0,
        lastUpdated: codebaseMap.metadata?.lastUpdated,
      };
    }
  } catch (error) {
    // Non-critical, continue
  }

  // Load active story if any
  try {
    const storiesDir = path.join(projectDir, 'docs', 'stories', 'active');
    if (fs.existsSync(storiesDir)) {
      const stories = fs.readdirSync(storiesDir).filter((f) => f.endsWith('.md'));
      if (stories.length > 0) {
        result.contextInjection.activeStories = stories.length;
      }
    }
  } catch (error) {
    // Non-critical
  }

  return result;
}

function detectProjectType(projectDir) {
  const packageJsonPath = path.join(projectDir, 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (pkg.dependencies?.next || pkg.devDependencies?.next) return 'nextjs';
      if (pkg.dependencies?.react || pkg.devDependencies?.react) return 'react';
      if (pkg.dependencies?.express) return 'express';
      if (pkg.dependencies?.['@nestjs/core']) return 'nestjs';
      return 'node';
    } catch {
      return 'node';
    }
  }

  if (fs.existsSync(path.join(projectDir, 'requirements.txt'))) return 'python';
  if (fs.existsSync(path.join(projectDir, 'Cargo.toml'))) return 'rust';
  if (fs.existsSync(path.join(projectDir, 'go.mod'))) return 'go';

  return 'unknown';
}

// Execute and output JSON
sessionStart()
  .then((result) => {
    console.log(JSON.stringify(result));
    process.exit(0);
  })
  .catch((error) => {
    console.log(JSON.stringify({ status: 'error', error: error.message }));
    process.exit(0); // Exit 0 to not block Gemini
  });
