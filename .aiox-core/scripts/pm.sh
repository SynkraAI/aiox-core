#!/bin/bash
# ============================================
# AIOX PM Orchestration Script (pm.sh)
# Story 11.2: Bob Terminal Spawning
#
# Spawns agents in separate terminals with clean context
# to avoid context pollution when Bob (PM) orchestrates multiple agents.
#
# Usage: pm.sh <agent> <task> [params] [--context <path>] [--output <path>]
#
# Arguments:
#   agent       - Agent ID (e.g., dev, architect, qa, pm)
#   task        - Task to execute (e.g., develop, review, create-story)
#   params      - Additional parameters for the agent (optional)
#   --context   - Path to context file (JSON with story, files, instructions)
#   --output    - Custom output file path (default: /tmp/aiox-output-{timestamp}.md)
#
# Environment Variables:
#   AIOX_OUTPUT_DIR   - Directory for output files (default: /tmp)
#   AIOX_DEBUG        - Enable debug logging (default: false)
#   AIOX_TIMEOUT      - Timeout in seconds (default: 300)
#   CLAUDE_CMD        - Claude CLI command (default: claude)
#
# Exit Codes:
#   0 - Success
#   1 - Invalid arguments
#   2 - Unsupported OS
#   3 - No terminal found
#   4 - Spawn failed
#
# Author: @dev (Dex) for Story 11.2
# ============================================

set -euo pipefail

# Version
readonly VERSION="1.0.0"
readonly SCRIPT_NAME="$(basename "$0")"

# Configuration
OUTPUT_DIR="${AIOX_OUTPUT_DIR:-/tmp}"
DEBUG="${AIOX_DEBUG:-false}"
TIMEOUT="${AIOX_TIMEOUT:-300}"
CLAUDE_CMD="${CLAUDE_CMD:-claude}"
INLINE_MODE="${AIOX_INLINE_MODE:-false}"

# Arguments
AGENT=""
TASK=""
PARAMS=""
CONTEXT_FILE=""
CUSTOM_OUTPUT=""

# Generated paths
OUTPUT_FILE=""
LOCK_FILE=""

# ============================================
# Logging Functions
# ============================================

log_debug() {
  [[ "$DEBUG" == "true" ]] && echo "[DEBUG] $*" >&2 || true
}

log_info() {
  echo "[INFO] $*" >&2
}

log_error() {
  echo "[ERROR] $*" >&2
}

# ============================================
# Help and Version
# ============================================

show_help() {
  cat << EOF
AIOX Multi-Modal Orchestration Script v${VERSION}

Usage: ${SCRIPT_NAME} <agent> <task> [params] [options]

Arguments:
  agent       Agent ID (dev, architect, qa, pm, po, sm, analyst, devops, etc.)
  task        Task to execute (develop, review, create-story, etc.)
  params      Additional parameters (optional, quoted string)

Options:
  --context <path>   Path to JSON context file
  --output <path>    Custom output file path
  --help, -h         Show this help message
  --version, -v      Show version

Environment Variables:
  AIOX_OUTPUT_DIR    Output directory (default: /tmp)
  AIOX_DEBUG         Enable debug mode (default: false)
  AIOX_TIMEOUT       Timeout in seconds (default: 300)
  AIOX_INLINE_MODE   Run without a visual terminal (default: false)
  CLAUDE_CMD         Claude CLI command (default: claude)

Examples:
  ${SCRIPT_NAME} dev develop "story-11.2"
  ${SCRIPT_NAME} architect review --context /tmp/ctx.json
  ${SCRIPT_NAME} qa test --output /tmp/qa-result.md

Exit Codes:
  0 - Success (output file path printed to stdout)
  1 - Invalid arguments
  2 - Unsupported OS
  3 - No terminal found
  4 - Spawn failed
EOF
}

show_version() {
  echo "${SCRIPT_NAME} version ${VERSION}"
}

# ============================================
# Argument Parsing
# ============================================

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --help|-h)
        show_help
        exit 0
        ;;
      --version|-v)
        show_version
        exit 0
        ;;
      --context)
        shift
        CONTEXT_FILE="${1:-}"
        if [[ -z "$CONTEXT_FILE" ]]; then
          log_error "Missing value for --context"
          exit 1
        fi
        ;;
      --output)
        shift
        CUSTOM_OUTPUT="${1:-}"
        if [[ -z "$CUSTOM_OUTPUT" ]]; then
          log_error "Missing value for --output"
          exit 1
        fi
        ;;
      -*)
        log_error "Unknown option: $1"
        show_help
        exit 1
        ;;
      *)
        # Positional arguments
        if [[ -z "$AGENT" ]]; then
          AGENT="$1"
        elif [[ -z "$TASK" ]]; then
          TASK="$1"
        else
          # Remaining args are params
          PARAMS="${PARAMS:+$PARAMS }$1"
        fi
        ;;
    esac
    shift
  done

  # Validate required args
  if [[ -z "$AGENT" || -z "$TASK" ]]; then
    log_error "Missing required arguments: agent and task"
    echo ""
    show_help
    exit 1
  fi

  # Validate context file if provided
  if [[ -n "$CONTEXT_FILE" && ! -f "$CONTEXT_FILE" ]]; then
    log_error "Context file not found: $CONTEXT_FILE"
    exit 1
  fi
}

# ============================================
# OS Detection (Task 1.1)
# ============================================

detect_os() {
  case "$(uname -s)" in
    Darwin*)
      echo "macos"
      ;;
    Linux*)
      # Check if running in WSL
      if grep -qi microsoft /proc/version 2>/dev/null; then
        echo "wsl"
      else
        echo "linux"
      fi
      ;;
    CYGWIN*|MINGW*|MSYS*)
      echo "windows"
      ;;
    *)
      echo "unknown"
      ;;
  esac
}

# ============================================
# File Path Setup
# ============================================

setup_paths() {
  local timestamp
  timestamp="$(date +%s)"

  if [[ -n "$CUSTOM_OUTPUT" ]]; then
    OUTPUT_FILE="$CUSTOM_OUTPUT"
  else
    OUTPUT_FILE="${OUTPUT_DIR}/aiox-output-${timestamp}.md"
  fi

  LOCK_FILE="${OUTPUT_DIR}/aiox-lock-${timestamp}.lock"

  log_debug "Output file: $OUTPUT_FILE"
  log_debug "Lock file: $LOCK_FILE"
}

# ============================================
# Terminal Spawning - macOS (Task 1.2)
# ============================================

spawn_macos() {
  local cmd="$1"

  log_debug "Spawning on macOS..."

  # Check for iTerm2 first (better AppleScript support)
  if [[ -d "/Applications/iTerm.app" ]]; then
    log_debug "Using iTerm2"
    osascript << EOF
tell application "iTerm"
  activate
  set newWindow to (create window with default profile)
  tell current session of newWindow
    write text "${cmd}"
  end tell
end tell
EOF
  else
    # Fallback to Terminal.app
    log_debug "Using Terminal.app"
    osascript -e "tell application \"Terminal\"
      activate
      do script \"${cmd}\"
    end tell"
  fi
}

# ============================================
# Terminal Spawning - Linux (Task 1.3)
# ============================================

spawn_linux() {
  local cmd="$1"

  log_debug "Spawning on Linux..."

  # Try terminals in order of preference
  if command -v gnome-terminal &> /dev/null; then
    log_debug "Using gnome-terminal"
    gnome-terminal -- bash -c "$cmd; exec bash" &
  elif command -v konsole &> /dev/null; then
    log_debug "Using konsole"
    konsole --hold -e bash -c "$cmd" &
  elif command -v xfce4-terminal &> /dev/null; then
    log_debug "Using xfce4-terminal"
    xfce4-terminal --hold -e "bash -c '$cmd'" &
  elif command -v xterm &> /dev/null; then
    log_debug "Using xterm"
    xterm -hold -e "$cmd" &
  elif command -v alacritty &> /dev/null; then
    log_debug "Using alacritty"
    alacritty -e bash -c "$cmd; exec bash" &
  elif command -v kitty &> /dev/null; then
    log_debug "Using kitty"
    kitty bash -c "$cmd; exec bash" &
  else
    log_error "No supported terminal found"
    log_error "Please install one of: gnome-terminal, konsole, xfce4-terminal, xterm, alacritty, kitty"
    return 3
  fi
}

# ============================================
# Terminal Spawning - Windows/WSL (Task 1.4)
# ============================================

spawn_windows() {
  local cmd="$1"

  log_debug "Spawning on Windows/WSL..."

  # When running in WSL, spawn using Windows Terminal or cmd
  if command -v wt.exe &> /dev/null; then
    log_debug "Using Windows Terminal"
    wt.exe new-tab wsl.exe bash -c "$cmd" &
  elif command -v cmd.exe &> /dev/null; then
    log_debug "Using cmd.exe with wsl"
    cmd.exe /c start wsl.exe bash -c "$cmd" &
  else
    log_error "No Windows terminal method available"
    log_error "Please install Windows Terminal or ensure cmd.exe is accessible"
    return 3
  fi
}

spawn_wsl() {
  # When already in WSL, spawn a new terminal window
  spawn_windows "$1"
}

# ============================================
# Inline Execution (Story 12.10 - No visual terminal)
# ============================================

spawn_inline() {
  log_info "Running in inline mode (no visual terminal)"

  # Build the command
  local output=""
  output+="=== AIOX Agent Session (Inline) ===$(printf '\n')"
  output+="Agent: ${AGENT}$(printf '\n')"
  output+="Task: ${TASK}$(printf '\n')"
  [[ -n "$PARAMS" ]] && output+="Params: ${PARAMS}$(printf '\n')"
  [[ -n "$CONTEXT_FILE" ]] && output+="Context: ${CONTEXT_FILE}$(printf '\n')"
  output+="$(printf '\n')"
  output+="Executing: @${AGENT} *${TASK} ${PARAMS}$(printf '\n')"
  output+="Agent execution would happen here...$(printf '\n')"
  output+="=== Session Complete ===$(printf '\n')"

  # Write output directly to file
  echo "$output" > "${OUTPUT_FILE}"

  # Remove lock file immediately (inline is synchronous)
  rm -f "${LOCK_FILE}"

  log_info "Inline execution complete"
  log_debug "Output written to: $OUTPUT_FILE"

  return 0
}

# ============================================
# Main Spawn Logic (Task 1.6 - Lock File)
# ============================================

spawn_terminal() {
  local os
  os="$(detect_os)"

  log_info "Detected OS: $os"

  # Create lock file to indicate process is running
  touch "$LOCK_FILE"
  log_debug "Created lock file: $LOCK_FILE"

  # Check for inline mode (Story 12.10 - fallback for non-visual environments)
  if [[ "$INLINE_MODE" == "true" ]]; then
    spawn_inline
    echo "$OUTPUT_FILE"
    return 0
  fi

  # Build the command to run in the new terminal
  local agent_cmd="${CLAUDE_CMD}"

  # Add agent activation
  agent_cmd="${agent_cmd} --print-only"  # Just for testing, real impl would use actual claude flags

  # For now, we'll create a simpler command that demonstrates the concept
  # The actual claude CLI integration will depend on how claude accepts agent/task args
  local full_cmd="echo '=== AIOX Agent Session ===' && "
  full_cmd+="echo 'Agent: ${AGENT}' && "
  full_cmd+="echo 'Task: ${TASK}' && "
  [[ -n "$PARAMS" ]] && full_cmd+="echo 'Params: ${PARAMS}' && "
  [[ -n "$CONTEXT_FILE" ]] && full_cmd+="echo 'Context: ${CONTEXT_FILE}' && "
  full_cmd+="echo '' && "

  # Actual execution would be something like:
  # full_cmd+="${CLAUDE_CMD} @${AGENT} *${TASK} ${PARAMS}"
  # For now, simulate the output
  full_cmd+="echo 'Executing: @${AGENT} *${TASK} ${PARAMS}' && "
  full_cmd+="echo 'Agent execution would happen here...' && "
  full_cmd+="echo '=== Session Complete ===' "

  # Redirect output to file and remove lock when done
  full_cmd+=" > '${OUTPUT_FILE}' 2>&1; rm -f '${LOCK_FILE}'"

  # Spawn based on OS
  case "$os" in
    macos)
      spawn_macos "$full_cmd"
      ;;
    linux)
      spawn_linux "$full_cmd"
      ;;
    windows|wsl)
      spawn_windows "$full_cmd"
      ;;
    *)
      log_error "Unsupported operating system: $os"
      rm -f "$LOCK_FILE"
      return 2
      ;;
  esac

  local spawn_result=$?
  if [[ $spawn_result -ne 0 ]]; then
    log_error "Failed to spawn terminal (exit code: $spawn_result)"
    rm -f "$LOCK_FILE"
    return 4
  fi

  log_info "Terminal spawned successfully"
  log_debug "Output will be written to: $OUTPUT_FILE"
  log_debug "Lock file: $LOCK_FILE (will be removed when complete)"

  # Return the output file path for polling
  echo "$OUTPUT_FILE"
}

# ============================================
# Main Entry Point
# ============================================

main() {
  parse_args "$@"
  setup_paths

  log_info "AIOX Multi-Modal Orchestration Script v${VERSION}"
  log_info "Agent: $AGENT"
  log_info "Task: $TASK"
  [[ -n "$PARAMS" ]] && log_info "Params: $PARAMS"
  [[ -n "$CONTEXT_FILE" ]] && log_info "Context: $CONTEXT_FILE"

  spawn_terminal
}

main "$@"
