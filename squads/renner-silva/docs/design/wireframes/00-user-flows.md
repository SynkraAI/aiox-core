# User Flows - Metodo Aplauda de Pe

**Document:** Critical user flows mapped
**Priority:** Feeds Epic 1-4 implementation
**Created:** 2026-02-13

---

## Flow 1: Onboarding (Cadastro -> Trilha -> Primeiro Modulo)

```
[Pagina Inicial / Marketing]
          |
          v
[Tela de Cadastro]
  |-- Preenche nome, email, senha
  |-- OU clica "Continuar com Google"
  |
  v
[Validacao]
  |-- Sucesso --> Cria profile no Supabase
  |-- Erro --> Mostra mensagem inline, usuario corrige
  |
  v
[Redirect: /paths (Selecao de Trilha)]
  |
  v
[Auto-avaliacao (3 perguntas)]
  |-- Q1: Experiencia com oratoria
  |-- Q2: Tempo disponivel por semana
  |-- Q3: Objetivo principal
  |
  v
[Recomendacao de trilha exibida]
  |-- Destaca trilha recomendada no grid
  |
  v
[Seleciona trilha]
  |-- Confirma no dialog
  |
  v
[Toast: "Trilha X ativada!"]
  |
  v
[Redirect: /dashboard]
  |-- Dashboard mostra trilha ativa
  |-- Modulo 1 em destaque com glow "Proximo"
  |
  v
[Clica "Comecar" no Modulo 1]
  |
  v
[/modules/1]
  |-- Primeiro conceito do modulo exibido
  |-- Aluno comeca a estudar
```

**Tempo estimado do fluxo:** 3-5 minutos
**Pontos de abandono potenciais:**
- Formulario de cadastro (solucao: oferecer Google OAuth como alternativa rapida)
- Selecao de trilha (solucao: auto-avaliacao simplifica a decisao)
- Primeiro modulo (solucao: conteudo imediatamente acessivel, sem barreira)

**Metricas a rastrear (Posthog):**
- `signup_started` -> `signup_completed` (conversao)
- `trail_assessment_started` -> `trail_selected` (conclusao)
- `module_1_opened` (primeiro engajamento real)

---

## Flow 2: Estudo de Modulo (Dashboard -> Modulo -> Checkpoint -> Feedback -> Proximo)

```
[Dashboard]
  |-- Ve Modulo 1 com glow "Proximo"
  |-- Clica "Comecar" / "Continuar"
  |
  v
[/modules/1 - Pagina de Modulo]
  |
  |-- Le header: titulo, objetivo, duracao
  |-- Expande conceitos (accordion)
  |
  |-- [Loop por conceito]:
  |     |-- Clica conceito no accordion
  |     |-- Le: Definicao
  |     |-- Navega tab: Importancia
  |     |-- Navega tab: Exemplos Praticos
  |     |-- Navega tab: Como Aplicar
  |     |-- Fecha accordion, abre proximo
  |
  |-- Scroll para Tecnicas
  |     |-- Le lista de tecnicas
  |
  |-- Scroll para Exercicios
  |     |-- Ve cards de exercicios
  |     |-- Clica exercicio
  |     |     |
  |     |     v
  |     | [/modules/1/exercises/X]
  |     |     |-- Le instrucoes
  |     |     |-- Ve criterios de sucesso
  |     |     |-- Pratica offline (fora do app)
  |     |     |-- Escreve anotacao (opcional)
  |     |     |-- Marca "Concluido" [checkbox]
  |     |     |     |
  |     |     |     v
  |     |     | [Toast: "Exercicio concluido!"]
  |     |     |-- Volta ao modulo [< Modulo 1]
  |     |
  |-- Scroll para Checkpoints
  |     |-- Ve lista de checkpoints
  |     |-- Marca checkpoint como concluido [checkbox]
  |     |     |
  |     |     v
  |     | [Toast: "Checkpoint 1.X concluido!"]
  |     | [Progress bar atualiza em tempo real]
  |     |
  |     |-- Marca outro checkpoint...
  |     |     |
  |     |     v
  |     | [Ao atingir 70% (3/4 checkpoints)]:
  |     |     |
  |     |     v
  |     | [Toast: "Modulo 2 desbloqueado!"]
  |     | [Modulo 2 card no sidebar muda de locked -> unlocked]
  |
  |-- [Ao completar TODOS checkpoints do modulo]:
  |     |
  |     v
  | [Celebration Modal]
  |     |-- Confetti animation
  |     |-- "Parabens! Voce concluiu o Modulo 1!"
  |     |-- Stats: X checkpoints, ~Yh de estudo
  |     |-- Badge earned: "Abertura Criativa"
  |     |-- [Continuar para Modulo 2]  [Ver conquistas]
  |
  v
[Clica "Continuar para Modulo 2"]
  |
  v
[/modules/2 - Proximo modulo]
  |-- Ciclo repete
```

**Tempo estimado por modulo:** 2-5 horas (depende da trilha)
**Pontos de abandono potenciais:**
- Conceitos longos (solucao: accordion mantem conteudo compacto)
- Exercicios offline (solucao: instrucoes claras + criterios objetivos)
- Checkpoints manuais (solucao: feedback imediato a cada check)

**Metricas a rastrear:**
- `module_opened` (qual modulo, duracao na pagina)
- `concept_expanded` (qual conceito)
- `exercise_opened` -> `exercise_completed` (taxa de conclusao)
- `checkpoint_toggled` (qual, timestamp)
- `module_completed` (tempo total desde primeiro acesso)
- `next_module_unlocked` (tempo ate desbloquear)

---

## Flow 3: Conquista de Badge (Acao -> Trigger -> Notificacao -> Badge Page)

```
[Qualquer pagina do app]
  |
  |-- Aluno completa acao que dispara badge:
  |     |-- Checkpoint 1.1 concluido -> "Primeiro Passo"
  |     |-- Todos ckpts modulo 1 -> "Abertura Criativa"
  |     |-- 7 dias consecutivos -> "Dedicado"
  |     |-- Score >= 90% quiz -> "Nota 10"
  |     |-- Acessou todos conceitos -> "Explorador"
  |     |-- (etc, 15 badges no total)
  |
  v
[Badge Engine verifica criterios]
  |-- Criterio atendido?
  |     |-- NAO -> Nada acontece
  |     |-- SIM -> Badge desbloqueada
  |
  v
[Badge salva no Supabase: user_badges]
  |
  v
[Toast especial (achievement variant)]
  |-- +--------------------------------------+
  |-- | [Trophy icon] Conquista!             |
  |-- | "Abertura Criativa"                  |
  |-- | Voce completou o Modulo 1!           |
  |-- | [Ver conquista]                      |
  |-- +--------------------------------------+
  |-- Duracao: 6 segundos
  |-- Animacao: Slide up + scale-in do icone
  |
  v
[Aluno clica "Ver conquista" no toast]
  |-- OU ignora (toast some apos 6s)
  |
  v
[Badge Detail Modal abre]
  |-- Badge grande com efeito de rarity
  |-- Nome, descricao, data de conquista
  |-- [Ver todas conquistas] [Fechar]
  |
  v
[Se clicou "Ver todas conquistas"]
  |
  v
[/badges - Pagina de Conquistas]
  |-- Badge recente aparece com "Novo!" pill
  |-- Animacao de scale-in na badge earned
  |-- "Proxima conquista" card atualizado
```

**Tipos de trigger:**

| Badge | Trigger | Verificacao |
|-------|---------|-------------|
| Primeiro Passo | Checkpoint 1.1 concluido | `checkpoints['1.1'] === true` |
| Abertura Criativa | Todos ckpts modulo 1 | `module1Checkpoints.every(c => c.completed)` |
| Vendedor de Sonhos | Todos ckpts modulo 2 | `module2Checkpoints.every(c => c.completed)` |
| Mestre da Estrutura | Todos ckpts modulo 3 | Similar |
| Contador de Historias | Todos ckpts modulo 4 | Similar |
| Aplauso de Pe | Todos ckpts modulo 5 | Similar |
| Dedicado | 7 dias consecutivos | `streak >= 7` |
| Incansavel | 30 dias consecutivos | `streak >= 30` |
| Nota 10 | Score >= 90% em quiz | `quizScore >= 90` |
| Explorador | Acessou todos conceitos | `visitedConcepts.length === 15` |
| Anotador | 10 notas criadas | `notesCount >= 10` |
| Expresso | Trilha Express completa | `expressTrail.completed` |
| Projeto Final | Projeto final concluido | `finalProject.completed` |
| Metodo Completo | Trilha Master completa | `masterTrail.completed` |
| Perfeccionista | 100% checkpoints | `allCheckpoints.every(c => c.completed)` |

**Badge engine timing:**
- Verificacao acontece no momento da acao (checkpoint toggle, quiz submit, etc.)
- Verificacao e sincrona (nao espera backend)
- Salvar no Supabase e assincrono (otimista)
- Se multiplas badges desbloqueadas simultaneamente, toasts enfileirados com 1s de delay entre cada

---

## Flow 4: Streak Maintenance (Acesso Diario -> Checkpoint -> Streak Update -> Milestone)

```
[Dia 1: Primeiro acesso]
  |
  v
[Aluno acessa qualquer pagina autenticada]
  |-- Sistema registra acesso diario
  |-- Streak counter: 1 dia
  |-- Nenhuma notificacao (streak comeca silenciosamente)
  |
  v
[Aluno completa pelo menos 1 checkpoint]
  |-- Dia "validado" para streak
  |-- Streak visible no header (icone de fogo + "1")
  |
  v
[Dia 2-6: Acesso consecutivo + checkpoint]
  |-- Cada dia incrementa streak: 2, 3, 4, 5, 6
  |-- Header mostra: [fire] 6
  |
  v
[Dia 7: Milestone!]
  |-- Streak = 7
  |-- Badge "Dedicado" desbloqueada (Flow 3 ativa)
  |-- Toast: "7 dias consecutivos! Badge Dedicado desbloqueado!"
  |-- Streak milestone animation: fire icon pulses + glow
  |
  v
[Dia 8+: Continuidade]
  |-- Streak continua incrementando
  |-- Proximos milestones: 14, 30, 60, 100 dias
  |
  v
[DIA SEM ACESSO (>20h desde ultimo)]
  |
  v
[Supabase Edge Function detecta inatividade]
  |-- Envia email: "Nao perca seu streak de X dias!"
  |-- Push notification (se PWA instalado)
  |
  v
[Aluno retorna dentro de 24h?]
  |-- SIM -> Streak mantido, continua normalmente
  |-- NAO -> Proxima verificacao...
  |
  v
[Aluno nao acessou em 24h]
  |
  v
[Tem freeze disponivel? (1 por semana)]
  |-- SIM -> Freeze automaticamente usado
  |     |-- Toast no proximo acesso: "Seu freeze salvou seu streak de X dias!"
  |     |-- Freeze indicator: [snowflake] (0 freezes restantes esta semana)
  |     |-- Streak mantem valor anterior
  |
  |-- NAO -> Streak resetado para 0
  |     |-- Toast: "Seu streak foi resetado. Comece novamente!"
  |     |-- Streak counter volta a 0 no header
  |     |-- Sem punicao alem de perder streak (nao perde progresso)
  |
  v
[Proxima segunda-feira]
  |-- Freeze reposto: 1 freeze disponivel novamente
  |-- Toast sutil: "Seu freeze semanal foi restaurado"
```

**Streak state machine:**

```
              [checkpoint completed]
 INACTIVE --------------------------> ACTIVE (streak=1)
                                         |
                                         |  [daily checkpoint]
                                         v
                                     ACTIVE (streak=N+1)
                                         |
                          [>24h sem checkpoint]
                                         |
                    +--------------------+--------------------+
                    |                                          |
              [has freeze]                              [no freeze]
                    |                                          |
                    v                                          v
             FROZEN (streak=N)                         RESET (streak=0)
                    |                                          |
              [next access]                             [next access]
                    |                                          |
                    v                                          v
             ACTIVE (streak=N)                         INACTIVE
                    |
              [next Monday]
                    |
                    v
             freeze replenished
```

**Streak milestones:**

| Days | Badge | Visual Effect |
|------|-------|---------------|
| 7 | Dedicado (Rare) | Fire icon pulses, toast + badge |
| 14 | -- | Streak counter gets warm glow |
| 30 | Incansavel (Epic) | Major celebration, fire icon upgrades to double flame |
| 60 | -- | Streak counter gets golden tint |
| 100 | -- | Special celebration screen, permanent golden fire icon |

**Streak display in header:**

```
[fire icon] 7   (normal: white fire, number)
[fire icon] 14  (warm: orange fire, warm glow)
[fire icon] 30  (hot: red fire, pulse animation)
[fire icon] 60  (golden: gold fire, constant glow)
[fire icon] 100 (legendary: animated gold fire with particles)
```

**Important considerations:**
- Streak is calculated SERVER-SIDE (Supabase Edge Function) to prevent manipulation
- Timezone: User's local timezone (detected on first login, stored in profile)
- "Day" boundary: Midnight in user's timezone
- Minimum action for streak: At least 1 checkpoint completed (not just page visit)
- Freeze mechanic: 1 per week (Monday reset), auto-used, cannot be "saved"

---

## Flow Summary: Screen Navigation Map

```
                          [Marketing/Landing]
                                |
                      [Login] -- [Cadastro]
                                |
                         [Selecao de Trilha]
                                |
                    +-----------+-----------+
                    |                       |
              [Dashboard] <--> [Perfil]
                    |
    +-------+-------+-------+-------+
    |       |       |       |       |
 [Mod.1] [Mod.2] [Mod.3] [Mod.4] [Mod.5]
    |
    +-- [Exercicio]
    |
    +-- [Checkpoint page]
    |
    +-- [Grafo Conceitos]
    |
    +-- [Badges/Conquistas]
    |
    +-- [Instrutor Dashboard] (role-restricted)
```

---

*User Flows v1.0.0 -- Metodo Aplauda de Pe*
*Created by @brad-frost via Design Chief routing*
