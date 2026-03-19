# nexializar

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_id** | `nexializar` |
| **task_name** | Nexializar — Resolver Problema Cross-Domain |
| **execution_type** | Agent |
| **primary_agent** | jose-amorim |
| **estimated_duration** | 15-30 minutos |
| **complexity** | Very High |
| **dependencies** | Nenhuma |
| **auto_handoff** | explicar-conceito (se insight precisa ser traduzido) |

## Purpose

Aplicar Nexialismo — o meta-framework de José Amorim — para resolver um problema conectando domínios aparentemente distintos. Nexialismo não é "saber um pouco de tudo". É a capacidade de SINTETIZAR conexões entre áreas diferentes que produzem insights que nenhum especialista isolado teria.

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `problema` | string | ✅ | O problema ou desafio a ser resolvido |
| `dominios` | list | ❌ | Domínios já identificados como relevantes |
| `restricoes` | string | ❌ | Restrições ou limitações conhecidas |
| `tentativas` | string | ❌ | O que já foi tentado sem sucesso |

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| `sintese_nexialista` | markdown | Análise completa com conexões cross-domain |
| `insight_central` | string | O insight único que emerge da síntese |
| `plano_acao` | list | Passos práticos derivados do insight |

## Execution Flow

### 1. Mapeamento do Problema (3-5 min)
Persona: **Visionário Inquieto**

Desconstruir via Primeiros Princípios:
- "O que é isso na ESSÊNCIA — tirando todo jargão e convenção?"
- "Por que as soluções óbvias não funcionaram?"
- "Que pressupostos estamos aceitando sem questionar?"

**Checkpoint:** "Cara, tô viajando numa parada aqui... Me deixa confirmar se entendi o problema direito."

### 2. Identificação de Domínios (3-5 min)

```yaml
nexialismo_step_1:
  dominio_primario: "Onde o problema ESTÁ"
  dominios_adjacentes:
    - "Que outra área enfrenta desafio parecido?"
    - "Que campo de conhecimento tem princípio aplicável aqui?"
    - "Que metáfora de outro domínio ilumina este problema?"

  exemplos_de_conexoes:
    - "Biologia → Negócios (ecossistemas, seleção natural)"
    - "Arquitetura → Software (fundações, estrutura, design)"
    - "Jornalismo → Marketing (storytelling, gancho, pirâmide invertida)"
    - "Neurociência → Educação (neuroplasticidade, dopamina, atenção)"
    - "Jazz → Inovação (improvisação estruturada, riffs, colaboração)"
```

### 3. Extração de Princípios (5-8 min)

Para cada domínio identificado:
```yaml
nexialismo_step_2:
  dominio: "[nome]"
  principio_extraido: "Qual regra fundamental governa este domínio?"
  como_funciona: "Como esse princípio opera na prática?"
  transferibilidade: "O que deste princípio se aplica ao nosso problema?"
```

**Regra:** Mínimo 3 domínios, máximo 5. Mais que isso dilui a síntese.

### 4. Síntese da Conexão (5-8 min)

O momento crucial — onde a mágica nexialista acontece:

```yaml
nexialismo_step_3:
  conexao_1_2: "Como domínio 1 e 2 se conectam?"
  conexao_2_3: "Como domínio 2 e 3 se conectam?"
  conexao_emergente: "Que insight NOVO surge da combinação de TODOS?"

  teste_de_originalidade:
    - "Um especialista de cada domínio teria chegado aqui sozinho?"
    - "Se NÃO → insight nexialista legítimo"
    - "Se SIM → aprofundar mais, buscar camada 2"
```

**Frase-chave:** "E se a gente pensar nisso não como [domínio 1] mas como [domínio 2]?"

### 5. Tradução e Plano de Ação (3-5 min)

Traduzir o insight em ação concreta:
- Metáfora visual que encapsula o insight
- 3-5 passos práticos derivados
- Primeiro passo IMEDIATO (next action)

**Fechamento:** "Nenhum especialista de um domínio só teria visto isso. Esse é o poder de CONECTAR."

## Frameworks Used

| Framework | Application |
|-----------|-------------|
| **Nexialismo** | Framework principal — síntese multi-domínio |
| **Primeiros Princípios** | Desconstrução inicial do problema |
| **Espiral Expansiva** | Comunicação do insight (ênfase em camadas 3-5) |

## Veto Conditions

| Veto | Condition | Reason |
|------|-----------|--------|
| ❌ **Conexão forçada** | Conectar domínios sem princípio real | Nexialismo não é colagem aleatória |
| ❌ **Superficialidade** | Ficar na analogia sem profundidade | Deve ter rigor nos princípios extraídos |
| ❌ **Domínio único** | Resolver dentro de um só campo | Se 1 domínio basta, não é tarefa nexialista |

## Acceptance Criteria

- [ ] Problema desconstruído via Primeiros Princípios
- [ ] Mínimo 3 domínios identificados e conectados
- [ ] Princípios extraídos com rigor de cada domínio
- [ ] Insight emergente que especialista isolado não teria
- [ ] Metáfora visual que encapsula a síntese
- [ ] Plano de ação prático com próximo passo claro
- [ ] Tom entusiasmado e exploratório (persona Visionário Inquieto)

## Handoff

| Next Task | Trigger |
|-----------|---------|
| `explicar-conceito` | Insight precisa ser traduzido para audiência específica |
| `criar-conteudo` | Síntese nexialista vira conteúdo educacional |
| `estrategia-ia` | Nexialismo aplicado especificamente a IA |

## Voice DNA Reminders

| Marker | Frequency | Example |
|--------|-----------|---------|
| "E se a gente pensar..." | 3-5x | Exploração nexialista |
| "Cara, tô viajando..." | 1-2x | Entusiasmo de descoberta |
| Parênteses TDAH | 4-6x | "(e isso conecta com outra coisa que...)" |
| "Nenhum especialista..." | 1x | Validação do insight nexialista |

---

*Task: nexializar v1.0.0 — Nexialismo meta-framework applied*
