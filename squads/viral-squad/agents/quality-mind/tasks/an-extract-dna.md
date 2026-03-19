# Task: Extract DNA Mental

**Command:** `*extract-dna {mind}`
**Load:** `data/an-source-tiers.yaml`

## Purpose

Extrair o DNA Mental completo (8 camadas) de uma mente especifica, documentando Voice DNA e Thinking DNA.

## Workflow

### Phase 1: Source Assessment (40% do tempo)

1. Perguntar ao usuario: "Que material voce tem dessa pessoa?"
2. Listar TODAS as fontes fornecidas
3. Classificar cada fonte usando `an-source-tiers.yaml`:
   - **OURO**: Comentarios, entrevistas longas, stories, livros, cases
   - **BRONZE**: Palestras decoradas, conteudo antigo, generico, terceiros
4. Gerar Source Map com score de curadoria

### Phase 2: Layer Extraction

Para cada camada do DNA Mental, extrair patterns das fontes OURO:

| Layer | Nome                 | O que extrair                          |
| ----- | -------------------- | -------------------------------------- |
| 1     | Behavioral Patterns  | Como age, reage, aborda problemas      |
| 2     | Communication Style  | Vocabulario, ritmo, estrutura de frase |
| 3     | Routines & Habits    | Padroes repetitivos, rituais           |
| 4     | Recognition Patterns | O que detecta rapido, red/green flags  |
| 5     | Mental Models        | Frameworks de decisao, heuristicas     |
| 6     | Values Hierarchy     | O que prioriza, o que rejeita          |
| 7     | Core Obsessions      | Temas que volta sempre, batalhas       |
| 8     | Productive Paradoxes | Contradicoes que sao features          |

### Phase 3: Document Voice DNA

Extrair e documentar:

- Identity statement (1 frase que captura essencia)
- Power words (5-10 com contexto)
- Signature phrases (5-7 com quando usar)
- Metaphors (3+)
- Vocabulary rules (always/never/transforms)
- Tone dimensions (7 eixos, 1-10)
- Storytelling patterns (historias recorrentes + estrutura)

### Phase 4: Document Thinking DNA

Extrair e documentar:

- Primary framework (o framework MESTRE da pessoa)
- Secondary frameworks (3-6 complementares)
- Diagnostic framework (perguntas + red/green flags)
- Heuristics (5+ regras SE/ENTAO com ID)
- Veto conditions (o que NUNCA aceita)
- Decision architecture (pipeline + weights)

### Phase 5: Generate Report

Gerar report YAML com:

```yaml
dna_extraction_report:
  mind: "{nome}"
  date: "{data}"
  sources:
    ouro: [{ lista }]
    bronze: [{ lista }]
    curadoria_score: "{media}"
  voice_dna:
    identity: "{statement}"
    power_words: [{ lista }]
    signature_phrases: [{ lista }]
    tone: { dimensions }
  thinking_dna:
    primary_framework: "{nome + descricao}"
    secondary_frameworks: [{ lista }]
    heuristics: [{ lista com IDs }]
    veto_conditions: [{ lista }]
  fidelity_estimate: "{%}"
  next_steps: [{ recomendacoes }]
```

## Completion Criteria

- [ ] 8 camadas mapeadas
- [ ] Fontes classificadas (ouro vs bronze)
- [ ] Trindade identificada (Playbook + Framework + Swipe)
- [ ] Voice DNA documentado
- [ ] Thinking DNA documentado
- [ ] Report YAML gerado com fidelity estimate
