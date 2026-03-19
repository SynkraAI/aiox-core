# create-youtube-script

> Criar roteiro de vídeo longo para YouTube via metodologia CEQCOM (Contexto, Explicação, Qualificação, Conteúdo, Oferta, Motivação)

---

## Task Definition

```yaml
task_name: "create-youtube-script"
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
- Duração-alvo (padrão: 8-15 minutos)
- Objetivo do vídeo: educação, autoridade, venda, SEO

## Output

- Roteiro completo estruturado em 6 blocos CEQCOM com marcações de tempo
- Título principal + 2 variações para teste A/B
- Descrição do YouTube (primeiros 150 caracteres otimizados)
- Timestamps para a descrição

## Action Items

1. Definir palavra-chave principal e intenção de busca do vídeo
2. Escrever o roteiro seguindo os 6 blocos do CEQCOM:
   - **C — Contexto** (0:00-1:30): situar o espectador, validar a dor ou desejo
   - **E — Explicação** (1:30-3:00): apresentar o que será ensinado e por quê importa
   - **Q — Qualificação** (3:00-4:00): estabelecer autoridade com prova ou credencial
   - **C — Conteúdo** (4:00-10:00): desenvolvimento do tema em etapas numeradas
   - **O — Oferta** (10:00-11:30): CTA ou próximo passo (produto, newsletter, outro vídeo)
   - **M — Motivação** (11:30-12:00): encerramento motivacional que reforça a transformação
3. Escrever 3 opções de título (keyword-first + curiosidade)
4. Escrever descrição do YouTube com os primeiros 150 caracteres otimizados para CTR
5. Gerar timestamps no formato padrão do YouTube
6. Revisar: ritmo de leitura, momentos de corte e alinhamento com Brand Voice Guidelines

## Acceptance Criteria

- [ ] Todos os 6 blocos CEQCOM presentes e identificados no roteiro
- [ ] Bloco Contexto valida a dor/desejo nos primeiros 90 segundos
- [ ] Bloco Qualificação tem prova concreta (dado, caso, credencial)
- [ ] Bloco Conteúdo tem mínimo 3 etapas numeradas e claras
- [ ] 3 opções de título geradas
- [ ] Descrição do YouTube escrita com foco nos primeiros 150 caracteres
- [ ] Timestamps gerados e coerentes com o roteiro
- [ ] Tom alinhado com Brand Voice Guidelines

## Veto Conditions

- Roteiro sem a estrutura CEQCOM identificada explicitamente
- Bloco Qualificação com afirmação vaga sem prova ("sou especialista em...")
- Bloco Oferta ausente ou excessivamente invasivo (mais de 90 segundos)
- Título sem palavra-chave principal nos primeiros 40 caracteres
- Duração prevista abaixo de 6 minutos (perda de SEO e valor percebido)

## Output Example

```
TEMA: "Como construir uma audiência do zero em 90 dias"
DURAÇÃO: 12 minutos | OBJETIVO: Autoridade + Captação de leads

TÍTULOS (A/B/C):
A: "Audiência do Zero: O Método que Usei para Chegar a 10k em 90 Dias"
B: "Como Construir Audiência Rápido (Sem Pagar Ads)"
C: "90 Dias de Audiência: O Framework Completo"

[0:00-1:30] CONTEXTO
"Se você está publicando há meses e a audiência não cresce, não é falta de talento. É falta de sistema. Hoje eu vou te mostrar exatamente o que mudou quando parei de criar conteúdo aleatório..."

[1:30-3:00] EXPLICAÇÃO
"Nesse vídeo você vai aprender os 3 pilares do crescimento orgânico consistente: posicionamento, cadência e conversão. Sem um desses três, os outros dois não funcionam."

[3:00-4:00] QUALIFICAÇÃO
"Eu apliquei esse método com 47 criadores nos últimos 2 anos. A média de crescimento foi de 312% nos primeiros 90 dias. Vou mostrar os dados."

[4:00-10:00] CONTEÚDO
Pilar 1 — Posicionamento (4:00): ...
Pilar 2 — Cadência (6:30): ...
Pilar 3 — Conversão (8:30): ...

[10:00-11:30] OFERTA
"Se você quer implementar isso com acompanhamento, tenho uma mentoria aberta..."

[11:30-12:00] MOTIVAÇÃO
"Audiência não é sorte. É consequência. Começa essa semana."

TIMESTAMPS:
0:00 Introdução
1:30 O que você vai aprender
3:00 Minha prova
4:00 Pilar 1: Posicionamento
6:30 Pilar 2: Cadência
8:30 Pilar 3: Conversão
10:00 Próximo passo
```
