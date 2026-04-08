---
name: code-refactoring-refactor-clean
description: "Expert em refactoring de código seguindo Clean Code, SOLID e design patterns modernos. Analisa code smells, propõe planos de refactoring incrementais "
  Expert em refactoring de código seguindo Clean Code, SOLID e best practices
  modernas. Analisa code smells, propõe refactorings incrementais e executa
  transformações seguras preservando o comportamento externo.
risk: safe
source: self
paths:
  - "skills/code-refactoring-refactor-clean/"
lazy_load: true
context_budget: 2500
version: 2.0.0

category: development
tags: [SKILL]
---

# Refactor & Clean Code v2.0

Expert em refactoring de código seguindo Clean Code, SOLID e design patterns modernos. Analisa code smells, propõe planos de refactoring incrementais e executa transformações seguras — sempre preservando o comportamento externo do sistema.

**Filosofia:** Refactoring é como reforma de casa — você troca a fiação sem derrubar parede. O código muda por dentro, mas por fora tudo continua funcionando igual.

---

## When to Use This Skill

- **Refactoring estrutural** — código emaranhado, funções gigantes, classes com responsabilidades demais
- **Redução de code smells** — duplicação, condicionais complexas, acoplamento forte, nomes ruins
- **Preparação para feature** — o módulo precisa de "espaço" antes de receber funcionalidade nova
- **Tech debt payoff** — dívida técnica acumulada que torna manutenção cara e arriscada
- **Melhoria de testabilidade** — código impossível de testar porque dependências estão hardcoded
- **Migração de padrões** — callbacks → async/await, herança → composição, switch → strategy
- **Code review follow-up** — reviewer apontou problemas estruturais que precisam de refactor

## Do NOT Use This Skill When

- **Feature nova do zero** — refactoring é transformação de código existente, não criação
- **Bug fix simples** — se é uma linha, corrige direto sem precisar de skill
- **Change freeze / code freeze** — respeitar restrições de release
- **Apenas documentação** — não envolve transformação de código
- **Otimização de performance pura** — sem mudança estrutural (use profiler + ajuste pontual)
- **O código não tem testes e você não pode criar** — refatorar sem safety net é como andar na corda bamba sem rede

---

## Discovery Questions

Perguntas para fazer antes de executar. Usar `AskUserQuestion` tool. Pular se o usuário já forneceu contexto.

1. **Qual arquivo ou módulo precisa ser refatorado?** — (define o escopo exato; refactor sem escopo vira refactor infinito)
2. **Quais code smells específicos incomodam?** — (duplicação? complexidade ciclomática? acoplamento? nomes ruins? — prioriza o ataque)
3. **A API pública (contratos, interfaces, signatures) pode mudar ou deve ser preservada 100%?** — (diferencia refactor puro de redesign)
4. **Existe cobertura de testes para esse código?** — (determina se é seguro refatorar ou se precisa criar testes antes — Phase 0)
5. **Prioridade: legibilidade ou performance?** — (quando os dois competem, saber qual pesa mais) (opcional)

---

## Prerequisites

### Obrigatórios

- Código-fonte acessível no working directory atual
- Entendimento do comportamento esperado (testes, specs, ou documentação)

### Recomendados (fortemente)

- **Testes existentes** — são a rede de segurança do refactoring. Sem testes, qualquer mudança é um tiro no escuro
- **Versionamento (git)** — para poder reverter se algo der errado
- **Lint/typecheck configurados** — para detectar regressões automaticamente

### Se não houver testes

Antes de refatorar, criar testes mínimos que capturem o comportamento atual (characterization tests). Não precisa ser cobertura total — apenas o suficiente para garantir que o output não muda.

---

## Phases

### Phase 0 — Safety Net (Condicional)

**Quando:** Código não tem testes cobrindo a área a ser refatorada.

**Ações:**
1. Identificar os inputs e outputs do código alvo
2. Criar characterization tests — testes que documentam o comportamento ATUAL, certo ou errado
3. Rodar os testes para confirmar que passam (baseline)
4. Só prosseguir para Phase 1 após ter safety net

**Artifact:** Testes de caracterização passando (green)

---

### Phase 1 — Análise de Code Smells

**Objetivo:** Entender o que está errado antes de mexer em qualquer coisa. Diagnóstico antes do tratamento.

**Ações:**
1. Ler o código completo do escopo definido
2. Identificar e catalogar code smells (ver Catálogo abaixo)
3. Mapear dependências — quem depende deste código? De quem ele depende?
4. Medir complexidade (número de branches, profundidade de nesting, tamanho de funções)
5. Identificar violações SOLID

**Artifact:** Lista de smells com severidade (critical / high / medium / low)

**Formato do output:**

```
## Análise de Code Smells — {arquivo/módulo}

| # | Smell | Severidade | Linha(s) | Impacto |
|---|-------|-----------|----------|---------|
| 1 | Função com 85 linhas | Critical | 42-127 | Impossível testar/entender |
| 2 | Switch com 12 cases | High | 55-90 | Viola OCP |
| 3 | Nome `data` genérico | Medium | 10, 23, 45 | Prejudica legibilidade |
```

---

### Phase 2 — Propor Refactorings

**Objetivo:** Apresentar opções ao usuário, NUNCA sair refatorando sem aprovação.

**Ações:**
1. Para cada smell, propor 1-3 técnicas de refactoring aplicáveis
2. Ordenar por impacto × esforço (quick wins primeiro)
3. Identificar dependências entre refactorings (qual precisa vir antes de qual)
4. Estimar risco de cada transformação (low / medium / high)

**Formato do output:**

```
## Plano de Refactoring

### Quick Wins (alto impacto, baixo esforço)
1. Extrair magic numbers para constantes — risco: low
2. Renomear variáveis `data`, `temp`, `x` — risco: low

### Refactorings Estruturais
3. Extract Method: dividir `processOrder()` em 3 funções — risco: medium
4. Replace Conditional with Strategy: eliminar switch de 12 cases — risco: medium

### Refactorings Profundos
5. Dependency Injection: desacoplar repositório — risco: high
```

**Regra:** SEMPRE apresentar o plano e aguardar aprovação antes de executar.

---

### Phase 3 — Executar Refactorings

**Objetivo:** Aplicar as transformações aprovadas, uma de cada vez.

**Princípios de execução:**
- **Menor change possível** — cada commit deve ser atômico e reversível
- **Um refactoring por vez** — não misturar Extract Method com Rename na mesma mudança
- **Preservar comportamento** — o output do código DEVE ser idêntico ao original
- **Compilar/lint após cada mudança** — detectar erros imediatamente

**Sequência recomendada:**
1. Renomear (mais seguro, zero risco funcional)
2. Extrair (constantes, variáveis, métodos)
3. Mover (reorganizar responsabilidades)
4. Substituir (padrão antigo → padrão novo)
5. Remover (dead code, após confirmar que ninguém usa)

---

### Phase 4 — Validar

**Objetivo:** Garantir que nada quebrou.

**Ações:**
1. Rodar todos os testes existentes — DEVEM continuar passando
2. Rodar lint e typecheck — DEVEM continuar passando
3. Comparar outputs antes/depois (se aplicável)
4. Revisar o diff final — está claro? Outro dev entenderia?

**Critérios de aceite:**
- [ ] Todos os testes passam (incluindo characterization tests da Phase 0)
- [ ] Lint sem novos warnings
- [ ] Typecheck sem novos erros
- [ ] Comportamento externo idêntico ao original
- [ ] Diff é reviewable (não é um monolito de 500 linhas)

---

### Phase 5 — Documentar

**Objetivo:** Deixar registro do que foi feito e por quê.

**Ações:**
1. Commit com mensagem descritiva: `refactor: extract payment validation into dedicated service`
2. Se houver decisões não-óbvias, adicionar comentário no código explicando o "por quê"
3. Atualizar documentação se interfaces públicas mudaram

---

## Catálogo de Padrões de Refactoring

### Extrações

| Técnica | Quando Usar | Exemplo |
|---------|------------|---------|
| **Extract Method** | Função longa com blocos lógicos distintos | 80 linhas → 4 funções de 20 |
| **Extract Variable** | Expressão complexa repetida ou difícil de ler | `if (a > 0 && b < 10 && c !== null)` → `const isValid = ...` |
| **Extract Constant** | Magic numbers ou strings hardcoded | `0.08` → `TAX_RATE` |
| **Extract Class** | Classe com múltiplas responsabilidades | `UserManager` → `UserAuth` + `UserProfile` |
| **Extract Interface** | Múltiplas implementações de um contrato implícito | Criar interface explícita para DI |

### Substituições

| Técnica | Quando Usar | Exemplo |
|---------|------------|---------|
| **Replace Conditional with Polymorphism** | Switch/if-else com muitos branches | Switch de tipos → Strategy Pattern |
| **Replace Temp with Query** | Variável temporária usada uma vez | `const x = calc(); return x;` → `return calc();` |
| **Replace Inheritance with Composition** | Herança profunda ou forçada | `extends BaseService` → `has validator` |
| **Replace Callback with Async/Await** | Callback hell | Promisify + async/await |

### Reorganizações

| Técnica | Quando Usar | Exemplo |
|---------|------------|---------|
| **Move Method** | Método está na classe errada | `order.calculateTax()` → `taxService.calculate(order)` |
| **Inline Method** | Método trivial que só adiciona indireção | `getName() { return this.name; }` → acesso direto |
| **Introduce Parameter Object** | Função com 5+ parâmetros | `fn(a, b, c, d, e)` → `fn(config)` |
| **Replace Magic Number with Constant** | Números sem contexto espalhados no código | `86400` → `SECONDS_PER_DAY` |

### Design Patterns (aplicação via refactoring)

| Pattern | Quando Aplicar via Refactoring |
|---------|-------------------------------|
| **Strategy** | Switch/if-else selecionando algoritmos diferentes |
| **Factory** | `new` espalhado com lógica de decisão de tipo |
| **Observer** | Código que notifica múltiplos consumidores manualmente |
| **Decorator** | Funcionalidade empilhada via herança ou if-else |
| **Repository** | Acesso a dados misturado com lógica de negócio |
| **Facade** | Subsistema complexo exposto diretamente ao consumidor |

---

## Princípios SOLID — Checklist de Violações

| Princípio | Sinal de Violação | Refactoring Recomendado |
|-----------|-------------------|------------------------|
| **SRP** (Single Responsibility) | Classe/função faz mais de uma coisa | Extract Class, Extract Method |
| **OCP** (Open/Closed) | Precisa modificar código existente para adicionar variação | Strategy, Template Method |
| **LSP** (Liskov Substitution) | Subclasse quebra contrato da superclasse | Repensar hierarquia, usar composição |
| **ISP** (Interface Segregation) | Cliente forçado a implementar métodos que não usa | Dividir interface em interfaces menores |
| **DIP** (Dependency Inversion) | Módulo de alto nível depende de implementação concreta | Dependency Injection, Extract Interface |

---

## Safety Rules

- **NUNCA** mudar comportamento externo sem aprovação explícita do usuário
- **NUNCA** refatorar sem testes (criar Phase 0 primeiro)
- **NUNCA** fazer refactoring big-bang (tudo de uma vez) — sempre incremental
- **SEMPRE** manter diffs pequenos e reviewable
- **SEMPRE** rodar testes após cada transformação
- **SEMPRE** poder reverter (commits atômicos)
- Se algo quebrar durante a execução: **PARAR**, reverter a última mudança, investigar

---

## Resources

- `resources/implementation-playbook.md` — Exemplos de código detalhados, before/after para cada padrão, checklists de implementação
