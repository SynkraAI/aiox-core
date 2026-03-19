# 🔄 Viral Replication System Workflow

## Objetivo

Criar sistema escalável que replica sucesso de vídeos virais anteriores, gerando novos vídeos com alta probabilidade de viralização.

**Tempo:** 1-2 semanas (setup + validação)
**Output:** Sistema replicável + 5-10 vídeos validados

---

## Quando Usar

- Você já tem 1+ vídeos virais (>1M views)
- Quer escalar produção mantendo qualidade
- Precisa crescimento previsível
- Quer sistematizar processo criativo

---

## Agentes Envolvidos

**Lead:** @metrics-guru (Viral Metrics Analyst)
**Core Team:**

- @viral (Chief Viral Strategist)
- @retention-architect (Retention Optimization Expert)
- @research-ninja (Competitor Analysis Specialist)
- @remotion-architect (Remotion Architecture Expert)
- @ab-test-master (Split Testing Specialist)

**Supporting:**

- @hook-master, @script-architect, @visual-impact

---

## Fase 1: Viral Video Autopsy (2-3 dias)

### 1.1 Identificar Winners

**@metrics-guru analisa histórico:**

```markdown
VIRAL VIDEOS IDENTIFICADOS:

Video A:

- Views: 5.2M
- Save Rate: 11.3%
- Share Rate: 4.8%
- Retention @3s: 84%
- Viral Coefficient: 2.8

Video B:

- Views: 2.1M
- Save Rate: 9.7%
- Share Rate: 3.2%
- Retention @3s: 78%
- Viral Coefficient: 1.9

Video C:

- Views: 8.5M
- Save Rate: 13.1%
- Share Rate: 5.6%
- Retention @3s: 87%
- Viral Coefficient: 3.4
```

**Critério:** Views >1M + Save Rate >8% + Viral Coef >1.5

### 1.2 Deep Dive Analysis

**⚡ PONTO DE DEBATE OBRIGATÓRIO**

```
PROPOSTA (@metrics-guru):
"Video C é o melhor candidato para replicação (maior viral coef)"

DEBATE:
@viral: "Video C pode ser outlier. Video A mais consistente?"
@retention-architect: "Video C retém 87% @3s - padrão forte"
@research-ninja: "Tema do Video C ainda trending (30 dias)"
@ab-test-master: "Need validação: testar padrão Video C vs A"

VOTAÇÃO PONDERADA:
@metrics-guru (peso 3x): Video C (dados clear)
@viral (peso 3x): Video C (com validação)
@retention-architect (peso 3x): Video C

CONSENSO: ✅ Video C como template base + validar com A/B test
```

### 1.3 Deconstrução Completa

**@viral + @retention-architect:**

```markdown
VIDEO C ANATOMY:

HOOK (0-3s):

- Pattern: Before/After split screen
- Text: "Você está fazendo errado"
- Visual: High contrast, bold claim
- Performance: 87% retention

STRUCTURE (3-60s):

- 3-8s: Problem reveal (why they fail)
- 8-20s: Tension building (consequences)
- 20-45s: Solution reveal (how to fix)
- 45-55s: Proof/Results (credibility)
- 55-60s: CTA (save this)

RETENTION CURVE:

- @3s: 87% (hook holds)
- @10s: 76% (-11% natural)
- @30s: 58% (sustained interest)
- Completion: 43% (strong)

VISUAL PATTERNS:

- Black background (70%)
- White text (22%)
- Gold accents (8% - regra sagrada)
- Kinetic typography (70% screen time)
- Before/After shots (30% screen time)

AUDIO PATTERN:

- Trending audio first 3s
- Voice-over principal (clear, energético)
- Sound effects em transitions (punch)

PSYCHOLOGICAL TRIGGERS:

1. Pattern interrupt (bold claim)
2. Curiosity gap (what they're doing wrong)
3. Authority (proof/results)
4. FOMO (save this / don't miss)
5. Controversy (strong take)
```

---

## Fase 2: Viral Pattern Extraction (2 dias)

### 2.1 Formula Creation

**@viral cria formula replicável:**

```markdown
VIRAL FORMULA (VIDEO C PATTERN):

TEMPLATE:
[Bold Claim] + [Problem Reveal] + [Tension] + [Solution] + [Proof] + [CTA]

TIMING:
0-3s: Bold claim hook
3-8s: Problem reveal
8-20s: Tension building
20-45s: Solution
45-55s: Proof/Results
55-60s: CTA save-worthy

VISUAL:

- Black/White/Gold (8% rule)
- Before/After splits
- Kinetic typography dominante
- High contrast always

AUDIO:

- Trending sound (3s)
- Clear voice-over
- Punch SFX transitions

PSYCHOLOGY:

- Pattern interrupt
- Curiosity gap
- Authority
- FOMO
- Controversy (mild)
```

### 2.2 Remotion Template

**@remotion-architect cria template técnico:**

```typescript
// viral-replication-template.tsx

export const ViralReplicationTemplate: React.FC<{
  hook: HookContent;
  problem: ProblemContent;
  tension: TensionContent;
  solution: SolutionContent;
  proof: ProofContent;
  cta: CTAContent;
}> = ({ hook, problem, tension, solution, proof, cta }) => {
  return (
    <Composition
      id="viral-replication"
      component={ViralVideo}
      durationInFrames={3600} // 60s @ 60fps
      fps={60}
      width={1080}
      height={1920}
    >
      {/* Hook Sequence (0-3s) */}
      <Sequence from={0} durationInFrames={180}>
        <HookComponent {...hook} />
      </Sequence>

      {/* Problem Reveal (3-8s) */}
      <Sequence from={180} durationInFrames={300}>
        <ProblemReveal {...problem} />
      </Sequence>

      {/* Tension Building (8-20s) */}
      <Sequence from={480} durationInFrames={720}>
        <TensionBuilder {...tension} />
      </Sequence>

      {/* Solution (20-45s) */}
      <Sequence from={1200} durationInFrames={1500}>
        <SolutionReveal {...solution} />
      </Sequence>

      {/* Proof/Results (45-55s) */}
      <Sequence from={2700} durationInFrames={600}>
        <ProofComponent {...proof} />
      </Sequence>

      {/* CTA (55-60s) */}
      <Sequence from={3300} durationInFrames={300}>
        <CTAComponent {...cta} />
      </Sequence>
    </Composition>
  );
};

// Reusar componentes do vídeo viral original
const HookComponent = styled(ViralHook)`
  /* Inherit from Video C */
`;
```

### 2.3 Content Variables

**@script-architect identifica variáveis:**

```markdown
VARIABLES (podem mudar):

- Nicho/tema específico
- Problema específico
- Solução específica
- Proof/exemplo específico
- CTA específico

CONSTANTS (não mudam):

- Estrutura temporal
- Visual style (black/white/gold)
- Retention curve target
- Psychological triggers
- Animation patterns
```

---

## Fase 3: Replication Execution (3-5 dias)

### 3.1 Topic Mining

**@viral-topics + @research-ninja:**

```markdown
TOPICS CANDIDATES (seguindo formula):

Topic 1: "Você está editando vídeos errado"

- Problema: Editing mistakes
- Solução: Pro editing tips
- Proof: Before/After examples
- Fit Score: 95/100

Topic 2: "Seu hook está matando seu alcance"

- Problema: Weak hooks
- Solução: Hook frameworks
- Proof: Retention graphs
- Fit Score: 92/100

Topic 3: "Para de usar essas hashtags"

- Problema: Hashtag myths
- Solução: 2025 strategy
- Proof: A/B test results
- Fit Score: 88/100

[Mais 7+ topics...]
```

### 3.2 Batch Production

**Workflow:**

1. Selecionar 5-10 topics (high fit score)
2. Aplicar formula para cada topic
3. Produzir usando Remotion template
4. Manter visual/audio patterns constantes
5. Variar apenas content variables

**@remotion-architect:**

```bash
# Batch render usando template
npm run render-batch -- \
  --template="viral-replication" \
  --topics="topics.json" \
  --output="output/replications/"
```

### 3.3 Quality Control

**@retention-architect verifica:**

- [ ] Hook retém >80% @3s (target Video C)
- [ ] Estrutura temporal idêntica
- [ ] Visual patterns mantidos
- [ ] 8% gold rule respeitado
- [ ] Audio patterns consistentes

---

## Fase 4: Validation & Iteration (1 semana)

### 4.1 A/B Testing

**⚡ PONTO DE DEBATE**

```
STRATEGY (@ab-test-master):
"Lançar 5 vídeos replicated + 2 controles (diferentes formulas)"

DEBATE:
@metrics-guru: "Controles necessários para validação"
@viral: "5 replicas suficiente para pattern confirmation"
@retention-architect: "Need statistical significance (7+ vídeos)"

VOTAÇÃO:
Consenso: 5 replicas + 2 controles

PLANO: Release 1 vídeo/dia por 7 dias
```

**Test Matrix:**

| Video | Type    | Formula   | Expected Perf |
| ----- | ------- | --------- | ------------- |
| R1    | Replica | Video C   | 80%+ @3s      |
| R2    | Replica | Video C   | 80%+ @3s      |
| R3    | Replica | Video C   | 80%+ @3s      |
| R4    | Replica | Video C   | 80%+ @3s      |
| R5    | Replica | Video C   | 80%+ @3s      |
| C1    | Control | Video A   | 75%+ @3s      |
| C2    | Control | Different | Unknown       |

### 4.2 Results Analysis

**@metrics-guru após 7 dias:**

```markdown
REPLICATION RESULTS:

Replicas (Video C formula):

- R1: 5.8M views, 12.1% save, 84% @3s ✅
- R2: 3.2M views, 9.8% save, 81% @3s ✅
- R3: 4.1M views, 10.5% save, 83% @3s ✅
- R4: 2.9M views, 9.1% save, 79% @3s ✅
- R5: 6.2M views, 11.8% save, 86% @3s ✅

Average Replicas:

- Views: 4.4M
- Save Rate: 10.7%
- Retention @3s: 82.6%
- Success Rate: 100% (5/5 viral)

Controls:

- C1: 2.1M views, 8.2% save, 76% @3s
- C2: 890K views, 6.1% save, 71% @3s

CONCLUSION: Formula replicável confirmed! ✅
Replication viability: 100%
Expected performance: 80%+ @3s, >1M views
```

### 4.3 Formula Refinement

**@viral + @metrics-guru:**

```markdown
LEARNINGS FROM REPLICATION:

What Worked:
✅ Estrutura temporal (perfeita)
✅ Visual patterns (consistente)
✅ Hook pattern (strong)
✅ Psychological triggers (efetivo)

What to Improve:
⚠️ Topic selection (fit score >90 only)
⚠️ Audio variation (algumas repetitivas)
⚠️ Proof examples (mais diversos)

REFINED FORMULA v2.0:
[Same structure + learnings aplicados]
```

---

## Fase 5: Scaling System (ongoing)

### 5.1 Production Pipeline

**@viral + @remotion-architect:**

```markdown
WEEKLY PRODUCTION CYCLE:

Monday:

- Topic mining (10+ candidates)
- Fit score analysis
- Select top 5

Tuesday-Wednesday:

- Script todos vídeos (using template)
- Visual assets prep
- Audio sourcing

Thursday:

- Batch production (Remotion)
- Quality control
- Renders

Friday:

- Final review
- Schedule posts (week ahead)
- Prepare captions/hashtags

Weekend:

- Community engagement
- Metrics tracking
- Next week planning
```

### 5.2 Continuous Optimization

**@ab-test-master + @metrics-guru:**

```markdown
MONTHLY OPTIMIZATION CYCLE:

Week 1-2: Test current formula
Week 3: Analyze results
Week 4: Update formula (if needed)

A/B TEST AREAS:

- Hook variations (maintain structure)
- Audio patterns (trending vs custom)
- Proof formats (graphs vs examples)
- CTA variations (save vs share focus)
```

### 5.3 Formula Library

**@viral maintains:**

```markdown
VIRAL FORMULAS LIBRARY:

Formula A (Video C Pattern):

- Success Rate: 100%
- Avg Views: 4.4M
- Best For: Educational/Tutorial

Formula B (Video A Pattern):

- Success Rate: 80%
- Avg Views: 2.8M
- Best For: Transformation stories

Formula C (New Discovery):

- Success Rate: 90%
- Avg Views: 3.6M
- Best For: Controversy/Debate

[Update library mensalmente]
```

---

## Sistema de Debate

### Pontos de Debate Obrigatórios

1. ✅ **Winner video selection** (crítico)
2. ✅ **Replication strategy** (quantity)
3. **Formula adjustments** (learnings)
4. **Topic fit score** (quality control)
5. **Monthly optimization** (continuous)

### Regras de Consenso

- **Video selection:** @metrics-guru tem veto (dados)
- **Formula changes:** Unanimidade (impacta sistema)
- **Topic approval:** Fit score >90 unanimous
- **Scaling decisions:** Maioria ponderada >60%

---

## Checklist Final

### Setup Phase

- [ ] Viral videos identificados (>1M views)
- [ ] Deep dive analysis completo
- [ ] Formula extraída e documentada
- [ ] Remotion template criado
- [ ] Content variables mapeadas

### Validation Phase

- [ ] 5+ replicas produzidas
- [ ] 2+ controles para comparação
- [ ] A/B test executado (7+ dias)
- [ ] Results analysis completo
- [ ] Formula validated (>80% success)

### Scaling Phase

- [ ] Weekly production cycle setup
- [ ] Topic mining process defined
- [ ] Quality control checkpoints
- [ ] Metrics tracking automated
- [ ] Formula library maintained

---

## Benchmarks de Sucesso

### Replication Metrics

| Métrica                  | Target | Elite   |
| ------------------------ | ------ | ------- |
| Replication Success Rate | >80%   | >90%    |
| Avg Views per Replica    | >1M    | >3M     |
| Retention @3s Match      | ±5%    | ±2%     |
| Save Rate Match          | ±2%    | ±1%     |
| Production Velocity      | 5/week | 10/week |

### System Efficiency

| Métrica                   | Target |
| ------------------------- | ------ |
| Time per Video (template) | <4h    |
| Formula Success Rate      | >80%   |
| Monthly Output            | 20+    |
| Quality Consistency       | >90%   |

---

## Tempo Total: 1-2 semanas + ongoing

**Breakdown:**

- Autopsy & Analysis: 2-3 dias
- Pattern Extraction: 2 dias
- Batch Production: 3-5 dias
- Validation: 7 dias
- Scaling: Ongoing (weekly cycle)

---

## Pro Tips

### Do's ✅

- Analise múltiplos viral videos (3+)
- Extraia patterns, não copie conteúdo
- Valide formula com A/B testing
- Documente learnings mensalmente
- Maintain formula library atualizada

### Don'ts ❌

- Não replique sem validação
- Não mude formula sem dados
- Não ignore fit score (<90)
- Não escale antes de validar
- Não copie literalmente (adapte)

---

## Casos de Uso

### Caso 1: Escalar Produção

- Formula validada
- Pipeline: 10 vídeos/semana
- Expected: Crescimento consistente +50K/mês

### Caso 2: Previsibilidade

- Sistema replicável
- Success rate >80%
- Expected: Menos variance, mais controle

### Caso 3: Time Efficiency

- Template reduce produção 70%
- Focus em topic mining (crítico)
- Expected: Mais output, menos tempo

---

**Este workflow transforma sorte em ciência: replique seus virais sistematicamente.** 🔄🚀
