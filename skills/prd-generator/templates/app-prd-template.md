# {{APP_NAME}} - Product Requirements Document

**Version:** 1.0.0
**Created:** {{DATE}}
**Author:** Product Team
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Product Vision

{{APP_NAME}} é {{ONE_LINE_DESCRIPTION}}.

**Problema:** {{PROBLEM_STATEMENT}}

**Solução:** {{SOLUTION_STATEMENT}}

**Proposta de Valor:** {{VALUE_PROPOSITION}}

### 1.2 Quick Facts

| Item | Detalhes |
|------|----------|
| **Categoria** | {{CATEGORY}} |
| **Plataforma** | {{PLATFORM}} |
| **Público-Alvo** | {{TARGET_AUDIENCE}} |
| **Competidores** | {{COMPETITORS}} |
| **Modelo de Negócio** | {{BUSINESS_MODEL}} |
| **Timeline MVP** | {{TIMELINE}} |

---

## 2. Problem Statement

### 2.1 Contexto

{{BACKGROUND_CONTEXT}}

### 2.2 Problema Atual

**Situação atual:**
{{CURRENT_SITUATION}}

**Dores dos usuários:**
- {{PAIN_1}}
- {{PAIN_2}}
- {{PAIN_3}}

**Gap no mercado:**
{{MARKET_GAP}}

### 2.3 Oportunidade

{{OPPORTUNITY_DESCRIPTION}}

**Tamanho de mercado:**
- TAM (Total Addressable Market): {{TAM}}
- SAM (Serviceable Addressable Market): {{SAM}}
- SOM (Serviceable Obtainable Market): {{SOM}}

---

## 3. Core Atom (Atomic MVP)

> "Se isso não funcionar, nada mais importa."

O Core Atom é a operação mais básica e arriscada do sistema. É o teste de realidade
antes de construir qualquer outra coisa. Inspirado no Atomic Design do Brad Frost:
Átomos → Moléculas → Organismos → Templates → Páginas.

### 3.1 Identificação do Core Atom

**Pergunta-chave:** Qual é a única coisa que, se não funcionar, invalida todo o projeto?

| Item | Resposta |
|------|----------|
| **Core Atom** | {{CORE_ATOM_DESCRIPTION}} |
| **Por que é crítico?** | {{WHY_CRITICAL}} |
| **Risco técnico** | {{RISK_LEVEL}} (Alto/Médio/Baixo) |
| **Dependência externa?** | {{EXTERNAL_DEPENDENCY}} (API, serviço, hardware, nenhuma) |
| **Já foi validado?** | {{VALIDATED}} (Sim/Não/Parcialmente) |

### 3.2 Atomic Layers (Camadas de Construção)

| Camada | Elemento | Descrição | Depende de |
|--------|----------|-----------|------------|
| 🔴 **Átomo** | {{ATOM_NAME}} | {{ATOM_DESCRIPTION}} | — |
| 🟠 **Molécula** | {{MOLECULE_NAME}} | {{MOLECULE_DESCRIPTION}} | Átomo |
| 🟡 **Organismo** | {{ORGANISM_NAME}} | {{ORGANISM_DESCRIPTION}} | Moléculas |
| 🟢 **Template** | {{TEMPLATE_NAME}} | {{TEMPLATE_DESCRIPTION}} | Organismos |
| 🔵 **Página** | {{PAGE_NAME}} | {{PAGE_DESCRIPTION}} | Templates |

### 3.3 Proof of Life (PoL)

**Definição:** Um teste mínimo que prova que o Core Atom funciona.

| Item | Especificação |
|------|---------------|
| **Comando CLI** | `{{POL_COMMAND}}` |
| **Input de teste** | {{POL_INPUT}} |
| **Output esperado** | {{POL_EXPECTED_OUTPUT}} |
| **Critério de sucesso** | {{POL_SUCCESS_CRITERIA}} |
| **Tempo máximo** | {{POL_MAX_TIME}} |

### 3.4 Risk Assessment do Core Atom

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| {{ATOM_RISK_1}} | Alta/Média/Baixa | Crítico/Alto/Médio | {{ATOM_MITIGATION_1}} |
| {{ATOM_RISK_2}} | Alta/Média/Baixa | Crítico/Alto/Médio | {{ATOM_MITIGATION_2}} |
| {{ATOM_RISK_3}} | Alta/Média/Baixa | Crítico/Alto/Médio | {{ATOM_MITIGATION_3}} |

### 3.5 Go/No-Go Checklist

Antes de avançar para as próximas camadas:

- [ ] Core Atom implementado
- [ ] Proof of Life passou 3x consecutivas
- [ ] Riscos críticos têm mitigação documentada
- [ ] Tempo de execução do PoL < {{POL_MAX_TIME}}
- [ ] Nenhuma dependência externa bloqueante

**Se qualquer item falhar:** PARAR. Repensar abordagem antes de continuar.

---

## 4. Target Audience

### 4.1 Persona Primária: {{PERSONA_1_NAME}}

**Demografia:**
- Idade: {{AGE_RANGE}}
- Ocupação: {{OCCUPATION}}
- Localização: {{LOCATION}}
- Renda: {{INCOME_RANGE}}

**Características:**
- {{CHARACTERISTIC_1}}
- {{CHARACTERISTIC_2}}
- {{CHARACTERISTIC_3}}

**Objetivos:**
- {{GOAL_1}}
- {{GOAL_2}}
- {{GOAL_3}}

**Frustrações:**
- {{FRUSTRATION_1}}
- {{FRUSTRATION_2}}
- {{FRUSTRATION_3}}

**Comportamentos:**
- {{BEHAVIOR_1}}
- {{BEHAVIOR_2}}
- {{BEHAVIOR_3}}

### 3.2 Persona Secundária: {{PERSONA_2_NAME}}

[Se aplicável - mesma estrutura da Persona Primária]

---

## 4. Goals & Success Metrics

### 4.1 Objetivos de Negócio

| # | Objetivo | Métrica | Meta | Prazo |
|---|----------|---------|------|-------|
| 1 | {{GOAL_1}} | {{METRIC_1}} | {{TARGET_1}} | {{TIMELINE_1}} |
| 2 | {{GOAL_2}} | {{METRIC_2}} | {{TARGET_2}} | {{TIMELINE_2}} |
| 3 | {{GOAL_3}} | {{METRIC_3}} | {{TARGET_3}} | {{TIMELINE_3}} |

### 4.2 Objetivos de Produto

- [ ] {{PRODUCT_GOAL_1}}
- [ ] {{PRODUCT_GOAL_2}}
- [ ] {{PRODUCT_GOAL_3}}

### 4.3 KPIs

**Aquisição:**
- {{KPI_ACQUISITION_1}}
- {{KPI_ACQUISITION_2}}

**Ativação:**
- {{KPI_ACTIVATION_1}}
- {{KPI_ACTIVATION_2}}

**Retenção:**
- {{KPI_RETENTION_1}}
- {{KPI_RETENTION_2}}

**Revenue:**
- {{KPI_REVENUE_1}}
- {{KPI_REVENUE_2}}

**Referral:**
- {{KPI_REFERRAL_1}}
- {{KPI_REFERRAL_2}}

---

## 5. User Stories & Use Cases

### 5.1 User Stories Principais

#### US01: {{USER_STORY_1_TITLE}}
**Como** {{USER_TYPE}}
**Quero** {{ACTION}}
**Para** {{BENEFIT}}

**Critérios de Aceitação:**
- [ ] {{CRITERION_1}}
- [ ] {{CRITERION_2}}
- [ ] {{CRITERION_3}}

---

#### US02: {{USER_STORY_2_TITLE}}
**Como** {{USER_TYPE}}
**Quero** {{ACTION}}
**Para** {{BENEFIT}}

**Critérios de Aceitação:**
- [ ] {{CRITERION_1}}
- [ ] {{CRITERION_2}}
- [ ] {{CRITERION_3}}

---

### 5.2 Casos de Uso

**UC01: {{USE_CASE_1}}**
```
Ator: {{ACTOR}}
Pré-condições: {{PRECONDITIONS}}

Fluxo Principal:
1. {{STEP_1}}
2. {{STEP_2}}
3. {{STEP_3}}
...

Pós-condições: {{POSTCONDITIONS}}

Fluxos Alternativos:
- {{ALT_FLOW_1}}
- {{ALT_FLOW_2}}
```

### 5.3 Jornada do Usuário

```
Discovery → Sign-up → Onboarding → First Use → Regular Use → Retention
    ↓          ↓           ↓            ↓            ↓           ↓
{{TOUCH_1}} {{TOUCH_2}} {{TOUCH_3}} {{TOUCH_4}} {{TOUCH_5}} {{TOUCH_6}}
```

---

## 6. Features & Requirements

### 6.1 Feature Prioritization (MoSCoW)

#### Must Have (P0) - MVP Essencial

| ID | Feature | Descrição | User Story |
|----|---------|-----------|------------|
| F01 | {{FEATURE_1}} | {{DESCRIPTION}} | US01 |
| F02 | {{FEATURE_2}} | {{DESCRIPTION}} | US02 |
| ... | ... | ... | ... |

#### Should Have (P1) - Importante

| ID | Feature | Descrição | User Story |
|----|---------|-----------|------------|
| F10 | {{FEATURE_10}} | {{DESCRIPTION}} | US10 |
| ... | ... | ... | ... |

#### Could Have (P2) - Desejável

| ID | Feature | Descrição | User Story |
|----|---------|-----------|------------|
| F20 | {{FEATURE_20}} | {{DESCRIPTION}} | US20 |
| ... | ... | ... | ... |

#### Won't Have (P3) - Fora do Escopo

| ID | Feature | Razão para exclusão |
|----|---------|---------------------|
| F30 | {{FEATURE_30}} | {{REASON}} |
| ... | ... | ... |

---

## 7. Functional Requirements

### 7.1 Requisitos Funcionais

| ID | Requisito | Prioridade | Feature |
|----|-----------|------------|---------|
| RF01 | {{REQUIREMENT_1}} | P0 | F01 |
| RF02 | {{REQUIREMENT_2}} | P0 | F01 |
| RF03 | {{REQUIREMENT_3}} | P0 | F02 |
| RF04 | {{REQUIREMENT_4}} | P1 | F10 |
| ... | ... | ... | ... |

### 7.2 Detalhamento dos Requisitos

#### RF01: {{REQUIREMENT_TITLE}}

**Descrição:** {{DETAILED_DESCRIPTION}}

**Critérios de Aceitação:**
- [ ] {{AC_1}}
- [ ] {{AC_2}}
- [ ] {{AC_3}}

**Regras de Negócio:**
- {{RULE_1}}
- {{RULE_2}}

**Dependências:**
- {{DEPENDENCY_1}}

**Estimativa:** {{EFFORT}}

---

## 8. Non-Functional Requirements

### 8.1 Performance

| ID | Requisito | Meta | Medição |
|----|-----------|------|---------|
| RNF01 | Tempo de carregamento inicial | < 2s | Lighthouse |
| RNF02 | Tempo de resposta API | < 200ms | P95 |
| RNF03 | Throughput | 1000 req/s | Load testing |

### 8.2 Segurança

| ID | Requisito | Implementação |
|----|-----------|---------------|
| RNF10 | Autenticação | OAuth 2.0 + JWT |
| RNF11 | Autorização | RBAC (Role-Based Access Control) |
| RNF12 | Criptografia em trânsito | TLS 1.3 |
| RNF13 | Criptografia em repouso | AES-256 |
| RNF14 | Rate limiting | 100 req/min por IP |

### 8.3 Escalabilidade

| ID | Requisito | Meta |
|----|-----------|------|
| RNF20 | Usuários simultâneos | 10,000 |
| RNF21 | Crescimento de dados | 100GB/mês |
| RNF22 | Horizontal scaling | Auto-scaling AWS |

### 8.4 Usabilidade

| ID | Requisito | Critério |
|----|-----------|----------|
| RNF30 | Acessibilidade | WCAG 2.1 AA |
| RNF31 | Mobile-first | Responsive design |
| RNF32 | Internacionalização | i18n support (pt-BR, en-US) |

### 8.5 Confiabilidade

| ID | Requisito | Meta |
|----|-----------|------|
| RNF40 | Uptime | 99.9% |
| RNF41 | Backup | Diário, retenção 30 dias |
| RNF42 | Disaster Recovery | RTO < 4h, RPO < 1h |

### 8.6 Manutenibilidade

| ID | Requisito | Implementação |
|----|-----------|---------------|
| RNF50 | Code coverage | >= 80% |
| RNF51 | Documentation | Inline + API docs |
| RNF52 | Logging | Structured logging (JSON) |
| RNF53 | Monitoring | APM + metrics + alerts |

---

## 9. Technical Stack

### 9.1 Arquitetura Proposta

{{ARCHITECTURE_TYPE}} (e.g., Microservices, Monolith, Serverless)

### 9.2 Stack Tecnológica

**Frontend:**
- Framework: {{FRONTEND_FRAMEWORK}}
- State Management: {{STATE_MANAGEMENT}}
- UI Library: {{UI_LIBRARY}}
- Build Tool: {{BUILD_TOOL}}
- Testing: {{TESTING_FRAMEWORK}}

**Backend:**
- Runtime: {{BACKEND_RUNTIME}}
- Framework: {{BACKEND_FRAMEWORK}}
- API: {{API_TYPE}} (REST, GraphQL, gRPC)
- Authentication: {{AUTH_SOLUTION}}
- Testing: {{TESTING_FRAMEWORK}}

**Database:**
- Primary DB: {{PRIMARY_DB}}
- Cache: {{CACHE_SOLUTION}}
- Search: {{SEARCH_ENGINE}}
- Message Queue: {{MESSAGE_QUEUE}}

**Infrastructure:**
- Cloud Provider: {{CLOUD_PROVIDER}}
- Container Orchestration: {{ORCHESTRATION}}
- CI/CD: {{CICD_TOOL}}
- Monitoring: {{MONITORING_STACK}}
- Logging: {{LOGGING_SOLUTION}}

**Third-Party Integrations:**
- {{INTEGRATION_1}}: {{PURPOSE}}
- {{INTEGRATION_2}}: {{PURPOSE}}
- {{INTEGRATION_3}}: {{PURPOSE}}

### 9.3 Justificativa da Stack

**{{TECHNOLOGY}}:**
- **Escolhido porque:** {{REASON}}
- **Alternativas consideradas:** {{ALTERNATIVES}}
- **Trade-offs:** {{TRADEOFFS}}

---

## 10. Architecture

### 10.1 Componentes Principais

```
┌────────────────────────────────────────────────────────┐
│                    ARCHITECTURE                         │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐                                      │
│  │   Frontend   │ ← Users                              │
│  └──────┬───────┘                                      │
│         │                                               │
│         ↓                                               │
│  ┌──────────────┐                                      │
│  │  API Gateway │                                      │
│  └──────┬───────┘                                      │
│         │                                               │
│    ┌────┴────┐                                         │
│    ↓         ↓                                         │
│  ┌─────┐  ┌─────┐                                     │
│  │ Svc1│  │ Svc2│  ← Backend Services                 │
│  └──┬──┘  └──┬──┘                                     │
│     │        │                                         │
│     └────┬───┘                                         │
│          ↓                                              │
│     ┌────────┐                                         │
│     │   DB   │                                         │
│     └────────┘                                         │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### 10.2 Fluxo de Dados

**Fluxo de autenticação:**
1. {{STEP_1}}
2. {{STEP_2}}
3. {{STEP_3}}

**Fluxo de operação principal:**
1. {{STEP_1}}
2. {{STEP_2}}
3. {{STEP_3}}

### 10.3 Integrações Externas

| Serviço | Propósito | Dependência | Fallback |
|---------|-----------|-------------|----------|
| {{SERVICE_1}} | {{PURPOSE}} | Critical | {{FALLBACK}} |
| {{SERVICE_2}} | {{PURPOSE}} | Optional | {{FALLBACK}} |

---

## 11. User Experience (UX)

### 11.1 Wireframes Principais

**Tela 1: {{SCREEN_NAME}}**
```
┌─────────────────────────────────────┐
│  Header (Logo, Nav, User Menu)      │
├─────────────────────────────────────┤
│                                     │
│  {{MAIN_CONTENT_DESCRIPTION}}      │
│                                     │
│  {{COMPONENTS}}                     │
│                                     │
├─────────────────────────────────────┤
│  Footer                             │
└─────────────────────────────────────┘
```

### 11.2 Design Guidelines

**Cores:**
- Primary: {{COLOR_PRIMARY}}
- Secondary: {{COLOR_SECONDARY}}
- Accent: {{COLOR_ACCENT}}

**Tipografia:**
- Heading: {{FONT_HEADING}}
- Body: {{FONT_BODY}}

**Componentes:**
- Design System: {{DESIGN_SYSTEM}}
- Component Library: {{COMPONENT_LIBRARY}}

### 11.3 Fluxos de Navegação

**Happy Path:**
```
Home → Sign Up → Onboarding → Dashboard → Feature → Success
```

**Edge Cases:**
```
Home → Sign Up → Email Verification Failed → Retry
```

---

## 12. Security & Compliance

### 12.1 Requisitos de Segurança

| Área | Requisito | Implementação |
|------|-----------|---------------|
| Authentication | MFA | TOTP via authenticator app |
| Data Protection | PII encryption | At-rest + in-transit |
| Access Control | Least privilege | RBAC + fine-grained permissions |
| Audit | Activity logs | All mutations logged |

### 12.2 Compliance

**LGPD (Lei Geral de Proteção de Dados):**
- [ ] Consentimento explícito
- [ ] Direito ao esquecimento
- [ ] Portabilidade de dados
- [ ] Minimização de dados

**Outros:**
- {{COMPLIANCE_1}}
- {{COMPLIANCE_2}}

### 12.3 Privacy

**Dados coletados:**
- {{DATA_TYPE_1}}: {{PURPOSE}}
- {{DATA_TYPE_2}}: {{PURPOSE}}

**Retenção:**
- {{DATA_TYPE}}: {{RETENTION_PERIOD}}

**Third-party sharing:**
- {{PARTY}}: {{DATA_SHARED}}: {{PURPOSE}}

---

## 13. Success Metrics & OKRs

### 13.1 OKRs - Q1

**Objective 1:** {{OBJECTIVE_1}}
- KR1: {{KEY_RESULT_1}} ({{BASELINE}} → {{TARGET}})
- KR2: {{KEY_RESULT_2}} ({{BASELINE}} → {{TARGET}})
- KR3: {{KEY_RESULT_3}} ({{BASELINE}} → {{TARGET}})

**Objective 2:** {{OBJECTIVE_2}}
- KR1: {{KEY_RESULT_1}} ({{BASELINE}} → {{TARGET}})
- KR2: {{KEY_RESULT_2}} ({{BASELINE}} → {{TARGET}})

### 13.2 Métricas de Produto

**Engajamento:**
- DAU (Daily Active Users): {{TARGET}}
- MAU (Monthly Active Users): {{TARGET}}
- DAU/MAU Ratio: {{TARGET}}
- Session Duration: {{TARGET}}

**Conversão:**
- Sign-up Conversion: {{TARGET}}
- Activation Rate: {{TARGET}}
- Feature Adoption: {{TARGET}}

**Retenção:**
- Day 1 Retention: {{TARGET}}
- Day 7 Retention: {{TARGET}}
- Day 30 Retention: {{TARGET}}

---

## 14. Risks & Assumptions

### 14.1 Riscos Técnicos

| # | Risco | Impacto | Prob. | Mitigação | Owner |
|---|-------|---------|-------|-----------|-------|
| 1 | {{RISK_1}} | High | Med | {{MITIGATION}} | {{OWNER}} |
| 2 | {{RISK_2}} | Med | High | {{MITIGATION}} | {{OWNER}} |
| 3 | {{RISK_3}} | Low | Low | {{MITIGATION}} | {{OWNER}} |

### 14.2 Riscos de Negócio

| # | Risco | Impacto | Prob. | Mitigação | Owner |
|---|-------|---------|-------|-----------|-------|
| 1 | {{RISK_1}} | High | Med | {{MITIGATION}} | {{OWNER}} |
| 2 | {{RISK_2}} | Med | High | {{MITIGATION}} | {{OWNER}} |

### 14.3 Assumptions (Premissas)

**Validadas:**
- [x] {{ASSUMPTION_1}}
- [x] {{ASSUMPTION_2}}

**A Validar:**
- [ ] {{ASSUMPTION_3}}
- [ ] {{ASSUMPTION_4}}

**Dependências Externas:**
- {{DEPENDENCY_1}}
- {{DEPENDENCY_2}}

---

## 15. Project Scope

### 15.1 In Scope

✅ O que ESTÁ incluído no projeto:
- {{ITEM_1}}
- {{ITEM_2}}
- {{ITEM_3}}

### 15.2 Out of Scope

❌ O que NÃO está incluído (explicitamente excluído):
- {{ITEM_1}}
- {{ITEM_2}}
- {{ITEM_3}}

### 15.3 Future Considerations

🔮 Features para versões futuras:
- **V2.0:** {{FEATURE_1}}
- **V3.0:** {{FEATURE_2}}

---

## 16. Timeline & Roadmap

### 16.1 MVP (Minimum Viable Product)

**Target:** {{MVP_DATE}}

**Features incluídas:**
- [ ] {{FEATURE_1}}
- [ ] {{FEATURE_2}}
- [ ] {{FEATURE_3}}

**Success criteria:**
- {{CRITERION_1}}
- {{CRITERION_2}}

### 16.2 V1.0

**Target:** {{V1_DATE}}

**Features adicionais:**
- [ ] {{FEATURE_10}}
- [ ] {{FEATURE_11}}
- [ ] {{FEATURE_12}}

### 16.3 V2.0

**Target:** {{V2_DATE}}

**Features de expansão:**
- [ ] {{FEATURE_20}}
- [ ] {{FEATURE_21}}
- [ ] {{FEATURE_22}}

### 16.4 Milestones

```
Jan    Feb    Mar    Apr    May    Jun
 │      │      │      │      │      │
 ├──────┤      │      │      │      │
 Alpha  Beta   │      │      │      │
        │      ├──────┤      │      │
        │      MVP    V1.0   │      │
        │             │      ├──────┤
        │             │      V2.0   │
```

---

## 17. Team & Stakeholders

### 17.1 Core Team

| Papel | Nome | Responsabilidade |
|-------|------|------------------|
| Product Owner | {{NAME}} | Priorização, roadmap |
| Tech Lead | {{NAME}} | Arquitetura, tech decisions |
| Design Lead | {{NAME}} | UX/UI, design system |
| QA Lead | {{NAME}} | Quality assurance |

### 17.2 Stakeholders

| Nome | Papel | Interest | Influence |
|------|-------|----------|-----------|
| {{NAME}} | {{ROLE}} | High/Med/Low | High/Med/Low |
| {{NAME}} | {{ROLE}} | High/Med/Low | High/Med/Low |

### 17.3 Decision Making

**RACI Matrix:**

| Decisão | Responsible | Accountable | Consulted | Informed |
|---------|-------------|-------------|-----------|----------|
| Feature prioritization | PO | CEO | Tech Lead | Team |
| Tech stack | Tech Lead | CTO | Team | PO |
| Design | Design Lead | CPO | PO | Team |

---

## 18. Open Questions

| # | Questão | Owner | Deadline | Status |
|---|---------|-------|----------|--------|
| 1 | {{QUESTION_1}} | {{OWNER}} | {{DATE}} | Open |
| 2 | {{QUESTION_2}} | {{OWNER}} | {{DATE}} | Answered |
| 3 | {{QUESTION_3}} | {{OWNER}} | {{DATE}} | Open |

---

## 19. Competitive Analysis

### 19.1 Competidores Diretos

| Competidor | Força | Fraqueza | Nosso Diferencial |
|------------|-------|----------|-------------------|
| {{COMP_1}} | {{STRENGTH}} | {{WEAKNESS}} | {{DIFF}} |
| {{COMP_2}} | {{STRENGTH}} | {{WEAKNESS}} | {{DIFF}} |

### 19.2 Feature Comparison

| Feature | Nós | {{COMP_1}} | {{COMP_2}} | {{COMP_3}} |
|---------|-----|------------|------------|------------|
| {{FEATURE_1}} | ✅ | ✅ | ❌ | ✅ |
| {{FEATURE_2}} | ✅ | ❌ | ✅ | ❌ |
| {{FEATURE_3}} | ✅ | ✅ | ✅ | ✅ |

**Nossa vantagem competitiva:**
- {{ADVANTAGE_1}}
- {{ADVANTAGE_2}}

---

## 20. References & Research

### 20.1 Market Research

- {{RESEARCH_1}}
- {{RESEARCH_2}}

### 20.2 User Research

- {{RESEARCH_1}}
- {{RESEARCH_2}}

### 20.3 Technical References

- {{REFERENCE_1}}
- {{REFERENCE_2}}

---

## Appendix: Change Log

| Data | Versão | Mudança | Autor |
|------|--------|---------|-------|
| {{DATE}} | 1.0.0 | PRD inicial | {{AUTHOR}} |

---

*PRD Template baseado no Squad PRD Template v1.0*
*Adaptado para apps e produtos digitais*
