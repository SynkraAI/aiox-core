# MMOS Squad Tasks Index

**Version:** 1.0.0
**Story:** STORY-10.3
**Total Tasks:** 26

## Task Categories

### Pipeline Tasks (9)

Core tasks for the MMOS pipeline execution:

| Task | Description | Agent |
|------|-------------|-------|
| `viability-assessment.md` | APEX + ICP Viability Assessment | mind-mapper |
| `research-collection.md` | Source Discovery & Parallel Collection | research-specialist |
| `cognitive-analysis.md` | DNA Mental 8-Layer Analysis | cognitive-analyst |
| `system-prompt-creation.md` | Generate System Prompts | mind-mapper |
| `test-fidelity.md` | Clone Fidelity Testing | qa |
| `mind-validation.md` | Complete Mind Validation | mind-mapper |
| `map-mind.md` | Full Mind Mapping Orchestration | mind-mapper |
| `auto-detect-workflow.md` | Automatic Workflow Detection | mind-mapper |
| `execute-mmos-pipeline.md` | End-to-End Pipeline Execution | mind-mapper |

### Analysis Tasks (9)

Deep cognitive analysis and extraction:

| Task | Description | Agent |
|------|-------------|-------|
| `core-essence-extraction.md` | Extract Core Identity | cognitive-analyst |
| `signature-phrases-mining.md` | Mine Signature Phrases | cognitive-analyst |
| `values-hierarchy-analysis.md` | Analyze Values Hierarchy | cognitive-analyst |
| `frameworks-identifier-analysis.md` | Identify Thinking Frameworks | cognitive-analyst |
| `communication-templates-extraction.md` | Extract Communication Patterns | cognitive-analyst |
| `contradictions-synthesis.md` | Synthesize Productive Paradoxes | cognitive-analyst |
| `knowledge-base-chunking.md` | Chunk Knowledge Base | cognitive-analyst |
| `specialist-recommendation.md` | Recommend Specialists | cognitive-analyst |
| `mind-story.md` | Generate Mind Story | cognitive-analyst |

### Clone Management Tasks (4)

Tasks for managing existing clones:

| Task | Description | Agent |
|------|-------------|-------|
| `activate-clone.md` | Activate Mind Clone | mind-mapper |
| `brownfield-update.md` | Update Existing Clone | mind-mapper |
| `reexecute-phase.md` | Re-execute Specific Phase | mind-mapper |
| `reexecute-mind.md` | Full Mind Re-execution | mind-mapper |

### Data Import Tasks (3)

Tasks for importing external source data:

| Task | Description | Agent |
|------|-------------|-------|
| `import-mind-sources.md` | Import Sources from CSV/YAML | data-importer |
| `preview-sources-import.md` | Preview Import Before Execution | data-importer |
| `validate-sources-import.md` | Validate Import Data | data-importer |

### Utility Tasks (1)

| Task | Description | Agent |
|------|-------------|-------|
| `detect-workflow-mode.md` | Detect Greenfield/Brownfield | mind-mapper |

## Service Integration

All tasks integrate with infrastructure services through the adapter layer:

```
squads/mmos-squad/adapters/
├── index.js                 # Central exports
├── source-adapter.js        # file-service + ETL + tiktok
├── project-adapter.js       # clickup
├── storage-adapter.js       # google-drive
└── mcp-adapter.js           # MCP tools (EXA, Context7, Playwright)
```

### Service Mapping

| Task Category | Primary Adapter | Services Used |
|---------------|-----------------|---------------|
| Research/Collection | `source-adapter` | ETL, file-service, tiktok |
| Project Management | `project-adapter` | clickup |
| Storage/Export | `storage-adapter` | google-drive |
| AI/Web Integration | `mcp-adapter` | EXA, Context7, Playwright |

### MCP Integration (STORY-10.8)

Tasks now include MCP tool integration for enhanced capabilities:

| MCP Tool | Task | Purpose |
|----------|------|---------|
| `mcp__docker-gateway__web_search_exa` | viability-assessment, auto-detect-workflow, research-collection | Web search, public figure detection |
| `mcp__docker-gateway__get-library-docs` | system-prompt-creation | Prompt engineering best practices |
| `mcp__playwright__browser_*` | test-fidelity, mind-validation | Automated fidelity testing |

See `mcp-adapter.js` for documented usage patterns.

## Usage

### Running Individual Tasks

```bash
# Via AIOS command
*task viability-assessment

# With parameters
*task research-collection --mode=full --mind_name="Naval Ravikant"
```

### Running Pipeline

```bash
# Full pipeline execution
*task execute-mmos-pipeline --mind_name="Naval Ravikant" --mode=greenfield

# Brownfield update
*task brownfield-update --mind_name="Naval Ravikant" --phases=["analysis"]
```

## Dependencies

All tasks depend on:
- STORY-10.2: Agent Migration (agents in `squads/mmos-squad/agents/`)
- STORY-10.4: ETL YouTube (ETL service ready)
- STORY-10.5: ETL Service Architecture (ETLService v2.4.0)

---

*Generated: 2025-12-30*
*Story: STORY-10.3*
