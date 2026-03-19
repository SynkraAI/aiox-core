# create-stories-sequence

> Criar sequência de stories de venda com Copy Andromeda e os 7 gatilhos de conversão — sequência de 8-15 stories que conduz o espectador da atenção à ação

---

## Task Definition

```yaml
task_name: "create-stories-sequence"
status: active
responsible_executor: natanael-oliveira
execution_type: agent
squad: presenca-digital
version: 1.0.0
```

---

## Input

- Brand Voice Guidelines
- Produto ou oferta a ser promovida
- Público-alvo da sequência
- Gatilho prioritário (ou deixar para o agente selecionar)
- Duração do ciclo (1 dia único / sequência de dias)

## Output

- Sequência numerada de stories com texto, recursos visuais sugeridos e interações
- Gatilho(s) aplicados com posicionamento na sequência
- Link ou CTA do story final

## Action Items

1. Definir a oferta com clareza: o que é, para quem, qual transformação entrega, qual o preço/acesso
2. Selecionar os gatilhos da sequência (recomendado: 2-3 dos 7)
3. Estruturar a sequência em 4 blocos narrativos:
   - **Bloco 1 — Gancho** (stories 1-2): interrompe o scroll, gera curiosidade
   - **Bloco 2 — Contexto e Dor** (stories 3-5): valida o problema, cria identificação
   - **Bloco 3 — Solução e Prova** (stories 6-10): apresenta a oferta, aplica gatilhos
   - **Bloco 4 — CTA e Urgência** (stories 11-15): direciona para a ação com clareza
4. Para cada story, definir:
   - Texto de tela (curto — máximo 30 palavras)
   - Narração em voz (script para gravação)
   - Elemento interativo (enquete, caixa de perguntas, link, contagem regressiva)
   - Recurso visual sugerido (selfie, tela do celular, slide, produto)
5. Revisar fluxo: cada story deve gerar curiosidade suficiente para ver o próximo
6. Validar alinhamento com Brand Voice Guidelines

## Acceptance Criteria

- [ ] 4 blocos narrativos presentes e identificados
- [ ] Mínimo 8 stories, máximo 15
- [ ] Cada story tem texto de tela, narração e recurso visual sugerido
- [ ] Mínimo 2 elementos interativos (enquete, link, caixa de perguntas)
- [ ] Pelo menos 2 gatilhos dos 7 aplicados em posições estratégicas
- [ ] CTA final com link ou instrução de ação clara
- [ ] Tom alinhado com Brand Voice Guidelines

## Veto Conditions

- Sequência começa diretamente com apresentação da oferta (sem gancho)
- CTA ausente ou vago ("acesse o link na bio" sem especificar o que é)
- Gatilho aplicado sem narrativa de suporte (escassez sem prova de demanda)
- Mais de 15 stories (fadiga do espectador)
- Texto de tela acima de 50 palavras por story

## Output Example

```
OFERTA: Curso de Gestão para Criadores — R$497
GATILHOS: Prova Social + Urgência

[Story 1 — GANCHO]
Tela: "Quanto você faturou nos últimos 30 dias?"
Narração: "Para antes. Abre a calculadora e calcula isso agora."
Interação: Enquete ("Farei isso agora" / "Depois")
Visual: Selfie com expressão de desafio

[Story 2 — GANCHO]
Tela: "Se o número te deixou desconfortável, esse stories é pra você."
Narração: "Não é julgamento. É diagnóstico."
Visual: Texto sobre fundo sólido

[Story 6 — SOLUÇÃO]
Tela: "Aqui está o que mudou para os 47 alunos da última turma:"
Narração: "Vou mostrar 3 resultados reais, com print."
Visual: Tela com prints de depoimentos

[Story 14 — CTA]
Tela: "Vagas encerram em 48 horas."
Narração: "Link direto abaixo. É só tocar."
Interação: Link para página de vendas
Visual: Contagem regressiva no sticker
```
