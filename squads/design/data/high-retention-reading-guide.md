# Design de Leitura Digital de Alta Retenção

> **Guia Completo Baseado em Evidências Científicas (2010-2026)**
> Single Source of Truth para design de experiências de leitura digital.
> Compilado de pesquisas acadêmicas, WCAG, publishers e guidelines de plataformas.

---

## Sumário Rápido

| Área | Regra Principal | Impacto Medido |
|------|-----------------|----------------|
| Font Size | ≥16px, ideal 18-21px | +5-10% velocidade |
| Line Height | 1.5-1.6x | +10% completion |
| Line Length | 50-75ch, ideal 65ch | Minimiza saccades |
| Contraste | ≥4.5:1 (AA), ideal 7:1 (AAA) | Obrigatório |
| Dark Mode | #121212 fundo, #E0E0E0 texto | -14% se mal feito |
| Progress Bar | Visível no topo | +15-25% completion |
| Parágrafos | 3-4 sentenças | +30% engagement |

---

## 1. Playbook: 18 Regras Fundamentais

### Tipografia

**Regra 1 — Tamanho mínimo: 16px**
- Mínimo absoluto: 16px
- Ideal para leitura prolongada: 18-21px
- Fontes <16px reduzem velocidade e aumentam fadiga
- Sans-serif em telas HD: **+5-10% velocidade**

**Regra 2 — Altura de linha: 1.5-1.6x**
- Sweet spot: 1.6
- Linhas longas requerem maior espaçamento
- Line-height 1.6 vs 1.4: **+10% completion rate**

**Regra 3 — Comprimento de linha: 50-75 caracteres**
- Ideal: 65ch
- Máximo WCAG: 80ch
- Minimiza saccades (movimentos rápidos dos olhos)

**Regra 4 — Família tipográfica**
- Priorize fontes com x-height ≥ 50% da cap height
- UI: sans-serif
- Leitura longa: ambos funcionam
- Disléxicos: OpenDyslexic **+15% retenção**

**Regra 4b — Letter-spacing: 0.12x**
- Espaçamento de 0.012em melhora precisão em **10-15%**
- Mobile: considere 0.16x

**Regra 5 — Margens generosas**
- Mobile: mínimo 16px laterais
- Desktop: 24-32px
- **60% whitespace** reduz abandono em **15%**

### Espaçamento

**Regra 6 — Entre parágrafos: 1-1.5em**
- Cria respiros visuais naturais

**Regra 7 — Hierarquia tipográfica clara**
- Escala modular: Minor Third (1.2x) ou Major Third (1.25x)
- H1: 2-2.5x body
- H2: 1.5-2x body
- H3: 1.25-1.5x body

**Regra 7b — Grid: 4pt micro, 8pt macro**
- 4px para micro-espaçamentos
- 8px para ritmo vertical
- Grid 8pt: **+10% engagement**

### Cores e Contraste

**Regra 8 — Contraste mínimo 4.5:1 (WCAG AA)**
- Texto normal: 4.5:1
- Texto grande (≥18px bold): 3:1
- Ideal: 7:1 (AAA)

**Regra 9 — Fundo off-white**
- Use #FAFAFA a #F5F5F5, não #FFFFFF
- Branco puro causa desconforto

**Regra 10 — Dark mode correto**
- Fundo: #121212 a #1E1E1E (NUNCA #000000)
- Texto: #E0E0E0 (NUNCA #FFFFFF)
- Contraste 21:1 causa halation
- Dark mode ruim: **-14% compreensão**

**Regra 11 — Ofereça opções de tema**
- Mínimo: claro, escuro, sépia
- "Seguir sistema" automático
- **70% preferem dark mode noturno**

### Elementos de Interface

**Regra 12 — Indicador de progresso**
- Barra no topo ou lateral
- Alternativas: porcentagem, "X min restantes"
- **+15-25% completion**

**Regra 13 — Links distinguíveis**
- Nunca dependa apenas de cor
- Use sublinhado, peso ou ícone
- Contraste ≥3:1 com texto ao redor
- Links sem sublinhado (cor+hover): **-10% exits**

**Regra 14 — Funcionalidade de destaque**
- Highlight múltiplas cores (40% opacidade)
- Notas marginais ou inline
- **+20% taxa de retorno**

**Regra 15 — Salvar e continuar**
- Salve posição automaticamente
- "Continue de onde parou"
- Aumenta taxa de conclusão

### Padrões Editoriais

**Regra 16 — Parágrafos curtos: 3-4 sentenças**
- Uma ideia por parágrafo
- 3-5 linhas: **+30% engagement**

**Regra 17 — Headings a cada 3-5 parágrafos**
- Facilita escaneamento
- Cria pontos de reentrada
- **+20% navegação**

**Regra 18 — TL;DR e profundidade progressiva**
- Resumo no início
- Pirâmide invertida: conclusão primeiro
- Expandir/colapsar seções
- TL;DR: **-15% bounce rate**

---

## 2. Design Tokens para Leitura

### Escala Tipográfica (Minor Third 1.2x)

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-size-xs` | 0.694rem (11px) | Captions, footnotes |
| `--font-size-sm` | 0.833rem (13px) | Labels, metadata |
| `--font-size-base` | 1rem (16px) | Body text |
| `--font-size-lg` | 1.2rem (19px) | Lead paragraphs |
| `--font-size-xl` | 1.44rem (23px) | H4 |
| `--font-size-2xl` | 1.728rem (28px) | H3 |
| `--font-size-3xl` | 2.074rem (33px) | H2 |
| `--font-size-4xl` | 2.488rem (40px) | H1 |

### Alturas de Linha

| Token | Valor | Uso |
|-------|-------|-----|
| `--line-height-tight` | 1.25 | Headings |
| `--line-height-normal` | 1.5 | UI, short text |
| `--line-height-reading` | 1.6 | Body text ideal |
| `--line-height-relaxed` | 1.625 | Mobile body |
| `--line-height-loose` | 1.75 | Accessibility |

### Medidas (Line Length)

| Token | Valor | Uso |
|-------|-------|-----|
| `--measure-narrow` | 45ch | Mobile, sidebars |
| `--measure-base` | 65ch | Ideal desktop |
| `--measure-wide` | 75ch | Wide layouts |
| `--measure-max` | 80ch | WCAG maximum |

### Cores — Tema Claro

| Token | Valor | Uso |
|-------|-------|-----|
| `--reading-bg` | #FAFAFA | Fundo principal |
| `--reading-bg-alt` | #F5F5F5 | Fundo secundário |
| `--reading-bg-elevated` | #FFFFFF | Cards |
| `--reading-text` | #212121 | Texto principal |
| `--reading-text-secondary` | #424242 | Texto secundário |
| `--reading-text-muted` | #757575 | Metadata |
| `--reading-link` | #1976D2 | Links |

### Cores — Tema Escuro

| Token | Valor |
|-------|-------|
| `--reading-bg` | #121212 |
| `--reading-bg-alt` | #1E1E1E |
| `--reading-bg-elevated` | #242424 |
| `--reading-text` | #E0E0E0 |
| `--reading-text-secondary` | #BDBDBD |
| `--reading-link` | #64B5F6 |

### Cores — Tema Sépia

| Token | Valor |
|-------|-------|
| `--reading-bg` | #FDF6E3 |
| `--reading-bg-alt` | #FAF0D7 |
| `--reading-text` | #433422 |
| `--reading-link` | #B45309 |

### Cores de Highlight (40% opacidade)

| Token | Valor |
|-------|-------|
| `--highlight-yellow` | rgba(255, 235, 59, 0.4) |
| `--highlight-green` | rgba(129, 199, 132, 0.4) |
| `--highlight-blue` | rgba(100, 181, 246, 0.4) |
| `--highlight-pink` | rgba(240, 98, 146, 0.4) |

---

## 3. Matrizes de Decisão

### Serif vs Sans-Serif

| Contexto | Recomendação | Impacto |
|----------|--------------|---------|
| UI/Interface | Sans-serif | — |
| Resumos/Scan | Sans-serif | +5-10% velocidade |
| Leitura longa | Ambos OK | — |
| Usuários 50+ | Sans-serif | — |
| Disléxicos | Sans-serif/OpenDyslexic | +15% retenção |
| Editorial premium | Serif | — |
| Mobile | Sans-serif | +5-10% velocidade |

### Dark Mode vs Light Mode

| Contexto | Recomendação | Razão |
|----------|--------------|-------|
| Leitura prolongada | Light mode | Melhor acuidade |
| Ambiente escuro | Dark mode | Menos luz, conforto |
| Antes de dormir | Dark mode | 70% preferem |
| Revisão/edição | Light mode | Melhor detecção de erros |
| Implementação ruim | EVITAR | -14% compreensão |

### Largura por Breakpoint

| Viewport | Caracteres | Font Size | Line Height |
|----------|------------|-----------|-------------|
| < 480px | 35-45ch | 16px | 1.6-1.7 |
| 480-639px | 40-50ch | 16px | 1.6 |
| 640-1023px | 55-70ch | 17px | 1.5-1.6 |
| ≥ 1024px | 60-75ch | 18px | 1.5-1.6 |
| ≥ 1440px | 65-80ch | 18-21px | 1.5 |

---

## 4. Métricas de Qualidade

### Primárias

| Métrica | Benchmark Bom | Excelente |
|---------|---------------|-----------|
| Completion Rate (≥90% scroll) | ≥ 30% | ≥ 50% |
| Scroll Depth médio | ≥ 60% | ≥ 75% |
| Time on Page (5 min artigo) | 2.5-3.5 min | 3.5-5 min |
| Return Rate (7 dias) | ≥ 20% | ≥ 35% |
| Bounce Rate | < 40% | < 25% |

### Fórmulas

```
Reading Time = palavras ÷ 200 (casual)
Reading Time = palavras ÷ 250 (rápida)

Completion Rate = (sessões scroll ≥90%) ÷ total × 100

Engagement Score = (scroll_depth × 0.4) + (time_ratio × 0.3) + (interactions × 0.3)
```

### Benchmarks por Tipo

| Tipo | Completion | Tempo |
|------|------------|-------|
| Notícia curta (<500 palavras) | 60-80% | 1-2 min |
| Artigo médio (500-1500) | 40-60% | 3-6 min |
| Long-form (1500-3000) | 25-40% | 6-12 min |
| Tutorial técnico | 30-50% | Varia |
| Listicle | 50-70% | 2-5 min |

---

## 5. Validação de Compliance

### Checklist Obrigatório

**Tipografia:**
- [ ] Font size ≥ 16px
- [ ] Line height ≥ 1.5
- [ ] Line length ≤ 80ch
- [ ] Zoom 200% funcional
- [ ] Sem ALL CAPS em blocos
- [ ] Peso ≥ 400 para body

**Cor e Contraste:**
- [ ] Contraste ≥ 4.5:1 (AA)
- [ ] Links distinguíveis além da cor
- [ ] Focus visível
- [ ] ≥ 2 temas disponíveis

**Acessibilidade:**
- [ ] Hierarquia de headings lógica
- [ ] Skip links disponíveis
- [ ] prefers-reduced-motion respeitado
- [ ] Touch targets ≥ 44x44px

---

## 6. Referências de Publishers

### Especificações Técnicas

| Publisher | Font Size | Line Height | Max Width | Fonte |
|-----------|-----------|-------------|-----------|-------|
| Medium | **21px** | 1.58 | ~680px | Charter |
| NYT | 18-19px | ~1.5 | ~600px | Georgia |
| Guardian | 17px | 1.4 | ~620px | Guardian Egyptian |
| Substack | 18px | 1.6 | ~680px | System |
| The Atlantic | 20px | 1.6 | ~660px | Georgia |

### Evidências de Impacto

| Publisher | Descoberta |
|-----------|------------|
| Medium | TTR (Total Time Reading) > pageviews como métrica |
| NZZ | Imagem após 1º parágrafo: +20% engaged time |
| Guardian | Redesign tabloid: 4x vendas em 1 semana |
| FT | "Quality reads" prediz conversão melhor que pageviews |
| Chartbeat | Scroll 25-35% → 14% retorno; cada página adicional → 8% → 22% retorno |

---

## 7. Armadilhas Comuns

| Problema | Sintoma | Solução |
|----------|---------|---------|
| Alto tempo + baixo scroll | Usuário distraído | Verificar elementos que prendem no topo |
| Alto completion + alto bounce | Conteúdo curto demais | Oferecer conteúdo relacionado |
| Média sem segmentação | Esconde diferenças | Segmentar mobile/desktop, novo/retorno |
| Dark mode mal implementado | -14% compreensão | Nunca usar #000/#FFF puros |
| Linhas muito longas | Perda de tracking | Limitar a 75ch |
| Parágrafos longos | Blocos intimidadores | 3-4 sentenças |

---

*Guia v1.0.0 — Baseado em pesquisa sistemática de literatura acadêmica, WCAG 2.1/2.2, Apple HIG, Material Design 3, e práticas de publishers.*
