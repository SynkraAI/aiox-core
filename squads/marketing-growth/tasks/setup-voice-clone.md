# Setup Voice Clone

**Task:** `setup-voice-clone`
**Agent:** @lead-copywriter + @content-producer
**Type:** Setup

---

## Description

Configurar voice clone pessoal para que todo conteudo do squad tenha seu tom de voz.

---

## Input

```yaml
exemplos_texto:
  - 'Texto 1 escrito pelo usuario (post, email, etc)'
  - 'Texto 2'
  - 'Texto 3'
  - 'Texto 4'
  - 'Texto 5'
  # Minimo 5, ideal 10
estilo_comunicacao: 'descricao do estilo preferido'
tom_preferido: 'formal | semi-formal | informal | conversacional'
```

---

## Process

### 1. Coleta

- Recebe 5-10 textos escritos pelo usuario

### 2. Analise (@lead-copywriter)

- Vocabulario recorrente
- Estrutura de frases (curtas/longas, pausas)
- Tom predominante
- Expressoes marca-registrada
- Ritmo e cadencia
- Analogias e metaforas preferidas

### 3. Criacao de Guias (@content-producer)

- data/voice-clone/voice-guide.md:
  - Palavras que USA (com exemplos)
  - Palavras que NUNCA usa
  - Estrutura tipica de paragrafos
  - Tom e ritmo
  - Expressoes assinatura
  - O que evitar
- data/voice-clone/writing-style.md:
  - Nivel de formalidade por plataforma
  - Exemplos de do's and don'ts
  - Templates de frases

### 4. Validacao

- Gera 3 textos-teste com o clone
- Human approval gate: "soa como voce?"

### 5. Ativacao

- Ativa voice_clone.enabled = true no config.yaml
- Distribui para todos agentes de producao

---

## Output

```
Arquivos gerados:
- data/voice-clone/voice-guide.md
- data/voice-clone/writing-style.md

Config atualizado:
- voice_clone.enabled: true

Validacao: aprovado pelo usuario
```

---

**Created:** 2026-02-05
**Version:** 1.0
