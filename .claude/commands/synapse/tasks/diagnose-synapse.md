# SYNAPSE Diagnostics Task

Run a comprehensive diagnostic of the SYNAPSE context engine, comparing expected vs. actual pipeline state.

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

### Step 4: Quick Health Summary

Provide a one-line summary:
- **Healthy**: All checks PASS - "SYNAPSE pipeline operating at 100%"
- **Degraded**: Some WARN items - "SYNAPSE pipeline functional with N warnings"
- **Broken**: Any FAIL items - "SYNAPSE pipeline has N critical issues"

## Context

This diagnostic checks:
1. **Hook Status** - Is the synapse-engine hook registered and functional?
2. **Session Status** - Does the session have active_agent, prompt_count, bracket?
3. **Manifest Integrity** - Do all manifest domains have corresponding files?
4. **Pipeline Simulation** - For the current bracket, which layers should be active?
5. **UAP Bridge** - Did the UAP write _active-agent.json at activation?
6. **Memory Bridge** - Is Pro available? Does the bracket require memory hints?
7. **Gaps & Recommendations** - Prioritized list of issues with fixes

## When to Use

- After activating an agent, to verify SYNAPSE is injecting the right context
- When agent-specific rules seem to be missing from responses
- When debugging context injection issues
- As part of story development for SYNAPSE-related changes
- Periodically to verify system health
