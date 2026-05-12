# MCP Workflow Creation Task

> Create Code Mode workflows that execute in Docker MCP sandbox for ~98.7% token savings.

---

## Task Definition

```yaml
task: mcpWorkflow()
responsavel: Dev Agent
responsavel_type: Agente
atomic_layer: Development
elicit: true

**Entrada:**
- campo: workflow_name
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Kebab-case name (e.g., scrape-process-store)

- campo: workflow_description
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Brief description of workflow purpose

- campo: mcps_required
  tipo: array
  origem: User Selection
  obrigatorio: true
  validacao: List of MCPs the workflow will use

- campo: input_params
  tipo: object
  origem: User Input
  obrigatorio: false
  validacao: Input parameters specification

- campo: output_format
  tipo: string
  origem: User Selection
  obrigatorio: false
  validacao: json, text, or custom

**Saida:**
- campo: workflow_file
  tipo: file
  destino: scripts/mcp-workflows/{workflow_name}.js
  persistido: true

- campo: workflow_meta
  tipo: object
  destino: Console output
  persistido: false
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Docker MCP Toolkit available
    tipo: pre-condition
    blocker: true
    validacao: docker mcp --version succeeds
    error_message: "Docker MCP Toolkit not installed"

  - [ ] Required MCPs enabled
    tipo: pre-condition
    blocker: true
    validacao: All specified MCPs available in docker mcp tools ls
    error_message: "Missing MCPs - add with *add-mcp"

  - [ ] Workflow directory exists
    tipo: pre-condition
    blocker: false
    validacao: scripts/mcp-workflows/ directory exists
    error_message: "Will create directory automatically"
```

---

## Interactive Elicitation

### Step 1: Workflow Basics

```
ELICIT: Workflow Definition

Let's create a new MCP workflow!

1. Workflow name (kebab-case):
   Example: scrape-classify, batch-process, api-sync
   → _______________

2. Brief description:
   What does this workflow do?
   → _______________

3. Category:
   [ ] Data Processing (scraping, ETL, transformation)
   [ ] Automation (scheduled tasks, batch operations)
   [ ] Integration (API sync, cross-system operations)
   [ ] Analysis (metrics, reports, classification)
   → Select: ___
```

### Step 2: MCP Selection

```
ELICIT: MCP Selection

Which MCPs will your workflow use?

Available MCPs:
  [x] fs        - File system operations
  [ ] fetch     - HTTP requests, web scraping
  [ ] github    - GitHub API operations
  [ ] postgres  - PostgreSQL database
  [ ] notion    - Notion workspace
  [ ] puppeteer - Browser automation

→ Select MCPs (comma-separated): _______________

Note: Ensure selected MCPs are enabled.
Check with: docker mcp tools ls
```

### Step 3: Input/Output Specification

```
ELICIT: Input/Output

Define workflow parameters:

INPUT PARAMETERS:
1. Parameter name: _______________
   Type: [string/number/boolean/array/object]
   Required: [y/n]
   Default: _______________
   Description: _______________

→ Add another parameter? (y/n): ___

OUTPUT FORMAT:
1. [ ] JSON object (structured data)
2. [ ] Plain text (logs, reports)
3. [ ] File path (write to file)
4. [ ] Custom format

→ Select output format: ___
```

### Step 4: Workflow Logic

```
ELICIT: Workflow Steps

Describe the workflow logic:

What are the main steps?

Example for "scrape-classify":
1. Fetch URL content (fetch MCP)
2. Extract text from HTML (local processing)
3. Classify content (local processing)
4. Save results to file (fs MCP)

Your workflow steps:
1. _______________
2. _______________
3. _______________
4. _______________

→ Any additional steps? (y/n): ___
```

### Step 5: Error Handling

```
ELICIT: Error Handling

How should errors be handled?

1. [ ] Fail fast - Stop on first error
2. [ ] Continue - Log errors, continue processing
3. [ ] Retry - Retry failed operations (specify retries)

→ Select strategy: ___

Retry attempts (if selected): ___
```

---

## Implementation Steps

### 1. Create Workflow File

Use template: `.aiox-core/product/templates/mcp-workflow.js`

```javascript
/**
 * {WORKFLOW_NAME}
 * {WORKFLOW_DESCRIPTION}
 *
 * MCPs: {MCP_LIST}
 * Token Savings: ~98.7%
 */

'use strict';

const WORKFLOW_META = {
  name: '{workflow_name}',
  version: '1.0.0',
  description: '{workflow_description}',
  mcps_required: [{mcp_list}],
};

async function runWorkflow(params) {
  const startTime = Date.now();

  try {
    // Step 1: {step1_description}
    console.log('[1/{total}] {step1_action}...');
    // Implementation

    // Step 2: {step2_description}
    console.log('[2/{total}] {step2_action}...');
    // Implementation

    // Return minimal result to LLM
    return {
      success: true,
      // Minimal output fields
      processingTime: `${Date.now() - startTime}ms`,
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = { runWorkflow, WORKFLOW_META };
```

### 2. Save to Workflows Directory

```bash
# File location
scripts/mcp-workflows/{workflow_name}.js

# Make executable (Linux/macOS)
chmod +x scripts/mcp-workflows/{workflow_name}.js
```

### 3. Test the Workflow

```bash
# Run in Docker MCP
docker mcp exec ./scripts/mcp-workflows/{workflow_name}.js

# With parameters
docker mcp exec ./scripts/mcp-workflows/{workflow_name}.js --param value
```

### 4. Document the Workflow

Add entry to scripts/mcp-workflows/README.md:

```markdown
### {workflow_name}

**Purpose:** {workflow_description}

**MCPs:** {mcp_list}

**Usage:**
\`\`\`bash
docker mcp exec ./scripts/mcp-workflows/{workflow_name}.js --param value
\`\`\`

**Parameters:**
- `param1` - Description (required/optional)
- `param2` - Description (required/optional)
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Workflow file created
    tipo: post-condition
    blocker: true
    validacao: File exists at scripts/mcp-workflows/{workflow_name}.js
    error_message: "Workflow file not created"

  - [ ] Workflow executes
    tipo: post-condition
    blocker: true
    validacao: docker mcp exec completes without error
    error_message: "Workflow execution failed"

  - [ ] README updated
    tipo: post-condition
    blocker: false
    validacao: Workflow documented in README.md
    error_message: "Remember to document workflow"
```

---

## Success Output

```
✅ MCP Workflow Created Successfully!

📄 File: scripts/mcp-workflows/{workflow_name}.js
📝 Description: {workflow_description}

🔧 MCPs Used:
   • fs - File system operations
   • fetch - HTTP requests

📋 Parameters:
   • url (required) - URL to process
   • output (optional) - Output file path

🚀 Run with:
   docker mcp exec ./scripts/mcp-workflows/{workflow_name}.js --url https://example.com

💾 Token Savings: ~98.7% vs direct LLM processing

Next steps:
1. Test: docker mcp exec ./scripts/mcp-workflows/{workflow_name}.js --help
2. Customize: Edit the workflow logic
3. Document: Update scripts/mcp-workflows/README.md
```

---

## Workflow Templates

### Data Processing

```javascript
async function processData(params) {
  const { inputPath, outputPath } = params;

  // Read input (fs MCP)
  const data = await mcp.fs.readFile(inputPath);

  // Process locally (no tokens)
  const processed = transform(JSON.parse(data));

  // Write output (fs MCP)
  await mcp.fs.writeFile(outputPath, JSON.stringify(processed));

  return { success: true, recordsProcessed: processed.length };
}
```

### Web Scraping

```javascript
async function scrapeWeb(params) {
  const { url, selector } = params;

  // Fetch page (fetch MCP)
  const html = await mcp.fetch.get(url);

  // Extract data locally (no tokens)
  const extracted = extractData(html, selector);

  return { success: true, itemsFound: extracted.length };
}
```

### API Integration

```javascript
async function syncData(params) {
  const { sourceApi, targetPath } = params;

  // Fetch from API (fetch MCP)
  const response = await mcp.fetch.get(sourceApi);

  // Transform locally (no tokens)
  const transformed = mapToLocalFormat(response);

  // Save locally (fs MCP)
  await mcp.fs.writeFile(targetPath, JSON.stringify(transformed));

  return { success: true, recordsSynced: transformed.length };
}
```

---

## Token Savings Comparison

| Approach | Tokens | Processing |
|----------|--------|------------|
| Direct LLM | ~10,000 | LLM context |
| MCP Tool Calls | ~5,000 | Tool overhead |
| **Code Mode** | ~130 | **Sandbox** |

**Savings: ~98.7%**

---

## Metadata

```yaml
task: mcp-workflow
version: 1.0.0
story: Story 5.11 - Docker MCP Migration
dependencies:
  - Docker MCP Toolkit
  - Template: .aiox-core/product/templates/mcp-workflow.js
tags:
  - development
  - mcp
  - code-mode
  - workflow
updated_at: 2025-12-08
agents:
  - dev
```
