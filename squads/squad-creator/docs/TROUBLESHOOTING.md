# Troubleshooting

> **Algo deu errado?** Este documento ajuda a resolver.
>
> **Dúvidas gerais?** Veja [FAQ.md](./FAQ.md). **Primeira vez?** [POR-ONDE-COMECAR.md](./POR-ONDE-COMECAR.md).

---

## Índice

1. [Expert Muito Obscuro](#1-expert-muito-obscuro)
2. [Fontes Insuficientes](#2-fontes-insuficientes)
3. [Smoke Test Falhando](#3-smoke-test-falhando)
4. [Agent Responde de Forma Genérica](#4-agent-responde-de-forma-genérica)
5. [Quality Gate Blocking](#5-quality-gate-blocking)
6. [DNA Inconsistente](#6-dna-inconsistente)
7. [Squad Sem Tier 0](#7-squad-sem-tier-0)
8. [Workflow Travado](#8-workflow-travado)

---

## 1. Expert Muito Obscuro

### Sintoma
```
❌ FONTES INSUFICIENTES
Encontrei apenas 3 fontes para {expert}.
Mínimo necessário: 10 fontes (5 Tier 1).
```

### Causa
O expert não tem material público suficiente documentado.

### Soluções

**Opção A: Fornecer materiais próprios**
```bash
*clone-mind "{expert}" --sources ./meus-materiais/
```

Se você tem:
- PDFs de livros
- Transcrições de cursos
- Anotações de palestras

Esses viram **Tier 0** (máxima confiança).

**Opção B: Escolher expert mais documentado**

Experts bem documentados têm:
- 3+ livros publicados
- 10+ entrevistas/podcasts
- Frameworks com nome próprio
- Case studies públicos

**Opção C: Prosseguir com qualidade reduzida (não recomendado)**
```
⚠️ Fidelity esperada: 40-50%
O agent vai funcionar, mas será mais genérico.
```

---

## 2. Fontes Insuficientes

### Sintoma
```
SOURCE_QUALITY: FAIL
- Total sources: 7/10 ❌
- Tier 1 sources: 3/5 ❌
```

### Causa
Fallback chain não encontrou fontes suficientes.

### Soluções

**1. Rodar auto-acquire manualmente**
```bash
*auto-acquire-sources "{expert}" --domain {domain}
```

**2. Adicionar materiais do usuário**
```bash
# Coletar materiais em uma pasta
mkdir ./materials/{expert}/
# Adicionar PDFs, transcrições, etc.

# Rodar com materiais
*clone-mind "{expert}" --sources ./materials/{expert}/
```

**3. Expandir queries de busca**

Busque manualmente por:
```
"{expert}" masterclass
"{expert}" workshop
"{expert}" course transcript
"{expert}" complete interview
"{expert}" book summary detailed
```

---

## 3. Smoke Test Falhando

### Sintoma
```
SMOKE_TEST: FAIL
- Test 1: PASS
- Test 2: FAIL (2/5 checks)
- Test 3: PASS
```

### Causa
O agent não está aplicando corretamente o DNA extraído.

### Diagnóstico

**Qual teste falhou?**

| Teste | Problema Provável |
|-------|-------------------|
| Test 1 (Knowledge) | Voice DNA incompleto |
| Test 2 (Decision) | Thinking DNA incompleto |
| Test 3 (Objection) | Objection handling faltando |

### Soluções

**Test 1 falhou: Voice DNA**
```bash
# Verificar voice_dna.yaml
cat squads/mind-cloning/minds/{slug}/voice_dna.yaml

# Se incompleto, re-extrair com mais fontes
*extract-voice-dna "{expert}" --sources ./mais-entrevistas/
```

**Test 2 falhou: Thinking DNA**
```bash
# Verificar thinking_dna.yaml
cat squads/mind-cloning/minds/{slug}/thinking_dna.yaml

# Verificar se heuristics estão completas
# Se não, re-extrair
*extract-thinking-dna "{expert}" --sources ./mais-livros/
```

**Test 3 falhou: Objection handling**
```yaml
# Adicionar manualmente ao thinking_dna.yaml:
objection_handling:
  "{objeção comum}":
    response: "Como expert responderia..."
    conviction_level: 9/10
```

---

## 4. Agent Responde de Forma Genérica

### Sintoma
Agent está funcional mas não "soa" como o expert real.

### Causa
Voice DNA não foi bem aplicado no agent.md.

### Diagnóstico
```bash
# Comparar DNA com agent
cat squads/mind-cloning/minds/{slug}/voice_dna.yaml
cat squads/{squad}/agents/{agent}.md

# Verificar se power_words aparecem no agent
```

### Soluções

**1. Verificar seção voice_dna no agent**

O agent.md deve ter:
```yaml
voice_dna:
  vocabulary:
    always_use: [lista de power_words]
    never_use: [lista de proibidos]

  sentence_starters:
    - "Como {expert} diria..."

  tone:
    # dimensões específicas
```

**2. Adicionar mais output_examples**

```yaml
output_examples:
  - input: "Pergunta típica"
    output: |
      Resposta no estilo EXATO do expert,
      usando vocabulary e tone documentados.
```

**3. Re-gerar agent com DNA atualizado**
```bash
*create-agent {name} --squad {squad} --based-on "{expert}"
```

---

## 5. Quality Gate Blocking

### Sintoma
```
QUALITY_GATE: BLOCKED
Cannot proceed until resolved.
```

### Gates e Soluções

| Gate | Threshold | Como Resolver |
|------|-----------|---------------|
| SOURCE_QUALITY | 5/5 blocking | Adicionar mais fontes |
| VOICE_QUALITY | 8/10 | Melhorar voice extraction |
| THINKING_QUALITY | 7/9 | Melhorar thinking extraction |
| SYNTHESIS_QUALITY | Consistente | Revisar inconsistências |
| SMOKE_TEST | 3/3 | Ver seção 3 acima |

### Override (não recomendado)
```bash
# Em YOLO mode, alguns gates podem ser bypassed
# Mas fidelity será muito baixa
*create-squad {domain} --mode yolo --skip-validation
```

---

## 6. DNA Inconsistente

### Sintoma
```
SYNTHESIS_QUALITY: FAIL
Voice e Thinking DNA têm contradições.
```

### Causa
Fontes diferentes apresentam visões conflitantes do expert.

### Diagnóstico
```bash
# Ver onde está a contradição
cat squads/mind-cloning/minds/{slug}/voice_dna.yaml
cat squads/mind-cloning/minds/{slug}/thinking_dna.yaml

# Procurar por:
# - Tom diferente em diferentes contextos
# - Heurísticas que se contradizem
```

### Soluções

**1. Documentar como contradição autêntica**

Alguns experts SÃO contraditórios. Isso é real.

```yaml
# No voice_dna.yaml
contradictions:
  - paradox: "Diz X em livros, mas faz Y em entrevistas"
    context: "Livros são mais formais"
    authentic: true  # Não é erro, é o expert mesmo
```

**2. Priorizar fontes mais recentes**

Se expert mudou de opinião ao longo do tempo:
```yaml
# Usar temporal weighting
sources:
  - title: "Livro de 2020"
    weight: 1.0  # Mais recente = mais peso
  - title: "Entrevista de 2010"
    weight: 0.7  # Mais antigo = menos peso
```

---

## 7. Squad Sem Tier 0

### Sintoma
```
ARCHITECTURE: WARNING
Squad não tem agent Tier 0 (diagnóstico).
```

### Causa
Pesquisa não encontrou mind com capacidade diagnóstica.

### Impacto
Sem Tier 0, requests vão direto para execução sem análise prévia.

### Soluções

**1. Identificar mind diagnóstico**

Procure por expert que seja conhecido por:
- Classificação/categorização
- Análise antes de execução
- Frameworks de diagnóstico

Exemplos:
- Copywriting: Eugene Schwartz (Awareness Levels)
- Legal: [expert que classifica casos]
- Marketing: [expert que segmenta mercados]

**2. Criar orchestrator com capacidade diagnóstica**

Se não encontrar mind específico:
```yaml
# No orchestrator do squad
capabilities:
  - "Diagnostic routing"
  - "Classify request before routing"

diagnostic_questions:
  - "Qual o awareness level do público?"
  - "Qual o objetivo principal?"
```

---

## 8. Workflow Travado

### Sintoma
Workflow parou e não prossegue.

### Diagnóstico

**1. Verificar checkpoint atual**
```bash
# Ver onde parou
*show-context
```

**2. Verificar se está esperando input**

Em QUALITY mode, vários checkpoints pedem input:
- CP1: Aprovar minds
- CP_MATERIALS: Fornecer materiais
- CP_DNA: Validar DNA
- CP_FINAL: Aprovação final

**3. Verificar se falhou silenciosamente**
```bash
# Ver logs recentes
*validate-squad {squad}
```

### Soluções

**Retomar workflow**
```bash
# Re-executar do ponto atual
*create-squad {domain} --resume
```

**Forçar prosseguimento (YOLO)**
```bash
*create-squad {domain} --mode yolo --force
```

---

## Quick Debug Checklist

```
□ Expert tem frameworks documentados?
□ Fontes >= 10 (5+ Tier 1)?
□ Triangulação possível (3+ por claim)?
□ Voice DNA completo (power_words, phrases)?
□ Thinking DNA completo (frameworks, heuristics)?
□ Smoke tests passando (3/3)?
□ Squad tem Tier 0?
□ Agent tem 300+ lines?
```

---

## Quando Pedir Ajuda

Se nenhuma solução funcionou:

1. **Documente o problema:**
   - Comando executado
   - Erro exato
   - O que já tentou

2. **Colete contexto:**
   ```bash
   *show-context
   *validate-squad {squad}
   cat squads/mind-cloning/minds/{slug}/quality_dashboard.md
   ```

3. **Abra issue** com essas informações

---

**Squad Architect | Troubleshooting v1.0**
*"Todo problema tem solução. A maioria é falta de fontes."*
