# Instruções para o Claude - PRD Generator

Quando o usuário executar `/gerar-prd` ou chamar o skill `prd-generator`, siga este workflow:

## Workflow de Execução

### 1. Executar Script de Coleta

```bash
node skills/prd-generator/generator.js
```

O script irá:
- Fazer perguntas estruturadas
- Coletar informações do app
- Retornar dados estruturados

### 2. Receber Dados Coletados

Os dados virão no formato:

```json
{
  "mode": "quick" | "complete",
  "data": {
    "appName": "Nome do App",
    "problem": "Problema que resolve",
    "target": "Público-alvo",
    "features": "Feature 1, Feature 2, Feature 3",
    "competitor": "Competidores",
    "platform": "Web/Mobile/Desktop",
    "tech": "Tecnologias",
    "special": "Requisitos especiais",
    // Se mode === "complete"
    "businessModel": "...",
    "monetization": "...",
    // ...
  },
  "timestamp": "2026-02-06T..."
}
```

### 3. Analisar e Expandir Informações

Com base nos dados fornecidos, você deve:

#### 3.1 Inferir Informações Adicionais

Se o usuário forneceu informações básicas, EXPANDA usando seu conhecimento:

**Exemplo:**
```
Input: "App de delivery de comida"

Expansão:
- Categoria: Food & Beverage, Marketplace
- Público-alvo primário: Usuários urbanos 18-45 anos
- Público secundário: Restaurantes locais
- Competidores: iFood, Uber Eats, Rappi
- Modelo de negócio: Marketplace (comissão)
- Monetização: Comissão por pedido (10-30%)
- Features essenciais: Catálogo, Carrinho, Pagamento, Tracking
- NFRs críticos: Tempo real, Geolocalização, Escalabilidade
```

#### 3.2 Priorizar Features (MoSCoW)

Classifique features em:

- **Must Have (P0):** Essencial para MVP
  - Autenticação
  - Feature core principal
  - Pagamento básico

- **Should Have (P1):** Importante mas não blocker
  - Notificações push
  - Histórico completo
  - Filtros avançados

- **Could Have (P2):** Nice to have
  - Gamificação
  - Social features
  - Integrações extras

- **Won't Have (P3):** Fora do escopo
  - ML recommendations (V2)
  - WhatsApp integration (V2)

#### 3.3 Gerar Requisitos Funcionais

Para cada feature Must Have, crie 2-4 requisitos funcionais:

**Exemplo:**
```
Feature: Autenticação
├─ RF01: Sistema deve permitir cadastro via email/senha
├─ RF02: Sistema deve permitir login social (Google, Facebook)
├─ RF03: Sistema deve enviar email de confirmação
└─ RF04: Sistema deve permitir recuperação de senha
```

**Total esperado:**
- MVP: 12-20 RFs
- Modo completo: 20-30 RFs

#### 3.4 Gerar Requisitos Não-Funcionais

Baseado em plataforma e tipo de app, defina RNFs:

**Performance:**
- Web: Carregamento < 2s, API < 200ms
- Mobile: App size < 50MB, startup < 1s

**Segurança:**
- HTTPS/TLS obrigatório
- OAuth 2.0 para autenticação
- LGPD compliance se BR
- PCI-DSS se pagamentos

**Escalabilidade:**
- Definir usuários simultâneos esperados
- Estratégia de scaling

**Usabilidade:**
- WCAG 2.1 AA compliance
- Mobile-first se mobile app
- Suporte offline se necessário

#### 3.5 Propor Stack Tecnológica

Baseado em:
- Plataforma (Web/Mobile/Desktop)
- Complexidade
- Time to market
- Tecnologias mencionadas

**Sugestões padrão:**

**Web App:**
```yaml
frontend:
  framework: "React 18+ ou Next.js 14+"
  state: "Zustand ou Redux Toolkit"
  ui: "Tailwind CSS + shadcn/ui"

backend:
  runtime: "Node.js 20+ ou Bun"
  framework: "Express, Fastify, ou Nest.js"
  api: "REST ou GraphQL"

database:
  primary: "PostgreSQL (relacional) ou MongoDB (documento)"
  cache: "Redis"

infrastructure:
  cloud: "AWS, GCP, ou Vercel"
  cicd: "GitHub Actions"
```

**Mobile App:**
```yaml
cross_platform:
  framework: "React Native ou Flutter"

native_ios:
  language: "Swift"
  framework: "SwiftUI"

native_android:
  language: "Kotlin"
  framework: "Jetpack Compose"
```

#### 3.6 Definir Arquitetura

Baseado em escala e complexidade:

**Pequeno/MVP:**
- Monolith (Next.js full-stack ou Rails)
- Single database
- Deployed on Vercel/Heroku

**Médio:**
- Backend separado (API)
- Frontend SPA
- Database + Cache
- Cloud platform (AWS/GCP)

**Grande/Complexo:**
- Microservices
- API Gateway
- Multiple databases
- Event-driven architecture
- Kubernetes

#### 3.7 Criar Personas Detalhadas

Para cada público mencionado, crie persona completa:

```yaml
persona_1:
  name: "João, o Profissional Ocupado"
  demographics:
    age: "28-35"
    occupation: "Developer Full-Stack"
    location: "São Paulo, SP"
    income: "R$ 8k-15k/mês"

  characteristics:
    - "Tech-savvy"
    - "Valoriza eficiência"
    - "Busca automação"

  goals:
    - "Economizar tempo em tarefas repetitivas"
    - "Melhorar produtividade"
    - "Ter controle sobre workflows"

  frustrations:
    - "Ferramentas complexas demais"
    - "Falta de integração"
    - "UI confusa"

  behaviors:
    - "Usa múltiplas ferramentas diariamente"
    - "Prefere keyboard shortcuts"
    - "Valoriza documentação clara"
```

#### 3.8 Definir Success Metrics

**OKRs para Q1:**
```yaml
objective_1: "Validar product-market fit"
  kr1: "100 usuários ativos semanais"
  kr2: "60% retention rate (7 dias)"
  kr3: "NPS > 40"

objective_2: "Estabelecer baseline de produto"
  kr1: "10 features core implementadas"
  kr2: "< 5% error rate"
  kr3: "P95 response time < 500ms"
```

**KPIs contínuos:**
- Acquisition: Sign-ups, Conversion rate
- Activation: Onboarding completion, Time to value
- Retention: DAU, MAU, Churn rate
- Revenue: MRR, ARPU, LTV
- Referral: K-factor, Viral coefficient

#### 3.9 Identificar Riscos

**Técnicos:**
- Escalabilidade: Será que aguenta carga esperada?
- Integrações: APIs de terceiros confiáveis?
- Performance: Latência em features real-time?

**Negócio:**
- Market fit: Problema realmente existe?
- Competição: Diferencial suficiente?
- Monetização: Usuários pagarão?

**Operacionais:**
- Time: Equipe tem skills necessárias?
- Budget: Recursos suficientes?
- Timeline: Prazos realistas?

Para cada risco:
```yaml
risk:
  description: "API de pagamento pode ter downtime"
  impact: "High" # High/Med/Low
  probability: "Med"
  mitigation: "Fallback para outro provider"
  owner: "Tech Lead"
```

### 4. Preencher Template

Use o template em `skills/prd-generator/templates/app-prd-template.md`

Substitua TODOS os placeholders `{{VARIAVEL}}` com conteúdo gerado.

**Regras de preenchimento:**

1. **Seja específico** - Evite generalidades
2. **Use dados reais** - Se mencionado pelo usuário, use exatamente
3. **Infira inteligentemente** - Expanda com conhecimento de domínio
4. **Mantenha consistência** - Stack, features, requisitos devem alinhar
5. **Priorize corretamente** - MVP deve ser viável e enxuto
6. **Calcule métricas** - Baseie em benchmarks de mercado

### 5. Validação do PRD

Antes de retornar, valide:

**Checklist de qualidade:**
- [ ] Todas as 20 seções preenchidas
- [ ] Nenhum placeholder `{{VAR}}` restante
- [ ] Features priorizadas corretamente
- [ ] RFs e RNFs mapeiam para features
- [ ] Stack é coerente com requisitos
- [ ] Personas são realistas e detalhadas
- [ ] Métricas são mensuráveis
- [ ] Riscos têm mitigações
- [ ] Scope está claro (In/Out)
- [ ] Timeline é realista

**Métricas de qualidade:**
- Palavras: 2,500-6,000 (depende do modo)
- RFs: 12-30
- RNFs: 10-20
- Personas: 1-3
- Riscos: 5-10
- OKRs: 2-3 objectives

### 6. Formatação Final

**Markdown limpo:**
- Use tabelas para dados estruturados
- Use listas para enumerações
- Use code blocks para exemplos técnicos
- Use diagramas ASCII para arquitetura
- Use checkboxes para deliverables

**Exemplo de formatação:**

```markdown
## 7. Functional Requirements

### 7.1 Requisitos Funcionais

| ID | Requisito | Prioridade | Feature |
|----|-----------|------------|---------|
| RF01 | Sistema deve permitir cadastro com email/senha | P0 | Autenticação |
| RF02 | Sistema deve validar formato de email | P0 | Autenticação |

### 7.2 Detalhamento

#### RF01: Cadastro com Email/Senha

**Descrição:**
O sistema deve permitir que novos usuários criem uma conta fornecendo
email válido e senha com requisitos mínimos de segurança.

**Critérios de Aceitação:**
- [ ] Email deve ser validado via regex
- [ ] Senha deve ter mínimo 8 caracteres
- [ ] Senha deve conter: letras, números, símbolos
- [ ] Email de confirmação deve ser enviado
- [ ] Conta fica inativa até confirmação

**Regras de Negócio:**
- Email deve ser único no sistema
- Senha não pode conter email do usuário
- Link de confirmação expira em 24h

**Dependências:**
- Serviço de email (SendGrid/AWS SES)
- Database para armazenar usuários

**Estimativa:** 5 story points
```

### 7. Output Final

Retorne o PRD completo formatado em Markdown.

**Header do output:**
```markdown
# 📄 PRD Gerado com Sucesso!

**App:** {{APP_NAME}}
**Modo:** {{MODE}}
**Palavras:** {{WORD_COUNT}}
**Seções:** 20/20 completas
**Gerado em:** {{TIMESTAMP}}

---

[PRD COMPLETO ABAIXO]
```

**Footer do output:**
```markdown
---

## ✅ Próximos Passos

1. **Revisar PRD** - Valide informações geradas
2. **Ajustar se necessário** - Personalize conforme contexto
3. **Compartilhar com time** - Alinhe stakeholders
4. **Criar app no Obsidian** - Use `/criar-app-completo` ou `/preencher-app`
5. **Iniciar desenvolvimento** - Implemente MVP

## 🎯 Usar com Obsidian

Para criar app automaticamente no Obsidian:

\`\`\`bash
/criar-app-completo
\`\`\`

Ou salve este PRD e use:

\`\`\`bash
/preencher-app
\`\`\`

---

*PRD gerado por AIOS PRD Generator v1.0.0*
```

### 8. Integração com /criar-app-completo

Quando chamado via `/criar-app-completo`, após gerar PRD:

1. Salve PRD em arquivo temporário
2. Crie arquivo Obsidian com template
3. Insira PRD na seção correta
4. Chame `/preencher-app` automaticamente
5. Retorne app completamente preenchido

## Exemplos de Geração

### Exemplo 1: Input Mínimo

**Input:**
```json
{
  "appName": "TaskMaster",
  "problem": "Desenvolvedores perdem tempo com task management",
  "target": "Desenvolvedores",
  "features": "Integração Git, Pomodoro, Snippets",
  "platform": "Web",
  "tech": "React"
}
```

**Você deve inferir:**
- Categoria: Productivity, Developer Tools
- Competidores: Linear, Jira, Todoist
- Modelo: Freemium SaaS
- Stack completa: React + Node.js + PostgreSQL + Redis
- 18 RFs, 12 RNFs
- 3 personas detalhadas
- Arquitetura microservices
- OKRs de validação

**Output:** PRD de ~3,500 palavras

### Exemplo 2: Input Completo

**Input:**
```json
{
  "appName": "FitTracker Pro",
  "problem": "Atletas amadores perdem motivação treinando sozinhos",
  "target": "Atletas 20-35 anos",
  "features": "Treinos guiados, Gamificação, Social feed",
  "platform": "Mobile",
  "tech": "React Native",
  "businessModel": "Freemium",
  "monetization": "In-app purchases + Premium subscription",
  "marketSize": "50M atletas amadores no Brasil"
}
```

**Você deve gerar:**
- Análise competitiva completa
- 3 personas detalhadas
- Feature comparison matrix
- Go-to-market strategy
- 25 RFs, 15 RNFs
- Business model canvas
- Pricing strategy
- Roadmap 3 versões

**Output:** PRD de ~5,500 palavras

## Princípios de Geração

1. **Contexto é rei** - Use informações fornecidas como base
2. **Infira inteligentemente** - Expanda com conhecimento de mercado
3. **Seja pragmático** - Sugestões devem ser viáveis
4. **Priorize MVP** - Enxuto mas funcional
5. **Pense em escala** - Arquitetura deve suportar crescimento
6. **Métricas realistas** - Baseie em benchmarks
7. **Riscos honestos** - Identifique problemas potenciais
8. **Linguagem clara** - Evite jargão desnecessário

---

**Versão:** 1.0.0
**Última atualização:** 2026-02-06
