-- Migration: add open_in preference to user_settings
-- Adds a column to persist whether bookmarks open in a new tab or the current tab.

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS open_in text NOT NULL DEFAULT 'new-tab'
    CHECK (open_in = ANY (ARRAY['new-tab'::text, 'current-tab'::text]));
