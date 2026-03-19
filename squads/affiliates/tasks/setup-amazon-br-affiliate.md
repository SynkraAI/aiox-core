# setup-amazon-br-affiliate

## Metadata
```yaml
task_id: AFF_MKT_001
agent: marketplace-ops
type: setup
complexity: medium
estimated_time: "1h-2h"
source: "Amazon Associates Program — Official Documentation BR (adapted)"
```

## Purpose
Configurar conta no Amazon Associates Brasil com Store ID, categorias de comissão mapeadas e ferramentas de geração de link (AAWP/Lasso), habilitando monetização de conteúdo via links de produto com cookie de 24 horas.

## Prerequisites
- Conta Amazon.com.br ativa com histórico de compras (aumenta chance de aprovação)
- Site ou canal digital ativo com conteúdo relevante (blog, YouTube, Instagram)
- Mínimo de 3 posts/vídeos publicados sobre produtos do nicho-alvo
- CPF ou CNPJ para dados fiscais
- Conta bancária BR para recebimento em Reais

## Steps

1. **Solicitar acesso ao Amazon Associates BR** — Criar conta no programa de afiliados.
   - Acessar associados.amazon.com.br e clicar em "Inscrever-se"
   - Logar com conta Amazon.com.br existente
   - Preencher dados do site/canal: URL, descrição, tipo de conteúdo, audiência mensal estimada
   - Informar métodos de monetização atuais e como planeja usar os links
   - Aceitar termos do programa e submeter formulário

2. **Configurar Store ID e sub-IDs** — Criar identificadores de rastreamento.
   - Store ID principal: nome curto identificável (ex: `financasbr-20`)
   - Sub-IDs para rastreamento por página/canal: `?tag=financasbr-20&linkCode=ll1&linkId=subid`
   - Criar sub-IDs padronizados: `financasbr20-blog`, `financasbr20-yt`, `financasbr20-ig`
   - Documentar todos os IDs no arquivo de output

3. **Mapear comissões por categoria** — Entender estrutura de comissões antes de criar conteúdo.
   - Acessar painel Associates → Comissões → Tabela de categorias
   - Identificar categorias do nicho e suas respectivas taxas
   - Priorizar categorias com maior comissão para conteúdo initial
   - Atenção: comissão varia de 1% (vídeo games, eletrônicos) a 10% (roupas, beleza)

4. **Instalar ferramenta de criação de links** — Configurar plugin/ferramenta para agilizar links.
   - **AAWP (Amazon Affiliate WordPress Plugin):** ideal para sites WordPress
     - Instalar plugin, inserir credenciais Associates (Access Key + Secret Key)
     - Testar criação de caixa de produto via shortcode `[aawp box="ASIN"]`
   - **Lasso:** ferramenta multi-programa, recomendada para gestão de portfólio
     - Instalar, conectar conta Associates, importar produtos
   - **Alternativa gratuita:** SiteStripe (barra do Associates na amazon.com.br)
     - Nenhuma instalação necessária, gera links diretamente na Amazon

5. **Configurar SiteStripe para links rápidos** — Ativar barra de ferramentas nativa.
   - Fazer login na amazon.com.br com conta Associates
   - A barra SiteStripe aparece automaticamente no topo da Amazon
   - Usar botões "Texto", "Imagem" ou "Texto+Imagem" para gerar links de qualquer produto
   - Testar geração de link em produto do nicho e verificar que Store ID está incluído

6. **Criar primeiros links de produto** — Gerar links rastreáveis para produtos do nicho.
   - Selecionar 5-10 produtos altamente relevantes para o nicho
   - Critérios: rating >= 4.0, mínimo 50 avaliações, disponível com entrega Prime
   - Gerar link para cada produto via SiteStripe ou AAWP
   - Verificar que link inclui Store ID e sub-ID correto por canal
   - Documentar ASIN, nome, preço e link no arquivo de output

7. **Entender e planejar para o cookie de 24h** — Adaptar estratégia à limitação do cookie.
   - Cookie Amazon BR: 24 horas (vs 30 dias em programas de infoprodutos)
   - Implicação: usuário DEVE comprar em até 24h após clicar no link para gerar comissão
   - Estratégias para mitigar: conteúdo de comparação (decisão rápida), landing pages de oferta urgente, remarketing com conteúdo de reforço
   - EXCEÇÃO: se usuário adicionar produto ao carrinho, cookie estende para 90 dias no item
   - Documentar estratégia de conteúdo adequada à janela curta

8. **Verificar requisitos de aprovação permanente** — Garantir conformidade com regras Associates.
   - Mínimo de 3 vendas nos primeiros 180 dias (caso contrário, conta encerrada)
   - Divulgação obrigatória em TODO conteúdo com links Associates: "Como afiliado Amazon, ganho comissões em compras qualificadas"
   - Texto de divulgação deve estar ANTES dos primeiros links no conteúdo
   - Não usar links Associates em e-mails (proibido pelos termos)
   - Não encurtar links de forma a ocultar o Store ID (proibido)

## Framework

### Tabela de Comissões Amazon Associates BR (principais categorias)

| Categoria | Taxa Fixa | Observações |
|-----------|-----------|-------------|
| Moda (roupas, calçados, acessórios) | 10% | Maior comissão na plataforma |
| Beleza, perfumaria, saúde | 8% | Alto volume de vendas |
| Casa e cozinha | 6% | Alta recorrência de compra |
| Livros | 5% | Volume alto, ticket baixo |
| Informática e eletrônicos | 1-3% | Ticket alto, margem baixa |
| Esportes e lazer | 5% | Sazonalidade relevante |
| Brinquedos e jogos | 4% | Pico no Natal (Q4) |
| Video games e consoles | 1% | Evitar como categoria primária |

### Estratégia de Conteúdo vs Cookie 24h

```
CONTENT TYPES QUE FUNCIONAM COM 24h COOKIE:

✅ "Melhores produtos para [uso específico]" — decisão pré-formada, compra imediata
✅ Comparação de 2-3 produtos — usuário já sabe o que quer, está decidindo
✅ Review de produto viral/trending — urgência de compra do momento
✅ "Compre antes de [evento/data]" — urgência contextual real
✅ Página de produtos com desconto ou promoção relâmpago

⚠️ CONTENT TYPES INEFICIENTES COM 24h COOKIE:

❌ Conteúdo de topo de funil ("o que é X?") — compra muito distante do clique
❌ Posts informativos sem intenção de compra clara
❌ Conteúdo de long-form sem CTA de produto específico
```

### Ferramentas de Criação de Links — Comparativo

| Ferramenta | Custo | Ideal Para | Recurso Chave |
|-----------|-------|-----------|--------------|
| SiteStripe | Grátis | Qualquer site | Link rápido direto da Amazon |
| AAWP | ~$49/ano | WordPress | Caixas de produto automáticas |
| Lasso | ~$29/mês | Multi-programa | Gestão de portfólio + analytics |
| EasyAzon | ~$47/ano | WordPress | Links inline no texto |

## Veto Conditions

- **HARD VETO:** Publicar links Amazon Associates em e-mails — proibido pelos termos, encerra conta
- **HARD VETO:** Usar encurtadores que ocultam Store ID (bit.ly sem redirect transparente) — viola termos e perde rastreamento
- **HARD VETO:** Não incluir divulgação de afiliado no conteúdo — violação dos termos e da LGPD
- **HARD VETO:** Criar conta sem ter site/canal com conteúdo publicado — risco de rejeição ou encerramento nos primeiros 180 dias
- **SOFT VETO:** Focar em categorias com comissão < 2% (eletrônicos) sem estratégia de volume compensatório — margem inadequada

## Output

- **File:** `docs/setup/amazon-associates-br-setup-{date}.md`
- **Format:** Markdown com configuração, categorias mapeadas e primeiros links

## Output Example

```yaml
setup_date: "2026-02-18"
program: Amazon Associates BR
store_id: "financasbr-20"
account_status: pending_first_3_sales
approval_deadline: "2026-08-18"  # 180 dias

sub_ids:
  blog: "financasbr20-blog"
  youtube: "financasbr20-yt"
  instagram: "financasbr20-ig"
  telegram: "financasbr20-tg"

target_categories:
  - name: "Livros — Finanças e Investimentos"
    commission_pct: 5
    strategy: "Review + best-of posts"
  - name: "Informática (calculadoras financeiras)"
    commission_pct: 3
    strategy: "Review de nicho específico"

cookie_strategy: |
  Focar em conteúdo de comparação e reviews específicos
  para usuários já em modo de compra. Evitar topo de funil.
  Landing pages de oferta relâmpago para picos de conversão.

tools:
  primary: "SiteStripe (gratuito)"
  future: "AAWP quando site atingir 10K visitas/mês"

first_products:
  - asin: "B08X1234YZ"
    name: "Livro — O Investidor Inteligente (BR edition)"
    price: 49.90
    rating: 4.8
    reviews: 1847
    commission_pct: 5
    estimated_commission: 2.50
    link: "https://amzn.to/xyz123?tag=financasbr-20"

disclosure_text: |
  "Como Associado Amazon, ganho comissões em compras qualificadas.
  Isso não tem custo adicional para você."

next_step: "Publicar primeiro artigo com links Associates e divulgação obrigatória"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
