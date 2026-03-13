# Advisory Board Squad

## Estado Atual
**Status:** CLONAGEM COMPLETA | Montagem do squad pendente
**Squad:** `squads/advisor-board/` (ainda nao criado)
**Minds:** 11/11 clonados em `outputs/minds/{slug}/` + 2 existentes (Naval, Hormozi)

## Ultima Sessao
- **Data:** 2026-03-13
- **Agente:** Squad Architect (squad-chief)
- **O que foi feito:**
  - Reconversao de 21 livros (epub/pdf/mobi -> markdown) via pandoc + calibre
  - Fonte: Dropbox (`LIVROS PARA MENTORIA DE PALESTRAS/`)
  - Destino: `outputs/minds/advisor-board-sources/{slug}/`
  - Clonagem de 11 minds em paralelo (subagents oalanicolas)
  - Total: 2.599.413 words processados, 33 YAML files gerados

## Proximo Passo
1. Criar estrutura `squads/advisor-board/` (config.yaml, README.md)
2. Criar `board-chief.md` (orquestrador com integracao ENTP)
3. Criar 13 agent files referenciando `outputs/minds/{slug}/`
4. Criar tasks (board-session, decision-council, strategic-review)
5. Criar workflow (advisory-session)
6. Validar com `*validate-squad advisor-board`

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
- 2026-03-13: Reconversao livros (Dropbox), clonagem 11 minds em paralelo (2.6M words)
