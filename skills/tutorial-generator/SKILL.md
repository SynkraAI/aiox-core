---
paths:
  - "skills/tutorial-generator/"
lazy_load: true
context_budget: 2000
name: tutorial-generator
description: |
  Extrai um tema de uma transcrição longa (live, podcast, aula) e gera um tutorial
  passo a passo didático para iniciantes. Garimpa trechos espalhados, ordena logicamente,
  e entrega tutorial coeso em Markdown e/ou HTML.

version: 1.0.0
category: design
tags: [SKILL]
---

# Tutorial Generator

Transforma transcrições longas e bagunçadas em tutoriais passo a passo, didáticos e bem estruturados.

Pense num garimpeiro: a transcrição é o rio cheio de cascalho. Você diz o tema, e a skill peneira tudo até entregar as pepitas organizadas em ordem.

## Quick Start

```
/AIOS:skills:tutorial-generator
```

## Discovery Questions

Perguntas para fazer antes de executar. Use AskUserQuestion tool. Pule se o usuário já forneceu esse contexto.

1. **Qual o caminho da transcrição?** — (arquivo .md, .txt ou cole o texto direto)
2. **Qual o tema/assunto do tutorial?** — (ex: "como criar um funil de vendas", "como montar uma palestra")
3. **Quem é o público-alvo?** — (nível de conhecimento, contexto — ex: "empreendedor iniciante", "dev junior")
4. **Formato de saída: Markdown, HTML ou ambos?** — (Markdown = leitura/obsidian, HTML = publicação web)
5. **Onde salvar o output?** — (default: ao lado da transcrição, em pasta `tutorials/`) (opcional)

## Pipeline (4 fases)

### Fase 1: Scan & Map (Mapeamento)

Ler a transcrição inteira e criar um **mapa de temas** — lista de todos os assuntos mencionados com indicação de onde aparecem. Isso permite:
- Confirmar o tema escolhido pelo usuário
- Mostrar temas alternativos caso queira gerar mais tutoriais depois
- Identificar TODOS os trechos relevantes, mesmo os que aparecem 40 minutos depois em outro contexto

**Output intermediário:** `{slug}-theme-map.yaml`

```yaml
theme_requested: "como criar um funil de vendas"
total_fragments_found: 14
fragments:
  - id: 1
    location: "linhas 45-72"
    summary: "Explicação do conceito de funil"
    relevance: high
  - id: 2
    location: "linhas 230-245"
    summary: "Exemplo prático de funil no Instagram"
    relevance: high
  - id: 3
    location: "linhas 890-910"
    summary: "Retomada do assunto funil com dica de ferramenta"
    relevance: medium
other_themes_detected:
  - "precificação de infoprodutos"
  - "criação de conteúdo para reels"
  - "gestão de time remoto"
```

### Fase 2: Extract & Order (Extração)

Extrair TODOS os fragmentos mapeados na Fase 1 e reorganizar em **ordem lógica de tutorial**:

1. Contexto / Por que isso importa
2. O que você vai precisar (pré-requisitos)
3. Passos sequenciais (do mais básico ao mais avançado)
4. Dicas e pegadinhas mencionadas
5. Resumo / Próximos passos

**Regras de extração:**
- Preservar a **linguagem original** do palestrante quando for clara e didática
- Traduzir jargão técnico quando o público é iniciante
- Marcar trechos onde o palestrante deu **exemplos práticos** (são ouro)
- Ignorar tangentes, piadas, interações com chat que não agregam ao tema

### Fase 3: Write (Redação do Tutorial)

Escrever o tutorial seguindo o template abaixo. Tom: **amigo que manja explicando pro amigo que tá começando**. Zero jargão sem explicação. Cada passo deve ser autocontido — se alguém pular pro passo 5, deve conseguir entender o que fazer.

**Template do tutorial:**

```markdown
# [Título do Tutorial]

> **Resumo:** [1-2 frases do que você vai aprender]
> **Nível:** Iniciante
> **Tempo estimado:** [X minutos de leitura]
> **Baseado em:** [Nome da live/aula] — [Data se disponível]

---

## Por que isso importa

[Contexto motivacional — por que o leitor deveria se importar com esse tema.
Use exemplos concretos mencionados na transcrição.]

---

## O que você vai precisar

- [ ] [Pré-requisito 1 — com link/explicação se necessário]
- [ ] [Pré-requisito 2]

---

## Passo a passo

### Passo 1: [Nome do passo]

[Explicação clara do que fazer.]

> **Dica:** [Se o palestrante deu uma dica prática, incluir aqui]

**Exemplo:**
[Exemplo concreto mencionado na transcrição]

---

### Passo 2: [Nome do passo]

[...]

---

## Erros comuns (e como evitar)

| Erro | Por que acontece | Como evitar |
|------|-----------------|-------------|
| [Erro 1] | [Causa] | [Solução] |

---

## Resumo rápido

1. [Passo 1 em uma frase]
2. [Passo 2 em uma frase]
3. [...]

---

## Próximos passos

- [O que estudar/fazer depois desse tutorial]
- [Outros temas da mesma live que complementam]

---

*Tutorial gerado a partir de [fonte]. Conteúdo original de [autor/palestrante].*
```

**Regras de redação:**
- **Vocabulário:** se usar um termo técnico, explique entre parênteses na primeira vez
- **Parágrafos:** máximo 3-4 linhas. Se ficou maior, quebra
- **Exemplos:** pelo menos 1 exemplo prático por passo (priorizar os da transcrição)
- **Analogias:** usar analogias do cotidiano para conceitos abstratos
- **Formatação:** usar negrito para termos-chave, blocos de citação para dicas, tabelas para comparações
- **Checklist mental:** antes de finalizar cada passo, perguntar "um iniciante conseguiria fazer isso só lendo?"

### Fase 4: Format & Deliver (Entrega)

Dependendo do formato escolhido:

**Markdown:**
- Salvar como `{slug}-tutorial.md`
- Frontmatter YAML com metadata (título, autor, data, tema, fonte)

**HTML:**
- Gerar usando a skill `image-creator` (Playwright render) se disponível
- Ou gerar HTML standalone com CSS inline (clean, responsivo, sem frameworks)
- Paleta neutra, tipografia legível, espaçamento generoso
- Salvar como `{slug}-tutorial.html`

**Ambos:**
- Gerar os dois formatos

**Local de salvamento:**
- Default: `tutorials/` na mesma pasta da transcrição
- Ou caminho customizado informado pelo usuário

## Exemplos de uso

### Exemplo 1: Live sobre marketing

```
Input: transcrição de 2h de live sobre marketing digital
Tema: "como criar um funil de vendas no Instagram"
Output: tutorial de 15 passos com exemplos práticos da live
```

### Exemplo 2: Aula gravada

```
Input: transcrição de aula de 1h30 sobre programação
Tema: "como configurar um projeto Next.js do zero"
Output: tutorial técnico com blocos de código e screenshots descritos
```

### Exemplo 3: Podcast longo

```
Input: transcrição de podcast de 3h com vários assuntos
Tema: "como negociar salário"
Output: tutorial focado só nos trechos sobre negociação, ignorando o resto
```

## Integração com outras skills

| Skill | Quando usar |
|-------|-------------|
| `deepgram-transcriber` / `groq-transcriber` | Se o input for áudio/vídeo, transcrever primeiro |
| `image-creator` | Para gerar versão HTML renderizada |
| `pt-br-accentuation` | Validar acentuação do output em português |
| `book-to-markdown` | Se o input for PDF/EPUB de aula |

## Quality Checklist

Antes de entregar, validar:

- [ ] Todos os passos são autocontidos (leitor pode pular pro meio e entender)
- [ ] Zero jargão sem explicação
- [ ] Pelo menos 1 exemplo prático por passo
- [ ] Resumo rápido no final bate com os passos
- [ ] Metadata/frontmatter preenchido
- [ ] Formatação consistente (headers, listas, tabelas)
- [ ] Nenhum trecho relevante da transcrição foi ignorado (conferir com theme-map)
- [ ] Tom é didático e acessível (teste: "um iniciante entenderia?")
