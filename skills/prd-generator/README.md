---
name: prd-generator
version: 1.0.0
trigger: "/gerar-prd"
description: "Gera Product Requirements Document (PRD) profissional a partir de ideias de apps"
category: product-management
author: "AIOS Core"
tags:
  - prd
  - product
  - requirements
  - documentation
---

# 📄 PRD Generator

Skill para gerar Product Requirements Documents (PRDs) profissionais a partir de ideias de apps.

## 🎯 Objetivo

Transformar ideias vagas ou simples de apps em PRDs completos e bem estruturados, prontos para desenvolvimento.

## 🔧 Como Funciona

1. **Coleta informações** sobre a ideia do app
2. **Analisa e expande** a ideia com perguntas estruturadas
3. **Gera PRD completo** seguindo template profissional
4. **Valida** requisitos e escopo
5. **Retorna** PRD formatado e pronto para uso

## 📋 Uso

```bash
# Via Claude Code
/gerar-prd

# Ou diretamente
npx aios-core skill prd-generator
```

## 🧠 Estrutura do PRD Gerado

### 1. Executive Summary
- Visão geral do produto
- Problema que resolve
- Proposta de valor única
- Público-alvo principal

### 2. Product Overview
- **Nome do produto**
- **Categoria**
- **Plataformas** (Web, Mobile, Desktop)
- **Modelo de negócio**

### 3. Problem Statement
- Problema atual detalhado
- Dores dos usuários
- Gap no mercado
- Oportunidade identificada

### 4. Target Audience
- **Persona primária**: Características, objetivos, frustrações
- **Persona secundária**: Se aplicável
- **Tamanho de mercado**
- **Segmentação**

### 5. Goals & Objectives
- Objetivos de negócio (SMART)
- Objetivos de produto
- KPIs e métricas de sucesso
- Timeline de alto nível

### 6. User Stories & Use Cases
- User stories principais (formato: Como [usuário], quero [ação], para [benefício])
- Casos de uso detalhados
- Jornada do usuário

### 7. Features & Requirements
- **Must Have** (P0): Essenciais para MVP
- **Should Have** (P1): Importantes mas não críticas
- **Could Have** (P2): Desejáveis
- **Won't Have** (P3): Fora do escopo

### 8. Functional Requirements
- RF01, RF02, RF03... (numerados)
- Descrição detalhada de cada funcionalidade
- Critérios de aceitação

### 9. Non-Functional Requirements
- **Performance**: Tempo de resposta, throughput
- **Segurança**: Autenticação, autorização, criptografia
- **Escalabilidade**: Usuários simultâneos, crescimento
- **Usabilidade**: Acessibilidade, UX guidelines
- **Confiabilidade**: Uptime, disaster recovery
- **Manutenibilidade**: Code quality, documentation

### 10. Technical Stack (Suggested)
- **Frontend**: Frameworks e bibliotecas
- **Backend**: Runtime, frameworks
- **Database**: Tipo, justificativa
- **Infrastructure**: Cloud provider, CI/CD
- **Third-party integrations**: APIs, serviços

### 11. User Experience (UX)
- Wireframes descritos
- Fluxos principais
- Design guidelines
- Accessibility requirements

### 12. Architecture (High-Level)
- Arquitetura proposta
- Componentes principais
- Integrações
- Data flow

### 13. Security & Compliance
- Requisitos de segurança
- Compliance (LGPD, GDPR, etc)
- Privacy considerations
- Data protection

### 14. Success Metrics
- OKRs (Objectives and Key Results)
- KPIs quantitativos
- Métricas de engajamento
- Critérios de sucesso do MVP

### 15. Risks & Assumptions
- **Riscos técnicos**: Probabilidade e impacto
- **Riscos de negócio**
- **Assumptions**: Premissas validar
- **Mitigações**

### 16. Project Scope
- **In Scope**: O que está incluído
- **Out of Scope**: O que NÃO está incluído
- **Future Considerations**: Roadmap futuro

### 17. Timeline & Milestones
- **MVP**: Features e prazo
- **V1.0**: Features adicionais
- **V2.0**: Expansão
- **Milestones**: Marcos importantes

### 18. Stakeholders
- Product Owner
- Tech Lead
- Design Lead
- Key stakeholders
- Decisores

### 19. Open Questions
- Questões pendentes
- Decisões a tomar
- Validações necessárias

### 20. References & Research
- Competitors analysis
- Market research
- User research
- Technical references

## 🎨 Template de Coleta

O skill usa perguntas estruturadas para coletar informações:

```
1. Qual é o nome do app ou ideia principal?
2. Que problema ele resolve?
3. Quem é o público-alvo principal?
4. Quais são as 3 principais funcionalidades?
5. Existe competidor direto? Qual?
6. Qual plataforma? (Web/Mobile/Ambos)
7. Alguma tecnologia específica em mente?
8. Algum requisito especial? (tempo real, offline, etc)
```

## 🚀 Modo Rápido vs. Completo

### Modo Rápido (default)
- Coleta informações essenciais
- Gera PRD em 5-10 minutos
- Foco em MVP

### Modo Completo
- Perguntas aprofundadas
- PRD extenso e detalhado
- Análise de mercado incluída
- Gera em 15-30 minutos

## 📊 Output

O PRD é gerado em formato Markdown, pronto para:
- ✅ Copiar para Obsidian
- ✅ Usar em `/preencher-app`
- ✅ Compartilhar com equipe
- ✅ Converter para PDF/Docs

## 🎯 Exemplos

### Input Simples:
> "App de lista de tarefas para desenvolvedores"

### PRD Gerado (resumo):
```markdown
# PRD: DevTasker - Task Management for Developers

## Executive Summary
DevTasker é um app de gerenciamento de tarefas otimizado para
desenvolvedores, integrando com Git, GitHub Issues, e IDEs.

## Problem Statement
Desenvolvedores perdem tempo alternando entre ferramentas (Jira,
Trello, GitHub) e desejam algo integrado ao workflow de código.

## Target Audience
- **Primary**: Desenvolvedores Full-Stack (25-40 anos)
- **Secondary**: Tech Leads e Engineering Managers
- **Market Size**: 25M+ desenvolvedores globalmente

[... continua com todas as 20 seções ...]
```

## 🔗 Integração

Este skill se integra com:
- **`obsidian-app-filler`**: PRD → App preenchido
- **`criar-app-completo`**: Workflow end-to-end
- **`@po` agent**: Product Owner para revisão

## ⚙️ Configuração

Personalize o template em:
```
skills/prd-generator/templates/prd-template.md
```

## 🎓 Best Practices

1. **Seja específico**: Quanto mais detalhes, melhor o PRD
2. **Pense no usuário**: Foco em problemas reais
3. **Valide premissas**: Liste assumptions para validar
4. **Priorize features**: Use MoSCoW (Must, Should, Could, Won't)
5. **Métricas claras**: Defina sucesso objetivamente

## 📝 Notas

- PRDs são documentos vivos, espera-se revisões
- Use como base para discussões com equipe
- Adapte seções conforme necessidade do projeto
- Mantenha atualizado conforme produto evolui

---

**Versão:** 1.0.0
**Última atualização:** 2026-02-06
**Autor:** AIOS Core Team
