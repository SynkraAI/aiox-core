# Workflow: ICP Validation Gate

## Metadata
- id: icp-validation
- version: 1.0.0
- type: multi-agent
- estimated_time: 10 min
- agents_involved: [@icp-rafael, @icp-camila, @icp-lucas, @icp-ana, @icp-marcos]
- parent_workflow: carousel-creation (Phase 3.7 — apos cover-art-direction)

---

## ENFORCEMENT RULES

**REGRA ABSOLUTA: Este gate valida se o conteudo comunica o PROPOSITO para o ICP. Se <3/5 ICPs engajam, o conteudo NAO publica. Volta pra equipe com feedback.**

---

## Purpose

Simular a reacao de 5 personas ICP reais ao conteudo (capa + slides internos) ANTES de publicar. Cada persona representa um segmento distinto do publico-alvo com dores, ceticismos e comportamentos diferentes. O objetivo e garantir que o conteudo atinge seu proposito definido — nao apenas "fica bonito" ou "parece bom pra nos".

## Principio Central

> **"Auto-explicativo para quem?"**
> O conteudo nao e pra nos que criamos. E pra quem scrollar o feed as 7h da manha com 47 abas mentais abertas. Se os ICPs nao param, nao entendem e nao agem — o conteudo falhou.

---

## Inputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| post_type | string | yes | carousel, static, reel, story |
| post_objective | string | yes | O que este post PRECISA gerar (salvar, compartilhar, comentar, seguir, converter) |
| cover_image | string/path | yes | Descricao ou path da capa |
| slides_content | string/array | yes | Conteudo dos slides internos (ou descricao) |
| headline | string | yes | Copy exata da headline da capa |
| topic | string | yes | Tema do post |
| content_pillar | string | yes | Pilar de conteudo |
| target_awareness | number | yes | Nivel de awareness do post (1-5 Schwartz) |

---

## Pre-Requisitos

Antes de rodar este gate, o conteudo DEVE ter passado por:
- [ ] Phase 2: Copy completa (headline, body, CTA definidos)
- [ ] Phase 3: Visual completo (capa + slides prontos ou descritos)
- [ ] GATE-COVER aprovado (se carrossel com capa gerada)
- [ ] **Objetivo do post CLARAMENTE definido** (nao "engajamento" generico — especificar: "ICP salva o carrossel pra aplicar o metodo amanha")

---

## Step 3.7.1: Definir Objetivo Mensuravel

**Agente**: Orchestrator (Content Engine)
**Tempo**: 1 min

Antes de ativar os ICPs, definir com PRECISAO:

```yaml
objetivo_do_post:
  acao_primaria: "salvar"  # O que MAIS importa
  acao_secundaria: "compartilhar por DM"  # Bonus desejavel
  teste_de_sucesso: "O ICP consegue descrever o metodo em 1 frase apos ler?"
  emocao_target: "clareza — 'ah, e so isso? posso fazer agora'"
  anti_objetivo: "NAO queremos: 'interessante' sem acao. 'Bonito' sem entender."
```

**VETO: Se o objetivo nao estiver definido com clareza, NAO prosseguir. Conteudo sem objetivo claro = validacao impossivel.**

---

## Step 3.7.2: Ativar Agentes ICP (PARALELO)

**Agentes**: Todos os 5 ICPs simultaneamente
**Tempo**: ~5 min (paralelo via Task tool)

### Contexto enviado para TODOS os agentes:

```yaml
briefing:
  post_type: "{post_type}"
  headline: "{headline}"
  cover_description: "{cover_image}"
  slides_summary: "{slides_content}"
  topic: "{topic}"
  perfil_autor: "@tiagoguimaraes — conteudo sobre clareza, decisao e anti-obesidade mental"
  contexto_feed: "Apareceu no seu feed (se segue) ou no Explore (se nao segue)"
  objetivo_declarado: "{objetivo_do_post}"  # Os ICPs NAO veem isso — e pra comparacao pos-avaliacao
```

### Cada ICP responde com:

```yaml
avaliacao:
  visual_50ms: "..."
  leitura_2s: "..."
  decisao: "swipe | scroll | pausa"
  motivo: "..."
  expectativa: "..."
  conteudo_interno: "..."
  acao_final: "salvar | compartilhar | comentar | seguir | ignorar"
  feedback_brutal: "..."
  sugestao: "..."
  score_conexao: N/10
  # Modulos deep (framework clonagem v6.0)
  sistema_imunologico: "Qual camada ativou? (rejeicao_instantanea | ceticismo_ativo | aceitacao_condicional)"
  trigger_ativado: "Qual trigger especifico disparou? (ex: 'template generico', 'framework com numero')"
  blind_spot_relevante: "Algum blind spot afetou esta avaliacao? Qual?"
  tsm_chain: "Qual cadeia TSM descreveu a reacao? (ex: TSM 1: Framework rapido)"
```

---

## Step 3.7.3: Consolidar Resultados

**Agente**: Orchestrator
**Tempo**: 2 min

### Tabela de Resultados

| ICP | Parou? | Swipou? | Entendeu? | Acao | Score | Flag |
|-----|--------|---------|-----------|------|-------|------|
| Rafael (empreendedor) | | | | | /10 | |
| Camila (gestora) | | | | | /10 | |
| Lucas (freelancer) | | | | | /10 | |
| Ana (advogada) | | | | | /10 | |
| Marcos (gestor corp) | | | | | /10 | |

### Metricas Agregadas

```yaml
metricas:
  taxa_parada: N/5  # Quantos pararam no scroll
  taxa_swipe: N/5  # Quantos swiparam
  taxa_acao: N/5  # Quantos tomariam acao (salvar/compartilhar/comentar)
  score_medio: N/10
  objetivo_atingido: N/5  # Quantos fariam a acao_primaria definida no objetivo
  padroes_positivos: ["..."]  # O que funcionou pra maioria
  padroes_negativos: ["..."]  # O que NAO funcionou pra maioria
  persona_mais_dificil: "Ana"  # Quem foi mais resistente
  persona_mais_facil: "Rafael"  # Quem converteu mais rapido
```

---

## GATE-ICP: Validacao de Audiencia

**OBRIGATORIO antes de publicar**

### Criterios de Aprovacao

| Criterio | Threshold | Status |
|----------|-----------|--------|
| Taxa de parada (visual) | >= 3/5 | |
| Taxa de swipe | >= 3/5 | |
| Taxa de acao (salvar/compartilhar) | >= 2/5 | |
| Score medio | >= 6/10 | |
| Objetivo atingido | >= 2/5 fariam acao_primaria | |
| Nenhum "passaria reto" unanime | 0 feedbacks identicos negativos | |

### Status: [GATE-PASS | GATE-FAIL | GATE-ADJUST]

**GATE-PASS** (todos os criterios atendidos):
- Publicar conteudo como esta
- Registrar scores e feedback pra aprendizado futuro
- Escrever: "GATE-PASS: icp-validation [data]"

**GATE-ADJUST** (maioria atendida mas com flags):
- Aplicar ajustes MENORES baseados no feedback (ex: trocar 1 palavra na headline, ajustar cor)
- NAO precisa re-rodar os ICPs apos ajuste menor
- Documentar ajuste e justificativa

**GATE-FAIL** (criterios nao atendidos):
- Identificar CAUSA do fail (visual? copy? ambos?)
- Extrair feedback especifico dos ICPs que falharam
- Gerar BRIEF DE CORRECAO com:

```yaml
brief_correcao:
  problema_principal: "O que nao funcionou"
  feedback_icps: ["..."]
  retornar_para: "copy | visual | ambos"
  instrucoes_especificas: "O que a equipe de copy/visual DEVE mudar"
  preservar: "O que funcionou e NAO deve ser alterado"
```

- Enviar brief pra equipe de copy (@copy-chief) e/ou visual (@visual-director)
- Re-rodar ICP validation apos correcoes

### Loop Control

```
Maximo de iteracoes: 2
Se apos 2 iteracoes ainda GATE-FAIL:
  → Escalar para decisao humana (Tiago)
  → Apresentar: scores das 2 iteracoes + feedback consolidado
  → Tiago decide: publicar mesmo assim | retrabalhar | descartar
```

**VETO: NUNCA rodar mais de 2 iteracoes. Over-optimization mata autenticidade.**

---

## Pos-GATE: Registrar Aprendizados

**SOMENTE apos GATE-PASS ou decisao humana de publicar.**

```yaml
registro:
  post_id: "..."
  data: "YYYY-MM-DD"
  tipo: "carousel"
  headline: "..."
  scores_icps:
    rafael: N/10
    camila: N/10
    lucas: N/10
    ana: N/10
    marcos: N/10
  score_medio: N/10
  acao_mais_comum: "salvar | compartilhar | ignorar"
  insight_principal: "O que aprendemos sobre o ICP com este teste"
  ajustes_aplicados: "Nenhum | Lista de ajustes"
```

---

## Selecao de ICPs por Contexto (Opcional)

Nem todo post precisa de todos os 5 ICPs. Para otimizar:

| Tipo de Post | ICPs Recomendados | Motivo |
|--------------|-------------------|--------|
| Carrossel educacional | Rafael + Camila + Marcos | Framework-oriented |
| Post provocativo | Camila + Ana + Lucas | Alta barreira de ceticismo |
| Historia pessoal | Rafael + Lucas + Marcos | Conexao emocional |
| Estatistica/dados | Ana + Camila + Marcos | Valorizacao de evidencia |
| CTA direto (Next Step) | Rafael + Marcos | Mais propensos a converter |

**Minimo obrigatorio: 3 ICPs por validacao.**
**Recomendado: 5 ICPs para posts de alto impacto (carrosseis, lancamentos).**

---

## Integracao no Pipeline

```
Phase 1: Estrategia
  ↓
Phase 2: Copy (headline, body, CTA)
  ↓
Phase 3: Visual
  ├── 3.1-3.5: Slides internos
  ├── 3.6: Cover Art Direction (GATE-COVER)
  ↓
Phase 3.7: ICP Validation (GATE-ICP)  ← ESTE WORKFLOW
  ├── PASS → Publicar
  ├── ADJUST → Ajuste menor → Publicar
  └── FAIL → Brief de correcao → volta pra Phase 2 ou 3 → re-validar (max 2x)
```

---

## Anti-Patterns

1. **Rodar ICP validation SEM objetivo definido** → Validacao vira opiniao, nao teste
2. **Ignorar feedback da Ana (cetica)** → Se Ana aprova, o conteudo e solido. Se nao, investigue.
3. **Over-optimize pra agradar TODOS** → Impossivel. 3/5 e suficiente. Nem todo post e pra todos.
4. **Mais de 2 iteracoes** → Mata autenticidade e desperidca tempo. Escale pro humano.
5. **Mudar o conteudo drasticamente entre iteracoes** → Ajustes cirurgicos, nao reescrita total.
6. **Tratar ICPs como "nota de aprovacao"** → Sao PERSPECTIVAS, nao juizes. O feedback qualitativo importa mais que o score numerico.

---

## Changelog

- v1.0.0 (2026-02-12): Criacao inicial — 5 personas ICP, gate com 3 thresholds, loop de correcao max 2x
