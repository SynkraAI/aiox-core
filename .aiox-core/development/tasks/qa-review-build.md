# QA Review Build: 10-Phase Quality Assurance Review

> **Phase:** QA Review
> **Owner Agent:** @qa
> **Epic:** Epic 6 - QA Evolution
> **Command:** `*review-build {story-id}`

---

## Purpose

Execute a structured 10-phase quality assurance review of a completed build. This comprehensive review validates implementation against spec, runs automated tests, performs browser/database verification, conducts code review, checks for regressions, and produces a detailed QA report with clear APPROVE/REJECT signal.

---

## autoClaude

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: qa-review-build

  elicit: false
  deterministic: true
  composable: true

  inputs:
    - name: storyId
      type: string
      required: true
      description: Story ID in format {epic}.{story} (e.g., "6.1")

    - name: spec
      type: file
      path: docs/stories/{storyId}/spec/spec.md
      required: true

    - name: implementation
      type: file
      path: docs/stories/{storyId}/implementation/implementation.yaml
      required: false

    - name: storyFile
      type: file
      path: docs/stories/{storyId}*.md
      required: true

  outputs:
    - name: qa_report.md
      type: file
      path: docs/stories/{storyId}/qa/qa_report.md
      schema: qa-report-schema

    - name: status.json
      type: file
      path: .aiox/status.json
      update: true

  verification:
    type: gate
    blocking: true
    verdict_field: signal

  contextRequirements:
    projectContext: true
    filesContext: true
    implementationPlan: true
    spec: true
```

---

## 10 Review Phases

### Phase 0: Load Context

```yaml
phase: 0
name: 'Load Context'
description: 'Load all relevant artifacts to understand what was built'
blocking: true

actions:
  - id: load-spec
    action: read_file
    path: docs/stories/{storyId}/spec/spec.md
    required: true

  - id: load-implementation
    action: read_file
    path: docs/stories/{storyId}/implementation/implementation.yaml
    required: false

  - id: load-story
    action: read_file
    path: docs/stories/{storyId}*.md
    required: true

  - id: load-requirements
    action: read_file
    path: docs/stories/{storyId}/spec/requirements.json
    required: false

  - id: load-previous-qa
    action: read_file
    path: docs/stories/{storyId}/qa/qa_report.md
    required: false
    description: 'Check for previous QA reports'

output:
  context:
    spec: '{spec content}'
    implementation: '{implementation yaml}'
    story: '{story content}'
    requirements: '{requirements json}'
    previousReview: '{previous qa report if exists}'

validation:
  - spec.md exists and is readable
  - Story file exists and contains acceptance criteria
```

### Phase 1: Verify Subtasks Completed

```yaml
phase: 1
name: 'Verify Subtasks Completed'
description: 'Ensure all implementation subtasks are marked complete'
blocking: true

subphases:
  # Phase 1.2: Evidence Requirements (Absorbed from Auto-Claude)
  - id: 1.2
    name: 'Evidence Requirements Check'
    description: 'Verify required evidence is present for PR type'
    task: qa-evidence-requirements.md
    blocking: false
    actions:
      - id: detect-pr-type
        action: detect_pr_type
        sources: [story_title, commit_messages, acceptance_criteria]
        types: [bug_fix, feature, refactor, performance, security, documentation]

      - id: evaluate-evidence
        action: evaluate_evidence_checklist
        sources: [story_file, qa_report, test_results, screenshots, commits]

    checks:
      - id: minimum-score
        condition: 'evidence_score >= minimum_for_type'
        severity: HIGH
        message: 'Insufficient evidence for ${pr_type}'

      - id: no-blocking-missing
        condition: 'no CRITICAL evidence items missing'
        severity: CRITICAL
        message: 'Missing critical evidence: ${missing_items}'

    output:
      evidenceCheck:
        prType: '{detected_type}'
        score: '{X/Y}'
        passed: true|false
        missing: '[list of missing items]'

actions:
  - id: parse-subtasks
    action: extract_checklist
    source: implementation.yaml
    pattern: 'subtasks[].status'

  - id: verify-commits
    action: git_log
    filter: 'storyId:{storyId}'
    description: 'Check commits exist for this story'

  - id: check-file-list
    action: extract_section
    source: story.md
    section: 'File List'
    description: 'Verify File List section is populated'

checks:
  - id: subtasks-complete
    condition: 'all subtasks have status: completed'
    severity: HIGH
    message: 'All subtasks must be completed before QA review'

  - id: commits-exist
    condition: 'git log contains commits referencing storyId'
    severity: HIGH
    message: 'No commits found for this story'

  - id: files-documented
    condition: 'File List section is not empty'
    severity: MEDIUM
    message: 'File List section should document all changed files'

output:
  subtasks:
    total: '{count}'
    completed: '{count}'
    pending: '[list of pending subtasks]'
  commits:
    count: '{count}'
    latest: '{latest commit hash and message}'
  filesDocumented: true|false
```

### Phase 2: Initialize Environment

```yaml
phase: 2
name: 'Initialize Environment'
description: 'Prepare environment for testing - install deps, build project'
blocking: true

actions:
  - id: install-deps
    action: execute_command
    command: 'npm install'
    timeout: 120000
    description: 'Install project dependencies'

  - id: build-project
    action: execute_command
    command: 'npm run build'
    timeout: 300000
    description: 'Build the project'

  - id: check-env
    action: verify_environment
    checks:
      - node_version: '>=18.0.0'
      - npm_version: '>=9.0.0'
      - env_file_exists: '.env or .env.local'

checks:
  - id: deps-installed
    condition: 'npm install exits with code 0'
    severity: HIGH
    message: 'Failed to install dependencies'

  - id: build-success
    condition: 'npm run build exits with code 0'
    severity: HIGH
    message: 'Build failed - cannot proceed with QA'

  - id: no-typescript-errors
    condition: 'build output contains no type errors'
    severity: HIGH
    message: 'TypeScript compilation errors detected'

output:
  environment:
    nodeVersion: '{version}'
    npmVersion: '{version}'
    buildStatus: 'success|failure'
    buildTime: '{duration in ms}'
    errors: '[list of errors if any]'
```

### Phase 3: Automated Testing

```yaml
phase: 3
name: 'Automated Testing'
description: 'Run all automated test suites'
blocking: true

actions:
  - id: run-unit-tests
    action: execute_command
    command: 'npm run test'
    timeout: 300000
    description: 'Run unit tests'

  - id: run-integration-tests
    action: execute_command
    command: 'npm run test:integration'
    timeout: 600000
    optional: true
    description: 'Run integration tests if available'

  - id: run-e2e-tests
    action: execute_command
    command: 'npm run test:e2e'
    timeout: 900000
    optional: true
    description: 'Run end-to-end tests if available'

  - id: collect-coverage
    action: parse_output
    source: 'test output'
    pattern: 'coverage summary'

checks:
  - id: unit-tests-pass
    condition: 'npm run test exits with code 0'
    severity: HIGH
    message: 'Unit tests failed'

  - id: integration-tests-pass
    condition: 'npm run test:integration exits with code 0 OR command not found'
    severity: MEDIUM
    message: 'Integration tests failed'

  - id: e2e-tests-pass
    condition: 'npm run test:e2e exits with code 0 OR command not found'
    severity: MEDIUM
    message: 'E2E tests failed'

  - id: coverage-threshold
    condition: 'coverage >= 80% OR project has no coverage threshold'
    severity: LOW
    message: 'Test coverage below threshold'

output:
  testing:
    unit:
      status: 'pass|fail|skip'
      passed: '{count}'
      failed: '{count}'
      skipped: '{count}'
      duration: '{ms}'
    integration:
      status: 'pass|fail|skip|not_available'
      passed: '{count}'
      failed: '{count}'
    e2e:
      status: 'pass|fail|skip|not_available'
      passed: '{count}'
      failed: '{count}'
    coverage:
      lines: '{percentage}'
      branches: '{percentage}'
      functions: '{percentage}'
```

### Phase 4: Browser Verification

```yaml
phase: 4
name: 'Browser Verification'
description: 'Manual or automated browser-based verification'
blocking: false
conditional: 'project has UI components'

subphases:
  # Phase 4.2: Browser Console Check (Absorbed from Auto-Claude)
  - id: 4.2
    name: 'Browser Console Check'
    description: 'Detect runtime errors in browser console'
    task: qa-browser-console-check.md
    blocking: true
    actions:
      - id: start-dev-server
        action: detect_dev_server
        fallback: 'npm run dev'
        wait_for: 'ready|compiled|listening'
        timeout: 60000

      - id: capture-console
        action: playwright_console_listener
        capture: [error, warn, uncaught_exception, unhandled_rejection]
        pages: auto_detect_from_changes

      - id: check-network
        action: playwright_network_listener
        capture: ['status >= 400', 'timeout', 'failed']

    checks:
      - id: no-critical-errors
        condition: 'no Uncaught Error, TypeError, ReferenceError'
        severity: CRITICAL
        message: 'Critical console errors detected - BLOCKING'

      - id: no-network-failures
        condition: 'no 5xx errors, no failed requests'
        severity: HIGH
        message: 'Network failures detected'

    output:
      browserConsole:
        critical: '{count}'
        high: '{count}'
        medium: '{count}'
        blocking: true|false

actions:
  - id: detect-ui-changes
    action: analyze_diff
    filter: '**/*.tsx,**/*.jsx,**/*.vue,**/*.html,**/*.css'
    description: 'Detect if UI files were changed'

  - id: run-playwright
    action: execute_command
    command: 'npx playwright test'
    timeout: 600000
    optional: true
    condition: 'playwright.config exists'

  - id: visual-regression
    action: compare_screenshots
    baseline: 'docs/qa/screenshots/baseline'
    current: 'docs/qa/screenshots/current'
    optional: true

  - id: accessibility-check
    action: execute_command
    command: 'npx axe-core'
    optional: true

checks:
  - id: ui-renders
    condition: 'no console errors during render'
    severity: MEDIUM
    message: 'UI rendering errors detected'

  - id: responsive-design
    condition: 'UI works on mobile/tablet/desktop viewports'
    severity: LOW
    message: 'Responsive design issues detected'

  - id: accessibility
    condition: 'no critical accessibility violations'
    severity: MEDIUM
    message: 'Accessibility violations found'

output:
  browser:
    applicable: true|false
    playwrightStatus: 'pass|fail|skip|not_configured'
    visualRegression:
      status: 'pass|fail|skip'
      diffs: '[list of differing screenshots]'
    accessibility:
      violations: '{count}'
      criticalCount: '{count}'
```

### Phase 5: Database Validation

```yaml
phase: 5
name: 'Database Validation'
description: 'Verify database schema and data integrity'
blocking: false
conditional: 'project has database components'

subphases:
  # Phase 5.3: False Positive Detection (Absorbed from Auto-Claude)
  - id: 5.3
    name: 'False Positive Detection'
    description: 'Critical thinking to prevent confirmation bias'
    task: qa-false-positive-detection.md
    blocking: false
    conditional: 'pr_type in [bug_fix, security]'
    actions:
      - id: 4-step-protocol
        action: run_verification_protocol
        steps:
          - revert_test: 'Can we remove change and see problem return?'
          - baseline_failure: 'Did we test OLD code actually fails?'
          - success_verification: 'Did we test NEW code actually succeeds?'
          - independent_variables: 'Problem doesnt fix itself independently?'

      - id: bias-check
        action: check_confirmation_bias
        criteria:
          - negative_cases_tested
          - independent_verification_possible
          - mechanism_explained
          - alternatives_ruled_out

    checks:
      - id: minimum-confidence
        condition: 'confidence in [HIGH, MEDIUM]'
        severity: HIGH
        message: 'Low confidence in fix effectiveness'

      - id: no-critical-failures
        condition: 'no step has FAIL with severity CRITICAL'
        severity: CRITICAL
        message: 'Critical verification step failed'

    output:
      falsePositiveCheck:
        confidence: 'HIGH|MEDIUM|LOW'
        falsePositiveRisk: 'LOW|MEDIUM|HIGH'
        recommendations: '[list]'

actions:
  - id: detect-db-changes
    action: analyze_diff
    filter: '**/migrations/**,**/schema/**,**/*.sql,**/prisma/**'
    description: 'Detect if database files were changed'

  - id: check-migrations
    action: execute_command
    command: 'npm run db:migrate:status'
    optional: true
    description: 'Check migration status'

  - id: validate-schema
    action: execute_command
    command: 'npm run db:validate'
    optional: true
    description: 'Validate schema consistency'

  - id: check-seeds
    action: verify_file_exists
    path: '**/seeds/**'
    optional: true
    description: 'Check if seed data exists'

checks:
  - id: migrations-applied
    condition: 'all pending migrations are applied'
    severity: HIGH
    message: 'Pending database migrations exist'

  - id: schema-valid
    condition: 'schema validation passes'
    severity: HIGH
    message: 'Database schema validation failed'

  - id: no-data-loss
    condition: "migrations don't cause data loss"
    severity: HIGH
    message: 'Migration may cause data loss'

output:
  database:
    applicable: true|false
    migrationsStatus: 'up-to-date|pending|not_applicable'
    pendingMigrations: '[list]'
    schemaValid: true|false
    dataIntegrity: 'verified|unverified|not_applicable'
```

### Phase 6: Code Review (Enhanced with Auto-Claude Absorption)

```yaml
phase: 6
name: 'Code Review'
description: 'Security review, pattern adherence, code quality, library validation'
blocking: true

# Phase 6.0: Library Validation (Absorbed from Auto-Claude)
subphases:
  - id: 6.0
    name: 'Library Validation'
    description: 'Validate third-party library usage via Context7'
    task: qa-library-validation.md
    blocking: false
    actions:
      - id: extract-imports
        action: grep_imports
        patterns:
          - 'import.*from [''"]([^''"./][^''"]*)[''"]'
          - "require\\(['\"]([^'\"./][^'\"]*)['\"]\\)"
        description: 'Extract all third-party imports'

      - id: validate-context7
        action: context7_validation
        for_each: 'extracted_imports'
        steps:
          - resolve_library_id
          - query_docs
          - validate_signatures
          - check_deprecated
        description: 'Validate each library against Context7 docs'

    checks:
      - id: api-usage-correct
        condition: 'all library APIs used correctly'
        severity: CRITICAL
        message: 'Incorrect library API usage detected'

      - id: no-deprecated
        condition: 'no deprecated APIs used'
        severity: MAJOR
        message: 'Deprecated API usage detected'

    output:
      libraryValidation:
        checked: '{count}'
        issues: '[list]'
        unresolved: '[list]'

  # Phase 6.1: Security Checklist (Absorbed from Auto-Claude)
  - id: 6.1
    name: 'Security Checklist'
    description: '8-point security vulnerability scan'
    task: qa-security-checklist.md
    blocking: true
    actions:
      - id: check-eval
        action: grep_pattern
        pattern: 'eval\\(|new Function\\('
        severity: CRITICAL
        description: 'Check for eval() and dynamic code execution'

      - id: check-innerHTML
        action: grep_pattern
        pattern: '\\.innerHTML\\s*=|\\.outerHTML\\s*='
        severity: CRITICAL
        description: 'Check for innerHTML XSS vectors'

      - id: check-dangerouslySetInnerHTML
        action: grep_pattern
        pattern: 'dangerouslySetInnerHTML'
        severity: CRITICAL
        description: 'Check for React XSS vectors'

      - id: check-shell-true
        action: grep_pattern
        pattern: 'shell\\s*=\\s*True|os\\.system\\(|os\\.popen\\('
        severity: CRITICAL
        description: 'Check for Python command injection'

      - id: check-hardcoded-secrets
        action: grep_pattern
        pattern: 'api[_-]?key\\s*[=:]\\s*[''"][^''"]{10,}|password\\s*[=:]\\s*[''"][^''"]+'
        severity: CRITICAL
        description: 'Check for hardcoded secrets'

      - id: check-sql-injection
        action: grep_pattern
        pattern: 'query\\s*\\(\\s*[''"`].*\\$\\{|execute\\s*\\(.*\\.format\\('
        severity: CRITICAL
        description: 'Check for SQL injection patterns'

      - id: check-input-validation
        action: grep_pattern
        pattern: 'req\\.body\\.[a-zA-Z]+[^?]|req\\.query\\.[a-zA-Z]+[^?]'
        severity: HIGH
        description: 'Check for missing input validation'

      - id: check-cors
        action: grep_pattern
        pattern: 'origin:\\s*[''"]\\*[''"]|Access-Control-Allow-Origin.*\\*'
        severity: HIGH
        description: 'Check for insecure CORS'

    checks:
      - id: no-critical-security
        condition: 'no CRITICAL security issues'
        severity: CRITICAL
        message: 'Critical security vulnerability detected - BLOCKING'

      - id: no-high-security
        condition: 'no HIGH security issues'
        severity: HIGH
        message: 'High severity security issue detected'

    output:
      securityChecklist:
        critical: '{count}'
        high: '{count}'
        issues: '[detailed list]'
        blocking: true|false

  # Phase 6.2: Migration Validation (Absorbed from Auto-Claude)
  - id: 6.2
    name: 'Migration Validation'
    description: 'Validate database migrations for schema changes'
    task: qa-migration-validation.md
    blocking: false
    conditional: 'schema_changes_detected'
    actions:
      - id: detect-framework
        action: detect_db_framework
        frameworks:
          - supabase
          - prisma
          - drizzle
          - django
          - rails
          - sequelize

      - id: validate-migrations
        action: validate_migrations
        checks:
          - migration_exists
          - migration_matches_schema
          - migration_reversible
          - rls_policies_exist

    checks:
      - id: migrations-exist
        condition: 'migration file exists for each schema change'
        severity: CRITICAL
        message: 'Missing migration for schema change'

      - id: rls-policies
        condition: 'RLS policies exist for new tables (Supabase)'
        severity: HIGH
        message: 'Missing RLS policies for new table'

    output:
      migrationValidation:
        framework: '{detected}'
        schemaChanges: '{count}'
        migrationsFound: '{count}'
        missing: '[list]'
        issues: '[list]'

  # Original Phase 6 actions (now Phase 6.3)
  - id: 6.3
    name: 'Code Quality & Patterns'
    description: 'CodeRabbit, linting, dependency audit'
    blocking: true

actions:
  - id: security-scan
    action: execute_coderabbit
    type: 'security'
    description: 'Run security vulnerability scan'

  - id: pattern-check
    action: analyze_patterns
    rules:
      - no_hardcoded_secrets
      - no_console_logs_in_production
      - proper_error_handling
      - consistent_naming

  - id: dependency-audit
    action: execute_command
    command: 'npm audit'
    description: 'Check for vulnerable dependencies'

  - id: lint-check
    action: execute_command
    command: 'npm run lint'
    description: 'Run linter'

checks:
  - id: no-secrets
    condition: 'no hardcoded API keys, passwords, or tokens'
    severity: HIGH
    message: 'Hardcoded secrets detected'

  - id: no-vulnerabilities
    condition: 'no high/critical npm audit vulnerabilities'
    severity: HIGH
    message: 'Security vulnerabilities in dependencies'

  - id: patterns-followed
    condition: 'code follows project patterns'
    severity: MEDIUM
    message: 'Code pattern violations detected'

  - id: lint-clean
    condition: 'npm run lint exits with code 0'
    severity: MEDIUM
    message: 'Linting errors present'

output:
  codeReview:
    # Phase 6.0 - Library Validation
    libraryValidation:
      checked: '{count}'
      issues: '[list]'
      unresolved: '[list]'
    # Phase 6.1 - Security Checklist
    securityChecklist:
      critical: '{count}'
      high: '{count}'
      issues: '[detailed list]'
    # Phase 6.2 - Migration Validation
    migrationValidation:
      framework: '{detected}'
      issues: '[list]'
    # Phase 6.3 - Code Quality
    security:
      secrets: '[list of potential secrets]'
      vulnerabilities:
        critical: '{count}'
        high: '{count}'
        medium: '{count}'
        low: '{count}'
    patterns:
      violations: '[list of violations]'
      suggestions: '[list of improvements]'
    lint:
      errors: '{count}'
      warnings: '{count}'
```

### Phase 7: Regression Testing

```yaml
phase: 7
name: 'Regression Testing'
description: 'Verify existing features still work'
blocking: true

actions:
  - id: identify-affected-areas
    action: analyze_dependencies
    source: 'changed files'
    description: 'Identify areas potentially affected by changes'

  - id: run-smoke-tests
    action: execute_command
    command: 'npm run test:smoke'
    optional: true
    description: 'Run smoke tests for critical paths'

  - id: check-breaking-changes
    action: analyze_api_diff
    description: 'Check for breaking API changes'

  - id: verify-backwards-compat
    action: verify_compatibility
    description: 'Verify backwards compatibility'

checks:
  - id: no-regressions
    condition: 'smoke tests pass'
    severity: HIGH
    message: 'Regression detected in existing functionality'

  - id: api-stable
    condition: 'no breaking API changes without version bump'
    severity: HIGH
    message: 'Breaking API changes detected'

  - id: deps-compatible
    condition: "dependency updates don't break existing features"
    severity: MEDIUM
    message: 'Dependency compatibility issues'

output:
  regression:
    affectedAreas: '[list of affected modules/components]'
    smokeTestStatus: 'pass|fail|skip'
    breakingChanges: '[list of breaking changes]'
    regressionRisk: 'low|medium|high'
```

### Phase 8: Generate Report

```yaml
phase: 8
name: 'Generate Report'
description: 'Compile findings into comprehensive QA report'
blocking: true

actions:
  - id: aggregate-findings
    action: compile_results
    sources:
      - phase_0_context
      - phase_1_subtasks
      - phase_2_environment
      - phase_3_testing
      - phase_4_browser
      - phase_5_database
      - phase_6_code_review
      - phase_7_regression

  - id: categorize-issues
    action: categorize
    categories:
      - CRITICAL: 'Security vulnerabilities, data loss, breaking changes'
      - HIGH: 'Test failures, build errors, major bugs'
      - MEDIUM: 'Code quality, pattern violations, minor bugs'
      - LOW: 'Suggestions, optimizations, style issues'

  - id: generate-markdown
    action: render_template
    template: qa-report-template.md
    output: docs/stories/{storyId}/qa/qa_report.md

template: |
  # QA Review Report: Story {storyId}

  **Review Date:** {timestamp}
  **Reviewed By:** Quinn (Test Architect)
  **Signal:** {APPROVE|REJECT}

  ---

  ## Executive Summary

  {summary_paragraph}

  ## Phase Results

  ### Phase 0: Context Loaded
  - Spec: {loaded|not_found}
  - Implementation Plan: {loaded|not_found}
  - Story File: {loaded|not_found}

  ### Phase 1: Subtasks Verification
  - Total Subtasks: {count}
  - Completed: {count}
  - Pending: {count}
  - Commits Found: {count}

  ### Phase 2: Environment
  - Dependencies: {installed|failed}
  - Build: {success|failed}
  - TypeScript: {clean|errors}

  ### Phase 3: Automated Tests
  - Unit Tests: {passed}/{total} ({percentage}%)
  - Integration Tests: {status}
  - E2E Tests: {status}
  - Coverage: {percentage}%

  ### Phase 4: Browser Verification
  - Applicable: {yes|no}
  - Playwright: {status}
  - Visual Regression: {status}
  - Accessibility: {violations} violations

  ### Phase 5: Database Validation
  - Applicable: {yes|no}
  - Migrations: {status}
  - Schema: {valid|invalid}

  ### Phase 6: Code Review
  - Security Issues: {count}
  - Pattern Violations: {count}
  - Lint Errors: {count}

  ### Phase 7: Regression Testing
  - Affected Areas: {count}
  - Smoke Tests: {status}
  - Breaking Changes: {count}

  ---

  ## Issues Found

  ### Critical Issues
  {list_critical_issues}

  ### High Priority Issues
  {list_high_issues}

  ### Medium Priority Issues
  {list_medium_issues}

  ### Low Priority Issues
  {list_low_issues}

  ---

  ## Recommendations

  ### Must Fix Before Approval
  {must_fix_list}

  ### Suggested Improvements
  {suggestions_list}

  ---

  ## Signal: {APPROVE|REJECT}

  **Reason:** {signal_reason}

  **Next Actions:**
  {next_actions_list}

  ---

  *Generated by Quinn (@qa) via qa-review-build task*

output:
  report:
    path: docs/stories/{storyId}/qa/qa_report.md
    generated: true
```

### Phase 9: Update Implementation Plan

```yaml
phase: 9
name: 'Update Implementation Plan'
description: 'Mark story as reviewed, add issues to implementation plan'
blocking: false

actions:
  - id: update-status-json
    action: update_json
    path: .aiox/status.json
    updates:
      - path: 'stories.{storyId}.qaReviewed'
        value: true
      - path: 'stories.{storyId}.qaSignal'
        value: '{APPROVE|REJECT}'
      - path: 'stories.{storyId}.qaReviewedAt'
        value: '{timestamp}'

  - id: update-implementation
    action: update_yaml
    path: docs/stories/{storyId}/implementation/implementation.yaml
    updates:
      - path: 'qa.reviewed'
        value: true
      - path: 'qa.signal'
        value: '{APPROVE|REJECT}'
      - path: 'qa.issues'
        value: '{issues_list}'

  - id: create-fix-requests
    action: create_issues
    condition: 'signal == REJECT'
    issues: '{critical_and_high_issues}'
    format: fix-request

output:
  updates:
    statusJson: 'updated'
    implementationYaml: 'updated'
    fixRequestsCreated: '{count}'
```

### Phase 10: Signal Completion

```yaml
phase: 10
name: 'Signal Completion'
description: 'Emit final APPROVE or REJECT signal'
blocking: true

actions:
  - id: calculate-signal
    action: determine_verdict
    rules:
      REJECT:
        - any_critical_issues: true
        - any_high_issues_unfixed: true
        - build_failed: true
        - unit_tests_failed: true
      APPROVE:
        - all_above_false: true
        - subtasks_complete: true

  - id: notify-completion
    action: emit_signal
    signal: '{APPROVE|REJECT}'
    metadata:
      storyId: '{storyId}'
      reviewedBy: 'Quinn'
      reviewedAt: '{timestamp}'
      reportPath: 'docs/stories/{storyId}/qa/qa_report.md'

  - id: update-story-status
    action: recommend_status
    condition: 'signal == APPROVE'
    recommendation: 'Ready for Done'

checks:
  - id: signal-clear
    condition: 'signal is definitively APPROVE or REJECT'
    severity: HIGH
    message: 'Unable to determine clear signal'

output:
  signal: 'APPROVE|REJECT'
  reason: '{detailed_reason}'
  nextSteps:
    APPROVE:
      - 'Story ready for Done status'
      - 'PR can be merged'
      - 'Deploy to staging/production'
    REJECT:
      - 'Review issues in qa_report.md'
      - 'Fix critical and high priority issues'
      - 'Re-run *review-build {storyId}'
```

---

## Signal Logic

```yaml
signal_rules:
  APPROVE:
    condition: |
      - No CRITICAL issues
      - No HIGH issues (or all HIGH issues resolved)
      - Build succeeds
      - Unit tests pass
      - All subtasks completed
    meaning: 'Build is ready for production'
    next_action: 'Proceed to deployment'

  REJECT:
    condition: |
      - Any CRITICAL issue present OR
      - Any HIGH issue unresolved OR
      - Build fails OR
      - Unit tests fail OR
      - Subtasks incomplete
    meaning: 'Build requires fixes before approval'
    next_action: 'Return to @dev with fix requests'
```

---

## Command Integration

```yaml
command:
  name: '*review-build'
  syntax: '*review-build {story-id} [--quick] [--skip-browser] [--skip-db]'
  agent: qa

  flags:
    --quick: 'Skip optional phases (4, 5)'
    --skip-browser: 'Skip Phase 4 (Browser Verification)'
    --skip-db: 'Skip Phase 5 (Database Validation)'

  examples:
    - '*review-build 6.1'
    - '*review-build 6.1 --quick'
    - '*review-build 6.1 --skip-browser'
```

---

## Output Files

### Primary Output: qa_report.md

```yaml
location: docs/stories/{storyId}/qa/qa_report.md
format: markdown
contents:
  - executive_summary
  - phase_results (all 10 phases)
  - issues_by_severity
  - recommendations
  - signal_with_reason
```

### Secondary Output: status.json

```yaml
location: .aiox/status.json
updates:
  - stories.{storyId}.qaReviewed: true
  - stories.{storyId}.qaSignal: 'APPROVE|REJECT'
  - stories.{storyId}.qaReviewedAt: '{ISO-8601}'
  - stories.{storyId}.qaIssues: '[issue_ids]'
```

---

## Error Handling

```yaml
errors:
  - id: spec-not-found
    condition: 'spec.md does not exist'
    action: 'HALT - Cannot review without specification'
    blocking: true

  - id: build-timeout
    condition: 'npm run build exceeds timeout'
    action: 'Log timeout, mark build as FAILED'
    blocking: true

  - id: test-timeout
    condition: 'tests exceed timeout'
    action: 'Log timeout, continue with partial results'
    blocking: false

  - id: phase-failure
    condition: 'blocking phase fails'
    action: 'Stop review, generate partial report with REJECT signal'
    blocking: true
```

---

## Integration with QA Agent

This task is automatically triggered by the `*review-build` command in the @qa agent:

```yaml
agent_integration:
  command: '*review-build {story-id}'
  task_file: qa-review-build.md
  agent: qa

  pre_requisites:
    - Story exists in docs/stories/
    - Story status is "Review" or "In Progress"
    - Spec file exists

  post_actions:
    - Update QA Results section in story file
    - Create/update gate file in qa.qaLocation/gates
    - Emit signal to status.json
```

---

## Metadata

```yaml
metadata:
  story: '6.1'
  epic: 'Epic 6 - QA Evolution'
  created: '2026-01-29'
  author: '@architect'
  version: '1.0.0'
  tags:
    - qa-evolution
    - review-build
    - 10-phase-review
    - quality-gate
    - automated-testing
```
