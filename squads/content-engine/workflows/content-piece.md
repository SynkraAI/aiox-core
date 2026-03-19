# Workflow: Content Piece (Post Estático / Frase-Tese)

## Metadata
- id: content-piece
- version: 1.0.0
- type: multi-agent
- estimated_time: 30-45 min
- agents_involved: [@eugene-schwartz, @nicolas-cole, @dan-koe, @devil-advocate, @oraculo-torriani]

---

## ENFORCEMENT RULES

**REGRA ABSOLUTA: Este workflow tem 5 fases sequenciais. Cada fase tem um GATE de saída. Se o GATE falhar, PARE. NÃO pule fases. NÃO avance sem completar TODOS os items do GATE.**

**Se você está lendo este workflow, siga estas regras:**
1. Execute as fases na ORDEM (1 → 2 → 3 → 4 → 5)
2. Ao final de cada fase, preencha o GATE Block correspondente
3. Se qualquer item do GATE for NÃO, PARE e corrija
4. Escreva "GATE-PASS: content-piece [fase] [data]" antes de avançar

---

## Propósito

Criar uma peça de conteúdo estática (frase-tese, opinião, reflexão) com debate obrigatório e validação Torriani. Segue o pipeline completo: diagnóstico → produção com debate → validação.

## Quando Usar

- Post estático para Instagram feed
- Frase-tese forte (opinião polarizada)
- Reflexão com CTA leve
- LinkedIn post de autoridade

## Inputs

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| tema | string | sim | Tema ou ângulo do post |
| plataforma | string | sim | Instagram, LinkedIn, etc. |
| anc_tag | string | sim | Attract, Nurture ou Convert |
| contexto | string | não | Contexto do sprint semanal ou momento |
| tom | string | não | Tom específico (reflexivo, provocativo, confessional) |

## Fases

### Fase 1: DIAGNÓSTICO + DATA RESEARCH (10 min)
- **Agente**: @eugene-schwartz
- **Ações**:
  1. Determinar nível de awareness do público para o tema
  2. Determinar nível de sofisticação do mercado
  3. Recomendar ângulo de abordagem
  4. **PESQUISA DE DADOS (SEMPRE obrigatória — sem exceção)**:
     a. Dados INTERNOS: `data/icp-research.md`, métricas de produtos/serviços, banco de dados
     b. Dados EXTERNOS: pesquisa online em fontes confiáveis (EXA, WebSearch, WebFetch)
     c. Compilar: `{dado, fonte, URL, ano}`
     d. Se tema não requer dados quantitativos: registrar `dados_verificados: N/A — tema não requer dados`
     e. **REGRA: Sem dados reais → mudar contexto/ângulo. NUNCA inventar.**
     f. **VETO: Diagnóstico sem campo dados_verificados (preenchido OU N/A) = GATE-FAIL automático**
- **Output**: diagnostico (awareness level + sophistication + ângulo + dados_verificados[])
- **Gate**: QG-002 (blocking)

---
### GATE-1: Diagnóstico Completo
**OBRIGATÓRIO antes de avançar para Fase 2**

- [ ] Awareness level identificado (1-5)
- [ ] Sophistication level identificado (1-5)
- [ ] Ângulo de abordagem recomendado
- [ ] Diagnóstico justificado com base no tema e público
- [ ] Pesquisa de dados realizada (campo `dados_verificados` preenchido OU marcado `N/A`)
- [ ] **Nenhum dado inventado** — todos com fonte + URL + ano (ou N/A se tema não requer)

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/6
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: complete o diagnóstico. NÃO inicie produção sem ele.
---

### Fase 2: DEBATE — Duas Versões (15 min)
- **Agente A**: @nicolas-cole (Headline Engineering + Atomic Essay)
- **Agente B**: @dan-koe (Art of Focus + Content Philosophy)
- **Ações**:
  1. Ambos recebem o mesmo brief + diagnóstico
  2. Agente A produz versão com foco em craft e headline
  3. Agente B produz versão com foco em filosofia e profundidade
  4. Trabalham sem ver o trabalho um do outro
- **Output**: versao_a, versao_b
- **Regra**: Abordagens DEVEM ser diferentes

---
### GATE-2: Duas Versões Produzidas
**OBRIGATÓRIO antes de avançar para Fase 3**

- [ ] Versão A completa (copy + headline)
- [ ] Versão B completa (copy + headline)
- [ ] Abordagens são diferentes (evidência explícita)
- [ ] Ambos trabalharam sem ver o trabalho do outro

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: complete as versões. NÃO avance para Devil's Advocate.
---

### Fase 3: DEVIL'S ADVOCATE (10 min)
- **Agente**: @devil-advocate
- **Ações**:
  1. Aplicar Teste da Substituição em ambas
  2. Aplicar Teste do Dado em ambas
  3. Aplicar Teste do Scroll em ambas
  4. Produzir relatório com forças e fraquezas
- **Output**: relatorio_debate

---
### GATE-3: Devil's Advocate Executado
**OBRIGATÓRIO antes de avançar para Fase 4**

- [ ] Teste da Substituição aplicado em ambas as versões
- [ ] Teste do Dado aplicado em ambas as versões
- [ ] Teste do Scroll aplicado em ambas as versões
- [ ] Relatório com forças e fraquezas de cada versão

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: complete os 3 testes. NÃO avance para Consolidação.
---

### Fase 4: CONSOLIDAÇÃO (5 min)
- **Agente**: @nicolas-cole (consolidador padrão para frases estáticas)
- **Ações**:
  1. Selecionar melhor headline entre as duas versões
  2. Integrar defesas do Devil's Advocate
  3. Produzir versão consolidada
- **Output**: versao_consolidada

---
### GATE-4: Consolidação Completa
**OBRIGATÓRIO antes de avançar para Fase 5**

- [ ] Melhor hook selecionado entre as duas versões
- [ ] Defesas do Devil's Advocate integradas
- [ ] Versão consolidada é peça completa (não rascunho)
- [ ] Relatório do Devil's Advocate usado como guia

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: volte para consolidação. NÃO submeta à Humanização.
---

### Fase 4.5: HUMANIZAÇÃO DA COPY (5 min)
- **Agente**: QA linguístico
- **Reference obrigatória**: `docs/research/2026-02-12-escrita-instagram/CHEATSHEET.md`
- **Inputs**: versao_consolidada da Fase 4
- **Ações**:
  1. Audit AI Tells: eliminar em dashes (—) excessivos (máx 1), vocabulário corporativo, estruturas "não X — Y"
  2. Injetar Burstiness: variar frases 1-40 palavras, quebras de linha estratégicas
  3. Voz Humana: linguagem coloquial BR natural (tá, pra, né), perguntas retóricas, dados técnicos em linguagem acessível
  4. Teste de Voz Alta: soa como conversa com amigo? Se não, reescrever
- **Output**: versao_humanizada

---
### GATE-4.5: Copy Humanizada
**OBRIGATÓRIO antes de avançar para Fase 5**

- [ ] Zero em dashes excessivos (máximo 1 no post inteiro)
- [ ] Zero vocabulário corporativo vazio
- [ ] Alta burstiness (frases variam 1-40 palavras)
- [ ] CTA emocional (não instrucional)
- [ ] Teste de voz alta: soa como conversa

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/5
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: reescreva. NÃO submeta ao Torriani.
---

### Fase 5: VALIDAÇÃO TORRIANI (5 min)
- **Agente**: @oraculo-torriani
- **Ações**:
  1. Executar Validador Master (5 critérios)
  2. Emitir score final
- **Output**: veredito_final
- **Gate**: QG-004 (mín 7/10 para social)

---
### GATE-5: Torriani Validou
**GATE FINAL — determina se conteúdo está aprovado**

- [ ] Validador Master executado (5 critérios)
- [ ] Score final calculado
- [ ] Score >= 7/10 para social
- [ ] Se reprovado: seguir regras de iteração abaixo

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Torriani Score**: _/10
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: consulte Regras de Iteração. NÃO publique.
GATE-PASS: escreva "GATE-PASS: content-piece torriani [score] [data]"
---

## Regras de Iteração

| Cenário | Ação |
|---------|------|
| Torriani aprova (>= 7/10) | Conteúdo aprovado. Gerar PNG. |
| Torriani reprova (1a vez) | Volta para Fase 4 com feedback. |
| Torriani reprova (2a vez) | Volta para Fase 4 com feedback refinado. |
| Torriani reprova (3a vez) | ESCALAR para Tiago. |

**Limite de iterações**: máximo 2 rodadas de correção (3 submissões totais). Na 3a reprovação, decisão humana.

## Outputs

| Entregável | Formato | Descrição |
|------------|---------|-----------|
| versao_consolidada | markdown | Copy final do post |
| render_batch | JSON | Batch para render.ts (template: static-post) |
| veredito_final | markdown | Score e feedback do Torriani |

## Integração com Render

Após aprovação, gerar JSON batch usando template `static-post`:

```json
[
  {
    "template": "static-post",
    "data": {
      "BG_COLOR": "#14213D",
      "TEXT_COLOR": "#FFFFFF",
      "BODY_COLOR": "rgba(255,255,255,0.7)",
      "MUTED_COLOR": "rgba(255,255,255,0.4)",
      "HEADLINE": "[frase-tese aprovada]",
      "BODY": "[complemento se houver]",
      "AUTHOR": "@tiagoalmeidaoficial"
    },
    "out": "semana-N/static-X/01-frase-tese.png"
  }
]
```

## Art Direction (se imagem gerada)

**Referência obrigatória**: `data/visual-rules.md`

Se o post usa imagem gerada (Nano Banana) ao invés de template tipográfico:
1. Ler `data/visual-rules.md` (regras visuais baseadas em neurociência)
2. Preencher prompt usando `templates/nano-banana-prompt-tmpl.md` (5 blocos)
3. Validar contra Checklist Rápido de `data/visual-rules.md`
4. Tipo de capa: consultar tabela "Tipos de Capa por Impacto" em `data/visual-rules.md`

## Quality Gates

- [ ] Diagnóstico Schwartz realizado antes da produção
- [ ] Duas versões produzidas independentemente
- [ ] Devil's Advocate aplicou os 3 testes
- [ ] Consolidação guiada pelo relatório do Devil's Advocate
- [ ] Torriani validou com score >= 7/10
- [ ] Máximo 2 iterações respeitado
- [ ] JSON batch gerado com template correto
