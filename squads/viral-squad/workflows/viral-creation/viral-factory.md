# 🏭 Viral Factory - Workflow Completo de Criação Viral

## Objetivo

Criar vídeo viral do zero com discussão colaborativa entre agentes, supervisionado por @oalanicolas e @pedro-valerio.

## Quando Usar

- Criar vídeo viral completo (greenfield)
- Precisa de estratégia + design + implementação
- Tempo: 3-5 dias

## Supervisores (Autoridade Máxima)

- 🧠 **@oalanicolas** — Mind Cloning Architect (`.claude/agents/oalanicolas.md`)
  - Aprova/veta autenticidade, DNA Mental, curadoria de fontes
- 🔍 **@pedro-valerio** — Process Absolutist (`.claude/agents/pedro-valerio.md`)
  - Aprova/veta integridade de processo, quality gates, debate rules

## Agentes do Squad

1. 🔥 **@viral** - Estratégia viral (líder do squad)
2. 📡 **@trend-hunter** - Trends atuais
3. 🎣 **@hook-master** - Hooks testados
4. 📝 **@script-architect** - Roteiro viral
5. 💥 **@visual-impact** - Design visual
6. 🏗️ **@remotion-architect** - Arquitetura técnica
7. 🎬 **@animation-pro** - Animações
8. 🎵 **@sound-designer** - Audio viral
9. 🚀 **@render-master** - Renderização
10. 🤖 **@algorithm-hacker** - Otimização algoritmo
11. 💬 **@engagement-engineer** - Triggers de engajamento
12. 📈 **@metrics-guru** - Setup de métricas

## Workflow com Sistema de Debate

### FASE 1: ESTRATÉGIA (Debate Inicial)

**1.1 Proposta Inicial**

```
@viral: *viral-strategy
Input: [Objetivo, nicho, audiência, timeline]
Output: Estratégia viral 360°

Exemplo:
"Crescer perfil fitness de 5K para 50K em 3 meses"
```

**1.2 Validação de Trend**

```
@trend-hunter: *hunt-trends [nicho]
Output: Top 10 trends NOW com lifecycle

DEBATE:
@trend-hunter: "Trend #3 'Cozy Cardio' está no pico, 7 dias de janela"
@viral: "Ótimo, mas precisa de twist único para não saturar"
@trend-hunter: "Sugestão: 'Cozy Cardio para homens' - gap no mercado"
CONSENSO: ✅ Usar Cozy Cardio com twist masculino
```

**1.3 Research de Competidores**

```
@research-ninja: *competitor-audit [top 3 competitors]

DEBATE:
@research-ninja: "Competidores focam só em academia. Gap: home workouts"
@viral: "Excelente. Nosso ângulo: Cozy Cardio home para homens"
CONSENSO: ✅ Diferenciação clara definida
```

---

### FASE 2: HOOK (Debate Crítico - Mais Importante)

**2.1 Geração de Hooks**

```
@hook-master: *create-hooks
Input: [Tema aprovado, target audience]
Output: 10 hooks ranqueados

Exemplo output:
Hook 1: "Homens fazem cardio ERRADO" (Score: 95/100)
Hook 2: "Cozy cardio masculino? Funciona" (Score: 88/100)
...Hook 10
```

**2.2 DEBATE DE HOOKS (CRÍTICO)**

```
DEBATE ROUND 1 - Seleção Inicial:
@hook-master: "Hook 1 tem maior score, pattern interrupt forte"
@retention-architect: "Hook 1 retém 82% @3s historicamente"
@algorithm-hacker: "Hook 1 otimiza para algoritmo (controversy)"
@viral: "Hook 1 pode alienar audiência. Hook 2 mais inclusivo"
@metrics-guru: "Dados mostram controversy = +40% engagement"

VOTAÇÃO PONDERADA:
@viral (peso 3): Hook 1
@retention-architect (peso 3): Hook 1
@algorithm-hacker (peso 2): Hook 1
@hook-master (peso 2): Hook 1

RESULTADO: Hook 1 vence (10 pontos vs 3)

DEBATE ROUND 2 - Otimização:
@viral: "Hook 1 + elemento do Hook 2 para suavizar"
@hook-master: "Fusão: 'Homens fazem cardio errado (cozy funciona)'"
@retention-architect: "Melhor! Mantém pattern interrupt + inclusão"
CONSENSO: ✅ Hook final otimizado aprovado
```

**--- SUPERVISION GATE SG-1 + SG-2 (OBRIGATÓRIO) ---**

```
@oalanicolas (supervisor) avalia SG-1:
  - Hook tem Voice DNA? Soa humano ou genérico?
  - Fontes de referência são ouro ou bronze?
  - Hook reflete autenticidade do criador/marca?
  → APPROVE: "Hook autêntico, Voice DNA presente"
  → VETO: "Hook genérico, falta DNA. Corrigir: [ação]"

@pedro-valerio (supervisor) avalia SG-2:
  - Debate de hook seguiu regras? Todos participaram?
  - Votação ponderada aplicada corretamente?
  - Vetos foram justificados e endereçados?
  → APPROVE: "Processo íntegro, zero caminhos errados"
  → VETO: "Falha: [agentes não participaram/gate pulado]. Fix: [ação]"

Gate Result: PASS (ambos APPROVE) | BLOCKED (qualquer VETO)
Se BLOCKED → resolver antes de prosseguir para Fase 3
```

---

### FASE 3: ROTEIRO (Debate de Estrutura)

**3.1 Criação do Roteiro**

```
@script-architect: *viral-script
Input: [Hook aprovado, estratégia, tema]
Output: Roteiro completo com timing

[0-3s] HOOK: "Homens fazem cardio ERRADO (cozy funciona)"
[3-10s] SETUP: "Todo mundo diz que cardio masculino é intenso..."
[10-40s] BODY: Demonstração de cozy cardio + benefícios
[40-55s] PAYOFF: "Resultado: perdi 10kg em 60 dias"
[55-60s] CTA: "Qual você vai testar? Comenta 👇"
```

**3.2 DEBATE DE ESTRUTURA**

```
DEBATE:
@storyteller: "Estrutura PAS funciona, mas BAB retém +14%"
@script-architect: "BAB (Before-After-Bridge) aqui:
  [0-10s] Before: corpo atual
  [10-30s] After: resultado visual
  [30-50s] Bridge: como fiz (cozy cardio)
  [50-60s] CTA"
@retention-architect: "BAB otimiza payoff timing, apoio"
@viral: "Concordo, transformation visual é viral"

VOTAÇÃO:
Unanimidade para BAB structure

CONSENSO: ✅ Roteiro restructurado com BAB
```

**3.3 Validação de Tension Curve**

```
@retention-architect: *tension-curve
Output: Curva de tensão otimizada

DEBATE:
@retention-architect: "Payoff aos 45s, não 40s (dados mostram)"
@script-architect: "Ajustando: payoff 45-55s"
CONSENSO: ✅ Timing ajustado
```

**--- SUPERVISION GATE SG-3 (OBRIGATÓRIO) ---**

```
@oalanicolas (supervisor) avalia SG-3:
  - Script tem a Trindade? (Playbook + Framework + Swipe File)
  - Voice DNA aplicado no roteiro? Soa como o criador/marca?
  - Fontes de referência são ouro?
  → APPROVE: "Script autêntico, Trindade presente"
  → VETO: "Falta [Playbook/Framework/Swipe]. Fix: [ação]"

@pedro-valerio (supervisor) avalia:
  - Handoff hook→script correto?
  - Estrutura segue template validado?
  → APPROVE: "Processo OK"
  → CONCERN: "Observação: [nota]"

Gate Result: PASS | BLOCKED
```

---

### FASE 4: VISUAL (Debate de Design)

**4.1 Conceito Visual**

```
@visual-impact: *visual-hook
Input: [Hook, script]
Output: Conceito visual impactante

Proposta:
- Split screen Before/After
- High contrast (black bg, white subject)
- Gold accent 8% (CTAs)
```

**4.2 DEBATE VISUAL**

```
DEBATE:
@visual-impact: "Split screen dramático, contraste máximo"
@color-psychologist: "8% gold ONLY no CTA final, crítico"
@layout-architect: "Rule of thirds: sujeito à direita, espaço negativo esquerda"
@thumbnail-king: "Thumbnail: close-up facial shocked expression"

VALIDAÇÕES:
@color-psychologist: ✅ "8% rule respeitado"
@layout-architect: ✅ "Composição mobile-optimized"
@thumbnail-king: ✅ "Thumbnail stands out em feed"

CONSENSO: ✅ Conceito visual aprovado
```

**4.3 Motion Design**

```
@motion-master: *viral-motion
Output: Motion patterns

DEBATE:
@motion-master: "Kinetic typography hook, smooth transitions body"
@animation-pro: "Spring animations 60fps, 0.3s hook cuts"
@retention-architect: "Pacing: 0.3s hook, 1s body, 0.3s CTA"

CONSENSO: ✅ Motion strategy aprovada
```

**--- SUPERVISION GATE SG-4 (OBRIGATÓRIO) ---**

```
@pedro-valerio (supervisor) avalia SG-4:
  - Handoff script→visual tem checklist?
  - 8% gold rule verificado por @color-psychologist?
  - Todos agentes de design participaram?
  - Gates visuais cumpridos (mobile-optimized, thumbnail)?
  → APPROVE: "Processo visual íntegro"
  → VETO: "Handoff sem checklist / gate pulado. Fix: [ação]"

Gate Result: PASS | BLOCKED
```

---

### FASE 5: IMPLEMENTAÇÃO (Debate Técnico)

**5.1 Arquitetura Remotion**

```
@remotion-architect: *remotion-architecture
Output: Estrutura do projeto

Proposta:
/src
  /compositions/CozyCardio.tsx
  /components/Hook.tsx, Body.tsx, CTA.tsx
  /utils/animations.ts, colors.ts
```

**5.2 DEBATE TÉCNICO**

```
DEBATE:
@remotion-architect: "Component architecture modular, reusável"
@react-wizard: "TypeScript strict, props interface clara"
@animation-pro: "Custom hooks para animações compartilhadas"
@render-master: "Otimizar para Instagram: 1080x1920, h264, CRF 23"

VALIDAÇÕES:
@remotion-architect: ✅ "Architecture scalable"
@react-wizard: ✅ "Type-safe"
@render-master: ✅ "Instagram-optimized"

CONSENSO: ✅ Implementação aprovada
```

**5.3 Implementação de Animações**

```
@animation-pro: *spring-animation + *interpolate-master
@effects-master: *transitions-lib

DEBATE:
@animation-pro: "Spring config: damping 12, stiffness 200"
@effects-master: "Fade transitions entre sections"
@remotion-architect: "Performance: 60fps mantido?"
@animation-pro: "Sim, testado localmente"

CONSENSO: ✅ Animações implementadas
```

**5.4 Audio Design**

```
@sound-designer: *trending-audio + *sound-effects

DEBATE:
@sound-designer: "Trending audio: 'Gym motivation track X' (2M uses)"
@viral: "Audio alinhado com cozy concept? Pode confundir"
@sound-designer: "Alternativa: Lo-fi beat (cozy vibe) + whoosh SFX"
@retention-architect: "Lo-fi mantém consistência, melhor"

CONSENSO: ✅ Lo-fi beat + SFX aprovado
```

---

### FASE 6: OTIMIZAÇÃO (Debate de Algoritmo)

**6.1 Otimização para Algoritmo**

```
@algorithm-hacker: *algorithm-optimize

Output:
- Caption hook otimizado
- 3-5 hashtags relevantes
- Timing de post
- Post-publish actions
```

**6.2 DEBATE DE ALGORITMO**

```
DEBATE:
@algorithm-hacker: "Postar terça 7am, 3 hashtags:
  #cozycardio #menfitness #homeworkout"
@viral: "Adicionar #transformation? 2.4M posts"
@algorithm-hacker: "Sim, mas limite 4 total. Remove #homeworkout"
@metrics-guru: "#transformation performa +30% reach no nicho"

CONSENSO: ✅ Hashtags finais:
  #cozycardio #menfitness #transformation #cardio
```

**6.3 Engagement Engineering**

```
@engagement-engineer: *comment-bait + *save-moments

DEBATE:
@engagement-engineer: "CTA: 'Team Cozy ou Team Intense? Comenta' +
  Save-moment: checklist visual aos 45s"
@algorithm-hacker: "Comment-bait + save = duplo boost algoritmo"
@viral: "Perfeito, maximiza sinais de ranking"

CONSENSO: ✅ Engagement tactics aprovadas
```

---

### FASE 7: REVIEW FINAL (Debate de Qualidade)

**7.1 Review Multidisciplinar**

```
CADA AGENTE REVISA:

@viral: ✅ "Estratégia viral sólida, potencial 500K-2M views"
@hook-master: ✅ "Hook retém >80% @3s (projeção)"
@retention-architect: ✅ "Pacing otimizado, completion >50%"
@visual-impact: ✅ "Visual para scroll imediatamente"
@algorithm-hacker: ✅ "Otimizado para algoritmo 2025"
@engagement-engineer: ✅ "Triggers de engajamento integrados"
@metrics-guru: ✅ "Métricas tracking configurado"

DEBATE FINAL:
"Alguma objeção ao lançamento?"
Nenhuma objeção levantada.

CONSENSO SQUAD: ✅ Squad aprova para renderização
```

**--- SUPERVISION GATE SG-5 (OBRIGATÓRIO — AMBOS SUPERVISORES) ---**

```
@oalanicolas (supervisor) avalia SG-5:
  - Conteúdo final é autêntico? Soa humano?
  - Voice DNA consistente do hook ao CTA?
  - Curadoria foi respeitada em todo o processo?
  - Teste cego: pessoas identificariam como IA?
  → APPROVE: "Conteúdo autêntico, DNA Mental íntegro"
  → VETO: "Problema de autenticidade em [fase]. Fix: [ação]"

@pedro-valerio (supervisor) avalia SG-5:
  - TODOS os gates anteriores (SG-1 a SG-4) foram PASS?
  - Processo completo foi seguido? Zero steps pulados?
  - Debates obrigatórios todos realizados?
  - Handoffs todos com checklist?
  → APPROVE: "Processo íntegro, zero caminhos errados"
  → VETO: "Gate [SG-N] não foi cumprido. Fix: [ação]"

Gate Result: PASS (AMBOS APPROVE) | BLOCKED (qualquer VETO)
Se BLOCKED → resolver antes de renderizar
```

**7.2 Renderização**

```
@render-master: *render-optimize

Settings:
- Format: MP4 (h264)
- Resolution: 1080x1920
- FPS: 60
- CRF: 23 (Instagram optimized)
- Audio: 192kbps

DEBATE:
@render-master: "Render estimate: 5 min"
@remotion-architect: "Quality check pós-render obrigatório"
@visual-impact: "Validar cores no mobile device"

CONSENSO: ✅ Render iniciado
```

---

**--- SUPERVISION GATE SG-6 (OBRIGATÓRIO — PRE-LAUNCH) ---**

```
@pedro-valerio (supervisor) avalia SG-6:
  - SG-1: PASS? SG-2: PASS? SG-3: PASS? SG-4: PASS? SG-5: PASS?
  - Render quality check realizado?
  - Todos deliverables prontos?
  - Post-publish checklist existe?
  → APPROVE: "Launch autorizado. Todos gates PASS."
  → VETO: "Gate [SG-N] pendente. Resolver antes de lançar."

Gate Result: PASS → prosseguir para lançamento | BLOCKED → resolver
```

---

### FASE 8: LANÇAMENTO (Debate de Distribuição)

**8.1 Estratégia de Lançamento**

```
@growth-hacker: *growth-plan

Plano:
1. Post orgânico terça 7am
2. Share to Story com poll
3. DM para 20 engaged followers
4. Reply comments primeiros 30min
5. Se >100K views em 24h → paid boost
```

**8.2 DEBATE DE DISTRIBUIÇÃO**

```
DEBATE:
@growth-hacker: "Se viralizar (>500K), boost $50 para lookalike"
@viral: "Concordo, mas só se save rate >8%"
@algorithm-hacker: "Save rate >8% = algoritmo já distribuindo bem"
@metrics-guru: "Correto, boost só se stagnating após 48h"

CONSENSO: ✅ Estratégia de boost condicional aprovada
```

**8.3 Métricas de Sucesso**

```
@metrics-guru: *viral-metrics

Targets:
- Views: >200K (2x followers)
- Retention @3s: >75%
- Save rate: >8%
- Share rate: >3%
- Profile visits: >15K
- New follows: >2K

DEBATE:
"Targets realistas?"
@viral: "Sim, baseado em benchmark do nicho"
@metrics-guru: "Histórico apoia essas projeções"

CONSENSO: ✅ Targets definidos, tracking ativo
```

---

## Output Final

### Deliverables

1. ✅ Vídeo renderizado (MP4 1080x1920 60fps)
2. ✅ Thumbnail otimizado
3. ✅ Caption completa com hashtags
4. ✅ Timing de post definido
5. ✅ Post-publish checklist
6. ✅ Métricas tracking configurado

### Tempo Total

- Fase 1-2: 1 dia (estratégia + hooks)
- Fase 3-4: 1 dia (roteiro + visual)
- Fase 5: 1-2 dias (implementação)
- Fase 6-7: 0.5 dia (otimização + review)
- **Total: 3.5-4.5 dias**

---

## Sistema de Debate + Supervisão - Resumo

### Pontos de Debate Obrigatórios

1. ✅ Seleção de trend (Fase 1)
2. ✅ Escolha de hook (Fase 2) - CRITICO → **SG-1 + SG-2**
3. ✅ Estrutura de roteiro (Fase 3) → **SG-3**
4. ✅ Conceito visual (Fase 4) → **SG-4**
5. ✅ Arquitetura técnica (Fase 5)
6. ✅ Otimização de algoritmo (Fase 6)
7. ✅ Review final de qualidade (Fase 7) → **SG-5 (ambos supervisores)**
8. ✅ Pre-launch gate → **SG-6**
9. ✅ Estratégia de distribuição (Fase 8)

### Supervision Gates

| Gate | Após       | @oalanicolas           | @pedro-valerio    |
| ---- | ---------- | ---------------------- | ----------------- |
| SG-1 | Hook       | Voice DNA? Autêntico?  | —                 |
| SG-2 | Hook       | —                      | Debate correto?   |
| SG-3 | Roteiro    | Trindade? Fontes ouro? | Handoffs OK?      |
| SG-4 | Visual     | —                      | Gates visuais?    |
| SG-5 | Review     | Conteúdo autêntico?    | Processo íntegro? |
| SG-6 | Pre-Launch | —                      | Todos gates PASS? |

### Pesos de Votação (Squad)

- **Peso 3x:** @viral, @retention-architect, @metrics-guru
- **Peso 2x:** @hook-master, @visual-impact, @thumbnail-king, @algorithm-hacker, @engagement-engineer, @remotion-architect, @growth-hacker
- **Peso 1.5x:** @motion-master, @animation-pro, @sound-designer
- **Peso 1x:** Demais agentes

### Hierarquia de Decisão

```
1. SUPERVISORES (VETO = workflow PARA)
   @oalanicolas → autenticidade, DNA Mental
   @pedro-valerio → processo, quality gates
2. SQUAD VOTE (maioria ponderada >60%)
   @viral pode vetar por motivo estratégico
3. DATA TRUMPS OPINION
   @metrics-guru dados sempre pesam mais
```

---

**Workflow supervisionado por @oalanicolas (autenticidade) e @pedro-valerio (processo) para garantir qualidade máxima!**
