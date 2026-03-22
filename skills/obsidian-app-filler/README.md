---
name: obsidian-app-filler
version: 1.0.0
trigger: "/preencher-app"
description: "Preenche automaticamente notas de apps do Obsidian baseado no PRD fornecido"
category: productivity
author: "AIOS Core"
tags:
  - obsidian
  - automation
  - prd
  - app-development
---

# 📝 Obsidian App Filler

Skill para preencher automaticamente notas de apps no Obsidian baseado no PRD (Product Requirements Document).

## 🎯 Objetivo

Automatizar o preenchimento de todas as seções de uma nota de app no Obsidian, extraindo informações do PRD e gerando conteúdo estruturado.

## 🔧 Como Funciona

1. Usuário cria nota a partir do template `Template para novo App.md`
2. Usuário cola o PRD completo na seção designada
3. Skill lê o arquivo e extrai o PRD
4. Analisa o PRD e preenche automaticamente:
   - ✅ Metadados YAML (status, prioridade, complexidade, stack)
   - ✅ Descrição do app
   - ✅ Objetivos (checklist)
   - ✅ Stack tecnológica detalhada
   - ✅ Requisitos funcionais (RF)
   - ✅ Requisitos não-funcionais (RNF)
   - ✅ Proposta de arquitetura
   - ✅ Roadmap em fases
   - ✅ Notas e considerações técnicas
5. Atualiza o arquivo preservando o PRD original

## 📋 Uso

```bash
# Via Claude Code
/preencher-app

# Ou diretamente
npx aios-core skill obsidian-app-filler
```

O skill irá:
1. Solicitar o caminho do arquivo .md
2. Validar estrutura do template
3. Extrair PRD da seção demarcada
4. Gerar todo o conteúdo estruturado
5. Salvar arquivo atualizado

## 📂 Estrutura Esperada do Arquivo

```markdown
---
tags:
  - App
status: 🔴 Não iniciado
concluido: false
andamento: Aguardando definição de requisitos
prioridade:
data_criacao: YYYY-MM-DD
data_conclusao: ""
complexidade:
---

# PRD DO APP
(Colocar aqui o PRD completo do app, que a IA irá preencher tudo abaixo automaticamente)
```````

[PRD COMPLETO AQUI]

```````

----

👇 Desta linha para baixo, a IA preenche de acordo com o PRD.

[Resto do template...]
```

## 🧠 Análise do PRD

O skill analisa o PRD para extrair:

### Metadados YAML
- **prioridade**: alta/média/baixa (baseado em urgência e impacto)
- **complexidade**: alta/média/baixa (baseado em escopo e tecnologias)
- **stack**: principais tecnologias mencionadas
- **responsavel**: se mencionado no PRD

### Descrição
- Problema que o app resolve
- Público-alvo
- Proposta de valor
- Diferencial competitivo

### Objetivos
- Objetivos principais do produto (3-5 items)
- Convertidos em checklist acionável

### Stack Tecnológica
- **Frontend**: frameworks, bibliotecas, UI
- **Backend**: runtime, frameworks, APIs
- **Database**: tipo, ORM, cache
- **Infraestrutura**: cloud, CI/CD, monitoramento

### Requisitos Funcionais (RF)
- Funcionalidades principais do sistema
- Numerados sequencialmente (RF01, RF02, ...)
- Formato checklist para tracking

### Requisitos Não-Funcionais (RNF)
- Performance, segurança, escalabilidade
- Usabilidade, manutenibilidade
- Compliance e regulamentações
- Formato checklist

### Arquitetura
- Padrões arquiteturais sugeridos
- Componentes principais
- Fluxo de dados
- Integrações externas

### Roadmap
Dividido em fases:
- **Fase 1: MVP** - Features essenciais
- **Fase 2: Melhorias** - Otimizações e features secundárias
- **Fase 3: Evolução** - Expansão e inovação

### Notas e Considerações
- Decisões técnicas importantes
- Trade-offs identificados
- Riscos e mitigações
- Links para referências

## 🎨 Output Esperado

Arquivo completamente preenchido com:
- ✅ Metadados YAML atualizados
- ✅ PRD original preservado
- ✅ Todas as seções preenchidas com conteúdo relevante
- ✅ Checklists prontos para execução
- ✅ Estrutura markdown limpa e formatada

## 🔒 Segurança

- Sempre faz backup do arquivo original antes de modificar
- Preserva PRD original intacto
- Valida estrutura antes de processar
- Reporta erros sem modificar arquivo em caso de falha

## 📊 Exemplo de Uso

```bash
$ /preencher-app

📝 Obsidian App Filler
Caminho do arquivo .md: /Users/luizfosc/Library/Mobile Documents/...

✓ Arquivo encontrado
✓ Estrutura validada
✓ PRD extraído (1200 palavras)
✓ Analisando PRD...
✓ Gerando metadados...
✓ Gerando descrição...
✓ Gerando objetivos (5 items)...
✓ Gerando stack tecnológica...
✓ Gerando requisitos funcionais (12 items)...
✓ Gerando requisitos não-funcionais (8 items)...
✓ Gerando arquitetura...
✓ Gerando roadmap (3 fases)...
✓ Gerando notas e considerações...

✅ Arquivo atualizado com sucesso!

Resumo:
- Prioridade: alta
- Complexidade: média
- Stack: React, Node.js, PostgreSQL
- Requisitos: 20 total (12 RF + 8 RNF)
- Roadmap: 3 fases, 21 tasks

Próximo passo: Revisar o arquivo e atualizar status para "🟡 Em andamento"
```

## 🚀 Extensões Futuras

- [ ] Integração com IA para melhorar análise do PRD
- [ ] Sugestão de tecnologias baseada em contexto
- [ ] Estimativa de tempo/complexidade automática
- [ ] Integração com JIRA/Linear para criar tasks
- [ ] Validação de requisitos contra padrões
- [ ] Geração de diagramas de arquitetura

## 📚 Referências

- Template base: `/+Templates/Template para novo App.md`
- Índice: `/APPS para Criar/✅ ÍNDICE DE SISTEMAS.md`
- Documentação Obsidian Dataview: https://blacksmithgu.github.io/obsidian-dataview/

---

**Versão:** 1.0.0
**Última atualização:** 2026-02-06
**Autor:** AIOS Core Team
