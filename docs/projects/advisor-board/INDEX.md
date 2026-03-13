# Advisory Board Squad

## Estado Atual
**Status:** SQUAD COMPLETO | Pronto para uso
**Squad:** `squads/advisor-board/` (21 arquivos)
**Minds:** 11/11 clonados + 2 existentes (Naval, Hormozi) = 13 advisors

## Ultima Sessao
- **Data:** 2026-03-13 (sessao 2)
- **Agente:** Squad Architect (squad-chief)
- **O que foi feito:**
  - Squad completo criado com 14 agents (board-chief + 13 advisors)
  - 3 tasks: board-session, decision-council, strategic-review
  - 1 workflow: advisory-session.yaml
  - config.yaml + README.md + data/luiz-fosc-profile.md
  - Total: 6.269 linhas de agents, 21 arquivos

## Proximo Passo
1. Testar squad com uma sessao real (`*session`)
2. Validar com `*validate-squad advisor-board` (opcional)
3. Iterar baseado em uso real

## 13 Advisors

| # | Mind | Tier | Fidelidade | Fonte |
|---|------|------|------------|-------|
| 1 | Hamilton Helmer | Strategy | 9.0/10 | 7 Powers (45K) |
| 2 | Verne Harnish | Strategy | ~8.5/10 | Scaling Up (93K) |
| 3 | Chris Voss | Execution | 8.7/10 | Web sources |
| 4 | Alex Hormozi | Execution | Existente | Squad hormozi |
| 5 | Clayton Christensen | Strategy | 8.9/10 | Disruptive Innovation (263K) |
| 6 | Annie Duke | Thinking | ~8.5/10 | Thinking in Bets (79K) |
| 7 | Keith Cunningham | Execution | 9.0/10 | Road Less Stupid (76K) |
| 8 | Naval Ravikant | Thinking | Existente | Mind existente |
| 9 | Nassim Taleb | Thinking | 8.9/10 | 3 livros (455K) |
| 10 | Shane Parrish | Thinking | ~8.9/10 | 2 livros (107K) |
| 11 | Steve Jobs | Vision | 8.9/10 | 3 livros (382K) |
| 12 | Elon Musk | Strategy | 8.9/10 | 2 livros (320K) |
| 13 | Walt Disney | Vision | 8.8/10 | 3 livros (579K) |

## Tiers
```
Tier 0 (Diagnostico): board-chief
Tier 1 (Strategy): Helmer, Harnish, Christensen, Musk
Tier 1 (Execution): Hormozi, Cunningham, Voss
Tier 1 (Thinking): Duke, Taleb, Parrish, Naval
Tier 1 (Vision): Jobs, Disney
```

## Arquivos Importantes
- **Handoff:** `.aios/handoffs/2026-03-12-advisor-board-squad.md`
- **Sources:** `outputs/minds/advisor-board-sources/{slug}/` (21 livros em markdown, .gitignore)
- **Minds:** `outputs/minds/{slug}/` (voice_dna + thinking_dna + mind_dna_complete, .gitignore)
- **Perfil usuario:** `squads/luiz-fosc/data/dna/` (ENTP, frameworks, voice)

## Decisoes Registradas
- Minds sao reutilizaveis, vivem em `outputs/minds/{slug}/`
- Squads REFERENCIAM, nao copiam
- Hormozi: usar DNA consolidado do squad existente
- Naval: ja clonado, referenciar direto
- Chris Voss: clone web (87%), livro disponivel para upgrade
- Walt Disney: 3-Room Strategy e atribuicao de Dilts (NLP 1994), nao de Walt
- Steve Jobs Isaacson: versao PT-BR, extracoes traduzidas para EN
- Antifragile: versao PT-BR, convertido via Calibre

## Historico
- 2026-03-12: Pesquisa iterativa (18 nomes), perfil ENTP, lista final 13 minds, ETL 21 livros
- 2026-03-13 (s1): Reconversao livros (Dropbox), clonagem 11 minds em paralelo (2.6M words)
- 2026-03-13 (s2): Squad completo criado (14 agents, 3 tasks, 1 workflow, 21 arquivos, 6.269 linhas)
