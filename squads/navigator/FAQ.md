# FAQ do Navigator (Perguntas Frequentes)

Perguntas comuns sobre o squad Navigator.

---

## Questoes Gerais

### O que e o Navigator?

Navigator é um squad autônomo de navegação e orquestração de projetos para AIOS. Ele te ajuda a:
- Nunca perder o rumo em projetos complexos
- Mapear roadmaps completos a partir de descrições de projeto
- Detectar a fase atual automaticamente
- Orquestrar workflows multi-agente
- Retomar o trabalho instantaneamente após pausas

---

### Preciso do Navigator para todo projeto?

**Recomendado para:**
- ✅ Projetos complexos (> 20 stories)
- ✅ Projetos multi-fase (pesquisa → design → dev → deploy)
- ✅ Projetos em equipe (múltiplos desenvolvedores)
- ✅ Projetos de longo prazo (semanas a meses)

**Não necessário para:**
- ❌ Scripts de arquivo único
- ❌ Provas de conceito (< 100 linhas)
- ❌ Correções simples de bugs
- ❌ Tarefas pontuais

---

### O Navigator e apenas para projetos novos?

Não! Navigator funciona para:
- **Greenfield** (projetos novos) - Mapeia roadmap do zero
- **Brownfield** (projetos existentes) - Detecta fase atual a partir dos arquivos
- **Projetos em andamento** - Retoma de onde você parou

---

## Primeiros Passos

### Como instalo o Navigator?

Navigator está incluído no AIOS Core. Apenas ative:

```bash
@navigator
*navigator-doctor  # Verifica instalação
```

Veja [QUICKSTART.md](./QUICKSTART.md) para configuração completa.

---

### Quais sao os prerequisitos?

- AIOS Core >= 4.0.0
- Node.js >= 18.0.0
- Git
- Pacotes NPM: `js-yaml`, `glob`, `inquirer`

---

### Quanto tempo demora a configuracao inicial?

- **Primeira configuração:** 5 minutos (incluindo health check)
- **Mapear projeto novo:** 2-3 minutos
- **Checar status:** 5 segundos

---

## Usando o Navigator

### Como o `*where-am-i` sabe minha fase atual?

Navigator analisa:
1. **Arquivos de output** - Checa quais outputs de fase existem
2. **Status da story** - Faz parse do front-matter YAML dos arquivos de story
3. **Histórico git** - Olha commits recentes
4. **Dados de checkpoint** - Lê último checkpoint (se existir)

Depois ele compara com o pipeline de 10 fases para determinar a posição.

---

### Qual a diferenca entre `*where-am-i` e `*status-report`?

| Comando | Output | Quando Usar |
|---------|--------|-------------|
| `*where-am-i` | Resumo rápido (30 segundos) | Check-ins diários |
| `*status-report` | Relatório detalhado (2-3 minutos) | Reuniões semanais, updates de stakeholders |

---

### Posso customizar o pipeline de 10 fases?

Sim! Edite `data/navigator-pipeline-map.yaml`:

```yaml
phases:
  - id: 1
    name: "Sua Fase Customizada"
    agent: "@seu-agente"
    outputs:
      - "seu/caminho/customizado/*.md"
```

Veja [example-roadmap.md](./examples/example-roadmap.md) para detalhes.

---

### E se meu projeto nao se encaixa nas 10 fases?

Você pode:
1. **Adaptar o pipeline** - Customize `navigator-pipeline-map.yaml`
2. **Pular fases** - Use regras de transição para pular fases desnecessárias
3. **Adicionar fases** - Estenda além de 10 se necessário
4. **Fundir fases** - Combine fases (ex: fundir Epics + Stories)

---

## Roadmaps

### Onde os roadmaps sao armazenados?

Dois locais (sincronizados automaticamente):
- **Central:** `.aios/navigator/{project-name}/roadmap.md`
- **Local:** `docs/roadmap.md` (para controle de versão)

A sincronização bidirecional mantém eles sincronizados.

---

### Posso editar roadmaps manualmente?

Sim! Edite `docs/roadmap.md` e faça commit:

```bash
vim docs/roadmap.md
git commit -m "Update roadmap"
# Hook post-commit sincroniza automaticamente para o central
```

---

### O que acontece se os roadmaps entrarem em conflito?

Navigator pede para você escolher:
```
⚠️  Conflito de roadmap detectado!
Central: modificado em 2026-02-15 14:30
Local: modificado em 2026-02-15 16:45

Qual versão manter? (central/local)
```

Você também pode:
- Definir `NAVIGATOR_AUTO_MODE=true` para resolução automática (mais recente ganha)
- Fundir ambos arquivos manualmente

---

### Posso ter multiplos roadmaps por projeto?

Sim, mas apenas um roadmap "ativo". Casos de uso:
- **Roadmap principal:** Plano de desenvolvimento atual
- **Roadmaps arquivados:** Versões históricas
- **Roadmaps alternativos:** Abordagens diferentes (compare antes de escolher)

Armazene alternativas no diretório `docs/roadmaps/`.

---

## Checkpoints

### Quando devo criar checkpoints?

**Checkpoints automáticos** (via git hooks):
- Após cada git commit
- Quando fase completa

**Checkpoints manuais** (rode `*checkpoint`):
- Antes de refatorações grandes
- Antes de mudanças arriscadas
- Fim do dia (para salvar progresso)
- Antes de férias/pausas

---

### Quantos checkpoints posso ter?

Ilimitados. Mas Navigator só mostra os 10 mais recentes por padrão.

Projeto típico: 20-50 checkpoints durante o ciclo de vida.

---

### Posso restaurar de um checkpoint?

Sim (feature planejada para v2.0). Atualmente checkpoints são:
- **Referência:** Ver o que foi feito quando
- **Recuperação:** Inspecionar manualmente o JSON do checkpoint para entender o estado

---

### Checkpoints incluem codigo?

Não. Checkpoints armazenam:
- Metadados (fase, stories, % de conclusão)
- SHA do commit git (referência ao código)
- Listas de arquivos e métricas

Para restaurar código, use git:
```bash
# Pegar SHA do commit do checkpoint
cat .aios/navigator/{project}/checkpoints/cp-X.json | jq .git.commit

# Restaurar código
git checkout <commit-sha>
```

---

## Orquestracao Multi-Chat

### O que e orquestracao multi-chat?

Executar múltiplas stories simultaneamente através de sessões de chat paralelas do Claude Code.

**Exemplo:**
- Chat 1: Coordenador (@sm) gerencia workflow
- Chat 2: Dev implementa stories da Wave 1 (3 stories)
- Chat 3: Dev implementa stories da Wave 2 (4 stories)
- Chat 4: Dev implementa stories da Wave 3 (3 stories)

Veja [example-3](./examples/example-3-multi-chat-epic.md) para walkthrough.

---

### Quando devo usar orquestracao?

**Bom para:**
- Epics grandes (8+ stories)
- Stories com dependências claras
- Projetos com prazo apertado (quer 50% mais velocidade)

**Não bom para:**
- Epics pequenos (< 5 stories)
- Stories altamente interdependentes (sequencial é melhor)
- Trabalho exploratório (direção não clara)

---

### Como o Navigator previne conflitos de merge?

Analisando dependências e agrupando stories em "waves":
- **Wave 1:** Sem dependências (paralelo seguro)
- **Wave 2:** Depende da Wave 1 (espera aprovação)
- **Wave 3:** Depende da Wave 2 (espera aprovação)

Cada wave trabalha em arquivos independentes, minimizando conflitos.

---

## Solucao de Problemas

### `*where-am-i` retorna fase errada. Por que?

Causas comuns:
1. **Arquivos de output não batem com os padrões do pipeline**
   - Correção: Atualize os outputs em `navigator-pipeline-map.yaml`
2. **Arquivos de story sem front-matter YAML**
   - Correção: Adicione `status: pending|in-progress|completed` nas stories
3. **Roadmap antigo em cache**
   - Correção: Rode `*update-roadmap --force-sync`

Veja [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) para detalhes.

---

### A sincronizacao de roadmap continua falhando. Socorro!

Verifique:
```bash
# 1. Git hooks instalados?
ls .husky/post-commit

# 2. Hook tem linha do Navigator?
grep "post-commit-hook.js" .husky/post-commit

# 3. Teste de sincronização manual
node squads/navigator/scripts/roadmap-sync.js
```

---

### Checkpoints nao estao sendo criados automaticamente

Verifique:
```bash
# Git hooks instalados?
*navigator-doctor | grep "Git Hooks"

# Se falhou:
node squads/navigator/scripts/install-hooks.js install
```

---

## Uso Avancado

### O Navigator funciona com CI/CD?

Sim! Detecção de fase pode disparar CI/CD:

```yaml
# .github/workflows/phase-check.yml
on: push
jobs:
  check-phase:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: |
          PHASE=$(node -e "
            const { detectPhase } = require('./squads/navigator/scripts/navigator/phase-detector');
            detectPhase().then(p => console.log(p.id));
          ")
          echo "Current phase: $PHASE"

          if [ "$PHASE" -eq 8 ]; then
            echo "Running QA tests..."
            npm test
          fi
```

---

### Posso integrar o Navigator com Jira/Linear?

Não diretamente, mas você pode:
1. Exportar relatórios de status: `*status-report --format json > status.json`
2. Fazer parse do JSON e sincronizar com Jira via API
3. Usar mensagens de commit git para referenciar tickets do Jira

Integração planejada para v2.0.

---

### O Navigator pode sugerir ordem otima de fases?

Ainda não. Atualmente usa pipeline fixo de 10 fases.

Planejado para v2.0: otimização de pipeline baseada em IA conforme tipo de projeto.

---

### O Navigator rastreia tempo gasto por fase?

Sim, nos checkpoints:
```json
{
  "metrics": {
    "timeTracking": {
      "phaseStarted": "2026-02-08T08:00:00Z",
      "currentDuration": "7 days 6 hours"
    }
  }
}
```

UI de dashboard para rastreamento de tempo planejada para v2.0.

---

## Performance

### O Navigator e lento em projetos grandes?

Navigator escala bem até:
- 1.000 arquivos de story
- 10.000 arquivos de código
- 100 checkpoints

Se mais lento que 5 segundos, veja [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#performance-issues).

---

### O Navigator usa IA/LLMs?

Não. Navigator usa:
- Pattern matching de arquivos (glob)
- Parse de YAML
- Operações git

Isso o torna rápido, determinístico e capaz de funcionar offline.

---

## Contribuindo

### Como posso contribuir?

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para:
- Contribuições de código
- Melhorias na documentação
- Relatórios de bugs
- Solicitações de features

---

### Posso criar tasks customizadas para o Navigator?

Sim! Siga este template:

```markdown
<!-- tasks/nav-your-task.md -->
# *your-task

## Purpose
O que essa task faz

## Inputs
- O que ela precisa

## Outputs
- O que ela produz

## Steps
1. Passo 1
2. Passo 2

## Example
Exemplo de uso
```

Depois adicione em `squad.yaml` e submeta um PR.

---

## Licenciamento

### O Navigator e gratuito?

Sim! Navigator tem licença MIT (livre e open source).

---

### Posso usar o Navigator comercialmente?

Sim. A licença MIT permite:
- ✅ Uso comercial
- ✅ Modificação
- ✅ Distribuição
- ✅ Uso privado

Veja [LICENSE](./LICENSE) para detalhes.

---

## Suporte

### Onde consigo ajuda?

1. **Documentação:** [README.md](./README.md), [QUICKSTART.md](./QUICKSTART.md)
2. **Exemplos:** [examples/](./examples/)
3. **Troubleshooting:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
4. **GitHub Issues:** https://github.com/SynkraAI/aios-core/issues
5. **Discussions:** https://github.com/SynkraAI/aios-core/discussions

---

### Como reporto bugs?

**Antes de reportar:**
1. Cheque [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Busque issues existentes
3. Rode `*navigator-doctor` para verificar configuração

**Ao reportar:**
1. Vá para: https://github.com/SynkraAI/aios-core/issues/new
2. Inclua:
   - Mensagem de erro (texto completo)
   - Passos para reproduzir
   - Output do `*navigator-doctor`
   - Ambiente (SO, versão do Node)

---

### Com que frequencia o Navigator e atualizado?

- **Correções de bugs:** Conforme necessário (patch releases)
- **Features:** A cada 2-3 meses (minor releases)
- **Breaking changes:** Uma vez por ano (major releases)

Veja [CHANGELOG.md](./CHANGELOG.md) para histórico de versões.

---

## Roadmap

### O que esta planejado para o Navigator 2.0?

**Features planejadas:**
- Dashboard UI para rastreamento visual de progresso
- Restauração de checkpoints
- Sugestões de roadmap baseadas em IA
- Biblioteca de templates de pipeline customizados
- Orquestração multi-projeto
- Integração de rastreamento de tempo
- Notificações Slack/Discord
- Geração de gráfico de Gantt

Veja [CHANGELOG.md](./CHANGELOG.md#unreleased) para detalhes.

---

### Quando o 2.0 sera lancado?

Estimativa: Q3 2026

Acompanhe o progresso no GitHub: https://github.com/SynkraAI/aios-core/projects

---

## Ainda Tem Duvidas?

**Pergunte no GitHub Discussions:** https://github.com/SynkraAI/aios-core/discussions

Normalmente respondemos em 24-48 horas.

---

*FAQ do Navigator v1.0 - Ultima atualizacao 2026-02-20*
