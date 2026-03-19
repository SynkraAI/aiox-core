# Schema Review Report - Metodo Aplauda de Pe

**Reviewer:** Dara (Data Engineer Agent)
**Date:** 2026-02-13
**Schema Version:** 1.0 (by Aria, Architect Agent)
**Schema File:** `docs/database/schema.sql`
**PRD Reference:** `docs/product/PRD.md` v1.0

---

## Executive Summary

O schema esta bem estruturado para o escopo do projeto. A Aria fez um trabalho solido nas decisoes fundamentais: RLS em todas as tabelas, SECURITY DEFINER em functions, auto-create de profile via trigger, e denormalizacao pragmatica em `progress.module_id`. Encontrei **2 issues criticos**, **6 warnings**, e proponho **8 melhorias**. Nenhum dos issues criticos e bloqueante para deploy, mas devem ser corrigidos antes de ir para producao.

**Veredicto: APROVADO COM CORRECOES**

---

## 1. Issues Criticos (Bloqueantes para Producao)

### CRIT-01: badges RLS policy usa auth.role() incorretamente

**Arquivo:** `schema.sql` linha 283
**Problema:**
```sql
CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  USING (auth.role() = 'authenticated');
```

No Supabase, `auth.role()` retorna o papel do JWT (tipicamente `'authenticated'` ou `'anon'`). Isso funciona, POREM ha um problema sutil: se o projeto Supabase permitir acesso anonimo (anon key), qualquer request com anon key tera `auth.role() = 'anon'` e nao conseguira ler badges. O correto para garantir que apenas usuarios logados vejam badges (conforme PRD) e usar `auth.uid() IS NOT NULL`.

**Fix:**
```sql
CREATE POLICY "Authenticated users can view badges"
  ON badges FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

**Impacto:** Sem correcao, badges podem nao carregar em cenarios edge de autenticacao.

### CRIT-02: calculate_streak() tem side-effect em funcao chamada pelo client

**Arquivo:** `schema.sql` linhas 434-488
**Problema:** A funcao `calculate_streak()` faz SELECT (leitura) E UPDATE (escrita) na tabela `streaks`. Isso significa:
1. Um usuario pode chamar `rpc('calculate_streak')` e a funcao atualiza a tabela `streaks` via SECURITY DEFINER, bypassando a RLS que bloqueia INSERT/UPDATE de streaks pelo usuario.
2. Isso e intencional (streaks sao server-side), POREM a funcao nao valida que `p_user_id = auth.uid()`. Qualquer usuario autenticado pode chamar `calculate_streak('id-de-outro-usuario')` e manipular dados de streak de outro usuario.

**Fix:** Adicionar validacao de que o caller so pode calcular o proprio streak:
```sql
-- No inicio da funcao, apos DECLARE:
IF p_user_id != auth.uid() THEN
  RAISE EXCEPTION 'Unauthorized: can only calculate own streak';
END IF;
```

**Impacto:** Sem correcao, qualquer usuario pode recalcular (e potencialmente corromper) streaks de outros usuarios.

---

## 2. Warnings (Nao-Bloqueantes, Atencao Necessaria)

### WARN-01: quiz_results permite UPDATE pelo usuario (desnecessario e arriscado)

**Arquivo:** `schema.sql` linhas 308-311
**Problema:** A policy permite que usuarios atualizem seus resultados de quiz. Como o PRD diz "melhor score e mantido" e "aluno pode refazer quiz", nao ha razao para UPDATE. Cada tentativa deve ser um INSERT novo. Permitir UPDATE abre brecha para o usuario alterar score apos submissao.

**Recomendacao:** Remover a policy de UPDATE em quiz_results.

### WARN-02: progress permite DELETE pelo usuario

**Arquivo:** `schema.sql` linhas 256-258
**Problema:** A policy permite que usuarios deletem registros de progress. O PRD diz que checkpoints podem ser marcados/desmarcados, o que e coberto pelo campo `completed` (toggle TRUE/FALSE via UPDATE). DELETE real pode causar inconsistencias no calculo de streak e badges.

**Recomendacao:** Remover a policy de DELETE em progress. Usar UPDATE para toggle de `completed`.

### WARN-03: streaks nao tem created_at

**Arquivo:** `schema.sql` linhas 194-205
**Problema:** Tabela `streaks` nao tem campo `created_at`. Todas as outras tabelas com dados de usuario tem. Isso quebra a consistencia e dificulta audit trail.

**Recomendacao:** Adicionar `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.

### WARN-04: correct_answers pode exceder total_questions (falta CHECK constraint)

**Arquivo:** `schema.sql` linhas 170-172
**Problema:** Os CHECK constraints validam `correct_answers >= 0` e `total_questions > 0` individualmente, mas nao validam que `correct_answers <= total_questions`. Um bug no client pode inserir dados inconsistentes.

**Recomendacao:** Adicionar `CHECK (correct_answers <= total_questions)`.

### WARN-05: get_instructor_metrics() pode ter performance ruim com muitos dados

**Arquivo:** `schema.sql` linhas 494-549
**Problema:** A funcao faz 5 queries separadas em uma unica chamada RPC, incluindo COUNT(*) e GROUP BY em tabelas que crescem linearmente. Com 500 usuarios nao e problema, mas a funcao nao tem paginacao nem limites.

**Recomendacao:** Para o free tier e 500 usuarios, esta ok. Monitorar quando ultrapassar 1000 usuarios. Considerar caching via Edge Function com TTL de 5 minutos.

### WARN-06: Falta CHECK constraint em score vs grade consistency

**Arquivo:** `schema.sql` linhas 166-178
**Problema:** O campo `grade` e definido pela aplicacao, mas nao validado no banco. Um bug pode inserir `grade = 'excellent'` com `score = 50`. A regra e: >=90 excellent, >=70 good, <70 review.

**Recomendacao:** Adicionar CHECK constraint ou gerar grade via GENERATED ALWAYS AS.

---

## 3. O Que Esta Correto

### OK-01: Estrutura de tabelas solida
- Todas as tabelas tem `id` como PK (UUID ou TEXT semantico para badges)
- `created_at` e `updated_at` presentes onde necessario
- Foreign keys com ON DELETE CASCADE apropriados (aluno deletado = dados deletados)
- UNIQUE constraints corretos: `(user_id, checkpoint_id)` em progress, `(user_id, badge_id)` em user_badges, `(user_id)` em streaks

### OK-02: Indexes bem planejados
- `idx_progress_user_module` cobre a query principal (carregar progresso por modulo)
- `idx_progress_user_completed_at` cobre calculo de streak
- `idx_progress_checkpoint` e `idx_progress_module` cobrem queries do instrutor
- `idx_notes_content_trgm` preparado para full-text search (Epic 3)
- `idx_user_badges_user` e `idx_user_badges_badge` cobrem lookup bidirecional

### OK-03: Custom types (ENUMs) bem definidos
- `user_role`, `badge_rarity`, `entity_type`, `quiz_grade` -- todos enums com valores claros e limitados
- Previne dados invalidos na camada de banco

### OK-04: Trigger handle_new_user() correto
- Extrai name de multiplas fontes (raw_user_meta_data) com COALESCE
- Cria profile E streak atomicamente na mesma transacao
- SECURITY DEFINER necessario para operar na tabela profiles

### OK-05: Extensions corretas
- `uuid-ossp` para UUID generation
- `pg_trgm` para full-text search trigram (muito bom para busca parcial em portugues)

### OK-06: Denormalizacao pragmatica em progress.module_id
- Evita JOIN com dados da aplicacao (JSON) para queries frequentes
- Compensado por index dedicado
- Documentado via COMMENT ON

### OK-07: Badges como TEXT PK
- Badge IDs semanticos (`badge-primeiro-passo`) melhor que UUIDs aleatorios para seed data e referencia no codigo
- Imutaveis por natureza (definidos uma vez)

### OK-08: SECURITY DEFINER em todas as functions
- Necessario para functions que bypassam RLS (calculate_streak, get_instructor_metrics)
- calculate_module_progress e check_unlock_next_module tecnicamente nao precisam, mas nao causa dano

---

## 4. Melhorias Propostas

### IMP-01: Adicionar funcao get_best_quiz_scores() com validacao de user_id

**Problema atual:** A funcao aceita qualquer `p_user_id` sem validar `auth.uid()`.
**Proposta:** Adicionar check `p_user_id = auth.uid()` ou remover parametro e usar `auth.uid()` direto.

### IMP-02: Adicionar index parcial para progress.completed = TRUE

**Motivacao:** A maioria das queries filtra `WHERE completed = TRUE`. Um index parcial reduz tamanho e melhora performance.
```sql
CREATE INDEX idx_progress_user_module_completed
  ON progress(user_id, module_id)
  WHERE completed = TRUE;
```

### IMP-03: Gerar grade automaticamente via GENERATED column

**Motivacao:** Elimina possibilidade de inconsistencia entre score e grade.
```sql
-- PostgreSQL 12+ suporta GENERATED ALWAYS AS
-- POREM Supabase nao suporta GENERATED STORED para enum types facilmente.
-- Alternativa: CHECK constraint
CHECK (
  (score >= 90 AND grade = 'excellent') OR
  (score >= 70 AND score < 90 AND grade = 'good') OR
  (score < 70 AND grade = 'review')
)
```

### IMP-04: Adicionar COMMENT ON em todas as funcoes e tabelas

**Status:** Ja parcialmente implementado. Completar para colunas criticas faltantes.

### IMP-05: Adicionar profile INSERT policy para handle_new_user trigger

**Problema:** O trigger `handle_new_user()` usa SECURITY DEFINER, entao funciona sem INSERT policy em profiles. Porem, se futuramente a aplicacao precisar inserir profiles por outro caminho, nao havera policy.

**Decisao:** [AUTO-DECISION] "Adicionar INSERT policy em profiles?" -> Nao adicionar agora (reason: Unico caminho de criacao e via trigger SECURITY DEFINER. Adicionar policy desnecessaria seria over-engineering. Documentar a decisao.)

### IMP-06: Adicionar indice em notes para busca por user_id apenas

**Motivacao:** O indice composto `(user_id, entity_type, entity_id)` nao e eficiente para "listar todas as notas do usuario" sem filtro de entity_type.
```sql
CREATE INDEX idx_notes_user ON notes(user_id);
```

### IMP-07: Adicionar campo title em notes

**Motivacao:** PRD Story 3.4 menciona busca dentro das notas e exportacao em Markdown. Ter um titulo facilita listagem e organizacao. Porem, nao esta nos acceptance criteria explicitos.

**Decisao:** [AUTO-DECISION] "Adicionar title em notes?" -> Nao adicionar agora (reason: PRD nao exige. Pode ser adicionado em migration futura se necessario. YAGNI.)

### IMP-08: Validar p_total_checkpoints > 0 em calculate_module_progress

**Status:** Ja implementado (IF p_total_checkpoints = 0 THEN RETURN 0). OK.

---

## 5. Queries Otimizadas para Fluxos Principais

### Query 1: Carregar progresso do usuario (Story 1.6)

```sql
-- Buscar todos os checkpoints completados de um usuario
SELECT checkpoint_id, module_id, completed, completed_at
FROM progress
WHERE user_id = $1  -- auth.uid()
  AND completed = TRUE
ORDER BY module_id, checkpoint_id;

-- Index utilizado: idx_progress_user_module (user_id leading column)
-- Estimativa de custo: Index Scan, ~29 rows por usuario (max checkpoints)
-- Tempo estimado: < 1ms
```

### Query 2: Verificar se modulo pode ser desbloqueado (Story 1.6)

```sql
-- Usando a funcao RPC (ja implementada)
SELECT check_unlock_next_module($1, 'mod-1', 6);

-- Alternativa inline sem RPC (para client direto):
SELECT COUNT(*) >= CEIL(6 * 0.7)  -- 70% de 6 = 4.2 -> 5 checkpoints
FROM progress
WHERE user_id = $1
  AND module_id = 'mod-1'
  AND completed = TRUE;

-- Index utilizado: idx_progress_user_module
-- Tempo estimado: < 1ms
```

### Query 3: Calcular streak atual (Story 4.2)

```sql
-- Usando a funcao RPC (ja implementada)
SELECT * FROM calculate_streak($1);

-- A funcao faz:
--   1. SELECT DISTINCT dates de progress (Index: idx_progress_user_completed_at)
--   2. Loop para contar dias consecutivos
--   3. UPDATE streaks table
-- Custo: 1 Index Scan + 1 UPDATE = ~2ms

-- Para leitura rapida (sem recalculo):
SELECT current_streak, longest_streak, last_activity_date
FROM streaks
WHERE user_id = $1;

-- Index: PK scan via unique user_id
-- Tempo: < 0.5ms
```

### Query 4: Buscar badges conquistados + proximos (Story 4.1)

```sql
-- Badges conquistados
SELECT b.id, b.name, b.description, b.icon, b.rarity, ub.earned_at
FROM badges b
INNER JOIN user_badges ub ON ub.badge_id = b.id
WHERE ub.user_id = $1
ORDER BY ub.earned_at DESC;

-- Index: idx_user_badges_user (user_id) -> join com badges PK
-- Tempo: < 1ms (max 15 rows)

-- Todos os badges (para mostrar nao-conquistados):
SELECT b.*,
       ub.earned_at IS NOT NULL AS earned,
       ub.earned_at
FROM badges b
LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = $1
ORDER BY b.sort_order;

-- Index: badges sequential scan (15 rows, trivial) + idx_user_badges lookup
-- Tempo: < 1ms
```

### Query 5: Dashboard instrutor - metricas agregadas (Story 2.4)

```sql
-- Usando a funcao RPC (ja implementada)
SELECT get_instructor_metrics();

-- A funcao faz 5 subqueries:
--   1. COUNT profiles WHERE role = 'student' (idx_profiles_role)
--   2. COUNT DISTINCT progress WHERE completed_at > 7 days (idx_progress_user_completed_at)
--   3. GROUP BY module_id em progress (idx_progress_module)
--   4. MIN(count) por checkpoint_id em progress (idx_progress_checkpoint)
--   5. GROUP BY learning_path_id em profiles (sequential scan, small table)
-- Tempo estimado com 500 usuarios: < 50ms
-- Tempo estimado com 5000 usuarios: < 200ms (necessitara caching)
```

---

## 6. Validacao de Volume

### Estimativas da Aria (revisadas)

| Tabela | Rows/User | 500 Users | Tamanho | Revisao Dara |
|--------|-----------|-----------|---------|--------------|
| profiles | 1 | 500 | ~50 KB | OK. ~100 bytes/row com todos os campos preenchidos. |
| progress | ~29 | 14,500 | ~1.5 MB | **Conservador.** Cada row ~80 bytes. 14500 * 80 = 1.16 MB. Com indexes: ~2 MB. |
| notes | ~5 avg | 2,500 | ~2.5 MB | **Depende do conteudo.** Se media de 500 chars/nota: 2500 * 500 = 1.25 MB texto + overhead. Estimativa 2.5 MB e conservadora mas razoavel. |
| badges | 15 (fixo) | 15 | ~2 KB | OK. Estatico. |
| user_badges | ~5 avg | 2,500 | ~100 KB | OK. ~40 bytes/row. |
| quiz_results | ~10 | 5,000 | ~5 MB | **Atencao:** O campo `answers` (JSONB) pode variar. Se quiz tem 10 questoes com ~200 bytes cada: 2KB/row. 5000 * 2KB = 10 MB. Estimativa original subestima o JSONB. Reviso para ~7 MB. |
| streaks | 1 | 500 | ~25 KB | OK. ~50 bytes/row. |
| **TOTAL** | | ~25,015 | **~9.2 MB** | **Revisao: ~13 MB** (considerando JSONB e indexes) |

**Conclusao da revisao:** Mesmo com minha estimativa mais conservadora de ~13 MB, estamos em **2.6% do free tier** (500 MB). Sem preocupacao ate ~19,000 usuarios ativos. A estimativa da Aria esta dentro de uma margem aceitavel.

### Pontos de crescimento a monitorar:
- `quiz_results.answers` (JSONB) e o campo de maior crescimento proporcional
- `notes.content` pode crescer significativamente se usuarios criarem notas longas
- Indexes ocupam ~30-50% do espaco adicional das tabelas indexadas

---

## 7. Migration Strategy

### Ordem de execucao (dependencias resolvidas):

```
1. Extensions      (uuid-ossp, pg_trgm)           -- sem dependencia
2. Custom Types    (enums)                          -- sem dependencia
3. profiles table  (depende de auth.users)          -- criada primeiro entre as user tables
4. progress table  (depende de profiles)
5. notes table     (depende de profiles)
6. badges table    (sem dependencia de user)
7. user_badges     (depende de profiles + badges)
8. quiz_results    (depende de profiles)
9. streaks table   (depende de profiles)
10. RLS policies   (depende de todas as tabelas)
11. Triggers       (depende de tabelas + funcoes)
12. Functions      (depende de tabelas)
13. Seed data      (depende de badges table)
```

### Rollback strategy:

```sql
-- Rollback completo (DROP na ordem inversa):
DROP FUNCTION IF EXISTS get_best_quiz_scores;
DROP FUNCTION IF EXISTS get_instructor_metrics;
DROP FUNCTION IF EXISTS calculate_streak;
DROP FUNCTION IF EXISTS check_unlock_next_module;
DROP FUNCTION IF EXISTS calculate_module_progress;
DROP FUNCTION IF EXISTS update_updated_at;
DROP FUNCTION IF EXISTS handle_new_user;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TABLE IF EXISTS streaks CASCADE;
DROP TABLE IF EXISTS quiz_results CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS progress CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TYPE IF EXISTS quiz_grade;
DROP TYPE IF EXISTS entity_type;
DROP TYPE IF EXISTS badge_rarity;
DROP TYPE IF EXISTS user_role;
-- Extensions: keep (shared, may be used by other projects)
```

### Testing local:

```bash
# 1. Instalar Supabase CLI
npx supabase init      # se nao inicializado
npx supabase start     # Docker local

# 2. Aplicar migration
npx supabase db push   # ou copiar SQL para dashboard

# 3. Testar com Supabase Studio (localhost:54323)
# 4. Testar RLS via Supabase client com anon key
```

---

## 8. Checklist Final

| Item | Status | Nota |
|------|--------|------|
| Todas as tabelas tem PK | OK | UUID ou TEXT |
| Todas as tabelas tem created_at | WARN | streaks faltando |
| Foreign keys com ON DELETE | OK | Todos CASCADE |
| RLS habilitado em todas as tabelas | OK | 7/7 tabelas |
| RLS policies testadas positiva/negativamente | PENDENTE | Requer teste manual |
| Indexes cobrem queries principais | OK | 12 indexes definidos |
| Functions tem error handling basico | PARCIAL | calculate_module_progress trata div/0. Outras nao. |
| SECURITY DEFINER justificado | OK | Necessario para cross-table operations |
| Trigger de auto-create profile | OK | Funcional e correto |
| Badge seed data completo | OK | 15 badges conforme PRD |
| Volume estimado dentro do free tier | OK | ~13 MB (2.6% de 500 MB) |
| Enums vs strings | OK | Enums para valores finitos e conhecidos |
| JSONB vs normalized | OK | JSONB para criteria_value (flexivel) e answers (variavel) |
| Audit trail (created_at/updated_at) | OK | Exceto streaks.created_at |
| CHECK constraints suficientes | PARCIAL | Falta correct_answers <= total_questions |

---

*Review realizado por Dara (Data Engineer Agent)*
*Version 1.0 - 2026-02-13*
