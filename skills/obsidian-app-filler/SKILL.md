---
name: obsidian-app-filler
description: "Preenche automaticamente notas de apps do Obsidian baseado em dados estruturados e templates."

paths:
  - "skills/obsidian-app-filler/"
lazy_load: true
context_budget: 1800

version: 1.0.0
category: development
tags: [SKILL]
---

# Obsidian App Filler — Preenchimento Automático de Notas de Apps

**Version:** 2.0.0
**Type:** Skill
**Category:** Productivity & Documentation
**Runtime:** Claude Code

---

## Descrição

Preenche automaticamente notas de aplicativos no Obsidian a partir de um PRD (Product Requirements Document) fornecido. A skill lê o PRD, analisa requisitos, stack tecnológica, arquitetura e roadmap, e preenche todas as seções restantes do template de nota do app — metadata, descrição, stack, requisitos, arquitetura e roadmap.

O resultado é uma nota completa e estruturada, pronta para consulta no vault do Obsidian, sem necessidade de preenchimento manual.

---

## Quando Usar

Use esta skill quando:
- Você tem um **PRD escrito** (mesmo que parcial) e quer transformá-lo em nota estruturada no Obsidian
- Precisa **preencher múltiplas seções** de uma nota de app que já tem template definido
- Quer gerar **metadata, stack, arquitetura e roadmap** automaticamente a partir do PRD
- Precisa padronizar notas de apps no vault seguindo um template consistente
- Quer economizar tempo convertendo documentação de produto em notas de referência

## Quando NÃO Usar

- **Sem PRD:** se não existe nenhum PRD ou descrição do produto, a skill não tem input suficiente para gerar conteúdo útil
- **Sem vault Obsidian:** se o destino não é um vault Obsidian com template de notas
- **Notas já completas:** se a nota já está preenchida e você só quer editar uma seção específica, edite manualmente
- **PRD genérico demais:** se o PRD tem apenas uma frase ("um app de tarefas"), o output será raso — enriqueça o PRD antes

---

## Discovery Questions

Perguntas para fazer antes de executar. Use AskUserQuestion tool. Pule se o usuário já forneceu esse contexto.

1. **Qual o caminho do arquivo `.md` do app no Obsidian?** — (input obrigatório; o arquivo deve conter a seção PRD preenchida)
2. **O PRD já está escrito dentro do arquivo ou é um arquivo separado?** — (define se a skill lê do próprio arquivo ou de uma fonte externa)
3. **Qual o template de notas que você usa? Tem seções customizadas?** — (garante que o output respeita a estrutura do seu vault)
4. **Quais campos são obrigatórios no seu template? (ex: status, prioridade, complexidade, tags)** — (evita gerar nota incompleta)
5. **Tem preferência de stack tecnológica ou deve ser inferida do PRD?** — (se o usuário já decidiu a stack, evita sugestões conflitantes) (opcional)

---

## Pré-requisitos

| Requisito | Descrição |
|-----------|-----------|
| Vault Obsidian | Caminho acessível ao Claude Code (local) |
| Arquivo .md do app | Deve existir no vault com template de nota |
| Seção PRD preenchida | O arquivo deve conter uma seção PRD com conteúdo suficiente para análise |
| Template de nota | Estrutura de seções definida (metadata, descrição, stack, etc.) |

---

## Fases de Execução

### Fase 1 — Leitura e Validação do PRD

- Ler o arquivo `.md` fornecido pelo usuário
- Identificar a seção PRD dentro do arquivo (delimitada por headers ou marcadores)
- Validar que o PRD contém informação suficiente (mínimo: descrição do produto, público-alvo ou funcionalidades)
- Se o PRD estiver vazio ou insuficiente: **PARAR** e informar o usuário

### Fase 2 — Mapeamento de Campos do Template

- Identificar todas as seções do template de nota (headers `##`, `###`)
- Mapear quais seções já estão preenchidas (preservar conteúdo existente)
- Mapear quais seções estão vazias (candidatas ao preenchimento)
- Identificar campos de metadata (frontmatter YAML) e seus tipos esperados

### Fase 3 — Geração de Conteúdo

Para cada seção vazia, gerar conteúdo baseado no PRD:

| Seção | Fonte no PRD | Lógica |
|-------|-------------|--------|
| Metadata (frontmatter) | Título, status, prioridade | Inferir de complexidade e escopo |
| Descrição | Resumo do produto | Síntese em 2-3 parágrafos |
| Stack Tecnológica | Requisitos técnicos | Inferir ou usar preferência do usuário |
| Requisitos | Funcionalidades listadas | Organizar em categorias (core, nice-to-have) |
| Arquitetura | Integrações, escala | Diagrama textual ou descrição de componentes |
| Roadmap | Fases, milestones | Organizar em fases com estimativas |
| Tags | Domínio, tecnologias | Gerar tags relevantes para busca no vault |

### Fase 4 — Validação e Output

- Verificar que todas as seções obrigatórias foram preenchidas
- Confirmar que o conteúdo original do PRD foi preservado intacto
- Validar formatação Markdown (headers, listas, frontmatter YAML válido)
- Salvar o arquivo atualizado no caminho original
- Mostrar resumo ao usuário do que foi preenchido

---

## Formato de Output

O arquivo `.md` atualizado segue a estrutura do template do usuário. Exemplo típico:

```markdown
---
status: em-desenvolvimento
prioridade: alta
complexidade: média
tags: [saas, react, typescript]
criado: 2026-03-24
---

# Nome do App

## Descrição
[Gerado a partir do PRD]

## PRD
[PRESERVADO — conteúdo original intacto]

## Stack
[Inferido do PRD ou preferência do usuário]

## Requisitos
[Extraído e organizado do PRD]

## Arquitetura
[Inferido do PRD]

## Roadmap
[Fases e milestones derivados do PRD]
```

---

## Tratamento de Erros

| Erro | Causa | Ação |
|------|-------|------|
| Arquivo não encontrado | Caminho inválido ou vault inacessível | Pedir caminho correto ao usuário |
| PRD vazio | Seção PRD sem conteúdo | PARAR e informar que o PRD precisa ser preenchido antes |
| PRD insuficiente | Menos de 3 linhas ou muito genérico | Avisar e sugerir enriquecimento do PRD |
| Template não reconhecido | Estrutura de headers diferente do esperado | Perguntar ao usuário quais seções preencher |
| Frontmatter inválido | YAML malformado no arquivo original | Corrigir YAML e avisar o usuário |
| Seção já preenchida | Conteúdo existente em seção candidata | Preservar conteúdo original, não sobrescrever |

---

## Notas de Implementação

- **Preservação:** O conteúdo original do PRD NUNCA é modificado. A skill apenas preenche seções vazias.
- **Idempotência:** Rodar a skill duas vezes no mesmo arquivo não duplica conteúdo — seções já preenchidas são ignoradas.
- **Encoding:** Respeitar UTF-8 com acentuação completa em todo conteúdo pt-BR gerado.
- **Entry point:** `skill.js`

---

## Comando

```bash
/preencher-app
```
