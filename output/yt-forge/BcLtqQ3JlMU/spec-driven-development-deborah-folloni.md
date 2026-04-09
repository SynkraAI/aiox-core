---
title: "Spec-Driven Development (SDD) — Workflow Anti-Vibe Coding"
author: "Deborah Folloni"
source: "https://www.youtube.com/watch?v=BcLtqQ3JlMU"
date: 2026-01-16
duration: "29:55"
tags:
  - claude-code
  - workflow
  - spec-driven-development
  - anti-vibe-coding
  - produtividade
  - frameworks
  - tutorial
aliases:
  - SDD
  - Anti-Vibe Coding
---

# Spec-Driven Development (SDD) — Workflow Anti-Vibe Coding

**Método completo da Deborah Folloni** para construir aplicações com Claude Code sem escrever código e sem travar no meio do projeto. Mesmo processo usado para construir o **Epic** (3.000+ usuários, lançado em 90 dias).

> [!info] Sobre a speaker
> Deborah não é desenvolvedora. Construiu um app de produção com 3.000+ usuários usando esse método. Usa Claude Code diariamente desde abril/2025.

---

## Tutorial: O Método em 3 Etapas

### Por que vibe coding não funciona

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

### Visão geral do fluxo

```
Pesquisa → PRD.md → /clear → Spec → spec.md → /clear → Implementação
```

Três conversas separadas, cada uma com um `/clear` entre elas. A ideia central: **resumir e filtrar** a cada etapa para manter a janela de contexto limpa.

---

### Etapa 1: Pesquisa (Research)

**Objetivo:** Buscar todo o contexto necessário para a IA fazer uma implementação efetiva.

> [!tip] Pense nessa etapa como um grande funil
> Vai vir coisa útil e inútil — tudo bem. O PRD vai filtrar só o que importa.

**O que pedir para o Claude Code pesquisar:**

1. **Base de código existente**
   - Quais arquivos serão afetados pela nova implementação
   - Padrões de implementação de features similares já feitas
   - Componentes/trechos reutilizáveis que já existem

2. **Documentações externas**
   - Docs das bibliotecas/tecnologias que serão usadas
   - Apenas os trechos relevantes, não a documentação inteira

3. **Padrões de implementação externos**
   - Stack Overflow, GitHub (projetos open source), docs oficiais

> [!tip] Hack: pasta `.stamp` para padrões do GitHub
> Importe um projeto do GitHub que tenha o padrão que você quer numa pasta `.stamp`, peça pro Claude Code analisar e entender o padrão, e depois delete a pasta. Especialmente útil se você não é dev e nunca viu aquele padrão antes. [14:34]

**Output:** `prd.md` contendo arquivos relevantes, trechos de documentação, code snippets e descrição do que precisa ser feito.

> [!warning] Depois de gerar o PRD, dê `/clear`
> Isso limpa toda a janela de contexto e prepara para a próxima etapa com contexto fresco.

---

### Etapa 2: Spec (Especificação)

**Objetivo:** Transformar o PRD num plano tático e específico de implementação.

1. Referencie o `prd.md` gerado na etapa anterior
2. Peça para o Claude Code gerar uma **spec** contendo:

| Informação | Detalhe |
|-----------|---------|
| Arquivos a **criar** | Path completo + o que criar em cada um |
| Arquivos a **modificar** | Path completo + o que modificar em cada um |
| Code snippets | Pseudocódigo ou trechos reais para cada arquivo |

> [!important] Seja tático e específico
> A spec precisa ter o **path do arquivo** e **exatamente** o que criar ou modificar. Sem isso, "ele vai implementar do jeito dele." [17:42]

**Output:** `spec.md` — o prompt de implementação, um resumão de todo o planejamento.

> [!warning] Depois de gerar a spec, dê `/clear` novamente

---

### Etapa 3: Implementação

**Objetivo:** Executar o plano da spec com a janela de contexto maximamente livre.

1. Anexe a `spec.md` como prompt
2. Peça para o Claude Code implementar seguindo a spec

Toda a janela de contexto fica livre para a implementação, porque o único input é a spec (que já é um resumo filtrado de tudo).

> [!tip] Regra dos 40-50%
> Tente trabalhar usando no máximo 40-50% da sua janela de contexto. Se passar disso, dê `/clear` e continue numa nova conversa. [19:29]

---

### Resultados esperados

| Antes (vibe coding) | Depois (SDD) |
|---------------------|-------------|
| Código repetido | IA importa trechos existentes em vez de recriar |
| Overengineering | Implementações mais simples e enxutas |
| Erros com libs externas | One-shot correto (porque leu a documentação) |
| Tudo num arquivo só | Código modularizado com responsabilidades separadas |
| Velocidade inicial que trava depois | Progresso consistente sem bater na parede |

---

## Frameworks e Mental Models

### Framework Principal: SDD em 3 Etapas

**Quando aplicar:** Toda vez que precisar implementar qualquer funcionalidade com coding assistants.

**Regra crítica:** Dar `/clear` entre cada etapa para limpar a janela de contexto.

---

### Mental Model: IA como Multiplicador [08:00]

> "Quem transforma água em vinho é Jesus. A IA não transforma uma coisa na outra, ela multiplica o que você deu para ela."

Se o input é ruim, o output será ruim multiplicado. A IA amplifica a qualidade (ou a falta dela) do que recebe.

---

### Mental Model: O Funil de Informação [20:41]

A fase de pesquisa funciona como um **grande funil**: entra tudo (útil e inútil), mas o PRD filtra só o que é relevante. Quando passa para a próxima conversa, "não vai lixo".

---

### Mental Model: 100 vs 2000 linhas [25:21]

Referenciando Reed Hastings (Netflix): um desenvolvedor excelente outperforma 20x não por digitar mais rápido, mas por resolver o mesmo problema em 100 linhas ao invés de 2.000. Menos código = menos tokens consumidos = melhor manutenção pela IA.

---

### Mental Model: Velocidade Falsa [28:29]

Vibe coding dá resultados rápidos no início, mas você "bate na parede" logo. É como correr sem mapa — parece rápido até você se perder. O SDD parece mais lento no início, mas leva muito mais longe.

---

## Heurísticas e Regras Práticas

### Gestão da Janela de Contexto

- **Regra dos 40-50%:** Trabalhar com no máximo 40-50% da janela de contexto [19:29]
- **Cada operação consome contexto:** buscar, ler, editar, escrever, rodar MCP, seus prompts — tudo soma [10:00]
- **Mais cheia a janela, pior o resultado** — consenso entre pesquisadores [10:56]

### 4 Tipos de Input Ruim [07:39]

1. **Informação incorreta** — arquivo errado, prompt ambíguo
2. **Informação incompleta** — não passou documentação necessária
3. **Informações inúteis** — enchem a janela sem agregar valor
4. **Informações demais** — mesmo úteis, excesso degrada a performance

### Spec Tática [17:40]

A spec DEVE seguir o padrão:
- **Path do arquivo** + **o que criar ou modificar naquele arquivo**
- Incluir code snippets/pseudocódigos quando relevante
- Sem isso, "ele vai implementar do jeito dele"

---

## Anti-Patterns (O que NÃO fazer)

| Anti-Pattern | O que acontece | Timestamp |
|---|---|---|
| **Vibe coding literal** | Jogar prompts aleatórios e torcer pra dar certo | [00:26] |
| **Over-engineering** | IA complica o que poderia ser simples | [02:42] |
| **Reinventar a roda** | IA cria do zero quando existe lib pronta (ex: TipTap, ProseMirror) | [02:58] |
| **Não passar docs externas** | IA implementa com conhecimento desatualizado | [06:22] |
| **Tudo numa conversa só** | Janela de contexto estoura, qualidade desaba | [19:16] |
| **Código duplicado** | IA recria componentes que já fez (contexto estourou) | [04:12] |
| **Responsabilidades misturadas** | Tudo no mesmo arquivo sem separação | [04:47] |

---

## Conhecimento Tácito

### A IA não avisa que não sabe [03:52]

Se a documentação é de 2026 mas o treinamento parou em 2024, a IA vai tentar fazer o melhor — mas provavelmente vai errar. Ela não diz "eu não sei isso".

### PRD como amnésia controlada [16:35]

O PRD não é só documentação — é um **dispositivo de compressão de contexto**. Ao resumir e limpar a conversa, você "transfere conhecimento" entre conversas sem arrastar lixo. Como dar um briefing conciso para uma pessoa nova.

### Spec como contrato [17:40]

A spec funciona como um contrato entre você e a IA. Sem contrato, ela faz do jeito dela. Com contrato (paths + ações + snippets), ela faz do jeito que você quer.

### One-shot success rate [27:22]

Quando você fornece documentação externa correta, a chance de o código funcionar na primeira tentativa é dramaticamente maior. Sem documentação, a IA chuta. Com documentação, ela segue instruções.

### Para não-desenvolvedores [15:06]

> "Se eu nunca vi um padrão comprovado, como que eu vou saber se o que ele fez é bom ou ruim, se eu não tenho nem referência do que é bom?"

O segredo: **sempre buscar padrões documentados e comprovados** ao invés de confiar no que a IA inventa.

---

## Ferramentas Mencionadas

| Ferramenta | Uso |
|---|---|
| **Claude Code** | Coding assistant principal (CLI) |
| `/clear` | Limpar janela de contexto entre etapas |
| `prd.md` | Artefato da fase de pesquisa |
| `spec.md` | Artefato da fase de spec |
| **TipTap / ProseMirror** | Editores Markdown (ao invés de criar do zero) |
| **NextAuth** | Sistema de autenticação |
| **Resend** | Serviço de envio de e-mails |
| **Deb GPT (Substack)** | Newsletter com os prompts usados no workflow |

---

> [!quote] [28:56]
> "Por mais que inicialmente ele pareça um pouco mais burocrático — e eu não acho que seja — no início você talvez tenha a impressão de que está indo mais devagar, mas você vai muito mais longe se fizer desse jeito."
