# Checklist de Lancamento — Ciclo 1 Outono 2026

> Verificacao completa de todos os itens necessarios antes do lancamento do MVP.
> Story: E4.7 | Sprint: Semanas 7-8

---

## Infraestrutura e Ambiente

- [ ] **Vercel environment variables configuradas**: todas as ENVs do `.env.example` preenchidas com valores reais de producao (DATABASE_URL, NEXTAUTH_SECRET, MP_ACCESS_TOKEN, STRIPE_SECRET_KEY, RESEND_API_KEY, etc.)
- [ ] **DNS configurado**: dominio `app.basetriade.com` apontando para Vercel
- [ ] **HTTPS ativo**: certificado SSL valido e renovacao automatica ativa
- [ ] **Vercel projeto configurado**: branch `main` para producao, preview para PRs

## Banco de Dados (Supabase)

- [ ] **Supabase producao configurado**: projeto criado em regiao `sa-east-1`
- [ ] **RLS policies ativas**: verificar cada tabela tem Row Level Security habilitado
- [ ] **Database URL de producao**: configurada no Vercel (pooled + direct)
- [ ] **Backup automatico habilitado**: backups diarios com retencao minima de 7 dias
- [ ] **Migrations executadas**: `prisma migrate deploy` aplicado com sucesso

## Dados Iniciais (Seed)

- [ ] **Seed de producao executado**: `npm run db:seed` no package database
- [ ] **Admin user criado**: Bob (ADMIN role) com email correto
- [ ] **Facilitadoras cadastradas**: Daniela Lopper (@podprana) e Milena Koch (@koch.milenar) como isFeatured
- [ ] **Espacos Casa do Sol**: 5 quartos criados (Terra, Agua, Fogo, Ar, Cabana Beija-Flor) a R$250/noite
- [ ] **Politica de cancelamento global**: +15d=80%, 7-14d=50%, <7d=0%, transferencia permitida
- [ ] **Evento template**: "Outono 2026" com tipos de ingresso basicos

## Pagamentos

- [ ] **MercadoPago em modo producao**: ACCESS_TOKEN de producao (nao sandbox)
- [ ] **MercadoPago webhook configurado**: URL `https://app.basetriade.com/api/webhooks/mercadopago` no painel MP
- [ ] **MercadoPago webhook secret**: MP_WEBHOOK_SECRET configurado no Vercel
- [ ] **Stripe em modo live**: STRIPE_SECRET_KEY de producao (sk_live_...)
- [ ] **Stripe webhook endpoint configurado**: URL `https://app.basetriade.com/api/webhooks/stripe` no painel Stripe
- [ ] **Stripe webhook secret**: STRIPE_WEBHOOK_SECRET configurado no Vercel

## Email Transacional

- [ ] **Resend configurado**: RESEND_API_KEY de producao no Vercel
- [ ] **Dominio verificado**: `basetriade.com` ou `ciclodaseestacoes.com.br` verificado no Resend
- [ ] **DKIM configurado**: registro DNS DKIM adicionado e verificado
- [ ] **SPF configurado**: registro DNS SPF incluindo Resend
- [ ] **Remetente configurado**: `noreply@basetriade.com` ou similar
- [ ] **Email de teste enviado**: verificar que nao cai em spam

## Teste Ponta-a-Ponta

- [ ] **Compra de teste R$1**: criar ingresso de teste com preco minimo
- [ ] **Pagamento via PIX**: processar pagamento e verificar confirmacao
- [ ] **Email de confirmacao recebido**: verificar email com QR Code
- [ ] **QR Code funcional**: escanear e verificar check-in
- [ ] **Reembolso de teste**: processar reembolso do R$1 de teste
- [ ] **Fluxo de inscricao completo**: usuario cria conta -> escolhe evento -> seleciona ingresso -> paga -> recebe confirmacao

## Monitoring e Analytics

- [ ] **Sentry DSN conectado**: SENTRY_DSN configurado no Vercel
- [ ] **Sentry alertas habilitados**: regra para notificar erros criticos
- [ ] **PostHog configurado**: NEXT_PUBLIC_POSTHOG_KEY e NEXT_PUBLIC_POSTHOG_HOST no Vercel
- [ ] **PostHog eventos rastreando**: page views, sign ups, purchases
- [ ] **Health check endpoint**: `/api/health` respondendo 200

## Seguranca

- [ ] **NEXTAUTH_SECRET**: gerado com `openssl rand -base64 32`
- [ ] **CRON_SECRET**: gerado com `openssl rand -hex 32`
- [ ] **QR_SECRET**: gerado com `openssl rand -hex 32`
- [ ] **CPF_ENCRYPTION_KEY**: gerado com `openssl rand -hex 32`
- [ ] **Variaveis sensiveis**: nenhuma exposta no frontend (apenas NEXT_PUBLIC_*)
- [ ] **Headers de seguranca**: CSP, X-Frame-Options, etc. configurados

## Testes E2E

- [ ] **Testes E2E passando em producao**: todos os testes da Story E4.6 executados contra o ambiente de producao
- [ ] **Fluxo de login/registro**: funcionando
- [ ] **Fluxo de compra**: funcionando
- [ ] **Painel admin**: acessivel apenas para ADMIN

## Aprovacoes e Documentacao

- [ ] **Runbook criado**: `docs/runbook.md` com procedimentos operacionais
- [ ] **Aprovacao Daniela Lopper**: conteudo cadastrado no sistema aprovado pela facilitadora
- [ ] **Aprovacao Milena Koch**: conteudo cadastrado no sistema aprovado pela facilitadora
- [ ] **Equipe notificada**: todos os envolvidos sabem da data de lancamento

## Pos-Lancamento (primeiras 48h)

- [ ] Monitorar Sentry para erros criticos
- [ ] Verificar logs do Vercel para erros 500
- [ ] Acompanhar primeiras inscricoes
- [ ] Verificar entregabilidade de emails (Resend dashboard)
- [ ] Confirmar webhooks de pagamento funcionando (MercadoPago + Stripe)

---

*Story E4.7 — Checklist de Lancamento*
*iAi . ECOssistema Base Triade*
