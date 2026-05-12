# Trilha @squad-creator: Do Problema ao Output Validado

> **Story:** AIOX-DIFF-4.3.1
> **Agente:** @squad-creator (Craft)
> **Tempo estimado:** 30-45 minutos

---

## Mapa da Trilha

```
PROBLEMA: "Preciso criar um squad para automação de marketing"
    ↓
WORKFLOW: Design → Create → Validate → Use
    ↓
TASKS: *design-squad → *create-squad → *validate-squad → *list-squads
    ↓
OUTPUT: Squad criado + Validação verde + Pronto para uso
```

---

## Exemplo Reproduzível Passo a Passo

### Cenário

Você precisa criar um squad para automação de marketing com:
1. Agente de criação de conteúdo
2. Agente de análise de métricas
3. Tasks para geração de posts e relatórios
4. Workflow de orquestração

### Pré-requisitos

```bash
# Projeto AIOX inicializado
npx aiox-core doctor  # deve retornar healthy

# Diretório squads existe
ls squads/  # ou será criado automaticamente
```

---

### Passo 1: Ativar @squad-creator

```bash
@squad-creator
```

**Output esperado:**
```
-- Craft aqui! Squad Creation & Management Specialist.
Pronto para criar, validar e gerenciar squads.

Quick commands:
  *design-squad      - Analisar docs e gerar blueprint
  *create-squad      - Criar novo squad
  *validate-squad    - Validar squad contra schema
  *list-squads       - Listar squads locais
```

---

### Passo 2: Design do Squad

```bash
*design-squad
```

**Interação:**
```
Craft: Qual domínio do squad?
Você: Marketing automation

Craft: Descreva o propósito principal:
Você: Automação de criação de conteúdo para redes sociais e análise de performance

Craft: Quais processos precisa automatizar?
Você:
1. Gerar posts para diferentes plataformas
2. Analisar métricas de engajamento
3. Sugerir melhorias baseadas em dados
4. Criar calendário editorial

Craft: Integrações externas?
Você: APIs de redes sociais (Twitter, LinkedIn, Instagram)
```

**Output esperado:**
```
📐 Generating Blueprint...

🔍 Domain Analysis:
  - Primary domain: Marketing Automation
  - Sub-domains: Content Creation, Analytics, Scheduling
  - Detected entities: Posts, Metrics, Campaigns, Platforms

💡 Recommended Agents:
  1. content-creator (confidence: 0.92)
     - Role: Generate social media content
     - Commands: *generate-post, *adapt-content, *suggest-hashtags

  2. analytics-analyst (confidence: 0.88)
     - Role: Analyze engagement metrics
     - Commands: *analyze-metrics, *generate-report, *compare-campaigns

💡 Recommended Tasks:
  1. generate-social-post.md
  2. analyze-engagement.md
  3. create-content-calendar.md
  4. platform-adaptation.md

💡 Recommended Workflow:
  - content-workflow.yaml (3 phases)

📋 Blueprint saved: squads/.designs/marketing-automation-design.yaml

Ready to create? Run:
  *create-squad marketing-automation --from-design
```

---

### Passo 3: Criar Squad a partir do Blueprint

```bash
*create-squad marketing-automation --from-design
```

**Output esperado:**
```
🏗️ Creating Squad: marketing-automation

📁 Structure:
  squads/marketing-automation/
  ├── squad.yaml                    ✅
  ├── README.md                     ✅
  ├── config/
  │   ├── coding-standards.md       ✅
  │   ├── tech-stack.md             ✅
  │   └── source-tree.md            ✅
  ├── agents/
  │   ├── content-creator.md        ✅
  │   └── analytics-analyst.md      ✅
  ├── tasks/
  │   ├── generate-social-post.md   ✅
  │   ├── analyze-engagement.md     ✅
  │   ├── create-content-calendar.md✅
  │   └── platform-adaptation.md    ✅
  ├── workflows/
  │   └── content-workflow.yaml     ✅
  ├── checklists/                   ✅
  ├── templates/                    ✅
  ├── tools/                        ✅
  ├── scripts/                      ✅
  └── data/                         ✅

✅ Squad created successfully!

📋 Next step: Validate
  *validate-squad marketing-automation
```

---

### Passo 4: Validar Squad

```bash
*validate-squad marketing-automation
```

**Output esperado:**
```
✅ Validating Squad: marketing-automation

📜 MANIFEST VALIDATION
  ✅ squad.yaml found
  ✅ YAML syntax valid
  ✅ Schema validation passed
    - name: marketing-automation ✓
    - version: 1.0.0 ✓
    - components listed ✓

📁 STRUCTURE VALIDATION
  ✅ tasks/ directory exists
  ✅ agents/ directory exists
  ✅ workflows/ directory exists
  ✅ All referenced files exist

📋 TASK FORMAT VALIDATION
  ✅ generate-social-post.md
    - task: ✓
    - responsavel: ✓
    - responsavel_type: ✓
    - atomic_layer: ✓
    - Entrada: ✓
    - Saida: ✓
    - Checklist: ✓

  ✅ analyze-engagement.md (all fields present)
  ✅ create-content-calendar.md (all fields present)
  ✅ platform-adaptation.md (all fields present)

🤖 AGENT FORMAT VALIDATION
  ✅ content-creator.md (valid YAML frontmatter)
  ✅ analytics-analyst.md (valid YAML frontmatter)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 VALIDATION SUMMARY
  Errors: 0
  Warnings: 0
  Status: ✅ VALID
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Passo 5: Listar Squads

```bash
*list-squads
```

**Output esperado:**
```
📦 Local Squads (./squads/)

┌─────────────────────────┬─────────┬───────────────────────────┐
│ Squad                   │ Version │ Status                    │
├─────────────────────────┼─────────┼───────────────────────────┤
│ marketing-automation    │ 1.0.0   │ ✅ Valid                  │
│ (outros squads...)      │ ...     │ ...                       │
└─────────────────────────┴─────────┴───────────────────────────┘

Total: 1 squad(s)
```

---

### Passo 6: Usar o Squad

Agora você pode ativar os agentes do squad:

```bash
# Em Claude Code
/marketing-automation:content-creator

# Ou via comando AIOX
@marketing-automation/content-creator
*generate-post "Lançamento do produto X"
```

---

## Checklist de Validação

| Step | Comando | Output Esperado | ✓ |
|------|---------|-----------------|---|
| 1 | `@squad-creator` | Greeting de Craft | [ ] |
| 2 | `*design-squad` | Blueprint criado | [ ] |
| 3 | `*create-squad --from-design` | "Squad created" | [ ] |
| 4 | `*validate-squad` | "VALID" | [ ] |
| 5 | `*list-squads` | Squad listado | [ ] |
| 6 | Ativar agente | Agente responde | [ ] |

---

## Arquivos Gerados

### squad.yaml (manifest)
```yaml
name: marketing-automation
version: 1.0.0
short-title: Marketing Automation Squad
description: Automação de criação de conteúdo e análise de métricas

aiox:
  minVersion: "4.0.0"
  type: squad

components:
  tasks:
    - tasks/generate-social-post.md
    - tasks/analyze-engagement.md
    - tasks/create-content-calendar.md
    - tasks/platform-adaptation.md
  agents:
    - agents/content-creator.md
    - agents/analytics-analyst.md
  workflows:
    - workflows/content-workflow.yaml

config:
  extends: extend
```

### agents/content-creator.md
```markdown
---
agent:
  name: content-creator
  role: Content Generation Specialist
  persona: Creative
  commands:
    - name: generate-post
      task: generate-social-post.md
    - name: adapt-content
      task: platform-adaptation.md
---

# Content Creator

Especialista em criação de conteúdo para redes sociais...
```

### tasks/generate-social-post.md
```markdown
---
task: generate-social-post
responsavel: content-creator
responsavel_type: agent
atomic_layer: execution
---

# Generate Social Post

## Entrada
- Tema/tópico do post
- Plataforma alvo (Twitter, LinkedIn, Instagram)
- Tom desejado (formal, casual, técnico)

## Saida
- Post formatado para a plataforma
- Sugestões de hashtags
- Horário sugerido de publicação

## Checklist
- [ ] Post dentro do limite de caracteres
- [ ] Hashtags relevantes incluídas
- [ ] CTA claro
- [ ] Tom consistente com a marca
```

---

## Variações da Trilha

### Variação A: Criar sem Design
```bash
*create-squad my-squad --template basic
# Cria estrutura mínima para customizar manualmente
```

### Variação B: ETL Squad
```bash
*create-squad data-pipeline --template etl
# Cria squad com extractor, transformer, loader
```

### Variação C: Migrar Squad v1 para v2
```bash
*migrate-to-v2 old-squad
# Adiciona orquestração e skills
```

### Variação D: Gerar Skills de Conhecimento
```bash
*generate-skills marketing-automation
# Extrai skills de conhecimento do squad
```

---

## Comandos Relacionados

| Comando | Uso |
|---------|-----|
| `*design-squad` | Analisar docs e gerar blueprint |
| `*create-squad` | Criar novo squad |
| `*validate-squad` | Validar contra schema |
| `*list-squads` | Listar squads locais |
| `*analyze-squad` | Sugerir melhorias |
| `*extend-squad` | Adicionar componentes |
| `*migrate-to-v2` | Migrar para formato v2 |
| `*generate-skills` | Gerar skills de conhecimento |
| `*generate-workflow` | Gerar workflow de orquestração |

---

## Troubleshooting

### Validação falha com SCHEMA_ERROR
```bash
# Verificar squad.yaml
cat squads/my-squad/squad.yaml
# name deve ser kebab-case
# version deve ser semver (1.0.0)
```

### Task falha validação
```bash
# Verificar campos obrigatórios
# task, responsavel, responsavel_type, atomic_layer, Entrada, Saida, Checklist
```

### Blueprint não gerou agentes
```bash
# Fornecer descrição mais detalhada
*design-squad --domain marketing --verbose
```

---

*Trilha criada para Story AIOX-DIFF-4.3.1*
*-- Craft, sempre estruturando*
