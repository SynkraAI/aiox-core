# compliance-review-prop

## Metadata
```yaml
task_id: AFF_PRP_005
agent: prop-trading-affiliate
type: audit
complexity: medium
estimated_time: "1h-2h"
source: "FTC Endorsement Guides 16 CFR Part 255 + YMYL Google Quality Guidelines + CONAR BR (adapted for prop trading affiliate content)"
```

## Purpose
Auditar todo o conteúdo de prop trading (reviews, comparações, campanhas, posts sociais) para garantir conformidade com requisitos legais mínimos: risk disclaimer em 12pt+, declaração "not financial advice", affiliate disclosure, ausência de garantias de lucro e disclaimer de performance passada.

## Prerequisites
- Lista de URLs ou arquivos de conteúdo de prop trading a auditar
- Acesso ao CMS do site para verificar e editar conteúdo publicado
- Acesso a e-mails enviados e agendados sobre prop firms
- Ferramenta de verificação de fonte tipográfica (inspetor do browser ou plugin)

## Steps

1. **Compilar inventário de conteúdo a auditar** — Mapear todo o conteúdo de prop trading ativo.
   - Listar todas as URLs de reviews de prop firms publicadas
   - Listar página de comparação /melhores-prop-firms/
   - Listar posts de blog relacionados a prop trading
   - Listar e-mails enviados no último trimestre (verificar templates)
   - Listar posts sociais fixados (Telegram, Instagram) sobre prop firms
   - Registrar data de criação de cada item para priorizar os mais antigos (maior risco)

2. **Auditar Risk Disclaimer** — Verificar presença e adequação em cada peça.
   - **Critério mínimo:** texto de aviso de risco presente em TODOS os conteúdos
   - **Posição:** no início do conteúdo (acima do fold ou na primeira tela)
   - **Tamanho de fonte:** >= 12pt em desktop E verificar em mobile (inspetor do browser)
   - **Conteúdo mínimo:** deve mencionar "risco de perda", "não adequado para todos", "resultados passados não garantem futuros"
   - **Repetição:** presente também no final de reviews longas (> 1500 palavras)
   - Registrar: CONFORME / NÃO CONFORME / NECESSITA CORREÇÃO por item auditado

3. **Auditar declaração "Not Financial Advice"** — Verificar ausência de conselho financeiro implícito.
   - **Critério mínimo:** declaração explícita de que o conteúdo não constitui aconselhamento financeiro
   - **Phrasing aceitável:** "apenas para fins informativos", "não é conselho de investimento", "consulte um profissional licenciado"
   - **Red flag:** frases que soam como conselho ("você deveria investir em X", "X é a melhor escolha para você")
   - Verificar: presente em review, campanhas de e-mail, posts longos
   - Registrar: CONFORME / NÃO CONFORME por item

4. **Auditar Affiliate Disclosure** — Verificar que divulgação de comissão é clara e anterior ao link.
   - **Critério FTC:** disclosure deve estar ANTES do primeiro link de afiliado no conteúdo
   - **Critério de visibilidade:** não pode estar enterrada em rodapé ou letra minúscula
   - **Conteúdo mínimo:** mencionar recebimento de comissão e que não tem custo adicional para o leitor
   - **E-mails:** disclosure na abertura do e-mail, antes de qualquer CTA
   - **Posts sociais:** hashtag #ad ou #publi em PT-BR + frase de disclosure
   - Registrar: CONFORME / NÃO CONFORME por item

5. **Auditar ausência de garantias de lucro** — Identificar claims proibidos.
   - Buscar no conteúdo por frases de garantia: "você vai lucrar", "ganhos garantidos", "risco zero", "certeza de aprovação"
   - Verificar depoimentos usados: citam valores específicos como garantia? ("eu ganhei $5K e você também pode")
   - Verificar CTAs: algum CTA implica resultado garantido?
   - Verificar títulos e headlines: exageros que podem ser considerados false advertising
   - Registrar: cada frase problemática encontrada com localização exata (URL + parágrafo)

6. **Auditar disclaimer de performance passada** — Verificar tratamento de resultados históricos.
   - Toda menção a resultados de outros traders (screenshots, proofs) deve ter disclaimer
   - **Texto mínimo:** "Resultados passados não são garantia de resultados futuros"
   - Verificar: screenshots de payouts exibidos nas reviews
   - Verificar: testimonials ou depoimentos de traders
   - Registrar: cada uso de evidência histórica sem disclaimer

7. **Gerar relatório de conformidade** — Consolidar achados e classificar por severidade.
   - **CRÍTICO:** violação que pode gerar ação legal (ausência de risk disclaimer, false advertising)
   - **ALTO:** violação de FTC/CONAR que pode gerar penalização (disclosure ausente ou inadequada)
   - **MÉDIO:** inconsistência que prejudica YMYL score sem risco legal imediato
   - **BAIXO:** oportunidade de melhoria de clareza (disclaimer poderia ser mais proeminente)
   - Priorizar correções: CRÍTICO → 24h, ALTO → 48h, MÉDIO → próxima atualização programada

8. **Executar correções** — Implementar fixes em cada item não conforme.
   - Editar no CMS cada URL com problema CRÍTICO ou ALTO imediatamente
   - Atualizar templates de e-mail com textos padronizados de compliance
   - Para posts sociais: editar ou deletar e republicar com disclosure adequada
   - Registrar cada correção no relatório com data e responsável

## Framework

### Textos Padronizados de Compliance para Prop Trading

**Risk Disclaimer (mínimo 12pt, início de review):**
```
AVISO DE RISCO: Prop trading envolve risco significativo de perda de capital.
A taxa de avaliação paga pode ser perdida se as regras de drawdown forem
violadas. Lucros em contas simuladas não garantem lucros em contas reais
ou fundadas. Resultados passados de outros traders não são indicativos de
seus resultados futuros. Nunca arrisque capital que não pode perder.
```

**Not Financial Advice (início de review e campanhas):**
```
As informações deste conteúdo são exclusivamente para fins informativos
e educacionais. Nada aqui constitui aconselhamento financeiro, de
investimento ou de trading. Consulte um profissional financeiro licenciado
antes de qualquer decisão de investimento ou contratação de serviços de
prop trading.
```

**Affiliate Disclosure (antes do primeiro link, tamanho normal):**
```
Divulgação de Afiliado: Alguns links neste conteúdo são links de afiliado.
Se você se inscrever em uma prop firm através dos nossos links, podemos
receber uma comissão sem custo adicional para você. Isso não influencia
nossas avaliações — todas as opiniões são nossas.
```

**Past Performance Disclaimer (junto com screenshots/resultados):**
```
Resultados apresentados são de traders individuais e representam seu
desempenho específico. Resultados passados não são indicativos nem
garantia de resultados futuros.
```

### Checklist de Auditoria por Item de Conteúdo

| Requisito | Presente? | Posição Correta? | Fonte Correta? | Conteúdo Adequado? |
|-----------|-----------|-----------------|---------------|---------------------|
| Risk Disclaimer | [ ] | [ ] | [ ] >= 12pt | [ ] |
| Not Financial Advice | [ ] | [ ] | [ ] | [ ] |
| Affiliate Disclosure | [ ] | [ ] antes do link | [ ] | [ ] |
| Ausência de garantias | [ ] | n/a | n/a | [ ] sem "garantido" |
| Past performance disclaimer | [ ] se screenshots | [ ] | [ ] | [ ] |

**CONFORME:** todos os 5 itens marcados
**NÃO CONFORME:** qualquer item não marcado = necessita correção

### Severidade por Tipo de Violação

```
CRÍTICO — Risco legal imediato:
  - Ausência total de risk disclaimer em review publicada
  - Afirmação de lucros garantidos ("aprovação garantida", "lucro certo")
  - Nenhuma menção de "not financial advice" em conteúdo de trading
  PRAZO DE CORREÇÃO: 24 horas

ALTO — Violação FTC/CONAR:
  - Affiliate disclosure ausente ou após o primeiro link
  - Risk disclaimer em fonte < 12pt
  - Disclosure escondida em rodapé ou texto cinza sem contraste
  PRAZO DE CORREÇÃO: 48 horas

MÉDIO — YMYL sem risco legal direto:
  - Past performance disclaimer ausente em screenshots
  - Risk disclaimer não repetido no final de review longa
  - Depoimento sem contexto de performance individual
  PRAZO DE CORREÇÃO: próxima atualização programada

BAIXO — Melhoria de boas práticas:
  - Disclaimer poderia ser mais proeminente (cor, box)
  - FAQ sem reforço do aviso de risco
  PRAZO DE CORREÇÃO: próxima revisão trimestral
```

## Veto Conditions

- **HARD VETO:** Publicar novo conteúdo de prop trading sem executar esta auditoria primeiro — todos os novos conteúdos devem ser conformes na publicação
- **HARD VETO:** Manter conteúdo CRÍTICO ou ALTO sem correção por > 48h após identificação — risco legal ativo
- **HARD VETO:** Usar screenshots de payout de terceiros sem past performance disclaimer — potencialmente enganoso
- **SOFT VETO:** Auditar sem ferramenta de verificação de fonte (inspetor do browser) — não é possível garantir conformidade do 12pt sem verificação técnica

## Output

- **File:** `docs/compliance/prop-compliance-audit-{date}.md`
- **Format:** Markdown com tabela de itens auditados e relatório de achados

## Output Example

```yaml
audit_date: "2026-02-18"
auditor: "prop-trading-affiliate"
scope: "Todos os conteúdos prop trading publicados até 2026-02-18"

items_audited: 12
items_compliant: 7
items_non_compliant: 5

findings:
  - item_url: "/reviews/alpha-capital-pro/"
    status: NON_COMPLIANT
    severity: ALTO
    issue: "Affiliate disclosure após o primeiro link (está no parágrafo 3)"
    fix_required: "Mover disclosure para o parágrafo introdutório, antes do primeiro CTA"
    deadline: "2026-02-20"
    fixed: false

  - item_url: "/reviews/firma-b-review/"
    status: NON_COMPLIANT
    severity: CRÍTICO
    issue: "Risk disclaimer em fonte 9pt (abaixo do mínimo de 12pt)"
    fix_required: "Aumentar fonte para mínimo 12pt; adicionar box com cor de destaque"
    deadline: "2026-02-19"
    fixed: false

  - item_url: "/reviews/firma-c-review/"
    status: COMPLIANT
    severity: null
    issue: null

  - item_email: "Email template — Flash Sale Genérico"
    status: NON_COMPLIANT
    severity: ALTO
    issue: "Template não inclui opt-out link em posição padrão"
    fix_required: "Adicionar opt-out link no footer de todos os templates"
    deadline: "2026-02-20"
    fixed: false

summary:
  critical: 1
  alto: 3
  medio: 1
  baixo: 0

next_audit: "2026-05-18"  # Trimestral
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
