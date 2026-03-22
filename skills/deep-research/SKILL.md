# Deep Research

General-purpose deep research pipeline. Transforms any research question into structured, documented findings.

## Usage

```bash
/deep-research "your research question"
```

Supports: market, people, books, strategy, competitive, industry, cultural, academic, regulatory research.

## Implementation

6-phase Orchestrator-Worker pipeline (based on tech-search v3.1):
1. Auto-detect research type
2. Decompose into sub-queries
3. Generate research prompt
4. Parallel search via Haiku workers (max 3 waves)
5. Synthesize findings
6. Document to `docs/research/{date}-{slug}/`

Config: `config.yaml` | Checkpoints: `checkpoints.yaml`

See `README.md` for full architecture and configuration.
