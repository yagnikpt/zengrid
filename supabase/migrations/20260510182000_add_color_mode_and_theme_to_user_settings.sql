-- Migration: split color mode and theme in user_settings
-- - Rename legacy `theme` (light/dark/system) to `color_mode`
-- - Add new `theme` for accent palette selection

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_settings'
      AND column_name = 'theme'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_settings'
      AND column_name = 'color_mode'
  ) THEN
    ALTER TABLE public.user_settings RENAME COLUMN theme TO color_mode;
  END IF;
END $$;

ALTER TABLE public.user_settings
  DROP CONSTRAINT IF EXISTS user_settings_color_mode_check,
  DROP CONSTRAINT IF EXISTS user_settings_theme_check;

ALTER TABLE public.user_settings
  ALTER COLUMN color_mode SET DEFAULT 'system',
  ALTER COLUMN color_mode SET NOT NULL;

ALTER TABLE public.user_settings
  ADD CONSTRAINT user_settings_color_mode_check
    CHECK (color_mode IN ('light', 'dark', 'system'));

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS theme text;

UPDATE public.user_settings
SET theme = 'classic'
WHERE theme IS NULL;

ALTER TABLE public.user_settings
  ALTER COLUMN theme SET DEFAULT 'classic',
  ALTER COLUMN theme SET NOT NULL;
