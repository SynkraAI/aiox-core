# Session Learning — ping-pong-cross-ai-test

**Data**: 2026-04-08 20:12
**Sessão**: Teste completo do skill code-review-ping-pong com 3 escopos paralelos (ffmpeg-cutter, atomize-content, ping-pong-meta) usando cross-AI real (Codex review + Claude Code fix)
**Artefatos analisados**: 12
**Findings**: 7 total (2 alta, 3 média, 2 baixa prioridade)

---

## Findings

### [PATTERN] Handoff contracts inconsistentes são o bug #1 em specs multi-agent

**Causa**: Em todos os 3 escopos revisados, o padrão mais recorrente de issue foi inconsistência nos contratos de handoff — nomenclaturas divergentes (reels_tiktok vs shorts/reels), targets errados (format-cut direto vs curate-data), schemas incompatíveis (min:seg vs HH:MM:SS).
**Ação**: O Codex encontrou handoff mismatches em 3/3 escopos. Cada fix exigiu alinhar nomenclaturas, criar boundary docs, e corrigir targets.
**Resultado esperado**: Criar checklist de "boundary contract" como item padrão em reviews futuros, prevenindo que specs multi-agent saiam sem contrato de handoff validado.
**Artefato alvo**: `skills/code-review-ping-pong/SKILL.md`
**Melhoria proposta**:

Adicionar na seção de Goals do `session.md` template uma linha obrigatória:

```markdown
- Contratos de handoff: nomenclaturas, schemas e targets downstream são consistentes e verificáveis?
```

**Status atual (auditado)**: Parcialmente endereçado. Os 3 escopos tiveram handoff fixes aplicados. Delta: a lição não está generalizada como regra do skill.
**Prioridade**: alta

---

### [PATTERN] Skills que se auto-melhoram durante teste são o melhor tipo de meta-teste

**Causa**: O ping-pong-meta (meta-teste) identificou que o modo CRITICA não tinha template, a state machine estava incompleta, e os banners faltavam. Esses foram corrigidos DURANTE o teste, e o próximo round já usou as melhorias.
**Ação**: O skill ganhou critica-template.md, 4 modos declarados, e state machine completa — tudo criado por ele mesmo ser testado.
**Resultado esperado**: Documentar o padrão "meta-teste auto-corretivo" como estratégia recomendada para validar skills complexos.
**Artefato alvo**: `skills/code-review-ping-pong/SKILL.md`
**Melhoria proposta**:

Adicionar seção no final do SKILL.md:

```markdown
## Meta-Teste Recomendado

Para validar este skill, rode um ciclo ping-pong no próprio SKILL.md + templates (scope: ping-pong-meta).
O meta-teste é especialmente valioso porque corrige inconsistências internas durante a execução,
garantindo que o skill esteja auto-consistente antes de revisar código de terceiros.
```

**Status atual (auditado)**: Não endereçado. O meta-teste aconteceu mas não está documentado como prática.
**Prioridade**: média

---

### [GAP] validate.cjs e orchestrate.cjs não reconhecem o modo CRITICA

**Causa**: A CRITICA do escopo ping-pong-meta identificou que `validate.cjs` e `orchestrate.cjs` podem não reconhecer o novo modo CRITICA e o valor `critica` no enum de `next_mode`.
**Ação**: Os scripts ficaram fora do escopo dos 4 rounds de review. O SKILL.md define CRITICA como passo manual (não automatizado), mas os scripts de automação podem rejeitar artefatos do tipo critica.
**Resultado esperado**: Verificar e atualizar validate.cjs para aceitar `type: critica` no frontmatter YAML e orchestrate.cjs para reconhecer `WAITING_FOR_CRITICA` como estado válido.
**Artefato alvo**: `.code-review-ping-pong/validate.cjs`
**Melhoria proposta**:

Verificar se validate.cjs aceita frontmatter `type: critica` e se orchestrate.cjs reconhece `cycle_state: WAITING_FOR_CRITICA`. Se não, adicionar ambos como valores válidos nos enums correspondentes.

**Status atual (auditado)**: Não endereçado. Ficou como blind spot da CRITICA.
**Prioridade**: alta

---

### [DECISION] curate-data.md pode ser o target errado para candidatos de corte de vídeo

**Causa**: A CRITICA do atomize-content identificou que `curate-data.md` é uma task de enriquecimento com dados externos (busca notícias/stats), não de ingestão de candidatos de corte.
**Ação**: O handoff boundary aponta para curate-data como primeiro passo após atomize-content, mas o caminho correto pode ser `mine-transcript` ou uma task nova `ingest-cut-candidates`.
**Resultado esperado**: Definir o target correto no curator pipeline para candidatos de corte de vídeo, evitando confusão de pipeline.
**Artefato alvo**: `squads/curator/tasks/curate-data.md`
**Melhoria proposta**:

Investigar se `mine-transcript.md` aceita `cortes-video.yaml` como input alternativo. Se não, considerar criar `ingest-cut-candidates.md` como task intermediária entre atomize-content e format-cut.

**Status atual (auditado)**: Não endereçado. Identificado como blind spot, não bloqueante.
**Prioridade**: média

---

### [FRICTION] Frontmatter da versão distillery de atomize-content usa formato não-YAML

**Causa**: `squads/video-content-distillery/tasks/atomize-content.md` usa cabeçalho Markdown com `**Task ID:**`, `**Version:**` etc. em vez de frontmatter YAML padrão.
**Ação**: O Kaizen frontmatter audit identifica que este formato não é parseável por ferramentas automatizadas que esperam YAML frontmatter (`---`).
**Resultado esperado**: Converter para frontmatter YAML padrão, mantendo compatibilidade com o ecossistema.
**Artefato alvo**: `squads/video-content-distillery/tasks/atomize-content.md`
**Melhoria proposta**:

Substituir o cabeçalho Markdown por frontmatter YAML:

```yaml
---
name: atomize-content
description: "Break pillar content into 30-64+ atomic pieces for multi-platform distribution"
task_id: content-distillery/atomize-content
version: "1.0.0"
status: production-ready
category: content-derivation-workflow
---
```

**Status atual (auditado)**: Não endereçado.
**Prioridade**: baixa

---

### [PATTERN] Scoped sessions paralelas validadas como padrão de trabalho

**Causa**: 3 escopos rodaram em paralelo sem colisão, cada um com seu diretório isolado de rounds, session.md e next-step.md.
**Ação**: O padrão funcionou perfeitamente: ffmpeg-cutter fechou em 3 rounds enquanto os outros precisaram de 4, sem interferência.
**Resultado esperado**: Documentar como caso de uso validado para equipes que querem rodar múltiplos reviews simultâneos.
**Artefato alvo**: `skills/code-review-ping-pong/SKILL.md`
**Melhoria proposta**:

O SKILL.md já documenta scoped sessions. Finding descartável — apenas registrar como pattern validado.

**Status atual (auditado)**: Totalmente endereçado. Scoped sessions já documentadas e funcionando.
**Prioridade**: baixa

---

### [DECISION] --no-critica sem rastreabilidade é lacuna de auditoria

**Causa**: A CRITICA do ping-pong-meta identificou que `--no-critica` é indistinguível de um bypass manual em next-step.md — não há campo `skipped_by` ou `skip_reason`.
**Ação**: Se um operador pular a CRITICA manualmente editando next-step.md, não há registro de quem ou por quê.
**Resultado esperado**: Adicionar campo `critica_skipped_by` e `critica_skip_reason` ao schema de next-step.md quando CRITICA é pulada.
**Artefato alvo**: `skills/code-review-ping-pong/SKILL.md`
**Melhoria proposta**:

Adicionar ao schema de next-step.md na seção CRITICA:

```yaml
# Quando CRITICA é pulada:
critica_status: skipped
critica_skipped_by: "user"  # ou "orchestrator"
critica_skip_reason: "--no-critica flag"
```

**Status atual (auditado)**: Não endereçado. Identificado pelo Red Team na CRITICA.
**Prioridade**: média

---

## Como aplicar

1. Revise os findings acima
2. **Remova do checklist abaixo** os findings que NÃO quer aplicar
3. Responda `aplicar` no terminal quando estiver pronto

## Status de Aplicação

- [x] [PATTERN] Handoff contracts — adicionar checklist ao session.md template — `skills/code-review-ping-pong/SKILL.md`
- [x] [PATTERN] Meta-teste auto-corretivo — documentar como prática — `skills/code-review-ping-pong/SKILL.md`
- [x] [GAP] validate.cjs não reconhece CRITICA — `.code-review-ping-pong/validate.cjs` (orchestrate.cjs não existe ainda)
- [ ] [DECISION] curate-data.md target errado — investigar — `squads/curator/tasks/curate-data.md` (investigação futura)
- [x] [FRICTION] Frontmatter distillery não-YAML — converter — `squads/video-content-distillery/tasks/atomize-content.md`
- [x] [DECISION] --no-critica sem rastreabilidade — adicionar campos — `skills/code-review-ping-pong/SKILL.md`
