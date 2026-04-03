/**
 * @module exec-helper
 * @description Cross-platform command execution helpers for HYDRA adapters.
 * Resolves yt-dlp, whisper, and python paths correctly on Windows/Linux.
 */

import { exec, execFile } from 'node:child_process';
import https from 'node:https';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

/** @type {string|null} */
let _ytdlpCmd = null;

/**
 * Find the working yt-dlp command. Caches result.
 * Tries: yt-dlp (PATH) → python -m yt_dlp → full Windows path.
 * @returns {Promise<string>} Working command
 */
export async function findYtdlp() {
  if (_ytdlpCmd) return _ytdlpCmd;

  // Try direct
  try {
    await execAsync('yt-dlp --version', { timeout: 5000 });
    _ytdlpCmd = 'yt-dlp';
    return _ytdlpCmd;
  } catch { /* not in PATH */ }

  // Try python module
  try {
    await execAsync('python -m yt_dlp --version', { timeout: 5000 });
    _ytdlpCmd = 'python -m yt_dlp';
    return _ytdlpCmd;
  } catch { /* not available */ }

  // Try common Windows paths
  const winPaths = [
    `${process.env.LOCALAPPDATA || ''}\\Python\\pythoncore-3.14-64\\Scripts\\yt-dlp.exe`,
    `${process.env.LOCALAPPDATA || ''}\\Programs\\Python\\Python312\\Scripts\\yt-dlp.exe`,
    `${process.env.LOCALAPPDATA || ''}\\Programs\\Python\\Python311\\Scripts\\yt-dlp.exe`,
  ];

  for (const p of winPaths) {
    try {
      await execAsync(`"${p}" --version`, { timeout: 5000 });
      _ytdlpCmd = `"${p}"`;
      return _ytdlpCmd;
    } catch { /* try next */ }
  }

  throw new Error('yt-dlp not found. Install with: pip install yt-dlp');
}

/**
 * Execute yt-dlp with arguments. Uses exec (not execFile) to handle python -m and quoted paths.
 * @param {string[]} args - yt-dlp arguments
 * @param {Object} [options] - exec options
 * @returns {Promise<{ stdout: string, stderr: string }>}
 */
export async function runYtdlp(args, options = {}) {
  const cmd = await findYtdlp();
  const execOpts = {
    timeout: 120000,
    maxBuffer: 10 * 1024 * 1024,
    ...options,
  };

  // Auto-inject cookies if available (bypasses YouTube bot detection)
  const cookiesPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'cookies.txt');
  if (fs.existsSync(cookiesPath) && !args.includes('--cookies')) {
    args = ['--cookies', cookiesPath, ...args];
  }

  // Security: use execFile (no shell) when cmd is a direct binary path.
  // Fall back to exec for 'python -m yt_dlp' which needs shell interpretation.
  if (cmd.includes(' ')) {
    // Multi-word command (e.g. 'python -m yt_dlp') -- use shell but sanitize args
    const escapedArgs = args.map((a) => {
      if (a.includes(' ') && !a.startsWith('"')) return `"${a}"`;
      return a;
    });
    const fullCmd = `${cmd} ${escapedArgs.join(' ')}`;
    return execAsync(fullCmd, execOpts);
  }

  // Single binary -- use execFile (no shell, no injection possible)
  const cleanCmd = cmd.replace(/^"|"$/g, '');
  return execFileAsync(cleanCmd, args, execOpts);
}

/**
 * Resolve the path to HYDRA's transcribe.py script.
 * Works from any CWD by resolving relative to this module's location.
 * @returns {string} Absolute path to scripts/transcribe.py
 */
function getTranscribeScript() {
  // exec-helper.js lives in src/sources/, script is in scripts/
  // Use fileURLToPath for correct Windows path resolution (avoids /D:/D:/ duplication)
  const moduleFile = fileURLToPath(import.meta.url);
  const moduleDir = path.dirname(moduleFile);
  return path.resolve(moduleDir, '..', '..', 'scripts', 'transcribe.py');
}

/**
 * Transcribe audio using the Groq Whisper API (free, fast, cloud-based).
 * Uses native Node.js https module — no SDK or npm deps needed.
 *
 * @param {string} audioPath - Path to audio file (mp3, wav, etc.)
 * @returns {Promise<string|null>} Transcription text, or null if unavailable
 */
export async function transcribeWithGroq(audioPath) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const fileName = path.basename(audioPath);
    const fileBuffer = fs.readFileSync(audioPath);
    const boundary = `----HydraBoundary${Date.now()}`;

    // Build multipart/form-data body manually (no deps)
    const parts = [];

    // file field
    parts.push(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
      `Content-Type: application/octet-stream\r\n\r\n`
    );
    parts.push(fileBuffer);
    parts.push('\r\n');

    // model field
    parts.push(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="model"\r\n\r\n` +
      `whisper-large-v3-turbo\r\n`
    );

    // response_format field
    parts.push(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="response_format"\r\n\r\n` +
      `text\r\n`
    );

    parts.push(`--${boundary}--\r\n`);

    // Combine into a single Buffer
    const bodyParts = parts.map((p) => (typeof p === 'string' ? Buffer.from(p, 'utf-8') : p));
    const body = Buffer.concat(bodyParts);

    const url = new URL('https://api.groq.com/openai/v1/audio/transcriptions');

    const response = await new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: url.hostname,
          port: 443,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': body.length,
          },
          timeout: 120000,
        },
        (res) => {
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => {
            const responseBody = Buffer.concat(chunks).toString('utf-8');
            resolve({ status: res.statusCode, body: responseBody });
          });
        }
      );

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Groq API request timed out (120s)'));
      });

      req.write(body);
      req.end();
    });

    if (response.status !== 200) {
      console.warn(`[Groq] API returned status ${response.status}: ${response.body.slice(0, 200)}`);
      return null;
    }

    const text = response.body.trim();
    if (!text || text.length < 10) {
      console.warn('[Groq] Transcription returned empty or too short');
      return null;
    }

    console.log(`[Groq] Transcribed successfully (${text.length} chars)`);
    return text;
  } catch (error) {
    console.warn(`[Groq] Transcription failed: ${error.message}`);
    return null;
  }
}

/**
 * Execute whisper transcription using faster-whisper (via scripts/transcribe.py).
 * Falls back gracefully if faster-whisper is not installed.
 *
 * @param {string} audioPath - Path to audio file
 * @param {Object} [opts] - Options
 * @param {string} [opts.model='small'] - Whisper model (tiny/base/small/medium/large-v2)
 * @param {string} [opts.outputDir] - Output directory
 * @returns {Promise<{ stdout: string, stderr: string }>}
 */
export async function runWhisper(audioPath, opts = {}) {
  const { model = 'small', outputDir } = opts;
  const outDir = outputDir || path.dirname(audioPath);
  const scriptPath = getTranscribeScript();

  const cmd = `python "${scriptPath}" "${audioPath}" ${model} "${outDir}"`;
  return execAsync(cmd, {
    timeout: 600000,
    maxBuffer: 10 * 1024 * 1024,
  });
}

/**
 * Unified transcription chain: Groq API first, local Whisper fallback.
 * This is the recommended entry point for all transcription needs.
 *
 * Chain: Groq API → local Whisper (tiny model) → null
 *
 * @param {string} audioPath - Path to audio file
 * @param {Object} [opts] - Options
 * @param {string} [opts.outputDir] - Output directory for local Whisper
 * @returns {Promise<string|null>} Transcription text, or null if all methods fail
 */
export async function transcribe(audioPath, opts = {}) {
  // 1. Try Groq API (fast, free, no local resources)
  const groqResult = await transcribeWithGroq(audioPath);
  if (groqResult) return groqResult;

  // 2. Fallback: local Whisper with tiny model (least memory)
  try {
    const outputDir = opts.outputDir || path.dirname(audioPath);
    await runWhisper(audioPath, { model: 'tiny', outputDir });

    const baseName = path.basename(audioPath, path.extname(audioPath));
    const txtPath = path.join(outputDir, `${baseName}.txt`);
    if (fs.existsSync(txtPath)) {
      const text = fs.readFileSync(txtPath, 'utf-8').trim();
      fs.unlinkSync(txtPath);
      if (text && text.length >= 10) {
        console.log(`[Whisper] Local transcription OK (${text.length} chars, model=tiny)`);
        return text;
      }
    }
  } catch (error) {
    console.warn(`[Whisper] Local transcription failed: ${error.message}`);
  }

  // 3. All methods failed
  return null;
}
