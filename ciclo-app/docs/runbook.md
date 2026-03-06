# Runbook de Operacao — Ciclo das Estações

> Documento operacional para gestão do sistema em produção.
> Ultima atualização: 2026-03-05

---

## Indice

1. [Como criar novo evento](#1-como-criar-novo-evento)
2. [Como processar reembolso manualmente](#2-como-processar-reembolso-manualmente)
3. [Como exportar lista de participantes](#3-como-exportar-lista-de-participantes)
4. [Como acessar logs](#4-como-acessar-logs)
5. [Como reenviar email de confirmação](#5-como-reenviar-email-de-confirmação)
6. [Como cancelar evento inteiro](#6-como-cancelar-evento-inteiro)
7. [Contatos de emergencia e escalacao](#7-contatos-de-emergencia-e-escalacao)

---

## 1. Como criar novo evento

### Via Admin Dashboard

1. Acessar `https://app.basetriade.com/admin/events`
2. Clicar em **"Novo Evento"**
3. Preencher os campos obrigatórios:
   - **Nome** do evento (ex: "Outono 2026")
   - **Slug** (gerado automaticamente, editavel)
   - **Estação** (SPRING, SUMMER, AUTUMN, WINTER, CROSS_QUARTER)
   - **Evento Astronomico** (opcional: equinócio, solstício, etc.)
   - **Datas** de inicio e fim
   - **Elemento MTC** e **Orgao MTC** (opcional)
   - **Capacidade** maxima
   - **Local** (ex: "Base Tríade — Itajai/SC")
4. Adicionar **tipos de ingresso** (TicketTypes):
   - Nome, descrição, preco early-bird, preco regular, preco last-minute
   - Quantidade disponível
   - Datas de early-bird e last-minute
5. Vincular **facilitadoras** ao evento
6. Configurar **política de cancelamento** (ou usar a política global padrão)
7. Adicionar imagens e FAQs
8. **Revisar** e clicar em **"Publicar"** (isPublished = true)

### Checklist pos-criacao

- [ ] Tipos de ingresso com precos corretos (em centavos)
- [ ] Facilitadoras vinculadas
- [ ] Politica de cancelamento ativa
- [ ] Imagens do evento carregadas
- [ ] FAQs preenchidas
- [ ] Testar URL publica: `https://app.basetriade.com/eventos/{slug}`

---

## 2. Como processar reembolso manualmente

### Via MercadoPago (pagamentos PIX/Boleto)

1. Acessar [MercadoPago Dashboard](https://www.mercadopago.com.br/activities)
2. Localizar o pagamento pelo `mercado_pago_id` (campo na tabela `payments`)
3. Clicar no pagamento e selecionar **"Devolver dinheiro"**
4. Escolher reembolso **total** ou **parcial**
5. Confirmar a devolucao

### Via Stripe (pagamentos Cartao de Crédito)

1. Acessar [Stripe Dashboard](https://dashboard.stripe.com/payments)
2. Localizar o pagamento pelo `stripe_id` (campo na tabela `payments`)
3. Clicar em **"Refund"**
4. Informar valor (total ou parcial)
5. Confirmar

### Atualizar o banco de dados

Apos processar o reembolso no gateway, atualizar o status no banco:

```sql
-- Atualizar status do pagamento
UPDATE payments
SET status = 'REFUNDED'
WHERE id = '<payment-id>';

-- Atualizar status da inscrição
UPDATE registrations
SET status = 'REFUNDED', updated_at = NOW()
WHERE id = '<registration-id>';
```

**Alternativa via Prisma Studio:**

```bash
cd ciclo-app/packages/database
npx prisma studio
```

Navegar até a tabela `payments`, localizar o registro e alterar `status` para `REFUNDED`.

### Politica de reembolso (referencia)

| Antecedencia | Reembolso |
|-------------|-----------|
| +15 dias | 80% do valor |
| 7-14 dias | 50% do valor |
| < 7 dias | 0% (sem reembolso) |
| Transferência | Permitida a qualquer momento |

---

## 3. Como exportar lista de participantes

### Via Admin CRM

1. Acessar `https://app.basetriade.com/admin/crm`
2. Filtrar por **evento** desejado
3. Clicar em **"Exportar"** (CSV ou Excel)
4. O arquivo contera: nome, email, telefone, tipo de ingresso, status, acomodacao

### Via Prisma Studio (alternativa)

```bash
cd ciclo-app/packages/database
npx prisma studio
```

1. Abrir tabela `registrations`
2. Filtrar por `eventId` e `status = CONFIRMED`
3. Exportar dados

### Via SQL direto (Supabase)

```sql
SELECT
  u.name,
  u.email,
  u.phone,
  tt.name AS tipo_ingresso,
  r.status,
  r.dietary_restrictions,
  r.is_first_time,
  rm.name AS acomodacao,
  r.accommodation_nights
FROM registrations r
JOIN users u ON r.user_id = u.id
JOIN ticket_types tt ON r.ticket_type_id = tt.id
LEFT JOIN rooms rm ON r.accommodation_id = rm.id
WHERE r.event_id = '<event-id>'
  AND r.status = 'CONFIRMED'
ORDER BY u.name;
```

---

## 4. Como acessar logs

### Vercel Dashboard

1. Acessar [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecionar o projeto **ciclo-das-estações**
3. Ir em **"Logs"** no menu lateral
4. Filtrar por:
   - **Nivel:** Error, Warning, Info
   - **Período:** ultimas 24h, 7 dias, etc.
   - **Funcao:** nome da API route ou Server Action

### Logs estruturados

O sistema usa structured logging. Campos padrão em cada log:

```json
{
  "level": "error",
  "message": "Failed to process payment",
  "timestamp": "2026-03-05T10:00:00Z",
  "requestId": "req_abc123",
  "userId": "user_xyz",
  "context": { "paymentId": "pay_123", "error": "..." }
}
```

### Sentry (error tracking)

1. Acessar [Sentry Dashboard](https://sentry.io)
2. Selecionar projeto **ciclo-das-estações**
3. Verificar **Issues** abertas
4. Configurar alertas: Settings > Alerts > criar regra para erros criticos

### PostHog (analytics)

1. Acessar [PostHog Dashboard](https://app.posthog.com)
2. Verificar eventos de usuario, funis de conversao, erros de UX

---

## 5. Como reenviar email de confirmação

### Via Admin Dashboard

1. Acessar `https://app.basetriade.com/admin/registrations`
2. Localizar a inscrição pelo nome ou email do participante
3. Clicar em **"Reenviar Confirmação"**
4. O sistema reenviara o email com QR Code via Resend

### Via API (caso necessário)

```bash
curl -X POST https://app.basetriade.com/api/admin/registrations/<registration-id>/resend-confirmation \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json"
```

### Verificar entrega

1. Acessar [Resend Dashboard](https://resend.com/emails)
2. Verificar status do email: entregue, bounce, spam
3. Se bounce: verificar email do destinatario e tentar enderecos alternativos

---

## 6. Como cancelar evento inteiro

> **ATENCAO:** Esta operação afeta todos os participantes. Executar com cuidado.

### Procedimento

1. **Comunicar** todas as facilitadoras sobre o cancelamento
2. **Despublicar** o evento:
   ```sql
   UPDATE events
   SET is_published = false, updated_at = NOW()
   WHERE slug = '<event-slug>';
   ```
3. **Listar** todos os participantes confirmados:
   ```sql
   SELECT r.id, u.name, u.email, p.amount, p.method, p.stripe_id, p.mercado_pago_id
   FROM registrations r
   JOIN users u ON r.user_id = u.id
   JOIN payments p ON p.registration_id = r.id
   WHERE r.event_id = '<event-id>'
     AND r.status = 'CONFIRMED'
     AND p.status = 'APPROVED';
   ```
4. **Processar reembolso** de cada participante (ver seção 2):
   - Reembolso de 100% em caso de cancelamento pelo organizador
   - Processar via MercadoPago e/ou Stripe conforme metodo de pagamento
5. **Atualizar** status em massa:
   ```sql
   UPDATE registrations
   SET status = 'CANCELLED', updated_at = NOW()
   WHERE event_id = '<event-id>' AND status = 'CONFIRMED';

   UPDATE payments
   SET status = 'REFUNDED'
   WHERE registration_id IN (
     SELECT id FROM registrations WHERE event_id = '<event-id>'
   ) AND status = 'APPROVED';
   ```
6. **Enviar email** de cancelamento para todos os participantes
7. **Documentar** o motivo do cancelamento internamente

### Checklist de cancelamento

- [ ] Facilitadoras notificadas
- [ ] Evento despublicado
- [ ] Todos os reembolsos processados (MercadoPago + Stripe)
- [ ] Status de inscrições atualizado para CANCELLED
- [ ] Email de cancelamento enviado a todos os participantes
- [ ] Motivo documentado
- [ ] Redes sociais atualizadas (se aplicavel)

---

## 7. Contatos de emergencia e escalacao

### Niveis de escalacao

| Nivel | Quem | Quando | Contato |
|-------|------|--------|---------|
| L1 | Dev on-call | Bug nao-critico, duvidas tecnicas | Slack #dev-ciclo |
| L2 | Bob (Admin) | Decisoes de negocio, reembolsos, cancelamentos | WhatsApp direto |
| L3 | Suporte Vercel | Infraestrutura down | [vercel.com/support](https://vercel.com/support) |
| L3 | Suporte Supabase | Database down | [supabase.com/support](https://supabase.com/support) |
| L3 | Suporte MercadoPago | Falha em pagamentos PIX | [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers) |
| L3 | Suporte Stripe | Falha em pagamentos cartao | [support.stripe.com](https://support.stripe.com) |
| L3 | Suporte Resend | Falha em envio de emails | [resend.com/support](https://resend.com/support) |

### Contatos internos

| Papel | Nome | Contato |
|-------|------|---------|
| Admin / Gestor | Bob (Eliezer Cardoso) | WhatsApp / Email |
| Facilitadora Principal | Daniela Lopper | @podprana (Instagram) |
| Facilitadora Principal | Milena Koch | @koch.milenar (Instagram) |

### Quando escalar imediatamente

- Sistema fora do ar (Vercel / Supabase down)
- Falha em processamento de pagamentos
- Vazamento de dados pessoais (LGPD incident)
- Erro que impede inscrições em evento próximo
- Problemas com QR Code no dia do evento

### Procedimento para incidentes LGPD

1. **Identificar** e conter o incidente
2. **Documentar** data/hora, dados afetados, causa
3. **Notificar** Bob imediatamente
4. **Avaliar** necessidade de notificação a ANPD (72h para incidentes graves)
5. **Comunicar** titulares afetados se necessário
6. **Implementar** correcoes e medidas preventivas

---

*Ciclo das Estações — Runbook de Operacao v1.0*
*iAi . ECOssistema Base Tríade*
