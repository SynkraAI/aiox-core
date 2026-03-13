# Ensinio Mind — Knowledge Hub

> Source of Truth centralizada sobre a plataforma Ensinio.
> Alimenta todos os squads `ensinio-*`.

## O que é

O `ensinio-mind` é o squad de conhecimento centralizado da Ensinio. Ele contém toda a informação factual sobre a empresa, produtos, pricing, concorrentes e cases — servindo como base para qualquer outro squad que precise saber sobre a Ensinio.

## Por que existe

Antes, o conhecimento Ensinio estava preso dentro do `ensinio-whatsapp-prospector`, com symlinks para o `ensinio-prospector`. Isso não escalava — cada novo squad teria que fazer symlink para dentro de um squad de prospecção.

Agora, o `ensinio-mind` é o **source of truth**. Todos os squads Ensinio consomem daqui.

## Arquitetura

```
squads/ensinio-mind/                    <- SOURCE OF TRUTH
  └── data/
      ├── ensinio-identity.md           # Fundadores, história, posicionamento, métricas
      ├── ensinio-product-ecosystem.md  # Club, Pay, Stream, AI, Engage, Chat
      ├── ensinio-solutions-kb.md       # 5 pilares, 67+ features com keywords
      ├── ensinio-pricing.md            # Planos, taxas, add-ons
      ├── ensinio-competitors.md        # Matriz competitiva vs 7 concorrentes
      ├── ensinio-cases.md              # Cases, depoimentos, prova social
      ├── ensinio-market.md             # TAM/SAM/SOM, receita histórica, milestones
      ├── scoring-criteria.md           # Qualificação de leads (temperatura 1-10)
      └── message-rules.md             # Regras de comunicação

squads/ensinio-whatsapp-prospector/     <- CONSOME do mind
squads/ensinio-prospector/              <- CONSOME do mind
(futuros squads ensinio-*)              <- CONSOME do mind
```

## Dados Disponíveis

### Conhecimento Produto (v1.0)
| Arquivo | Conteúdo | Linhas |
|---------|----------|--------|
| `ensinio-identity.md` | Fundadores, história, posicionamento, milestones, faturamento, mercado | ~140 |
| `ensinio-product-ecosystem.md` | 6 produtos (Club, Pay, Stream, AI, Engage, Chat) + features detalhadas | ~200 |
| `ensinio-solutions-kb.md` | KB completo — 5 pilares, 67+ features com keywords para matching | ~400 |
| `ensinio-pricing.md` | 4 planos + taxas + 7 add-ons + argumentos de preço | ~100 |
| `ensinio-competitors.md` | Matriz 8x8 + análise individual de 7 concorrentes | ~130 |
| `ensinio-cases.md` | 13+ infoprodutores, 9 empresas corporativas, 4 cases detalhados | ~130 |
| `ensinio-market.md` | TAM/SAM/SOM, receita histórica (2021-2026), milestones, oportunidades | ~80 |
| `scoring-criteria.md` | Critérios de temperatura 1-10 para qualificação | ~50 |
| `message-rules.md` | Regras de comunicação (tom Antonio/Fosc) | ~50 |

### Sales & Qualification (v1.1 NOVO ✨)
| Arquivo | Conteúdo | Linhas |
|---------|----------|--------|
| `ensinio-icps.md` | ICP detalhado (perfil demográfico + comportamental de clientes que fecham) | ~250 |
| `ensinio-red-flags.md` | Red flags (sinais de alerta + 18 perfis a evitar) | ~350 |
| `ensinio-sales-playbook.md` | 5 objeções + respostas + perguntas de qualificação | ~450 |
| `ensinio-sales-cycle.md` | Timeline (2-4 sem), funil (6 etapas), aceleradores e atrasos | ~400 |
| `ensinio-arguments.md` | 3 argumentos principais + como usar em cada fase + matriz | ~400 |

## Quick Start

### Ativar o expert
```
/ensinio-mind:ensinio-expert
```

### Usar dados em outro squad
Aponte symlinks para `squads/ensinio-mind/data/` ao invés de duplicar arquivos.

## Status: v2.1.0 (Mind DNA Enriquecido)

### ✅ Incluído (v1.0):
- Identidade completa (fundadores, história, métricas)
- Ecossistema de 6 produtos detalhado
- KB de 67+ features com keywords
- Pricing completo (planos + taxas + add-ons)
- Matriz competitiva vs 7 concorrentes
- Cases de 13+ infoprodutores e 9 empresas
- Mercado: TAM/SAM/SOM, receita histórica, milestones

### ✨ NOVO em v1.1:
- **ICP detalhado:** Perfis demográfico + comportamental de clientes que fecham
- **Red flags:** 18 sinais de alerta + perfis a evitar
- **Sales playbook:** 5 objeções + respostas + perguntas de qualificação
- **Sales cycle:** Timeline 2-4 sem, funil 6 etapas, aceleradores/atrasos
- **Argumentos:** 3 argumentos principais + matriz de uso por fase

### 🎓 NOVO em v2.1 — Mind DNA Enrichment (2026-03-12):
- **Source adicional:** [Estrutura de Educação Transformadora](https://www.youtube.com/watch?v=JF0rWYPm1zc) — YouTube
- **Voice DNA:** +3 signature phrases autênticas
  - "O que você quer construir?" [SOURCE: YouTube | JF0rWYPm1zc]
  - "Ensino é sobre transformação" [SOURCE: YouTube | JF0rWYPm1zc]
  - "Estrutura antes de conteúdo" [SOURCE: YouTube | JF0rWYPm1zc]
- **Thinking DNA:** +2 heuristics com QUANDO usar
  - Heuristic 9: "Validate structure before scaling" [WHEN: Pre-launch]
  - Heuristic 10: "Content flows from architecture" [WHEN: Design phase]
- **Métricas:**
  - Fidelity Score: 88/100 → **91/100** (+3 points)
  - Coverage: 92% → **98%** (+6%)
  - Total Sources: 15 → **16**
- **Quality Dashboard:** `squads/mind-cloning/minds/ensinio/quality-dashboard-ensinio.md`

### ⏳ Pendente (v3.0):
- [ ] Processo de onboarding (passo a passo)
- [ ] Programa de parceiros/revendedores
- [ ] Estratégia de conteúdo (blog, YouTube, redes)
- [ ] Mais fontes de vídeo/podcast Ensinio (target: 20+ sources)
