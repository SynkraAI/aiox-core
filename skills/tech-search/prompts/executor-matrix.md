## Executor Matrix for Tech Research

Based on RFC-001 Deterministic Operations Refactoring and Executor Decision Tree.

**Principle:** Maximize determinism. Use LLM only when semantic understanding is required.

---

## Operation Classification

### WORKER (Deterministic Code) - 15 operations

| Operation | Implementation | Location | Trigger |
|-----------|----------------|----------|---------|
| **URL Type Detection** | Regex patterns | `detect_url_type()` | Phase 3 |
| **YouTube VideoId Extraction** | Regex `v=([a-zA-Z0-9_-]{11})` | `extract_video_id()` | Phase 3 |
| **GitHub Repo Detection** | URL pattern `github.com/{org}/{repo}` | `detect_github()` | Phase 3 |
| **Library Name Detection** | Keyword matching against known libs | `detect_libraries()` | Phase 1.5 |
| **Source Credibility Scoring** | Domain pattern matching | `score_credibility()` | Phase 3.5 |
| **URL Deduplication** | Hash set by URL | `deduplicate_urls()` | Phase 3 |
| **Coverage Score Calculation** | Weighted sum of dimensions | `calculate_coverage()` | Phase 3.5 |
| **New Info Ratio Calculation** | unique_facts / total_facts | `calculate_new_info_ratio()` | Phase 3.5 |
| **Stopping Decision** | If/else with thresholds | `should_stop()` | Phase 3.5 |
| **MCP Availability Check** | Try/catch on test call | `check_mcp_available()` | Phase 3 |
| **ETL YouTube Transcript** | CLI call to etl service | `etl_youtube()` | Phase 3.2 |
| **ETL Blog Collection** | CLI call to etl service | `etl_blog()` | Phase 3.2 |
| **Date Extraction from URL** | Regex for year patterns | `extract_date()` | Phase 3.5 |
| **File Path Generation** | String formatting | `generate_output_path()` | Phase 5 |
| **JSON Schema Validation** | jsonschema library | `validate_output()` | Phase 5 |

### AGENT (LLM Required) - 8 operations

| Operation | Why LLM Needed | Phase | Model Tier |
|-----------|----------------|-------|------------|
| **Query Decomposition** | Semantic understanding of user intent | 1.5 | MAIN (ultrathink) |
| **Auto-Clarification** | Pattern detection in natural language | 1 | MAIN (inline) |
| **Content Synthesis** | Merging and summarizing multiple sources | 4 | MAIN |
| **Citation Verification** | Checking if claim matches source semantically | 4.5 | MAIN |
| **Gap Analysis** | Identifying missing coverage areas | 3.5 | HAIKU (Task) |
| **Wave Compression** | Summarizing wave results into structured notes | 3.6 | HAIKU (Task) |
| **Relevance Assessment** | Judging if source answers the query | 3.2 | HAIKU (subagent) |
| **Expert Quote Extraction** | Identifying authoritative statements | 3.2 | HAIKU (subagent) |
| **Final Report Generation** | Structured writing with insights | 5 | MAIN |

### Model Tier Classification (v3.0)

| Tier | Model | When to Use | Cost |
|------|-------|-------------|------|
| **MAIN** | Opus/Sonnet | Deep reasoning, synthesis, final output | $$$ |
| **HAIKU** | Haiku (via Task tool) | Search parsing, extraction, scoring | $ |

**Rule:** If an operation can produce correct output from structured instructions
without deep reasoning, it's HAIKU tier. If it needs judgment, creativity, or
synthesis across diverse sources, it's MAIN tier.

---

## Implementation Recommendations

### Worker Scripts to Create

```bash
# Location: infrastructure/services/tech-research/
# Or: squads/tech-research/scripts/

scripts/
├── url_detector.py       # URL type detection, videoId extraction
├── credibility_scorer.py # Source credibility by domain patterns
├── coverage_calculator.py # Coverage score, new_info_ratio, stopping decision
├── deduplicator.py       # URL deduplication
├── output_validator.py   # JSON schema validation
└── README.md             # Usage documentation
```

### url_detector.py

```python
import re
from typing import Optional, Dict

URL_PATTERNS = {
    'youtube': [
        r'(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})',
    ],
    'github_repo': [
        r'github\.com/([^/]+)/([^/]+)(?:/|$)',
    ],
    'github_issue': [
        r'github\.com/([^/]+)/([^/]+)/issues/(\d+)',
    ],
    'arxiv': [
        r'arxiv\.org/abs/(\d+\.\d+)',
    ],
    'stackoverflow': [
        r'stackoverflow\.com/questions/(\d+)',
    ],
    'official_docs': [
        r'docs\.([a-z]+)\.',
        r'([a-z]+)\.dev/',
        r'developer\.([a-z]+)\.',
    ],
}

def detect_url_type(url: str) -> Dict:
    """Detect URL type and extract relevant IDs."""
    result = {'type': 'generic', 'ids': {}}

    for url_type, patterns in URL_PATTERNS.items():
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                result['type'] = url_type
                result['ids'] = {f'id_{i}': g for i, g in enumerate(match.groups())}
                return result

    return result

def extract_video_id(url: str) -> Optional[str]:
    """Extract YouTube video ID from URL."""
    result = detect_url_type(url)
    if result['type'] == 'youtube':
        return result['ids'].get('id_0')
    return None
```

### credibility_scorer.py

```python
from typing import Dict, Tuple
import re

CREDIBILITY_RULES = {
    'high': {
        'patterns': [
            r'docs\.[a-z]+\.(com|org|io|dev)',
            r'[a-z]+\.dev/',
            r'arxiv\.org',
            r'github\.com/.+/README',
            r'engineering\.[a-z]+\.com',
        ],
        'multiplier': 1.3,
        'label': 'HIGH',
    },
    'medium': {
        'patterns': [
            r'github\.com/.+/issues',
            r'stackoverflow\.com',
            r'dev\.to/',
            r'medium\.com/@',
        ],
        'multiplier': 1.0,
        'label': 'MEDIUM',
    },
    'low': {
        'patterns': [
            r'(best|top|ultimate|amazing)',  # Listicle indicators
            r'medium\.com/[^@]',  # Generic medium
        ],
        'multiplier': 0.7,
        'label': 'LOW',
    },
}

RED_FLAGS = {
    'no_author': -0.2,
    'no_date': -0.1,
    'paywall': -0.3,
    'outdated': -0.3,  # >2 years on fast-moving topic
}

def score_credibility(url: str, title: str = '', date: str = None) -> Tuple[str, float]:
    """Score URL credibility based on domain patterns."""

    # Check each credibility level
    for level, config in CREDIBILITY_RULES.items():
        for pattern in config['patterns']:
            if re.search(pattern, url, re.IGNORECASE):
                multiplier = config['multiplier']

                # Apply red flags
                if 'sponsored' in title.lower():
                    multiplier += RED_FLAGS.get('paywall', 0)

                return config['label'], max(0.4, multiplier)

    return 'MEDIUM', 1.0  # Default
```

### coverage_calculator.py

```python
from typing import Dict, List, Tuple

DIMENSION_WEIGHTS = {
    'fundamentals': 0.20,
    'implementation': 0.25,
    'comparison': 0.15,
    'best_practices': 0.20,
    'real_world': 0.10,
    'current_state': 0.10,
}

STOPPING_RULES = {
    'hard_stops': [
        {'condition': 'wave >= 3', 'reason': 'Max iterations reached'},
        {'condition': 'coverage >= 85 and high_sources >= 3', 'reason': 'Sufficient quality'},
        {'condition': 'new_info_ratio < 0.10 for 2 waves', 'reason': 'Diminishing returns'},
    ],
    'soft_stops': [
        {'condition': 'coverage >= 70 and wave >= 2', 'reason': 'Acceptable coverage'},
    ],
    'must_continue': [
        {'condition': 'coverage < 50 and wave == 1', 'reason': 'Insufficient first wave'},
    ],
}

def calculate_coverage_score(dimension_scores: Dict[str, float]) -> float:
    """Calculate weighted coverage score."""
    total = 0.0
    for dimension, score in dimension_scores.items():
        weight = DIMENSION_WEIGHTS.get(dimension, 0.0)
        total += score * weight
    return round(total, 2)

def calculate_new_info_ratio(
    new_facts: int,
    total_facts: int
) -> float:
    """Calculate ratio of new unique information."""
    if total_facts == 0:
        return 1.0
    return round(new_facts / total_facts, 3)

def should_stop(
    coverage_score: float,
    new_info_ratio: float,
    wave: int,
    high_sources: int,
    consecutive_low_ratios: int = 0
) -> Tuple[bool, str]:
    """Determine if research should stop."""

    # Hard stops
    if wave >= 3:
        return True, 'Max iterations reached'

    if coverage_score >= 85 and high_sources >= 3:
        return True, 'Sufficient quality coverage'

    if new_info_ratio < 0.10 and consecutive_low_ratios >= 2:
        return True, 'Diminishing returns confirmed'

    # Must continue
    if coverage_score < 50 and wave == 1:
        return False, 'Insufficient first wave'

    # Soft stops
    if coverage_score >= 70 and wave >= 2:
        return True, 'Acceptable coverage (soft stop)'

    return False, 'Continue researching'
```

---

## Integration with SKILL.md

### Phase 3: Use Workers Before LLM

```yaml
3_execute_research:
  execution: |
    # WORKER FIRST (deterministic)
    1. url_detector.py → Classify all URLs by type
    2. For YouTube URLs → etl_youtube() (CLI)
    3. For GitHub URLs → Extract repo/issue IDs
    4. credibility_scorer.py → Score all sources

    # THEN LLM (semantic)
    5. Agent assesses relevance of each source
    6. Agent extracts key findings
```

### Phase 3.5: Use Workers for Calculations

```yaml
3_5_evaluate_coverage:
  execution: |
    # WORKER (deterministic)
    1. coverage_calculator.py → Calculate scores
    2. should_stop() → Apply stopping rules

    # LLM (semantic)
    3. IF CONTINUE: Agent generates targeted gap-filling queries
```

### Phase 4.5: Hybrid Verification

```yaml
4_5_verify_citations:
  execution: |
    # WORKER (deterministic)
    1. Extract all claims (regex for patterns like "X% faster")
    2. Match claims to source URLs (string matching)

    # LLM (semantic)
    3. Agent verifies semantic match between claim and source
```

---

## Cost-Benefit Analysis

| Operation Type | Before (all LLM) | After (Worker + LLM) |
|----------------|------------------|----------------------|
| URL Detection | ~100 tokens | 0 tokens (regex) |
| Credibility Scoring | ~200 tokens | 0 tokens (patterns) |
| Coverage Calculation | ~150 tokens | 0 tokens (math) |
| Stopping Decision | ~100 tokens | 0 tokens (rules) |
| **Total Saved** | ~550 tokens/wave | **~1650 tokens/research** |

---

## Migration Plan

### Phase 1: Create Core Scripts (This Sprint)
1. `url_detector.py` - URL type detection
2. `credibility_scorer.py` - Source scoring
3. `coverage_calculator.py` - Coverage and stopping

### Phase 2: Integrate with Skill (Next Sprint)
1. Update SKILL.md to call scripts
2. Add error handling for script failures
3. Test with real research queries

### Phase 3: Extend (Future)
1. `library_detector.py` - Detect known libs/frameworks
2. `fact_extractor.py` - Regex extraction of numbers/stats
3. `duplicate_detector.py` - Semantic deduplication (may need embedding)

---

## Validation Checklist

Before using a Worker:
- [ ] Output is 100% deterministic for same input?
- [ ] Can be written as pure function?
- [ ] Library/API exists or worth coding?
- [ ] Will be used 3+ times?

Before using LLM Agent:
- [ ] Requires semantic understanding?
- [ ] Output varies by context/interpretation?
- [ ] No deterministic rules can capture it?

---

*Executor Matrix v1.0 - Based on squad-creator RFC-001 and Decision Tree*
