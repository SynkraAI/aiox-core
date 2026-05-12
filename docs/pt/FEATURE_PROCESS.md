<!--
  Tradução: PT-BR
  Original: /docs/en/FEATURE_PROCESS.md
  Última sincronização: 2026-01-26
-->

# Processo de Solicitação de Funcionalidades

> 🌐 [EN](../FEATURE_PROCESS.md) | **PT** | [ES](../es/FEATURE_PROCESS.md)

---

Este documento explica como propor novas funcionalidades para o AIOX.

## Ideias Rápidas

Para ideias rápidas ou pequenas melhorias:

1. Abra uma Discussion na categoria "Ideas"
2. Descreva o problema e a solução proposta
3. A comunidade e mantenedores irão discutir
4. Se houver interesse, pode ser promovido para RFC

## Processo RFC (Para Funcionalidades Significativas)

Para funcionalidades maiores que requerem decisões de design:

### Quando Escrever uma RFC

- Novas funcionalidades importantes
- Mudanças que quebram compatibilidade
- Mudanças arquiteturais significativas
- Mudanças que afetam muitos usuários

### Ciclo de Vida da RFC

1. **Draft**: Autor escreve RFC usando nosso [Template de RFC](../../.github/RFC_TEMPLATE.md)
2. **Under Review**: Período de comentários de 2 semanas
3. **Decision**: Mantenedores aceitam/rejeitam
4. **Implementation**: Se aceita, implementação começa

### Critérios para Aceitação

- Alinha com a visão do projeto
- Tecnicamente viável
- Tem caminho de implementação claro
- Demanda da comunidade demonstrada
- Manutenível a longo prazo

## Votação

- Use reações :+1: para mostrar suporte
- Ideias mais votadas são priorizadas
- Mantenedores têm decisão final

## Cronograma

- Ideias: Sem cronograma fixo
- RFCs: Período mínimo de revisão de 2 semanas
- Implementação: Baseado na capacidade do roadmap

## Da Ideia à Implementação

```text
Ideia da Comunidade (Discussion)
        │
        │ [Aprovado pelos mantenedores]
        ▼
Item Interno do Backlog
        │
        │ [Priorizado pelo Product Owner]
        ▼
Sprint Planning
        │
        │ [Implementado pelo Time de Desenvolvimento]
        ▼
Release (creditado no CHANGELOG.md)
```

### Quem Pode Adicionar ao Backlog?

O Product Owner (@po) é a única autoridade para adicionar itens ao backlog interno.
Isso garante priorização adequada e alinhamento com os objetivos do projeto.

### Crédito aos Contribuidores

Contribuidores cujas ideias são implementadas serão creditados em:

- As notas de release do CHANGELOG.md
- O PR que implementa a funcionalidade
- Nossa página de contribuidores (se aplicável)

## Perguntas?

Pergunte no GitHub Discussions ou Discord.

---

_Veja também: [Community Handbook](../../COMMUNITY.md) | [Contributing Guide](../../CONTRIBUTING.md)_
