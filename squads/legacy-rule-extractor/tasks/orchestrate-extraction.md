# Task: Orchestrate Extraction

Coordinate batch extraction across multiple files using Decoder agent.

```yaml
task:
  id: orchestrate-extraction
  name: "Orchestrate Batch Extraction"
  executor: archaeologist
  elicit: false

  input:
    required:
      - hotspot_ranking: "Ranked list of files to process"
      - output_dir: "Directory for extracted rules"
    optional:
      - depth: "Analysis depth (surface|standard|deep). Default: standard"
      - limit: "Max files to process"

  execution:
    steps:
      - step: 1
        name: "Create output structure"
        action: |
          Create directory structure:
          {output_dir}/
            rules/           # Per-file rule extractions
            catalog/          # Classified catalog
            audit/            # Conflict reports
            scan-report.md    # From scan phase

      - step: 2
        name: "Process files in priority order"
        action: |
          For each file in hotspot_ranking (highest score first):
          1. Delegate to Decoder: *decode {file} --depth {depth}
          2. Collect output rule file
          3. Update extraction-progress.md
          4. If error: log and continue (never block batch)

      - step: 3
        name: "Trigger classification"
        action: |
          Once all files processed, delegate to Cartographer:
          *classify {output_dir}/rules/
          *catalog {output_dir}/rules/

      - step: 4
        name: "Generate summary"
        action: |
          Produce extraction-summary.md:
          - Files processed / total
          - Rules extracted total
          - By type, by confidence
          - Errors and skips
          - Time elapsed

  output:
    files:
      - "extraction-progress.md"
      - "extraction-summary.md"
    directories:
      - "rules/"
      - "catalog/"
```
