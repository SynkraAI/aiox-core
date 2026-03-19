# coherence-check

> Verificar alinhamento do conteúdo criado com brand guidelines — gate de qualidade executado pelo presenca-digital-chief antes de aprovar peças para publicação

---

## Task Definition

```yaml
task_name: "coherence-check"
status: active
responsible_executor: presenca-digital-chief
execution_type: agent
squad: presenca-digital
version: 1.0.0
```

---

## Input

- Peça(s) de conteúdo para verificação (texto, roteiro ou carrossel)
- Brand Voice Guidelines (branding squad output)
- Brand Book (branding squad output)
- `content-pillars.json` (output de content-strategy)
- Contexto: pilar declarado e objetivo da peça

## Output

- Laudo de coerência: APROVADO / APROVADO COM AJUSTES / REPROVADO
- Lista de ajustes necessários (quando aplicável)
- Versão corrigida da peça (quando APROVADO COM AJUSTES)

## Action Items

1. Verificar **alinhamento de pilar**: a peça pertence ao pilar declarado?
2. Verificar **tom e voz**: o tom está alinhado com Brand Voice Guidelines?
   - Vocabulário autorizado vs. proibido
   - Formalidade/informalidade correta para a plataforma
   - Presença ou ausência de humor conforme a marca
3. Verificar **posicionamento**: a mensagem reforça o posicionamento definido no Brand Book?
4. Verificar **CTA**: o CTA é coerente com os objetivos de negócio definidos?
5. Verificar **consistência de identidade**: a peça poderia ser confundida com um concorrente?
6. Verificar **limites de conteúdo**: a peça não viola nenhuma restrição de marca (temas proibidos, associações negativas)?
7. Emitir laudo com veredicto e lista de ajustes específicos
8. Para APROVADO COM AJUSTES: gerar versão corrigida

## Acceptance Criteria

- [ ] Todos os 6 pontos de verificação cobertos no laudo
- [ ] Veredicto emitido (APROVADO / APROVADO COM AJUSTES / REPROVADO)
- [ ] Ajustes listados com localização precisa no conteúdo (linha ou slide)
- [ ] Versão corrigida gerada quando veredicto é APROVADO COM AJUSTES
- [ ] Laudo referencia explicitamente trechos do Brand Voice Guidelines ou Brand Book
- [ ] Tempo de resposta: laudo gerado antes de devolver ao solicitante

## Veto Conditions

- Verificação sem referência aos documentos de brand (laudo subjetivo)
- Laudo sem localização precisa dos problemas encontrados
- REPROVADO sem listar todos os motivos de reprovação
- APROVADO para peça com violação de tom identificada mas ignorada
- Ausência de versão corrigida quando veredicto é APROVADO COM AJUSTES

## Output Example

```
PEÇA: Post LinkedIn — "A maioria dos criadores tem seguidores. Poucos têm renda."
PILAR DECLARADO: Pico (Monetização para criadores)
VEREDICTO: APROVADO COM AJUSTES

VERIFICAÇÕES:

[✓] Alinhamento de pilar: Correto — aborda monetização diretamente.

[✓] Tom e voz: Direto e provocativo, dentro do tom "mentor honesto" definido no Brand Voice. Vocabulário sem jargões técnicos. ✓

[⚠] Posicionamento: Linha "Seguidores seguem. Clientes compram." é forte, mas o CTA final ("Qual é a sua oferta?") pode soar exigente demais sem contexto. Ajuste: suavizar para "Você já tem uma oferta definida?"

[✓] CTA: Pergunta reflexiva alinhada com objetivo de awareness e educação do pilar.

[✓] Identidade: Tom único, não confundível com concorrentes identificados.

[✓] Limites: Nenhuma violação. Tema dentro dos permitidos.

AJUSTES NECESSÁRIOS:
- Linha final: "Qual é a sua?" → "Você já tem uma oferta definida?"
  Motivo: Brand Voice define tom "encorajador, não exigente" (Brand Voice Guidelines, p.4)

VERSÃO CORRIGIDA:
[...texto completo com ajuste aplicado...]
```
