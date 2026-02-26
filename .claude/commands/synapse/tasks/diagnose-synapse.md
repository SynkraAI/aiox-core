# SYNAPSE Diagnostics Task

Run a comprehensive diagnostic of the SYNAPSE context engine, comparing expected vs. actual pipeline state, including **session performance analysis** with exact timing data.

## Instructions

Execute the following steps in order:

### Step 1: Run Diagnostics Script

```bash
node -e "const {runDiagnostics}=require('./.aios-core/core/synapse/diagnostics/synapse-diagnostics');console.log(runDiagnostics(process.cwd()))"
```

### Step 2: Display Report

Show the full markdown report output to the user.

### Step 3: Analyze Gaps

If the report contains any FAIL or WARN items:
1. List each gap with its severity
2. Provide the recommended fix from the report
3. Ask the user if they want to apply any fixes

### Step 4: Session Performance Analysis

Run the timing analyzer to get **exact execution data** for this session:

```bash
node -e "
const fs = require('fs');
const path = require('path');
const os = require('os');

const LOG_DIR = path.join(os.homedir(), '.claude', 'logs');
const today = new Date().toISOString().slice(0, 10);
const logFile = path.join(LOG_DIR, 'timing-' + today + '.jsonl');

if (!fs.existsSync(logFile)) {
  console.log('NO_TIMING_DATA');
  process.exit(0);
}

const lines = fs.readFileSync(logFile, 'utf8').trim().split('\n');
const entries = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);

// Group by session
const sessions = {};
entries.forEach(e => {
  if (!sessions[e.session]) sessions[e.session] = [];
  sessions[e.session].push(e);
});

// Find the latest session (most likely current)
const sessionIds = Object.keys(sessions);
const latestSessionId = sessionIds[sessionIds.length - 1];
const currentEvents = sessions[latestSessionId] || [];

// Build JSON output for analysis
const result = {
  date: today,
  logFile,
  totalSessions: sessionIds.length,
  currentSession: {
    id: latestSessionId ? latestSessionId.slice(0, 12) : null,
    totalEntries: currentEvents.length,
    firstEvent: currentEvents[0] ? currentEvents[0].timestamp : null,
    lastEvent: currentEvents.length ? currentEvents[currentEvents.length - 1].timestamp : null,
    wallClockMs: currentEvents.length >= 2
      ? currentEvents[currentEvents.length - 1].epochMs - currentEvents[0].epochMs
      : 0,
    timeline: [],
    toolSummary: {},
    gaps: [],
    totalToolTimeMs: 0,
    totalThinkingTimeMs: 0,
  },
};

// Build timeline
let prevEpoch = null;
currentEvents.forEach(e => {
  const gap = prevEpoch ? e.epochMs - prevEpoch : 0;
  const item = {
    time: e.timestamp ? e.timestamp.slice(11, 23) : '',
    event: e.event === 'PreToolUse' ? 'START' : 'END',
    tool: e.tool,
    durationMs: e.durationMs || null,
    gapMs: gap,
    input: e.input || null,
  };
  result.currentSession.timeline.push(item);
  prevEpoch = e.epochMs;
});

// Tool duration summary
currentEvents.filter(e => e.durationMs).forEach(e => {
  if (!result.currentSession.toolSummary[e.tool]) {
    result.currentSession.toolSummary[e.tool] = { calls: 0, totalMs: 0, maxMs: 0, durations: [] };
  }
  const ts = result.currentSession.toolSummary[e.tool];
  ts.calls++;
  ts.totalMs += e.durationMs;
  ts.maxMs = Math.max(ts.maxMs, e.durationMs);
  ts.durations.push(e.durationMs);
  result.currentSession.totalToolTimeMs += e.durationMs;
});

// Gap analysis (thinking time between PostToolUse → PreToolUse)
for (let i = 1; i < currentEvents.length; i++) {
  if (currentEvents[i].event === 'PreToolUse' && currentEvents[i - 1].event === 'PostToolUse') {
    const gapMs = currentEvents[i].epochMs - currentEvents[i - 1].epochMs;
    result.currentSession.gaps.push({
      from: currentEvents[i - 1].tool,
      to: currentEvents[i].tool,
      gapMs,
    });
    result.currentSession.totalThinkingTimeMs += gapMs;
  }
}

// Sort gaps descending
result.currentSession.gaps.sort((a, b) => b.gapMs - a.gapMs);

console.log(JSON.stringify(result, null, 2));
"
```

### Step 5: Render Performance Report

Using the JSON output from Step 4, present a **Session Performance Report** with these sections:

#### 5a. Session Overview

| Metric | Value |
|--------|-------|
| Wall Clock Total | (firstEvent → lastEvent) |
| Tool Execution Time | sum of all durationMs |
| Thinking/Processing Time | total gaps between PostToolUse → PreToolUse |
| Overhead Ratio | thinkingTime / wallClock as % |

#### 5b. Execution Timeline

Show every tool call in chronological order:
```
HH:MM:SS.mmm  START  ToolName  — input summary
HH:MM:SS.mmm  END    ToolName  [Xms]  (+Yms gap)
```

Highlight any gaps > 5 seconds with a warning marker.

#### 5c. Tool Duration Ranking

Table sorted by total time descending:

| Tool | Calls | Total | Avg | Max |
|------|-------|-------|-----|-----|
| ... | | | | |

#### 5d. Largest Thinking Gaps

Show top 10 gaps (PostToolUse → PreToolUse), sorted descending:

| Gap | From → To | Analysis |
|-----|-----------|----------|
| Xs | Tool A → Tool B | (explain likely cause) |

For the Analysis column, infer causes:
- **> 15s gap**: Likely LLM processing large context or generating long response
- **5-15s gap**: Normal thinking for complex decisions, reading tool output
- **2-5s gap**: Standard inter-tool processing
- **< 2s gap**: Fast, healthy

#### 5e. Bottleneck Diagnosis

Based on the data, provide a concrete diagnosis:
1. What % of total time was spent in tool execution vs thinking?
2. Which specific tool call or gap was the single largest time consumer?
3. Actionable recommendations to reduce total time

### Step 6: Handle Missing Timing Data

If Step 4 outputs `NO_TIMING_DATA`:
1. Inform the user that the timing hooks are not yet capturing data
2. Explain that timing data requires the `PreToolUse`/`PostToolUse` hooks in `~/.claude/settings.json`
3. Check if hooks are registered:
   ```bash
   node -e "const s=require(require('os').homedir()+'/.claude/settings.json');console.log(JSON.stringify({pre:!!s.hooks?.PreToolUse,post:!!s.hooks?.PostToolUse}))"
   ```
4. If hooks are missing, offer to install them
5. Note: timing data only exists for the **current session onwards** — previous sessions have no retroactive data

### Step 7: Quick Health Summary

Combine SYNAPSE health + Performance into a single status line:

- **Healthy + Fast**: "SYNAPSE 100% | Session: Xs wall, Y% thinking"
- **Healthy + Slow**: "SYNAPSE 100% | Session: Xs wall, Y% thinking — bottleneck: [detail]"
- **Degraded**: "SYNAPSE N warnings | Session: Xs wall — [top issue]"
- **Broken**: "SYNAPSE N critical issues — fix before performance analysis"
- **No timing**: "SYNAPSE [status] | Timing hooks not active — run next session for data"

## Context

This diagnostic checks:
1. **Hook Status** - Is the synapse-engine hook registered and functional?
2. **Session Status** - Does the session have active_agent, prompt_count, bracket?
3. **Manifest Integrity** - Do all manifest domains have corresponding files?
4. **Pipeline Simulation** - For the current bracket, which layers should be active?
5. **UAP Bridge** - Did the UAP write _active-agent.json at activation?
6. **Memory Bridge** - Is Pro available? Does the bracket require memory hints?
7. **Gaps & Recommendations** - Prioritized list of issues with fixes
8. **Session Performance** - Exact timing of every tool call, thinking gaps, bottleneck diagnosis

## When to Use

- After activating an agent, to verify SYNAPSE is injecting the right context
- When agent-specific rules seem to be missing from responses
- When debugging context injection issues
- **When activation or responses feel slow** — timing data pinpoints exactly where time is spent
- As part of story development for SYNAPSE-related changes
- Periodically to verify system health

## Dependencies

- **Timing hooks**: `~/.claude/hooks/timing-logger.js` (PreToolUse/PostToolUse)
- **Timing analyzer**: `~/.claude/hooks/analyze-timing.js` (CLI report)
- **SYNAPSE diagnostics**: `.aios-core/core/synapse/diagnostics/synapse-diagnostics.js`

## Quick Commands

```bash
# Full diagnostic (this skill)
/synapse:tasks:diagnose-synapse

# Timing report only (CLI)
node ~/.claude/hooks/analyze-timing.js

# Timing for specific date
node ~/.claude/hooks/analyze-timing.js 2026-02-17

# Last N entries
node ~/.claude/hooks/analyze-timing.js --last 50
```
