---
task-id: auto-detect-workflow
name: Auto-Detect Workflow & Mode
agent: mapper
version: 1.0.0
purpose: Automatically detect whether to run greenfield or brownfield workflow and determine the appropriate mode based on available data

workflow-mode: automatic
elicit: conditional
elicitation-type: choice

prerequisites:
  - person_slug provided by user
  - metadata_manager.py functions available

inputs:
  - name: person_slug
    type: string
    description: File-safe slug of the person (e.g., "pedro_valerio", "daniel_kahneman")
    required: true
    example: "pedro_valerio"

  - name: person_name
    type: string
    description: Human-readable name for web search (optional, defaults to slug)
    required: false
    example: "Pedro Valério"

outputs:
  - workflow_type
    type: enum
    description: Type of workflow to execute
    options: ["greenfield", "brownfield"]

  - mode
    type: enum
    description: Mode for the selected workflow
    options:
      - "public" (greenfield: public content available)
      - "no-public-interviews" (greenfield: conduct interviews)
      - "no-public-materials" (greenfield: user-provided materials)
      - "public-update" (brownfield: update public content mind)
      - "no-public-incremental" (brownfield: update private mind)

  - decision_log
    type: string
    description: Human-readable explanation of detection decisions

dependencies:
  lib:
    - metadata_manager.py
    - workflow_detector.py (to be created)

validation:
  success-criteria:
    - "workflow_type is determined (greenfield or brownfield)"
    - "mode is determined and logged"
    - "Decision log provides transparency"
    - "User is only prompted when truly ambiguous"

  warning-conditions:
    - "Web search API unavailable (fallback to user input)"
    - "metadata.yaml exists but is malformed"
    - "sources/ directory exists but is empty"

  failure-conditions:
    - "person_slug is empty or invalid"
    - "Unable to read squads/mmos-squad/minds/ directory"

estimated-duration: "5-15 seconds (includes web search)"

mcp_integration:
  exa:
    usage: "Public figure detection via web search"
    required: false
    fallback: "Brave API or DuckDuckGo if MCP unavailable"
    tool: mcp__docker-gateway__web_search_exa
---

# Auto-Detect Workflow & Mode Task

## MCP Integration: EXA for Public Figure Detection

**Use EXA MCP for robust public figure detection:**

### Detection Search

```
mcp__docker-gateway__web_search_exa
Query: "{person_name}"
numResults: 10
```

### Detection Logic with EXA

- **5+ results** with name in title/description → `mode = "public"`
- **Wikipedia page found** → `mode = "public"`
- **Book on Amazon/Goodreads** → `mode = "public"`
- **< 5 relevant results** → Check sources/ or ask user

### Fallback (if MCP unavailable)

- Uses Brave API (if `BRAVE_API_KEY` set)
- Falls back to DuckDuckGo Instant Answer API
- Conservative: defaults to user input if uncertain

---

## Purpose

Automatically determine which MMOS workflow to execute and which mode to use based on existing data, metadata, and quick web searches. This eliminates the need for users to understand internal architecture—they simply type `*map {name}` and the system handles the rest.

**Performance Target:** <5s for cached decisions, <15s with web search

## When to Use This Task

**Use this task when:**
- User invokes `*map {name}` without specifying workflow type
- Starting any mind mapping process where workflow is unknown
- System needs to intelligently route to greenfield or brownfield

**Do NOT use this task when:**
- User explicitly specifies workflow type (e.g., `*map-greenfield`)
- Running internal workflow steps (use direct workflow invocation)

## Decision Tree

```
*map {slug}
    │
    ├─ Does squads/mmos-squad/minds/{slug}/ exist?
    │   ├─ NO → GREENFIELD
    │   └─ YES → Check metadata.yaml
    │       ├─ metadata.yaml missing? → GREENFIELD (interrupted)
    │       └─ metadata.yaml exists → Check pipeline_status
    │           ├─ status < "completed" → GREENFIELD (continue)
    │           └─ status == "completed" → BROWNFIELD
    │
    ├─ GREENFIELD MODE DETECTION:
    │   ├─ Run quick_web_search({name})
    │   │   ├─ Content found? → mode = "public"
    │   │   └─ No content → Check sources/
    │   │       ├─ sources/ has files? → mode = "no-public-materials"
    │   │       └─ sources/ empty → ASK USER
    │   │           ├─ 1. Interviews → mode = "no-public-interviews"
    │   │           └─ 2. Materials → mode = "no-public-materials"
    │
    └─ BROWNFIELD MODE DETECTION:
        └─ Read metadata.yaml → extract source_type
            ├─ source_type == "public" → mode = "public-update"
            ├─ source_type == "no-public-interviews" → mode = "no-public-incremental"
            └─ source_type == "no-public-materials" → mode = "no-public-incremental"
```

## Key Activities & Instructions

### Step 1: Detect Workflow Type (Greenfield vs Brownfield)

**Check if mind directory exists:**

```python
from lib.workflow_detector import detect_workflow_type

workflow_type = detect_workflow_type(person_slug)
# Returns: "greenfield" | "brownfield"
```

**Logic:**
1. Check if `squads/mmos-squad/minds/{slug}/` exists
2. If NO → `greenfield` (new mind)
3. If YES → Check `metadata.yaml`
   - Missing → `greenfield` (interrupted previously)
   - Exists → Read `pipeline_status`
     - `< "completed"` → `greenfield` (resume)
     - `== "completed"` → `brownfield` (update)

**Log decision:**
```
✓ Workflow Type: greenfield (mind directory not found)
✓ Workflow Type: brownfield (pipeline status: completed)
```

### Step 2: Detect Mode (Greenfield)

**If workflow_type == "greenfield":**

```python
from lib.workflow_detector import detect_greenfield_mode

mode = detect_greenfield_mode(person_slug, person_name)
# Returns: "public" | "no-public-interviews" | "no-public-materials"
```

**Logic:**
1. Run `quick_web_search(person_name)`
   - If content found → `mode = "public"`

2. If no web content, check `squads/mmos-squad/minds/{slug}/sources/`
   - If directory has files → `mode = "no-public-materials"`

3. If neither condition true, **ask user:**
   ```
   No public content found for {person_name}.
   How would you like to create this cognitive clone?

   1. Conduct interviews (8-12 hours, highest fidelity)
   2. I have materials (transcripts, documents, emails)

   Type 1 or 2:
   ```
   - Choice 1 → `mode = "no-public-interviews"`
   - Choice 2 → `mode = "no-public-materials"`

**Log decision:**
```
ℹ Web Search: Found 15+ results for "Daniel Kahneman"
✓ Mode: public

ℹ Web Search: No results found for "Pedro Valério"
ℹ Sources Check: Found 3 files in sources/
✓ Mode: no-public-materials

⚠ Web Search: No results found
⚠ Sources: Directory empty
→ Asking user for input method...
✓ Mode: no-public-interviews (user selected)
```

### Step 3: Detect Mode (Brownfield)

**If workflow_type == "brownfield":**

```python
from lib.workflow_detector import detect_brownfield_mode

mode = detect_brownfield_mode(person_slug)
# Returns: "public-update" | "no-public-incremental"
```

**Logic:**
1. Read `squads/mmos-squad/minds/{slug}/metadata.yaml`
2. Extract `source_type`
3. Map to brownfield mode:
   - `source_type == "public"` → `mode = "public-update"`
   - `source_type == "no-public-interviews"` → `mode = "no-public-incremental"`
   - `source_type == "no-public-materials"` → `mode = "no-public-incremental"`

**Log decision:**
```
✓ Metadata: source_type = "no-public-interviews"
✓ Mode: no-public-incremental
```

### Step 4: Return Detection Results

**Output format:**

```python
{
    "workflow_type": "greenfield",
    "mode": "public",
    "decision_log": [
        "Mind directory not found → greenfield",
        "Web search found 15+ results → public mode"
    ]
}
```

## Usage Example

```python
from lib.workflow_detector import auto_detect_workflow

# Invoke detection
result = auto_detect_workflow(
    person_slug="pedro_valerio",
    person_name="Pedro Valério"
)

print(f"Workflow: {result['workflow_type']}")
print(f"Mode: {result['mode']}")
print("\nDecision Log:")
for decision in result['decision_log']:
    print(f"  - {decision}")

# Use result to invoke correct workflow
if result['workflow_type'] == "greenfield":
    invoke_greenfield_workflow(result['mode'])
else:
    invoke_brownfield_workflow(result['mode'])
```

## Error Handling

**Web Search Unavailable:**
- Log warning: "Web search API unavailable, falling back to user input"
- Proceed to check sources/ or ask user

**Malformed Metadata:**
- Log error: "metadata.yaml is malformed, treating as greenfield"
- Continue with greenfield flow

**Invalid User Input:**
- Re-prompt user with clear instructions
- Provide validation: "Please type 1 or 2"

**No Write Permissions:**
- Fail gracefully with clear error message
- "Unable to access squads/mmos-squad/minds/ directory. Check permissions."

## Performance Considerations

**Caching:**
- Cache web search results for 24 hours per person_name
- Cache metadata reads during single session

**Timeouts:**
- Web search timeout: 5 seconds
- Metadata read timeout: 1 second
- User input timeout: None (wait for user)

**Fallbacks:**
- Always have fallback to user input if automated detection fails
- Never block execution due to API unavailability

## Testing Requirements

Minimum test coverage:
- ✅ Greenfield: directory not found
- ✅ Greenfield: metadata missing (interrupted)
- ✅ Greenfield: pipeline incomplete (resume)
- ✅ Brownfield: pipeline completed
- ✅ Public mode: web search success
- ✅ No-public-materials: sources/ exists
- ✅ No-public-interviews: user input
- ✅ Brownfield context-aware: metadata read

---

**Task Owner:** MMOS Team
**Part of:** Epic E001 - Workflow Auto-Detection & Consolidation
**Dependencies:** Story 4 (Metadata & State Management)
**Created:** 2025-10-25
