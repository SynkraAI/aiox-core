# Expertise Profile

> Baseado na Periodic Table of Expertises (Collins & Evans, 2007)
> e no Five-Stage Model of Skill Acquisition (Dreyfus & Dreyfus, 1980)
>
> Analista: @collins | Data: {YYYY-MM-DD} | Versao: {X.X.X}

---

## 1. Overview

**Sujeito:** {Nome Completo}
**Contexto:** {Descricao do contexto profissional principal}
**Input:** Knowledge Classification Map v{X} (de @polanyi)

### Sumario Executivo

{Paragrafo resumindo o perfil de expertise do sujeito. Exemplo:

"O sujeito apresenta Contributory Expertise em 4 de 7 sub-dominios avaliados,
com destaque para [area] onde a densidade de Collective Tacit Knowledge e
excepcionalmente alta. A distincao entre areas Interactional e Contributory
e nitida: o sujeito FALA sobre [area A] com profundidade mas FAZ [area B]
com maestria. O principal risco de knowledge loss esta em [area], onde
o conhecimento tacito e predominantemente somatico e coletivo."}

### Numeros-Chave

| Metrica | Valor |
|---------|-------|
| Sub-dominios avaliados | {N} |
| Contributory Expertise | {N} areas |
| Interactional Expertise | {N} areas |
| Itens de Tacit Knowledge | {N} (R:{N} S:{N} C:{N}) |
| Knowledge Risk: P1 (critico) | {N} areas |
| Imitation Game: passaria | {N} de {N} areas |

---

## 2. Expertise Map

### Posicao na Periodic Table of Expertises

Mapeamento do sujeito nos niveis da tabela periodica de Collins & Evans.

```
PERIODIC TABLE SCAN: {Nome do Sujeito}
================================================================

UBIQUITOUS EXPERTISES
  Language          [██████████] Nativo
  Social Skills     [████████░░] {Nivel}
  Physical Skills   [██████████] Padrao
  Classification    [██████████] Padrao

SPECIALIST EXPERTISES
                    Beer-mat  Popular  Primary  Interact.  Contrib.
                    --------  -------  -------  ---------  --------
  {Sub-dominio 1}                                            [██]
  {Sub-dominio 2}                                            [██]
  {Sub-dominio 3}                                  [██]
  {Sub-dominio 4}                                            [██]
  {Sub-dominio 5}                        [██]
  {Sub-dominio 6}                                  [██]
  {Sub-dominio 7}                                            [██]

META-EXPERTISES
  Ubiq. Discrimination   [████████░░] {Julga por credenciais}
  Local Discrimination   [██████████] {Julga por proximidade}
  Tech. Connoisseurship  [████████░░] {Julga qualidade tecnica}
  Downward Discrimination[██████░░░░] {Julga areas adjacentes}
  Referred Expertise     [████████░░] {Usa expertise alheia}
================================================================
```

### Tabela Detalhada por Sub-dominio

| Sub-dominio | Collins Level | Dreyfus Stage | Tipo (I/C) | Confianca | Anos |
|-------------|---------------|---------------|------------|-----------|------|
| {ex. Analise Financeira} | Contributory (5) | Expert | C | Alta | {15} |
| {ex. Estrategia de Negocios} | Contributory (5) | Proficient | C | Alta | {12} |
| {ex. Coaching Emocional} | Interactional (4) | Competent | I | Media | {5} |
| {ex. Diagnostico de Problemas} | Contributory (5) | Expert | C | Alta | {18} |
| {ex. Facilitacao de Grupo} | Interactional (4) | Competent | I | Media | {7} |
| {ex. Networking / Conexoes} | Primary Source (3) | Adv. Beginner | - | Media | {3} |
| {ex. Dev. de Pessoas} | Contributory (5) | Expert | C | Alta | {15} |

### Crosswalk: Collins x Dreyfus

<!-- Esta tabela mostra a relacao entre os dois modelos.
     Nem sempre sao alinhados: e possivel ter Contributory Expertise
     no nivel Competent (pratica mas ainda planeja conscientemente)
     ou Interactional no nivel Proficient (fala muito bem, ve o todo,
     mas nao pratica). -->

| Sub-dominio | Collins | Dreyfus | Alinhamento | Nota |
|-------------|---------|---------|-------------|------|
| {Analise Financeira} | Contributory | Expert | Alinhado | Pratica + intuicao |
| {Coaching Emocional} | Interactional | Competent | Alinhado | Fala bem, planeja consciente |
| {Networking} | Primary Source | Adv. Beginner | Alinhado | Leu fontes, reconhece situacoes |
| {Sub-dominio X} | {Collins} | {Dreyfus} | {Alinhado/Desalinhado} | {Explicacao} |

---

## 3. Tacit Knowledge Areas

### Taxonomia R/S/C (Collins)

Classificacao do conhecimento tacito identificado usando a taxonomia de Collins:
**R**elational, **S**omatic, **C**ollective.

#### Relational Tacit Knowledge (RTK)

> Conhecimento que PODERIA ser explicito mas nao foi documentado.
> Transferibilidade: ALTA -- pode ser tornado explicito com esforco.

| ID | Descricao | Sub-dominio | Transferibilidade | Fonte |
|----|-----------|-------------|-------------------|-------|
| RTK-001 | {ex. Processo de onboarding de mentorados -- sequencia e criterios que nunca documentou} | {Mentoria} | Alta | {transcription:X} |
| RTK-002 | {ex. Criterios de selecao de clientes -- regras implicitas que aplica mas nao escreveu} | {Networking} | Alta | {transcription:X} |
| RTK-003 | {ex. Checklist mental de analise financeira -- passos que segue automaticamente} | {Financas} | Alta | {cdm:X} |
| RTK-{N} | {...} | {...} | {...} | {...} |

**Acao recomendada:** Documentacao dirigida. Sentar com o sujeito e escrever juntos.
Metodo: Entrevista estruturada com @klein ou sessao com @kelly focada em procedimentos.

#### Somatic Tacit Knowledge (STK)

> Conhecimento que reside no corpo -- timing, sensibilidade, calibracao.
> Transferibilidade: MEDIA -- requer observacao, imitacao e pratica.

| ID | Descricao | Sub-dominio | Transferibilidade | Fonte |
|----|-----------|-------------|-------------------|-------|
| STK-001 | {ex. Leitura de microexpressoes em sessao de mentoria -- detecta desconforto antes da palavra} | {Coaching} | Media | {observation:X} |
| STK-002 | {ex. Timing de intervencao -- sabe o momento exato de falar em uma sessao} | {Dev. Pessoas} | Media | {transcription:X} |
| STK-003 | {ex. Calibracao de tom emocional -- ajusta intensidade conforme a reacao do outro} | {Coaching} | Baixa | {inference} |
| STK-{N} | {...} | {...} | {...} | {...} |

**Acao recomendada:** Observacao e co-pratica. Entrevista sozinha NAO captura STK.
Metodo: Video de sessoes reais + analise com @leonard. Shadowing quando possivel.

#### Collective Tacit Knowledge (CTK)

> Conhecimento que so existe dentro da comunidade de praticantes.
> Transferibilidade: BAIXA -- requer imersao prolongada na comunidade.

| ID | Descricao | Sub-dominio | Transferibilidade | Fonte |
|----|-----------|-------------|-------------------|-------|
| CTK-001 | {ex. O que conta como "boa mentoria" neste mercado -- criterios implicitos da comunidade} | {Dev. Pessoas} | Baixa | {community:X} |
| CTK-002 | {ex. Padrao de qualidade em analise financeira -- o que e "aceitavel" vs "excelente"} | {Financas} | Baixa | {practice:X} |
| CTK-003 | {ex. Regras nao escritas de como se negocia neste setor} | {Estrategia} | Baixa | {experience:X} |
| CTK-{N} | {...} | {...} | {...} | {...} |

**Acao recomendada:** Imersao prolongada na comunidade do sujeito. Nao ha atalho.
Metodo: Participacao em eventos, mentorias observadas, conversas informais com pares.

### Mapa Visual: Distribuicao de Tacit Knowledge

```
           RTK (Relational)         STK (Somatic)          CTK (Collective)
           Documentavel             No corpo               Na comunidade
           ──────────────           ──────────────          ──────────────
Financas   [████████░░]  Alta       [██░░░░░░░░]  Baixa    [████████░░]  Alta
Estrategia [██████░░░░]  Media      [░░░░░░░░░░]  --       [████████░░]  Alta
Coaching   [████░░░░░░]  Media      [████████░░]  Alta     [████░░░░░░]  Media
Diagnost.  [██████░░░░]  Media      [██░░░░░░░░]  Baixa    [██████████]  Muito Alta
Dev. Pess. [████░░░░░░]  Media      [██████░░░░]  Media    [████████░░]  Alta
Facilit.   [████████░░]  Alta       [████░░░░░░]  Media    [████████░░]  Alta
Networking [████████░░]  Alta       [░░░░░░░░░░]  --       [██░░░░░░░░]  Baixa
```

---

## 4. Key Pattern Recognition

<!-- Padroes que o sujeito reconhece automaticamente (Dreyfus: expert).
     Identificados via CDM (Klein) -- sao a essencia do expertise tacito.
     Estes padroes sao o que diferencia o expert do competent:
     o expert VE o que o competent precisa ANALISAR. -->

### Padroes Identificados

| ID | Padrao | Sub-dominio | Tempo de Reconhecimento | Evidencia |
|----|--------|-------------|------------------------|-----------|
| PR-001 | {ex. "Sintoma vs Causa Raiz" -- identifica em < 30s se o problema apresentado e raiz ou sintoma} | {Diagnostico} | {< 30 segundos} | {cdm:klein-incident-005} |
| PR-002 | {ex. "Empresa em crescimento desordenado" -- reconhece sinais de scaling sem estrutura} | {Estrategia} | {< 5 minutos} | {transcription:mentoria-X} |
| PR-003 | {ex. "Mentorado resistente" -- detecta padrao de resistencia a mudanca antes do mentorado perceber} | {Coaching} | {< 2 minutos} | {observation:X} |
| PR-004 | {ex. "Numero que nao fecha" -- sente inconsistencia em planilha antes de localizar o erro} | {Financas} | {< 1 minuto} | {cdm:X} |
| PR-{N} | {...} | {...} | {...} | {...} |

### Cues de Reconhecimento (o que o expert "ve")

<!-- Para cada padrao, quais sao os sinais que disparam o reconhecimento?
     Estes cues sao frequentemente invisiveis para o sujeito. -->

**{PR-001}: Sintoma vs Causa Raiz**
- Cues: {ex. "Quando o mentorado descreve o problema usando muitos qualificadores ('talvez', 'pode ser', 'nao sei bem'), geralmente e sintoma. Quando descreve com precisao e emocao, geralmente e causa raiz."}
- Fonte: {cdm:klein-incident-005}
- Articulabilidade: {Parcial -- o sujeito sabe que faz mas nao identifica todos os cues}

**{PR-002}: {Nome do padrao}**
- Cues: {...}
- Fonte: {...}
- Articulabilidade: {...}

---

## 5. Experience Repertoire

<!-- O repertorio de experiencias que sustenta a expertise.
     Mapeado por @leonard (Deep Smarts) -- sao as experiencias
     criticas que moldaram os padroes de reconhecimento do sujeito. -->

### Experiencias Formativas (Top 10)

| # | Experiencia | Impacto no Repertorio | Sub-dominio | Quando |
|---|-------------|----------------------|-------------|--------|
| 1 | {ex. "Primeiro negocio que quebrou sob minha mentoria"} | {ex. "Aprendi a distinguir otimismo de ilusao. Nunca mais ignorei sinais financeiros por empatia."} | {Diagnostico + Financas} | {~2010} |
| 2 | {ex. "Mentorado que superou minhas expectativas"} | {ex. "Descobri que meu papel e catalizar, nao dirigir. Mudou meu estilo de mentoria."} | {Dev. Pessoas} | {~2015} |
| 3 | {ex. "Conflito severo em grupo de mentoria"} | {ex. "Aprendi a ler tensoes antes que explodam. Desenvolvi antenas para dinamica de grupo."} | {Facilitacao} | {~2018} |
| {N} | {...} | {...} | {...} | {...} |

### Deep Smarts Assessment (Leonard)

| Caracteristica | Nivel | Evidencia |
|---------------|-------|-----------|
| Conhecimento profundo do dominio | {Alto/Medio/Baixo} | {ex. "15+ anos de pratica ativa com portfolio diversificado"} |
| Reconhecimento de padroes | {Alto/Medio/Baixo} | {ex. "Identifica padroes em < 30s -- confirmado em 8 incidentes criticos"} |
| Perspectiva sistemica | {Alto/Medio/Baixo} | {ex. "Ve interdependencias entre financas, pessoas e estrategia"} |
| Consciencia de contexto | {Alto/Medio/Baixo} | {ex. "Adapta abordagem conforme o setor do mentorado"} |
| Acuidade diagnostica | {Alto/Medio/Baixo} | {ex. "Diagnostica com precisao acima de 85% dos casos"} |
| Networking habilidoso | {Alto/Medio/Baixo} | {ex. "Sabe quem sabe o que -- conecta pessoas com precisao"} |

---

## 6. Learning Trajectory

<!-- Trajetoria de aprendizagem do sujeito -- como chegou ao nivel atual
     e para onde esta indo. Baseado em Dreyfus progression analysis. -->

### Progressao por Sub-dominio

```
TIMELINE DE EXPERTISE: {Nome do Sujeito}
================================================================

                    2005    2010    2015    2020    2025
                    ----    ----    ----    ----    ----
Analise Financeira  [N]──── [C]──── [Pr]─── [E]════ [E]
Estrategia          [N]──── [AB]─── [C]──── [Pr]─── [Pr]
Diagnostico         [AB]─── [C]──── [Pr]─── [E]════ [E]
Dev. Pessoas        [N]──── [AB]─── [C]──── [Pr]─── [E]
Coaching            ........[N]──── [AB]─── [C]════ [C]
Facilitacao         ........[N]──── [AB]─── [C]════ [C]
Networking          ................[N]──── [AB]═══ [AB]

N=Novice  AB=Adv.Beginner  C=Competent  Pr=Proficient  E=Expert
──── = progressao ativa    ════ = plateau (estavel)
.... = nao praticava ainda
================================================================
```

### Padroes de Progressao Observados

- **Velocidade de aprendizagem:** {ex. "Progride rapido de Novice a Competent (2-3 anos), mas leva 5+ anos para chegar a Expert. Padrao tipico de aprendizagem experiencial."}
- **Catalysadores de salto:** {ex. "Saltos de nivel coincidem com experiencias criticas (crise, fracasso, mentor novo). Nunca por curso ou leitura."}
- **Plateaus:** {ex. "Coaching e Facilitacao estagnaram em Competent ha 3+ anos. Possivel barreira: falta de pratica supervisionada ou evitacao inconsciente."}
- **Gaps entre domínios:** {ex. "Networking e outlier -- significativamente abaixo dos outros dominios. Possivel ponto cego ou area de baixo interesse."}

### Recomendacoes de Desenvolvimento

| Sub-dominio | De | Para | Metodo Recomendado | Prazo |
|-------------|-----|------|-------------------|-------|
| {Coaching} | Competent | Proficient | {ex. Pratica supervisionada + feedback de pares} | {6-12 meses} |
| {Networking} | Adv. Beginner | Competent | {ex. Projeto pratico com mentor de networking} | {3-6 meses} |
| {Facilitacao} | Competent | Proficient | {ex. Co-facilitacao com expert + video review} | {6-12 meses} |

---

## Apendice A: Imitation Game Assessment

<!-- Teste de Collins: O sujeito passaria como insider em uma conversa
     com practitioners de cada sub-dominio? -->

| Sub-dominio | Passaria? | Evidencia | Confianca |
|-------------|-----------|-----------|-----------|
| {Analise Financeira} | SIM -- como contribuidor | {ex. "Produz analises reconhecidas por pares"} | Alta |
| {Estrategia} | SIM -- como contribuidor | {ex. "Participa de decisoes estrategicas em nivel board"} | Alta |
| {Coaching} | SIM -- como conversador | {ex. "Fala a linguagem, entende nuances, mas nao pratica formalmente"} | Media |
| {Diagnostico} | SIM -- como contribuidor | {ex. "Outros practitioners buscam sua opiniao diagnostica"} | Alta |
| {Networking} | NAO -- seria detectado | {ex. "Vocabulario generico, nao conhece debates internos da area"} | Media |

## Apendice B: Knowledge Risk Assessment

<!-- Risco de perda de conhecimento se o sujeito ficar indisponivel. -->

| Sub-dominio | Risco | Tipo de Conhecimento em Risco | Prioridade de Extracao |
|-------------|-------|-------------------------------|----------------------|
| {Diagnostico} | ALTO | CTK unico -- ninguem mais faz assim | P1 -- extrair imediatamente |
| {Dev. Pessoas} | ALTO | STK + CTK -- timing + cultura | P1 -- observacao + co-pratica |
| {Coaching} | MEDIO | STK parcial -- calibracao emocional | P2 -- entrevista estruturada |
| {Financas} | MEDIO | RTK -- documentavel com esforco | P2 -- documentacao dirigida |
| {Networking} | BAIXO | RTK -- facilmente explicavel | P3 -- pode esperar |

---

*Expertise Profile gerado por @collins | Repertoire Mapper v1.0.0*
*Baseado em: Collins & Evans (2007), Dreyfus & Dreyfus (1980), Leonard (2005)*
