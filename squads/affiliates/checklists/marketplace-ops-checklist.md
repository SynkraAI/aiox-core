# Marketplace Ops Checklist

> Verify operational readiness for affiliate promotions across Brazilian and global marketplaces.

**Fase:** Marketplace
**Usado por:** `workflows/marketplace-campaign.md`, `tasks/marketplace-audit.md`
**Items:** 9

---

## Checklist

- [ ] **Amazon Associates conta ativa** — Amazon Associates account is active and in good standing; tax information submitted; payment method configured; account not under review or suspension; Associates dashboard accessible
- [ ] **Shopee affiliate conta ativa** — Shopee Affiliate Program account is approved and active; access to affiliate dashboard confirmed; commission rates for target categories verified; affiliate link generator functional
- [ ] **Mercado Livre affiliate conta ativa** — Mercado Livre affiliate account is active via Mercado Livre Publicidade or partner network; approved categories match target products; dashboard shows live tracking
- [ ] **UTM tracking por marketplace separado** — Unique UTM campaign values assigned per marketplace (e.g., `campaign=amazon`, `campaign=shopee`, `campaign=ml`); UTM structure documented in campaign tracker; analytics can segment revenue by marketplace source
- [ ] **Produto com rating >= 4.0** — Target product has a minimum 4.0-star rating with at least 10 reviews on the marketplace; products below this threshold require explicit exception with rationale (e.g., new product with strong brand)
- [ ] **Estoque verificado antes de promover** — Product availability confirmed as "in stock" on marketplace at time of promotion start; a restock alert or inventory check is scheduled for campaigns running longer than 7 days
- [ ] **Comissão por categoria mapeada** — Commission rates for each target product category are documented in the campaign brief; rate changes in last 30 days reviewed; any category with 0% commission explicitly flagged
- [ ] **Link de afiliado testado (click → redirect)** — Each affiliate link has been clicked and verified to redirect correctly to the intended product page; link includes affiliate tag; tracked click appears in affiliate dashboard within 24 hours
- [ ] **Geo-detection configurado (se multi-country)** — If campaign targets multiple countries, geo-detection logic routes users to their local marketplace version; links are localized (e.g., amazon.com.br for Brazil, amazon.com for US); fallback for unsupported regions defined

---

*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
