/**
 * Semantic Search Module
 *
 * Implements semantic search using OpenAI embeddings for intelligent
 * similarity matching based on meaning, not just keywords.
 *
 * @module cli/commands/workers/search-semantic
 * @version 1.0.0
 * @story 2.7 - Discovery CLI Search
 */

const path = require('path');
const fs = require('fs');

// Registry loader
const { getRegistry } = require('../../../core/registry/registry-loader');

// Cache for embeddings
let embeddingsCache = null;
let embeddingsCacheTimestamp = 0;
const EMBEDDINGS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Configurable timeouts and rate limits
const OPENAI_REQUEST_TIMEOUT_MS = parseInt(process.env.OPENAI_REQUEST_TIMEOUT_MS) || 10000; // 10s default
const RATE_LIMIT_DELAY_MS = parseInt(process.env.RATE_LIMIT_DELAY_MS) || 600; // 600ms for 100 RPM (Free tier)

/**
 * Check if semantic search is available
 * @returns {boolean} True if OPENAI_API_KEY is set
 */
function isSemanticAvailable() {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Get OpenAI embeddings for text
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} Embedding vector
 */
async function getEmbedding(text) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not set');
  }

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Handle rate limiting with Retry-After header
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new Error(`OpenAI rate limit exceeded. Retry after ${retryAfter || 'a few'} seconds.`);
      }
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`OpenAI request timed out after ${OPENAI_REQUEST_TIMEOUT_MS}ms`);
    }
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector
 * @returns {number} Similarity score (0-1)
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Load or generate worker embeddings
 * @returns {Promise<Map<string, {worker: object, embedding: number[]}>>}
 */
async function loadWorkerEmbeddings() {
  const now = Date.now();

  // Return cached if valid
  if (embeddingsCache && (now - embeddingsCacheTimestamp) < EMBEDDINGS_CACHE_TTL) {
    return embeddingsCache;
  }

  // Check for pre-computed embeddings file
  const embeddingsPath = path.join(
    process.cwd(),
    '.aiox-core/core/registry/worker-embeddings.json',
  );

  if (fs.existsSync(embeddingsPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(embeddingsPath, 'utf8'));
      embeddingsCache = new Map(Object.entries(data.embeddings));
      embeddingsCacheTimestamp = now;
      return embeddingsCache;
    } catch (error) {
      console.warn('Warning: Could not load pre-computed embeddings, will compute on-the-fly');
    }
  }

  // Load registry and compute embeddings on-the-fly
  const registry = getRegistry();
  const workers = await registry.getAll();

  embeddingsCache = new Map();

  // For performance, we'll batch the first N workers
  // In production, embeddings should be pre-computed
  const maxWorkersToEmbed = 50; // Limit for on-the-fly computation
  const workersToEmbed = workers.slice(0, maxWorkersToEmbed);

  for (const worker of workersToEmbed) {
    const text = buildSearchText(worker);
    try {
      const embedding = await getEmbedding(text);
      embeddingsCache.set(worker.id, { worker, embedding });
    } catch (error) {
      // Skip workers that fail embedding
      console.warn(`Warning: Could not embed worker ${worker.id}: ${error.message}`);
    }
  }

  // Add remaining workers without embeddings (will use keyword fallback)
  for (let i = maxWorkersToEmbed; i < workers.length; i++) {
    embeddingsCache.set(workers[i].id, { worker: workers[i], embedding: null });
  }

  embeddingsCacheTimestamp = now;
  return embeddingsCache;
}

/**
 * Build searchable text from worker
 * @param {object} worker - Worker object
 * @returns {string} Concatenated search text
 */
function buildSearchText(worker) {
  return [
    worker.name,
    worker.description,
    worker.category,
    worker.subcategory || '',
    ...(worker.tags || []),
    ...(worker.inputs || []),
    ...(worker.outputs || []),
  ].filter(Boolean).join(' ');
}

/**
 * Perform semantic search
 * @param {string} query - Search query
 * @returns {Promise<Array<{worker: object, score: number}>>} Search results with scores
 */
async function searchSemantic(query) {
  // Get query embedding
  const queryEmbedding = await getEmbedding(query);

  // Load worker embeddings
  const workerEmbeddings = await loadWorkerEmbeddings();

  const results = [];

  for (const [id, data] of workerEmbeddings) {
    if (data.embedding) {
      // Calculate semantic similarity
      const similarity = cosineSimilarity(queryEmbedding, data.embedding);
      const score = Math.round(similarity * 100);

      // Only include results with reasonable similarity
      if (score >= 20) {
        results.push({
          ...data.worker,
          score: score,
          matchType: 'semantic',
        });
      }
    } else {
      // Fallback to simple text matching for workers without embeddings
      const searchText = buildSearchText(data.worker).toLowerCase();
      if (searchText.includes(query.toLowerCase())) {
        results.push({
          ...data.worker,
          score: 50, // Default score for keyword matches
          matchType: 'keyword-fallback',
        });
      }
    }
  }

  return results;
}

/**
 * Pre-compute and save embeddings for all workers
 * @returns {Promise<void>}
 */
async function precomputeEmbeddings() {
  console.log('Pre-computing embeddings for all workers...');

  const registry = getRegistry();
  const workers = await registry.getAll();

  const embeddings = {};
  let computed = 0;
  let failed = 0;

  for (const worker of workers) {
    const text = buildSearchText(worker);
    try {
      const embedding = await getEmbedding(text);
      embeddings[worker.id] = { worker, embedding };
      computed++;
      process.stdout.write(`\rComputed: ${computed}/${workers.length}`);
    } catch (error) {
      failed++;
      console.warn(`\nWarning: Failed to embed ${worker.id}: ${error.message}`);
    }

    // Rate limiting - OpenAI Free tier allows 100 RPM, so 600ms delay
    // Configurable via RATE_LIMIT_DELAY_MS environment variable
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
  }

  console.log(`\nEmbeddings computed: ${computed}, failed: ${failed}`);

  // Save to file
  const embeddingsPath = path.join(
    process.cwd(),
    '.aiox-core/core/registry/worker-embeddings.json',
  );

  const data = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    model: 'text-embedding-3-small',
    count: computed,
    embeddings: embeddings,
  };

  fs.writeFileSync(embeddingsPath, JSON.stringify(data, null, 2));
  console.log(`Saved embeddings to: ${embeddingsPath}`);
}

module.exports = {
  isSemanticAvailable,
  searchSemantic,
  getEmbedding,
  cosineSimilarity,
  precomputeEmbeddings,
  buildSearchText,
};
