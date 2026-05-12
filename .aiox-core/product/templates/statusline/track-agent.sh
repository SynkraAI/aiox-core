#!/bin/bash
# AIOX Agent/Squad Tracker for Claude Code Statusline
# Called via Claude Code UserPromptSubmit hook
#
# Detects @agent, /squad:command, /ns:agents:name activations
# Writes to ~/.claude/session-cache/ for statusline-script.js to read
#
# Installed automatically by `npx aiox-core install`
# Source: .aiox-core/product/templates/statusline/

INPUT=$(cat)

node -e "
const fs = require('fs');
const path = require('path');
const os = require('os');

let prompt = '';
try {
  const j = JSON.parse(process.argv[1]);
  prompt = j.prompt || j.message || '';
} catch {}
if (!prompt) process.exit(0);

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(16);
}

const cacheDir = path.join(os.homedir(), '.claude', 'session-cache');
try { fs.mkdirSync(cacheDir, { recursive: true }); } catch {}

const hash = simpleHash(process.cwd());
const cacheFile = path.join(cacheDir, hash + '.json');

let agent = '', squad = '';
try {
  const c = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  agent = c.agent || '';
  squad = c.squad || '';
} catch {}

let changed = false;

if (/^\*exit\b/.test(prompt)) {
  agent = ''; squad = '';
  changed = true;
}

const agentMatch = prompt.match(/@([a-zA-Z_-]+)/);
if (agentMatch) { agent = agentMatch[1]; changed = true; }

const nsMatch = prompt.match(/\/[a-zA-Z_-]+:agents:([a-zA-Z_-]+)/);
if (nsMatch) { agent = nsMatch[1]; changed = true; }

const squadMatch = prompt.match(/\/([a-zA-Z_-]+):[a-zA-Z_-]+/);
if (squadMatch && !/:agents:/.test(squadMatch[0])) { squad = squadMatch[1]; changed = true; }

if (changed) {
  fs.writeFileSync(cacheFile, JSON.stringify({ agent, squad, updated: new Date().toISOString() }));
}
" "$INPUT"

exit 0
