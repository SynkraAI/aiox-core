# setup-github

**Task ID:** setup-github
**Version:** 1.0.0
**Created:** 2025-12-08
**Updated:** 2025-12-08
**Agent:** @devops (Gage)
**Story:** 5.10 - GitHub DevOps Setup for User Projects

---

## Purpose

Configure complete GitHub DevOps infrastructure for user projects created with AIOX. This task copies GitHub Actions workflows, configures CodeRabbit, sets up branch protection, and manages secrets.

**This task should be executed AFTER `*environment-bootstrap`**, when the Git repository is already initialized and pushed to GitHub.

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous setup with sensible defaults
- Skip optional components, install essential DevOps
- **Best for:** Experienced developers, quick setup

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations for each component
- **Best for:** Learning, first-time setup, team onboarding

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Full analysis phase before any configuration
- Zero ambiguity execution
- **Best for:** Enterprise environments, strict policies

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: setupGitHub()
responsável: Gage (Operator)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: project_path
  tipo: string
  origem: Auto-detect (cwd)
  obrigatório: false
  validação: Valid directory with .git and GitHub remote

- campo: options
  tipo: object
  origem: User Input
  obrigatório: false
  validação: |
    {
      skip_workflows: boolean,      // Skip GitHub Actions setup
      skip_coderabbit: boolean,     // Skip CodeRabbit configuration
      skip_branch_protection: boolean, // Skip branch protection rules
      skip_secrets: boolean,        // Skip secrets wizard
      project_type: string          // node | python | go | rust | mixed
    }

**Saída:**
- campo: devops_setup_report
  tipo: object
  destino: File system (.aiox/devops-setup-report.yaml)
  persistido: true

- campo: workflows_installed
  tipo: array
  destino: Return value
  persistido: false

- campo: protection_enabled
  tipo: boolean
  destino: Return value
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Git repository exists (.git directory present)
    tipo: pre-condition
    blocker: true
    validação: |
      Test-Path ".git" (PowerShell) or [ -d .git ] (bash)
    error_message: "Git repository not found. Run *environment-bootstrap first."

  - [ ] GitHub remote configured
    tipo: pre-condition
    blocker: true
    validação: |
      git remote get-url origin
    error_message: "GitHub remote not configured. Run *environment-bootstrap first."

  - [ ] GitHub CLI authenticated
    tipo: pre-condition
    blocker: true
    validação: |
      gh auth status
    error_message: "GitHub CLI not authenticated. Run 'gh auth login'."

  - [ ] Repository exists on GitHub
    tipo: pre-condition
    blocker: true
    validação: |
      gh repo view
    error_message: "Repository not found on GitHub. Push changes first."

  - [ ] Not already configured (idempotency check)
    tipo: pre-condition
    blocker: false
    validação: |
      Check .aiox/devops-setup-report.yaml existence
    warning_message: "DevOps setup already completed. Use --force to reconfigure."
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] GitHub Actions workflows present in .github/workflows/
    tipo: post-condition
    blocker: true
    validação: |
      Test-Path ".github/workflows/ci.yml"
    error_message: "Workflow installation failed"

  - [ ] CodeRabbit config present (if not skipped)
    tipo: post-condition
    blocker: false
    validação: |
      Test-Path ".coderabbit.yaml"
    warning_message: "CodeRabbit not configured"

  - [ ] DevOps setup report generated
    tipo: post-condition
    blocker: false
    validação: |
      Test-Path ".aiox/devops-setup-report.yaml"
    error_message: "Setup report not generated"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] At least ci.yml workflow is installed and valid
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Verify .github/workflows/ci.yml exists and is valid YAML
    error_message: "CI workflow not installed"

  - [ ] Workflows are customized for project type
    tipo: acceptance-criterion
    blocker: false
    validação: |
      Check node_version, python_version, etc. match project
    error_message: "Workflow customization failed"

  - [ ] Setup report documents all configurations
    tipo: acceptance-criterion
    blocker: true
    validação: |
      .aiox/devops-setup-report.yaml contains all setup details
    error_message: "Setup report incomplete"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** github-cli
  - **Purpose:** Repository operations, branch protection, secrets
  - **Source:** .aiox-core/infrastructure/tools/cli/github-cli.yaml

- **Tool:** git
  - **Purpose:** Local repository operations
  - **Source:** Built-in

---

## Error Handling

**Strategy:** retry-with-alternatives

**Common Errors:**

1. **Error:** Branch Protection API Failed
   - **Cause:** Insufficient permissions or free tier limitations
   - **Resolution:** Warn user about GitHub free tier limitations
   - **Recovery:** Skip branch protection, document in report

2. **Error:** Workflow File Conflict
   - **Cause:** Workflow files already exist
   - **Resolution:** Prompt user to overwrite or merge
   - **Recovery:** Backup existing, install new

3. **Error:** Secrets Permission Denied
   - **Cause:** Token doesn't have secrets scope
   - **Resolution:** Re-authenticate with secrets scope
   - **Recovery:** Skip secrets, provide manual instructions

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-5 min
cost_estimated: $0.00 (no AI tokens, API operations only)
token_usage: ~300-500 tokens (for guidance only)
```

---

## Metadata

```yaml
story: 5.10
version: 1.0.0
dependencies:
  - environment-bootstrap.md
  - github-cli.yaml
tags:
  - devops
  - github
  - workflows
  - ci-cd
  - setup
updated_at: 2025-12-08
changelog:
  1.0.0:
    - Initial implementation for Story 5.10
    - GitHub Actions templates support
    - CodeRabbit configuration
    - Branch protection via gh api
    - Secrets wizard integration
```

---

## Elicitation

```yaml
elicit: true
interaction_points:
  - project_type: "What type of project is this? (node/python/go/rust/mixed)"
  - workflows_select: "Which workflows do you want to install?"
  - branch_protection: "Enable branch protection for main? (requires GitHub Pro for private repos)"
  - secrets_configure: "Which secrets do you want to configure?"
```

---

## Process

### Step 1: Verify Pre-Conditions

**Action:** Check all prerequisites are met

```powershell
echo "=== GitHub DevOps Setup Pre-Check ==="

# Check Git repository
if (-not (Test-Path ".git")) {
  Write-Host "❌ Git repository not found"
  Write-Host "   Run: @devops *environment-bootstrap"
  exit 1
}
Write-Host "✅ Git repository found"

# Check GitHub remote
$remoteUrl = git remote get-url origin 2>$null
if (-not $remoteUrl) {
  Write-Host "❌ GitHub remote not configured"
  exit 1
}
Write-Host "✅ GitHub remote: $remoteUrl"

# Check GitHub CLI auth
$ghStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ GitHub CLI not authenticated"
  Write-Host "   Run: gh auth login"
  exit 1
}
Write-Host "✅ GitHub CLI authenticated"

# Check repo exists on GitHub
gh repo view --json name 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Repository not found on GitHub"
  exit 1
}
Write-Host "✅ Repository exists on GitHub"

# Check idempotency
if (Test-Path ".aiox/devops-setup-report.yaml") {
  Write-Host "⚠️  DevOps setup already completed"
  Write-Host "   Use --force to reconfigure"
}
```

---

### Step 2: Detect Project Type

**Action:** Analyze project to determine type and customize workflows

```powershell
echo "=== Detecting Project Type ==="

$projectType = "unknown"
$detectedFeatures = @()

# Node.js detection
if (Test-Path "package.json") {
  $projectType = "node"
  $detectedFeatures += "Node.js (package.json found)"

  $pkg = Get-Content "package.json" | ConvertFrom-Json
  if ($pkg.devDependencies.typescript -or $pkg.dependencies.typescript) {
    $detectedFeatures += "TypeScript"
  }
  if ($pkg.devDependencies.jest -or $pkg.devDependencies.vitest) {
    $detectedFeatures += "Test framework (Jest/Vitest)"
  }
  if ($pkg.devDependencies.eslint) {
    $detectedFeatures += "ESLint"
  }
}

# Python detection
if (Test-Path "requirements.txt" -or Test-Path "pyproject.toml") {
  if ($projectType -eq "node") {
    $projectType = "mixed"
  } else {
    $projectType = "python"
  }
  $detectedFeatures += "Python"
}

# Go detection
if (Test-Path "go.mod") {
  if ($projectType -ne "unknown") {
    $projectType = "mixed"
  } else {
    $projectType = "go"
  }
  $detectedFeatures += "Go"
}

# Rust detection
if (Test-Path "Cargo.toml") {
  if ($projectType -ne "unknown") {
    $projectType = "mixed"
  } else {
    $projectType = "rust"
  }
  $detectedFeatures += "Rust"
}

Write-Host "Project type: $projectType"
Write-Host "Detected features:"
$detectedFeatures | ForEach-Object { Write-Host "  - $_" }
```

**Elicitation Point (if project type uncertain):**

```
Project type detection results:

Detected: node (Node.js/TypeScript project)

Features found:
  ✓ package.json
  ✓ TypeScript
  ✓ ESLint
  ✓ Jest tests

Is this correct? (Y/n): _

Or select manually:
  1. Node.js/TypeScript
  2. Python
  3. Go
  4. Rust
  5. Mixed (multiple languages)
```

---

### Step 3: Install GitHub Actions Workflows

**Action:** Copy and customize workflow templates

**Elicitation Point:**

```
╔════════════════════════════════════════════════════════════════════════╗
║              GITHUB ACTIONS WORKFLOW SELECTION                          ║
╠════════════════════════════════════════════════════════════════════════╣
║                                                                         ║
║  Available workflows for Node.js projects:                              ║
║                                                                         ║
║  [1] ci.yml           - Lint, TypeCheck, Test on PRs (RECOMMENDED)     ║
║  [2] pr-automation.yml - Quality summary, coverage report               ║
║  [3] release.yml      - Release automation on tags                      ║
║                                                                         ║
║  Select workflows to install (comma-separated, or 'all'):               ║
║  Default: 1,2 (ci + pr-automation)                                      ║
║                                                                         ║
║  Selection: _                                                           ║
║                                                                         ║
╚════════════════════════════════════════════════════════════════════════╝
```

**Workflow Installation:**

```powershell
echo "=== Installing GitHub Actions Workflows ==="

# Create .github/workflows directory
New-Item -ItemType Directory -Path ".github/workflows" -Force | Out-Null

# Copy ci.yml template with customization
$ciTemplate = Get-Content ".aiox-core/infrastructure/templates/github-workflows/ci.yml.template" -Raw

# Substitute variables based on project type
$ciWorkflow = $ciTemplate `
  -replace '\{\{NODE_VERSION\}\}', '20' `
  -replace '\{\{PROJECT_NAME\}\}', $projectName `
  -replace '\{\{LINT_COMMAND\}\}', 'npm run lint' `
  -replace '\{\{TEST_COMMAND\}\}', 'npm run test:coverage' `
  -replace '\{\{TYPECHECK_COMMAND\}\}', 'npm run typecheck'

$ciWorkflow | Out-File -FilePath ".github/workflows/ci.yml" -Encoding utf8

Write-Host "✅ Installed ci.yml"

# Copy pr-automation.yml
Copy-Item ".aiox-core/infrastructure/templates/github-workflows/pr-automation.yml.template" `
  -Destination ".github/workflows/pr-automation.yml"
Write-Host "✅ Installed pr-automation.yml"

# Copy release.yml
Copy-Item ".aiox-core/infrastructure/templates/github-workflows/release.yml.template" `
  -Destination ".github/workflows/release.yml"
Write-Host "✅ Installed release.yml"
```

---

### Step 4: Configure CodeRabbit

**Action:** Generate CodeRabbit configuration based on project structure

**Elicitation Point:**

```
╔════════════════════════════════════════════════════════════════════════╗
║              CODERABBIT CONFIGURATION                                   ║
╠════════════════════════════════════════════════════════════════════════╣
║                                                                         ║
║  CodeRabbit provides automated code review on PRs.                      ║
║                                                                         ║
║  Review profile options:                                                ║
║  [1] chill     - Minimal feedback, only critical issues                 ║
║  [2] balanced  - Moderate feedback (RECOMMENDED)                        ║
║  [3] assertive - Comprehensive feedback, strict standards               ║
║                                                                         ║
║  Select profile (1/2/3): _                                              ║
║                                                                         ║
║  ⚠️  Note: Install CodeRabbit GitHub App after setup:                   ║
║      https://github.com/apps/coderabbitai                               ║
║                                                                         ║
╚════════════════════════════════════════════════════════════════════════╝
```

**CodeRabbit Configuration:**

```powershell
echo "=== Configuring CodeRabbit ==="

# Generate .coderabbit.yaml with project-specific path instructions
$coderabbitConfig = Get-Content ".aiox-core/infrastructure/templates/coderabbit.yaml.template" -Raw

# Customize based on project structure
$pathInstructions = @()

if (Test-Path "src") {
  $pathInstructions += @"
    - path: "src/**"
      instructions: |
        Focus on code quality, performance, and security.
        Check for proper error handling and input validation.
"@
}

if (Test-Path "tests" -or Test-Path "__tests__") {
  $pathInstructions += @"
    - path: "**/*.test.*"
      instructions: |
        Ensure test coverage and edge cases.
        Verify mock implementations are correct.
"@
}

if (Test-Path "docs") {
  $pathInstructions += @"
    - path: "docs/**"
      instructions: |
        Check clarity and completeness of documentation.
"@
}

# Substitute variables
$coderabbitConfig = $coderabbitConfig `
  -replace '\{\{REVIEW_PROFILE\}\}', $reviewProfile `
  -replace '\{\{PATH_INSTRUCTIONS\}\}', ($pathInstructions -join "`n")

$coderabbitConfig | Out-File -FilePath ".coderabbit.yaml" -Encoding utf8

Write-Host "✅ Created .coderabbit.yaml"
Write-Host ""
Write-Host "📌 IMPORTANT: Install the CodeRabbit GitHub App:"
Write-Host "   https://github.com/apps/coderabbitai"
```

---

### Step 5: Configure Branch Protection

**Action:** Set up branch protection rules via GitHub API

**Elicitation Point:**

```
╔════════════════════════════════════════════════════════════════════════╗
║              BRANCH PROTECTION CONFIGURATION                            ║
╠════════════════════════════════════════════════════════════════════════╣
║                                                                         ║
║  Branch protection ensures code quality before merge.                   ║
║                                                                         ║
║  ⚠️  Note: Some features require GitHub Pro (paid) for private repos.   ║
║                                                                         ║
║  Protection rules for 'main':                                           ║
║  [1] Required status checks (lint, test, typecheck)                     ║
║  [2] Require PR reviews before merge                                    ║
║  [3] Require conversation resolution                                    ║
║  [4] Prevent force pushes                                               ║
║                                                                         ║
║  Enable branch protection? (Y/n): _                                     ║
║                                                                         ║
║  Number of required reviewers (0-6, default: 1): _                      ║
║                                                                         ║
╚════════════════════════════════════════════════════════════════════════╝
```

**Branch Protection Setup:**

```bash
echo "=== Configuring Branch Protection ==="

# Get repository info
REPO_INFO=$(gh repo view --json owner,name)
OWNER=$(echo $REPO_INFO | jq -r '.owner.login')
REPO=$(echo $REPO_INFO | jq -r '.name')

# Configure branch protection for main
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/$OWNER/$REPO/branches/main/protection \
  -f "required_status_checks[strict]=true" \
  -f "required_status_checks[contexts][]=lint" \
  -f "required_status_checks[contexts][]=typecheck" \
  -f "required_status_checks[contexts][]=test" \
  -f "enforce_admins=false" \
  -f "required_pull_request_reviews[required_approving_review_count]=1" \
  -f "required_pull_request_reviews[dismiss_stale_reviews]=true" \
  -f "restrictions=null" \
  -f "allow_force_pushes=false" \
  -f "allow_deletions=false"

if [ $? -eq 0 ]; then
  echo "✅ Branch protection enabled for 'main'"
else
  echo "⚠️  Branch protection setup failed"
  echo "   This may be due to GitHub free tier limitations for private repos"
  echo "   Manual setup: Settings → Branches → Add branch protection rule"
fi
```

---

### Step 6: Secrets Wizard

**Action:** Interactive wizard to configure repository secrets

**Elicitation Point:**

```
╔════════════════════════════════════════════════════════════════════════╗
║              SECRETS CONFIGURATION WIZARD                               ║
╠════════════════════════════════════════════════════════════════════════╣
║                                                                         ║
║  Repository secrets are encrypted values used by GitHub Actions.        ║
║                                                                         ║
║  Common secrets for your project type:                                  ║
║                                                                         ║
║  [1] CODECOV_TOKEN        - Coverage reporting (optional)               ║
║  [2] NPM_TOKEN            - NPM publishing (if library)                 ║
║  [3] VERCEL_TOKEN         - Vercel deployment (if frontend)             ║
║  [4] RAILWAY_TOKEN        - Railway deployment (if backend)             ║
║  [5] SUPABASE_URL         - Supabase connection (if using)              ║
║  [6] SUPABASE_ANON_KEY    - Supabase anonymous key                      ║
║  [7] SUPABASE_SERVICE_KEY - Supabase service key (for CI)               ║
║                                                                         ║
║  Select secrets to configure (comma-separated, or 'skip'): _            ║
║                                                                         ║
╚════════════════════════════════════════════════════════════════════════╝
```

**Secrets Configuration:**

```powershell
echo "=== Configuring Secrets ==="

$secretsConfigured = @()

# Configure selected secrets
foreach ($secret in $selectedSecrets) {
  Write-Host ""
  Write-Host "Configuring $secret..."

  # Prompt for value (masked input)
  $value = Read-Host -AsSecureString "Enter value for $secret"
  $plainValue = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($value)
  )

  # Set secret via gh cli
  echo $plainValue | gh secret set $secret

  if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ $secret configured"
    $secretsConfigured += $secret
  } else {
    Write-Host "❌ Failed to set $secret"
  }
}

Write-Host ""
Write-Host "Secrets configured: $($secretsConfigured.Count)"
```

---

### Step 7: Generate Setup Report

**Action:** Create comprehensive setup report

```powershell
echo "=== Generating DevOps Setup Report ==="

$report = @"
# AIOX DevOps Setup Report
# Generated: $(Get-Date -Format "yyyy-MM-ddTHH:mm:ss")

setup:
  completed: true
  date: "$(Get-Date -Format "yyyy-MM-ddTHH:mm:ss")"
  project_type: $projectType
  story_id: "5.10"

repository:
  url: $remoteUrl
  owner: $repoOwner
  name: $repoName

workflows_installed:
  - ci.yml
  - pr-automation.yml
  - release.yml

coderabbit:
  configured: true
  profile: $reviewProfile
  config_file: ".coderabbit.yaml"
  github_app_url: "https://github.com/apps/coderabbitai"

branch_protection:
  enabled: $branchProtectionEnabled
  branch: "main"
  required_checks:
    - lint
    - typecheck
    - test
  required_reviewers: $requiredReviewers

secrets_configured:
$(($secretsConfigured | ForEach-Object { "  - $_" }) -join "`n")

next_steps:
  - "Install CodeRabbit GitHub App: https://github.com/apps/coderabbitai"
  - "Create first PR to test CI/CD"
  - "Configure additional secrets as needed"
  - "Review branch protection settings: Settings → Branches"

validation_checklist:
  - "[x] GitHub Actions workflows installed"
  - "[$(if($coderabbitConfigured){'x'}else{' '})] CodeRabbit configured"
  - "[$(if($branchProtectionEnabled){'x'}else{' '})] Branch protection enabled"
  - "[$(if($secretsConfigured.Count -gt 0){'x'}else{' '})] Repository secrets configured"
"@

# Ensure .aiox directory exists
New-Item -ItemType Directory -Path ".aiox" -Force | Out-Null

$report | Out-File -FilePath ".aiox/devops-setup-report.yaml" -Encoding utf8

Write-Host "✅ Setup report saved to .aiox/devops-setup-report.yaml"
```

---

### Step 8: Final Summary

**Action:** Display completion summary and next steps

```
╔═══════════════════════════════════════════════════════════════════════════╗
║              ✅ GITHUB DEVOPS SETUP COMPLETE                              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  Repository: https://github.com/username/my-project                        ║
║  Project Type: node (Node.js/TypeScript)                                   ║
║                                                                            ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Configuration Summary                                                     ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  GitHub Actions:                                                           ║
║    ✅ ci.yml - Lint, TypeCheck, Test                                      ║
║    ✅ pr-automation.yml - Quality summary, coverage                        ║
║    ✅ release.yml - Release automation                                     ║
║                                                                            ║
║  CodeRabbit:                                                               ║
║    ✅ .coderabbit.yaml created (profile: balanced)                        ║
║    ⚠️  Install GitHub App: https://github.com/apps/coderabbitai            ║
║                                                                            ║
║  Branch Protection (main):                                                 ║
║    ✅ Required status checks: lint, typecheck, test                        ║
║    ✅ Require 1 PR review                                                  ║
║    ✅ Prevent force pushes                                                 ║
║                                                                            ║
║  Secrets Configured:                                                       ║
║    ✅ CODECOV_TOKEN                                                        ║
║    ⏭️  Others skipped (configure later via Settings → Secrets)             ║
║                                                                            ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  NEXT STEPS                                                                ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  1. Install CodeRabbit GitHub App (required for code review):              ║
║     https://github.com/apps/coderabbitai                                   ║
║                                                                            ║
║  2. Create your first PR to test the CI/CD pipeline:                       ║
║     git checkout -b feature/test-ci                                        ║
║     git commit --allow-empty -m "chore: test CI pipeline"                  ║
║     git push -u origin feature/test-ci                                     ║
║     gh pr create --title "Test CI Pipeline" --body "Testing CI setup"      ║
║                                                                            ║
║  3. Commit the DevOps configuration:                                       ║
║     git add .github/ .coderabbit.yaml .aiox/                              ║
║     git commit -m "chore: add DevOps configuration [Story 5.10]"          ║
║     git push                                                               ║
║                                                                            ║
║  Report saved: .aiox/devops-setup-report.yaml                             ║
║                                                                            ║
╚═══════════════════════════════════════════════════════════════════════════╝

— Gage, DevOps configured with confidence 🚀
```

---

## Validation Checklist

- [ ] Pre-conditions verified (git, remote, gh auth)
- [ ] Project type detected
- [ ] GitHub Actions workflows installed
- [ ] CodeRabbit configuration created
- [ ] Branch protection configured (if supported)
- [ ] Secrets configured (if selected)
- [ ] Setup report generated
- [ ] Next steps presented to user

---

## Troubleshooting

### Issue 1: Branch protection API returns 403

**Error:** `Resource not accessible by personal access token`

**Fix:**
1. For private repos on free tier, branch protection requires GitHub Pro
2. Re-authenticate with correct scopes: `gh auth login --scopes repo,admin:repo_hook`
3. Manual setup via GitHub UI: Settings → Branches

### Issue 2: Workflow validation fails

**Error:** `Invalid workflow file`

**Fix:**
1. Validate YAML syntax: `yamllint .github/workflows/ci.yml`
2. Check for tab characters (use spaces only)
3. Verify action versions are valid

### Issue 3: CodeRabbit not reviewing PRs

**Fix:**
1. Verify GitHub App is installed: https://github.com/apps/coderabbitai
2. Check app has access to the repository
3. Verify .coderabbit.yaml is in the default branch

---

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Branch Protection API](https://docs.github.com/en/rest/branches/branch-protection)
- [CodeRabbit Documentation](https://docs.coderabbit.ai/)
- [Story 5.10 - GitHub DevOps Setup](docs/stories/v4.0.4/sprint-5/story-5.10-github-devops-user-projects.md)

---

**Status:** ✅ Production Ready
**Tested On:** Windows 11, macOS Sonoma, Ubuntu 22.04
