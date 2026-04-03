/**
 * @module youtube-adapter
 * @description YouTube source adapter for HYDRA.
 * Uses yt-dlp to list recent videos and get subtitles, Whisper as fallback.
 * Returns normalized RawContent items with full transcripts.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { SourceAdapter } from './adapter-interface.js';
import { runYtdlp, transcribe } from './exec-helper.js';
import { detectLanguage } from '../utils/language.js';
import { chunkText, needsChunking, estimateTokens } from '../processor/chunker.js';

const TEMP_DIR = path.join(os.tmpdir(), 'hydra-youtube');
const MAX_VIDEOS = 5;

function ensureTempDir() {
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
}

function cleanupTemp(videoId) {
  try {
    const files = fs.readdirSync(TEMP_DIR).filter((f) => f.includes(videoId));
    for (const file of files) fs.unlinkSync(path.join(TEMP_DIR, file));
  } catch { /* best-effort */ }
}

/**
 * Resolve channel URL to channel ID (needed for RSS feed).
 * Fetches the channel page HTML and extracts channelId.
 */
async function resolveChannelId(channelUrl) {
  try {
    const res = await fetch(channelUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      redirect: 'follow',
    });
    const html = await res.text();
    const match = html.match(/"channelId":"([^"]+)"/);
    return match ? match[1] : null;
  } catch { return null; }
}

/** Channel ID cache to avoid repeated lookups */
const _channelIdCache = new Map();

/**
 * List recent videos via YouTube RSS feed (no auth required).
 * Falls back to yt-dlp if RSS fails.
 */
async function listVideosWithMetadata(url, limit = MAX_VIDEOS) {
  // Try RSS first (no auth, no bot detection)
  try {
    let channelId = _channelIdCache.get(url);
    if (!channelId) {
      channelId = await resolveChannelId(url);
      if (channelId) _channelIdCache.set(url, channelId);
    }

    if (channelId) {
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      const res = await fetch(rssUrl);
      const xml = await res.text();

      // Parse RSS XML entries
      const entries = [];
      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
      let match;
      while ((match = entryRegex.exec(xml)) !== null && entries.length < limit) {
        const entry = match[1];
        const videoId = entry.match(/<yt:videoId>([^<]+)/)?.[1];
        const title = entry.match(/<title>([^<]+)/)?.[1];
        const published = entry.match(/<published>([^<]+)/)?.[1];
        const authorName = entry.match(/<name>([^<]+)/)?.[1];

        if (videoId && title) {
          entries.push({
            id: videoId,
            title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'),
            upload_date: published ? published.slice(0, 10).replace(/-/g, '') : null,
            channel: authorName,
            channel_id: channelId,
            duration: 0, // RSS doesn't include duration; will be filled by yt-dlp if needed
          });
        }
      }

      if (entries.length > 0) {
        return entries;
      }
    }
  } catch (error) {
    console.warn(`[YouTube] RSS fallback failed for "${url}": ${error.message}`);
  }

  // Fallback to yt-dlp (may fail with bot detection)
  try {
    const { stdout } = await runYtdlp([
      '--dump-json',
      '--playlist-end', String(limit),
      '--no-download',
      '--no-warnings',
      url,
    ], { timeout: 60000 });

    return stdout.trim().split('\n').filter(Boolean).map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  } catch (error) {
    console.error(`[YouTube] Failed to list videos from "${url}": ${error.message}`);
    return [];
  }
}

/**
 * Get auto-generated subtitles as plain text.
 */
async function getSubtitles(videoId) {
  ensureTempDir();
  const outBase = path.join(TEMP_DIR, `${videoId}-subs`);

  try {
    await runYtdlp([
      '--write-auto-sub',
      '--sub-lang', 'en,pt',
      '--sub-format', 'vtt',
      '--skip-download',
      '-o', outBase,
      '--no-warnings',
      '--no-playlist',
      `https://www.youtube.com/watch?v=${videoId}`,
    ], { timeout: 30000 });
  } catch {
    // yt-dlp may exit with error code even when subs are downloaded (warnings)
  }

  // Check for VTT file regardless of exit code
  try {
    const files = fs.readdirSync(TEMP_DIR).filter((f) => f.startsWith(`${videoId}-subs`) && f.endsWith('.vtt'));
    if (files.length > 0) {
      const vttContent = fs.readFileSync(path.join(TEMP_DIR, files[0]), 'utf-8');
      for (const f of files) fs.unlinkSync(path.join(TEMP_DIR, f));
      return parseVTT(vttContent);
    }
  } catch { /* no files found */ }

  return null;
}

/**
 * Parse VTT to clean text.
 */
function parseVTT(vtt) {
  return vtt
    .split('\n')
    .filter((line) => {
      if (line.startsWith('WEBVTT')) return false;
      if (line.startsWith('Kind:')) return false;
      if (line.startsWith('Language:')) return false;
      if (/^\d{2}:\d{2}/.test(line)) return false;
      if (/^<\d{2}:\d{2}/.test(line)) return false;
      if (line.trim() === '') return false;
      if (/^\d+$/.test(line.trim())) return false;
      return true;
    })
    .map((line) => line.replace(/<[^>]+>/g, '').trim())
    .filter(Boolean)
    .reduce((acc, line) => {
      if (acc.length > 0 && acc[acc.length - 1] === line) return acc;
      acc.push(line);
      return acc;
    }, [])
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Download audio and transcribe using the unified chain (Groq API -> local Whisper).
 */
async function transcribeVideo(videoId) {
  ensureTempDir();
  const outPath = path.join(TEMP_DIR, `${videoId}.%(ext)s`);

  try {
    // Download audio
    await runYtdlp([
      '-x', '--audio-format', 'mp3', '--audio-quality', '5',
      '-o', outPath,
      '--no-warnings', '--no-playlist', '--max-filesize', '50M',
      `https://www.youtube.com/watch?v=${videoId}`,
    ], { timeout: 120000 });

    const audioFiles = fs.readdirSync(TEMP_DIR).filter((f) => f.startsWith(videoId) && !f.endsWith('.vtt'));
    if (audioFiles.length === 0) return null;

    const audioPath = path.join(TEMP_DIR, audioFiles[0]);

    // Transcribe via unified chain (Groq API first, local Whisper fallback)
    return await transcribe(audioPath, { outputDir: TEMP_DIR });
  } catch (error) {
    console.error(`[YouTube] Transcription failed for ${videoId}: ${error.message}`);
    return null;
  }
}

export class YoutubeAdapter extends SourceAdapter {
  constructor() {
    super('YouTube Adapter', 'youtube');
  }

  async fetch(sourceConfig) {
    const {
      url, name, domains, authority,
      max_videos = MAX_VIDEOS,
      whisper_model = 'small',
      chunking_max_tokens = 3000,
      chunking_overlap = 200,
      chunking_strategy = 'semantic',
    } = sourceConfig;

    const results = [];
    const videos = await listVideosWithMetadata(url, max_videos);

    if (videos.length === 0) {
      console.warn(`[YouTube] No videos found for "${name}"`);
      return [];
    }

    for (const meta of videos) {
      const videoId = meta.id;
      if (!videoId) continue;

      try {
        // Try subtitles first (free, fast)
        let transcript = await getSubtitles(videoId);
        let method = 'subtitles';

        if (!transcript || transcript.length < 100) {
          // Fallback: Whisper
          console.log(`[YouTube] No subtitles for "${meta.title}", using Whisper...`);
          transcript = await transcribeVideo(videoId);
          method = 'whisper';
        }

        if (!transcript || transcript.length < 50) {
          console.warn(`[YouTube] No transcript available for "${meta.title}"`);
          cleanupTemp(videoId);
          continue;
        }

        const description = meta.description || '';
        const contentRaw = description
          ? `${description}\n\n---\n\nTranscript:\n\n${transcript}`
          : transcript;

        // Determine if transcript needs chunking
        const transcriptTokens = estimateTokens(transcript);
        const isLong = needsChunking(transcript, chunking_max_tokens);
        let chunks = null;

        if (isLong) {
          chunks = chunkText(transcript, {
            maxTokens: chunking_max_tokens,
            overlap: chunking_overlap,
            strategy: chunking_strategy,
          });
          console.log(`[YouTube] "${meta.title}" is long (${Math.round(meta.duration / 60)}min, ~${transcriptTokens} tokens) — split into ${chunks.length} chunks`);
        }

        results.push(
          this.createRawContent({
            sourceId: videoId,
            title: meta.title || 'Untitled Video',
            contentRaw,
            author: meta.channel || meta.uploader || name,
            publishedAt: meta.upload_date
              ? new Date(`${meta.upload_date.slice(0, 4)}-${meta.upload_date.slice(4, 6)}-${meta.upload_date.slice(6, 8)}`)
              : new Date(),
            url: `https://www.youtube.com/watch?v=${videoId}`,
            language: detectLanguage(transcript),
            metadata: {
              channelName: name,
              domains,
              authority: authority || 3,
              duration: meta.duration,
              viewCount: meta.view_count,
              likeCount: meta.like_count,
              transcriptionMethod: method,
              channelId: meta.channel_id,
              tags: meta.tags || [],
              chunked: isLong,
              chunks: chunks,
              totalTokens: transcriptTokens,
            },
          })
        );

        cleanupTemp(videoId);
      } catch (error) {
        console.error(`[YouTube] Error processing "${meta.title}": ${error.message}`);
        cleanupTemp(videoId);
      }
    }

    return results;
  }
}
