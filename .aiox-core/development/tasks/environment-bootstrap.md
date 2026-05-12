# environment-bootstrap

**Task ID:** environment-bootstrap
**Version:** 1.1.0
**Created:** 2025-12-02
**Updated:** 2025-12-02
**Agent:** @devops (Gage)

---

## Purpose

Complete environment bootstrap for new AIOX projects. Verifies and installs all required CLIs, authenticates services, initializes Git/GitHub repository, and validates the development environment before starting the greenfield workflow.

**This task should be the FIRST step in any new project**, executed BEFORE the PRD creation.

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)

- Autonomous decision making with logging
- Skips optional tools, installs only essential
- **Best for:** Experienced developers, quick setup

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**

- Explicit decision checkpoints
- Educational explanations for each tool
- **Best for:** Learning, first-time setup, team onboarding

### 3. Pre-Flight Planning - Comprehensive Upfront Planning

- Full analysis phase before any installation
- Zero ambiguity execution
- **Best for:** Enterprise environments, strict policies

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: environmentBootstrap()
responsável: Gage (Operator)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: project_name
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Valid project name (lowercase, hyphens allowed)

- campo: project_path
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Valid directory path (defaults to current directory)

- campo: github_org
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Valid GitHub organization or username

- campo: options
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Bootstrap options (skip_optional, force_reinstall, etc.)

**Saída:**
- campo: environment_report
  tipo: object
  destino: File system (.aiox/environment-report.yaml)
  persistido: true

- campo: git_initialized
  tipo: boolean
  destino: Return value
  persistido: false

- campo: github_repo_url
  tipo: string
  destino: Return value
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Operating system is Windows, macOS, or Linux
    tipo: pre-condition
    blocker: true
    validação: |
      Detect OS via process.platform or uname
    error_message: "Unsupported operating system"

  - [ ] User has admin/sudo privileges for installations
    tipo: pre-condition
    blocker: false
    validação: |
      Check if user can run elevated commands
    error_message: "Some installations may require elevated privileges"

  - [ ] Internet connection available
    tipo: pre-condition
    blocker: true
    validação: |
      Ping github.com or check connectivity
    error_message: "Internet connection required for tool installation and authentication"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] All essential CLIs installed and accessible in PATH
    tipo: post-condition
    blocker: true
    validação: |
      Verify git, gh, node commands are executable
    error_message: "Essential CLI installation failed"

  - [ ] Git repository initialized with .gitignore
    tipo: post-condition
    blocker: true
    validação: |
      Check .git directory exists and .gitignore is configured
    error_message: "Git initialization failed"

  - [ ] Environment report generated
    tipo: post-condition
    blocker: false
    validação: |
      Check .aiox/environment-report.yaml exists
    error_message: "Environment report not generated"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Essential CLIs (git, gh, node) are installed and working
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert all essential CLI commands return valid version output
    error_message: "Essential CLI verification failed"

  - [ ] GitHub CLI is authenticated
    tipo: acceptance-criterion
    blocker: true
    validação: |
      gh auth status returns authenticated
    error_message: "GitHub CLI not authenticated"

  - [ ] Git repository created locally and on GitHub
    tipo: acceptance-criterion
    blocker: true
    validação: |
      .git exists and gh repo view succeeds
    error_message: "Repository not properly initialized"

  - [ ] Project structure follows AIOX conventions
    tipo: acceptance-criterion
    blocker: false
    validação: |
      Check docs/, .aiox/, and package.json exist
    error_message: "Project structure incomplete"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** os-detector
  - **Purpose:** Detect operating system and package manager
  - **Source:** Built-in (process.platform, uname)

- **Tool:** cli-checker
  - **Purpose:** Verify CLI installations and versions
  - **Source:** .aiox-core/infrastructure/scripts/cli-checker.js

- **Tool:** github-cli
  - **Purpose:** Repository creation and authentication
  - **Source:** .aiox-core/infrastructure/tools/cli/github-cli.yaml

---

## Error Handling

**Strategy:** retry-with-alternatives

**Common Errors:**

1. **Error:** CLI Installation Failed
   - **Cause:** Package manager unavailable or network issues
   - **Resolution:** Try alternative package manager or manual install
   - **Recovery:** Provide manual installation instructions

2. **Error:** GitHub Authentication Failed
   - **Cause:** Token expired or user cancelled
   - **Resolution:** Re-run gh auth login
   - **Recovery:** Offer to skip GitHub setup and continue locally

3. **Error:** Permission Denied
   - **Cause:** Insufficient privileges for installation
   - **Resolution:** Run with elevated privileges or use user-scoped install
   - **Recovery:** Document required permissions for manual fix

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-15 min (depending on installations needed)
cost_estimated: $0.00 (no AI tokens, CLI operations only)
token_usage: ~500-1,000 tokens (for guidance only)
```

**Optimization Notes:**

- Parallel CLI checks to reduce total time
- Cache detection results in .aiox/environment-report.yaml
- Skip already-installed tools

---

## Metadata

```yaml
story: N/A (Framework enhancement)
version: 1.1.0
dependencies:
  - github-cli.yaml
  - supabase-cli.yaml
  - railway-cli.yaml
  - coderabbit
tags:
  - bootstrap
  - environment
  - setup
  - greenfield
updated_at: 2025-12-02
changelog:
  1.1.0:
    - Fixed: Git workflow - commit before gh repo create --push
    - Fixed: PowerShell vs bash syntax separation
    - Added: CLI update detection and offer for outdated tools
    - Added: Enhanced CodeRabbit CLI verification with WSL support
    - Improved: Clear separation of Windows/Unix commands
```

---

## Elicitation

```yaml
elicit: true
interaction_points:
  - project_name: 'What is the project name?'
  - github_org: 'GitHub organization or username for repository?'
  - optional_tools: 'Which optional tools do you want to install?'
  - git_provider: 'Git provider preference (GitHub/GitLab/Bitbucket)?'
```

---

## Process

### Step 1: Detect Operating System

**Action:** Identify OS and available package managers

**IMPORTANT:** The agent executing this task should detect the OS using native commands appropriate for the current shell. Do NOT mix PowerShell and bash syntax.

**For Windows (PowerShell):**

```powershell
# Windows PowerShell detection - use in PowerShell context only
Write-Host "Detecting operating system..."
Write-Host "OS: Windows"
Write-Host "Architecture: $([System.Environment]::Is64BitOperatingSystem ? '64-bit' : '32-bit')"

# Check package managers
$pkgMgrs = @()
if (Get-Command winget -ErrorAction SilentlyContinue) { $pkgMgrs += "winget" }
if (Get-Command choco -ErrorAction SilentlyContinue) { $pkgMgrs += "chocolatey" }
if (Get-Command scoop -ErrorAction SilentlyContinue) { $pkgMgrs += "scoop" }
Write-Host "Package managers: $($pkgMgrs -join ', ')"
```

**For macOS/Linux (bash):**

```bash
# Unix bash detection - use in bash/zsh context only
echo "Detecting operating system..."
OS=$(uname -s)
ARCH=$(uname -m)

echo "OS: $OS"
echo "Architecture: $ARCH"

# Check available package managers
if [ "$OS" = "Darwin" ]; then
  command -v brew >/dev/null 2>&1 && echo "Package manager: Homebrew"
elif [ "$OS" = "Linux" ]; then
  command -v apt >/dev/null 2>&1 && echo "Package manager: apt"
  command -v dnf >/dev/null 2>&1 && echo "Package manager: dnf"
  command -v pacman >/dev/null 2>&1 && echo "Package manager: pacman"
fi
```

**Agent Guidance:**

- On Windows: Use PowerShell commands directly (no bash wrapper needed)
- On macOS/Linux: Use bash commands directly
- NEVER mix syntax (e.g., don't use `${}` bash variables in PowerShell context)
- Simple version checks work cross-platform: `git --version`, `node --version`, etc.

**Output:** Store OS info for subsequent steps

---

### Step 2: CLI Tools Audit

**Action:** Check all required and optional CLIs

Present comprehensive status table:

```
╔════════════════════════════════════════════════════════════════════════╗
║                     AIOX ENVIRONMENT AUDIT                              ║
╠════════════════════════════════════════════════════════════════════════╣
║ Category      │ Tool          │ Status    │ Version    │ Required     ║
╠═══════════════╪═══════════════╪═══════════╪════════════╪══════════════╣
║ ESSENTIAL     │ git           │ ✅ OK     │ 2.43.0     │ YES          ║
║               │ gh (GitHub)   │ ❌ MISSING│ -          │ YES          ║
║               │ node          │ ✅ OK     │ 20.10.0    │ YES          ║
║               │ npm           │ ✅ OK     │ 10.2.4     │ YES          ║
╠═══════════════╪═══════════════╪═══════════╪════════════╪══════════════╣
║ INFRASTRUCTURE│ supabase      │ ❌ MISSING│ -          │ RECOMMENDED  ║
║               │ railway       │ ❌ MISSING│ -          │ OPTIONAL     ║
║               │ docker        │ ✅ OK     │ 24.0.7     │ RECOMMENDED  ║
╠═══════════════╪═══════════════╪═══════════╪════════════╪══════════════╣
║ QUALITY       │ coderabbit    │ ⚠️ CHECK  │ 0.8.0      │ RECOMMENDED  ║
║               │               │ (WSL/Win) │            │              ║
╠═══════════════╪═══════════════╪═══════════╪════════════╪══════════════╣
║ OPTIONAL      │ pnpm          │ ❌ MISSING│ -          │ OPTIONAL     ║
║               │ bun           │ ❌ MISSING│ -          │ OPTIONAL     ║
╚════════════════════════════════════════════════════════════════════════╝

Summary: 4/10 tools installed | 2 essential missing | 4 recommended missing
```

**Update Detection:**

When a tool is installed but outdated, display additional information:

```
║  ⚠️ UPDATES AVAILABLE                                                        ║
╠═══════════════╪═══════════════╪═══════════════╪═══════════════╪══════════════╣
║ Tool          │ Current       │ Latest        │ Update Command                ║
╠═══════════════╪═══════════════╪═══════════════╪═══════════════════════════════╣
║ supabase      │ 2.24.3        │ 2.62.10       │ npm update -g supabase        ║
║ gh            │ 2.40.0        │ 2.63.0        │ winget upgrade GitHub.cli     ║
╚═══════════════════════════════════════════════════════════════════════════════╝

Would you like to update outdated tools? (Y/n): _
```

**Update Check Commands:**

```yaml
update_checks:
  supabase:
    check_latest: 'npm view supabase version'
    update:
      npm: 'npm update -g supabase'
      scoop: 'scoop update supabase'
      brew: 'brew upgrade supabase'

  gh:
    check_latest: 'gh api repos/cli/cli/releases/latest --jq .tag_name'
    update:
      windows: 'winget upgrade GitHub.cli'
      macos: 'brew upgrade gh'
      linux: 'gh upgrade'

  node:
    note: 'Consider using nvm/fnm for Node.js version management'
    check_latest: 'npm view node version'

  railway:
    check_latest: 'npm view @railway/cli version'
    update:
      npm: 'npm update -g @railway/cli'
```

**CLI Check Commands:**

```yaml
cli_checks:
  essential:
    git:
      check: 'git --version'
      expected: 'git version 2.x'
      install:
        windows: 'winget install --id Git.Git'
        macos: 'xcode-select --install'
        linux: 'sudo apt install git'

    gh:
      check: 'gh --version'
      expected: 'gh version 2.x'
      install:
        windows: 'winget install --id GitHub.cli'
        macos: 'brew install gh'
        linux: 'sudo apt install gh'
      post_install: 'gh auth login'

    node:
      check: 'node --version'
      expected: 'v18.x or v20.x'
      install:
        windows: 'winget install --id OpenJS.NodeJS.LTS'
        macos: 'brew install node@20'
        linux: 'curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install nodejs'

    npm:
      check: 'npm --version'
      expected: '10.x'
      note: 'Installed with Node.js'

  infrastructure:
    supabase:
      check: 'supabase --version'
      expected: '1.x'
      install:
        npm: 'npm install -g supabase'
        scoop: 'scoop bucket add supabase https://github.com/supabase/scoop-bucket.git && scoop install supabase'
        brew: 'brew install supabase/tap/supabase'
      post_install: 'supabase login'

    railway:
      check: 'railway --version'
      expected: '3.x'
      install:
        npm: 'npm install -g @railway/cli'
        brew: 'brew install railway'
      post_install: 'railway login'

    docker:
      check: 'docker --version'
      expected: '24.x or 25.x'
      install:
        windows: 'winget install --id Docker.DockerDesktop'
        macos: 'brew install --cask docker'
        linux: 'See https://docs.docker.com/engine/install/'
      note: 'Required for local Supabase development'

  quality:
    coderabbit:
      check_windows: |
        # Windows: CodeRabbit CLI is installed in WSL, not native Windows
        # First check if WSL is available
        wsl --version
        if ($LASTEXITCODE -eq 0) {
          # Then check CodeRabbit in WSL
          wsl bash -c 'if [ -f ~/.local/bin/coderabbit ]; then ~/.local/bin/coderabbit --version; else echo "NOT_INSTALLED"; fi'
        } else {
          Write-Host "WSL not available - CodeRabbit requires WSL on Windows"
        }
      check_unix: |
        # macOS/Linux: Check direct installation
        if command -v coderabbit >/dev/null 2>&1; then
          coderabbit --version
        elif [ -f ~/.local/bin/coderabbit ]; then
          ~/.local/bin/coderabbit --version
        else
          echo "NOT_INSTALLED"
        fi
      expected: '0.8.x or higher'
      install:
        windows_wsl: |
          # 1. Ensure WSL is installed: wsl --install
          # 2. In WSL terminal:
          curl -fsSL https://coderabbit.ai/install.sh | bash
          # 3. Authenticate:
          ~/.local/bin/coderabbit auth login
        macos: 'curl -fsSL https://coderabbit.ai/install.sh | bash'
        linux: 'curl -fsSL https://coderabbit.ai/install.sh | bash'
      note: |
        WINDOWS USERS: CodeRabbit CLI runs in WSL, not native Windows.
        - Requires WSL with Ubuntu/Debian distribution
        - Binary located at ~/.local/bin/coderabbit (inside WSL)
        - All coderabbit commands must use: wsl bash -c 'command'
        - See: docs/guides/coderabbit/README.md for full setup guide
      verification:
        windows: "wsl bash -c '~/.local/bin/coderabbit --version'"
        unix: 'coderabbit --version'

  optional:
    pnpm:
      check: 'pnpm --version'
      expected: '8.x'
      install:
        npm: 'npm install -g pnpm'
      note: 'Faster alternative to npm'

    bun:
      check: 'bun --version'
      expected: '1.x'
      install:
        windows: 'powershell -c "irm bun.sh/install.ps1 | iex"'
        unix: 'curl -fsSL https://bun.sh/install | bash'
      note: 'Ultra-fast JavaScript runtime'
```

---

### Step 3: Interactive Installation

**Action:** Offer to install missing tools

**Elicitation Point:**

```
Missing tools detected. How would you like to proceed?

1. INSTALL ALL - Install all missing essential + recommended tools
2. ESSENTIAL ONLY - Install only essential tools (git, gh, node)
3. CUSTOM - Choose which tools to install
4. SKIP - Continue without installing (not recommended)

Select option (1/2/3/4): _
```

**If CUSTOM selected:**

```
Select tools to install (comma-separated numbers):

ESSENTIAL (required for AIOX):
  [1] gh (GitHub CLI) - Repository management, PR creation

INFRASTRUCTURE (recommended):
  [2] supabase - Database management, local development
  [3] railway - Cloud deployment
  [4] docker - Containerization, local Supabase

QUALITY (recommended):
  [5] coderabbit - Pre-PR code review (WSL required on Windows)

OPTIONAL:
  [6] pnpm - Fast package manager
  [7] bun - Ultra-fast JavaScript runtime

Enter selection (e.g., 1,2,3,5): _
```

**Installation Execution:**

```bash
# Example: Installing GitHub CLI on Windows
echo "Installing GitHub CLI..."
winget install --id GitHub.cli --accept-source-agreements --accept-package-agreements

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ GitHub CLI installed successfully"

  # Refresh PATH
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

  # Verify installation
  gh --version
} else {
  Write-Host "❌ Installation failed. Manual installation required."
  Write-Host "   Download: https://cli.github.com/"
}
```

---

### Step 4: Service Authentication

**Action:** Authenticate required services

**Elicitation Point:**

```
Service authentication required. The following services need login:

1. GitHub CLI (gh) - Required for repository creation
2. Supabase CLI - Required for database management
3. Railway CLI - Required for deployment

Authenticate now? (Y/n): _
```

**GitHub Authentication:**

```bash
echo "=== GitHub CLI Authentication ==="
echo ""

# Check current auth status
$authStatus = gh auth status 2>&1

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Already authenticated to GitHub"
  gh auth status
} else {
  Write-Host "Starting GitHub authentication..."
  Write-Host ""
  Write-Host "Options:"
  Write-Host "  1. Login with browser (recommended)"
  Write-Host "  2. Login with token"
  Write-Host ""

  gh auth login

  if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GitHub authentication successful"
  } else {
    Write-Host "❌ GitHub authentication failed"
    Write-Host "   Try again: gh auth login"
  }
}
```

**Supabase Authentication:**

```bash
echo "=== Supabase CLI Authentication ==="

# Check if already logged in
$supabaseStatus = supabase projects list 2>&1

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Already authenticated to Supabase"
} else {
  Write-Host "Starting Supabase authentication..."
  supabase login

  if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Supabase authentication successful"
  }
}
```

**Railway Authentication:**

```bash
echo "=== Railway CLI Authentication ==="

$railwayStatus = railway whoami 2>&1

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Already authenticated to Railway"
  railway whoami
} else {
  Write-Host "Starting Railway authentication..."
  railway login
}
```

---

### Step 5: Git Repository Initialization

**Action:** Initialize local Git repository and create GitHub remote

**Elicitation Point:**

```
Git Repository Setup

Project name: my-awesome-project

Options:
1. Create NEW repository on GitHub (recommended for greenfield)
2. Link to EXISTING GitHub repository
3. LOCAL ONLY - Initialize git without GitHub
4. SKIP - No git initialization

Select option (1/2/3/4): _
```

**If NEW repository:**

```
GitHub Repository Configuration:

Repository name: my-awesome-project
Visibility:
  1. Public
  2. Private (recommended)

GitHub Organization/Username:
  Found organizations: SynkraAI
  Or use personal account: your-username

Select owner: _

Description (optional): _
```

**Repository Creation:**

```bash
echo "=== Creating Git Repository ==="

# Initialize local git
git init

# Create .gitignore
@"
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.next/
out/

# Environment files
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# AIOX generated files
.aiox/project-status.yaml
.aiox/environment-report.yaml

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
*.tmp
"@ | Out-File -FilePath .gitignore -Encoding utf8

# Create initial README
@"
# $PROJECT_NAME

> Created with Synkra AIOX

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Documentation

- [PRD](docs/prd.md)
- [Architecture](docs/architecture.md)

---
*Generated by AIOX Environment Bootstrap*
"@ | Out-File -FilePath README.md -Encoding utf8

# CRITICAL: Create initial commit BEFORE gh repo create --push
# The --push flag requires at least one commit to exist
git add .
git commit -m "chore: initial project setup

- Initialize Synkra AIOX project structure
- Add .gitignore with standard exclusions
- Add README.md with project placeholder

🤖 Generated by AIOX Environment Bootstrap"

if ($LASTEXITCODE -ne 0) {
  Write-Host "⚠️ Initial commit failed. Checking if already committed..."
  $hasCommits = git rev-parse HEAD 2>$null
  if (-not $hasCommits) {
    Write-Host "❌ Cannot proceed without initial commit"
    exit 1
  }
}

# Now create GitHub repository with --push (requires existing commits)
gh repo create $PROJECT_NAME --private --description "$DESCRIPTION" --source . --remote origin --push

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Repository created and pushed to GitHub"
  gh repo view --web
} else {
  Write-Host "❌ GitHub repository creation failed"
  Write-Host "   Trying alternative approach..."

  # Alternative: Create repo without push, then push manually
  gh repo create $PROJECT_NAME --private --description "$DESCRIPTION" --source . --remote origin
  if ($LASTEXITCODE -eq 0) {
    git push -u origin main
    Write-Host "✅ Repository created and pushed (alternative method)"
  } else {
    Write-Host "❌ Please create repository manually: gh repo create"
  }
}
```

---

### Step 6: Project Structure Scaffold

**Action:** Create AIOX-compliant project structure

```bash
echo "=== Creating Project Structure ==="

# Create directory structure
$directories = @(
  "docs",
  "docs/stories",
  "docs/architecture",
  "docs/guides",
  ".aiox",
  "src",
  "tests"
)

foreach ($dir in $directories) {
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
  Write-Host "  Created: $dir/"
}

# Create .aiox/config.yaml
@"
# AIOX Project Configuration
version: 2.1.0
project:
  name: $PROJECT_NAME
  type: greenfield
  created: $(Get-Date -Format "yyyy-MM-dd")

environment:
  bootstrapped: true
  bootstrap_date: $(Get-Date -Format "yyyy-MM-ddTHH:mm:ss")

workflow:
  current: greenfield-fullstack
  phase: 0-bootstrap-complete

permissions:
  mode: ask  # Permission mode: explore (read-only), ask (confirm changes), auto (full autonomy)

settings:
  auto_update_status: true
  quality_gates_enabled: true
"@ | Out-File -FilePath ".aiox/config.yaml" -Encoding utf8

# Create package.json if not exists
if (-not (Test-Path "package.json")) {
@"
{
  "name": "$PROJECT_NAME",
  "version": "0.1.0",
  "description": "Created with Synkra AIOX",
  "scripts": {
    "dev": "echo 'Add your dev script'",
    "build": "echo 'Add your build script'",
    "test": "echo 'Add your test script'",
    "lint": "echo 'Add your lint script'",
    "typecheck": "echo 'Add your typecheck script'"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
"@ | Out-File -FilePath "package.json" -Encoding utf8
}

Write-Host "✅ Project structure created"
```

---

### Step 6.1: User Profile Selection (Story 12.1)

**Action:** Ask user for their profile preference and persist to `~/.aiox/user-config.yaml`

**Elicitation Point (PRD §2.4):**

```
🤖 Bem-vindo ao AIOX!

Quando uma IA gera código para você, qual opção te descreve melhor?

[1] 🟢 Modo Assistido (Recomendado)
    → "Não sei avaliar se o código está certo ou errado"

[2] 🔵 Modo Avançado
    → "Consigo identificar quando algo está errado e corrigir"

Escolha [1/2]:
```

**YOLO Mode Behavior:** Auto-select `advanced` (developer running in autonomous mode is advanced by definition)

**Profile Mapping:**
- Option 1 (Modo Assistido) → `user_profile: "bob"`
- Option 2 (Modo Avançado) → `user_profile: "advanced"`

**Persistence:**

```bash
# Create ~/.aiox/ with secure permissions
mkdir -p ~/.aiox
chmod 700 ~/.aiox

# Write user-config.yaml with selected profile
cat > ~/.aiox/user-config.yaml << EOF
# AIOX User Preferences (global, cross-project)
# Created by environment-bootstrap
# Change with: *toggle-profile
user_profile: "${SELECTED_PROFILE}"
default_language: "pt-BR"
EOF
```

**Programmatic (Node.js):**

```javascript
const { setUserConfigValue, ensureUserConfigDir } = require('.aiox-core/core/config/config-resolver');

// Ensure directory exists with permissions 700
ensureUserConfigDir();

// Write user profile
setUserConfigValue('user_profile', selectedProfile); // 'bob' or 'advanced'
setUserConfigValue('default_language', 'pt-BR');
```

**Validation:**
- Profile must be either `bob` or `advanced`
- `~/.aiox/` directory must have permissions 700
- `~/.aiox/user-config.yaml` must be valid YAML after write

---

### Step 6.5: Docker MCP Setup (Optional but Recommended)

**Condition:** Docker Desktop 4.50+ is installed AND Docker MCP Toolkit is available

**Action:** Configure Docker MCP Toolkit with HTTP transport for Claude Code integration

**Elicitation Point:**

```
╔════════════════════════════════════════════════════════════════════════╗
║                     DOCKER MCP SETUP                                    ║
╠════════════════════════════════════════════════════════════════════════╣
║                                                                         ║
║  Docker Desktop detected with MCP Toolkit!                              ║
║                                                                         ║
║  Configure MCP servers for Claude Code?                                 ║
║                                                                         ║
║  1. MINIMAL - context7 + desktop-commander + playwright (no API keys)   ║
║  2. FULL - minimal + exa (requires EXA_API_KEY)                         ║
║  3. SKIP - Configure later with *setup-mcp-docker                       ║
║                                                                         ║
║  Select option (1/2/3): _                                               ║
║                                                                         ║
╚════════════════════════════════════════════════════════════════════════╝
```

**YOLO Mode Behavior:** Auto-select MINIMAL (no API keys required)

**If MINIMAL or FULL selected:**

**Step 6.5.1: Start Gateway Service**

```powershell
# Windows
Write-Host "Starting MCP Gateway service..."

# Create gateway service file if not exists
if (-not (Test-Path ".docker/mcp/gateway-service.yml")) {
  # Copy from template or create
  New-Item -ItemType Directory -Path ".docker/mcp" -Force | Out-Null
  # Gateway service will be started by Docker Compose
}

# Start gateway as persistent service
docker compose -f .docker/mcp/gateway-service.yml up -d

# Wait for gateway to be healthy
$maxRetries = 12
$retryCount = 0
do {
  Start-Sleep -Seconds 5
  $health = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -ErrorAction SilentlyContinue
  $retryCount++
} while ($health.StatusCode -ne 200 -and $retryCount -lt $maxRetries)

if ($health.StatusCode -eq 200) {
  Write-Host "✅ MCP Gateway is healthy"
} else {
  Write-Host "⚠️ MCP Gateway health check failed - continuing anyway"
}
```

**Step 6.5.2: Enable Default MCPs**

```powershell
# Enable minimal preset MCPs (no API keys required)
Write-Host "Enabling MCP servers..."

docker mcp server enable context7
docker mcp server enable desktop-commander
docker mcp server enable playwright

# If FULL preset selected and EXA_API_KEY exists
if ($PRESET -eq "FULL" -and $env:EXA_API_KEY) {
  docker mcp server enable exa
  Write-Host "✅ Exa MCP enabled (web search)"
}

# Configure desktop-commander with user home path
$userHome = $env:USERPROFILE
docker mcp config write "desktop-commander:`n  paths:`n    - $userHome"

Write-Host "✅ MCP servers enabled"
docker mcp server ls
```

**Step 6.5.3: Configure Claude Code (HTTP Transport)**

```powershell
Write-Host "Configuring Claude Code for MCP Gateway..."

$claudeConfigPath = Join-Path $env:USERPROFILE ".claude.json"

if (Test-Path $claudeConfigPath) {
  # Read existing config
  $claudeConfig = Get-Content $claudeConfigPath | ConvertFrom-Json

  # Add or update docker-gateway with HTTP transport
  if (-not $claudeConfig.mcpServers) {
    $claudeConfig | Add-Member -NotePropertyName "mcpServers" -NotePropertyValue @{} -Force
  }

  $claudeConfig.mcpServers.'docker-gateway' = @{
    type = "http"
    url = "http://localhost:8080/mcp"
  }

  # Save config
  $claudeConfig | ConvertTo-Json -Depth 10 | Set-Content $claudeConfigPath -Encoding UTF8
  Write-Host "✅ Claude Code configured with HTTP transport"
} else {
  Write-Host "⚠️ ~/.claude.json not found - please configure manually"
  Write-Host "   Add to mcpServers: { 'docker-gateway': { 'type': 'http', 'url': 'http://localhost:8080/mcp' } }"
}
```

**Step 6.5.4: Verify MCP Setup**

```powershell
Write-Host "Verifying MCP setup..."

# Check gateway health
$health = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -ErrorAction SilentlyContinue
if ($health.StatusCode -eq 200) {
  Write-Host "✅ Gateway: Healthy"
} else {
  Write-Host "❌ Gateway: Not responding"
}

# Check enabled servers
$servers = docker mcp server ls
Write-Host "✅ Enabled servers: $servers"

# Summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host "  MCP SETUP COMPLETE"
Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host "  Gateway: http://localhost:8080 (HTTP/SSE)"
Write-Host "  MCPs: context7, desktop-commander, playwright"
Write-Host "  Claude Config: ~/.claude.json (HTTP transport)"
Write-Host ""
Write-Host "  ⚠️ IMPORTANT: Restart Claude Code to connect to MCP Gateway"
Write-Host "═══════════════════════════════════════════════════════════════"
```

**Skip Conditions:**

- Docker not installed or not running
- Docker MCP Toolkit not available
- User selected SKIP option

**Output:** MCP setup status added to environment report

---

### Step 7: Environment Report Generation

**Action:** Generate comprehensive environment report

```bash
echo "=== Generating Environment Report ==="

# Collect all environment information
$report = @{
  generated_at = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
  project_name = $PROJECT_NAME

  system = @{
    os = [System.Environment]::OSVersion.VersionString
    architecture = if ([System.Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
    user = $env:USERNAME
    hostname = $env:COMPUTERNAME
  }

  cli_tools = @{
    git = @{
      installed = $true
      version = (git --version) -replace "git version ", ""
      path = (Get-Command git).Source
    }
    gh = @{
      installed = (Get-Command gh -ErrorAction SilentlyContinue) -ne $null
      version = if (Get-Command gh -ErrorAction SilentlyContinue) { (gh --version | Select-Object -First 1) -replace "gh version ", "" } else { $null }
      authenticated = (gh auth status 2>&1) -match "Logged in"
    }
    node = @{
      installed = (Get-Command node -ErrorAction SilentlyContinue) -ne $null
      version = if (Get-Command node -ErrorAction SilentlyContinue) { (node --version) -replace "v", "" } else { $null }
    }
    npm = @{
      installed = (Get-Command npm -ErrorAction SilentlyContinue) -ne $null
      version = if (Get-Command npm -ErrorAction SilentlyContinue) { npm --version } else { $null }
    }
    supabase = @{
      installed = (Get-Command supabase -ErrorAction SilentlyContinue) -ne $null
      version = if (Get-Command supabase -ErrorAction SilentlyContinue) { (supabase --version) } else { $null }
      authenticated = $false # Check separately
    }
    railway = @{
      installed = (Get-Command railway -ErrorAction SilentlyContinue) -ne $null
      version = if (Get-Command railway -ErrorAction SilentlyContinue) { (railway --version) } else { $null }
    }
    docker = @{
      installed = (Get-Command docker -ErrorAction SilentlyContinue) -ne $null
      version = if (Get-Command docker -ErrorAction SilentlyContinue) { (docker --version) -replace "Docker version ", "" -replace ",.*", "" } else { $null }
      running = (docker info 2>&1) -notmatch "error"
    }
  }

  repository = @{
    initialized = Test-Path ".git"
    remote_url = if (Test-Path ".git") { git remote get-url origin 2>$null } else { $null }
    branch = if (Test-Path ".git") { git branch --show-current } else { $null }
  }

  validation = @{
    essential_complete = $true
    recommended_complete = $false
    ready_for_development = $true
  }
}

# Convert to YAML and save
# (Simplified - in practice use ConvertTo-Yaml module or js-yaml)
$report | ConvertTo-Json -Depth 5 | Out-File -FilePath ".aiox/environment-report.json" -Encoding utf8

Write-Host "✅ Environment report saved to .aiox/environment-report.json"
```

---

### Step 8: Final Validation & Summary

**Action:** Validate environment and display summary

```
╔═══════════════════════════════════════════════════════════════════════════╗
║              ✅ AIOX ENVIRONMENT BOOTSTRAP COMPLETE                        ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  Project: my-awesome-project                                               ║
║  Repository: https://github.com/username/my-awesome-project                ║
║  Branch: main                                                              ║
║                                                                            ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  CLI Tools Status                                                          ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  ✅ git 2.43.0          ✅ gh 2.40.1 (authenticated)                       ║
║  ✅ node 20.10.0        ✅ npm 10.2.4                                      ║
║  ✅ supabase 1.123.0    ✅ railway 3.5.0                                   ║
║  ✅ docker 24.0.7       ⚠️  coderabbit (WSL only)                          ║
║                                                                            ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Project Structure                                                         ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  my-awesome-project/                                                       ║
║  ├── .aiox/                    # AIOX configuration                        ║
║  │   ├── config.yaml           # Project config                            ║
║  │   └── environment-report.json                                           ║
║  ├── docs/                     # Documentation (PRD, architecture)         ║
║  │   ├── stories/              # User stories                              ║
║  │   ├── architecture/         # Architecture docs                         ║
║  │   └── guides/               # Developer guides                          ║
║  ├── src/                      # Source code                               ║
║  ├── tests/                    # Test files                                ║
║  ├── .gitignore                # Git ignore rules                          ║
║  ├── package.json              # NPM configuration                         ║
║  └── README.md                 # Project readme                            ║
║                                                                            ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  NEXT STEPS                                                                ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  Your environment is ready! Continue with the Greenfield workflow:         ║
║                                                                            ║
║  1. @analyst → Create Project Brief                                        ║
║     Start a new chat: @analyst                                             ║
║     Command: *create-doc project-brief                                     ║
║                                                                            ║
║  2. @pm → Create PRD                                                       ║
║     After project brief is approved                                        ║
║     Command: *create-doc prd                                               ║
║                                                                            ║
║  3. Continue with greenfield-fullstack workflow...                         ║
║                                                                            ║
║  Full workflow: .aiox-core/development/workflows/greenfield-fullstack.yaml ║
║                                                                            ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Quick Reference                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  • View environment report: cat .aiox/environment-report.json              ║
║  • Check GitHub repo: gh repo view --web                                   ║
║  • AIOX help: @aiox-master *help                                           ║
║  • Re-run bootstrap: @devops *environment-bootstrap                        ║
║                                                                            ║
╚═══════════════════════════════════════════════════════════════════════════╝

Environment bootstrap completed in 8m 32s

— Gage, environment configured with confidence 🚀
```

---

## Validation Checklist

- [ ] Operating system detected correctly
- [ ] All essential CLIs installed (git, gh, node, npm)
- [ ] GitHub CLI authenticated
- [ ] Git repository initialized
- [ ] GitHub remote repository created
- [ ] .gitignore configured
- [ ] Project structure created
- [ ] .aiox/config.yaml created
- [ ] Environment report generated
- [ ] Initial commit pushed to GitHub

---

## Troubleshooting

### Issue 1: winget not recognized

**Error:** `winget: The term 'winget' is not recognized`

**Fix:**

1. Update Windows to latest version (winget requires Windows 10 1809+)
2. Or install App Installer from Microsoft Store
3. Or use alternative: `choco install gh` or `scoop install gh`

### Issue 2: gh auth login fails

**Error:** `error connecting to api.github.com`

**Fix:**

1. Check internet connection
2. Check if behind corporate proxy: `gh config set http_proxy http://proxy:port`
3. Try token-based auth: `gh auth login --with-token`

### Issue 3: Permission denied creating repository

**Error:** `Resource not accessible by personal access token`

**Fix:**

1. Re-authenticate with correct scopes: `gh auth login --scopes repo,workflow`
2. Check if organization requires SSO: `gh auth login --hostname github.com`

### Issue 4: Docker not starting

**Error:** `Cannot connect to Docker daemon`

**Fix:**

1. Windows: Ensure Docker Desktop is running
2. macOS: Open Docker.app
3. Linux: `sudo systemctl start docker`

---

## Rollback

To undo environment bootstrap:

```bash
# Remove local git
rm -rf .git

# Remove AIOX files
rm -rf .aiox
rm -f .gitignore
rm -f README.md

# Delete GitHub repository (CAUTION!)
gh repo delete REPO_NAME --yes
```

---

## References

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Railway CLI Documentation](https://docs.railway.app/reference/cli-api)
- [AIOX Greenfield Workflow](.aiox-core/development/workflows/greenfield-fullstack.yaml)
- [CodeRabbit Setup Guide](docs/guides/coderabbit/README.md)

---

**Status:** ✅ Production Ready
**Tested On:** Windows 11, macOS Sonoma, Ubuntu 22.04
**Minimum Requirements:** Windows 10 1809+, macOS 12+, Ubuntu 20.04+
