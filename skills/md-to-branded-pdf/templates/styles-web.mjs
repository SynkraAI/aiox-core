/**
 * CSS template for branded web HTML output.
 * Responsive, animated, with dark/light theme support.
 * All colors reference var(--xxx) from brand config.
 */

/**
 * @param {string} rootVars - CSS :root block from brand-loader
 * @param {string} fontFamily - Font family name
 * @param {{ animations: string, features: string }} options - User-selected options
 * @returns {string} Complete CSS string
 */
export function getWebCSS(rootVars, fontFamily, options = {}) {
  const { animations = 'full', features = 'full' } = options;

  const hasScrollAnimations = ['scroll', 'full'].includes(animations);
  const hasMicroInteractions = ['micro', 'full'].includes(animations);
  const hasMinimalMotion = animations === 'minimal';
  const hasDarkLight = ['toggle', 'full'].includes(features);
  const hasStickyNav = ['nav', 'full'].includes(features);
  const hasProgressBar = features === 'full';

  return `
  ${rootVars}

  /* ---- LIGHT THEME OVERRIDE ---- */
  ${hasDarkLight ? `
  [data-theme="light"] {
    --background: #F8F9FC;
    --card: #FFFFFF;
    --border: #E2E4EA;
    --text: #1A1A2E;
    --text-muted: #6B7280;
    --white: #0F0F1A;
  }
  ` : ''}

  /* ---- RESET & BASE ---- */
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  html {
    scroll-behavior: smooth;
    font-size: 16px;
  }

  body {
    font-family: '${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--background);
    color: var(--text);
    line-height: 1.7;
    transition: background 0.3s ease, color 0.3s ease;
    overflow-x: hidden;
  }

  a { color: var(--primary-light); text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* ---- PROGRESS BAR ---- */
  ${hasProgressBar ? `
  .progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary), var(--accent));
    z-index: 1000;
    transition: width 0.1s linear;
    width: 0%;
  }
  ` : ''}

  /* ---- STICKY NAV ---- */
  ${hasStickyNav ? `
  .site-nav {
    position: fixed;
    top: ${hasProgressBar ? '3px' : '0'};
    left: 0;
    right: 0;
    z-index: 999;
    background: color-mix(in srgb, var(--background) 85%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 24px;
    transition: background 0.3s ease, transform 0.3s ease;
  }
  .site-nav-inner {
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
  }
  .site-nav-brand {
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--white);
    text-decoration: none;
  }
  .site-nav-links {
    display: flex;
    gap: 4px;
    list-style: none;
    overflow-x: auto;
    max-width: 70%;
  }
  .site-nav-links a {
    font-size: 0.8rem;
    color: var(--text-muted);
    text-decoration: none;
    padding: 6px 12px;
    border-radius: 6px;
    white-space: nowrap;
    transition: color 0.2s, background 0.2s;
  }
  .site-nav-links a:hover,
  .site-nav-links a.active {
    color: var(--primary-light);
    background: color-mix(in srgb, var(--primary) 10%, transparent);
  }
  .nav-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  ` : ''}

  /* ---- THEME TOGGLE ---- */
  ${hasDarkLight ? `
  .theme-toggle {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 6px 10px;
    cursor: pointer;
    font-size: 1.1rem;
    line-height: 1;
    transition: background 0.2s, border-color 0.2s;
  }
  .theme-toggle:hover {
    border-color: var(--primary);
  }
  ` : ''}

  /* ---- COVER / HERO ---- */
  .hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 80px 24px;
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%, var(--cover-gradient-primary, color-mix(in srgb, var(--primary) 25%, transparent)) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 80%, var(--cover-gradient-secondary, color-mix(in srgb, var(--primary-light) 10%, transparent)) 0%, transparent 60%),
      var(--background);
    position: relative;
    overflow: hidden;
  }
  .hero-badge {
    display: inline-block;
    background: color-mix(in srgb, var(--primary) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent);
    padding: 8px 24px;
    border-radius: 100px;
    font-size: 0.85rem;
    color: var(--primary-light);
    font-weight: 500;
    margin-bottom: 32px;
  }
  .hero-logos {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 32px;
  }
  .hero-logos img { height: 56px; }
  .hero-logos .sep {
    font-size: 1.5rem;
    color: var(--text-muted);
    opacity: 0.5;
    font-weight: 300;
  }
  .hero h1 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 8px;
    max-width: 720px;
  }
  .hero .highlight {
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-style: italic;
  }
  .hero .subtitle {
    font-size: 1.15rem;
    color: var(--text-muted);
    max-width: 520px;
    margin: 20px auto 0;
    line-height: 1.6;
  }
  .hero .subtitle strong { color: var(--white); }

  /* ---- CONTENT WRAPPER ---- */
  .content {
    max-width: 960px;
    margin: 0 auto;
    padding: ${hasStickyNav ? '80px' : '40px'} 24px 60px;
  }

  /* ---- SECTIONS ---- */
  .doc-section {
    padding: 60px 0;
    border-bottom: 1px solid var(--border);
  }
  .doc-section:last-child { border-bottom: none; }

  .section-header {
    margin-bottom: 24px;
  }
  .section-num {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 8px;
  }
  .doc-section h2 {
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 700;
    color: var(--white);
    margin-bottom: 12px;
  }
  .doc-section h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--white);
    margin: 32px 0 12px;
  }
  p { margin-bottom: 12px; }
  strong { color: var(--white); }

  .section-intro {
    font-size: 1.1rem;
    color: var(--text);
    margin-bottom: 24px;
    line-height: 1.7;
  }

  /* ---- CODE BLOCKS ---- */
  pre {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 20px;
    margin: 16px 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  code {
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 0.85rem;
    line-height: 1.6;
  }
  :not(pre) > code {
    background: color-mix(in srgb, var(--primary) 10%, transparent);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }

  /* ---- CARDS GRID ---- */
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    margin: 20px 0;
  }
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px 24px;
    ${hasMicroInteractions ? `
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    ` : ''}
  }
  ${hasMicroInteractions ? `
  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.3);
    border-color: var(--primary);
  }
  ` : ''}
  .card-icon { font-size: 1.5rem; margin-bottom: 8px; }
  .card h4 { font-size: 1rem; font-weight: 700; color: var(--white); margin-bottom: 6px; }
  .card p { font-size: 0.9rem; color: var(--text-muted); margin: 0; }

  /* ---- STATS ROW ---- */
  .stats {
    display: flex;
    gap: 16px;
    margin: 20px 0;
    flex-wrap: wrap;
  }
  .stat {
    flex: 1;
    min-width: 120px;
    text-align: center;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px 12px;
    ${hasMicroInteractions ? `
    transition: transform 0.25s ease, border-color 0.25s ease;
    ` : ''}
  }
  ${hasMicroInteractions ? `
  .stat:hover {
    transform: translateY(-2px);
    border-color: var(--primary-light);
  }
  ` : ''}
  .stat-value {
    font-size: 2rem;
    font-weight: 800;
    color: var(--primary-light);
  }
  .stat-label {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 4px;
  }

  /* ---- TABLES ---- */
  .table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 16px 0;
    border-radius: 12px;
    border: 1px solid var(--border);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    min-width: 480px;
  }
  th {
    background: var(--card);
    color: var(--white);
    font-weight: 600;
    text-align: left;
    padding: 12px 16px;
    border-bottom: 2px solid var(--primary);
    white-space: nowrap;
  }
  td {
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
    color: var(--text);
  }
  tr:nth-child(even) td { background: color-mix(in srgb, var(--card) 50%, transparent); }
  ${hasMicroInteractions ? `
  tr { transition: background 0.15s ease; }
  tr:hover td { background: color-mix(in srgb, var(--primary) 8%, transparent); }
  ` : ''}

  .pricing-table th,
  .pricing-table td { text-align: center; }
  .pricing-table td:first-child,
  .pricing-table th:first-child { text-align: left; }
  .pricing-table .discount { color: var(--accent); font-weight: 600; }

  .compare-table .yes { color: var(--accent); font-weight: 700; }
  .compare-table .no { color: #EF4444; }
  .compare-table .partial { color: #F59E0B; }

  /* ---- CALLOUT BOX ---- */
  .callout {
    background: color-mix(in srgb, var(--primary) 8%, transparent);
    border-left: 4px solid var(--primary);
    border-radius: 0 12px 12px 0;
    padding: 16px 20px;
    margin: 16px 0;
    font-size: 0.95rem;
  }
  .callout-red {
    background: rgba(239,68,68,0.08);
    border-left-color: #EF4444;
  }

  /* ---- LISTS ---- */
  .rules { margin: 16px 0; }
  .rules li {
    font-size: 0.95rem;
    padding: 4px 0;
    list-style: none;
  }
  .rules li::before {
    content: "\\2014";
    color: var(--primary-light);
    margin-right: 10px;
  }

  ol, ul { margin: 12px 0; padding-left: 24px; }
  li { margin-bottom: 4px; }

  /* ---- BACK TO TOP ---- */
  ${features === 'full' ? `
  .back-to-top {
    position: fixed;
    bottom: 32px;
    right: 32px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--primary);
    color: var(--white);
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s ease, transform 0.3s ease, background 0.2s ease;
    z-index: 900;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  }
  .back-to-top.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .back-to-top:hover {
    background: var(--primary-light);
  }
  ` : ''}

  /* ---- SCROLL ANIMATIONS ---- */
  ${hasScrollAnimations ? `
  .animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  }
  .animate-on-scroll.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .animate-on-scroll.delay-1 { transition-delay: 0.1s; }
  .animate-on-scroll.delay-2 { transition-delay: 0.2s; }
  .animate-on-scroll.delay-3 { transition-delay: 0.3s; }
  ` : ''}

  ${hasMinimalMotion ? `
  .animate-on-scroll {
    opacity: 0;
    transition: opacity 0.4s ease-out;
  }
  .animate-on-scroll.visible {
    opacity: 1;
  }
  ` : ''}

  /* ---- REDUCED MOTION ---- */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
    .animate-on-scroll { opacity: 1; transform: none; }
    html { scroll-behavior: auto; }
  }

  /* ---- FOOTER ---- */
  .site-footer {
    text-align: center;
    padding: 40px 24px;
    border-top: 1px solid var(--border);
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  .site-footer strong { color: var(--white); }
  .site-footer a { color: var(--primary-light); text-decoration: none; }

  /* ---- PRINT MEDIA ---- */
  @media print {
    .site-nav, .progress-bar, .back-to-top, .theme-toggle { display: none !important; }
    .hero { min-height: auto; padding: 40px 20px; }
    .content { padding: 20px; }
    .doc-section { padding: 20px 0; page-break-inside: avoid; }
    body { background: white; color: black; }
  }

  /* ---- RESPONSIVE ---- */
  @media (max-width: 768px) {
    .hero { padding: 60px 20px; min-height: 80vh; }
    .hero h1 { font-size: 1.8rem; }
    .stats { flex-direction: column; }
    .stat { min-width: 100%; }
    .cards { grid-template-columns: 1fr; }
    ${hasStickyNav ? `
    .site-nav-links { display: none; }
    ` : ''}
  }

  @media (max-width: 480px) {
    .hero { padding: 40px 16px; }
    .content { padding: 40px 16px; }
    .doc-section { padding: 40px 0; }
  }
  `;
}
