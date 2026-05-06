// Extracts Lighthouse category scores from each report and prints a Markdown table.
// Reads JSON sequentially to keep memory low.
import { promises as fs } from 'node:fs';
import path from 'node:path';

const dir = path.resolve('docs/qa/lighthouse');
const files = [
  'home-desktop.json',
  'home-mobile.json',
  'produto-desktop.json',
  'produto-mobile.json',
  'contato-desktop.json',
  'contato-mobile.json',
];

const rows = [];
for (const f of files) {
  const buf = await fs.readFile(path.join(dir, f), 'utf8');
  const j = JSON.parse(buf);
  const cat = j.categories || {};
  const round = (v) => (v == null ? null : Math.round(v * 100));
  rows.push({
    file: f,
    perf: round(cat.performance?.score),
    a11y: round(cat.accessibility?.score),
    bp: round(cat['best-practices']?.score),
    seo: round(cat.seo?.score),
    fcp: j.audits?.['first-contentful-paint']?.displayValue ?? '-',
    lcp: j.audits?.['largest-contentful-paint']?.displayValue ?? '-',
    cls: j.audits?.['cumulative-layout-shift']?.displayValue ?? '-',
    tbt: j.audits?.['total-blocking-time']?.displayValue ?? '-',
  });
  // free
}

const budgets = { perf: 90, a11y: 95, bp: 95, seo: 95 };
const verdict = (r) =>
  r.perf >= budgets.perf && r.a11y >= budgets.a11y && r.bp >= budgets.bp && r.seo >= budgets.seo
    ? 'PASS'
    : 'FAIL';

console.log('| File | Perf | A11y | BP | SEO | FCP | LCP | CLS | TBT | Verdict |');
console.log('|---|---|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  console.log(
    `| ${r.file} | ${r.perf} | ${r.a11y} | ${r.bp} | ${r.seo} | ${r.fcp} | ${r.lcp} | ${r.cls} | ${r.tbt} | ${verdict(r)} |`
  );
}
