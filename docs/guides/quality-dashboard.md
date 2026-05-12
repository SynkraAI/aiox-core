# Quality Gates Dashboard Guide

> **EN** | [PT](../pt/guides/quality-dashboard.md) | [ES](../es/guides/quality-dashboard.md)

---

> Visual dashboard for monitoring quality metrics across all 3 layers.

**Version:** 1.0
**Last Updated:** 2025-12-05

---

## Overview

The Quality Gates Dashboard provides real-time visualization of quality metrics collected from all three quality gate layers. It helps tech leads and developers monitor code quality trends, identify issues, and track the effectiveness of the quality gates system.

### Key Features

| Feature               | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| **3-Layer Metrics**   | View pass rates for Pre-Commit, PR Review, and Human Review |
| **Trend Charts**      | Track auto-catch rate over the last 30 days                 |
| **Real-time Updates** | Auto-refresh every 60 seconds                               |
| **Responsive Design** | Works on desktop, tablet, and mobile                        |
| **Accessibility**     | WCAG 2.1 AA compliant                                       |
| **Dark Mode**         | Automatic based on system preference                        |

---

## Accessing the Dashboard

### Development Mode

```bash
# Navigate to dashboard directory
cd tools/quality-dashboard

# Sync metrics and start development server
npm run dev:sync

# Or sync separately
npm run sync-metrics
npm run dev
```

The dashboard will open at `http://localhost:3000`.

### Production Build

```bash
# Build for production
cd tools/quality-dashboard
npm run build

# Preview production build
npm run preview

# Serve from dist/ directory
npx serve dist
```

### Direct File Access

Open the pre-built dashboard:

```
tools/quality-dashboard/dist/index.html
```

---

## Understanding the Dashboard

### Header Section

```
┌─────────────────────────────────────────────────────────┐
│  📊 Quality Gates Dashboard                             │
│  Last Update: Dec 5, 2025 14:30:00                     │
│  [🔄 Refresh] [Auto-refresh: 60s ▼]                    │
└─────────────────────────────────────────────────────────┘
```

| Element            | Description                               |
| ------------------ | ----------------------------------------- |
| **Last Update**    | Timestamp of most recent data fetch       |
| **Refresh Button** | Manual refresh without page reload        |
| **Auto-refresh**   | Configurable interval (30s, 60s, 5m, off) |

### Layer Cards

Each quality gate layer has its own metrics card:

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Pre-Commit                        ● Healthy  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Pass Rate: 94.5%    Avg Time: 32s    Total Runs: 156  │
│  ████████████████░░                                     │
│                                                         │
│  [Click to expand]                                      │
└─────────────────────────────────────────────────────────┘
```

#### Layer 1: Pre-Commit

| Metric         | Description                                             |
| -------------- | ------------------------------------------------------- |
| **Pass Rate**  | % of commits passing all checks (lint, test, typecheck) |
| **Avg Time**   | Average time to complete all Layer 1 checks             |
| **Total Runs** | Number of pre-commit runs in the time period            |

#### Layer 2: PR Review

| Metric                  | Description                              |
| ----------------------- | ---------------------------------------- |
| **Pass Rate**           | % of PRs passing automated review        |
| **CodeRabbit Findings** | Issues found by CodeRabbit (by severity) |
| **Quinn Findings**      | Issues found by @qa agent                |
| **Auto-Catch Rate**     | % of issues caught before human review   |

**Expanded View (click to expand):**

```
┌─────────────────────────────────────────────────────────┐
│  Layer 2: PR Review                         ● Warning  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Pass Rate: 87.2%    Avg Time: 4m 32s   Total: 45 PRs │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ CodeRabbit Breakdown                            │   │
│  │ CRITICAL: 3  │  HIGH: 12  │  MEDIUM: 28        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Quinn (@qa) Findings                            │   │
│  │ Blockers: 2  │  Warnings: 8  │  Info: 15       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Layer 3: Human Review

| Metric            | Description                               |
| ----------------- | ----------------------------------------- |
| **Pass Rate**     | % of PRs approved on first review         |
| **Avg Time**      | Average time from PR creation to approval |
| **Revision Rate** | % of PRs requiring revisions              |

### Trend Chart

The trend chart shows the auto-catch rate over the last 30 days:

```
Auto-Catch Rate Trend (30 days)
100% ┤
 90% ┤        ╭──────────╮
 80% ┤   ╭────╯          ╰────╮
 70% ┤───╯                    ╰───
 60% ┤
     └────────────────────────────
        Week 1   Week 2   Week 3   Week 4
```

**Auto-Catch Rate** = Issues caught by Layer 1 + Layer 2 / Total issues

Higher is better - means more issues are caught automatically before human review.

---

## Metrics Data Source

### Location

Metrics are stored in:

```
.aiox/data/quality-metrics.json
```

### Data Format

```json
{
  "generated": "2025-12-05T14:30:00.000Z",
  "version": "1.0",
  "summary": {
    "overallHealth": "healthy",
    "autoCatchRate": 0.945,
    "totalRuns": 156
  },
  "layers": {
    "layer1": {
      "name": "Pre-Commit",
      "passRate": 0.945,
      "avgTimeSeconds": 32,
      "totalRuns": 156,
      "checks": {
        "lint": { "passRate": 0.98, "avgTime": 12 },
        "test": { "passRate": 0.95, "avgTime": 45 },
        "typecheck": { "passRate": 0.99, "avgTime": 28 }
      }
    },
    "layer2": {
      "name": "PR Review",
      "passRate": 0.872,
      "avgTimeSeconds": 272,
      "totalRuns": 45,
      "coderabbit": {
        "critical": 3,
        "high": 12,
        "medium": 28,
        "low": 45
      },
      "quinn": {
        "blockers": 2,
        "warnings": 8,
        "info": 15
      }
    },
    "layer3": {
      "name": "Human Review",
      "passRate": 0.78,
      "avgTimeSeconds": 86400,
      "totalRuns": 38,
      "revisionRate": 0.22
    }
  },
  "trends": {
    "autoCatchRate": [
      { "date": "2025-11-05", "value": 0.82 },
      { "date": "2025-11-12", "value": 0.87 },
      { "date": "2025-11-19", "value": 0.91 },
      { "date": "2025-11-26", "value": 0.93 },
      { "date": "2025-12-03", "value": 0.945 }
    ]
  }
}
```

### Syncing Metrics

The dashboard reads metrics from the public folder. To update:

```bash
# Sync from .aiox/data to dashboard
npm run sync-metrics

# Or use the combined command
npm run dev:sync
```

This copies `.aiox/data/quality-metrics.json` to `tools/quality-dashboard/public/.aiox/data/`.

---

## Interpreting Trends

### Healthy Trends

| Indicator                        | What It Means                                            |
| -------------------------------- | -------------------------------------------------------- |
| **Rising Auto-Catch Rate**       | More issues caught automatically - quality gates working |
| **Decreasing Layer 3 Revisions** | Human reviewers finding fewer issues                     |
| **Stable Pass Rates > 90%**      | Developers writing better code upfront                   |

### Warning Signs

| Indicator                       | What It Means                    | Action                   |
| ------------------------------- | -------------------------------- | ------------------------ |
| **Dropping Auto-Catch Rate**    | Automated checks missing issues  | Review CodeRabbit config |
| **Layer 1 Pass Rate < 80%**     | Too many failing commits         | Check lint/test rules    |
| **Layer 2 Many CRITICALs**      | Security/quality issues          | Review code practices    |
| **Layer 3 Revision Rate > 30%** | Human review finding many issues | Improve automation       |

---

## Configuration

### Auto-Refresh Interval

Click the dropdown next to the refresh button:

| Option         | Use Case                          |
| -------------- | --------------------------------- |
| **30 seconds** | Active monitoring during releases |
| **60 seconds** | Default for daily use             |
| **5 minutes**  | Background monitoring             |
| **Off**        | Manual refresh only               |

### Dark Mode

The dashboard automatically follows your system preference. No manual toggle needed.

---

## Accessibility

The dashboard is WCAG 2.1 AA compliant:

| Feature                 | Implementation                            |
| ----------------------- | ----------------------------------------- |
| **Color Contrast**      | All text has 4.5:1 minimum contrast ratio |
| **Keyboard Navigation** | Full keyboard support with visible focus  |
| **Screen Readers**      | ARIA labels on all interactive elements   |
| **Reduced Motion**      | Respects `prefers-reduced-motion`         |
| **Focus Management**    | Logical tab order throughout              |

---

## Troubleshooting

### Dashboard Shows Stale Data

```bash
# Sync metrics manually
cd tools/quality-dashboard
npm run sync-metrics

# Refresh the page
```

### Metrics File Not Found

Ensure the metrics collector has run:

```bash
# Check if metrics file exists
ls -la .aiox/data/quality-metrics.json

# If missing, seed with sample data
npx aiox metrics seed
```

### Charts Not Rendering

1. Clear browser cache
2. Ensure JavaScript is enabled
3. Try a different browser

### Auto-Refresh Not Working

The auto-refresh pauses when:

- Browser tab is in background
- Network connectivity is lost
- Focus is on an interactive element

---

## Related Documentation

- [Quality Gates Guide](./quality-gates.md)

---

_Synkra AIOX Quality Dashboard v1.0_
