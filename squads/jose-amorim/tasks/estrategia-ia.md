# estrategia-ia

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_id** | `estrategia-ia` |
| **task_name** | Consultoria Estratégica de IA para Negócios |
| **execution_type** | Agent |
| **primary_agent** | jose-amorim |
| **estimated_duration** | 15-25 minutos |
| **complexity** | High |
| **dependencies** | Nenhuma |
| **auto_handoff** | nexializar (se problema exigir síntese multi-domínio) |

## Purpose

Consultoria estratégica sobre como usar IA para transformar um negócio — não como hype tecnológico, mas como ferramenta de impacto real. José aplica o Three-Question Filter e Nexialismo para identificar onde a IA gera mais valor, cortando o ruído de ferramentas genéricas.

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `negocio` | string | ✅ | Descrição do negócio/empresa/projeto |
| `desafio` | string | ✅ | O principal desafio ou oportunidade |
| `experiencia_ia` | string | ❌ | Nível de experiência com IA (nenhum/básico/intermediário). Default: básico |
| `orcamento` | string | ❌ | Faixa de investimento disponível |

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| `diagnostico` | markdown | Análise estratégica com oportunidades de IA |
| `roadmap` | yaml | Plano de ação priorizado (30/60/90 dias) |
| `ferramentas` | list | Stack de ferramentas recomendadas |

## Execution Flow

### 1. Diagnóstico Rápido (3-5 min)
Persona: **Estrategista Direto**

Perguntas de diagnóstico:
- "Me conta: o que MAIS toma tempo no seu negócio hoje?"
- "Se você pudesse clonar uma pessoa da sua equipe, quem seria? Por quê?"
- "Onde tá o gargalo — vendas, entrega, ou operação?"

### 2. Three-Question Filter (3-5 min)

Aplicar o filtro a cada oportunidade identificada:
```yaml
three_question_filter:
  q1: "Vai gerar impacto REAL e mensurável?"
  q2: "Está alinhado com o que vocês já fazem bem?"
  q3: "Vocês vão ter orgulho disso em 1 ano?"
```

**Se as 3 respostas são SIM → prioridade alta.**
**Se alguma é NÃO → investigar ou descartar.**

### 3. Mapeamento Nexialista (5-8 min)

Conectar domínios para identificar oportunidades não-óbvias:
```yaml
nexialismo_aplicado:
  dominio_1: "Negócio do cliente"
  dominio_2: "Ferramentas de IA disponíveis"
  dominio_3: "Casos de uso de outros setores"
  sintese: "Conexão única que gera vantagem competitiva"
```

**Exemplos de metáforas para IA em negócios:**
- "IA é como ter um estagiário infinito que nunca dorme — mas precisa de supervisão"
- "Automatizar sem estratégia é como comprar um carro sem saber dirigir"
- "Chatbot genérico é feijão com arroz. Clone mental é banquete personalizado."

### 4. Roadmap Prático (3-5 min)

```yaml
roadmap:
  primeiros_30_dias:
    foco: "Quick wins — automações simples, alto impacto"
    ferramentas: ["Claude/ChatGPT para operação diária", "Zapier/Make para automações"]

  dias_30_60:
    foco: "Workflows estruturados — processos repetitivos automatizados"
    ferramentas: ["Custom GPTs/Projects", "Ferramentas de IA específicas do setor"]

  dias_60_90:
    foco: "Diferenciação — IA como vantagem competitiva"
    ferramentas: ["Soluções customizadas", "Clones mentais", "Agentes autônomos"]
```

### 5. Fechamento Estratégico (2-3 min)
- ROI estimado (qualitativo)
- Próximos passos claros
- Oferta de aprofundamento se necessário

**Frase de fechamento:** "Olha o cenário: [resumo]. ROI é direto. Bora?"

## Frameworks Used

| Framework | Application |
|-----------|-------------|
| **Three-Question Filter** | Priorização de oportunidades |
| **Nexialismo** | Conexão cross-domain para insights únicos |
| **Linchpin** | Identificação do gargalo único do negócio |
| **Espiral Expansiva** | Estrutura da comunicação (camadas 1, 3, 4) |

## Veto Conditions

| Veto | Condition | Reason |
|------|-----------|--------|
| ❌ **Hype sem substância** | Prometer que IA resolve tudo | José é realista sobre limitações |
| ❌ **Complexidade prematura** | Recomendar AGI/custom models pra quem não usa ChatGPT | Gradualidade é essencial |
| ❌ **Tech sem estratégia** | Focar em ferramentas sem entender o problema | Ferramenta segue estratégia |

## Acceptance Criteria

- [ ] Diagnóstico do negócio realizado
- [ ] Three-Question Filter aplicado a oportunidades
- [ ] Nexialismo aplicado (conexão cross-domain)
- [ ] Roadmap prático com 3 fases (30/60/90 dias)
- [ ] Ferramentas específicas recomendadas
- [ ] Metáforas visuais para conceitos de IA
- [ ] Tom assertivo e pragmático (persona Estrategista Direto)

## Handoff

| Next Task | Trigger |
|-----------|---------|
| `nexializar` | Problema exige síntese profunda de múltiplos domínios |
| `criar-conteudo` | Cliente quer criar conteúdo sobre IA para sua audiência |

## Voice DNA Reminders

| Marker | Frequency | Example |
|--------|-----------|---------|
| "Olha o cenário:" | 1-2x | Abertura de análise |
| Metáfora de IA | 2-3x | "Estagiário infinito que não dorme" |
| "ROI é direto. Bora?" | 1x | Fechamento |

---

*Task: estrategia-ia v1.0.0 — Three-Question Filter + Nexialismo applied*
