# Roadmap do AIOX

> 🇺🇸 [English Version](ROADMAP.md)

Este documento descreve a direção de desenvolvimento planejada para o AIOX.

> Para rastreamento detalhado, veja nosso [Projeto GitHub](https://github.com/orgs/SynkraAI/projects/1)

## Visão

O AIOX visa ser o framework de agentes IA open-source mais abrangente, permitindo que desenvolvedores construam aplicações sofisticadas com equipes de agentes especializados (Squads) e integração perfeita com IDEs.

## Foco Atual (Q1 2026)

### Release v4.2

Estabilização do framework principal e infraestrutura da comunidade:

- [x] Instalador híbrido (npx + assistente interativo)
- [x] Arquitetura de 4 módulos (Core, Squads, Ecossistema MCP, Premium)
- [x] Sistema de Service Discovery
- [x] Quality Gates (3 camadas: pre-commit, pre-push, CI/CD)
- [x] Template Engine
- [x] Integração CodeRabbit para revisão de código automatizada
- [ ] Infraestrutura de comunidade open-source (em progresso)

### Construção da Comunidade

- [x] Configuração do GitHub Discussions
- [x] Guias de contribuição (CONTRIBUTING.md, COMMUNITY.md)
- [x] Processo de solicitação de features (FEATURE_PROCESS.md)
- [x] Roadmap público (este documento!)
- [ ] Registro de Squads

## Próximos Passos (Q2 2026)

### Planejamento v2.2

- Implementação do Memory Layer para persistência de contexto de agentes
- Capacidades aprimoradas de colaboração entre agentes
- Otimizações de performance para grandes codebases
- Tratamento de erros e recuperação aprimorados

### Features da Comunidade

- Marketplace de Squads (equipes de agentes contribuídas pela comunidade)
- Sistema de reconhecimento de contribuidores
- Suporte a tradução (PT-BR prioridade)

## Exploração Futura

Estes itens estão sendo explorados mas ainda não confirmados:

- Suporte multi-idioma para definições de agentes
- Opções de deploy em cloud para equipes distribuídas
- Construtor visual de workflows para usuários não técnicos
- Marketplace de plugins para integrações de terceiros
- Analytics e telemetria aprimorados (opt-in)

## Como Influenciar o Roadmap

Aceitamos contribuição da comunidade sobre nossa direção! Veja como participar:

### 1. Vote em Ideias

Reaja com :+1: em [Ideias nas Discussões](https://github.com/SynkraAI/aiox-core/discussions/categories/ideas) existentes para mostrar apoio.

### 2. Proponha Features

Tem uma nova ideia? Abra uma [Discussão de Ideia](https://github.com/SynkraAI/aiox-core/discussions/new?category=ideas) para compartilhar com a comunidade.

### 3. Escreva um RFC

Para features significativas que precisam de design detalhado, [submeta um RFC](/.github/RFC_TEMPLATE.md) seguindo nosso processo estruturado.

### 4. Contribua Diretamente

Encontrou algo que quer implementar? Veja nosso [Guia de Contribuição](CONTRIBUTING-PT.md) e [Processo de Features](docs/FEATURE_PROCESS.md).

## Changelog

Para o que já foi entregue, veja [CHANGELOG.md](CHANGELOG.md).

## Processo de Atualização

Este roadmap é revisado e atualizado mensalmente pelos mantenedores do projeto.

**Processo:**
1. Revisar progresso nos itens atuais
2. Atualizar status de itens concluídos/em progresso
3. Adicionar features recém-aprovadas das discussões da comunidade
4. Remover itens cancelados ou despriorizados
5. Comunicar mudanças significativas via [Anúncios](https://github.com/SynkraAI/aiox-core/discussions/categories/announcements)

**Responsáveis:** Agentes @pm (Morgan) ou @po (Pax), com supervisão dos mantenedores.

### Sincronização com Backlog Interno

Este roadmap público é sincronizado com nosso planejamento interno de sprints:

| Roadmap Público | Rastreamento Interno |
|-----------------|---------------------|
| [Projeto GitHub](https://github.com/orgs/SynkraAI/projects/1) | `docs/stories/backlog.md` |
| Features de alto nível | Stories detalhadas por sprint |
| Timeline trimestral | Execução baseada em sprints |

**Checklist de Sincronização (Mensal):**
- [ ] Revisar sprints concluídos em `docs/stories/v4.0.4/`
- [ ] Atualizar status dos itens do Projeto GitHub (Done/In Progress)
- [ ] Adicionar novas features aprovadas do backlog ao Projeto
- [ ] Atualizar este ROADMAP.md com o progresso mais recente

## Aviso Legal

Este roadmap representa nossos planos atuais e está sujeito a mudanças baseadas em feedback da comunidade, restrições técnicas e prioridades estratégicas. Datas são trimestres estimados, não compromissos. Usamos trimestres em vez de datas específicas para manter flexibilidade enquanto fornecemos visibilidade sobre nossa direção.

---

*Última atualização: 2025-12-15*
