/**
 * Base CSS template for branded PDFs.
 * Extracted from generate-pdf.mjs and refactored to use CSS custom properties.
 * All colors reference var(--xxx) so they adapt to any brand config.
 */

/**
 * @param {string} rootVars - CSS :root block from brand-loader
 * @param {string} fontFamily - Font family name
 * @returns {string} Complete CSS string
 */
export function getBaseCSS(rootVars, fontFamily) {
  return `
  @page { size: A4; margin: 0; }

  ${rootVars}

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: '${fontFamily}', -apple-system, sans-serif;
    background: var(--background);
    color: var(--text);
    font-size: 10pt;
    line-height: 1.6;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ---- COVER PAGE ---- */
  .cover {
    height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center;
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%, var(--cover-gradient-primary, rgba(108,60,225,0.25)) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 80%, var(--cover-gradient-secondary, rgba(139,92,246,0.1)) 0%, transparent 60%),
      var(--background);
    page-break-after: always;
  }
  .cover-badge {
    display: inline-block;
    background: rgba(0,71,150,0.2); border: 1px solid rgba(0,71,150,0.4);
    padding: 6px 20px; border-radius: 100px;
    font-size: 8.5pt; color: var(--primary-light); font-weight: 500;
    margin-bottom: 32px;
  }
  .cover-logos { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
  .cover-logos img { height: 48px; }
  .cover-logos .sep { font-size: 24pt; color: var(--text-muted); opacity: .5; font-weight: 300; }
  .cover h1 {
    font-size: 26pt; font-weight: 800; line-height: 1.2; margin-bottom: 6px;
  }
  .cover .highlight {
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    font-style: italic;
  }
  .cover .subtitle {
    font-size: 10.5pt; color: var(--text-muted); max-width: 420px; margin: 16px auto 0;
  }
  .cover .subtitle strong { color: var(--white); }
  .cover .confidential { font-size: 8pt; color: var(--text-muted); font-style: italic; margin-top: 40px; }

  /* ---- SECTION STRUCTURE ---- */
  section { page-break-before: always; padding: 20mm 18mm; }
  .section-num { font-size: 8pt; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
  h2 { font-size: 18pt; font-weight: 700; margin-bottom: 10px; color: var(--white); }
  h3 { font-size: 12pt; font-weight: 700; margin: 18px 0 8px; color: var(--white); }
  p, li { color: var(--text); }
  p { margin-bottom: 8px; }
  strong { color: var(--white); }

  /* ---- CARDS GRID ---- */
  .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 14px 0; }
  .card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 10px; padding: 14px 16px;
    break-inside: avoid;
  }
  .card-icon { font-size: 20pt; margin-bottom: 6px; }
  .card h4 { font-size: 10pt; font-weight: 700; color: var(--white); margin-bottom: 4px; }
  .card p { font-size: 8.5pt; color: var(--text-muted); margin: 0; }

  /* ---- STATS ROW ---- */
  .stats { display: flex; gap: 10px; margin: 14px 0; flex-wrap: wrap; }
  .stat {
    flex: 1; min-width: 90px; text-align: center;
    background: var(--card); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px 8px;
  }
  .stat-value { font-size: 16pt; font-weight: 800; color: var(--primary-light); }
  .stat-label { font-size: 7.5pt; color: var(--text-muted); margin-top: 2px; }

  /* ---- FEATURE BLOCKS ---- */
  .feature-block {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 10px; padding: 16px 18px; margin: 10px 0;
    break-inside: avoid;
  }
  .feature-block h4 {
    font-size: 10.5pt; font-weight: 700; color: var(--white); margin-bottom: 8px;
  }
  .badge {
    display: inline-block; font-size: 7pt; font-weight: 700; padding: 2px 8px;
    border-radius: 100px; margin-left: 6px; vertical-align: middle;
  }
  .badge-core { background: var(--primary); color: var(--white); }
  .badge-enterprise { background: var(--accent); color: var(--background); }
  .badge-ai { background: linear-gradient(135deg, #6C3CE1, #06D6A0); color: var(--white); }
  .badge-social { background: var(--primary-light); color: var(--background); }
  .badge-infra { background: var(--primary); color: var(--white); }
  .badge-data { background: #F59E0B; color: var(--background); }

  .feature-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; }
  .feature-block ul { list-style: none; padding: 0; }
  .feature-block li { font-size: 8.5pt; padding: 3px 0; color: var(--text); }
  .feature-block li::before { content: "\\25CF"; color: var(--primary-light); margin-right: 8px; font-size: 6pt; }

  /* ---- TABLES ---- */
  table {
    width: 100%; border-collapse: collapse; margin: 12px 0;
    font-size: 8.5pt; break-inside: avoid;
  }
  th {
    background: var(--card); color: var(--white); font-weight: 600;
    text-align: left; padding: 8px 10px; border-bottom: 2px solid var(--primary);
  }
  td {
    padding: 7px 10px; border-bottom: 1px solid var(--border); color: var(--text);
  }
  tr:nth-child(even) td { background: rgba(26,26,46,0.5); }

  /* ---- PRICING TABLE ---- */
  .pricing-table th { text-align: center; }
  .pricing-table td { text-align: center; }
  .pricing-table td:first-child, .pricing-table th:first-child { text-align: left; }
  .pricing-table .discount { color: var(--accent); font-weight: 600; }

  /* ---- COMPARISON TABLE ---- */
  .compare-table .yes { color: var(--accent); font-weight: 700; }
  .compare-table .no { color: #EF4444; }
  .compare-table .partial { color: #F59E0B; }

  /* ---- CALLOUT BOX ---- */
  .callout {
    background: rgba(0,71,150,0.1); border-left: 3px solid var(--primary);
    border-radius: 0 8px 8px 0; padding: 12px 16px; margin: 12px 0;
    font-size: 8.5pt; break-inside: avoid;
  }
  .callout-red {
    background: rgba(239,68,68,0.08); border-left-color: #EF4444;
  }

  /* ---- HIGHLIGHT BOX ---- */
  .price-highlight {
    text-align: center; margin: 20px 0; padding: 24px;
    background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; break-inside: avoid;
  }
  .price-highlight h3 { margin: 0 0 4px; font-size: 10pt; color: var(--text-muted); font-weight: 500; }
  .price-highlight .price { font-size: 24pt; font-weight: 800; color: var(--accent); }
  .price-highlight .note { font-size: 8pt; color: var(--text-muted); font-style: italic; margin-top: 4px; }

  /* ---- EXCLUSIVE BANNER ---- */
  .exclusive-banner {
    background: linear-gradient(135deg, rgba(0,71,150,0.15), rgba(90,200,250,0.08));
    border: 1px solid rgba(0,71,150,0.3); border-radius: 10px;
    padding: 14px 18px; margin: 14px 0; break-inside: avoid;
  }
  .exclusive-banner h4 { color: var(--primary-light); font-size: 10pt; margin-bottom: 4px; }
  .exclusive-banner p { font-size: 8.5pt; color: var(--text); margin: 0; }

  /* ---- TIMELINE ---- */
  .timeline { margin: 14px 0; }
  .timeline-item {
    display: flex; gap: 12px; padding: 10px 0;
    border-bottom: 1px solid var(--border);
    break-inside: avoid;
  }
  .timeline-item:last-child { border-bottom: none; }
  .timeline-phase {
    min-width: 60px; font-size: 8pt; font-weight: 700;
    color: var(--primary-light);
  }
  .timeline-content { flex: 1; }
  .timeline-content strong { font-size: 9pt; }
  .timeline-content span { font-size: 8pt; color: var(--text-muted); }

  /* ---- STEPS ---- */
  .steps { margin: 14px 0; counter-reset: step; }
  .step {
    display: flex; align-items: baseline; gap: 10px;
    padding: 6px 0; font-size: 9.5pt;
  }
  .step::before {
    counter-increment: step; content: counter(step);
    width: 24px; height: 24px; border-radius: 50%;
    background: var(--primary); color: var(--white);
    display: flex; align-items: center; justify-content: center;
    font-size: 8pt; font-weight: 700; flex-shrink: 0;
  }

  /* ---- FOOTER ---- */
  .footer {
    margin-top: 40px; text-align: center; padding-top: 20px;
    border-top: 1px solid var(--border);
    font-size: 8pt; color: var(--text-muted);
  }
  .footer strong { color: var(--white); }
  .footer a { color: var(--primary-light); text-decoration: none; }

  /* ---- RULES LIST ---- */
  .rules { margin: 12px 0; }
  .rules li {
    font-size: 8.5pt; padding: 3px 0; list-style: none;
  }
  .rules li::before { content: "\\2014"; color: var(--primary-light); margin-right: 8px; }

  .section-intro { font-size: 10pt; color: var(--text); margin-bottom: 14px; }

  /* ---- CODE BLOCKS ---- */
  pre {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 8px; padding: 12px 14px; margin: 12px 0;
    overflow-x: auto; break-inside: avoid;
  }
  code {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 8pt; line-height: 1.5;
  }
  :not(pre) > code {
    background: rgba(108,60,225,0.1);
    padding: 1px 5px; border-radius: 3px;
    font-size: 8pt;
  }
  `;
}
