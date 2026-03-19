# Task: Write VSL Script

**Task ID:** write-vsl
**Executor:** Agent (stefan-georgi)
**Execution Type:** Agent
**Quality Gate:** QG-003
**Template:** templates/vsl-script-tmpl.md

---

## Purpose

Escrever um script de Video Sales Letter (VSL) completo usando o metodo RMBC, otimizado para retencao e conversao.

---

## Inputs

| Input           | Required    | Description                              |
| --------------- | ----------- | ---------------------------------------- |
| product         | Yes         | Produto/servico sendo vendido            |
| market          | Yes         | Publico-alvo                             |
| diagnosis       | Recommended | Output do diagnose-market                |
| duration_target | No          | Duracao alvo em minutos (default: 15-30) |
| rmbc_brief      | Recommended | Output do rmbc-workflow                  |
| price           | Yes         | Preco e opcoes de pagamento              |
| guarantee       | Yes         | Tipo e prazo da garantia                 |

---

## Steps

1. **Review RMBC Brief** - Se disponivel, usar como base
2. **Load Template** - Carregar vsl-script-tmpl.md
3. **Write Pattern Interrupt** - Hook que trava scroll (primeiros 30s)
4. **Write Problem Agitation** - Dor visceral, nao bonita
5. **Write Mechanism Reveal** - O "por que funciona" unico
6. **Write Credibility Section** - Prova + autoridade
7. **Build Offer Stack** - Valor empilhado com ancora de preco
8. **Write Risk Reversal** - Garantia forte
9. **Write Urgency Close** - Escassez real
10. **Write CTA** - Instrucoes claras
11. **Add Slide Notes** - Indicacoes visuais por segmento
12. **Deterministic Pre-Check (textstat + LeIA)** - Analisar por segmento:
   - **Pattern Interrupt (0-30s)**: Flesch >= 65 (conversacional), LeIA |compound| >= 0.4 (impacto forte)
   - **Problem Agitation**: LeIA compound < -0.2 (dor visceral), Flesch >= 60 (falar, nao escrever)
   - **Mechanism Reveal**: LeIA compound entre 0.0 e 0.3 (esperanca), avg sentence <= 15 words
   - **Credibility**: LeIA compound > 0.1, Flesch >= 55
   - **Offer Stack**: Flesch >= 60 (clareza absoluta), LeIA compound > 0.2
   - **Urgency Close**: LeIA compound < -0.1 (medo de perder), Flesch >= 60
   - **CTA**: LeIA compound > 0.2 (positivo/acao), Flesch >= 65 (ultra-simples)
   - **Full script**: Flesch >= 60 (VSL eh falado, precisa ser conversacional)
   - **Reading time**: textstat.reading_time() deve bater com duration_target
   - Arco emocional: forte negativo → muito negativo → neutro-positivo → positivo → negativo (urgencia) → positivo (CTA)
13. **Self-Review** - Checklist pre-Torriani + resultados do pre-check
14. **Handoff** - Enviar para @oraculo-torriani

---

## Acceptance Criteria

- [ ] Hook trava nos primeiros 30 segundos
- [ ] Dor amplificada em cena viva
- [ ] Mecanismo unico nomeado e explicado
- [ ] Transicoes suaves entre segmentos
- [ ] Offer stack com valor > 10x preco
- [ ] Garantia presente e forte
- [ ] CTA unico e claro
- [ ] Notas de slide/visual incluidas
- [ ] Duracao dentro do target
- [ ] Zero cliches de coach
