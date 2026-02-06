#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# VALIDATE-SQUAD.SH - Hybrid Squad Validation Script
# ═══════════════════════════════════════════════════════════════════════════════
# Version: 3.0.0 - Production Validation
# Compatibility: bash 3.2+ (macOS compatible)
# Purpose: Hybrid validation - bash for deterministic, Claude for qualitative
# Usage: ./validate-squad.sh <squad-name> [--verbose] [--quick] [--json]
#
# HYBRID APPROACH:
#   BASH (deterministic):
#     - File/directory existence
#     - Security scan (grep patterns)
#     - Cross-reference validation
#     - Metrics collection (counts, ratios)
#
#   CLAUDE CLI (qualitative):
#     - Prompt quality analysis
#     - Pipeline coherence evaluation
#     - Voice consistency check
#     - Overall assessment & recommendations
#
# Exit codes:
#   0 = PASS (score >= 7.0, no blocking issues)
#   1 = FAIL (score < 7.0 or blocking issues)
#   2 = ERROR (script error, invalid input)
# ═══════════════════════════════════════════════════════════════════════════════

set -uo pipefail

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQUAD_CREATOR_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SQUADS_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)/squads"

# Model configuration
MODEL_DEFAULT="opus"    # Best quality (default)
MODEL_FAST="haiku"      # Quick & cheap
MODEL_QUALITY="$MODEL_DEFAULT"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'
BOLD='\033[1m'

# Counters
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# Results arrays
BLOCKING_ISSUES=""
WARNINGS=""

# Metrics (simple variables for bash 3.x compatibility)
M_AGENT_COUNT=0
M_TASK_COUNT=0
M_CHECKLIST_COUNT=0
M_TEMPLATE_COUNT=0
M_DATA_COUNT=0
M_TOTAL_LINES=0
M_SECURITY_ISSUES=0
M_XREF_ISSUES=0
M_SQUAD_TYPE="unknown"
M_TYPE_CONFIDENCE=0
M_PROMPT_QUALITY=0
M_STRUCTURE_COHERENCE=0
M_COVERAGE_SCORE=0
M_DOCUMENTATION=0
M_QUALITY_SCORE="N/A"
M_IMPROVEMENTS=""
M_PROD_SCORE=0

# Phase results
TIER1_FAIL=0
SEC_FAIL=0
XREF_FAIL=0
PROD_SCORE=0
PROD_MAX=5
FINAL_SCORE=0
ENTRY_AGENT=""

# ═══════════════════════════════════════════════════════════════════════════════
# ARGUMENT PARSING
# ═══════════════════════════════════════════════════════════════════════════════

show_help() {
  cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║       🔍 VALIDATE-SQUAD v2.0 - Hybrid Validation Tool        ║
╚══════════════════════════════════════════════════════════════╝

Usage: ./validate-squad.sh <squad-name> [options]

Arguments:
  squad-name    Name of squad to validate (e.g., "squad-creator", "squad-creator")

Options:
  --verbose     Show all checks and Claude analysis details
  --quick       Skip Claude analysis (deterministic only)
  --fast        Use Haiku instead of Opus (cheaper, faster)
  --json        Output results as JSON
  --help        Show this help message

Examples:
  ./validate-squad.sh squad-creator      # Full validation with Opus
  ./validate-squad.sh squad-creator --verbose # Verbose output
  ./validate-squad.sh squad-creator --quick   # Deterministic only (no Claude)
  ./validate-squad.sh squad-creator --fast    # Quick validation with Haiku

Exit Codes:
  0  PASS     Score >= 7.0, no blocking issues
  1  FAIL     Score < 7.0 or blocking issues found
  2  ERROR    Invalid input or script error

EOF
  exit 0
}

SQUAD_NAME=""
VERBOSE=false
QUICK_MODE=false
JSON_OUTPUT=false
FAST_MODE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --help|-h)
      show_help
      ;;
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    --quick|-q)
      QUICK_MODE=true
      shift
      ;;
    --fast|-f)
      FAST_MODE=true
      MODEL_QUALITY="$MODEL_FAST"
      shift
      ;;
    --json|-j)
      JSON_OUTPUT=true
      shift
      ;;
    -*)
      echo "Unknown option: $1"
      exit 2
      ;;
    *)
      SQUAD_NAME="$1"
      shift
      ;;
  esac
done

if [[ -z "$SQUAD_NAME" ]]; then
  echo "Error: Squad name required"
  echo "Usage: ./validate-squad.sh <squad-name>"
  exit 2
fi

SQUAD_DIR="$SQUADS_DIR/$SQUAD_NAME"

if [[ ! -d "$SQUAD_DIR" ]]; then
  echo "Error: Squad not found: $SQUAD_DIR"
  exit 2
fi

# ═══════════════════════════════════════════════════════════════════════════════
# LOGGING HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

log_pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  if [[ "$VERBOSE" == "true" ]]; then
    echo -e "  ${GREEN}✓${NC} $1"
  fi
}

log_fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo -e "  ${RED}✗${NC} $1"
  BLOCKING_ISSUES="${BLOCKING_ISSUES}${1}\n"
}

log_warn() {
  WARN_COUNT=$((WARN_COUNT + 1))
  echo -e "  ${YELLOW}⚠${NC} $1"
  WARNINGS="${WARNINGS}${1}\n"
}

log_info() {
  if [[ "$VERBOSE" == "true" ]]; then
    echo -e "  ${CYAN}ℹ${NC} $1"
  fi
}

log_section() {
  echo ""
  echo -e "${BOLD}${BLUE}═══ $1 ═══${NC}"
}

log_subsection() {
  echo -e "${CYAN}--- $1 ---${NC}"
}

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 1: STRUCTURE (Deterministic - Bash)
# ═══════════════════════════════════════════════════════════════════════════════

check_structure() {
  log_section "PHASE 1: Structure Validation (Bash)"
  local tier1_fail=0

  # 1.1 Config file
  log_subsection "1.1 Configuration"
  if [[ -f "$SQUAD_DIR/config.yaml" ]]; then
    log_pass "config.yaml exists"

    # Check for name (top-level or under pack:)
    if grep -qE "^name:|^[[:space:]]+name:" "$SQUAD_DIR/config.yaml" 2>/dev/null; then
      log_pass "config.yaml has 'name' field"
    else
      log_fail "config.yaml missing 'name' field"
      tier1_fail=$((tier1_fail + 1))
    fi

    # Check for version (top-level or under pack:)
    if grep -qE "^version:|^[[:space:]]+version:" "$SQUAD_DIR/config.yaml" 2>/dev/null; then
      log_pass "config.yaml has 'version' field"
    else
      log_fail "config.yaml missing 'version' field"
      tier1_fail=$((tier1_fail + 1))
    fi

    # Check for entry_agent (top-level, under pack:, or in agents list)
    if grep -q "entry_agent:" "$SQUAD_DIR/config.yaml" 2>/dev/null; then
      log_pass "config.yaml has 'entry_agent' field"
      ENTRY_AGENT=$(grep "entry_agent:" "$SQUAD_DIR/config.yaml" | head -1 | sed 's/.*entry_agent:[[:space:]]*//' | tr -d '"' | tr -d "'" | xargs)
    elif grep -qE "^[[:space:]]+- id:" "$SQUAD_DIR/config.yaml" 2>/dev/null; then
      # Has agents list, extract first agent as entry point
      ENTRY_AGENT=$(grep -E "^[[:space:]]+- id:" "$SQUAD_DIR/config.yaml" | head -1 | sed 's/.*- id:[[:space:]]*//' | tr -d '"' | tr -d "'" | xargs)
      log_warn "No entry_agent defined, using first agent: $ENTRY_AGENT"
    else
      log_warn "config.yaml missing 'entry_agent' field (non-blocking)"
    fi
  else
    log_fail "config.yaml not found"
    tier1_fail=$((tier1_fail + 1))
  fi

  # 1.2 Entry agent
  log_subsection "1.2 Entry Point"
  if [[ -n "${ENTRY_AGENT:-}" ]]; then
    if [[ -f "$SQUAD_DIR/agents/${ENTRY_AGENT}.md" ]]; then
      log_pass "Entry agent exists: agents/${ENTRY_AGENT}.md"
    else
      log_fail "Entry agent not found: agents/${ENTRY_AGENT}.md"
      tier1_fail=$((tier1_fail + 1))
    fi
  fi

  # 1.3 Directory structure
  log_subsection "1.3 Directory Structure"
  local found_dirs=0
  for dir in agents tasks checklists templates data; do
    if [[ -d "$SQUAD_DIR/$dir" ]]; then
      local count=$(find "$SQUAD_DIR/$dir" -type f \( -name "*.md" -o -name "*.yaml" -o -name "*.yml" \) 2>/dev/null | wc -l | tr -d ' ')
      log_pass "$dir/ exists ($count files)"
      found_dirs=$((found_dirs + 1))
    else
      log_info "$dir/ not found (optional)"
    fi
  done

  # 1.4 Collect metrics
  log_subsection "1.4 Metrics Collection"
  M_AGENT_COUNT=$(find "$SQUAD_DIR/agents" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
  M_TASK_COUNT=$(find "$SQUAD_DIR/tasks" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
  M_CHECKLIST_COUNT=$(find "$SQUAD_DIR/checklists" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
  M_TEMPLATE_COUNT=$(find "$SQUAD_DIR/templates" -type f 2>/dev/null | wc -l | tr -d ' ')
  M_DATA_COUNT=$(find "$SQUAD_DIR/data" -type f 2>/dev/null | wc -l | tr -d ' ')
  M_TOTAL_LINES=$(find "$SQUAD_DIR" -type f \( -name "*.md" -o -name "*.yaml" \) -exec cat {} + 2>/dev/null | wc -l | tr -d ' ')

  log_info "Agents: $M_AGENT_COUNT, Tasks: $M_TASK_COUNT, Checklists: $M_CHECKLIST_COUNT"
  log_info "Total lines: $M_TOTAL_LINES"

  TIER1_FAIL=$tier1_fail
}

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 2: SECURITY SCAN (Deterministic - Bash)
# ═══════════════════════════════════════════════════════════════════════════════

check_security() {
  log_section "PHASE 2: Security Scan (Bash)"
  local sec_fail=0

  log_subsection "2.1 API Keys & Tokens"

  # API Keys (excluding placeholders, examples, documentation, fake values)
  local api_keys=$(grep -rE "(api[_-]?key|apikey)[[:space:]]*[:=][[:space:]]*['\"][^'\"\$\{]{8,}" "$SQUAD_DIR" 2>/dev/null | grep -vE "(\{\{|\\\$\{|process\.env|[Ee]xample|placeholder|grep|pattern|EXAMPLE|sk-1234|your-key|#.*api)" || true)
  if [[ -n "$api_keys" ]]; then
    log_fail "SEC-001: Potential API keys found"
    sec_fail=$((sec_fail + 1))
  else
    log_pass "SEC-001: No hardcoded API keys"
  fi

  # Secrets (excluding examples, documentation, fake values, obvious test secrets)
  local secrets=$(grep -rE "(secret|password)[[:space:]]*[:=][[:space:]]*['\"][^'\"\$\{]{8,}" "$SQUAD_DIR" 2>/dev/null | grep -vE "(\{\{|\\\$\{|process\.env|[Ee]xample|placeholder|grep|pattern|EXAMPLE|secret_key|your-secret|#.*secret|#.*password|mySecret|super-secret|-secret-|-here)" || true)
  if [[ -n "$secrets" ]]; then
    log_fail "SEC-002: Potential secrets found"
    sec_fail=$((sec_fail + 1))
  else
    log_pass "SEC-002: No hardcoded secrets"
  fi

  log_subsection "2.2 Cloud Credentials"

  # AWS Access Key (excluding examples, grep patterns, documentation)
  local aws_access=$(grep -rE "AKIA[A-Z0-9]{16}" "$SQUAD_DIR" 2>/dev/null | grep -vE "(EXAMPLE|grep|pattern|\.sh:|\.md:.*grep)" || true)
  if [[ -n "$aws_access" ]]; then
    log_fail "SEC-003: AWS Access Key found"
    sec_fail=$((sec_fail + 1))
  else
    log_pass "SEC-003: No AWS Access Keys"
  fi

  # GCP Service Account
  local gcp_key=$(grep -rE '"type"[[:space:]]*:[[:space:]]*"service_account"' "$SQUAD_DIR" 2>/dev/null || true)
  if [[ -n "$gcp_key" ]]; then
    log_fail "SEC-004: GCP Service Account found"
    sec_fail=$((sec_fail + 1))
  else
    log_pass "SEC-004: No GCP Service Accounts"
  fi

  log_subsection "2.3 Private Keys"

  local priv_key=$(grep -rE "-----BEGIN.*(PRIVATE|RSA|DSA|EC).*KEY-----" "$SQUAD_DIR" 2>/dev/null || true)
  if [[ -n "$priv_key" ]]; then
    log_fail "SEC-005: Private key content found"
    sec_fail=$((sec_fail + 1))
  else
    log_pass "SEC-005: No private key content"
  fi

  local key_files=$(find "$SQUAD_DIR" -name "*.pem" -o -name "*.key" -o -name "id_rsa*" 2>/dev/null || true)
  if [[ -n "$key_files" ]]; then
    log_fail "SEC-006: Private key files found"
    sec_fail=$((sec_fail + 1))
  else
    log_pass "SEC-006: No private key files"
  fi

  log_subsection "2.4 Database & Sensitive Files"

  # Exclude: placeholders, examples, documentation, localhost, generic passwords
  local db_urls=$(grep -rE "(postgres|mysql|mongodb|redis)://[^:]+:[^@]+@" "$SQUAD_DIR" 2>/dev/null | grep -vE "(\{\{|\[PASSWORD\]|[Ee]xample|localhost|user:pass|:password@|:secret@|grep|pattern)" || true)
  if [[ -n "$db_urls" ]]; then
    log_fail "SEC-007: Database URL with password found"
    sec_fail=$((sec_fail + 1))
  else
    log_pass "SEC-007: No database URLs with passwords"
  fi

  local env_files=$(find "$SQUAD_DIR" -name ".env*" -o -name "*.env" 2>/dev/null || true)
  if [[ -n "$env_files" ]]; then
    log_fail "SEC-008: .env files found"
    sec_fail=$((sec_fail + 1))
  else
    log_pass "SEC-008: No .env files"
  fi

  SEC_FAIL=$sec_fail
  M_SECURITY_ISSUES=$sec_fail

  if [[ $sec_fail -gt 0 ]]; then
    echo -e "\n${RED}⚠️  SECURITY: $sec_fail HIGH severity issues${NC}"
  else
    echo -e "\n${GREEN}✓ Security scan passed${NC}"
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 3: CROSS-REFERENCE (Deterministic - Bash)
# ═══════════════════════════════════════════════════════════════════════════════

check_cross_references() {
  log_section "PHASE 3: Cross-Reference Validation (Bash)"
  local xref_fail=0

  log_subsection "3.1 Handoff Targets"

  if [[ -d "$SQUAD_DIR/agents" ]]; then
    for agent_file in "$SQUAD_DIR/agents"/*.md; do
      [[ -f "$agent_file" ]] || continue
      local handoffs=$(grep -oE "handoff_to:[[:space:]]*@?[a-z0-9_-]+" "$agent_file" 2>/dev/null | sed 's/handoff_to:[[:space:]]*@*//' || true)
      for handoff in $handoffs; do
        if [[ ! -f "$SQUAD_DIR/agents/${handoff}.md" ]]; then
          log_fail "XREF-001: Handoff target not found: $handoff (in $(basename "$agent_file"))"
          xref_fail=$((xref_fail + 1))
        else
          log_pass "XREF-001: Handoff valid: $handoff"
        fi
      done
    done
  fi

  log_subsection "3.2 Task References"
  # Check if tasks referenced in agents exist
  if [[ -d "$SQUAD_DIR/agents" ]]; then
    for agent_file in "$SQUAD_DIR/agents"/*.md; do
      [[ -f "$agent_file" ]] || continue
      local task_refs=$(grep -oE "\*[a-z0-9_-]+" "$agent_file" 2>/dev/null | sed 's/\*//' || true)
      for task_ref in $task_refs; do
        if [[ -f "$SQUAD_DIR/tasks/${task_ref}.md" ]]; then
          log_pass "XREF-002: Task exists: $task_ref"
        fi
      done
    done
  fi

  XREF_FAIL=$xref_fail
  M_XREF_ISSUES=$xref_fail

  if [[ $xref_fail -gt 0 ]]; then
    echo -e "\n${RED}⚠️  CROSS-REF: $xref_fail broken references${NC}"
  else
    echo -e "\n${GREEN}✓ Cross-references valid${NC}"
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 4: SQUAD TYPE DETECTION (Deterministic - Bash)
# ═══════════════════════════════════════════════════════════════════════════════

detect_squad_type() {
  log_section "PHASE 4: Squad Type Detection (Bash)"

  local type="general"
  local confidence=5

  # Check for Expert indicators
  local has_voice_dna=$(find "$SQUAD_DIR" -name "*voice*" -o -name "*dna*" 2>/dev/null | wc -l | tr -d ' ')
  local has_clone=$(grep -ril "clone\|emulat\|mind\|persona" "$SQUAD_DIR/agents" 2>/dev/null | wc -l | tr -d ' ')

  # Check for Pipeline indicators
  local has_workflow=$(find "$SQUAD_DIR" -path "*/workflows/*.yaml" 2>/dev/null | wc -l | tr -d ' ')
  local has_phases=$(grep -ril "phase\|stage\|step" "$SQUAD_DIR/tasks" 2>/dev/null | wc -l | tr -d ' ')

  # Calculate task ratio
  local agent_count=${M_AGENT_COUNT:-1}
  [[ $agent_count -eq 0 ]] && agent_count=1
  local task_ratio=$((M_TASK_COUNT / agent_count))

  # Check for Hybrid indicators
  local has_human_exec=$(grep -ril "human\|manual\|executor" "$SQUAD_DIR" 2>/dev/null | wc -l | tr -d ' ')

  # Scoring
  local expert_score=0
  local pipeline_score=0
  local hybrid_score=0

  [[ $has_voice_dna -gt 0 ]] && expert_score=$((expert_score + 3))
  [[ $has_clone -gt 2 ]] && expert_score=$((expert_score + 2))

  [[ $has_workflow -gt 0 ]] && pipeline_score=$((pipeline_score + 3))
  [[ $has_phases -gt 3 ]] && pipeline_score=$((pipeline_score + 2))
  [[ $task_ratio -gt 3 ]] && pipeline_score=$((pipeline_score + 2))

  [[ $has_human_exec -gt 2 ]] && hybrid_score=$((hybrid_score + 3))

  # Determine type
  if [[ $expert_score -ge 4 ]]; then
    type="expert"
    confidence=$expert_score
  elif [[ $pipeline_score -ge 4 ]]; then
    type="pipeline"
    confidence=$pipeline_score
  elif [[ $hybrid_score -ge 3 ]]; then
    type="hybrid"
    confidence=$hybrid_score
  fi

  M_SQUAD_TYPE="$type"
  M_TYPE_CONFIDENCE="$confidence"

  log_info "Detected type: $type (confidence: $confidence)"
  log_info "Expert signals: voice_dna=$has_voice_dna, clone_refs=$has_clone"
  log_info "Pipeline signals: workflows=$has_workflow, phases=$has_phases, task_ratio=$task_ratio"
  log_info "Hybrid signals: human_exec=$has_human_exec"

  echo -e "\n${CYAN}Squad Type: ${BOLD}$type${NC} (confidence: $confidence/7)"
}

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 5: PRODUCTION VALIDATION (Deterministic - Bash)
# ═══════════════════════════════════════════════════════════════════════════════

check_production() {
  log_section "PHASE 5: Production Validation (Bash)"
  local prod_score=0

  log_subsection "5.1 Outputs Directory"
  # Check for outputs/ in squad or in global outputs/
  local has_outputs=false
  if [ -d "$SQUAD_DIR/outputs" ]; then
    local output_count=$(find "$SQUAD_DIR/outputs" -type f 2>/dev/null | wc -l | tr -d ' ')
    if [ "$output_count" -gt 0 ]; then
      log_pass "outputs/ exists with $output_count files"
      has_outputs=true
      prod_score=$((prod_score + 2))
    else
      log_warn "outputs/ exists but is empty"
    fi
  else
    log_warn "No outputs/ directory found - squad not tested in production"
  fi

  log_subsection "5.2 Tested Flag"
  # Check for tested: true in config.yaml
  if grep -qE "^tested:[[:space:]]*(true|yes)" "$SQUAD_DIR/config.yaml" 2>/dev/null; then
    log_pass "config.yaml has tested: true"
    prod_score=$((prod_score + 1))
  else
    log_warn "config.yaml missing 'tested: true' flag"
  fi

  log_subsection "5.3 Usage Evidence"
  # Check for YOLO mode state files (real automation usage, not just creation logs)
  local state_files=$(find "$SQUAD_DIR" -name "*-state.json" -o -name "progress.txt" -o -name "handoff.md" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$state_files" -gt 0 ]; then
    # Verify it's real usage, not just template files
    local real_state=$(find "$SQUAD_DIR" -name "*-state.json" -exec grep -l '"status"' {} \; 2>/dev/null | wc -l | tr -d ' ')
    if [ "$real_state" -gt 0 ]; then
      log_pass "Found $real_state state files with execution history (YOLO mode)"
      prod_score=$((prod_score + 1))
    else
      log_warn "State files found but appear to be templates"
    fi
  else
    log_warn "No YOLO mode state files found"
  fi

  # Check for user feedback or validation reports
  local feedback_files=$(find "$SQUAD_DIR" -name "*feedback*" -o -name "*validation-report*" -o -name "*qa-report*" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$feedback_files" -gt 0 ]; then
    log_pass "Found $feedback_files feedback/validation files"
    prod_score=$((prod_score + 1))
  fi

  log_subsection "5.4 Sample Outputs"
  # Check for example outputs in docs or templates
  local has_examples=false
  if [ -d "$SQUAD_DIR/examples" ] || [ -d "$SQUAD_DIR/samples" ]; then
    log_pass "examples/ or samples/ directory exists"
    has_examples=true
    prod_score=$((prod_score + 1))
  fi

  # Check for output_examples in agents
  local output_examples=$(grep -rl "output_examples\|example_output\|sample_output" "$SQUAD_DIR/agents" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$output_examples" -gt 0 ]; then
    log_pass "Found output examples in $output_examples agent files"
    if [ "$has_examples" = false ]; then
      prod_score=$((prod_score + 1))
    fi
  fi

  if [ "$has_examples" = false ] && [ "$output_examples" -eq 0 ]; then
    log_warn "No sample outputs or examples found"
  fi

  # Cap at max
  if [ $prod_score -gt $PROD_MAX ]; then
    prod_score=$PROD_MAX
  fi

  PROD_SCORE=$prod_score
  M_PROD_SCORE=$prod_score

  echo ""
  if [ $prod_score -eq 0 ]; then
    echo -e "${RED}⚠️  PRODUCTION: 0/$PROD_MAX - No evidence of real usage${NC}"
    echo -e "${YELLOW}   Max possible score without production evidence: 5/10${NC}"
  elif [ $prod_score -lt 3 ]; then
    echo -e "${YELLOW}⚠️  PRODUCTION: $prod_score/$PROD_MAX - Limited production evidence${NC}"
  else
    echo -e "${GREEN}✓ Production validation: $prod_score/$PROD_MAX${NC}"
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 6: QUALITY ANALYSIS (Claude CLI)
# ═══════════════════════════════════════════════════════════════════════════════

analyze_with_claude() {
  log_section "PHASE 6: Quality Analysis (Claude CLI)"

  if [[ "$QUICK_MODE" == "true" ]]; then
    echo -e "${YELLOW}Skipping Claude analysis (--quick mode)${NC}"
    M_QUALITY_SCORE="N/A"
    return 0
  fi

  echo -e "${MAGENTA}Running Claude analysis with $MODEL_QUALITY...${NC}"

  # Collect sample files for analysis
  local sample_agent=$(find "$SQUAD_DIR/agents" -name "*.md" 2>/dev/null | head -1)
  local sample_task=$(find "$SQUAD_DIR/tasks" -name "*.md" 2>/dev/null | head -1)
  local sample_checklist=$(find "$SQUAD_DIR/checklists" -name "*.md" 2>/dev/null | head -1)

  local agent_content=""
  local task_content=""
  local checklist_content=""

  [[ -f "$sample_agent" ]] && agent_content=$(head -100 "$sample_agent" 2>/dev/null || true)
  [[ -f "$sample_task" ]] && task_content=$(head -100 "$sample_task" 2>/dev/null || true)
  [[ -f "$sample_checklist" ]] && checklist_content=$(head -100 "$sample_checklist" 2>/dev/null || true)

  # Build analysis prompt
  local ANALYSIS_PROMPT="You are evaluating the quality of an AIOS squad. Analyze and provide a JSON response.

## Squad: $SQUAD_NAME
Type: $M_SQUAD_TYPE

## Metrics
- Agents: $M_AGENT_COUNT
- Tasks: $M_TASK_COUNT
- Checklists: $M_CHECKLIST_COUNT
- Total lines: $M_TOTAL_LINES

## Sample Agent (first 100 lines):
\`\`\`
$agent_content
\`\`\`

## Sample Task (first 100 lines):
\`\`\`
$task_content
\`\`\`

## Sample Checklist (first 100 lines):
\`\`\`
$checklist_content
\`\`\`

## Evaluation Criteria
1. **Prompt Quality (0-10)**: Are prompts specific, actionable, with examples?
2. **Structure Coherence (0-10)**: Do agents/tasks/checklists follow consistent patterns?
3. **Coverage (0-10)**: Does the squad have appropriate agent:task ratios for its type?
4. **Documentation (0-10)**: Are purposes, inputs, outputs clearly defined?

## Required Response Format (JSON only):
{
  \"prompt_quality\": 8,
  \"structure_coherence\": 7,
  \"coverage\": 9,
  \"documentation\": 6,
  \"overall_score\": 7.5,
  \"strengths\": [\"clear prompts\", \"good task coverage\"],
  \"improvements\": [\"add more examples\", \"document edge cases\"],
  \"recommendation\": \"PASS\"
}

Respond with ONLY the JSON, no other text."

  # Run Claude
  local claude_output
  if claude_output=$(claude -p --model "$MODEL_QUALITY" --dangerously-skip-permissions "$ANALYSIS_PROMPT" 2>&1); then
    # Extract JSON from response (handle multiline)
    local json_result=$(echo "$claude_output" | tr '\n' ' ' | grep -oE '\{[^}]+\}' | head -1 || echo '{}')

    if [[ "$VERBOSE" == "true" ]]; then
      echo -e "\n${CYAN}Claude Analysis Result:${NC}"
      echo "$json_result" | jq '.' 2>/dev/null || echo "$json_result"
    fi

    # Parse scores using jq
    if command -v jq &> /dev/null; then
      M_PROMPT_QUALITY=$(echo "$json_result" | jq -r '.prompt_quality // 0' 2>/dev/null || echo "0")
      M_STRUCTURE_COHERENCE=$(echo "$json_result" | jq -r '.structure_coherence // 0' 2>/dev/null || echo "0")
      M_COVERAGE_SCORE=$(echo "$json_result" | jq -r '.coverage // 0' 2>/dev/null || echo "0")
      M_DOCUMENTATION=$(echo "$json_result" | jq -r '.documentation // 0' 2>/dev/null || echo "0")
      M_QUALITY_SCORE=$(echo "$json_result" | jq -r '.overall_score // 0' 2>/dev/null || echo "0")
      M_IMPROVEMENTS=$(echo "$json_result" | jq -r '.improvements | join("; ")' 2>/dev/null || echo "")
    else
      # Fallback without jq - basic parsing
      M_QUALITY_SCORE=$(echo "$json_result" | grep -oE '"overall_score"[[:space:]]*:[[:space:]]*[0-9.]+' | grep -oE '[0-9.]+$' || echo "0")
    fi

    echo -e "\n${GREEN}✓ Claude analysis complete${NC}"
    echo -e "  Quality Score: ${BOLD}${M_QUALITY_SCORE}/10${NC}"

  else
    echo -e "${YELLOW}⚠️  Claude analysis failed, using deterministic score only${NC}"
    M_QUALITY_SCORE="N/A"
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 6: FINAL SCORING & REPORT
# ═══════════════════════════════════════════════════════════════════════════════

calculate_final_score() {
  log_section "PHASE 7: Final Scoring"

  local base_score=10
  local total_fails=$((TIER1_FAIL + SEC_FAIL + XREF_FAIL))

  # Deduct for failures (1.5 per failure)
  local fail_penalty=$((total_fails * 15 / 10))
  # Deduct for warnings (0.3 per warning)
  local warn_penalty=$((WARN_COUNT * 3 / 10))

  # Calculate structure score (0-10)
  local struct_score=$((base_score - fail_penalty - warn_penalty))
  [ $struct_score -lt 0 ] && struct_score=0

  # Get Claude quality score (0-10)
  local quality_int=0
  if [[ "$M_QUALITY_SCORE" != "N/A" && "$M_QUALITY_SCORE" != "0" && -n "$M_QUALITY_SCORE" ]]; then
    quality_int=${M_QUALITY_SCORE%.*}
    [[ -z "$quality_int" || "$quality_int" == "0" ]] && quality_int=7  # Default if parsing failed
  else
    quality_int=7  # Default assumption if Claude failed
  fi

  # Production score is 0-5, normalize to 0-10
  local prod_normalized=$((PROD_SCORE * 2))

  # SCORING FORMULA:
  # - Structure/Security: 20%
  # - Quality (Claude): 30%
  # - Production: 50% (most important - real usage matters most)
  FINAL_SCORE=$(( (struct_score * 20 + quality_int * 30 + prod_normalized * 50) / 100 ))

  # CAPS based on production evidence:
  # - No production (0/5): MAX 5/10
  # - Minimal (1-2/5): MAX 7/10
  # - Good (3-4/5): MAX 9/10
  # - Full (5/5): MAX 10/10
  if [ "$PROD_SCORE" -eq 0 ]; then
    [ "$FINAL_SCORE" -gt 5 ] && FINAL_SCORE=5
  elif [ "$PROD_SCORE" -lt 3 ]; then
    [ "$FINAL_SCORE" -gt 7 ] && FINAL_SCORE=7
  elif [ "$PROD_SCORE" -lt 5 ]; then
    [ "$FINAL_SCORE" -gt 9 ] && FINAL_SCORE=9
  fi

  # Ensure score is in range 0-10
  [ $FINAL_SCORE -lt 0 ] && FINAL_SCORE=0
  [ $FINAL_SCORE -gt 10 ] && FINAL_SCORE=10
}

generate_report() {
  local result="FAIL"
  local result_color=$RED

  if [[ $FINAL_SCORE -ge 7 ]] && [[ -z "$BLOCKING_ISSUES" ]]; then
    result="PASS"
    result_color=$GREEN
  elif [[ $FINAL_SCORE -ge 5 ]]; then
    result="CONDITIONAL"
    result_color=$YELLOW
  fi

  if [[ "$JSON_OUTPUT" == "true" ]]; then
    cat << EOF
{
  "squad": "$SQUAD_NAME",
  "result": "$result",
  "final_score": $FINAL_SCORE,
  "type": "$M_SQUAD_TYPE",
  "metrics": {
    "agents": $M_AGENT_COUNT,
    "tasks": $M_TASK_COUNT,
    "checklists": $M_CHECKLIST_COUNT,
    "total_lines": $M_TOTAL_LINES
  },
  "deterministic": {
    "tier1_fail": $TIER1_FAIL,
    "security_fail": $SEC_FAIL,
    "xref_fail": $XREF_FAIL,
    "warnings": $WARN_COUNT
  },
  "production": {
    "score": $PROD_SCORE,
    "max": $PROD_MAX
  },
  "claude_analysis": {
    "prompt_quality": $M_PROMPT_QUALITY,
    "structure_coherence": $M_STRUCTURE_COHERENCE,
    "coverage": $M_COVERAGE_SCORE,
    "documentation": $M_DOCUMENTATION,
    "quality_score": "$M_QUALITY_SCORE"
  },
  "improvements": "$M_IMPROVEMENTS"
}
EOF
  else
    echo ""
    echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
    if [[ "$result" == "PASS" ]]; then
      echo -e "${BOLD}║${result_color}                    ✅ VALIDATION PASSED                      ${NC}${BOLD}║${NC}"
    elif [[ "$result" == "CONDITIONAL" ]]; then
      echo -e "${BOLD}║${result_color}                   ⚠️  CONDITIONAL PASS                       ${NC}${BOLD}║${NC}"
    else
      echo -e "${BOLD}║${result_color}                    ❌ VALIDATION FAILED                      ${NC}${BOLD}║${NC}"
    fi
    echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  Squad: ${BOLD}$SQUAD_NAME${NC}"
    echo -e "  Type: ${CYAN}$M_SQUAD_TYPE${NC}"
    echo -e "  Final Score: ${BOLD}${result_color}$FINAL_SCORE/10${NC}"
    echo ""
    echo "  ┌─────────────────────────────────────────┐"
    echo "  │ Structure & Security (20%)              │"
    printf "  │   Structure failures: %-17s│\n" "$TIER1_FAIL"
    printf "  │   Security issues: %-19s│\n" "$SEC_FAIL"
    printf "  │   Cross-ref broken: %-18s│\n" "$XREF_FAIL"
    printf "  │   Warnings: %-26s│\n" "$WARN_COUNT"
    echo "  └─────────────────────────────────────────┘"

    echo "  ┌─────────────────────────────────────────┐"
    echo "  │ Production Evidence (50%)               │"
    if [ "$PROD_SCORE" -eq 0 ]; then
      printf "  │   ${RED}Score: %-32s${NC}│\n" "$PROD_SCORE/$PROD_MAX ⚠️  NOT TESTED"
    elif [ "$PROD_SCORE" -lt 3 ]; then
      printf "  │   ${YELLOW}Score: %-32s${NC}│\n" "$PROD_SCORE/$PROD_MAX (limited)"
    else
      printf "  │   ${GREEN}Score: %-32s${NC}│\n" "$PROD_SCORE/$PROD_MAX ✓"
    fi
    echo "  └─────────────────────────────────────────┘"

    if [[ "$M_QUALITY_SCORE" != "N/A" ]]; then
      echo "  ┌─────────────────────────────────────────┐"
      echo "  │ Claude Quality Analysis (30%)          │"
      printf "  │   Prompt Quality: %-20s│\n" "$M_PROMPT_QUALITY/10"
      printf "  │   Structure: %-25s│\n" "$M_STRUCTURE_COHERENCE/10"
      printf "  │   Coverage: %-26s│\n" "$M_COVERAGE_SCORE/10"
      printf "  │   Documentation: %-21s│\n" "$M_DOCUMENTATION/10"
      echo "  └─────────────────────────────────────────┘"
    fi

    if [[ -n "$BLOCKING_ISSUES" ]]; then
      echo ""
      echo -e "  ${RED}Blocking Issues:${NC}"
      echo -e "$BLOCKING_ISSUES" | while read -r issue; do
        [[ -n "$issue" ]] && echo -e "    ${RED}•${NC} $issue"
      done
    fi

    if [[ -n "$M_IMPROVEMENTS" ]]; then
      echo ""
      echo -e "  ${YELLOW}Improvements:${NC}"
      echo "    $M_IMPROVEMENTS"
    fi
    echo ""
  fi

  # Return appropriate exit code
  if [[ "$result" == "PASS" ]]; then
    exit 0
  else
    exit 1
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════════════════════

main() {
  echo ""
  echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}║         🔍 VALIDATE-SQUAD v2.0 - Hybrid Validation           ║${NC}"
  echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  Squad: ${CYAN}$SQUAD_NAME${NC}"
  echo -e "  Path: $SQUAD_DIR"
  if [[ "$QUICK_MODE" == "true" ]]; then
    echo -e "  Mode: quick (no Claude)"
  else
    echo -e "  Mode: hybrid"
  fi
  echo -e "  Model: $MODEL_QUALITY"

  # Phase 1: Structure (Bash)
  check_structure

  # Phase 2: Security (Bash)
  check_security

  # Phase 3: Cross-references (Bash)
  check_cross_references

  # Phase 4: Type detection (Bash)
  detect_squad_type

  # Phase 5: Production validation (Bash) - NEW
  check_production

  # Phase 6: Quality analysis (Claude CLI)
  analyze_with_claude

  # Phase 7: Final scoring
  calculate_final_score

  # Generate report
  generate_report
}

# Run
main
