# Ensinio Mind — Knowledge Hub

> Source of Truth centralizada sobre a plataforma Ensinio.
> Alimenta todos os squads `ensinio-*`.

## O que é

O `ensinio-mind` é o squad de conhecimento centralizado da Ensinio. Ele contém toda a informação factual sobre a empresa, produtos, pricing, concorrentes, cases, processo comercial e técnicas de vendas — servindo como base para qualquer outro squad que precise saber sobre a Ensinio.

**Version:** 2.1.0 | **Entry Agent:** ensinio-expert | **Model Tier:** haiku/sonnet

---

## Arquitetura

```
squads/ensinio-mind/
  ├── agents/
  │   └── ensinio-expert.md          # Agent principal (thinking_dna + voice_dna)
  ├── tasks/
  │   ├── update-kb.md               # Processo de atualização do KB
  │   ├── validate-data.md           # Validação de consistência
  │   └── extract-from-calls.md     # Extração de insights de calls tl;dv
  ├── checklists/
  │   ├── data-quality.md            # Qualidade dos dados
  │   └── seller-onboarding.md       # Onboarding de novo vendedor
  └── data/
      ├── ensinio-identity.md        # Fundadores, história, posicionamento
      ├── ensinio-product-ecosystem.md # 6 produtos (Club, Pay, Stream, AI, Engage, Chat)
      ├── ensinio-solutions-kb.md    # 5 pilares, 67+ features com keywords
      ├── ensinio-pricing.md         # 4 planos + taxas + 7 add-ons
      ├── ensinio-competitors.md     # Matriz competitiva vs 7 concorrentes
      ├── ensinio-cases.md           # Cases + prova social + links demonstráveis
      ├── ensinio-market.md          # TAM/SAM/SOM, receita, dados comerciais
      ├── scoring-criteria.md        # Dual scoring (client + partner)
      ├── message-rules.md           # Regras de comunicação + scripts comerciais
      ├── ensinio-icps.md            # ICP detalhado (demográfico + comportamental)
      ├── ensinio-red-flags.md       # 21 sinais de alerta + perfis a evitar
      ├── ensinio-sales-playbook.md  # 8 objeções + técnicas avançadas de fechamento
      ├── ensinio-sales-cycle.md     # Funil, equipe, onboarding, enterprise
      ├── ensinio-arguments.md       # 3 argumentos + matriz de uso por fase
      └── ensinio-onboarding-patterns.md # Fricções, FAQs, padrões de setup
```

---

## Dados Disponíveis

### Conhecimento Produto (v1.0)
| Arquivo | Conteúdo |
|---------|----------|
| `ensinio-identity.md` | Fundadores, história, posicionamento, milestones, faturamento |
| `ensinio-product-ecosystem.md` | 6 produtos (Club, Pay, Stream, AI, Engage, Chat) |
| `ensinio-solutions-kb.md` | KB completo — 5 pilares, 67+ features |
| `ensinio-pricing.md` | 4 planos + taxas + 7 add-ons |
| `ensinio-competitors.md` | Matriz competitiva vs 7 concorrentes |
| `ensinio-cases.md` | 13+ infoprodutores, 9 empresas corporativas, links demonstráveis |
| `ensinio-market.md` | TAM/SAM/SOM, receita histórica, 115 clientes ativos, ~700K GMV/mês |

### Sales & Qualification (v1.1 → v2.0)
| Arquivo | Conteúdo |
|---------|----------|
| `ensinio-icps.md` | ICP detalhado (3 fontes: Gui, Antonio, Ricardo) |
| `ensinio-red-flags.md` | 21 sinais de alerta + checklist de 15 itens |
| `ensinio-sales-playbook.md` | 8 objeções + técnicas avançadas (linguagem socrática, downplay, custo da inação) |
| `ensinio-sales-cycle.md` | Timeline, funil SDR+Closer, equipe, onboarding, enterprise |
| `ensinio-arguments.md` | 3 argumentos principais + matriz de uso por fase |
| `scoring-criteria.md` | Dual scoring (client_score + partner_score) |
| `message-rules.md` | Regras de comunicação + scripts reais do time |

### Onboarding & Suporte (v2.1 NOVO)
| Arquivo | Conteúdo |
|---------|----------|
| `ensinio-onboarding-patterns.md` | Fricções, FAQs, padrões de setup por nicho, métricas |

### Operacional (v2.0)
| Arquivo | Conteúdo |
|---------|----------|
| `tasks/update-kb.md` | Processo de atualização do KB — fontes estruturadas (5 fases) |
| `tasks/validate-data.md` | Validação de consistência entre 15 arquivos |
| `tasks/extract-from-calls.md` | Extração de insights de calls tl;dv (7 fases) |
| `checklists/data-quality.md` | Checklist de qualidade com score |
| `checklists/seller-onboarding.md` | Onboarding de novo vendedor (5 dias) |

---

## Quick Start

Para ativar o expert:
```
/ensinio-mind:ensinio-expert
```

Para usar dados em outro squad, aponte symlinks para `squads/ensinio-mind/data/`.

---

## Changelog

### v2.2.0 (2026-03-14)
- **Batch 3 processado:** 16 calls tl;dv (~71K palavras) → 785 linhas de insights
- **Breakdown:** 2 VENDAS (Ricardo) + 14 SUPORTE/CS (Bhrenda+equipe)
- **Insights extraídos:** 9 objeções, 5 ICPs, 12 red flags, 47 fricções, 58 FAQs, 12 padrões de setup
- **Churn risks identificados:** Gil Junior (85%), Vamos para o Quadro (100%), Aforismos (40%)
- **Feature requests:** 7 features (2 P0, 2 P1, 2 P2, 1 P3) — `ensinio-feature-requests.md` criado
- **Arquivo consolidado:** `data/insights-batch-3-raw.md` (fonte bruta para integração futura)
- **16 data files** (antes 15)

### v2.1.0 (2026-03-14)
- **Nova task:** `extract-from-calls.md` — extrai insights de calls tl;dv (Google Drive)
- **Novo data file:** `ensinio-onboarding-patterns.md` — fricções, FAQs, padrões de setup
- **Nova source:** tl;dv calls (Ricardo/vendas + Bhrenda/suporte)
- **15 data files** (antes 14)

### v2.0.0 (2026-03-13)
- **3 novas fontes:** Google Forms de Gui Ávila (06/03), Antonio (12/03), Ricardo (13/03)
- **ICP enriquecido:** gênero equilibrado, BH adicionado, nichos expandidos (preparatórios, religião)
- **Red flags:** 18 → 21 sinais, checklist expandido (8 → 15 itens)
- **Sales playbook:** 5 → 8 objeções (incluindo técnicas avançadas do closer Ricardo)
- **Técnicas novas:** linguagem socrática, downplay, custo da inação, apoio vs permissão
- **Sales cycle:** dados de equipe (2 vendedores, meta 30/mês), onboarding, enterprise
- **Cases:** links demonstráveis, GMV ~700K/mês, 115 clientes ativos
- **Agent upgrade:** thinking_dna com 8 heurísticas, handoffs corrigidos
- **Novo:** 2 tasks operacionais (update-kb, validate-data)
- **Novo:** 2 checklists (data-quality, seller-onboarding)

### v1.1.0 (2026-03-07)
- ICP, red flags, sales playbook, sales cycle, argumentos

### v1.0.0 (2026-03-02)
- Criação inicial com 9 data files (identidade, produto, pricing, etc.)
