---
task: map-mind
agent: mind-mapper
params:
  - person_name (required)
  - force_mode (optional)
  - materials_path (optional)
elicit: true

mcp_integration:
  exa:
    usage: "Public figure detection in auto-detect-workflow"
    trigger: "Step 2: Detect Mode"
    tool: mcp__docker-gateway__web_search_exa
  context7:
    usage: "Prompt best practices reference (optional)"
    trigger: "Phase 5: System Prompt"
    tool: mcp__docker-gateway__get-library-docs
  playwright:
    usage: "Automated fidelity testing (optional)"
    trigger: "Phase 6: Validation"
    tools:
      - mcp__playwright__browser_navigate
      - mcp__playwright__browser_snapshot
      - mcp__playwright__browser_type

service_integration:
  source_adapter:
    usage: "Document parsing, YouTube extraction, blog collection"
    trigger: "Phase 1: Research Collection"
  project_adapter:
    usage: "ClickUp project tracking (optional)"
    trigger: "All phases"
---

# Map Mind Clone

**Purpose:** Ultra-simple command for creating or updating mind clones with full auto-detection.

**Command:** `*map {person_name}`

---

## 🎯 What This Does

The `*map` command is the **single entry point** for all mind clone operations. It:
1. Auto-detects whether to create (greenfield) or update (brownfield)
2. Auto-detects source type (public vs no-public)
3. Routes to the correct workflow with the correct mode
4. Handles all complexity internally

**User doesn't need to know about:**
- Greenfield vs brownfield
- Public vs no-public modes
- Which workflow file to use
- Mode parameters

---

## 📋 Usage

### Basic Usage (Auto-detect Everything)

```bash
*map daniel_kahneman    # Create new public figure clone
*map pedro_valerio      # Create new or update existing (guided)
*map jose_amorim        # Update existing clone
```

### Advanced Usage (Override Auto-detection)

```bash
*map {name} --force-mode=public                   # Force specific mode
*map {name} --force-mode=no-public-interviews     # Force interview workflow
*map {name} --materials-path=./sources/jose/      # Provide materials path
*map --help                                       # Show help text
```

---

## 🔍 Auto-Detection Logic

### Step 1: Check Workflow Type (Greenfield vs Brownfield)

```python
if squads/mmos-squad/minds/{slug}/ exists:
    workflow_type = "brownfield"
else:
    workflow_type = "greenfield"
```

### Step 2: Detect Mode (If Greenfield)

```python
if materials_path provided:
    mode = "no-public-materials"
elif web_content_found(person_name):
    mode = "public"
else:
    # Ask user
    mode = ask_user("Choose: 1. Interviews  2. Materials")
```

### Step 3: Detect Mode (If Brownfield)

```python
metadata = load(f"squads/mmos-squad/minds/{slug}/metadata.yaml")
source_type = metadata['source_type']

if source_type == "public":
    mode = "public-update"
elif source_type == "no-public-interviews":
    mode = "no-public-incremental"
else:
    mode = "no-public-migration"
```

### Step 4: Execute Workflow

```python
if workflow_type == "greenfield":
    execute("workflows/greenfield-mind.yaml", mode=mode)
else:
    execute("workflows/brownfield-mind.yaml", mode=mode)
```

---

## 📊 Logging

All detection decisions are logged transparently:

```
🔍 Auto-detecting workflow for 'daniel_kahneman'...
✅ Detected: greenfield (no existing clone)
🌐 Web search: Found public content (Wikipedia, books, interviews)
✅ Detected mode: public
🚀 Executing: greenfield-mind.yaml (mode: public)
---
📍 Phase 0: Viability Assessment
...
```

---

## ❌ Error Handling

### Scenario 1: Ambiguous Detection

```
❌ Could not auto-detect workflow mode for 'unknown_person'.

Reason: No web content found and no materials provided.

Please specify manually:
  *map unknown_person --force-mode=public
  *map unknown_person --force-mode=no-public-interviews
  *map unknown_person --materials-path=./sources/
```

### Scenario 2: Invalid Mode

```
❌ Invalid mode: 'invalid-mode'

Valid modes:
  - public
  - no-public-interviews
  - no-public-materials
  - public-update
  - no-public-incremental
  - no-public-migration
```

### Scenario 3: Materials Path Not Found

```
❌ Materials path not found: './sources/invalid/'

Please provide a valid directory path containing source materials.
```

---

## 📝 Implementation

### Function Signature

```python
def map_mind(person_name: str, force_mode: str = None, materials_path: str = None):
    """
    Ultra-simple mind cloning command.

    Args:
        person_name: Name of person to clone (e.g., "Daniel Kahneman")
        force_mode: Override auto-detection (optional)
        materials_path: Path to source materials (optional)

    Returns:
        dict: Execution result with status, workflow, mode, outputs

    Examples:
        >>> map_mind("daniel_kahneman")
        {'status': 'completed', 'workflow': 'greenfield', 'mode': 'public', ...}

        >>> map_mind("pedro_valerio", force_mode="no-public-interviews")
        {'status': 'completed', 'workflow': 'greenfield', 'mode': 'no-public-interviews', ...}
    """
```

### Implementation Steps

1. **Parse Arguments**
   - Convert person_name to slug
   - Validate force_mode if provided
   - Validate materials_path if provided

2. **Check Override Flags**
   - If force_mode: skip detection, use specified mode
   - If materials_path: force mode = no-public-materials

3. **Auto-Detect (if no override)**
   - Call `auto_detect_workflow(slug)`
   - Get workflow_type and mode
   - Log detection results

4. **Route to Workflow**
   - Determine workflow file (greenfield-mind.yaml or brownfield-mind.yaml)
   - Prepare context (mode, slug, materials_path, etc.)
   - Execute workflow

5. **Handle Execution**
   - Monitor workflow progress
   - Handle human checkpoints
   - Log completion status

---

## 🧪 Examples

### Example 1: Public Figure (Auto-detect)

**Command:**
```bash
*map daniel_kahneman
```

**Output:**
```
🔍 Auto-detecting workflow for 'daniel_kahneman'...
✅ Detected: greenfield (no existing clone)
🌐 Web search: Found extensive public content
✅ Detected mode: public
🚀 Executing: greenfield-mind.yaml (mode: public)

📍 Phase 0: Viability Assessment (APEX scoring)
   APEX Score: 92/100 ✅ (AUTO-APPROVE)

📍 Phase 1: Research Collection (web scraping)
   Sources collected: 47
   - 12 books
   - 23 articles
   - 8 podcasts
   - 4 videos

📍 Phase 2: DNA Mental™ Analysis (Layers 1-8)
   ...
```

### Example 2: No-Public with Guided Selection

**Command:**
```bash
*map pedro_valerio
```

**Output:**
```
🔍 Auto-detecting workflow for 'pedro_valerio'...
✅ Detected: greenfield (no existing clone)
🌐 Web search: No public content found

❓ Source Collection Method:
   1. Conduct 5 structured interview sessions
   2. Process provided materials (documents, transcripts, emails)

Choose option [1-2]: _
```

**User selects:** `1`

**Output continues:**
```
✅ Selected mode: no-public-interviews
🚀 Executing: greenfield-mind.yaml (mode: no-public-interviews)

📍 Phase 1: Interview Protocol Preparation
   Preparing 5-session interview structure...
```

### Example 3: Update Existing Clone

**Command:**
```bash
*map joao_lozano
```

**Output:**
```
🔍 Auto-detecting workflow for 'joao_lozano'...
✅ Detected: brownfield (existing clone found)
📄 Reading metadata: squads/mmos-squad/minds/joao_lozano/metadata.yaml
   Source type: no-public-interviews
✅ Detected mode: no-public-incremental
🚀 Executing: brownfield-mind.yaml (mode: no-public-incremental)

📍 Phase 0: Brownfield Assessment
   ⚠️  CREATING BACKUP: .backup-20251025-1430/
   ✅ Backup complete

   Current state:
   - System prompt: v2.1
   - KB chunks: 47
   - Last update: 2025-10-20

📍 Phase 1: Incremental Research
   New materials to process:
   - 3 new interview transcripts
   - 1 written reflection
```

### Example 4: Force Mode (Override)

**Command:**
```bash
*map test_person --force-mode=public
```

**Output:**
```
🔧 Force mode: public (skipping auto-detection)
🚀 Executing: greenfield-mind.yaml (mode: public)

📍 Phase 0: Viability Assessment
   ...
```

### Example 5: Provided Materials

**Command:**
```bash
*map jose_amorim --materials-path=./sources/jose/
```

**Output:**
```
📁 Materials provided: ./sources/jose/
✅ Detected mode: no-public-materials
🚀 Executing: greenfield-mind.yaml (mode: no-public-materials)

📍 Phase 1: Materials Processing
   Scanning: ./sources/jose/
   Found:
   - 5 interview transcripts
   - 12 written documents
   - 1 email archive (MBOX)
   - 3 work samples
```

---

## 🆘 Help Text

**Command:**
```bash
*map --help
```

**Output:**
```
MMOS Map Command - Ultra-Simple Mind Clone Creation

Usage:
  *map {person_name}                          Auto-detect everything
  *map {person_name} --force-mode={mode}      Override auto-detection
  *map {person_name} --materials-path={path}  Provide materials

The system automatically detects:
  ✅ Greenfield vs Brownfield (based on existing clone)
  ✅ Public vs No-Public (based on web content availability)
  ✅ Correct workflow and mode for execution

Examples:
  *map daniel_kahneman        Create new public figure clone
  *map pedro_valerio          Create new private clone (guided)
  *map jose_amorim            Update existing clone

Advanced Options:
  --force-mode={mode}         Force specific mode (skip detection)
                              Valid modes:
                                - public
                                - no-public-interviews
                                - no-public-materials
                                - public-update
                                - no-public-incremental
                                - no-public-migration

  --materials-path={path}     Path to source materials directory
                              Forces mode: no-public-materials

  --help                      Show this help text

For more info: See .claude/commands/mmosMapper/README.md
```

---

## ✅ Success Criteria

Task is complete when:
- [ ] `*map {name}` executes end-to-end
- [ ] Auto-detection integrates with Story 1 (auto_detect_workflow)
- [ ] Routing to correct workflow works
- [ ] Logging is transparent and helpful
- [ ] Help text is complete and clear
- [ ] Error handling provides actionable guidance
- [ ] Override flags work correctly
- [ ] All 5 example scenarios work

---

## 🔗 Dependencies

- **Story 1:** Auto-detection engine (`tasks/auto-detect-workflow.md`)
- **Story 2:** Consolidated workflows (`workflows/greenfield-mind.yaml`, `workflows/brownfield-mind.yaml`)
- **Story 4:** Metadata management (`lib/metadata_manager.py`)

---

**Task Created:** 2025-10-25
**Owner:** MMOS Team
**Estimated Effort:** 6 hours
