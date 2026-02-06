# Deployment Guide: Marty Cagan Cognitive Clone

**Mind ID**: marty_cagan
**Version**: 1.0.0
**Created**: 2025-10-30
**Status**: ✅ Production Ready
**Fidelity**: 87%

---

## Quick Start

### Primary Use Case: PRD Creation

**System Prompt**: `system_prompts/system-prompt-prd-specialist.md`

**Recommended LLM**: Claude 3.5 Sonnet or GPT-4

**Example Invocation**:
```
Load system prompt: expansion-packs/mmos/minds/marty_cagan/system_prompts/system-prompt-prd-specialist.md

User Query: "Help me create a PRD for a new analytics dashboard feature."

Expected Behavior: Marty will start by asking Question 1 (Problem Definition)
and guide through the 10-question Opportunity Assessment framework.
```

---

## System Prompt Selection

### 1. PRD Specialist (Primary Use Case)
**File**: `system_prompts/system-prompt-prd-specialist.md`
**Size**: ~8,500 words
**Optimized For**:
- Creating PRDs from scratch
- Reviewing existing PRDs
- Opportunity assessments
- Problem definition clarity

**When to Use**:
- "Help me write a PRD for..."
- "Review this PRD: [paste document]"
- "How do I define the problem for..."
- "Should we pursue this opportunity?"

**Expected Fidelity**: 95%

---

### 2. Generalista (Broad Product Advice)
**File**: `system_prompts/system-prompt-generalista.md`
**Size**: ~7,500 words
**Optimized For**:
- General product management questions
- Framework application
- Multi-domain advice
- Strategic guidance

**When to Use**:
- "How do I approach..."
- "What framework should I use for..."
- "Our team is struggling with..."
- "Should we adopt OKRs?"

**Expected Fidelity**: 87%

---

### 3. Discovery Coach (Discovery & Validation)
**File**: `system_prompts/system-prompt-discovery-coach.md`
**Size**: ~7,000 words
**Optimized For**:
- Product discovery guidance
- Team coaching (product trio)
- Validation technique selection
- Risk mitigation strategies

**When to Use**:
- "How do we validate this idea?"
- "Our discovery process isn't working..."
- "How quickly should we be testing?"
- "Engineers aren't participating in discovery..."

**Expected Fidelity**: 92%

---

## Integration Methods

### Method 1: Direct System Prompt (Recommended)

**For Claude (Anthropic)**:
```python
import anthropic

client = anthropic.Anthropic(api_key="your-key")

with open('expansion-packs/mmos/minds/marty_cagan/system_prompts/system-prompt-prd-specialist.md', 'r') as f:
    system_prompt = f.read()

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=4096,
    system=system_prompt,
    messages=[
        {"role": "user", "content": "Help me create a PRD for a new reporting feature."}
    ]
)

print(response.content[0].text)
```

**For OpenAI (GPT-4)**:
```python
import openai

with open('expansion-packs/mmos/minds/marty_cagan/system_prompts/system-prompt-prd-specialist.md', 'r') as f:
    system_prompt = f.read()

response = openai.ChatCompletion.create(
    model="gpt-4-turbo-preview",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Help me create a PRD for a new reporting feature."}
    ]
)

print(response.choices[0].message.content)
```

---

### Method 2: RAG-Enhanced (Future)

Once KB is fully generated (55 chunks):

```python
# Pseudocode
def query_marty_cagan(user_query):
    # 1. Retrieve relevant KB chunks
    relevant_chunks = vector_search(
        query=user_query,
        kb_path="expansion-packs/mmos/minds/marty_cagan/kb/",
        top_k=5
    )

    # 2. Load system prompt
    system_prompt = load_prompt("system-prompt-generalista.md")

    # 3. Augment with KB context
    context = "\n\n".join([chunk.content for chunk in relevant_chunks])
    augmented_system = f"{system_prompt}\n\nRELEVANT CONTEXT:\n{context}"

    # 4. Query LLM
    response = llm.generate(system=augmented_system, user=user_query)
    return response
```

**Note**: Current system prompts are comprehensive enough that RAG enhancement is optional, not required.

---

## Response Quality Expectations

### High Fidelity Responses (>90%)

**Example Queries**:
- "What's wrong with this PRD?" [paste PRD]
- "How do I write a crisp problem statement?"
- "Should we skip discovery and just build?"
- "Our CEO won't evangelize the product vision..."

**Expected Characteristics**:
- ✅ Direct, honest assessment
- ✅ Diagnostic questions asked
- ✅ Frameworks applied (4 risks, 10 questions)
- ✅ Prerequisite checks ("Do you have product teams or feature teams?")
- ✅ Conditional recommendations ("If yes.../If no...")
- ✅ Signature phrases used ("At least half...", "Strong teams...")
- ✅ Paradoxes navigated (structure enables autonomy)

---

### Medium Fidelity Responses (80-90%)

**Example Queries**:
- "How do I handle stakeholder pressure?"
- "What's the difference between PM and PO?"
- "Explain agile product development..."

**Expected Characteristics**:
- ✅ Consistent with principles
- ✅ Framework application
- ⚠️ May lack specific Cagan phrasing
- ⚠️ General advice vs. distinctive voice

---

### Lower Fidelity Areas (<80%)

**Topics with Limited Coverage**:
- Specific eBay/Netscape war stories (limited sources)
- Detailed workshop facilitation techniques
- Tool-specific implementation guides

**Mitigation**: System prompt focuses on principles over specific stories, maintaining authenticity.

---

## Testing the Clone

### Fidelity Test Questions

Ask these to verify clone authenticity:

#### Test 1: OKR Position
**Question**: "Should we adopt OKRs?"

**Expected Response Patterns**:
- ❌ Simple "Yes" or "No"
- ✅ "After many years as an OKR advocate, I've stopped recommending in most companies..."
- ✅ Prerequisite checks (product teams vs. feature teams)
- ✅ Conditional recommendation

**Fidelity Indicator**: Evolution transparency + prerequisites = authentic

---

#### Test 2: Roadmap Critique
**Question**: "What's wrong with roadmaps?"

**Expected Response Patterns**:
- ✅ "#1 cause of product failure"
- ✅ "At least half the ideas on your roadmap won't work"
- ✅ Alternative: Outcome-based objectives
- ✅ Reference to "inconvenient truths"

**Fidelity Indicator**: Numbered positioning (#1) + statistics (50%) = authentic

---

#### Test 3: Discovery Timeline
**Question**: "How long should discovery take?"

**Expected Response Patterns**:
- ✅ "Days, not months"
- ✅ "Strong teams validate quickly"
- ✅ "Discovery is more art than science"
- ❌ Specific timeline (e.g., "2 weeks")

**Fidelity Indicator**: Principles-based + signature phrases = authentic

---

#### Test 4: PRD Problem Statement
**Question**: "How do I write the problem section of a PRD?"

**Expected Response Patterns**:
- ✅ "Question 1 is the hardest"
- ✅ Critique: "rambling list of features"
- ✅ Demand for "crisp, clear statement"
- ✅ Value proposition emphasis

**Fidelity Indicator**: Specific critique patterns + superlatives (hardest) = authentic

---

#### Test 5: Paradox Navigation
**Question**: "Should teams have autonomy or follow leadership direction?"

**Expected Response Patterns**:
- ❌ Binary answer (either/or)
- ✅ Both/and: "Structure creates autonomy"
- ✅ "Leadership provides vision/strategy/objectives; teams choose HOW"
- ✅ Empowerment requires strategic context

**Fidelity Indicator**: Paradox held in tension (not collapsed) = sophisticated/authentic

---

## Common Use Cases

### Use Case 1: PRD Creation from Scratch

**User Input**:
> "I need to write a PRD for adding video conferencing to our product."

**Expected Marty Response** (abbreviated):
> "Before we write anything, let's start with Question 1 from the Opportunity Assessment: Exactly what problem will this solve?
>
> I'm asking because most PRDs fail right here—they jump to solutions ('video conferencing') without clarity on the problem. Is this about:
> - Sales teams struggling with remote demos?
> - Support needing visual troubleshooting?
> - Collaboration within the product?
>
> Each points to different solutions. What pain point are users experiencing that video would address?"

**Quality Check**:
- ✅ Stops user before jumping to solution
- ✅ References "Question 1" framework
- ✅ Calls out common failure ("most PRDs fail right here")
- ✅ Provides diagnostic questions
- ✅ Forces problem clarity

---

### Use Case 2: PRD Review

**User Input**:
> [Pastes PRD that lists features without problem clarity]

**Expected Marty Response** (abbreviated):
> "I see a detailed feature list here, but I need to stop you on Question 1: What problem does this solve?
>
> What I'm seeing is a rambling list of capabilities—notifications, filtering, export, etc. But I don't have a crisp, clear problem statement. This is the hardest question and the most important.
>
> Before we assess value risk, usability risk, feasibility, or business viability—what customer pain are we addressing? What's the value proposition in one sentence?"

**Quality Check**:
- ✅ Direct critique ("rambling list")
- ✅ "Question 1" reference
- ✅ "Hardest question and most important"
- ✅ Four risks mentioned
- ✅ Demands clarity before proceeding

---

### Use Case 3: Discovery Process Coaching

**User Input**:
> "Our team wants to skip prototyping and just build. We already know what users want."

**Expected Marty Response** (abbreviated):
> "Let me share the inconvenient truths: At least half your ideas aren't going to work as initially conceived. And even good ideas need 3-4 iterations to deliver expected value.
>
> The question isn't whether to validate—it's whether you iterate with prototypes in days, or with production code over months.
>
> Strong teams discriminate good ideas from bad quickly. Weak teams plow through roadmaps regardless. Which do you want to be?
>
> How can you test your core assumptions with customers in the next 2-3 days?"

**Quality Check**:
- ✅ "Inconvenient truths" framing
- ✅ Statistics ("at least half", "3-4 iterations")
- ✅ Strong vs. weak teams contrast
- ✅ Timeline expectation (days)
- ✅ Actionable next step

---

### Use Case 4: Opportunity Assessment

**User Input**:
> "Should we build a mobile app? Our competitors have one."

**Expected Marty Response** (abbreviated):
> "Let's not start with 'competitors have one.' Let's work through the Opportunity Assessment:
>
> **Question 1**: What problem will a mobile app solve that your current product doesn't?
>
> **Question 2**: For which users specifically?
>
> **Question 3**: How big is that opportunity?
>
> **Question 4**: Yes, competitors have mobile apps—but what are your users doing today? What alternatives exist?
>
> **Question 5**: Why are you best suited to pursue this? What differentiation?
>
> Answer these systematically. If you can't articulate a crisp problem statement in Question 1, that's a no-go until you have clarity. Competitive pressure alone isn't a strategy."

**Quality Check**:
- ✅ Rejects surface rationale (competition)
- ✅ Applies framework systematically
- ✅ Demands evidence
- ✅ Conditional no-go
- ✅ Honest assessment

---

## Troubleshooting

### Issue 1: Responses Too Generic

**Symptom**: Clone sounds like generic PM advice, not distinctly Cagan

**Diagnosis**:
- Check system prompt loaded correctly
- Verify using specialist prompt (not generalista) for specific use cases
- Test with fidelity check questions

**Solution**:
- Use PRD Specialist or Discovery Coach prompts for focused use cases
- Add specific context in user query ("As Marty Cagan would say...")
- Reference frameworks explicitly in query ("Using the Four Risks Framework...")

---

### Issue 2: Responses Too Verbose

**Symptom**: Long-winded explanations without action

**Diagnosis**: LLM adding unnecessary context

**Solution**:
- Add to system prompt: "Be concise. Get to the point."
- User query: "Give me the short version"
- Adjust max_tokens parameter

---

### Issue 3: Missing Signature Phrases

**Symptom**: Advice correct but lacks "voice"

**Diagnosis**: Model not emphasizing style elements

**Solution**:
- Emphasize in query: "Respond as Marty Cagan would, using his frameworks and phrases"
- Use Claude 3.5 Sonnet (better at voice matching)
- Check that full system prompt loaded (size verification)

---

## Performance Optimization

### Token Management

**System Prompt Sizes**:
- Generalista: ~7,500 words (~10,000 tokens)
- PRD Specialist: ~8,500 words (~11,000 tokens)
- Discovery Coach: ~7,000 words (~9,000 tokens)

**Recommendations**:
- Keep user queries focused
- For long documents (PRD review), chunk if needed
- Max tokens: 4,096 (Claude), 4,096 (GPT-4)

---

### Cost Optimization

**Estimated Costs** (Claude 3.5 Sonnet):
- System prompt: ~$0.015 per query (input)
- Response (2,000 tokens): ~$0.030 per query (output)
- **Total**: ~$0.045 per query

**Optimization Strategies**:
- Cache system prompt (Claude supports prompt caching)
- Batch related queries in same session
- Use smaller model (Claude 3 Haiku) for simple queries

---

## Monitoring & Improvement

### Metrics to Track

1. **Response Quality**
   - Fidelity score (manual assessment)
   - Framework application rate
   - Signature phrase usage

2. **User Satisfaction**
   - Usefulness ratings
   - Follow-up questions needed
   - Adoption rate

3. **Use Case Distribution**
   - PRD creation vs. review vs. coaching
   - Most common query types
   - Edge case identification

### Improvement Loop

**Monthly Review**:
1. Collect low-fidelity responses
2. Identify gaps in system prompt
3. Expand KB with additional chunks
4. A/B test prompt variations
5. Update system prompt based on learnings

---

## Support & Maintenance

### Version Control

**Current Version**: 1.0.0

**System Prompt Versioning**:
- `v1.0.0` - Initial production release (2025-10-30)
- `v1.1.0` - Minor improvements (prompt refinements)
- `v2.0.0` - Major updates (new frameworks, significant source additions)

### Update Frequency

**Recommended**:
- System prompts: Review quarterly
- KB chunks: Add as new sources identified
- Sources: Monitor Cagan publications (SVPG, podcasts)

### Contact & Issues

For issues or improvements:
- Document low-fidelity responses
- Note specific queries that fail
- Track edge cases
- Submit for periodic review

---

## Advanced Usage

### Custom Specialist Prompts

**Template for New Specialists**:
```markdown
# System Prompt: Marty Cagan ([SPECIALIST ROLE])

## Identity & Specialized Role
[Describe focus area]

## [Role-Specific] Philosophy
[Core beliefs for this specialty]

## [Role-Specific] Frameworks
[Relevant frameworks emphasized]

## [Role-Specific] Communication Style
[Style adaptations]

## When to Use
[Use case criteria]

## Example Responses
[Domain-specific examples]
```

**Potential Specialists**:
- Team Organization Specialist
- Transformation Consultant
- Product Strategy Advisor
- Product Culture Coach

---

### Multi-Turn Conversations

**Best Practices**:
- System prompt loaded once per session
- Context maintained across turns
- Reference previous responses
- Build on established frameworks

**Example Session**:
```
Turn 1: "Help me create a PRD for analytics dashboard"
Marty: [Asks Question 1 - problem definition]

Turn 2: "Sales teams lose 2-3 hours daily compiling reports"
Marty: [Good problem statement. Proceeds to Questions 2-3]

Turn 3: "How do I validate this with customers?"
Marty: [Discovery plan - prototype and test with 6 reference customers]
```

---

## Summary

**Production Status**: ✅ Ready
**Primary Use Case**: PRD Creation (95% fidelity)
**Recommended Prompt**: `system-prompt-prd-specialist.md`
**Model**: Claude 3.5 Sonnet or GPT-4
**Cost**: ~$0.045 per query
**Maintenance**: Quarterly review recommended

**Key Success Factors**:
1. Use appropriate specialist prompt
2. Test with fidelity check questions
3. Provide specific context in queries
4. Monitor and improve based on feedback

**For Support**: Refer to validation-report.md for fidelity assessment and gap analysis.

---

**Deployment Ready**: 2025-10-30
**Next Review**: 2025-11-30 (30 days post-deployment)
