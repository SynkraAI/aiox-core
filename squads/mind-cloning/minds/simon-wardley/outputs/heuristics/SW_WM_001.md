# SW_WM_001 — Wardley Map Construction

**Type:** Decision Heuristic
**Phase:** 1 (Strategic Situational Awareness)
**Agent:** @kaizen:simon-wardley
**Pattern:** SW-CORE-001 (Wardley Mapping Method)

## Purpose

Heurístico para construir um Wardley Map de qualquer sistema ou negócio. O mapa é a ferramenta central de situational awareness — sem ele, você está tomando decisões estratégicas no escuro. Este heurístico garante que o mapa seja construído corretamente: user need visível, cadeia de valor completa, posicionamento correto no eixo de evolução.

## Configuration

```yaml
SW_WM_001:
  name: "Wardley Map Construction"
  phase: 1
  pattern_reference: "SW-CORE-001"

  weights:
    user_need_visibility: 0.95      # user need deve estar explícito e no topo
    value_chain_completeness: 0.9   # todos os componentes necessários listados
    evolution_accuracy: 0.85        # posicionamento correto no eixo de evolução
    dependency_clarity: 0.8         # dependências entre componentes claras
    anchor_strength: 0.75           # user need é a âncora — tudo deriva dela

  thresholds:
    min_components: 3               # mapa trivial tem pelo menos 3 componentes
    max_components_readable: 30     # acima de 30 componentes, considere split
    evolution_confidence: 0.6       # certeza mínima sobre posição de evolução
    dependency_depth: 5             # profundidade máxima da cadeia de valor

  veto_conditions:
    - condition: "no_user_need_identified"
      action: "VETO — Todo mapa começa com user need. Sem user need = sem negócio."
    - condition: "user_need_not_at_top"
      action: "VETO — User need sempre no topo. Se está no meio, não é o user need real."
    - condition: "component_without_dependencies"
      action: "ALERTA — Componente isolado não faz sentido. Ou conecte ou remova."
    - condition: "everything_in_genesis"
      action: "VETO — Se tudo é Genesis, ou você está em startup pré-product ou o mapa está errado."
    - condition: "everything_in_commodity"
      action: "VETO — Se tudo é Commodity, onde está o diferencial competitivo?"

  decision_tree:
    - IF no_user_need THEN identify_user_need_first
    - IF user_need_identified THEN list_all_components_needed
    - IF components_listed THEN map_dependencies_between_them
    - IF dependencies_mapped THEN position_on_evolution_axis
    - IF evolution_positioned THEN validate_placement_with_market
    - IF validation_passed THEN map_is_ready
    - TERMINATION: map_provides_situational_awareness

  output:
    type: "visual map + component list + evolution assessment"
    values: ["VALID MAP", "INCOMPLETE — NEEDS WORK", "INVALID — REBUILD"]
```

## Mapping Process (5 Steps)

```text
PASSO 1: Identifique o User Need
  - Pergunta: "O que o usuário está tentando alcançar?"
  - Regra: User need é SEMPRE visível ao usuário e no topo do mapa
  - Exemplo: "Quero comprar produtos online" (e-commerce)
  - Contra-exemplo: "Precisamos de infraestrutura" (isso NÃO é user need)

PASSO 2: Liste Todos os Componentes Necessários
  - Pergunta: "O que eu preciso para satisfazer esse user need?"
  - Método: Cadeia de dependências — cada componente depende de outros abaixo
  - Exemplo (e-commerce):
    - User Need: Comprar online
    - → Website (interface)
    - → → Catálogo de produtos (dados)
    - → → Payment gateway (serviço)
    - → → → Cloud platform (infra)
    - → → → → Compute (commodity)
  - Regra: Pare quando chegar em commodities óbvias (power, internet, etc.)

PASSO 3: Desenhe as Dependências
  - Método: Conecte componentes em cadeia vertical
  - Regra: Componente acima DEPENDE de componente abaixo
  - Validação: Se A depende de B, A está acima de B no mapa
  - Contra-exemplo: Se Website depende de Compute MAS Compute também depende de Website = ciclo (erro)

PASSO 4: Posicione no Eixo de Evolução
  - Pergunta para cada componente: "Em que estágio está?"
    - Genesis: Novo, experimental, ninguém sabe como fazer direito
    - Custom: Feito sob medida, especializado, cada um diferente
    - Product: Produto no mercado, várias opções, comparáveis
    - Commodity: Utility, padronizado, competição por preço
  - Método: Pergunte ao mercado (não à sua empresa)
    - "Quantos fornecedores existem?"
    - "Quanto custa?"
    - "Quão padronizado é?"
    - "Usuários se importam com a marca?"
  - Validação: Commodity sempre à direita, Genesis sempre à esquerda

PASSO 5: Valide o Mapa
  - Check 1: User need no topo? ✓
  - Check 2: Dependências fazem sentido (cadeia lógica)? ✓
  - Check 3: Evolução reflete o mercado real (não o wishful thinking)? ✓
  - Check 4: Alguém que NÃO construiu o mapa consegue entender? ✓
```

## Application

**Input:** Descrição de um negócio, sistema ou capability.

**Process:**
1. Identifique o user need explícito
2. Liste todos os componentes necessários
3. Mapeie dependências (cadeia vertical)
4. Posicione cada componente no eixo de evolução
5. Valide com checklist acima

## Examples

### Map: E-commerce Platform

```
USER NEED (topo): Comprar produtos online

CADEIA DE VALOR (Y-axis):
  - Website (visível ao usuário)
  - → Catálogo de produtos
  - → Payment processing
  - → Inventory management
  - → → Cloud platform
  - → → → Compute (base)

EVOLUÇÃO (X-axis):
  - Compute: Commodity (AWS, GCP — pague pelo uso)
  - Cloud platform: Product/Commodity (muitas opções)
  - Payment processing: Product (Stripe, PayPal, várias opções)
  - Inventory management: Custom/Product (alguns produtos, muito custom)
  - Catálogo de produtos: Custom (específico do negócio)
  - Website: Custom (design único, UX diferenciada)

VALIDAÇÃO: ✓ User need no topo, cadeia lógica, evolução reflete mercado
```

### Map: Startup de IA (2024)

```
USER NEED: "Gerar insights de dados não estruturados"

COMPONENTES:
  - Interface (dashboard custom)
  - → LLM (GPT-4, Claude — Product)
  - → → Fine-tuning pipeline (Custom — nosso diferencial)
  - → → → Training data (Custom — proprietário)
  - → → Cloud GPU (Commodity — AWS/GCP)

EVOLUÇÃO:
  - Cloud GPU: Commodity
  - LLM base: Product (várias opções no mercado)
  - Fine-tuning pipeline: Custom (nosso código)
  - Training data: Genesis/Custom (único, proprietário)

INSIGHT ESTRATÉGICO:
  - Diferenciação está em "Training data" + "Fine-tuning pipeline"
  - LLM base vai virar Commodity rápido (não construa seu próprio)
  - GPU já é Commodity — NUNCA construa datacenter próprio
```

### Map INVÁLIDO (Anti-Pattern)

```
TENTATIVA:
  USER NEED: "Precisamos de infraestrutura cloud"

PROBLEMA: Isso NÃO é user need — é um meio.

CORREÇÃO: Pergunte "Por quê?"
  - "Para rodar aplicações"
  - "Por que rodar aplicações?"
  - "Para atender usuários que querem X"
  - ✓ REAL USER NEED: "Usuários querem X"

REGRA: Se você consegue perguntar "Por quê?" e a resposta ainda faz sentido,
não é o user need real. Vá mais fundo.
```

## Diagnostic Questions

1. "Qual é o user need visível e explícito?" (Se não consegue responder, não comece.)
2. "Quais componentes são essenciais para satisfazer esse need?" (Liste TUDO.)
3. "Qual a cadeia de dependências entre esses componentes?" (Desenhe verticalmente.)
4. "Onde cada componente está no eixo de evolução?" (Pergunte ao MERCADO, não à sua empresa.)
5. "Se eu remover um componente, o sistema ainda funciona?" (Se sim, não era essencial.)

---

**Pattern Compliance:** SW-CORE-001 (Wardley Mapping Method) ✓
**Source:** SW Mind DNA - Wardley Mapping Framework
