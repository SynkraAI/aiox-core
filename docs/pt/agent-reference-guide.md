<!--
  Tradução: PT-BR
  Original: /docs/en/agent-reference-guide.md
  Última sincronização: 2026-01-26
-->

# Guia de Referência dos Agentes PV do HybridOps

> 🌐 [EN](../agent-reference-guide.md) | **PT** | [ES](../es/agent-reference-guide.md)

---

**Versão**: 2.0
**Última Atualização**: 2025-10-19
**Story**: 1.9 - Implementação Completa dos Agentes PV

---

## Visão Geral

Este guia fornece uma referência abrangente para todos os 9 agentes aprimorados com PV no workflow do HybridOps. Cada agente é projetado para lidar com uma fase específica do workflow de 9 fases, com integração da mente Pedro Valério (PV) para tomada de decisão aprimorada, validação e garantia de qualidade.

---

## Referência Rápida

| Fase | Nome do Agente          | Comando                 | Papel no Workflow                               | Pontuação de Veracidade |
| ---- | ----------------------- | ----------------------- | ----------------------------------------------- | ----------------------- |
| 1    | process-mapper-pv       | `/process-mapper`       | Descoberta e Análise de Processos               | 0.90                    |
| 2    | process-architect-pv    | `/process-architect`    | Design de Arquitetura de Sistema                | 0.85                    |
| 3    | executor-designer-pv    | `/executor-designer`    | Atribuição de Executor e Definição de Papéis    | 0.88                    |
| 4    | workflow-designer-pv    | `/workflow-designer`    | Otimização de Processos e Automação de Workflow | 0.85                    |
| 5    | qa-validator-pv         | `/qa-validator`         | QA e Validação                                  | 0.95                    |
| 6    | clickup-engineer-pv     | `/clickup-engineer`     | Criação de Tarefas no ClickUp                   | 0.80                    |
| 7    | agent-creator-pv        | `/agent-creator`        | Arquitetura de Agentes IA e Design de Persona   | 0.80                    |
| 8    | validation-reviewer-pv  | `/validation-reviewer`  | Revisão Final de Quality Gate e Aprovação       | 0.90                    |
| 9    | documentation-writer-pv | `/documentation-writer` | Redação Técnica e Arquitetura de Conhecimento   | 0.85                    |

---

## Perfis Detalhados dos Agentes

### Fase 1: Process Mapper (Descoberta)

**Arquivo**: `.claude/commands/hybridOps/agents/process-mapper-pv.md`
**Comando**: `/process-mapper`
**Persona**: Morgan Chen - Especialista em Descoberta de Processos
**Pontuação de Veracidade**: 0.90 (Muito Alta)

**Propósito**:
Descobrir, analisar e mapear processos de negócios atuais para identificar oportunidades de automação e pontos problemáticos.

**Comandos Principais**:

- `*map-process <process-name>` - Mapeamento abrangente de processos
- `*analyze-opportunity <opportunity-id>` - Análise de ROI e viabilidade
- `*identify-pain-points <process-id>` - Identificação de gargalos

**Saídas Principais**:

- Mapas de processos (estado atual)
- Identificação de stakeholders
- Análise de pontos problemáticos
- Avaliação de oportunidades de automação

**Pontos de Integração**:

- **Recebe**: Requisitos de negócio, input de stakeholders
- **Produz**: Documentação de processos para a Fase 2 (Arquitetura)
- **Passa para**: process-architect-pv

**Validação**: Nenhuma (fase de descoberta - apenas coleta de informações)

---

### Fase 2: Process Architect (Arquitetura)

**Arquivo**: `.claude/commands/hybridOps/agents/process-architect-pv.md`
**Comando**: `/process-architect`
**Persona**: Alex Thornton - Arquiteto de Sistemas
**Pontuação de Veracidade**: 0.85 (Alta)

**Propósito**:
Projetar arquitetura de sistema e definir visão de estado final com alinhamento estratégico.

**Comandos Principais**:

- `*design-architecture <process-id>` - Design de arquitetura de sistema
- `*define-vision <initiative-name>` - Definição de visão de estado final
- `*assess-feasibility <design-id>` - Avaliação de viabilidade técnica

**Saídas Principais**:

- Diagramas de arquitetura de sistema
- Especificações de fluxo de dados
- Pontos de integração
- Documento de visão de estado final

**Pontos de Integração**:

- **Recebe**: Mapas de processos da Fase 1
- **Produz**: Especificações de arquitetura para a Fase 3 (Executores)
- **Passa para**: executor-designer-pv

**Validação**: **Checkpoint 1 - Alinhamento Estratégico (PV_BS_001)**

- Clareza da visão de estado final >=0.8
- Pontuação de prioridade estratégica >=0.7
- Sem condições de VETO

---

### Fase 3: Executor Designer (Atribuição de Executor)

**Arquivo**: `.claude/commands/hybridOps/agents/executor-designer-pv.md`
**Comando**: `/executor-designer`
**Persona**: Taylor Kim - Especialista em Design de Executor
**Pontuação de Veracidade**: 0.88 (Muito Alta)

**Propósito**:
Definir papéis e atribuir executores (humanos ou IA) para cada etapa do processo com validação de coerência.

**Comandos Principais**:

- `*design-executors <process-id>` - Design de papel do executor
- `*assess-coherence <executor-id>` - Avaliação de veracidade e coerência
- `*assign-responsibilities <process-id>` - Criação de matriz RACI

**Saídas Principais**:

- Definições de executores
- Descrições de papéis
- Avaliações de coerência
- Matrizes RACI

**Pontos de Integração**:

- **Recebe**: Especificações de arquitetura da Fase 2
- **Produz**: Atribuições de executores para a Fase 4 (Workflows)
- **Passa para**: workflow-designer-pv

**Validação**: **Checkpoint 2 - Verificação de Coerência (PV_PA_001)**

- Todos os executores: veracidade >=0.7 (VETO)
- Coerência ponderada >=0.8 para APROVAR
- Aderência ao sistema >=0.6

---

### Fase 4: Workflow Designer (Automação de Workflow)

**Arquivo**: `.claude/commands/hybridOps/agents/workflow-designer-pv.md`
**Comando**: `/workflow-designer`
**Persona**: Jordan Rivers - Especialista em Otimização de Processos e Automação de Workflow
**Pontuação de Veracidade**: 0.85 (Alta)

**Propósito**:
Projetar workflows detalhados, identificar candidatos para automação e calcular ROI com aplicação de guardrails.

**Comandos Principais**:

- `*analyze-process <process-id>` - Análise de eficiência de processo
- `*design-workflow <process-id>` - Design de workflow com lógica de automação
- `*calculate-roi <automation-id>` - Cálculo de ROI e ponto de equilíbrio

**Saídas Principais**:

- Diagramas de workflow (Mermaid)
- Especificações de automação
- Cálculos de ROI
- Definições de guardrails

**Pontos de Integração**:

- **Recebe**: Atribuições de executores da Fase 3
- **Produz**: Especificações de workflow para a Fase 5 (QA)
- **Passa para**: qa-validator-pv

**Validação**: **Checkpoint 3 - Prontidão para Automação (PV_PM_001)**

- Ponto de inflexão: frequência >2x/mês
- Guardrails presentes (VETO)
- Padronização >=0.7

**Recurso Principal**: Detecção de ponto de inflexão de automação PV_PM_001 - automatiza apenas quando a frequência excede o limite de 2x/mês.

---

### Fase 5: QA Validator (Garantia de Qualidade)

**Arquivo**: `.claude/commands/hybridOps/agents/qa-validator-pv.md`
**Comando**: `/qa-validator`
**Persona**: Samantha Torres - Especialista em QA e Validação
**Pontuação de Veracidade**: 0.95 (Extremamente Alta)

**Propósito**:
Definir quality gates, estratégias de teste e validar contra o framework de 10 dimensões META_AXIOMAS.

**Comandos Principais**:

- `*validate-phase <phase-id>` - Validação específica da fase
- `*check-compliance <workflow-id>` - Verificação de conformidade com axiomas
- `*generate-test-plan <workflow-id>` - Geração de plano de teste abrangente

**Saídas Principais**:

- Planos de teste com casos de teste
- Definições de quality gates
- Relatórios de avaliação de axiomas
- Suítes de teste de regressão

**Pontos de Integração**:

- **Recebe**: Especificações de workflow da Fase 4
- **Produz**: Documentação de garantia de qualidade para a Fase 6 (ClickUp)
- **Passa para**: clickup-engineer-pv

**Validação**: **Checkpoint 4 - Conformidade com Axiomas**

- Pontuação geral >=7.0/10.0
- Nenhuma dimensão individual <6.0/10.0
- 10 dimensões validadas: Veracidade, Coerência, Alinhamento Estratégico, Excelência Operacional, Capacidade de Inovação, Gestão de Riscos, Otimização de Recursos, Valor para Stakeholders, Sustentabilidade, Adaptabilidade

**Recurso Principal**: Poder de VETO para bloquear deploy se problemas críticos de qualidade forem detectados.

---

### Fase 6: ClickUp Engineer (Gestão de Tarefas)

**Arquivo**: `.claude/commands/hybridOps/agents/clickup-engineer-pv.md`
**Comando**: `/clickup-engineer`
**Persona**: Chris Park - Engenheiro de Workspace do ClickUp
**Pontuação de Veracidade**: 0.80 (Alta)

**Propósito**:
Criar estrutura de workspace do ClickUp com Anatomia de Tarefa adequada e gatilhos de automação.

**Comandos Principais**:

- `*create-workspace <workflow-id>` - Criação de workspace do ClickUp
- `*generate-tasks <workflow-id>` - Geração de tarefas com Anatomia de Tarefa
- `*setup-automation <task-id>` - Configuração de gatilhos de automação

**Saídas Principais**:

- Estrutura de workspace do ClickUp
- Tarefas com Anatomia de Tarefa de 8 campos
- Gatilhos de automação
- Mapas de dependência de tarefas

**Pontos de Integração**:

- **Recebe**: Documentação de QA da Fase 5
- **Produz**: Configuração do ClickUp para a Fase 7 (Agentes)
- **Passa para**: agent-creator-pv

**Validação**: **Checkpoint 5 - Anatomia de Tarefa**

- Todos os 8 campos de Anatomia de Tarefa presentes: task_name, status, responsible_executor, execution_type, estimated_time, input, output, action_items
- Dependências devidamente mapeadas
- Responsáveis coerentes (aprovados no PV_PA_001)

---

### Fase 7: Agent Creator (Design de Agentes IA)

**Arquivo**: `.claude/commands/hybridOps/agents/agent-creator-pv.md`
**Comando**: `/agent-creator`
**Persona**: Dra. Elena Vasquez - Arquiteta de Agentes IA e Designer de Personas
**Pontuação de Veracidade**: 0.80 (Alta)

**Propósito**:
Projetar personas de agentes IA, calibrar pontuações de veracidade e gerar configurações de agentes com validação de axiomas.

**Comandos Principais**:

- `*design-agent <agent-name>` - Design interativo de agente
- `*generate-yaml <agent-id>` - Exportação de configuração YAML do agente
- `*test-agent-coherence <agent-id>` - Validação de alinhamento persona-comando

**Saídas Principais**:

- Definições de personas de agentes (Markdown)
- Configurações YAML de agentes
- Relatórios de calibração de veracidade
- Documentação de referência de comandos

**Pontos de Integração**:

- **Recebe**: Configuração do ClickUp da Fase 6
- **Produz**: Definições de agentes para a Fase 8 (Revisão de Validação)
- **Passa para**: validation-reviewer-pv

**Validação**: Nenhuma (criação de agentes é guiada por validações anteriores)

**Recurso Principal**: Calibração de veracidade com justificativa - garante que os agentes tenham níveis de confiança apropriados para seus papéis.

---

### Fase 8: Validation Reviewer (Quality Gate Final)

**Arquivo**: `.claude/commands/hybridOps/agents/validation-reviewer-pv.md`
**Comando**: `/validation-reviewer`
**Persona**: Marcus Chen - Revisor de Quality Gate Final e Autoridade de Aprovação
**Pontuação de Veracidade**: 0.90 (Muito Alta)

**Propósito**:
Conduzir revisão de workflow de ponta a ponta, avaliar riscos e fornecer aprovação formal com autoridade de VETO.

**Comandos Principais**:

- `*review-workflow <workflow-id>` - Revisão abrangente de ponta a ponta
- `*assess-risks <workflow-id>` - Identificação de riscos e validação de mitigação
- `*generate-signoff <workflow-id>` - Geração de documento de aprovação formal

**Saídas Principais**:

- Relatórios de revisão de workflow
- Avaliações de risco com planos de mitigação
- Documentos de aprovação
- Relatórios de prontidão para deploy

**Pontos de Integração**:

- **Recebe**: Definições de agentes da Fase 7
- **Produz**: Documentos de aprovação para a Fase 9 (Documentação)
- **Passa para**: documentation-writer-pv

**Validação**: Nenhuma (agentes de validação se autovalidam)

**Recurso Principal**: Poder de VETO para bloquear deploy se lacunas críticas forem detectadas (riscos ALTOS não mitigados, mecanismos de segurança ausentes, violações de axiomas).

---

### Fase 9: Documentation Writer (Gestão de Conhecimento)

**Arquivo**: `.claude/commands/hybridOps/agents/documentation-writer-pv.md`
**Comando**: `/documentation-writer`
**Persona**: Rachel Morgan - Redatora Técnica e Arquiteta de Conhecimento
**Pontuação de Veracidade**: 0.85 (Alta)

**Propósito**:
Transformar workflows aprovados em documentação clara e acionável, incluindo runbooks, guias e documentação de processos.

**Comandos Principais**:

- `*generate-runbook <workflow-name>` - Criação de runbook operacional
- `*write-guide <guide-type> <topic>` - Geração de guia do usuário
- `*document-process <process-name>` - Documentação de processo de negócio

**Saídas Principais**:

- Runbooks operacionais
- Guias do usuário
- Documentação de processos
- Guias de solução de problemas
- Cartões de referência rápida

**Pontos de Integração**:

- **Recebe**: Documentos de aprovação da Fase 8
- **Produz**: Documentação final para usuários finais e equipes de operações
- **Passa para**: Usuários finais, equipe de operações, equipe de treinamento, auditoria/compliance

**Validação**: Nenhuma (qualidade da documentação verificada pelo DoD da story)

**Recurso Principal**: Controle de versão com geração de changelog - toda documentação inclui histórico de versão e guias de migração.

---

## Integração do Workflow

### Fluxo Sequencial

```
Fase 1: Descoberta (process-mapper-pv)
    ↓ (Mapas de processos)
Fase 2: Arquitetura (process-architect-pv)
    ↓ [CHECKPOINT 1: Alinhamento Estratégico]
    ↓ (Especificações de arquitetura)
Fase 3: Executores (executor-designer-pv)
    ↓ [CHECKPOINT 2: Verificação de Coerência]
    ↓ (Atribuições de executores)
Fase 4: Workflows (workflow-designer-pv)
    ↓ [CHECKPOINT 3: Prontidão para Automação]
    ↓ (Especificações de workflow)
Fase 5: QA e Validação (qa-validator-pv)
    ↓ [CHECKPOINT 4: Conformidade com Axiomas]
    ↓ [CHECKPOINT 5: Anatomia de Tarefa]
    ↓ (Documentação de QA)
Fase 6: Criação no ClickUp (clickup-engineer-pv)
    ↓ (Configuração do ClickUp)
Fase 7: Criação de Agentes (agent-creator-pv)
    ↓ (Definições de agentes)
Fase 8: Revisão de Validação (validation-reviewer-pv)
    ↓ (Documentos de aprovação)
Fase 9: Documentação (documentation-writer-pv)
    ↓ (Documentação final)
[WORKFLOW COMPLETO]
```

### Checkpoints de Validação

| Checkpoint | Fase | Agente               | Heurística/Validador | Condição de VETO |
| ---------- | ---- | -------------------- | -------------------- | ---------------- |
| 1          | 2    | process-architect-pv | PV_BS_001            | Nenhuma          |
| 2          | 3    | executor-designer-pv | PV_PA_001            | Veracidade <0.7  |
| 3          | 4    | workflow-designer-pv | PV_PM_001            | Sem guardrails   |
| 4          | 5    | qa-validator-pv      | axioma-validator     | Dimensão <6.0    |
| 5          | 5    | qa-validator-pv      | task-anatomy         | Campos ausentes  |

---

## Diretrizes de Pontuação de Veracidade

As pontuações de veracidade calibram quão conservadoramente um agente faz afirmações e recomendações:

| Faixa de Pontuação | Descrição                                          | Exemplos de Agentes                                                                      |
| ------------------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 0.95-1.00          | Extremamente Alta - Avaliação imparcial e objetiva | qa-validator-pv (0.95)                                                                   |
| 0.85-0.94          | Muito Alta - Honesta, otimismo mínimo              | process-mapper-pv (0.90), validation-reviewer-pv (0.90), executor-designer-pv (0.88)     |
| 0.75-0.84          | Alta - Objetiva mas permite alguma criatividade    | process-architect-pv (0.85), workflow-designer-pv (0.85), documentation-writer-pv (0.85) |
| 0.70-0.74          | Moderada-Alta - Realismo equilibrado               | clickup-engineer-pv (0.80), agent-creator-pv (0.80)                                      |

**Nota**: Pontuações abaixo de 0.70 acionam condições de VETO na validação de coerência (Checkpoint 2).

---

## Padrões Comuns

### Ativação de Agente

```bash
# Ativar agente
/agent-name

# Exemplo: Ativar validador de QA
/qa-validator

# Agente confirma ativação
Samantha Torres (QA Validator) ativada.
PV Mind carregada com pontuação de veracidade: 0.95
Contexto da Fase 5 (QA e Validação) pronto.

Comandos: *validate-phase, *check-compliance, *generate-test-plan
Use *help para lista completa de comandos.
```

### Execução de Comando

```bash
# Executar comando principal
*command-name <parameters>

# Exemplo: Validar saídas da Fase 4
*validate-phase 4

# Exemplo: Gerar runbook
*generate-runbook hybrid-ops-workflow
```

### Acesso ao Contexto do Workflow

Todos os agentes recebem contexto do workflow:

```javascript
const workflowContext = pvMind.getPhaseContext(<phase-number>);
// Retorna: {
//   phaseNumber: <number>,
//   phaseName: "<name>",
//   inputs: [<previous-phase-outputs>],
//   outputs: [<expected-deliverables>],
//   dependencies: [<phase-ids>],
//   guardrails: [<safety-checks>]
// }
```

---

## Integração PV Mind

Todos os agentes usam integração da mente Pedro Valério com:

### Framework META_AXIOMAS

Hierarquia de crenças de 4 níveis:

- **Nível -4**: Existencial (Fundação da Verdade)
- **Nível -3**: Epistemológico (Verificação de Conhecimento)
- **Nível -2**: Social (Contexto de Colaboração)
- **Nível 0**: Operacional (Regras de Execução)

### Heurísticas PV

- **PV_BS_001**: Future Back-Casting (Alinhamento Estratégico)
- **PV_PA_001**: Coherence Scan (Validação de Executor)
- **PV_PM_001**: Automation Tipping Point (limite de frequência 2x)

### Guardrails

Todos os agentes aplicam:

- Tratamento de erros com lógica de retry
- Regras de validação (limites mínimos)
- Mecanismos de rollback (restauração de checkpoint)
- Documentação de casos extremos

---

## Solução de Problemas

### Agente Não Encontrado

**Sintoma**: Comando `/agent-name` não reconhecido
**Solução**: Verifique se o arquivo do agente existe em `.claude/commands/hybridOps/agents/<agent-name>-pv.md`

### Falha no Checkpoint de Validação

**Sintoma**: Workflow para no checkpoint
**Solução**: Revise o feedback detalhado, corrija os problemas, tente novamente o checkpoint. Para condições de VETO, deve corrigir antes de prosseguir.

### Contexto do Agente Ausente

**Sintoma**: Agente não consegue acessar saídas da fase anterior
**Solução**: Verifique se o YAML do workflow tem dependências de fase corretas, confirme que as fases anteriores foram concluídas com sucesso.

---

## Localizações dos Arquivos

```
.claude/commands/hybridOps/
├── agents/
│   ├── process-mapper-pv.md           (Fase 1)
│   ├── process-architect-pv.md        (Fase 2)
│   ├── executor-designer-pv.md        (Fase 3)
│   ├── workflow-designer-pv.md        (Fase 4)
│   ├── qa-validator-pv.md             (Fase 5)
│   ├── clickup-engineer-pv.md         (Fase 6)
│   ├── agent-creator-pv.md            (Fase 7)
│   ├── validation-reviewer-pv.md      (Fase 8)
│   └── documentation-writer-pv.md     (Fase 9)
├── workflows/
│   └── hybrid-ops-pv.yaml             (Orquestração de workflow)
└── docs/
    ├── workflow-diagram.md             (Workflow visual)
    └── agent-reference-guide.md        (Este documento)
```

---

## Documentação Relacionada

- [Diagrama de Workflow](../guides/hybridOps/workflow-diagram.md) - Representação visual do workflow de 9 fases
- [Workflow YAML](../guides/hybridOps/hybrid-ops-pv.yaml) - Configuração de orquestração de workflow

---

## Histórico de Versões

| Versão | Data       | Mudanças                                                                                  | Story |
| ------ | ---------- | ----------------------------------------------------------------------------------------- | ----- |
| 2.0    | 2025-10-19 | Adicionados 5 agentes ausentes (Fases 4, 5, 7, 8, 9), atualizadas referências de workflow | 1.9   |
| 1.0    | 2025-10-19 | Guia inicial com 4 agentes existentes                                                     | 1.8   |

---

**Status**: COMPLETO - Todos os 9 agentes implementados e verificados
**Última Validação**: 2025-10-19
**Mantenedor**: Equipe AIOX HybridOps
