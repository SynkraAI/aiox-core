# create-blog-post

> Criar artigo de blog SEO-friendly usando estrutura de Atomic Essays escalada — uma ideia central desenvolvida com profundidade e otimização para busca orgânica

---

## Task Definition

```yaml
task_name: "create-blog-post"
status: active
responsible_executor: nicolas-cole
execution_type: agent
squad: presenca-digital
version: 1.0.0
```

---

## Input

- `content-pillars.json` (output de content-strategy)
- Brand Voice Guidelines
- Tema ou pilar específico solicitado
- Palavra-chave principal para SEO
- Intenção de busca: informacional, transacional, navegacional
- Extensão desejada (padrão: 1.200-2.000 palavras)

## Output

- Artigo completo em Markdown
- Meta title e meta description otimizados
- Slug sugerido para URL
- Lista de palavras-chave secundárias utilizadas

## Action Items

1. Definir keyword principal e mapear palavras-chave secundárias (LSI)
2. Escrever **H1** com keyword principal nos primeiros 60 caracteres
3. Escrever **introdução** (150-200 palavras): hook, validação da dor, promessa do artigo
4. Estruturar corpo em seções com H2/H3:
   - Mínimo 3 seções H2 com desenvolvimento substantivo
   - Cada seção: subtítulo com keyword secundária, parágrafos curtos (3-4 linhas)
   - Incluir lista, tabela ou exemplo concreto em pelo menos 2 seções
5. Escrever **conclusão** (100-150 palavras): resumo da promessa entregue + CTA
6. Escrever meta title (até 60 caracteres, keyword no início)
7. Escrever meta description (até 155 caracteres, benefício + keyword)
8. Sugerir slug curto e descritivo
9. Revisar: legibilidade (parágrafos curtos), densidade de keyword (1-2%), tom alinhado com Brand Voice Guidelines

## Acceptance Criteria

- [ ] H1 contém keyword principal
- [ ] Introdução tem hook e promessa clara nos primeiros 100 palavras
- [ ] Mínimo 3 seções H2 com desenvolvimento substantivo
- [ ] Extensão dentro do range solicitado (padrão: 1.200-2.000 palavras)
- [ ] Meta title até 60 caracteres com keyword no início
- [ ] Meta description até 155 caracteres com benefício claro
- [ ] Slug sugerido curto (máximo 5 palavras)
- [ ] Tom alinhado com Brand Voice Guidelines
- [ ] Pelo menos 1 lista ou tabela no corpo do artigo

## Veto Conditions

- Keyword principal ausente do H1
- Introdução sem hook ou promessa (começa com contexto histórico ou definição de dicionário)
- Parágrafos acima de 6 linhas sem quebra
- Densidade de keyword acima de 3% (over-optimization)
- Artigo sem CTA na conclusão
- Meta title acima de 65 caracteres

## Output Example

```markdown
# Como Criar Conteúdo Consistente Sem Burnout: O Método das 2 Horas

Você quer publicar todos os dias, mas no fim da semana não saiu nada. Não é preguiça. É ausência de sistema. Neste artigo, você vai aprender o framework que criadores de alto volume usam para produzir sem se esgotar.

---

## O Problema Real da Inconsistência

A maioria das pessoas tenta criar conteúdo "quando bate inspiração"...

## O Framework das 2 Horas Semanais

...

## Como Implementar na Primeira Semana

...

## Conclusão

Consistência não é força de vontade. É design de sistema. Comece com 2 horas essa semana.

---
META TITLE: Como Criar Conteúdo Consistente Sem Burnout (60 chars)
META DESC: Aprenda o método das 2 horas para criar conteúdo consistente sem burnout. Framework usado por criadores de alto volume. (123 chars)
SLUG: /criar-conteudo-consistente-sem-burnout
KEYWORDS SEC: calendário de conteúdo, batch content, sistema de criação
```
