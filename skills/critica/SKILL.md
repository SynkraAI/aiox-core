---
name: critica
description: "Revisao critica completa antes de agir. Fase 1: pontos cegos, riscos, advogado do diabo, alternativas, red team, pre-mortem, over-engineering. Fase 2: diretrizes de execucao disciplinada (escopo minimo, anti-hardcoded, anti-duplicidade, deterministico-first, pipeline de melhoria). Use com /critica, 'revisar plano', 'pontos cegos', 'devil advocate', 'red team', 'pre-mortem', 'sem hardcoded', 'melhoria estruturada'."
user-invocable: true
paths: ["docs/superpowers/plans/**", ".claude/rules/**"]
effort: 3
allowed-tools: Read, Grep, Glob, Bash, WebSearch, WebFetch
---

# Critica — Revisao + Execucao Disciplinada

Duas fases obrigatorias: primeiro questionar, depois disciplinar.

## Quando invocar

**Antes de commitar** qualquer mudanca que envolva:
- Race condition, idempotencia, deduplicacao, dual-consumer
- Novo padrao arquitetural ou decisao de design
- Refatoracao de logica existente com mais de 20 linhas alteradas

**Nunca usar como revisao pos-commit** se o objetivo e manter historico limpo. /critica pre-commit = 1 commit correto. /critica pos-commit = 2 commits (fix + correcao do fix).

### Integração com Ping-Pong

A skill `code-review-ping-pong` executa automaticamente uma **versão focada** da critica
(Fase 1: pontos cegos + citações + red team | Fase 2: escopo mínimo + ripple effect)
após atingir PERFECT (10/10). Não é necessário rodar `/critica` manualmente após ping-pong.

Se a critica encontrar problemas (`NEEDS_WORK`), o ping-pong abre automaticamente uma nova
round de review. O resultado é salvo em `critica.md` no diretório de rounds.

Para pular: `--no-critica` no orchestrator ou `pingpong --no-critica`.

---

## FASE 1: Questionar (antes de decidir)

Antes de implementar qualquer coisa, responder:

### 1. Pontos cegos

O que esta analise/plano NAO esta considerando? Quais premissas estao implicitas e podem estar erradas?

### 2. Riscos e mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| (listar) | alta/media/baixa | alto/medio/baixo | (acao concreta) |

### 3. Advogado do diabo

Argumentar CONTRA a abordagem proposta. Qual o melhor caso para NAO fazer isso? O que um critico diria?

### 3b. Verificacao com citacoes (anti-alucinacao)

Para CADA claim ou afirmacao feita na analise/plano:
- Encontrar uma quote direta do documento/codigo/fonte que a sustenta
- Se nao encontrar quote -> retrair o claim e marcar com `[SEM FONTE]`
- Nunca afirmar algo que nao pode ser rastreado a uma fonte concreta

Formato:
```text
Claim: "X e a melhor abordagem porque Y"
Fonte: "..." (arquivo:linha ou URL)
-- Se sem fonte: [SEM FONTE] -- claim removido
```

### 3c. Red team (ataque adversario)

Mudar de perspectiva: assumir o papel de um adversario externo tentando destruir o objeto em analise. Adaptar "adversario" ao contexto:

| Contexto | Quem e o adversario |
|----------|---------------------|
| Plano de produto/negocio | Concorrente bem-financiado querendo tirar do mercado |
| Arquitetura/codigo | Atacante buscando vulnerabilidade, abuso ou edge case |
| Skill/workflow/processo | Usuario mal-intencionado ou caso extremo que quebra o fluxo |
| Conteudo/copy/tese | Critico hostil procurando contradicoes, furos logicos, ma-fe |
| Decisao estrategica | Stakeholder cetico procurando motivos para vetar |

Regras do ataque:
- Listar os **5 movimentos mais destrutivos** contra o objeto
- Ser **especifico**: citar o vetor, o mecanismo, o resultado
- **Sem hedging**: nada de "risco potencial" ou "talvez". Ataques reais
- **Sem generalidades** tipo "falta escalabilidade" -- dizer ONDE e COMO quebra
- Priorizar por dano, nao por probabilidade
- **Ataques sobre "X nao existe"**: verificar empiricamente ANTES de classificar como critico. Consultar a fonte real (banco, API, filesystem, lista de funcoes) antes de elevar prioridade. Ataques especulativos sobre existencia recebem prioridade **media** por padrao -- promovidos para alta so apos verificacao falhar.

Formato:
```text
Ataque 1: [vetor especifico]
  Mecanismo: como o adversario explora
  Resultado: o que quebra / dano causado
  Defesa minima: mudanca necessaria para bloquear
```

### 3d. Pre-mortem (fracasso imaginado)

Projetar-se no futuro e assumir que o objeto em analise **ja fracassou**. Escrever o post-mortem retroativo. Horizonte depende do contexto:

| Contexto | Horizonte sugerido |
|----------|-------------------|
| Projeto/produto | 6 meses |
| Feature/release | 4-8 semanas |
| Skill/workflow/processo | 10-20 usos reais |
| Conteudo/campanha | Apos publicacao + ciclo de feedback |
| Decisao estrategica | 1 ciclo de consequencias |

Escrever como relato concreto, nao especulacao:

```text
E [horizonte] depois. [Objeto] fracassou completamente.

1. Causa raiz: [a decisao ou premissa especifica que selou o destino]
2. Sinais ignorados nas primeiras semanas:
   - [sinal 1 que estava visivel e foi desprezado]
   - [sinal 2]
   - [sinal 3]
3. Momento do ponto sem volta: [quando deu pra salvar e nao salvamos]
4. O que fariamos diferente se comecassemos hoje: [mudanca concreta]
```

Regras:
- **Sem generalidades** ("faltou foco", "comunicacao falhou") -- nomear a decisao especifica
- **Sem hedging** -- o fracasso e dado, so explicar por que
- Cruzar com secao 1 (pontos cegos): premissas implicitas costumam virar causa raiz aqui

### 4. Alternativas

| Alternativa | Pros | Contras | Custo-beneficio |
|-------------|------|---------|----------------|
| (proposta atual) | | | |
| (alternativa 1) | | | |
| (alternativa 2) | | | |

### 5. Deterministico vs probabilistico

O que pode ser resolvido com codigo (regex, if/else, script, lookup table) em vez de LLM? Se a logica e previsivel, nao precisa de IA.

### 6. Dinamico vs hardcoded

O que esta hardcoded e deveria ser variavel, referencia ou token? Apontar cada valor literal que poderia ser `{{TOKEN}}`, env var, ou referencia a arquivo existente.

### 7. Over-engineering

O que e complexidade desnecessaria? Qual a solucao mais simples com melhor custo-beneficio? Se funciona com menos, faca com menos.

---

## FASE 2: Disciplinar (antes de executar)

### Diretriz 1: Escopo minimo

- **So toque no que foi pedido.** "Melhore X" = mude APENAS X.
- **Melhorar != adicionar.** Antes de adicionar, considerar:
  - Posso DELETAR algo para simplificar?
  - Posso MESCLAR trechos redundantes?
  - Posso OTIMIZAR o existente sem adicionar linhas?
- **Declare o escopo antes de agir**: o que VAI mudar e o que NAO vai.

```text
"Melhore X" ->
|-- Tem duplicacao? -> MESCLAR
|-- Tem codigo morto? -> DELETAR
|-- Pode simplificar sem perder funcao? -> OTIMIZAR
|-- Realmente falta algo? -> ADICIONAR (com justificativa)
\-- Nenhuma? -> NAO MEXA
```

### Diretriz 2: Ripple effect

Toda mudanca que altera interface, tipo ou contrato DEVE listar impacto:

```text
- Alterado: arquivo:funcao -- [o que mudou]
- Impactado: outro-arquivo:linha -- [por que precisa atualizar]
- Sem impacto: [justificativa]
```

Se nao tem certeza: verificar ANTES de mudar, nao depois.

### Diretriz 3: Anti-duplicidade

- Antes de criar, buscar se ja existe algo similar
- Consolidar > duplicar
- Cada conceito em UM lugar, o resto referencia

### Diretriz 4: Dynamic-first

NUNCA gerar artefatos com valores hardcoded. 4 pilares:

| Pilar | Como aplicar |
|-------|-------------|
| Links/Referencias | `Ver: docs/X.md` em vez de copiar conteudo |
| Tokenizacao | `{{TOKENS}}` resolvidos em runtime |
| Variaveis | env vars, config, props -- nunca literais |
| Composabilidade | Fragmentos menores reutilizaveis |

Excecoes: constantes estruturais imutaveis, nomes de comandos, constantes matematicas.

### Diretriz 5: Pipeline de melhoria

Toda melhoria segue 5 fases. NUNCA pular direto para implementacao.

```text
1. RESEARCH    -> Pesquisar boas praticas
2. FRAMEWORK   -> Identificar framework aplicavel
3. PRINCIPIOS  -> Extrair principios acionaveis
4. CHECKLISTS  -> Definir criterios de entrada/saida
5. IMPLEMENTAR -> Aplicar com tokens dinamicos e referencias
```

### Diretriz 6: Deterministico-first

Se a logica pode ser `if/else`, `regex`, `switch/case` ou `lookup table` -> e deterministico. Usar LLM para isso e desperdicio.

Classificar cada mudanca:

```text
- [mudanca 1]: DETERMINISTICO -- regex/script/gate
- [mudanca 2]: PROBABILISTICO -- requer interpretacao contextual
- [mudanca 3]: HIBRIDO -- gate deterministico + fallback LLM
```

---

## Checklist final (rodar antes de entregar)

- [ ] Respondi todas as secoes da Fase 1 (pontos cegos, riscos, advogado do diabo, citacoes, red team, pre-mortem, alternativas, deterministico, hardcoded, over-engineering)?
- [ ] So mudei o que foi pedido? (escopo minimo)
- [ ] Considerei deletar/mesclar antes de adicionar?
- [ ] Listei impacto em outros arquivos? (ripple effect)
- [ ] Verifiquei se ja existe algo similar? (anti-duplicidade)
- [ ] Nenhum valor hardcoded que poderia ser dinamico?
- [ ] Classifiquei cada mudanca como deterministico/probabilistico?
- [ ] Segui o pipeline research -> framework -> principios -> checklist -> implementar?
