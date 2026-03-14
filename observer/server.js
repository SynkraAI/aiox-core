#!/usr/bin/env node
'use strict';

/**
 * AIOX Visual Observer — Monitor Server
 *
 * Receives events from DashboardEmitter + Python hooks via HTTP POST,
 * broadcasts them in real-time to browser clients via WebSocket,
 * and serves the single-file dashboard HTML.
 *
 * WebSocket implemented natively (RFC 6455) — no `ws` package required.
 *
 * Usage:
 *   node observer/server.js
 *   PORT=4001 node observer/server.js
 *
 * Endpoints:
 *   POST /events          — receive DashboardEvent (from CLI + Python hooks)
 *   GET  /                — serve dashboard.html
 *   GET  /status          — current state JSON
 *   GET  /events/recent   — last 100 events JSON
 *   WS   /ws              — real-time event stream
 *
 * @module observer/server
 */

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { randomUUID } = crypto;

// chokidar is already in package.json dependencies
let chokidar;
try {
  chokidar = require('chokidar');
} catch (_e) {
  // If chokidar unavailable, file-watching is disabled (graceful degradation)
  chokidar = null;
}

const { createEventStore } = require('./event-store');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PORT = parseInt(process.env.PORT || process.env.AIOX_OBSERVER_PORT || '4001', 10);
const PROJECT_ROOT = process.env.AIOX_PROJECT_ROOT || process.cwd();
const BOB_STATUS_PATH = path.join(PROJECT_ROOT, '.aiox', 'dashboard', 'bob-status.json');
const DASHBOARD_HTML = path.join(__dirname, 'dashboard.html');

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const store = createEventStore();

/** @type {Set<import('net').Socket>} */
const wsClients = new Set();

// ---------------------------------------------------------------------------
// WebSocket — RFC 6455 native implementation
// ---------------------------------------------------------------------------

const WS_MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

/**
 * Perform WebSocket handshake on an upgraded socket.
 * @param {import('net').Socket} socket
 * @param {string} key  - value of Sec-WebSocket-Key header
 */
function wsHandshake(socket, key) {
  const accept = crypto
    .createHash('sha1')
    .update(key + WS_MAGIC)
    .digest('base64');

  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${accept}\r\n` +
    '\r\n'
  );
}

/**
 * Build a WebSocket text frame (server→client, unmasked).
 * @param {string} text
 * @returns {Buffer}
 */
function buildFrame(text) {
  const payload = Buffer.from(text, 'utf8');
  const len = payload.length;

  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81; // FIN + text opcode
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }

  return Buffer.concat([header, payload]);
}

/**
 * Build a WebSocket close frame.
 * @returns {Buffer}
 */
function buildCloseFrame() {
  return Buffer.from([0x88, 0x00]); // FIN + close opcode, zero length
}

/**
 * Unmask a WebSocket payload sent from client (clients always mask).
 * @param {Buffer} buf     - masked payload bytes
 * @param {Buffer} maskKey - 4-byte masking key
 * @returns {Buffer}
 */
function unmaskPayload(buf, maskKey) {
  const result = Buffer.allocUnsafe(buf.length);
  for (let i = 0; i < buf.length; i++) {
    result[i] = buf[i] ^ maskKey[i % 4];
  }
  return result;
}

/**
 * Send a JSON message to a single WebSocket client.
 * @param {import('net').Socket} socket
 * @param {string} type
 * @param {Object} data
 */
function sendToClient(socket, type, data) {
  try {
    const frame = buildFrame(JSON.stringify({ type, data, timestamp: Date.now() }));
    socket.write(frame);
  } catch (_e) {
    // Connection likely closed; will be cleaned up on 'close' event
  }
}

/**
 * Broadcast a message to all connected WebSocket clients.
 * @param {string} type
 * @param {Object} data
 */
function broadcast(type, data) {
  if (wsClients.size === 0) return;
  const frame = buildFrame(JSON.stringify({ type, data, timestamp: Date.now() }));
  for (const socket of wsClients) {
    try {
      socket.write(frame);
    } catch (_e) {
      wsClients.delete(socket);
      store.setConnectedClients(wsClients.size);
    }
  }
}

/**
 * Handle an incoming WebSocket frame from a client.
 * We only need to respond to ping and close — no app-level client→server messages.
 * @param {import('net').Socket} socket
 * @param {Buffer} buf
 */
function handleClientFrame(socket, buf) {
  try {
    if (buf.length < 2) return;

    const opcode = buf[0] & 0x0f;
    const masked = (buf[1] & 0x80) !== 0;
    let payloadLen = buf[1] & 0x7f;
    let offset = 2;

    if (payloadLen === 126) {
      payloadLen = buf.readUInt16BE(2);
      offset = 4;
    } else if (payloadLen === 127) {
      payloadLen = Number(buf.readBigUInt64BE(2));
      offset = 10;
    }

    let maskKey = null;
    if (masked) {
      maskKey = buf.slice(offset, offset + 4);
      offset += 4;
    }

    const rawPayload = buf.slice(offset, offset + payloadLen);
    const payload = masked ? unmaskPayload(rawPayload, maskKey) : rawPayload;

    if (opcode === 0x8) {
      // Close frame — echo close and end
      socket.write(buildCloseFrame());
      socket.end();
    } else if (opcode === 0x9) {
      // Ping — respond with pong
      const pong = Buffer.alloc(2 + payload.length);
      pong[0] = 0x8a; // FIN + pong opcode
      pong[1] = payload.length;
      payload.copy(pong, 2);
      socket.write(pong);
    }
    // All other opcodes (text, binary from client) are silently ignored
  } catch (_e) {
    // Malformed frame — ignore
  }
}

/**
 * Handle an HTTP upgrade request and register the WebSocket client.
 * @param {import('http').IncomingMessage} req
 * @param {import('net').Socket} socket
 */
function handleUpgrade(req, socket) {
  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }

  try {
    wsHandshake(socket, key);
  } catch (_e) {
    socket.destroy();
    return;
  }

  wsClients.add(socket);
  store.setConnectedClients(wsClients.size);

  // Send initial state snapshot
  try {
    sendToClient(socket, 'init', {
      state: store.getState(wsClients.size),
      recentEvents: store.getRecentEvents(50),
    });
  } catch (_e) {
    // Non-fatal
  }

  // Buffer for partial frames
  let frameBuffer = Buffer.alloc(0);

  socket.on('data', (chunk) => {
    try {
      frameBuffer = Buffer.concat([frameBuffer, chunk]);
      // Process complete frames
      while (frameBuffer.length >= 2) {
        let payloadLen = frameBuffer[1] & 0x7f;
        let headerLen = 2;
        if (payloadLen === 126) headerLen = 4;
        else if (payloadLen === 127) headerLen = 10;

        const masked = (frameBuffer[1] & 0x80) !== 0;
        if (masked) headerLen += 4;

        if (payloadLen === 126 && frameBuffer.length >= 4) {
          payloadLen = frameBuffer.readUInt16BE(2);
        } else if (payloadLen === 127 && frameBuffer.length >= 10) {
          payloadLen = Number(frameBuffer.readBigUInt64BE(2));
        }

        const totalLen = headerLen + payloadLen;
        if (frameBuffer.length < totalLen) break; // Wait for more data

        handleClientFrame(socket, frameBuffer.slice(0, totalLen));
        frameBuffer = frameBuffer.slice(totalLen);
      }
    } catch (_e) {
      // Ignore parse errors
    }
  });

  socket.on('close', () => {
    wsClients.delete(socket);
    store.setConnectedClients(wsClients.size);
  });

  socket.on('error', () => {
    wsClients.delete(socket);
    store.setConnectedClients(wsClients.size);
  });
}

// ---------------------------------------------------------------------------
// HTTP request handling
// ---------------------------------------------------------------------------

/**
 * Parse the JSON body of an HTTP request.
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<Object>}
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

/**
 * Send a JSON response.
 * @param {import('http').ServerResponse} res
 * @param {number} status
 * @param {Object} body
 */
function sendJson(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(json),
    'Access-Control-Allow-Origin': '*',
  });
  res.end(json);
}

/**
 * Serve the dashboard HTML file.
 * @param {import('http').ServerResponse} res
 */
function serveDashboard(res) {
  try {
    const html = fs.readFileSync(DASHBOARD_HTML, 'utf8');
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': Buffer.byteLength(html),
    });
    res.end(html);
  } catch (_e) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('dashboard.html not found');
  }
}

/**
 * Main HTTP request router.
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
async function handleRequest(req, res) {
  const url = req.url ? req.url.split('?')[0] : '/';
  const method = req.method || 'GET';

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  try {
    if (method === 'POST' && url === '/events') {
      const body = await readBody(req);
      // DashboardEmitter._postEvent does not include an `id` field — generate one
      const event = body.id ? body : Object.assign({ id: randomUUID() }, body);
      store.addEvent(event);
      broadcast('event', event);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (method === 'GET' && url === '/') {
      serveDashboard(res);
      return;
    }

    if (method === 'GET' && url === '/status') {
      sendJson(res, 200, store.getState(wsClients.size));
      return;
    }

    if (method === 'GET' && url === '/events/recent') {
      sendJson(res, 200, store.getRecentEvents(100));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  } catch (_e) {
    try {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request');
    } catch (__e) {
      // Response already sent
    }
  }
}

// ---------------------------------------------------------------------------
// bob-status.json file watcher
// ---------------------------------------------------------------------------

/**
 * Watch bob-status.json and broadcast state changes to WebSocket clients.
 * @param {string} statusPath
 */
function startStatusWatcher(statusPath) {
  if (!chokidar) {
    console.log('[observer] chokidar not available — file watcher disabled');
    return;
  }

  // Watch with ignoreInitial=false to get the current value on start
  const watcher = chokidar.watch(statusPath, {
    persistent: true,
    ignoreInitial: false,
    awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 },
  });

  const onChanged = (filePath) => {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(raw);
      store.setBobStatus(data);
      broadcast('status_update', data);
    } catch (_e) {
      // File temporarily unreadable (mid-write) — ignore
    }
  };

  watcher.on('add', onChanged);
  watcher.on('change', onChanged);

  watcher.on('error', (_e) => {
    // Watcher error — non-fatal, server continues
  });
}

// ---------------------------------------------------------------------------
// Server startup
// ---------------------------------------------------------------------------

/**
 * Start the observer server.
 * @param {number} [port]
 */
function startServer(port) {
  const server = http.createServer(handleRequest);

  server.on('upgrade', (req, socket, head) => {
    try {
      handleUpgrade(req, socket, head);
    } catch (_e) {
      try { socket.destroy(); } catch (__e) { /* ignore */ }
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[observer] Port ${port} already in use. Is the observer already running?`);
      console.error(`[observer] Set PORT env var to use a different port.`);
    } else {
      console.error('[observer] Server error:', err.message);
    }
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`[observer] AIOX Visual Observer running at http://localhost:${port}`);
    console.log(`[observer] Dashboard: http://localhost:${port}`);
    console.log(`[observer] Status API: http://localhost:${port}/status`);
    console.log(`[observer] Events API: POST http://localhost:${port}/events`);
    console.log(`[observer] WebSocket:  ws://localhost:${port}/ws`);
    console.log(`[observer] Watching:   ${BOB_STATUS_PATH}`);
  });

  startStatusWatcher(BOB_STATUS_PATH);

  return server;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  startServer(PORT);
}

module.exports = { startServer, broadcast, store };
