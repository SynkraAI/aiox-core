/**
 * @module podcast-adapter
 * @description Podcast source adapter for HYDRA.
 * Parses podcast RSS feeds, downloads audio episodes, transcribes with Whisper.
 * Returns normalized RawContent items with full transcripts.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import Parser from 'rss-parser';
import { SourceAdapter } from './adapter-interface.js';
import { runYtdlp, transcribe } from './exec-helper.js';
import { detectLanguage } from '../utils/language.js';
import { chunkText, needsChunking, estimateTokens } from '../processor/chunker.js';

const TEMP_DIR = path.join(os.tmpdir(), 'hydra-podcasts');
const MAX_EPISODES = 3;

const rssParser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'HYDRA/0.1.0 (Content Intelligence System)',
  },
  customFields: {
    item: [
      ['itunes:duration', 'duration'],
      ['itunes:author', 'itunesAuthor'],
      ['itunes:summary', 'itunesSummary'],
      ['enclosure', 'enclosure'],
    ],
  },
});

/**
 * Ensure temp directory exists.
 */
function ensureTempDir() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

/**
 * Parse duration string (HH:MM:SS or seconds) to seconds.
 * @param {string|number} duration
 * @returns {number}
 */
function parseDuration(duration) {
  if (!duration) return 0;
  if (typeof duration === 'number') return duration;

  const parts = String(duration).split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parseInt(duration, 10) || 0;
}

/**
 * Generate a safe filename from episode title.
 * @param {string} title
 * @returns {string}
 */
function safeFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * Download audio from a direct URL using yt-dlp (handles redirects, auth, etc.).
 * @param {string} audioUrl - Direct audio URL
 * @param {string} episodeId - Safe episode identifier
 * @returns {Promise<string|null>} Path to downloaded audio file
 */
async function downloadAudio(audioUrl, episodeId) {
  ensureTempDir();
  const outputPath = path.join(TEMP_DIR, `${episodeId}.%(ext)s`);

  try {
    await runYtdlp([
      '-x',
      '--audio-format', 'mp3',
      '--audio-quality', '5',
      '-o', outputPath,
      '--no-warnings',
      '--no-playlist',
      '--max-filesize', '100M',
      audioUrl,
    ], { timeout: 180000 });

    const files = fs.readdirSync(TEMP_DIR).filter((f) => f.startsWith(episodeId));
    if (files.length > 0) {
      return path.join(TEMP_DIR, files[0]);
    }
    return null;
  } catch (error) {
    console.error(`[Podcast] Failed to download audio: ${error.message}`);
    return null;
  }
}

/**
 * Transcribe audio using the unified chain (Groq API -> local Whisper).
 * @param {string} audioPath - Path to audio file
 * @returns {Promise<string|null>} Transcript text
 */
async function transcribeAudio(audioPath) {
  try {
    const outputDir = path.dirname(audioPath);
    return await transcribe(audioPath, { outputDir });
  } catch (error) {
    console.error(`[Podcast] Transcription failed: ${error.message}`);
    return null;
  }
}

/**
 * Clean up temp files for an episode.
 * @param {string} episodeId
 */
function cleanupTemp(episodeId) {
  try {
    const files = fs.readdirSync(TEMP_DIR).filter((f) => f.includes(episodeId));
    for (const file of files) {
      fs.unlinkSync(path.join(TEMP_DIR, file));
    }
  } catch {
    // Best-effort cleanup
  }
}

export class PodcastAdapter extends SourceAdapter {
  constructor() {
    super('Podcast Adapter', 'podcast');
  }

  /**
   * Fetch recent podcast episodes, download audio, transcribe.
   *
   * @param {Object} sourceConfig - Source configuration
   * @param {string} sourceConfig.url - Podcast RSS feed URL
   * @param {string} sourceConfig.name - Podcast name
   * @param {string[]} sourceConfig.domains - Associated domains
   * @param {number} [sourceConfig.authority] - Source authority (1-5)
   * @param {number} [sourceConfig.max_episodes] - Max episodes to process
   * @param {string} [sourceConfig.whisper_model] - Whisper model (tiny/small/medium)
   * @returns {Promise<import('./adapter-interface.js').RawContent[]>}
   */
  async fetch(sourceConfig) {
    const {
      url,
      name,
      domains,
      authority,
      max_episodes = MAX_EPISODES,
      whisper_model = 'small',
      chunking_max_tokens = 3000,
      chunking_overlap = 200,
      chunking_strategy = 'semantic',
    } = sourceConfig;

    const results = [];

    // Step 1: Parse podcast RSS feed
    let feed;
    try {
      feed = await rssParser.parseURL(url);
    } catch (error) {
      console.error(`[Podcast] Failed to parse feed "${name}" (${url}): ${error.message}`);
      return [];
    }

    const episodes = (feed.items || []).slice(0, max_episodes);
    if (episodes.length === 0) {
      console.warn(`[Podcast] No episodes found for "${name}"`);
      return [];
    }

    for (const episode of episodes) {
      const audioUrl = episode.enclosure?.url;
      if (!audioUrl) {
        console.warn(`[Podcast] No audio URL for "${episode.title}"`);
        continue;
      }

      const episodeId = safeFilename(episode.title || 'episode');
      const durationSec = parseDuration(episode.duration);

      try {
        // Step 2: Download audio
        console.log(`[Podcast] Downloading "${episode.title}"...`);
        const audioPath = await downloadAudio(audioUrl, episodeId);
        if (!audioPath) {
          console.warn(`[Podcast] Download failed for "${episode.title}"`);
          continue;
        }

        // Step 3: Transcribe
        console.log(`[Podcast] Transcribing "${episode.title}"...`);
        const transcript = await transcribeAudio(audioPath);

        if (!transcript || transcript.length < 50) {
          console.warn(`[Podcast] Transcription too short for "${episode.title}"`);
          cleanupTemp(episodeId);
          continue;
        }

        // Build content: show notes + transcript
        const showNotes = episode.itunesSummary || episode.contentSnippet || episode.content || '';
        const contentRaw = showNotes
          ? `Show Notes:\n${showNotes}\n\n---\n\nTranscript:\n\n${transcript}`
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
          console.log(`[Podcast] "${episode.title}" is long (~${transcriptTokens} tokens) — split into ${chunks.length} chunks`);
        }

        results.push(
          this.createRawContent({
            sourceId: episode.guid || episode.link || audioUrl,
            title: episode.title || 'Untitled Episode',
            contentRaw,
            author: episode.itunesAuthor || episode.creator || feed.title || name,
            publishedAt: episode.pubDate || episode.isoDate || new Date(),
            url: episode.link || audioUrl,
            language: detectLanguage(transcript),
            metadata: {
              podcastName: name,
              feedUrl: url,
              domains,
              authority: authority || 3,
              duration: durationSec,
              audioUrl,
              transcriptionMethod: 'whisper',
              whisperModel: whisper_model,
              chunked: isLong,
              chunks: chunks,
              totalTokens: transcriptTokens,
            },
          })
        );

        cleanupTemp(episodeId);
      } catch (error) {
        console.error(`[Podcast] Error processing "${episode.title}": ${error.message}`);
        cleanupTemp(episodeId);
      }
    }

    return results;
  }
}
