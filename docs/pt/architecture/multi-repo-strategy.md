# Estratégia Multi-Repositório

> **PT** | [EN](../architecture/multi-repo-strategy.md) | [ES](../es/architecture/multi-repo-strategy.md)

---

**Versão:** 2.1.0
**Última Atualização:** 2026-01-28
**Status:** Documento de Arquitetura Oficial

---

## Índice

- [Visão Geral](#visão-geral)
- [Estrutura de Repositórios](#estrutura-de-repositórios)
- [Repositório Principal (aiox-core)](#repositório-principal-aiox-core)
- [Repositórios de Squads](#repositórios-de-squads)
- [Repositório de Ecossistema MCP](#repositório-de-ecossistema-mcp)
- [Repositórios Privados](#repositórios-privados)
- [Mecanismo de Sincronização](#mecanismo-de-sincronização)
- [Distribuição de Pacotes](#distribuição-de-pacotes)
- [Melhores Práticas](#melhores-práticas)

---

## Visão Geral

AIOX v4 adota uma **estratégia multi-repositório** para viabilizar desenvolvimento modular, contribuições comunitárias e separação clara entre framework principal, extensões (squads) e componentes proprietários.

### Objetivos de Design

| Objetivo                     | Descrição                                          |
| ---------------------------- | -------------------------------------------------- |
| **Modularidade**             | Squads podem ser desenvolvidas e versionadas independentemente |
| **Comunidade**               | Squads open-source incentivam contribuições comunitárias |
| **Proteção de IP**           | Componentes proprietários permanecem em repositórios privados |
| **Escalabilidade**           | Equipes podem trabalhar em repos separadas sem conflitos |
| **Flexibilidade de Licenças** | Componentes diferentes podem ter licenças diferentes |

---

## Estrutura de Repositórios

```
Organização SynkraAI
├── REPOSITÓRIOS PÚBLICOS
│   ├── aiox-core          # Framework principal (MIT)
│   ├── aiox-squads        # Squads comunitárias (MIT)
│   └── mcp-ecosystem      # Configurações MCP (Apache 2.0)
│
└── REPOSITÓRIOS PRIVADOS
    ├── mmos               # MMOS proprietário (NDA)
    └── certified-partners # Recursos de parceiros (Proprietário)
```

### Arquitetura Visual

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ORGANIZAÇÃO SYNKRA                                    │
│                                                                          │
│   REPOSITÓRIOS PÚBLICOS                                                  │
│   ═══════════════════════                                                │
│                                                                          │
│   ┌────────────────────┐     ┌────────────────────┐                     │
│   │  SynkraAI/         │     │  SynkraAI/         │                     │
│   │  aiox-core         │     │  aiox-squads       │                     │
│   │  (MIT)  │◄────│  (MIT)             │                     │
│   │                    │     │                    │                     │
│   │  - Framework Core  │     │  - Squad ETL       │                     │
│   │  - 11 Agentes Base │     │  - Squad Creator   │                     │
│   │  - Gates de Qualid │     │  - Squad MMOS      │                     │
│   │  - Hub Discussões  │     │  - Squads Comum    │                     │
│   └────────────────────┘     └────────────────────┘                     │
│            │                                                             │
│            │ dependência opcional                                        │
│            ▼                                                             │
│   ┌────────────────────┐                                                │
│   │  SynkraAI/         │                                                │
│   │  mcp-ecosystem     │                                                │
│   │  (Apache 2.0)      │                                                │
│   │                    │                                                │
│   │  - Docker MCP      │                                                │
│   │  - Configs IDE     │                                                │
│   │  - Presets MCP     │                                                │
│   └────────────────────┘                                                │
│                                                                          │
│   REPOSITÓRIOS PRIVADOS                                                  │
│   ═══════════════════════                                                │
│                                                                          │
│   ┌────────────────────┐     ┌────────────────────┐                     │
│   │  SynkraAI/mmos     │     │  SynkraAI/         │                     │
│   │  (Proprietário+NDA)│     │  certified-partners│                     │
│   │                    │     │  (Proprietário)    │                     │
│   │  - MMOS Minds      │     │  - Squads Premium  │                     │
│   │  - DNA Mental      │     │  - Portal Parceiros│                     │
│   └────────────────────┘     └────────────────────┘                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Repositório Principal (aiox-core)

### Propósito

O repositório principal contém o framework AIOX fundamental que todos os projetos dependem.

### Conteúdo

| Diretório                    | Descrição                                                |
| ---------------------------- | -------------------------------------------------------- |
| `.aiox-core/core/`           | Fundações do framework (config, registry, gates de qualidade) |
| `.aiox-core/development/`    | Definições de agentes, tarefas, workflows                |
| `.aiox-core/product/`        | Templates, checklists, dados de PM                       |
| `.aiox-core/infrastructure/` | Scripts, ferramentas, integrações                        |
| `docs/`                      | Documentação do framework                                |

### Licença

**MIT** - Licença permissiva para uso, modificação e distribuição do core.

### Pacote npm

```bash
npm install @aiox/core
```

---

## Repositórios de Squads

### Visão Geral

Squads são extensões modulares que adicionam capacidades especializadas ao AIOX.

### Repositório aiox-squads

```
aiox-squads/
├── etl/                    # Squad de processamento ETL
│   ├── squad.yaml          # Manifesto da squad
│   ├── agents/             # Agentes específicos da squad
│   ├── tasks/              # Tarefas da squad
│   └── README.md           # Documentação da squad
│
├── creator/                # Squad de criação de conteúdo
│   ├── squad.yaml
│   ├── agents/
│   └── tasks/
│
├── mmos/                   # Squad de integração MMOS
│   ├── squad.yaml
│   ├── agents/
│   └── tasks/
│
└── templates/              # Templates de criação de squads
    └── squad-template/
```

### Manifesto de Squad (squad.yaml)

```yaml
name: etl
version: 1.0.0
description: Squad de processamento ETL para pipelines de dados
license: MIT

peerDependencies:
  '@aiox/core': '^2.1.0'

agents:
  - id: data-engineer
    extends: dev

tasks:
  - extract-data
  - transform-data
  - load-data

exports:
  - agents
  - tasks
```

### Licença

**MIT** - Total liberdade open-source para contribuições comunitárias.

### Pacotes npm

```bash
npm install @aiox/squad-etl
npm install @aiox/squad-creator
npm install @aiox/squad-mmos
```

---

## Repositório de Ecossistema MCP

### Propósito

Configurações MCP (Model Context Protocol) centralizadas para vários IDEs e ambientes.

### Conteúdo

```
mcp-ecosystem/
├── docker/                 # Configurações Docker MCP
│   ├── docker-compose.yml
│   └── mcp-servers/
│
├── ide-configs/            # Configurações específicas de IDE
│   ├── claude-code/
│   ├── cursor/
│   └── vscode/
│
└── presets/                # Bundles MCP pré-configurados
    ├── minimal/
    ├── development/
    └── enterprise/
```

### Licença

**Apache 2.0** - Licença permissiva para máxima adoção.

### Pacote npm

```bash
npm install @aiox/mcp-presets
```

---

## Repositórios Privados

### SynkraAI/mmos (Proprietário + NDA)

Contém componentes proprietários MMOS (Mental Model Operating System):

- Definições de MMOS Minds
- Algoritmos DNA Mental
- Dados de treinamento proprietários
- Customizações específicas de parceiros

**Acesso:** Requer NDA e acordo de licenciamento.

### SynkraAI/certified-partners (Proprietário)

Recursos para parceiros AIOX certificados:

- Implementações de squads premium
- Acesso ao portal de parceiros
- Ferramentas de suporte empresarial
- Configurações white-label

**Acesso:** Requer status de parceiro certificado.

---

## Mecanismo de Sincronização

### Dependências Entre Repositórios

```
┌──────────────┐     depende de      ┌──────────────┐
│  aiox-squads │ ──────────────────► │  aiox-core   │
└──────────────┘                     └──────────────┘
       │                                    │
       │                                    │
       │ opcional                           │ opcional
       │                                    │
       ▼                                    ▼
┌──────────────┐                    ┌──────────────┐
│mcp-ecosystem │                    │     mmos     │
└──────────────┘                    └──────────────┘
```

### Compatibilidade de Versões

| aiox-core | aiox-squads | mcp-ecosystem |
| --------- | ----------- | ------------- |
| ^2.1.0    | ^1.0.0      | ^1.0.0        |
| ^3.0.0    | ^2.0.0      | ^1.x.x        |

### Git Submodules (Opcional)

Para projetos que precisam de múltiplos repositórios:

```bash
# Adicionar squads como submódulo
git submodule add https://github.com/SynkraAI/aiox-squads.git squads

# Adicionar ecossistema MCP como submódulo
git submodule add https://github.com/SynkraAI/mcp-ecosystem.git mcp
```

### Dependências npm (Recomendado)

```json
{
  "dependencies": {
    "@aiox/core": "^2.1.0",
    "@aiox/squad-etl": "^1.0.0",
    "@aiox/mcp-presets": "^1.0.0"
  }
}
```

---

## Distribuição de Pacotes

### Escopo de Pacotes npm

| Pacote               | Registry   | Licença        | Repositório   |
| -------------------- | ---------- | -------------- | ------------- |
| `@aiox/core`         | npm public | MIT            | aiox-core     |
| `@aiox/squad-etl`    | npm public | MIT            | aiox-squads   |
| `@aiox/squad-creator`| npm public | MIT            | aiox-squads   |
| `@aiox/squad-mmos`   | npm public | MIT            | aiox-squads   |
| `@aiox/mcp-presets`  | npm public | Apache 2.0     | mcp-ecosystem |

### Workflow de Publicação

```bash
# A partir de aiox-core
npm publish --access public

# A partir de aiox-squads/etl
cd etl && npm publish --access public

# A partir de mcp-ecosystem
npm publish --access public
```

---

## Melhores Práticas

### Para Contribuidores do Núcleo

1. **Mudanças Atômicas** - Mantenha PRs focadas em recursos ou correções únicos
2. **Compatibilidade para Trás** - Evite mudanças breaking em versões menores
3. **Documentação** - Atualize docs no mesmo PR que as mudanças de código
4. **Testes Entre Repositórios** - Teste mudanças contra repositórios dependentes

### Para Desenvolvedores de Squads

1. **Manifesto Primeiro** - Defina squad.yaml antes de implementar
2. **Dependências de Pares** - Especifique requisitos exatos de versão aiox-core
3. **Testes Independentes** - Squads devem ter seus próprios suites de testes
4. **Padrões README** - Inclua exemplos de uso e requisitos

### Para Consumidores de Projetos

1. **Bloquear Versões** - Use versões exatas em produção
2. **Testar Atualizações** - Execute suite de testes completa após atualizar dependências
3. **Monitorar Releases** - Inscreva-se em notificações de release
4. **Relatar Problemas** - Registre issues no repositório correto

### Manutenção de Repositório

| Tarefa                 | Frequência   | Responsabilidade |
| ---------------------- | ------------ | --------------- |
| Atualizações de deps   | Semanal      | DevOps          |
| Auditorias de segurança| Mensal       | DevOps          |
| Releases de versão     | Conforme necessário | Mantenedores |
| Sincronização de docs  | Por release  | Contribuidores  |

---

## Documentos Relacionados

- [Arquitetura de Alto Nível](./high-level-architecture.md)
- [Sistema de Módulos](./module-system.md)
- [Guia de Migração v2.0 para v4.0.4](../migration/migration-guide.md)
- [Guia de Squads](../guides/squads-guide.md)

---

_Última Atualização: 2026-01-28 | Time do Framework AIOX_
