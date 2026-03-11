# Research Report — Dark Post Comments Tools

## 1. Como Dark Posts Funcionam (Contexto Técnico)

Dark posts são posts "unpublished" — criados exclusivamente como anúncios pagos. Características:

- **Não aparecem** no timeline/feed da página do anunciante
- **Visíveis apenas** para o público-alvo segmentado do ad
- **Comentários existem**, mas ficam "escondidos" — não há link público direto
- O **permalink** do dark post é restrito — só acessível via Ads Manager ou link direto
- Usuários que veem o ad podem comentar normalmente — parece um post comum no feed deles
- O anunciante vê os comentários via **Ads Manager → Ad Review → Facebook Post Comments**

**Implicação:** Os comentários existem e são públicos para quem recebeu o ad, mas não há como "buscar" esses posts sem o permalink ou acesso ao Ads Manager.

---

## 2. Ferramentas que Mostram Comentários de Ads

### 2.1 AdSpy — $149/mês (MAIS RELEVANTE)

**Capacidade única:** Permite **buscar DENTRO dos comentários** dos ads. Isso é extremamente poderoso para prospecção — você pode filtrar ads onde usuários comentam sobre problemas específicos.

- Database massivo de ads (Facebook + Instagram)
- Filtro por comentários: busca por palavras-chave nos comentários
- Mostra engagement completo (likes, comments, shares)
- **Como funciona:** Scraping próprio da engagement pública dos ads
- **Limitação:** Preço alto ($149/mês), interface apenas web (sem API pública)

**Fonte:** [affmaven.com/adspy-vs-poweradspy](https://affmaven.com/adspy-vs-poweradspy/)

### 2.2 PowerAdSpy — Free + $69/mês

- Database ~350M ads cobrindo 7+ plataformas (Facebook, Instagram, YouTube, Google, Reddit, Quora)
- Mostra **engagement curves** — evolução de likes/comments ao longo do tempo
- Funcionalidade "target profile" para localizar ads específicos
- Dados de engagement em tempo real
- **Limitação:** Sem API pública, interface web

**Fonte:** [trendtrack.io](https://www.trendtrack.io/blog-post/best-meta-adspy-tool)

### 2.3 BigSpy — $9-99/mês (MELHOR CUSTO-BENEFÍCIO)

- Database 1B+ ads (o maior)
- Métricas de engagement (likes, comments, shares)
- Filtro por ads lançados "hoje" — útil para tendências
- Plano básico: $9/mês (20 queries/dia)
- Plano Pro: $99/mês (ilimitado)
- **Limitação:** Mostra métricas, mas não é claro se permite ver os comentários individuais como o AdSpy

**Fonte:** [bigspy.com](https://bigspy.com/blog/poweradspy-vs-bigspy)

### 2.4 NapoleonCat — ~$27/mês

- Social Inbox que centraliza comentários de TODOS os dark posts em uma única stream
- AI sentiment analysis, detecção de spam, auto-moderação
- **PORÉM:** Funciona apenas para suas próprias contas (precisa conectar via Meta API)
- Não serve para espionar concorrentes

**Fonte:** [napoleoncat.com](https://napoleoncat.com/blog/monitor-facebook-ads-comments/)

### 2.5 Apify — $1.40-3.40/1K items

- **Facebook Ads Library Scraper** ($3.40/1K): Extrai ads da Ads Library (metadata, criativos, targeting) — SEM comentários
- **Facebook Comments Scraper** ($1.40/1K): Extrai comentários de posts públicos — precisa do URL do post
- **Workflow combinado:** Ads Library Scraper → identificar link_url → Comments Scraper
- **Limitação:** Os dois scrapers são separados. O Ads Library Scraper não fornece permalink do post com comentários.

**Fonte:** [apify.com](https://apify.com/apify/facebook-comments-scraper), [use-apify.com](https://use-apify.com/blog/apify-facebook-scrapers-collections-2026)

---

## 3. APIs Oficiais — O que Funciona e o que Não

### Meta Graph API — POST Comments Endpoint

```
GET /{post-id}/comments
GET /{rtb-dynamic-post-id}/comments
```

**Permissões necessárias:** `pages_read_engagement`, `pages_read_user_content`, `pages_manage_ads`, `pages_manage_metadata`

**Realidade:**
- Funciona APENAS para posts/ads das **suas próprias** páginas
- **Não é possível** acessar comentários de ads de concorrentes via API
- Dynamic ads podem retornar erro #100: "nonexisting field (comments)"
- Dark posts criados via `ads_posts` podem não retornar dados completos

**Conclusão:** Graph API é inútil para prospecção de concorrentes.

### Meta Ads Library API

- Retorna apenas metadata: criativos, copy, spend ranges, impressions, targeting
- **NÃO retorna:** permalinks, comentários, engagement metrics
- No Brasil: funciona apenas para anúncios políticos/sociais

---

## 4. Workarounds da Comunidade

### Workaround A: Ads Library → link_url → Comments
1. Scrape a Ads Library (via Apify ou API)
2. Extrair o campo `link_url` do ad
3. Navegar para o URL do post no Facebook
4. Scrape os comentários do post

**Problema:** O `link_url` geralmente aponta para o site do anunciante (landing page), NÃO para o post do Facebook.

### Workaround B: Permalink via Timestamp
- O timestamp do dark post contém um link para o permalink único
- Se alguém compartilhar esse permalink, os comentários ficam visíveis
- **Problema:** Requer que alguém que recebeu o ad compartilhe o link

### Workaround C: Ferramentas de Social Listening
- Ferramentas como Agorapulse, Sprinklr, Sprout Social
- Centralizam comentários de dark posts
- **Problema:** Apenas para suas próprias contas

---

## 5. Tabela Comparativa Final

| Ferramenta | Vê comments de concorrentes? | Busca dentro de comments? | API? | Preço |
|-----------|------|------|------|-------|
| **AdSpy** | **SIM** | **SIM** | Não | $149/mês |
| **PowerAdSpy** | **SIM** | Parcial | Não | Free-$69/mês |
| **BigSpy** | Parcial (métricas) | Não | Não | $9-99/mês |
| NapoleonCat | Apenas próprios | N/A | Sim | ~$27/mês |
| Apify | Se tiver URL do post | N/A | Sim | $1.40/1K |
| Graph API | Apenas próprios | N/A | Sim | Grátis |
| Ads Library API | Não | Não | Sim | Grátis |

---

## 6. Fontes

1. [Agorapulse — Facebook Dark Post Comment Tools](https://www.agorapulse.com/blog/facebook/facebook-dark-post-comment-tools/)
2. [NapoleonCat — Monitor Facebook Ads Comments 2026](https://napoleoncat.com/blog/monitor-facebook-ads-comments/)
3. [Jon Loomer — View Comments on Dark Posts](https://www.jonloomer.com/dark-unpublished-facebook-post-view-comments/)
4. [Sprout Social — Facebook Dark Posts](https://sproutsocial.com/insights/facebook-dark-posts/)
5. [ScrapeCreators — Scrape Meta Ad Library](https://scrapecreators.com/blog/how-to-scrape-the-meta-ad-library)
6. [Apify — Facebook Comments Scraper](https://apify.com/apify/facebook-comments-scraper)
7. [Apify — Facebook Ads Library Scraper](https://apify.com/apify/facebook-ads-scraper)
8. [TrendTrack — Best Meta AdSpy Tools 2026](https://www.trendtrack.io/blog-post/best-meta-adspy-tool)
9. [AffMaven — AdSpy vs PowerAdSpy](https://affmaven.com/adspy-vs-poweradspy/)
10. [Facebook Graph API — Post Comments](https://developers.facebook.com/docs/graph-api/reference/post/comments/)
11. [Facebook Graph API — RTBDynamic Post Comments](https://developers.facebook.com/docs/graph-api/reference/rtb-dynamic-post/comments)
