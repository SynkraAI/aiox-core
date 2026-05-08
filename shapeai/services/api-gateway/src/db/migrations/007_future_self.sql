-- Migration 007: future_self_url column for AI evolution projections
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS future_self_url TEXT;
