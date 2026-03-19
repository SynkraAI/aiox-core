# setup-kiwify-affiliate

## Metadata
```yaml
task_id: AFF_BR_002
agent: affiliate-br
type: setup
complexity: medium
estimated_time: "1h-2h"
source: "Kiwify Partner Documentation — Afiliados (adapted)"
```

## Purpose
Configurar conta de afiliado na Kiwify e estabelecer relacionamento direto com produtores, dado que a plataforma não possui marketplace público — todo acesso a programas de afiliados é via networking ou links de convite direto do produtor.

## Prerequisites
- CPF válido e conta bancária ou PIX para recebimentos
- Perfil de afiliado definido (nicho, audiência, canais de divulgação)
- Lista de produtores-alvo no nicho identificados previamente
- Presença online verificável (site, perfil social, canal) para pitch ao produtor

## Steps

1. **Criar conta Kiwify** — Acessar kiwify.com.br e cadastrar conta de afiliado.
   - Selecionar perfil "Afiliado" (não produtor)
   - Preencher dados completos: nome, CPF, endereço, telefone
   - Verificar e-mail e ativar conta

2. **Configurar dados de pagamento** — Acessar Configurações → Financeiro.
   - Cadastrar chave PIX (preferência: CPF ou e-mail) para recebimentos automáticos
   - Confirmar dados bancários alternativos (conta corrente)
   - Entender modelo de taxas: 3,49% + R$1,50 por transação (descontado do repasse ao afiliado)

3. **Calcular comissão líquida real** — Modelar comissão após taxas para cada produto-alvo.
   - Fórmula: `comissão_liquida = (ticket × %comissão) - (ticket × 0.0349) - 1.50`
   - Produtos de ticket baixo (< R$50): verificar viabilidade da margem
   - Documentar comissão líquida por produto na planilha de análise

4. **Identificar produtores no nicho** — Pesquisar ativamente produtores que usam Kiwify.
   - Buscar em grupos do Facebook: "Kiwify [nicho]", "afiliados Kiwify [nicho]"
   - Monitorar Instagram/YouTube de produtores do nicho (checar se usam Kiwify na bio)
   - Acessar comunidades no Telegram/Discord de afiliados brasileiros
   - Listar 10-15 produtores-alvo com link do produto e dados de contato

5. **Abordar produtores para afiliação** — Enviar pitch personalizado para cada produtor.
   - Formato do pitch: audiência relevante + canais de divulgação + resultados anteriores
   - Canal preferencial: DM no Instagram ou e-mail do produtor (evitar WhatsApp frio)
   - Template de pitch: "Oi [Nome], tenho [X mil seguidores/visitantes/lista] no nicho [Y]. Gostaria de promover [produto] como afiliado. Posso compartilhar meus canais e métricas."
   - Aguardar resposta e link de convite (2-7 dias típico)

6. **Aceitar convite e configurar afiliação** — Ao receber link de convite do produtor:
   - Clicar no link e aceitar os termos de afiliação
   - Verificar % de comissão acordada e janela de atribuição (cookie)
   - Confirmar que conta Kiwify está logada antes de aceitar convite

7. **Gerar links rastreáveis por canal** — No painel Kiwify → Afiliações → Produto:
   - Copiar link de afiliado padrão
   - Adicionar parâmetro UTM para rastreamento: `?utm_source={canal}&utm_medium={tipo}&utm_campaign={campanha}`
   - Alternativa: usar encurtador com rastreamento (Bitly Pro, Shorby) para links mais limpos
   - Documentar todos os links no arquivo de output

8. **Configurar notificações de venda** — Ativar alertas no painel Kiwify.
   - Notificações por e-mail para cada venda comissionada
   - Verificar relatório de rastreamento em: Afiliações → Relatórios → Por produto

## Framework

### Modelo de Taxas Kiwify para Afiliados

| Ticket do Produto | % Comissão | Comissão Bruta | Taxa Kiwify | Comissão Líquida |
|-------------------|-----------|----------------|-------------|-----------------|
| R$ 97 | 40% | R$ 38,80 | R$ 4,89 | R$ 33,91 |
| R$ 197 | 40% | R$ 78,80 | R$ 8,38 | R$ 70,42 |
| R$ 497 | 40% | R$ 198,80 | R$ 18,84 | R$ 179,96 |
| R$ 997 | 40% | R$ 398,80 | R$ 36,34 | R$ 362,46 |

*Taxa = (ticket × 3,49%) + R$1,50*

### Estratégia de Networking com Produtores

```
FRIO  (sem contato prévio)
  → DM com pitch curto + prova de audiência
  → Taxa de resposta: ~20-30%

MORNO (engajou no conteúdo do produtor)
  → Mencionar conteúdo específico + pitch personalizado
  → Taxa de resposta: ~50-60%

QUENTE (indicado por outro produtor ou parceiro)
  → Referência direta + contexto da indicação
  → Taxa de resposta: ~80-90%
```

### Canais de Descoberta de Produtores Kiwify

- Grupos Facebook: "Afiliados Digitais Brasil", "Kiwify Afiliados", grupos de nicho específico
- Hashtags Instagram: #kiwify, #produtodigital + hashtag do nicho
- Comunidades Telegram: grupos de afiliados BR (buscar "afiliados Brasil Telegram")
- Listas de ferramentas: procurar "melhores cursos de [nicho]" e verificar checkout

## Veto Conditions

- **HARD VETO:** Produto sem página de vendas profissional ou com checkout quebrado — converter a venda é impossível
- **HARD VETO:** Produtor sem presença pública verificável (zero social, zero comentários) — risco de golpe ou produto abandonado
- **HARD VETO:** Comissão líquida calculada < R$15 por venda em produto de ticket único — inviável para qualquer canal pago
- **SOFT VETO:** Produtor novo (< 6 meses de operação, < 50 vendas verificáveis) — aguardar track record antes de investir em divulgação
- **SOFT VETO:** Sem acordo sobre janela de cookie confirmado por escrito — exigir clareza antes de promover

## Output

- **File:** `docs/setup/kiwify-affiliate-setup-{date}.md`
- **Format:** Markdown com tabela de produtores e status de afiliação

## Output Example

```yaml
setup_date: "2026-02-18"
platform: Kiwify
account_status: active
pix_key: "contato@exemplo.com.br"

producers_contacted:
  - name: "Maria Oliveira"
    product: "Método Finanças Pessoais 2.0"
    ticket: 297.00
    commission_pct: 40
    commission_gross: 118.80
    kiwify_fee: 11.88
    commission_net: 106.92
    contact_channel: instagram_dm
    contact_date: "2026-02-18"
    status: pending_response

producers_approved:
  - name: "Carlos Mendes"
    product: "Copywriting Para Redes Sociais"
    ticket: 197.00
    commission_pct: 50
    commission_net: 83.85
    cookie_days: 15
    affiliate_link: "https://pay.kiwify.com.br/ABCD1234?afiliado=xyz"
    links_by_channel:
      instagram: "https://bit.ly/copy-cm-ig"
      email: "https://bit.ly/copy-cm-em"

notes: |
  Kiwify não tem marketplace público. Todos os acessos são via
  convite do produtor. Manter networking ativo em grupos de afiliados
  para acesso a novos lançamentos antes da concorrência.

next_step: "Executar AFF_BR_003 (validate-produto-digital) para produtos aprovados"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
