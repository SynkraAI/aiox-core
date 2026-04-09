# Ecosystem Scanner — Forge Creator Knowledge Bridge

> Como o forge-creator descobre os melhores recursos do ecossistema para cada domínio.
> Sem scan, o forge gerado roteia pra lugar nenhum. Isso NÃO é opcional.

---

## O Problema

O ecossistema AIOS tem 68+ squads, 72+ skills, 43+ minds, 17+ tools e 12+ agents.
Nenhum forge pode conhecer tudo isso de cabeça. O scanner é o "olho" que vê a despensa inteira antes de cozinhar.

---

## Fonte Primária: Rodar o `/catalog`

**Não ler o catalog. RODAR o `/catalog`.**

O `/catalog` regenera `.aios-core/data/catalog.md` com dados frescos. Isso garante que o scan sempre trabalha com a versão mais atualizada do ecossistema — sem depender de quando foi a última vez que alguém rodou.

O catalog gerado contém:
- Todos os squads com descrição e comando de ativação
- Todas as skills com descrição e comando de ativação
- Todas as tools com descrição
- Todos os agents com persona, escopo e autoridade exclusiva

**Após rodar `/catalog`, ler `.aios-core/data/catalog.md`.** É o ÚNICO arquivo necessário pra visão completa.

### Fonte Complementar: Minds

O catalog não inclui minds. Para minds, ler:
- **`docs/ECOSYSTEM-INDEX.md`** — seção "Minds" com slug, status, fidelidade e especialidade

---

## Scan Protocol (Fase 1 do forge-creator — MANDATORY)

### Step 1: Rodar `/catalog`

Invoke the `/catalog` skill. This regenerates `.aios-core/data/catalog.md` with fresh data.

After it completes, read `.aios-core/data/catalog.md` and extract all 4 tables:
- Squads (nome, descrição, ativação)
- Skills (nome, descrição, ativação)
- Tools (nome, descrição)
- Agents (nome, persona, escopo)

### Step 2: Ler as Minds

Read `docs/ECOSYSTEM-INDEX.md` — seção "Minds" apenas.
Extrair: slug, status, fidelidade, especialidade.
Filtrar: apenas minds com status >= "Partial" (ignorar "sources-only").

### Step 3: Extrair Keywords do Domínio

Da Discovery (Fase 0), construir duas listas:

1. **Keywords primárias:** palavras diretas do domínio
2. **Keywords expandidas:** sinônimos e termos relacionados

| Domínio | Keywords Primárias | Keywords Expandidas |
|---------|-------------------|---------------------|
| data pipeline | data, pipeline, ETL, banco, schema | database, migration, RLS, supabase, postgres, query |
| game dev | game, jogo, engine, sprite | godot, unity, unreal, 2d, 3d, multiplayer |
| research | pesquisa, análise, investigação | deep-research, market, competitor, insight |
| automation | automação, workflow, processo | n8n, zapier, integração, SOP, trigger |
| content | conteúdo, social, post, reel | carrossel, instagram, youtube, copy, storytelling |
| branding | marca, brand, identidade | logo, design-system, visual, tipografia |
| sales | vendas, funil, conversão | high-ticket, outreach, lead, prospecção |

### Step 4: Match Against Catalog

Para cada entrada no catalog, buscar matches contra as keywords:

**Squads:** Match keywords contra nome e descrição
```
Exemplo: domínio "sales"
→ Match: high-ticket-sales ("High-Ticket Sales Squad")
→ Match: high-ticket-mastery ("High-Ticket Mastery Squad")
→ Match: conversao-extrema ("Conversão Extrema Squad")
→ Match: negotiation ("Negotiation Squad")
→ Match: whatsapp-prospector ("WhatsApp Prospector")
→ Match: hormozi ("Hormozi Squad — The $100M Mind System")
```

**Skills:** Match keywords contra nome e descrição
```
Exemplo: domínio "research"
→ Match: deep-research ("Deep Research")
→ Match: deep-search ("Deep Search")
→ Match: tech-research ("Tech Research")
→ Match: decision-tree-generator ("Decision Tree Documentation Generator")
```

**Agents:** Match keywords contra escopo
```
Exemplo: domínio "data pipeline"
→ Match: @data-engineer ("Database design, schema DDL, query optimization")
→ Match: @architect ("Arquitetura e design técnico")
```

**Minds:** Match keywords contra especialidade
```
Exemplo: domínio "sales"
→ Match: hormozi ("Ofertas, Escala, Ads, Copy")
→ Match: leandro-ladeira ("Copy, Marketing Digital")
→ Match: chris-voss ("Negociação")
→ Match: robert-cialdini ("Persuasão, Influência")
```

### Step 5: Deep Scan (fallback para domínios ambíguos)

Se Step 4 encontrou **menos de 3 recursos totais**, o catalog não tem descrições suficientes. Fazer scan profundo:

1. `Grep pattern="{keyword}" path="squads/" glob="*/README.md"`
2. `Grep pattern="{keyword}" path="skills/" glob="*/SKILL.md"`

Isso captura recursos que o catalog descreve de forma genérica demais.

### Step 6: Classificar por Relevância

| Score | Critério |
|-------|----------|
| 3 | Match exato no nome (ex: "data" no nome "data-engineer") |
| 2 | Match na descrição/especialidade |
| 1 | Match no conteúdo (deep scan grep) |

Ordenar por score. Apresentar top 10 ao usuário.

### Step 7: Apresentar Resultados

```
🔍 Ecosystem Scan — Domínio: {domain}
   (Fonte: catalog + minds index)

🧠 MINDS ({N} encontradas):
  1. @{slug} — {especialidade} (score: {N})
  2. @{slug} — {especialidade} (score: {N})

⚡ SKILLS ({N} encontradas):
  1. {name} — {descrição} | ativação: {comando} (score: {N})
  2. {name} — {descrição} | ativação: {comando} (score: {N})

📦 SQUADS ({N} encontrados):
  1. {name} — {descrição} | ativação: {comando} (score: {N})
  2. {name} — {descrição} | ativação: {comando} (score: {N})

🤖 AGENTS CORE ({N} relevantes):
  1. @{name} ({persona}) — {escopo}

🔧 TOOLS ({N} relevantes):
  1. {name} — {descrição}

⚠️ GAPS (áreas sem cobertura):
  - {área do domínio sem executor}

Esses recursos serão mapeados no capability-map.yaml do forge.
Quer ajustar algo ou posso prosseguir?
```

### Step 8: User Validates

SEMPRE esperar o usuário confirmar antes de usar os resultados:
- Pode remover recursos irrelevantes
- Pode adicionar recursos que o scan não encontrou
- Pode apontar gaps que precisam de squads/skills novos

---

## Capability Map Generation

Após validação do usuário, converter scan results em capability-map.yaml:

```yaml
# Gerado pelo Ecosystem Scanner do forge-creator
# Fonte: .aios-core/data/catalog.md + docs/ECOSYSTEM-INDEX.md (minds)
# Domínio: {domain}
# Scan date: {ISO8601}

capabilities:
  {intent_1}:
    description: "{o que esse intent faz}"
    executor: "{melhor recurso do scan — score mais alto}"
    activation: "{comando de ativação do catalog}"
    agent: "{agent específico se aplicável}"
    why: "{por que esse recurso é o melhor — da descrição no catalog}"
    alternatives:
      - executor: "{segundo melhor recurso}"
        activation: "{comando}"
        when: "{quando usar a alternativa}"

  {intent_2}:
    # ...
```

**Regra:** Cada capability DEVE apontar pra um recurso que EXISTS no catalog e foi VALIDADO pelo usuário.
Nunca inventar executors. Se não existe, marcar como gap e sugerir criação.

**Vantagem de usar o catalog:** o campo `activation` vem direto do catalog — o forge gerado já sabe o comando exato pra invocar cada executor.

---

## Freshness Guarantee

O forge-creator roda `/catalog` no Step 1 de cada scan. Isso garante dados sempre frescos — sem checks de data, sem prompts de "quer atualizar?". Simples.

---

## Scan para Forges Existentes (Upgrade)

Quando o forge-creator é usado pra auditar um forge existente:

1. Ler o capability-map.yaml existente
2. Ler o catalog atual
3. Comparar: o que existe no catalog mas NÃO está no capability-map?
4. Apresentar "recursos novos disponíveis" como sugestão de upgrade
