# 📺 Content Series Launch Workflow

## Objetivo

Lançar série de vídeos virais coordenada (10-20 vídeos) com tema unificado para crescimento consistente.

**Tempo:** 2 semanas (planning + batch production)
**Output:** 10-20 vídeos prontos + schedule + amplification plan

---

## Quando Usar

- Quer crescer rápido com conteúdo consistente
- Tem tema com múltiplos ângulos
- Quer dominar um tópico no algoritmo
- Precisa batch production eficiente

---

## Agentes Envolvidos

**Lead:** @viral (Chief Viral Strategist)
**Core Team:**

- @viral-topics (Content Idea Generator)
- @script-architect (Viral Script Writer)
- @retention-architect (Retention Optimization Expert)
- @remotion-architect (Remotion Architecture Expert)
- @metrics-guru (Viral Metrics Analyst)
- @growth-hacker (Viral Growth Specialist)

**Supporting:**

- @trend-hunter, @hook-master, @visual-impact, @algorithm-hacker

---

## Fase 1: Series Strategy (2-3 dias)

### 1.1 Theme Selection

**⚡ PONTO DE DEBATE OBRIGATÓRIO**

```
PROPOSTA INICIAL (@viral-topics):
- Tema 1: "10 Erros Fatais de [nicho]" (listicle series)
- Tema 2: "0 a [resultado] em 30 dias" (transformation series)
- Tema 3: "Vida Real de [profissão]" (day-in-life series)

DEBATE:
@viral: "Tema 2 tem maior potential de save (tutorial value)"
@metrics-guru: "Dados: transformation series = 85% retention avg"
@algorithm-hacker: "Tema 2 otimiza para watch time (séries longas)"
@growth-hacker: "Tema 1 gera mais shares (controversy)"
@trend-hunter: "Tema 2 surfando trend atual de accountability"

VOTAÇÃO PONDERADA:
@viral (peso 3x): Tema 2
@metrics-guru (peso 3x): Tema 2
@algorithm-hacker (peso 2x): Tema 2
@growth-hacker (peso 2x): Tema 1

RESULTADO: Tema 2 vence (9 vs 2 pontos)

CONSENSO: ✅ "0 a [resultado] em 30 dias" transformation series
```

### 1.2 Series Architecture

**Estrutura da Série:**

```
Episode 1: "Dia 0 - O Começo" (setup + hook)
Episodes 2-5: Semanas 1-4 (journey)
Episode 6: "Dia 30 - Resultados" (payoff)
Episode 7: "Bastidores" (bonus content)
```

**Total:** 7 vídeos core + 3-5 suplementares = 10-12 vídeos

### 1.3 Release Strategy

**⚡ PONTO DE DEBATE**

```
OPÇÕES:
A) Daily release (7 dias consecutivos)
B) 3x/semana (2-3 semanas)
C) Binge drop (todos de uma vez)

DEBATE:
@algorithm-hacker: "Daily = algoritmo favorece consistency"
@growth-hacker: "Daily = momentum viral máximo"
@retention-architect: "Daily pode saturar audiência"
@metrics-guru: "Dados: 3x/semana = 15% mais engagement por vídeo"

VOTAÇÃO:
Maioria: 3x/semana (Mon/Wed/Fri)

CONSENSO: ✅ Release 3x/semana por 2-3 semanas
```

---

## Fase 2: Batch Content Planning (2 dias)

### 2.1 Series-Level Hooks

**@hook-master cria hooks coordenados:**

```
Ep 1 Hook: "Vou transformar X em Y em 30 dias"
Ep 2-5 Hooks: "Dia [N] - [challenge específico]"
Ep 6 Hook: "Resultados finais após 30 dias"
```

### 2.2 Script Templates

**@script-architect cria template reusável:**

```markdown
TEMPLATE EPISODE:
[0-3s] Hook + Day counter
[3-15s] Recap episódio anterior (Ep 2+)
[15-45s] Challenge/Progress do dia
[45-55s] Cliffhanger próximo episódio
[55-60s] CTA (follow para continuar)

PATTERN: Hook > Recap > Progress > Cliffhanger > CTA
```

### 2.3 Visual System

**@visual-impact define identidade visual:**

- Day counter sempre top-left (gold #C9B298)
- Progress bar always bottom (0-100%)
- Episode number branding
- Consistent transitions entre episodes

---

## Fase 3: Batch Production (5-7 dias)

### 3.1 Remotion Setup

**@remotion-architect:**

```typescript
// series-template.tsx
export const SeriesEpisode: React.FC<{
  episodeNumber: number;
  dayNumber: number;
  progress: number;
  content: EpisodeContent;
}> = ({ episodeNumber, dayNumber, progress, content }) => {
  return (
    <AbsoluteFill>
      {/* Day Counter Component */}
      <DayCounter day={dayNumber} />

      {/* Progress Bar Component */}
      <ProgressBar progress={progress} />

      {/* Episode Content */}
      <EpisodeContent {...content} />

      {/* Series Branding */}
      <SeriesBranding episode={episodeNumber} />
    </AbsoluteFill>
  );
};
```

### 3.2 Produção em Lote

**Workflow:**

1. Gravar todo conteúdo em 2-3 dias (batch filming)
2. Editar usando template Remotion (2 dias)
3. Render all episodes (1 dia)
4. Quality check batch (1 dia)

**@render-master otimiza:**

- Parallel rendering (múltiplos vídeos simultâneos)
- Cloud rendering se necessário
- Automated quality checks

---

## Fase 4: Pre-Launch Optimization (2 dias)

### 4.1 Caption Strategy

**@copy-wizard cria caption series:**

```
Ep 1: "Vou documentar TUDO nos próximos 30 dias"
Ep 2-5: "Dia [N]/30 - [update específico]"
Ep 6: "Resultados finais que ninguém esperava"
```

**Pattern:** Curiosity + accountability + cliffhanger

### 4.2 Cross-Episode Links

**@engagement-engineer:**

- Ep 1 menciona: "Acompanhe os próximos 30 dias"
- Eps intermediários: "Viu episódio anterior? Link na bio"
- Ep final: "Assista do início (link na bio)"

### 4.3 Hashtag Strategy

**@algorithm-hacker:**

```
Core hashtags (todos vídeos):
#[tema]challenge #30daychallenge #[nicho]

Variações por episódio:
Ep 1: #day0 #começando
Eps 2-5: #progress #journey
Ep 6: #resultados #transformation
```

---

## Fase 5: Launch Execution (2-3 semanas)

### 5.1 Release Calendar

**Schedule exemplo (3x/semana):**

```
Semana 1:
- Segunda: Ep 1 (setup)
- Quarta: Ep 2 (dia 7)
- Sexta: Ep 3 (dia 14)

Semana 2:
- Segunda: Ep 4 (dia 21)
- Quarta: Ep 5 (dia 28)
- Sexta: Ep 6 (resultados)

Semana 3:
- Segunda: Ep 7 (bastidores)
```

### 5.2 Post-Publish Ritual

**Cada episódio:**

```
0-30min:
- Reply ALL comments
- Pin top comment teasing next episode
- Story com poll sobre progress

30min-2h:
- DM engaged followers
- Cross-post to Feed (if Reels)
- Monitor velocity

2h-24h:
- Respond novos comments
- Share UGC reactions
- Prepare next episode hype
```

### 5.3 Cross-Promotion

**@growth-hacker:**

- Story countdown antes de cada episode
- Carrossel Feed com recap série (mid-season)
- Collab com creators no mesmo nicho
- Playlist/guide com todos episodes

---

## Fase 6: Performance Tracking (durante série)

### 6.1 Episode-by-Episode Metrics

**@metrics-guru tracks:**

| Episode | Views | Save% | Share% | Retention @3s | Viral Coef |
| ------- | ----- | ----- | ------ | ------------- | ---------- |
| Ep 1    | ?     | ?     | ?      | ?             | ?          |
| Ep 2    | ?     | ?     | ?      | ?             | ?          |
| ...     | ...   | ...   | ...    | ...           | ...        |

### 6.2 Real-Time Optimization

**Se métricas caem:**

```
TRIGGER: Episode N tem -20% vs Episode N-1

DEBATE URGENTE:
@retention-architect: "Drop at [timestamp] - ajustar próximo"
@viral: "Hook não suficientemente forte"
@algorithm-hacker: "Timing sub-ótimo, ajustar próximo release"

AÇÃO: Fix episódios restantes antes release
```

### 6.3 Viral Amplification

**Se episode viraliza (>1M views):**

```
AÇÃO IMEDIATA:
1. Pin comment linking previous episodes
2. Create compilation Reel (best moments)
3. Story highlights com série completa
4. Paid boost top performing episode
5. Repurpose para outros formatos (YT, TikTok)
```

---

## Fase 7: Post-Series Growth (1 semana após)

### 7.1 Series Recap

**@script-architect cria:**

- Compilation vídeo (5-10min)
- "O que aprendi" reflection vídeo
- Behind-the-scenes bloopers

### 7.2 Community Engagement

**@engagement-engineer:**

- Poll: "Qual episode favorito?"
- Challenge: "Faça seu próprio 30 day"
- UGC: Regram followers fazendo challenge

### 7.3 Series Analytics Report

**@metrics-guru:**

```markdown
SERIES PERFORMANCE REPORT

Total Series Views: [X]M
Total New Followers: +[Y]K
Best Episode: Ep [N] ([Z]M views)
Worst Episode: Ep [N] ([Z]K views)

Insights:

- Hook pattern X performed melhor
- Release timing Y otimizado
- Tema Z teve maior engagement

Recommendations para próxima série:

1. [Action item 1]
2. [Action item 2]
3. [Action item 3]
```

---

## Sistema de Debate

### Pontos de Debate Obrigatórios

1. ✅ **Theme selection** (crítico)
2. ✅ **Release strategy** (timing)
3. **Hook coordination** (consistency)
4. **Visual identity** (branding)
5. **Mid-series pivot** (se necessário)

### Regras de Consenso

- **Theme:** Unanimidade preferencial (impacta toda série)
- **Release timing:** Maioria ponderada >60%
- **Real-time fixes:** Decisão rápida (<2h)
- **Veto power:** @viral pode vetar com dados

---

## Checklist Final

### Pre-Launch

- [ ] 10-20 vídeos produzidos
- [ ] Template Remotion testado
- [ ] Release calendar definido
- [ ] Captions batch escritas
- [ ] Thumbnails batch criados
- [ ] Cross-promotion plan ready
- [ ] Analytics tracking setup

### During Launch

- [ ] Post-publish ritual cada episódio
- [ ] Métricas tracked daily
- [ ] Community engagement ativo
- [ ] Real-time optimization se necessário

### Post-Launch

- [ ] Series recap criado
- [ ] Analytics report gerado
- [ ] Learnings documentados
- [ ] Next series planned

---

## Benchmarks de Sucesso

### Series-Level Metrics

| Métrica                 | Bom | Viral | Mega Viral |
| ----------------------- | --- | ----- | ---------- |
| Total Series Views      | 5M  | 20M   | 50M+       |
| New Followers           | +5K | +20K  | +50K+      |
| Series Completion Rate  | 40% | 60%   | 80%+       |
| Avg Episode Save Rate   | 6%  | 10%   | 15%+       |
| Cross-Episode Retention | 50% | 70%   | 85%+       |

### Episode-Level Metrics

| Métrica       | Target |
| ------------- | ------ |
| Views         | >500K  |
| Save Rate     | >8%    |
| Share Rate    | >3%    |
| Retention @3s | >75%   |

---

## Tempo Total: 2 semanas + 2-3 semanas launch

**Breakdown:**

- Strategy & Planning: 4-5 dias
- Batch Production: 5-7 dias
- Launch Execution: 14-21 dias (3x/semana)
- Post-Series: 3-5 dias

**Total commitment:** 4-5 semanas completas

---

## Pro Tips

### Do's ✅

- Batch produce tudo antes do launch
- Maintain consistent visual identity
- Cross-promote cada episódio
- Track métricas episode-by-episode
- Engage community durante série

### Don'ts ❌

- Não lançar sem batch production completo
- Não mudar visual identity mid-series
- Não skip post-publish ritual
- Não ignore métricas drop
- Não esquecer series recap

---

## Casos de Uso

### Caso 1: Growth de 10K para 50K

- Série de 15 vídeos (3 semanas)
- Release 5x/semana (aggressive)
- Expected: +30K-40K followers

### Caso 2: Autoridade em Nicho

- Série educacional (20 vídeos)
- Release 3x/semana (2 meses)
- Expected: Posicionamento como expert

### Caso 3: Product Launch

- Série de 7 vídeos (build-up + launch)
- Release daily (1 semana)
- Expected: High conversion

---

**Este workflow garante crescimento consistente através de conteúdo coordenado e batch production eficiente.** 📺🚀
