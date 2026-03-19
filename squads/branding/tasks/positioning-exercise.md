# Positioning Exercise

```yaml
task:
  task_name: "Execute Positioning Canvas"
  status: pending
  responsible_executor: april-dunford
  execution_type: Agent
  estimated_time: "1-2h"
  elicit: true

  input:
    - "Brand strategy (from brand-diagnosis task)"
    - "Competitor landscape"
    - "Customer data/interviews (if available)"

  output:
    - "Positioning canvas (10 elements)"
    - "One-sentence positioning statement"
    - "Competitive alternatives map"
    - "Target customer profile"

  action_items:
    - step: 1
      name: "Map Competitive Alternatives"
      description: |
        Ask: "If your product didn't exist, what would customers use instead?"

        List ALL alternatives including:
        - Direct competitors (same category)
        - Indirect competitors (different approach, same job)
        - Status quo (spreadsheets, manual processes, doing nothing)

        For each: What's good about it? What's bad?

    - step: 2
      name: "Identify Unique Attributes"
      description: |
        For each competitive alternative, ask:
        "What features/capabilities do WE have that THEY don't?"

        Rules:
        - Must be objective facts, not opinions
        - Must be verifiable
        - List ALL, even small ones
        - Group into themes

    - step: 3
      name: "Map Value (and Proof)"
      description: |
        For each unique attribute, answer:
        "So what? What VALUE does this enable for the customer?"

        Then: "How can we PROVE this value?" (data, case studies, demos)

        Value must be described in CUSTOMER language, not company language.

    - step: 4
      name: "Define Target Customer Characteristics"
      description: |
        NOT demographics. CHARACTERISTICS:
        "What makes a customer most likely to care about our differentiated value?"

        Examples:
        - "Teams that have outgrown spreadsheet-based project management"
        - "Companies with 10-50 engineers shipping weekly"
        - "Founders who've been burned by agency pricing"

    - step: 5
      name: "Select Market Category"
      description: |
        Three options:
        1. HEAD-TO-HEAD: Compete in existing category (risky but clear)
        2. BIG FISH SMALL POND: Dominate a sub-segment (safer, narrower)
        3. CREATE NEW CATEGORY: Define a new space (hardest, highest reward)

        Selection criteria:
        - Where does our differentiated value shine MOST?
        - Where is competition WEAKEST?
        - Where can we be #1 or #2?

    - step: 6
      name: "Identify Relevant Trends"
      description: |
        What trends make your positioning MORE relevant right now?
        - Technology shifts
        - Market changes
        - Cultural movements
        - Regulatory changes

        Must be REAL trends, not aspirational.

    - step: 7
      name: "Synthesize Positioning Statement"
      description: |
        Template:
        "For [target customers] who [need/want], [brand] is a [market category]
        that [differentiated value] unlike [alternatives] because [proof]."

        Test: Read it aloud. Is it clear in one pass?

  output_example: |
    ## Positioning Canvas: Synkra AIOX

    **Competitive Alternatives:**
    1. Cursor / Windsurf — AI code editors (single-agent, no workflow)
    2. Custom GPT chains — manual prompt engineering (fragile, no structure)
    3. Doing it manually — copy-paste between ChatGPT and IDE

    **Unique Attributes:**
    - Multi-agent squads with specialized personas
    - Story-driven development with automated QA gates
    - Constitutional guardrails preventing agent drift

    **Value Map:**
    | Attribute | Value (customer language) | Proof |
    |-----------|--------------------------|-------|
    | Agent squads | "I don't context-switch between tools" | Side-by-side demo: 1 workflow vs 6 tabs |
    | Story-driven | "Every change is traceable and reviewable" | Audit trail in story files |
    | QA gates | "Bugs caught before I even see them" | 73% defect reduction in pilot |

    **Target Customer:**
    "Solo founders and small teams (2-8 devs) shipping SaaS products who've tried AI coding tools but hit the wall of inconsistency and context loss."

    **Market Category:** Big Fish Small Pond — "AI Development Orchestration"

    **Positioning Statement:**
    "For small SaaS teams who've outgrown single-agent AI coding, Synkra is an AI development orchestrator that coordinates specialized agents through structured workflows, unlike Cursor or custom GPT chains, because it enforces quality gates and maintains context across the entire development lifecycle."

  acceptance_criteria:
    - "Competitive alternatives are real, named companies"
    - "Unique attributes are facts, not aspirations"
    - "Value is described in customer language"
    - "Target characteristics are behavioral, not demographic"
    - "Positioning statement is one clear sentence"

  veto_conditions:
    - "No competitive alternatives identified → VETO"
    - "Target is 'everyone' → VETO"
    - "Value claims have no proof → VETO"
    - "Uses 'innovative' or 'cutting-edge' as differentiator → VETO"

  handoff:
    on_complete: "Pass to alexandra-watkins for naming"
    deliverable: "Positioning canvas document"
```
