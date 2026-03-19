# Hook Creation

```yaml
id: hook-creation
execution_type: Agent
purpose: Create high-retention hooks for content using the Hook-Retain-Reward framework, scoring each for stopping power and relevance to Tiago's thesis.
executor: @alex-hormozi
inputs:
  - Content topic or pillar piece to create hooks for
  - Target audience pain points (professional who is stuck)
  - Brand thesis ("Obesidade mental trava. Clareza liberta.")
  - Platform where hooks will be used (determines length/format)
preconditions:
  - Content topic is defined
  - Audience pain points are documented
  - Tone guidelines established (direto, sem verniz, pratico)
steps:
  1. Identify the core audience pain for this specific content:
     - Consultar `data/icp-research.md` Secoes 1.2 (dores verbalizadas) e 2.1 (VoC real)
     - Dores verificadas: "Tenho muita coisa pra fazer e nao sei por onde comecar", "Trabalho o dia inteiro e no final sinto que nao fiz nada", "Reunioes, mensagens, urgencia — ilusao de eficiencia"
     - Desejos profundos (Secao 1.3): confianca de direcao, parar de sentir culpa ao descansar, clareza sobre QUAL direcionamento seguir
     - Crencas limitantes (Secao 1.4): "Se eu parar, vou ficar pra tras", "Se estou ocupado, estou avancando"
  2. Select hook types to generate (create at least 2 per type):
     - Contrarian: Challenge a popular belief ("Produtividade nao e o problema. Obesidade mental e.")
     - Question: Ask something they can't ignore ("Voce sabe a diferenca entre estar ocupado e estar travado?")
     - Story: Open with a specific moment ("Semana passada um cliente me disse...")
     - Stat/Proof: Lead with evidence verificavel ("72% dos brasileiros estao estressados no trabalho — ISMA-BR"). **OBRIGATORIO**: usar dados de `data/icp-research.md` Secao 6.3
     - Challenge: Dare them ("Se voce nao consegue responder isso em 10 segundos...")
     - List: Promise specific value ("3 sinais de que voce esta com obesidade mental")
  3. Write 10 hook variations following Maximum Value Per Second:
     - Each hook must deliver value in the first 3 seconds
     - No filler words, no slow build-ups
     - Every word earns its place
  4. Score each hook (1-10) on 4 criteria:
     - Stopping power: Would this make someone stop scrolling?
     - Relevance: Does this connect to the thesis?
     - Curiosity gap: Does this create a need to know more?
     - Tone match: Does this sound like Tiago (direto, sem verniz)?
  5. Calculate total score and rank all 10 hooks
  6. Select top 3 hooks with brief rationale for each
  7. For top 3, write the "retain" transition (what comes after the hook)
outputs:
  - 10 hooks with:
    - Hook text (exact words)
    - Hook type (contrarian/question/story/stat/challenge/list)
    - Score per criteria (stopping power, relevance, curiosity, tone)
    - Total score
  - Top 3 hooks with retain transitions
  - Ranked list from highest to lowest score
validation:
  - Exactly 10 hooks written (minimum 2 different types)
  - All hooks are in Portuguese, matching Tiago's voice
  - Scores are justified (not arbitrary)
  - Top 3 hooks score 7+ on all criteria
  - No hook uses generic/cliche openings
  - Retain transitions flow naturally from the hook
```
