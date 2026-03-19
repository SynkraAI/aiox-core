# Escala com IA — App/Agente como Produto

**Task ID:** `task-escala-ia`
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-21
**Source Mind:** natanael-oliveira
**Source Heuristics:** NO-H001 ("Pesquisar com IA antes de criar"), NO-H003 ("1 problema = 1 produto"), NO-F048 ("Orgânico é consequência, não estratégia")

---

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Criar App/Agente IA como Produto Escalável |
| **status** | `pending` |
| **responsible_executor** | escalador |
| **execution_type** | `Agent` |
| **input** | Nicho, problema específico, público-alvo |
| **output** | Blueprint completo do app IA com funil de monetização |
| **action_items** | 7 steps |
| **acceptance_criteria** | 8 criteria |

**Estimated Time:** 60-90min
**Trigger:** `*escala-ia`

---

## Overview

Task para criar um app ou agente de IA como produto digital escalável.

A era IA abriu uma nova categoria de produto: ferramentas inteligentes que
resolvem 1 problema específico de forma automatizada. Um app IA bem construído
pode gerar renda passiva real — o usuário paga por acesso, usa quando quer,
sem depender da presença do criador.

Cases reais do método: MoneyBook AI (gestão financeira pessoal), MoneyPosts AI
(geração de posts para perfil financeiro), CopyMestre (geração de copy), Black
Funnel (análise de funis).

"IA não é hype. É a confeiteira que nunca dorme, nunca erra a receita e
atende 10.000 clientes ao mesmo tempo."

O modelo de pricing recomendado: R$50-60 standalone (só o app), R$197-247
quando empacotado com aulas de como usar e maximizar.

---

## Input

- **nicho** (text)
  - Description: Nicho ou mercado para o qual o app será criado
  - Required: Yes
  - Example: "Confeitaria, marketing digital, psicologia, finanças pessoais"

- **problema** (text)
  - Description: Problema específico que o app vai resolver (1 problema — NO-H003)
  - Required: Yes
  - Example: "Confeiteiras que perdem horas criando posts para o Instagram"

- **publico** (text)
  - Description: Quem é o usuário do app (persona específica)
  - Required: Yes
  - Example: "Confeiteiras autônomas sem tempo para criar conteúdo"

- **nivel_tecnico** (text)
  - Description: Nível técnico do criador do app
  - Required: No
  - Default: "Não-técnico"
  - Options: "Não-técnico", "Iniciante", "Intermediário", "Avançado"

---

## Output

- **blueprint-app-{nome}.md** (markdown)
  - Description: Blueprint completo do app IA com funil de monetização
  - Destination: output/
  - Format: Markdown com nome, problema, features, prompt system, pricing e funil

  Contém:
  - Validação de demanda (pesquisa com IA — NO-H001)
  - Nome e posicionamento do app
  - 1 problema = 1 feature principal (NO-H003)
  - Features mínimas (MVP)
  - Prompt system do app
  - Pricing e modelo de monetização
  - Funil completo: app → usuário → email → upsell
  - Plataformas recomendadas para construção (sem código)

---

## Elicitation

```yaml
elicitation:
  required: true
  mode: basic
  questions:
    - id: nicho
      question: "Para qual nicho é o app? (ex: confeitaria, coaching, finanças)"
      type: text
      required: true

    - id: problema
      question: "Qual problema ESPECÍFICO o app vai resolver? (1 problema, não vários)"
      type: text
      required: true
      example: "Confeiteiras que demoram horas para escrever legendas do Instagram"

    - id: publico
      question: "Quem vai usar o app? Descreva a persona (quem é, o que faz, maior frustração)"
      type: text
      required: true

    - id: nivel
      question: "Qual seu nível técnico para construir? (Não-técnico / Iniciante / Avançado)"
      type: text
      required: false
      default: "Não-técnico"

    - id: plataforma
      question: "Tem preferência de plataforma? (ChatGPT, Claude, Make, Bubble, outro)"
      type: text
      required: false
      default: "Recomendar baseado no caso"
```

---

## Action Items

### Step 1: Elicitar Nicho, Problema e Público

- [ ] Coletar: nicho do app
- [ ] Coletar: 1 problema específico (não vários)
- [ ] Coletar: persona do usuário
- [ ] Verificar: o problema é de 1 nicho específico ou genérico demais?
- [ ] Refinar se necessário: "Confeiteiras com dificuldade de criar conteúdo" > "Empreendedores que querem crescer"

**Regra NO-H003:** Se o problema descrito resolve mais de 1 persona ou mais de 1 nicho,
pedir refinamento. App multi-nicho = app sem posicionamento = difícil de vender.

### Step 2: Pesquisar com IA — Validação de Demanda (NO-H001)

NUNCA criar app sem validar demanda primeiro. Usar IA para pesquisar:

- [ ] **Busca 1:** Existe concorrência? Quem já resolve esse problema?
  - Pesquisar: "{problema} + ferramenta + IA + {nicho}"
  - Concorrência = sinal de demanda. Sem concorrência = cuidado.

- [ ] **Busca 2:** Existe comunidade falando sobre o problema?
  - Pesquisar: reclamações em grupos, fóruns, redes sociais
  - Ex: "confeiteiras reclamando de criar conteúdo Instagram"

- [ ] **Busca 3:** Alguém já pagou por solução parecida?
  - Pesquisar: produtos similares + preço
  - Ex: "ferramenta de copy para confeitaria preço"

- [ ] **Resultado:** Classificar como:
  - VERDE (validado): tem concorrência + comunidade ativa + produto parecido sendo vendido
  - AMARELO (incerto): tem 1 ou 2 sinais, mas não todos
  - VERMELHO (não validado): nenhum sinal de demanda real

- [ ] SE VERMELHO → BLOQUEAR. Não criar app sem demanda validada.

**"Problema que não tem concorrente não é nicho inexplorado. É nicho que não existe."**

### Step 3: Definir Features Mínimas (MVP)

1 problema = 1 feature principal. O resto são bônus.

- [ ] **Feature principal:** O que o app FAZ de forma automática?
  - Deve resolver o problema sem precisar de interação humana
  - Exemplo (MoneyPosts AI): "Gera 30 posts prontos para Instagram sobre finanças em 1 clique"

- [ ] **Features de suporte** (máximo 3, opcionais):
  - Complementam sem criar complexidade
  - Exemplo: personalização de tom de voz, escolha de tema, download em formatos

- [ ] **VETO:** Features que resolvem outros problemas → fora do MVP
  - "Seria legal se também agendasse os posts" → NÃO. Isso é outro problema.

- [ ] Documentar lista de features: principal + 2-3 suporte + "fora do MVP" (backlog)

**Plataformas por nível técnico:**
| Nível | Plataforma Recomendada |
|-------|----------------------|
| Não-técnico | ChatGPT Custom GPT, Poe.com |
| Iniciante | Make.com + OpenAI API |
| Intermediário | Bubble + OpenAI API |
| Avançado | Next.js + API personalizada |

### Step 4: Definir Pricing e Modelo de Monetização

- [ ] **Standalone (só o app):** R$50-60/mês ou R$197 vitalício
  - Para público que sabe usar IA e quer apenas a ferramenta
  - Menor fricção de compra

- [ ] **App + Aulas:** R$197-247 (acesso + como usar + maximizar resultados)
  - Para público que precisa de contexto para usar
  - Maior valor percebido, menor suporte pós-venda

- [ ] **Licença Vitalícia vs Mensal:**
  - Vitalícia: gera caixa rápido, mas sem previsibilidade
  - Mensal: previsibilidade, mas exige retenção ativa
  - Recomendação: começar com vitalício para validar, depois mensal para escalar

- [ ] **Upsell natural:** o que o usuário do app vai precisar depois?
  - Ex: usuário do MoneyPosts AI → pode precisar de Curso de Tráfego
  - Mapear 1 produto de upsell claro

### Step 5: Criar Prompt System do App

O coração do app IA é o prompt system. Estrutura básica:

```
PAPEL: Você é [nome do agente] — especialista em [área] para [persona].

PROBLEMA QUE RESOLVE: [1 problema específico]

CONTEXTO DO USUÁRIO: [o que o usuário te dá como input]

O QUE VOCÊ ENTREGA: [output específico, formato, quantidade]

RESTRIÇÕES:
- Sempre em tom [profissional/casual/empático]
- Sempre no contexto de [nicho]
- NUNCA [o que o app não deve fazer]
- SEMPRE [o que o app deve fazer em todo output]

FORMATO DO OUTPUT:
[estrutura esperada — tabela, lista, parágrafos, etc.]
```

- [ ] Escrever System Prompt completo
- [ ] Testar com 3 inputs diferentes
- [ ] Ajustar baseado nos outputs (output genérico = prompt genérico)
- [ ] Documentar prompt final no blueprint

### Step 6: Definir Funil App → Usuário → Email → Upsell

O app não é o fim. É o início do relacionamento.

- [ ] **Funil completo:**
  1. Usuário acessa o app (tráfego pago ou orgânico)
  2. Usa o app → obtém resultado → percebe valor
  3. Coleta email dentro do app ("salve seus outputs por email")
  4. Sequência de email: demonstração de outros produtos
  5. Upsell: produto de mid/high ticket relacionado

- [ ] Definir como o email é capturado (obrigatório no cadastro / opcional / após 1 uso)
- [ ] Mapear sequência de 3 emails de onboarding do app:
  - Email 1: Boas-vindas + como maximizar o app
  - Email 2: Case de sucesso de usuário do app
  - Email 3: Apresentação do upsell (produto seguinte)

- [ ] Definir 1 upsell claro (não 3 — 1 produto, 1 CTA)

### Step 7: Montar Blueprint Final

- [ ] Nome do app (deve comunicar o resultado — ex: "MoneyPosts AI", "CopyMestre")
- [ ] Tagline (1 frase: quem usa + o que faz + resultado)
- [ ] Problema validado com evidências da pesquisa (Step 2)
- [ ] Lista de features (principal + suporte + fora do MVP)
- [ ] Prompt System completo
- [ ] Pricing definido (standalone + pacote com aulas)
- [ ] Funil completo (app → email → upsell)
- [ ] Plataforma de construção recomendada
- [ ] Próximos passos concretos para construção

---

## Acceptance Criteria

A task está completa quando TODOS os critérios são atendidos:

- [ ] **AC-1:** Demanda validada com pesquisa de IA (NO-H001) — resultado VERDE ou AMARELO justificado
- [ ] **AC-2:** 1 problema específico definido (NO-H003) — não vários
- [ ] **AC-3:** Features mínimas documentadas (1 principal + máx 3 suporte)
- [ ] **AC-4:** Pricing definido (standalone R$50-60 e/ou pacote R$197-247)
- [ ] **AC-5:** Prompt system completo escrito e testado
- [ ] **AC-6:** Funil completo documentado (app → email → upsell)
- [ ] **AC-7:** 1 upsell claro identificado
- [ ] **AC-8:** Blueprint-app-{nome}.md entregue com nome, tagline e próximos passos

---

## Veto Conditions

| Veto | Heurística | Descrição |
|------|-----------|-----------|
| V1 | NO-H001 | SE app sem pesquisa de demanda → BLOCK. Não criar no escuro. |
| V2 | NO-H003 | SE app multi-funcional (resolve N problemas) → BLOCK. 1 app = 1 problema. |
| V3 | — | SE pricing < R$47 standalone → ALERTA. Margem insuficiente para ads. |
| V4 | NO-F048 | SE funil depende só de orgânico para escalar → VETO. App precisa de tráfego pago. |
| V5 | — | SE prompt system não testado com inputs reais → BLOCK. Testar antes de entregar. |
| V6 | — | SE sem captura de email no funil → ALERTA. App sem lista = produto descartável. |

---

## Quality Gate

```yaml
quality_gate:
  id: "QG-VTD-ESCALA-IA"
  name: "Escala IA Quality Gate"
  placement: "exit"
  type: "hybrid"
  severity: "blocking"

  criteria:
    - check: "Demanda validada (VERDE ou AMARELO justificado)"
      type: "boolean"
      weight: 4
    - check: "Prompt system testado com 3 inputs"
      type: "count"
      value: 3
      operator: ">="
      weight: 3
    - check: "Funil com captura de email"
      type: "boolean"
      weight: 2
    - check: "1 problema específico (não múltiplos)"
      type: "boolean"
      weight: 3

  thresholds:
    pass: 10
    review: 7
    fail: 4

  pass_action:
    - "Entregar blueprint-app-{nome}.md"
    - "Indicar plataforma recomendada e próximos passos"
  fail_action:
    - "Revisar validação de demanda"
    - "Refinar problema para 1 foco específico"
```

---

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | task-mix-produtos (posicionar app no mix) |
| **Trigger** | Blueprint aprovado com demanda validada |
| **Executor** | escalador → usuário (constrói o app na plataforma) |

### Handoff Checklist

- [ ] Blueprint completo entregue
- [ ] Prompt system pronto para copiar/colar
- [ ] Plataforma recomendada com tutorial de configuração
- [ ] Funil de email documentado
- [ ] Próximos passos claros e ordenados

### Handoff Package

- **blueprint-app-{nome}.md**: Blueprint completo
- **prompt-system-{nome}.md**: Prompt pronto para usar
- **funil-{nome}.md**: Sequência de emails e upsell

---

## Output Example

```markdown
## Blueprint App IA — ConfeitPosts AI

**Tagline:** "Para confeiteiras que querem 30 posts prontos para o Instagram em 5 minutos"
**Problema:** Confeiteiras perdem 4-6h/semana criando conteúdo para o Instagram
**Validação:** VERDE — 3 ferramentas concorrentes, 4 grupos ativos, produto parecido vendido a R$197

### Features
**Principal:** Gera 30 posts temáticos de confeitaria (receitas, dicas, bastidores) em 1 clique
**Suporte 1:** Personalização: nome da confeitaria + estilo de comunicação
**Suporte 2:** Calendário de postagem sugerido por semana
**Fora do MVP:** Agendamento automático, edição de imagens, análise de métricas

### Pricing
- Standalone: R$57/mês ou R$197 vitalício
- Pacote com aulas "Como usar IA para Crescer no Instagram": R$247

### Funil
App → usuário usa → coleta email no onboarding → 3 emails de ativação → upsell Curso Instagram R$197

### Próximos Passos
1. Criar Custom GPT no ChatGPT Plus (R$100/mês)
2. Publicar página de vendas (Hotmart ou Eduzz)
3. Rodar R$50 em ads para teste
4. Meta: 10 vendas nos primeiros 7 dias = validação confirmada
```

---

## Error Handling

### Cenário: Pesquisa retorna demanda VERMELHA
- **Trigger:** Nenhuma concorrência + nenhuma comunidade + nenhum produto similar
- **Detection:** Step 2 — classificação VERMELHO
- **Recovery:** BLOQUEAR criação. Refinar nicho ou problema. "Confeiteiras em geral" → "Confeiteiras de bolos personalizados em SP"
- **Prevention:** Quanto mais específico o nicho, mais fácil encontrar demanda real.

### Cenário: Usuário quer app multi-funcional
- **Trigger:** "Quero um app que faz posts E gerencia finanças E faz precificação"
- **Detection:** Step 3 — análise de features
- **Recovery:** BLOQUEAR. Propor 3 apps separados, priorizar o mais rentável.
- **Prevention:** Explicar que app foco vende mais que app completo — e é mais barato de construir.

### Cenário: Prompt system gera outputs genéricos
- **Trigger:** Output do app poderia ser de qualquer nicho, sem especificidade
- **Detection:** Step 5 — teste com 3 inputs
- **Recovery:** Adicionar contexto de nicho no system prompt + exemplos de output esperado.
- **Prevention:** Prompt com exemplos (few-shot) gera outputs muito mais específicos.

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-21_
_Compliant: Yes_
