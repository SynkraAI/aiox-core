<!--
  Tradução: PT-BR
  Original: /docs/guides/squads-overview.md
  Última sincronização: 2026-01-29
-->

# Visão Geral de Squads

> **PT-BR**

---

Introdução aos AIOS Squads - equipes modulares de agentes de IA que estendem a funcionalidade do framework.

**Versão:** 2.1.0
**Última Atualização:** 2026-01-28

---

## O que são Squads?

Squads são equipes modulares de agentes de IA que estendem a funcionalidade do AIOS para domínios ou casos de uso específicos. Cada squad é um pacote autocontido que pode ser instalado, compartilhado e composto com outros squads.

> **AIOS Squads:** Equipes de agentes de IA trabalhando com você

### Características Principais

| Característica     | Descrição                                      |
| ------------------ | ---------------------------------------------- |
| **Modular**        | Pacotes autocontidos com todas as dependências |
| **Composável**     | Múltiplos squads podem trabalhar juntos        |
| **Compartilhável** | Publique em repositório ou marketplace         |
| **Extensível**     | Construa sobre squads existentes               |
| **Versionável**    | Versionamento semântico para compatibilidade   |

### Squad vs. Agentes Tradicionais

| Agentes Tradicionais   | AIOS Squads                  |
| ---------------------- | ---------------------------- |
| Agentes individuais    | Equipe coordenada de agentes |
| Propósito único        | Workflows focados em domínio |
| Configuração manual    | Empacotado com configuração  |
| Reuso por copiar-colar | Instalar e usar              |
| Sem padronização       | TASK-FORMAT-SPEC-V1          |

---

## Estrutura do Squad

Um squad contém todos os componentes necessários para um domínio específico:

```
./squads/my-squad/
├── squad.yaml              # Manifesto (obrigatório)
├── README.md               # Documentação
├── LICENSE                 # Arquivo de licença
├── config/
│   ├── coding-standards.md # Regras de estilo de código
│   ├── tech-stack.md       # Tecnologias utilizadas
│   └── source-tree.md      # Estrutura de diretórios
├── agents/
│   └── my-agent.md         # Definições de agentes
├── tasks/
│   └── my-task.md          # Definições de tasks (task-first!)
├── workflows/
│   └── my-workflow.yaml    # Workflows multi-etapa
├── checklists/
│   └── review-checklist.md # Checklists de validação
├── templates/
│   └── report-template.md  # Templates de documentos
├── tools/
│   └── custom-tool.js      # Integrações de ferramentas customizadas
├── scripts/
│   └── setup.js            # Scripts utilitários
└── data/
    └── reference-data.json # Arquivos de dados estáticos
```

### Manifesto do Squad (squad.yaml)

Todo squad requer um arquivo de manifesto:

```yaml
# Campos obrigatórios
name: my-squad # kebab-case, identificador único
version: 1.0.0 # Versionamento semântico
description: O que este squad faz

# Metadados
author: Seu Nome <email@exemplo.com>
license: MIT
slashPrefix: my # Prefixo de comando para IDE

# Compatibilidade AIOS
aios:
  minVersion: '2.1.0'
  type: squad

# Declaração de componentes
components:
  agents:
    - my-agent.md
  tasks:
    - my-task.md
  workflows: []
  checklists: []
  templates: []
  tools: []
  scripts: []

# Herança de configuração
config:
  extends: extend # extend | override | none
  coding-standards: config/coding-standards.md
  tech-stack: config/tech-stack.md
  source-tree: config/source-tree.md

# Dependências
dependencies:
  node: [] # pacotes npm
  python: [] # pacotes pip
  squads: [] # Outros squads

# Tags de descoberta
tags:
  - domain-specific
  - automation
```

---

## Criando um Squad

### Usando o Agente @squad-creator

```bash
# Ativar o agente criador de squad
@squad-creator

# Opção 1: Design guiado (recomendado)
*design-squad --docs ./docs/prd/my-project.md

# Opção 2: Criação direta
*create-squad my-squad

# Opção 3: A partir de template
*create-squad my-squad --template etl
```

### Templates Disponíveis

| Template     | Caso de Uso                                    |
| ------------ | ---------------------------------------------- |
| `basic`      | Squad simples com um agente e task             |
| `etl`        | Extração, transformação, carregamento de dados |
| `agent-only` | Squad com agentes, sem tasks                   |

### Workflow do Squad Designer

1. **Coletar Documentação** - Forneça PRDs, specs, requisitos
2. **Análise de Domínio** - Sistema extrai conceitos, workflows, papéis
3. **Recomendações de Agentes** - Revise agentes sugeridos
4. **Recomendações de Tasks** - Revise tasks sugeridas
5. **Gerar Blueprint** - Salvar em `.squad-design.yaml`
6. **Criar do Blueprint** - `*create-squad my-squad --from-design`

---

## Squads Disponíveis

### Squads Oficiais

| Squad             | Versão | Descrição                          | Repositório                                                                      |
| ----------------- | ------ | ---------------------------------- | -------------------------------------------------------------------------------- |
| **etl-squad**     | 2.0.0  | Coleta e transformação de dados    | [aios-squads/etl](https://github.com/SynkraAI/aios-squads/tree/main/etl)         |
| **creator-squad** | 1.0.0  | Utilitários de geração de conteúdo | [aios-squads/creator](https://github.com/SynkraAI/aios-squads/tree/main/creator) |

### Níveis de Distribuição

```
┌─────────────────────────────────────────────────────────────┐
│                    DISTRIBUIÇÃO DE SQUADS                     │
├─────────────────────────────────────────────────────────────┤
│  Nível 1: LOCAL        --> ./squads/           (Privado)     │
│  Nível 2: AIOS-SQUADS  --> github.com/SynkraAI (Público)     │
│  Nível 3: SYNKRA API   --> api.synkra.dev      (Marketplace) │
└─────────────────────────────────────────────────────────────┘
```

### Instalando Squads

```bash
# Listar squads disponíveis
aios squads list

# Baixar do repositório oficial
*download-squad etl-squad

# Baixar versão específica
*download-squad etl-squad@2.0.0

# Listar squads locais
*list-squads
```

---

## Melhores Práticas

### 1. Siga a Arquitetura Task-First

Squads seguem arquitetura task-first onde tasks são o ponto de entrada principal:

```
Requisição do Usuário --> Task --> Execução do Agente --> Saída
                           │
                      Workflow (se multi-etapa)
```

Tasks devem seguir [TASK-FORMAT-SPECIFICATION-V1](../../.aios-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md).

### 2. Use Herança de Configuração com Sabedoria

| Modo       | Comportamento                           |
| ---------- | --------------------------------------- |
| `extend`   | Adiciona regras do squad às regras AIOS |
| `override` | Substitui regras AIOS pelas do squad    |
| `none`     | Configuração independente               |

### 3. Valide Antes de Publicar

```bash
# Validar estrutura do squad
*validate-squad my-squad

# Modo estrito (para CI/CD)
*validate-squad my-squad --strict
```

### 4. Documente Seu Squad

Inclua documentação completa:

- `README.md` com exemplos de uso
- Descrições claras de agentes
- Especificações de entrada/saída de tasks
- Diagramas de workflow

### 5. Versione Apropriadamente

Use versionamento semântico:

- **Major (X.0.0):** Mudanças incompatíveis
- **Minor (0.X.0):** Novas funcionalidades, compatível
- **Patch (0.0.X):** Correções de bugs

---

## Referência de Comandos do Squad

| Comando                                  | Descrição                               |
| ---------------------------------------- | --------------------------------------- |
| `*create-squad {name}`                   | Criar novo squad com prompts            |
| `*create-squad {name} --template {type}` | Criar a partir de template              |
| `*create-squad {name} --from-design`     | Criar a partir de blueprint de design   |
| `*validate-squad {name}`                 | Validar estrutura do squad              |
| `*list-squads`                           | Listar todos os squads locais           |
| `*download-squad {name}`                 | Baixar do repositório                   |
| `*design-squad`                          | Projetar squad a partir de documentação |
| `*analyze-squad {name}`                  | Analisar estrutura do squad             |
| `*extend-squad {name}`                   | Adicionar componentes ao squad          |
| `*publish-squad {path}`                  | Publicar no repositório                 |

---

## Próximos Passos

- **Crie Seu Primeiro Squad:** Siga o [Guia de Squads](./squads-guide.md) para instruções detalhadas
- **Explore Squads Oficiais:** Confira o [repositório aios-squads](https://github.com/SynkraAI/aios-squads)
- **Contribua:** Veja o [Guia de Contribuição de Squads](./contributing-squads.md)
- **Aprenda o Formato de Task:** Leia [TASK-FORMAT-SPECIFICATION-V1](../../.aios-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md)

---

## Documentação Relacionada

- [Guia de Desenvolvimento de Squads](./squads-guide.md) - Guia completo para criar e gerenciar squads
- [Guia de Migração de Squad](./squad-migration.md) - Migrando do formato legado
- [Especificação de Formato de Task](../../.aios-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md)
- [Agente @squad-creator](../../.aios-core/development/agents/squad-creator.md)

---

## FAQ

### Qual a diferença entre um Squad e um Expansion Pack?

**Squads** são o novo padrão (AIOS 2.1+) substituindo Expansion Packs. Squads têm:

- Arquitetura task-first
- Validação JSON Schema
- Distribuição em três níveis
- Melhor ferramental (`@squad-creator`)

### Posso usar Squads de diferentes fontes juntos?

Sim. O Squad Loader resolve de múltiplas fontes. Squads locais têm precedência.

### Squads podem depender de outros Squads?

Sim, declare em `dependencies.squads`:

```yaml
dependencies:
  squads:
    - etl-squad@^2.0.0
```

### Qual a versão mínima do AIOS para Squads?

Squads requerem AIOS 2.1.0+. Defina no manifesto:

```yaml
aios:
  minVersion: '2.1.0'
```

---

_AIOS Squads: Equipes de agentes de IA trabalhando com você_

_Versão: 2.1.0 | Atualizado: 2026-01-28_
