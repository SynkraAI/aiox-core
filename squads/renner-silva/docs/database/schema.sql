-- =============================================================================
-- Metodo Aplauda de Pe - Supabase PostgreSQL Schema
-- =============================================================================
-- Version: 1.1
-- Date: 2026-02-13
-- Original Author: Aria (Architect Agent)
-- Reviewed by: Dara (Data Engineer Agent) - v1.1 corrections applied
-- PRD Reference: docs/product/PRD.md v1.0
-- Review Reference: docs/database/schema-review.md
--
-- This schema covers all tables needed for Epics 1-4.
-- Epic 5 (social features) will extend this schema when planned.
--
-- IMPORTANT: Run this migration in order. Each section depends on the previous.
--
-- v1.1 CHANGES (Dara review):
--   - CRIT-01: Fixed badges RLS policy (auth.role() -> auth.uid() IS NOT NULL)
--   - CRIT-02: Added auth.uid() validation to calculate_streak()
--   - WARN-01: Removed UPDATE policy from quiz_results (append-only)
--   - WARN-02: Removed DELETE policy from progress (use UPDATE for toggle)
--   - WARN-03: Added created_at to streaks table
--   - WARN-04: Added CHECK(correct_answers <= total_questions) to quiz_results
--   - WARN-06: Added CHECK constraint for score/grade consistency
--   - IMP-01: Added auth.uid() validation to get_best_quiz_scores()
--   - IMP-02: Added partial index for completed progress
--   - IMP-06: Added index for notes by user_id only
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Extensions
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search (Epic 3)

-- -----------------------------------------------------------------------------
-- 1. Custom Types
-- -----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('student', 'instructor');
CREATE TYPE badge_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
CREATE TYPE entity_type AS ENUM ('module', 'concept', 'exercise');
CREATE TYPE quiz_grade AS ENUM ('excellent', 'good', 'review');

-- -----------------------------------------------------------------------------
-- 2. profiles - User profile data
-- -----------------------------------------------------------------------------
-- Created automatically via trigger when auth.users row is inserted.
-- Students can update their own name and avatar.
-- Instructor role is assigned manually via Supabase dashboard.
-- -----------------------------------------------------------------------------
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  name            TEXT,
  avatar_url      TEXT,
  role            user_role NOT NULL DEFAULT 'student',
  learning_path_id TEXT,                           -- e.g., 'trilha-iniciante'
  timezone        TEXT DEFAULT 'America/Sao_Paulo',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for email lookups (used by instructor dashboard)
CREATE INDEX idx_profiles_email ON profiles(email);
-- Index for role filtering (instructor queries)
CREATE INDEX idx_profiles_role ON profiles(role);

COMMENT ON TABLE profiles IS 'User profile data. Auto-created via trigger on auth.users insert.';
COMMENT ON COLUMN profiles.learning_path_id IS 'Selected learning trail ID (e.g., trilha-iniciante, trilha-master). NULL if not yet selected.';
COMMENT ON COLUMN profiles.role IS 'User role. Default is student. Instructor assigned manually.';

-- -----------------------------------------------------------------------------
-- 3. progress - Checkpoint completion tracking
-- -----------------------------------------------------------------------------
-- Tracks each checkpoint a user has completed.
-- One row per user per checkpoint (not per module).
-- Module progress is COMPUTED from checkpoint completion (see functions).
-- -----------------------------------------------------------------------------
CREATE TABLE progress (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  checkpoint_id   TEXT NOT NULL,                    -- e.g., 'cp-1.1'
  module_id       TEXT NOT NULL,                    -- e.g., 'mod-1' (denormalized for query perf)
  completed       BOOLEAN NOT NULL DEFAULT TRUE,
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_progress_user_checkpoint UNIQUE (user_id, checkpoint_id)
);

-- Composite index for fetching all checkpoints for a user+module
CREATE INDEX idx_progress_user_module ON progress(user_id, module_id);
-- Index for completed_at (streak calculation)
CREATE INDEX idx_progress_user_completed_at ON progress(user_id, completed_at);
-- Index for aggregation queries (instructor dashboard)
CREATE INDEX idx_progress_checkpoint ON progress(checkpoint_id);
CREATE INDEX idx_progress_module ON progress(module_id);
-- IMP-02: Partial index for completed checkpoints (most queries filter completed=TRUE)
CREATE INDEX idx_progress_user_module_completed ON progress(user_id, module_id) WHERE completed = TRUE;

COMMENT ON TABLE progress IS 'Tracks checkpoint completion per user. One row per checkpoint.';
COMMENT ON COLUMN progress.module_id IS 'Denormalized module ID for query performance. Derived from checkpoint_id prefix.';
COMMENT ON COLUMN progress.completed IS 'TRUE when completed. Set to FALSE if user unchecks checkpoint.';

-- -----------------------------------------------------------------------------
-- 4. notes - Personal annotations
-- -----------------------------------------------------------------------------
-- Students can attach notes to modules, concepts, or exercises.
-- Notes are private by default (RLS: own data only).
-- Content is plain text or basic Markdown.
-- -----------------------------------------------------------------------------
CREATE TABLE notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type     entity_type NOT NULL,             -- 'module', 'concept', 'exercise'
  entity_id       TEXT NOT NULL,                    -- e.g., 'mod-1', 'c1-humildade-estrategica'
  content         TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching notes by user and entity
CREATE INDEX idx_notes_user_entity ON notes(user_id, entity_type, entity_id);
-- IMP-06: Index for listing all notes by user (without entity filter)
CREATE INDEX idx_notes_user ON notes(user_id);
-- Full-text search index on note content (Epic 3)
CREATE INDEX idx_notes_content_trgm ON notes USING gin(content gin_trgm_ops);

COMMENT ON TABLE notes IS 'Personal annotations per concept, exercise, or module.';
COMMENT ON COLUMN notes.entity_type IS 'Type of entity the note is attached to.';
COMMENT ON COLUMN notes.entity_id IS 'ID of the entity (e.g., mod-1, c1-humildade-estrategica, ex-mod1-01).';

-- -----------------------------------------------------------------------------
-- 5. badges - Badge definitions
-- -----------------------------------------------------------------------------
-- Static badge definitions. Seeded via migration, not user-created.
-- All users can READ badge definitions. Only admins can modify.
-- -----------------------------------------------------------------------------
CREATE TABLE badges (
  id              TEXT PRIMARY KEY,                  -- e.g., 'badge-primeiro-passo'
  name            TEXT NOT NULL,
  description     TEXT NOT NULL,
  icon            TEXT NOT NULL,                     -- SVG filename or emoji
  criteria_type   TEXT NOT NULL,                     -- 'checkpoint', 'module', 'trail', 'streak', 'quiz', 'notes', 'all_checkpoints'
  criteria_value  JSONB NOT NULL DEFAULT '{}',       -- Flexible criteria (e.g., {"module_id": "mod-1"} or {"streak_days": 7})
  rarity          badge_rarity NOT NULL DEFAULT 'common',
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE badges IS 'Badge definitions. Seeded by migration, read by all users.';
COMMENT ON COLUMN badges.criteria_type IS 'Type of criteria for earning this badge.';
COMMENT ON COLUMN badges.criteria_value IS 'JSON criteria details. Structure depends on criteria_type.';

-- -----------------------------------------------------------------------------
-- 6. user_badges - Badges earned by users
-- -----------------------------------------------------------------------------
-- Junction table linking users to earned badges.
-- Inserted by application logic or database trigger when criteria are met.
-- Users cannot manually grant themselves badges (INSERT via server only).
-- -----------------------------------------------------------------------------
CREATE TABLE user_badges (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id        TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_user_badges UNIQUE (user_id, badge_id)
);

-- Index for fetching badges by user
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
-- Index for badge popularity analytics
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);

COMMENT ON TABLE user_badges IS 'Badges earned by users. One row per user per badge.';

-- -----------------------------------------------------------------------------
-- 7. quiz_results - Quiz scores per module
-- -----------------------------------------------------------------------------
-- Stores quiz attempt results. Users can retake quizzes.
-- Best score per module is used for progress contribution.
-- -----------------------------------------------------------------------------
CREATE TABLE quiz_results (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id       TEXT NOT NULL,                     -- e.g., 'mod-1'
  score           INT NOT NULL CHECK (score >= 0 AND score <= 100),
  total_questions INT NOT NULL CHECK (total_questions > 0),
  correct_answers INT NOT NULL CHECK (correct_answers >= 0),
  grade           quiz_grade NOT NULL,               -- Computed: >=90 excellent, >=70 good, <70 review

  time_spent_seconds INT,                            -- Time to complete quiz
  answers         JSONB NOT NULL DEFAULT '[]',       -- Array of {question_id, selected_answer, correct}
  attempted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- WARN-04: Ensure correct_answers never exceeds total_questions
  CONSTRAINT chk_answers_within_total CHECK (correct_answers <= total_questions),
  -- WARN-06: Ensure grade matches score range
  CONSTRAINT chk_grade_matches_score CHECK (
    (score >= 90 AND grade = 'excellent') OR
    (score >= 70 AND score < 90 AND grade = 'good') OR
    (score < 70 AND grade = 'review')
  )
);

-- Index for fetching quiz results by user+module
CREATE INDEX idx_quiz_results_user_module ON quiz_results(user_id, module_id);
-- Index for best score lookup
CREATE INDEX idx_quiz_results_score ON quiz_results(user_id, module_id, score DESC);

COMMENT ON TABLE quiz_results IS 'Quiz attempt results. Multiple attempts allowed per user per module.';
COMMENT ON COLUMN quiz_results.grade IS 'Computed grade: excellent (>=90%), good (>=70%), review (<70%).';

-- -----------------------------------------------------------------------------
-- 8. streaks - Daily study streak tracking
-- -----------------------------------------------------------------------------
-- Tracks study streaks. Updated server-side to prevent manipulation.
-- A study day is counted when at least 1 checkpoint is completed.
-- -----------------------------------------------------------------------------
CREATE TABLE streaks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak  INT NOT NULL DEFAULT 0,
  longest_streak  INT NOT NULL DEFAULT 0,
  last_activity_date DATE,                           -- Last date with activity (timezone-aware)
  freeze_available BOOLEAN NOT NULL DEFAULT TRUE,    -- 1 freeze per week
  freeze_used_at  DATE,                              -- When freeze was last used
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- WARN-03: Added for consistency
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_streaks_user UNIQUE (user_id)
);

COMMENT ON TABLE streaks IS 'Study streak tracking per user. Updated server-side.';
COMMENT ON COLUMN streaks.freeze_available IS 'Whether the user has a freeze day available this week.';

-- -----------------------------------------------------------------------------
-- 9. Row Level Security (RLS) Policies
-- -----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- == profiles ==
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (name, avatar, learning_path_id, timezone)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Instructor can view aggregated profile data (count, distribution)
-- This is handled via RPC functions, not direct SELECT policy.

-- == progress ==
-- Users can read their own progress
CREATE POLICY "Users can view own progress"
  ON progress FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress"
  ON progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress (toggle checkpoint)
CREATE POLICY "Users can update own progress"
  ON progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- WARN-02: DELETE policy removed. Use UPDATE to toggle completed=FALSE instead.
-- Deleting progress rows would break streak calculation and badge logic.

-- == notes ==
-- Users can CRUD their own notes
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- == badges ==
-- All authenticated users can read badge definitions
-- CRIT-01: Use auth.uid() IS NOT NULL instead of auth.role() for reliable auth check
CREATE POLICY "Authenticated users can view badges"
  ON badges FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only service role can insert/update/delete badges (admin)
-- No explicit policy = denied by default for non-service-role

-- == user_badges ==
-- Users can view their own earned badges
CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Insert handled by application server (service role) or trigger
-- No user-facing INSERT policy (prevents self-granting badges)

-- == quiz_results ==
-- Users can view their own quiz results
CREATE POLICY "Users can view own quiz results"
  ON quiz_results FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own quiz results
CREATE POLICY "Users can insert own quiz results"
  ON quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- WARN-01: UPDATE policy removed. Quiz results are append-only (new attempt = new INSERT).
-- Allowing UPDATE would let users modify their scores after submission.

-- == streaks ==
-- Users can view their own streak
CREATE POLICY "Users can view own streak"
  ON streaks FOR SELECT
  USING (auth.uid() = user_id);

-- Streak INSERT/UPDATE handled server-side only (prevent manipulation)
-- No user-facing INSERT/UPDATE policies for streaks

-- -----------------------------------------------------------------------------
-- 10. Triggers
-- -----------------------------------------------------------------------------

-- == Auto-create profile on auth.users insert ==
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL)
  );
  -- Also create streak record
  INSERT INTO public.streaks (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user IS 'Auto-creates profile and streak record when a new user signs up.';

-- == Auto-update updated_at timestamp ==
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_progress_updated_at
  BEFORE UPDATE ON progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- 11. Database Functions (RPC)
-- -----------------------------------------------------------------------------

-- == Calculate module progress for a user ==
-- Returns percentage (0-100) based on completed checkpoints for a module.
-- checkpoint_total must be provided by the application (from JSON data).
CREATE OR REPLACE FUNCTION calculate_module_progress(
  p_user_id UUID,
  p_module_id TEXT,
  p_total_checkpoints INT
)
RETURNS INT AS $$
DECLARE
  completed_count INT;
BEGIN
  SELECT COUNT(*)
  INTO completed_count
  FROM progress
  WHERE user_id = p_user_id
    AND module_id = p_module_id
    AND completed = TRUE;

  IF p_total_checkpoints = 0 THEN
    RETURN 0;
  END IF;

  RETURN LEAST(100, ROUND((completed_count::NUMERIC / p_total_checkpoints) * 100));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION calculate_module_progress IS 'Calculates module progress as percentage. Total checkpoints provided by caller (from JSON data).';

-- == Check if next module should be unlocked ==
-- Returns TRUE if user has completed >= 70% of checkpoints for a module.
CREATE OR REPLACE FUNCTION check_unlock_next_module(
  p_user_id UUID,
  p_module_id TEXT,
  p_total_checkpoints INT
)
RETURNS BOOLEAN AS $$
DECLARE
  progress_pct INT;
BEGIN
  progress_pct := calculate_module_progress(p_user_id, p_module_id, p_total_checkpoints);
  RETURN progress_pct >= 70;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_unlock_next_module IS 'Returns TRUE if user completed >= 70% of module checkpoints (unlock threshold).';

-- == Calculate current streak for a user ==
-- Looks at progress records and counts consecutive days with activity.
CREATE OR REPLACE FUNCTION calculate_streak(p_user_id UUID)
RETURNS TABLE(current_streak INT, longest_streak INT) AS $$
DECLARE
  v_current INT := 0;
  v_longest INT := 0;
  v_prev_date DATE := NULL;
  v_today DATE := CURRENT_DATE;
  rec RECORD;
BEGIN
  -- CRIT-02: Validate caller can only calculate their own streak
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: can only calculate own streak';
  END IF;

  -- Get distinct activity dates, ordered descending
  FOR rec IN
    SELECT DISTINCT DATE(completed_at AT TIME ZONE COALESCE(
      (SELECT timezone FROM profiles WHERE id = p_user_id), 'America/Sao_Paulo'
    )) AS activity_date
    FROM progress
    WHERE user_id = p_user_id AND completed = TRUE
    ORDER BY activity_date DESC
  LOOP
    IF v_prev_date IS NULL THEN
      -- First iteration: check if most recent activity is today or yesterday
      IF rec.activity_date >= v_today - INTERVAL '1 day' THEN
        v_current := 1;
      ELSE
        -- Streak is broken (last activity was more than 1 day ago)
        v_current := 0;
        EXIT;
      END IF;
    ELSIF v_prev_date - rec.activity_date = 1 THEN
      -- Consecutive day
      v_current := v_current + 1;
    ELSE
      -- Gap found, streak ends
      EXIT;
    END IF;
    v_prev_date := rec.activity_date;
  END LOOP;

  -- Update longest streak if current exceeds it
  SELECT s.longest_streak INTO v_longest FROM streaks s WHERE s.user_id = p_user_id;
  IF v_current > COALESCE(v_longest, 0) THEN
    v_longest := v_current;
  END IF;

  -- Update streaks table
  UPDATE streaks
  SET current_streak = v_current,
      longest_streak = v_longest,
      last_activity_date = (
        SELECT MAX(DATE(completed_at)) FROM progress WHERE user_id = p_user_id AND completed = TRUE
      )
  WHERE streaks.user_id = p_user_id;

  RETURN QUERY SELECT v_current, v_longest;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION calculate_streak IS 'Calculates current and longest streak for a user based on progress activity dates.';

-- == Instructor: Get aggregated metrics ==
-- Returns aggregated data without exposing individual student info.
CREATE OR REPLACE FUNCTION get_instructor_metrics()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Only instructors can call this
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'instructor'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: instructor role required';
  END IF;

  SELECT jsonb_build_object(
    'total_students', (SELECT COUNT(*) FROM profiles WHERE role = 'student'),
    'active_students_7d', (
      SELECT COUNT(DISTINCT user_id) FROM progress
      WHERE completed_at >= NOW() - INTERVAL '7 days'
    ),
    'completion_by_module', (
      SELECT jsonb_agg(jsonb_build_object(
        'module_id', module_id,
        'total_completions', cnt
      ))
      FROM (
        SELECT module_id, COUNT(DISTINCT user_id) AS cnt
        FROM progress
        WHERE completed = TRUE
        GROUP BY module_id
        ORDER BY module_id
      ) sub
    ),
    'most_stuck_checkpoint', (
      SELECT checkpoint_id
      FROM progress
      WHERE completed = TRUE
      GROUP BY checkpoint_id
      ORDER BY COUNT(DISTINCT user_id) ASC
      LIMIT 1
    ),
    'trail_distribution', (
      SELECT jsonb_agg(jsonb_build_object(
        'trail_id', learning_path_id,
        'count', cnt
      ))
      FROM (
        SELECT learning_path_id, COUNT(*) AS cnt
        FROM profiles
        WHERE learning_path_id IS NOT NULL AND role = 'student'
        GROUP BY learning_path_id
      ) sub
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_instructor_metrics IS 'Returns aggregated student metrics for instructor dashboard. No individual data exposed.';

-- == Get best quiz score for a user per module ==
CREATE OR REPLACE FUNCTION get_best_quiz_scores(p_user_id UUID)
RETURNS TABLE(module_id TEXT, best_score INT, grade quiz_grade, attempts INT) AS $$
BEGIN
  -- IMP-01: Validate caller can only query their own scores
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: can only query own quiz scores';
  END IF;

  RETURN QUERY
  SELECT
    qr.module_id,
    MAX(qr.score) AS best_score,
    (SELECT qr2.grade FROM quiz_results qr2
     WHERE qr2.user_id = p_user_id AND qr2.module_id = qr.module_id
     ORDER BY qr2.score DESC LIMIT 1) AS grade,
    COUNT(*)::INT AS attempts
  FROM quiz_results qr
  WHERE qr.user_id = p_user_id
  GROUP BY qr.module_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_best_quiz_scores IS 'Returns best quiz score and attempt count per module for a user.';

-- -----------------------------------------------------------------------------
-- 12. Badge Seed Data
-- -----------------------------------------------------------------------------
-- 15 initial badges as defined in PRD Story 4.1

INSERT INTO badges (id, name, description, icon, criteria_type, criteria_value, rarity, sort_order) VALUES
  ('badge-primeiro-passo',     'Primeiro Passo',          'Completou o checkpoint 1.1',                    'footprints',     'checkpoint',      '{"checkpoint_id": "cp-1.1"}',                    'common',    1),
  ('badge-abertura-criativa',  'Abertura Criativa',       'Completou o Modulo 1: Conexao Inicial',         'sparkles',        'module',          '{"module_id": "mod-1"}',                          'common',    2),
  ('badge-vendedor-sonhos',    'Vendedor de Sonhos',      'Completou o Modulo 2: Promocao do Conteudo',    'megaphone',       'module',          '{"module_id": "mod-2"}',                          'common',    3),
  ('badge-mestre-estrutura',   'Mestre da Estrutura',     'Completou o Modulo 3: Entrega Estruturada',     'layout-list',     'module',          '{"module_id": "mod-3"}',                          'common',    4),
  ('badge-contador-historias', 'Contador de Historias',    'Completou o Modulo 4: Historia de Essencia',    'book-heart',      'module',          '{"module_id": "mod-4"}',                          'rare',      5),
  ('badge-aplauso-pe',         'Aplauso de Pe',           'Completou o Modulo 5: Finalizacao Emocional',   'trophy',          'module',          '{"module_id": "mod-5"}',                          'rare',      6),
  ('badge-expresso',           'Expresso',                'Completou a trilha Express em menos de 2 semanas','zap',           'trail',           '{"trail_id": "trilha-express"}',                  'rare',      7),
  ('badge-dedicado',           'Dedicado',                '7 dias consecutivos de estudo',                  'flame',           'streak',          '{"streak_days": 7}',                              'common',    8),
  ('badge-incansavel',         'Incansavel',              '30 dias consecutivos de estudo',                 'flame',           'streak',          '{"streak_days": 30}',                             'epic',      9),
  ('badge-nota-10',            'Nota 10',                 'Score >= 90% em quiz de qualquer modulo',        'award',           'quiz',            '{"min_score": 90}',                               'rare',     10),
  ('badge-explorador',         'Explorador',              'Acessou todos os 15 conceitos',                  'compass',         'all_concepts',    '{"total_concepts": 15}',                          'common',   11),
  ('badge-anotador',           'Anotador',                'Criou 10 notas pessoais',                        'pencil-line',     'notes',           '{"min_notes": 10}',                               'common',   12),
  ('badge-projeto-final',      'Projeto Final',           'Completou o projeto final da trilha',            'graduation-cap',  'trail',           '{"is_final_project": true}',                      'epic',     13),
  ('badge-metodo-completo',    'Metodo Completo',         'Completou a trilha Master inteira',              'crown',           'trail',           '{"trail_id": "trilha-master"}',                   'legendary',14),
  ('badge-perfeccionista',     'Perfeccionista',          '100% dos checkpoints completados',               'check-check',     'all_checkpoints', '{"completion_percentage": 100}',                  'legendary',15);

-- -----------------------------------------------------------------------------
-- 13. Storage Policies (for avatar uploads)
-- -----------------------------------------------------------------------------
-- Create bucket for user avatars
-- Run via Supabase dashboard or CLI: supabase storage create avatars
-- Policies:
--   - Users can upload their own avatar (path: {user_id}/avatar.{ext})
--   - Anyone can view avatars (public read)
--   - File size limit: 2MB
--   - Allowed MIME types: image/jpeg, image/png, image/webp

-- NOTE: Storage policies are configured via Supabase dashboard or CLI, not SQL.
-- Included here for documentation purposes.

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
