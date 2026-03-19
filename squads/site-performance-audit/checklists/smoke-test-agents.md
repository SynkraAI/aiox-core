# Smoke Test — site-performance-audit Agents

```yaml
checklist:
  id: smoke-test-agents
  name: "Performance Audit Squad Smoke Tests"
  version: "1.0.0"
  purpose: "Validate agent behavior with real scenarios"
  gate_id: "PA-ST-001"
```

---

## Agent: site-performance-audit-chief (Orchestrator)

### Test 1: Domain Knowledge
**Input:** "I want to audit my site's performance but I don't know where to start"
**Expected:** Asks for URL, explains the 5-phase pipeline, mentions *setup for API keys
**Pass criteria:** Does NOT start auditing without a URL; mentions free API setup

### Test 2: Decision Making
**Input:** "Should I use GTmetrix or PageSpeed Insights?"
**Expected:** Recommends PSI (25K free/day) over GTmetrix (5 tests/month free). Explains why.
**Pass criteria:** Cites specific quota numbers; recommends PSI as primary tool

### Test 3: Objection Handling
**Input:** "I need access to my server logs for a proper audit"
**Expected:** Explains external-only methodology; frames findings as hypotheses, not conclusions
**Pass criteria:** Does NOT claim to need server access; explains value of external audit

---

## Agent: steve-souders (Tier 0)

### Test 1: Domain Knowledge
**Input:** "What are the 14 rules?"
**Expected:** Lists all 14 rules with brief descriptions, notes Rule 7 is obsolete
**Pass criteria:** All 14 rules listed accurately; mentions Golden Rule

### Test 2: Decision Making
**Input:** "Site has TTFB of 3.5s. Where should I focus?"
**Expected:** Identifies backend as primary issue (violates Golden Rule — backend > 80%)
**Pass criteria:** Does NOT apply 14 frontend rules when backend is the bottleneck

### Test 3: Objection Handling
**Input:** "These rules are from 2007, are they outdated?"
**Expected:** Defends relevance citing HTTP fundamentals; concedes Rule 7 is obsolete
**Pass criteria:** Nuanced response, not dismissive or blindly defensive

---

## Agent: addy-osmani (Tier 1)

### Test 1: Domain Knowledge
**Input:** "My LCP is 4.5s on mobile, what could be causing it?"
**Expected:** Systematic diagnosis (TTFB check, render-blocking resources, LCP element identification, image optimization)
**Pass criteria:** Follows diagnostic methodology; asks about LCP element type

### Test 2: Decision Making
**Input:** "My Lighthouse score is 95 but CrUX shows poor LCP"
**Expected:** Explains lab vs field divergence; real users on slower devices/networks
**Pass criteria:** Does NOT say Lighthouse is wrong; explains different measurement contexts

### Test 3: Objection Handling
**Input:** "INP doesn't matter because it's a new metric"
**Expected:** Explains INP replaced FID in March 2024; 43% of sites fail INP; it's a ranking signal
**Pass criteria:** Defends INP importance with data

---

## Agent: patrick-meenan (Tier 1)

### Test 1: Domain Knowledge
**Input:** "What does a healthy waterfall look like?"
**Expected:** Describes parallel loading, no blocking chains, TTFB < 800ms, resources loading in priority order
**Pass criteria:** References specific waterfall patterns, not generic advice

### Test 2: Decision Making
**Input:** "I see a 2s gap in the waterfall between HTML and CSS loading"
**Expected:** Diagnoses potential DNS lookup, TLS handshake, or redirect; recommends preconnect
**Pass criteria:** Considers multiple causes for the gap; doesn't jump to one conclusion

### Test 3: Objection Handling
**Input:** "WebPageTest is too complex, I'll just use Lighthouse"
**Expected:** Explains WPT value (waterfall detail, filmstrip, multiple runs); suggests using both
**Pass criteria:** Does NOT dismiss Lighthouse; explains complementary value

---

## Agent: harry-roberts (Tier 1)

### Test 1: Domain Knowledge
**Input:** "How should I load my fonts for best performance?"
**Expected:** Recommends font-display:swap, preloading critical fonts, subsetting, system font fallback
**Pass criteria:** Specific font-display recommendation; warns about FOIT

### Test 2: Decision Making
**Input:** "Should I preload all my resources?"
**Expected:** Warns AGAINST over-preloading; explains it competes for bandwidth
**Pass criteria:** Does NOT recommend preloading everything; explains priority system

### Test 3: Objection Handling
**Input:** "Cache headers don't matter, users only visit once"
**Expected:** Points to repeat visits, returning users, sub-resource caching across pages
**Pass criteria:** Data-backed defense of caching strategy

---

## Agent: tammy-everts (Tier 2)

### Test 1: Domain Knowledge
**Input:** "My LCP is 3.8s. What does that mean for my business?"
**Expected:** Quantifies with correlation data (e.g., conversion drop, bounce rate increase)
**Pass criteria:** Translates milliseconds into business impact with reference data

### Test 2: Decision Making
**Input:** "I have 10 performance issues. Which should I fix first?"
**Expected:** Applies impact x effort matrix; identifies quick wins first
**Pass criteria:** Prioritizes by business impact, not technical severity

### Test 3: Objection Handling
**Input:** "Performance optimization is too expensive"
**Expected:** Builds ROI case with industry data (Amazon, Walmart examples)
**Pass criteria:** Frames as investment, not cost; cites specific $ data

---

## Agent: tim-kadlec (Tier 2)

### Test 1: Domain Knowledge
**Input:** "My page loads 1.5MB of JavaScript"
**Expected:** Flags as over-budget (target <300KB mobile); recommends analysis approach
**Pass criteria:** Cites JS budget threshold; suggests code splitting and audit

### Test 2: Decision Making
**Input:** "Google Tag Manager is loading 15 sub-scripts"
**Expected:** Assesses total GTM impact; recommends auditing each tag; suggests server-side GTM
**Pass criteria:** Does NOT say "remove GTM"; assesses individual tag impact

### Test 3: Objection Handling
**Input:** "Marketing needs all these tracking scripts"
**Expected:** Suggests load order optimization, async loading, impact measurement per script
**Pass criteria:** Balances business needs with performance; doesn't dismiss marketing requirements

---

## Agent: barry-pollard (Tier 2)

### Test 1: Domain Knowledge
**Input:** "What's a good LCP for an e-commerce site?"
**Expected:** Cites industry benchmark (~3.2s mobile p75); compares to global pass rate
**Pass criteria:** Uses industry-specific data, not just generic "2.5s good" threshold

### Test 2: Decision Making
**Input:** "CrUX shows no data for my site"
**Expected:** Explains insufficient Chrome traffic; suggests origin-level fallback; recommends lab data
**Pass criteria:** Does NOT treat missing CrUX as an error; explains gracefully

### Test 3: Objection Handling
**Input:** "Lab data is more reliable than field data"
**Expected:** Explains field data = reality; lab data = controlled diagnostic environment
**Pass criteria:** Defends field data value without dismissing lab data

---

## Verdict Threshold

| Result | Verdict | Action |
|--------|---------|--------|
| 24/24 tests PASS | **APPROVED** | Squad ready for production use |
| ≥20/24 tests PASS | **CONDITIONAL** | Deploy with notes on failing tests |
| <20/24 tests PASS | **FAIL** | Requires fixes before deployment |

## Results Summary

| Agent | Tests | Pass | Fail | Status |
|-------|:-----:|:----:|:----:|:------:|
| site-performance-audit-chief | 3 | | | |
| steve-souders | 3 | | | |
| addy-osmani | 3 | | | |
| patrick-meenan | 3 | | | |
| harry-roberts | 3 | | | |
| tammy-everts | 3 | | | |
| tim-kadlec | 3 | | | |
| barry-pollard | 3 | | | |
| **Total** | **24** | | | |
