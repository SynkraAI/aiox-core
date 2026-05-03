-- Story 5.3: coach persona preference per user
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS coach_persona VARCHAR(10) NOT NULL DEFAULT 'rafael';

-- Story 5.4: daily chat usage tracking for rate limiting
CREATE TABLE IF NOT EXISTS chat_usage (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date        DATE    NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_chat_usage_user_date ON chat_usage (user_id, date);
