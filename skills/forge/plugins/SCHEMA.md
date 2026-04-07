# Forge Plugin System — Schema Reference

> Guia interno para desenvolvedores do Forge. Usuários do Forge **não** interagem com plugins diretamente.

---

## O que é um Plugin

Um plugin é um arquivo YAML em `{FORGE_HOME}/plugins/` que se registra em hooks do lifecycle do Forge. O runner descobre e carrega todos os plugins automaticamente no início de cada run.

Plugins são os "órgãos internos" do Forge — invisíveis pro usuário, mas essenciais pro funcionamento.

---

## Schema YAML

```yaml
# === Metadata ===
plugin:
  name: "{kebab-case}"              # Identificador único
  version: "1.0.0"                  # Semver
  description: "{o que faz}"        # Uma linha

# === Ativação ===
activation:
  enabled: true                     # true/false — toggle global
  modes:                            # Modos do Forge onde o plugin é ativo
    - FULL_APP                      # Omitir = ativo em TODOS os modos
    - SINGLE_FEATURE
    # Valores válidos: FULL_APP, SINGLE_FEATURE, BUG_FIX, QUICK,
    #   BROWNFIELD, DESIGN_SYSTEM, LANDING_PAGE, CLONE_SITE, SQUAD_UPGRADE,
    #   DRY_RUN, REPLAY, TEMPLATE

# === Prioridade ===
priority: 50                        # 0-99, menor = executa primeiro

# === Hooks ===
hooks:
  - event: "after:phase:0"          # Hook que dispara este bloco
    action: inject                  # Tipo de ação (ver seção abaixo)
    source: "{FORGE_HOME}/file.md"  # Arquivo com instruções (prose/markdown)
    section: "Section Name"         # Opcional: heading específico do source
    description: "O que faz"        # Descrição curta
    filter:                         # Opcional: filtros adicionais
      phases: [1, 2, 3]            # Só disparar nestas fases

# === State ===
state_key: "plugin_name"           # Namespace em state.json → plugins.{key}

# === Config ===
config:                             # Valores configuráveis (opcionais)
  key: value
```

---

## Hook Taxonomy

### Lifecycle Hooks

| Hook | Quando dispara | Contexto disponível |
|------|---------------|-------------------|
| `before:run` | Após init, antes da Phase 0 | `state.json` (inicial), `config.yaml`, mode |
| `before:phase:*` | Antes de entrar em qualquer fase | `state.json`, `context-pack.json`, phase number |
| `after:phase:*` | Após fase completar | `state.json` (atualizado), outputs da fase |
| `after:run` | Após todas as fases, antes do banner | `state.json` completo, todos os outputs |
| `after:deploy` | Após Phase 5 push + PR criados com sucesso | `state.json` com `pr_url`, deploy info |

> `after:deploy` é distinto de `after:phase:5` — só dispara quando deploy REALMENTE aconteceu (push + PR). Não dispara se o usuário escolheu "não deployar".

> `*` = wildcard. `before:phase:*` dispara para TODAS as fases. Use `before:phase:3` para uma fase específica.

### Agent Hooks

| Hook | Quando dispara | Contexto disponível |
|------|---------------|-------------------|
| `on:agent-dispatch` | Antes de despachar agente via Agent tool | Agent name, task, input, phase, story |
| `on:agent-return` | Após agente retornar resultado | Agent name, output, success/fail, phase |

### Event Hooks

| Hook | Quando dispara | Contexto disponível |
|------|---------------|-------------------|
| `on:error` | Quando error recovery é acionado | Error type, message, retry count, phase/story |
| `on:checkpoint` | Antes de mostrar checkpoint ao usuário | Checkpoint type, phase, progress data |
| `on:veto` | Quando veto condition dispara | Veto type (hard/soft), check name, result |
| `on:story-complete` | Após story passar QA | Story id, QA result, story file path |

---

## Tipos de Action

| Action | O que faz | Pode bloquear? |
|--------|----------|---------------|
| `inject` | Injeta contexto/instruções no prompt do LLM | Não |
| `validate` | Checa uma condição, pode bloquear se falhar | Sim (depende do severity) |
| `log` | Registra informação em state.json, sem side effects | Não |

---

## Faixas de Prioridade

| Range | Uso | Exemplos |
|-------|-----|----------|
| 1-9 | Core/lifecycle | `lifecycle.yaml` (priority: 1) |
| 10-29 | Ecosystem/contexto | `ecosystem-scanner.yaml` (priority: 10) |
| 30-69 | Quality gates | `bulletproof-test.yaml` (priority: 30) |
| 70-89 | Opcionais/informativos | Plugins customizados |
| 90-99 | Logging/sync | `quest-sync.yaml` (priority: 90) |

Plugins com mesma prioridade executam em ordem alfabética.

---

## Como Criar um Plugin

1. Criar um arquivo `.yaml` em `{FORGE_HOME}/plugins/`
2. Seguir o schema acima
3. Se o plugin precisa de instruções complexas, criar um `.md` e apontar via `source`
4. Pronto — o runner descobre e carrega automaticamente no próximo `/forge` run

### Regras

- O `name` deve ser único entre todos os plugins
- O `source` deve apontar para um arquivo que existe (use `{FORGE_HOME}/` para paths relativos ao Forge)
- Plugins NUNCA criam arquivos no projeto do usuário — só escrevem em `state.json` via `state_key`
- Plugins de `validate` com `severity: recommended` geram CONCERNS se falharem (soft veto)
- Plugins de `validate` com `severity: optional` geram INFO (nunca bloqueiam)

### Checklist de Validação

- [ ] `plugin.name` é kebab-case e único
- [ ] `activation.modes` contém apenas modos válidos do Forge
- [ ] `priority` está na faixa correta para o tipo do plugin
- [ ] Cada hook tem `event` válido da taxonomy
- [ ] `source` aponta para arquivo existente
- [ ] `state_key` não conflita com outro plugin
