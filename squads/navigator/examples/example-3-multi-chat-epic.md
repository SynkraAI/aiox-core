# Exemplo 3: Orquestracao de Epic Multi-Chat

Este exemplo mostra como usar o Navigator para orquestrar execucao paralela de um epic em multiplas sessoes de chat do Claude Code.

---

## Contexto

**Projeto:** Dashboard de Analytics SaaS
**Epic:** Epic 3.2 - Modulo de Reporting Avancado
**Stories:** 12 stories com dependencias complexas
**Time:** Desenvolvedor solo (mas quer execucao paralela)
**Desafio:** Executar multiplas stories simultaneamente sem conflitos

---

## Problema: Gargalo Sequencial

**Abordagem tradicional:**
```
Story 1 (4 horas) → Story 2 (3 horas) → Story 3 (5 horas) → ...
Tempo total: 36 horas (sequencial)
```

**Com orquestracao multi-chat:**
```
Wave 1: Stories 1, 2, 3 (paralelo - 5 horas max)
Wave 2: Stories 4, 5, 6 (paralelo - 4 horas max)
Wave 3: Stories 7, 8, 9 (paralelo - 6 horas max)
Wave 4: Stories 10, 11, 12 (paralelo - 3 horas max)

Tempo total: 18 horas (50% mais rapido)
```

---

## Solucao: Orquestracao Multi-Chat

### Passo 1: Carregar Arquivo do Epic

Arquivo do epic em `docs/epics/epic-3.2-advanced-reporting.md`:

```markdown
---
id: epic-3.2
title: Advanced Reporting Module
status: in-progress
---

# Epic 3.2: Advanced Reporting Module

## Stories

### Story 3.2.1: Custom Report Builder UI
**Dependencies:** None
**Estimate:** 5 hours
**Status:** pending

### Story 3.2.2: Report Template System
**Dependencies:** None
**Estimate:** 4 hours
**Status:** pending

### Story 3.2.3: Data Export (CSV/PDF)
**Dependencies:** None
**Estimate:** 3 hours
**Status:** pending

### Story 3.2.4: Report Scheduling
**Dependencies:** Story 3.2.1, Story 3.2.2
**Estimate:** 4 hours
**Status:** pending

### Story 3.2.5: Email Report Delivery
**Dependencies:** Story 3.2.4
**Estimate:** 3 hours
**Status:** pending

### Story 3.2.6: Report Analytics Dashboard
**Dependencies:** Story 3.2.1
**Estimate:** 4 hours
**Status:** pending

### Story 3.2.7: Saved Reports Library
**Dependencies:** Story 3.2.2
**Estimate:** 3 hours
**Status:** pending

### Story 3.2.8: Report Sharing & Permissions
**Dependencies:** Story 3.2.7
**Estimate:** 5 hours
**Status:** pending

### Story 3.2.9: Chart Visualizations
**Dependencies:** Story 3.2.1
**Estimate:** 6 hours
**Status:** pending

### Story 3.2.10: Report Caching Layer
**Dependencies:** Story 3.2.4, Story 3.2.6
**Estimate:** 4 hours
**Status:** pending

### Story 3.2.11: Advanced Filters
**Dependencies:** Story 3.2.1, Story 3.2.9
**Estimate:** 5 hours
**Status:** pending

### Story 3.2.12: Report API Endpoints
**Dependencies:** Story 3.2.10
**Estimate:** 3 hours
**Status:** pending
```

---

### Passo 2: Rodar Comando Orchestrate

```bash
@navigator
*orchestrate epic-3.2
```

**Navigator analisa dependencias:**
```
🎭 Analisando Epic 3.2: Advanced Reporting Module

📊 Total de Stories: 12
📈 Grafo de Dependencias:

Wave 1 (Sem dependencias - pode comecar imediatamente):
  ├─ Story 3.2.1: Custom Report Builder UI
  ├─ Story 3.2.2: Report Template System
  └─ Story 3.2.3: Data Export (CSV/PDF)

Wave 2 (Depende da Wave 1):
  ├─ Story 3.2.4: Report Scheduling (precisa 3.2.1, 3.2.2)
  ├─ Story 3.2.6: Report Analytics Dashboard (precisa 3.2.1)
  ├─ Story 3.2.7: Saved Reports Library (precisa 3.2.2)
  └─ Story 3.2.9: Chart Visualizations (precisa 3.2.1)

Wave 3 (Depende da Wave 2):
  ├─ Story 3.2.5: Email Report Delivery (precisa 3.2.4)
  ├─ Story 3.2.8: Report Sharing (precisa 3.2.7)
  ├─ Story 3.2.10: Report Caching (precisa 3.2.4, 3.2.6)
  └─ Story 3.2.11: Advanced Filters (precisa 3.2.1, 3.2.9)

Wave 4 (Depende da Wave 3):
  └─ Story 3.2.12: Report API Endpoints (precisa 3.2.10)

⏱️  Tempo Estimado:
  Sequential: 36 horas
  Paralelo (4 chats): 18 horas
  Speedup: 50% mais rapido

✅ Plano de orquestracao pronto!
```

---

### Passo 3: Navigator Gera Prompts de Chat

Navigator cria 4 prompts para execucao paralela:

**Chat 1 (Coordenador):**
```markdown
# Chat 1: Epic Coordinator (@sm)

Voce e o Scrum Master coordenando Epic 3.2 (Advanced Reporting Module).

## Suas Responsabilidades:
1. Monitorar progresso em 3 chats de dev
2. Aprovar transicoes de wave (Wave 1 → Wave 2 → Wave 3 → Wave 4)
3. Resolver conflitos de merge
4. Realizar merge de integracao final

## Ordem de Execucao de Waves:

### Wave 1: Comecar Imediatamente
Dev Chat 2 vai executar:
- Story 3.2.1: Custom Report Builder UI
- Story 3.2.2: Report Template System
- Story 3.2.3: Data Export (CSV/PDF)

Aguardar Dev Chat 2 completar TODAS stories da Wave 1 antes de aprovar Wave 2.

### Wave 2: Apos Wave 1 Completa
Dev Chat 3 vai executar:
- Story 3.2.4: Report Scheduling
- Story 3.2.6: Report Analytics Dashboard
- Story 3.2.7: Saved Reports Library
- Story 3.2.9: Chart Visualizations

Aguardar Dev Chat 3 completar TODAS stories da Wave 2 antes de aprovar Wave 3.

### Wave 3: Apos Wave 2 Completa
Dev Chat 4 vai executar:
- Story 3.2.5: Email Report Delivery
- Story 3.2.8: Report Sharing
- Story 3.2.10: Report Caching
- Story 3.2.11: Advanced Filters

Aguardar Dev Chat 4 completar TODAS stories da Wave 3 antes de aprovar Wave 4.

### Wave 4: Apos Wave 3 Completa
Dev Chat 2 (reutilizar) vai executar:
- Story 3.2.12: Report API Endpoints

### Integracao Final:
Apos Wave 4, realizar merge:
1. Pull de todos branches
2. Resolver conflitos (se houver)
3. Rodar suite completa de testes
4. Criar PR de conclusao de epic

## Protocolo de Comunicacao:
- Dev chats vao reportar conclusao via arquivos markdown em .aios/orchestration/
- Checar .aios/orchestration/wave-{N}-status.md para updates
- NAO prosseguir para proxima wave ate wave atual mostrar 100% completo

Pronto para comecar! Avisar Dev Chat 2 para comecar Wave 1.
```

---

**Chat 2 (Dev - Wave 1 & 4):**
```markdown
# Chat 2: Development - Wave 1 & 4 (@dev)

Voce e @dev executando stories da Wave 1 para Epic 3.2.

## Suas Stories (Wave 1):

### Story 3.2.1: Custom Report Builder UI (5 horas)
- Criar componente de report builder drag-and-drop
- Permitir usuarios selecionarem fontes de dados
- Configurar colunas, filtros, ordenacao
- Preview de relatorio antes de salvar

**Criterios de Aceitacao:**
- Componente em src/components/ReportBuilder.tsx
- Integracao com backend API
- Testes unitarios (80% coverage)
- Documentacao Storybook

---

### Story 3.2.2: Report Template System (4 horas)
- Criar templates de relatorio reutilizaveis
- Operacoes CRUD de templates
- Versionamento de templates
- Templates default (Vendas, Atividade de Usuario, etc.)

**Criterios de Aceitacao:**
- Endpoints de backend API para templates
- Schema de banco de dados para tabela templates
- Seletor de templates no frontend
- Testes unitarios + integracao

---

### Story 3.2.3: Data Export (CSV/PDF) (3 horas)
- Exportar dados de relatorio para CSV
- Exportar relatorio para PDF com branding
- Botao de download no visualizador de relatorio
- Indicador de progresso para exportacoes grandes

**Criterios de Aceitacao:**
- Exportacao CSV com encoding apropriado
- Exportacao PDF usando biblioteca (pdfmake ou similar)
- Testes unitarios para logica de exportacao
- Teste E2E para fluxo de download

---

## Estrategia de Branch:
Criar branches:
- feat/epic-3.2-story-1-report-builder
- feat/epic-3.2-story-2-templates
- feat/epic-3.2-story-3-export

Trabalhar em stories em paralelo usando git worktrees se possivel.

## Quando Completo:
1. Commitar todas mudancas
2. Rodar testes: `npm test`
3. Criar status report em .aios/orchestration/wave-1-status.md:
   ```markdown
   # Wave 1 Status: COMPLETE
   - Story 3.2.1: ✅ Complete
   - Story 3.2.2: ✅ Complete
   - Story 3.2.3: ✅ Complete
   Test Results: All passing
   ```
4. Notificar Chat 1 (Coordenador) que Wave 1 esta completa

---

## Apos Wave 3 Completa:
Voce sera assignado Story 3.2.12 (Wave 4). Aguardar aprovacao do Chat 1.

Pronto? Comecar execucao da Wave 1! 🚀
```

---

**Chat 3 (Dev - Wave 2):**
```markdown
# Chat 3: Development - Wave 2 (@dev)

Voce e @dev executando stories da Wave 2 para Epic 3.2.

⚠️ **IMPORTANTE:** NAO comece ate Chat 1 (Coordenador) confirmar que Wave 1 esta completa!

## Suas Stories (Wave 2):

### Story 3.2.4: Report Scheduling (4 horas)
**Dependencies:** Precisa Story 3.2.1 (Report Builder) e 3.2.2 (Templates)

- Agendar relatorios para rodarem automaticamente (diario, semanal, mensal)
- Sistema de cron job para relatorios agendados
- Notificacoes de email quando relatorio estiver pronto
- Suporte a timezone

**Criterios de Aceitacao:**
- Scheduler backend usando node-cron ou similar
- Schema de banco de dados para tabela scheduled_reports
- UI frontend para configurar agendamentos
- Testes para logica de scheduling

---

### Story 3.2.6: Report Analytics Dashboard (4 horas)
**Dependencies:** Precisa Story 3.2.1 (Report Builder)

- Dashboard mostrando metricas de uso de relatorios
- Relatorios mais visualizados
- Tempos de execucao de relatorios
- Analytics de engajamento de usuarios

**Criterios de Aceitacao:**
- Tracking de analytics em views de relatorio
- Componente de dashboard com graficos
- Endpoint backend para dados de analytics
- Updates em tempo real com WebSockets

---

### Story 3.2.7: Saved Reports Library (3 horas)
**Dependencies:** Precisa Story 3.2.2 (Templates)

- Biblioteca de relatorios salvos por usuario
- Organizar relatorios em pastas
- Buscar e filtrar relatorios salvos
- Acesso rapido a relatorios usados frequentemente

**Criterios de Aceitacao:**
- Schema de banco de dados para tabela saved_reports
- API CRUD para relatorios salvos
- Componente de biblioteca frontend com pastas
- Testes unitarios + integracao

---

### Story 3.2.9: Chart Visualizations (6 horas)
**Dependencies:** Precisa Story 3.2.1 (Report Builder)

- Adicionar tipos de grafico: barra, linha, pizza, area
- Graficos interativos com drill-down
- Exportar graficos como imagens
- Design responsivo para mobile

**Criterios de Aceitacao:**
- Integracao com biblioteca de graficos (Chart.js, Recharts, etc.)
- Configuracao de grafico no report builder
- Exportar graficos para PNG/SVG
- Testes E2E para renderizacao de graficos

---

## Estrategia de Branch:
Criar branches:
- feat/epic-3.2-story-4-scheduling
- feat/epic-3.2-story-6-analytics
- feat/epic-3.2-story-7-library
- feat/epic-3.2-story-9-charts

## Quando Completo:
1. Commitar todas mudancas
2. Rodar testes: `npm test`
3. Criar status report em .aios/orchestration/wave-2-status.md
4. Notificar Chat 1 (Coordenador) que Wave 2 esta completa

Aguardar aprovacao do Chat 1 antes de comecar! ⏸️
```

---

**Chat 4 (Dev - Wave 3):**
```markdown
# Chat 4: Development - Wave 3 (@dev)

Voce e @dev executando stories da Wave 3 para Epic 3.2.

⚠️ **IMPORTANTE:** NAO comece ate Chat 1 (Coordenador) confirmar que Wave 2 esta completa!

## Suas Stories (Wave 3):

### Story 3.2.5: Email Report Delivery (3 horas)
**Dependencies:** Precisa Story 3.2.4 (Scheduling)

- Enviar relatorios via email no agendamento
- Templates de email para entrega de relatorio
- Suporte a anexos (PDF, CSV)
- Tracking de status de entrega de email

---

### Story 3.2.8: Report Sharing & Permissions (5 horas)
**Dependencies:** Precisa Story 3.2.7 (Saved Reports)

- Compartilhar relatorios com outros usuarios
- Niveis de permissao (view, edit, admin)
- Geracao de link publico para compartilhamento externo
- Funcionalidade de revogar acesso

---

### Story 3.2.10: Report Caching Layer (4 horas)
**Dependencies:** Precisa Story 3.2.4 (Scheduling) e 3.2.6 (Analytics)

- Cache de resultados de relatorios para carregamento mais rapido
- Estrategia de invalidacao (baseada em tempo, on-demand)
- Dashboard de estatisticas de cache
- Implementacao Redis ou cache em memoria

---

### Story 3.2.11: Advanced Filters (5 horas)
**Dependencies:** Precisa Story 3.2.1 (Builder) e 3.2.9 (Charts)

- Condicoes de filtro complexas (logica AND/OR)
- Filtros de range de data com presets
- Filtros dropdown multi-select
- Salvar presets de filtros

---

## Estrategia de Branch:
Criar branches para cada story.

## Quando Completo:
Criar status report em .aios/orchestration/wave-3-status.md
Notificar Chat 1 (Coordenador).

Aguardar aprovacao do Chat 1 antes de comecar! ⏸️
```

---

### Passo 4: Executar em Paralelo

**Abrir 4 chats do Claude Code** e colar os prompts acima.

**Timeline de Execucao:**
```
Hora 0: Chat 2 comeca Wave 1 (Stories 1, 2, 3)
Hora 5: Chat 2 completa Wave 1
Hora 5: Chat 1 aprova Wave 2
Hora 5: Chat 3 comeca Wave 2 (Stories 4, 6, 7, 9)
Hora 11: Chat 3 completa Wave 2
Hora 11: Chat 1 aprova Wave 3
Hora 11: Chat 4 comeca Wave 3 (Stories 5, 8, 10, 11)
Hora 17: Chat 4 completa Wave 3
Hora 17: Chat 1 aprova Wave 4
Hora 17: Chat 2 comeca Wave 4 (Story 12)
Hora 20: Chat 2 completa Wave 4
Hora 20: Chat 1 realiza merge final

Total: 20 horas (vs 36 horas sequencial)
```

---

### Passo 5: Coordenador Faz Merge de Todas Waves

**Chat 1 (Coordenador) merge final:**

```bash
# Pull de todos branches
git fetch --all

# Merge Wave 1
git merge feat/epic-3.2-story-1-report-builder
git merge feat/epic-3.2-story-2-templates
git merge feat/epic-3.2-story-3-export

# Merge Wave 2
git merge feat/epic-3.2-story-4-scheduling
git merge feat/epic-3.2-story-6-analytics
git merge feat/epic-3.2-story-7-library
git merge feat/epic-3.2-story-9-charts

# Merge Wave 3
git merge feat/epic-3.2-story-5-email
git merge feat/epic-3.2-story-8-sharing
git merge feat/epic-3.2-story-10-caching
git merge feat/epic-3.2-story-11-filters

# Merge Wave 4
git merge feat/epic-3.2-story-12-api

# Rodar suite completa de testes
npm test

# Criar branch de conclusao de epic
git checkout -b epic/epic-3.2-advanced-reporting-complete
git push origin epic/epic-3.2-advanced-reporting-complete
```

---

## Resultados

**Epic 3.2 Completo:**
- ✅ 12 stories implementadas
- ✅ Todos testes passando
- ✅ Tempo: 20 horas (vs 36 horas)
- ✅ Economia: 44% mais rapido
- ✅ Sem conflitos de merge (gracas a orquestracao)

---

## Principais Aprendizados

1. **Execucao paralela e poderosa** - Corta tempo quase pela metade
2. **Analise de dependencias previne conflitos** - Navigator detecta dependencias automaticamente
3. **Estrutura de wave garante corretude** - Cada wave construi sobre a anterior
4. **Papel de coordenador e critico** - Previne caos, garante qualidade
5. **Funciona para devs solo tambem** - Voce pode orquestrar seu proprio trabalho em sessoes

---

## Dicas Pro

- Use git worktrees para desenvolvimento verdadeiramente paralelo
- Configure CI/CD para testar cada wave independentemente
- Coordenador deve revisar codigo entre waves
- Documentar decisoes no diretorio .aios/orchestration/
- Reutilizar prompts para futuros epics (templates)

---

## Quando Usar Orquestracao Multi-Chat

**Bom para:**
- Epics grandes (8+ stories)
- Stories com dependencias claras
- Projetos time-sensitive
- Aprender a trabalhar em paralelo

**Nao bom para:**
- Epics pequenos (< 5 stories)
- Stories altamente interdependentes (sequencial e melhor)
- Trabalho exploratorio (direcao pouco clara)

---

*Exemplo completado em 2026-02-15 usando Navigator v1.0.0*
