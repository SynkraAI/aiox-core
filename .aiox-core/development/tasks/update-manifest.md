---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: updateManifest()
responsável: Dex (Builder)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: target
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must exist in system

- campo: changes
  tipo: object
  origem: User Input
  obrigatório: true
  validação: Valid modification object

- campo: backup
  tipo: boolean
  origem: User Input
  obrigatório: false
  validação: Default: true

**Saída:**
- campo: modified_file
  tipo: string
  destino: File system
  persistido: true

- campo: backup_path
  tipo: string
  destino: File system
  persistido: true

- campo: changes_applied
  tipo: object
  destino: Memory
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Target exists; backup created; valid modification parameters
    tipo: pre-condition
    blocker: true
    validação: |
      Check target exists; backup created; valid modification parameters
    error_message: "Pre-condition failed: Target exists; backup created; valid modification parameters"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Modification applied; backup preserved; integrity verified
    tipo: post-condition
    blocker: true
    validação: |
      Verify modification applied; backup preserved; integrity verified
    error_message: "Post-condition failed: Modification applied; backup preserved; integrity verified"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Changes applied correctly; original backed up; rollback possible
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert changes applied correctly; original backed up; rollback possible
    error_message: "Acceptance criterion not met: Changes applied correctly; original backed up; rollback possible"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** file-system
  - **Purpose:** File reading, modification, and backup
  - **Source:** Node.js fs module

- **Tool:** ast-parser
  - **Purpose:** Parse and modify code safely
  - **Source:** .aiox-core/utils/ast-parser.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** modify-file.js
  - **Purpose:** Safe file modification with backup
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/modify-file.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Target Not Found
   - **Cause:** Specified resource does not exist
   - **Resolution:** Verify target exists before modification
   - **Recovery:** Suggest similar resources or create new

2. **Error:** Backup Failed
   - **Cause:** Unable to create backup before modification
   - **Resolution:** Check disk space and permissions
   - **Recovery:** Abort modification, preserve original state

3. **Error:** Concurrent Modification
   - **Cause:** Resource modified by another process
   - **Resolution:** Implement file locking or retry logic
   - **Recovery:** Retry with exponential backoff or merge changes

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-5 min (estimated)
cost_estimated: $0.001-0.003
token_usage: ~1,000-3,000 tokens
```

**Optimization Notes:**
- Parallelize independent operations; reuse atom results; implement early exits

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - automation
  - workflow
updated_at: 2025-11-17
```

---

checklists:
  - change-checklist.md
---

# Update Manifest

## Purpose
To safely update team manifest files with new agent entries while maintaining YAML integrity and preventing corruption.

## Prerequisites
- User authorization verified
- Agent file already created
- Backup capability available
- YAML parser loaded

## Interactive Elicitation Process

### Step 1: Manifest Selection
```
ELICIT: Target Manifest
1. Which team manifest to update? 
   - team-all.yaml (all agents)
   - team-fullstack.yaml (full stack development)
   - team-no-ui.yaml (backend only)
   - team-ide-minimal.yaml (minimal IDE setup)
2. Is this the correct manifest for the agent's purpose?
```

### Step 2: Agent Categorization
```
ELICIT: Agent Classification
1. What category does this agent belong to?
   - development (coding, implementation)
   - planning (PM, PO, architecture)
   - quality (QA, testing, validation)
   - specialty (UX, data, security)
   - meta (framework, tooling)
2. What tags should be applied? (comma-separated)
3. Any special notes or restrictions?
```

### Step 3: Team Composition
```
ELICIT: Team Integration
1. Should this agent be included by default? (yes/no)
2. Are there any agent dependencies?
3. Should this replace an existing agent?
4. Any incompatible agents?
```

## Implementation Steps

1. **Backup Current Manifest**
   ```javascript
   const backupPath = `${manifestPath}.backup-${Date.now()}`;
   await fs.copy(manifestPath, backupPath);
   console.log(`✅ Backup created: ${backupPath}`);
   ```

2. **Load and Parse Manifest**
   ```javascript
   const manifestContent = await fs.readFile(manifestPath, 'utf8');
   const manifest = yaml.load(manifestContent);
   
   // Validate structure
   if (!manifest.team || !manifest.agents) {
     throw new Error('Invalid manifest structure');
   }
   ```

3. **Check for Duplicates**
   ```javascript
   const agentExists = manifest.agents.some(a => 
     a.id === agentId || a.file === agentFile
   );
   
   if (agentExists) {
     // Prompt: Update existing or create new entry?
   }
   ```

4. **Add Agent Entry**
   ```yaml
   agents:
     - id: {agent-id}
       file: agents/{agent-name}.md
       name: {Agent Display Name}
       category: {category}
       tags:
         - {tag1}
         - {tag2}
       whenToUse: {description}
       defaultIncluded: {true|false}
   ```

5. **Validate Updated Manifest**
   ```javascript
   // Validate YAML syntax
   try {
     yaml.load(yaml.dump(manifest));
   } catch (error) {
     console.error('❌ Invalid YAML generated');
     // Restore from backup
   }
   
   // Validate agent references
   for (const agent of manifest.agents) {
     const agentPath = path.join(root, agent.file);
     if (!await fs.exists(agentPath)) {
       console.warn(`⚠️ Agent file not found: ${agent.file}`);
     }
   }
   ```

6. **Write Updated Manifest**
   ```javascript
   const updatedYaml = yaml.dump(manifest, {
     indent: 2,
     lineWidth: -1,
     noRefs: true,
     sortKeys: false
   });
   
   await fs.writeFile(manifestPath, updatedYaml, 'utf8');
   ```

7. **Update Memory Layer**
   ```javascript
   await memoryClient.addMemory({
     type: 'manifest_updated',
     manifest: manifestName,
     action: 'agent_added',
     agent: agentId,
     backup: backupPath,
     timestamp: new Date().toISOString(),
     user: currentUser
   });
   ```

8. **Verify Manifest Integrity**
   - Attempt to load the updated manifest
   - Check all agent references are valid
   - Ensure no corruption occurred
   - Test with actual agent activation

## Validation Checklist
- [ ] Backup created successfully
- [ ] Manifest structure preserved
- [ ] No duplicate entries
- [ ] YAML syntax valid
- [ ] All agent files exist
- [ ] Memory layer updated
- [ ] Manifest loads correctly

## Error Handling
- If backup fails: Abort operation
- If parse fails: Show error, don't proceed
- If duplicate found: Offer options
- If write fails: Restore from backup
- If validation fails: Restore and report

## Rollback Procedure
```javascript
if (errorOccurred) {
  console.log('🔄 Rolling back changes...');
  try {
    await fs.copy(backupPath, manifestPath);
    
    // Verify rollback success
    const rolledBackContent = await fs.readFile(manifestPath, 'utf8');
    const rolledBackManifest = yaml.load(rolledBackContent);
    
    if (rolledBackManifest && rolledBackManifest.agents) {
      console.log('✅ Rollback complete - manifest restored');
    } else {
      console.error('❌ Rollback verification failed - manual intervention required');
      console.error(`Backup location: ${backupPath}`);
    }
  } catch (rollbackError) {
    console.error('❌ CRITICAL: Rollback failed!', rollbackError);
    console.error(`Manual restore required from: ${backupPath}`);
  }
}
```

## Success Output
```
✅ Manifest updated successfully!
📁 Manifest: {manifest-name}
🤖 Agent added: {agent-name}
📂 Backup saved: {backup-path}
🔍 Verification:
   - YAML syntax: ✓
   - Agent files: ✓
   - No duplicates: ✓
📝 Next steps:
   1. Test agent activation
   2. Verify team composition
   3. Commit changes
```

## Security Notes
- Always create backup before modification
- Validate all paths to prevent traversal
- Log all manifest changes
- Require authorization for manifest updates
- Keep audit trail of all modifications 