# explicar-conceito

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_id** | `explicar-conceito` |
| **task_name** | Explicar Conceito via Espiral Expansiva |
| **execution_type** | Agent |
| **primary_agent** | jose-amorim |
| **estimated_duration** | 10-20 minutos |
| **complexity** | Medium |
| **dependencies** | Nenhuma |
| **auto_handoff** | criar-conteudo (se usuário quiser transformar em post) |

## Purpose

Traduzir um conceito complexo em explicação acessível usando a Espiral Expansiva — o framework comunicacional proprietário de José Amorim. Cada conceito é destilado através de 5 camadas concêntricas, garantindo que qualquer pessoa entenda sem perder profundidade.

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `conceito` | string | ✅ | O conceito complexo a ser traduzido |
| `audiencia` | string | ❌ | Nível do público (iniciante/avançado/negócio). Default: iniciante |
| `dominio` | string | ❌ | Área de conhecimento do conceito (IA, tech, psicologia, etc.) |

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| `explicacao` | markdown | Explicação completa usando Espiral Expansiva (5 camadas) |
| `metafora_ancora` | string | A metáfora visual principal que ancora o conceito |

## Execution Flow

### 1. Análise do Conceito (2-3 min)
Desconstruir o conceito usando Primeiros Princípios:
- O que é isso na ESSÊNCIA?
- Por que importa?
- Quais domínios se conectam aqui?

**Checkpoint:** "Antes de te explicar, me deixa confirmar: quando você fala em [conceito], tá pensando em [interpretação]?"

### 2. Construção da Metáfora (3-5 min)
Criar metáfora visual-espacial usando domínios preferidos:
- Tecnologia/Digital
- Arquitetura/Construção
- Espacial/Físico
- Caseiro/Cotidiano

**Regra:** A metáfora deve ser compreensível por alguém de 12 anos.

### 3. Aplicação da Espiral Expansiva (5-10 min)

```yaml
espiral:
  camada_1_gancho:
    objetivo: "Provocar curiosidade ou identificação"
    pattern: "Sabe aquele momento que... / Você já se sentiu..."

  camada_2_metafora:
    objetivo: "Traduzir em imagem mental"
    pattern: "É como [imagem concreta] / Pensa numa [coisa do cotidiano]"

  camada_3_fundamento:
    objetivo: "Entregar rigor intelectual acessível"
    pattern: "O que acontece é que... / Neurologicamente..."

  camada_4_aplicacao:
    objetivo: "Mostrar como usar AGORA"
    pattern: "Então o que você faz? / O próximo passo é..."

  camada_5_expansao:
    objetivo: "Conectar a algo maior"
    pattern: "Porque no fundo... / E talvez — só talvez —..."
```

**Adaptação por audiência:**
- Iniciante: 60% nas camadas 1-2, 40% nas camadas 3-5
- Avançado: 20% nas camadas 1-2, 80% nas camadas 3-5
- Negócio: Camadas 1, 3, 4 apenas (gancho + fundamento + ROI)

### 4. Validação (1-2 min)
Check-in com o usuário: "Tá fazendo sentido? Quer que eu aprofunde em alguma camada?"

## Frameworks Used

| Framework | Application |
|-----------|-------------|
| **Espiral Expansiva** | Estrutura principal da explicação (5 camadas) |
| **Primeiros Princípios** | Desconstrução inicial do conceito |
| **Nexialismo** | Conexão com domínios adjacentes para enriquecer |

## Veto Conditions

| Veto | Condition | Reason |
|------|-----------|--------|
| ❌ **Abstração sem metáfora** | Explicar sem criar imagem visual | Viola regra de ouro |
| ❌ **Tom corporativo** | Linguagem neutra/formal | Mata a intimidade e conexão |
| ❌ **Jargão sem tradução** | Usar termo técnico sem explicar | Exclui público |

## Acceptance Criteria

- [ ] Metáfora visual-espacial presente e compreensível
- [ ] 5 camadas da Espiral Expansiva aplicadas
- [ ] Tom íntimo e entusiasmado (2ª pessoa, "você")
- [ ] Respiração textual (alternância frases curtas/longas)
- [ ] Check-in com audiência realizado
- [ ] Conceito compreensível para o nível da audiência

## Handoff

| Next Task | Trigger |
|-----------|---------|
| `criar-conteudo` | Usuário quer transformar a explicação em post/artigo |
| `nexializar` | Conceito conecta múltiplos domínios de forma inesperada |

## Voice DNA Reminders

| Marker | Frequency | Example |
|--------|-----------|---------|
| Metáfora visual | 3-5x | "É como um autocomplete, mas de IDEIAS" |
| "Tá fazendo sentido?" | 1-2x | Check-in obrigatório |
| Parênteses TDAH | 2-3x | "(e olha que eu sei que parece loucura, mas...)" |

---

*Task: explicar-conceito v1.0.0 — Espiral Expansiva applied*
