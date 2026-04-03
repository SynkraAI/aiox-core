/**
 * @module language
 * @description Shared language detection utility for HYDRA adapters.
 */

/**
 * Detect whether text is Portuguese or English based on keyword frequency.
 * Uses a sample of the first 500 characters to keep detection fast.
 *
 * @param {string} text - Text to analyze
 * @returns {string} Language code ('en' or 'pt')
 */
export function detectLanguage(text) {
  if (!text) return 'en';
  const sample = text.slice(0, 500).toLowerCase();
  const ptWords = [
    'para', 'como', 'que', 'uma', 'com', 'mais',
    'sobre', 'pode', 'quando', 'nao', 'este', 'esta',
    'pelo', 'pela',
  ];
  const ptCount = ptWords.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    return count + (sample.match(regex) || []).length;
  }, 0);
  return ptCount >= 3 ? 'pt' : 'en';
}
