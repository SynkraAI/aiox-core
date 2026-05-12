# Phase 3 - Batch migrate remaining utility & support tasks

# Get all remaining non-compliant tasks
$allTasks = Get-ChildItem .aiox-core/tasks/*.md | Where-Object { $_.Name -notlike '*v1-backup*' } | ForEach-Object { $_.Name }

Write-Host "Finding non-compliant tasks..." -ForegroundColor Cyan

$nonCompliantTasks = @()

foreach ($task in $allTasks) {
  $result = node .aiox-core/scripts/validate-task-v2.js ".aiox-core/tasks/$task" 2>&1
  if ($LASTEXITCODE -ne 0) {
    $nonCompliantTasks += $task
  }
}

Write-Host "Phase 3: Migrating $($nonCompliantTasks.Count) remaining tasks..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0
$startTime = Get-Date

foreach ($task in $nonCompliantTasks) {
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
Write-Host "=== Phase 3 Migration Complete ===" -ForegroundColor Green
Write-Host "Success: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { 'Red' } else { 'Green' })
Write-Host "Duration: $($duration.TotalSeconds) seconds" -ForegroundColor Cyan

