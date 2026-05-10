-- Migration: remove theme check constraint
-- Theme values are enforced in app code to avoid DB migrations for every new theme.

ALTER TABLE public.user_settings
  DROP CONSTRAINT IF EXISTS user_settings_theme_check;
