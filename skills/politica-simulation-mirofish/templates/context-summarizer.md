# Template: Sumarizador de Contexto Externo

<!-- Implementado na Story 3.4 -->
<!-- Executado ANTES da Assembly, durante a fase de Ingestão de Contexto -->
<!-- Garante que documentos longos não consumam context window desnecessário -->
<!-- Referência: Spec FR2, FIX-QA-REC-2, OQ-6 -->

## Purpose

Sumarizar um documento de contexto externo (notícia, pesquisa, post) para no máximo
500 palavras, preservando fatos, dados e entidades nomeadas — e descartando opiniões,
editorializações e redundâncias.

O resultado é injetado nos prompts de deliberação (todas as rodadas) para que os agentes
formem opiniões baseadas em informações reais e atuais, não apenas no conhecimento geral do LLM.

## Restrição de Arquitetura

**Limite: 500 palavras por documento.** Esta não é uma recomendação — é uma restrição de
arquitetura. Documentos maiores reduzem o número de agentes paralelizáveis por batch,
degradando diretamente a performance da simulação. (Referência: FIX-QA-REC-2)

## Input

- Conteúdo bruto do documento (markdown, texto puro ou YAML)
- Formato do documento: `{format}` (markdown | text | yaml)
- Caminho original: `{source_path}`
- Tamanho original em palavras: `{original_word_count}`

## Prompt de Sumarização

```
Você é um sumarizador de documentos para análise política. Sua tarefa é condensar o
documento abaixo para no máximo 500 palavras, mantendo APENAS:

✅ MANTER:
- Fatos objetivos e verificáveis
- Dados quantitativos (percentuais, datas, valores, índices)
- Nomes de pessoas, lugares, organizações e eventos relevantes
- Cronologia de eventos (quando ocorreram)
- Resultados, decisões ou conclusões concretas

❌ DESCARTAR:
- Opiniões do autor ou editorializações
- Repetições e redundâncias
- Contextualização histórica excessiva (manter apenas o essencial)
- Adjetivos valorativos sem dado associado ("polêmico", "histórico", etc.)
- Frases de transição e introdutórias
- Especulações ou hipóteses sem embasamento

FORMATO DE SAÍDA:
Retorne apenas o texto sumarizado, sem comentários ou metadados.
O texto deve ser fluido, em português, e legível por agentes que formarão opiniões políticas.
Máximo absoluto: 500 palavras.

DOCUMENTO:
{document_content}
```

## Output

Texto sumarizado em português, máximo 500 palavras.

## Como Usar no Pipeline

### Passo 1: Ler documento

```
Para cada `context_file` em `context_files`:
  1. Ler conteúdo do arquivo (Read tool)
  2. Detectar formato: .md → markdown | .yaml/.yml → yaml | demais → text
  3. Contar palavras originais
```

### Passo 2: Sumarizar

```
Se word_count > 500:
  Aplicar o prompt de sumarização acima com {document_content} preenchido
  Verificar que output ≤ 500 palavras
  Se ainda > 500 palavras: truncar preservando as primeiras 500 palavras do sumário
Senão:
  Usar o documento como está (já dentro do limite)
```

### Passo 3: Registrar metadados

```yaml
# Para cada documento processado, registrar em context-metadata.yaml:
context_documents:
  - source_path: "path/to/doc.md"
    format: markdown
    original_word_count: 1240
    summarized_word_count: 487
    was_summarized: true
```

### Passo 4: Concatenar contextos

```
Se múltiplos documentos:
  Concatenar sumários com separador:
  "---\n[Fonte: {source_path}]\n{summary}\n---"

Resultado final = contexto_consolidado (injetado em todas as rodadas)
```

## Bloco de Injeção nos Templates de Deliberação

Quando `contexto_consolidado` estiver disponível, injetar no prompt do agente:

```
## Contexto Atual (documentos fornecidos pelo operador)

{contexto_consolidado}

Use estas informações como referência factual ao formar sua opinião.
Você pode concordar ou discordar das implicações, mas os fatos acima são dados de entrada.
```

Se nenhum contexto for fornecido, omitir esta seção inteiramente (graceful degradation).

## Metadados para o Relatório Final

O `config-snapshot.yaml` de cada simulação deve incluir:

```yaml
context_ingestion:
  documents_provided: 2
  documents_summarized: 1       # apenas os que excederam 500 palavras
  documents_used_as_is: 1       # abaixo do limite, usados sem sumarização
  total_original_words: 1850
  total_summarized_words: 743
  sources:
    - path: "docs/pesquisa-ibope.md"
      original_words: 1240
      final_words: 487
      was_summarized: true
    - path: "docs/nota-governo.md"
      original_words: 610
      final_words: 256
      was_summarized: false
```
