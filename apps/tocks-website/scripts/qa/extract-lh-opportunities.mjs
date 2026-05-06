// Pull top failing audits / opportunities from a Lighthouse JSON report.
import { promises as fs } from 'node:fs';
import path from 'node:path';

const target = process.argv[2];
if (!target) {
  console.error('Usage: node extract-lh-opportunities.mjs <path-to-lh.json>');
  process.exit(1);
}
const buf = await fs.readFile(path.resolve(target), 'utf8');
const j = JSON.parse(buf);
const a = j.audits || {};

// Collect all audits with score < 1 (or null for opportunities) in performance category
const perfRefs = j.categories?.performance?.auditRefs || [];
const perfAudits = perfRefs
  .map((ref) => ({ id: ref.id, weight: ref.weight, audit: a[ref.id] }))
  .filter((x) => x.audit && (x.audit.score === null || x.audit.score < 1))
  .sort((x, y) => (y.audit.score === null ? 1 : 0) - (x.audit.score === null ? 1 : 0) || y.weight - x.weight);

console.log('## Performance audits failing / opportunities (sorted by impact)');
console.log('');
for (const { id, weight, audit } of perfAudits.slice(0, 25)) {
  const score = audit.score === null ? 'opp' : Math.round(audit.score * 100);
  const display = audit.displayValue || '';
  const wastedMs = audit.details?.overallSavingsMs ?? '';
  const wastedBytes = audit.details?.overallSavingsBytes ?? '';
  console.log(
    `- [${score}] (w=${weight}) **${id}** — ${audit.title}${display ? ` — ${display}` : ''}${wastedMs ? ` (savings ${wastedMs}ms)` : ''}${wastedBytes ? ` (savings ${Math.round(wastedBytes / 1024)}KB)` : ''}`
  );
}

// Largest images / network items
console.log('');
console.log('## Heaviest network items (top 10)');
const items = a['network-requests']?.details?.items || [];
const heavy = items
  .map((i) => ({ url: i.url, size: i.transferSize ?? i.resourceSize ?? 0, type: i.resourceType, mime: i.mimeType }))
  .sort((x, y) => y.size - x.size)
  .slice(0, 10);
for (const h of heavy) {
  console.log(`- ${(h.size / 1024).toFixed(1)} KB · ${h.type || h.mime || '?'} · ${h.url}`);
}
