/**
 * Dashboard HTML Generator.
 * Returns a complete single-page HTML dashboard with inline CSS/JS.
 * Dark theme, responsive grid, SVG charts, SSE real-time updates.
 * ZERO external dependencies.
 */

export function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Polymarket Trader Dashboard</title>
<style>
${getCSS()}
</style>
</head>
<body>
<div id="app">
  <header id="header">
    <div class="header-left">
      <span class="logo">PM</span>
      <h1>Polymarket Trader</h1>
    </div>
    <div class="header-right">
      <span id="mode-badge" class="badge badge-paper">PAPER</span>
      <span id="conn-status" class="conn-dot conn-disconnected" title="Disconnected"></span>
      <span class="header-time" id="header-time"></span>
    </div>
  </header>

  <!-- KPI Row -->
  <div class="kpi-row">
    <div class="kpi-card" id="kpi-pnl">
      <div class="kpi-label">Total P&amp;L</div>
      <div class="kpi-value" id="val-pnl">$0.00</div>
    </div>
    <div class="kpi-card" id="kpi-winrate">
      <div class="kpi-label">Win Rate</div>
      <div class="kpi-value" id="val-winrate">0.0%</div>
    </div>
    <div class="kpi-card" id="kpi-trades">
      <div class="kpi-label">Trades</div>
      <div class="kpi-value" id="val-trades">0</div>
    </div>
    <div class="kpi-card" id="kpi-bankroll">
      <div class="kpi-label">Bankroll</div>
      <div class="kpi-value" id="val-bankroll">$0</div>
    </div>
  </div>

  <!-- P&L Chart -->
  <div class="card full-width" id="card-pnl-chart">
    <div class="card-header">
      <h2>P&amp;L Cumulative</h2>
      <div class="time-range">
        <button class="range-btn active" data-range="all">ALL</button>
        <button class="range-btn" data-range="30d">30D</button>
        <button class="range-btn" data-range="7d">7D</button>
        <button class="range-btn" data-range="1d">1D</button>
      </div>
    </div>
    <div class="chart-container" id="pnl-chart">
      <svg id="pnl-svg" width="100%" height="200" preserveAspectRatio="none"></svg>
    </div>
  </div>

  <!-- Two-column row: Positions + Strategies -->
  <div class="grid-2col">
    <div class="card" id="card-positions">
      <div class="card-header"><h2>Open Positions</h2></div>
      <div class="card-body" id="positions-body">
        <div class="empty-state">No open positions</div>
      </div>
    </div>
    <div class="card" id="card-strategies">
      <div class="card-header"><h2>Strategy Performance</h2></div>
      <div class="card-body" id="strategies-body">
        <div class="empty-state">No data</div>
      </div>
    </div>
  </div>

  <!-- Two-column row: Risk + Health -->
  <div class="grid-2col">
    <div class="card" id="card-risk">
      <div class="card-header"><h2>Risk Dashboard</h2></div>
      <div class="card-body" id="risk-body">
        <div class="empty-state">Loading...</div>
      </div>
    </div>
    <div class="card" id="card-health">
      <div class="card-header"><h2>Health Status</h2></div>
      <div class="card-body" id="health-body">
        <div class="empty-state">Loading...</div>
      </div>
    </div>
  </div>

  <!-- Two-column row: Drift + Whales -->
  <div class="grid-2col">
    <div class="card" id="card-drift">
      <div class="card-header"><h2>Drift Monitor</h2></div>
      <div class="card-body" id="drift-body">
        <div class="empty-state">Loading...</div>
      </div>
    </div>
    <div class="card" id="card-whales">
      <div class="card-header"><h2>Whale Activity</h2></div>
      <div class="card-body" id="whales-body">
        <div class="empty-state">No whale activity</div>
      </div>
    </div>
  </div>

  <!-- Recent Trades -->
  <div class="card full-width" id="card-trades">
    <div class="card-header">
      <h2>Recent Trades</h2>
      <div class="search-box">
        <input type="text" id="market-search" placeholder="Search markets..." />
      </div>
    </div>
    <div class="card-body" id="trades-body">
      <div class="empty-state">No trades yet</div>
    </div>
  </div>

  <!-- Gate -->
  <div class="card full-width" id="card-gate">
    <div class="card-header"><h2>Go/No-Go Gate</h2></div>
    <div class="card-body" id="gate-body">
      <div class="empty-state">Loading...</div>
    </div>
  </div>
</div>

<script>
${getJS()}
</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

function getCSS(): string {
  return `
:root {
  --bg: #0d1117;
  --card-bg: #161b22;
  --border: #30363d;
  --text: #e6edf3;
  --text-dim: #8b949e;
  --green: #3fb950;
  --red: #f85149;
  --yellow: #d29922;
  --blue: #58a6ff;
  --purple: #bc8cff;
  --cyan: #39d353;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

#app {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;
}

/* Header */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.header-right { display: flex; align-items: center; gap: 12px; }
.logo {
  background: var(--blue);
  color: var(--bg);
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 16px;
}
h1 { font-size: 18px; font-weight: 600; }
.badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
}
.badge-paper { background: var(--yellow); color: var(--bg); }
.badge-live { background: var(--green); color: var(--bg); }

.conn-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.conn-connected { background: var(--green); }
.conn-disconnected { background: var(--red); }

.header-time { color: var(--text-dim); font-size: 12px; }

/* KPI Row */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.kpi-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}
.kpi-label { color: var(--text-dim); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.kpi-value { font-size: 24px; font-weight: 700; }

/* Cards */
.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}
.card.full-width { width: 100%; }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}
.card-header h2 { font-size: 14px; font-weight: 600; }
.card-body { padding: 16px; }
.empty-state { color: var(--text-dim); text-align: center; padding: 20px; }

/* Grid */
.grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Chart */
.chart-container {
  padding: 16px;
  position: relative;
}
.chart-container svg { display: block; }

/* Time Range */
.time-range { display: flex; gap: 4px; }
.range-btn {
  background: transparent;
  color: var(--text-dim);
  border: 1px solid var(--border);
  padding: 2px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
}
.range-btn.active { background: var(--blue); color: var(--bg); border-color: var(--blue); }
.range-btn:hover { border-color: var(--text-dim); }

/* Search */
.search-box input {
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 12px;
  width: 200px;
}
.search-box input::placeholder { color: var(--text-dim); }

/* Tables */
.dash-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.dash-table th {
  text-align: left;
  color: var(--text-dim);
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--border);
}
.dash-table td {
  padding: 6px 8px;
  border-bottom: 1px solid rgba(48,54,61,0.5);
}
.dash-table tr:hover { background: rgba(88,166,255,0.05); }
.dash-table .num { text-align: right; font-variant-numeric: tabular-nums; }

/* KV Pairs */
.kv-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(48,54,61,0.3); }
.kv-label { color: var(--text-dim); font-size: 13px; }
.kv-value { font-weight: 600; font-size: 13px; font-variant-numeric: tabular-nums; }

/* Status icons */
.s-ok { color: var(--green); }
.s-warn { color: var(--yellow); }
.s-fail { color: var(--red); }
.s-up { color: var(--green); }
.s-down { color: var(--red); }
.s-flat { color: var(--text-dim); }

.pnl-pos { color: var(--green); }
.pnl-neg { color: var(--red); }
.pnl-zero { color: var(--text-dim); }

/* Progress bars */
.progress-bar {
  height: 6px;
  background: var(--bg);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
}
.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

/* Gate recommendation */
.gate-go { color: var(--green); font-weight: 700; font-size: 18px; }
.gate-nogo { color: var(--red); font-weight: 700; font-size: 18px; }
.gate-conditional { color: var(--yellow); font-weight: 700; font-size: 18px; }

/* Responsive */
@media (max-width: 900px) {
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
  .grid-2col { grid-template-columns: 1fr; }
}
@media (max-width: 500px) {
  .kpi-row { grid-template-columns: 1fr; }
  header { flex-direction: column; gap: 8px; }
}
`;
}

// ---------------------------------------------------------------------------
// JS
// ---------------------------------------------------------------------------

function getJS(): string {
  return `
(function() {
  'use strict';

  // State
  let currentRange = 'all';
  let pnlData = null;
  let eventSource = null;
  let pollTimer = null;

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  function fmt(n, decimals) {
    decimals = decimals !== undefined ? decimals : 2;
    return '$' + Number(n).toFixed(decimals);
  }

  function pct(n) { return (Number(n) * 100).toFixed(1) + '%'; }

  function pnlClass(n) {
    if (n > 0) return 'pnl-pos';
    if (n < 0) return 'pnl-neg';
    return 'pnl-zero';
  }

  function statusIcon(s) {
    s = (s || '').toLowerCase();
    if (s === 'ok' || s === 'healthy') return '<span class="s-ok">OK</span>';
    if (s === 'warn' || s === 'degraded') return '<span class="s-warn">WARN</span>';
    return '<span class="s-fail">FAIL</span>';
  }

  function trendIcon(t) {
    if (t === 'improving') return '<span class="s-up">UP</span>';
    if (t === 'degrading') return '<span class="s-down">DOWN</span>';
    return '<span class="s-flat">--</span>';
  }

  function kv(label, value) {
    return '<div class="kv-row"><span class="kv-label">' + label + '</span><span class="kv-value">' + value + '</span></div>';
  }

  function esc(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str || ''));
    return div.innerHTML;
  }

  function progressBar(pct, color) {
    var p = Math.max(0, Math.min(100, pct));
    return '<div class="progress-bar"><div class="progress-fill" style="width:' + p + '%;background:' + color + '"></div></div>';
  }

  // -----------------------------------------------------------------------
  // API Fetch
  // -----------------------------------------------------------------------

  function fetchJSON(url) {
    return fetch(url).then(function(r) { return r.json(); }).catch(function() { return null; });
  }

  // -----------------------------------------------------------------------
  // Update functions
  // -----------------------------------------------------------------------

  function updateTime() {
    var el = $('#header-time');
    if (el) el.textContent = new Date().toLocaleTimeString();
  }

  function updateStatus(data) {
    if (!data) return;
    var badge = $('#mode-badge');
    if (badge) {
      badge.textContent = data.mode ? data.mode.toUpperCase() : 'PAPER';
      badge.className = 'badge ' + (data.mode === 'live' ? 'badge-live' : 'badge-paper');
    }
    var valPnl = $('#val-pnl');
    if (valPnl) {
      valPnl.textContent = fmt(data.totalPnl);
      valPnl.className = 'kpi-value ' + pnlClass(data.totalPnl);
    }
    var valWr = $('#val-winrate');
    if (valWr) valWr.textContent = pct(data.winRate);
    var valTrades = $('#val-trades');
    if (valTrades) valTrades.textContent = String(data.tradeCount || 0);
    var valBankroll = $('#val-bankroll');
    if (valBankroll) valBankroll.textContent = fmt(data.bankroll, 0);
  }

  function updatePnlChart(data) {
    if (!data || !data.dailySeries) return;
    pnlData = data;
    renderPnlChart(data.dailySeries);
  }

  function renderPnlChart(series) {
    var svg = $('#pnl-svg');
    if (!svg || !series || series.length === 0) {
      if (svg) svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="#8b949e" font-size="14">No data</text>';
      return;
    }

    var container = svg.parentElement;
    var W = container.clientWidth - 32;
    var H = 200;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    var vals = series.map(function(s) { return s.cumulative; });
    var mn = Math.min.apply(null, vals);
    var mx = Math.max.apply(null, vals);
    if (mn === mx) { mn -= 1; mx += 1; }
    var pad = 20;

    function x(i) { return pad + (i / Math.max(1, series.length - 1)) * (W - 2 * pad); }
    function y(v) { return H - pad - ((v - mn) / (mx - mn)) * (H - 2 * pad); }

    var zeroY = y(0);
    var points = series.map(function(s, i) { return x(i) + ',' + y(s.cumulative); }).join(' ');

    // Gradient fill
    var fillPoints = x(0) + ',' + zeroY + ' ' + points + ' ' + x(series.length - 1) + ',' + zeroY;
    var lastVal = vals[vals.length - 1];
    var lineColor = lastVal >= 0 ? '#3fb950' : '#f85149';
    var fillColor = lastVal >= 0 ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)';

    var html = '';
    // Zero line
    if (mn < 0 && mx > 0) {
      html += '<line x1="' + pad + '" y1="' + zeroY + '" x2="' + (W - pad) + '" y2="' + zeroY + '" stroke="#30363d" stroke-width="1" stroke-dasharray="4,4"/>';
    }
    // Fill
    html += '<polygon points="' + fillPoints + '" fill="' + fillColor + '"/>';
    // Line
    html += '<polyline points="' + points + '" fill="none" stroke="' + lineColor + '" stroke-width="2"/>';
    // Labels
    html += '<text x="' + pad + '" y="15" fill="#8b949e" font-size="10">' + fmt(mx) + '</text>';
    html += '<text x="' + pad + '" y="' + (H - 5) + '" fill="#8b949e" font-size="10">' + fmt(mn) + '</text>';
    // Date labels
    if (series.length > 1) {
      html += '<text x="' + pad + '" y="' + (H - 0) + '" fill="#8b949e" font-size="9">' + series[0].date + '</text>';
      html += '<text x="' + (W - pad) + '" y="' + (H - 0) + '" fill="#8b949e" font-size="9" text-anchor="end">' + series[series.length - 1].date + '</text>';
    }
    // Last value dot
    html += '<circle cx="' + x(series.length - 1) + '" cy="' + y(lastVal) + '" r="4" fill="' + lineColor + '"/>';

    svg.innerHTML = html;
  }

  function updatePositions(data) {
    var body = $('#positions-body');
    if (!body) return;
    if (!data || data.length === 0) {
      body.innerHTML = '<div class="empty-state">No open positions</div>';
      return;
    }
    var html = '<table class="dash-table"><thead><tr><th>Market</th><th>Side</th><th class="num">Size</th><th class="num">Entry</th></tr></thead><tbody>';
    data.forEach(function(p) {
      html += '<tr><td>' + esc(p.marketId).substring(0, 30) + '</td><td>' + p.side + '</td><td class="num">' + fmt(p.size) + '</td><td class="num">' + Number(p.entryPrice).toFixed(4) + '</td></tr>';
    });
    html += '</tbody></table>';
    body.innerHTML = html;
  }

  function updateStrategies(data) {
    var body = $('#strategies-body');
    if (!body) return;
    if (!data || data.length === 0) {
      body.innerHTML = '<div class="empty-state">No strategy data</div>';
      return;
    }
    var html = '<table class="dash-table"><thead><tr><th>Strategy</th><th class="num">WR</th><th class="num">P&L</th><th class="num">Trades</th><th>Ver</th></tr></thead><tbody>';
    data.forEach(function(s) {
      html += '<tr><td>' + esc(s.strategy) + '</td><td class="num">' + pct(s.winRate) + '</td><td class="num ' + pnlClass(s.pnl) + '">' + fmt(s.pnl) + '</td><td class="num">' + s.trades + '</td><td>' + esc(s.aceVersion) + '</td></tr>';
    });
    html += '</tbody></table>';
    body.innerHTML = html;
  }

  function updateRisk(data) {
    var body = $('#risk-body');
    if (!body || !data) return;
    var cbStatus = data.circuitBreakerTripped ? '<span class="s-fail">TRIPPED</span>' : '<span class="s-ok">OK</span>';
    var utilPct = (data.utilization * 100).toFixed(1);
    var utilColor = data.utilization > 0.7 ? 'var(--red)' : data.utilization > 0.4 ? 'var(--yellow)' : 'var(--green)';
    var html = '';
    html += kv('Bankroll', fmt(data.bankroll));
    html += kv('Exposure', fmt(data.totalExposure));
    html += kv('Utilization', utilPct + '%');
    html += progressBar(parseFloat(utilPct), utilColor);
    html += kv('Circuit Breaker', cbStatus + (data.circuitBreakerReason ? ' (' + esc(data.circuitBreakerReason) + ')' : ''));
    html += kv('Daily P&L', '<span class="' + pnlClass(data.dailyPnl) + '">' + fmt(data.dailyPnl) + ' (' + pct(data.dailyPnlPercent) + ')</span>');
    html += kv('Weekly P&L', '<span class="' + pnlClass(data.weeklyPnl) + '">' + fmt(data.weeklyPnl) + ' (' + pct(data.weeklyPnlPercent) + ')</span>');
    html += kv('Kelly Fraction', pct(data.limits.kellyFraction));
    html += kv('Open Positions', data.openPositions + ' / ' + data.limits.maxOpenPositions);
    body.innerHTML = html;
  }

  function updateHealth(data) {
    var body = $('#health-body');
    if (!body || !data) return;
    var html = kv('Overall', statusIcon(data.overall));
    if (data.checks) {
      data.checks.forEach(function(c) {
        html += kv(c.name, statusIcon(c.status) + ' ' + esc(c.message));
      });
    }
    body.innerHTML = html;
  }

  function updateDrift(data) {
    var body = $('#drift-body');
    if (!body || !data) return;
    if (!data.baselineEstablished) {
      body.innerHTML = '<div class="empty-state">Baseline not established (need more trades)</div>';
      return;
    }
    var m = data.metrics;
    var html = kv('Status', data.healthy ? '<span class="s-ok">Healthy</span>' : '<span class="s-warn">Drifting</span>');
    html += kv('Total Trades', String(data.totalTrades));
    html += '<table class="dash-table" style="margin-top:8px"><thead><tr><th>Dim</th><th class="num">Cur</th><th class="num">Base</th><th class="num">Z</th><th>Trend</th></tr></thead><tbody>';
    var dims = [['WR', m.winRate], ['EV', m.evPerTrade], ['Edge', m.edgeAccuracy], ['Exec', m.executionQuality]];
    dims.forEach(function(d) {
      var metric = d[1];
      html += '<tr><td>' + d[0] + '</td><td class="num">' + metric.current.toFixed(3) + '</td><td class="num">' + metric.baseline.toFixed(3) + '</td><td class="num">' + metric.zScore.toFixed(1) + '</td><td>' + trendIcon(metric.trend) + (metric.alertTriggered ? ' <span class="s-fail">!</span>' : '') + '</td></tr>';
    });
    html += '</tbody></table>';
    body.innerHTML = html;
  }

  function updateWhales(data) {
    var body = $('#whales-body');
    if (!body) return;
    if (!data || data.length === 0) {
      body.innerHTML = '<div class="empty-state">No whale activity</div>';
      return;
    }
    var html = '<table class="dash-table"><thead><tr><th>Wallet</th><th>Side</th><th class="num">Size</th><th class="num">WR</th></tr></thead><tbody>';
    data.forEach(function(w) {
      html += '<tr><td>' + esc(w.walletLabel || w.walletAddress.substring(0, 10)) + '</td><td>' + w.side + '</td><td class="num">' + fmt(w.size) + '</td><td class="num">' + pct(w.whaleWinRate) + '</td></tr>';
    });
    html += '</tbody></table>';
    body.innerHTML = html;
  }

  function updateTrades(data) {
    var body = $('#trades-body');
    if (!body) return;
    var trades = data && data.trades ? data.trades : data;
    if (!trades || trades.length === 0) {
      body.innerHTML = '<div class="empty-state">No trades yet</div>';
      return;
    }
    var html = '<table class="dash-table"><thead><tr><th>Time</th><th>Market</th><th>Strategy</th><th>Side</th><th class="num">Size</th><th class="num">P&L</th><th>Result</th></tr></thead><tbody>';
    trades.forEach(function(t) {
      var ts = t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : '';
      var outcomeClass = t.outcome === 'WIN' ? 's-ok' : t.outcome === 'LOSS' ? 's-fail' : 's-flat';
      html += '<tr><td>' + ts + '</td><td>' + esc((t.marketQuestion || t.marketId || '').substring(0, 35)) + '</td><td>' + esc(t.strategy) + '</td><td>' + t.side + '</td><td class="num">' + fmt(t.positionSize) + '</td><td class="num ' + pnlClass(t.pnl) + '">' + fmt(t.pnl) + '</td><td><span class="' + outcomeClass + '">' + (t.outcome || 'PENDING') + '</span></td></tr>';
    });
    html += '</tbody></table>';
    body.innerHTML = html;
  }

  function updateGate(data) {
    var body = $('#gate-body');
    if (!body || !data) return;
    var recClass = data.recommendation === 'GO' ? 'gate-go' : data.recommendation === 'NO_GO' ? 'gate-nogo' : 'gate-conditional';
    var html = '<div style="text-align:center;margin-bottom:12px"><span class="' + recClass + '">' + esc(data.recommendation) + '</span> <span style="color:var(--text-dim)">Score: ' + data.score + '/100</span></div>';
    if (data.criteria && data.criteria.length > 0) {
      html += '<table class="dash-table"><thead><tr><th>Criterion</th><th>Required</th><th>Actual</th><th>Result</th></tr></thead><tbody>';
      data.criteria.forEach(function(c) {
        html += '<tr><td>' + esc(c.name) + '</td><td>' + esc(c.required) + '</td><td>' + esc(c.actual) + '</td><td>' + (c.passed ? '<span class="s-ok">PASS</span>' : '<span class="s-fail">FAIL</span>') + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    body.innerHTML = html;
  }

  // -----------------------------------------------------------------------
  // Data loading
  // -----------------------------------------------------------------------

  function loadAll() {
    fetchJSON('/api/status').then(updateStatus);
    fetchJSON('/api/pnl?period=' + currentRange).then(updatePnlChart);
    fetchJSON('/api/positions').then(updatePositions);
    fetchJSON('/api/strategies').then(updateStrategies);
    fetchJSON('/api/risk').then(updateRisk);
    fetchJSON('/api/health').then(updateHealth);
    fetchJSON('/api/drift').then(updateDrift);
    fetchJSON('/api/whales').then(updateWhales);
    fetchJSON('/api/trades?limit=50').then(updateTrades);
    fetchJSON('/api/gate').then(updateGate);
  }

  // -----------------------------------------------------------------------
  // SSE
  // -----------------------------------------------------------------------

  function connectSSE() {
    if (eventSource) { eventSource.close(); }
    eventSource = new EventSource('/events');

    eventSource.onopen = function() {
      var dot = $('#conn-status');
      if (dot) { dot.className = 'conn-dot conn-connected'; dot.title = 'Connected'; }
    };

    eventSource.onerror = function() {
      var dot = $('#conn-status');
      if (dot) { dot.className = 'conn-dot conn-disconnected'; dot.title = 'Disconnected'; }
      // Fallback polling
      if (!pollTimer) {
        pollTimer = setInterval(function() {
          loadAll();
        }, 30000);
      }
    };

    eventSource.addEventListener('trade', function(e) {
      try { var d = JSON.parse(e.data); updateTrades({ trades: [d] }); } catch(err) { /* ignore */ }
      // Refresh full trades list
      fetchJSON('/api/trades?limit=50').then(updateTrades);
    });

    eventSource.addEventListener('pnl', function(e) {
      try { var d = JSON.parse(e.data); updatePnlChart(d); updateStatus(d); } catch(err) { /* ignore */ }
    });

    eventSource.addEventListener('health', function(e) {
      try { var d = JSON.parse(e.data); updateHealth(d); } catch(err) { /* ignore */ }
    });

    eventSource.addEventListener('position', function(e) {
      fetchJSON('/api/positions').then(updatePositions);
      fetchJSON('/api/status').then(updateStatus);
    });

    eventSource.addEventListener('signal', function(e) {
      // Just refresh status
      fetchJSON('/api/status').then(updateStatus);
    });

    eventSource.addEventListener('drift', function(e) {
      try { var d = JSON.parse(e.data); updateDrift(d); } catch(err) { /* ignore */ }
    });

    eventSource.addEventListener('whale', function(e) {
      fetchJSON('/api/whales').then(updateWhales);
    });
  }

  // -----------------------------------------------------------------------
  // Event handlers
  // -----------------------------------------------------------------------

  // Time range buttons
  document.addEventListener('click', function(e) {
    if (e.target && e.target.classList && e.target.classList.contains('range-btn')) {
      $$('.range-btn').forEach(function(b) { b.classList.remove('active'); });
      e.target.classList.add('active');
      currentRange = e.target.getAttribute('data-range') || 'all';
      fetchJSON('/api/pnl?period=' + currentRange).then(updatePnlChart);
    }
  });

  // Market search
  var searchTimeout = null;
  var searchInput = $('#market-search');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      var q = searchInput.value.trim();
      searchTimeout = setTimeout(function() {
        if (q.length > 0) {
          fetchJSON('/api/markets?q=' + encodeURIComponent(q)).then(function(data) {
            // Show markets in trades panel temporarily
            if (data && data.length > 0) {
              var body = $('#trades-body');
              if (body) {
                var html = '<table class="dash-table"><thead><tr><th>Market</th><th>Vertical</th><th class="num">Volume</th><th class="num">YES</th><th class="num">NO</th></tr></thead><tbody>';
                data.forEach(function(m) {
                  html += '<tr><td>' + esc(m.question) + '</td><td>' + esc(m.vertical) + '</td><td class="num">' + fmt(m.volume, 0) + '</td><td class="num">' + Number(m.yesPrice).toFixed(2) + '</td><td class="num">' + Number(m.noPrice).toFixed(2) + '</td></tr>';
                });
                html += '</tbody></table>';
                body.innerHTML = html;
              }
            }
          });
        } else {
          fetchJSON('/api/trades?limit=50').then(updateTrades);
        }
      }, 300);
    });
  }

  // Window resize -> re-render chart
  window.addEventListener('resize', function() {
    if (pnlData && pnlData.dailySeries) {
      renderPnlChart(pnlData.dailySeries);
    }
  });

  // -----------------------------------------------------------------------
  // Init
  // -----------------------------------------------------------------------

  updateTime();
  setInterval(updateTime, 1000);
  loadAll();
  connectSSE();
})();
`;
}
