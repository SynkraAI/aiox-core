#!/usr/bin/env node
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { WebSocketServer } = require('ws');

let jsyaml;
try { jsyaml = require('js-yaml'); } catch { jsyaml = null; }

// --- Constants ---
const PORT = parseInt(process.env.PORT, 10) || 5050;
const PUBLIC_DIR = path.join(__dirname, 'public');
const REGISTRY_PATH = path.join(os.homedir(), '.aios', 'quest-registry.yaml');
const REGISTRY_DIR = path.join(os.homedir(), '.aios');
const PACKS_DIR = path.join(__dirname, '..', 'packs');

// --- MIME types ---
const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico':  'image/x-icon',
  '.yaml': 'text/yaml',
  '.yml':  'text/yaml',
};

// --- YAML parser (prefers js-yaml, falls back to simple parser) ---
// Uses js-yaml when available for full YAML spec support.
// Falls back to a simple line-by-line parser for the subset used by quest-log.yaml and quest-registry.yaml.
function parseYaml(str) {
  if (jsyaml) {
    try {
      return jsyaml.load(str) || {};
    } catch (err) {
      console.error('[YAML] js-yaml parse error, falling back to simple parser:', err.message);
    }
  }
  return parseYamlSimple(str);
}

function parseYamlSimple(str) {
  try {
    // Use a line-by-line approach for simple flat/nested YAML
    const lines = str.split('\n');
    const result = {};
    const stack = [{ obj: result, indent: -1 }];
    let currentArrayKey = null;
    let currentArrayObj = null;
    let currentArrayItemIndent = -1;

    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, '');
      if (!line.trim() || line.trim().startsWith('#')) continue;

      const indent = line.search(/\S/);
      const content = line.trim();

      // Pop stack to correct level
      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
        stack.pop();
        currentArrayKey = null;
        currentArrayObj = null;
        currentArrayItemIndent = -1;
      }

      const parent = stack[stack.length - 1].obj;

      // Continuation of array object: indented key-value after "- key: value"
      if (currentArrayObj && indent > currentArrayItemIndent && !content.startsWith('- ')) {
        const colonIdx = content.indexOf(':');
        if (colonIdx > 0) {
          const key = content.slice(0, colonIdx).trim();
          const rawVal = content.slice(colonIdx + 1).trim();
          currentArrayObj[key] = parseYamlValue(rawVal);
        }
        continue;
      }

      // Array item
      if (content.startsWith('- ')) {
        const itemContent = content.slice(2).trim();

        // Array of objects: - key: value
        if (itemContent.includes(': ')) {
          const obj = {};
          const pairs = itemContent.split(/,\s*(?=\w+:)/);
          for (const pair of pairs) {
            const sepIdx = pair.indexOf(':');
            if (sepIdx > 0) {
              const k = pair.slice(0, sepIdx).trim();
              const v = parseYamlValue(pair.slice(sepIdx + 1).trim());
              obj[k] = v;
            }
          }

          // Find which array this belongs to
          if (currentArrayKey && Array.isArray(parent[currentArrayKey])) {
            parent[currentArrayKey].push(obj);
          } else {
            // Look for last key that could be an array
            const keys = Object.keys(parent);
            const lastKey = keys[keys.length - 1];
            if (lastKey && parent[lastKey] === null) {
              parent[lastKey] = [obj];
              currentArrayKey = lastKey;
            } else if (keys.length === 0 && stack.length > 1) {
              // Parent is an empty nested obj created for a key like "projects:"
              // Find the key in grandparent that points to this empty obj and convert to array
              const grandparent = stack[stack.length - 2].obj;
              for (const k of Object.keys(grandparent)) {
                if (grandparent[k] === parent) {
                  grandparent[k] = [obj];
                  currentArrayKey = k;
                  stack.pop();
                  break;
                }
              }
            }
          }
          currentArrayObj = obj;
          currentArrayItemIndent = indent;
        } else {
          // Simple array item: - value
          if (currentArrayKey && Array.isArray(parent[currentArrayKey])) {
            parent[currentArrayKey].push(parseYamlValue(itemContent));
          }
          currentArrayObj = null;
          currentArrayItemIndent = -1;
        }
        continue;
      }

      // Key-value pair
      currentArrayObj = null;
      currentArrayItemIndent = -1;
      const colonIdx = content.indexOf(':');
      if (colonIdx > 0) {
        const key = content.slice(0, colonIdx).trim();
        const rawVal = content.slice(colonIdx + 1).trim();

        if (rawVal === '' || rawVal === '{}' || rawVal === '[]') {
          // Nested object or empty
          parent[key] = rawVal === '[]' ? [] : null; // null = pending nested
          if (rawVal === '') {
            parent[key] = null; // Will be filled by children
            stack.push({ obj: parent, indent, key });
            // Override: create object for nesting
            const nested = {};
            parent[key] = nested;
            stack[stack.length - 1] = { obj: nested, indent };
            currentArrayKey = null;
          }
        } else {
          parent[key] = parseYamlValue(rawVal);
          currentArrayKey = null;
        }
      }
    }

    return result;
  } catch (err) {
    console.error('[YAML] Simple parser error:', err.message);
    return null;
  }
}

function parseYamlValue(str) {
  if (str === 'true') return true;
  if (str === 'false') return false;
  if (str === 'null' || str === '~') return null;
  if (/^-?\d+$/.test(str)) return parseInt(str, 10);
  if (/^-?\d+\.\d+$/.test(str)) return parseFloat(str);
  // Remove quotes
  if ((str.startsWith("'") && str.endsWith("'")) ||
      (str.startsWith('"') && str.endsWith('"'))) {
    return str.slice(1, -1);
  }
  return str;
}

// --- Registry management ---
function ensureRegistryDir() {
  if (!fs.existsSync(REGISTRY_DIR)) {
    fs.mkdirSync(REGISTRY_DIR, { recursive: true });
  }
}

function readRegistry() {
  try {
    if (!fs.existsSync(REGISTRY_PATH)) {
      ensureRegistryDir();
      fs.writeFileSync(REGISTRY_PATH, 'projects: []\n', 'utf-8');
      return { projects: [] };
    }
    const content = fs.readFileSync(REGISTRY_PATH, 'utf-8');
    const parsed = parseYaml(content);
    if (!parsed || !parsed.projects) {
      console.warn('[REGISTRY] Corrupted registry, rebuilding...');
      return rebuildRegistry();
    }
    // Ensure projects is an array
    if (!Array.isArray(parsed.projects)) {
      parsed.projects = [];
    }
    return parsed;
  } catch (err) {
    console.error('[REGISTRY] Error reading registry:', err.message);
    return rebuildRegistry();
  }
}

function writeRegistry(registry) {
  ensureRegistryDir();
  let yaml = 'projects:\n';
  if (registry.projects && registry.projects.length > 0) {
    for (const p of registry.projects) {
      yaml += `  - path: ${p.path}\n`;
      yaml += `    pack: ${p.pack || 'unknown'}\n`;
      yaml += `    project_name: ${p.project_name || path.basename(p.path)}\n`;
      if (p.theme) yaml += `    theme: ${p.theme}\n`;
      yaml += `    registered_at: ${p.registered_at || new Date().toISOString()}\n`;
      yaml += `    last_active: ${p.last_active || new Date().toISOString()}\n`;
    }
  }
  fs.writeFileSync(REGISTRY_PATH, yaml, 'utf-8');
}

function rebuildRegistry() {
  console.log('[REGISTRY] Rebuilding registry by scanning common paths...');
  const projects = [];
  const homedir = os.homedir();

  // Scan common project locations
  const searchPaths = [
    path.join(homedir, 'CODE', 'Projects'),
    path.join(homedir, 'CODE', 'design-systems'),
    path.join(homedir, 'CODE', 'frameworks'),
    path.join(homedir, 'CODE', 'tools'),
    path.join(homedir, 'aios-core', 'squads'),
    path.join(homedir, 'aios-core', 'packages'),
  ];

  for (const searchPath of searchPaths) {
    try {
      if (!fs.existsSync(searchPath)) continue;
      const dirs = fs.readdirSync(searchPath, { withFileTypes: true });
      for (const dir of dirs) {
        if (!dir.isDirectory()) continue;
        const projectPath = path.join(searchPath, dir.name);
        const questLogPath = path.join(projectPath, '.aios', 'quest-log.yaml');
        const checklistPath = path.join(projectPath, '.aios', 'pipeline-checklist.yaml');

        if (fs.existsSync(questLogPath) || fs.existsSync(checklistPath)) {
          const logFile = fs.existsSync(questLogPath) ? questLogPath : checklistPath;
          let pack = 'unknown';
          try {
            const logContent = fs.readFileSync(logFile, 'utf-8');
            const logData = parseYaml(logContent);
            if (logData?.meta?.pack) pack = logData.meta.pack;
          } catch { /* ignore */ }

          projects.push({
            path: projectPath,
            pack,
            project_name: dir.name,
            registered_at: new Date().toISOString(),
            last_active: new Date().toISOString(),
          });
        }
      }
    } catch { /* ignore inaccessible dirs */ }
  }

  const registry = { projects };
  ensureRegistryDir();
  writeRegistry(registry);
  console.log(`[REGISTRY] Rebuilt with ${projects.length} projects`);
  return registry;
}

// --- Project data reading ---
function readProjectData(projectPath) {
  const questLogPath = path.join(projectPath, '.aios', 'quest-log.yaml');
  const checklistPath = path.join(projectPath, '.aios', 'pipeline-checklist.yaml');

  let filePath = null;
  let format = null;

  if (fs.existsSync(questLogPath)) {
    filePath = questLogPath;
    format = 'quest-log';
  } else if (fs.existsSync(checklistPath)) {
    filePath = checklistPath;
    format = 'pipeline-checklist';
  }

  if (!filePath) return null;

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { content, format, path: filePath };
  } catch (err) {
    console.error(`[PROJECT] Error reading ${filePath}:`, err.message);
    return null;
  }
}

function getProjectStats(projectPath) {
  const data = readProjectData(projectPath);
  if (!data) return null;

  try {
    const parsed = parseYaml(data.content);
    if (!parsed) return { format: data.format, error: 'corrupted', raw: data.content };

    return {
      format: data.format,
      data: parsed,
      raw: data.content,
      path: data.path,
    };
  } catch {
    return { format: data.format, error: 'parse_error', raw: data.content };
  }
}

// --- Load pack YAML for enrichment ---
function loadPackData(packId) {
  if (!packId || packId === 'unknown') return null;
  const packPath = path.join(PACKS_DIR, `${packId}.yaml`);
  try {
    if (!fs.existsSync(packPath)) return null;
    const content = fs.readFileSync(packPath, 'utf8');
    return parseYaml(content);
  } catch {
    return null;
  }
}

// --- Validate registry: remove dead projects ---
function validateRegistry(registry) {
  const validProjects = [];
  let changed = false;

  for (const project of registry.projects || []) {
    if (!project.path || !fs.existsSync(project.path)) {
      console.log(`[REGISTRY] Removing dead project: ${project.path}`);
      changed = true;
      continue;
    }

    const questLogPath = path.join(project.path, '.aios', 'quest-log.yaml');
    const checklistPath = path.join(project.path, '.aios', 'pipeline-checklist.yaml');

    if (!fs.existsSync(questLogPath) && !fs.existsSync(checklistPath)) {
      console.log(`[REGISTRY] Removing project without quest data: ${project.path}`);
      changed = true;
      continue;
    }

    validProjects.push(project);
  }

  if (changed) {
    registry.projects = validProjects;
    writeRegistry(registry);
  }

  return registry;
}

// --- File watchers ---
const watchers = new Map();
let watchDebounces = new Map();

function startWatchingProject(projectPath, projectName) {
  const aiosDir = path.join(projectPath, '.aios');

  if (watchers.has(projectPath)) return;

  if (!fs.existsSync(aiosDir)) {
    // Poll until .aios directory appears
    const poll = setInterval(() => {
      if (fs.existsSync(aiosDir)) {
        clearInterval(poll);
        startWatchingProject(projectPath, projectName);
      }
    }, 10000);
    watchers.set(projectPath, { type: 'poll', interval: poll });
    return;
  }

  try {
    const watcher = fs.watch(aiosDir, { recursive: false }, (eventType, filename) => {
      if (!filename) return;
      if (!filename.includes('quest-log') && !filename.includes('pipeline-checklist')) return;

      // Debounce per project
      const debounceKey = `${projectPath}:${filename}`;
      clearTimeout(watchDebounces.get(debounceKey));
      watchDebounces.set(debounceKey, setTimeout(() => {
        const data = readProjectData(projectPath);
        if (data) {
          console.log(`[WATCH] ${projectName} updated — broadcasting to ${clients.size} clients`);
          broadcast({
            type: 'project_update',
            project: projectName,
            project_path: projectPath,
            format: data.format,
            data: data.content,
            timestamp: Date.now(),
          });
        }
      }, 300));
    });

    watchers.set(projectPath, { type: 'watch', watcher });
    console.log(`[WATCH] Watching ${aiosDir}`);
  } catch (err) {
    console.error(`[WATCH] Error watching ${aiosDir}:`, err.message);
  }
}

function startWatchingAll(registry) {
  for (const project of registry.projects || []) {
    startWatchingProject(project.path, project.project_name || path.basename(project.path));
  }
}

function stopAllWatchers() {
  for (const [, entry] of watchers) {
    if (entry.type === 'watch' && entry.watcher) entry.watcher.close();
    if (entry.type === 'poll' && entry.interval) clearInterval(entry.interval);
  }
  watchers.clear();
  watchDebounces.clear();
}

// Also watch registry file itself for external changes
let registryWatcher = null;

function watchRegistry() {
  if (!fs.existsSync(REGISTRY_DIR)) {
    ensureRegistryDir();
  }

  // Close previous watcher to prevent accumulation
  if (registryWatcher) {
    registryWatcher.close();
    registryWatcher = null;
  }

  try {
    registryWatcher = fs.watch(REGISTRY_DIR, { recursive: false }, (eventType, filename) => {
      if (!filename || !filename.includes('quest-registry')) return;

      clearTimeout(watchDebounces.get('registry'));
      watchDebounces.set('registry', setTimeout(() => {
        console.log('[REGISTRY] Registry changed, reloading...');
        const registry = readRegistry();
        const validated = validateRegistry(registry);

        // Restart watchers for any new projects
        stopAllWatchers();
        startWatchingAll(validated);
        watchRegistry();

        broadcast({
          type: 'registry_update',
          timestamp: Date.now(),
        });
      }, 500));
    });
  } catch (err) {
    console.error('[REGISTRY] Error watching registry dir:', err.message);
  }
}

// --- HTTP Server ---
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // POST: update project theme
  if (req.method === 'POST' && pathname.match(/^\/api\/project\/(.+)\/theme$/)) {
    const name = decodeURIComponent(pathname.split('/')[3]);
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { theme } = JSON.parse(body);
        const validThemes = ['cyberpunk','fantasy','ember','gold','violet','crimson','phosphor','neon','vapor','cozy','paper','sakura','mint','sand'];
        if (!validThemes.includes(theme)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid theme' }));
          return;
        }
        const registry = readRegistry();
        const project = (registry.projects || []).find(
          p => (p.project_name || path.basename(p.path)) === name
        );
        if (!project) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Project not found' }));
          return;
        }
        project.theme = theme;
        writeRegistry(registry);
        console.log(`[THEME] ${name} → ${theme}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, project: name, theme }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad request', message: err.message }));
      }
    });
    return;
  }

  // API routes
  if (pathname === '/api/projects') {
    serveProjects(res);
    return;
  }

  if (pathname.startsWith('/api/project/')) {
    const name = decodeURIComponent(pathname.slice('/api/project/'.length));
    serveProject(name, res);
    return;
  }

  if (pathname === '/api/registry') {
    serveRegistry(res);
    return;
  }

  // Static files
  const filePath = pathname === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, pathname);
  const ext = path.extname(filePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Forbidden' }));
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

// --- API handlers ---
function serveProjects(res) {
  try {
    const registry = readRegistry();
    const validated = validateRegistry(registry);
    const projects = [];

    // Cache packs to avoid re-reading per project
    const packCache = {};

    for (const project of validated.projects || []) {
      const stats = getProjectStats(project.path);
      const packId = project.pack || 'unknown';

      // Load pack data (cached)
      if (!packCache[packId]) {
        packCache[packId] = loadPackData(packId) || null;
      }

      projects.push({
        name: project.project_name || path.basename(project.path),
        path: project.path,
        pack: packId,
        pack_data: packCache[packId],
        theme: project.theme || 'cyberpunk',
        registered_at: project.registered_at,
        last_active: project.last_active,
        has_data: !!stats && !stats.error,
        format: stats?.format || null,
        data: stats?.raw || null,
        error: stats?.error || null,
      });
    }

    // Sort by last_active (most recent first)
    projects.sort((a, b) => {
      const dateA = a.last_active ? new Date(a.last_active).getTime() : 0;
      const dateB = b.last_active ? new Date(b.last_active).getTime() : 0;
      return dateB - dateA;
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ projects, count: projects.length }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal error', message: err.message }));
  }
}

function serveProject(name, res) {
  try {
    const registry = readRegistry();
    const project = (registry.projects || []).find(
      p => (p.project_name || path.basename(p.path)) === name
    );

    if (!project) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Project not found', name }));
      return;
    }

    const data = readProjectData(project.path);
    if (!data) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No quest data', name, path: project.path }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/yaml' });
    res.end(data.content);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal error', message: err.message }));
  }
}

function serveRegistry(res) {
  try {
    if (fs.existsSync(REGISTRY_PATH)) {
      const content = fs.readFileSync(REGISTRY_PATH, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/yaml' });
      res.end(content);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/yaml' });
      res.end('projects: []\n');
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal error', message: err.message }));
  }
}

// --- WebSocket ---
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[WS] Client connected (${clients.size} total)`);

  // Send initial data: all projects
  try {
    const registry = readRegistry();
    const validated = validateRegistry(registry);

    for (const project of validated.projects || []) {
      const data = readProjectData(project.path);
      if (data) {
        ws.send(JSON.stringify({
          type: 'project_update',
          project: project.project_name || path.basename(project.path),
          project_path: project.path,
          format: data.format,
          data: data.content,
          timestamp: Date.now(),
        }));
      }
    }

    // Also send registry info
    ws.send(JSON.stringify({
      type: 'registry_info',
      projects: validated.projects || [],
      timestamp: Date.now(),
    }));
  } catch (err) {
    console.error('[WS] Error sending initial data:', err.message);
  }

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected (${clients.size} total)`);
  });

  ws.on('error', () => clients.delete(ws));
});

function broadcast(message) {
  const payload = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(payload);
    }
  }
}

// --- Check if already running ---
function checkPortAndStart() {
  const test = http.request({ host: '127.0.0.1', port: PORT, method: 'HEAD', path: '/', timeout: 1000 }, (res) => {
    console.log(`[SKIP] Dashboard already running on port ${PORT} (HTTP ${res.statusCode}). Not starting another instance.`);
    process.exit(0);
  });
  test.on('error', () => {
    // Port is free — start the server
    startServer();
  });
  test.on('timeout', () => {
    test.destroy();
    startServer();
  });
  test.end();
}

function startServer() {
  server.listen(PORT, () => {
    const registry = readRegistry();
    const validated = validateRegistry(registry);

  console.log('');
  console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  QUEST MASTER — DASHBOARD HUB');
  console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Dashboard:  http://localhost:${PORT}`);
  console.log(`  Registry:   ${REGISTRY_PATH}`);
  console.log(`  Projects:   ${validated.projects.length} registered`);
  if (validated.projects.length > 0) {
    for (const p of validated.projects) {
      const name = p.project_name || path.basename(p.path);
      console.log(`              - ${name} (${p.pack || '?'})`);
    }
  }
  console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  startWatchingAll(validated);
  watchRegistry();
  });
}

checkPortAndStart();

// --- Graceful shutdown ---
process.on('SIGINT', () => {
  console.log('\n[SHUTDOWN] Closing watchers and server...');
  stopAllWatchers();
  wss.close();
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  stopAllWatchers();
  wss.close();
  server.close(() => process.exit(0));
});
