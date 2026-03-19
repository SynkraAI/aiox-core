-- =============================================================================
-- Migration 001: Initial Schema
-- =============================================================================
-- Metodo Aplauda de Pe - Supabase PostgreSQL
-- Version: 1.1 (reviewed by Dara, Data Engineer)
-- Date: 2026-02-13
-- Idempotent: Yes (safe to re-run)
-- Rollback: See rollback section at end of file
--
-- Dependencies: Supabase project with auth.users table
-- Estimated execution time: < 1 second
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 0. Extensions (idempotent via IF NOT EXISTS)
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- -----------------------------------------------------------------------------
-- 1. Custom Types (idempotent via DO block)
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'instructor');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE badge_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE entity_type AS ENUM ('module', 'concept', 'exercise');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE quiz_grade AS ENUM ('excellent', 'good', 'review');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- 2. Tables (idempotent via IF NOT EXISTS)
-- -----------------------------------------------------------------------------

-- == profiles ==
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  name            TEXT,
  avatar_url      TEXT,
  role            user_role NOT NULL DEFAULT 'student',
  learning_path_id TEXT,
  timezone        TEXT DEFAULT 'America/Sao_Paulo',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'User profile data. Auto-created via trigger on auth.users insert.';
COMMENT ON COLUMN profiles.learning_path_id IS 'Selected learning trail ID (e.g., trilha-iniciante, trilha-master). NULL if not yet selected.';
COMMENT ON COLUMN profiles.role IS 'User role. Default is student. Instructor assigned manually via Supabase dashboard.';

-- == progress ==
CREATE TABLE IF NOT EXISTS progress (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  checkpoint_id   TEXT NOT NULL,
  module_id       TEXT NOT NULL,
  completed       BOOLEAN NOT NULL DEFAULT TRUE,
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_progress_user_checkpoint UNIQUE (user_id, checkpoint_id)
);

COMMENT ON TABLE progress IS 'Tracks checkpoint completion per user. One row per checkpoint.';
COMMENT ON COLUMN progress.module_id IS 'Denormalized module ID for query performance. Derived from checkpoint_id prefix.';
COMMENT ON COLUMN progress.completed IS 'TRUE when completed. Set to FALSE if user unchecks (toggle via UPDATE, not DELETE).';

-- == notes ==
CREATE TABLE IF NOT EXISTS notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type     entity_type NOT NULL,
  entity_id       TEXT NOT NULL,
  content         TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notes IS 'Personal annotations per concept, exercise, or module.';
COMMENT ON COLUMN notes.entity_type IS 'Type of entity the note is attached to.';
COMMENT ON COLUMN notes.entity_id IS 'ID of the entity (e.g., mod-1, c1-humildade-estrategica, ex-mod1-01).';

-- == badges ==
CREATE TABLE IF NOT EXISTS badges (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  description     TEXT NOT NULL,
  icon            TEXT NOT NULL,
  criteria_type   TEXT NOT NULL,
  criteria_value  JSONB NOT NULL DEFAULT '{}',
  rarity          badge_rarity NOT NULL DEFAULT 'common',
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE badges IS 'Badge definitions. Seeded by migration, read by all authenticated users.';
COMMENT ON COLUMN badges.criteria_type IS 'Type of criteria for earning this badge (checkpoint, module, trail, streak, quiz, notes, all_checkpoints, all_concepts).';
COMMENT ON COLUMN badges.criteria_value IS 'JSON criteria details. Structure depends on criteria_type.';

-- == user_badges ==
CREATE TABLE IF NOT EXISTS user_badges (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id        TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_user_badges UNIQUE (user_id, badge_id)
);

COMMENT ON TABLE user_badges IS 'Badges earned by users. One row per user per badge. INSERT via server/trigger only.';

-- == quiz_results ==
CREATE TABLE IF NOT EXISTS quiz_results (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id       TEXT NOT NULL,
  score           INT NOT NULL CHECK (score >= 0 AND score <= 100),
  total_questions INT NOT NULL CHECK (total_questions > 0),
  correct_answers INT NOT NULL CHECK (correct_answers >= 0),
  grade           quiz_grade NOT NULL,
  time_spent_seconds INT,
  answers         JSONB NOT NULL DEFAULT '[]',
  attempted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Data integrity constraints
  CONSTRAINT chk_answers_within_total CHECK (correct_answers <= total_questions),
  CONSTRAINT chk_grade_matches_score CHECK (
    (score >= 90 AND grade = 'excellent') OR
    (score >= 70 AND score < 90 AND grade = 'good') OR
    (score < 70 AND grade = 'review')
  )
);

COMMENT ON TABLE quiz_results IS 'Quiz attempt results. Append-only (no UPDATE). Multiple attempts per user per module.';
COMMENT ON COLUMN quiz_results.grade IS 'Computed grade: excellent (>=90%), good (>=70%), review (<70%). Enforced by CHECK constraint.';

-- == streaks ==
CREATE TABLE IF NOT EXISTS streaks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak  INT NOT NULL DEFAULT 0,
  longest_streak  INT NOT NULL DEFAULT 0,
  last_activity_date DATE,
  freeze_available BOOLEAN NOT NULL DEFAULT TRUE,
  freeze_used_at  DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_streaks_user UNIQUE (user_id)
);

COMMENT ON TABLE streaks IS 'Study streak tracking per user. Updated server-side only to prevent manipulation.';
COMMENT ON COLUMN streaks.freeze_available IS 'Whether the user has a freeze day available this week. Reset weekly.';

-- -----------------------------------------------------------------------------
-- 3. Indexes (idempotent via IF NOT EXISTS)
-- -----------------------------------------------------------------------------

-- profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- progress indexes
CREATE INDEX IF NOT EXISTS idx_progress_user_module ON progress(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_completed_at ON progress(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_progress_checkpoint ON progress(checkpoint_id);
CREATE INDEX IF NOT EXISTS idx_progress_module ON progress(module_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_module_completed ON progress(user_id, module_id) WHERE completed = TRUE;

-- notes indexes
CREATE INDEX IF NOT EXISTS idx_notes_user_entity ON notes(user_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_content_trgm ON notes USING gin(content gin_trgm_ops);

-- user_badges indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);

-- quiz_results indexes
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_module ON quiz_results(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_score ON quiz_results(user_id, module_id, score DESC);

-- -----------------------------------------------------------------------------
-- 4. Row Level Security
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
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
  CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Users can update their own profile
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- == progress ==
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own progress" ON progress;
  CREATE POLICY "Users can view own progress"
    ON progress FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own progress" ON progress;
  CREATE POLICY "Users can insert own progress"
    ON progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own progress" ON progress;
  CREATE POLICY "Users can update own progress"
    ON progress FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- NOTE: No DELETE policy on progress. Use UPDATE completed=FALSE to toggle.

-- == notes ==
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own notes" ON notes;
  CREATE POLICY "Users can view own notes"
    ON notes FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
  CREATE POLICY "Users can insert own notes"
    ON notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own notes" ON notes;
  CREATE POLICY "Users can update own notes"
    ON notes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
  CREATE POLICY "Users can delete own notes"
    ON notes FOR DELETE
    USING (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- == badges ==
-- All authenticated users can read badge definitions
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can view badges" ON badges;
  DROP POLICY IF EXISTS "Anyone can view badges" ON badges;
  CREATE POLICY "Authenticated users can view badges"
    ON badges FOR SELECT
    USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- == user_badges ==
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
  CREATE POLICY "Users can view own badges"
    ON user_badges FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- NOTE: No INSERT policy for user_badges. Badges granted by server/trigger only.

-- == quiz_results ==
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own quiz results" ON quiz_results;
  CREATE POLICY "Users can view own quiz results"
    ON quiz_results FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own quiz results" ON quiz_results;
  CREATE POLICY "Users can insert own quiz results"
    ON quiz_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- NOTE: No UPDATE policy for quiz_results. Results are append-only.

-- == streaks ==
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own streak" ON streaks;
  CREATE POLICY "Users can view own streak"
    ON streaks FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- NOTE: No INSERT/UPDATE policies for streaks. Updated server-side only.

-- -----------------------------------------------------------------------------
-- 5. Functions
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
  -- Also create streak record for the new user
  INSERT INTO public.streaks (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_new_user IS 'Auto-creates profile and streak record when a new user signs up via Supabase Auth.';

-- == Auto-update updated_at timestamp ==
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at IS 'Generic trigger function to update the updated_at column on any table.';

-- == Calculate module progress for a user ==
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

COMMENT ON FUNCTION calculate_module_progress IS 'Calculates module progress as percentage (0-100). Total checkpoints provided by caller from JSON data.';

-- == Check if next module should be unlocked ==
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

COMMENT ON FUNCTION check_unlock_next_module IS 'Returns TRUE if user completed >= 70% of module checkpoints (unlock threshold per PRD).';

-- == Calculate current streak for a user ==
CREATE OR REPLACE FUNCTION calculate_streak(p_user_id UUID)
RETURNS TABLE(current_streak INT, longest_streak INT) AS $$
DECLARE
  v_current INT := 0;
  v_longest INT := 0;
  v_prev_date DATE := NULL;
  v_today DATE := CURRENT_DATE;
  rec RECORD;
BEGIN
  -- Security: validate caller can only calculate their own streak
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

  -- Update streaks table (server-side, bypasses RLS via SECURITY DEFINER)
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

COMMENT ON FUNCTION calculate_streak IS 'Calculates and persists current/longest streak for the calling user. Auth-validated.';

-- == Instructor: Get aggregated metrics ==
CREATE OR REPLACE FUNCTION get_instructor_metrics()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Authorization: only instructors can call this
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
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'module_id', module_id,
        'total_completions', cnt
      )), '[]'::jsonb)
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
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'trail_id', learning_path_id,
        'count', cnt
      )), '[]'::jsonb)
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

COMMENT ON FUNCTION get_instructor_metrics IS 'Returns aggregated student metrics for instructor dashboard. No individual data exposed. Instructor-only.';

-- == Get best quiz score for a user per module ==
CREATE OR REPLACE FUNCTION get_best_quiz_scores(p_user_id UUID)
RETURNS TABLE(module_id TEXT, best_score INT, grade quiz_grade, attempts INT) AS $$
BEGIN
  -- Security: validate caller can only query their own scores
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

COMMENT ON FUNCTION get_best_quiz_scores IS 'Returns best quiz score and attempt count per module for the calling user. Auth-validated.';

-- -----------------------------------------------------------------------------
-- 6. Triggers (idempotent via DROP IF EXISTS + CREATE)
-- -----------------------------------------------------------------------------

-- == Auto-create profile on auth.users insert ==
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- == Auto-update updated_at ==
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_progress_updated_at ON progress;
CREATE TRIGGER trg_progress_updated_at
  BEFORE UPDATE ON progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_notes_updated_at ON notes;
CREATE TRIGGER trg_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_streaks_updated_at ON streaks;
CREATE TRIGGER trg_streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- 7. Seed Data (idempotent via ON CONFLICT)
-- -----------------------------------------------------------------------------

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
  ('badge-perfeccionista',     'Perfeccionista',          '100% dos checkpoints completados',               'check-check',     'all_checkpoints', '{"completion_percentage": 100}',                  'legendary',15)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  criteria_type = EXCLUDED.criteria_type,
  criteria_value = EXCLUDED.criteria_value,
  rarity = EXCLUDED.rarity,
  sort_order = EXCLUDED.sort_order;

-- -----------------------------------------------------------------------------
-- 8. Storage Notes (documentation only)
-- -----------------------------------------------------------------------------
-- Create bucket for user avatars via Supabase dashboard or CLI:
--   supabase storage create avatars --public
-- Policies (configured via dashboard):
--   - Users can upload their own avatar (path: {user_id}/avatar.{ext})
--   - Public read access for all avatars
--   - File size limit: 2MB
--   - Allowed MIME types: image/jpeg, image/png, image/webp

COMMIT;

-- =============================================================================
-- ROLLBACK SCRIPT (run manually if needed)
-- =============================================================================
-- To completely remove this schema, run the following in order:
--
-- BEGIN;
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
-- DROP TRIGGER IF EXISTS trg_progress_updated_at ON progress;
-- DROP TRIGGER IF EXISTS trg_notes_updated_at ON notes;
-- DROP TRIGGER IF EXISTS trg_streaks_updated_at ON streaks;
-- DROP FUNCTION IF EXISTS get_best_quiz_scores;
-- DROP FUNCTION IF EXISTS get_instructor_metrics;
-- DROP FUNCTION IF EXISTS calculate_streak;
-- DROP FUNCTION IF EXISTS check_unlock_next_module;
-- DROP FUNCTION IF EXISTS calculate_module_progress;
-- DROP FUNCTION IF EXISTS update_updated_at;
-- DROP FUNCTION IF EXISTS handle_new_user;
-- DROP TABLE IF EXISTS streaks CASCADE;
-- DROP TABLE IF EXISTS quiz_results CASCADE;
-- DROP TABLE IF EXISTS user_badges CASCADE;
-- DROP TABLE IF EXISTS badges CASCADE;
-- DROP TABLE IF EXISTS notes CASCADE;
-- DROP TABLE IF EXISTS progress CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DROP TYPE IF EXISTS quiz_grade;
-- DROP TYPE IF EXISTS entity_type;
-- DROP TYPE IF EXISTS badge_rarity;
-- DROP TYPE IF EXISTS user_role;
-- COMMIT;
-- =============================================================================
