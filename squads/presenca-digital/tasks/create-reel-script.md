# create-reel-script

> Criar roteiro de reel ou short via Roteiro Chicote — 6 perguntas que estruturam vídeos de alta retenção

---

## Task Definition

```yaml
task_name: "create-reel-script"
status: active
responsible_executor: camilo-coutinho
execution_type: agent
squad: presenca-digital
version: 1.0.0
```

---

## Input

- `content-pillars.json` (output de content-strategy)
- Brand Voice Guidelines
- Tema ou pilar específico solicitado
- Duração-alvo (padrão: 30-60 segundos)
- Plataforma-alvo (Instagram Reels / YouTube Shorts / TikTok)

## Output

- Roteiro completo com marcações de tempo
- Indicações de corte, transição e texto na tela (on-screen text)
- Hook de abertura validado pela regra dos 3 segundos

## Action Items

1. Responder as **6 perguntas do Roteiro Chicote**:
   - Q1: Quem é o público e qual dor/desejo será ativado?
   - Q2: Qual é a promessa ou transformação do vídeo?
   - Q3: Qual hook abre o vídeo (primeiros 3 segundos)?
   - Q4: Qual é o conteúdo central (desenvolvimento em etapas)?
   - Q5: Qual prova ou exemplo concreto valida a mensagem?
   - Q6: Qual CTA encerra e provoca ação imediata?
2. Converter as respostas em roteiro linear com marcações de tempo
3. Indicar pausas para corte rápido (técnica de edição dinâmica)
4. Sugerir textos para colocar na tela (captions, palavras-chave em destaque)
5. Validar: o hook dos primeiros 3 segundos é específico e gera curiosidade?
6. Revisar alinhamento com Brand Voice Guidelines (tom, vocabulário)

## Acceptance Criteria

- [ ] 6 perguntas do Roteiro Chicote respondidas antes de escrever o roteiro
- [ ] Hook dos primeiros 3 segundos é específico, não genérico
- [ ] Duração do roteiro compatível com o tempo-alvo
- [ ] Marcações de tempo presentes em todo o roteiro
- [ ] Pelo menos 1 exemplo concreto ou dado no desenvolvimento
- [ ] CTA claro no encerramento (máximo 5 segundos)
- [ ] Tom alinhado com Brand Voice Guidelines

## Veto Conditions

- Hook genérico ou demorado demais para chegar ao ponto (acima de 5 segundos de introdução)
- Roteiro sem marcações de tempo
- Ausência de prova ou exemplo concreto
- CTA ausente ou vago ("curta e siga")
- Duração prevista acima de 90 segundos para reels/shorts

## Output Example

```
TEMA: "Como criar 1 semana de conteúdo em 2 horas"
DURAÇÃO: 45 segundos | PLATAFORMA: Instagram Reels

[0:00-0:03] HOOK
"Você gasta 10 horas por semana em conteúdo. Eu gasto 2. Aqui está o sistema."
[on-screen: "10h → 2h"]

[0:03-0:08] PROMESSA
"Vou mostrar o framework que uso com meus clientes para criar uma semana inteira de posts em uma sessão."
[corte rápido]

[0:08-0:30] DESENVOLVIMENTO
Passo 1 (0:08): "Segunda: grave 5 vídeos curtos. Um tema, cinco ângulos."
[on-screen: "GRAVAR 5 VÍDEOS"]
Passo 2 (0:15): "Terça: transcreva e vire posts de texto. 1 vídeo = 3 posts."
Passo 3 (0:22): "Quarta: recorte os melhores trechos para stories."
[corte rápido]

[0:30-0:38] PROVA
"Isso é o que eu faço toda segunda-feira. Resultado: 21 peças de conteúdo por semana."

[0:38-0:45] CTA
"Salva esse vídeo e testa essa semana. Depois me conta nos comentários."
[on-screen: "SALVA AGORA"]
```
