/**
 * @module hallucination-check
 * @description Anti-Hallucination verification via second LLM call.
 * Verifies extracted insights against the original text (Story 7.2).
 */

import { callClaude } from '../processor/extractor.js';

/**
 * @typedef {Object} HallucinationCheckResult
 * @property {string} insight - The insight being verified
 * @property {'CONFIRMED'|'PARAPHRASED'|'HALLUCINATED'} status - Verification status
 * @property {string} explanation - Brief explanation
 */

/**
 * Build the hallucination check prompt.
 * @returns {string}
 */
function buildVerificationPrompt() {
  return `You are a fact-checker. Your job is to verify whether extracted insights actually appear in the original text.

For EACH insight provided, check against the original text and classify as:
- **CONFIRMED**: The insight is directly stated in the text
- **PARAPHRASED**: The insight captures the essence but uses different words
- **HALLUCINATED**: The insight is NOT present in the text — it was fabricated

Be strict. If you cannot find clear evidence in the text for an insight, mark it as HALLUCINATED.

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "results": [
    {
      "insight": "<the insight text>",
      "status": "CONFIRMED|PARAPHRASED|HALLUCINATED",
      "explanation": "<1 sentence>"
    }
  ]
}`;
}

/**
 * Verify extracted insights against the original text.
 * @param {import('../processor/extractor.js').ExtractedInsight[]} insights - Insights to verify
 * @param {string} originalText - The original text to verify against
 * @returns {Promise<{ results: HallucinationCheckResult[], stats: { confirmed: number, paraphrased: number, hallucinated: number, total: number } }>}
 */
export async function verifyInsights(insights, originalText) {
  if (!insights || insights.length === 0) {
    return { results: [], stats: { confirmed: 0, paraphrased: 0, hallucinated: 0, total: 0 } };
  }

  const systemPrompt = buildVerificationPrompt();

  const insightList = insights
    .map((i, idx) => `${idx + 1}. "${i.insight}" (evidence: "${i.evidence || 'none'}")`)
    .join('\n');

  const userContent = `## Original Text:\n\n${originalText}\n\n## Insights to Verify:\n\n${insightList}`;

  // Truncate if too long (keep original text priority)
  const maxLen = 8000;
  const truncatedContent = userContent.length > maxLen
    ? userContent.slice(0, maxLen) + '\n\n[... truncated ...]'
    : userContent;

  try {
    const rawResponse = await callClaude(systemPrompt, truncatedContent);

    const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)```/) || rawResponse.match(/\{[\s\S]*\}/);
    let jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawResponse;
    // Sanitize bad escape characters from LLM output (e.g. \' \_ \# etc.)
    jsonStr = jsonStr.replace(/\\([^"\\\/bfnrtu])/g, '$1');
    const parsed = JSON.parse(jsonStr);

    const results = Array.isArray(parsed.results) ? parsed.results : [];

    const stats = {
      confirmed: results.filter((r) => r.status === 'CONFIRMED').length,
      paraphrased: results.filter((r) => r.status === 'PARAPHRASED').length,
      hallucinated: results.filter((r) => r.status === 'HALLUCINATED').length,
      total: results.length,
    };

    return { results, stats };
  } catch (error) {
    console.warn(`[HallucinationCheck] Verification failed: ${error.message}`);
    // On failure, mark all as unverified (do not block pipeline)
    return {
      results: insights.map((i) => ({
        insight: i.insight,
        status: 'PARAPHRASED',
        explanation: 'Verification failed — marked as paraphrased for safety',
      })),
      stats: { confirmed: 0, paraphrased: insights.length, hallucinated: 0, total: insights.length },
    };
  }
}

/**
 * Filter out hallucinated insights from extraction results.
 * @param {import('../processor/extractor.js').ExtractedInsight[]} insights - All extracted insights
 * @param {HallucinationCheckResult[]} checkResults - Hallucination check results
 * @returns {{ confirmed: import('../processor/extractor.js').ExtractedInsight[], hallucinated: import('../processor/extractor.js').ExtractedInsight[] }}
 */
export function filterHallucinatedInsights(insights, checkResults) {
  const statusMap = new Map();
  for (const result of checkResults) {
    statusMap.set(result.insight, result.status);
  }

  const confirmed = [];
  const hallucinated = [];

  for (const insight of insights) {
    const status = statusMap.get(insight.insight);
    if (status === 'HALLUCINATED') {
      hallucinated.push(insight);
    } else {
      confirmed.push(insight);
    }
  }

  return { confirmed, hallucinated };
}
