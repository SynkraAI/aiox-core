# {{TASK_TITLE}}

> Task ID: {{TASK_ID}}
> Agent: {{AGENT_NAME}}
> Version: {{VERSION}}

---

## ⚠️ NAMING CONVENTION

**CRITICAL:** This task follows Synkra AIOX naming convention.

### Agent-Specific Tasks
If this task is specific to **{{AGENT_NAME}}**, the filename MUST be:
```
{{AGENT_ID}}-{{BASE_TASK_NAME}}.md
```

**Example:** For `ux-design-expert` agent, a user research task should be:
```
✅ ux-user-research.md
❌ user-research.md
```

### Shared Tasks
If this task is used by **multiple agents**, the filename should NOT have agent prefix:
```
{{TASK_NAME}}.md
```

**Example:** A documentation task used by `pm`, `po`, and `sm`:
```
✅ create-doc.md
❌ pm-create-doc.md
```

### How to Apply
- Use the `*create-task` command which automatically applies naming convention
- The elicitation process will ask for agent(s) and apply the correct format
- See: `.aiox-core/tasks/create-task.md` for details

---

## Description
{{TASK_DESCRIPTION}}

{{#IF_CONTEXT_REQUIRED}}
## Context Required
{{CONTEXT_DESCRIPTION}}
{{/IF_CONTEXT_REQUIRED}}

## Prerequisites
{{#EACH_PREREQUISITES}}
- {{PREREQUISITE}}
{{/EACH_PREREQUISITES}}

## Workflow
{{#IF_INTERACTIVE_ELICITATION}}
### Interactive Elicitation
This task uses interactive elicitation to gather information from the user.

1. **Gather Basic Information**
   - {{ELICIT_STEP_1}}
   
2. **Collect Additional Details**
   - {{ELICIT_STEP_2}}
   
3. **Confirm and Review**
   - {{ELICIT_STEP_3}}
{{/IF_INTERACTIVE_ELICITATION}}

### Steps
{{#EACH_STEPS}}
{{STEP_NUMBER}}. **{{STEP_TITLE}}**
   {{STEP_DESCRIPTION}}
   {{#IF_STEP_VALIDATION}}
   - Validation: {{STEP_VALIDATION}}
   {{/IF_STEP_VALIDATION}}
{{/EACH_STEPS}}

## Output
{{OUTPUT_DESCRIPTION}}

{{#IF_OUTPUT_FORMAT}}
### Output Format
```{{OUTPUT_FORMAT_TYPE}}
{{OUTPUT_FORMAT_TEMPLATE}}
```
{{/IF_OUTPUT_FORMAT}}

## Success Criteria
{{#EACH_SUCCESS_CRITERIA}}
- [ ] {{SUCCESS_CRITERION}}
{{/EACH_SUCCESS_CRITERIA}}

{{#IF_ERROR_HANDLING}}
## Error Handling
{{#EACH_ERROR_CASES}}
- **{{ERROR_CASE}}**: {{ERROR_HANDLING}}
{{/EACH_ERROR_CASES}}
{{/IF_ERROR_HANDLING}}

{{#IF_SECURITY_NOTES}}
## Security Considerations
{{#EACH_SECURITY_ITEMS}}
- {{SECURITY_ITEM}}
{{/EACH_SECURITY_ITEMS}}
{{/IF_SECURITY_NOTES}}

{{#IF_EXAMPLES}}
## Examples
{{#EACH_EXAMPLES}}
### Example {{EXAMPLE_NUMBER}}: {{EXAMPLE_TITLE}}
```{{EXAMPLE_TYPE}}
{{EXAMPLE_CONTENT}}
```
{{/EACH_EXAMPLES}}
{{/IF_EXAMPLES}}

## Notes
{{#EACH_NOTES}}
- {{NOTE}}
{{/EACH_NOTES}} 