# Palestras Master Federator

Meta-squad federador que orquestra 4 squads satélites para criar, diagnosticar e otimizar palestras — sem duplicar conhecimento dos especialistas.

## Objetivo
- Unificar diagnóstico, estratégia, roteiro e qualidade final de palestras.
- Rotear automaticamente para o melhor especialista por tipo de demanda (17 intents).
- Permitir composição híbrida entre métodos complementares.

## Satélites federados (v3)

| Satélite | Domínio | Entry Agent |
|----------|---------|-------------|
| `tathi-deandhela` | Persuasão ética, estrutura de keynote, autoridade de palco | `tathi-chief` |
| `renner-silva` | Storytelling transformacional, mentoria de alta conversão | `renner-silva` |
| `storytelling-masters-fosc` | Frameworks teóricos (12 experts: McKee, Campbell, Cialdini...) | `storytelling-masters-chief` |
| `luiz-fosc` | Mentoria Palestra de Elite, storytelling cinematográfico, pensamento de ilusionista, Fala Magnética, calibração multicanal | `luiz-fosc` |

### Merge Strategy (quando múltiplos satélites)
- **luiz-fosc** → ESTRUTURA narrativa (3 atos, Cinema-Mágica Framework)
- **renner-silva** → STORYTELLING emocional (Aplauda de Pé, vulnerabilidade)
- **tathi-deandhela** → PERSUASÃO e CTA (ética, autoridade, ganha-ganha)
- **storytelling-masters-fosc** → FRAMEWORKS teóricos (referências acadêmicas)

## Comandos
- `*route-speaking-demand` — Rotear demanda para satélite ideal
- `*build-hybrid-keynote-plan` — Montar plano de keynote híbrido
- `*assemble-multi-clone-playbook` — Consolidar playbook multi-clone
- `*validate-final-speaking-strategy` — Validar com quality gate (15 checks)

## Estrutura
- `agents/` — Orquestrador, router (17 intents), assembler, diagnostician, quality gate
- `tasks/` — 4 operações executáveis
- `workflows/` — Fluxo 3 fases com checkpoints e vetos
- `checklists/` — Quality gate multi-clone (15 itens)
- `data/` — Contrato de integração, matriz de capacidades
