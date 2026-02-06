# Workflow: Brownfield Service/API Enhancement

**Identificador:** `brownfield-service`
**Tipo:** Brownfield (Sistemas Existentes)
**Versao:** 1.0
**Ultima Atualizacao:** 2026-02-04

---

## Visao Geral

O workflow **Brownfield Service/API Enhancement** e projetado para aprimorar servicos backend e APIs existentes com novos recursos, modernizacao ou melhorias de desempenho. Ele gerencia analise de sistemas existentes e integracao segura, garantindo que mudancas sejam implementadas sem interromper funcionalidades criticas.

### Casos de Uso

| Tipo de Projeto | Descricao |
|-----------------|-----------|
| **Service Modernization** | Atualizacao de servicos legados para tecnologias modernas |
| **API Enhancement** | Adicao de novos endpoints ou melhorias em APIs existentes |
| **Microservice Extraction** | Extracao de modulos de um monolito para microservicos |
| **Performance Optimization** | Otimizacao de performance em servicos existentes |
| **Integration Enhancement** | Melhoria de integracoes entre sistemas |

### Quando Utilizar

- Aprimoramento de servico requer stories coordenadas
- Versionamento de API ou breaking changes necessarios
- Alteracoes em schema de banco de dados requeridas
- Melhorias de performance ou escalabilidade necessarias
- Multiplos pontos de integracao afetados

---

## Diagrama do Workflow

```mermaid
graph TD
    subgraph "Fase 1: Planejamento"
        A[Inicio: Service Enhancement] --> B["@architect: Analisar Servico Existente<br/>(document-project)"]
        B --> C["@pm: Criar PRD<br/>(brownfield-prd-tmpl)"]
        C --> D["@architect: Criar Arquitetura<br/>(brownfield-architecture-tmpl)"]
    end

    subgraph "Fase 2: Validacao"
        D --> E["@po: Validar Artefatos<br/>(po-master-checklist)"]
        E --> F{PO encontrou<br/>problemas?}
        F -->|Sim| G[Retornar ao agente<br/>relevante para correcoes]
        G --> E
        F -->|Nao| H["@po: Fragmentar Documentos<br/>(shard-doc)"]
    end

    subgraph "Fase 3: Ciclo de Desenvolvimento"
        H --> I["@sm: Criar Story<br/>(create-next-story)"]
        I --> J{Revisar draft<br/>da story?}
        J -->|Sim| K["@analyst/@pm: Revisar e<br/>Aprovar Story"]
        J -->|Nao| L["@dev: Implementar Story<br/>(develop-story)"]
        K --> L
        L --> M{QA Review?}
        M -->|Sim| N["@qa: Revisar Implementacao<br/>(review-story)"]
        M -->|Nao| O{Mais stories?}
        N --> P{QA encontrou<br/>problemas?}
        P -->|Sim| Q["@dev: Corrigir Feedback QA"]
        P -->|Nao| O
        Q --> N
        O -->|Sim| I
        O -->|Nao| R{Epic<br/>Retrospective?}
    end

    subgraph "Fase 4: Finalizacao"
        R -->|Sim| S["@po: Epic Retrospective<br/>(epic-retrospective)"]
        R -->|Nao| T[Projeto Completo]
        S --> T
    end

    style A fill:#E8F5E9,stroke:#4CAF50
    style T fill:#90EE90,stroke:#2E7D32
    style H fill:#ADD8E6,stroke:#1976D2
    style I fill:#ADD8E6,stroke:#1976D2
    style L fill:#ADD8E6,stroke:#1976D2
    style C fill:#FFE4B5,stroke:#F57C00
    style D fill:#FFE4B5,stroke:#F57C00
    style K fill:#F0E68C,stroke:#FBC02D
    style N fill:#F0E68C,stroke:#FBC02D
    style S fill:#F0E68C,stroke:#FBC02D
    style F fill:#FFCDD2,stroke:#E53935
    style P fill:#FFCDD2,stroke:#E53935
```

---

## Diagrama de Sequencia

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant Architect as @architect (Aria)
    participant PM as @pm (Morgan)
    participant PO as @po (Pax)
    participant SM as @sm (River)
    participant Analyst as @analyst (Atlas)
    participant Dev as @dev (Dex)
    participant QA as @qa (Quinn)

    rect rgb(232, 245, 233)
        Note over User,QA: Fase 1: Planejamento
        User->>Architect: Iniciar Enhancement
        Architect->>Architect: Analisar servico existente
        Architect-->>PM: Documentacao do projeto
        PM->>PM: Criar PRD (brownfield-prd-tmpl)
        PM-->>Architect: PRD pronto
        Architect->>Architect: Criar arquitetura (brownfield-architecture-tmpl)
        Architect-->>PO: Arquitetura pronta
    end

    rect rgb(255, 243, 224)
        Note over User,QA: Fase 2: Validacao
        PO->>PO: Validar com po-master-checklist
        alt PO encontra problemas
            PO-->>PM: Solicitar correcoes no PRD
            PM->>PM: Corrigir PRD
            PM-->>PO: PRD atualizado
        end
        PO->>PO: Fragmentar documentos (shard-doc)
        PO-->>SM: Documentos fragmentados prontos
    end

    rect rgb(227, 242, 253)
        Note over User,QA: Fase 3: Ciclo de Desenvolvimento
        loop Para cada epic/story
            SM->>SM: Criar story (create-next-story)
            opt Review opcional
                SM-->>Analyst: Story em Draft
                Analyst->>Analyst: Revisar completude
                Analyst-->>SM: Story aprovada
            end
            SM-->>Dev: Story pronta para desenvolvimento
            Dev->>Dev: Implementar story (develop-story)
            Dev-->>QA: Pronto para review
            opt QA Review opcional
                QA->>QA: Revisar implementacao
                alt QA encontra problemas
                    QA-->>Dev: Feedback com itens pendentes
                    Dev->>Dev: Corrigir issues
                    Dev-->>QA: Correcoes aplicadas
                end
            end
        end
    end

    rect rgb(243, 229, 245)
        Note over User,QA: Fase 4: Finalizacao
        opt Epic Retrospective opcional
            PO->>PO: Conduzir retrospectiva
            PO-->>User: Documentar aprendizados
        end
        PO-->>User: Projeto Completo!
    end
```

---

## Steps Detalhados

### Step 1: Analise do Servico

| Atributo | Valor |
|----------|-------|
| **Agente** | @architect (Aria) |
| **Task** | `document-project` |
| **Input** | Servico/API existente, metricas de performance, documentacao atual |
| **Output** | Multiplos documentos conforme template document-project |
| **Notas** | Revisar documentacao existente, codebase, metricas de performance e identificar dependencias de integracao |

**Ativacao:**
```
@architect
*document-project
```

---

### Step 2: Criacao do PRD

| Atributo | Valor |
|----------|-------|
| **Agente** | @pm (Morgan) |
| **Task** | `create-doc` com `brownfield-prd-tmpl` |
| **Input** | Analise do servico existente |
| **Output** | `docs/prd.md` |
| **Requer** | Analise do servico existente concluida |
| **Notas** | Criar PRD abrangente focado em aprimoramento de servico com analise do sistema existente |

**Ativacao:**
```
@pm
*create-brownfield-prd
```

**IMPORTANTE:** Salvar o arquivo final `prd.md` na pasta `docs/` do projeto.

---

### Step 3: Criacao da Arquitetura

| Atributo | Valor |
|----------|-------|
| **Agente** | @architect (Aria) |
| **Task** | `create-doc` com `brownfield-architecture-tmpl` |
| **Input** | PRD (`docs/prd.md`) |
| **Output** | `docs/architecture.md` |
| **Requer** | PRD aprovado |
| **Notas** | Criar arquitetura com estrategia de integracao de servico e planejamento de evolucao de API |

**Ativacao:**
```
@architect
*create-brownfield-architecture
```

**IMPORTANTE:** Salvar o arquivo final `architecture.md` na pasta `docs/` do projeto.

---

### Step 4: Validacao dos Artefatos

| Atributo | Valor |
|----------|-------|
| **Agente** | @po (Pax) |
| **Task** | `execute-checklist` com `po-master-checklist` |
| **Input** | Todos os artefatos (PRD, Arquitetura) |
| **Output** | Relatorio de validacao |
| **Notas** | Validar todos os documentos para seguranca de integracao de servico e compatibilidade de API. Pode requerer atualizacoes em qualquer documento. |

**Ativacao:**
```
@po
*execute-checklist-po
```

---

### Step 5: Correcao de Problemas (Condicional)

| Atributo | Valor |
|----------|-------|
| **Agente** | Varia conforme o documento com problema |
| **Task** | Correcao especifica do documento |
| **Input** | Feedback do PO |
| **Output** | Documentos atualizados |
| **Condicao** | PO encontrou problemas no checklist |
| **Notas** | Se PO encontrar problemas, retornar ao agente relevante para corrigir e re-exportar documentos atualizados para a pasta `docs/` |

---

### Step 6: Fragmentacao de Documentos

| Atributo | Valor |
|----------|-------|
| **Agente** | @po (Pax) |
| **Task** | `shard-doc` |
| **Input** | Todos os artefatos validados em `docs/` |
| **Output** | Pastas `docs/prd/` e `docs/architecture/` com conteudo fragmentado |
| **Requer** | Todos os artefatos na pasta do projeto |
| **Notas** | Fragmentar documentos para desenvolvimento no IDE |

**Opcoes de Ativacao:**

**Opcao A - Via Agente PO:**
```
@po
shard docs/prd.md
```

**Opcao B - Manual:**
Arrastar a task `shard-doc` + `docs/prd.md` para o chat.

---

### Step 7: Criacao de Stories

| Atributo | Valor |
|----------|-------|
| **Agente** | @sm (River) |
| **Task** | `create-next-story` |
| **Input** | Documentos fragmentados |
| **Output** | `story.md` |
| **Requer** | Documentos fragmentados |
| **Repete** | Para cada epic |
| **Notas** | Story inicia com status "Draft" |

**Ativacao (Nova sessao de chat):**
```
@sm
*draft
```

---

### Step 8: Revisao de Story Draft (Opcional)

| Atributo | Valor |
|----------|-------|
| **Agente** | @analyst (Atlas) ou @pm (Morgan) |
| **Task** | `review-draft-story` (em desenvolvimento) |
| **Input** | Story em Draft |
| **Output** | Story atualizada |
| **Requer** | Story criada |
| **Opcional** | Sim - quando usuario deseja revisao da story |
| **Condicao** | Usuario solicita revisao |
| **Notas** | Revisar completude e alinhamento da story. Atualizar status: Draft -> Approved |

---

### Step 9: Implementacao da Story

| Atributo | Valor |
|----------|-------|
| **Agente** | @dev (Dex) |
| **Task** | `develop-story` |
| **Input** | Story aprovada |
| **Output** | Arquivos de implementacao |
| **Requer** | Story aprovada (nao em Draft) |
| **Notas** | Implementar story aprovada, atualizar File List com todas as alteracoes, marcar story como "Review" quando completo |

**Ativacao (Nova sessao de chat):**
```
@dev
*develop {story-id}
```

---

### Step 10: Revisao QA (Opcional)

| Atributo | Valor |
|----------|-------|
| **Agente** | @qa (Quinn) |
| **Task** | `review-story` |
| **Input** | Arquivos de implementacao |
| **Output** | Implementacao atualizada + Checklist QA |
| **Opcional** | Sim |
| **Notas** | Revisao de dev senior com capacidade de refatoracao. Corrige pequenos problemas diretamente. Deixa checklist para itens restantes. Atualiza status da story (Review -> Done ou permanece Review) |

**Ativacao (Nova sessao de chat):**
```
@qa
*review {story-id}
```

---

### Step 11: Correcao de Feedback QA (Condicional)

| Atributo | Valor |
|----------|-------|
| **Agente** | @dev (Dex) |
| **Task** | `apply-qa-fixes` |
| **Input** | Feedback do QA com itens pendentes |
| **Output** | Implementacao corrigida |
| **Condicao** | QA deixou itens nao marcados |
| **Notas** | Se QA deixou itens pendentes: Dev (nova sessao) corrige itens restantes e retorna ao QA para aprovacao final |

**Ativacao (Nova sessao de chat):**
```
@dev
*apply-qa-fixes
```

---

### Step 12: Repetir Ciclo de Desenvolvimento

| Atributo | Valor |
|----------|-------|
| **Acao** | Repetir steps 7-11 |
| **Notas** | Repetir ciclo de story (SM -> Dev -> QA) para todas as stories do epic. Continuar ate que todas as stories no PRD estejam completas. |

---

### Step 13: Retrospectiva do Epic (Opcional)

| Atributo | Valor |
|----------|-------|
| **Agente** | @po (Pax) |
| **Task** | `epic-retrospective` (em desenvolvimento) |
| **Input** | Epic completo |
| **Output** | `epic-retrospective.md` |
| **Condicao** | Epic completo |
| **Opcional** | Sim |
| **Notas** | Validar que o epic foi completado corretamente. Documentar aprendizados e melhorias. |

---

### Step 14: Fim do Workflow

| Atributo | Valor |
|----------|-------|
| **Acao** | Projeto completo |
| **Notas** | Todas as stories implementadas e revisadas! Fase de desenvolvimento do projeto completa. |

**Referencia:** `.aios-core/data/aios-kb.md#IDE Development Workflow`

---

## Agentes Participantes

```mermaid
graph LR
    subgraph "Agentes de Planejamento"
        Architect["@architect<br/>Aria<br/>Holistic System Architect"]
        PM["@pm<br/>Morgan<br/>Product Manager"]
        Analyst["@analyst<br/>Atlas<br/>Business Analyst"]
    end

    subgraph "Agentes de Gestao"
        PO["@po<br/>Pax<br/>Product Owner"]
        SM["@sm<br/>River<br/>Scrum Master"]
    end

    subgraph "Agentes de Execucao"
        Dev["@dev<br/>Dex<br/>Full Stack Developer"]
        QA["@qa<br/>Quinn<br/>Test Architect"]
    end

    Architect -->|"PRD"| PM
    PM -->|"Arquitetura"| Architect
    Architect -->|"Validacao"| PO
    PO -->|"Stories"| SM
    SM -->|"Implementacao"| Dev
    Dev -->|"Review"| QA
    QA -->|"Feedback"| Dev
    Analyst -.->|"Revisao opcional"| SM

    style Architect fill:#E1BEE7,stroke:#7B1FA2
    style PM fill:#BBDEFB,stroke:#1976D2
    style Analyst fill:#C8E6C9,stroke:#388E3C
    style PO fill:#FFE0B2,stroke:#F57C00
    style SM fill:#B2DFDB,stroke:#00796B
    style Dev fill:#FFECB3,stroke:#FFA000
    style QA fill:#F8BBD9,stroke:#C2185B
```

### Tabela de Agentes

| Agente | Nome | Papel | Responsabilidades no Workflow |
|--------|------|-------|------------------------------|
| @architect | Aria | Holistic System Architect | Analise de servico existente, criacao de arquitetura |
| @pm | Morgan | Product Manager | Criacao de PRD para brownfield |
| @po | Pax | Product Owner | Validacao de artefatos, fragmentacao de docs, retrospectiva |
| @sm | River | Scrum Master | Criacao de stories |
| @analyst | Atlas | Business Analyst | Revisao opcional de story drafts |
| @dev | Dex | Full Stack Developer | Implementacao de stories, correcao de feedback |
| @qa | Quinn | Test Architect | Revisao de implementacao, quality gates |

---

## Tasks Executadas

### Tasks Principais

| Task | Template/Checklist | Agente | Fase |
|------|-------------------|--------|------|
| `document-project` | document-project template | @architect | Planejamento |
| `create-doc` | `brownfield-prd-tmpl.yaml` | @pm | Planejamento |
| `create-doc` | `brownfield-architecture-tmpl.yaml` | @architect | Planejamento |
| `execute-checklist` | `po-master-checklist.md` | @po | Validacao |
| `shard-doc` | - | @po | Validacao |
| `create-next-story` | `story-tmpl.yaml` | @sm | Desenvolvimento |
| `develop-story` | - | @dev | Desenvolvimento |
| `review-story` | - | @qa | Desenvolvimento |
| `apply-qa-fixes` | - | @dev | Desenvolvimento |

### Tasks Futuras (Em Desenvolvimento)

| Task | Agente | Status |
|------|--------|--------|
| `story-review` | @analyst/@pm | Em desenvolvimento |
| `epic-retrospective` | @po | Em desenvolvimento |

---

## Pre-requisitos

### Antes de Iniciar o Workflow

1. **Servico/API Existente**
   - Acesso ao codigo-fonte do servico
   - Documentacao atual (se existente)
   - Metricas de performance disponiveis

2. **Ambiente Configurado**
   - Git configurado e funcional
   - Acesso aos templates AIOS
   - Ferramentas de desenvolvimento instaladas

3. **Contexto do Projeto**
   - Objetivos claros de enhancement
   - Restricoes e constraints conhecidos
   - Stakeholders identificados

4. **Templates Disponiveis**
   - `.aios-core/development/templates/brownfield-prd-tmpl.yaml`
   - `.aios-core/development/templates/brownfield-architecture-tmpl.yaml`
   - `.aios-core/development/templates/story-tmpl.yaml`

5. **Checklists Disponiveis**
   - `.aios-core/development/checklists/po-master-checklist.md`
   - `.aios-core/development/checklists/story-draft-checklist.md`
   - `.aios-core/development/checklists/story-dod-checklist.md`

---

## Entradas e Saidas

### Entradas do Workflow

```mermaid
graph LR
    subgraph "Entradas"
        E1[Servico Existente]
        E2[Documentacao Atual]
        E3[Metricas de Performance]
        E4[Dependencias de Integracao]
        E5[Requisitos de Enhancement]
    end

    subgraph "Workflow"
        W[Brownfield Service<br/>Enhancement]
    end

    E1 --> W
    E2 --> W
    E3 --> W
    E4 --> W
    E5 --> W
```

| Entrada | Descricao | Fonte |
|---------|-----------|-------|
| Servico Existente | Codigo-fonte e infraestrutura atual | Repositorio Git |
| Documentacao Atual | Docs existentes do servico | `docs/` do projeto |
| Metricas de Performance | Dados de performance e uso | Monitoring tools |
| Dependencias de Integracao | Sistemas conectados ao servico | Arquitetura atual |
| Requisitos de Enhancement | O que precisa ser melhorado | Stakeholders |

### Saidas do Workflow

```mermaid
graph LR
    subgraph "Workflow"
        W[Brownfield Service<br/>Enhancement]
    end

    subgraph "Saidas"
        S1[docs/prd.md]
        S2[docs/architecture.md]
        S3[docs/prd/]
        S4[docs/architecture/]
        S5[docs/stories/story-X.Y.md]
        S6[Codigo Implementado]
        S7[Testes]
        S8[epic-retrospective.md]
    end

    W --> S1
    W --> S2
    W --> S3
    W --> S4
    W --> S5
    W --> S6
    W --> S7
    W --> S8
```

| Saida | Descricao | Localizacao |
|-------|-----------|-------------|
| PRD | Documento de requisitos do produto | `docs/prd.md` |
| Arquitetura | Documento de arquitetura | `docs/architecture.md` |
| PRD Fragmentado | PRD dividido em partes | `docs/prd/` |
| Arquitetura Fragmentada | Arquitetura dividida | `docs/architecture/` |
| Stories | User stories para desenvolvimento | `docs/stories/` |
| Codigo Implementado | Codigo fonte das features | Pastas do projeto |
| Testes | Testes unitarios e integracao | `tests/` ou similar |
| Retrospectiva | Aprendizados do epic | `epic-retrospective.md` |

---

## Pontos de Decisao

```mermaid
graph TD
    D1{PO encontrou<br/>problemas nos artefatos?}
    D2{Revisar draft<br/>da story?}
    D3{QA review<br/>necessario?}
    D4{QA encontrou<br/>problemas?}
    D5{Mais stories<br/>para implementar?}
    D6{Fazer epic<br/>retrospective?}

    D1 -->|Sim| A1[Retornar ao agente para correcao]
    D1 -->|Nao| A2[Prosseguir para fragmentacao]

    D2 -->|Sim| B1[Analyst/PM revisa story]
    D2 -->|Nao| B2[Dev implementa diretamente]

    D3 -->|Sim| C1[QA revisa implementacao]
    D3 -->|Nao| C2[Verificar mais stories]

    D4 -->|Sim| D4A[Dev corrige feedback]
    D4 -->|Nao| D4B[Story aprovada]

    D5 -->|Sim| E1[Criar proxima story]
    D5 -->|Nao| E2[Verificar retrospective]

    D6 -->|Sim| F1[PO conduz retrospective]
    D6 -->|Nao| F2[Projeto completo]

    style D1 fill:#FFCDD2,stroke:#E53935
    style D2 fill:#FFF9C4,stroke:#F9A825
    style D3 fill:#FFF9C4,stroke:#F9A825
    style D4 fill:#FFCDD2,stroke:#E53935
    style D5 fill:#C8E6C9,stroke:#43A047
    style D6 fill:#FFF9C4,stroke:#F9A825
```

### Detalhamento dos Pontos de Decisao

| Ponto | Pergunta | Sim | Nao |
|-------|----------|-----|-----|
| **D1** | PO encontrou problemas nos artefatos? | Retornar ao agente relevante para correcao | Prosseguir para fragmentacao de documentos |
| **D2** | Usuario deseja revisar draft da story? | Analyst/PM revisa completude e alinhamento | Dev implementa story diretamente |
| **D3** | QA review necessario? | QA revisa implementacao | Verificar se ha mais stories |
| **D4** | QA encontrou problemas? | Dev corrige feedback e retorna ao QA | Story aprovada, verificar mais stories |
| **D5** | Mais stories para implementar? | Criar proxima story (voltar ao Step 7) | Verificar se quer fazer retrospective |
| **D6** | Fazer epic retrospective? | PO conduz retrospectiva e documenta | Projeto completo |

---

## Troubleshooting

### Problemas Comuns e Solucoes

#### 1. Analise de Servico Incompleta

**Sintoma:** Arquitetura nao reflete todas as dependencias existentes.

**Causa:** Falta de documentacao ou acesso ao codigo.

**Solucao:**
1. Verificar acesso ao repositorio Git
2. Executar `*document-project` novamente
3. Consultar equipe atual sobre dependencias nao documentadas
4. Analisar logs de integracao para descobrir conexoes

---

#### 2. PRD Rejeitado pelo PO

**Sintoma:** Checklist do PO falha repetidamente.

**Causa:** PRD incompleto ou inconsistente com arquitetura.

**Solucao:**
1. Revisar feedback especifico do PO
2. Verificar alinhamento PRD <-> Arquitetura
3. Validar criterios de aceitacao sao testáveis
4. Confirmar que NFRs estao documentados

```
@pm
*correct-course
```

---

#### 3. Story em Draft nao Aprovada

**Sintoma:** Story permanece em Draft apos revisao.

**Causa:** Falta de detalhes ou ambiguidade.

**Solucao:**
1. Verificar se todos os criterios de aceitacao estao claros
2. Confirmar que tasks sao executaveis
3. Validar que dependencias estao identificadas
4. Executar story-draft-checklist

```
@sm
*story-checklist
```

---

#### 4. Implementacao Falha no QA

**Sintoma:** QA rejeita implementacao repetidamente.

**Causa:** Codigo nao atende aos criterios ou falta de testes.

**Solucao:**
1. Revisar feedback detalhado do QA
2. Verificar cobertura de testes
3. Executar CodeRabbit antes de enviar ao QA
4. Garantir que File List esta completo

```
@dev
*run-tests
*apply-qa-fixes
```

---

#### 5. Ciclo de Feedback Infinito

**Sintoma:** Dev e QA ficam em loop de correcoes.

**Causa:** Requisitos ambiguos ou scope creep.

**Solucao:**
1. Pausar e revisar story original
2. Clarificar criterios de aceitacao com PO
3. Definir limite de iteracoes (max 3)
4. Escalar para PO se necessario

---

#### 6. Fragmentacao de Documentos Falha

**Sintoma:** Comando `shard-doc` nao gera pastas esperadas.

**Causa:** Documentos em formato incorreto ou caminho errado.

**Solucao:**
1. Verificar que `prd.md` esta em `docs/`
2. Confirmar formato do documento
3. Executar via Opcao A (agente PO)
4. Verificar logs de erro

---

### Matriz de Escalonamento

| Problema | Primeiro Contato | Escalar Para |
|----------|-----------------|--------------|
| PRD incompleto | @pm (Morgan) | @po (Pax) |
| Arquitetura inconsistente | @architect (Aria) | @pm (Morgan) |
| Story ambigua | @sm (River) | @po (Pax) |
| Implementacao com bugs | @dev (Dex) | @qa (Quinn) |
| Quality gate falha | @qa (Quinn) | @po (Pax) |
| Integracao quebrada | @architect (Aria) | @devops (Gage) |

---

## Prompts de Handoff

Os handoff prompts facilitam a transicao entre agentes:

| Transicao | Prompt |
|-----------|--------|
| Analyst -> PM | "Analise de servico completa. Criar PRD abrangente com estrategia de integracao de servico." |
| PM -> Architect | "PRD pronto. Salvar como `docs/prd.md`, depois criar arquitetura do servico." |
| Architect -> PO | "Arquitetura completa. Salvar como `docs/architecture.md`. Por favor validar todos os artefatos para seguranca de integracao de servico." |
| PO (problemas) | "PO encontrou problemas com [documento]. Por favor retornar ao [agente] para corrigir e re-salvar o documento atualizado." |
| PO (completo) | "Todos os artefatos de planejamento validados e salvos na pasta `docs/`. Mover para ambiente IDE para iniciar desenvolvimento." |

---

## Referencias

### Arquivos de Configuracao

| Arquivo | Descricao | Caminho |
|---------|-----------|---------|
| Workflow Definition | Definicao YAML do workflow | `.aios-core/development/workflows/brownfield-service.yaml` |
| PRD Template | Template para brownfield PRD | `.aios-core/development/templates/brownfield-prd-tmpl.yaml` |
| Architecture Template | Template para arquitetura | `.aios-core/development/templates/brownfield-architecture-tmpl.yaml` |
| Story Template | Template para stories | `.aios-core/development/templates/story-tmpl.yaml` |
| PO Master Checklist | Checklist de validacao | `.aios-core/development/checklists/po-master-checklist.md` |
| Story Draft Checklist | Checklist de story | `.aios-core/development/checklists/story-draft-checklist.md` |
| Story DoD Checklist | Definition of Done | `.aios-core/development/checklists/story-dod-checklist.md` |

### Agentes

| Agente | Arquivo | Caminho |
|--------|---------|---------|
| @architect | Aria | `.aios-core/development/agents/architect.md` |
| @pm | Morgan | `.aios-core/development/agents/pm.md` |
| @po | Pax | `.aios-core/development/agents/po.md` |
| @sm | River | `.aios-core/development/agents/sm.md` |
| @analyst | Atlas | `.aios-core/development/agents/analyst.md` |
| @dev | Dex | `.aios-core/development/agents/dev.md` |
| @qa | Quinn | `.aios-core/development/agents/qa.md` |

### Documentacao Relacionada

- [AIOS Knowledge Base](../../../.aios-core/data/aios-kb.md) - Base de conhecimento do framework
- [Technical Preferences](../../../.aios-core/development/data/technical-preferences.md) - Preferencias tecnicas do projeto
- [IDE Development Workflow](../../../.aios-core/data/aios-kb.md#IDE-Development-Workflow) - Fluxo de desenvolvimento no IDE

---

## Historico de Alteracoes

| Data | Versao | Alteracao | Autor |
|------|--------|-----------|-------|
| 2026-02-04 | 1.0 | Documentacao inicial criada | Technical Documentation Specialist |

---

*Documento gerado a partir do workflow `brownfield-service.yaml` - AIOS Framework v2.2*
