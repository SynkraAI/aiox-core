# IDS - Incremental Development System: Conceitos Explicados

**Documento de Referência Conceitual**
**Autor:** Pedro Valério Lopez (via Mind Clone)
**Data:** 2026-02-05
**Versão:** 1.0

> "Humans develop incrementally; AI agents develop generationally."
> — Princípio fundamental do IDS

---

## 📖 Índice

1. [O Problema Central](#o-problema-central)
2. [A Solução: IDS](#a-solução-ids)
3. [REUSE > ADAPT > CREATE](#reuse--adapt--create)
4. [Entity Registry (O Inventário)](#entity-registry-o-inventário)
5. [Decision Engine (O Cérebro)](#decision-engine-o-cérebro)
6. [Verification Gates (Os Portões)](#verification-gates-os-portões)
7. [Self-Healing (Auto-Cura)](#self-healing-auto-cura)
8. [Métricas de Sucesso](#métricas-de-sucesso)
9. [Glossário Visual](#glossário-visual)

---

## O Problema Central

### A Diferença Entre Humanos e IAs

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   👨‍💻 DESENVOLVEDOR HUMANO         🤖 AGENTE IA (sem IDS)      │
│                                                                 │
│   "Já existe algo parecido?"       "Vou criar do zero!"        │
│          ↓                                  ↓                   │
│   Busca código existente           Gera código novo            │
│          ↓                                  ↓                   │
│   Adapta 10 linhas                 Escreve 200 linhas          │
│          ↓                                  ↓                   │
│   ✅ Reutilização                  ❌ Duplicação                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 🏠 Analogia: A Reforma vs. A Construção

Imagine que você quer um quarto novo na sua casa:

| Humano | IA (sem IDS) |
|--------|--------------|
| "Já tenho um quarto de hóspedes. Vou transformá-lo." | "Vou construir uma casa inteira nova!" |
| Compra tinta e móveis novos | Contrata arquiteto, engenheiro, pedreiros |
| Gasta R$ 5.000 e 1 semana | Gasta R$ 500.000 e 12 meses |
| Resultado: quarto novo | Resultado: casa nova (mas você só queria um quarto) |

**O IDS ensina a IA a pensar como o humano**: primeiro olhar o que já existe, depois decidir se reforma ou constrói.

---

## A Solução: IDS

O **Incremental Development System** é um conjunto de ferramentas e processos que força os agentes IA a:

1. **Consultar antes de criar** - Sempre olhar o inventário primeiro
2. **Seguir uma hierarquia** - REUSE > ADAPT > CREATE
3. **Justificar decisões** - Se criar algo novo, explicar por quê
4. **Passar por portões** - Verificação em cada etapa
5. **Auto-corrigir** - Sistema detecta e corrige problemas

### 🏪 Analogia: O Almoxarifado Inteligente

Pense no IDS como um almoxarifado de empresa com um funcionário muito rigoroso:

```
┌─────────────────────────────────────────────────────────────────┐
│                      🏪 ALMOXARIFADO IDS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Você: "Preciso de uma caneta azul"                            │
│                                                                 │
│  Almoxarife: "Deixa eu ver no sistema..."                      │
│              [Consulta Entity Registry]                         │
│                                                                 │
│              "Achei 3 opções:                                  │
│               - Caneta azul BIC (95% compatível) → REUSE       │
│               - Caneta preta BIC (80% + azul) → ADAPT          │
│               - Nada parecido → CREATE"                        │
│                                                                 │
│  Você: "Quero criar uma nova mesmo"                            │
│                                                                 │
│  Almoxarife: "Tá, mas preciso que você assine aqui             │
│               explicando por que a BIC azul não serve."        │
│               [CREATE Justification Required]                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## REUSE > ADAPT > CREATE

Esta é a **hierarquia de decisão** do IDS. Sempre nesta ordem de prioridade.

### Os Três Níveis

| Decisão | Quando Usar | Score de Match | Analogia |
|---------|-------------|----------------|----------|
| **REUSE** | Já existe algo perfeito | ≥ 90% | Usar a mesma roupa de ontem (ainda está limpa) |
| **ADAPT** | Existe algo similar | 60-89% | Ajustar a barra da calça (serve, mas precisa de pequeno ajuste) |
| **CREATE** | Não existe nada útil | < 60% | Comprar roupa nova (nada no guarda-roupa serve) |

### 🎸 Analogia: O Músico e as Músicas

```
REUSE (≥90%):
"Preciso tocar uma música romântica no casamento"
→ "Já tenho 'Perfect' do Ed Sheeran no repertório. Uso ela!"
→ Zero trabalho novo. Máxima eficiência.

ADAPT (60-89%):
"Preciso tocar uma música romântica em português"
→ "Tenho 'Perfect', mas é em inglês. Vou adaptar a letra!"
→ Trabalho parcial. Aproveita estrutura existente.

CREATE (<60%):
"Preciso de um jingle para o cliente XYZ"
→ "Não tenho nada que sirva. Vou compor do zero."
→ Trabalho total. Mas JUSTIFICADO.
```

### A Matriz de Decisão (Técnica)

```javascript
if (relevanceScore >= 0.9) {
  return 'REUSE';  // Usa direto, sem alteração
}

if (relevanceScore >= 0.6 &&
    canAdapt >= 0.6 &&
    impactOnOthers < 30%) {
  return 'ADAPT';  // Modifica, com cuidado
}

return 'CREATE';   // Cria novo, com justificativa
```

### ⚠️ O Limite de 30%

> **Roundtable Adjustment #2:** O threshold de 30% é empírico. Será calibrado após 90 dias de uso.

**Analogia do Navio:**
- Se você reforma menos de 30% do navio, ainda é o mesmo navio
- Se você reforma mais de 30%, praticamente está construindo outro
- Quando a "reforma" afeta muita coisa, melhor criar do zero

---

## Entity Registry (O Inventário)

O Entity Registry é o **banco de dados central** que guarda informações sobre todos os artefatos do sistema.

### 📦 Analogia: O Estoque da Netflix

Assim como a Netflix tem um catálogo com metadados de cada filme (gênero, duração, atores, avaliação), o Entity Registry tem:

| Campo | O que é | Analogia Netflix |
|-------|---------|------------------|
| `path` | Onde o arquivo está | URL do vídeo |
| `type` | Tipo do artefato (task, template, script) | Gênero (filme, série, documentário) |
| `purpose` | O que ele faz | Sinopse |
| `keywords` | Palavras-chave para busca | Tags (ação, romance, comédia) |
| `usedBy` | Quem usa este artefato | "Quem assistiu X também assistiu Y" |
| `dependencies` | Do que ele depende | "Para assistir a Parte 2, assista a Parte 1" |
| `adaptability` | Quão fácil é modificar (0-1) | "Disponível para download" (sim/não) |
| `checksum` | Impressão digital do arquivo | Hash de verificação |

### Exemplo Real do Registry

```yaml
entities:
  tasks:
    create-story:
      path: ".aiox-core/development/tasks/create-story.md"
      type: "task"
      purpose: "Gera stories de desenvolvimento a partir de requisitos"
      keywords: ["story", "create", "development", "agile"]
      usedBy: ["@sm", "@po", "workflow-story-creation"]
      dependencies: ["template-story", "checklist-story"]
      adaptability:
        score: 0.7  # Fácil de adaptar
        constraints: ["Não alterar estrutura YAML"]
        extensionPoints: ["Adicionar campos customizados"]
      checksum: "sha256:abc123..."
```

### 🔍 Como Funciona a Busca

```
Você: "Preciso criar uma task de deploy"

Registry: "Deixa eu procurar..."
          [TF-IDF + Fuzzy Match]

Resultados:
1. deploy-to-production.md (92% match) → REUSE!
2. deploy-staging.md (78% match) → ADAPT?
3. ci-cd-pipeline.md (45% match) → CREATE se nada servir
```

---

## Decision Engine (O Cérebro)

O Decision Engine é o **algoritmo que analisa** seu pedido e recomenda REUSE, ADAPT ou CREATE.

### 🧠 Analogia: O Personal Shopper

Imagine que você contratou um personal shopper muito criterioso:

```
┌─────────────────────────────────────────────────────────────────┐
│                     🧠 DECISION ENGINE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT: "Preciso de uma camisa social azul para entrevista"    │
│                                                                 │
│  PROCESSO:                                                      │
│  1. Abre seu guarda-roupa (Entity Registry)                    │
│  2. Analisa cada peça                                          │
│  3. Calcula compatibilidade                                     │
│  4. Considera impacto ("Se eu usar essa, combina com o quê?")  │
│                                                                 │
│  OUTPUT:                                                        │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ RECOMENDAÇÃO: ADAPT                                       │ │
│  │ Confiança: MÉDIA                                          │ │
│  │                                                           │ │
│  │ Artefato: camisa-social-branca.md                        │ │
│  │ Match: 75%                                                │ │
│  │ Ação: Tingir de azul (adaptar para novo contexto)        │ │
│  │                                                           │ │
│  │ Razão: "Já tem camisa social. Cor é adaptável.           │ │
│  │         Comprar nova seria desperdício."                  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### TF-IDF: A Mágica da Busca

**TF-IDF** (Term Frequency - Inverse Document Frequency) é como o algoritmo encontra matches:

```
Analogia: Escolhendo um Filme

TF (Frequência do Termo):
- "Ação" aparece 50x na descrição → Alta relevância para ação

IDF (Raridade do Termo):
- "Filme" aparece em TODOS → Não ajuda a diferenciar
- "Samurai" aparece em 3 filmes → Muito diferenciador

Combinado:
- Busca: "Filme de ação com samurai"
- TF-IDF encontra: "Kill Bill" (ação=alta, samurai=raro)
- Ignora: "Velozes e Furiosos" (ação=alta, samurai=zero)
```

### CREATE Justification (Roundtable #4)

> **Nova Regra:** Toda decisão CREATE deve incluir justificativa completa.

```javascript
// Estrutura obrigatória para CREATE
{
  action: 'CREATE',
  confidence: 'low',
  justification: {
    evaluated_patterns: ['task-A', 'task-B', 'script-C'],
    rejection_reasons: {
      'task-A': 'Não suporta webhooks que eu preciso',
      'task-B': 'Específico para @pm, preciso genérico',
      'script-C': 'Performance >500ms, preciso <100ms'
    },
    new_capability: 'Task genérica com webhooks e <100ms',
    review_scheduled: '2026-03-07'  // 30 dias depois
  }
}
```

### 🏛️ Analogia: O Juiz e o Processo

CREATE sem justificativa é como pedir novo julgamento sem explicar por quê:

| Sem IDS | Com IDS |
|---------|---------|
| "Quero criar task nova" | "Quero criar task nova porque..." |
| "Ok, criado!" | "Quais existentes você avaliou?" |
| Nenhuma accountability | "task-A não serve pois X, task-B não serve pois Y" |
| Duplicação prolifera | "Ok, justificado. Revisão em 30 dias." |

---

## Verification Gates (Os Portões)

Os Gates são **pontos de verificação** ao longo do fluxo de desenvolvimento.

### 🚦 Analogia: Os Pedágios da Rodovia

```
┌─────────────────────────────────────────────────────────────────┐
│                   🚦 VERIFICATION GATES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   INÍCIO                                                        │
│     │                                                           │
│     ▼                                                           │
│   ┌─────┐  "Já existe epic similar?"                           │
│   │ G1  │  @pm - ADVISORY (pode passar, mas avisa)             │
│   └──┬──┘                                                       │
│      │                                                          │
│      ▼                                                          │
│   ┌─────┐  "Existem tasks que cobrem isso?"                    │
│   │ G2  │  @sm - ADVISORY                                       │
│   └──┬──┘                                                       │
│      │                                                          │
│      ▼                                                          │
│   ┌─────┐  "Referências da story são válidas?"                 │
│   │ G3  │  @po - SOFT BLOCK (pode override com justificativa)  │
│   └──┬──┘                                                       │
│      │                                                          │
│      ▼                                                          │
│   ┌─────┐  "Lembrete: consulte o registry!"                    │
│   │ G4  │  @dev - INFORMATIONAL (só loga, não bloqueia)        │
│   └──┬──┘  ⚡ <2s - AUTOMÁTICO                                  │
│      │                                                          │
│      ▼                                                          │
│   ┌─────┐  "Código novo poderia ter reusado existente?"        │
│   │ G5  │  @qa - BLOCKS MERGE (se violação detectada)          │
│   └──┬──┘  ⚡ <30s - AUTOMÁTICO                                 │
│      │                                                          │
│      ▼                                                          │
│   ┌─────┐  "Registry íntegro? Tudo registrado?"                │
│   │ G6  │  @devops - BLOCKS ON CRITICAL                         │
│   └──┬──┘  ⚡ <60s - AUTOMÁTICO                                 │
│      │                                                          │
│      ▼                                                          │
│    FIM ✅                                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Classificação dos Gates (Roundtable #3)

| Gate | Agente | Tipo | Latência | Comportamento |
|------|--------|------|----------|---------------|
| G1 | @pm | Human-in-loop | < 24h | Advisory only |
| G2 | @sm | Human-in-loop | < 24h | Advisory only |
| G3 | @po | Human-in-loop | < 4h | Soft block |
| G4 | @dev | **AUTOMÁTICO** | **< 2s** | Informational |
| G5 | @qa | **AUTOMÁTICO** | **< 30s** | Blocks merge |
| G6 | @devops | **AUTOMÁTICO** | **< 60s** | Blocks critical |

> **Roundtable #3:** Gates G4-G6 DEVEM ser automáticos. Verificação manual em runtime cria fricção inaceitável.

### 🏭 Analogia: Controle de Qualidade na Fábrica

```
G1-G3: Supervisores humanos no início da linha
       "Ei, esse produto já não existe? Vamos otimizar."
       → Conselho, não bloqueio

G4:    Sensor automático na esteira
       "Bip! Lembrete: verifique especificações."
       → Só avisa, não para a linha

G5:    Scanner de qualidade antes da embalagem
       "ALERTA! Produto fora do padrão. Linha parada."
       → Para até corrigir

G6:    Inspeção final antes do caminhão
       "CRÍTICO: Lote com defeito. Não pode sair."
       → Bloqueia envio
```

---

## Self-Healing (Auto-Cura)

O sistema de Self-Healing **detecta e corrige problemas automaticamente**.

### 🏥 Analogia: O Sistema Imunológico

```
┌─────────────────────────────────────────────────────────────────┐
│                   🏥 SELF-HEALING SYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CORPO HUMANO              │  ENTITY REGISTRY                   │
│  ─────────────             │  ───────────────                   │
│                            │                                    │
│  Vírus entra               │  Arquivo deletado                  │
│       ↓                    │       ↓                            │
│  Febre (alerta)            │  Warning (alerta)                  │
│       ↓                    │       ↓                            │
│  Anticorpos atacam         │  Auto-heal remove referência       │
│       ↓                    │       ↓                            │
│  Vírus eliminado           │  Registry corrigido                │
│       ↓                    │       ↓                            │
│  Memória imunológica       │  Log de healing                    │
│                            │                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Três Categorias de Saúde (Roundtable #6)

#### A. Integridade de Dados (Física)

| Problema | Severidade | Auto-Heal? | Ação |
|----------|------------|------------|------|
| Arquivo deletado | CRITICAL | ❌ | Avisa humano |
| Checksum errado | HIGH | ✅ | Recalcula |
| Referência órfã | MEDIUM | ✅ | Remove ref |
| Schema inválido | HIGH | ❌ | Avisa humano |

**Analogia:** É como verificar se todos os órgãos estão no lugar e funcionando.

#### B. Integridade de Performance (Funcional)

| Problema | Threshold | Auto-Heal? | Ação |
|----------|-----------|------------|------|
| Query lenta | > 100ms | ✅ | Rebuild index |
| Cache baixo | < 70% hit | ✅ | Expand cache |
| Index antigo | > 1 hora | ✅ | Rebuild TF-IDF |

**Analogia:** É como verificar se o coração bate no ritmo certo e os pulmões respiram bem.

#### C. Integridade de Qualidade (Evolutiva)

| Problema | Critério | Auto-Heal? | Ação |
|----------|----------|------------|------|
| Near-duplicate | > 95% similar | ❌ | Sugere merge |
| Entity stale | 90 dias sem ref | ✅ | Flag archive |
| False CREATE | 60 dias, 0 reuse | ❌ | Queue review |

**Analogia:** É como verificar se o corpo está evoluindo bem - não tem células cancerosas (duplicatas) ou partes atrofiadas (stale).

### O Fluxo de Healing

```
                    ┌─────────────────┐
                    │  Health Check   │
                    │   Scheduler     │
                    └────────┬────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │     Detecta Problema         │
              │  (Data/Performance/Quality)  │
              └──────────────┬───────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌───────────┐      ┌───────────┐
            │ Auto-Heal │      │  Warning  │
            │ (Simple)  │      │ (Complex) │
            └─────┬─────┘      └─────┬─────┘
                  │                  │
                  ▼                  ▼
            ┌───────────┐      ┌───────────┐
            │  Backup   │      │  Notify   │
            │  + Fix    │      │  Human    │
            └─────┬─────┘      └───────────┘
                  │
                  ▼
            ┌───────────┐
            │   Log     │
            │  Action   │
            └───────────┘
```

---

## Métricas de Sucesso

### CREATE Rate: A Métrica Principal (Roundtable #5)

O **CREATE Rate** mede quanto o sistema está funcionando:

```
┌─────────────────────────────────────────────────────────────────┐
│                   📊 CREATE RATE EVOLUTION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  100% │                                                         │
│       │ ████                                                    │
│   80% │ ████                                                    │
│       │ ████ ████                                               │
│   60% │ ████ ████                                               │
│       │ ████ ████ ████                                          │
│   40% │ ████ ████ ████                                          │
│       │ ████ ████ ████ ████                                     │
│   20% │ ████ ████ ████ ████ ████                                │
│       │ ████ ████ ████ ████ ████ ████                           │
│    0% └─────────────────────────────────────────────────────    │
│         M1-3   M4-6   M7-9  M10-12  M13+                        │
│                                                                 │
│  Mês 1-3:  50-60% CREATE (Normal - construindo registry)       │
│  Mês 4-6:  30-40% CREATE (Saudável - padrões emergindo)        │
│  Mês 7-12: 15-25% CREATE (Maduro - sistema funcionando)        │
│  Mês 12+:  <15% CREATE (Ótimo - cultura de reuso forte)        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 🌱 Analogia: O Jardim que Cresce

```
Mês 1-3: PLANTIO
"Estou plantando todas as sementes (criando entities)"
CREATE alto é esperado - estamos construindo o inventário

Mês 4-6: CRESCIMENTO
"As plantas estão crescendo, começo a colher algumas"
CREATE médio - já temos coisas para reusar

Mês 7-12: COLHEITA
"Colho mais do que planto"
CREATE baixo - a maior parte já existe

Mês 12+: JARDIM MADURO
"Quase só mantenho e colho"
CREATE mínimo - só coisas realmente novas
```

### Dashboard de Saúde

```
┌─────────────────────────────────────────────────────────────────┐
│                    AIOX IDS DASHBOARD                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  REGISTRY HEALTH          DECISION METRICS                      │
│  ─────────────────        ─────────────────                     │
│  Entities: 847            REUSE:  45% ████████░░                │
│  Categories: 12           ADAPT:  35% ███████░░░                │
│  Last Sync: 2s ago        CREATE: 20% ████░░░░░░                │
│  Integrity: ✅ 100%                                              │
│                           CREATE Trend: ↓ 5% (good!)            │
│                                                                 │
│  GATE PERFORMANCE         SELF-HEALING                          │
│  ─────────────────        ─────────────                         │
│  G4: 1.2s avg ✅          Issues Found: 3                       │
│  G5: 18s avg ✅           Auto-Fixed: 2                         │
│  G6: 45s avg ✅           Warnings: 1                           │
│                           Last Check: 4h ago                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Glossário Visual

### Conceitos Principais

| Termo | Definição Simples | Analogia |
|-------|-------------------|----------|
| **IDS** | Sistema que ensina IA a reusar | GPS que mostra caminhos existentes antes de criar novos |
| **Entity Registry** | Inventário de todos os artefatos | Catálogo da Netflix |
| **Decision Engine** | Algoritmo que decide REUSE/ADAPT/CREATE | Personal shopper criterioso |
| **TF-IDF** | Técnica de busca por relevância | Google Search do código |
| **Verification Gate** | Ponto de checagem no fluxo | Pedágio da rodovia |
| **Self-Healing** | Auto-correção de problemas | Sistema imunológico |
| **CREATE Rate** | % de criações vs reuso | Termômetro de eficiência |
| **Adaptability Score** | Quão fácil modificar (0-1) | Nota de "maleabilidade" |
| **Checksum** | Impressão digital do arquivo | DNA do documento |

### Os 6 Gates

| Gate | Emoji | Quem | Tipo | Analogia |
|------|-------|------|------|----------|
| G1 | 📋 | @pm | Advisory | Recepcionista que sugere |
| G2 | 📝 | @sm | Advisory | Consultor que aconselha |
| G3 | ✅ | @po | Soft Block | Gerente que pode vetar |
| G4 | ⚡ | @dev | Info | Sensor automático |
| G5 | 🔍 | @qa | Block | Inspetor de qualidade |
| G6 | 🚀 | @devops | Critical | Controle final de embarque |

### Thresholds Importantes

| Valor | Significado | Analogia |
|-------|-------------|----------|
| **90%** | Limite para REUSE direto | "Praticamente igual" |
| **60%** | Limite mínimo para ADAPT | "Dá pra adaptar" |
| **30%** | Impacto máximo de ADAPT | "Mais que isso, melhor criar novo" |
| **100ms** | SLA de query do registry | "Instantâneo para humanos" |
| **2s** | SLA do Gate G4 | "Imperceptível no fluxo" |
| **70%** | Cache hit rate mínimo | "Eficiência de memória" |

---

## Fluxo Completo: Uma Jornada

```
┌─────────────────────────────────────────────────────────────────┐
│              🎬 A JORNADA DE UM DESENVOLVEDOR                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. INTENÇÃO                                                    │
│     "Preciso criar uma task de deploy automático"              │
│                                                                 │
│  2. CONSULTA (Decision Engine)                                  │
│     [Registry Query] → Encontrados 3 matches                    │
│                                                                 │
│  3. ANÁLISE                                                     │
│     - deploy-staging.md: 85% match                             │
│     - deploy-manual.md: 72% match                              │
│     - ci-pipeline.md: 45% match                                │
│                                                                 │
│  4. DECISÃO                                                     │
│     [Decision Matrix]                                          │
│     → 85% < 90% (não REUSE)                                    │
│     → 85% ≥ 60% + adaptável + impacto 15% (ADAPT!)             │
│                                                                 │
│  5. AÇÃO                                                        │
│     Adapta deploy-staging.md para deploy-production.md         │
│                                                                 │
│  6. GATES                                                       │
│     G4: ✅ "Boa escolha de ADAPT" (logged)                     │
│     G5: ✅ "Adaptação válida" (approved)                       │
│     G6: ✅ "Registry atualizado" (synced)                      │
│                                                                 │
│  7. RESULTADO                                                   │
│     Task criada com 15% de código novo (vs 100% se CREATE)     │
│     Registry atualizado automaticamente                         │
│     Auditoria completa registrada                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Resumo Executivo

### O Problema
IAs criam código novo por padrão, enquanto humanos reutilizam. Isso causa duplicação e dívida técnica.

### A Solução
IDS força a hierarquia **REUSE > ADAPT > CREATE** através de:
- **Registry:** Inventário centralizado de tudo
- **Decision Engine:** Algoritmo que recomenda a melhor ação
- **Gates:** Verificações em cada etapa
- **Self-Healing:** Auto-correção de problemas

### Os Ajustes do Roundtable

| # | Ajuste | Impacto |
|---|--------|---------|
| 1 | Performance SLA < 100ms | Registry rápido como Google |
| 2 | 30% Threshold calibrável | Flexibilidade para ajustar |
| 3 | G4-G6 automáticos | Zero fricção no dev |
| 4 | CREATE justification | Accountability para criações |
| 5 | CREATE rate metric | Termômetro de saúde |
| 6 | Self-healing expandido | Sistema imunológico completo |

### A Meta Final

```
De:  IA cria 80% do código do zero
Para: IA reusa 85% e cria apenas 15% (o realmente novo)

Resultado:
- Menos código duplicado
- Menos dívida técnica
- Mais consistência
- Desenvolvimento mais rápido
```

---

## Comandos Úteis

```bash
# Consultar o registry
aiox ids:query "deploy automático"

# Ver estatísticas
aiox ids:stats

# Verificar saúde
aiox ids:health

# Corrigir problemas simples
aiox ids:health --fix

# Backup do registry
aiox ids:backup

# Forçar sync completo
aiox ids:sync
```

---

*Documento criado por Pedro Valério Lopez (via Mind Clone)*
*Consolidando: Epic IDS, 6 Stories, 6 Roundtable Adjustments*
*"Se não está documentado, não existe."*
