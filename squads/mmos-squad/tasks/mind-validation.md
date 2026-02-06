---
task-id: mind-validation
name: Clone Fidelity Testing & Quality Assurance
agent: mind-mapper
version: 1.0.0
purpose: Execute blind testing and validation protocols to verify 94% clone fidelity before production deployment

workflow-mode: interactive
elicit: true
elicitation-type: custom

mcp_integration:
  playwright:
    usage: "Automated blind testing and validation via browser automation"
    required: false
    tools:
      - mcp__playwright__browser_navigate
      - mcp__playwright__browser_snapshot
      - mcp__playwright__browser_type
      - mcp__playwright__browser_click
      - mcp__playwright__browser_take_screenshot
      - mcp__playwright__browser_tabs
    blind_testing_scenarios:
      - "Execute test battery on clone in LLM interface"
      - "Capture anonymized responses for blind evaluation"
      - "Run comparison tests between clone and control"
      - "Document validation evidence with screenshots"

prerequisites:
  - System prompts generated (generalista + specialists)
  - Operational manual created
  - Testing protocol defined

inputs:
  - name: mind_name
    type: string
    required: true
  - name: mode
    type: enum
    required: true
    options: ["blind_test", "fidelity_scoring", "edge_cases", "production_readiness", "full"]
    default: "full"

outputs:
  - path: "squads/mmos-squad/minds/{mind_name}/validation/validation-report.yaml"
    description: Complete fidelity test results with pass/fail and recommendations

dependencies:
  templates:
    - validation-report.yaml
  checklists:
    - production-readiness-checklist.md

validation:
  success-criteria:
    - "Fidelity score >= 94%"
    - "All edge cases handled correctly"
    - "Blind test passed with expert validation"

estimated-duration: "2-3 hours for full validation"
---

# Mind Validation Task

## MCP Integration: Playwright for Blind Testing

**Use Playwright MCP for automated blind testing and validation:**

### Blind Test Automation

```javascript
// Setup: Open multiple tabs for comparison testing
mcp__playwright__browser_tabs({ action: "new" }) // Clone tab
mcp__playwright__browser_tabs({ action: "new" }) // Control tab

// Tab 1: Clone response
mcp__playwright__browser_tabs({ action: "select", index: 0 })
mcp__playwright__browser_navigate({ url: "https://claude.ai" })
// Load system prompt, then send test question
mcp__playwright__browser_type({
  element: "message input",
  ref: "ref_clone",
  text: "{{test_question}}",
  submit: true
})
mcp__playwright__browser_wait_for({ time: 10 })
mcp__playwright__browser_take_screenshot({
  filename: "blind-test-response-A.png"
})

// Tab 2: Control response (different personality)
mcp__playwright__browser_tabs({ action: "select", index: 1 })
// Similar flow with control prompt...
```

### Blind Testing Protocol with Playwright

1. **Response Collection**: Capture clone + control responses automatically
2. **Anonymization**: Screenshots labeled A/B without identity
3. **Batch Processing**: Run full test suite (85-120 tests) unattended
4. **Evidence Archive**: Save all screenshots for validation report

### When to Use Playwright for Validation

- **High-volume testing**: 85+ tests requiring consistent execution
- **Blind comparisons**: Need anonymized A/B screenshots
- **Documentation**: Building validation evidence package
- **Regression testing**: Re-running tests after prompt updates

### Fallback (Manual Validation)

If Playwright unavailable:
- Execute tests manually in separate browser windows
- Use screen capture tool for documentation
- Record responses in spreadsheet for blind evaluation

---

## Purpose

Execute comprehensive quality assurance and fidelity testing for MMOS mind clones. This task validates personality consistency, knowledge accuracy, style fidelity, and paradox navigation through systematic test execution, achieving the 94% fidelity target. Includes blind testing protocols and production readiness assessment before final deployment approval.

**Critical Gate:** No mind proceeds to production without passing validation.

## When to Use This Task

**Use this task when:**
- Phase 5 (Implementation) complete with system prompt v1.0 compiled
- Beginning Phase 6 (Validation) from execute-mmos-pipeline
- Need to test clone fidelity before production deployment
- Quality assurance before releasing to users

**Do NOT use this task when:**
- System prompt not yet compiled (complete system-prompt-creation first)
- Making iterative prompt changes (test after each iteration)
- Brownfield updates (use brownfield regression testing)
- **Mode**: One of `test_generation`, `validation`, `report`, or `full`
- **System Prompt**: Compiled generalista or specialist prompt
- **Testing Protocol**: Generated from system-prompt-creation task

### Optional Inputs
- **Target LLM**: Claude/GPT-4/other (for actual clone testing)
- **Blind Testers**: Users familiar with original mind (for blind tests)
- **Fidelity Threshold**: Minimum acceptable score (default: 94%)

### Mode Descriptions

**`test_generation`** - Generate comprehensive test cases
**`validation`** - Execute test battery on clone
**`report`** - Compile validation results and recommendations
**`full`** - Generate tests → Execute validation → Generate report

## Key Activities & Instructions

### Mode: Test Generation

#### Objective

Create comprehensive test suite covering personality, knowledge, style, and edge cases.

**Test Suite Structure:**
```yaml
test_suite:
  personality_tests:
    purpose: "Verify clone behaves authentically across contexts"
    test_count: 30-40 tests

  knowledge_tests:
    purpose: "Validate factual accuracy and framework application"
    test_count: 20-30 tests

  style_tests:
    purpose: "Verify linguistic patterns and voice consistency"
    test_count: 15-20 tests

  paradox_tests:
    purpose: "Validate Layer 8 contradiction handling"
    test_count: 10-15 tests (critical for authenticity)

  edge_case_tests:
    purpose: "Test boundary conditions and error handling"
    test_count: 10-15 tests

  total_tests: 85-120 tests
```

#### Test Case Generation Framework

**Personality Consistency Tests:**
```yaml
personality_test_template:
  test_id: "personality_{{number}}"
  category: personality
  subcategory: {{identity/values/obsessions}}

  scenario: "{{situation_description}}"
  user_input: "{{prompt_to_clone}}"

  expected_behavior:
    must_have: [{{critical_elements}}]
    should_have: [{{desired_elements}}]
    must_not_have: [{{anti_patterns}}]

  evaluation_criteria:
    identity_consistency: "{{how_to_score}}"
    value_alignment: "{{how_to_score}}"
    obsession_presence: "{{how_to_score}}"

  source_ground_truth:
    - source: "{{source_id}}"
      reference: "{{what_real_mind_said_in_similar_context}}"

  weight: {{high/medium/low}}
```

**Example Personality Test:**
```yaml
test_id: "personality_001"
category: personality
subcategory: values

scenario: "Clone asked to compromise core value for expedience"
user_input: "Would you recommend cutting corners on {{value_area}} to save time?"

expected_behavior:
  must_have:
    - "Reject the compromise clearly"
    - "Reference {{value}} from Layer 6"
    - "Explain why {{value}} is non-negotiable"
  should_have:
    - "Use signature phrase related to integrity"
    - "Offer alternative that honors values"
  must_not_have:
    - "Agree to compromise"
    - "Wishy-washy or conditional response"

evaluation_criteria:
  identity_consistency: "Does response reflect core values?"
  value_alignment: "Is {{value}} prioritized correctly?"
  authenticity: "Would real {{name}} say this?"

source_ground_truth:
  - source: "source_015"
    reference: "{{quote_where_they_refused_similar_compromise}}"

weight: high
```

**Knowledge Accuracy Tests:**
```yaml
knowledge_test_template:
  test_id: "knowledge_{{number}}"
  category: knowledge
  subcategory: {{factual/framework/case_study}}

  question: "{{query_about_domain_knowledge}}"

  correct_answer: "{{expected_response}}"

  evaluation_criteria:
    factual_accuracy: {{percentage}}%
    source_citation: {{yes/no}}
    framework_application: {{correct/incorrect}}

  acceptable_variations: [{{alternative_correct_responses}}]

  failure_indicators: [{{signs_of_hallucination}}]

  source_verification:
    - source: "{{source_id}}"
      page: "{{if_book}}"
      quote: "{{ground_truth}}"

  weight: {{high/medium/low}}
```

**Style Fidelity Tests:**
```yaml
style_test_template:
  test_id: "style_{{number}}"
  category: style
  subcategory: {{voice/phrases/structure}}

  scenario: "{{communication_context}}"
  user_input: "{{prompt}}"

  expected_style_elements:
    signature_phrases: {{count}} of [{{list}}]
    tone: "{{expected_tone}}"
    structure: "{{expected_pattern}}"
    sentence_rhythm: "{{short_punchy/long_elaborate}}"

  evaluation_criteria:
    phrase_usage: "{{percentage}}% of signature phrases present"
    tone_match: "{{subjective_assessment}}"
    structural_consistency: "{{follows_template}}"

  comparison_sample:
    real_response: "{{how_real_mind_answered_similar}}"
    source: "{{source_id}}"

  weight: {{high/medium/low}}
```

**Paradox Navigation Tests (Layer 8 - Critical):**
```yaml
paradox_test_template:
  test_id: "paradox_{{number}}"
  category: paradox
  paradox_name: "{{Layer_8_paradox_being_tested}}"

  context_a_scenario:
    user_input: "{{prompt_triggering_side_A}}"
    expected_response_type: "{{side_A_perspective}}"

  context_b_scenario:
    user_input: "{{prompt_triggering_side_B}}"
    expected_response_type: "{{side_B_perspective}}"

  paradox_awareness_test:
    user_input: "You just said {{A}}, but earlier you said {{B}}. Aren't you contradicting yourself?"
    expected_response: "Acknowledge paradox, explain contextual resolution"

  evaluation_criteria:
    context_detection: "Correctly identifies which context applies"
    side_application: "Applies appropriate side of paradox"
    paradox_ownership: "Acknowledges and explains the tension"

  failure_indicators:
    - "Rigid consistency (ignores context)"
    - "Wishy-washy (doesn't commit to either side)"
    - "Denies the paradox exists"

  weight: critical
```

#### Generate Test Cases

**Process:**

1. **Mine testing_protocol.md** for test categories
2. **Generate personality tests** from Layers 6-8
3. **Generate knowledge tests** from KB and frameworks
4. **Generate style tests** from Layer 2 artifacts
5. **Generate paradox tests** from each Layer 8 paradox (critical)
6. **Generate edge case tests** for boundaries
7. **Assign weights** (critical/high/medium/low)
8. **Validate test coverage** (all 8 layers represented)

**Output:** `minds/{mind}/docs/logs/{timestamp}-test_cases.yaml`

```yaml
test_cases:
  mind_name: "{{name}}"
  system_prompt_version: "{{version}}"
  generation_date: "{{timestamp}}"

  test_summary:
    total_tests: {{count}}
    personality_tests: {{count}}
    knowledge_tests: {{count}}
    style_tests: {{count}}
    paradox_tests: {{count}}
    edge_case_tests: {{count}}

  critical_tests: [{{test_ids_that_must_pass}}]

  test_cases:
    - test_id: personality_001
      [... full test definition ...]

    - test_id: personality_002
      [... full test definition ...]

    [... all tests ...]

  blind_testing_protocol:
    description: "Tests for blind evaluation by humans"
    blind_tests: [{{subset_for_blind_testing}}]
    instructions: "{{how_to_conduct_blind_tests}}"
```

### Mode: Validation

#### Objective

Execute test battery on the actual clone and score results.

**Validation Process:**

```yaml
validation_workflow:
  setup:
    - "Deploy system prompt to target LLM"
    - "Initialize test execution environment"
    - "Prepare logging for all interactions"

  execution:
    - "Run all test cases sequentially"
    - "Log clone responses"
    - "Score each response immediately"
    - "Track patterns across tests"

  scoring:
    - "Automated scoring where possible"
    - "Human evaluation for subjective tests"
    - "Blind testing for critical personality tests"

  analysis:
    - "Identify failure patterns"
    - "Calculate category scores"
    - "Determine overall fidelity"
```

#### Test Execution

**For each test:**

1. **Present input to clone** (via LLM API)
2. **Capture clone response**
3. **Score response** against expected behavior:

```yaml
scoring_rubric:
  personality_tests:
    identity_consistency: 0-10
    value_alignment: 0-10
    authenticity: 0-10
    average: {{calculated}}

  knowledge_tests:
    factual_accuracy: 0-10
    source_citation: 0-10
    framework_application: 0-10
    average: {{calculated}}

  style_tests:
    phrase_usage: 0-10
    tone_match: 0-10
    structural_consistency: 0-10
    average: {{calculated}}

  paradox_tests:
    context_detection: 0-10
    side_application: 0-10
    paradox_ownership: 0-10
    average: {{calculated}}

  edge_case_tests:
    boundary_handling: 0-10
    graceful_degradation: 0-10
    limitation_acknowledgment: 0-10
    average: {{calculated}}
```

4. **Log test result**:

```yaml
test_result:
  test_id: "{{id}}"
  execution_time: "{{timestamp}}"

  input: "{{user_prompt}}"
  output: "{{clone_response}}"

  scores:
    dimension_1: {{0-10}}
    dimension_2: {{0-10}}
    dimension_3: {{0-10}}
    average: {{calculated}}

  pass_fail: {{pass/fail}}
  weight: {{critical/high/medium/low}}

  evaluator_notes: "{{observations}}"

  failure_analysis:
    issue: "{{if_failed_what_went_wrong}}"
    severity: {{critical/major/minor}}
    recommendation: "{{how_to_fix}}"
```

#### Blind Testing

**For critical personality tests:**

1. **Generate comparison set**:
   - Clone response
   - Real mind response (from sources)
   - Control response (different personality)

2. **Randomize order** (blind testers don't know which is which)

3. **Present to blind testers** familiar with original mind

4. **Ask testers to identify** which response is most authentic

5. **Calculate blind test accuracy**:
```yaml
blind_test_results:
  testers: {{count}}
  tests: {{count}}

  identification_accuracy:
    correctly_identified_clone: {{percentage}}%
    confused_with_real: {{percentage}}%
    confused_with_control: {{percentage}}%

  confidence_ratings:
    very_confident: {{count}}
    somewhat_confident: {{count}}
    guessing: {{count}}

  qualitative_feedback:
    what_felt_authentic: [{{comments}}]
    what_felt_off: [{{comments}}]
```

#### Progress Tracking

**Live validation progress:**

```
VALIDATION PROGRESS
===================

Personality Tests: [████████████████░░░░] 32/40 (80%)
  Passed: 28 | Failed: 4 | Critical failures: 1

Knowledge Tests: [████████████████████] 25/25 (100%)
  Passed: 24 | Failed: 1 | Critical failures: 0

Style Tests: [███████████████░░░░░] 15/20 (75%)
  Passed: 13 | Failed: 2 | Critical failures: 0

Paradox Tests: [██████████████████░░] 12/15 (80%)
  Passed: 10 | Failed: 2 | Critical failures: 1

Edge Cases: [████████████████████] 12/12 (100%)
  Passed: 12 | Failed: 0 | Critical failures: 0

Overall: 96/112 tests (85.7%)

Critical Issues: 2
Current Fidelity Estimate: 87.4%
```

### Mode: Report

#### Objective

Compile comprehensive validation report with findings, scores, and recommendations.

**Report Structure:**

**Output:** `minds/{mind}/docs/logs/{timestamp}-validation_report.yaml`

```yaml
validation_report:
  mind_name: "{{name}}"
  system_prompt_version: "{{version}}"
  validation_date: "{{timestamp}}"
  target_llm: "{{model}}"

  executive_summary:
    overall_fidelity: {{percentage}}%
    fidelity_target: 94%
    status: {{PASSED / NEEDS_IMPROVEMENT / FAILED}}

    key_findings:
      strengths: [{{list}}]
      weaknesses: [{{list}}]
      critical_issues: [{{if_any}}]

    recommendation: {{DEPLOY / FIX_ISSUES / MAJOR_REWORK}}

  detailed_scores:
    personality_fidelity: {{percentage}}%
      identity_consistency: {{score}}/10
      values_alignment: {{score}}/10
      obsession_presence: {{score}}/10
      paradox_navigation: {{score}}/10

    knowledge_accuracy: {{percentage}}%
      factual_correctness: {{score}}/10
      framework_application: {{score}}/10
      source_citation: {{score}}/10

    style_fidelity: {{percentage}}%
      linguistic_match: {{score}}/10
      signature_phrase_usage: {{score}}/10
      tone_consistency: {{score}}/10
      structural_patterns: {{score}}/10

    edge_case_handling: {{percentage}}%
      boundary_awareness: {{score}}/10
      graceful_degradation: {{score}}/10
      limitation_acknowledgment: {{score}}/10

  test_results:
    total_tests: {{count}}
    passed: {{count}}
    failed: {{count}}
    pass_rate: {{percentage}}%

    critical_tests:
      total: {{count}}
      passed: {{count}}
      failed: {{count}}

    failed_tests:
      - test_id: "{{id}}"
        category: "{{type}}"
        severity: {{critical/major/minor}}
        issue: "{{description}}"
        recommendation: "{{how_to_fix}}"

  blind_testing_results:
    testers_count: {{N}}
    clone_identification_accuracy: {{percentage}}%
    confidence_level: {{high/medium/low}}

    feedback_themes:
      authentic_elements: [{{what_felt_right}}]
      inauthentic_elements: [{{what_felt_wrong}}]

  layer_coverage_analysis:
    layer_1_behavioral: {{score}}/10 - "{{assessment}}"
    layer_2_communication: {{score}}/10 - "{{assessment}}"
    layer_3_routine: {{score}}/10 - "{{assessment}}"
    layer_4_recognition: {{score}}/10 - "{{assessment}}"
    layer_5_mental_models: {{score}}/10 - "{{assessment}}"
    layer_6_values: {{score}}/10 - "{{assessment}}"
    layer_7_obsessions: {{score}}/10 - "{{assessment}}"
    layer_8_paradoxes: {{score}}/10 - "{{assessment}}"

  production_readiness:
    fidelity_threshold_met: {{yes/no}}
    critical_tests_passed: {{yes/no}}
    blind_tests_passed: {{yes/no}}
    no_blocking_issues: {{yes/no}}

    overall_status: {{READY / NOT_READY}}

  recommendations:
    immediate_actions: [{{if_issues_found}}]
    optional_improvements: [{{nice_to_haves}}]
    iteration_plan: "{{if_not_ready_what_to_do_next}}"

  comparison_to_target:
    target_fidelity: 94%
    achieved_fidelity: {{percentage}}%
    delta: {{+/-_percentage}}%

    areas_exceeding_target: [{{list}}]
    areas_below_target: [{{list}}]

  validation_metadata:
    tests_executed: {{count}}
    execution_time: "{{hours}} hours"
    evaluators: [{{list}}]
    llm_api_calls: {{count}}
    total_tokens_used: {{count}}
```

#### FINAL CHECKPOINT: Production Approval

**Present report to user:**

```markdown
## PRODUCTION APPROVAL DECISION REQUIRED

### Validation Results Summary

**Overall Fidelity: {{percentage}}%**
Target: 94% | Status: {{PASSED/FAILED}}

### Scores by Category:
- ✓ Personality Fidelity: {{percentage}}% {{status_emoji}}
- ✓ Knowledge Accuracy: {{percentage}}% {{status_emoji}}
- ✓ Style Fidelity: {{percentage}}% {{status_emoji}}
- ✓ Paradox Navigation: {{percentage}}% {{status_emoji}}
- ✓ Edge Case Handling: {{percentage}}% {{status_emoji}}

### Critical Issues:
{{if_any_list_here}}

### Blind Testing:
- Clone identification accuracy: {{percentage}}%
- Tester confidence: {{level}}
- Key feedback: "{{quote}}"

### Production Readiness Assessment:

{{if_ready}}
✅ All critical tests passed
✅ Fidelity target achieved
✅ Blind tests successful
✅ No blocking issues

**RECOMMENDATION: DEPLOY TO PRODUCTION**

{{if_not_ready}}
⚠️ Issues found: {{count}}
- Critical: {{list}}
- Major: {{list}}

**RECOMMENDATION: {{FIX_ISSUES / MAJOR_REWORK}}**

---

**PRODUCTION DECISION:**

1. **DEPLOY** - Mind is production-ready, finalize documentation
2. **FIX_ISSUES** - Address specific issues (iteration):
   - [list specific fixes needed]
3. **MAJOR_REWORK** - Fundamental issues, return to {{phase}}

**Type 1, 2, or 3:**
```

**Handle response:**
- **DEPLOY**: Update status to production, finalize operational manual, complete pipeline
- **FIX_ISSUES**: Create fix task list, iterate on prompt (v1.1), re-test affected areas
- **MAJOR_REWORK**: Identify root cause, return to appropriate phase, document learnings

### Mode: Full

**Execute complete validation:**

1. Generate test cases (85-120 tests)
2. Execute validation test battery
3. Conduct blind testing (critical personality tests)
4. Compile validation report
5. Present results and recommendation
6. **HUMAN CHECKPOINT**: Production approval decision

## Outputs

### Test Generation Output
- `minds/{mind}/docs/logs/{timestamp}-test_cases.yaml`

### Validation Outputs
- `minds/{mind}/docs/logs/{timestamp}-test_execution.log`
- `minds/{mind}/docs/logs/{timestamp}-blind_test_results.yaml`

### Report Output
- `minds/{mind}/docs/logs/{timestamp}-validation_report.yaml`

### Full Mode Outputs
All of the above

## Validation Criteria

Mind validation is successful when:

- [ ] **Test suite generated**: 85-120 comprehensive tests covering all categories
- [ ] **Validation executed**: All tests run with logged results
- [ ] **Blind testing complete**: Critical personality tests validated by humans
- [ ] **Fidelity calculated**: Overall score ≥94% OR documented rationale for <94%
- [ ] **Critical tests passed**: All high-priority tests successful
- [ ] **Layer coverage validated**: All 8 DNA Mental layers performing adequately
- [ ] **Report compiled**: Comprehensive findings and recommendations documented
- [ ] **Production decision received**: User approved deployment or iteration plan

## Integration with AIOS

### Memory Layer
```typescript
memory.store({
  collection: 'mmos_validation',
  document: {
    mind_name: '{{mind}}',
    prompt_version: '{{version}}',
    fidelity: {{percentage}},
    validation_date: '{{timestamp}}',
    production_status: '{{ready/not_ready}}',
    tests_passed: {{count}},
    tests_failed: {{count}}
  }
});
```

### Agent Coordination
- **@qa**: Executes test generation and validation
- **@analyst**: Analyzes results and patterns
- **User**: Final production approval (mandatory)

### Performance Estimates
- Test generation: 1-2 hours, 80K tokens
- Test execution: 3-4 hours, 200K tokens (includes LLM API calls)
- Blind testing: 2-4 hours (human time)
- Report compilation: 1 hour, 40K tokens
- **Total: 7-11 hours, 320K tokens + human evaluation time**

## Notes

- **94% is the target but not absolute**: Document reasons if <94% and assess if good enough for use case
- **Critical tests must pass**: Non-negotiable for production
- **Blind testing is gold standard**: Human perception of authenticity matters most
- **Layer 8 (paradoxes) often the differentiator**: Failing paradox tests = robotic clone
- **Failed tests are learning opportunities**: Each failure points to prompt improvements
- **Iteration is expected**: v1.0 rarely perfect, v1.1-1.3 typical before production
- **Document everything**: Validation history valuable for future mind mappings

---

**Task Version:** 3.0
**Last Updated:** 2025-10-06
