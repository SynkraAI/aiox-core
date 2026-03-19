# Task: Scan Codebase

Map legacy codebase structure and identify rule extraction targets.

```yaml
task:
  id: scan-codebase
  name: "Scan Legacy Codebase"
  executor: archaeologist
  elicit: false

  input:
    required:
      - path: "Absolute path to legacy codebase root"
    optional:
      - recursive: "Include subdirectories (default: true)"
      - include_extensions: "Filter by specific extensions"
      - exclude_patterns: "Glob patterns to exclude"

  execution:
    steps:
      - step: 1
        name: "Enumerate files"
        action: |
          List all source code files in the directory.
          Group by extension. Count lines per file.
          Exclude: binaries, images, compiled outputs, .git, node_modules.

      - step: 2
        name: "Detect languages"
        action: |
          Map extensions to languages:
          .cbl/.cob/.cpy → COBOL
          .pls/.plb/.pck/.sql → PL/SQL or T-SQL
          .java → Java
          .bas/.cls/.frm → VB6
          .vb → VB.NET
          .rpg/.rpgle → RPG
          .pas/.dpr → Delphi/Pascal
          .cs → C#
          .prg → Clipper/FoxPro
          .abap → ABAP
          .py → Python
          Generate language distribution table.

      - step: 3
        name: "Map module boundaries"
        action: |
          Identify modules/packages from:
          - Directory structure
          - Naming prefixes (FIN_, RH_, EST_)
          - Package/namespace declarations
          - COBOL DIVISION structure
          - Include/import patterns

      - step: 4
        name: "Score hotspots"
        action: |
          For each file, compute a hotspot score based on:
          - Conditional density (IF/ELSE per 100 lines)
          - Calculation presence (COMPUTE, BigDecimal, etc.)
          - Validation patterns
          - State transitions
          - Comment density (comments often mark rules)
          Score 0-100. Rank files by score.

      - step: 5
        name: "Generate scan report"
        action: |
          Output scan-report.md with:
          - Language distribution (table)
          - Module map (tree)
          - Top 20 hotspots (ranked table)
          - Recommended extraction order
          - Estimated effort

  output:
    files:
      - "scan-report.md"
    data:
      - "hotspot_ranking: list of files with scores"
      - "module_map: hierarchical structure"
      - "language_distribution: counts by language"
```
