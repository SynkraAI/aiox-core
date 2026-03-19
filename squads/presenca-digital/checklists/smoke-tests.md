# Smoke Tests — Squad presenca-digital

Três testes obrigatórios para validar que o squad está operacional.
Executar após qualquer mudança estrutural nos agents ou workflows.

---

## Smoke Test 1 — Roteamento pelo Chief

**Objetivo:** Verificar que o `chief` consegue rotear para o agente correto dado brand guidelines do squad branding.

**Input necessário:**
- Brand guidelines disponíveis em `squads/branding/data/`
- Solicitação de conteúdo com pilar e plataforma especificados

**Passos:**
1. [ ] Acionar `@presenca-digital/chief` com: "Preciso de um post de LinkedIn sobre [pilar X], tom educativo, persona fundadores"
2. [ ] Verificar que o chief identifica o pilar e plataforma corretamente
3. [ ] Verificar que o chief roteia para `@nicolas-cole` (LinkedIn long-form) ou `@justin-welsh` (LinkedIn growth)
4. [ ] Verificar que o brief gerado pelo chief inclui referência aos brand guidelines

**Critério de aprovação:**
- [ ] Roteamento para o agente correto (não para um agente de outra plataforma)
- [ ] Brief inclui pilar, persona, plataforma e referência ao tom de voz
- [ ] Nenhuma invenção de guidelines que não existem no brand squad

**Resultado:** PASS / FAIL

---

## Smoke Test 2 — Geração de Post com Quality Gate

**Objetivo:** Verificar que `nicolas-cole` gera um post que passa no `content-quality-checklist.md`.

**Input necessário:**
- Pilar de conteúdo definido (ex: "Produtividade para fundadores")
- Plataforma: LinkedIn
- Persona: Fundadores de startups early-stage

**Passos:**
1. [ ] Acionar `@nicolas-cole` com o brief do pilar
2. [ ] Aguardar geração do post completo (hook + corpo + CTA + hashtags)
3. [ ] Aplicar `checklists/content-quality-checklist.md` ao post gerado
4. [ ] Verificar que o post atinge pelo menos "APROVADO" ou "AJUSTE MENOR"

**Critério de aprovação:**
- [ ] Hook passa no teste de 3 segundos
- [ ] CTA presente e claro
- [ ] Tom de voz alinhado com brand guidelines
- [ ] Nenhum erro ortográfico ou gramatical

**Resultado:** PASS / FAIL

---

## Smoke Test 3 — Repurposing Multi-Formato

**Objetivo:** Verificar que `vanessa-lau` repurposa um post em 3+ formatos que passam no `platform-specs-checklist.md`.

**Input necessário:**
- 1 post aprovado (pode ser o gerado no Smoke Test 2)
- Plataformas-alvo: Instagram, TikTok, YouTube Shorts (mínimo)

**Passos:**
1. [ ] Passar o post aprovado para `@vanessa-lau` com instrução de repurposing
2. [ ] Aguardar geração de pelo menos 3 adaptações para plataformas diferentes
3. [ ] Aplicar `checklists/platform-specs-checklist.md` a cada adaptação
4. [ ] Verificar que cada adaptação usa o formato nativo da plataforma

**Critério de aprovação:**
- [ ] 3 ou mais formatos gerados (Instagram, TikTok, YouTube Shorts no mínimo)
- [ ] Cada formato dentro dos specs técnicos da plataforma
- [ ] A mensagem central é preservada em todas as adaptações
- [ ] Hashtags adaptadas por plataforma (não copy-paste)

**Resultado:** PASS / FAIL

---

## Status Geral

| Smoke Test | Última Execução | Resultado |
|------------|----------------|-----------|
| ST-1: Roteamento Chief | — | Pendente |
| ST-2: Geração com Quality Gate | — | Pendente |
| ST-3: Repurposing Multi-Formato | — | Pendente |
