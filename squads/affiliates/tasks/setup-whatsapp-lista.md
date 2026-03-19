# setup-whatsapp-lista

## Metadata
```yaml
task_id: AFF_BR_005
agent: marketplace-ops
type: setup
complexity: medium
estimated_time: "1h-3h"
source: "WhatsApp Business API Documentation + LGPD Lei 13.709/2018 (adapted)"
```

## Purpose
Configurar lista de broadcast WhatsApp para distribuição de ofertas e conteúdo de afiliado, garantindo coleta de consentimento explícito conforme LGPD e maximizando engajamento no canal de maior penetração do Brasil (98% dos smartphones).

## Prerequisites
- Número de telefone dedicado (não usar número pessoal principal)
- Conta WhatsApp Business configurada ou acesso à WhatsApp Business API (para listas > 256 contatos)
- Mecanismo de coleta de leads configurado (formulário com opt-in)
- Política de privacidade do site atualizada com menção ao WhatsApp
- Nicho e produto-alvo definidos

## Steps

1. **Configurar WhatsApp Business** — Instalar e configurar conta Business no número dedicado.
   - Baixar WhatsApp Business (app gratuito para listas até 256 contatos)
   - Para listas maiores: contratar provedor de WhatsApp Business API (Zapi, Wati, Twilio)
   - Preencher perfil completo: nome comercial, categoria, descrição, horário de atendimento, site
   - Configurar mensagem de ausência e saudação automática

2. **Criar fluxo de opt-in LGPD-compliant** — Construir processo de consentimento explícito.
   - Formulário de captura: campo de WhatsApp + checkbox "Aceito receber ofertas e conteúdo via WhatsApp" (OBRIGATÓRIO)
   - Texto do checkbox deve ser claro: "Ao marcar, você concorda em receber mensagens de [nome do canal] via WhatsApp. Você pode cancelar a qualquer momento respondendo SAIR."
   - Registrar timestamp e IP do consentimento (para auditoria LGPD)
   - Confirmação: enviar mensagem de boas-vindas imediatamente após opt-in com instrução de cancelamento

3. **Estruturar listas segmentadas** — Criar segmentos de broadcast por interesse.
   - Lista Principal: todos os assinantes do canal
   - Lista Produtos: segmento por categoria de produto promovido
   - Lista VIP: compradores confirmados (para upsell e lançamentos exclusivos)
   - Lista Inativa: assinantes sem engajamento > 30 dias (para reativação ou limpeza)
   - Nomenclatura: `[nicho]-[segmento]-[data-criacao]` (ex: `invest-principal-20260218`)

4. **Criar templates de mensagem de oferta** — Produzir 3-5 templates reutilizáveis.
   - **Template Oferta Direta:** produto + preço + link + prazo
   - **Template Conteúdo + CTA:** dica de valor → produto relacionado → link
   - **Template Flash Sale:** urgência real (prazo concreto) + desconto + link
   - **Template Depoimento:** prova social (screenshot ou texto) + produto + link
   - **Template Reativação:** mensagem para inativos (> 30 dias sem clique)
   - Todos os templates: máximo 300 palavras, linguagem conversacional, emoji moderado (1-3)

5. **Definir calendário e horários de envio** — Planejar frequência e timing.
   - Frequência máxima recomendada: 3-4 mensagens/semana (acima disso = alto unsubscribe)
   - Horários de maior abertura BR: 07h-09h (manhã), 12h-13h (almoço), 19h-21h (noite)
   - Evitar: domingos após 18h, segundas antes das 9h, feriados nacionais
   - Criar calendário mensal com datas de envio planejadas e template a usar

6. **Configurar mecanismo de opt-out** — Garantir cancelamento fácil e imediato.
   - Incluir em CADA mensagem: "Para sair, responda SAIR" (ou emoji 🚫)
   - Configurar resposta automática ao receber "SAIR": confirmação de remoção + agradecimento
   - Processo manual (WhatsApp Business app): remover contato da lista em até 24h
   - Processo automatizado (API): webhook processa SAIR e remove imediatamente
   - Registrar opt-outs com timestamp para conformidade LGPD

7. **Testar fluxo completo** — Validar toda a jornada antes de escalar.
   - Testar opt-in no formulário com número de teste
   - Confirmar recebimento da mensagem de boas-vindas
   - Testar envio de broadcast para lista de 1-5 contatos de teste
   - Testar opt-out: responder SAIR e confirmar remoção
   - Verificar que link de afiliado funciona no mobile (clicar no WhatsApp)

8. **Documentar SOP de operação** — Criar procedimento operacional padrão.
   - Frequência de limpeza da lista (remoção de bloqueados, inativos 60d+)
   - Processo de aprovação de copy antes de envio
   - Métricas a monitorar: taxa de entrega, cliques nos links, opt-outs por envio
   - Threshold de pausa: se opt-out rate > 3% em um envio, pausar e revisar copy

## Framework

### Penetração e Benchmark WhatsApp BR

```
98%  — Penetração em smartphones brasileiros (maior do mundo)
85%  — Usuários que abrem WhatsApp todos os dias
70%  — Taxa de abertura média de broadcast (vs 20-25% e-mail)
20%  — Taxa de clique estimada em ofertas relevantes
 3%  — Taxa de opt-out aceitável por mensagem enviada
```

### Hierarquia de Segmentos de Lista

```
Tier 1 — VIP (compradores): máxima prioridade, exclusividade, promos antecipadas
Tier 2 — Engajados (clicaram nos últimos 30 dias): ofertas regulares
Tier 3 — Ativos (abriram nos últimos 60 dias): conteúdo + oferta semanal
Tier 4 — Inativos (sem engajamento 60+ dias): campanha de reativação → limpeza
```

### Template de Mensagem de Oferta (estrutura)

```
[Emoji de abertura] [Gancho: pergunta ou afirmação impactante]

[Contexto: 1-2 frases que constroem relevância]

[Produto: nome + promessa central]

💰 [Preço normal] → [Preço com desconto/parcelamento]
⏰ Válido até [data/hora concreta]

👉 [Link encurtado rastreável]

—
Para sair desta lista, responda SAIR.
```

### Conformidade LGPD — Checklist WhatsApp

| Requisito | Método | Status Verificar |
|-----------|--------|-----------------|
| Consentimento explícito | Checkbox no opt-in | Obrigatório |
| Registro do consentimento | Timestamp + IP | Obrigatório |
| Identificação do remetente | Nome no perfil Business | Obrigatório |
| Opt-out fácil | "Responda SAIR" em cada msg | Obrigatório |
| Processamento opt-out | Máximo 24h | Obrigatório |
| Finalidade declarada | Menção na política privacidade | Obrigatório |

## Veto Conditions

- **HARD VETO:** Adicionar números sem consentimento explícito — violação LGPD com multa de até R$50M ou 2% faturamento
- **HARD VETO:** Enviar broadcast sem mecanismo de opt-out em cada mensagem — não publicar
- **HARD VETO:** Usar número pessoal principal para broadcast comercial — risco de banimento permanente da conta
- **HARD VETO:** Enviar mais de 1 mensagem/dia para mesma lista — taxa de bloqueio elimina o canal
- **SOFT VETO:** Lista com menos de 50 contatos — aguardar crescimento antes de iniciar broadcasts regulares
- **SOFT VETO:** Copy sem revisão de opt-out rate nos primeiros 3 envios — monitorar antes de escalar

## Output

- **File:** `docs/setup/whatsapp-broadcast-setup-{date}.md`
- **Format:** Markdown com configuração, listas, templates e calendário

## Output Example

```yaml
setup_date: "2026-02-18"
channel: WhatsApp Business
number: "+55 11 9XXXX-XXXX (dedicado)"
provider: "Zapi (API)"

lists:
  - name: "invest-principal-20260218"
    tier: 3
    initial_size: 0
    target_size: 500
    description: "Lista principal - nicho investimentos"
  - name: "invest-vip-20260218"
    tier: 1
    initial_size: 0
    target_size: 50
    description: "Compradores confirmados de produtos de investimento"

opt_in_source: "Formulário /newsletter com checkbox LGPD"
opt_out_keyword: "SAIR"
lgpd_compliant: true

send_schedule:
  days: ["tuesday", "thursday", "saturday"]
  times: ["08:00", "19:30"]
  max_per_week: 3

templates_created:
  - oferta-direta
  - conteudo-cta
  - flash-sale
  - depoimento
  - reativacao

next_step: "Iniciar coleta de contatos via formulário de opt-in; executar primeiro broadcast após 50 assinantes"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
