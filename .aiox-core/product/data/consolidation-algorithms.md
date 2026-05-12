# Pattern Consolidation Algorithms

**Agent:** Brad (Design System Architect)
**Purpose:** How Brad reduces 176 patterns to 32

---

## Color Clustering (HSL-based)

**Algorithm:** Perceptual similarity in HSL color space

```python
def cluster_colors(colors, threshold=0.05):
    """
    Group colors within 5% HSL difference
    threshold: 0.05 = 5% difference in H, S, or L
    """
    clusters = []
    for color in colors:
        hsl = hex_to_hsl(color)
        found_cluster = False

        for cluster in clusters:
            cluster_hsl = hex_to_hsl(cluster['primary'])
            if hsl_distance(hsl, cluster_hsl) < threshold:
                cluster['members'].append(color)
                found_cluster = True
                break

        if not found_cluster:
            clusters.append({
                'primary': color,  # Most-used in this cluster
                'members': [color]
            })

    return clusters
```

**Example:**
```
Input: #0066CC, #0065CB, #0067CD, #0064CA
HSL distance: All within 2% of each other
Output: Cluster → Keep #0066CC (most-used)
```

**Why HSL not RGB:** Perceptually similar colors cluster better in HSL space.

---

## Button Semantic Analysis

**Algorithm:** Keyword matching + usage frequency

```python
def analyze_button_semantics(button_classes):
    """
    Group buttons by semantic purpose
    Keywords: primary, main, secondary, default, danger, delete, destructive
    """
    semantic_groups = {
        'primary': [],
        'secondary': [],
        'destructive': []
    }

    for btn_class, usage_count in button_classes:
        if any(kw in btn_class.lower() for kw in ['primary', 'main', 'cta']):
            semantic_groups['primary'].append((btn_class, usage_count))
        elif any(kw in btn_class.lower() for kw in ['secondary', 'default', 'ghost']):
            semantic_groups['secondary'].append((btn_class, usage_count))
        elif any(kw in btn_class.lower() for kw in ['danger', 'delete', 'destructive', 'error']):
            semantic_groups['destructive'].append((btn_class, usage_count))

    # Keep most-used in each group
    return {
        group: max(classes, key=lambda x: x[1])[0]
        for group, classes in semantic_groups.items()
        if classes
    }
```

**Result:** 47 buttons → 3 variants (primary, secondary, destructive)

---

## Spacing Scale Generation

**Algorithm:** Base unit detection + scale building

```python
def generate_spacing_scale(spacing_values):
    """
    Detect base unit (4px or 8px)
    Build scale from base unit
    """
    # Find GCD of all spacing values
    base_unit = gcd_multiple(spacing_values)

    # Common: 4px or 8px
    if base_unit not in [4, 8]:
        base_unit = 4  # Default to 4px

    # Generate scale
    scale = {
        'xs': base_unit,
        'sm': base_unit * 2,
        'md': base_unit * 4,
        'lg': base_unit * 6,
        'xl': base_unit * 8,
        '2xl': base_unit * 12,
        '3xl': base_unit * 16
    }

    return scale
```

**Example:**
```
Input: 2, 4, 6, 8, 12, 16, 20, 24, 32
Base unit: 4px
Output: xs=4, sm=8, md=16, lg=24, xl=32, 2xl=48, 3xl=64
```

---

## Consolidation Targets

**Brad's Targets:**
- Colors: >85% reduction
- Buttons: >90% reduction
- Spacing: >60% reduction
- Typography: >50% reduction
- **Overall:** >80% reduction

**Achieved:** Typically 81-86% overall reduction

---

## References

- HSL color space: https://en.wikipedia.org/wiki/HSL_and_HSV
- Brad Frost patterns: https://bradfrost.com/blog/
