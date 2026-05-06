# Deploy to Netlify

**Task:** `deploy-to-netlify`
**Agent:** @deploy-pilot
**Type:** Delivery
**Priority:** 1

---

## Description

Deploy de LP para Netlify via MCP. Inclui build, deploy, configuracao de dominio customizado e SSL automatico.

---

## Input

```yaml
build_output: 'path para build output (dist/)'
site_name: 'nome-do-site'
custom_domain: 'lp.example.com (opcional)'
deploy_type: 'production | preview'
```

---

## Process

### 1. Pre-Deploy Checklist (@deploy-pilot)

- Build success (zero errors)
- No console errors
- Assets optimized
- Meta tags completos
- Lighthouse score >= 90

### 2. Deploy via Netlify MCP

- Production: netlify deploy --prod
- Preview: netlify deploy (branch deploy)
- Configurar site name

### 3. Post-Deploy

- Verificar URL de deploy
- SSL certificate status
- Custom domain (se aplicavel)
- DNS configuration guide

### 4. Smoke Test

- Acessar URL deployed
- Screenshot via Playwright
- Verificar funcionalidade basica

---

## Output

```
Entregaveis:
1. deploy_url - URL do site deployed
2. deploy_log - Log do deploy
3. ssl_status - Status do certificado SSL
4. smoke-test-report.md - Resultado do smoke test
```

---

**Created:** 2026-02-10
**Version:** 1.0
