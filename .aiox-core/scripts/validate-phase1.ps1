$tasks = @(
  'dev-develop-story.md',
  'create-next-story.md',
  'brownfield-create-story.md',
  'brownfield-create-epic.md',
  'create-agent.md',
  'modify-agent.md',
  'create-task.md',
  'qa-gate.md',
  'qa-test-design.md',
  'validate-next-story.md',
  'execute-checklist.md',
  'correct-course.md',
  'create-doc.md',
  'shard-doc.md'
)

$pass = 0
$fail = 0

foreach ($t in $tasks) {
  node .aiox-core/scripts/validate-task-v2.js ".aiox-core/tasks/$t" | Out-Null
  
  if ($LASTEXITCODE -eq 0) {
    $pass++
    Write-Host "✅ $t" -ForegroundColor Green
  } else {
    $fail++
    Write-Host "❌ $t" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "Phase 1 Results: $pass/14 tasks V2.0 compliant" -ForegroundColor Green

