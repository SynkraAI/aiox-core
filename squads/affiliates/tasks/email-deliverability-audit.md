# email-deliverability-audit

## Metadata
```yaml
task_id: AFF_EML_007
agent: email-nurture
type: audit
complexity: medium
estimated_time: "45min-1h30min"
source: "Google Postmaster Tools; MXToolbox; Mail-Tester.com; Litmus Email Analytics; RFC 7208 SPF / RFC 6376 DKIM / RFC 7489 DMARC"
```

## Purpose
Auditar a saúde de deliverability do sistema de email da operação de afiliado, verificando reputação do domínio e IP, spam score, autenticação SPF/DKIM/DMARC, bounce rate, complaint rate e presença em blacklists.

## Prerequisites
- Domínio de envio definido e ativo (preferencialmente subdomínio dedicado: mail.seudominio.com)
- Acesso ao painel DNS do domínio (para verificar/corrigir registros)
- Acesso ao ESP (para métricas de bounce e complaint)
- Email de teste ativo para receber emails de auditoria
- Acesso ao Google Postmaster Tools (configurar se não tiver)

## Steps

1. **Verificar autenticação de domínio (SPF/DKIM/DMARC)** — Usar ferramentas de verificação para confirmar que os três registros DNS estão configurados corretamente.

2. **Testar o spam score** — Enviar email de teste para mail-tester.com e verificar pontuação. Meta: 9.5/10 ou superior.

3. **Verificar reputação do domínio no Google Postmaster Tools** — Analisar Domain Reputation e IP Reputation nos últimos 30 dias.

4. **Checar blacklists** — Verificar se o domínio ou IP de envio está em listas de bloqueio conhecidas.

5. **Analisar métricas de engajamento do ESP** — Extrair dos últimos 30 dias: bounce rate (hard + soft), complaint rate, unsubscribe rate, open rate.

6. **Analisar qualidade da lista** — Verificar percentual de emails inválidos, honeypots e endereços de alto risco.

7. **Identificar problemas e priorizar correções** — Classificar cada problema encontrado por severidade e gerar plano de ação.

8. **Documentar e recomendar** — Registrar todos os achados no arquivo de output com plano de ação priorizado.

## Framework

### Checklist de Autenticação DNS

```
SPF (Sender Policy Framework):
Verificar: dig TXT seudominio.com | grep "v=spf1"
Resultado esperado: "v=spf1 include:[seu-esp.com] ~all"
Ferramenta: mxtoolbox.com/spf.aspx

DKIM (DomainKeys Identified Mail):
Verificar: dig TXT [selector]._domainkey.seudominio.com
O selector é fornecido pelo seu ESP (verificar no painel)
Resultado esperado: chave pública RSA 2048 bits

DMARC (Domain-based Message Authentication):
Verificar: dig TXT _dmarc.seudominio.com
Resultado mínimo: "v=DMARC1; p=none; rua=mailto:dmarc@seudominio.com"
Resultado ideal: "v=DMARC1; p=quarantine; pct=100; rua=mailto:..."
Meta final: p=reject (após confirmar que emails legítimos não são afetados)
```

### Benchmarks de Deliverability

| Métrica | Excelente | Aceitável | Crítico |
|---------|-----------|-----------|---------|
| Spam score (mail-tester) | 9.5-10/10 | 7-9.4/10 | < 7/10 |
| Hard bounce rate | < 0.2% | 0.2-0.5% | > 0.5% |
| Soft bounce rate | < 1% | 1-3% | > 3% |
| Complaint rate (spam) | < 0.05% | 0.05-0.1% | > 0.1% |
| Unsubscribe rate/email | < 0.3% | 0.3-0.5% | > 0.5% |
| Open rate geral | > 25% | 15-25% | < 15% |
| Domain reputation (GPT) | High | Medium | Low/Bad |

### Ferramentas de Verificação

| Ferramenta | URL | Verifica |
|-----------|-----|---------|
| Mail-Tester | mail-tester.com | Spam score geral |
| MXToolbox | mxtoolbox.com | SPF, DKIM, DMARC, blacklists |
| Google Postmaster | postmaster.google.com | Reputação domínio/IP |
| GlockApps | glockapps.com | Placement (inbox vs spam por provedor) |
| Sender Score | senderscore.org | Score de reputação do IP |

### Diagnóstico de Problemas Comuns

```
PROBLEMA: Spam score baixo (< 7/10)
Causas prováveis:
  - SPF/DKIM/DMARC não configurados
  - Assuntos com palavras-gatilho de spam ("GRÁTIS", "URGENTE", "DINHEIRO")
  - Ratio texto/HTML ruim (muito HTML, pouco texto)
  - Links em encurtadores (bit.ly, etc.) — usar links limpos

PROBLEMA: Bounce rate alto (> 0.5% hard)
Causas prováveis:
  - Lista velha com emails inválidos
  - Falta de validação de email no opt-in
  - Compra de lista (NUNCA recomendado)
Solução: Limpar lista com ferramenta de validação (ZeroBounce, NeverBounce)

PROBLEMA: Complaint rate alto (> 0.1%)
Causas prováveis:
  - Lista não double opt-in
  - Frequência muito alta
  - Conteúdo não alinhado com o que foi prometido no opt-in
  - Botão de unsubscribe difícil de encontrar
Solução: Reduzir frequência, segmentar inativos, revisar opt-in

PROBLEMA: Domain reputation LOW no Postmaster
Causas prováveis:
  - Histórico recente de spam complaints alto
  - Muitos hard bounces em período curto
  - IP compartilhado com remetentes ruins
Solução: Warming up gradual, limpar lista, migrar para IP dedicado

PROBLEMA: Emails em spam no Gmail especificamente
Causas prováveis:
  - DMARC configurado incorretamente
  - Histórico de engagement baixo com usuários Gmail
  - Links de redirecionamento suspeitos
Solução: Verificar DMARC, enviar apenas para segmento mais engajado por 30 dias
```

### Plano de Warming Up (para domínio novo ou recuperação)

```
Semana 1: 200 emails/dia → apenas lista mais engajada (compradores + abertos últimos 7d)
Semana 2: 500 emails/dia → expandir para abertos últimos 30 dias
Semana 3: 1.500 emails/dia → expandir para ativos 90 dias
Semana 4+: escalar 30% por semana até atingir volume necessário

NUNCA aumentar mais de 2x o volume em um único dia
SEMPRE monitorar complaint rate durante warming — parar se ultrapassar 0.1%
```

## Veto Conditions
- SPF/DKIM ausentes → BLOQUEAR envio de qualquer campanha até configurar (emails vão direto para spam)
- Hard bounce rate > 1% → BLOQUEAR novas campanhas até limpar lista
- Complaint rate > 0.3% → BLOQUEAR qualquer envio em massa — Google/Microsoft podem banir o domínio
- Domínio em blacklist principal (Spamhaus SBL ou XBL) → BLOQUEAR + iniciar processo de delisting imediatamente
- Open rate geral < 10% → ALERTAR (indica problema grave de deliverability — emails provavelmente em spam)
- Enviar para lista comprada ou scraped → BLOQUEAR absolutamente (destrói reputação, viola LGPD, pode encerrar conta no ESP)

## Output
- **File:** `outputs/affiliates/{projeto-slug}/deliverability-audit.md`
- **Format:** Markdown com resultados de cada verificação, scorecard e plano de ação

## Output Example
```yaml
deliverability_audit:
  project: "afiliado-saude-feminina"
  audit_date: "2026-02-18"
  sending_domain: "mail.saudeminuto.com.br"
  esp: "ActiveCampaign"
  list_size: 3200

authentication:
  spf:
    status: "CONFIGURADO"
    record: "v=spf1 include:em.activehosted.com ~all"
    result: "PASS"
  dkim:
    status: "CONFIGURADO"
    selector: "k1._domainkey"
    key_length: "2048 bits"
    result: "PASS"
  dmarc:
    status: "CONFIGURADO — PARCIAL"
    record: "v=DMARC1; p=none; rua=mailto:dmarc@saudeminuto.com.br"
    result: "ALERTAR — policy em 'none', migrar para 'quarantine' após 30 dias de monitoramento"

spam_score:
  tool: "mail-tester.com"
  score: "8.2/10"
  status: "ACEITÁVEL — mas melhorável"
  main_issues:
    - "Links de afiliado via encurtador (bit.ly detectado) — usar tracking link limpo"
    - "Ratio HTML/texto: muito HTML — simplificar template"

reputation:
  google_postmaster:
    domain_reputation: "MEDIUM"
    ip_reputation: "MEDIUM"
    spam_rate_gmail: "0.08%"
    status: "ATENÇÃO — monitorar de perto"

blacklists:
  checked: 80
  listed: 0
  status: "LIMPO"

metrics_30d:
  hard_bounce_rate: "0.31%"
  status_hard_bounce: "ACEITÁVEL (abaixo de 0.5%)"
  soft_bounce_rate: "0.8%"
  status_soft_bounce: "BOM"
  complaint_rate: "0.07%"
  status_complaint: "ATENÇÃO (limite aceitável é 0.1%)"
  unsubscribe_rate_avg: "0.28%"
  status_unsub: "BOM"
  open_rate_avg: "22%"
  status_open: "ACEITÁVEL"

action_plan:
  - priority: 1
    issue: "Complaint rate 0.07% — próximo do limite"
    action: "Iniciar re-engagement + sunset de inativos. Reduzir frequência de 4x para 3x/semana"
    timeline: "2 semanas"
    expected_impact: "Reduzir complaint para < 0.05%"

  - priority: 2
    issue: "Links bit.ly no corpo do email"
    action: "Substituir por tracking links nativos do ESP ou link limpo"
    timeline: "Imediato"
    expected_impact: "Spam score 8.2 → 9.0+"

  - priority: 3
    issue: "DMARC em p=none"
    action: "Monitorar relatórios DMARC por 30 dias. Depois mover para p=quarantine"
    timeline: "30 dias"
    expected_impact: "Melhorar domain reputation de MEDIUM para HIGH"

  - priority: 4
    issue: "Hard bounce rate 0.31%"
    action: "Rodar validação de lista com ZeroBounce (~3.200 emails)"
    timeline: "1 semana"
    estimated_cost: "~USD 15"
    expected_impact: "Hard bounce → < 0.2%"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
