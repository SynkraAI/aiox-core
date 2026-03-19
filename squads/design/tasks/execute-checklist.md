# Checklist Validation Task

> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `standalone`

This task provides instructions for validating documentation against checklists. The agent MUST follow these instructions to ensure thorough and systematic validation of documents.

## Available Checklists

If the user asks or does not specify a specific checklist, list the checklists available in `squads/design/checklists/`.

## Local Checklist Catalog (`squads/design/checklists/`)

- `atomic-refactor-checklist.md`
- `design-fidelity-checklist.md`
- `design-handoff-checklist.md`
- `design-team-health-checklist.md`
- `designops-maturity-checklist.md`
- `ds-a11y-release-gate-checklist.md`
- `ds-accessibility-wcag-checklist.md`
- `ds-component-quality-checklist.md`
- `ds-migration-readiness-checklist.md`
- `ds-pattern-audit-checklist.md`
- `reading-accessibility-checklist.md`

## Instructions

1. **Initial Assessment**

   - If user or the task being run provides a checklist name:
     - Try fuzzy matching (e.g. "architecture checklist" -> "architect-checklist")
     - If multiple matches found, ask user to clarify
     - Load the appropriate checklist from `squads/design/checklists/`
   - If no checklist specified:
     - Ask the user which checklist they want to use
     - Present the available options from `squads/design/checklists/`
   - Confirm if they want to work through the checklist:
     - Section by section (interactive mode - very time consuming)
     - All at once (YOLO mode - recommended for checklists, there will be a summary of sections at the end to discuss)

2. **Document and Artifact Gathering**

   - Each checklist will specify its required documents/artifacts at the beginning
   - Follow the checklist's specific instructions for what to gather, generally a file can be resolved in the docs folder, if not or unsure, halt and ask or confirm with the user.

3. **Checklist Processing**

   If in interactive mode:

   - Work through each section of the checklist one at a time
   - For each section:
     - Review all items in the section following instructions for that section embedded in the checklist
     - Check each item against the relevant documentation or artifacts as appropriate
     - Present summary of findings for that section, highlighting warnings, errors and non applicable items (rationale for non-applicability).
     - Get user confirmation before proceeding to next section or if any thing major do we need to halt and take corrective action

   If in YOLO mode:

   - Process all sections at once
   - Create a comprehensive report of all findings
   - Present the complete analysis to the user

4. **Validation Approach**

   For each checklist item:

   - Read and understand the requirement
   - Look for evidence in the documentation that satisfies the requirement
   - Consider both explicit mentions and implicit coverage
   - Aside from this, follow all checklist llm instructions
   - Mark items as:
     - ✅ PASS: Requirement clearly met
     - ❌ FAIL: Requirement not met or insufficient coverage
     - ⚠️ PARTIAL: Some aspects covered but needs improvement
     - N/A: Not applicable to this case

5. **Section Analysis**

   For each section:

   - think step by step to calculate pass rate
   - Identify common themes in failed items
   - Provide specific recommendations for improvement
   - In interactive mode, discuss findings with user
   - Document any user decisions or explanations

6. **Final Report**

   Prepare a summary that includes:

   - Overall checklist completion status
   - Pass rates by section
   - List of failed items with context
   - Specific recommendations for improvement
   - Any sections or items marked as N/A with justification

## Checklist Execution Methodology

Each checklist now contains embedded LLM prompts and instructions that will:

1. **Guide thorough thinking** - Prompts ensure deep analysis of each section
2. **Request specific artifacts** - Clear instructions on what documents/access is needed
3. **Provide contextual guidance** - Section-specific prompts for better validation
4. **Generate comprehensive reports** - Final summary with detailed findings

The LLM will:

- Execute the complete checklist validation
- Present a final report with pass/fail rates and key findings
- Offer to provide detailed analysis of any section, especially those with warnings or failures

## Failure Handling

- **Multiple checklists match user query:** Present disambiguation list with each checklist's primary purpose, ask user to select by number or refine query
- **Required documentation artifacts missing or inaccessible:** Flag missing items, proceed with partial validation marking dependent checklist items as BLOCKED, document gaps in final report
- **Checklist scoring results in ambiguous pass/fail boundary:** Calculate confidence intervals, highlight borderline items, recommend manual review for items within 10% of threshold
- **User disagrees with automated verdict for specific items:** Document user override with justification, recalculate section scores excluding overridden items, append dissenting analysis to report

## Success Criteria

- [ ] Correct checklist identified and loaded (exact or fuzzy match)
- [ ] All required documents/artifacts gathered before validation
- [ ] Every checklist item evaluated with PASS/FAIL/N-A verdict
- [ ] Non-applicable items include rationale for exclusion
- [ ] Summary report generated with section-by-section breakdown
- [ ] Scoring calculated per checklist's scoring system
- [ ] Critical failures flagged for immediate attention

## Output

- Checklist execution report with section pass rates
- List of failed/partial items with evidence
- Remediation list prioritized by severity


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
