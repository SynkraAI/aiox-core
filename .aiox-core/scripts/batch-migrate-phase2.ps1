# Phase 2 - Batch migrate agent-specific tasks (50 tasks)

$tasks = @(
  # Dev Agent Tasks (5 new - 2 already done in Phase 1)
  'dev-apply-qa-fixes.md',
  'dev-improve-code-quality.md',
  'dev-optimize-performance.md',
  'dev-suggest-refactoring.md',
  'dev-backlog-debt.md',
  
  # QA Agent Tasks (8 new - 2 already done in Phase 1)
  'qa-generate-tests.md',
  'qa-nfr-assess.md',
  'qa-risk-profile.md',
  'qa-trace-requirements.md',
  'qa-review-proposal.md',
  'qa-review-story.md',
  'qa-run-tests.md',
  'qa-backlog-add-followup.md',
  
  # PO/PM/SM Agent Tasks (12 tasks)
  'po-pull-story.md',
  'po-pull-story-from-clickup.md',
  'po-sync-story.md',
  'po-sync-story-to-clickup.md',
  'po-manage-story-backlog.md',
  'po-backlog-add.md',
  'po-stories-index.md',
  'sm-create-next-story.md',
  'pr-automation.md',
  'release-management.md',
  'calculate-roi.md',
  'collaborative-edit.md',
  
  # Architect/Analyst Tasks (7 tasks)
  'analyze-framework.md',
  'architect-analyze-impact.md',
  'analyst-facilitate-brainstorming.md',
  'advanced-elicitation.md',
  'create-deep-research-prompt.md',
  'analyze-performance.md',
  
  # UX/Data/DevOps Tasks (14 tasks)
  'ux-create-wireframe.md',
  'ux-ds-scan-artifact.md',
  'ux-user-research.md',
  'db-apply-migration.md',
  'db-bootstrap.md',
  'db-dry-run.md',
  'db-env-check.md',
  'db-snapshot.md',
  'github-devops-github-pr-automation.md',
  'github-devops-pre-push-quality-gate.md',
  'github-devops-repository-cleanup.md',
  'github-devops-version-management.md',
  'ci-cd-configuration.md',
  'security-scan.md'
)

Write-Host "Phase 2: Migrating $($tasks.Count) agent-specific tasks..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0
$startTime = Get-Date

foreach ($task in $tasks) {
  Write-Host "Migrating: $task" -ForegroundColor Yellow
  node .aiox-core/scripts/migrate-task-to-v2.js ".aiox-core/tasks/$task" 2>&1 | Out-Null
  
  if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1) {
    $successCount++
    Write-Host "  OK" -ForegroundColor Green
  } else {
    $failCount++
    Write-Host "  FAILED" -ForegroundColor Red
  }
}

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "=== Phase 2 Migration Complete ===" -ForegroundColor Green
Write-Host "Success: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { 'Red' } else { 'Green' })
Write-Host "Duration: $($duration.TotalSeconds) seconds" -ForegroundColor Cyan

