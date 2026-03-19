# setup-affiliate-dashboard

## Metadata
```yaml
task_id: AFF_ANL_001
agent: performance-analyst
type: setup
complexity: medium
estimated_time: "1h-2h"
source: "Google Analytics 4 Measurement Framework + Platform Native Tracking Best Practices"
```

## Purpose
Configurar a infraestrutura completa de rastreamento de afiliados: pixels de plataforma, parâmetros UTM padronizados e modelo de atribuição, garantindo que cada clique e conversão seja capturado com precisão antes de qualquer análise de performance.

## Prerequisites
- Conta Google Analytics 4 (GA4) criada e com acesso de administrador
- Acesso ao(s) dashboard(s) nativo(s) da(s) plataforma(s) de afiliados (Hotmart, Monetizze, Eduzz, ShareASale, Impact, etc.)
- Domínio do site de afiliado com acesso ao código-fonte ou plugin de tag (GTM recomendado)
- Planilha de UTM padronizada do squad (ou criar durante este setup)

## Steps

1. **Mapear plataformas e produtos** — Listar todas as plataformas de afiliado ativas (BR e Global), produtos promovidos por plataforma, e identificar quais possuem pixel próprio a instalar.

2. **Instalar Google Tag Manager** — Adicionar container GTM ao site (head + body). Publicar container vazio para validar instalação via GTM Preview Mode.

3. **Configurar GA4 via GTM** — Criar tag GA4 Configuration no GTM apontando para o Measurement ID. Definir data layer events: `affiliate_click`, `page_view`, `scroll_depth`, `form_submit`.

4. **Instalar pixels de plataforma** — Para cada plataforma com pixel próprio, adicionar via GTM como tag Custom HTML ou template nativo:
   - Hotmart: Pixel do Produto via postback URL ou script
   - Meta Ads: Pixel + Conversions API (server-side)
   - Google Ads: gtag ou GTM tag de conversão

5. **Padronizar estrutura UTM** — Definir e documentar convenção UTM obrigatória:
   ```
   utm_source   = canal (google, facebook, email, organic)
   utm_medium   = tipo (cpc, social, newsletter, seo)
   utm_campaign = campanha (slug-do-produto ou nome da campanha)
   utm_content  = criativo ou variação (headline-v1, imagem-blog)
   utm_term     = keyword (para paid search)
   ```
   Criar gerador de UTM em planilha compartilhada.

6. **Configurar modelo de atribuição** — No GA4, definir Attribution Settings:
   - Janela de aquisição: 30 dias (padrão)
   - Janela de engajamento: 3 dias
   - Modelo de atribuição: Data-driven (fallback: Last Click)
   Documentar a escolha e baseline para revisão futura em `attribution-audit.md` (AFF_ANL_003).

7. **Criar audiences e goals no GA4** — Configurar as seguintes conversões:
   - Clique em link de afiliado (evento `affiliate_click`)
   - Scroll >= 75% (engagement signal)
   - Tempo na página > 2 minutos
   - Opt-in de email (se houver formulário)

8. **Conectar Google Search Console** — Vincular propriedade do Search Console ao GA4 para dados de impressões e posição orgânica integrados.

9. **Validar rastreamento end-to-end** — Usar GA4 DebugView + GTM Preview Mode para confirmar que eventos disparam corretamente ao navegar pelo site. Testar todos os links de afiliado.

10. **Documentar configuração** — Registrar no arquivo de output: todas as plataformas configuradas, convention UTM, IDs de rastreamento, data da configuração, e responsável.

## Framework

### Stack de Rastreamento por Camada

| Camada | Ferramenta | Propósito |
|--------|-----------|-----------|
| Tag Management | Google Tag Manager | Centralizar todos os pixels e eventos |
| Web Analytics | Google Analytics 4 | Comportamento do usuário, funil, attribution |
| Plataforma Afiliado | Dashboard nativo (Hotmart, etc.) | EPC, comissões, conversões confirmadas |
| Paid Traffic | Meta Ads Manager / Google Ads | ROAS, CPL, custo por aquisição |
| Email | Active Campaign / Mailchimp | Open rate, CTR, receita por email |

### Hierarquia de Dados

```
GA4 (comportamento + attribution)
  └── GTM (orchestration)
       ├── Pixel Meta Ads
       ├── Pixel Google Ads
       └── Pixel Hotmart / Plataformas BR

Plataforma Nativa (fonte de verdade financeira)
  └── Relatórios de comissão e EPC real
```

### UTM — Exemplos por Canal

| Canal | Exemplo de URL |
|-------|---------------|
| Meta Ads | `?utm_source=facebook&utm_medium=cpc&utm_campaign=emagrece-rápido&utm_content=video-v1` |
| Email | `?utm_source=email&utm_medium=newsletter&utm_campaign=lancamento-julho&utm_content=cta-botao` |
| SEO (interno) | `?utm_source=organic&utm_medium=seo&utm_campaign=blog-fitness` |
| YouTube | `?utm_source=youtube&utm_medium=video&utm_campaign=review-suplemento` |

## Veto Conditions

- **HARD VETO:** Instalar pixels sem GTM em ambiente de produção sem backup — risco de quebra do site; exigir GTM obrigatoriamente
- **HARD VETO:** Prosseguir com análise de performance sem rastreamento de cliques em links de afiliado validado — dados são inválidos
- **SOFT VETO:** Usar mais de um modelo de atribuição simultaneamente sem documentação clara — gera confusão nos relatórios
- **ALERTA:** Ausência de UTMs em links de afiliado nas campanhas pagas — 100% do tráfego pago irá para (direct) / (none), impossibilitando análise

## Output

- **File:** `outputs/affiliates/{projeto-slug}/tracking-setup.md`
- **Format:** Markdown com tabelas de configuração

## Output Example

```yaml
tracking_setup:
  project: "afiliado-fitness-br"
  setup_date: "2026-02-18"
  analyst: "performance-analyst"

google_analytics:
  property_id: "G-XXXXXXXXXX"
  measurement_id: "G-XXXXXXXXXX"
  gtm_container: "GTM-XXXXXXX"
  attribution_model: "data-driven"
  attribution_window_acquisition: "30d"
  attribution_window_engagement: "3d"
  conversions_configured:
    - affiliate_click
    - scroll_75pct
    - time_on_page_2min
    - optin_form_submit

platforms:
  - name: "Hotmart"
    pixel_installed: true
    method: "GTM Custom HTML"
    products: ["Programa Emagreça em Casa"]
  - name: "Meta Ads"
    pixel_installed: true
    method: "GTM Facebook Pixel Template"
    pixel_id: "XXXXXXXXXXXXXXXXX"

utm_convention:
  source_values: [google, facebook, email, organic, youtube]
  medium_values: [cpc, social, newsletter, seo, video]
  campaign_format: "{produto-slug}-{mes-ano}"
  content_format: "{tipo}-{variacao}"

search_console:
  linked: true
  property: "sc-domain:seudominio.com.br"

validation:
  debug_view_tested: true
  affiliate_click_firing: true
  all_utm_generating: true
  status: "READY"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
