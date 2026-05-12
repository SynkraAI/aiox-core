#!/bin/bash
# =============================================================================
# AIOX Dashboard Parallel Dev - v2.0
# =============================================================================
# Launches multiple Claude Code instances in tmux for parallel story development
# Based on ralph-tmux-swarm.sh patterns
# =============================================================================

set -e

# =============================================================================
# CONFIGURATION
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DASHBOARD_DIR="$PROJECT_DIR/apps/dashboard"
SESSION_NAME="aiox-dashboard"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# =============================================================================
# STORY CONFIGURATION - Phase 2
# =============================================================================

declare -a STORIES=(
    "0.3|Layout Shell|docs/stories/aiox-dashboard/epic-0-foundation.md|apps/dashboard/src/components/layout/|Create Sidebar.tsx, AppShell.tsx following Auto-Claude layout"
    "0.1|Status Reader|docs/stories/aiox-dashboard/epic-0-foundation.md|apps/dashboard/src/app/api/status/|Create API route that reads .aiox/dashboard/status.json"
    "1.2|Story Card|docs/stories/aiox-dashboard/epic-1-story-board.md|apps/dashboard/src/components/stories/|Create StoryCard.tsx with badges, progress, agent indicator"
)

NUM_WORKERS=${#STORIES[@]}

# =============================================================================
# CHECK DEPENDENCIES
# =============================================================================

if ! command -v tmux &> /dev/null; then
    echo -e "${RED}❌ tmux not found. Install with: brew install tmux${NC}"
    exit 1
fi

if ! command -v claude &> /dev/null; then
    echo -e "${RED}❌ claude CLI not found${NC}"
    exit 1
fi

# =============================================================================
# DISPLAY HEADER
# =============================================================================

tmux kill-session -t "$SESSION_NAME" 2>/dev/null || true

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     ${YELLOW}AIOX Dashboard Parallel Dev v2.0${NC}                     ${CYAN}║${NC}"
echo -e "${CYAN}╠═══════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║${NC}  Phase:      ${GREEN}2 - Foundation Components${NC}                   ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  Workers:    ${GREEN}$NUM_WORKERS${NC}                                            ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  Project:    apps/dashboard                               ${CYAN}║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Stories to implement:${NC}"
for story in "${STORIES[@]}"; do
    IFS='|' read -ra PARTS <<< "$story"
    echo -e "  ${BLUE}Story ${PARTS[0]}:${NC} ${PARTS[1]}"
done
echo ""

# =============================================================================
# PHASE 0: CREATE PANES
# =============================================================================

echo -e "${YELLOW}[0/3]${NC} Creating $NUM_WORKERS panes..."
tmux new-session -d -s "$SESSION_NAME" -c "$PROJECT_DIR"

for ((i=1; i<NUM_WORKERS; i++)); do
    tmux split-window -t "$SESSION_NAME" -c "$PROJECT_DIR"
    tmux select-layout -t "$SESSION_NAME" tiled
done
tmux select-layout -t "$SESSION_NAME" tiled

echo -e "   ${GREEN}✓${NC} $NUM_WORKERS panes created"

# =============================================================================
# PHASE 1: START CLAUDE IN ALL PANES
# =============================================================================

echo -e "${YELLOW}[1/3]${NC} Starting Claude Code in all panes..."

for ((i=0; i<NUM_WORKERS; i++)); do
    IFS='|' read -ra PARTS <<< "${STORIES[$i]}"
    STORY_ID="${PARTS[0]}"
    STORY_NAME="${PARTS[1]}"

    # Set environment and start Claude
    tmux send-keys -t "$SESSION_NAME:0.$i" "cd $PROJECT_DIR && clear" Enter
    tmux send-keys -t "$SESSION_NAME:0.$i" "echo '🏗️ Worker $((i+1)): Story $STORY_ID - $STORY_NAME'" Enter
    tmux send-keys -t "$SESSION_NAME:0.$i" "claude --dangerously-skip-permissions" Enter
    sleep 2  # Stagger launches
done

echo -e "   ${GREEN}✓${NC} Claude launched in $NUM_WORKERS panes"
echo -e "   ${YELLOW}⏳${NC} Waiting for Claude to initialize (10s)..."
sleep 10

# =============================================================================
# PHASE 2: ACTIVATE DEV AGENT
# =============================================================================

echo -e "${YELLOW}[2/3]${NC} Activating @dev agent in all panes..."

for ((i=0; i<NUM_WORKERS; i++)); do
    tmux send-keys -t "$SESSION_NAME:0.$i" "/dev" Enter
    sleep 2
done

echo -e "   ${GREEN}✓${NC} @dev activation sent"
echo -e "   ${YELLOW}⏳${NC} Waiting for agent to load (15s)..."
sleep 15

# =============================================================================
# PHASE 3: SEND STORY COMMANDS
# =============================================================================

echo -e "${YELLOW}[3/3]${NC} Sending story implementation commands..."

for ((i=0; i<NUM_WORKERS; i++)); do
    IFS='|' read -ra PARTS <<< "${STORIES[$i]}"
    STORY_ID="${PARTS[0]}"
    STORY_NAME="${PARTS[1]}"
    STORY_FILE="${PARTS[2]}"
    FOCUS_DIR="${PARTS[3]}"
    INSTRUCTIONS="${PARTS[4]}"

    WORKER_CMD="Implement Story $STORY_ID ($STORY_NAME) from $STORY_FILE

Focus directory: $FOCUS_DIR
Instructions: $INSTRUCTIONS

Read the story file first to understand all Acceptance Criteria, then implement each AC."

    tmux send-keys -t "$SESSION_NAME:0.$i" "$WORKER_CMD" Enter

    echo -e "   ${BLUE}Worker $((i+1)):${NC} Story $STORY_ID - $STORY_NAME"
    sleep 1
done

echo -e "   ${GREEN}✓${NC} All workers started!"

# =============================================================================
# FINAL STATUS
# =============================================================================

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ SWARM LAUNCHED! $NUM_WORKERS workers on Phase 2                  ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}Commands:${NC}"
echo "  tmux attach -t $SESSION_NAME      - Connect to session"
echo "  tmux kill-session -t $SESSION_NAME - Stop all workers"
echo ""
echo -e "${CYAN}Navigation (inside tmux):${NC}"
echo "  Ctrl+B → arrow   Change pane"
echo "  Ctrl+B → z       Zoom pane (toggle)"
echo "  Ctrl+B → d       Detach (workers continue)"
echo ""

# Auto-connect to session
read -p "Attach to session now? [Y/n] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    tmux attach -t "$SESSION_NAME"
fi
