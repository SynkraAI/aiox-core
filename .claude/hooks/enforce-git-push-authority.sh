#!/bin/bash
# enforce-git-push-authority.sh
# PreToolUse hook: blocks "git push" commands in Bash tool
# Only meant to run when agent is NOT @devops
# Uses node (not jq) for JSON parsing — works on Windows/Git Bash
# FAIL-CLOSED: if parsing fails, blocks the command (exit 2)

INPUT=$(cat)

# Extract command from JSON using node (available on all AIOS systems)
COMMAND=$(echo "$INPUT" | node -e "
  let d='';
  process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>{
    try{console.log(JSON.parse(d).tool_input.command||'')}
    catch(e){process.exit(1)}
  });
" 2>/dev/null)

# Fail-closed: if node parsing failed, block the command
if [ $? -ne 0 ]; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Hook failed to parse input — blocking for safety. Contact @devops."}}'
  exit 0
fi

# Block git push in all forms (push, push --force, push origin, etc.)
if echo "$COMMAND" | grep -qiE '\bgit\s+push\b'; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Git push is EXCLUSIVE to @devops agent. Activate @devops for push operations."}}'
  exit 0
fi

# Allow all other commands
exit 0
