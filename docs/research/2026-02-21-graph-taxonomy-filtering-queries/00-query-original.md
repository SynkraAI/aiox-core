# Original Query

## User Request

Research graph visualization taxonomy, filtering, and query capabilities for developer tool dashboards.

## Three Focus Areas

1. **Entity Taxonomy & Tagging for Developer Tool Graphs**: Best practices for categorizing codebase entities (agents, tasks, templates, scripts, checklists, workflows, utils, data, tools) in dependency graphs. Hierarchical categories and subcategories (e.g., scripts -> task-scripts, engine-scripts, infra-scripts). Color palette design for 10+ categories with accessibility. Tagging systems for multiple classifications per entity.

2. **vis-network Graph UX for Large Graphs (500+ nodes)**: Filtering UI patterns (sidebar filters, search box, category toggles). vis-network clustering and grouping for collapsing categories. Search/highlight functionality. Performance optimization for 500+ nodes.

3. **Graph Query API for Code Intelligence**: Exposing graph queries programmatically (dependencies, impact analysis, path finding). Graph query patterns for JavaScript. Integration between graph visualization and code intelligence engines. How context engines (like Synapse) consume graph data.

## Inferred Context

```json
{
  "focus": "technical",
  "temporal": "recent",
  "domain": ["JavaScript", "vis-network", "graph-visualization", "code-intelligence", "Synapse"],
  "skip_clarification": true
}
```

## Motivation

The AIOS graph dashboard currently has only 4 entity categories (tasks, agents, templates, scripts) but the codebase has 10+ types. Scripts need subcategorization (task-scripts, engine-scripts, infra-scripts). The graph needs filtering, search, and query capabilities for code-intel and Synapse integration.
