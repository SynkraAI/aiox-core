# 🚀 Dashboard Generator - Quick Start

## Comandos Mágicos para Gerar Dashboards

Use estes comandos exatos para gerar dashboards de alta qualidade toda vez!

---

## 📋 Template de Comando Base

```
@claude usando /AIOS:skills:dashboard-generator

[DESCREVA O QUE VOCÊ QUER]

Tipo: [analytics | comparison | project-report | timeline | portfolio]
Dados: [caminho para arquivos OU dados inline]
Tema: [purple-blue | blue-cyan | green-teal | orange-red | pink-purple]
Seções: [lista de seções desejadas]
```

---

## ⚡ Comandos Prontos

### 1. Dashboard de Métricas (Analytics)

```
@claude usando /AIOS:skills:dashboard-generator

Crie um dashboard de métricas analytics com:

DADOS:
- Receita: Janeiro R$ 50.000, Fevereiro R$ 65.000, Março R$ 78.000
- Usuários: Janeiro 1.200, Fevereiro 1.450, Março 1.680
- Conversão: Janeiro 2.3%, Fevereiro 2.8%, Março 3.1%
- NPS: Janeiro 42, Fevereiro 58, Março 67

Tipo: analytics

ESTRUTURA:
- Overview com 4 KPI cards (receita, usuários, conversão, NPS)
- Gráfico de linha: tendência de receita
- Gráfico de barras: crescimento de usuários
- Gráfico doughnut: distribuição de canais

Tema: purple-blue
Título: Dashboard de Performance - Q1 2026
```

### 2. Comparação Before/After

```
@claude usando /AIOS:skills:dashboard-generator

Preciso apresentar melhorias do projeto para stakeholders.

BEFORE (Janeiro 2026):
- Performance: 3.2s load time
- Bugs abertos: 47 issues
- Code Coverage: 8%
- Satisfação usuários: 6.5/10
- Deploy time: 45 minutos
- Uptime: 97.2%

AFTER (Março 2026):
- Performance: 0.9s load time
- Bugs abertos: 5 issues
- Code Coverage: 82%
- Satisfação usuários: 8.9/10
- Deploy time: 8 minutos
- Uptime: 99.8%

Tipo: comparison

ESTRUTURA:
- Overview: cards comparativos lado a lado
- Métricas: gráficos de evolução
- Impacto: cálculo de ROI e economia
- Timeline: como chegamos lá

Tema: green-teal
Título: Transformação Digital - Resultados Q1
Subtítulo: De 6.5/10 para 8.9/10 em 3 meses
```

### 3. Relatório de Projeto (Project Report)

```
@claude usando /AIOS:skills:dashboard-generator

Gere relatório de projeto a partir dos arquivos markdown:

DADOS:
Caminho: /path/to/project/reports/*.md

Tipo: project-report

ESTRUTURA:
- Executive Summary (overview geral)
- Sprint 1: Fundação (17 SP, 4 stories)
- Sprint 2: Qualidade (24 SP, 6 stories)
- Sprint 3: Expansão (18 SP, 5 stories)
- Métricas: gráficos de progresso
- Deliverables: tabela de entregas
- Timeline: visualização cronológica

Tema: purple-blue
Título: Project Phoenix - Final Report
Subtítulo: 3 Sprints | 59 SP | 15 Stories Delivered

EXTRAS:
- Adicione badges de status (✅ Completo, 🔄 Em progresso)
- Gráfico de burndown
- Velocity chart
- Team metrics
```

### 4. Portfolio Pessoal

```
@claude usando /AIOS:skills:dashboard-generator

Crie um portfolio site para mim:

PROJETOS:
1. E-commerce Platform
   - Stack: React, Node.js, PostgreSQL
   - Ano: 2025
   - Resultado: +250% vendas online
   - Link: github.com/user/project1

2. Mobile Banking App
   - Stack: React Native, Python, AWS
   - Ano: 2025
   - Resultado: 50k downloads em 3 meses
   - Link: github.com/user/project2

3. Analytics Dashboard
   - Stack: Vue.js, GraphQL, MongoDB
   - Ano: 2024
   - Resultado: Usado por 1200+ empresas
   - Link: github.com/user/project3

SKILLS:
Frontend: React, Vue, Angular
Backend: Node.js, Python, Go
Database: PostgreSQL, MongoDB, Redis
DevOps: Docker, K8s, AWS, CI/CD

Tipo: portfolio

ESTRUTURA:
- Hero: nome + tagline + foto
- Projects: cards com imagens e detalhes
- Skills: gráfico radar com proficiência
- Timeline: carreira cronológica
- Contact: formulário ou links

Tema: dark-mono
Título: João Silva - Full Stack Developer
Subtítulo: Transformando ideias em produtos digitais desde 2020
```

### 5. Dashboard de Timeline

```
@claude usando /AIOS:skills:dashboard-generator

Mostre a evolução do projeto em timeline visual:

MARCOS:
Q4 2025:
- Outubro: Kickoff do projeto
- Novembro: MVP lançado (100 usuários beta)
- Dezembro: Primeira versão pública (1k usuários)

Q1 2026:
- Janeiro: Feature X lançada (+5k usuários)
- Fevereiro: Expansão internacional (+15k usuários)
- Março: Série A funding ($2M) (+50k usuários)

MÉTRICAS POR PERÍODO:
- Usuários: [100, 1000, 5000, 15000, 50000]
- Receita MRR: [0, 500, 2000, 8000, 25000]
- Team size: [3, 5, 8, 12, 18]

Tipo: timeline

ESTRUTURA:
- Timeline visual: linha do tempo interativa
- Milestone cards: detalhes de cada marco
- Growth charts: métricas ao longo do tempo
- Highlights: conquistas principais

Tema: orange-red
Título: Startup Growth Journey
Subtítulo: De 3 pessoas a $2M em 6 meses
```

---

## 🎨 Customização de Temas

### Trocar Cores

```
Adicione ao comando:

Customização de cores:
- Primary: #FF6B6B (vermelho vibrante)
- Secondary: #4ECDC4 (turquesa)
- Success: #95E1D3 (verde claro)
```

### Adicionar Logo

```
Logo:
- Path: /path/to/logo.png
- Posição: header esquerda
- Tamanho: 48px altura
```

### Fontes Customizadas

```
Fonte:
- Título: Poppins, bold
- Corpo: Inter, regular
- Código: JetBrains Mono
```

---

## 📊 Tipos de Gráficos Disponíveis

### Linha (Line Chart)
**Melhor para:** Tendências ao longo do tempo
```
Gráfico de linha:
- Título: "Crescimento de Receita"
- Dados: Mês a mês
- Múltiplas linhas: Receita, Custo, Lucro
```

### Barras (Bar Chart)
**Melhor para:** Comparações entre categorias
```
Gráfico de barras:
- Título: "Vendas por Produto"
- Dados: Produto A: 150, Produto B: 230, Produto C: 180
- Orientação: vertical
```

### Barras Horizontais (Horizontal Bar)
**Melhor para:** Rankings, listas ordenadas
```
Gráfico de barras horizontais:
- Título: "Top 10 Features Mais Usadas"
- Dados: Feature 1: 89%, Feature 2: 76%, ...
- Cor: gradiente
```

### Doughnut/Pie
**Melhor para:** Proporções, percentuais
```
Gráfico doughnut:
- Título: "Distribuição de Tráfego"
- Dados: Orgânico: 45%, Direto: 30%, Social: 15%, Pago: 10%
- Mostrar legendas: sim
```

### Radar
**Melhor para:** Múltiplas dimensões, comparações multi-atributo
```
Gráfico radar:
- Título: "Avaliação de Skills"
- Dimensões: JavaScript, Python, React, Node, SQL, Docker
- Dados: Você vs. Time Average
```

### Misto (Mixed)
**Melhor para:** Múltiplos tipos de dados juntos
```
Gráfico misto:
- Linha: Receita ao longo do tempo
- Barras: Número de vendas por mês
- Eixos: Receita (esquerda), Vendas (direita)
```

---

## 🎯 Dicas para Comandos Perfeitos

### ✅ FAÇA

1. **Seja específico com números**
   ```
   ✅ BOM: "Usuários cresceram de 1.200 para 5.400 (+350%)"
   ❌ RUIM: "Usuários aumentaram bastante"
   ```

2. **Forneça contexto**
   ```
   ✅ BOM: "Performance melhorou de 3.2s para 0.9s (72% mais rápido)"
   ❌ RUIM: "Performance melhorou"
   ```

3. **Especifique o tipo de gráfico**
   ```
   ✅ BOM: "Gráfico de linha para receita mensal"
   ❌ RUIM: "Mostre a receita"
   ```

4. **Defina a estrutura claramente**
   ```
   ✅ BOM: "3 abas: Overview, Detalhes, Métricas"
   ❌ RUIM: "Organize de forma legal"
   ```

### ❌ NÃO FAÇA

1. **Não seja vago**
   ```
   ❌ "Faça um dashboard bonito"
   ✅ "Dashboard analytics com 4 KPIs e 3 gráficos"
   ```

2. **Não omita dados**
   ```
   ❌ "Mostre o crescimento"
   ✅ "Crescimento: Jan 1000, Fev 1500, Mar 2100"
   ```

3. **Não misture muitos temas**
   ```
   ❌ "Quero verde, azul, roxo, rosa tudo junto"
   ✅ "Tema: purple-blue (gradiente roxo/azul)"
   ```

---

## 🚀 Fluxo Completo de Uso

### Passo 1: Prepare seus dados
- Liste os números/métricas
- Organize em categorias
- Identifique before/after se aplicável

### Passo 2: Escolha o tipo
- Analytics: métricas e KPIs
- Comparison: antes vs depois
- Project Report: status de projeto
- Timeline: evolução temporal
- Portfolio: showcase de trabalhos

### Passo 3: Monte o comando
- Use um dos templates acima
- Substitua os dados
- Customize cores/tema se quiser

### Passo 4: Execute
```
@claude usando /AIOS:skills:dashboard-generator
[SEU COMANDO AQUI]
```

### Passo 5: Receba
- Arquivo HTML standalone
- Guia de uso em markdown
- Pronto para apresentar!

---

## 💡 Exemplos Reais

### Exemplo 1: Dashboard do Ensinio
**Comando usado:**
```
@claude usando /AIOS:skills:dashboard-generator

Quero que você leia todos os relatórios de
/Users/luizfosc/Dropbox/Downloads/Ensinio-Analysis
e faça um site para eu mostrar para o pessoal.

Preciso que ele seja bem interativo, e que mostre
como era antes e como ficou depois das melhorias.
```

**Resultado:**
- 6 tabs interativas
- 8 gráficos Chart.js
- Tema purple-blue
- Timeline dos sprints
- Before/After comparisons
- 100% standalone HTML

**Localização:** `/Users/luizfosc/Dropbox/Downloads/Ensinio-Analysis/dashboard.html`

---

## 📚 Recursos Adicionais

### Templates Disponíveis
- `base-template.html` - Template base com design system
- Mais templates serão adicionados

### Componentes Reutilizáveis
- KPI Cards
- Comparison Cards
- Progress Bars
- Timeline Items
- Tables
- Charts

### Documentação Completa
- `skill.md` - Documentação completa da skill
- `QUICKSTART.md` - Este arquivo
- Exemplos em `examples/`

---

## 🆘 Problemas Comuns

**"Os gráficos não aparecem"**
- Verifique conexão com internet (Chart.js via CDN)
- Abra o console do browser (F12) para ver erros

**"As cores não ficaram como eu queria"**
- Especifique cores em hexadecimal (#FF6B6B)
- Use um dos temas pré-definidos

**"Quero adicionar mais dados depois"**
- O arquivo é HTML, pode editar manualmente
- Ou peça para regenerar com novos dados

**"Como exporto para PDF?"**
- Abra no browser e use Ctrl+P (Cmd+P no Mac)
- Ou clique com direito → Imprimir → Salvar como PDF

---

## ✨ Próximas Features

- [ ] Modo dark/light toggle
- [ ] Export para PowerPoint
- [ ] Dados em tempo real via API
- [ ] Mais temas pré-configurados
- [ ] Templates de indústria específicos

---

**Criado:** 2026-02-11
**Versão:** 1.0.0
**Autor:** AIOS Framework

💡 **Dica Final:** Salve seus comandos favoritos! Crie um arquivo com os comandos que você mais usa para referência rápida.
