---
name: audit-project-config
description: |
  Valida configurações `.claude/` de projetos existentes contra templates atuais.
  3 camadas de validação (Structural, Semantic, Freshness) com sistema de vetos.
  Suporta projetos CENTRALIZED e HYBRID. Modo audit-only ou auto-fix com dry-run obrigatório.
license: Complete terms in LICENSE.txt
allowed-tools: Read, Write, Edit, Glob, Grep, Bash

version: 1.0.0
category: design
tags: [SKILL]
---

# Audit Project Config

> Valida e corrige configurações `.claude/` de todos os projetos ativos, garantindo que estejam alinhados com os templates e padrões atuais do AIOS.

---

## Quick Start

```
/audit-project-config                # Apenas auditar — gera relatório
/audit-project-config --fix          # Auditar + oferecer auto-fix com dry-run
/audit-project-config --project X    # Auditar apenas o projeto X
```

---

## Quando Usar

| Cenário | Exemplo |
|---------|---------|
| Verificação periódica de saúde dos projetos | "Roda um audit em todos os projetos" |
| Após atualizar templates do AIOS | "Mudei o settings-format, confere se tá tudo OK" |
| Projeto com comportamento estranho | "Hooks não funcionam nesse projeto" |
| Onboarding de projeto existente | "Adicionei projeto X no ACTIVE.md, valida as configs" |
| Pré-deploy / pré-release | "Antes de fazer push, confere se tudo tá configurado" |

## NÃO Usar Para

| Cenário | Alternativa |
|---------|-------------|
| Criar `.claude/` do zero para projeto novo | `/new-project` |
| Auditar código ou arquitetura | `@qa` ou `@architect` |
| Validar apenas hooks format | `node .claude/hooks/validate-settings-format.cjs` |
| Problemas com MCP servers | `@devops *list-mcps` |

---

## Discovery Questions

Perguntas para fazer antes de executar. Use `AskUserQuestion`. Pule se o usuário já forneceu contexto.

1. **Quer apenas auditoria ou também auto-fix das configs?** — Com `--fix`, corrige gaps automaticamente com dry-run obrigatório; sem, apenas gera relatório.
2. **Tem projetos específicos que quer priorizar na verificação?** — Por padrão audita todos os projetos em ACTIVE.md. *(opcional)*

---

## SKILL DEFINITION

```yaml
skill:
  name: Audit Project Config
  id: audit-project-config

veto_conditions:
  - id: VETO_1
    trigger: "ACTIVE.md não existe"
    action: "HALT + Error: 'docs/projects/ACTIVE.md não encontrado. Crie primeiro com /new-project.'"

  - id: VETO_2
    trigger: "Tabela em ACTIVE.md sem colunas Projeto/INDEX"
    action: "HALT + Error: 'Formato de ACTIVE.md inválido. Precisa ter colunas Projeto e INDEX.'"

  - id: VETO_3
    trigger: "Zero projetos encontrados na tabela"
    action: "HALT + Error: 'Nenhum projeto ativo encontrado em ACTIVE.md.'"

  - id: VETO_4
    trigger: "Modo ambíguo (nem HYBRID nem CENTRALIZED detectado)"
    action: "SKIP projeto + WARN: 'Projeto {name} com modo ambíguo, pulando.'"

  - id: VETO_5
    trigger: "Path computado está fora do homedir (~/ ou /Users/)"
    action: "HALT + Error: 'Path {path} está fora do diretório home. Recusado por segurança.'"

  - id: VETO_6
    trigger: "Path relativo não resolve para diretório válido"
    action: "HALT + Error: 'Path {path} não resolve para diretório válido.'"

  - id: VETO_7
    trigger: "Auto-fix solicitado sem dry-run preview"
    action: "HALT + Error: 'Dry-run obrigatório antes de qualquer auto-fix.'"

  - id: VETO_8
    trigger: "Primeiro fix individual falha"
    action: "HALT batch + Error: 'Fix falhou no projeto {name}. Batch cancelado. Corrija manualmente.'"

  - id: VETO_9
    trigger: "Diretório destino sem permissão de escrita"
    action: "SKIP projeto + WARN: 'Sem permissão de escrita em {path}. Pulando.'"

  - id: VETO_10
    trigger: "Script de fix retorna exit code != 0"
    action: "HALT batch + Error: 'Script falhou com exit code {code}. Verifique logs.'"

  - id: VETO_11
    trigger: "Arquivo esperado não foi criado após fix"
    action: "HALT + Error: 'Fix executou mas {file} não foi criado. Verifique script.'"

  - id: VETO_12
    trigger: "Arquivo JSON criado mas conteúdo inválido"
    action: "HALT + Error: '{file} criado mas JSON inválido. Corrija manualmente.'"

constraints:
  forbidden_actions:
    - NEVER modificar arquivos sem dry-run preview aprovado pelo usuário
    - NEVER executar batch fix sem primeiro fix individual validado
    - NEVER acessar paths fora do homedir
    - NEVER deletar configurações existentes (apenas adicionar/corrigir)

workflow:
  phases:

    # ──────────────────────────────────────────────
    # PHASE 1: SCAN PROJECTS
    # ──────────────────────────────────────────────
    1_scan:
      name: "Scan de Projetos Ativos"
      execution: |
        1. Ler docs/projects/ACTIVE.md
        2. Parsear tabela markdown (extrair colunas Projeto, INDEX, Status)
        3. Para cada projeto, detectar modo:
           - Se INDEX aponta para .aios/INDEX.md → HYBRID
           - Se INDEX aponta para docs/projects/{name}/ → CENTRALIZED
        4. Computar path absoluto de cada projeto
        5. Verificar se path existe no filesystem

      veto_checks: [VETO_1, VETO_2, VETO_3, VETO_4, VETO_5, VETO_6]

    # ──────────────────────────────────────────────
    # PHASE 2: VALIDATE
    # ──────────────────────────────────────────────
    2_validate:
      name: "Validação em 3 Camadas"
      execution: |
        Para cada projeto encontrado, validar em 3 camadas:

        L1 STRUCTURAL — arquivos existem?
        L2 SEMANTIC — conteúdo é válido?
        L3 FRESHNESS — está atualizado vs templates?

      layers:
        L1_structural:
          checks:
            - ".claude/ directory existe"
            - "settings.json presente"
            - "CLAUDE.md presente"
            - "rules/ directory existe"
            - "rules/behavioral-rules.md presente"
          severity: CRITICAL (sem .claude/) | HIGH (sem arquivos)

        L2_semantic:
          checks:
            - "settings.json: hooks é objeto {}, não array []"
            - "settings.json: matchers são strings simples, não objetos"
            - "settings.json: permissions.allow existe e é array"
            - "settings.json: permissions.deny existe e é array"
            - "CLAUDE.md: nenhum placeholder {{}} fora de code blocks"
            - "CLAUDE.md: tem conteúdo real (> 200 chars)"
            - "behavioral-rules.md: tem conteúdo (> 100 chars)"
          severity: CRITICAL (hooks format) | HIGH (permissions/placeholders) | MEDIUM (conteúdo)

        L3_freshness:
          checks:
            - "settings.json: schema compatível com versão atual"
            - "CLAUDE.md: referencia paths corretos (stories, sessions)"
            - "rules/: não tem arquivos obsoletos"
          severity: LOW

    # ──────────────────────────────────────────────
    # PHASE 3: REPORT
    # ──────────────────────────────────────────────
    3_report:
      name: "Geração de Relatório"
      execution: |
        1. Calcular Health Score: (checks_passed / total_checks) * 100
        2. Agrupar issues por severidade (CRITICAL > HIGH > MEDIUM > LOW)
        3. Gerar relatório em docs/reports/project-config-audit.md
        4. Mostrar resumo conciso ao usuário:
           - Total de projetos: N
           - Health Score: X%
           - Issues CRITICAL: N
           - Issues HIGH: N
           - Top 3 problemas mais comuns

    # ──────────────────────────────────────────────
    # PHASE 4: AUTO-FIX (se --fix)
    # ──────────────────────────────────────────────
    4_autofix:
      name: "Auto-Fix com Dry-Run"
      condition: "Apenas se --fix foi passado"
      execution: |
        1. DRY-RUN obrigatório: mostrar preview de todas as alterações
        2. Perguntar ao usuário (AskUserQuestion):
           a) "Corrigir todos (batch)"
           b) "Corrigir apenas 1 (validação)"
           c) "Não corrigir nada"
        3. Se opção (b): executar fix no primeiro projeto, validar resultado
        4. Se primeiro fix OK: oferecer batch
        5. Se primeiro fix FALHA: HALT (VETO_8)
        6. Executar batch
        7. Re-audit para confirmar correções

      veto_checks: [VETO_7, VETO_8, VETO_9, VETO_10, VETO_11, VETO_12]

    # ──────────────────────────────────────────────
    # PHASE 5: DELTA REPORT
    # ──────────────────────────────────────────────
    5_delta:
      name: "Relatório Delta (BEFORE vs AFTER)"
      condition: "Apenas se auto-fix foi executado"
      execution: |
        1. Re-executar validação completa
        2. Comparar com resultado anterior
        3. Mostrar delta:
           - Health Score: X% → Y%
           - Issues resolvidas: N
           - Issues restantes: N
```

---

## Validation Layers (Detalhamento)

### L1: Structural Validation

Verifica se os arquivos e diretórios obrigatórios existem.

| Check | Severidade | Projeto CENTRALIZED | Projeto HYBRID |
|-------|-----------|---------------------|----------------|
| `.claude/` existe | CRITICAL | `docs/projects/{name}/.claude/` | `{path}/.claude/` |
| `settings.json` presente | HIGH | Pode herdar do aios-core | Deve existir ou herdar |
| `CLAUDE.md` presente | HIGH | Obrigatório | Obrigatório |
| `rules/` existe | MEDIUM | Opcional (herda) | Opcional (herda) |
| `rules/behavioral-rules.md` | LOW | Opcional (herda) | Opcional (herda) |

### L2: Semantic Validation

Verifica se o conteúdo dos arquivos é válido.

| Check | Severidade | Detalhes |
|-------|-----------|----------|
| `hooks` é objeto `{}` | CRITICAL | Array `[]` causa erro "Expected record, but received array" |
| Matchers são strings | HIGH | `"Edit"` correto, `{"tools": ["Edit"]}` errado |
| `permissions.allow` é array | HIGH | Deve existir e ser array |
| `permissions.deny` é array | HIGH | Deve existir e ser array |
| Sem placeholders `{{}}` | HIGH | `{{PROJECT_NAME}}` etc. fora de code blocks = não substituído |
| CLAUDE.md tem conteúdo real | MEDIUM | Mais de 200 chars, não só template vazio |
| behavioral-rules.md tem conteúdo | LOW | Mais de 100 chars |

### L3: Freshness Validation

Verifica se as configs estão atualizadas.

| Check | Severidade | Detalhes |
|-------|-----------|----------|
| Schema de settings.json | LOW | Compatível com formato atual |
| Paths em CLAUDE.md | LOW | Referências para stories/sessions resolvem |
| Arquivos obsoletos em rules/ | LOW | Rules que foram removidas do template |

---

## CENTRALIZED vs HYBRID

| Critério | CENTRALIZED | HYBRID |
|----------|-------------|--------|
| Projeto vive em | `aios-core/` (squads, minds) | `~/CODE/Projects/` (apps externos) |
| INDEX.md em | `docs/projects/{name}/INDEX.md` | `{path}/.aios/INDEX.md` |
| `.claude/` em | `docs/projects/{name}/.claude/` | `{path}/.claude/` |
| Herança de config | Herda tudo do aios-core | Pode herdar ou ter próprio |
| Use quando | Squad, mind clone, research interno | App full-stack, pipeline externo |

**Detecção automática:**
- INDEX aponta para `.aios/INDEX.md` → HYBRID
- INDEX aponta para `docs/projects/{name}/` → CENTRALIZED
- Ambos presentes → ERRO (VETO_4)

---

## Placeholders Validados

O skill verifica que NENHUM destes placeholders existe fora de code blocks:

| Placeholder | Exemplo (substituído) |
|-------------|----------------------|
| `{{PROJECT_NAME}}` | Minha App |
| `{{MODE}}` | HYBRID |
| `{{MODE_DESCRIPTION}}` | Governança local |
| `{{INDEX_PATH}}` | .aios/INDEX.md |
| `{{STORIES_PATH}}` | .aios/stories/active/ |
| `{{SESSIONS_PATH}}` | .aios/sessions/ |
| `{{PROJECT_SLUG}}` | minha-app |
| `{{SAVE_LOCATION}}` | .aios/ |

---

## Project Types

Tipos válidos detectados automaticamente via INDEX.md:

| Tipo | Detectado por | Exemplo |
|------|--------------|---------|
| `app` | "Type: App", "Next.js", "React" | meta-ads-prospector |
| `squad` | "Type: Squad", "Agent", "Workflow" | gui-avila-mind |
| `mind-clone` | "Type: Mind Clone", "Mind DNA" | naval-ravikant-mind |
| `pipeline` | "Type: Pipeline", "Automation", "ETL" | etl-converter |
| `research` | "Type: Research", "Study", "Analysis" | market-analysis |
| `knowledge` | Fallback (nenhum pattern match) | evolution-api |

---

## Dependencies

| Recurso | Path | Usado Para |
|---------|------|-----------|
| ACTIVE.md | `docs/projects/ACTIVE.md` | Lista de projetos ativos |
| Audit script | `tools/audit-project-configs.js` | Executa audit automatizado |
| Fix script | `tools/fix-project-configs.js` | Executa auto-fix |
| Copy config | `tools/copy-project-config.js` | Cria `.claude/` novo |
| Settings format rules | `.claude/rules/settings-format.md` | Referência de formato de hooks |

---

## Scripts

| Script | Uso | Exit Codes |
|--------|-----|------------|
| `tools/audit-project-configs.js` | Valida todos os projetos | 0: OK, 1: CRITICAL issues, 2: VETO |
| `tools/fix-project-configs.js` | Corrige gaps encontrados | 0: OK, 1: Falhas parciais, 2: VETO |
| `tools/fix-project-configs.js --dry-run` | Preview sem alterar nada | 0: Sempre |
| `tools/fix-project-configs.js --first-only` | Corrige 1 projeto (validação) | 0/1/2 |

---

## Troubleshooting

| Problema | Causa Provável | Solução |
|----------|---------------|---------|
| "Expected record, but received array" | `hooks` como `[]` em settings.json | `node .claude/hooks/validate-settings-format.cjs` |
| Health Score 0% em projeto HYBRID | `.claude/` não existe no projeto | Rodar com `--fix` ou usar `/new-project` |
| Placeholders não substituídos | `/new-project` não completou | Re-executar `/new-project` para o projeto |
| Script retorna exit code 2 | VETO ativado | Verificar qual VETO e resolver pré-condição |
| Fix não cria arquivo esperado | Permissão de escrita ou path inválido | Verificar `ls -la` no diretório destino |

---

**Versão:** 3.0 (Expanded — 3-Layer Validation + Decision Tree)
