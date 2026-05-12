# Phase 1 - Batch migrate critical tasks

$tasks = @(
  'create-next-story.md',
  'brownfield-create-story.md', 
  'brownfield-create-epic.md',
  'create-agent.md',
  'modify-agent.md',
  'create-task.md',
  'qa-gate.md',
  'qa-test-design.md',
  'execute-checklist.md',
  'correct-course.md',
  'create-doc.md',
  'shard-doc.md'
)

$successCount = 0
$failCount = 0

foreach ($task in $tasks) {
  Write-Host "`n=== Migrating $task ===" -ForegroundColor Cyan
  node .aiox-core/scripts/migrate-task-to-v2.js ".aiox-core/tasks/$task"
  
  if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1) {
    $successCount++
  } else {
    $failCount++
    Write-Host "Failed to migrate $task" -ForegroundColor Red
  }
}

Write-Host "`n=== Phase 1 Migration Complete ===" -ForegroundColor Green
Write-Host "Success: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { 'Red' } else { 'Green' })

