# Workflow: Brownfield Service/API Enhancement

**Identificador:** `brownfield-service`
**Tipo:** Brownfield (Sistemas Existentes)
**Versão:** 1.0
**Última Atualização:** 2026-02-04

---

## Visão Geral

O workflow **Brownfield Service/API Enhancement** é projetado para aprimorar serviços backend e APIs existentes com novos recursos, modernização ou melhorias de desempenho. Ele gerencia análise de sistemas existentes e integração segura, garantindo que mudanças sejam implementadas sem interromper funcionalidades críticas.

### Casos de Uso

| Tipo de Projeto | Descrição |
|-----------------|-----------|
| **Service Modernization** | Atualização de serviços legados para tecnologias modernas |
| **API Enhancement** | Adição de novos endpoints ou melhorias em APIs existentes |
| **Microservice Extraction** | Extração de módulos de um monolito para microsserviços |
| **Performance Optimization** | Otimização de performance em serviços existentes |
| **Integration Enhancement** | Melhoria de integrações entre sistemas |

### Quando Utilizar

- Aprimoramento de serviço requer stories coordenadas
- Versionamento de API ou breaking changes necessários
- Alterações em schema de banco de dados requeridas
- Melhorias de performance ou escalabilidade necessárias
- Múltiplos pontos de integração afetados

---

## Diagrama do Workflow

```mermaid
graph TD
    subgraph "Fase 1: Planejamento"
        A[Inicio: Service Enhancement] --> B["@architect: Analisar Servico Existente<br/>(document-project)"]
        B --> C["@pm: Criar PRD<br/>(brownfield-prd-tmpl)"]
        C --> D["@architect: Criar Arquitetura<br/>(brownfield-architecture-tmpl)"]
    end

    subgraph "Fase 2: Validação"
        D --> E["@po: Validar Artefatos<br/>(po-master-checklist)"]
        E --> F{PO encontrou<br/>problemas?}
        F -->|Sim| G[Retornar ao agente<br/>relevante para correções]
        G --> E
        F -->|Não| H["@po: Fragmentar Documentos<br/>(shard-doc)"]
    end

    subgraph "Fase 3: Ciclo de Desenvolvimento"
        H --> I["@sm: Criar Story<br/>(create-next-story)"]
        I --> J{Revisar draft<br/>da story?}
        J -->|Sim| K["@analyst/@pm: Revisar e<br/>Aprovar Story"]
        J -->|Nao| L["@dev: Implementar Story<br/>(develop-story)"]
        K --> L
        L --> M{QA Review?}
        M -->|Sim| N["@qa: Revisar Implementacao<br/>(review-story)"]
        M -->|Não| O{Mais stories?}
        N --> P{QA encontrou<br/>problemas?}
        P -->|Sim| Q["@dev: Corrigir Feedback QA"]
        P -->|Não| O
        Q --> N
        O -->|Sim| I
        O -->|Nao| R{Epic<br/>Retrospective?}
    end

    subgraph "Fase 4: Finalização"
        R -->|Sim| S["@po: Epic Retrospective<br/>(epic-retrospective)"]
        R -->|Não| T[Projeto Completo]
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

## Diagrama de Sequência

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
        Architect->>Architect: Analisar serviço existente
        Architect-->>PM: Documentação do projeto
        PM->>PM: Criar PRD (brownfield-prd-tmpl)
        PM-->>Architect: PRD pronto
        Architect->>Architect: Criar arquitetura (brownfield-architecture-tmpl)
        Architect-->>PO: Arquitetura pronta
    end

    rect rgb(255, 243, 224)
        Note over User,QA: Fase 2: Validação
        PO->>PO: Validar com po-master-checklist
        alt PO encontra problemas
            PO-->>PM: Solicitar correções no PRD
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
                QA->>QA: Revisar implementação
                alt QA encontra problemas
                    QA-->>Dev: Feedback com itens pendentes
                    Dev->>Dev: Corrigir issues
                    Dev-->>QA: Correções aplicadas
                end
            end
        end
    end

    rect rgb(243, 229, 245)
        Note over User,QA: Fase 4: Finalização
        opt Epic Retrospective opcional
            PO->>PO: Conduzir retrospectiva
            PO-->>User: Documentar aprendizados
        end
        PO-->>User: Projeto Completo!
    end
```

---

## Steps Detalhados

### Step 1: Análise do Serviço

| Atributo | Valor |
|----------|-------|
| **Agente** | @architect (Aria) |
| **Task** | `document-project` |
| **Input** | Serviço/API existente, métricas de performance, documentação atual |
| **Output** | Múltiplos documentos conforme template document-project |
| **Notas** | Revisar documentação existente, codebase, métricas de performance e identificar dependências de integração |

**Ativação:**
```
@architect
*document-project
```

---

### Step 2: Criação do PRD

| Atributo | Valor |
|----------|-------|
| **Agente** | @pm (Morgan) |
| **Task** | `create-doc` com `brownfield-prd-tmpl` |
| **Input** | Análise do serviço existente |
| **Output** | `docs/prd.md` |
| **Requer** | Análise do serviço existente concluída |
| **Notas** | Criar PRD abrangente focado em aprimoramento de serviço com análise do sistema existente |

**Ativação:**
```
@pm
*create-brownfield-prd
```

**IMPORTANTE:** Salvar o arquivo final `prd.md` na pasta `docs/` do projeto.

---

### Step 3: Criação da Arquitetura

| Atributo | Valor |
|----------|-------|
| **Agente** | @architect (Aria) |
| **Task** | `create-doc` com `brownfield-architecture-tmpl` |
| **Input** | PRD (`docs/prd.md`) |
| **Output** | `docs/architecture.md` |
| **Requer** | PRD aprovado |
| **Notas** | Criar arquitetura com estratégia de integração de serviço e planejamento de evolução de API |

**Ativação:**
```
@architect
*create-brownfield-architecture
```

**IMPORTANTE:** Salvar o arquivo final `architecture.md` na pasta `docs/` do projeto.

---

### Step 4: Validação dos Artefatos

| Atributo | Valor |
|----------|-------|
| **Agente** | @po (Pax) |
| **Task** | `execute-checklist` com `po-master-checklist` |
| **Input** | Todos os artefatos (PRD, Arquitetura) |
| **Output** | Relatório de validação |
| **Notas** | Validar todos os documentos para segurança de integração de serviço e compatibilidade de API. Pode requerer atualizações em qualquer documento. |

**Ativação:**
```
@po
*execute-checklist-po
```

---

### Step 5: Correção de Problemas (Condicional)

| Atributo | Valor |
|----------|-------|
| **Agente** | Varia conforme o documento com problema |
| **Task** | Correção específica do documento |
| **Input** | Feedback do PO |
| **Output** | Documentos atualizados |
| **Condição** | PO encontrou problemas no checklist |
| **Notas** | Se PO encontrar problemas, retornar ao agente relevante para corrigir e re-exportar documentos atualizados para a pasta `docs/` |

---

### Step 6: Fragmentação de Documentos

| Atributo | Valor |
|----------|-------|
| **Agente** | @po (Pax) |
| **Task** | `shard-doc` |
| **Input** | Todos os artefatos validados em `docs/` |
| **Output** | Pastas `docs/prd/` e `docs/architecture/` com conteúdo fragmentado |
| **Requer** | Todos os artefatos na pasta do projeto |
| **Notas** | Fragmentar documentos para desenvolvimento no IDE |

**Opções de Ativação:**

**Opção A - Via Agente PO:**
```
@po
shard docs/prd.md
```

**Opção B - Manual:**
Arrastar a task `shard-doc` + `docs/prd.md` para o chat.

---

### Step 7: Criação de Stories

| Atributo | Valor |
|----------|-------|
| **Agente** | @sm (River) |
| **Task** | `create-next-story` |
| **Input** | Documentos fragmentados |
| **Output** | `story.md` |
| **Requer** | Documentos fragmentados |
| **Repete** | Para cada epic |
| **Notas** | Story inicia com status "Draft" |

**Ativação (Nova sessão de chat):**
```
@sm
*draft
```

---

### Step 8: Revisão de Story Draft (Opcional)

| Atributo | Valor |
|----------|-------|
| **Agente** | @analyst (Atlas) ou @pm (Morgan) |
| **Task** | `review-draft-story` (em desenvolvimento) |
| **Input** | Story em Draft |
| **Output** | Story atualizada |
| **Requer** | Story criada |
| **Opcional** | Sim - quando usuario deseja revisao da story |
| **Condição** | Usuário solicita revisão |
| **Notas** | Revisar completude e alinhamento da story. Atualizar status: Draft -> Approved |

---

### Step 9: Implementação da Story

| Atributo | Valor |
|----------|-------|
| **Agente** | @dev (Dex) |
| **Task** | `develop-story` |
| **Input** | Story aprovada |
| **Output** | Arquivos de implementação |
| **Requer** | Story aprovada (não em Draft) |
| **Notas** | Implementar story aprovada, atualizar File List com todas as alterações, marcar story como "Review" quando completo |

**Ativação (Nova sessão de chat):**
```
@dev
*develop {story-id}
```

---

### Step 10: Revisão QA (Opcional)

| Atributo | Valor |
|----------|-------|
| **Agente** | @qa (Quinn) |
| **Task** | `review-story` |
| **Input** | Arquivos de implementacao |
| **Output** | Implementação atualizada + Checklist QA |
| **Opcional** | Sim |
| **Notas** | Revisao de dev senior com capacidade de refatoração. Corrige pequenos problemas diretamente. Deixa checklist para itens restantes. Atualiza status da story (Review -> Done ou permanece Review) |

**Ativação (Nova sessão de chat):**
```
@qa
*review {story-id}
```

---

### Step 11: Correção de Feedback QA (Condicional)

| Atributo | Valor |
|----------|-------|
| **Agente** | @dev (Dex) |
| **Task** | `apply-qa-fixes` |
| **Input** | Feedback do QA com itens pendentes |
| **Output** | Implementação corrigida |
| **Condicao** | QA deixou itens não marcados |
| **Notas** | Se QA deixou itens pendentes: Dev (nova sessao) corrige itens restantes e retorna ao QA para aprovação final |

**Ativação (Nova sessão de chat):**
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

    subgraph "Agentes de Gestão"
        PO["@po<br/>Pax<br/>Product Owner"]
        SM["@sm<br/>River<br/>Scrum Master"]
    end

    subgraph "Agentes de Execução"
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
| @architect | Aria | Holistic System Architect | Análise de serviço existente, criação de arquitetura |
| @pm | Morgan | Product Manager | Criação de PRD para brownfield |
| @po | Pax | Product Owner | Validação de artefatos, fragmentação de docs, retrospectiva |
| @sm | River | Scrum Master | Criação de stories |
| @analyst | Atlas | Business Analyst | Revisão opcional de story drafts |
| @dev | Dex | Full Stack Developer | Implementacao de stories, correção de feedback |
| @qa | Quinn | Test Architect | Revisão de implementação, quality gates |

---

## Tasks Executadas

### Tasks Principais

| Task | Template/Checklist | Agente | Fase |
|------|-------------------|--------|------|
| `document-project` | document-project template | @architect | Planejamento |
| `create-doc` | `brownfield-prd-tmpl.yaml` | @pm | Planejamento |
| `create-doc` | `brownfield-architecture-tmpl.yaml` | @architect | Planejamento |
| `execute-checklist` | `po-master-checklist.md` | @po | Validação |
| `shard-doc` | - | @po | Validação |
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

## Pré-requisitos

### Antes de Iniciar o Workflow

1. **Serviço/API Existente**
   - Acesso ao código-fonte do serviço
   - Documentação atual (se existente)
   - Métricas de performance disponíveis

2. **Ambiente Configurado**
   - Git configurado e funcional
   - Acesso aos templates AIOS
   - Ferramentas de desenvolvimento instaladas

3. **Contexto do Projeto**
   - Objetivos claros de enhancement
   - Restrições e constraints conhecidos
   - Stakeholders identificados

4. **Templates Disponíveis**
   - `.aios-core/development/templates/brownfield-prd-tmpl.yaml`
   - `.aios-core/development/templates/brownfield-architecture-tmpl.yaml`
   - `.aios-core/development/templates/story-tmpl.yaml`

5. **Checklists Disponíveis**
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

| Entrada | Descrição | Fonte |
|---------|-----------|-------|
| Serviço Existente | Código-fonte e infraestrutura atual | Repositório Git |
| Documentação Atual | Docs existentes do serviço | `docs/` do projeto |
| Métricas de Performance | Dados de performance e uso | Monitoring tools |
| Dependências de Integração | Sistemas conectados ao serviço | Arquitetura atual |
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

| Saída | Descrição | Localização |
|-------|-----------|-------------|
| PRD | Documento de requisitos do produto | `docs/prd.md` |
| Arquitetura | Documento de arquitetura | `docs/architecture.md` |
| PRD Fragmentado | PRD dividido em partes | `docs/prd/` |
| Arquitetura Fragmentada | Arquitetura dividida | `docs/architecture/` |
| Stories | User stories para desenvolvimento | `docs/stories/` |
| Código Implementado | Código fonte das features | Pastas do projeto |
| Testes | Testes unitários e integração | `tests/` ou similar |
| Retrospectiva | Aprendizados do epic | `epic-retrospective.md` |

---

## Pontos de Decisão

```mermaid
graph TD
    D1{PO encontrou<br/>problemas nos artefatos?}
    D2{Revisar draft<br/>da story?}
    D3{QA review<br/>necessario?}
    D4{QA encontrou<br/>problemas?}
    D5{Mais stories<br/>para implementar?}
    D6{Fazer epic<br/>retrospective?}

    D1 -->|Sim| A1[Retornar ao agente para correcao]
    D1 -->|Não| A2[Prosseguir para fragmentação]

    D2 -->|Sim| B1[Analyst/PM revisa story]
    D2 -->|Não| B2[Dev implementa diretamente]

    D3 -->|Sim| C1[QA revisa implementacao]
    D3 -->|Não| C2[Verificar mais stories]

    D4 -->|Sim| D4A[Dev corrige feedback]
    D4 -->|Não| D4B[Story aprovada]

    D5 -->|Sim| E1[Criar próxima story]
    D5 -->|Não| E2[Verificar retrospective]

    D6 -->|Sim| F1[PO conduz retrospective]
    D6 -->|Não| F2[Projeto completo]

    style D1 fill:#FFCDD2,stroke:#E53935
    style D2 fill:#FFF9C4,stroke:#F9A825
    style D3 fill:#FFF9C4,stroke:#F9A825
    style D4 fill:#FFCDD2,stroke:#E53935
    style D5 fill:#C8E6C9,stroke:#43A047
    style D6 fill:#FFF9C4,stroke:#F9A825
```

### Detalhamento dos Pontos de Decisão

| Ponto | Pergunta | Sim | Nao |
|-------|----------|-----|-----|
| **D1** | PO encontrou problemas nos artefatos? | Retornar ao agente relevante para correção | Prosseguir para fragmentação de documentos |
| **D2** | Usuário deseja revisar draft da story? | Analyst/PM revisa completude e alinhamento | Dev implementa story diretamente |
| **D3** | QA review necessário? | QA revisa implementação | Verificar se há mais stories |
| **D4** | QA encontrou problemas? | Dev corrige feedback e retorna ao QA | Story aprovada, verificar mais stories |
| **D5** | Mais stories para implementar? | Criar próxima story (voltar ao Step 7) | Verificar se quer fazer retrospective |
| **D6** | Fazer epic retrospective? | PO conduz retrospectiva e documenta | Projeto completo |

---

## Troubleshooting

### Problemas Comuns e Soluções

#### 1. Análise de Serviço Incompleta

**Sintoma:** Arquitetura não reflete todas as dependências existentes.

**Causa:** Falta de documentação ou acesso ao código.

**Solução:**
1. Verificar acesso ao repositório Git
2. Executar `*document-project` novamente
3. Consultar equipe atual sobre dependências não documentadas
4. Analisar logs de integração para descobrir conexões

---

#### 2. PRD Rejeitado pelo PO

**Sintoma:** Checklist do PO falha repetidamente.

**Causa:** PRD incompleto ou inconsistente com arquitetura.

**Solução:**
1. Revisar feedback específico do PO
2. Verificar alinhamento PRD <-> Arquitetura
3. Validar critérios de aceitação são testáveis
4. Confirmar que NFRs estão documentados

```
@pm
*correct-course
```

---

#### 3. Story em Draft nao Aprovada

**Sintoma:** Story permanece em Draft após revisão.

**Causa:** Falta de detalhes ou ambiguidade.

**Solução:**
1. Verificar se todos os critérios de aceitação estão claros
2. Confirmar que tasks são executáveis
3. Validar que dependências estão identificadas
4. Executar story-draft-checklist

```
@sm
*story-checklist
```

---

#### 4. Implementação Falha no QA

**Sintoma:** QA rejeita implementação repetidamente.

**Causa:** Código não atende aos critérios ou falta de testes.

**Solução:**
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

**Sintoma:** Dev e QA ficam em loop de correções.

**Causa:** Requisitos ambíguos ou scope creep.

**Solução:**
1. Pausar e revisar story original
2. Clarificar critérios de aceitação com PO
3. Definir limite de iterações (max 3)
4. Escalar para PO se necessário

---

#### 6. Fragmentação de Documentos Falha

**Sintoma:** Comando `shard-doc` não gera pastas esperadas.

**Causa:** Documentos em formato incorreto ou caminho errado.

**Solução:**
1. Verificar que `prd.md` esta em `docs/`
2. Confirmar formato do documento
3. Executar via Opção A (agente PO)
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

Os handoff prompts facilitam a transição entre agentes:

| Transição | Prompt |
|-----------|--------|
| Analyst -> PM | "Análise de serviço completa. Criar PRD abrangente com estratégia de integração de serviço." |
| PM -> Architect | "PRD pronto. Salvar como `docs/prd.md`, depois criar arquitetura do servico." |
| Architect -> PO | "Arquitetura completa. Salvar como `docs/architecture.md`. Por favor validar todos os artefatos para segurança de integração de serviço." |
| PO (problemas) | "PO encontrou problemas com [documento]. Por favor retornar ao [agente] para corrigir e re-salvar o documento atualizado." |
| PO (completo) | "Todos os artefatos de planejamento validados e salvos na pasta `docs/`. Mover para ambiente IDE para iniciar desenvolvimento." |

---

## Referências

### Arquivos de Configuração

| Arquivo | Descrição | Caminho |
|---------|-----------|---------|
| Workflow Definition | Definição YAML do workflow | `.aios-core/development/workflows/brownfield-service.yaml` |
| PRD Template | Template para brownfield PRD | `.aios-core/development/templates/brownfield-prd-tmpl.yaml` |
| Architecture Template | Template para arquitetura | `.aios-core/development/templates/brownfield-architecture-tmpl.yaml` |
| Story Template | Template para stories | `.aios-core/development/templates/story-tmpl.yaml` |
| PO Master Checklist | Checklist de validação | `.aios-core/development/checklists/po-master-checklist.md` |
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

### Documentação Relacionada

- [AIOS Knowledge Base](../../../.aios-core/data/aios-kb.md) - Base de conhecimento do framework
- [Technical Preferences](../../../.aios-core/development/data/technical-preferences.md) - Preferências técnicas do projeto
- [IDE Development Workflow](../../../.aios-core/data/aios-kb.md#IDE-Development-Workflow) - Fluxo de desenvolvimento no IDE

---

## Histórico de Alterações

| Data | Versão | Alteração | Autor |
|------|--------|-----------|-------|
| 2026-02-04 | 1.0 | Documentação inicial criada | Technical Documentation Specialist |

---

*Documento gerado a partir do workflow `brownfield-service.yaml` - AIOS Framework v2.2*
