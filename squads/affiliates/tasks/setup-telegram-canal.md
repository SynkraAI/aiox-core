# setup-telegram-canal

## Metadata
```yaml
task_id: AFF_BR_006
agent: marketplace-ops
type: setup
complexity: low
estimated_time: "1h-2h"
source: "Telegram Channel Best Practices — Affiliate Marketing (adapted for BR market)"
```

## Purpose
Configurar canal Telegram de ofertas de afiliado com branding profissional e automação básica, aproveitando broadcast ilimitado sem algoritmo e a base de 22 milhões de usuários brasileiros como canal de distribuição de alta abertura.

## Prerequisites
- Conta Telegram pessoal ativa (número de telefone verificado)
- Nome e identidade do canal definidos (alinhado ao nicho)
- Logo/avatar do canal criado (512×512px, PNG)
- Pelo menos 3-5 posts de conteúdo para publicar antes de convidar membros
- Bot Token do BotFather (para automações, se aplicável)

## Steps

1. **Criar canal Telegram** — Configurar canal público com identidade profissional.
   - Abrir Telegram → Novo Canal → Canal Público
   - Definir nome do canal: claro, memorável, relacionado ao nicho (ex: "Ofertas Finanças BR")
   - Criar username (link permanente): `@ofertasfinancasbr` — sem espaços, sem acentos
   - Adicionar descrição completa: o que o canal entrega, frequência, tipo de conteúdo
   - Fazer upload do avatar (512×512px PNG) e, opcionalmente, foto de capa (1280×720px)

2. **Configurar permissões do canal** — Definir quem pode postar e interagir.
   - Tipo: Canal (somente admin posta) — não grupo (evita spam)
   - Ativar opção "Assinar" para novos membros via link
   - Configurar "Comentários" (linked discussion group opcional para engagement)
   - Proteger conteúdo: ativar "Restrição de encaminhamento" se conteúdo exclusivo

3. **Criar bot de boas-vindas (opcional mas recomendado)** — Configurar automação de entrada.
   - Criar bot via @BotFather: `/newbot` → nome → username
   - Salvar Bot Token com segurança
   - Adicionar bot ao canal como admin (permissão de post)
   - Configurar mensagem de boas-vindas automática para novos membros (via ManyBot ou Combot)

4. **Produzir conteúdo inicial (seed content)** — Publicar antes de divulgar o canal.
   - Criar 5-7 posts de conteúdo de valor no nicho (não apenas ofertas)
   - Mix recomendado: 60% conteúdo educativo + 40% ofertas
   - Incluir pelo menos 1 post explicando a proposta do canal e frequência de publicação
   - Usar formatação Markdown do Telegram: **negrito**, _itálico_, `código`, [link](URL)

5. **Configurar automação de posts programados** — Usar ferramenta de agendamento.
   - Opção gratuita: Telegram nativo (agendamento manual de posts futuros)
   - Opção paga: SocialBee, Publer, Buffer (suporte a Telegram)
   - Alternativa: n8n ou Make.com com webhook Telegram para automação avançada
   - Definir horários fixos de publicação (consistência é fator de retenção)

6. **Criar estrutura de posts por tipo** — Padronizar formatos de publicação.
   - **Post de Oferta:** emoji + nome do produto + preço + benefício + link + validade
   - **Post Educativo:** título + desenvolvimento (200-500 palavras) + CTA suave
   - **Post Flash Sale:** emoji de urgência + oferta + contador de tempo + link
   - **Post de Prova Social:** screenshot ou depoimento + produto + link
   - Criar 2-3 exemplos de cada tipo para referência do operador

7. **Planejar estratégia de crescimento** — Definir como atrair membros.
   - Divulgar canal em outros canais do nicho (parcerias de menção cruzada)
   - Adicionar link do canal em bio do Instagram, YouTube e site
   - Criar post fixo no canal com "Como compartilhar este canal" (crescimento orgânico)
   - Grupos de afiliados BR: compartilhar canal com identificação do nicho
   - SEO: publicar canal em diretórios de canais Telegram (t.me/brasil, tgstat.com)

8. **Configurar métricas e analytics** — Monitorar desempenho do canal.
   - Telegram nativo: visualizar "Views" em cada post diretamente
   - Analytics avançado: TGStat.com (gratuito) — seguidores, views por post, crescimento
   - Rastreamento de links: usar encurtadores rastreáveis em todas as ofertas (Bitly, Rebrandly)
   - Planilha de acompanhamento semanal: membros, views médias, cliques, receita atribuída

## Framework

### Benchmark Telegram para Afiliados BR

```
22M   — Usuários ativos Telegram no Brasil (2025)
65%   — Taxa média de abertura de posts em canais (vs 20-25% e-mail)
0     — Limitação de membros no canal (broadcast ilimitado)
0     — Algoritmo de alcance (100% dos membros recebem cada post)
5-15% — Taxa de clique típica em links de oferta relevante
```

### Frequência e Mix de Conteúdo Recomendados

```
DIÁRIO (7 posts/semana):
  Seg-Sex: 1 oferta + 1 conteúdo alternados
  Sáb: 1 post especial (flash sale ou curadoria semanal)
  Dom: 1 post leve (dica ou curiosidade do nicho)

MIX DE CONTEÚDO:
  50% — Educativo / Conteúdo de valor (sem produto direto)
  30% — Oferta de afiliado (produto validado, link rastreável)
  20% — Prova social e depoimentos (engajamento + conversão)
```

### Formatação Markdown do Telegram

```
**Texto em negrito** → para headlines e benefícios-chave
__Texto em itálico__ → para ênfase suave
`Código ou preço` → para destacar valores monetários
[Texto do link](https://url.com) → links rastreáveis
---  → separador de seções

EMOJIS RECOMENDADOS (usar com moderação):
🔥 Flash sales e ofertas urgentes
💰 Preços e descontos
📚 Conteúdo educativo
⚡ Dicas rápidas
✅ Benefícios e confirmações
⏰ Deadlines e urgência real
```

### Modelo de Post de Oferta Telegram

```
🔥 **[Nome do Produto]** — Oportunidade de hoje

[1-2 frases sobre o problema que resolve]

✅ [Benefício 1]
✅ [Benefício 2]
✅ [Benefício 3]

💰 De ~~R$[preço normal]~~ por **R$[preço promocional]**
ou [parcelamento]

⏰ Válido até [data/hora] — [vagas/unidades restantes se real]

👉 [Link encurtado rastreável]

—
📌 Para mais ofertas: t.me/[username do canal]
```

## Veto Conditions

- **HARD VETO:** Canal criado como Grupo (todos postam) em vez de Canal (somente admin) — spam inevitável, credibilidade destruída
- **HARD VETO:** Publicar links de afiliado sem conteúdo de valor precedente — canal de spam percebido, alta saída
- **HARD VETO:** Usar nome/avatar do canal que imite marca registrada — risco legal e banimento
- **SOFT VETO:** Divulgar canal antes de ter 5+ posts publicados — primeira impressão de canal abandonado
- **SOFT VETO:** Frequência > 5 posts/dia — saída em massa de membros por excesso
- **SOFT VETO:** Posts sem links rastreáveis — impossível medir ROI por canal

## Output

- **File:** `docs/setup/telegram-canal-setup-{date}.md`
- **Format:** Markdown com configuração completa, links e plano de conteúdo

## Output Example

```yaml
setup_date: "2026-02-18"
channel_name: "Ofertas Finanças Inteligentes"
channel_username: "@ofertasfinancasbr"
channel_url: "https://t.me/ofertasfinancasbr"
channel_type: public
niche: investimentos_br

bot_configured: true
bot_username: "@FinancasBRBot"
welcome_message: "Bem-vindo ao canal! Aqui você encontra as melhores ofertas e dicas do mundo financeiro. Posts diários às 08h e 20h. Para sair, clique em Sair no topo do canal."

seed_posts_published: 6
post_mix:
  educational: 4
  offers: 2

schedule:
  weekdays: ["08:00", "20:00"]
  weekends: ["10:00"]
  frequency: "2x weekdays, 1x weekends"

analytics_tool: "TGStat.com"
link_shortener: "Bitly Pro (com rastreamento)"

growth_actions:
  - "Link na bio do Instagram @finançasinteligentes"
  - "Menção em 3 grupos de afiliados BR no Facebook"
  - "Cadastro em tgstat.com/br"
  - "Parceria de menção com @canal_parceiro (700 membros)"

initial_members: 0
target_30d: 200
target_90d: 1000

next_step: "Iniciar divulgação do canal; executar AFF_MKT_004 (create-offer-broadcast) para primeiros envios"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
