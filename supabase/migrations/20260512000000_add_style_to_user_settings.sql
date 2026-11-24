-- Migration: add style preference to user_settings
-- Persists layout style preference (classic, cards, paper, terminal).

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS style text NOT NULL DEFAULT 'classic';
