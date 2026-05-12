# Browser Console Check Task

Automated browser console error detection for frontend changes.

**Absorbed from:** Auto-Claude PR Review Phase 4.2 - Browser Console Check

---

## Task Definition

```yaml
task: qaBrowserConsoleCheck()
responsavel: Quinn (Guardian)
atomic_layer: Molecule

inputs:
  - story_id: string (required)
  - pages: array (optional - auto-detect from changes)
  - dev_server_url: string (default: http://localhost:3000)

outputs:
  - console_report: file (docs/stories/{story-id}/qa/console_errors.json)
  - has_errors: boolean
  - blocking: boolean
```

---

## What This Checks

```yaml
console_checks:
  errors:
    severity: CRITICAL
    patterns:
      - 'Uncaught Error'
      - 'Uncaught TypeError'
      - 'Uncaught ReferenceError'
      - 'Uncaught SyntaxError'
      - 'ChunkLoadError'
      - 'Failed to fetch'
      - 'NetworkError'
    action: Block approval

  warnings:
    severity: HIGH
    patterns:
      - 'Warning:'
      - 'Deprecation'
      - 'Invalid prop'
      - 'Each child in a list should have a unique'
      - 'Cannot update a component'
    action: Report, recommend fix

  failed_requests:
    severity: HIGH
    status_codes:
      - 4xx (except 404 for optional resources)
      - 5xx
    action: Report, investigate

  missing_resources:
    severity: MEDIUM
    patterns:
      - '404 Not Found'
      - 'Failed to load resource'
      - 'net::ERR_'
    action: Report

  performance:
    severity: LOW
    patterns:
      - 'Violation'
      - 'Long task'
      - 'Layout shift'
    action: Note for optimization
```

---

## Workflow

### Phase 1: Detect Pages to Test

```yaml
detect_pages:
  from_changes:
    - Parse modified files for route definitions
    - Extract page components from file paths
    - Map to URLs

  patterns:
    nextjs:
      - "app/**/page.tsx" → "/{path}"
      - "pages/**/*.tsx" → "/{path}"
    react_router:
      - Extract from Route components
    manual:
      - Use --pages parameter
```

### Phase 2: Start Dev Server

```yaml
start_server:
  commands:
    - npm run dev
    - yarn dev
    - pnpm dev

  wait_for:
    - "ready" in output
    - "compiled" in output
    - HTTP 200 on root URL

  timeout: 60000ms
```

### Phase 3: Visit Each Page

```yaml
visit_pages:
  for_each: detected_page

  actions:
    - Navigate to page URL
    - Wait for page load (networkidle)
    - Collect console messages
    - Capture any errors
    - Take screenshot (optional)

  capture:
    - console.error()
    - console.warn()
    - unhandled promise rejections
    - failed network requests
```

### Phase 4: Analyze Results

```yaml
analyze:
  categorize:
    - Group by severity
    - Deduplicate similar errors
    - Identify root causes

  filter_noise:
    - Ignore known third-party warnings
    - Ignore dev-only messages
    - Check against ignore list
```

### Phase 5: Generate Report

```yaml
report:
  format: JSON + Markdown summary
  include:
    - Page-by-page results
    - Error counts by severity
    - Blocking determination
    - Recommendations
```

---

## Command

```
*console-check {story-id} [--pages /path1,/path2] [--url http://localhost:3000]
```

**Examples:**

```bash
*console-check 6.3
*console-check 6.3 --pages /dashboard,/settings
*console-check 6.3 --url http://localhost:5173
```

---

## Console Report Format

```json
{
  "timestamp": "2026-01-29T10:30:00Z",
  "story_id": "6.3",
  "dev_server_url": "http://localhost:3000",
  "summary": {
    "pages_checked": 5,
    "total_errors": 2,
    "total_warnings": 3,
    "failed_requests": 1,
    "blocking": true
  },
  "pages": [
    {
      "url": "/dashboard",
      "status": "loaded",
      "load_time_ms": 1250,
      "errors": [
        {
          "type": "console.error",
          "message": "Uncaught TypeError: Cannot read property 'map' of undefined",
          "source": "dashboard.js:45",
          "severity": "CRITICAL",
          "stack": "..."
        }
      ],
      "warnings": [
        {
          "type": "console.warn",
          "message": "Warning: Each child in a list should have a unique \"key\" prop",
          "source": "UserList.tsx",
          "severity": "HIGH"
        }
      ],
      "failed_requests": [],
      "screenshot": "screenshots/dashboard.png"
    },
    {
      "url": "/settings",
      "status": "loaded",
      "load_time_ms": 890,
      "errors": [],
      "warnings": [],
      "failed_requests": [
        {
          "url": "/api/preferences",
          "status": 500,
          "method": "GET",
          "severity": "HIGH"
        }
      ]
    }
  ],
  "recommendation": "BLOCK - 1 CRITICAL error (TypeError) and 1 failed API request"
}
```

---

## Ignore List

```yaml
ignore_patterns:
  third_party:
    - 'Download the React DevTools'
    - 'Google Analytics'
    - 'Facebook Pixel'
    - '[HMR]'
    - 'Fast Refresh'

  dev_only:
    - 'Warning: ReactDOM.render is no longer supported'
    - 'Compiled successfully'
    - '[webpack-dev-server]'

  known_issues:
    - pattern: 'ResizeObserver loop'
      reason: 'Browser bug, not actionable'
    - pattern: 'Third-party cookie will be blocked'
      reason: 'Browser privacy feature'
```

---

## Integration with QA Review

```yaml
integration:
  trigger: During *review-build Phase 4 (Browser Verification)
  condition: UI files modified

  workflow: 1. Detect if frontend changes exist
    2. If yes, run console check
    3. Include results in qa_report.md
    4. Block if CRITICAL errors found

  decision_rules:
    - Any console.error (non-ignored): CRITICAL → Block
    - Failed 5xx requests: HIGH → Strong recommend fix
    - React warnings: HIGH → Recommend fix
    - Performance violations: LOW → Note only
```

---

## Playwright Integration

```yaml
playwright_script:
  purpose: Automated console capture

  usage: |
    npx playwright test console-check.spec.ts

  script: |
    import { test, expect } from '@playwright/test';

    test.describe('Console Error Check', () => {
      const pages = process.env.PAGES?.split(',') || ['/'];

      for (const pagePath of pages) {
        test(`No console errors on ${pagePath}`, async ({ page }) => {
          const errors: string[] = [];

          page.on('console', msg => {
            if (msg.type() === 'error') {
              errors.push(msg.text());
            }
          });

          page.on('pageerror', err => {
            errors.push(err.message);
          });

          await page.goto(pagePath);
          await page.waitForLoadState('networkidle');

          expect(errors).toHaveLength(0);
        });
      }
    });
```

---

## Metadata

```yaml
metadata:
  version: 1.0.0
  source: Auto-Claude PR Review Phase 4.2
  tags:
    - qa-enhancement
    - browser-testing
    - console-errors
    - frontend
  updated_at: 2026-01-29
```
