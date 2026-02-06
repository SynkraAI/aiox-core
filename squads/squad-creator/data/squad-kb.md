# Squad Knowledge Base

## Overview

This knowledge base contains comprehensive guidance on creating high-quality AIOS-FULLSTACK squads. It covers architectural patterns, best practices, design principles, and domain-specific knowledge for the Squad Architect Pack.

---

## 1. EXPANSION PACK ARCHITECTURE

### 1.1 Core Concepts

**What is an Squad?**

An squad is a modular, self-contained extension to AIOS-FULLSTACK that adds domain-specific capabilities through:
- Specialized agents with domain expertise
- Workflow tasks that solve domain problems
- Output templates that produce domain artifacts
- Validation checklists for quality assurance
- Knowledge bases for domain reference

**Why Squads?**

- **Modularity:** Extend AIOS without modifying core framework
- **Domain Focus:** Specialize in specific industries or use cases
- **Reusability:** Share expertise across projects and teams
- **Maintainability:** Update domain knowledge independently
- **Community:** Enable community contributions to AIOS ecosystem

### 1.2 Pack Structure Standards

```
squads/{pack-name}/
├── agents/              # Domain-specific AI agents
│   ├── {agent-id}.md
│   └── ...
├── checklists/          # Validation checklists
│   ├── {checklist}.md
│   └── ...
├── config.yaml          # Pack metadata and configuration
├── data/               # Knowledge bases and reference data
│   ├── {domain}-kb.md
│   └── ...
├── README.md           # Pack documentation
├── tasks/              # Workflow definitions
│   ├── {task-id}.md
│   └── ...
└── templates/          # Output templates
    ├── {template-id}.yaml
    └── ...
```

**Required Files:**
- `config.yaml` - Pack configuration and metadata
- `README.md` - Comprehensive documentation
- At least one agent in `agents/`

**Optional but Recommended:**
- Tasks for common workflows
- Templates for standard outputs
- Checklists for validation
- Knowledge bases for reference

### 1.3 Component Relationships

```
┌─────────────┐
│   config.yaml │  ← Pack metadata
└─────────────┘
      ↓
┌─────────────┐
│  README.md  │  ← User documentation
└─────────────┘
      ↓
┌─────────────┐
│   agents/   │  ← Domain experts
└─────────────┘
      ↓
      ├─→ tasks/         ← Workflows
      ├─→ templates/     ← Output generators
      ├─→ checklists/    ← Validators
      └─→ data/          ← Knowledge bases
```

---

## 2. AGENT DESIGN PRINCIPLES

### 2.1 Agent Persona Development

**Authenticity**

Create genuine personas that reflect real domain experts:
- Professional background and experience level
- Communication style and personality traits
- Values, priorities, and decision-making approach
- Areas of expertise and limitations

**Example:**
```yaml
persona:
  role: Senior Legal Contract Specialist with 15+ years experience
  style: Professional, detail-oriented, client-protective, consultative
  identity: Master legal document craftsman specializing in commercial agreements
  focus: Risk mitigation, clarity, compliance, client protection
```

**Consistency**

Ensure persona is consistent across:
- Communication tone and style
- Decision-making approach
- Expertise level and confidence
- Interaction patterns

### 2.2 Command Design

**Naming Conventions**

All commands start with `*`:
- `*help` - Show available commands (required)
- `*create-X` - Create new artifact
- `*review-X` - Review existing artifact
- `*validate-X` - Validate against criteria
- `*chat-mode` - Conversational mode (default)
- `*exit` - Deactivate agent (required)

**Command Categories**

1. **Creation Commands** - Generate new artifacts
   - `*create-contract`, `*create-report`, `*draft-proposal`

2. **Analysis Commands** - Analyze existing content
   - `*review-document`, `*analyze-risk`, `*assess-compliance`

3. **Utility Commands** - Helper functions
   - `*help`, `*list-templates`, `*show-checklist`

4. **Mode Commands** - Change agent behavior
   - `*chat-mode`, `*expert-mode`, `*tutorial-mode`

### 2.3 Agent Customization Guidelines

**Core Customization Patterns:**

```yaml
customization: |
  - DOMAIN FIRST: Apply domain expertise to every interaction
  - QUALITY FOCUS: Prioritize accuracy and completeness over speed
  - COMPLIANCE AWARE: Always consider regulatory requirements
  - USER GUIDANCE: Provide educational context with recommendations
  - ITERATIVE REFINEMENT: Support multiple rounds of improvement
  - DOCUMENTATION: Explain reasoning behind decisions
```

**Security-Focused Customization:**

```yaml
customization: |
  - VALIDATION FIRST: Validate all inputs before processing
  - NO ASSUMPTIONS: Request clarification for ambiguous requirements
  - AUDIT TRAIL: Document all decisions and their justifications
  - LEAST PRIVILEGE: Request minimal necessary access/permissions
  - SECURE OUTPUT: Never expose sensitive data in generated content
```

---

## 3. TASK WORKFLOW DESIGN

### 3.1 Workflow Types

**1. Simple Linear Workflows**

Sequential steps without branching:
```markdown
Step 1: Gather requirements
Step 2: Process data
Step 3: Generate output
Step 4: Validate results
```

**2. Interactive Workflows**

Gather information through elicitation:
```markdown
Step 1: Ask user for X
Step 2: Based on X, determine Y
Step 3: Elicit Z details
Step 4: Generate customized output
```

**3. Complex Workflows**

Multiple sections with conditional logic:
```markdown
Section 1: Initial setup (always)
Section 2: Basic info (always)
Section 3: Advanced config (if user selects advanced)
Section 4: Integration setup (if integrating with external systems)
Section 5: Finalize (always)
```

**4. Orchestration Workflows**

Coordinate multiple sub-tasks:
```markdown
Step 1: Execute task A
Step 2: If A succeeds, execute task B and C in parallel
Step 3: Wait for B and C completion
Step 4: Execute task D using outputs from B and C
Step 5: Validate complete workflow
```

### 3.2 Elicitation Best Practices

**Incremental vs "YOLO" Mode**

Always offer users choice:
```markdown
- Ask: "How would you like to proceed?
  A. Incremental: Step-by-step with review at each stage
  B. YOLO: Fast path gathering all info upfront"
```

**Effective Question Design**

- **Specific:** "What is the contract duration in months?" vs "Tell me about timing"
- **Actionable:** Answers directly usable in output
- **Validated:** Provide examples or acceptable ranges
- **Progressive:** Build on previous answers

**Advanced Elicitation Patterns**

```yaml
custom_elicitation:
  title: "Advanced Configuration Wizard"
  sections:
    - id: architecture-review
      options:
        - "Security Analysis - Deep dive into security requirements"
        - "Performance Optimization - Focus on performance patterns"
        - "Cost Analysis - Evaluate cost implications"
        - "Standard Review - Cover all areas equally"
        - "Continue to next section"
```

### 3.3 Validation Integration

**Built-in Validation Checkpoints**

```markdown
## Validation
- [ ] Required field X is present
- [ ] Format matches specification Y
- [ ] Business rule Z is satisfied
- [ ] Output is under size limit
- [ ] No security violations detected
```

**Progressive Validation**

- Validate inputs before processing
- Validate intermediates during workflow
- Validate final output before saving
- Provide clear error messages
- Offer correction opportunities

---

## 4. TEMPLATE ENGINEERING

### 4.1 Template Structure Patterns

**Simple Template (Single Section)**

```yaml
sections:
  - id: main-content
    instruction: Generate complete document
    template: |
      # {{title}}
      {{content}}
```

**Structured Template (Multiple Sections)**

```yaml
sections:
  - id: header
    instruction: Create document header
    template: |
      # {{title}}
      **Author:** {{author}}
      **Date:** {{date}}

  - id: body
    instruction: Generate main content
    template: |
      ## Overview
      {{overview}}

      ## Details
      {{details}}

  - id: footer
    instruction: Add document footer
    template: |
      ---
      _Document Version: {{version}}_
```

**Interactive Template (With Elicitation)**

```yaml
workflow:
  mode: interactive
  elicitation: advanced-elicitation
  custom_elicitation:
    title: "Document Generation Wizard"
    sections:
      - id: detail-level
        options:
          - "Summary - Brief overview only"
          - "Standard - Comprehensive details"
          - "Detailed - Exhaustive coverage"

sections:
  - id: content
    elicit: true
    custom_elicitation: detail-level
    template: |
      {{content}}
```

### 4.2 Placeholder Conventions

**Naming Standards**

- Use `{{snake_case}}` or `{{camelCase}}`
- Be descriptive: `{{client_company_name}}` not `{{cc}}`
- Group related placeholders: `{{contract_start_date}}`, `{{contract_end_date}}`

**Types of Placeholders**

1. **Simple Values:** `{{project_name}}`, `{{author}}`
2. **Dates:** `{{current_date}}`, `{{contract_expiry}}`
3. **Content Blocks:** `{{overview}}`, `{{technical_details}}`
4. **Lists:** `{{requirements_list}}`, `{{deliverables}}`
5. **Conditionals:** `{{#if premium}}{{premium_features}}{{/if}}`

### 4.3 Special Features

**Repeatable Sections**

```yaml
sections:
  - id: items-list
    sections:
      - id: item
        repeatable: true
        title: "Item {{item_number}}"
        template: |
          - **Name:** {{item_name}}
          - **Description:** {{item_description}}
          - **Quantity:** {{item_quantity}}
```

**Conditional Sections**

```yaml
sections:
  - id: advanced-config
    title: Advanced Configuration
    condition: {{requires_advanced_config}}
    template: |
      ## Advanced Settings
      {{advanced_settings}}
```

**Mermaid Diagrams**

```yaml
sections:
  - id: architecture-diagram
    type: mermaid
    mermaid_type: graph
    template: |
      graph TB
          A[{{component_a}}] --> B[{{component_b}}]
          B --> C[{{component_c}}]
```

---

## 5. QUALITY ASSURANCE

### 5.1 Validation Levels

**Level 1: Syntax Validation**
- YAML/JSON parsing succeeds
- Markdown renders correctly
- No broken references

**Level 2: Structural Validation**
- All required fields present
- Dependencies exist
- Naming conventions followed

**Level 3: Functional Validation**
- Agents activate successfully
- Tasks execute completely
- Templates generate valid output

**Level 4: Domain Validation**
- Content is domain-appropriate
- Expertise level is credible
- Outputs meet professional standards

**Level 5: Integration Validation**
- Integrates with AIOS framework
- Works with other packs
- Memory layer functions correctly

### 5.2 Testing Strategies

**Component Testing**

Test each component independently:
1. Agent activation
2. Command execution
3. Task workflow
4. Template generation
5. Checklist validation

**Integration Testing**

Test components together:
1. Agent → Task execution
2. Task → Template generation
3. Agent → Checklist validation
4. Cross-pack interactions

**User Acceptance Testing**

Real-world usage scenarios:
1. New user installation
2. Typical workflow execution
3. Error recovery
4. Output quality assessment

---

## 6. SECURITY BEST PRACTICES

### 6.1 Code Generation Security

**Never Generate Unsafe Code**

Prohibited patterns:
- `eval()` or dynamic code execution
- Unvalidated input to system commands
- SQL injection vulnerabilities
- Command injection risks
- XSS vulnerabilities in HTML output

**Safe Code Patterns**

Required practices:
- Input sanitization
- Output encoding
- Parameterized queries
- Path validation
- Principle of least privilege

### 6.2 Data Security

**Sensitive Data Handling**

- Never hardcode credentials
- Never include API keys in examples
- Sanitize PII in documentation
- Use placeholders for sensitive values
- Provide secure storage guidance

**Example:**

```yaml
# ❌ WRONG
api_key: "sk-1234567890abcdef"

# ✅ CORRECT
api_key: "{{API_KEY}}"  # Load from environment variable
```

### 6.3 Output Security

**Generated Output Safety**

- Validate file paths for traversal
- Sanitize user-provided content
- Escape HTML/XML special characters
- Validate URLs before including
- Check file permissions

---

## 7. USER EXPERIENCE DESIGN

### 7.1 Clarity & Simplicity

**Clear Purpose**

Every component should answer:
- What does this do?
- When should I use it?
- What do I need to provide?
- What will I get?

**Minimal Cognitive Load**

- One task = one goal
- Intuitive command names
- Sensible defaults
- Progressive disclosure

### 7.2 Documentation Excellence

**Essential Documentation**

Every pack must document:
1. Purpose and use cases
2. Installation instructions
3. Usage examples
4. Integration guidance
5. Troubleshooting

**Documentation Principles**

- Examples > Explanations
- Show don't tell
- Realistic scenarios
- Complete workflows
- Expected outputs

### 7.3 Error Handling & Feedback

**User-Friendly Errors**

Good error message structure:
1. What went wrong
2. Why it went wrong
3. How to fix it
4. What to do next

**Example:**

```
❌ Error: Invalid input

✅ Error: Contract duration must be a positive number
   You provided: "six months"
   Expected format: 6
   Please provide the duration as a number of months.
```

---

## 8. DOMAIN ADAPTATION PATTERNS

### 8.1 Professional Services

**Legal Domain**
- Emphasize compliance and risk management
- Use precise legal terminology
- Include regulatory references
- Provide jurisdiction considerations
- Validate against legal standards

**Medical/Healthcare**
- Prioritize patient safety
- Use standard medical terminology
- Include evidence-based practices
- Comply with HIPAA/regulations
- Validate against clinical guidelines

**Financial Services**
- Focus on accuracy and audit trails
- Use financial reporting standards
- Include risk assessments
- Comply with regulations (SOX, etc.)
- Validate against accounting principles

### 8.2 Creative Domains

**Content Creation**
- Emphasize creativity and originality
- Support iterative refinement
- Provide style guidance
- Include brand voice options
- Encourage experimentation

**Design & Architecture**
- Visual thinking support
- Include diagrams and mockups
- Provide design patterns
- Support iteration and feedback
- Balance aesthetics and function

### 8.3 Technical Domains

**Software Development**
- Follow coding standards
- Include testing strategies
- Provide architecture patterns
- Support CI/CD integration
- Emphasize maintainability

**Data & Analytics**
- Focus on accuracy and rigor
- Include statistical methods
- Provide visualization options
- Support reproducibility
- Validate data quality

---

## 9. INTEGRATION PATTERNS

### 9.1 Core AIOS Integration

**Agent Activation**

Standard syntax: `@agent-id`
```bash
@legal-contract-specialist
```

**Command Execution**

Standard syntax: `*command-name`
```bash
*create-contract
*review-document
*help
```

**Memory Layer**

Store and retrieve domain knowledge:
```javascript
// Save to memory
memory.save('legal-contracts', {
  template: 'service-agreement',
  jurisdiction: 'california',
  created: Date.now()
});

// Retrieve from memory
const contracts = memory.query('legal-contracts', {
  jurisdiction: 'california'
});
```

### 9.2 Cross-Pack Collaboration

**Dependency Declaration**

In `config.yaml`:
```yaml
dependencies:
  - aios-developer  # For code generation
  - document-library  # For templates
```

**Agent Collaboration**

```markdown
## Integration Points
- Collaborate with @architect for system design
- Use @qa-specialist for validation
- Integrate with @pm for planning
```

### 9.3 External System Integration

**API Integration**

```yaml
integration:
  apis:
    - name: Legal Database
      url: https://api.legal-db.com
      auth: API_KEY
      scope: read-only
```

**File System Integration**

```yaml
integration:
  files:
    - input: docs/requirements/
      output: docs/contracts/
      formats: [md, pdf, docx]
```

---

## 10. MAINTENANCE & EVOLUTION

### 10.1 Versioning Strategy

**Semantic Versioning**

- **Major (1.0.0):** Breaking changes, incompatible updates
- **Minor (0.1.0):** New features, backward compatible
- **Patch (0.0.1):** Bug fixes, minor improvements

**Upgrade Guidance**

Document for each version:
- What changed
- Why it changed
- Migration steps
- Breaking changes
- Deprecated features

### 10.2 Extensibility

**Design for Extension**

- Modular components
- Clear extension points
- Plugin architecture
- Configuration over code
- Documented APIs

**Adding New Components**

Making it easy to add:
- New agents (via templates)
- New tasks (via patterns)
- New templates (via examples)
- New knowledge (via KB structure)

### 10.3 Community Contributions

**Contribution-Friendly Structure**

- Clear component boundaries
- Good documentation
- Example implementations
- Testing guidelines
- Review checklists

**Governance**

- Contribution guidelines
- Code review process
- Quality standards
- License terms
- Maintainer contacts

---

## 11. COMMON PATTERNS & RECIPES

### 11.1 Pattern: Document Generator

```
Agent: Document Specialist
Task: create-document
Template: document-template.yaml
Checklist: document-quality-checklist.md
KB: document-standards.md
```

### 11.2 Pattern: Code Reviewer

```
Agent: Code Review Expert
Task: review-code
Template: code-review-report.yaml
Checklist: code-quality-checklist.md
KB: coding-standards.md
```

### 11.3 Pattern: Compliance Validator

```
Agent: Compliance Officer
Task: validate-compliance
Template: compliance-report.yaml
Checklist: compliance-checklist.md
KB: regulatory-requirements.md
```

### 11.4 Pattern: Workflow Orchestrator

```
Agent: Workflow Coordinator
Task: execute-workflow
  → Subtask 1: initialize
  → Subtask 2: process
  → Subtask 3: validate
  → Subtask 4: finalize
Template: workflow-summary.yaml
KB: workflow-patterns.md
```

---

## 12. TROUBLESHOOTING GUIDE

### 12.1 Common Issues

**Agent Won't Activate**

Possible causes:
- Agent ID doesn't match filename
- YAML syntax error in agent definition
- Missing required fields in agent config

Solution: Validate YAML syntax and check all required fields

**Task Fails to Execute**

Possible causes:
- Referenced template doesn't exist
- Elicitation configuration invalid
- Task instructions ambiguous

Solution: Verify all dependencies exist and instructions are clear

**Template Generates Invalid Output**

Possible causes:
- Placeholder names mismatch
- YAML syntax errors
- Conditional logic errors

Solution: Test template with sample data, validate YAML syntax

### 12.2 Debugging Techniques

1. **Component Isolation:** Test each component separately
2. **Incremental Building:** Build and test piece by piece
3. **Example-Driven:** Create examples for each component
4. **Validation First:** Run validation checklist early
5. **User Testing:** Get feedback from actual users

---

## 13. ANTI-PATTERNS TO AVOID

### 13.1 Design Anti-Patterns

❌ **Monolithic Agents**
- One agent trying to do everything
- Better: Specialized agents for different roles

❌ **Over-Complex Tasks**
- Tasks with 20+ steps
- Better: Break into smaller, focused tasks

❌ **Template Explosion**
- 50 nearly-identical templates
- Better: One flexible template with conditionals

❌ **Circular Dependencies**
- Agent A needs Task B which needs Agent A
- Better: Hierarchical dependencies

### 13.2 Technical Anti-Patterns

❌ **Hardcoded Values**
- Embedding specific values in templates
- Better: Use placeholders and configuration

❌ **Unclear References**
- Generic names like `task1.md`, `template.yaml`
- Better: Descriptive names like `create-contract.md`

❌ **Insufficient Validation**
- No error checking
- Better: Comprehensive validation at each step

❌ **Poor Error Messages**
- "Error: Invalid"
- Better: "Error: Contract duration must be 1-60 months. You provided: 0"

### 13.3 UX Anti-Patterns

❌ **Expert-Only Language**
- Using jargon without explanation
- Better: Explain terms or provide glossary

❌ **Missing Examples**
- Documentation without usage examples
- Better: At least 2-3 realistic examples

❌ **Assumed Knowledge**
- Expecting users know AIOS internals
- Better: Self-contained documentation

---

## 14. FUTURE-PROOFING

### 14.1 Design for Change

**Principle: Loose Coupling**
- Components interact through well-defined interfaces
- Changes to one component don't break others
- Easy to swap implementations

**Principle: High Cohesion**
- Related functionality grouped together
- Each component has single, clear purpose
- Minimal cross-component dependencies

### 14.2 Technology Evolution

**Stay Current**
- Monitor AIOS framework updates
- Update dependencies regularly
- Test with new AIOS versions
- Deprecate obsolete features gracefully

**Plan for Growth**
- Modular architecture
- Extensible designs
- Configuration-driven behavior
- Plugin systems

---

## 15. SUCCESS METRICS

### 15.1 Quality Metrics

- ✅ 100% of validation checklist passed
- ✅ All examples execute successfully
- ✅ Documentation complete and accurate
- ✅ No security vulnerabilities
- ✅ User feedback positive

### 15.2 Adoption Metrics

- Installation count
- Active users
- Tasks executed
- Outputs generated
- User satisfaction score

### 15.3 Health Metrics

- Bugs reported vs fixed
- Feature requests
- Contribution rate
- Update frequency
- Compatibility with latest AIOS

---

## CONCLUSION

Creating high-quality squads requires:
1. Deep domain understanding
2. User-centered design
3. Technical excellence
4. Comprehensive documentation
5. Continuous improvement

Follow this knowledge base to create squads that:
- Solve real problems
- Provide genuine value
- Delight users
- Stand the test of time
- Contribute to AIOS ecosystem

---

_Knowledge Base Version: 1.0_
_Last Updated: 2025-09-30_
_Maintained by: AIOS Squad Architect Team_
