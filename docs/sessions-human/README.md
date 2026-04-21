# Sessions Human — Índice de Sessões

Registro de conversas e decisões para pesquisa futura.

> **Formato dual:** Legível por humanos e acessível a agentes IA.
> **Complemento:** `.aiox/session-digests/` contém digests técnicos para agentes (contexto comprimido, padrões, axiomas).

---

## Como usar

| Quem | Como |
|------|------|
| **Humano** | Navegue por data ou tag abaixo |
| **Agente IA** | Leia este README para orientação, depois leia o arquivo específico |

**Para agentes:** Ao pesquisar sessões passadas, comece por este índice. Filtre por `Tags` para encontrar sessões relevantes ao contexto atual.

---

## Índice de Sessões

| Data | Arquivo | Tópico | Fase | Tipo | Domínio | Agentes |
|------|---------|--------|------|------|---------|---------|
| 2026-03-04 | [startup-organizacao](./2026-03-04-startup-organizacao.md) | Setup inicial e organização do AIOX para startup solo | `fase:setup` | `tipo:organização` | `dominio:sistema` | — |

---

## Template para Nova Sessão

Ao iniciar uma nova sessão relevante, crie um arquivo com o padrão:
```
YYYY-MM-DD-slug-do-topico.md
```

Use o template em [`_template.md`](./_template.md).

---

## Sistema de Tags por Categoria

As tags são organizadas em **4 categorias obrigatórias**. Ao criar uma sessão, aplique **1 tag de cada categoria** que se aplique.

> **Para agentes IA:** Ao registrar uma sessão, analise o conteúdo da conversa e aplique automaticamente as tags corretas de cada categoria com base nas regras abaixo. Não invente tags fora das listadas.

---

### `fase:` — Em qual etapa do ciclo de vida

| Tag | Quando aplicar |
|-----|---------------|
| `fase:setup` | Configuração inicial, onboarding, instalação |
| `fase:descoberta` | Exploração de ideia, brainstorm, pesquisa de mercado |
| `fase:planejamento` | Definição de roadmap, epics, stories, backlog |
| `fase:arquitetura` | Decisões de design de sistema, stack, banco de dados |
| `fase:desenvolvimento` | Implementação de código, features, correções |
| `fase:qualidade` | Testes, QA gates, code review, debugging |
| `fase:deploy` | Push, PR, release, CI/CD |
| `fase:operação` | Monitoramento, ajustes pós-deploy, manutenção |

---

### `tipo:` — Que tipo de atividade foi esta sessão

| Tag | Quando aplicar |
|-----|---------------|
| `tipo:decisão` | Sessão onde decisões importantes foram tomadas |
| `tipo:organização` | Estruturação do sistema, pastas, configurações |
| `tipo:pesquisa` | Research, análise de mercado, estudo de tecnologia |
| `tipo:implementação` | Código foi escrito ou modificado |
| `tipo:revisão` | Review de código, QA, auditoria |
| `tipo:debug` | Investigação e resolução de problemas |
| `tipo:planejamento` | Stories, epics, roadmap definidos |
| `tipo:aprendizado` | Onboarding, entendimento do sistema |

---

### `dominio:` — Qual domínio do produto foi tocado

| Tag | Quando aplicar |
|-----|---------------|
| `dominio:sistema` | AIOX core, configurações, infraestrutura |
| `dominio:produto` | Features do produto/startup sendo desenvolvido |
| `dominio:negocio` | Modelo de negócio, pricing, mercado, validação |
| `dominio:ux` | Interface, UX, design system, fluxos de usuário |
| `dominio:dados` | Banco de dados, schema, migrations, queries |
| `dominio:api` | Endpoints, integrações, contratos de API |
| `dominio:auth` | Autenticação, autorização, segurança |
| `dominio:infra` | CI/CD, deploy, DevOps, servidores |

---

### `agente:` — Quais agentes AIOX foram protagonistas

| Tag | Quando aplicar |
|-----|---------------|
| `agente:pm` | @pm (Morgan) foi ativo na sessão |
| `agente:po` | @po (Pax) foi ativo |
| `agente:sm` | @sm (River) foi ativo |
| `agente:dev` | @dev (Dex) foi ativo |
| `agente:qa` | @qa (Quinn) foi ativo |
| `agente:architect` | @architect (Aria) foi ativo |
| `agente:data-engineer` | @data-engineer (Dara) foi ativo |
| `agente:ux` | @ux-design-expert (Uma) foi ativo |
| `agente:devops` | @devops (Gage) foi ativo |
| `agente:nenhum` | Sessão sem ativação de agente específico |

---

## Regra de Auto-tagueamento para Agentes IA

Ao criar ou atualizar uma sessão em `docs/sessions-human/`, o agente responsável **DEVE**:

1. Ler o conteúdo/contexto da conversa
2. Selecionar **exatamente 1 tag** de cada categoria (`fase:`, `tipo:`, `dominio:`, `agente:`)
3. Registrar no frontmatter do arquivo e no índice deste README
4. Se mais de uma tag de uma categoria se aplicar, listar todas (máx. 2 por categoria)
