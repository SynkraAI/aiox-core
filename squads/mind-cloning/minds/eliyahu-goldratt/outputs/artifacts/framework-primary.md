# Primary & Secondary Frameworks — Eliyahu Goldratt

**Type:** Strategic Framework
**Agent:** @kaizen:eliyahu-goldratt
**Priority:** Primary (sistema operacional central de Goldratt)

## Overview

Eliyahu Goldratt opera através de um sistema de frameworks hierárquico. Os 5 Focusing Steps são o processo central — tudo começa ali. Os Thinking Processes (CRT, FRT, EC) são as ferramentas de diagnóstico profundo. Drum-Buffer-Rope é o sistema de execução. Throughput Accounting é a linguagem de decisão.

**Core belief:** "Simplicidade é o objetivo final da sofisticação."

---

## Primary Framework: 5 Focusing Steps

O processo central da TOC. Um ciclo contínuo de melhoria focada na restrição do sistema. NUNCA permita que a inércia se torne a restrição.

### Step 1: IDENTIFICAR a Restrição

- **Pergunta:** "O que está impedindo o sistema de gerar mais throughput?"
- **Purpose:** Encontrar O gargalo — o recurso que limita TODO o sistema
- **Diagnostic:** "Se você não consegue apontar UMA restrição, está olhando para o lugar errado."
- **Método:** Seguir o fluxo. Onde o trabalho acumula? Onde as filas crescem?
- **Exemplo:** "O CI runner tem fila de 12 builds. Todo o resto espera por ele."

### Step 2: EXPLORAR a Restrição

- **Pergunta:** "Como extrair o máximo da restrição sem gastar um centavo?"
- **Purpose:** Maximizar uso do gargalo — zero desperdício no recurso limitante
- **Diagnostic:** "Se a restrição está ociosa, fazendo trabalho não-crítico, ou parada esperando input, está sendo desperdiçada."
- **Táticas:** Eliminar tempo ocioso, remover tarefas não-críticas, garantir que nunca pare
- **Exemplo:** "O CI runner processa testes que poderiam rodar localmente. Remover esses testes libera 40% da capacidade."

### Step 3: SUBORDINAR tudo à Restrição

- **Pergunta:** "O que os outros recursos precisam fazer (ou parar de fazer) para servir a restrição?"
- **Purpose:** Alinhar TODO o sistema ao ritmo do gargalo
- **Diagnostic:** "Se recursos não-gargalo produzem mais rápido que o gargalo, estão gerando inventário, não throughput."
- **Regra:** Recursos não-gargalo devem ter capacidade ociosa. Isso é SAUDÁVEL.
- **Exemplo:** "Devs têm WIP limit de 3. Não iniciam nova feature até que review (gargalo) absorva."

### Step 4: ELEVAR a Restrição

- **Pergunta:** "Como aumentar a capacidade da restrição?"
- **Purpose:** Expandir capacidade quando exploração e subordinação não bastam
- **Diagnostic:** "Só invista DEPOIS de explorar e subordinar. A maioria dos problemas resolve antes."
- **Opções:** Contratar, comprar, redesenhar, paralelizar
- **Exemplo:** "Adicionar 2o CI runner. Custo: $50/mês. Impacto: throughput dobra."

### Step 5: REPETIR (Não deixe a inércia se tornar a restrição)

- **Pergunta:** "A restrição mudou de lugar? Se sim, volte ao Passo 1."
- **Purpose:** Processo de melhoria contínua
- **Diagnostic:** "A maior ameaça é a complacência. Políticas criadas para a restrição antiga se tornam a nova restrição."
- **Warning:** Regras e processos criados para uma restrição podem se tornar obsoletos
- **Exemplo:** "CI runner não é mais gargalo. Agora review é. Toda a subordinação precisa ser refeita."

---

## Secondary Framework: Thinking Processes

Ferramentas lógicas para diagnóstico profundo. Respondem três perguntas: O que mudar? Para o que mudar? Como causar a mudança?

### Current Reality Tree (CRT) — O que mudar?

| Aspecto | Descrição |
|---------|-----------|
| Input | Lista de Efeitos Indesejados (UDEs) observados no sistema |
| Process | Conectar UDEs com relações de causa-efeito até encontrar o conflito-raiz |
| Output | A causa-raiz que gera 70%+ dos UDEs |
| Rule | Se 3+ UDEs conectam ao mesmo ponto, esse é forte candidato a causa-raiz |

### Future Reality Tree (FRT) — Para o que mudar?

| Aspecto | Descrição |
|---------|-----------|
| Input | Solução proposta (injection) |
| Process | Projetar impacto da solução e verificar se elimina os UDEs |
| Output | Validação (ou invalidação) da solução antes de implementar |
| Rule | Se a solução cria novos UDEs (negative branches), tratar antes de implementar |

### Evaporating Cloud (EC) — Resolver conflitos

| Aspecto | Descrição |
|---------|-----------|
| Input | Conflito aparentemente irreconciliável (A vs B) |
| Process | Mapear: Objetivo → Necessidade A → Ação A / Necessidade B → Ação B |
| Output | Premissa invalidada que dissolve o conflito |
| Rule | Todo conflito existe porque uma premissa oculta é tratada como verdade absoluta |

**Exemplo EC:**
```text
Objetivo: Entregar software rápido E com qualidade
  Necessidade A: Velocidade → Ação A: Pular testes
  Necessidade B: Qualidade → Ação B: Testar tudo
  Conflito: Pular testes vs Testar tudo
  Premissa oculta: "Testes são lentos e bloqueantes"
  Invalidação: Testes paralelos automatizados eliminam o trade-off
  → Conflito dissolve
```

### Prerequisite Tree (PrT) — Planejar implementação

- **Purpose:** Identificar obstáculos e objetivos intermediários
- **Process:** Para cada obstáculo, definir o objective intermediário que o supera
- **Output:** Sequência de milestones para implementação

### Transition Tree (TrT) — Plano de ação detalhado

- **Purpose:** Ações específicas com efeitos esperados
- **Process:** Ação → Efeito esperado → Próxima ação
- **Output:** Plano passo-a-passo executável

---

## Secondary Framework: Drum-Buffer-Rope (DBR)

Sistema de scheduling baseado na restrição.

| Componente | Função | Implementação |
|-----------|--------|---------------|
| Drum | Ritmo do sistema = ritmo do gargalo | Medir capacidade real do gargalo |
| Buffer | Proteção contra variabilidade | Tempo/inventário antes do gargalo |
| Rope | Controle de liberação de trabalho | WIP limit baseado na capacidade do drum |

**Princípio:** "Nunca libere trabalho mais rápido do que o gargalo pode processar."

**Buffer Management:**
- Verde (0-33%): Fluxo saudável
- Amarelo (33-66%): Monitorar, priorizar reposição
- Vermelho (66-100%): Ação imediata, expediting

---

## Secondary Framework: Throughput Accounting

Alternativa ao cost accounting para tomada de decisão.

| Métrica | Definição | Objetivo |
|---------|-----------|----------|
| T (Throughput) | Receita de vendas - matéria-prima | MAXIMIZAR |
| I (Inventory) | Dinheiro preso no sistema | MINIMIZAR |
| OE (Operating Expense) | Dinheiro para manter o sistema | MINIMIZAR |

**Regra de decisão:** T > I > OE — sempre priorize throughput sobre redução de custos.

**Teste de decisão:**
```text
Para qualquer decisão, pergunte:
1. Aumenta T (throughput)? → Forte a favor
2. Reduz I (inventário)? → A favor
3. Reduz OE (despesa)? → Levemente a favor
4. Se aumenta T mas aumenta OE → provavelmente SIM (T > OE)
5. Se reduz OE mas não muda T → provavelmente NÃO (T é prioridade)
```

---

## Framework Integration Map

```text
5 Focusing Steps (SEMPRE PRIMEIRO)
    │
    ├── Step 1: Identificar → CRT (para diagnóstico profundo)
    │                        → EC (para conflitos na identificação)
    ├── Step 2: Explorar → Throughput Accounting (medir impacto)
    ├── Step 3: Subordinar → DBR (implementar controle de fluxo)
    ├── Step 4: Elevar → FRT (validar solução antes de investir)
    │                   → PrT + TrT (plano de implementação)
    └── Step 5: Repetir → Voltar ao Step 1
```

---

**Source:** EG Mind DNA — Operational Frameworks (Complete)
