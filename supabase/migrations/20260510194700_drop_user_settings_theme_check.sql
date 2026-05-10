-- Migration: drop theme constraint on user_settings
-- Theme values should remain flexible and be validated by the application.

ALTER TABLE public.user_settings
  DROP CONSTRAINT IF EXISTS user_settings_theme_check;
