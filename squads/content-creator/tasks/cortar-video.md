# Task: Cortar Vídeo

Workflow guiado para transformar vídeo longo em clips curtos.

---

## Pré-requisitos

- [ ] Vídeo original (link ou arquivo)
- [ ] Transcrição (se disponível)
- [ ] Definido: quantidade de cortes desejados
- [ ] Definido: duração de cada corte (30s, 60s, 90s)
- [ ] Definido: plataforma destino (Shorts, Reels, TikTok)

---

## Passo a Passo

### 1. Coletar Informações

```
Responda:
1. Qual o link do vídeo?
2. Quantos cortes você quer?
3. Duração de cada corte? (30s, 60s, 90s)
4. Plataforma destino? (YouTube Shorts, Instagram Reels, TikTok)
5. Qual o tema principal do vídeo?
```

### 2. Obter Transcrição

```
SE vídeo é do YouTube:
   → Usar ferramenta de transcrição automática

SE vídeo é arquivo local:
   → Usar ferramenta de transcrição OU
   → Pedir pro usuário fornecer

SE não tem transcrição:
   → Pedir pro usuário descrever os principais momentos
```

### 3. Analisar Conteúdo

Com a transcrição em mãos:

```
1. Ler transcrição completa
2. Marcar momentos de alto valor:
   - Insights surpreendentes
   - Histórias pessoais
   - Dicas práticas
   - Frases de impacto
   - Momentos engraçados
   - Opiniões fortes
3. Listar timestamps dos momentos marcados
```

### 4. Selecionar Cortes

```
1. Ordenar momentos por potencial de engajamento
2. Selecionar os X melhores (conforme pedido)
3. Verificar se cada um:
   - Tem hook natural nos primeiros 3s
   - Faz sentido sozinho (sem contexto)
   - Tem conclusão clara
   - Não corta no meio de frase
```

### 5. Estruturar Cada Corte

Para cada corte selecionado:

```markdown
## Corte #[N]: [Título descritivo]

**Timestamp:** [HH:MM:SS - HH:MM:SS]
**Duração:** [Xs]
**Tema:** [tema principal]

**Hook (0-3s):**
"[Frase de abertura - transcrição exata]"

**Desenvolvimento:**
[Resumo do que acontece no meio]

**CTA sugerido:**
"[Sugestão de call to action]"

**Texto na tela:**
- [Texto 1 com timestamp]
- [Texto 2 com timestamp]

**Legenda sugerida:**
[Legenda pronta com hashtags]

**Potencial:** Alto / Médio / Baixo
**Por que esse corte:** [Justificativa breve]
```

### 6. Entregar

```
1. Lista completa de cortes
2. Ordenados por potencial (melhor primeiro)
3. Prontos pra equipe de edição executar
```

---

## Checklist Final

- [ ] Todos os cortes têm hook nos primeiros 3s?
- [ ] Todos fazem sentido sem contexto?
- [ ] Todos têm CTA no final?
- [ ] Timestamps estão precisos?
- [ ] Quantidade pedida foi entregue?
- [ ] Duração está dentro do limite?

---

## Exemplo de Output

```markdown
# Cortes do Vídeo: [Nome]

**Vídeo original:** [link]
**Duração total:** [X min]
**Cortes gerados:** [N]

---

## Corte #1: O erro que quebrou meu negócio

**Timestamp:** 00:15:30 - 00:16:28
**Duração:** 58s
**Tema:** Erro de precificação

**Hook (0-3s):**
"Esse erro me custou R$50 mil em 3 meses."

**Desenvolvimento:**
- Conta história do erro de precificação
- Explica o que aprendeu
- Dá dica prática

**CTA sugerido:**
"Comenta aqui se você já cometeu esse erro"

**Texto na tela:**
- 0-3s: "O erro de R$50 mil"
- 15s: "Lição aprendida:"
- 50s: "Comenta aí!"

**Legenda:**
Esse erro me custou R$50 mil. Não cometa o mesmo.

3 anos atrás eu precifiquei errado e quase quebrei. Hoje vou te contar o que aprendi.

Já passou por isso? Comenta aqui 👇

#empreendedorismo #negocios #erros #aprendizado

**Potencial:** Alto
**Por que:** História pessoal + número específico + lição clara

---

[... mais cortes ...]
```

---

---

## Metadados da Task

| Campo | Valor |
|-------|-------|
| **Nome** | cortar-video |
| **Agente** | Video Editor |
| **Checklist** | qualidade-corte.md |
| **Tempo estimado** | 30-60 min |

### Input Obrigatorio
- Link do video OU transcricao
- Quantidade de cortes
- Duracao de cada corte
- Plataforma destino
- Tema principal

### Output Esperado
- Lista de cortes com timestamps
- Hook, desenvolvimento, CTA de cada
- Sugestoes de texto na tela
- Legendas com hashtags
- Score de potencial por corte

---

*Task: Cortar Video - Squad Content Creator*
