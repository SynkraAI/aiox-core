# hook-generation

> Gerar variações de hooks via Hook Point de Brendan Kane — aberturas que capturam atenção nos primeiros 3 segundos com variações A/B para teste

---

## Task Definition

```yaml
task_name: "hook-generation"
status: active
responsible_executor: brendan-kane
execution_type: agent
squad: presenca-digital
version: 1.0.0
```

---

## Input

- Tema ou ideia central do conteúdo
- Plataforma-alvo (LinkedIn, Instagram, X, YouTube, Stories)
- Pilar de conteúdo (da `content-pillars.json`)
- Tipo de conteúdo: post, carrossel, reel, vídeo longo, newsletter
- Quantidade de variações desejada (padrão: 5 hooks)

## Output

- Lista de hooks ranqueados por potencial de engajamento estimado
- Para cada hook: variação A/B e anotação do padrão aplicado
- Recomendação de qual hook testar primeiro

## Action Items

1. Identificar a ideia central e o público-alvo do conteúdo
2. Gerar hooks usando os padrões do Hook Point (3-second rule):
   - **Contraste**: "Todo mundo faz X. Os melhores fazem Y."
   - **Curiosidade**: "Existe algo sobre X que ninguém está falando."
   - **Afirmação polêmica**: "X é o maior desperdício de tempo para criadores."
   - **Número específico**: "7 criadores que faturaram R$100k sem 100k seguidores."
   - **Promessa direta**: "Em 3 passos, você vai entender por que X não está funcionando."
   - **Identificação**: "Se você [situação específica], isso é pra você."
   - **Inversão**: "Pare de fazer X. Comece a fazer Y."
3. Gerar mínimo 5 hooks usando padrões diferentes
4. Para cada hook, criar variação B (mesmo padrão, ângulo ligeiramente diferente)
5. Ranquear hooks por potencial: especificidade, curiosidade gerada, adequação à plataforma
6. Indicar qual hook recomenda para teste inicial e por quê

## Acceptance Criteria

- [ ] Mínimo 5 hooks gerados com padrões distintos
- [ ] Cada hook tem variação B
- [ ] Padrão Hook Point aplicado identificado para cada hook
- [ ] Hooks ranqueados com justificativa
- [ ] Recomendação de primeiro teste clara com justificativa
- [ ] Hooks adequados ao formato e plataforma-alvo
- [ ] Nenhum hook genérico ("Hoje quero falar sobre..." ou "Você sabia que...?")

## Veto Conditions

- Hooks genéricos ou que poderiam servir para qualquer tema
- Menos de 5 variações
- Falta de variação B
- Hooks que não passam no teste dos 3 segundos (muito longos ou lentos)
- Afirmações polêmicas sem substância ou que possam denegrir a marca

## Output Example

```
TEMA: Sistema de criação de conteúdo em batch
PLATAFORMA: LinkedIn | FORMATO: Post

HOOK #1 — Contraste [recomendado para teste inicial]
A: "A maioria dos criadores produz todo dia. Os melhores produzem uma vez por semana."
B: "Criadores mediocres criam conteúdo diariamente. Criadores de sucesso criam em batch."
Justificativa: Contraste direto ativa dissonância cognitiva. Alto potencial de parar scroll.

HOOK #2 — Número específico
A: "1 sessão de 2 horas = 21 peças de conteúdo. Esse é o meu sistema."
B: "Em 2 horas toda segunda, crio conteúdo para a semana inteira. Os números:"
Justificativa: Especificidade de número cria credibilidade imediata.

HOOK #3 — Afirmação polêmica
A: "Criar conteúdo todos os dias é um erro de gestão de tempo."
B: "Consistência diária não é o que você pensa que é."

HOOK #4 — Promessa direta
A: "Vou te mostrar como parar de criar conteúdo todo dia sem perder alcance."
B: "3 mudanças que eliminaram 8 horas semanais da minha produção de conteúdo."

HOOK #5 — Identificação
A: "Se você trava toda vez que abre o editor para criar conteúdo, esse post é pra você."
B: "Para quem já ficou sem saber o que postar: isso resolve."

RANKING: #1 > #2 > #4 > #3 > #5
```
