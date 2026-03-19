# Task: Assess Sources

**Command:** `*assess-sources`
**Load:** `data/an-source-tiers.yaml`

## Purpose

Avaliar e classificar todas as fontes disponiveis para um projeto de clone, gerando um source map priorizado.

## Workflow

### Step 1: Collect Sources

Perguntar ao usuario:

- "Liste TODOS os materiais que voce tem dessa pessoa"
- Tipos: videos, podcasts, livros, posts, stories, comentarios, entrevistas, cursos

### Step 2: Classify Each Source

Para cada fonte, avaliar usando 5 dimensoes de curadoria:

| Dimensao      | Pergunta                               | Score 1-5 |
| ------------- | -------------------------------------- | --------- |
| Autenticidade | Pensamento real ou performance?        |           |
| Profundidade  | Frameworks/decisoes ou superficie?     |           |
| Atualidade    | Reflete pensamento atual?              |           |
| Unicidade     | Mostra o que torna UNICO?              |           |
| Completude    | Cobre Playbook + Framework + exemplos? |           |

**Classificacao:**

- Media >= 4.0 → **OURO**
- Media 3.0-3.9 → **MIXED** (usar com cautela)
- Media < 3.0 → **BRONZE** (descartar como base)

### Step 3: Prioritize

Ordenar fontes ouro por valor de extracao:

1. Entrevistas longas com perguntas dificeis (maior valor)
2. Comentarios respondendo perguntas reais
3. Cases detalhados com analise
4. Livros com metodologia propria
5. Stories espontaneos

### Step 4: Generate Source Map

```yaml
source_assessment:
  mind: "{nome}"
  total_sources: {n}
  classification:
    ouro: {n} ({%})
    mixed: {n} ({%})
    bronze: {n} ({%})
  sources:
    - name: "{fonte}"
      type: "{tipo}"
      tier: "ouro|mixed|bronze"
      scores:
        autenticidade: {1-5}
        profundidade: {1-5}
        atualidade: {1-5}
        unicidade: {1-5}
        completude: {1-5}
      media: {score}
      extraction_priority: {1-n}
      notes: "{observacoes}"
  recommendations:
    - "{acao recomendada}"
  curadoria_score: "{media geral das fontes ouro}"
```

## Completion Criteria

- [ ] Todas as fontes listadas
- [ ] Cada fonte classificada com 5 dimensoes
- [ ] Ouro vs Bronze separado
- [ ] Prioridade de extracao definida
- [ ] Source map YAML gerado
