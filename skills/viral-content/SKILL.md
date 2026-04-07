---
name: viral-content
description: Cria vídeos virais para Instagram (Reels/Stories/Feed). Frameworks de viralização, hooks, roteiros, retenção, algoritmo e otimização. Invoque quando precisar criar, auditar ou otimizar conteúdo viral para redes sociais.
---

# Viral Content — Skill de Criação de Conteúdo Viral

Skill especializada em criar vídeos virais para Instagram usando estratégia baseada em dados e psicologia.

## Quando Usar

- Criar vídeo viral (roteiro + hook + estratégia)
- Auditar potencial viral de um conceito ou vídeo existente
- Otimizar retenção de vídeo com performance baixa
- Analisar e surfar trends
- Otimizar para o algoritmo do Instagram
- Criar hooks, captions e thumbnails

---

## Quick Start

```
/viral-content                    → Menu principal
/viral-content create [tema]      → Criar vídeo viral do zero
/viral-content audit [conceito]   → Auditar potencial viral
/viral-content hook [tema]        → Gerar 10 hooks testados
/viral-content optimize [vídeo]   → Otimizar vídeo existente
/viral-content trend [nicho]      → Caçar trends do momento
```

---

## Workflows

### 1. Criar Vídeo Viral (do zero)

```
FASE 1: ESTRATÉGIA
  - Definir objetivo, nicho, audiência
  - Analisar trends do momento (ver references/trends.md)
  - Pesquisar competidores e gaps
  - Aplicar STEPPS Framework (references/viral-strategy.md)

FASE 2: HOOK (mais importante)
  - Gerar 10+ hooks usando templates (templates/hooks/)
  - Avaliar cada hook com score (retention @3s estimada)
  - Selecionar top 3 para o roteiro
  - Ver references/hooks.md para fórmulas testadas

FASE 3: ROTEIRO
  - Aplicar estrutura de script (templates/scripts/)
  - Inserir open loops para manter retenção
  - Adicionar save triggers e share triggers
  - Timing segundo a segundo (references/retention.md)

FASE 4: VISUAL
  - Aplicar Design System configurado (ver design-system.md na raiz do projeto)
  - Seguir checklists/design-checklist.md
  - Implementar em Remotion (se aplicável)

FASE 5: OTIMIZAÇÃO PRÉ-PUBLICAÇÃO
  - Validar com checklists/viral-checklist.md
  - Otimizar caption e hashtags (references/algorithm.md)
  - Criar thumbnail (templates/thumbnails/)

FASE 6: LANÇAMENTO
  - Publicar no horário de pico da audiência
  - Protocolo pós-publicação (checklists/post-publish-checklist.md)
  - Monitorar métricas nas primeiras 2h
```

### 2. Auditar Vídeo Existente

```
Usar o framework STEPPS (references/viral-strategy.md):

1. Viral Score (0-100) baseado nos 6 elementos STEPPS
2. Retention analysis — identificar penhascos de queda
3. Algorithm signals — verificar saves, shares, watch time
4. Recomendações específicas de otimização
```

### 3. Otimizar Vídeo com Performance Baixa

```
Usar references/retention.md + references/algorithm.md:

1. Diagnosticar gráfico de retenção (onde o público sai?)
2. Identificar causa raiz de cada drop-off
3. Prescrever fix específico:
   - Hook fraco → Substituir (templates/hooks/)
   - Setup longo → Cortar e inserir open loop
   - Transição morta → Adicionar motion + audio cue
   - Algorithm sinais fracos → Adicionar save/share triggers
4. Re-render e comparar métricas before/after
```

### 4. Trend Jacking (surfar trend em 4-8h)

```
Usar references/trends.md:

1. Identificar trend com janela de oportunidade (< 72h)
2. Criar twist único (regra 70/30: 70% formato original, 30% twist)
3. Produção acelerada com template existente
4. Publicar IMEDIATAMENTE — timing > perfeição
```

### 5. A/B Testing de Hooks

```
1. Gerar 10 hooks com tipos DIFERENTES (não variações do mesmo)
2. Selecionar 3 para teste (diversidade > score)
3. Produzir 3 versões com mesmo conteúdo pós-hook
4. Publicar com 48h de intervalo, mesmas condições
5. Analisar com significância estatística (p < 0.05)
6. Declarar vencedor e documentar no knowledge base
```

---

## Referências Disponíveis

| Arquivo | Conteúdo |
|---------|----------|
| `references/viral-strategy.md` | STEPPS, Hook-Retain-Convert, Share Psychology, Viral Loops |
| `references/hooks.md` | 10 tipos de hooks com fórmulas, scores e % de retenção |
| `references/retention.md` | Anatomia da retenção, tipos de drop-off, tratamentos |
| `references/algorithm.md` | Ranking signals do Instagram 2025, timing, hashtags, shadowban |
| `references/trends.md` | Lifecycle de trends, plataformas, estratégia de adaptação |
| `references/metrics.md` | Benchmarks de sucesso (views, saves, shares, viral coefficient) |
| `references/remotion.md` | Arquitetura Remotion, performance, templates de componentes |

## Templates Disponíveis

| Categoria | Arquivos | Para quê |
|-----------|----------|----------|
| `templates/scripts/` | 5 templates | Roteiros com timing (transformation, controversy, listicle, etc.) |
| `templates/hooks/` | 6 templates | Fórmulas de hook com % de retenção |
| `templates/captions/` | 3 templates | Caption hooks + CTAs |
| `templates/thumbnails/` | 2 templates | Design de thumbnail para CTR |

## Checklists

| Arquivo | Quando usar |
|---------|-------------|
| `checklists/viral-checklist.md` | Antes de publicar qualquer vídeo |
| `checklists/algorithm-checklist.md` | Quando reach está baixo |
| `checklists/retention-checklist.md` | Quando retenção está abaixo de 40% |
| `checklists/post-publish-checklist.md` | Primeiras 2h após publicar |
| `checklists/design-checklist.md` | Validar compliance visual |

---

## Métricas de Sucesso

| Métrica | Bom | Viral | Mega Viral |
|---------|-----|-------|------------|
| Views | 100K | 1M | 10M+ |
| Retention @3s | 70% | 75% | 85%+ |
| Save Rate | 5% | 8% | 12%+ |
| Share Rate | 1.5% | 3% | 5%+ |
| Viral Coefficient | 1.0 | 1.5 | 3.0+ |

## Ranking Signals do Instagram (2025)

```
1. SAVES (peso 10x) — Sinal MAIS forte. Save = "quero ver de novo"
2. SHARES (peso 8x) — Compartilhamento é distribuição orgânica
3. WATCH TIME (peso 7x) — Retention + replays
4. FOLLOWS (peso 6x) — Conversão de viewer para follower
5. COMMENTS (peso 5x) — Engagement ativo
6. LIKES (peso 1x) — Sinal MAIS fraco. Muitos likes ≠ viral
```

---

## Princípios

1. **Hook decide tudo** — Se os primeiros 3s não prendem, nada mais importa
2. **Saves > Likes** — Conteúdo que as pessoas salvam é 10x mais distribuído
3. **Dados > Opinião** — Sempre testar, nunca adivinhar
4. **Template > Custom** — Reusar formatos comprovados antes de criar do zero
5. **Timing > Perfeição** — Publicar dentro da janela > polir indefinidamente
6. **Accent ≤ 8%** — Cor de destaque em excesso perde impacto
