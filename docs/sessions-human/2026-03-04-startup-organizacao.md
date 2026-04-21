# Sessão: Setup Inicial — Organização do AIOX para Startup Solo

**Data:** 2026-03-04
**Duração estimada:** ~30min
**Tags:**
- Fase: `fase:setup`
- Tipo: `tipo:organização`
- Domínio: `dominio:sistema`
- Agente: `agente:nenhum`

**Stories relacionadas:** —

---

## Contexto

Primeiro contato do usuário com o AIOX. Está iniciando uma startup sozinho e quer entender como usar os agentes para apoiar o desenvolvimento do produto, além de organizar o sistema para ter registro das conversas para pesquisa futura.

---

## Resumo

Sessão de onboarding onde foram explorados os papéis de cada agente AIOX no contexto de uma startup solo. Foi verificado que o sistema já possui `.aiox/session-digests/` para digests técnicos automáticos, mas não havia nada para visualização humana. Foi criada a estrutura `docs/sessions-human/` para suprir essa necessidade.

---

## Decisões Tomadas

- **Sistema dual de sessões:** Manter `.aiox/session-digests/` para agentes IA (YAML técnico, automático) + `docs/sessions-human/` para visualização humana e pesquisa (Markdown, manual/assistido).
- **Formato docs/sessions-human/:** Markdown legível, mas estruturado o suficiente para agentes IA também usarem como referência.

---

## O que foi criado / modificado

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `docs/sessions-human/README.md` | criado | Índice de sessões com tabela navegável |
| `docs/sessions-human/_template.md` | criado | Template padrão para novas sessões |
| `docs/sessions-human/2026-03-04-startup-organizacao.md` | criado | Esta sessão |

---

## Aprendizados

- O AIOX já possui digests automáticos em `.aiox/session-digests/` (gitignored, técnico, YAML).
- Esses digests são gerados pelo PreCompact hook antes do context compact — não por tópico, mas por limite de contexto.
- A lacuna era: registro **intencional** por tópico, legível por humano, versionado no repositório.

---

## Mapa de Agentes para Startup Solo

| Fase | Agente | Uso Principal |
|------|--------|--------------|
| Validação de ideia | `@pm`, `@analyst` | PRD, pesquisa de mercado |
| Arquitetura | `@architect`, `@data-engineer` | Stack, schema, design técnico |
| Planejamento | `@sm`, `@po` | Stories, backlog, critérios |
| Desenvolvimento | `@dev` | Implementação e testes |
| Qualidade | `@qa` | Review e quality gates |
| Deploy | `@devops` | Push, PRs, CI/CD (exclusivo) |
| UX/UI | `@ux-design-expert` | Interfaces e design system |

---

## Próximos Passos

- [ ] Definir a ideia/produto da startup para começar com `@pm *create-epic`
- [ ] Decidir stack tecnológica com `@architect`

---

## Links e Referências

- Sistema de session digests: [`.aiox/session-digests/README.md`](../../.aiox/session-digests/README.md)
- Fluxo de agentes: [`docs/aiox-agent-flows/`](../aiox-agent-flows/)
