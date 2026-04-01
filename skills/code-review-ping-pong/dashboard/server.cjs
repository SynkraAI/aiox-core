'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

// ─── Config ──────────────────────────────────────────────────────────────────

const PORT = 3847;
const PINGPONG_DIR = '.code-review-ping-pong';
const PROJECTS_FILE = path.join(__dirname, 'projects.json');
const INDEX_FILE = path.join(__dirname, 'index.html');
const DEBOUNCE_MS = 500;

// ─── Minimal YAML parser (handles our subset) ───────────────────────────────
//
// Supports: scalars, nested objects, arrays of scalars, arrays of objects.
// Does NOT support: multi-line strings, anchors, merge keys, flow syntax.

function parseValue(val) {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val === 'null' || val === '~') return null;
  if (/^-?\d+$/.test(val)) return parseInt(val, 10);
  if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val);
  return val.replace(/^["']|["']$/g, '');
}

function parseYaml(text) {
  const lines = text.split('\n');

  // Preprocess: filter blanks/comments, compute indent + content
  const tokens = [];
  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const indent = line.search(/\S/);
    tokens.push({ indent, content: line.trim() });
  }

  function parseBlock(start, minIndent) {
    const result = {};
    let i = start;

    while (i < tokens.length && tokens[i].indent >= minIndent) {
      const { indent, content } = tokens[i];
      if (indent < minIndent) break;

      // Array item at this level — means parent key created an array
      if (content.startsWith('- ')) {
        break; // arrays handled by parseArray
      }

      const colonIdx = content.indexOf(':');
      if (colonIdx <= 0) { i++; continue; }

      const key = content.slice(0, colonIdx).trim();
      const rawVal = content.slice(colonIdx + 1).trim();

      if (rawVal === '[]') {
        result[key] = [];
        i++;
      } else if (rawVal === '') {
        // Peek next line to determine if array or object
        if (i + 1 < tokens.length && tokens[i + 1].indent > indent) {
          const nextContent = tokens[i + 1].content;
          if (nextContent.startsWith('- ')) {
            const arr = [];
            const parsed = parseArray(i + 1, tokens[i + 1].indent, arr);
            result[key] = arr;
            i = parsed;
          } else {
            const [obj, nextI] = parseBlockReturn(i + 1, tokens[i + 1].indent);
            result[key] = obj;
            i = nextI;
          }
        } else {
          result[key] = {};
          i++;
        }
      } else {
        result[key] = parseValue(rawVal);
        i++;
      }
    }

    return [result, i];
  }

  function parseBlockReturn(start, minIndent) {
    return parseBlock(start, minIndent);
  }

  function parseArray(start, minIndent, arr) {
    let i = start;

    while (i < tokens.length && tokens[i].indent >= minIndent) {
      const { indent, content } = tokens[i];
      if (indent < minIndent) break;
      if (indent > minIndent) { i++; continue; } // skip deeper lines handled below

      if (!content.startsWith('- ')) break;

      const val = content.slice(2).trim();

      // Check if this array item is an object (has key: value)
      if (val.includes(':') && !val.startsWith('"') && !val.startsWith("'")) {
        // Object in array — first key is on the dash line
        const obj = {};
        const [k, ...rest] = val.split(':');
        obj[k.trim()] = parseValue(rest.join(':').trim());

        // Consume subsequent lines at deeper indent as more properties
        i++;
        const childIndent = minIndent + 2;
        while (i < tokens.length && tokens[i].indent >= childIndent) {
          const child = tokens[i];
          if (child.indent < childIndent) break;

          if (child.content.startsWith('- ')) {
            // Could be a nested array under a key we just set
            const keys = Object.keys(obj);
            const lastKey = keys[keys.length - 1];
            if (lastKey && Array.isArray(obj[lastKey])) {
              obj[lastKey].push(parseValue(child.content.slice(2).trim()));
              i++;
              continue;
            }
            break;
          }

          const cIdx = child.content.indexOf(':');
          if (cIdx > 0) {
            const ck = child.content.slice(0, cIdx).trim();
            const cv = child.content.slice(cIdx + 1).trim();

            if (cv === '[]') {
              obj[ck] = [];
              i++;
            } else if (cv === '') {
              // Nested array or object
              if (i + 1 < tokens.length && tokens[i + 1].indent > child.indent) {
                const nextContent = tokens[i + 1].content;
                if (nextContent.startsWith('- ')) {
                  const nestedArr = [];
                  i = parseArray(i + 1, tokens[i + 1].indent, nestedArr);
                  obj[ck] = nestedArr;
                } else {
                  const [nestedObj, nextI] = parseBlockReturn(i + 1, tokens[i + 1].indent);
                  obj[ck] = nestedObj;
                  i = nextI;
                }
              } else {
                obj[ck] = {};
                i++;
              }
            } else {
              obj[ck] = parseValue(cv);
              i++;
            }
          } else {
            i++;
          }
        }

        arr.push(obj);
      } else {
        // Scalar array item
        arr.push(parseValue(val));
        i++;
      }
    }

    return i;
  }

  const [result] = parseBlock(0, 0);
  return result;
}

// ─── Project data collection ────────────────────────────────────────────────

function loadProjects() {
  try {
    const raw = fs.readFileSync(PROJECTS_FILE, 'utf8');
    return JSON.parse(raw).projects || [];
  } catch {
    return [];
  }
}

function saveProjects(projects) {
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify({ projects }, null, 2) + '\n');
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function parseNextStep(text) {
  if (!text) return null;
  const result = {};
  const lines = text.split('\n');
  for (const line of lines) {
    const match = line.match(/^-\s+(\w+):\s+(.+)$/);
    if (match) {
      result[match[1]] = parseValue(match[2].trim());
    }
  }
  return Object.keys(result).length > 0 ? result : null;
}

function parseRoundFiles(ppDir) {
  const rounds = [];
  try {
    const files = fs.readdirSync(ppDir).filter(f => /^round-\d+/.test(f)).sort();
    for (const file of files) {
      const content = readFileSafe(path.join(ppDir, file));
      if (!content) continue;

      const entry = { file, type: 'unknown' };

      if (file.match(/round-\d+-audit\.md$/)) {
        entry.type = 'audit';
      } else if (file.match(/round-\d+-fixed\.md$/)) {
        entry.type = 'fix';
      } else if (file.match(/round-\d+\.md$/)) {
        entry.type = 'review';
      }

      // Extract round number
      const numMatch = file.match(/round-(\d+)/);
      if (numMatch) entry.round = parseInt(numMatch[1], 10);

      // Extract YAML frontmatter
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (fmMatch) {
        const fm = parseYaml(fmMatch[1]);
        if (fm.score !== undefined) entry.score = fm.score;
        if (fm.verdict) entry.verdict = fm.verdict;
        if (fm.issues_found !== undefined) entry.issues_found = fm.issues_found;
        if (fm.issues_fixed !== undefined) entry.issues_fixed = fm.issues_fixed;
        if (fm.issues_skipped !== undefined) entry.issues_skipped = fm.issues_skipped;
        if (fm.process_health !== undefined) entry.process_health = fm.process_health;
      }

      rounds.push(entry);
    }
  } catch {
    // Directory might not exist
  }
  return rounds;
}

function collectProjectData(project) {
  const ppDir = path.join(project.path, project.pingpong_dir || PINGPONG_DIR);
  const data = {
    name: project.name,
    path: project.path,
    exists: fs.existsSync(ppDir),
    multi_stage: false,
    stages: null,
    progress: null,
    next_step: null,
    rounds: [],
    current_round: 0,
    latest_score: null,
    cycle_state: 'UNKNOWN',
    next_agent: null,
    next_mode: null,
    handoff_block: null,
  };

  if (!data.exists) return data;

  // Session theme/scope from session.md
  const sessionRaw = readFileSafe(path.join(ppDir, 'session.md'));
  if (sessionRaw) {
    // Try to extract title from first H1 after "## Scope" or the first line
    const titleMatch = sessionRaw.match(/^#\s+(.+)/m);
    data.session_title = titleMatch ? titleMatch[1].trim() : null;

    // Extract theme from queue.md (ACTIVE row) or from Goals section
    const goalsMatch = sessionRaw.match(/## Goals\n([\s\S]*?)(?=\n##|\n*$)/);
    if (goalsMatch) {
      const firstGoal = goalsMatch[1].trim().split('\n')[0].replace(/^-\s*/, '');
      data.session_goal = firstGoal;
    }
  }

  // Queue: read queue.md to find ACTIVE theme
  const queueRaw = readFileSafe(path.join(ppDir, 'queue.md'));
  if (queueRaw) {
    // Parse markdown table: | # | Tema | Escopo | Status |
    // Find the row where Status contains ACTIVE
    const rows = queueRaw.split('\n').filter(l => l.includes('|') && /\d/.test(l));
    for (const row of rows) {
      const cols = row.split('|').map(c => c.trim()).filter(Boolean);
      // cols: [#, Tema, Escopo, Status]
      if (cols.length >= 4 && cols[3].includes('ACTIVE')) {
        data.session_theme = cols[1];
        break;
      }
    }
  }

  // Next step
  const nextStepRaw = readFileSafe(path.join(ppDir, 'next-step.md'));
  data.next_step = parseNextStep(nextStepRaw);
  if (data.next_step) {
    data.cycle_state = data.next_step.cycle_state || 'UNKNOWN';
    data.next_agent = data.next_step.next_agent || null;
    data.next_mode = data.next_step.next_mode || null;
    data.current_round = data.next_step.current_round || 0;
  }

  // Rounds
  data.rounds = parseRoundFiles(ppDir);
  if (data.rounds.length > 0) {
    const last = data.rounds[data.rounds.length - 1];
    if (last.score !== undefined) data.latest_score = last.score;
    if (!data.current_round) data.current_round = last.round || 0;
  }

  // Multi-stage: stages.yml
  const stagesRaw = readFileSafe(path.join(ppDir, 'stages.yml'));
  if (stagesRaw) {
    data.multi_stage = true;
    data.stages = parseYaml(stagesRaw);
  }

  // Multi-stage: progress.yml
  const progressRaw = readFileSafe(path.join(ppDir, 'progress.yml'));
  if (progressRaw) {
    data.progress = parseYaml(progressRaw);
  }

  // Read raw next-step.md content as handoff (observability — no synthesis)
  const nextStepPath = path.join(ppDir, 'next-step.md');
  data.handoff_block = readFileSafe(nextStepPath);

  // Orchestrator metrics (timing, score history)
  const summaryRaw = readFileSafe(path.join(ppDir, 'orchestrator-summary.json'));
  if (summaryRaw) {
    try { data.orchestrator_metrics = JSON.parse(summaryRaw); } catch { /* ignore */ }
  }

  // Regression tracker data
  const trackerRaw = readFileSafe(path.join(ppDir, 'tracker.json'));
  if (trackerRaw) {
    try { data.topic_history = JSON.parse(trackerRaw); } catch { /* ignore */ }
  }

  return data;
}

function collectAllData() {
  const projects = loadProjects();
  return projects.map(p => collectProjectData(p));
}

// ─── SSE (Server-Sent Events) ───────────────────────────────────────────────

const sseClients = new Set();

function broadcastUpdate() {
  const data = JSON.stringify(collectAllData());
  for (const res of sseClients) {
    try {
      res.write(`data: ${data}\n\n`);
    } catch {
      sseClients.delete(res);
    }
  }
}

// ─── File watchers ──────────────────────────────────────────────────────────

const watchers = new Map();
let debounceTimer = null;

function debouncedBroadcast() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    broadcastUpdate();
  }, DEBOUNCE_MS);
}

function setupWatchers() {
  // Close existing watchers
  for (const w of watchers.values()) w.close();
  watchers.clear();

  const projects = loadProjects();
  for (const project of projects) {
    const ppDir = path.join(project.path, project.pingpong_dir || PINGPONG_DIR);
    if (!fs.existsSync(ppDir)) continue;

    try {
      const watcher = fs.watch(ppDir, { recursive: true }, () => {
        debouncedBroadcast();
      });
      watchers.set(project.name, watcher);
      console.log(`  watching: ${ppDir}`);
    } catch (err) {
      console.error(`  failed to watch ${ppDir}: ${err.message}`);
    }
  }
}

// ─── HTTP Server ────────────────────────────────────────────────────────────

function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // SSE endpoint
  if (url.pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(`data: ${JSON.stringify(collectAllData())}\n\n`);
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  // API endpoint
  if (url.pathname === '/api/projects') {
    const data = collectAllData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
    return;
  }

  // Discover projects
  if (req.method === 'POST' && url.pathname === '/api/projects/discover') {
    const result = discoverProjects();
    if (result.added > 0) {
      setupWatchers();
      debouncedBroadcast();
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // Add project
  if (req.method === 'POST' && url.pathname === '/api/projects/add') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { path: projectPath, name: projectName } = JSON.parse(body);
        if (!projectPath) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'path is required' }));
          return;
        }
        const resolved = path.resolve(projectPath);
        if (!fs.existsSync(resolved)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Path not found: ${resolved}` }));
          return;
        }
        const name = projectName || path.basename(resolved);
        const projects = loadProjects();
        if (projects.some(p => p.path === resolved)) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Project already registered', name }));
          return;
        }
        projects.push({ name, path: resolved, pingpong_dir: PINGPONG_DIR });
        saveProjects(projects);
        setupWatchers();
        debouncedBroadcast();
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, name, path: resolved }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Remove project
  if (req.method === 'POST' && url.pathname === '/api/projects/remove') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { name: target } = JSON.parse(body);
        if (!target) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'name is required' }));
          return;
        }
        const projects = loadProjects();
        const filtered = projects.filter(p => p.name !== target);
        if (filtered.length === projects.length) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Project not found' }));
          return;
        }
        saveProjects(filtered);
        setupWatchers();
        debouncedBroadcast();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, removed: target }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Dashboard HTML
  if (url.pathname === '/' || url.pathname === '/index.html') {
    try {
      const html = fs.readFileSync(INDEX_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('index.html not found');
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
}

// ─── Auto-discovery ─────────────────────────────────────────────────────────

function discoverProjects() {
  const homedir = require('node:os').homedir();
  const searchPaths = [
    path.join(homedir, 'CODE', 'Projects'),
    path.join(homedir, 'CODE', 'design-systems'),
    path.join(homedir, 'CODE', 'frameworks'),
    path.join(homedir, 'CODE', 'tools'),
    path.join(homedir, 'aios-core'),
    path.join(homedir, 'aios-core', 'squads'),
    path.join(homedir, 'aios-core', 'skills'),
    path.join(homedir, 'aios-core', 'packages'),
  ];

  const existing = loadProjects();
  const existingPaths = new Set(existing.map(p => p.path));
  let added = 0;

  for (const searchPath of searchPaths) {
    // Check if the searchPath itself has a ping-pong dir
    const directPP = path.join(searchPath, PINGPONG_DIR);
    if (fs.existsSync(directPP) && !existingPaths.has(searchPath)) {
      existing.push({
        name: path.basename(searchPath),
        path: searchPath,
        pingpong_dir: PINGPONG_DIR,
      });
      existingPaths.add(searchPath);
      added++;
    }

    // Scan subdirectories
    try {
      if (!fs.existsSync(searchPath)) continue;
      const dirs = fs.readdirSync(searchPath, { withFileTypes: true });
      for (const dir of dirs) {
        if (!dir.isDirectory() || dir.name.startsWith('.')) continue;
        const projectPath = path.join(searchPath, dir.name);
        if (existingPaths.has(projectPath)) continue;

        const ppDir = path.join(projectPath, PINGPONG_DIR);
        if (fs.existsSync(ppDir)) {
          existing.push({
            name: dir.name,
            path: projectPath,
            pingpong_dir: PINGPONG_DIR,
          });
          existingPaths.add(projectPath);
          added++;
        }
      }
    } catch { /* ignore inaccessible dirs */ }
  }

  if (added > 0) {
    saveProjects(existing);
    console.log(`[DISCOVER] Found ${added} new project(s)`);
  }

  return { total: existing.length, added };
}

// ─── CLI Commands ───────────────────────────────────────────────────────────

function cli() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === 'start') {
    startServer();
    return;
  }

  if (cmd === 'add') {
    const projectPath = args[1];
    const projectName = args[2];
    if (!projectPath) {
      console.error('Uso: node server.cjs add <path> [name]');
      process.exit(1);
    }
    const resolved = path.resolve(projectPath);
    if (!fs.existsSync(resolved)) {
      console.error(`Caminho não existe: ${resolved}`);
      process.exit(1);
    }
    const name = projectName || path.basename(resolved);
    const projects = loadProjects();
    if (projects.some(p => p.path === resolved)) {
      console.log(`Projeto já registrado: ${name} (${resolved})`);
      return;
    }
    projects.push({ name, path: resolved, pingpong_dir: PINGPONG_DIR });
    saveProjects(projects);
    console.log(`Projeto adicionado: ${name} (${resolved})`);
    return;
  }

  if (cmd === 'remove') {
    const target = args[1];
    if (!target) {
      console.error('Uso: node server.cjs remove <name|path>');
      process.exit(1);
    }
    const projects = loadProjects();
    const resolved = path.resolve(target);
    const filtered = projects.filter(p => p.name !== target && p.path !== resolved);
    if (filtered.length === projects.length) {
      console.error(`Projeto não encontrado: ${target}`);
      process.exit(1);
    }
    saveProjects(filtered);
    console.log(`Projeto removido: ${target}`);
    return;
  }

  if (cmd === 'list') {
    const projects = loadProjects();
    if (projects.length === 0) {
      console.log('Nenhum projeto registrado.');
      console.log('Adicione com: node server.cjs add <path> [name]');
      return;
    }
    console.log(`\n  Projetos registrados (${projects.length}):\n`);
    for (const p of projects) {
      const ppDir = path.join(p.path, p.pingpong_dir || PINGPONG_DIR);
      const exists = fs.existsSync(ppDir) ? '🟢' : '⚪';
      console.log(`  ${exists} ${p.name}`);
      console.log(`    ${p.path}`);
    }
    console.log('');
    return;
  }

  if (cmd === 'status') {
    const data = collectAllData();
    if (data.length === 0) {
      console.log('Nenhum projeto registrado.');
      return;
    }
    console.log(`\n  Ping-Pong Dashboard — ${data.length} projeto(s)\n`);
    for (const p of data) {
      const icon = !p.exists ? '⚪' :
        p.cycle_state === 'COMPLETE' ? '🏆' :
          p.cycle_state === 'WAITING_FOR_FIX' ? '🟣' :
            p.cycle_state === 'WAITING_FOR_REVIEW' ? '🟢' :
              p.cycle_state === 'WAITING_FOR_AUDIT' ? '🔵' : '⚪';

      console.log(`  ${icon} ${p.name}`);
      if (!p.exists) {
        console.log('    Sem diretório .code-review-ping-pong/');
      } else {
        console.log(`    Round: ${p.current_round} | Score: ${p.latest_score ?? '—'}/10 | Estado: ${p.cycle_state}`);
        if (p.next_agent && p.cycle_state !== 'COMPLETE') {
          console.log(`    Próximo: ${p.next_agent} (${p.next_mode || '?'})`);
        }
        if (p.multi_stage && p.progress && p.progress.summary) {
          const s = p.progress.summary;
          console.log(`    Stages: ${s.completed || 0}/${s.total_stages || '?'} (${s.completion_pct || 0}%)`);
        }
      }
      console.log('');
    }
    return;
  }

  if (cmd === 'discover') {
    const result = discoverProjects();
    console.log(`\n  Auto-discovery completo: ${result.total} projeto(s), ${result.added} novo(s)\n`);
    return;
  }

  console.error(`Comando desconhecido: ${cmd}`);
  console.error('Comandos: start, add, remove, list, status, discover');
  process.exit(1);
}

// ─── Start server ───────────────────────────────────────────────────────────

function startServer() {
  // Auto-discover on startup
  const discovered = discoverProjects();
  const projects = loadProjects();
  console.log('\n  Ping-Pong Dashboard Server');
  console.log(`  Porta: ${PORT}`);
  console.log(`  Projetos: ${projects.length} (${discovered.added} descoberto(s))\n`);

  setupWatchers();

  const server = http.createServer(handleRequest);
  server.listen(PORT, () => {
    console.log(`\n  Dashboard: http://localhost:${PORT}\n`);
  });

  // Re-setup watchers when projects.json changes
  fs.watch(PROJECTS_FILE, () => {
    console.log('\n  projects.json alterado — recarregando watchers...\n');
    setupWatchers();
    debouncedBroadcast();
  });
}

// ─── Exports (for testing) & Main ───────────────────────────────────────────

module.exports = { parseYaml, parseValue, discoverProjects, loadProjects };

// Only run CLI when executed directly (not when required by tests)
if (require.main === module) {
  cli();
}
