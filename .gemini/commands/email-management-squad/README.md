# Email Management Squad

Squad de agentes para limpeza e organização sistemática de email, usando DNA comportamental de especialistas em produtividade e decisão.

---

## Visao Geral

| Item | Quantidade |
|------|------------|
| **Agentes** | 7 (1 orquestrador + 3 baseados em DNA + 3 operacionais) |
| **Fontes DNA** | 3 (Merlin Mann, Tiago Forte, Charlie Munger) |
| **Pipeline** | 7 etapas (Descobrir → Triagem → Organizar → Validar → Gate → Executar → Relatório) |
| **Portas de Segurança** | 2 (Veto Enforcer + Safety Checkpoint) |

---

## Pipeline

```
                    +-----------------------+
                    |    Email Chief        |
                    |   (Orchestrator)      |
                    +-----------+-----------+
                                |
                    +-----------v-----------+
                    | Multi-Account         |
                    | Orchestrator          |
                    | (Discover accounts)   |
                    +-----------+-----------+
                                |
                    +-----------v-----------+
                    | Inbox Zero Validator  |
                    | (Merlin Mann DNA)     |
                    | DELETE/DELEGATE/      |
                    | RESPOND/DEFER/DO      |
                    +---+-------------+-----+
                        |             |
              +---------v---+   +-----v--------+
              | PARA        |   | Veto         |
              | Architect   |   | Enforcer     |
              | (Tiago DNA) |   | (Munger DNA) |
              | KEEP emails |   | DELETE check |
              +------+------+   +------+-------+
                     |                 |
                     +--------+--------+
                              |
                    +---------v---------+
                    | Safety Checkpoint  |
                    | (Final gate)       |
                    +---------+---------+
                              |
                    +---------v---------+
                    | Batch Processor    |
                    | (Execute actions)  |
                    +-------------------+
```

---

## Agentes

### Tier 0 — Orquestrador

| Agente | Função | Tipo |
|--------|--------|------|
| **Email Chief** | Coordena pipeline, roteia entre agentes, reporta progresso | Funcional |

### Tier 1 — Especialistas (baseados em DNA)

| Agente | Fonte DNA | Função |
|--------|-----------|--------|
| **Inbox Zero Validator** | Merlin Mann | Triagem — classifica e-mails em 5 ações |
| **PARA Architect** | Tiago Forte | Organização — aplica framework PARA a e-mails KEEP |
| **Veto Enforcer** | Charlie Munger | Validação — 9 veto conditions para decisões de DELETE |

### Tier 2 — Operacionais

| Agente | Função | Tipo |
|--------|--------|------|
| **Multi-Account Orchestrator** | Sincroniza decisões entre contas Gmail | Operacional |
| **Batch Processor** | Executa ações em lote com audit trail | Operacional |
| **Safety Checkpoint** | Gate final — 5 verificações obrigatórias antes de ações irreversíveis | Segurança |

---

## Como Usar

### Ativar o Squad

```bash
# No Claude Code, ative com:
/email-chief
```

O **Email Chief** coordena tudo. Ele sabe qual agente chamar para cada etapa.

### Ou chame agentes diretamente:

| Comando | Agente | Faz o que |
|---------|--------|-----------|
| `/email-chief` | Orchestrator | Inicia e coordena todo o pipeline |
| `/inbox-zero-validator` | Triagem | Classifica emails (DELETE/DELEGATE/RESPOND/DEFER/DO) |
| `/para-architect` | Organizacao | Aplica PARA labels a emails mantidos |
| `/veto-enforcer` | Validacao | Valida decisoes de DELETE com rigor |
| `/multi-account-orchestrator` | Sync | Mapeia e sincroniza multiplas contas |
| `/batch-processor` | Execucao | Executa acoes em lote |
| `/safety-checkpoint` | Seguranca | Gate final antes de acoes irreversiveis |

---

## DNA Sources

### Merlin Mann (Inbox Zero Validator)
- **Framework:** 5-Action Triage (DELETE/DELEGATE/RESPOND/DEFER/DO)
- **Key Heuristics:** Death Test, 2-Minute Rule, Frequency Filter
- **Voice:** Irreverent pragmatist — "You know what to delete. You're just afraid."

### Tiago Forte (PARA Architect)
- **Framework:** PARA (Projects/Areas/Resources/Archives) + Progressive Summarization
- **Key Heuristics:** Resonance Test, Active Project Test, JIT Principle
- **Voice:** Optimistic systems thinker — "Organize for actionability, not by topic."

### Charlie Munger (Veto Enforcer)
- **Framework:** 9 Veto Conditions + Two-Track Analysis + 25 Psychological Tendencies
- **Key Heuristics:** Inversion Test, Lollapalooza Test, Circle of Competence
- **Voice:** Curmudgeonly sage — "Invert, always invert."

---

## Safety Model

```
Layer 1: Inbox Zero Validator — classifica com rationale
Layer 2: Veto Enforcer — valida com 9 conditions (qualquer fail = VETO)
Layer 3: Safety Checkpoint — 5 checks obrigatorios (qualquer fail = BLOCK)
Layer 4: Batch Processor — executa somente com dupla aprovacao (veto + safety)
```

**Principio:** E melhor bloquear 100 deletes seguros do que permitir 1 catastrofico.

---

## Configuracao

Edite `config.yaml` para ajustar:

| Setting | Default | Descricao |
|---------|---------|-----------|
| `batch_size` | 100 | Emails por batch |
| `require_backup_before_delete` | true | Backup obrigatorio |
| `trash_retention_hours` | 720 | 30 dias no Gmail Trash |
| `max_delete_per_session` | 500 | Limite de deletes por sessao |
| `require_veto_for_delete` | true | Veto obrigatorio para DELETE |
| `require_safety_for_irreversible` | true | Safety gate obrigatoria |
