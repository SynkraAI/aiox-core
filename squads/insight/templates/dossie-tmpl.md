# Dossiê de Presença Digital — {{business_name}}

**Nicho:** {{niche}} | **Cidade:** {{city}}
**Data:** {{date}} | **Portais ativos:** {{niche_portals_list}}

---

## Dados Cadastrais

| Campo | Valor |
|-------|-------|
| Razão Social | {{razao_social}} |
| Nome Fantasia | {{nome_fantasia}} |
| CNPJ | {{cnpj}} |
| Fundação | {{data_abertura}} |
| Porte | {{porte}} |
| Capital Social | {{capital_social}} |
| CNAE | {{cnae}} |
| Sócios | {{socios}} |
| Endereço | {{endereco}} |
| Telefone/WhatsApp | {{telefone}} |
| Email | {{email}} |
| Site | {{site_url}} |
| Instagram | {{instagram_handle}} |
| Facebook | {{facebook_url}} |

**Serviços:** {{servicos_lista}}

<!-- Se dados cadastrais indisponíveis, manter tabela com "Não disponível" — NUNCA omitir seção -->

---

## Score de Maturidade: {{total_score}}/100

| Canal | Score | Peso | Status |
|-------|-------|------|--------|
| Site | {{site_score}}/20 | 20% | {{site_status_emoji}} {{site_status_text}} |
| Google Maps | {{maps_score}}/20 | 20% | {{maps_status_emoji}} {{maps_status_text}} |
| Redes Sociais | {{social_score}}/20 | 20% | {{social_status_emoji}} {{social_status_text}} |
| Reputação | {{reputation_score}}/15 | 15% | {{reputation_status_emoji}} {{reputation_status_text}} |
| Portais de Nicho | {{portals_score}}/15 | 15% | {{portals_status_emoji}} {{portals_status_text}} |
| Consistência (NAP) | {{nap_score}}/10 | 10% | {{nap_status_emoji}} {{nap_status_text}} |

<!--
Score display rules (scoring-rubric.yaml → display_format):
- Verificado: "41/100" (dados diretos em todos os canais)
- Estimado: "~62/100" (algum canal com dados indisponíveis)
- Emojis: ✅ ≥70%, ⚠️ 40-69%, 🔴 <40% do max do canal
-->

---

## Análise por Canal

### Site ({{site_score}}/20)

| Métrica | Valor | Score | Detalhe |
|---------|-------|-------|---------|
| SSL (HTTPS) | {{ssl_status}} | {{ssl_score}}/2 | {{ssl_detail}} |
| Mobile-friendly | {{mobile_status}} | {{mobile_score}}/3 | {{mobile_detail}} |
| PageSpeed Mobile | {{pagespeed_status}} | {{pagespeed_score}}/3 | {{pagespeed_detail}} |
| Meta Tags | {{meta_status}} | {{meta_score}}/2 | {{meta_detail}} |
| Heading/Schema | {{heading_status}} | {{heading_score}}/1 | {{heading_detail}} |
| CTA Visível | {{cta_status}} | {{cta_score}}/2 | {{cta_detail}} |
| Tracking (GA4/GTM) | {{tracking_status}} | {{tracking_score}}/2 | {{tracking_detail}} |
| WhatsApp Button | {{whatsapp_status}} | {{whatsapp_score}}/2 | {{whatsapp_detail}} |
| Blog/Conteúdo | {{blog_status}} | {{blog_score}}/3 | {{blog_detail}} |

**Fonte:** {{site_url}}

<!-- Profundidade: analisar homepage + mínimo 1 página interna (serviços, contato, blog) -->

---

### Google Maps ({{maps_score}}/20)

| Métrica | Valor | Score | Detalhe |
|---------|-------|-------|---------|
| Perfil Reivindicado | {{profile_claimed_status}} | {{profile_claimed_score}}/3 | {{profile_claimed_detail}} |
| Completude | {{completeness_status}} | {{completeness_score}}/3 | {{completeness_detail}} |
| Reviews (qtd) | {{reviews_count}} | {{reviews_count_score}}/4 | {{reviews_count_detail}} |
| Reviews (nota) | {{reviews_rating}} | {{reviews_rating_score}}/3 | {{reviews_rating_detail}} |
| Fotos | {{photos_status}} | {{photos_score}}/3 | {{photos_detail}} |
| Posts Recentes | {{posts_status}} | {{posts_score}}/2 | {{posts_detail}} |
| Horários/Descrição | {{hours_status}} | {{hours_score}}/2 | {{hours_detail}} |

<!-- Se dados indisponíveis: usar ~ prefix no score, flag "⚠️ VERIFICAÇÃO MANUAL", adicionar à seção Limitações -->

---

### Redes Sociais ({{social_score}}/20)

| Rede | Existe? | Atividade | Score | Detalhe |
|------|---------|-----------|-------|---------|
| Instagram | {{ig_exists}} | {{ig_activity}} | {{ig_score}}/{{ig_max}} | {{ig_detail}} |
| Facebook | {{fb_exists}} | {{fb_activity}} | {{fb_score}}/{{fb_max}} | {{fb_detail}} |
| LinkedIn | {{li_exists}} | {{li_activity}} | {{li_score}}/{{li_max}} | {{li_detail}} |
| TikTok | {{tt_exists}} | {{tt_activity}} | {{tt_score}}/{{tt_max}} | {{tt_detail}} |
| YouTube | {{yt_exists}} | {{yt_activity}} | {{yt_score}}/{{yt_max}} | {{yt_detail}} |

<!-- Distribuição dos 20 pontos varia por nicho. Consultar niche_config.channel_weights e scoring-rubric.yaml → social_media -->

---

### Reputação ({{reputation_score}}/15)

| Canal | Nota | Reviews/Reclamações | Taxa Resposta | Score | Status |
|-------|------|---------------------|---------------|-------|--------|
| Reclame Aqui | {{ra_nota}} | {{ra_count}} | {{ra_response_rate}} | {{ra_score}}/8 | {{ra_status}} |
| Google Reviews | {{gr_rating}} | {{gr_count}} | {{gr_response_rate}} | {{gr_score}}/7 | {{gr_status}} |

**Fontes:**
- {{ra_source_url}}
- {{gr_source_url}}

<!-- Google Reviews pode usar dados do canal Google Maps. Não duplicar análise. -->

---

### Portais de Nicho ({{portals_score}}/15)

<!-- Se niche_config.portals = [] → incluir nota: "Nicho sem portais específicos. Peso redistribuído: +8 Maps, +7 Reputação." -->

| Portal | Perfil | Completude | Reviews | Score | Status |
|--------|--------|-----------|---------|-------|--------|
| {{portal_1_name}} | {{portal_1_profile}} | {{portal_1_completude}} | {{portal_1_reviews}} | {{portal_1_score}}/5 | {{portal_1_status}} |
| {{portal_2_name}} | {{portal_2_profile}} | {{portal_2_completude}} | {{portal_2_reviews}} | {{portal_2_score}}/5 | {{portal_2_status}} |
| {{portal_3_name}} | {{portal_3_profile}} | {{portal_3_completude}} | {{portal_3_reviews}} | {{portal_3_score}}/5 | {{portal_3_status}} |

---

### Consistência NAP ({{nap_score}}/10)

| Campo | Site | Maps | Instagram | Facebook | RA | Score | Consistente? |
|-------|------|------|-----------|----------|-----|-------|-------------|
| Nome | {{nap_name_site}} | {{nap_name_maps}} | {{nap_name_ig}} | {{nap_name_fb}} | {{nap_name_ra}} | {{nap_name_score}}/3 | {{nap_name_ok}} |
| Endereço | {{nap_addr_site}} | {{nap_addr_maps}} | — | {{nap_addr_fb}} | — | {{nap_addr_score}}/3 | {{nap_addr_ok}} |
| Telefone | {{nap_phone_site}} | {{nap_phone_maps}} | {{nap_phone_ig}} | {{nap_phone_fb}} | — | {{nap_phone_score}}/2 | {{nap_phone_ok}} |
| Horários | {{nap_hours_site}} | {{nap_hours_maps}} | — | — | — | {{nap_hours_score}}/2 | {{nap_hours_ok}} |

---

## Comparativo — Top 3 Concorrentes

| Métrica | {{business_name}} | {{competitor_1_name}} | {{competitor_2_name}} | {{competitor_3_name}} |
|---------|------|------|------|------|
| Score Total | {{total_score}} | {{c1_score}} | {{c2_score}} | {{c3_score}} |
| Site | {{site_status_short}} | {{c1_site}} | {{c2_site}} | {{c3_site}} |
| Google Maps | {{maps_status_short}} | {{c1_maps}} | {{c2_maps}} | {{c3_maps}} |
| Redes Sociais | {{social_status_short}} | {{c1_social}} | {{c2_social}} | {{c3_social}} |
| Reputação | {{reputation_status_short}} | {{c1_reputation}} | {{c2_reputation}} | {{c3_reputation}} |
| Diferencial | {{business_differentiator}} | {{c1_differentiator}} | {{c2_differentiator}} | {{c3_differentiator}} |

**Gap Competitivo:** {{competitive_gap_summary}}

**Fontes:**
- {{competitor_sources}}

---

## Gaps Priorizados

### 🔴 CRITICO (impacto direto em receita)

1. **{{gap_c1_title}}** — {{gap_c1_description}}
   - **Acao:** {{gap_c1_action}}
   - **Impacto estimado:** +{{gap_c1_points}} pontos

2. **{{gap_c2_title}}** — {{gap_c2_description}}
   - **Acao:** {{gap_c2_action}}
   - **Impacto estimado:** +{{gap_c2_points}} pontos

### 🟡 ALTO (oportunidade de diferenciacao)

3. **{{gap_h1_title}}** — {{gap_h1_description}}
   - **Acao:** {{gap_h1_action}}
   - **Impacto estimado:** +{{gap_h1_points}} pontos

### 🟡 MEDIO (presenca mais completa)

4. **{{gap_m1_title}}** — {{gap_m1_description}}
   - **Impacto estimado:** +{{gap_m1_points}} pontos

### 🔵 BAIXO (nice to have)

5. **{{gap_l1_title}}** — {{gap_l1_description}}
   - **Impacto estimado:** +{{gap_l1_points}} pontos

<!-- Numeros de gaps sao exemplos. Listar TODOS os gaps encontrados, priorizados por impacto no negocio. -->

---

## Quick Wins (alto impacto + baixo esforco)

| # | Acao | Esforco | Impacto Est. |
|---|------|---------|-------------|
| 1 | {{qw1_action}} | {{qw1_effort}} | +{{qw1_points}} pontos |
| 2 | {{qw2_action}} | {{qw2_effort}} | +{{qw2_points}} pontos |
| 3 | {{qw3_action}} | {{qw3_effort}} | +{{qw3_points}} pontos |

**Score estimado apos quick wins: {{estimated_score_quickwins}}/100 (+{{delta_quickwins}})**
**Score estimado apos todas as acoes: {{estimated_score_all}}/100 (+{{delta_all}})**

---

## Observacoes do Investigador

<!-- Insights qualitativos que nao cabem nas tabelas. Maximo 4 observacoes, cada uma com contexto + recomendacao. -->

1. {{observation_1}}
2. {{observation_2}}
3. {{observation_3}}

---

## Limitacoes deste Dossie

| Canal | Limitacao | Impacto no Score | Acao Necessaria |
|-------|-----------|-----------------|-----------------|
| {{limitation_1_channel}} | {{limitation_1_desc}} | {{limitation_1_impact}} | {{limitation_1_action}} |
| {{limitation_2_channel}} | {{limitation_2_desc}} | {{limitation_2_impact}} | {{limitation_2_action}} |

<!-- OBRIGATORIO: listar TODOS os canais onde dados foram estimados (~) ou indisponíveis. Incluir range de score possivel apos verificacao manual. -->

> Apos verificacao manual dos canais acima, o score pode variar de **{{score_range_low}}/100** a **{{score_range_high}}/100**.

---

## Metadados

| Campo | Valor |
|-------|-------|
| Score de confianca do dossie | {{confidence_score}}% |
| Fontes consultadas | {{sources_count}} |
| Ferramentas utilizadas | {{tools_used}} |
| Tool fallbacks acionados | {{fallbacks_used}} |
| Self-QA (IN-QA-001) | {{self_qa_result}} |
| Proximo passo | {{next_step}} |

---

*Dossie gerado por @digital-profiler — Insight Squad v{{squad_version}}*
*Dados de {{date}} — valido por 30 dias*
