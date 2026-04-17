// Extract Lighthouse scores from PROD revalidation reports (mobile only).
// Sequential to keep memory low.
import { promises as fs } from 'node:fs';
import path from 'node:path';

const dir = path.resolve('docs/qa/lighthouse');
const files = ['home-mobile-prod.json', 'produto-mobile-prod.json', 'contato-mobile-prod.json'];

const round = (v) => (v == null ? null : Math.round(v * 100));
const rows = [];
for (const f of files) {
  const buf = await fs.readFile(path.join(dir, f), 'utf8');
  const j = JSON.parse(buf);
  const cat = j.categories || {};
  const a = j.audits || {};
  rows.push({
    file: f,
    perf: round(cat.performance?.score),
    a11y: round(cat.accessibility?.score),
    bp: round(cat['best-practices']?.score),
    seo: round(cat.seo?.score),
    fcp: a['first-contentful-paint']?.displayValue ?? '-',
    lcp: a['largest-contentful-paint']?.displayValue ?? '-',
    cls: a['cumulative-layout-shift']?.displayValue ?? '-',
    tbt: a['total-blocking-time']?.displayValue ?? '-',
    tti: a['interactive']?.displayValue ?? '-',
    si: a['speed-index']?.displayValue ?? '-',
  });
}

const verdict = (r) => (r.perf >= 90 ? 'PASS' : 'FAIL');

console.log('| Page | Perf | A11y | BP | SEO | FCP | LCP | CLS | TBT | TTI | SI | Verdict |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  console.log(
    `| ${r.file} | ${r.perf} | ${r.a11y} | ${r.bp} | ${r.seo} | ${r.fcp} | ${r.lcp} | ${r.cls} | ${r.tbt} | ${r.tti} | ${r.si} | ${verdict(r)} |`
  );
}
