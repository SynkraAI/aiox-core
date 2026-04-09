# Atomizar Conteúdo Pilar

name: atomize-content
description: Extrair átomos de conteúdo de 1 peça pilar (vídeo, live, artigo, podcast) e gerar 10-30 briefs de micro-conteúdo para diferentes formatos
elicit: true

## INPUTS

- **Conteúdo pilar:** vídeo, live, artigo, podcast ou post longo (obrigatório)
- **Transcrição:** texto completo se o pilar for vídeo/áudio (obrigatório se vídeo/áudio)
- **Tema central:** assunto principal do conteúdo pilar (obrigatório)
- **Público:** avatar específico que consome o conteúdo (obrigatório)
- **Formatos desejados:** carrossel, reels, stories, post único, frase de impacto, email (opcional — default: todos)
- **Quantidade alvo:** número de micro-peças desejadas (opcional — default: 15-20)
- **Intenção dominante:** atração, consciência, aquecimento, venda (opcional — distribui automaticamente)
- **Fonte original:** URL YouTube, live, podcast, artigo (opcional — para rastreabilidade)
- **source_type:** tipo controlado da fonte — enum: `video | live | podcast | article` (obrigatório para gate da Etapa 2B)
  - Use `source_type` para lógica condicional, não o campo `platform` (que é rótulo livre, ex.: "YouTube Live", "Spotify")

## STEPS

### Etapa 1: Análise do Pilar
1. Ler/analisar o conteúdo pilar completo
2. Identificar o tema central e subtemas abordados
3. Mapear a estrutura do conteúdo (introdução, desenvolvimento, conclusão)
4. Avaliar se o pilar tem substância suficiente (mínimo 3 insights acionáveis)
5. Se não tem substância → VETO, explicar e pedir conteúdo mais robusto

### Etapa 2: Extração de Átomos
6. Extrair **insights acionáveis** — ideias que o público pode aplicar imediatamente
7. Extrair **quotes de impacto** — frases memoráveis, provocativas ou contraintuitivas. EXTRAIR TODAS — não limitar a 5. Um vídeo de 1h tem 15-25 frases quotable.
8. Extrair **dados e provas** — estatísticas, resultados, cases mencionados
9. Extrair **histórias** — narrativas, exemplos, analogias usadas
10. Extrair **provocações** — crenças quebradas, mitos derrubados, verdades incômodas
11. Extrair **frameworks** — modelos, passos, processos explicados
12. Classificar cada átomo: [insight | quote | dado | história | provocação | framework]
13. **Registrar cada átomo no `atom_registry`** — obrigatório antes de avançar para Etapa 2B:
    ```yaml
    atom_registry:
      # Padrão de ID: atom_{NN} (ex: atom_01, atom_07, atom_23)
      # Gerado sequencialmente na ordem de extração.
      # Este ID é referenciado em briefs, cortes e resumos — não inventar outros padrões.
      items:
        - atom_id: "atom_01"
          atom_type: "insight"          # insight | quote | dado | história | provocação | framework
          source_excerpt: "..."         # trecho exato do pilar onde o átomo foi extraído
          source_position: "00:03:15"   # timestamp HH:MM:SS (vídeo) ou parágrafo (texto)
        - atom_id: "atom_02"
          atom_type: "quote"
          source_excerpt: "..."
          source_position: "00:07:42"
    ```
    - IDs são estáveis: uma vez gerado `atom_07`, esse ID não muda nem é reutilizado
    - Cortes de vídeo (Etapa 2B) DEVEM referenciar `atom_id` deste registry

### Etapa 2B: Extração de Cortes de Vídeo (se `source_type` for `video`, `live` ou `podcast`)
13. Mapear **timestamps de cortes** — trechos do vídeo que funcionam ISOLADOS como conteúdo
14. Para cada corte, registrar e salvar em `cortes-video.yaml`:
    ```yaml
    cortes_video_mapeados:
      output_file: "cortes-video.yaml"
      items:
        - cut_id: "cut_001"
          atom_id: "atom_07"         # vínculo com átomo correspondente
          source_url: "https://..."
          timestamp_inicio: "00:12:14"  # formato HH:MM:SS
          timestamp_fim: "00:12:49"
          duracao_s: 35
          tema: "Posicionamento como arma de conversão"
          rationale: "Hook forte + payoff completo"
          transcript_excerpt: "..."    # trecho textual do corte (evidência)
          next_step: "curate-data"   # PRÉ-CURADORIA — nunca format-cut ou ffmpeg-cutter diretamente
    ```
15. Objetivo: 10-15 cortes por hora de vídeo
16. Cortes são complementares aos roteiros de Reels — Reels são criados do zero, cortes são trechos originais
17. O arquivo `cortes-video.yaml` é um **mapa de candidatos pré-curadoria** — o curator precisa processar antes que `format-cut` ou `ffmpeg-cutter` sejam acionados

    **Fronteira de handoff de cortes de vídeo:**
    `cortes-video.yaml` NÃO deve ir direto para `format-cut` ou `ffmpeg-cutter`.
    Fluxo obrigatório downstream:
    1. Curator ingere os candidatos (`squads/curator/tasks/curate-data.md`) e seleciona/normaliza os momentos.
    2. Curator gera `narrative_structure.yaml` ou artefato intermediário validado.
    3. `format-cut` (`squads/curator/tasks/format-cut.md`) converte em cut YAML validado pelo QG-004.
    4. `ffmpeg-cutter` executa apenas o cut YAML validado.

### Etapa 2C: Resumo Pré-Criação
18. Para CADA átomo extraído, gerar resumo pré-criação:
    - 2-3 opções de título
    - Preview dos primeiros 2-3 slides (carrossel) ou primeiros 3-6 segundos (reels)
    - Ângulo de abordagem em 1 linha
19. Este resumo é OBRIGATÓRIO e será apresentado ao usuário ANTES de criar qualquer peça
20. Apresentar lista completa ao usuário: "1. Confirmar, 2. Ajustar, 3. Adicionar mais"

### Etapa 3: Mapeamento Átomo → Formato
21. Para cada átomo, definir o formato mais adequado aplicando as regras de alocação abaixo:

    **Mapeamento por tipo:**
    - **Insight acionável** → Carrossel (estrutura passo a passo) ou Reels (explicação rápida)
    - **Quote de impacto** → Frase de impacto (quote card feed + stories) ou Post único
    - **Dado/prova** → Carrossel (antes/depois, comparação) ou Reels (revelação)
    - **História** → Reels (narrativa curta) ou Carrossel (arco narrativo) ou Email (narrativa longa)
    - **Provocação** → Post único (afirmação chocante) ou Reels (hot take) ou Frase de impacto
    - **Framework** → Carrossel (passo a passo visual) ou Reels (tutorial rápido)
    - **Insight profundo** → Email (handoff Squad Copywriters — gerar brief, não criar email)

    **Regras de alocação de formatos (`format_allocation`):**
    ```yaml
    format_allocation:
      default_formats_per_atom: 1
      max_formats_per_atom: 2
      allow_second_format_when:
        - "atom_type in [framework, historia, dado]"
        - "second format changes consumption mode (e.g. visual → audio)"
      hard_caps:
        same_format_ratio_max: 0.40   # nunca mais de 40% dos briefs no mesmo formato
        duplicate_angle_similarity_max: 0.70  # briefs com ângulo > 70% similar → descartar um
      exception_rule:
        email: "apenas para insights profundos com handoff explícito para copywriters"
    ```

22. Definir tipo de post para cada peça (imperial, polêmico, crença, problema, curiosidade, história, oferta)
23. Definir intenção de cada peça (atração, consciência, aquecimento, venda)

### Etapa 4: Geração de Briefs
24. Para cada átomo mapeado, gerar um brief contendo:
    - Título/tema do micro-conteúdo
    - Formato definido (carrossel, reels, stories, post único)
    - Tipo de post e framework de copy recomendados
    - Intenção (atração, consciência, aquecimento, venda)
    - Ângulo de abordagem (como esse átomo será apresentado)
    - Hook sugerido (1 linha de abertura)
    - CTA sugerido
    - Notas de execução (duração se reels, nº slides se carrossel)
25. Ordenar briefs por prioridade (alto impacto primeiro)
26. Garantir variedade de formatos (não mais que 40% no mesmo formato — ver `format_allocation`)

### Etapa 5: Entrega
27. Entregar lista completa de briefs organizados por formato
28. Incluir resumo quantitativo (total por formato, por intenção, por tipo)
29. Sugerir ordem de criação (prioridade)
30. Indicar quais briefs podem virar série de conteúdo conectada

## RELATIONSHIP TO OTHER ATOMIZE SPECS

Esta spec é a versão **approval-driven** de atomização — orientada a briefs e handoffs com gate de aprovação do usuário antes de qualquer criação.

| Usar esta spec (`conteudo/atomize-content.md`) quando: | Usar `video-content-distillery/atomize-content.md` quando: |
|---|---|
| O workflow exige aprovação humana antes da criação | O workflow requer ativos prontos para publicação |
| Outputs são briefs, mapas e handoffs | Não há gate de aprovação intermediário |
| Pipeline é orientado a conteúdo de marca própria | Pipeline é orientado a derivação em volume de conteúdo de terceiros |
| Fonte é vídeo/audio com cortes para curator | Fontes são conteúdo já destilado em Layer 4-5 |

**Regra de precedência:** quando as duas specs estiverem ativas no mesmo projeto, esta (`conteudo`) tem prioridade se houver aprovação pendente do usuário. Nunca executar ambas para o mesmo átomo — isso gera duplicação.

## VETO CONDITIONS

- Se conteúdo pilar tem menos de 3 insights acionáveis → NÃO executar, pedir conteúdo mais robusto
- Se não tem as 3 informações obrigatórias (pilar, tema, público) → NÃO executar, perguntar
- Se mais de 40% dos átomos caem no mesmo formato → Redistribuir antes de entregar
- Se algum brief não tem hook sugerido → Completar antes de entregar
- Se algum brief parece cópia direta do pilar (sem adaptação) → Reescrever com ângulo próprio
- Se tom não é imperial → Reescrever no tom correto
- Se usa palavras proibidas (segredo, dica, truque, hack, simples, fácil) → Substituir
- Se brief não funciona isoladamente (depende de contexto do pilar) → Ajustar para independência
- Se dois briefs têm ângulo de similaridade > 70% → Descartar o de menor impacto

## OUTPUT EXAMPLE

```
ATOMIZAÇÃO: Conteúdo Pilar → Micro-Conteúdos
PILAR: Live sobre posicionamento de marca (47 min)
TEMA: Posicionamento como arma de conversão
PÚBLICO: Empreendedores digitais 5-15k/mês
TOTAL ÁTOMOS: 18

RESUMO:
- Carrosseis: 6
- Reels: 5
- Stories: 4
- Frases de impacto: 3
- Briefs de email (handoff copywriters): 2
- Posts únicos: 1

---

BRIEF #1 [PRIORIDADE ALTA]
Átomo: "95% dos empreendedores são invisíveis pro comprador certo"
Tipo: Provocação
Formato: Carrossel (10 slides)
Tipo de post: Imperial
Framework: Abertura Curiosa
Intenção: Consciência
Ângulo: Atacar a crença de que "postar mais = vender mais"
Hook: "Você posta todo dia e ninguém compra. O problema não é o conteúdo."
CTA: "Comenta POSICIONAMENTO se você quer sair da invisibilidade"
Notas: 10 slides, progressão reptiliano → límbico → neocórtex

BRIEF #2 [PRIORIDADE ALTA]
Átomo: "Cliente saiu de 3k pra 47k em 60 dias com reposicionamento"
Tipo: Dado/Prova
Formato: Reels (45s)
Tipo de post: História
Framework: Testemunho Real
Intenção: Aquecimento
Ângulo: Case real com números concretos
Hook: "3 mil por mês. Mesmo público. 60 dias depois: 47 mil."
CTA: "Link na bio pra entender como"
Notas: Roteiro 45s, talking head com cortes dinâmicos

BRIEF #3 [PRIORIDADE MÉDIA]
Átomo: "Consistência sem posicionamento é barulho"
Tipo: Quote de impacto
Formato: Post único
Tipo de post: Polêmico
Framework: Pergunta Impactante
Intenção: Atração
Ângulo: Provocar quem posta muito e vende pouco
Hook: "Consistência sem posicionamento é trabalho escravo digital."
CTA: "Salva e manda pra quem precisa ouvir isso"
Notas: Imagem com fundo escuro + quote centralizada

[... briefs 4-18 ...]

SÉRIES SUGERIDAS:
- Briefs #1, #4, #9 formam série "Posicionamento em 3 atos"
- Briefs #2, #7 formam série "Cases de transformação"

ORDEM DE CRIAÇÃO RECOMENDADA:
1. Brief #1 (carrossel — âncora da atomização)
2. Brief #2 (reels — prova social)
3. Brief #3 (post único — rápido de produzir)
[...]
```

## COMPLETION CRITERIA

- Todas as etapas executadas na ordem (análise → extração → mapeamento → briefs → entrega)
- Mínimo 10 átomos extraídos e classificados (vídeo de 1h+ deve ter 30-50 átomos)
- Cortes de vídeo mapeados com timestamps em `cortes-video.yaml` (se `source_type` for `video`, `live` ou `podcast`)
- `atom_registry` criado na Etapa 2 com `atom_id` estável para cada átomo extraído
- Resumo pré-criação gerado para CADA átomo (título + preview)
- Cada átomo classificado por tipo (insight, quote, dado, história, provocação, framework)
- Cada brief com formato, tipo de post, framework, intenção, hook e CTA definidos
- Variedade de formatos (max 40% no mesmo formato)
- Briefs ordenados por prioridade
- Resumo quantitativo incluído
- Séries de conteúdo identificadas quando aplicável
- Tom imperial consistente em todos os hooks e CTAs
- Nenhum brief depende do pilar para fazer sentido (independência)
- Regras de `format_allocation` respeitadas (max 2 formatos por átomo, sem duplicação de ângulo)

## REFERENCES

- data/tipos-de-post.md — 7 tipos de post com estrutura completa por slides
- data/frameworks-copy.md — 9 frameworks de copy + matriz tipo x framework
- data/oraculo-posts.md — 9 etapas de validação + 12 testes
- data/oraculo-reels.md — framework de validação de reels
- data/hooks-bank.md — banco de hooks para referência
- data/posts-intencionais.md — 6 princípios de posts intencionais
- data/estrategias.md — 8 estratégias de campanha com cronograma
- data/regras-inviolaveis.md — regras de tom e linguagem
- data/cliches-proibidos.md — palavras e expressões proibidas
- squads/curator/tasks/format-cut.md — handoff de cortes de vídeo para o curator
