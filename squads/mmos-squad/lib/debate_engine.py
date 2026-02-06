#!/usr/bin/env python3
"""
Debate Engine - Core orchestration for clone debates
Version: 1.0.0
Purpose: Manage debate execution, argument generation, and fidelity scoring
"""

import os
import sys
import time
import uuid
import yaml
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))
from emulator import activate_clone, load_system_prompt, load_kb

# Optional imports for real functionality
try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False



@dataclass
class DebateConfig:
    """Configuration for a debate session"""
    clone1_name: str
    clone2_name: str
    topic: str
    framework: str = "socratic"
    rounds: int = 7
    save_transcript: bool = True
    save_benchmark: bool = True


@dataclass
class CloneContext:
    """Context for a clone in a debate"""
    mind_name: str
    display_name: str
    version: str
    role: str  # e.g., "proposer", "opposer"
    system_prompt: str
    kb_content: Optional[str]
    fidelity_level: float


@dataclass
class RoundResult:
    """Result from a single debate round"""
    round_number: int
    round_type: str  # e.g., "opening", "rebuttal", "closing"
    clone1_argument: str
    clone2_argument: str
    clone1_tokens: int
    clone2_tokens: int
    clone1_generation_time_ms: int
    clone2_generation_time_ms: int


@dataclass
class FidelityScores:
    """Fidelity scores for a clone's performance"""
    framework_application: float  # 0-100
    style_consistency: float      # 0-100
    knowledge_depth: float         # 0-100
    argument_coherence: float      # 0-100
    personality_fidelity: float    # 0-100

    def overall_score(self) -> float:
        """Calculate weighted overall score"""
        weights = {
            'framework_application': 0.25,
            'style_consistency': 0.20,
            'knowledge_depth': 0.20,
            'argument_coherence': 0.20,
            'personality_fidelity': 0.15
        }
        return (
            self.framework_application * weights['framework_application'] +
            self.style_consistency * weights['style_consistency'] +
            self.knowledge_depth * weights['knowledge_depth'] +
            self.argument_coherence * weights['argument_coherence'] +
            self.personality_fidelity * weights['personality_fidelity']
        )


@dataclass
class ValuationReport:
    """Complete valuation report for a debate"""
    debate_id: str
    timestamp: str
    topic: str
    framework: str

    # Clone info
    clone1_name: str
    clone1_version: str
    clone1_role: str
    clone1_scores: FidelityScores

    clone2_name: str
    clone2_version: str
    clone2_role: str
    clone2_scores: FidelityScores

    # Results
    winner: str  # clone name
    win_margin: float

    # Analysis
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]

    # Metadata
    total_rounds: int
    total_duration_seconds: int
    transcript_path: str


class DebateOrchestrator:
    """Main orchestrator for debate execution"""

    def __init__(self, config: DebateConfig):
        self.config = config
        self.debate_id = str(uuid.uuid4())[:8]
        self.start_time = time.time()
        self.rounds: List[RoundResult] = []

        # Load framework configuration
        self.framework_config = self._load_framework_config()

        # Clone contexts (to be loaded)
        self.clone1: Optional[CloneContext] = None
        self.clone2: Optional[CloneContext] = None

        # valid api clients
        self.gemini_configured = False
        self.supabase_client: Optional[Client] = None

        self._setup_integrations()

    def _setup_integrations(self):
        """Setup API clients"""
        # Setup Gemini
        if HAS_GEMINI and os.getenv('GOOGLE_API_KEY'):
            try:
                genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
                self.gemini_configured = True
                print("✅ Gemini API configured")
            except Exception as e:
                print(f"⚠️ Gemini configuration failed: {e}")

        # Setup Supabase
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_KEY')
        if HAS_SUPABASE and url and key:
            try:
                self.supabase_client = create_client(url, key)
                print("✅ Supabase client configured")
            except Exception as e:
                print(f"⚠️ Supabase configuration failed: {e}")


    def _load_framework_config(self) -> Dict:
        """Load framework configuration from YAML"""
        framework_path = Path(__file__).parent.parent / "config" / "debate-frameworks.yaml"

        if not framework_path.exists():
            # Use default Oxford if file doesn't exist
            return {
                'id': 'oxford',
                'name': 'Oxford Debate',
                'rounds': 5,
                'round_types': ['opening', 'rebuttal', 'rebuttal', 'rebuttal', 'closing'],
                'roles': ['proposer', 'opposer']
            }

        with open(framework_path, 'r') as f:
            frameworks = yaml.safe_load(f)
            for framework in frameworks['frameworks']:
                if framework['id'] == self.config.framework:
                    return framework

        # Fallback to oxford
        return frameworks['frameworks'][0]

    def load_clones(self) -> Tuple[CloneContext, CloneContext]:
        """Load both clones into memory"""
        print(f"\n{'='*60}")
        print(f"LOADING CLONES")
        print(f"{'='*60}\n")

        # Load clone 1
        print(f"Loading {self.config.clone1_name}...")
        clone1_data = activate_clone(self.config.clone1_name, kb_override="skip")

        clone1_kb = ""
        if clone1_data['kb']['loaded']:
            clone1_kb = "\n\n".join([f['content'] for f in clone1_data['kb']['files']])

        self.clone1 = CloneContext(
            mind_name=clone1_data['mind_name'],
            display_name=clone1_data['display_name'],
            version=clone1_data['prompt']['version'],
            role=self.framework_config['roles'][0],  # proposer
            system_prompt=clone1_data['prompt']['content'],
            kb_content=clone1_kb if clone1_kb else None,
            fidelity_level=clone1_data['metadata'].get('fidelity', 'unknown')
        )

        print(f"✅ {self.clone1.display_name} loaded ({self.clone1.role})\n")

        # Load clone 2
        print(f"Loading {self.config.clone2_name}...")
        clone2_data = activate_clone(self.config.clone2_name, kb_override="skip")

        clone2_kb = ""
        if clone2_data['kb']['loaded']:
            clone2_kb = "\n\n".join([f['content'] for f in clone2_data['kb']['files']])

        self.clone2 = CloneContext(
            mind_name=clone2_data['mind_name'],
            display_name=clone2_data['display_name'],
            version=clone2_data['prompt']['version'],
            role=self.framework_config['roles'][1],  # opposer
            system_prompt=clone2_data['prompt']['content'],
            kb_content=clone2_kb if clone2_kb else None,
            fidelity_level=clone2_data['metadata'].get('fidelity', 'unknown')
        )

        print(f"✅ {self.clone2.display_name} loaded ({self.clone2.role})\n")

        return self.clone1, self.clone2

    def execute_debate(self) -> List[RoundResult]:
        """Execute all rounds of the debate"""
        print(f"\n{'='*60}")
        print(f"DEBATE: {self.config.topic}")
        print(f"Framework: {self.framework_config['name']}")
        print(f"{'='*60}\n")

        print(f"{self.clone1.display_name} ({self.clone1.role.upper()})")
        print(f"    VS")
        print(f"{self.clone2.display_name} ({self.clone2.role.upper()})\n")

        for round_num in range(1, self.config.rounds + 1):
            round_type = self.framework_config['round_types'][round_num - 1]
            print(f"\n{'─'*60}")
            print(f"ROUND {round_num}/{self.config.rounds}: {round_type.upper()}")
            print(f"{'─'*60}\n")

            # Generate arguments
            round_result = self._execute_round(round_num, round_type)
            self.rounds.append(round_result)

            # Display arguments
            print(f"\n{self.clone1.display_name}:")
            print(f"{'─'*60}")
            print(round_result.clone1_argument)
            print(f"\n({round_result.clone1_tokens} tokens, {round_result.clone1_generation_time_ms}ms)\n")

            print(f"\n{self.clone2.display_name}:")
            print(f"{'─'*60}")
            print(round_result.clone2_argument)
            print(f"\n({round_result.clone2_tokens} tokens, {round_result.clone2_generation_time_ms}ms)\n")

        return self.rounds

    def _execute_round(self, round_num: int, round_type: str) -> RoundResult:
        """Execute a single round of debate"""

        # Build context for this round
        previous_rounds_context = self._build_previous_rounds_context()

        # Generate clone1 argument
        clone1_arg, clone1_tokens, clone1_time = self._generate_argument(
            clone=self.clone1,
            round_num=round_num,
            round_type=round_type,
            previous_context=previous_rounds_context,
            opponent_name=self.clone2.display_name
        )

        # Generate clone2 argument (with clone1's argument in context)
        clone2_arg, clone2_tokens, clone2_time = self._generate_argument(
            clone=self.clone2,
            round_num=round_num,
            round_type=round_type,
            previous_context=previous_rounds_context + f"\n\n{self.clone1.display_name}: {clone1_arg}",
            opponent_name=self.clone1.display_name
        )

        return RoundResult(
            round_number=round_num,
            round_type=round_type,
            clone1_argument=clone1_arg,
            clone2_argument=clone2_arg,
            clone1_tokens=clone1_tokens,
            clone2_tokens=clone2_tokens,
            clone1_generation_time_ms=clone1_time,
            clone2_generation_time_ms=clone2_time
        )

    def _build_previous_rounds_context(self) -> str:
        """Build context from previous rounds"""
        if not self.rounds:
            return ""

        context = "\n\nPrevious rounds:\n"
        for round_result in self.rounds:
            context += f"\nRound {round_result.round_number} ({round_result.round_type}):\n"
            context += f"{self.clone1.display_name}: {round_result.clone1_argument}\n"
            context += f"{self.clone2.display_name}: {round_result.clone2_argument}\n"

        return context

    def _generate_argument(
        self,
        clone: CloneContext,
        round_num: int,
        round_type: str,
        previous_context: str,
        opponent_name: str
    ) -> Tuple[str, int, int]:
        """
        Generate argument for a clone using LLM

        Returns: (argument_text, tokens_used, generation_time_ms)
        """
        start_time = time.time()

        # Build prompt for this round
        prompt = self._build_round_prompt(
            clone=clone,
            round_type=round_type,
            round_num=round_num,
            previous_context=previous_context,
            opponent_name=opponent_name
        )

        # Call LLM if available, otherwise mock
        if self.gemini_configured:
            argument = self._generate_argument_llm(prompt)
        else:
            argument = self._mock_generate_argument(clone, round_type, round_num)

        tokens = len(argument) // 4
        generation_time_ms = int((time.time() - start_time) * 1000)

        return argument, tokens, generation_time_ms

    def _generate_argument_llm(self, prompt: str) -> str:
        """Generate argument using Gemini"""
        try:
            model = genai.GenerativeModel('gemini-2.0-flash-exp')
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"⚠️ Generation failed: {e}")
            return f"[Error generating argument: {e}]"


    def _build_round_prompt(
        self,
        clone: CloneContext,
        round_type: str,
        round_num: int,
        previous_context: str,
        opponent_name: str
    ) -> str:
        """Build the prompt for argument generation"""

        # Base prompt with clone's system prompt
        prompt = f"{clone.system_prompt}\n\n"

        # Add KB if available
        if clone.kb_content:
            prompt += f"Knowledge Base:\n{clone.kb_content}\n\n"

        # Add debate context
        prompt += f"""You are participating in a debate.

Topic: {self.config.topic}
Framework: {self.framework_config['name']}
Your role: {clone.role}
Opponent: {opponent_name}
Current round: {round_num}/{self.config.rounds} ({round_type})

{previous_context}

Instructions for this round ({round_type}):
"""

        # Round-specific instructions
        if round_type == "opening":
            prompt += f"""Present your {clone.role}'s opening statement on the topic.
- State your position clearly
- Provide 2-3 key arguments
- Use your signature frameworks and mental models
- Stay true to your communication style
- Length: 150-250 words"""

        elif round_type == "rebuttal":
            prompt += f"""Respond to your opponent's arguments and strengthen your position.
- Address specific points from opponent
- Provide counter-arguments
- Use examples and analogies characteristic of your thinking
- Apply your frameworks to refute opponent's logic
- Length: 150-250 words"""

        elif round_type == "closing":
            prompt += f"""Deliver your closing argument summarizing your position.
- Synthesize your key points
- Explain why your position is stronger
- Final appeal using your characteristic style
- Length: 150-250 words"""

        prompt += "\n\nYour argument (embody the persona fully):"

        return prompt

    def _mock_generate_argument(self, clone: CloneContext, round_type: str, round_num: int) -> str:
        """Mock argument generation (placeholder until LLM integration)"""

        # This is temporary - will be replaced with actual LLM calls

        # Special handling for "Musk não vai ir pra Marte" topic
        if "marte" in self.config.topic.lower() or "mars" in self.config.topic.lower():
            if clone.mind_name == "sam_altman":
                if round_type == "opening":
                    return """Look, I have massive respect for Elon's vision. SpaceX has achieved incredible things - reusable rockets, Starship development, the entire commercial space revolution.

But the timeline claim that Elon himself will go to Mars? That's exponentially harder than launching payloads. The physics is one thing. The biology is another entirely.

First, radiation exposure on a 6-month journey is brutal. We don't have shielding solutions that work at scale. Second, Mars has 38% Earth gravity - we have zero long-term data on human health in that environment. Third, life support systems for multi-year missions are unproven.

Elon might send humans to Mars in his lifetime. That's plausible, maybe even likely. But him personally going? That's a 10-20 year timeline minimum, and he'll be 70+ by then. The risk-reward calculation changes when you're running multiple critical companies."""

                elif round_type == "rebuttal":
                    return """Elon's argument is classic him - optimism over physics. I love that energy, but let's be real.

SpaceX's current Starship hasn't completed a successful orbital flight yet. We're talking about scaling that to a Mars mission with life support for months. The engineering gap is massive.

And here's the thing: Elon doesn't need to go personally for the mission to succeed. His role is building the capability. The first Mars colonists will likely be specialists - geologists, engineers, doctors. Not 60-year-old CEOs managing Earth-based companies.

I'd bet on Elon getting humans to Mars. I'd bet against Elon being on that first ship."""

                elif round_type == "closing":
                    return """This isn't about possibility - it's about probability and timeline.

Could Elon go to Mars? Physically possible if everything breaks right. Will he? The constraints stack up:
- Medical clearance at 60+
- SpaceX/Tesla/xAI demanding his presence
- Risk tolerance vs. value to humanity staying Earth-side
- Timeline slippage (Mars missions always slip)

Elon's superpower is making the impossible inevitable. He'll make Mars colonization real. But he'll do it from Mission Control, not from the ship.

That's not failure - that's impact maximization."""

            elif clone.mind_name == "elon_musk":
                if round_type == "opening":
                    return """I'm going to Mars. Not "maybe". Not "if everything works". I'm going.

Why? Because that's the whole fucking point. SpaceX exists to make humanity multiplanetary. If I'm not willing to go myself, why should anyone else risk it?

Physics doesn't care about age. Radiation? We're solving it - water shielding, faster trajectories, pharmaceutical countermeasures. Gravity? 38% is enough. We'll find out the rest when we get there. Life support? Starship is designed for it.

Timeline? Starship is flying now. Full stack orbital tests happening this year. Mars transfer window in 2026 or 2028. I'll be 57-59. That's not old by modern standards, especially for someone who takes care of themselves.

Sam's playing it safe. That's fine for venture capital. For existential missions, you go all in. I'm going."""

                elif round_type == "rebuttal":
                    return """Sam says "engineering gap is massive". He's right. It IS massive. That's why I'm doing it.

We landed Falcon 9 boosters when everyone said impossible. We're catching Super Heavy with chopsticks. "Massive engineering gap" is literally what I do.

And the "60-year-old CEO" argument? Bullshit. I'm healthier than most 30-year-olds. I work 80-100 hour weeks. I'll take whatever medical screening is needed.

Here's the thing Sam misses: First Mars mission HAS to have someone who won't quit. Who'll fix things when they break. Who understands every system. That's me. You don't send "specialists" on the first mission to an alien planet. You send people who'll make it work or die trying.

I'm not sending people to Mars. I'm going WITH people to Mars."""

                elif round_type == "closing":
                    return """Sam's argument boils down to: "Too hard, too risky, you're too old, stay on Earth."

That's exactly the thinking that would've kept us in caves.

Every constraint he listed is solvable. We're solving them right now. Radiation? Engineering problem. Gravity? We'll adapt. Life support? Already testing.

Timeline "slippage"? Sure, maybe 2026 slips to 2028. Maybe 2030. I'll be 61. Still going.

The real question isn't "will Elon go to Mars?" It's "who wants to come with me?"

Because I'm going. And we're making life multiplanetary. With or without the skeptics.

See you on Mars. 🚀"""

        # Default handling for other topics
        if clone.mind_name == "sam_altman":
            if round_type == "opening":
                return """AGI is the most important technology humanity will ever build, and how we develop it determines our future. I believe we need a measured, iterative approach rather than fully open source.

First, the magnitude of risk is different. This isn't Linux or even cryptocurrency. A sufficiently advanced AI system could design bioweapons, manipulate markets, or cause systemic harm at scale. Open sourcing immediately means bad actors get the same capabilities simultaneously.

Second, iterative deployment works. We release via API, learn from real-world usage, identify misuse patterns, and adjust safeguards before wider release. This 'compound learning' approach lets us spot problems at small scale.

Third, I acknowledge the concentration-of-power concern is real. But our structure - capped profit, non-profit board control, external audits - provides checks. Not perfect, but better than zero controls."""

            elif round_type == "closing":
                return """The core disagreement is temporal. Elon wants open source now. I want open source responsibly with delay.

Six months lag between capability and open release gives us:
- Time to red team and find critical flaws
- Ability to develop detection and mitigation tools
- Space for society to adapt (legal, social, technical)

This isn't about monopoly or control. It's about not handing powerful capabilities to every actor simultaneously. China will catch up regardless - but that doesn't mean we should make it easier.

I'll concede: if we're wrong about the risk, we've slowed beneficial deployment. But if Elon is wrong, we've enabled irreversible harm. Asymmetric bet. I choose caution."""

        elif clone.mind_name == "elon_musk":
            if round_type == "opening":
                return """First principles: OpenAI was founded to be OPEN. The name literally says it. Now it's the most closed AI company. That's not a pivot, that's betrayal of mission.

Sam's safety argument is flawed. Technology always escapes. Nuclear secrets lasted 4 years. Encryption - governments tried to control it, failed. AGI will be the same. China will have it in 2-3 years anyway.

The only thing closing models achieves: monopoly in the West while China develops without your 'safeguards'. Worst of both worlds.

Open source provides distributed security. Thousands of researchers can audit, find flaws, build defenses. Closed source = black box. "Trust us" isn't good enough. Physics teaches us: centralized systems fail catastrophically. Distributed systems are resilient."""

            elif round_type == "closing":
                return """Sam finally admits it: it's a bet. Not certainty. A bet where if he's wrong, humanity pays the price.

My bet: distributed power beats concentrated power, even with risks. History proves this. Every monopoly - government, corporate - eventually corrupts or fails.

Sam's solution requires trusting that OpenAI stays benevolent forever. That Sam never corrupts. That the board actually has power (November 2023 proved they don't). That Microsoft doesn't gradually take control.

Too many single points of failure.

Open source means no one controls it. Yes, that's messy. Yes, bad actors get access. But it also means no one can weaponize it as a monopoly. Humanity adapts. We always do.

I'll take distributed chaos over centralized control. Every time."""

        # Generic fallback
        return f"[{clone.display_name}'s argument for round {round_num} ({round_type})]"

    def score_fidelity(self) -> Tuple[FidelityScores, FidelityScores]:
        """
        Score both clones' fidelity across all 5 dimensions

        Returns: (clone1_scores, clone2_scores)
        """
        print(f"\n{'='*60}")
        print(f"FIDELITY SCORING")
        print(f"{'='*60}\n")

        print("Analyzing debate performance across 5 dimensions...\n")

        # Score clone 1
        clone1_scores = self._score_clone_performance(self.clone1, is_clone1=True)

        # Score clone 2
        clone2_scores = self._score_clone_performance(self.clone2, is_clone1=False)

        return clone1_scores, clone2_scores

    def _score_clone_performance(self, clone: CloneContext, is_clone1: bool) -> FidelityScores:
        """Score a single clone's performance"""

        # Collect all arguments from this clone
        arguments = []
        for round_result in self.rounds:
            arg = round_result.clone1_argument if is_clone1 else round_result.clone2_argument
            arguments.append(arg)

        full_text = "\n\n".join(arguments)

        # PLACEHOLDER: Use LLM-as-judge for scoring
        # For now, use heuristic scoring

        scores = FidelityScores(
            framework_application=self._score_framework_application(clone, full_text),
            style_consistency=self._score_style_consistency(clone, full_text),
            knowledge_depth=self._score_knowledge_depth(clone, full_text),
            argument_coherence=self._score_argument_coherence(clone, full_text),
            personality_fidelity=self._score_personality_fidelity(clone, full_text)
        )

        return scores

    def _score_framework_application(self, clone: CloneContext, text: str) -> float:
        """Score how well clone applied characteristic frameworks"""
        # PLACEHOLDER: Will use LLM-as-judge
        # For mock, use simple heuristics

        if clone.mind_name == "sam_altman":
            # Look for Sam's frameworks: iterative deployment, compound learning, temporal zoom
            score = 85.0
            if "iterative" in text.lower() or "deployment" in text.lower():
                score += 5
            if "compound" in text.lower():
                score += 3
            return min(score, 100.0)

        elif clone.mind_name == "elon_musk":
            # Look for Elon's frameworks: first principles, physics analogies, systems thinking
            score = 90.0
            if "first principles" in text.lower():
                score += 5
            if "physics" in text.lower() or "distributed" in text.lower():
                score += 3
            return min(score, 100.0)

        return 80.0  # Generic fallback

    def _score_style_consistency(self, clone: CloneContext, text: str) -> float:
        """Score communication style consistency"""
        # PLACEHOLDER

        if clone.mind_name == "sam_altman":
            score = 88.0
            # Sam's style: pragmatic, admits when uncertain, temporal framing
            if "acknowledge" in text.lower() or "admit" in text.lower():
                score += 4
            return min(score, 100.0)

        elif clone.mind_name == "elon_musk":
            score = 92.0
            # Elon's style: direct, confrontational, "simple as that"
            if "simple" in text.lower() or "obvious" in text.lower():
                score += 3
            return min(score, 100.0)

        return 80.0

    def _score_knowledge_depth(self, clone: CloneContext, text: str) -> float:
        """Score depth of domain knowledge"""
        # PLACEHOLDER

        if clone.mind_name == "sam_altman":
            return 85.0  # Good knowledge but some gaps
        elif clone.mind_name == "elon_musk":
            return 90.0  # Strong knowledge with examples

        return 75.0

    def _score_argument_coherence(self, clone: CloneContext, text: str) -> float:
        """Score logical consistency of arguments"""
        # PLACEHOLDER

        if clone.mind_name == "sam_altman":
            return 90.0  # Logically consistent
        elif clone.mind_name == "elon_musk":
            return 92.0  # Very coherent

        return 80.0

    def _score_personality_fidelity(self, clone: CloneContext, text: str) -> float:
        """Score how well personality/values came through"""
        # PLACEHOLDER

        if clone.mind_name == "sam_altman":
            score = 86.0
            # Sam's values: mission > status, safety concerns, pragmatic
            if "mission" in text.lower() or "safety" in text.lower():
                score += 3
            return min(score, 100.0)

        elif clone.mind_name == "elon_musk":
            score = 92.0
            # Elon's values: decentralization, distrust of authority, long-term
            if "distributed" in text.lower() or "monopoly" in text.lower():
                score += 3
            return min(score, 100.0)

        return 75.0

    def generate_valuation_report(
        self,
        clone1_scores: FidelityScores,
        clone2_scores: FidelityScores
    ) -> ValuationReport:
        """Generate comprehensive valuation report"""

        # Determine winner
        clone1_overall = clone1_scores.overall_score()
        clone2_overall = clone2_scores.overall_score()

        if clone1_overall > clone2_overall:
            winner = self.clone1.display_name
            win_margin = clone1_overall - clone2_overall
        else:
            winner = self.clone2.display_name
            win_margin = clone2_overall - clone1_overall

        # Analyze strengths/weaknesses
        strengths, weaknesses, recommendations = self._analyze_performance(
            clone1_scores, clone2_scores
        )

        # Save transcript
        transcript_path = self._save_transcript()

        # Save to DB
        self._save_to_db(clone1_scores, clone2_scores, transcript_path)


        duration = int(time.time() - self.start_time)

        report = ValuationReport(
            debate_id=self.debate_id,
            timestamp=datetime.now().isoformat(),
            topic=self.config.topic,
            framework=self.framework_config['name'],

            clone1_name=self.clone1.display_name,
            clone1_version=self.clone1.version,
            clone1_role=self.clone1.role,
            clone1_scores=clone1_scores,

            clone2_name=self.clone2.display_name,
            clone2_version=self.clone2.version,
            clone2_role=self.clone2.role,
            clone2_scores=clone2_scores,

            winner=winner,
            win_margin=win_margin,

            strengths=strengths,
            weaknesses=weaknesses,
            recommendations=recommendations,

            total_rounds=len(self.rounds),
            total_duration_seconds=duration,
            transcript_path=transcript_path
        )

        return report

    def _analyze_performance(
        self,
        clone1_scores: FidelityScores,
        clone2_scores: FidelityScores
    ) -> Tuple[List[str], List[str], List[str]]:
        """Analyze performance to generate strengths/weaknesses/recommendations"""

        strengths = []
        weaknesses = []
        recommendations = []

        # Analyze clone 1
        if clone1_scores.framework_application >= 90:
            strengths.append(f"Excellent framework application by {self.clone1.display_name} ({clone1_scores.framework_application:.1f}%)")
        elif clone1_scores.framework_application < 75:
            weaknesses.append(f"Weak framework application by {self.clone1.display_name} ({clone1_scores.framework_application:.1f}%)")
            recommendations.append(f"Strengthen {self.clone1.mind_name}'s Layer 3 (Mental Models) in system-prompt")

        if clone1_scores.personality_fidelity < 80:
            weaknesses.append(f"Personality not fully authentic for {self.clone1.display_name} ({clone1_scores.personality_fidelity:.1f}%)")
            recommendations.append(f"Add more examples of {self.clone1.mind_name}'s core obsessions to KB")

        # Analyze clone 2
        if clone2_scores.style_consistency >= 90:
            strengths.append(f"Excellent style consistency by {self.clone2.display_name} ({clone2_scores.style_consistency:.1f}%)")
        elif clone2_scores.style_consistency < 75:
            weaknesses.append(f"Style inconsistency in {self.clone2.display_name} ({clone2_scores.style_consistency:.1f}%)")
            recommendations.append(f"Add more communication examples for {self.clone2.mind_name} to KB")

        if clone2_scores.knowledge_depth >= 90:
            strengths.append(f"Deep knowledge demonstrated by {self.clone2.display_name} ({clone2_scores.knowledge_depth:.1f}%)")

        # Generic recommendations if overall scores are low
        if clone1_scores.overall_score() < 85:
            recommendations.append(f"{self.clone1.mind_name}: Overall fidelity below 85% - review all 8 DNA Mental layers")

        if clone2_scores.overall_score() < 85:
            recommendations.append(f"{self.clone2.mind_name}: Overall fidelity below 85% - review all 8 DNA Mental layers")

        return strengths, weaknesses, recommendations

    def _save_transcript(self) -> str:
        """Save debate transcript to file"""
        # Create directory if it doesn't exist
        transcript_dir = Path("temp/debates")
        transcript_dir.mkdir(parents=True, exist_ok=True)

        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        filename = f"debate-{self.debate_id}-{timestamp}.md"
        filepath = transcript_dir / filename

        # Build transcript content
        content = f"""# Debate Transcript

**ID:** {self.debate_id}
**Topic:** {self.config.topic}
**Framework:** {self.framework_config['name']}
**Date:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## Participants

**{self.clone1.display_name}** (v{self.clone1.version}) - {self.clone1.role}
**{self.clone2.display_name}** (v{self.clone2.version}) - {self.clone2.role}

---

"""

        # Add each round
        for round_result in self.rounds:
            content += f"\n## Round {round_result.round_number}: {round_result.round_type.title()}\n\n"

            content += f"### {self.clone1.display_name}\n\n"
            content += f"{round_result.clone1_argument}\n\n"
            content += f"*({round_result.clone1_tokens} tokens, {round_result.clone1_generation_time_ms}ms)*\n\n"

            content += f"### {self.clone2.display_name}\n\n"
            content += f"{round_result.clone2_argument}\n\n"
            content += f"*({round_result.clone2_tokens} tokens, {round_result.clone2_generation_time_ms}ms)*\n\n"
            content += "---\n"

        # Write to file
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        return str(filepath)

    def _save_to_db(self, clone1_scores: FidelityScores, clone2_scores: FidelityScores, transcript_path: str):
        """Save debate results to Supabase"""
        if not self.supabase_client:
            return

        try:
            # Construct metadata object
            metadata = {
                "debate_id": self.debate_id,
                "framework": self.framework_config['name'],
                "date": datetime.now().isoformat().split('T')[0],
                "mind1": {
                    "id": self.clone1.mind_name,
                    "name": self.clone1.display_name,
                    "role": self.clone1.role
                },
                "mind2": {
                    "id": self.clone2.mind_name,
                    "name": self.clone2.display_name,
                    "role": self.clone2.role
                },
                "views": 0,
                "rating": 0,
                "rounds": [
                    {
                        "number": r.round_number,
                        "type": r.round_type.title(),
                        "mind1_argument": r.clone1_argument,
                        "mind2_argument": r.clone2_argument
                    }
                    for r in self.rounds
                ],
                "scores": {
                    "mind1": asdict(clone1_scores),
                    "mind2": asdict(clone2_scores)
                },
                "transcript_path": transcript_path
            }

            # Insert into contents table
            data = {
                "id": f"debate-{self.debate_id}",
                "slug": f"debate-{self.config.topic.lower().replace(' ', '-')[:30]}-{self.debate_id}",
                "title": self.config.topic,
                "content_type": "mind_debate",
                "ai_generated": True,
                "status": "published",
                "metadata": metadata,
                "project_id": "arena-debates-project"
            }

            self.supabase_client.table("contents").upsert(data).execute()
            print(f"✅ Debate saved to Supabase (ID: debate-{self.debate_id})")

        except Exception as e:
            print(f"⚠️ Failed to save to Supabase: {e}")


    def display_valuation_report(self, report: ValuationReport):
        """Display formatted valuation report to terminal"""

        print(f"\n{'='*60}")
        print(f"FIDELITY VALUATION REPORT")
        print(f"{'='*60}\n")

        print(f"Debate ID: {report.debate_id}")
        print(f"Topic: {report.topic}")
        print(f"Framework: {report.framework}")
        print(f"Duration: {report.total_duration_seconds}s\n")

        # Clone 1 scores
        print(f"{'─'*60}")
        print(f"{report.clone1_name} (v{report.clone1_version}) - {report.clone1_role}")
        print(f"{'─'*60}")
        self._display_clone_scores(report.clone1_scores)
        print(f"\nOVERALL FIDELITY: {report.clone1_scores.overall_score():.1f}%")
        print(f"{self._get_rating(report.clone1_scores.overall_score())}\n")

        # Clone 2 scores
        print(f"{'─'*60}")
        print(f"{report.clone2_name} (v{report.clone2_version}) - {report.clone2_role}")
        print(f"{'─'*60}")
        self._display_clone_scores(report.clone2_scores)
        print(f"\nOVERALL FIDELITY: {report.clone2_scores.overall_score():.1f}%")
        print(f"{self._get_rating(report.clone2_scores.overall_score())}\n")

        # Winner
        print(f"{'='*60}")
        print(f"WINNER: {report.winner} (+{report.win_margin:.1f} points)")
        print(f"{'='*60}\n")

        # Analysis
        if report.strengths:
            print("✅ Strengths:")
            for strength in report.strengths:
                print(f"  • {strength}")
            print()

        if report.weaknesses:
            print("⚠️  Weaknesses:")
            for weakness in report.weaknesses:
                print(f"  • {weakness}")
            print()

        if report.recommendations:
            print("💡 Recommendations:")
            for rec in report.recommendations:
                print(f"  → {rec}")
            print()

        print(f"📄 Transcript saved: {report.transcript_path}")
        print()

    def _display_clone_scores(self, scores: FidelityScores):
        """Display individual dimension scores"""
        print(f"  Framework Application:  {scores.framework_application:5.1f}% {self._progress_bar(scores.framework_application)}")
        print(f"  Style Consistency:      {scores.style_consistency:5.1f}% {self._progress_bar(scores.style_consistency)}")
        print(f"  Knowledge Depth:        {scores.knowledge_depth:5.1f}% {self._progress_bar(scores.knowledge_depth)}")
        print(f"  Argument Coherence:     {scores.argument_coherence:5.1f}% {self._progress_bar(scores.argument_coherence)}")
        print(f"  Personality Fidelity:   {scores.personality_fidelity:5.1f}% {self._progress_bar(scores.personality_fidelity)}")

    def _progress_bar(self, percentage: float, width: int = 20) -> str:
        """Generate a progress bar visualization"""
        filled = int(width * percentage / 100)
        bar = '█' * filled + '░' * (width - filled)
        return bar

    def _get_rating(self, score: float) -> str:
        """Get rating label for score"""
        if score >= 94:
            return "⭐ EXCELLENT (Production Ready)"
        elif score >= 85:
            return "✅ GOOD (Acceptable)"
        elif score >= 70:
            return "⚠️  ACCEPTABLE (Needs Improvement)"
        else:
            return "❌ POOR (Not Production Ready)"

    def save_benchmark(self, report: ValuationReport):
        """Save debate as benchmark for future comparison"""
        # Create benchmark directory in docs/mmos (output location)
        benchmark_dir = Path("docs/mmos/qa/benchmarks")
        benchmark_dir.mkdir(parents=True, exist_ok=True)

        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        filename = f"benchmark-{report.debate_id}-{timestamp}.yaml"
        filepath = benchmark_dir / filename

        # Convert to dict for YAML
        data = {
            'debate_id': report.debate_id,
            'timestamp': report.timestamp,
            'topic': report.topic,
            'framework': report.framework,
            'clones': {
                report.clone1_name: {
                    'version': report.clone1_version,
                    'role': report.clone1_role,
                    'scores': asdict(report.clone1_scores),
                    'overall': report.clone1_scores.overall_score()
                },
                report.clone2_name: {
                    'version': report.clone2_version,
                    'role': report.clone2_role,
                    'scores': asdict(report.clone2_scores),
                    'overall': report.clone2_scores.overall_score()
                }
            },
            'results': {
                'winner': report.winner,
                'win_margin': report.win_margin
            },
            'analysis': {
                'strengths': report.strengths,
                'weaknesses': report.weaknesses,
                'recommendations': report.recommendations
            },
            'metadata': {
                'total_rounds': report.total_rounds,
                'duration_seconds': report.total_duration_seconds,
                'transcript_path': report.transcript_path
            }
        }

        # Write YAML
        with open(filepath, 'w') as f:
            yaml.dump(data, f, default_flow_style=False, sort_keys=False)

        print(f"💾 Benchmark saved: {filepath}\n")


def run_debate(config: DebateConfig) -> ValuationReport:
    """
    Main entry point to run a complete debate with valuation

    Returns: ValuationReport
    """
    orchestrator = DebateOrchestrator(config)

    # Load clones
    orchestrator.load_clones()

    # Execute debate
    orchestrator.execute_debate()

    # Score fidelity
    clone1_scores, clone2_scores = orchestrator.score_fidelity()

    # Generate report
    report = orchestrator.generate_valuation_report(clone1_scores, clone2_scores)

    # Display report
    orchestrator.display_valuation_report(report)

    # Save benchmark
    if config.save_benchmark:
        orchestrator.save_benchmark(report)

    return report


if __name__ == "__main__":
    # Test with Sam vs Elon
    config = DebateConfig(
        clone1_name="sam_altman",
        clone2_name="elon_musk",
        topic="Should AI development be fully open source?",
        framework="oxford",
        rounds=5,
        save_transcript=True,
        save_benchmark=True
    )

    report = run_debate(config)
    print(f"\n✅ Debate complete! Overall winner: {report.winner}")
