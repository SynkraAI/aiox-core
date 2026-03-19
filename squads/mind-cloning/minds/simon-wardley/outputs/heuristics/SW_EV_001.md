# SW_EV_001 — Evolution & Movement Detection

**Type:** Decision Heuristic
**Phase:** 2 (Strategic Movement Analysis)
**Agent:** @kaizen:simon-wardley
**Pattern:** SW-CORE-002 (Evolution & Climatic Patterns)

## Purpose

Heurístico para detectar movimento no landscape — componentes evoluindo, mudanças de fase (war), novos componentes surgindo (wonder). Movimento é onde estratégia acontece. Se você não vê movimento, não pode jogar. Este heurístico identifica: qual estágio atual, para onde está evoluindo, quando vai acontecer, e que gameplay aproveitar.

## Configuration

```yaml
SW_EV_001:
  name: "Evolution & Movement Detection"
  phase: 2
  pattern_reference: "SW-CORE-002"

  weights:
    market_maturity_signals: 0.95    # sinais de mercado sobre evolução
    inertia_identification: 0.9      # detectar resistência à mudança
    timing_of_transition: 0.85       # quando a mudança acontecerá
    competitive_response: 0.8        # como competidores reagirão
    gameplay_opportunity: 0.9        # que jogadas estratégicas são possíveis

  thresholds:
    suppliers_count_product: 3       # 3+ fornecedores = Product stage
    suppliers_count_commodity: 10    # 10+ fornecedores = Commodity
    price_variation_product: 0.3     # <30% variação de preço = converging
    price_variation_commodity: 0.1   # <10% variação = Commodity
    time_to_transition: 24           # meses até próxima fase (estimativa)

  movement_indicators:
    peace_to_war:
      - "Novo entrante com modelo radicalmente diferente"
      - "Preços caindo agressivamente"
      - "Incumbents defendendo status quo publicamente"
      - "Usuários começando a mudar de fornecedor"
    war_active:
      - "Múltiplos modelos competindo (antigo vs novo)"
      - "Incumbents com inertia visível"
      - "Novos entrantes ganhando quota rápido"
      - "Disputa sobre padrões e interoperabilidade"
    war_to_peace:
      - "Modelo dominante emergindo"
      - "Consolidação de fornecedores"
      - "Padronização acontecendo"
      - "Preços estabilizando"
    wonder_emerging:
      - "Tecnologia/abordagem totalmente nova"
      - "Poucos sabem usar (early adopters)"
      - "Alto hype mas baixo entendimento"
      - "Casos de uso ainda sendo descobertos"

  veto_conditions:
    - condition: "assuming_no_evolution"
      action: "VETO — Tudo evolui. Se você assume estabilidade permanente, será surpreendido."
    - condition: "ignoring_inertia"
      action: "VETO — Inertia é real. Incumbents NÃO se movem rápido mesmo vendo ameaça."
    - condition: "believing_hype_equals_maturity"
      action: "VETO — Genesis tem hype máximo, maturidade mínima. Não confunda."
    - condition: "one_size_fits_all_approach"
      action: "VETO — Genesis precisa de práticas diferentes de Commodity. Sem exceções."

  decision_tree:
    - IF component_in_genesis THEN expect_rapid_change_and_failure
    - IF component_in_custom THEN industrialization_opportunity_exists
    - IF component_in_product THEN commoditization_pressure_building
    - IF component_in_commodity THEN never_build_always_consume
    - IF signs_of_war THEN identify_inertia_and_exploit
    - IF signs_of_wonder THEN explore_but_dont_bet_the_company
    - IF movement_detected THEN define_gameplay_response
    - TERMINATION: strategic_response_to_evolution_defined

  output:
    type: "evolution assessment + movement prediction + gameplay recommendation"
    values: ["PEACE", "WAR IMMINENT", "WAR ACTIVE", "WONDER", "TRANSITION COMPLETE"]
```

## The Evolution Axis (4 Stages)

```text
GENESIS (I)
  Characteristics:
    - Novo, único, experimental
    - Alta incerteza, muita falha
    - Poucos sabem construir
    - Muda constantemente, sem padrões
  Market Signals:
    - 0-2 fornecedores
    - Preço altíssimo ou indefinido
    - Customização total
    - Usuarios early adopters (inovadores)
  Strategy:
    - Explore, experimente
    - Aceite falhas
    - Não tente padronizar ainda
    - Cultura de inovação
  Example: Computação quântica (2024), LLM fine-tuning customizado

CUSTOM BUILT (II)
  Characteristics:
    - Feito sob medida para necessidades específicas
    - Conhecimento profundo necessário
    - Cada implementação é diferente
    - Ainda evolui mas mais lento que Genesis
  Market Signals:
    - 2-5 fornecedores especializados
    - Preço alto, variação grande
    - Proposal-based, não catalog
    - Usuários precisam de consultoria
  Strategy:
    - Build SE é diferenciador competitivo
    - Considere industrialização (ILC play)
    - Cultura de craftsmanship
  Example: Algoritmos de recomendação, pipelines ML customizados

PRODUCT (III)
  Characteristics:
    - Produto no mercado, várias opções
    - Features comparáveis entre fornecedores
    - Documentação, suporte, ecosistema
    - Diferenciação mas convergindo
  Market Signals:
    - 5-20 fornecedores
    - Preço médio conhecido
    - Catalog/website buying
    - Comparação de features
  Strategy:
    - Buy vs Build (build só se core)
    - Commoditization play possível (open source)
    - Cultura de produto
  Example: CRM (Salesforce, HubSpot), Cloud Platform (AWS, GCP, Azure)

COMMODITY (IV)
  Characteristics:
    - Utility, pague pelo uso
    - Zero diferenciação
    - Totalmente padronizado
    - Competição por preço e escala
  Market Signals:
    - 20+ fornecedores ou utility market
    - Preço padronizado, competição acirrada
    - Ninguém se importa com marca
    - "Just works" é o único requirement
  Strategy:
    - SEMPRE consume, NUNCA construa
    - Use para liberar capital para layers acima
    - Cultura de eficiência operacional
  Example: Eletricidade, cloud compute, storage, CDN
```

## Movement Patterns (Climatic)

```text
PEACE
  What it is: Estabilidade relativa — componente no mesmo estágio há tempo
  Duration: Meses a anos (não permanente)
  What to do:
    - Otimize operações
    - Prepare-se para a próxima transição
    - NÃO assuma que vai durar para sempre
  Warning: Paz é temporária — evolução é inevitável

WAR
  What it is: Mudança de fase — componente transicionando de estágio
  Triggers:
    - Novo modelo de negócio (SaaS vs license)
    - Nova tecnologia (cloud vs datacenter)
    - Novo entrante sem inertia
  Characteristics:
    - Disputa entre modelo antigo e novo
    - Incumbents resistem (inertia)
    - Novos entrantes atacam agressivamente
    - Usuários hesitam (switching cost)
  Duration: 2-5 anos tipicamente
  What to do:
    - SE incumbente: reconheça inertia e ataque a si mesmo
    - SE challenger: explore inertia do incumbente
    - SE usuário: avalie timing de mudança (early vs late adopter)
  Example: Cloud vs Datacenter (2010-2015), Streaming vs Cable (2015-2020)

WONDER
  What it is: Componente totalmente novo (Genesis) aparece
  Characteristics:
    - Ninguém sabe o impacto ainda
    - Muita experimentação, alta falha
    - Pode criar value chain inteiro novo
    - Hype máximo, entendimento mínimo
  Duration: 1-3 anos de incerteza total
  What to do:
    - Explore mas não aposte a empresa
    - Crie opções (pequenos experimentos)
    - Observe quem está ganhando tração
    - Esteja pronto para mover rápido SE decolar
  Example: iPhone (2007), Cloud (2006), LLMs (2022-2023)
```

## Application

**Input:** Um Wardley Map com componentes posicionados.

**Process:**
1. Para cada componente, identifique estágio atual de evolução
2. Identifique sinais de movimento (market signals)
3. Detecte padrão de movimento (peace/war/wonder)
4. Estime timing da próxima transição
5. Identifique inertia (sua e dos competidores)
6. Defina gameplay estratégico

## Examples

### Detection: Cloud Computing (2010)

```
COMPONENTE: Compute Infrastructure
ESTÁGIO ATUAL (2010): Product → Commodity (WAR)

SINAIS DE WAR:
  - Novo modelo: Cloud utility vs Datacenter CAPEX
  - Incumbents: Datacenter providers defendendo status quo
  - Challengers: AWS baixando preço agressivamente
  - Inertia visível: Enterprises "cloud não é seguro"

TIMING: 3-5 anos para Commodity dominante

GAMEPLAY (se você é enterprise):
  - Inertia interna: "Não vamos sair do datacenter"
  - Risco: Competidores sem datacenter vão ser mais ágeis
  - Ação: Comece migration AGORA mesmo com inertia interna

RESULTADO (2024): Cloud é Commodity. Quem resistiu perdeu década.
```

### Detection: LLMs (2023-2024)

```
COMPONENTE: Large Language Models
ESTÁGIO ATUAL (2024): Genesis → Custom (WONDER transitioning)

SINAIS DE WONDER:
  - Tecnologia nova (GPT-3 → GPT-4, Claude, etc.)
  - Hype máximo, casos de uso sendo descobertos
  - Poucos sabem usar bem (prompt engineering nascendo)
  - Muita falha, muita experimentação

SINAIS DE EVOLUÇÃO:
  - APIs padronizando (OpenAI, Anthropic, etc.)
  - Preço caindo rapidamente
  - De Custom → Product (próximos 2-3 anos)

TIMING: 2-3 anos para Product stage (múltiplos fornecedores commoditizados)

GAMEPLAY:
  - NÃO construa seu próprio LLM (a menos que seja Google/Meta)
  - Explore casos de uso (Wonder → Custom)
  - Fine-tuning e RAG = diferenciação temporária
  - Em 3 anos, LLM base será Commodity — prepare-se
```

## Diagnostic Questions

1. "Quantos fornecedores existem para esse componente?" (0-2 = Genesis, 3-10 = Product, 10+ = Commodity)
2. "O preço está caindo ou subindo?" (Caindo = evoluindo, subindo = scarcity temporária)
3. "Usuários se importam com a marca ou só querem que funcione?" (Marca importa = Product, não importa = Commodity)
4. "Há resistência à mudança (inertia)?" (Inertia alta = oportunidade para challengers)
5. "Qual o modelo de negócio dominante?" (CAPEX = Custom/Product, OPEX/utility = Commodity)

---

**Pattern Compliance:** SW-CORE-002 (Evolution & Climatic Patterns) ✓
**Source:** SW Mind DNA - Evolution Framework
