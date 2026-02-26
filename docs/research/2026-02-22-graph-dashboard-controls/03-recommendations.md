# Recommendations & Next Steps

## Decision Matrix: Feature Priority

| Feature | Impact | Complexity | Dependencies | Priority |
|---------|--------|-----------|-------------|----------|
| Physics Control Sliders | HIGH | LOW | None | P0 |
| Multi-Level Depth Expansion | HIGH | MEDIUM | None | P0 |
| Depth Opacity Differentiation | MEDIUM | LOW | Depth Expansion | P1 |
| Node Sizing by Degree | MEDIUM | LOW | None | P1 |
| Layout Switching (force/hierarchical) | MEDIUM | MEDIUM | None | P1 |
| Physics Pause/Resume Toggle | MEDIUM | LOW | Physics Controls | P1 |
| Reset Physics Defaults | LOW | LOW | Physics Controls | P1 |
| Minimap | MEDIUM | HIGH | None | P2 |
| Export PNG | LOW | LOW | None | P2 |
| Clustering by Category | MEDIUM | MEDIUM | None | P2 |
| Statistics Panel | LOW | MEDIUM | None | P3 |
| Scene Management (save/load views) | LOW | HIGH | Most features | P3 |

## Recommended Story Breakdown

### Story GD-11: Physics Control Panel (P0)
**Scope:**
- 4 range sliders: Center Force, Repel Force, Link Force, Link Distance
- Live preview (debounced at 50ms)
- Reset to defaults button
- Pause/Resume physics toggle
- Slider values displayed next to each slider
- Integration into existing sidebar below filters

**Estimated AC:** 10-12
**Complexity:** Small-Medium (mostly UI + `network.setOptions()` calls)

### Story GD-12: Multi-Level Neighborhood Expansion (P0)
**Scope:**
- Depth selector UI (buttons: 1, 2, 3, All) appears after focus mode activation
- BFS algorithm with depth tracking
- Opacity-based visual differentiation by depth level
- Edge visibility synced with node visibility
- Node count indicator per depth level
- Animated transitions (CSS opacity)
- Keyboard shortcuts (1/2/3/A for depth levels)

**Estimated AC:** 12-15
**Complexity:** Medium (algorithm + UI + vis-network DataSet updates)

### Story GD-13: Graph Metrics & Layout (P1)
**Scope:**
- Node sizing toggle: Uniform / By Degree / By In-Degree / By Out-Degree
- Layout switcher: Force-Directed / Hierarchical / Circular
- Degree centrality computation (O(1) per node from edges)
- Layout transition handling

**Estimated AC:** 8-10
**Complexity:** Medium

### Story GD-14: Export & Minimap (P2)
**Scope:**
- Export as PNG button
- Export as JSON (nodes + edges data)
- Minimap panel (second smaller canvas or canvas thumbnail)
- Viewport sync between minimap and main graph

**Estimated AC:** 8-10
**Complexity:** Medium-High (minimap is the complex part)

### Story GD-15: Clustering & Statistics (P2-P3)
**Scope:**
- Cluster by category (vis-network built-in clustering API)
- Cluster expansion/collapse
- Statistics panel: total nodes, edges, density, top connected nodes
- Category distribution chart

**Estimated AC:** 10-12
**Complexity:** Medium

## Technical Recommendations

### 1. Library Decision: Stay with vis-network
- Our 712-entity scale is well within vis-network's performance range
- All required features are available via existing API
- 10 stories of investment would be lost in migration
- **Reconsider only if** entity count exceeds 5000

### 2. Architecture Pattern: Control Panel Section
- Add a collapsible "Controls" section below existing "Filters" in sidebar
- Use same THEME tokens for consistency
- All controls should be pure HTML (no framework dependency)

### 3. Performance Guidelines
- Debounce slider inputs at 50ms
- Disable physics during batch updates
- Hide labels at low zoom levels (drawThreshold: 8)
- Consider Web Workers for BFS depth > 3 on 700+ nodes

### 4. Accessibility
- All sliders need ARIA labels
- Depth buttons need `aria-pressed` state
- Keyboard navigation for all controls
- Focus indicators matching gold accent theme

## Next Steps

1. **@pm** or **@po**: Create stories GD-11 and GD-12 from this research
2. **@sm**: Draft stories with acceptance criteria based on the scope above
3. **@dev**: Implement starting with GD-11 (Physics Controls) — simplest, highest impact
4. **@qa**: Review each story independently as completed

---

*Research completed: 2026-02-22*
*Researcher: Claude Opus 4.6 (Tech Search Pipeline)*
*Sources: 5 parallel Haiku workers, 12+ web sources analyzed*
