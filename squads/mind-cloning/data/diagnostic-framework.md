# Diagnostic Framework

Framework para diagnosticar por que um clone esta fraco e como corrigi-lo. Use quando smoke-test falha ou quando usuario relata insatisfacao.

---

## 6 Perguntas Diagnosticas

Faca estas perguntas em sequencia ao analisar um clone com problemas:

| # | Pergunta | O que Revela |
|---|----------|--------------|
| 1 | O clone responderia algo que o especialista NUNCA diria? | Contaminacao de voz / falha no immune system |
| 2 | Tem as 3 coisas: Playbook, Framework, Swipe File? | Incompletude da Trindade (AN003) |
| 3 | As fontes sao ouro ou bronze? | Qualidade do input (AN002) |
| 4 | Quanto % do tempo foi gasto em curadoria vs prompt? | Inversao da regra 40/20/40 (AN001) |
| 5 | Testou com 5-10 pessoas sem dizer que e IA? | Falta de validacao real (AN005) |
| 6 | Tentou hackear o clone? Ele mantem personagem sob pressao? | Fragilidade do immune system |

---

## Red Flags

Sinais de que o clone precisa de rework:

| Red Flag | Causa Provavel | Gravidade |
|----------|----------------|-----------|
| Clone responde generico, sem personalidade | Falta Framework (so tem Playbook) | ALTA |
| Clone nao sabe lidar com objecoes | Immune system vazio, sem objection handling | ALTA |
| Clone contradiz posicoes do expert | Fontes bronze contaminaram | ALTA |
| Clone e consistente DEMAIS (sem nuances) | Paradoxos (Layer 8) nao mapeados | MEDIA |
| Clone soa artificial/robotico | Voice DNA insuficiente (Layers 1-2) | MEDIA |
| Clone acerta dominio mas erra tom | Thinking OK, Voice fraco | MEDIA |
| Clone perde personagem sob pressao | Immune system fragil | ALTA |
| Pessoas identificam como IA em segundos | Multiple layers missing | CRITICA |

---

## Green Flags

Sinais de clone saudavel:

| Green Flag | O que Indica |
|------------|--------------|
| Curadoria rigorosa (separou ouro de bronze) | AN002 aplicado corretamente |
| Trindade completa (Playbook + Framework + Swipe) | AN003 satisfeito |
| Pessoas demoram para perceber que e IA | AN005 validado |
| Comporta-se diferente por contexto (estagios) | AN004 implementado |
| Mantem personagem sob pressao | Immune system robusto |
| Tem contradicoes naturais (paradoxos preservados) | Layer 8 mapeada |

---

## Tabela de Erros Comuns + Correcoes

| Erro | Correcao | Esforco |
|------|----------|---------|
| Joguei TUDO que tinha no clone | Refazer curadoria: separar ouro de bronze, descartar bronze | Medio (2-4h) |
| Gastei 80% do tempo no prompt | Inverter: curar fontes primeiro, simplificar prompt | Medio (2-4h) |
| Clone so tem Playbook | Extrair Frameworks (SE/ENTAO) e Swipe File (exemplos reais) | Alto (4-8h) |
| Fontes sao majoritariamente bronze | Buscar fontes ouro: entrevistas, comentarios, cases reais | Alto (4-8h) |
| Clone e prompt gigante sem estagios | Quebrar em 3-5 estagios com triggers claros | Medio (2-4h) |
| Nao testou com humanos | Rodar teste cego com 5-10 pessoas + smoke test formal | Baixo (1-2h) |
| Clone perde personagem com provocacao | Fortalecer immune_system e automatic_rejections | Baixo (1-2h) |
| Clone generico sem "DNA" do expert | Re-extraction focada em Layers 5-8 (Deep Identity) | Alto (4-8h) |

---

## Templates de Objection Handling

### "Nao tenho muito conteudo da pessoa"

> Voce nao precisa de MUITO. Precisa do CERTO.
>
> Uma entrevista longa onde a pessoa pensa em voz alta vale mais que 50 palestras decoradas.
>
> Foca em: respostas em comentarios (ouro puro), entrevistas com perguntas dificeis, stories respondendo perguntas, analise de cases reais.
>
> Com isso da para fazer clone 85%+ de fidelidade.

### "Gastei muito tempo no prompt e ficou ruim"

> Erro classico. Regra: 40% curadoria, 20% prompt, 40% refinamento.
>
> Se inverteu, o problema nao e o prompt - e o input. Refaz a curadoria: classifica tudo em ouro vs bronze, descarta bronze, extrai a Trindade so do ouro.

### "Clone fica generico, nao parece a pessoa"

> Falta Framework. Playbook sozinho da teoria: "faca X, Y, Z". Framework da decisao: "SE situacao A, ENTAO faca X."
>
> A diferenca entre clone generico e clone que pensa igual a pessoa e o Framework. Extrai: "Quando voce ve X, o que faz primeiro?", "Como decide entre A e B?", "O que NUNCA faria?"

---

## Workflow de Diagnostico

```
1. Rodar as 6 perguntas diagnosticas
2. Identificar red flags
3. Consultar tabela de erros comuns
4. Gerar plano de correcao com:
   - Causa raiz identificada
   - Acao corretiva especifica
   - Esforco estimado (Baixo/Medio/Alto)
   - Heuristica(s) violada(s) (AN001-AN005)
5. Re-executar fase(s) afetada(s) do pipeline
6. Rodar smoke-test novamente
```

---

*Diagnostic Framework for Mind Clones*
*Use com: smoke-test Step 5.5 (on failure)*
