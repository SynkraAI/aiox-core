# Visual QA Checklist — Content Engine v3

**Versão:** 1.1
**Referência:** design-system.md (seção 10), render-batch-tmpl.md, `data/visual-rules.md`
**Scoring:** items passados / 21 x 10. Mínimo 8.0/10 para aprovar.
**Regra bloqueante:** Qualquer falha na seção 4 (Integridade do Render) reprova independente do score.

---

## 1. Tokens & Consistência (5 items)

- [ ] **1.1** Todas as cores vêm de design-tokens / design-system.md (nenhum valor hardcoded no JSON batch fora da paleta definida)
  - Paleta válida: `#14213D`, `#FFFFFF`, `#FCA311`, `#C9A84C`, `#F5F5F5`, `#2D2D2D`, `#333333`, `#999999`, `rgba(255,255,255,0.7)`, `rgba(255,255,255,0.3)`, `rgba(20,33,61,0.4)`, `rgba(20,33,61,0.7)`
- [ ] **1.2** Variante light/dark aplicada corretamente: slides ímpares = fundo claro (#FFFFFF ou #F5F5F5), slides pares = fundo escuro (#14213D ou #2D2D2D). Capa e CTA final = sempre Navy (#14213D)
- [ ] **1.3** Tipografia conforme tokens: headline = Inter ExtraBold (800), body = Courier Prime Regular (400)
- [ ] **1.4** Safe zones respeitadas: feed 100px top/bottom, 80px laterais. Stories 155px top, 200px bottom, 80px laterais
- [ ] **1.5** Gold accent (#C9A84C) usado no máximo 1x por slide (via `<span class="highlight">`)

---

## 2. Hierarquia Visual (4 items)

- [ ] **2.1** Headline é o elemento mais proeminente (maior font-size, peso 800, posição superior)
  - Feed: headline >= 48px, body <= 32px
- [ ] **2.2** Body é claramente secundário (menor font-size, peso 400, cor com opacidade reduzida em fundo escuro)
- [ ] **2.3** CTA/indicadores (badge, seta, counter) não competem visualmente com headline (font-size <= 18px, cor muted)
- [ ] **2.4** Reading flow natural top-down: headline --> body --> CTA/indicador. Nenhum elemento quebra essa sequência

---

## 3. Legibilidade (4 items)

- [ ] **3.1** Contraste texto/fundo >= 4.5:1 (WCAG AA). Ver tabela de referência abaixo
- [ ] **3.2** Headline <= 8 palavras (cabe em máximo 2 linhas no template)
- [ ] **3.3** Body <= 25 palavras (não overcrowded)
- [ ] **3.4** Lista <= 5 items (se template content-list)

---

## 4. Integridade do Render (3 items) — BLOQUEANTE

- [ ] **4.1** PNG gerado sem erros: arquivo existe e tamanho > 10KB
- [ ] **4.2** Dimensões corretas: feed = 1080x1350, story = 1080x1920
- [ ] **4.3** Nenhum texto cortado ou overflow visível (headline e body cabem dentro das safe zones)

---

## Tabela de Contraste WCAG AA — Paleta do Design System

Cálculo baseado na fórmula de luminância relativa WCAG 2.1.

| Foreground | Background | Ratio | WCAG AA (4.5:1) | Uso |
|-----------|-----------|-------|-----------------|-----|
| #14213D (navy) | #FFFFFF (branco) | 13.5:1 | PASS | Headline em slide claro |
| #FFFFFF (branco) | #14213D (navy) | 13.5:1 | PASS | Headline em slide escuro |
| #333333 (body dark) | #FFFFFF (branco) | 12.6:1 | PASS | Body em slide claro |
| rgba(255,255,255,0.7) | #14213D (navy) | ~7.8:1 | PASS | Body em slide escuro |
| #C9A84C (gold) | #14213D (navy) | 4.7:1 | PASS | Accent em slide escuro |
| #C9A84C (gold) | #FFFFFF (branco) | 2.2:1 | FAIL | Accent em slide claro — usar apenas como decorativo, NUNCA como texto principal |
| #999999 (muted) | #FFFFFF (branco) | 3.0:1 | FAIL | Muted em slide claro — OK para indicadores (não texto principal) |
| rgba(255,255,255,0.3) | #14213D (navy) | ~2.8:1 | FAIL | Muted em slide escuro — OK para indicadores (não texto principal) |
| #14213D (navy) | #F5F5F5 (cinza claro) | 12.3:1 | PASS | Headline em slide cinza |
| #FFFFFF (branco) | #2D2D2D (cinza escuro) | 11.3:1 | PASS | Headline em slide confessional |

**Regra de ouro**: Cores com FAIL no WCAG AA são aceitáveis APENAS para elementos decorativos (indicadores, setas, badges). NUNCA para headline ou body text.

---

## 5. Neurociência Visual (5 items) — Referência: `data/visual-rules.md`

- [ ] **5.1** Cor dominante única por slide (navy OU branco, nunca ambos disputando) — +17% likes
- [ ] **5.2** Textura/grain presente no fundo (não é flat puro) — +79% likes
- [ ] **5.3** Espaço vazio >40% da área (background amplo, sem overcrowding) — +29% likes
- [ ] **5.4** Se imagem com rosto: expressão contemplativa/vulnerável, não sorriso genérico — +38% likes
- [ ] **5.5** Gold (#C9A84C) usado como accent apenas (nunca dominante, max 1 elemento por slide)

---

## Resultado

**Score:** ___/21 x 10 = ___/10
**Status:** [ ] PASS (>= 8.0 E seção 4 100%) / [ ] FAIL (< 8.0 OU qualquer item da seção 4 falhou)
**Items com falha:** [listar número e descrição]
**Ação:** [sugestão de correção para cada falha — consultar `data/visual-rules.md` para Anti-Patterns]

---

## Integração GATE-VISUAL

Este checklist é referenciado como **GATE-VISUAL** no debate-session workflow.
Integração completa definida na Story 4.3.

**Uso no pipeline:**
```bash
# Validação automatizada (items 1.1, 1.2, 3.2-3.4, 4.1, 4.2)
bash scripts/visual-qa-check.sh <batch.json> <output-dir>

# Items que requerem inspeção visual: 2.1-2.4, 4.3
# Items parcialmente automatizáveis: 1.3-1.5, 3.1
```

**Exit codes:**
- `0` = PASS (score >= 8.0 e seção 4 completa)
- `1` = FAIL (score < 8.0 ou seção 4 com falha)

---

## Auto-Correção — Se Falhar, Faça Isso

| Falha | Correção |
|-------|----------|
| 1.1 — Cor fora da paleta | Substitua pelo valor mais próximo na paleta do design-system.md. Nunca use cores hardcoded |
| 1.2 — Variante light/dark errada | Ímpares = claro (#FFFFFF/#F5F5F5), Pares = escuro (#14213D/#2D2D2D). Capa e CTA = Navy |
| 1.3 — Tipografia incorreta | Headline: Inter ExtraBold (800). Body: Courier Prime Regular (400). Corrija no JSON batch |
| 1.4 — Safe zones violadas | Feed: 100px top/bottom, 80px laterais. Stories: 155px top, 200px bottom, 80px laterais |
| 1.5 — Gold accent em excesso | Max 1x por slide via `<span class="highlight">`. Remova usos extras |
| 2.1 — Headline não proeminente | Aumente font-size da headline (min 48px feed). Garanta peso 800 e posição superior |
| 2.2 — Body compete com headline | Reduza font-size do body (max 32px). Use peso 400 e opacidade reduzida em fundo escuro |
| 2.3 — Indicadores competem visualmente | Reduza indicadores para font-size <= 18px. Use cor muted (#999999 ou rgba) |
| 2.4 — Reading flow quebrado | Reorganize: headline (topo) → body (meio) → indicador (base). Nenhum elemento fora dessa ordem |
| 3.1 — Contraste insuficiente | Consulte tabela WCAG AA acima. Troque combinação por uma com razão >= 4.5:1 |
| 3.2 — Headline longa | Corte para max 8 palavras. Remova artigos e preposições dispensáveis |
| 3.3 — Body overcrowded | Reduza para max 25 palavras. Mova excesso para próximo slide |
| 3.4 — Lista longa | Max 5 items. Agrupe ou remova items menos relevantes |
| 4.1 — PNG não gerado ou < 10KB | Re-execute render. Verifique Chrome headless, caminhos das fontes e JSON batch |
| 4.2 — Dimensões erradas | Feed: 1080x1350. Story: 1080x1920. Ajuste viewport no script de render |
| 4.3 — Texto cortado/overflow | Reduza texto ou aumente safe zones. Verifique visualmente após re-render |
| 5.1 — Mais de 1 cor dominante | Escolha navy OU branco como base. Nunca ambos disputando espaço |
| 5.2 — Fundo flat sem textura | Adicione grain/noise sutil. No Nano Banana: inclua "film grain texture" no Bloco 5 |
| 5.3 — Slide overcrowded | Remova elementos até >40% espaço vazio. Mova texto para próximo slide se necessário |
| 5.4 — Rosto com sorriso genérico | Substitua por expressão contemplativa/pensativa. Olhar lateral ou para baixo |
| 5.5 — Gold em excesso | Gold apenas como accent (highlight, linha, badge). Nunca como fundo ou bloco grande |
