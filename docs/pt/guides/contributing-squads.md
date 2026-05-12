<!--
  Tradução: PT-BR
  Original: /docs/en/guides/contributing-squads.md
  Última sincronização: 2026-01-26
-->

# Guia de Contribuição de Squads

> 🌐 [EN](../../guides/contributing-squads.md) | **PT** | [ES](../../es/guides/contributing-squads.md)

---

Como contribuir squads para o ecossistema AIOX.

## Visão Geral

Existem duas formas de compartilhar seu squad com a comunidade:

1. **Repositório aiox-squads** - Squads gratuitos e open-source no GitHub
2. **Synkra Marketplace** - Squads premium via API Synkra

## Padrões de Qualidade

Todos os squads contribuídos devem atender a estes padrões:

### Obrigatório

| Requisito | Descrição |
|-----------|-----------|
| **Manifesto válido** | `squad.yaml` passa validação JSON Schema |
| **Documentação** | README.md com instruções de uso |
| **Licença** | Licença open source (MIT, Apache 2.0, etc.) |
| **Compatibilidade AIOX** | `aiox.minVersion: "2.1.0"` ou superior |
| **Arquitetura task-first** | Tasks como pontos de entrada principais |

### Recomendado

| Recomendação | Descrição |
|--------------|-----------|
| **Exemplos** | Exemplos de uso no README |
| **Testes** | Testes unitários para funcionalidade crítica |
| **Changelog** | Documentação de histórico de versão |
| **Solução de problemas** | Problemas comuns e soluções |

## Convenções de Nomenclatura

### Nomes de Squad

- Use `kebab-case`: `my-awesome-squad`
- Seja descritivo: `etl-data-pipeline` não `data1`
- Evite nomes genéricos: `helper-squad` é muito vago
- Sem números de versão no nome: `my-squad` não `my-squad-v2`

### Prefixo (slashPrefix)

O `slashPrefix` no `squad.yaml` determina prefixos de comando:

```yaml
slashPrefix: etl  # Comandos tornam-se *etl-extract, *etl-transform
```

Escolha um prefixo único e curto (2-5 caracteres).

## Requisitos do Manifesto

### Campos Obrigatórios

```yaml
# Estes campos são OBRIGATÓRIOS
name: my-squad
version: 1.0.0              # Versionamento semântico
description: Descrição clara do que este squad faz

aiox:
  minVersion: "2.1.0"
  type: squad

components:
  agents: []                # Pelo menos um agent OU task
  tasks: []
```

### Campos Recomendados

```yaml
# Estes campos são RECOMENDADOS
author: Seu Nome <email@example.com>
license: MIT
slashPrefix: my

tags:
  - relevant
  - keywords

dependencies:
  node: []
  python: []
  squads: []
```

## Requisitos de Documentação

### Estrutura do README.md

```markdown
# Nome do Squad

Breve descrição (1-2 frases).

## Instalação

Como instalar/adicionar este squad.

## Uso

Exemplos básicos de uso.

## Comandos

| Comando | Descrição |
|---------|-----------|
| *cmd1 | O que faz |
| *cmd2 | O que faz |

## Configuração

Quaisquer opções de configuração.

## Exemplos

Exemplos detalhados de uso.

## Solução de Problemas

Problemas comuns e soluções.

## Licença

Informações da licença.
```

## Publicando no aiox-squads

### Pré-requisitos

1. Conta GitHub
2. Squad validado: `*validate-squad --strict`
3. Nome de squad único (verifique squads existentes)

### Passos

```bash
# 1. Validar seu squad
@squad-creator
*validate-squad my-squad --strict

# 2. Publicar (cria PR)
*publish-squad ./squads/my-squad
```

Isso irá:
1. Fazer fork de `SynkraAI/aiox-squads` (se necessário)
2. Criar branch com seu squad
3. Abrir PR para revisão

### Processo de Revisão

1. **Verificações automatizadas** - Validação de schema, verificação de estrutura
2. **Revisão do mantenedor** - Revisão de código, verificação de qualidade
3. **Merge** - Squad adicionado ao registro

Prazo: Geralmente 2-5 dias úteis.

## Publicando no Synkra Marketplace

### Pré-requisitos

1. Conta Synkra
2. Token API configurado
3. Squad validado

### Passos

```bash
# 1. Configurar token
export SYNKRA_API_TOKEN="your-token"

# 2. Sincronizar com marketplace
@squad-creator
*sync-squad-synkra ./squads/my-squad --public
```

### Opções de Visibilidade

| Flag | Efeito |
|------|--------|
| `--private` | Visível apenas para seu workspace |
| `--public` | Visível para todos |

## Atualizando Squads Publicados

### Incremento de Versão

Siga versionamento semântico:

- **MAJOR** (1.0.0 → 2.0.0): Mudanças que quebram compatibilidade
- **MINOR** (1.0.0 → 1.1.0): Novos recursos, compatível com versões anteriores
- **PATCH** (1.0.0 → 1.0.1): Correções de bugs

### Processo de Atualização

```bash
# 1. Atualizar versão no squad.yaml
# 2. Atualizar CHANGELOG.md
# 3. Validar
*validate-squad my-squad --strict

# 4. Re-publicar
*publish-squad ./squads/my-squad
# ou
*sync-squad-synkra ./squads/my-squad
```

## Código de Conduta

### Faça

- Forneça documentação clara e precisa
- Teste seu squad antes de publicar
- Responda a issues e feedback
- Mantenha dependências mínimas
- Siga convenções do AIOX

### Não Faça

- Incluir código malicioso
- Armazenar credenciais no código
- Copiar trabalho de outros sem atribuição
- Usar nomes ou conteúdo ofensivo
- Fazer spam no registro com squads de teste

## Obtendo Ajuda

- **Perguntas**: [GitHub Discussions](https://github.com/SynkraAI/aiox-core/discussions)
- **Issues**: [Issue Tracker](https://github.com/SynkraAI/aiox-core/issues)
- **Diretrizes**: Este documento

## Recursos Relacionados

- [Guia de Desenvolvimento de Squad](./squads-guide.md)
- [Guia de Migração de Squad](./squad-migration.md)
- [Repositório aiox-squads](https://github.com/SynkraAI/aiox-squads)

---

**Versão:** 1.0.0 | **Atualizado:** 2025-12-26 | **Story:** SQS-8
