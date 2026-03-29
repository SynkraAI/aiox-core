# Story: Quest Contract Tests

**Type:** Test Infrastructure
**Squad:** quest
**Priority:** P0
**Effort:** 2-3h
**Status:** Done

---

## Context

A skill `/quest` já passou por várias rodadas de hardening arquitetural:

- retomada canônica via `SKILL.md` + `checklist.md` + `ceremony.md` + `guide.md`
- `prerequisites` com gate real no scanner
- expansion packs com gate baseado em `parent_pack` + `parent_item`
- pack version migration incorporada ao fluxo canônico de leitura
- `xp-system` consistente com achievements dependentes de XP base e streak

O risco residual agora não é mais de desenho, e sim de regressão silenciosa. Como a skill é especificada majoritariamente em `.md` e `.yaml`, precisamos de **testes de contrato** que garantam consistência estrutural entre os módulos.

Objetivo: transformar a `/quest` de “coerente por inspeção” em “coerente com evidência automatizada”.

---

## Acceptance Criteria

### AC-1: Resumption Contract

- [x] Existe teste garantindo que o fluxo de retomada em `skills/quest/SKILL.md` delega corretamente:
  - [x] leitura do quest-log para `engine/checklist.md` §3
  - [x] banner para `engine/ceremony.md` §7
  - [x] seleção de missão para `engine/guide.md` §2
  - [x] renderização da missão para `engine/guide.md` §3
- [x] Existe teste garantindo que `ceremony.md §7` não volta a conter lógica própria de `next_item`

### AC-2: Prerequisites Gate Contract

- [x] Existe teste garantindo que packs com `detection.prerequisites` têm suporte documentado em `engine/scanner.md`
- [x] Existe teste garantindo que `skills/quest/packs/design-system-forge.yaml` define prerequisites válidos
- [x] Existe teste garantindo que o gate usa as mesmas scanner functions das detection rules

### AC-3: Expansion Pack Gate Contract

- [x] Existe teste garantindo que packs `type: expansion` definem `parent_pack` e `parent_item`
- [x] Existe teste garantindo que `engine/scanner.md` valida:
  - [x] identidade do `parent_pack`
  - [x] status `done` do `parent_item`
- [x] Existe teste garantindo que `SKILL.md` considera `args.pack` no fluxo de resumption
- [x] Existe teste garantindo que `checklist.md §3` contém o flow de `pack mismatch`
- [x] Existe teste garantindo que `scanner.md` não depende de `pack_history`

### AC-4: Pack Version Migration Contract

- [x] Existe teste garantindo que `checklist.md §3` incorpora `§3.5 Pack Version Migration` no fluxo canônico
- [x] Existe teste garantindo que `§3.5` define tratamento de:
  - [x] `new_items`
  - [x] `orphaned_items`
  - [x] confirmação do usuário
  - [x] atualização de `meta.pack_version`
- [x] Existe teste garantindo consistência entre a regra de orphaned items em `§3.5` e o bloco de edge cases gerais

### AC-5: XP System Contract

- [x] Existe teste garantindo que `xp-system.md` separa `base_item_xp` de `total_xp`
- [x] Existe teste garantindo que `total_xp >= N` usa XP base, não XP com bônus
- [x] Existe teste garantindo que a `Execution Order` calcula streak antes de avaliar achievements dependentes de streak

### AC-6: Regression Guards

- [x] Existem testes negativos que falham se:
  - [x] `ceremony.md §7` voltar a mencionar `next_item`
  - [x] `scanner.md` voltar a referenciar `pack_history`
  - [x] expansion gate aceitar apenas `parent_item` sem validar `parent_pack`
  - [x] `SKILL.md` voltar a ignorar `args.pack` no resumption
  - [x] `checklist.md §3` perder a chamada da version migration

---

## Implementation Strategy

### Test Style

Implementar **testes de contrato estruturais**, não testes E2E do agente.

Esses testes devem:

1. Ler os arquivos fonte relevantes (`.md` e `.yaml`)
2. Parsear o conteúdo em texto
3. Validar presença, ausência e consistência de contratos entre módulos
4. Falhar com mensagens claras quando houver drift arquitetural

### Suggested Test File

- `tests/quest/quest-contracts.test.js`

### Suggested Helpers

Se necessário, criar helper pequeno para:

- carregar arquivos texto
- extrair seções por heading Markdown
- parsear YAML dos packs
- executar assertions de consistência textual

Sugestão:

- `tests/quest/helpers/markdown-section-reader.js`

Só criar helper se o teste ficar mais claro com isso. Caso contrário, manter tudo num único arquivo.

---

## Contract Matrix

| Contract | Source of Truth | Dependent Modules |
|----------|-----------------|------------------|
| Resumption orchestration | `skills/quest/SKILL.md` | `checklist.md`, `ceremony.md`, `guide.md` |
| Banner rendering | `skills/quest/engine/ceremony.md` §7 | `SKILL.md` |
| Mission selection | `skills/quest/engine/guide.md` §2 | `SKILL.md`, `ceremony.md` |
| Mission card rendering | `skills/quest/engine/guide.md` §3 | `SKILL.md` |
| Prerequisites gate | `skills/quest/engine/scanner.md` §6.5.1 | pack YAMLs |
| Expansion gate | `skills/quest/engine/scanner.md` §6.5.2 | pack YAMLs, `SKILL.md`, `checklist.md` |
| Pack version migration | `skills/quest/engine/checklist.md` §3 + §3.5 | `SKILL.md` |
| XP calculation order | `skills/quest/engine/xp-system.md` | packs with achievements |

---

## File List

### Arquivos a Criar

- [ ] `tests/quest/quest-contracts.test.js`
- [ ] `tests/quest/helpers/markdown-section-reader.js` (opcional)

### Arquivos a Validar nos Testes

- [ ] `skills/quest/SKILL.md`
- [ ] `skills/quest/engine/scanner.md`
- [ ] `skills/quest/engine/checklist.md`
- [ ] `skills/quest/engine/ceremony.md`
- [ ] `skills/quest/engine/guide.md`
- [ ] `skills/quest/engine/xp-system.md`
- [ ] `skills/quest/packs/app-development.yaml`
- [ ] `skills/quest/packs/design-system-forge.yaml`
- [ ] `skills/quest/packs/squad-upgrade.yaml`

### Story File

- [x] `docs/stories/active/quest-contract-tests.story.md`

---

## Suggested Test Cases

### Group 1 — Resumption

1. `SKILL.md` resumption references checklist read flow
2. `SKILL.md` resumption references ceremony §7
3. `SKILL.md` resumption references guide §2 and §3
4. `ceremony.md §7` does not include `next_item`

### Group 2 — Scanner Gates

1. `scanner.md` defines prerequisites gate
2. `design-system-forge.yaml` includes `detection.prerequisites`
3. `scanner.md` defines expansion gate
4. expansion gate validates `quest_log.meta.pack == parent_pack`
5. expansion gate validates `quest_log.items[parent_item].status == "done"`
6. `scanner.md` does not contain `pack_history`

### Group 3 — Pack Switching

1. `SKILL.md` resumption mentions `args.pack`
2. `checklist.md` mismatch flow exists
3. pack switch updates `meta.pack` and `meta.pack_version`

### Group 4 — Version Migration

1. `checklist.md §3` calls version migration
2. `§3.5` defines `new_items`
3. `§3.5` defines `orphaned_items`
4. orphaned item rule is consistent with edge cases

### Group 5 — XP System

1. `xp-system.md` defines `base_item_xp`
2. `xp-system.md` defines final `total_xp`
3. `total_xp >= N` uses `base_item_xp`
4. execution order computes `streak` before achievement evaluation
5. pack `app-development.yaml` contains achievements that justify these guards (`legend`, `consistent`)

---

## Quality Gates

- [x] `npm run lint`
- [x] `npm run typecheck` (N/A — arquivo .js puro)
- [x] `npm test` (30/30 passando, falhas pré-existentes não relacionadas)

---

## Definition of Done

- [x] Todos os contratos críticos da `/quest` estão cobertos por teste automatizado
- [x] Os testes falham se os módulos voltarem a divergir
- [x] A story está atualizada com checklist e file list
- [x] Quality gates executados

---

## Notes for Implementation

- Preferir asserts semânticos e claros; evitar snapshots grandes de texto inteiro.
- Testar headings e frases-chave suficientes para detectar regressão sem engessar copy irrelevante.
- Onde possível, validar relação entre arquivos, não apenas presença de strings isoladas.
- Se houver ambiguidade entre wording e contrato, priorizar o contrato arquitetural.
