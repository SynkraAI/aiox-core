# Project Brief: ShapeAI

**Versão:** 1.0 | **Data:** Abril 2026 | **Status:** Draft

---

## Executive Summary

O **ShapeAI** é um aplicativo mobile que usa visão computacional e IA generativa para analisar o shape corporal de uma pessoa a partir de fotos e entregar um relatório personalizado de pontos fortes, pontos de desenvolvimento e um plano de treino específico para aquele corpo. O produto resolve um problema claro: avaliação corporal profissional é cara, inacessível e não escala — o ShapeAI democratiza esse acesso a partir do smartphone, sem hardware adicional, com análise instantânea e plano acionável.

---

## 1. Problem Statement

**Estado atual:**
- Avaliação física profissional custa R$ 150–500 por sessão e requer equipamentos como bioimpedância, plicômetro ou scanner 3D
- A maioria das pessoas que treina (estimados 40M+ de frequentadores de academia no Brasil) **nunca fez uma avaliação corporal estruturada**
- Apps de treino existentes (Freeletics, FitnessAI, Nike Training) geram planos genéricos sem considerar o shape real do usuário
- Quem treina sem avaliação tende a trabalhar grupos musculares que já são fortes e negligenciar os deficitários — resultado: assimetrias, lesões, estagnação

**Impacto do problema:**
- 80% dos iniciantes em academia abandonam em menos de 3 meses (falta de direcionamento claro como fator principal)
- Gasto médio desperdiçado em suplementos e planos genéricos: R$ 200–500/mês sem retorno percebido

**Por que soluções atuais falham:**
- Hardware (InBody, Styku) → caro, inacessível, disponível só em academias equipadas
- Coaches online (Future, Caliber) → custo R$ 500–1500/mês, não escala
- Apps genéricos → sem personalização baseada no corpo real da pessoa

**Urgência:** o mercado de AI fitness está em fase de adoção massiva (2025–2027), com janela competitiva antes da comoditização pelos big tech.

---

## 2. Proposed Solution

**Conceito central:**

> Foto → Análise de shape por IA → Relatório visual (pontos fortes / desenvolvimento) → Plano de treino personalizado e evolutivo

**Como funciona:**
1. Usuário tira 2–3 fotos guiadas por AR (frente, lado, costas)
2. Vision AI mapeia proporções musculares, postura, simetria e estimativas de composição
3. LLM gera relatório estruturado com linguagem positiva e técnica
4. Sistema gera plano de treino semanal específico para o perfil identificado
5. Re-análise mensal com nova foto → plano evolui com o progresso

**Diferenciadores principais:**

| Diferencial | Descrição |
|-------------|-----------|
| **Zero hardware** | Só o smartphone é necessário |
| **AR de captura** | Guia o usuário no ângulo correto eliminando erro humano |
| **Relatório evolutivo** | Re-análise mensal compara o progresso visualmente |
| **Framing positivo** | Foco em "potencial de desenvolvimento", não em "defeitos" |
| **Privacy-first** | Processamento on-device para dados sensíveis |

---

## 3. Target Users

### Segmento Primário: Fitness Enthusiast

- **Perfil:** 22–40 anos, frequenta academia 3x+/semana, tem smartphone mid-high, investimento mensal em saúde de R$ 100–300
- **Comportamento atual:** Treina com plano genérico do YouTube ou da academia, não sabe se está evoluindo proporcionalmente
- **Dor central:** "Treino há 6 meses mas não sei se estou desenvolvendo as partes certas do corpo"
- **Goal:** Ter um plano específico para o SEU corpo, não para um corpo genérico
- **WTP:** R$ 39–79/mês

### Segmento Secundário: Academia / Personal Trainer (B2B)

- **Perfil:** Academia low-cost (Smart Fit, Bluefit segment) ou personal trainer independente com 10–50 alunos
- **Comportamento atual:** Faz avaliações manuais com bioimpedância ou plicômetro — consome 30–60 min por aluno
- **Dor central:** "Avaliação é gargalo — consome tempo e não escala com minha base de alunos"
- **Goal:** Escalar atendimento com qualidade, oferecer diferencial tecnológico para reter alunos
- **WTP:** R$ 499–999/mês por licença multi-usuário

---

## 4. Goals & Success Metrics

### Objetivos de Negócio

- Atingir **10.000 usuários ativos** em 6 meses pós-lançamento
- Atingir **MRR de R$ 150K** ao final do Ano 1
- Fechar **50 contratos B2B** (academias/personais) em 12 meses
- Churn mensal < 8% (benchmark fitness apps: 10–15%)

### User Success Metrics

- Usuário completa primeira análise em < 5 minutos do primeiro acesso
- ≥ 70% dos usuários tiram nova foto no mês 2 (retenção por re-análise)
- NPS ≥ 50 após primeiro relatório

### KPIs

| KPI | Meta (Ano 1) |
|-----|-------------|
| CAC (Custo de Aquisição) | < R$ 30 B2C / < R$ 500 B2B |
| LTV estimado | R$ 480 B2C (12 meses) / R$ 6.000 B2B |
| Taxa de conversão Free → Pro | ≥ 15% |
| Análises realizadas/usuário/mês | ≥ 1.5 |
| Retenção D30 | ≥ 40% |

---

## 5. MVP Scope

### Core Features (Must Have)

- **Captura guiada por AR:** Overlay no viewfinder para posicionamento correto do usuário (frente e costas no mínimo)
- **Análise por Vision AI:** Mapeamento de proporções musculares, postura e simetria estimada
- **Relatório visual:** Pontos de destaque (fortes) e pontos de desenvolvimento com linguagem positiva e técnica
- **Plano de treino gerado:** 4–6 semanas de treino semanalmente estruturado, específico para o perfil identificado
- **Histórico de análises:** Timeline de fotos e relatórios para visualizar progresso
- **Autenticação e perfil básico:** Email/social login, dados básicos (altura, peso, objetivo)
- **Paywall Freemium:** 1 análise gratuita, assinatura para ilimitadas + plano completo

### Fora do Escopo para MVP

- Plano nutricional/alimentar
- Integração com wearables
- Avatar 3D
- Dashboard B2B multi-usuário
- White-label para influencers
- Simulador de shape futuro
- Funcionalidades sociais/ranking
- Modo "referência de atleta"

### MVP Success Criteria

O MVP será validado quando: ≥ 500 usuários completarem análise, ≥ 15% converterem para Pro e NPS ≥ 45 na primeira semana pós-lançamento.

---

## 6. Post-MVP Vision

### Fase 2 (Meses 7–12)
- Plano nutricional derivado da análise corporal
- Re-análise automática com alerta mensal
- Dashboard B2B para academias e personal trainers
- Integração Apple Health / Google Fit

### Fase 3 (Ano 2)
- White-label para influencers e marcas fitness
- Simulador visual de shape futuro ("como você ficará em X semanas")
- Modo social anônimo com comparação de progresso
- API para integração com equipamentos de academia

### Visão de Longo Prazo (2–3 anos)

Tornar-se o **layer de inteligência corporal** de referência no fitness digital — o produto que toda academia, personal trainer e entusiasta usa como base para decisões de treino, nutrição e saúde.

---

## 7. Technical Considerations

### Platform Requirements
- **Plataformas:** iOS 16+ e Android 12+ (mobile-first)
- **Performance:** Análise de foto em < 10 segundos
- **Offline:** Captura offline, upload e análise com conectividade

### Technology Preferences

| Camada | Preferência |
|--------|-------------|
| Frontend Mobile | React Native (iOS + Android em codebase única) |
| Backend | Node.js + Python (microserviços: API REST + AI service) |
| Vision AI | Google Vision API / MediaPipe (body landmarks) |
| LLM (relatório + plano) | Claude API (claude-sonnet-4-6) com prompt caching |
| Database | PostgreSQL (dados estruturados) + S3 (armazenamento de fotos) |
| Auth | Supabase Auth |
| Infraestrutura | AWS ou GCP, containerizado |

### Architecture Considerations
- **Privacy-first:** Fotos processadas e descartadas do servidor após análise (não armazenadas permanentemente sem consentimento explícito)
- **Compliance:** LGPD (Brasil) + GDPR (Europa) — dados biométricos exigem consentimento explícito e política de retenção clara
- **Disclaimer médico:** Análise é estimativa técnica, não diagnóstico médico — required em todas as interfaces de resultado

---

## 8. Constraints & Assumptions

### Constraints

| Dimensão | Detalhe |
|----------|---------|
| **Regulação** | Fotos corporais são dados biométricos sensíveis — LGPD/GDPR exige DPA, consentimento granular e política de retenção |
| **Precisão** | Análise por 2D foto tem limitações vs. scanner 3D — expectativas devem ser gerenciadas com clareza |
| **Timeline MVP** | 3–4 meses de desenvolvimento com time de 3–4 pessoas |
| **Budget estimado** | R$ 80K–150K para MVP (desenvolvimento + infraestrutura + jurídico) |

### Key Assumptions

- Usuários aceitam tirar fotos do corpo para uma análise se a privacidade for claramente comunicada
- Vision AI atual (MediaPipe + LLM) tem precisão suficiente para análise de proporções (validar em protótipo)
- O preço de R$ 39/mês é acessível para o segmento primário
- Personal trainers veem a ferramenta como auxiliar, não como ameaça ao seu trabalho

---

## 9. Risks & Open Questions

### Key Risks

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| **Precisão insuficiente da análise** | Alto — core value proposition | Validar com protótipo antes de investir em produto completo |
| **Impacto emocional negativo** | Alto — reputação e churn | Framing positivo, moderação de conteúdo, opção de ocultar análise detalhada |
| **Compliance LGPD/GDPR** | Alto — risco jurídico | Consulta jurídica antes do lançamento, DPO, política de privacidade robusta |
| **Big tech entrando no mercado** | Médio — competição | Mover rápido, construir brand e base antes da comoditização |
| **Churn alto pós-primeira análise** | Médio — LTV baixo | Re-análise mensal como loop de retenção central |

### Open Questions

- Qual nível de precisão da análise por foto é "bom o suficiente" para o usuário confiar? (Requer teste com usuários reais)
- Como tratar usuários com condições físicas especiais (deficiências, pós-cirurgia)?
- On-device ML é viável no MVP ou é complexidade desnecessária para a fase 1?
- Qual o melhor canal de aquisição — TikTok orgânico via influencers ou pago?

### Areas Needing Further Research

- Validação de precisão técnica da análise por foto (teste com fisiologistas)
- Pesquisa qualitativa com usuários sobre conforto em compartilhar fotos corporais
- Benchmark de churn em apps fitness freemium similares
- Modelo jurídico para dados biométricos no Brasil

---

## 10. Next Steps

1. **Validar precisão técnica** — construir protótipo de análise com MediaPipe + Claude API e testar com 20–30 fotos reais
2. **Pesquisa qualitativa** — entrevistar 10 potenciais usuários do segmento primário sobre privacidade e percepção de valor
3. **Consulta jurídica** — mapear requisitos LGPD para dados biométricos antes de qualquer desenvolvimento
4. **Definir MVP tech stack** — decisão final sobre on-device vs. server-side processing
5. **Criar PRD** — evoluir este brief para o PRD completo com @pm (Morgan)

---

## Appendix A — Research Summary

- **Brainstorming:** 23 ideias geradas, top pick = Freemium + Re-análise mensal + B2B Academia
- **Market Research:** TAM US$ 37B (2030), SAM US$ 2.2–4.3B, SOM ano 3 = US$ 2.2–21.6M ARR, gap competitivo confirmado
- **Veredicto:** GO — oportunidade válida com riscos conhecidos e mitigáveis

---

## PM Handoff

Este Project Brief fornece o contexto completo para o **ShapeAI**. O próximo passo natural é `@pm` (Morgan) criar o PRD completo usando este documento como input — seção por seção, com foco em requisitos funcionais, não-funcionais e critérios de aceitação.

---

*Gerado por Atlas (Decoder) — AIOS Analyst Agent*
*Synkra AIOS v4.0*
