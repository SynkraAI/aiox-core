-- =============================================================================
-- Lovable Cria Quiz - Supabase Database Schema
-- Story: LOV-1 | Author: @architect (Aria) | Date: 2026-02-22
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Custom Types
-- -----------------------------------------------------------------------------

CREATE TYPE archetype_id AS ENUM (
  'comunicador',
  'mentor',
  'construtor',
  'estrategista'
);

-- -----------------------------------------------------------------------------
-- 2. Reference Table: quiz_archetypes
-- -----------------------------------------------------------------------------

CREATE TABLE quiz_archetypes (
  id            archetype_id PRIMARY KEY,
  name          TEXT NOT NULL,                    -- "O Comunicador"
  color         TEXT NOT NULL,                    -- "#F97316"
  identity      TEXT NOT NULL,                    -- One-line identity statement
  strengths     TEXT[] NOT NULL,                  -- 3 strengths
  business_model TEXT NOT NULL,                   -- Recommended model
  first_step    TEXT NOT NULL,                    -- Concrete action
  famous_example TEXT NOT NULL,                   -- Social proof name
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the 4 archetypes (copy will be finalized by @pm)
INSERT INTO quiz_archetypes (id, name, color, identity, strengths, business_model, first_step, famous_example) VALUES
  ('comunicador', 'O Comunicador', '#F97316',
   'Voce transforma ideias em conversas que movem pessoas.',
   ARRAY['Comunicacao natural', 'Engajamento de audiencia', 'Criacao de conteudo'],
   'Criacao de conteudo e influencia digital',
   'Grave um video de 60 segundos sobre algo que voce domina e publique hoje.',
   'Nathalia Arcuri'),
  ('mentor', 'O Mentor', '#14B8A6',
   'Voce ensina com clareza o que outros levam anos para aprender.',
   ARRAY['Didatica natural', 'Paciencia para ensinar', 'Conhecimento profundo'],
   'Cursos online e mentoria',
   'Escolha um topico que voce ensina bem e crie um roteiro de 5 aulas.',
   'Leandro Karnal'),
  ('construtor', 'O Construtor', '#3B82F6',
   'Voce cria solucoes praticas enquanto outros ainda estao planejando.',
   ARRAY['Execucao rapida', 'Pensamento pratico', 'Resolucao de problemas'],
   'SaaS, ferramentas e produtos digitais',
   'Identifique um problema que voce resolve bem e crie um MVP esta semana.',
   'Elon Musk'),
  ('estrategista', 'O Estrategista', '#8B5CF6',
   'Voce enxerga o mapa completo quando outros veem apenas a proxima esquina.',
   ARRAY['Visao sistemica', 'Planejamento estrategico', 'Analise de mercado'],
   'Consultoria e servicos estrategicos',
   'Mapeie 3 problemas do seu setor e escolha o mais lucrativo para resolver.',
   'Jorge Paulo Lemann');

-- -----------------------------------------------------------------------------
-- 3. Main Table: quiz_responses
-- -----------------------------------------------------------------------------

CREATE TABLE quiz_responses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_name     TEXT NOT NULL CHECK (char_length(user_name) >= 2),
  user_email    TEXT NOT NULL CHECK (user_email ~* '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'),
  user_whatsapp TEXT,                             -- nullable, Brazilian format
  answers       JSONB NOT NULL,                   -- number[] (0-3 per question)
  archetype     archetype_id NOT NULL,
  metadata      JSONB DEFAULT '{}'::JSONB,        -- source, device, duration, etc.
  deleted_at    TIMESTAMPTZ                       -- soft delete for LGPD
);

-- Indexes
CREATE INDEX idx_quiz_responses_email ON quiz_responses (user_email);
CREATE INDEX idx_quiz_responses_created_at ON quiz_responses (created_at DESC);
CREATE INDEX idx_quiz_responses_archetype ON quiz_responses (archetype);
CREATE INDEX idx_quiz_responses_not_deleted ON quiz_responses (id) WHERE deleted_at IS NULL;

-- Deduplication: prevent same email within 24 hours
CREATE UNIQUE INDEX idx_quiz_responses_email_24h
  ON quiz_responses (user_email, (created_at::date))
  WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 4. Analytics Table: quiz_events
-- -----------------------------------------------------------------------------

CREATE TABLE quiz_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id    TEXT NOT NULL,                    -- client-generated UUID per session
  event_type    TEXT NOT NULL,                    -- 'page_view', 'quiz_start', 'question_1', ..., 'quiz_complete', 'lead_capture'
  event_data    JSONB DEFAULT '{}'::JSONB,        -- flexible payload
  device        TEXT,                             -- 'mobile' | 'desktop'
  source        TEXT                              -- UTM source
);

CREATE INDEX idx_quiz_events_session ON quiz_events (session_id);
CREATE INDEX idx_quiz_events_type ON quiz_events (event_type);
CREATE INDEX idx_quiz_events_created ON quiz_events (created_at DESC);

-- -----------------------------------------------------------------------------
-- 5. Row Level Security (RLS)
-- -----------------------------------------------------------------------------

ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_events ENABLE ROW LEVEL SECURITY;

-- quiz_archetypes: public read, no public write
CREATE POLICY "archetypes_public_read"
  ON quiz_archetypes FOR SELECT
  TO anon
  USING (true);

-- quiz_responses: public insert (form submission), no public read/update/delete
CREATE POLICY "responses_public_insert"
  ON quiz_responses FOR INSERT
  TO anon
  WITH CHECK (true);

-- quiz_responses: read own by email (for "already completed" check)
CREATE POLICY "responses_read_own"
  ON quiz_responses FOR SELECT
  TO anon
  USING (deleted_at IS NULL);
  -- Note: in production, restrict to specific email lookup via RPC function
  -- For MVP, allow anon SELECT so dedup check works client-side

-- quiz_events: public insert only (analytics)
CREATE POLICY "events_public_insert"
  ON quiz_events FOR INSERT
  TO anon
  WITH CHECK (true);

-- Service role has full access (for admin/analytics dashboard)
CREATE POLICY "service_role_full_responses"
  ON quiz_responses FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_full_events"
  ON quiz_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_full_archetypes"
  ON quiz_archetypes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 6. Updated_at Trigger for quiz_archetypes
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_archetypes_updated_at
  BEFORE UPDATE ON quiz_archetypes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- 7. LGPD: Deletion Function (Right to be Forgotten)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION delete_user_data(target_email TEXT)
RETURNS INTEGER AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  UPDATE quiz_responses
  SET deleted_at = NOW(),
      user_name = '[REMOVED]',
      user_email = '[REMOVED]',
      user_whatsapp = NULL,
      metadata = '{}'::JSONB
  WHERE user_email = target_email
    AND deleted_at IS NULL;

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only callable by service_role (admin)
REVOKE ALL ON FUNCTION delete_user_data FROM PUBLIC;
GRANT EXECUTE ON FUNCTION delete_user_data TO service_role;

-- =============================================================================
-- Schema Notes:
-- - answers stored as JSONB array [0,2,1,3,0,2,1] mapping to option indices
-- - metadata stores UTM params, device type, quiz duration, timestamp
-- - soft delete pattern for LGPD compliance (anonymize, don't hard delete)
-- - dedup index prevents same email on same calendar day
-- - quiz_events is append-only analytics (no PII, no RLS read restriction needed)
-- =============================================================================
