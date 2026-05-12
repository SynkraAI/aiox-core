# AIOX Health Dashboard

Visual dashboard for the AIOX Health Check System. Displays real-time health status, domain scores, issues, and self-healing history.

## Features

- **Overall Health Score**: Circular progress indicator with status (Healthy/Degraded/Warning/Critical)
- **Domain Cards**: 5 domain health cards with drill-down capability
  - Project Coherence
  - Local Environment
  - Repository Health
  - Deployment
  - Service Integration
- **Issues List**: Filterable list of issues with severity badges and fix actions
- **Tech Debt Panel**: Recommendations from health checks
- **Auto-Fix Log**: History of self-healing actions
- **Trend Chart**: Health score history visualization
- **Auto-Refresh**: Optional 30-second auto-refresh

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
health-dashboard/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── shared/           # Reusable components
│   │   │   ├── Card.jsx
│   │   │   ├── Chart.jsx
│   │   │   ├── Header.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── HealthScore.jsx   # Circular score indicator
│   │   ├── DomainCard.jsx    # Domain health card
│   │   ├── IssuesList.jsx    # Issues with actions
│   │   ├── TechDebtList.jsx  # Tech debt recommendations
│   │   └── AutoFixLog.jsx    # Self-healing history
│   ├── hooks/
│   │   ├── useHealthData.js  # Data loading hook
│   │   └── useAutoRefresh.js # Auto-refresh hook
│   ├── pages/
│   │   ├── Dashboard.jsx     # Main dashboard
│   │   └── DomainDetail.jsx  # Domain drill-down
│   ├── styles/
│   │   ├── index.css         # Global styles
│   │   └── App.css           # App layout
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Data Source

The dashboard reads health check data from:

- **Development**: Uses embedded sample data
- **Production**: Reads from `.aiox/reports/health-check-latest.json`
- **API**: Can be configured to fetch from `/api/health-report`

## Styling

Uses CSS custom properties for theming:

```css
:root {
  --color-healthy: #22c55e;
  --color-degraded: #eab308;
  --color-warning: #f97316;
  --color-critical: #ef4444;
}
```

## Integration

The dashboard expects health check JSON in the format produced by the JSON reporter:

```json
{
  "version": "1.0.0",
  "timestamp": "2026-01-04T00:00:00Z",
  "overall": {
    "score": 87,
    "status": "healthy",
    "issuesCount": 5,
    "autoFixedCount": 2
  },
  "domains": { ... },
  "issues": { ... },
  "autoFixed": [ ... ],
  "techDebt": [ ... ],
  "history": { ... }
}
```

## Related

- [Story HCS-2: Health Check Implementation](../../docs/stories/epics/epic-health-check-system/story-hcs-2-implementation.md)
- [Health Check Core Module](../../.aiox-core/core/health-check/)
- [JSON Reporter](../../.aiox-core/core/health-check/reporters/json.js)

---

_Part of AIOX-FULLSTACK - Story HCS-2 Phase 4_
