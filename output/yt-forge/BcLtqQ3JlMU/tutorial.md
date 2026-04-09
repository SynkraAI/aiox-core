---
title: "Tutorial: Workflow Anti-Vibe Coding com Claude Code (SDD)"
source: "https://www.youtube.com/watch?v=BcLtqQ3JlMU"
channel: "Deborah Folloni"
date: 2026-01-16
tags:
  - claude-code
  - workflow
  - spec-driven-development
  - anti-vibe-coding
  - produtividade
---

# Workflow Anti-Vibe Coding com Claude Code

**Método Spec-Driven Development (SDD)** — o processo completo que a Deborah Folloni usa para construir aplicações com Claude Code sem escrever código e sem travar no meio do projeto.

> [!info] Contexto
> A Deborah usou esse mesmo método para construir o **Epic**, um app com mais de 3.000 usuários lançado em 90 dias, sem escrever uma linha de código. Ela usa Claude Code diariamente desde abril/2025 (~10 meses na data do vídeo).

---

## Pré-requisitos

- Claude Code instalado e configurado
- Um projeto existente (ou novo) onde você vai implementar features
- Familiaridade básica com terminal e arquivos Markdown
- Entendimento do conceito de **context window** (janela de contexto)

---

## Por que vibe coding não funciona

Antes do método, é importante entender os **5 problemas clássicos** que acontecem quando você só joga prompts e torce pra dar certo:

| Problema | O que acontece | Causa raiz |
|----------|---------------|------------|
| **Overengineering** | A IA complica algo que poderia ser simples | Você não disse que existe uma forma mais simples |
| **Reinventar a roda** | A IA cria do zero algo que já tem lib pronta | Você não apontou que já existe solução |
| **Não sabe fazer** | A IA usa API/docs desatualizadas | Knowledge cutoff — ela não leu a doc atual |
| **Repetição de código** | A IA recria componentes que já existem | Context window estourou, ela "esqueceu" |
| **Tudo no mesmo arquivo** | A IA junta responsabilidades diferentes | Você não definiu a separação de arquivos |

> [!quote] [08:02]
> "Quem transforma água em vinho é Jesus. A IA não transforma uma coisa na outra — ela **multiplica** o que você deu para ela. Se você alimentou com um monte de bosta, o que ela vai produzir também é um monte de bosta."

---

## O Método SDD em 3 Etapas

O processo consiste em **3 conversas separadas**, cada uma com um `/clear` entre elas. A ideia central: **resumir e filtrar** a cada etapa para manter a janela de contexto limpa.

```
Pesquisa → PRD.md → /clear → Spec → spec.md → /clear → Implementação
```

---

### Etapa 1: Pesquisa (Research)

**Objetivo:** Buscar todo o contexto necessário para a IA fazer uma implementação efetiva.

> [!tip] Pense nessa etapa como um grande funil
> Vai vir coisa útil e inútil — tudo bem. O PRD vai filtrar só o que importa.

#### O que pedir para o Claude Code pesquisar:

1. **Base de código existente**
   - Quais arquivos serão afetados pela nova implementação
   - Padrões de implementação de features similares já feitas
   - Componentes/trechos reutilizáveis que já existem

2. **Documentações externas**
   - Docs das bibliotecas/tecnologias que serão usadas
   - Apenas os trechos relevantes, não a documentação inteira

3. **Padrões de implementação externos**
   - Stack Overflow
   - GitHub (projetos open source com o padrão desejado)
   - Documentação oficial da tecnologia

> [!tip] Hack: pasta `.tmp` para padrões do GitHub
> Importe um projeto do GitHub que tenha o padrão que você quer numa pasta `.tmp`, peça pro Claude Code analisar e entender o padrão, e depois delete a pasta. Isso é especialmente útil se você não é dev e nunca viu aquele padrão antes.

#### Output: `prd.md`

Ao final da pesquisa, peça para gerar um **PRD.md** contendo:

- Todos os arquivos da base de código **relevantes** (sem os inúteis)
- Trechos das documentações externas que são importantes
- Code snippets e padrões de implementação encontrados
- Descrição do que precisa ser feito

> [!warning] Depois de gerar o PRD, dê `/clear`
> Isso limpa toda a janela de contexto e prepara para a próxima etapa com contexto fresco.

---

### Etapa 2: Spec (Especificação)

**Objetivo:** Transformar o PRD num plano tático e específico de implementação.

#### O que fazer:

1. Referencie o `prd.md` gerado na etapa anterior
2. Peça para o Claude Code ler o PRD e gerar uma **spec** contendo:

| Informação | Detalhe |
|-----------|---------|
| Arquivos a **criar** | Path completo + o que criar em cada um |
| Arquivos a **modificar** | Path completo + o que modificar em cada um |
| Code snippets | Pseudocódigo ou trechos reais para cada arquivo |

> [!important] Seja tático e específico
> A spec precisa ter o **path do arquivo** e **exatamente** o que criar ou modificar. Se você não deixar claro, a IA implementa do jeito dela — e você vai achar ruim.

> [!quote] [17:42]
> "É muito importante que a sua spec siga esse padrão: o path do arquivo que você quer modificar ou criar, e o que você quer criar ou modificar naquele arquivo. Porque se você não deixar isso muito claro, ele vai implementar do jeito dele."

#### Output: `spec.md`

A spec é basicamente o **prompt de implementação** — um resumão de todo o planejamento.

> [!warning] Depois de gerar a spec, dê `/clear` novamente
> Janela de contexto limpa para a implementação.

---

### Etapa 3: Implementação

**Objetivo:** Executar o plano da spec com a janela de contexto maximamente livre.

#### O que fazer:

1. Anexe a `spec.md` como prompt
2. Peça para o Claude Code implementar seguindo a spec

A vantagem aqui é que toda a janela de contexto fica livre para a implementação, porque o único input é a spec (que já é um resumo filtrado de tudo).

> [!tip] Regra dos 40-50%
> Tente trabalhar usando no máximo 40-50% da sua janela de contexto. Se passar disso, dê `/clear` e continue numa nova conversa.

---

## Resultados esperados

Aplicando o método SDD, você vai notar:

| Antes (vibe coding) | Depois (SDD) |
|---------------------|-------------|
| Código repetido | IA importa trechos existentes em vez de recriar |
| Overengineering | Implementações mais simples e enxutas |
| Erros com libs externas | One-shot correto (porque leu a documentação) |
| Tudo num arquivo só | Código modularizado com responsabilidades separadas |
| Velocidade inicial que trava depois | Progresso consistente sem bater na parede |

> [!quote] [25:28]
> "Quanto mais simples, melhor. Imagina ler 2.000 linhas de código versus 100. O de 2.000 linhas vai consumir muito mais token, vai demorar mais. A gente não quer esse tipo de coisa."

---

## Resumo visual do fluxo

```
┌──────────────────────────┐
│    ETAPA 1: PESQUISA     │
│                          │
│  • Ler base de código    │
│  • Buscar docs externas  │
│  • Buscar padrões        │
│                          │
│  Output: prd.md          │
└──────────┬───────────────┘
           │ /clear
┌──────────▼───────────────┐
│     ETAPA 2: SPEC        │
│                          │
│  • Ler prd.md            │
│  • Listar arquivos       │
│    (criar + modificar)   │
│  • Incluir snippets      │
│                          │
│  Output: spec.md         │
└──────────┬───────────────┘
           │ /clear
┌──────────▼───────────────┐
│  ETAPA 3: IMPLEMENTAÇÃO  │
│                          │
│  • Anexar spec.md        │
│  • Executar o plano      │
│  • Janela de contexto    │
│    livre para trabalhar  │
└──────────────────────────┘
```

---

## Princípios-chave

1. **Qualidade do input = Qualidade do output** — informação incorreta, incompleta, inútil ou excessiva arruína o resultado
2. **Context window é o maior vilão** — tudo que você faz consome tokens (buscar, ler, editar, MCPs, prompts)
3. **Resumir e filtrar a cada etapa** — cada `/clear` é uma oportunidade de passar apenas o essencial adiante
4. **Não reinvente a roda** — busque padrões comprovados de quem já fez antes
5. **Simplicidade > Complexidade** — menos linhas = menos tokens = mais espaço para a IA trabalhar

> [!quote] [28:56]
> "Por mais que inicialmente ele pareça um pouco mais burocrático — e eu não acho que seja — no início você talvez tenha a impressão de que está indo mais devagar, mas você vai muito mais longe se fizer desse jeito."
