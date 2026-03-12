# Vendas Todos os Dias

> Squad de monetização perpétua baseado no método **Natanael Oliveira**
>
> *"Só vende quem oferece. Quem tem cronograma tem caixa."*

## Overview

Squad que implementa o método **Money Machine** — 3 Playbooks Simultâneos rodando todos os dias para gerar caixa perpétuo, sem depender de lançamentos.

**Modelo 12/54/27:**
- 12 funis novos/ano (1/mês)
- 54 campanhas/ano (1/semana)
- 27 novas fontes de lucro/ano

## Agents

| Agent | Tier | Função |
|-------|------|--------|
| `vtd-chief` | Orchestrator | Triage, diagnóstico, routing |
| `pesquisador-ia` | Tier 0 | Pesquisa com IA antes de qualquer ação |
| `arquiteto-funil` | Tier 1 | Funis perpétuos, ManyChat, tráfego 80/20 |
| `monetizador` | Tier 1 | Empilhamento, campanhas, mix, caixa rápido |
| `copy-andromeda` | Tier 1 | Copy por sentimento (Andromeda), 30-70 criativos |
| `escalador` | Tier 2 | Amazon, apps IA, mineração dados, modelo enxuto |

## Comandos

### Modos de Operação

| Comando | Descrição | Tipo |
|---------|-----------|------|
| `*money-machine {nicho}` | Playbook completo Money Machine | Workflow (6 fases) |
| `*pesquisa-mercado` | Pesquisa de mercado com IA | Workflow (3 fases) |
| `*aquisicao-funil` | Montar funil de aquisição | Workflow (4 fases) |
| `*monetiza-empilhar` | Empilhamento de ofertas | Workflow (3 fases) |
| `*campanha {tipo}` | Campanha semanal (7 gatilhos) | Workflow (4 fases) |
| `*escala-amazon` | Escala via livros Amazon | Workflow (4 fases) |
| `*escala-ia` | Apps IA como produto | Task |
| `*copy-andromeda` | Criativos por sentimento | Task |
| `*copy-campanha` | Copy para campanha | Task |

### Comandos Diretos

| Comando | Descrição | Tipo |
|---------|-----------|------|
| `*mix-produtos {meta}` | Mix de produtos para meta | Task |
| `*diagnostico {negocio}` | Diagnóstico do modelo | Workflow (3 fases) |
| `*criar-produto {nicho}` | Criar produto do zero | Workflow (5 fases) |
| `*plano-anual {nicho}` | Planejamento 12/54/27 | Workflow (5 fases) |
| `*caixa-rapido {meta}` | Caixa rápido 24h | Task |

## Workflows

### wf-money-machine (Master)
O workflow principal — monta a máquina completa para um nicho:
1. Pesquisa de Mercado → 2. Mix de Produtos → 3. Funil Aquisição → 4. Cronograma Campanhas → 5. Escala → 6. Dashboard

### wf-criar-produto
Cria produto do zero ao blueprint com template por tipo:
1. Pesquisa → 2. Seleção de tipo → 3. Tema + Copy → 4. Validação → 5. Blueprint

### wf-planejamento-anual
Modelo 12/54/27 completo:
1. Inventário → 2. Calendário 12 Funis → 3. Cronograma 54 Campanhas → 4. Roadmap 27 Produtos → 5. Dashboard

## Templates de Produto

| Template | Tipo | Ticket |
|----------|------|--------|
| `tmpl-ebook.md` | Ebook | R$9-14 (low) |
| `tmpl-desafio.md` | Desafio | R$97-197 (mid) |
| `tmpl-workshop.md` | Workshop | R$197-297 (mid) |
| `tmpl-curso.md` | Curso | R$297 (mid) |
| `tmpl-imersao.md` | Imersão | R$997 (high) |
| `tmpl-aula-ao-vivo.md` | Aula ao vivo | Free/Low |
| `tmpl-livro-amazon.md` | Livro Amazon | R$24-44 (low) |
| `tmpl-app-ia.md` | App IA | R$50-247 (low-mid) |
| `tmpl-mentoria.md` | Mentoria | R$2.5k-5k (high) |
| `tmpl-kit-monetizacao.md` | Kit Monetização | R$997-2.5k (high) |

## Heurísticas-Chave

| ID | Regra |
|----|-------|
| NO-H001 | Pesquisa IA ANTES de criar qualquer produto |
| NO-H003 | 1 produto = 1 problema específico |
| NO-H014 | Copy por sentimento, NÃO por demografia |
| NO-F012 | High ticket ANTES de low ticket (ancoragem) |
| NO-F021 | SEMPRE próximo passo pós-compra |
| NO-F022 | 98% não compraram = oferece algo |
| NO-F033 | Custo variável > fixo (50-60% lucro) |

## Números Reais

| Métrica | Valor |
|---------|-------|
| CPL tema certo | R$0,80-1,10 |
| CPL tema errado | R$2,50-4,00 |
| CPC visita perfil | R$0,25-0,30 |
| Taxa ManyChat | 60-90% |
| Conversão aula ao vivo | ~20% |
| Meta lucro | 50-60% |
| Plano 1K/dia | 10x R$27 + 5x R$97 + 2x R$297 = ~R$1.350/dia |

## Source Mind

**Natanael Oliveira** — Money Machine Architect
- 14+ anos de mercado digital
- DNA extraído em: `squads/minds/natanael-oliveira/`
- Método: 3 Playbooks Simultâneos (Aquisição + Monetização + Escala)

---

*"Empilhamento de ofertas."*
*"Bora nessa!"*
