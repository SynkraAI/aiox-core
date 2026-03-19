# Task: Save Report

## MANDATORY PATH — READ THIS FIRST

**Target directory:** `docs/outputs/squads/site-performance-audit/`
**Filename pattern:** `{YYYY-MM-DD}-{HHmm}-{command}-{sanitized_id}.md`
**Index file:** `docs/outputs/squads/site-performance-audit/_index.yaml`

**FORBIDDEN paths — NEVER write reports to:**
- `squads/site-performance-audit/audits/` — NO
- `squads/site-performance-audit/data/` — NO
- `docs/audits/` — NO
- Any path other than `docs/outputs/squads/site-performance-audit/` — NO

**mkdir command:** `mkdir -p docs/outputs/squads/site-performance-audit`

---

```yaml
task:
  name: "Save Report"
  id: save-report
  version: "1.0.0"
  execution_type: Worker
  responsible_executor: "site-performance-audit-chief"
  estimated_time: "5-10s"
  status: pending

  description: >-
    Persiste o relatorio apresentado em tela no path canonico,
    seguindo o output-standard do squad. Atualiza o _index.yaml.

  input:
    - name: report_content
      type: string
      required: true
      source: "last_output"
      description: "Conteudo do relatorio gerado pelo comando anterior (ja apresentado em tela)"
    - name: command
      type: string
      required: true
      description: "Comando que gerou o relatorio (ex: audit, quick-audit, benchmark)"
    - name: id_raw
      type: string
      required: true
      description: "Identificador bruto do input (URL, nome de cliente, etc.)"
    - name: url
      type: string
      required: false
      description: "URL original auditada (se aplicavel)"
    - name: strategy
      type: enum
      values: [mobile, desktop, both]
      required: false
      default: both
      description: "Estrategia usada no audit"

  output:
    - name: saved_path
      type: string
      description: "Caminho completo do arquivo salvo"
    - name: index_updated
      type: boolean
      description: "Se o _index.yaml foi atualizado"

  constants:
    output_dir: "docs/outputs/squads/site-performance-audit"
    index_file: "docs/outputs/squads/site-performance-audit/_index.yaml"
    protocol_file: "squads/site-performance-audit/protocols/output-standard.md"

  action_items:
    - step: 1
      action: "Sanitize the ID"
      rules: |
        Apply rules from protocols/output-standard.md:

        IF id_raw looks like a URL:
          1. Remove https:// or http://
          2. Remove trailing /
          3. Replace all . with -
          4. Replace all / with -
          5. Remove trailing - if any
          6. Lowercase everything

        IF id_raw looks like a name:
          1. Lowercase
          2. Replace spaces with -
          3. Remove special characters: ' " & . , ; ( ) ! ?
          4. Collapse multiple - into single -
          5. Remove leading/trailing -

        THEN:
          - Truncate to max 60 chars at last - boundary
          - Verify no reserved characters remain

    - step: 2
      action: "Generate filename"
      method: |
        IMPORTANT: Use SEPARATE Bash calls for each step. NEVER chain with && or ;

        Bash call 1: date +%Y-%m-%d (capture date)
        Bash call 2: date +%H%M (capture time)

        Build filename: {date}-{time}-{command}-{sanitized_id}.md
        Build full path: docs/outputs/squads/site-performance-audit/{filename}

    - step: 3
      action: "Ensure output directory exists"
      method: |
        Bash call: mkdir -p docs/outputs/squads/site-performance-audit

    - step: 4
      action: "Write report file"
      method: |
        Use the Write tool to save report_content to the full path.
        Do NOT use Bash with > redirection.

    - step: 5
      action: "Update _index.yaml"
      method: |
        Read current _index.yaml (or create from template if missing).

        Add new entry to the outputs list:

        - file: "{filename}"
          command: "{command}"
          id: "{sanitized_id}"
          date: "{YYYY-MM-DD}"
          time: "{HHmm}"
          url: "{url or null}"
          strategy: "{strategy or null}"
          format: "md"
          summary: "{first heading or first 120 chars of report}"

        Use the Edit tool to update _index.yaml.
        Maintain YAML validity. Entries are ordered newest-first.

    - step: 6
      action: "Confirm to user"
      output: |
        Report saved: {full_path}
        Index updated: {index_file} ({total_entries} entries)

  acceptance_criteria:
    - "File saved at canonical path following output-standard"
    - "Filename matches pattern: YYYY-MM-DD-HHmm-command-id.ext"
    - "ID sanitized according to protocol rules"
    - "_index.yaml updated with new entry"
    - "No reserved characters in filename"
    - "User sees confirmation with full path"

  veto_conditions:
    - "No report content available (nothing was generated) -> STOP, tell user to run a command first"
    - "ID sanitization results in empty string -> STOP, ask user for a valid identifier"
    - "File already exists at target path -> WARN user, ask to overwrite or skip"

  error_handling:
    directory_missing: "Create with mkdir -p (step 3 handles this)"
    index_missing: "Create from template (output-index-tmpl.yaml)"
    write_failure: "Report error to user, do NOT silently fail"
```
