# build-bridge-page

## Metadata
```yaml
task_id: AFF_FUN_002
agent: funnel-architect
type: creation
complexity: medium
estimated_time: "30min-1h30min"
source: "Russell Brunson — DotCom Secrets, Bridge Page Framework; Frank Kern — Cold Traffic Conversion"
```

## Purpose
Construir a bridge/pre-sell page que aquece o tráfego antes do link de afiliado, aplicando a estrutura Hook → Story → Credibility → CTA com variantes para tráfego cold e warm, incluindo affiliate disclosure obrigatório.

## Prerequisites
- Produto afiliado definido (link, comissão, página de vendas do produtor lida)
- Avatar do comprador com dores e desejos mapeados
- Temperatura do tráfego conhecida (cold ou warm)
- Funil geral mapeado (`design-affiliate-funnel.md` executado ou equivalente)

## Steps

1. **Ler a página de vendas do produtor** — Analisar a VSL/copy do produto para identificar: principal promessa, mecanismo único, objeções tratadas e preço. A bridge PREPARA o visitante para o que ele vai encontrar — não pode contradizer.

2. **Definir variante (cold vs warm)** — Selecionar o modelo adequado conforme temperatura do tráfego. Cold = historia mais longa, credencial contextualizada. Warm = story mais direta, social proof em destaque.

3. **Criar o Hook** — Escrever headline + sub-headline que param o scroll e prometem a transformação central. Testar mínimo 3 variações.

4. **Escrever a Story (Epiphany Bridge)** — Redigir a narrativa que conecta o avatar ao produto: backstory do afiliado (ou persona) → problema compartilhado com o avatar → descoberta do produto → resultado/transformação.

5. **Construir o bloco de Credibility** — Adicionar prova social: resultado pessoal, depoimentos (se tiver permissão do produtor), números concretos, tempo de uso do produto.

6. **Escrever o CTA** — Um único botão com copy orientada à transformação (não ao produto). Incluir affiliate disclosure visível acima ou imediatamente abaixo do CTA.

7. **Revisar contra a checklist de qualidade** — Verificar todos os itens da seção Quality Gates antes de publicar.

8. **Documentar a bridge page** — Salvar estrutura em arquivo de outputs com copy blocks e instruções de design.

## Framework

### Estrutura Cold Traffic (tráfego frio)

```
[HOOK — above the fold]
Headline: Promessa + Curiosidade (sem revelar o produto ainda)
Sub-headline: Amplificação da promessa com especificidade
Visual: Foto do afiliado/persona OU resultado concreto (antes/depois)
CTA secundário: "Continua lendo ↓"

[STORY — corpo da página]
Parágrafo 1 — BACKSTORY: "Eu estava exatamente onde você está agora..."
Parágrafo 2 — PROBLEMA: Dor específica compartilhada com o avatar
Parágrafo 3 — AGRAVAMENTO: "E então piorou..."
Parágrafo 4 — DESCOBERTA: "Até que encontrei [mecanismo/produto]"
Parágrafo 5 — TRANSFORMAÇÃO: Resultado concreto com número/tempo

[CREDIBILITY — bloco de prova]
- Resultado pessoal: "{N} dias depois, {resultado mensurável}"
- Depoimento 1 (se disponível): foto + nome + resultado
- Depoimento 2 (se disponível): foto + nome + resultado
- Credencial contextual (não ego): "Testei por X semanas antes de recomendar"

[CTA — único e claro]
Affiliate disclosure: "Este link é de afiliado. Se você comprar, posso receber comissão sem custo adicional para você."
Botão: "QUERO {TRANSFORMAÇÃO} → " (não "Clique aqui" ou "Saiba mais")
Sub-texto do botão: "Você será direcionado para a página oficial de {Produto}"
```

### Estrutura Warm Traffic (tráfego quente — já te conhece)

```
[HOOK — direto]
Headline: "Se você [problema específico], este método foi feito para você"
Sub-headline: Promessa + prova social rápida ("X pessoas já usaram")
Visual: Resultado ou screenshot real

[STORY — condensada]
2-3 parágrafos: descoberta → resultado → por que estou recomendando

[SOCIAL PROOF — destaque]
2-3 depoimentos em destaque (foto, nome, resultado específico)

[CTA — imediato]
Affiliate disclosure
Botão principal + botão secundário (repetir no final)
```

### Headline Templates por Categoria

| Categoria | Template |
|-----------|----------|
| Curiosidade | "Como {avatar} está {resultado} sem {objeção comum}" |
| Medo | "O erro que {percentual}% de {avatar} comete ao tentar {objetivo}" |
| Desejo | "Finalmente: {promessa específica} em {tempo realista}" |
| Surpresa | "Eu estava completamente errado sobre {crença comum}" |
| Prova Social | "{N} pessoas já {resultado} — aqui está o que elas usaram" |

### Affiliate Disclosure (obrigatório — LGPD/FTC)

```
Divulgação: Este post/página contém links de afiliado. Isso significa que se você
clicar e comprar, posso receber uma comissão — sem custo adicional para você.
Só recomendo produtos que testei e acredito genuinamente.
```

## Veto Conditions
- Ausência de affiliate disclosure antes ou junto ao CTA → BLOQUEAR (obrigação legal)
- Mais de um CTA concorrente na página → BLOQUEAR (1 página = 1 objetivo = 1 CTA)
- Headline que faz promessa não sustentada pelo produto do produtor → BLOQUEAR (desinformação = chargeback + ban)
- Bridge page sem Story (só features do produto) → BLOQUEAR (bridge sem story é panfleto)
- Fake urgency (countdown que reinicia ao recarregar) → BLOQUEAR (destrói confiança)
- Copy que imita a página de vendas do produtor palavra por palavra → ALERTAR (canibalização e conflito com o produtor)

## Output
- **File:** `outputs/affiliates/{projeto-slug}/bridge-page-{variante}.md`
- **Format:** Markdown com copy blocks prontos para implementar

## Output Example
```yaml
bridge_page:
  project: "afiliado-emagrecimento-q1"
  variant: "cold"
  traffic_source: "Meta Ads — Lookalike 1%"
  affiliate_product: "Método Emagreça em 30 Dias"
  headline_options:
    - "Como Perdi 8kg Sem Academia e Sem Deixar de Comer (O Método Que Ninguém Me Contou)"
    - "97% das Dietas Falham. Descobri Por Que — e o Que Realmente Funciona"
    - "Eu Tentei Tudo Para Emagrecer. Até Encontrar Isso."
  selected_headline: 1

copy_blocks:
  hook:
    headline: "Como Perdi 8kg Sem Academia e Sem Deixar de Comer"
    subheadline: "O método que descobri depois de 2 anos tentando tudo errado"
    visual_note: "Foto pessoal antes/depois OU imagem de balança com resultado"

  story:
    paragraph_1: "Em 2023 eu pesava 86kg. Já tentei academia, reeducação alimentar, shakes e jejum intermitente. Perdia 2kg e recuperava 3. Estava cansado."
    paragraph_2: "O problema não era força de vontade. Era que eu estava fazendo tudo do jeito errado — para o meu tipo de metabolismo."
    paragraph_3: "Até que uma amiga me indicou um método que ela usava há 3 meses. Eu cético. Mas resolvi testar por 30 dias."
    paragraph_4: "Em 28 dias: -8,2kg. Sem academia. Sem passar fome. Com mais energia do que nos últimos 5 anos."

  credibility:
    personal_result: "8,2kg em 28 dias — verificado na balança em 15/01/2026"
    testimonial_1:
      text: "Segui o método por 6 semanas e perdi 11kg. Minha médica ficou impressionada."
      name: "Carla M., 38 anos, São Paulo"
    context_note: "Testei por 4 semanas antes de recomendar para qualquer pessoa"

  cta_block:
    disclosure: "Este link é de afiliado. Se você comprar, posso receber comissão sem custo adicional para você. Só recomendo o que uso e acredito."
    button_copy: "QUERO CONHECER O MÉTODO →"
    button_subtext: "Você será direcionado para a página oficial do método"
    button_color: "#FF4500"

quality_checklist:
  hook_above_fold: true
  single_cta: true
  affiliate_disclosure: true
  no_fake_urgency: true
  mobile_friendly: "a verificar no builder"
  story_present: true
  contradicts_sales_page: false
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
