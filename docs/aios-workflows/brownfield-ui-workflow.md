# Workflow Brownfield UI/Frontend Enhancement

> **ID:** `brownfield-ui`
> **Tipo:** Brownfield (projeto existente)
> **Versão:** 1.0
> **Última Atualização:** 2026-02-04

## Sumário

- [Visão Geral](#visao-geral)
- [Diagrama do Workflow](#diagrama-do-workflow)
- [Steps Detalhados](#steps-detalhados)
- [Agentes Participantes](#agentes-participantes)
- [Tasks Executadas](#tasks-executadas)
- [Pré-requisitos](#pre-requisitos)
- [Entradas e Saidas](#entradas-e-saidas)
- [Pontos de Decisão](#pontos-de-decisao)
- [Troubleshooting](#troubleshooting)
- [Referências](#referencias)

---

## Visão Geral

O **Brownfield UI/Frontend Enhancement Workflow** é um fluxo de trabalho estruturado para aprimorar aplicações frontend existentes. Ele abrange desde a análise inicial do sistema legado até a implementação completa de novas funcionalidades, modernização de componentes ou atualização do design.

### Casos de Uso

| Tipo de Projeto | Descrição |
|-----------------|-----------|
| **UI Modernization** | Atualização de interfaces legadas para padrões modernos |
| **Framework Migration** | Migração entre frameworks (ex: jQuery para React) |
| **Design Refresh** | Atualização visual seguindo novos padrões de design |
| **Frontend Enhancement** | Adição de novas funcionalidades ao frontend existente |

### Benefícios

- Análise estruturada do sistema existente antes de modificações
- Integração segura com código legado
- Validação de qualidade em cada etapa
- Documentação completa de decisões arquiteturais

---

## Diagrama do Workflow

### Diagrama Principal de Fluxo

```mermaid
graph TD
    subgraph "Fase 1: Análise e Planejamento"
        A[Inicio: UI Enhancement] --> B[architect: Análise UI Existente]
        B --> C[pm: Criar PRD Brownfield]
        C --> D[ux-expert: Especificação Frontend]
        D --> E[architect: Arquitetura Brownfield]
    end

    subgraph "Fase 2: Validação"
        E --> F[po: Validar com po-master-checklist]
        F --> G{PO encontrou problemas?}
        G -->|Sim| H[Retornar ao agente para correções]
        H --> F
        G -->|Não| I[po: Fragmentar documentos]
    end

    subgraph "Fase 3: Ciclo de Desenvolvimento"
        I --> J[sm: Criar story]
        J --> K{Revisar story draft?}
        K -->|Sim| L[analyst/pm: Revisar e aprovar story]
        K -->|Não| M[dev: Implementar story]
        L --> M
        M --> N{Revisao QA?}
        N -->|Sim| O[qa: Revisar implementacao]
        N -->|Não| P{Mais stories?}
        O --> Q{QA encontrou issues?}
        Q -->|Sim| R[dev: Corrigir feedback QA]
        Q -->|Não| P
        R --> O
        P -->|Sim| J
        P -->|Não| S{Retrospectiva do Epic?}
    end

    subgraph "Fase 4: Finalização"
        S -->|Sim| T[po: Retrospectiva do Epic]
        S -->|Não| U[Projeto Completo]
        T --> U
    end

    style U fill:#90EE90,stroke:#228B22
    style I fill:#ADD8E6,stroke:#4682B4
    style J fill:#ADD8E6,stroke:#4682B4
    style M fill:#ADD8E6,stroke:#4682B4
    style C fill:#FFE4B5,stroke:#FF8C00
    style D fill:#FFE4B5,stroke:#FF8C00
    style E fill:#FFE4B5,stroke:#FF8C00
    style L fill:#F0E68C,stroke:#BDB76B
    style O fill:#F0E68C,stroke:#BDB76B
    style T fill:#F0E68C,stroke:#BDB76B
```

### Legenda de Cores

| Cor | Significado |
|-----|-------------|
| Verde Claro | Conclusão do workflow |
| Azul Claro | Steps de execução principal |
| Laranja Claro | Criação de artefatos de documentação |
| Amarelo Claro | Steps opcionais de revisão |

### Diagrama de Ciclo de Desenvolvimento

```mermaid
sequenceDiagram
    participant SM as @sm (River)
    participant DEV as @dev (Dex)
    participant QA as @qa (Quinn)
    participant PO as @po (Pax)

    loop Para cada Story do Epic
        SM->>SM: Criar story a partir dos docs fragmentados
        SM->>DEV: Entregar story para implementação
        DEV->>DEV: Implementar tasks da story
        DEV->>DEV: Escrever testes
        DEV->>DEV: Marcar story como "Ready for Review"

        alt QA Review Habilitada
            DEV->>QA: Solicitar revisao
            QA->>QA: Executar review-story

            alt Issues Encontradas
                QA->>DEV: Retornar para correções
                DEV->>DEV: Aplicar fixes
                DEV->>QA: Reenviar para revisão
            end

            QA->>PO: Story aprovada
        else Sem QA Review
            DEV->>PO: Story pronta
        end
    end

    PO->>PO: Epic completo - Retrospectiva opcional
```

### Diagrama de Estados da Story

```mermaid
stateDiagram-v2
    [*] --> Draft: SM cria story
    Draft --> Approved: PM/Analyst revisa (opcional)
    Draft --> InProgress: Dev inicia implementação
    Approved --> InProgress: Dev inicia implementação
    InProgress --> ReadyForReview: Dev completa tasks
    ReadyForReview --> Review: QA inicia revisao
    Review --> InProgress: QA encontra issues
    Review --> Done: QA aprova
    ReadyForReview --> Done: Sem QA review
    Done --> [*]: Story finalizada
```

---

## Steps Detalhados

### Step 1: Análise UI Existente

| Atributo | Valor |
|----------|-------|
| **Agente** | @architect (Aria) |
| **Ação** | Analisar projeto existente usando task `document-project` |
| **Artefatos Criados** | Múltiplos documentos conforme template document-project |
| **Input** | Aplicação frontend existente, feedback de usuários, dados de analytics |
| **Output** | Documentação do projeto com áreas de melhoria identificadas |

**Observações:**
- Revisar a aplicação frontend existente
- Analisar feedback de usuários e dados de uso
- Identificar áreas de melhoria e modernização
- Documentar a arquitetura atual

---

### Step 2: Criar PRD Brownfield

| Atributo | Valor |
|----------|-------|
| **Agente** | @pm (Morgan) |
| **Ação** | Criar PRD focado em enhancement de UI |
| **Template** | `brownfield-prd-tmpl` |
| **Artefatos Criados** | `prd.md` |
| **Requer** | Análise UI existente (Step 1) |
| **Output** | Documento PRD completo com estratégia de integração |

**Observações:**
- Criar PRD abrangente focado em enhancement de UI
- Incluir análise do sistema existente
- IMPORTANTE: Salvar o arquivo final `prd.md` na pasta `docs/` do projeto

---

### Step 3: Especificação Frontend

| Atributo | Valor |
|----------|-------|
| **Agente** | @ux-expert (Uma) |
| **Ação** | Criar especificação UI/UX integrada com padrões existentes |
| **Template** | `front-end-spec-tmpl` |
| **Artefatos Criados** | `front-end-spec.md` |
| **Requer** | `prd.md` (Step 2) |
| **Output** | Especificação de UI/UX detalhada |

**Observações:**
- Criar especificação UI/UX que integra com padrões de design existentes
- Considerar design tokens já utilizados
- IMPORTANTE: Salvar o arquivo final `front-end-spec.md` na pasta `docs/` do projeto

---

### Step 4: Arquitetura Brownfield

| Atributo | Valor |
|----------|-------|
| **Agente** | @architect (Aria) |
| **Ação** | Criar arquitetura frontend com estratégia de integração |
| **Template** | `brownfield-architecture-tmpl` |
| **Artefatos Criados** | `architecture.md` |
| **Requer** | `prd.md`, `front-end-spec.md` (Steps 2 e 3) |
| **Output** | Documento de arquitetura com plano de migração |

**Observações:**
- Criar arquitetura frontend com estratégia de integração de componentes
- Incluir planejamento de migração
- Definir como novos componentes interagem com o sistema existente
- IMPORTANTE: Salvar o arquivo final `architecture.md` na pasta `docs/` do projeto

---

### Step 5: Validação PO

| Atributo | Valor |
|----------|-------|
| **Agente** | @po (Pax) |
| **Acao** | Validar todos os artefatos |
| **Checklist** | `po-master-checklist` |
| **Artefatos Validados** | Todos os artefatos criados |
| **Output** | Decisão de aprovação ou lista de correções |

**Observações:**
- Validar todos os documentos para segurança de integração UI
- Verificar consistência de design
- Pode requerer atualizações em qualquer documento

---

### Step 6: Correções (Condicional)

| Atributo | Valor |
|----------|-------|
| **Agente** | Variado (conforme problema encontrado) |
| **Condição** | `po_checklist_issues` - PO encontrou problemas |
| **Ação** | Corrigir documentos sinalizados |
| **Output** | Documentos atualizados re-exportados para `docs/` |

**Observacoes:**
- Se PO encontrar problemas, retornar ao agente relevante
- Corrigir e re-exportar documentos atualizados

---

### Step 7: Fragmentação de Documentos

| Atributo | Valor |
|----------|-------|
| **Agente** | @po (Pax) |
| **Ação** | Fragmentar documentos para desenvolvimento IDE |
| **Artefatos Criados** | `sharded_docs` (pastas `docs/prd/` e `docs/architecture/`) |
| **Requer** | Todos os artefatos na pasta do projeto |
| **Output** | Conteúdo fragmentado pronto para consumo por agentes |

**Métodos de Execução:**
- **Opção A:** Usar agente PO para fragmentar: `@po` depois solicitar "shard docs/prd.md"
- **Opção B:** Manual: Arrastar task `shard-doc` + `docs/prd.md` para o chat

---

### Step 8: Criação de Stories (Ciclo)

| Atributo | Valor |
|----------|-------|
| **Agente** | @sm (River) |
| **Ação** | Criar stories a partir dos documentos fragmentados |
| **Artefatos Criados** | `story.md` (para cada epic) |
| **Requer** | `sharded_docs` (Step 7) |
| **Repete** | Para cada epic do PRD |
| **Output** | Stories em status "Draft" |

**Processo:**
1. Ativar SM Agent em novo chat: `@sm`
2. Executar comando: `*draft`
3. SM cria próxima story a partir dos docs fragmentados
4. Story inicia em status "Draft"

---

### Step 9: Revisão de Story Draft (Opcional)

| Atributo | Valor |
|----------|-------|
| **Agente** | @analyst (Atlas) ou @pm (Morgan) |
| **Ação** | Revisar e aprovar story draft |
| **Condição** | `user_wants_story_review` - Usuário deseja revisão |
| **Opcional** | Sim |
| **Output** | Story atualizada com status "Draft" -> "Approved" |

**Observações:**
- Task `story-review` em desenvolvimento
- Revisar completude e alinhamento da story
- Atualizar status da story

---

### Step 10: Implementação da Story

| Atributo | Valor |
|----------|-------|
| **Agente** | @dev (Dex) |
| **Ação** | Implementar story aprovada |
| **Artefatos Criados** | Arquivos de implementação |
| **Requer** | `story.md` aprovada |
| **Output** | Código implementado, File List atualizada, status "Review" |

**Processo:**
1. Ativar Dev Agent em novo chat: `@dev`
2. Executar comando: `*develop {story-id}`
3. Implementar story conforme tasks
4. Atualizar File List com todas as mudanças
5. Marcar story como "Review" ao completar

---

### Step 11: Revisão QA (Opcional)

| Atributo | Valor |
|----------|-------|
| **Agente** | @qa (Quinn) |
| **Ação** | Revisar implementação como senior dev |
| **Artefatos Atualizados** | Arquivos de implementacao |
| **Requer** | Arquivos implementados |
| **Opcional** | Sim |
| **Output** | Fixes aplicados ou checklist de items pendentes |

**Processo:**
1. Ativar QA Agent em novo chat: `@qa`
2. Executar comando: `*review {story-id}`
3. Revisão senior dev com capacidade de refatoração
4. Corrigir issues pequenas diretamente
5. Deixar checklist para items restantes
6. Atualizar status da story (Review -> Done ou permanece Review)

---

### Step 12: Correções de Feedback QA (Condicional)

| Atributo | Valor |
|----------|-------|
| **Agente** | @dev (Dex) |
| **Condição** | `qa_left_unchecked_items` - QA deixou items pendentes |
| **Ação** | Endereçamento de feedback do QA |
| **Output** | Items corrigidos, retorno ao QA para aprovação final |

---

### Step 13: Ciclo de Desenvolvimento

| Atributo | Valor |
|----------|-------|
| **Ação** | Repetir ciclo SM -> Dev -> QA |
| **Repete** | Para todas as stories do PRD |
| **Condição de Saída** | Todas as stories do PRD completas |

---

### Step 14: Retrospectiva do Epic (Opcional)

| Atributo | Valor |
|----------|-------|
| **Agente** | @po (Pax) |
| **Condição** | `epic_complete` - Epic finalizado |
| **Opcional** | Sim |
| **Artefatos Criados** | `epic-retrospective.md` |
| **Output** | Documentacao de learnings e melhorias |

**Observações:**
- Task `epic-retrospective` em desenvolvimento
- Validar que epic foi completado corretamente
- Documentar aprendizados e melhorias

---

### Step 15: Projeto Completo

| Atributo | Valor |
|----------|-------|
| **Ação** | Finalização do workflow |
| **Status** | Todas as stories implementadas e revisadas |
| **Output** | Fase de desenvolvimento do projeto completa |

---

## Agentes Participantes

### Tabela de Agentes

| Icone | ID | Nome | Titulo | Papel no Workflow |
|-------|-----|------|--------|-------------------|
| @architect | architect | Aria | Holistic System Architect | Análise inicial e arquitetura brownfield |
| @pm | pm | Morgan | Product Manager | Criação do PRD brownfield |
| @ux-expert | ux-design-expert | Uma | UX/UI Designer | Especificação frontend |
| @po | po | Pax | Product Owner | Validação, fragmentação, retrospectiva |
| @sm | sm | River | Scrum Master | Criação de stories |
| @analyst | analyst | Atlas | Business Analyst | Revisão de stories (opcional) |
| @dev | dev | Dex | Full Stack Developer | Implementação |
| @qa | qa | Quinn | Test Architect | Revisão de qualidade (opcional) |

### Diagrama de Colaboracao entre Agentes

```mermaid
graph LR
    subgraph "Fase de Planejamento"
        ARCH[architect<br/>Aria]
        PM[pm<br/>Morgan]
        UX[ux-expert<br/>Uma]
    end

    subgraph "Fase de Validação"
        PO[po<br/>Pax]
        ANALYST[analyst<br/>Atlas]
    end

    subgraph "Fase de Desenvolvimento"
        SM[sm<br/>River]
        DEV[dev<br/>Dex]
        QA[qa<br/>Quinn]
    end

    ARCH -->|docs projeto| PM
    PM -->|prd.md| UX
    UX -->|front-end-spec.md| ARCH
    ARCH -->|architecture.md| PO

    PO -->|sharded_docs| SM
    PO -->|revisão story| ANALYST
    ANALYST -->|story aprovada| SM

    SM -->|story.md| DEV
    DEV -->|implementação| QA
    QA -->|feedback| DEV
    QA -->|aprovado| PO

    style ARCH fill:#E6E6FA
    style PM fill:#FFB6C1
    style UX fill:#98FB98
    style PO fill:#FFD700
    style ANALYST fill:#87CEEB
    style SM fill:#DDA0DD
    style DEV fill:#F0E68C
    style QA fill:#20B2AA
```

---

## Tasks Executadas

### Tasks por Step

| Step | Task | Agente | Descrição |
|------|------|--------|-----------|
| 1 | `document-project.md` | architect | Documentar projeto existente |
| 2 | `create-doc.md` + `brownfield-prd-tmpl` | pm | Criar PRD brownfield |
| 3 | `create-doc.md` + `front-end-spec-tmpl` | ux-expert | Criar especificacao frontend |
| 4 | `create-doc.md` + `brownfield-architecture-tmpl` | architect | Criar arquitetura brownfield |
| 5 | `execute-checklist.md` + `po-master-checklist` | po | Validar artefatos |
| 7 | `shard-doc.md` | po | Fragmentar documentos |
| 8 | `create-next-story.md` | sm | Criar stories |
| 10 | `dev-develop-story.md` | dev | Implementar story |
| 11 | `review-story.md` | qa | Revisar implementacao |
| 12 | `apply-qa-fixes.md` | dev | Aplicar correcoes QA |

### Tasks Relacionadas

```mermaid
graph TB
    subgraph "Tasks de Documentação"
        T1[document-project.md]
        T2[create-doc.md]
        T3[shard-doc.md]
    end

    subgraph "Tasks de Story"
        T4[create-next-story.md]
        T5[dev-develop-story.md]
        T6[review-story.md]
        T7[apply-qa-fixes.md]
    end

    subgraph "Tasks de Validação"
        T8[execute-checklist.md]
        T9[correct-course.md]
    end

    T1 --> T2
    T2 --> T8
    T8 --> T3
    T3 --> T4
    T4 --> T5
    T5 --> T6
    T6 --> T7
    T7 --> T6
```

---

## Pré-requisitos

### Requisitos Técnicos

| Requisito | Descrição | Verificação |
|-----------|-----------|-------------|
| **Aplicação Existente** | Frontend ativo para análise | Codebase acessível |
| **Templates AIOS** | Templates instalados | Verificar `.aios-core/development/templates/` |
| **Agentes Configurados** | Todos os agentes do workflow | Verificar `.aios-core/development/agents/` |
| **Git Configurado** | Controle de versao | `git status` funcional |
| **Node.js** | Runtime para scripts | `node --version` >= 18 |

### Requisitos de Documentação

| Documento | Localização | Necessário Para |
|-----------|-------------|-----------------|
| Templates de PRD | `.aios-core/development/templates/brownfield-prd-tmpl.yaml` | Step 2 |
| Template Frontend | `.aios-core/development/templates/front-end-spec-tmpl.yaml` | Step 3 |
| Template Arquitetura | `.aios-core/development/templates/brownfield-architecture-tmpl.yaml` | Step 4 |
| Checklist PO | `.aios-core/development/checklists/po-master-checklist.md` | Step 5 |
| Template Story | `.aios-core/development/templates/story-tmpl.yaml` | Step 8 |

### Dados de Entrada Recomendados

- Feedback de usuários da aplicação atual
- Dados de analytics (uso de features, tempo em página, etc.)
- Documentação técnica existente (se disponível)
- Design system ou style guide atual
- Requisitos de negócio para melhorias

---

## Entradas e Saidas

### Matriz de Entradas/Saidas por Step

```mermaid
flowchart LR
    subgraph "Entradas"
        I1[Aplicacao Existente]
        I2[Feedback Usuarios]
        I3[Analytics]
        I4[Requisitos Negocios]
    end

    subgraph "Processamento"
        P1[Analise UI]
        P2[PRD]
        P3[Spec Frontend]
        P4[Arquitetura]
        P5[Stories]
        P6[Implementacao]
    end

    subgraph "Saidas"
        O1[docs/project-docs/]
        O2[docs/prd.md]
        O3[docs/front-end-spec.md]
        O4[docs/architecture.md]
        O5[docs/stories/]
        O6[src/ codigo]
    end

    I1 --> P1
    I2 --> P1
    I3 --> P1
    I4 --> P1

    P1 --> O1
    O1 --> P2
    P2 --> O2
    O2 --> P3
    P3 --> O3
    O3 --> P4
    P4 --> O4
    O4 --> P5
    P5 --> O5
    O5 --> P6
    P6 --> O6
```

### Artefatos Finais

| Artefato | Localização | Descrição |
|----------|-------------|-----------|
| Documentação do Projeto | `docs/project-docs/` | Análise do sistema existente |
| PRD Brownfield | `docs/prd.md` | Requisitos do produto |
| Especificação Frontend | `docs/front-end-spec.md` | Especificação UI/UX |
| Arquitetura | `docs/architecture.md` | Arquitetura do sistema |
| PRD Fragmentado | `docs/prd/` | Documentos fragmentados |
| Arquitetura Fragmentada | `docs/architecture/` | Arquitetura fragmentada |
| Stories | `docs/stories/epic-{N}/` | User stories |
| Código Implementado | `src/` | Código fonte |
| Retrospectiva | `docs/epic-retrospective.md` | Learnings (opcional) |

---

## Pontos de Decisão

### Diagrama de Decisões

```mermaid
flowchart TD
    D1{PO encontrou problemas?}
    D1 -->|Sim| A1[Retornar ao agente relevante]
    D1 -->|Não| A2[Prosseguir para fragmentação]

    D2{Revisar story draft?}
    D2 -->|Sim| A3[Analyst/PM revisa story]
    D2 -->|Não| A4[Dev inicia implementação]

    D3{Revisao QA?}
    D3 -->|Sim| A5[QA revisa implementacao]
    D3 -->|Não| A6[Verificar mais stories]

    D4{QA encontrou issues?}
    D4 -->|Sim| A7[Dev corrige feedback]
    D4 -->|Não| A8[Verificar mais stories]

    D5{Mais stories?}
    D5 -->|Sim| A9[Criar próxima story]
    D5 -->|Não| A10[Verificar retrospectiva]

    D6{Epic retrospective?}
    D6 -->|Sim| A11[PO executa retrospectiva]
    D6 -->|Não| A12[Projeto completo]

    style D1 fill:#FFE4B5
    style D2 fill:#FFE4B5
    style D3 fill:#FFE4B5
    style D4 fill:#FFE4B5
    style D5 fill:#FFE4B5
    style D6 fill:#FFE4B5
```

### Descrição dos Pontos de Decisão

| Ponto | Condição | Caminho Sim | Caminho Não |
|-------|----------|-------------|-------------|
| **D1** | `po_checklist_issues` | Corrigir documentos | Fragmentar documentos |
| **D2** | `user_wants_story_review` | Revisao por Analyst/PM | Direto para Dev |
| **D3** | Configuração do projeto | Revisão QA completa | Skip para próxima story |
| **D4** | `qa_left_unchecked_items` | Dev corrige issues | Marcar story como Done |
| **D5** | Stories restantes no PRD | Criar próxima story | Verificar retrospectiva |
| **D6** | `epic_complete` e desejado | Executar retrospectiva | Finalizar projeto |

### Critérios de Decisão

#### Quando Usar Revisão de Story (D2)
- Stories complexas com múltiplas dependências
- Primeira story de um novo epic
- Stories com impacto em múltiplos sistemas
- Requisitos de negócio ambíguos

#### Quando Usar Revisão QA (D3)
- Mudanças em componentes críticos
- Alterações de segurança ou performance
- Código que interage com sistemas externos
- Primeira implementação de novos patterns

#### Quando Fazer Retrospectiva (D6)
- Epic levou mais tempo que planejado
- Houve muitos ciclos de correção
- Novos patterns foram estabelecidos
- Aprendizados importantes para compartilhar

---

## Troubleshooting

### Problemas Comuns e Soluções

#### Problema: Agente não reconhece comandos

**Sintomas:**
- Agente não responde a comandos com prefixo `*`
- Mensagens de erro sobre comandos desconhecidos

**Solução:**
1. Verificar se o agente foi ativado corretamente com `@{agent-id}`
2. Confirmar que o comando existe para o agente (consultar `*help`)
3. Verificar ortografia do comando

```bash
# Exemplo de ativacao correta
@pm
*create-brownfield-prd
```

---

#### Problema: Templates não encontrados

**Sintomas:**
- Erro ao criar documentos
- Mensagem sobre template inexistente

**Solução:**
1. Verificar se templates existem:
```bash
ls .aios-core/development/templates/
```

2. Verificar nome correto do template no workflow
3. Se necessario, reinstalar templates do AIOS core

---

#### Problema: Validação PO falha repetidamente

**Sintomas:**
- Ciclo infinito entre validacao e correcoes
- Documentos nunca são aprovados

**Solução:**
1. Revisar criterios do `po-master-checklist`
2. Verificar se todos os requisitos foram compreendidos
3. Considerar simplificar escopo se necessário
4. Consultar PO sobre critérios específicos

---

#### Problema: Story muito grande para implementação

**Sintomas:**
- Dev demora muito para completar
- Muitas tasks na story
- Feedback de escopo muito amplo

**Solução:**
1. Voltar ao SM para fragmentar story em stories menores
2. Usar comando `*shard-doc` para quebrar PRD
3. Revisar granularidade do epic

---

#### Problema: QA encontra muitos issues

**Sintomas:**
- Ciclos repetidos entre Dev e QA
- Lista crescente de issues

**Solução:**
1. Verificar se Dev está seguindo padrões de código
2. Rodar linting antes de submeter para QA
3. Verificar testes unitários passando
4. Considerar pair programming para issues recorrentes

---

#### Problema: Fragmentação de documentos não funciona

**Sintomas:**
- Erro ao executar shard-doc
- Pastas não criadas

**Solução:**
1. Verificar se documentos foram salvos na pasta `docs/`
2. Confirmar permissões de escrita
3. Executar manualmente:
```bash
@po
# Solicitar fragmentação específica
"shard docs/prd.md"
```

---

### Logs e Diagnósticos

#### Verificar Status do Projeto

```bash
# Via AIOS
@aios-master
*status

# Via Git
git status
```

#### Verificar Histórico de Agentes

```bash
@{agent}
*session-info
```

#### Localizar Artefatos

```bash
# Documentos
ls docs/

# Stories
ls docs/stories/

# Arquitetura
ls docs/architecture/
```

---

## Referências

### Documentação Relacionada

| Documento | Localização | Descrição |
|-----------|-------------|-----------|
| AIOS Knowledge Base | `.aios-core/data/aios-kb.md` | Base de conhecimento AIOS |
| IDE Development Workflow | `.aios-core/data/aios-kb.md#IDE Development Workflow` | Workflow de desenvolvimento IDE |
| Brownfield PRD Template | `.aios-core/development/templates/brownfield-prd-tmpl.yaml` | Template PRD brownfield |
| Frontend Spec Template | `.aios-core/development/templates/front-end-spec-tmpl.yaml` | Template especificacao frontend |
| Brownfield Architecture Template | `.aios-core/development/templates/brownfield-architecture-tmpl.yaml` | Template arquitetura brownfield |
| PO Master Checklist | `.aios-core/development/checklists/po-master-checklist.md` | Checklist de validacao PO |

### Agentes

| Agente | Arquivo | Documentação |
|--------|---------|--------------|
| @architect | `.aios-core/development/agents/architect.md` | Aria - Holistic System Architect |
| @pm | `.aios-core/development/agents/pm.md` | Morgan - Product Manager |
| @ux-expert | `.aios-core/development/agents/ux-design-expert.md` | Uma - UX/UI Designer |
| @po | `.aios-core/development/agents/po.md` | Pax - Product Owner |
| @sm | `.aios-core/development/agents/sm.md` | River - Scrum Master |
| @analyst | `.aios-core/development/agents/analyst.md` | Atlas - Business Analyst |
| @dev | `.aios-core/development/agents/dev.md` | Dex - Full Stack Developer |
| @qa | `.aios-core/development/agents/qa.md` | Quinn - Test Architect |

### Handoff Prompts

Os seguintes prompts são usados para transições entre agentes:

| Transição | Prompt |
|-----------|--------|
| Analyst -> PM | "UI analysis complete. Create comprehensive PRD with UI integration strategy." |
| PM -> UX | "PRD ready. Save it as docs/prd.md, then create the UI/UX specification." |
| UX -> Architect | "UI/UX spec complete. Save it as docs/front-end-spec.md, then create the frontend architecture." |
| Architect -> PO | "Architecture complete. Save it as docs/architecture.md. Please validate all artifacts for UI integration safety." |
| PO Issues | "PO found issues with [document]. Please return to [agent] to fix and re-save the updated document." |
| Complete | "All planning artifacts validated and saved in docs/ folder. Move to IDE environment to begin development." |

---

## Quando Usar Este Workflow

### Indicadores para Uso

- Enhancement de UI requer stories coordenadas
- Mudanças no design system são necessárias
- Novos patterns de componentes são requeridos
- Pesquisa e teste de usuários são necessários
- Múltiplos membros da equipe trabalharão em mudanças relacionadas

### Alternativas

| Cenário | Workflow Recomendado |
|---------|---------------------|
| Projeto novo (greenfield) | `greenfield-ui` |
| Bug fix simples | Workflow ad-hoc com @dev |
| Mudança isolada | Story única sem workflow completo |
| Migração de backend | `brownfield-backend` |
| Full stack | `brownfield-fullstack` |

---

*Documentacao gerada automaticamente a partir de `.aios-core/development/workflows/brownfield-ui.yaml`*

*Última atualização: 2026-02-04*
