# Growth Decision Checklist

> Validate that growth and scaling decisions are data-driven, statistically sound, and properly documented.

**Fase:** Growth
**Usado por:** `workflows/growth-review.md`, `tasks/experiment-analysis.md`
**Items:** 8

---

## Checklist

- [ ] **Mínimo 30 dias de dados antes de decisão** — Any scaling, cutting, or pivoting decision is based on at least 30 days of continuous data from the channel or campaign; decisions based on less data require explicit exception with documented rationale
- [ ] **Statistical significance p < 0.05** — A/B tests and comparative experiments have reached statistical significance (p-value < 0.05) before a winner is declared; underpowered tests are not treated as conclusive; use a calculator (e.g., Evan Miller) to confirm
- [ ] **North Star metric definida e tracked** — A single North Star metric (e.g., revenue per visitor, email list growth rate, affiliate EPC) is defined for the current growth phase; this metric is tracked in the dashboard and guides all prioritization decisions
- [ ] **ICE score calculado para todas ações** — Every candidate growth action has an ICE score (Impact + Confidence + Ease, each 1-10) documented in the experiment backlog; actions are ranked by ICE score before execution order is set
- [ ] **Budget allocation baseado em portfolio matrix** — Marketing budget distribution across channels follows a portfolio framework (e.g., 70% proven channels, 20% promising experiments, 10% moonshots); allocation is reviewed and adjusted at minimum monthly
- [ ] **Post-mortem agendado em 7 dias** — A post-mortem or retrospective session is scheduled within 7 days of any significant experiment conclusion, campaign end, or major traffic/revenue event (positive or negative)
- [ ] **Learnings documentados (win ou lose)** — Experiment results are recorded in `data/experiments/` regardless of outcome; documentation includes hypothesis, method, result, statistical confidence, and key learning; losses are documented with equal rigor as wins
- [ ] **Próximo experimento identificado** — Before closing out the current experiment or growth cycle, the next highest-priority experiment has been identified from the ICE-ranked backlog and assigned to an owner with a start date

---

*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
