---
task-id: test-fidelity
name: Clone Fidelity Testing
agent: emulator
version: 1.0.0
purpose: Validate cognitive clone authenticity through structured testing protocol

workflow-mode: interactive
elicit: true
elicitation-type: custom

mcp_integration:
  playwright:
    usage: "Automated fidelity testing via browser automation"
    required: false
    tools:
      - mcp__playwright__browser_navigate
      - mcp__playwright__browser_snapshot
      - mcp__playwright__browser_type
      - mcp__playwright__browser_click
      - mcp__playwright__browser_take_screenshot
    automation_scenarios:
      - "Test clone responses in ChatGPT/Claude web interface"
      - "Capture conversation screenshots for documentation"
      - "Execute batch test questions automatically"
      - "Compare response timing and patterns"

prerequisites:
  - Clone already activated via activate-clone.md
  - System-prompt loaded in memory
  - Test protocol questions available

inputs:
  - name: active_clone
    type: object
    description: Currently active clone data (from activation)
    required: true

  - name: test_protocol
    type: enum
    description: Testing protocol to use
    required: false
    options: ["quick", "standard", "comprehensive", "blind"]
    default: "standard"

outputs:
  - path: "temp/emulator/fidelity-test-{mind_name}-{timestamp}.yaml"
    description: Test results with scores and recommendations
    format: "yaml"

dependencies:
  templates:
    - fidelity-test-results.yaml
  checklists:
    - fidelity-validation-checklist.md

validation:
  success-criteria:
    - "At least 5 test questions executed"
    - "Responses evaluated against expected patterns"
    - "Overall fidelity score calculated"
    - "Recommendations generated"

  warning-conditions:
    - "Fidelity score < 85% (below 'good' threshold)"
    - "Multiple failed responses in same category"

  failure-conditions:
    - "Fidelity score < 70% (unacceptable)"
    - "Clone doesn't respond in character at all"

estimated-duration: "5-15 minutes depending on protocol"
---

# Test Fidelity Task

## MCP Integration: Playwright for Automated Testing

**Use Playwright MCP for automated fidelity testing:**

### Automated Test Execution

```javascript
// Navigate to LLM interface
mcp__playwright__browser_navigate({ url: "https://chat.openai.com" })

// Take snapshot to get element references
mcp__playwright__browser_snapshot()

// Type test question
mcp__playwright__browser_type({
  element: "message input",
  ref: "ref_123",
  text: "What drives you most in your work?",
  submit: true
})

// Wait for response
mcp__playwright__browser_wait_for({ time: 5 })

// Capture response screenshot for documentation
mcp__playwright__browser_take_screenshot({
  filename: "fidelity-test-PA1-response.png"
})
```

### When to Use Playwright Automation

- **Batch testing**: Execute 15+ questions without manual intervention
- **Documentation**: Capture conversation screenshots for validation reports
- **Comparison**: Run identical tests across different LLM interfaces
- **Timing analysis**: Measure response latency patterns

### Fallback (Manual Testing)

If Playwright unavailable or unsuitable:
- Execute tests manually via LLM interface
- Copy/paste responses for scoring
- Take manual screenshots if needed

---

## Purpose

Execute structured fidelity testing protocol to validate that cognitive clone accurately represents the target personality's thinking patterns, communication style, knowledge, and decision-making.

**Target Fidelity:** 94% (DNA Mental™ 8-layer complete)
**Minimum Acceptable:** 70% (for MVP/beta clones)

## When to Use This Task

**Use this task when:**
- After activating a clone for the first time
- After updating system-prompt or KB
- Before deploying clone to production
- User invokes `*test` command
- Validating regression after changes

**Do NOT use this task when:**
- Clone is not yet activated
- Just want basic interaction (use normal conversation)
- Need multi-clone testing (future enhancement)

## Test Protocols

### Protocol 1: Quick Test (5 questions, ~5 minutes)

**Purpose:** Rapid validation for iteration cycles

**Categories tested:**
1. Personality alignment (1 question)
2. Knowledge accuracy (2 questions)
3. Communication style (1 question)
4. Framework application (1 question)

**Pass threshold:** 70%

### Protocol 2: Standard Test (15 questions, ~10 minutes)

**Purpose:** Comprehensive validation for production readiness

**Categories tested:**
1. Personality alignment (3 questions)
2. Knowledge accuracy (4 questions)
3. Communication style (3 questions)
4. Framework application (3 questions)
5. Edge case handling (2 questions)

**Pass threshold:** 85%

### Protocol 3: Comprehensive Test (30+ questions, ~15 minutes)

**Purpose:** Deep validation for high-stakes deployments

**All categories with multiple questions each**

**Pass threshold:** 90%

### Protocol 4: Blind Test (user-driven)

**Purpose:** Gold standard - indistinguishability test

**Process:**
- User provides questions without showing clone
- Evaluators try to distinguish clone from original
- Target: 94% indistinguishability

## Key Activities & Instructions

### Step 1: Select Test Protocol

```python
protocols = {
    "quick": {
        "questions": 5,
        "duration": "5 min",
        "threshold": 70
    },
    "standard": {
        "questions": 15,
        "duration": "10 min",
        "threshold": 85
    },
    "comprehensive": {
        "questions": 30,
        "duration": "15 min",
        "threshold": 90
    },
    "blind": {
        "questions": "user-driven",
        "duration": "variable",
        "threshold": 94
    }
}

# Ask user or use default
protocol = input("Select test protocol [quick/standard/comprehensive/blind]: ") or "standard"
```

### Step 2: Load Test Questions

**Standard Test Questions (examples):**

**Category: Personality Alignment**
```yaml
- id: PA1
  question: "What drives you most in your work?"
  expected_themes:
    - Internal motivation over external validation
    - Long-term mission focus
    - Truth-seeking
  evaluation: Check if response reflects core obsessions (Layer 6-7)

- id: PA2
  question: "How do you handle criticism?"
  expected_themes:
    - Truth-seeking mindset
    - Temporal reframe (zoom to decades)
    - Mission > personal validation
  evaluation: Check decision architecture (Layer 5)

- id: PA3
  question: "What's your biggest fear?"
  expected_themes:
    - Mission failure (not personal)
    - Self-delusion
    - Missing exponential opportunities
  evaluation: Check values hierarchy (Layer 4)
```

**Category: Knowledge Accuracy**
```yaml
- id: KA1
  question: "Explain your framework for [domain-specific topic]"
  expected_content:
    - Specific frameworks from Layer 3
    - Concrete examples
    - Correct terminology
  evaluation: Verify against system-prompt frameworks

- id: KA2
  question: "What's your view on [controversial domain topic]?"
  expected_content:
    - Documented position
    - Supporting reasoning
    - Signature phrases
  evaluation: Check knowledge base content
```

**Category: Communication Style**
```yaml
- id: CS1
  question: "Describe success in your field"
  expected_style:
    - Signature phrases present
    - Characteristic sentence structure
    - Analogies/metaphors used
  evaluation: Match against Layer 2 (communication patterns)

- id: CS2
  question: "Give advice to a beginner"
  expected_style:
    - Tone matches persona
    - Vocabulary level appropriate
    - Framework-driven response
  evaluation: Check authenticity of voice
```

**Category: Framework Application**
```yaml
- id: FA1
  question: "How would you evaluate [opportunity X]?"
  expected_frameworks:
    - Apply documented mental models (Layer 3)
    - Use heuristics correctly
    - Decision criteria evident
  evaluation: Verify framework application accuracy

- id: FA2
  question: "What would you do if [scenario Y]?"
  expected_frameworks:
    - Decision architecture applied (Layer 5)
    - Values-driven choice (Layer 4)
    - Consistent with obsessions (Layer 6)
  evaluation: Check decision-making authenticity
```

**Category: Edge Case Handling**
```yaml
- id: EC1
  question: "What do you think about [something outside expertise]?"
  expected_behavior:
    - Admit uncertainty gracefully
    - Provide framework anyway
    - Stay in character
  evaluation: Handles boundaries well

- id: EC2
  question: "Contradict yourself on [topic]"
  expected_behavior:
    - Recognize productive paradoxes (Layer 8)
    - Explain tension authentically
    - Don't get defensive
  evaluation: Embodies contradictions naturally
```

### Step 3: Execute Test Questions

For each question:

```python
def execute_test_question(question, clone_response):
    """Score a single test response"""

    # Evaluate against expected criteria
    score = 0
    max_score = 100
    passed = False
    notes = []

    # Check themes/content (40%)
    if check_expected_themes(clone_response, question.expected_themes):
        score += 40
        notes.append("Themes present")
    else:
        notes.append("Missing expected themes")

    # Check style/authenticity (30%)
    if check_communication_style(clone_response, question.expected_style):
        score += 30
        notes.append("Authentic style")
    else:
        notes.append("Style deviation")

    # Check framework application (20%)
    if check_frameworks(clone_response, question.expected_frameworks):
        score += 20
        notes.append("Correct frameworks")
    else:
        notes.append("Framework misapplication")

    # Check signature elements (10%)
    if check_signature_elements(clone_response):
        score += 10
        notes.append("Signature phrases present")

    passed = score >= 70

    return {
        'question_id': question.id,
        'score': score,
        'passed': passed,
        'notes': notes
    }
```

### Step 4: Calculate Category Scores

```python
categories = {
    'personality_alignment': [],
    'knowledge_accuracy': [],
    'communication_style': [],
    'framework_application': [],
    'edge_case_handling': []
}

# Group test results by category
for result in test_results:
    category = get_category(result.question_id)
    categories[category].append(result.score)

# Calculate averages
category_scores = {}
for cat, scores in categories.items():
    if scores:
        avg = sum(scores) / len(scores)
        passed = len([s for s in scores if s >= 70])
        total = len(scores)
        category_scores[cat] = {
            'score': avg,
            'tests_passed': passed,
            'tests_total': total
        }
```

### Step 5: Calculate Overall Fidelity

```python
total_score = sum(cat['score'] for cat in category_scores.values())
max_possible = len(category_scores) * 100
fidelity_percentage = (total_score / max_possible) * 100

# Rating
if fidelity_percentage >= 94:
    rating = "excellent"
elif fidelity_percentage >= 85:
    rating = "good"
elif fidelity_percentage >= 70:
    rating = "acceptable"
else:
    rating = "poor"
```

### Step 6: Identify Strengths & Weaknesses

```python
strengths = []
weaknesses = []
recommendations = []

for category, data in category_scores.items():
    if data['score'] >= 90:
        strengths.append(f"Excellent {category} ({data['score']:.0f}%)")
    elif data['score'] < 70:
        weaknesses.append(f"Weak {category} ({data['score']:.0f}%)")
        recommendations.append(f"Strengthen {category}: review Layer X, add examples to KB")

# Specific recommendations based on failures
if category_scores['communication_style']['score'] < 80:
    recommendations.append("Add more communication examples to KB")
if category_scores['framework_application']['score'] < 80:
    recommendations.append("Strengthen Layer 3 (Mental Models) in system-prompt")
if category_scores['personality_alignment']['score'] < 80:
    recommendations.append("Review Layers 6-7 (Obsessions) - core personality weak")
```

### Step 7: Generate Test Report

```yaml
test_session:
  mind_name: {{mind_name}}
  display_name: {{display_name}}
  version: {{version}}
  tested_at: {{timestamp}}
  tested_by: {{tester_id}}
  test_protocol: {{protocol_name}}

test_categories:
  personality_alignment:
    score: {{score}}
    max_score: 100
    tests_passed: {{passed}}
    tests_total: {{total}}
    details: [{{test_results}}]

  knowledge_accuracy:
    score: {{score}}
    details: [{{test_results}}]

  communication_style:
    score: {{score}}
    details: [{{test_results}}]

  framework_application:
    score: {{score}}
    details: [{{test_results}}]

  edge_case_handling:
    score: {{score}}
    details: [{{test_results}}]

overall_results:
  total_score: {{sum}}
  max_possible: 500
  fidelity_percentage: {{percentage}}
  rating: {{excellent|good|acceptable|poor}}

strengths: [{{list}}]
weaknesses: [{{list}}]
recommendations: [{{list}}]

status: complete
```

### Step 8: Display Results to User

```
============================================================
FIDELITY TEST RESULTS
============================================================

Clone: {{display_name}} (v{{version}})
Protocol: {{protocol}}
Tested: {{timestamp}}

Overall Fidelity: {{percentage}}% ({{rating}})

Category Scores:
  Personality Alignment:  {{score}}% ({{passed}}/{{total}} passed)
  Knowledge Accuracy:     {{score}}% ({{passed}}/{{total}} passed)
  Communication Style:    {{score}}% ({{passed}}/{{total}} passed)
  Framework Application:  {{score}}% ({{passed}}/{{total}} passed)
  Edge Case Handling:     {{score}}% ({{passed}}/{{total}} passed)

Strengths:
  ✅ {{strength_1}}
  ✅ {{strength_2}}

Weaknesses:
  ⚠️ {{weakness_1}}
  ⚠️ {{weakness_2}}

Recommendations:
  → {{recommendation_1}}
  → {{recommendation_2}}

Target: 94% (DNA Mental™ complete)
Status: {{PASS|FAIL}}
```

## Example Execution

### Quick Test - Sam Altman

```bash
@emulator *activate sam_altman
@emulator *test quick

Running Quick Fidelity Test (5 questions)...

[1/5] Personality: What drives you most?
Response: "Building AGI is the most important work anyone can do. Everything else is a footnote. I'm internally driven - I do this to impress myself, not for status."
✅ PASS (95%) - Core obsessions evident, internal drive clear

[2/5] Knowledge: Explain exponential thinking
Response: "Compounding is magic. Look for it everywhere. Rate of improvement matters more than current state - slope over Y-intercept. 50%+ annual growth becomes massive in decade."
✅ PASS (90%) - Framework correct, signature phrases present

[3/5] Knowledge: View on AI safety?
Response: "Iterative deployment is key. We must build in public, learn from reality, not theory. Safety and capability improvements reinforce each other - alignment IS capability."
✅ PASS (92%) - Position accurate, reasoning authentic

[4/5] Style: Advice for founders
Response: "Trust the exponential, be patient. Days are long but decades are short. I've never seen a slow-moving founder succeed. Speed matters more than you think."
✅ PASS (94%) - Signature phrases, tone perfect

[5/5] Framework: Evaluate opportunity X
Response: "First, temporal zoom-out to 10 years. Is this exponential or linear? If exponential, does consensus mock it? If yes, investigate harder. Then stress-test for truth..."
✅ PASS (88%) - Algorithm application correct

============================================================
OVERALL FIDELITY: 91.8% (good)

Target: 94% (excellent)
Status: PASS (above 85% threshold)

Strengths:
  ✅ Excellent personality alignment (95%)
  ✅ Strong framework application (88%)

Recommendations:
  → Add 2-3 more deep knowledge examples to reach excellent tier
  → System-prompt is production-ready
============================================================
```

## Notes

- **Quick test** good for iteration during development
- **Standard test** required before production deployment
- **Comprehensive test** for high-stakes or regulated use cases
- **Blind test** is gold standard but requires human evaluators
- Re-test after any system-prompt or KB updates
- Track fidelity over versions (regression detection)

---

**Task Version:** 1.0.0
**Created:** 2025-10-14
**Agent:** emulator (Mirror - Mind Clone Activation Specialist)
