# Conversão Extrema Squad

**Domain:** Tráfego Pago, Conversão e Remarketing
**Based on:** Thiago Tessman — Conversão Extrema (204 lições, 15 módulos)
**Version:** 1.0.0
**Status:** Active

---

## Visão Geral

O **Conversão Extrema Squad** é uma equipe especializada em tráfego pago e otimização de conversão, baseada na metodologia completa de Thiago Tessman. Este squad domina as estratégias de Google Ads, Facebook/Instagram Ads, remarketing cross-platform e venda massiva.

### Frameworks Principais

| Framework | Descrição | Aplicação |
|-----------|-----------|-----------|
| **Círculo 6V** | Matriz de comunicação persuasiva (6 variáveis) | Copy de anúncios, landing pages |
| **P1 vs P2** | Segmentação de públicos quentes e frios | Facebook/Instagram targeting |
| **Mapa das Palavras** | Mapeamento de gatilhos e objeções | Copy estratégica, scripts de venda |
| **Comunicação Persuasiva** | Técnicas de persuasão e storytelling | Anúncios, VSLs, webinars |
| **Venda Massiva** | Estrutura 80/20 para lançamentos | Webinars de conversão, lives de venda |

---

## Agentes Disponíveis

| Agente | Tier | Role | Ativação |
|--------|------|------|----------|
| **@traffic-masters-chief** | Orchestrator | Orquestrador, diagnóstico inicial, routing | `/conversao-extrema:agents:traffic-masters-chief` |
| **@tessman-strategist** | Tier 0 | Estrategista (Círculo 6V, Plano de Crescimento) | `/conversao-extrema:agents:tessman-strategist` |
| **@tessman-google-ads** | Tier 1 | Especialista em Google Ads (Search, Display, YouTube) | `/conversao-extrema:agents:tessman-google-ads` |
| **@tessman-meta-ads** | Tier 1 | Especialista em Facebook/Instagram Ads | `/conversao-extrema:agents:tessman-meta-ads` |
| **@tessman-copy** | Tier 1 | Comunicação Persuasiva, Word Mapping, Copy de Ads | `/conversao-extrema:agents:tessman-copy` |
| **@tessman-remarketing** | Tier 2 | Remarketing 2.0, Ultra Segmentação Cross-Platform | `/conversao-extrema:agents:tessman-remarketing` |

---

## Comandos Disponíveis

### @traffic-masters-chief (Orchestrator)
- `*diagnose` — Diagnóstico Círculo 6V + routing para especialista
- `*google-ads` — Ativar especialista Google Ads
- `*meta-ads` — Ativar especialista Meta Ads
- `*remarketing` — Ativar especialista Remarketing
- `*copy` — Ativar especialista Comunicação Persuasiva
- `*venda-massiva` — Consultoria estratégica de escala

### @tessman-strategist (Tier 0 — Diagnóstico)
- `*diagnose-6v` — Diagnóstico Círculo 6V completo
- `*plan-growth` — Plano de crescimento (estágio atual → meta)
- `*assess-base` — Avaliar Base da Multiplicação (oferta + mensagem + público)
- `*budget-strategy` — Definir alocação de budget Google vs Facebook
- `*scaling-roadmap` — Roadmap para faturamento 100k+/mês

### @tessman-google-ads (Tier 1 — Google Ads)
- `*create-search-campaign` — Criar campanha de busca (estrutura completa)
- `*create-display-campaign` — Configurar campanha de Display
- `*setup-youtube-ads` — Configurar campanha YouTube Ads
- `*keyword-research` — Pesquisa de palavras-chave (10-30 por grupo)
- `*optimize-campaign` — Otimizar campanha existente (lance, negativação, escala)
- `*analyze-search-terms` — Analisar termos de pesquisa

### @tessman-meta-ads (Tier 1 — Facebook/Instagram)
- `*create-p1-campaign` — Criar campanha P1 (públicos quentes)
- `*create-p2-campaign` — Criar campanha P2 (públicos frios)
- `*test-audiences` — Configurar testes de interesse (1 por conjunto)
- `*setup-lookalike` — Criar públicos semelhantes
- `*optimize-cbo` — Otimizar CBO (Campaign Budget Optimization)
- `*customize-positioning` — Personalizar posicionamentos (feed 1:1 + stories 9:16)

### @tessman-copy (Tier 1 — Comunicação Persuasiva)
- `*word-mapping` — Executar Mapa das Palavras (gatilhos/objeções do público)
- `*write-ad-copy` — Escrever copy de anúncio (P1 ou P2)
- `*write-landing-page` — Escrever copy de landing page
- `*create-headlines` — Criar headlines persuasivas
- `*apply-triggers` — Aplicar gatilhos mentais na comunicação
- `*6v-copy-audit` — Auditar copy usando framework Círculo 6V

### @tessman-remarketing (Tier 2 — Remarketing 2.0)
- `*setup-remarketing` — Configurar remarketing completo (Google + Meta)
- `*create-audiences` — Criar listas por temperatura (quente/morno/frio)
- `*optimize-frequency` — Otimizar frequência por temperatura
- `*cross-platform-strategy` — Sincronizar remarketing Google + Facebook
- `*setup-observation-lists` — Configurar listas de observação
- `*create-exclusion-lists` — Criar listas de exclusão (conversões)

---

## Quick Start

### 1. Diagnóstico Inicial (Círculo 6V)

```bash
/conversao-extrema:agents:traffic-masters-chief
*diagnose
```

### 2. Criar Campanha Google Ads do Zero

```bash
/conversao-extrema:agents:tessman-google-ads
*keyword-research
*create-search-campaign
```

### 3. Criar Campanha Facebook Ads (P1 ou P2)

```bash
/conversao-extrema:agents:tessman-meta-ads
*create-p1-campaign  # Públicos quentes
# ou
*create-p2-campaign  # Públicos frios
```

### 4. Mapear Palavras do Público

```bash
/conversao-extrema:agents:tessman-copy
*word-mapping
```

### 5. Configurar Remarketing Cross-Platform

```bash
/conversao-extrema:agents:tessman-remarketing
*setup-remarketing
*cross-platform-strategy
```

### 6. Estratégia de Escala

```bash
/conversao-extrema:agents:tessman-strategist
*scaling-roadmap
```

---

## Arquitetura do Squad

```
conversao-extrema/
├── README.md (este arquivo)
├── config.yaml (configuração do squad)
├── agents/
│   ├── traffic-masters-chief.md (Orchestrator)
│   ├── tessman-strategist.md (Tier 0 — Diagnóstico)
│   ├── tessman-google-ads.md (Tier 1 — Google Ads)
│   ├── tessman-meta-ads.md (Tier 1 — Meta Ads)
│   ├── tessman-copy.md (Tier 1 — Comunicação Persuasiva)
│   └── tessman-remarketing.md (Tier 2 — Remarketing 2.0)
├── tasks/
│   ├── diagnose-business.md
│   ├── create-search-campaign.md
│   ├── create-meta-campaign.md
│   ├── design-remarketing-strategy.md
│   ├── word-mapping.md
│   └── audit-campaigns.md
├── workflows/
│   └── wf-full-campaign-launch.yaml
├── data/
│   └── conversao-extrema-kb.md (knowledge base)
├── checklists/
│   └── campaign-launch-checklist.md
└── minds/
    └── thiago-tessman/
        └── mind_dna_complete.yaml
```

---

## Metodologia Tessman — Pilares Fundamentais

### 1. Círculo 6V (Comunicação Persuasiva)

Matriz de 6 variáveis para copy de alta conversão:

1. **Valor** — O que entrego?
2. **Vantagem** — Por que sou diferente?
3. **Vocabulário** — Palavras do cliente (Mapa das Palavras)
4. **Vulnerabilidade** — Dor/problema reconhecido
5. **Velocidade** — Urgência e escassez
6. **Verdade** — Prova social e autoridade

### 2. Google Ads — Estrutura Hierárquica

```
Campanha (produto/serviço)
  └── Grupo de Anúncios (intenção específica)
      ├── Palavras-chave (10-30 por grupo)
      ├── Anúncios (mín. 3 variações)
      └── Landing Page (específica para intenção)
```

**Regra de Ouro:** 1 campanha = 1 produto. Nunca misture produtos na mesma campanha.

### 3. Facebook/Instagram — P1 vs P2

| Tipo | Público | Estratégia | Budget |
|------|---------|------------|--------|
| **P1** | Quente (engajados, visitantes, leads) | CBO, públicos amplos, criativos testados | 60-70% |
| **P2** | Frio (interesses, lookalike) | ABO, 1 interesse/conjunto, testes | 30-40% |

### 4. Remarketing — Temperatura e Frequência

| Temperatura | Frequência Ideal | Ação |
|-------------|------------------|------|
| Quente | 3-5x/semana | Manter contato, ofertas |
| Morno | 1-2x/semana | Nutrir, educar |
| Frio | Máx 1x/semana | Reativar com novidade |

**Regra Crítica:** Sempre exclua conversões das listas de remarketing.

### 5. Venda Massiva — Estrutura 80/20

- **80% Preparação** — Aquecer, educar, construir autoridade (5-7 dias)
- **20% Venda** — Webinar/live com Efeito W (3 picos de oferta)

**Efeito W:** Oferta no minuto 10 → Oferta no minuto 45 → Oferta final (minuto 75+)

---

## 10 Mandamentos do Tráfego Pago (Tessman)

1. **Nunca misture produtos** na mesma campanha
2. **Teste 1 variável por vez** (interesse, copy, criativo)
3. **CPA é o rei** — ignore métricas de vaidade
4. **Escale devagar** (+20% máximo por ajuste)
5. **Remarketing sempre ativo** — nunca pause
6. **Exclua quem converteu** de todas as listas
7. **Keyword research profunda** (10-30 palavras/grupo)
8. **Comunicação = Vocabulário do cliente** (Mapa das Palavras)
9. **Landing page específica** por intenção/público
10. **Otimize diariamente**, ajuste semanalmente, escale mensalmente

---

## Anti-Patterns (11 Erros Críticos)

❌ Misturar produtos na mesma campanha
❌ Escalar rápido demais (>20% de uma vez)
❌ Ignorar termos de pesquisa (Google Ads)
❌ Não excluir conversões do remarketing
❌ Testar múltiplas variáveis simultaneamente
❌ Pausar campanhas aos finais de semana
❌ Usar copy genérica (não usar vocabulário do cliente)
❌ Landing page genérica para múltiplas intenções
❌ Não acompanhar CPA diariamente
❌ Confiar apenas em métricas de topo de funil (CTR, CPM)
❌ Não ter estratégia de remarketing

---

## Métricas e Budget

### Métricas Primárias

| Métrica | Descrição | Target |
|---------|-----------|--------|
| **CPA** | Custo por aquisição | Definido por LTV/margem |
| **ROAS** | Return on ad spend | Mín. 3:1 (ideal 5:1+) |
| **Taxa de Conversão** | Landing page → lead/venda | Google: 5%+, Meta: 3%+ |

### Budget Recomendado

| Plataforma | Investimento Mínimo | Ideal para Testes |
|------------|---------------------|-------------------|
| Google Ads Search | R$ 1.500/mês | R$ 3.000-5.000/mês |
| Facebook/Instagram | R$ 1.000/mês | R$ 2.500-4.000/mês |
| Remarketing (ambos) | R$ 500/mês | R$ 1.000-2.000/mês |

**Regra de Escala:** Aumentar no máximo 20% do budget a cada ajuste bem-sucedido.

---

## Rotina de Otimização

### Diária (15-30 min)
- Verificar CPA e ROAS
- Analisar termos de pesquisa (Google Ads)
- Pausar anúncios com CPA >150% do target
- Verificar frequência de remarketing

### Semanal (1-2h)
- Analisar performance por grupo de anúncios
- Adicionar palavras-chave negativas
- Ajustar lances (se manual ou CPA desejado)
- Criar novas variações de anúncios vencedores
- Revisar segmentação (Facebook/Instagram)

### Mensal (3-4h)
- Revisar estratégia completa
- Escalar campanhas vencedoras (+20% budget)
- Pausar campanhas com CPA consistentemente alto
- Testar novos públicos/interesses
- Criar campanhas sazonais/promocionais

---

## Integração com Outros Squads

| Squad | Integração | Comandos Relacionados |
|-------|------------|----------------------|
| **copywriting-squad** | Copy de anúncios e landing pages | `/copywriting-squad:create-ad-copy` |
| **content-engine** | Criativos para anúncios (imagens, vídeos) | `/content-engine:generate-ad-creative` |
| **hormozi** | Estrutura de oferta irresistível | `/hormozi:create-grand-slam-offer` |
| **dan-koe** | Gatilhos de atenção e storytelling | `/dan-koe:attention-hooks` |

---

## Próximos Passos

1. **Ative o agente apropriado** para sua necessidade
2. **Execute o comando** correspondente
3. **Siga o workflow** recomendado pelo agente
4. **Monitore métricas** diariamente
5. **Otimize** com base nos dados

---

## Referências

- **Knowledge Base Completa:** `data/conversao-extrema-kb.md`
- **Checklist de Lançamento:** `checklists/campaign-launch-checklist.md`
- **Metodologia Tessman:** Conversão Extrema (204 lições, 15 módulos)

---

**Conversão Extrema Squad v1.0.0**
*Tráfego Pago Estratégico | Conversão Otimizada | Venda Massiva*
*Based on Thiago Tessman's Proven Methodology*
