# Task: Plan MCP Server Integration

**Task ID:** CCM-PI-005
**Version:** 1.0.0
**Command:** `*mcp-integration-plan`
**Agent:** Conduit (project-integrator)
**Purpose:** Plan MCP server integration for a project by analyzing needs, mapping capabilities to available servers, estimating context budget impact, and prioritizing by ROI.

---

## Overview

```
  Project Analysis
       |
       v
  +---------------------+
  | 1. Analyze Project   |
  |    Needs             |
  +---------------------+
       |
       v
  +---------------------+
  | 2. Map Capabilities  |
  |    to Available MCPs |
  +---------------------+
       |
       v
  +---------------------+
  | 3. Estimate Context  |
  |    Budget Impact     |
  +---------------------+
       |
       v
  +---------------------+
  | 4. Prioritize by ROI |
  +---------------------+
       |
       v
  +---------------------+
  | 5. Create Integration|
  |    Plan              |
  +---------------------+
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| project_path | string | User or cwd | Yes | Valid project directory |
| budget | enum | User | No | `minimal` (1-2 MCPs), `standard` (3-5), `full` (no limit) |
| priorities | string[] | User | No | e.g., ["documentation", "web search", "database", "browser testing"] |

---

## Preconditions

- Project directory accessible for analysis
- Understanding of available MCP ecosystem (official + community)

---

## Execution Phases

### Phase 1: Analyze Project Needs

Examine the project to identify where MCP servers would add value:

1. **Technology stack**: what frameworks, languages, databases are used
2. **External dependencies**: APIs consumed, services integrated
3. **Development workflow**: what tasks developers repeat frequently
4. **Documentation needs**: which libraries lack good inline docs
5. **Testing needs**: browser testing, API testing, E2E scenarios
6. **Data needs**: web search, scraping, research tasks

Produce a needs matrix:

| Need Category | Specific Need | Frequency | Current Solution |
|---------------|---------------|-----------|-----------------|
| Documentation | React docs lookup | Daily | Manual browser search |
| Database | Query execution | Hourly | Copy-paste to psql |
| Search | Find code examples | Daily | Manual Google search |

### Phase 2: Map Capabilities to Available MCPs

Match identified needs to available MCP servers:

**Official/Stable MCPs:**
| MCP Server | Capabilities | Transport | Best For |
|------------|-------------|-----------|----------|
| context7 | Library documentation | stdio | Framework/library docs |
| playwright | Browser automation | stdio | Web testing, screenshots |
| postgres/supabase | Database queries | stdio | DB operations |
| filesystem | File operations | stdio | Cross-directory access |

**Community MCPs:**
| MCP Server | Capabilities | Maturity | Best For |
|------------|-------------|----------|----------|
| exa | Web search | Stable | Research, finding examples |
| apify | Web scraping | Stable | Data extraction |
| github | GitHub API | Stable | Issue/PR management |
| linear/jira | Project management | Varies | Task tracking |

For each need, list candidate MCPs with fit score (1-5).

### Phase 3: Estimate Context Budget Impact

Each MCP server has a context cost. Estimate:

1. **Tool registration cost**: number of tools exposed, description token count
2. **Per-call cost**: average input/output size of tool calls
3. **Startup latency**: time to initialize the server
4. **Memory footprint**: resources consumed while running

Calculate context budget:
```
Total context overhead = sum(tools_per_mcp * avg_description_tokens)
% of 200K context window used by MCP registrations
```

**Budget guidelines:**
| Budget Level | Max MCP Overhead | Max Servers |
|-------------|-----------------|-------------|
| Minimal | < 2% context window | 1-2 servers |
| Standard | < 5% context window | 3-5 servers |
| Full | < 10% context window | No hard limit |

Flag any MCP that registers more than 20 tools (context-heavy).

### Phase 4: Prioritize by ROI

Score each candidate MCP:

```
ROI = (frequency_of_need * time_saved_per_use) / (context_cost + setup_effort)
```

Where:
- **frequency_of_need**: daily=5, weekly=3, monthly=1
- **time_saved_per_use**: minutes saved vs manual approach
- **context_cost**: token overhead (normalized 1-5)
- **setup_effort**: configuration difficulty (1=trivial, 5=complex)

Rank all candidates by ROI score descending.

### Phase 5: Create Integration Plan

Produce the final plan with phased rollout:

**Phase A (Day 1)**: highest ROI MCPs, zero or minimal configuration
**Phase B (Week 1)**: medium ROI MCPs, moderate setup required
**Phase C (As needed)**: lower ROI MCPs, add when specific need arises

For each MCP in the plan:
1. Configuration snippet for settings.json
2. Required environment variables or credentials
3. Verification command to test connectivity
4. Expected context budget impact

---

## Output Format

```markdown
## MCP Integration Plan

**Project:** {project_path}
**Budget:** {budget_level}
**Date:** {YYYY-MM-DD}

### Needs Analysis

| Need | Frequency | Matched MCP | ROI Score |
|------|-----------|-------------|-----------|
| {need} | {freq} | {mcp} | {score} |

### Context Budget

| MCP Server | Tools | Est. Tokens | % Window |
|------------|-------|-------------|----------|
| {mcp} | {N} | {N} | {N}% |
| **Total** | | | {N}% |

### Rollout Plan

#### Phase A: Immediate (Day 1)
1. **{mcp_name}**: {reason}
   - ROI: {score}
   - Config:
     ```json
     { "mcpServers": { "{name}": { ... } } }
     ```
   - Verify: {command}

#### Phase B: Short-term (Week 1)
1. **{mcp_name}**: {reason}

#### Phase C: On-demand
1. **{mcp_name}**: {reason}

### Excluded MCPs

| MCP | Reason for Exclusion |
|-----|---------------------|
| {mcp} | {reason} |
```

---

## Veto Conditions

- **NEVER** recommend MCPs that require credentials the user has not agreed to provide
- **NEVER** exceed the stated budget level without explicit user approval
- **NEVER** recommend experimental or abandoned MCPs without flagging maturity risk
- **NEVER** install or configure MCPs in this task -- this task produces a plan only

---

## Completion Criteria

- [ ] Project needs analyzed with frequency assessment
- [ ] Available MCPs mapped to identified needs
- [ ] Context budget estimated for each candidate
- [ ] ROI scores calculated and ranked
- [ ] Phased integration plan created with configuration snippets
- [ ] Budget compliance verified
- [ ] Plan delivered in standard format
