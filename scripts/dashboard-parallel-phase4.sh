#!/bin/bash
# =============================================================================
# AIOX Dashboard Parallel Dev - Phase 4 (5 workers - MAX)
# =============================================================================
# Prerequisites: Phase 3 complete
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SESSION_NAME="aiox-dash-p4"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# =============================================================================
# STORY CONFIGURATION - Phase 4
# =============================================================================

declare -a STORIES=(
    "1.3|Drag & Drop|docs/stories/aiox-dashboard/epic-1-story-board.md|apps/dashboard/src/components/kanban/|Add @dnd-kit to KanbanBoard, enable drag between columns, persist order"
    "2.1|Terminal|docs/prd/aiox-dashboard.md|apps/dashboard/src/components/terminal/|Create Terminal.tsx read-only output with ANSI colors"
    "3.1|Roadmap|docs/prd/aiox-dashboard.md|apps/dashboard/src/app/(dashboard)/roadmap/|Create timeline view showing epics and milestones"
    "3.2|Context|docs/prd/aiox-dashboard.md|apps/dashboard/src/app/(dashboard)/context/|Create file browser for project context files"
    "4.1|GitHub|docs/prd/aiox-dashboard.md|apps/dashboard/src/app/(dashboard)/github/|Create GitHub view listing issues and PRs"
)

NUM_WORKERS=${#STORIES[@]}

# Check dependencies
if ! command -v tmux &> /dev/null; then
    echo -e "${RED}❌ tmux not found${NC}"
    exit 1
fi

if ! command -v claude &> /dev/null; then
    echo -e "${RED}❌ claude CLI not found${NC}"
    exit 1
fi

tmux kill-session -t "$SESSION_NAME" 2>/dev/null || true

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     ${YELLOW}AIOX Dashboard Phase 4 (MAX PARALLELISM)${NC}             ${CYAN}║${NC}"
echo -e "${CYAN}╠═══════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║${NC}  Phase:      ${GREEN}4 - Advanced Features${NC}                       ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  Workers:    ${GREEN}$NUM_WORKERS${NC}                                            ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  Prereq:     Phase 3 complete                              ${CYAN}║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Stories to implement:${NC}"
for story in "${STORIES[@]}"; do
    IFS='|' read -ra PARTS <<< "$story"
    echo -e "  ${BLUE}Story ${PARTS[0]}:${NC} ${PARTS[1]}"
done
echo ""

# Phase 0: Create panes
echo -e "${YELLOW}[0/3]${NC} Creating $NUM_WORKERS panes..."
tmux new-session -d -s "$SESSION_NAME" -c "$PROJECT_DIR"
for ((i=1; i<NUM_WORKERS; i++)); do
    tmux split-window -t "$SESSION_NAME" -c "$PROJECT_DIR"
    tmux select-layout -t "$SESSION_NAME" tiled
done
tmux select-layout -t "$SESSION_NAME" tiled
echo -e "   ${GREEN}✓${NC} $NUM_WORKERS panes created"

# Phase 1: Start Claude
echo -e "${YELLOW}[1/3]${NC} Starting Claude Code in all panes..."
for ((i=0; i<NUM_WORKERS; i++)); do
    IFS='|' read -ra PARTS <<< "${STORIES[$i]}"
    tmux send-keys -t "$SESSION_NAME:0.$i" "cd $PROJECT_DIR && clear" Enter
    tmux send-keys -t "$SESSION_NAME:0.$i" "echo '🏗️ Worker $((i+1)): Story ${PARTS[0]} - ${PARTS[1]}'" Enter
    tmux send-keys -t "$SESSION_NAME:0.$i" "claude --dangerously-skip-permissions" Enter
    sleep 2
done
echo -e "   ${GREEN}✓${NC} Claude launched"
echo -e "   ${YELLOW}⏳${NC} Waiting for Claude to initialize (10s)..."
sleep 10

# Phase 2: Activate @dev
echo -e "${YELLOW}[2/3]${NC} Activating @dev agent..."
for ((i=0; i<NUM_WORKERS; i++)); do
    tmux send-keys -t "$SESSION_NAME:0.$i" "/dev" Enter
    sleep 2
done
echo -e "   ${GREEN}✓${NC} @dev activation sent"
echo -e "   ${YELLOW}⏳${NC} Waiting for agent to load (15s)..."
sleep 15

# Phase 3: Send commands
echo -e "${YELLOW}[3/3]${NC} Sending story implementation commands..."
for ((i=0; i<NUM_WORKERS; i++)); do
    IFS='|' read -ra PARTS <<< "${STORIES[$i]}"
    WORKER_CMD="Implement Story ${PARTS[0]} (${PARTS[1]}) from ${PARTS[2]}

Focus directory: ${PARTS[3]}
Instructions: ${PARTS[4]}

Read the story/PRD file first to understand requirements, then implement."

    tmux send-keys -t "$SESSION_NAME:0.$i" "$WORKER_CMD" Enter
    echo -e "   ${BLUE}Worker $((i+1)):${NC} Story ${PARTS[0]} - ${PARTS[1]}"
    sleep 1
done
echo -e "   ${GREEN}✓${NC} All workers started!"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ MAX SWARM! $NUM_WORKERS workers on Phase 4                       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Commands:${NC}"
echo "  tmux attach -t $SESSION_NAME"
echo "  tmux kill-session -t $SESSION_NAME"
echo ""

read -p "Attach to session now? [Y/n] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    tmux attach -t "$SESSION_NAME"
fi
