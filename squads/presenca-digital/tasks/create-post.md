# create-post

> Criar post curto de texto usando Atomic Essays — focado em uma única ideia, para LinkedIn, Instagram ou X

---

## Task Definition

```yaml
task_name: "create-post"
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
- Pilar ou tema específico solicitado
- Plataforma-alvo (LinkedIn / Instagram / X)
- Hook sugerido (opcional — pode usar output de hook-generation)

## Output

- Post finalizado em texto puro, pronto para publicação
- Variação de hook (A/B) quando solicitado

## Action Items

1. Selecionar 1 ideia atômica do pilar indicado (Ship 30 principle: uma ideia, um ponto)
2. Gerar ou selecionar hook de abertura via regra dos 3 segundos
3. Estruturar o corpo com a metodologia Atomic Essay:
   - Hook (1-2 linhas)
   - Desenvolvimento (3-7 linhas com contraste ou lista)
   - CTA ou conclusão reflexiva (1-2 linhas)
4. Adaptar tom e vocabulário conforme Brand Voice Guidelines
5. Ajustar comprimento conforme plataforma: X (280 chars), LinkedIn (1.300 chars ideal), Instagram (caption curta)
6. Revisar: clareza, ritmo de leitura, ausência de jargão desnecessário
7. Gerar variação B do hook se solicitado

## Acceptance Criteria

- [ ] Post comunica exatamente 1 ideia central (Atomic Essay principle)
- [ ] Hook captura atenção nos primeiros 2 segundos de leitura
- [ ] Tom alinhado com Brand Voice Guidelines
- [ ] Comprimento adequado para a plataforma-alvo
- [ ] Sem erros gramaticais ou ortográficos
- [ ] CTA presente (mesmo que implícito — reflexão, pergunta ou convite)

## Veto Conditions

- Post com mais de 1 ideia principal (dispersão dilui impacto)
- Tom inconsistente com Brand Voice Guidelines
- Hook genérico ("Você sabia que...?" ou "Hoje quero falar sobre...")
- Post sem conclusão ou CTA

## Output Example

```
[LinkedIn — Pilar: Monetização para criadores]

A maioria dos criadores tem seguidores. Poucos têm renda.

A diferença não é o número de seguidores.
É a existência de uma oferta clara.

Seguidores seguem.
Clientes compram.

Se você nunca disse ao seu público o que você vende,
eles não têm como comprar de você.

O próximo passo não é mais conteúdo.
É uma oferta.

Qual é a sua?
```
