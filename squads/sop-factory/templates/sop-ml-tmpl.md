# Machine-Readable SOP Template (YAML)

> Use this YAML template to define SOPs that can be parsed and executed by AI agents, automation pipelines, and validation engines. Copy the YAML block below and fill in all fields.

<!-- ML-SOP GUIDANCE:
     Key principles:
     - Every step must have a unique ID for traceability.
     - Actions use verb_noun convention (e.g., validate_input, generate_report).
     - Tools reference registered MCP tools or system commands.
     - Validation blocks define pass/fail criteria programmatically.
     - Decision points create branching logic with explicit conditions.
     - Error handling maps failure modes to recovery actions.
-->

```yaml
# ============================================================
# SOP Machine-Readable Definition
# Template: sop-ml-tmpl.md | SOP Factory | Synkra AIOX
# ============================================================

sop:
  # --- Identity -----------------------------------------------------------
  id: "{{sop_id}}"                          # Unique identifier (e.g., SOP-OPS-042-R01)
  version: "{{version}}"                     # Semantic version (e.g., 1.0.0)
  title: "{{sop_title}}"                     # Human-readable title
  purpose: "{{purpose}}"                     # One-line purpose statement

  # --- Classification -----------------------------------------------------
  classification:
    domain: "{{domain}}"                     # Domain area (e.g., operations, engineering, compliance)
    category: "{{category}}"                 # Category within domain (e.g., deployment, onboarding)
    risk_level: "{{risk_level}}"             # low | medium | high | critical
    compliance_tags:                         # Regulatory/compliance references
      - "{{compliance_tag_1}}"               # e.g., "FDA-21CFR11", "SOC2", "ISO-27001"
      - "{{compliance_tag_2}}"
  status: "{{status}}"                       # DRAFT | ACTIVE | DEPRECATED | RETIRED
  effective_date: "{{effective_date}}"       # ISO 8601: YYYY-MM-DD
  review_date: "{{review_date}}"             # ISO 8601: YYYY-MM-DD

  # --- Trigger -------------------------------------------------------------
  # What event or condition initiates this SOP
  trigger:
    type: "{{trigger_type}}"                 # manual | scheduled | event | condition
    description: "{{trigger_description}}"   # Human-readable trigger description
    event: "{{trigger_event}}"               # Event name if type=event (e.g., "deployment.requested")
    schedule: "{{trigger_schedule}}"         # Cron expression if type=scheduled (e.g., "0 9 * * 1")
    source: "{{trigger_source}}"             # System or actor that initiates
    conditions:                              # Pre-conditions that must be true
      - field: "{{condition_field_1}}"
        operator: "{{operator_1}}"           # eq | ne | gt | lt | gte | lte | contains | exists
        value: "{{condition_value_1}}"

  # --- Context -------------------------------------------------------------
  # Runtime requirements for executing this SOP
  context:
    tools:                                   # Tools/systems required
      - id: "{{tool_id_1}}"                 # Tool identifier for reference in steps
        name: "{{tool_name_1}}"              # Human-readable tool name
        type: "{{tool_type_1}}"              # mcp | cli | api | ui | agent | manual
        version: "{{tool_version_1}}"        # Minimum version required
        required: true                       # Whether tool is mandatory
      - id: "{{tool_id_2}}"
        name: "{{tool_name_2}}"
        type: "{{tool_type_2}}"
        version: "{{tool_version_2}}"
        required: false                      # Optional tools marked false

    permissions:                             # Access/permissions needed
      - resource: "{{resource_1}}"           # What resource (e.g., "github-repo", "database")
        action: "{{action_perm_1}}"          # read | write | execute | admin
        scope: "{{scope_1}}"                 # Scope restriction
        justification: "{{permission_1_why}}" # Why this permission is needed
      - resource: "{{resource_2}}"
        action: "{{action_perm_2}}"
        scope: "{{scope_2}}"
        justification: "{{permission_2_why}}"

    environment:                             # Environment variables / config
      - key: "{{env_key_1}}"
        description: "{{env_desc_1}}"
        required: true
        sensitive: false                     # true = value never logged
      - key: "{{env_key_2}}"
        description: "{{env_desc_2}}"
        required: true
        sensitive: true                      # Marked sensitive; value never logged

    input:                                   # Global input data schema
      - name: "{{input_1_name}}"             # Input parameter name
        type: "{{input_1_type}}"             # string | number | boolean | object | array | file
        required: true
        description: "{{input_1_desc}}"
        validation: "{{input_1_validation}}" # Regex or validation rule
      - name: "{{input_2_name}}"
        type: "{{input_2_type}}"
        required: false
        description: "{{input_2_desc}}"
        default: "{{input_2_default}}"

  # --- Procedure Steps -----------------------------------------------------
  steps:
    - id: "S001"                             # Unique step identifier (S001, S002, ...)
      name: "{{step_1_name}}"                # Human-readable step name
      action: "{{action_verb_noun_1}}"       # verb_noun convention: validate_input, fetch_data
      description: "{{step_1_description}}"  # Detailed description
      performer: "{{performer_1}}"           # Role or agent ID
      critical: false                        # true = failure halts entire SOP
      estimated_duration: "{{duration_1}}"   # ISO 8601 duration: PT5M, PT1H

      tool:
        id: "{{step_1_tool_id}}"             # References context.tools[].id
        command: "{{step_1_command}}"         # Exact command or API call
        timeout: "{{step_1_timeout}}"        # ISO 8601 duration

      input:
        - name: "{{step_1_input_name}}"
          type: "{{step_1_input_type}}"      # string | number | boolean | object | array | file
          source: "{{step_1_input_source}}"  # literal | env | previous_step | user_input | system
          value: "{{step_1_input_value}}"    # Actual value or step reference
          required: true

      output:
        - name: "{{step_1_output_name}}"
          type: "{{step_1_output_type}}"
          store_as: "{{step_1_output_var}}"  # Variable name for downstream reference

      validation:
        type: "{{step_1_val_type}}"          # assertion | schema | regex | custom
        rules:
          - field: "{{step_1_val_field}}"
            operator: "{{step_1_val_op}}"    # eq | ne | gt | lt | contains | matches | exists
            expected: "{{step_1_val_expected}}"
            message: "{{step_1_val_msg}}"    # Human-readable failure message

      on_success: "S002"                     # Step ID or END
      on_failure: "{{step_1_failure_handler}}" # Error handler ID

      decision_point: null                   # null if no decision; see S002 for decision example

    - id: "S002"
      name: "{{step_2_name}}"
      action: "{{action_verb_noun_2}}"
      description: "{{step_2_description}}"
      performer: "{{performer_2}}"
      critical: true                         # Critical step - failure halts SOP
      estimated_duration: "{{duration_2}}"

      tool:
        id: "{{step_2_tool_id}}"
        command: "{{step_2_command}}"
        timeout: "{{step_2_timeout}}"

      input:
        - name: "{{step_2_input_name}}"
          type: "{{step_2_input_type}}"
          source: "previous_step"
          value: "S001.{{step_1_output_var}}" # Chained from previous step
          required: true

      output:
        - name: "{{step_2_output_name}}"
          type: "{{step_2_output_type}}"
          store_as: "{{step_2_output_var}}"

      validation:
        type: "schema"
        rules:
          - field: "{{step_2_val_field}}"
            operator: "{{step_2_val_op}}"
            expected: "{{step_2_val_expected}}"
            message: "{{step_2_val_msg}}"

      on_success: "S003"                     # Default next (used if no decision_point match)
      on_failure: "{{step_2_failure_handler}}"

      # Decision point: branching logic
      decision_point:
        question: "{{decision_question}}"    # Human-readable question
        evaluate: "{{decision_expression}}"  # Expression to evaluate
        branches:
          - condition: "{{branch_condition_1}}"
            label: "{{branch_label_1}}"
            goto: "S003"                     # Step ID to jump to
          - condition: "{{branch_condition_2}}"
            label: "{{branch_label_2}}"
            goto: "S004"
          - condition: "default"             # Fallback branch (required)
            label: "{{branch_default_label}}"
            goto: "{{branch_default_target}}"

    - id: "S003"
      name: "{{step_3_name}}"
      action: "{{action_verb_noun_3}}"
      description: "{{step_3_description}}"
      performer: "{{performer_3}}"
      critical: false
      estimated_duration: "{{duration_3}}"

      tool:
        id: "{{step_3_tool_id}}"
        command: "{{step_3_command}}"
        timeout: "{{step_3_timeout}}"

      input:
        - name: "{{step_3_input_name}}"
          type: "{{step_3_input_type}}"
          source: "previous_step"
          value: "S002.{{step_2_output_var}}"
          required: true

      output:
        - name: "{{step_3_output_name}}"
          type: "{{step_3_output_type}}"
          store_as: "{{step_3_output_var}}"

      validation:
        type: "assertion"
        rules:
          - field: "{{step_3_val_field}}"
            operator: "{{step_3_val_op}}"
            expected: "{{step_3_val_expected}}"
            message: "{{step_3_val_msg}}"

      on_success: "END"                      # Terminal step
      on_failure: "{{step_3_failure_handler}}"
      decision_point: null

    # Add more steps as needed following the same schema...
    # - id: "S004"
    #   name: "..."
    #   ...

  # --- Error Handling -------------------------------------------------------
  error_handling:
    handlers:
      - id: "{{error_handler_id_1}}"         # Unique handler identifier
        name: "{{error_handler_name_1}}"
        trigger_on:
          - error_code: "{{error_code_1}}"
          - error_type: "{{error_type_1}}"   # timeout | validation | permission | system | custom
        severity: "{{error_severity_1}}"     # critical | high | medium | low
        actions:
          - type: "retry"                    # retry | rollback | notify | escalate | skip | abort
            config:
              max_retries: {{max_retries_1}} # Number (e.g., 3)
              retry_delay: "{{retry_delay_1}}" # ISO 8601 duration
              backoff: "{{backoff_strategy_1}}" # linear | exponential | fixed
          - type: "notify"
            config:
              channel: "{{notify_channel_1}}" # email | slack | webhook
              recipients: ["{{recipient_1}}"]
              template: "{{notify_template_1}}"

      - id: "{{error_handler_id_2}}"
        name: "{{error_handler_name_2}}"
        trigger_on:
          - error_type: "{{error_type_2}}"
        severity: "{{error_severity_2}}"
        actions:
          - type: "escalate"
            config:
              escalate_to: "{{escalate_to_role}}"
              deadline: "{{escalation_deadline}}" # ISO 8601 duration
              include_context: true

    fallback:                                # What to do if no handler matches
      action: "abort"
      notify: ["{{fallback_notify_1}}"]
      log_level: "error"

    global_timeout: "{{global_timeout}}"     # Max total execution time (e.g., PT2H)

  # --- Quality Gate ---------------------------------------------------------
  quality_gate:
    enabled: true
    criteria:
      - name: "{{qg_criteria_name_1}}"      # e.g., "All steps passed validation"
        type: "{{qg_criteria_type_1}}"       # percentage | count | boolean | threshold
        target: "{{qg_target_1}}"           # Expected value
        actual: null                         # Populated at runtime
        weight: {{qg_weight_1}}             # 0.0 - 1.0
      - name: "{{qg_criteria_name_2}}"
        type: "{{qg_criteria_type_2}}"
        target: "{{qg_target_2}}"
        actual: null
        weight: {{qg_weight_2}}
    pass_threshold: {{qg_pass_threshold}}    # Weighted score 0.0 - 1.0
    on_fail: "{{qg_on_fail}}"               # block | warn | notify

  # --- Outputs --------------------------------------------------------------
  outputs:
    artifacts:
      - name: "{{artifact_name_1}}"         # Final deliverable name
        type: "{{artifact_type_1}}"          # file | record | report | notification
        format: "{{artifact_format_1}}"      # pdf | json | csv | md | html | yaml
        destination: "{{artifact_dest_1}}"   # Where the output goes (path, URL, channel)
        retention: "{{artifact_retention_1}}" # ISO 8601 duration: P1Y, P7Y
      - name: "{{artifact_name_2}}"
        type: "{{artifact_type_2}}"
        format: "{{artifact_format_2}}"
        destination: "{{artifact_dest_2}}"
        retention: "{{artifact_retention_2}}"

    notifications:
      on_complete:
        - channel: "{{complete_channel_1}}"
          recipients: ["{{complete_recipient_1}}"]
          template: "{{complete_template_1}}"
      on_failure:
        - channel: "{{failure_channel_1}}"
          recipients: ["{{failure_recipient_1}}"]
          template: "{{failure_template_1}}"

  # --- Metadata -------------------------------------------------------------
  metadata:
    created_by: "{{created_by}}"
    created_at: "{{created_at}}"             # ISO 8601 datetime
    updated_by: "{{updated_by}}"
    updated_at: "{{updated_at}}"
    owner: "{{owner_id}}"
    department: "{{department}}"
    tags: [{{tags}}]                         # Comma-separated: "quality", "compliance", "onboarding"
    review_cycle: "{{review_cycle}}"         # ISO 8601 duration (e.g., P90D = every 90 days)
    regulatory_refs:
      - standard: "{{reg_standard_1}}"       # ISO 9001, FDA 21 CFR Part 11, etc.
        clause: "{{reg_clause_1}}"
    related_sops: ["{{related_sop_1}}", "{{related_sop_2}}"]
    change_log:
      - version: "{{version}}"
        date: "{{effective_date}}"
        author: "{{created_by}}"
        summary: "{{change_summary}}"
```

---

## Usage Notes

1. **Fill all `{{handlebars}}`** with actual values before committing.
2. **Step IDs** must be unique and follow the pattern `S001`, `S002`, etc.
3. **Decision points** enable branching logic — use `null` when step is linear.
4. **Validation types**: `assertion` (boolean check), `schema` (structure validation), `regex` (pattern match), `custom` (external validator).
5. **on_failure** must reference a valid error handler ID defined in `error_handling.handlers`.
6. **on_success** references the next step ID or `"END"` for terminal steps.
7. **Quality gate** weights must sum to 1.0 — the SOP passes only if the weighted score meets `pass_threshold`.
8. **Rollback** should be defined for any SOP with `risk_level: high` or `critical`.
9. For AI agent execution, ensure all `tool.id` values match registered tool IDs in the execution environment.
10. This YAML can be validated against the JSON Schema at: `schemas/sop-ml-schema.json`

---

*Template: sop-ml-tmpl.md | SOP Factory | Synkra AIOX*
