# Assemble Quick LP

**Task:** `assemble-quick-lp`
**Agent:** @page-assembler
**Type:** Production (FAST)
**Priority:** 2

---

## Description

Montagem rapida de LP usando template existente. Fast track: brief + template → assemble → deploy. Sem setup de design system (usa existente).

---

## Input

```yaml
brief: 'Descricao curta do produto/servico'
copy: 'Copy completa ou brief para gerar'
template_name: 'lp-sales-long | lp-webinar | lp-lead-magnet | lp-mini-sales | lp-waitlist'
```

---

## Process

### 1. Carregar Template (@page-assembler)

- Buscar template existente por nome
- Carregar design system ativo

### 2. Integrar Copy (@page-assembler)

- Inserir copy nas secoes do template
- Ajustar se necessario

### 3. Build Rapido (@page-assembler)

- Gerar HTML/React responsivo
- Aplicar tokens existentes

### 4. Deploy Direto (@deploy-pilot)

- Netlify deploy (se autorizado)

---

## Output

```
Entregaveis:
1. landing-page.html - HTML self-contained
2. deploy_url - URL do deploy (se aplicavel)
```

---

**Created:** 2026-02-10
**Version:** 1.0
