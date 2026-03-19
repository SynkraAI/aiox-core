# create-carousel

> Criar carrossel de slides (Instagram/LinkedIn) com estrutura de storytelling e alta retenção

---

## Task Definition

```yaml
task_name: "create-carousel"
status: active
responsible_executor: nicolas-cole
execution_type: agent
squad: presenca-digital
version: 1.0.0
```

---

## Input

- `content-pillars.json` (output de content-strategy)
- Brand Voice Guidelines
- Tema ou pilar específico solicitado
- Plataforma-alvo (Instagram / LinkedIn)
- Número de slides desejado (padrão: 8-12)

## Output

- Roteiro de carrossel: texto de cada slide numerado
- Indicação de elemento visual recomendado por slide (descrição textual)
- Slide de capa com hook e slide final com CTA

## Action Items

1. Definir a promessa central do carrossel (o que o leitor aprende ou ganha)
2. Escrever **slide 1 (capa)**: hook irresistível que gera curiosidade ou promessa clara
3. Escrever **slide 2**: contexto ou "por que isso importa" — validar a dor/desejo
4. Escrever **slides 3 a N-1**: desenvolvimento em pontos claros (1 ponto por slide)
   - Cada slide: título curto + 2-4 linhas de explicação
   - Usar contraste, dados, analogias ou micro-histórias
5. Escrever **slide final**: CTA + resumo da promessa entregue
6. Para cada slide, sugerir direção visual (imagem, cor de fundo, ícone)
7. Revisar fluxo narrativo: cada slide deve "puxar" para o próximo
8. Verificar alinhamento com Brand Voice Guidelines

## Acceptance Criteria

- [ ] Slide 1 tem hook que interrompe o scroll
- [ ] Promessa do slide 1 é entregue até o último slide
- [ ] Cada slide intermediário tem máximo 40 palavras
- [ ] Fluxo narrativo coeso — um slide leva naturalmente ao próximo
- [ ] Slide final tem CTA claro e alinhado ao pilar
- [ ] Direções visuais descritas para todos os slides
- [ ] Tom alinhado com Brand Voice Guidelines

## Veto Conditions

- Slide 1 genérico ou sem promessa clara
- Slides com textos longos demais (acima de 60 palavras)
- Ausência de CTA no slide final
- Mais de 2 ideias por slide (violação do princípio atômico)
- Carrossel sem coerência narrativa entre slides

## Output Example

```
TEMA: "5 erros que impedem criadores de escalar a renda"
PLATAFORMA: Instagram | 8 slides

[Slide 1 — Capa]
Texto: "Você trabalha mais do que nunca e a renda não cresce. Provavelmente é um desses 5 erros."
Visual: fundo preto, texto branco centralizado, logo no rodapé

[Slide 2 — Contexto]
Texto: "A maioria dos criadores resolve o problema errado. Mais conteúdo não é a resposta. A estrutura é."
Visual: ícone de funil quebrado

[Slide 3 — Erro #1]
Título: "Sem oferta definida"
Texto: "Você produz, mas nunca convida para comprar. Seguidores não adivinham que você vende algo."
Visual: balão de fala com ponto de interrogação

[Slide 8 — CTA]
Texto: "Salva esse carrossel. Qual erro você comete? Comenta o número."
Visual: fundo da cor primária da marca
```
