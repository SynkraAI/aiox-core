# Template: Sumarizador Inter-Rodada

<!-- Story 2.2 -- Template completo de sumarizacao entre rodadas -->
<!-- Executado pelo agente principal (Claude Code), NAO por sub-agente -->
<!-- Referencia: Architecture secao 5.3, Spec FR12 -->

## Purpose

Condensar os argumentos de uma rodada em um sumario equilibrado e neutro
que sera injetado na proxima rodada para todos os agentes. O sumario
simula a "exposicao a opinioes diversas" que aconteceria em uma conversa
real -- como se os agentes estivessem lendo um resumo do que o grupo
discutiu.

**Executado pelo agente principal** (Claude Code diretamente), nao por
sub-agente. Sumarizacao e tarefa sequencial simples que nao justifica
o custo de spawn.

## Input

- **round_data**: Conteudo do `round-N.yaml` da rodada que acabou de completar
- **round_number**: Numero da rodada sendo sumarizada (N)

## Instructions

Ao executar este template, o agente principal (Claude Code) deve seguir
EXATAMENTE os passos abaixo para produzir o sumario. O output e texto
markdown formatado, nao YAML.

### Passo 1: Filtrar respostas validas

Do `round-N.yaml`, considerar APENAS agentes com `status: success`.
Ignorar `error` e `timeout` -- eles nao participaram da discussao.

Calcular:
- `total_valid`: numero de agentes com status success
- `total_failed`: numero de agentes com status error ou timeout

### Passo 2: Calcular distribuicao de sentimento

Contar quantos agentes em cada posicao:

```
a_favor_count = count(responses where position == "a_favor" AND status == "success")
contra_count = count(responses where position == "contra" AND status == "success")
neutro_count = count(responses where position == "neutro" AND status == "success")
indeciso_count = count(responses where position == "indeciso" AND status == "success")

a_favor_pct = round(a_favor_count / total_valid * 100)
contra_pct = round(contra_count / total_valid * 100)
neutro_pct = round(neutro_count / total_valid * 100)
indeciso_pct = round(indeciso_count / total_valid * 100)
```

### Passo 3: Agrupar argumentos por posicao

Para cada posicao (a_favor, contra, neutro), coletar TODOS os `main_arguments`
dos agentes nessa posicao. Indeciso nao gera grupo proprio -- seus argumentos
sao redistribuidos entre a_favor e contra conforme o conteudo.

### Passo 4: Rankear por frequencia

Dentro de cada grupo (a_favor, contra, neutro):

1. Identificar argumentos semanticamente similares (nao exigir match exato)
2. Agrupar argumentos similares e contar quantos agentes usaram variacao do mesmo ponto
3. Ordenar por frequencia (mais citados primeiro)
4. Manter no maximo **5 argumentos por posicao** (os mais frequentes)
5. Para cada argumento, anotar quantos agentes o mencionaram

### Passo 5: Reescrever em linguagem acessivel

Os argumentos coletados vem de agentes com escolaridades e estilos diferentes.
O sumario deve ser escrito em linguagem ACESSIVEL e NEUTRA:

- **Acessivel**: Um agente com escolaridade fundamental deve entender o sumario.
  Nada de: "conjuntura macroeconomica", "polarizacao ideologica", "paradigma deliberativo".
  Sim: "a situacao da economia", "as pessoas discordam muito", "como a gente decide".
- **Neutra**: O sumario NAO favorece nenhum lado. Argumentos a_favor e contra recebem
  EXATAMENTE o mesmo tratamento, o mesmo espaco, o mesmo tom. Sem adjetivos valorativos
  ("forte argumento", "ponto questionavel"). Apenas "X pessoas pensam que..." e
  "Y pessoas pensam que...".
- **Concreta**: Preservar a essencia dos argumentos originais. Se alguem disse "ta caro
  pra caramba", o sumario pode dizer "muita gente reclamou que esta caro". Nao
  transformar em "preocupacoes com o custo de vida foram levantadas".

### Passo 6: Montar sumario formatado

O output final deve seguir EXATAMENTE este formato:

---

## Summary Output Format

```
O QUE O GRUPO PENSOU (Rodada {N}):

De {total_valid} pessoas que opinaram:
- {a_favor_pct}% sao A FAVOR ({a_favor_count} pessoas)
- {contra_pct}% sao CONTRA ({contra_count} pessoas)
- {neutro_pct}% ficaram no MEIO TERMO ({neutro_count} pessoas)
- {indeciso_pct}% nao se decidiram ({indeciso_count} pessoas)

---

ARGUMENTOS DE QUEM E A FAVOR:

1. {argumento mais citado a favor} ({X} pessoas falaram isso)
2. {segundo argumento} ({X} pessoas)
3. {terceiro argumento} ({X} pessoas)
4. {quarto argumento, se houver} ({X} pessoas)
5. {quinto argumento, se houver} ({X} pessoas)

---

ARGUMENTOS DE QUEM E CONTRA:

1. {argumento mais citado contra} ({X} pessoas falaram isso)
2. {segundo argumento} ({X} pessoas)
3. {terceiro argumento} ({X} pessoas)
4. {quarto argumento, se houver} ({X} pessoas)
5. {quinto argumento, se houver} ({X} pessoas)

---

ARGUMENTOS DE QUEM FICOU NO MEIO:

1. {argumento dos neutros} ({X} pessoas)
2. {segundo, se houver} ({X} pessoas)
{se nenhum neutro: "Ninguem ficou em cima do muro nessa rodada."}

---

Esses sao os argumentos que apareceram. Na proxima rodada, cada pessoa
vai poder pensar de novo depois de ouvir o que os outros falaram.
```

---

## Critical Rules

1. **NUNCA adicionar opiniao propria** -- o sumario e um espelho do que os agentes disseram
2. **NUNCA usar linguagem academica** -- o agente mais simples do painel precisa entender
3. **NUNCA favorecer um lado** -- mesmo numero de argumentos, mesmo tom, mesmo espaco
4. **SEMPRE preservar a essencia** -- simplificar a linguagem, nao o argumento
5. **SEMPRE incluir os numeros** -- quantas pessoas em cada posicao, quantas citaram cada argumento
6. **MAXIMO 5 argumentos por posicao** -- mais que isso vira ruido, nao informacao
7. **Se uma posicao tem 0 agentes** -- incluir mesmo assim: "Ninguem se posicionou [posicao] nessa rodada."

## Edge Cases

- **Todos na mesma posicao**: Sumario mostra 100% em uma posicao. Listar os 5 argumentos
  variados dentro dessa posicao. Manter secoes vazias para as outras.
- **Empate exato**: Se a_favor e contra tem exatamente a mesma porcentagem, listar a_favor
  primeiro (ordem alfabetica). Nao destacar o empate como algo especial.
- **Poucos agentes validos** (< 5): Sumario funciona igual, mas com numeros menores.
  Nao extrapolar -- "de 4 pessoas que opinaram" e valido.
- **Argumentos unicos** (frequencia = 1): Incluir se estiver no top 5. Mostrar como
  "(1 pessoa falou isso)".
