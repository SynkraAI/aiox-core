# setup-hotmart-affiliate

## Metadata
```yaml
task_id: AFF_BR_001
agent: affiliate-br
type: setup
complexity: medium
estimated_time: "1h-2h"
source: "Hotmart Partner Program — Official Onboarding Documentation (adapted)"
```

## Purpose
Configurar conta de afiliado na Hotmart do zero, desde o cadastro até a ativação de links rastreáveis e configuração do PaymentHub, habilitando promoção de produtos digitais no maior marketplace de infoprodutos do Brasil.

## Prerequisites
- CPF/CNPJ válido e conta bancária ou PIX ativa para recebimento
- Documento de identidade (RG, CNH ou passaporte) para verificação KYC
- Nicho de atuação definido (para curadoria de produtos no marketplace)
- E-mail profissional (não usar Gmail pessoal para contas de afiliado)

## Steps

1. **Criar conta Hotmart** — Acessar hotmart.com/affiliates e preencher cadastro completo.
   - Escolher perfil: Pessoa Física (CPF) ou Pessoa Jurídica (CNPJ)
   - Verificar e-mail e completar dados de perfil (foto, bio, site)
   - Ativar autenticação de dois fatores (obrigatório para saques)

2. **Completar verificação de identidade** — Submeter documentos no painel "Verificação".
   - Enviar frente e verso do documento + selfie com documento
   - Aguardar aprovação (24-72h úteis)
   - Status aprovado é pré-requisito para saques e links de afiliado premium

3. **Configurar PaymentHub** — Acessar Configurações → PaymentHub.
   - Cadastrar conta bancária ou chave PIX para recebimentos
   - Definir frequência de saque: diário, semanal ou mensal
   - Confirmar dados via micro-depósito de verificação se exigido

4. **Explorar marketplace e selecionar produtos** — Acessar "Marketplace" no painel.
   - Filtrar por nicho definido no pré-requisito
   - Aplicar filtro: temperatura ≥ 80, comissão ≥ 30%, avaliação produtor ≥ 4.0
   - Listar 5-10 produtos candidatos para análise posterior (task AFF_BR_003)

5. **Solicitar afiliação nos produtos selecionados** — Para cada produto candidato:
   - Clicar "Quero ser afiliado"
   - Produtos com "afiliação automática" geram link imediatamente
   - Produtos com "afiliação manual" exigem aprovação do produtor (1-5 dias)
   - Registrar status de cada solicitação na planilha de tracking

6. **Gerar e organizar links de afiliado** — Para cada aprovação recebida:
   - Acessar "Minhas ferramentas" → "Links de afiliado"
   - Gerar link padrão + links com parâmetro SRC para rastreamento por canal
   - Formato: `hotmart.com/product/slug/?a={seu-hotlink}&src={canal}`
   - Criar nomenclatura padronizada: `produto-canal-data` (ex: `curso-x-instagram-20260218`)
   - Documentar todos os links no arquivo de output

7. **Verificar configuração de cookie** — Confirmar janela de atribuição de cada produto.
   - Cookie padrão Hotmart: 30 dias (adequado para maioria dos funis)
   - Produtos com janelas < 7 dias requerem atenção especial no funil
   - Registrar cookie duration no output

8. **Validar primeiro link** — Testar link de afiliado em aba anônima.
   - Confirmar que o link redireciona corretamente para página de vendas
   - Verificar que hotlink aparece na URL de destino
   - Confirmar que cookie é setado corretamente

## Framework

### Estrutura de Comissões Hotmart

| Tipo de Produto | Faixa de Comissão | Cookie | Observações |
|----------------|-------------------|--------|-------------|
| Cursos e treinamentos | 30-80% | 30 dias | Maior potencial de margem |
| Assinaturas | 20-40% (recorrente) | 30 dias | LTV superior |
| E-books | 40-70% | 30 dias | Ticket médio baixo |
| Comunidades | 20-50% (recorrente) | 30 dias | Alta retenção |

### Parâmetros SRC para Rastreamento Multi-Canal

```
?src=instagram    → Posts e stories Instagram
?src=youtube      → Descrição de vídeos YouTube
?src=email        → Campanhas de e-mail
?src=whatsapp     → Listas de broadcast WhatsApp
?src=telegram     → Canal Telegram
?src=blog         → Artigos de blog / SEO orgânico
?src=paid-meta    → Anúncios Meta Ads
?src=paid-google  → Anúncios Google Ads
```

### Termômetro de Temperatura Hotmart

```
>= 100 — Produto quente: alta conversão, muitos afiliados ativos
70-99  — Bom produto: validado com tração constante
40-69  — Produto mediano: verificar dados extras antes de promover
< 40   — Produto frio: risco alto, exige análise profunda
```

## Veto Conditions

- **HARD VETO:** Produto com taxa de reembolso > 10% visível no marketplace — não solicitar afiliação, risco financeiro direto
- **HARD VETO:** Produtor com avaliação < 3.5 estrelas e mais de 20 avaliações — reputação comprometida
- **HARD VETO:** Produto marcado como "Em conformidade pendente" ou com alertas da Hotmart — risco de bloqueio
- **SOFT VETO:** Comissão < 20% em produtos de ticket único — margem insuficiente para tráfego pago; aceitar apenas para orgânico
- **SOFT VETO:** Temperatura < 40 sem justificativa de lançamento iminente — aguardar aquecimento

## Output

- **File:** `docs/setup/hotmart-affiliate-setup-{date}.md`
- **Format:** Markdown com tabela de produtos e links gerados

## Output Example

```yaml
setup_date: "2026-02-18"
platform: Hotmart
account_status: verified
payment_hub: configured
pix_key: "contato@exemplo.com.br"

products_approved:
  - name: "Curso Investimentos Descomplicados"
    product_id: "XKQP91234"
    producer: "João Silva"
    commission: "50%"
    cookie_days: 30
    temperature: 127
    refund_rate: "4.2%"
    affiliate_link: "https://hotmart.com/product/curso-investimentos/?a=abc123"
    links_by_channel:
      instagram: "https://hotmart.com/product/curso-investimentos/?a=abc123&src=instagram"
      email: "https://hotmart.com/product/curso-investimentos/?a=abc123&src=email"
      telegram: "https://hotmart.com/product/curso-investimentos/?a=abc123&src=telegram"

products_pending:
  - name: "Mentoria Tráfego Pago PRO"
    status: awaiting_producer_approval
    requested_at: "2026-02-18"

next_step: "Executar AFF_BR_003 (validate-produto-digital) para cada produto aprovado"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
