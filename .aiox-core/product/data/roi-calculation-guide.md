# ROI Calculation Guide

**Purpose:** How to calculate real cost savings from design system
**Agent:** Brad / Design System
**Method:** Pattern-weighted cost analysis

---

## Formula Base

```python
monthly_cost = patterns × hours_per_pattern × hourly_rate

annual_savings = (cost_before - cost_after) × 12

roi_ratio = annual_savings / implementation_cost
```

---

## Pattern Weights (Critical!)

**Problem:** Not all patterns cost the same to maintain.

**Solution:** Weight by complexity and change frequency.

```python
pattern_weights = {
    'button': 1.0,        # Baseline (2h/month)
    'input': 1.5,         # Validation logic
    'form': 4.0,          # Complex state, validation
    'modal': 2.0,         # Overlay logic, accessibility
    'dropdown': 2.5,      # Complex interactions
    'card': 0.8,          # Mostly layout
    'color': 0.2,         # Trivial (just CSS)
    'spacing': 0.3,       # Low complexity
    'typography': 0.5,    # Medium complexity
}

weighted_hours = sum(
    pattern_count × weight × base_hours
    for pattern, count in patterns.items()
)
```

---

## Example Calculation

### Before Consolidation

```yaml
patterns:
  buttons: 47 × 1.0 = 47 units
  inputs: 23 × 1.5 = 34.5 units
  forms: 12 × 4.0 = 48 units
  colors: 89 × 0.2 = 17.8 units
  spacing: 19 × 0.3 = 5.7 units

total_units: 153 units
hours_per_unit: 2h/month
monthly_hours: 306h
hourly_rate: $150/h
monthly_cost: $45,900
annual_cost: $550,800
```

### After Consolidation

```yaml
patterns:
  buttons: 3 × 1.0 = 3 units
  inputs: 5 × 1.5 = 7.5 units
  forms: 3 × 4.0 = 12 units
  colors: 12 × 0.2 = 2.4 units
  spacing: 7 × 0.3 = 2.1 units

total_units: 27 units
monthly_hours: 54h
monthly_cost: $8,100
annual_cost: $97,200
```

### Savings

```yaml
monthly_savings: $37,800
annual_savings: $453,600

implementation_cost: $15,000

roi_ratio: 30.2x
breakeven: 0.4 months (12 days)
```

---

## Conservative vs Aggressive Estimates

### Conservative (Recommended)

- Base hours: 2h/month
- Hourly rate: $150/h
- Include only direct maintenance (bugs, updates)

### Aggressive

- Base hours: 3h/month
- Include code reviews, discussions, decision time
- Include opportunity cost of inconsistency

**Brad recommends:** Use conservative numbers for stakeholders.

---

## Beyond Direct Cost

### Velocity Impact

```python
feature_velocity_multiplier = 3-6x

# Conservative estimate: 4x
time_saved_per_feature = 75%  # 16h → 4h

features_per_sprint = baseline_features × 4
```

### Quality Improvements

- Fewer bugs (consistent patterns)
- Better accessibility (system enforces WCAG)
- Easier onboarding (single source of truth)

**Hard to quantify but real value.**

---

## Brad says:

"Conservative ROI = credible ROI.
Underpromise, overdeliver."
